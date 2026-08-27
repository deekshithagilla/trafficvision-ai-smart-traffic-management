import joblib
import numpy as np

from app.models.prediction_history import PredictionHistory
from app.services.traffic_alert_service import generate_alert_for_prediction
from app.services.ai_recommendation_service import build_recommendation
from app.utils.model_loader import ensure_model_files


# --------------------------------------------------------------------------
# Load ML model + encoders
#
# Local development:
#   Uses backend/ml/*.pkl files if they already exist.
#
# Production:
#   If those files are missing, ensure_model_files() downloads them from
#   the configured private Hugging Face model repository.
# --------------------------------------------------------------------------

model_files = ensure_model_files()

model = joblib.load(
    model_files["traffic_model.pkl"]
)

holiday_encoder = joblib.load(
    model_files["holiday_encoder.pkl"]
)

weather_encoder = joblib.load(
    model_files["weather_encoder.pkl"]
)

description_encoder = joblib.load(
    model_files["weather_description_encoder.pkl"]
)


# --------------------------------------------------------------------------
# Travel stats (average_speed / travel_time / delay)
#
# PredictionHistory has always had these three columns, but nothing ever
# populated them, so the dashboard's average_speed silently reported 0.
#
# Rather than inventing a new formula, this mirrors the calculation that
# already exists and ships in frontend/src/pages/Prediction.jsx (used
# there to display "Average Speed", travel time, and delay to the user
# for the exact same prediction) - same three congestion-tier speed
# values (60/40/25 km/h), same travel-time formula, same delay
# definition (minutes lost vs. the 60 km/h free-flow baseline). Keeping
# this here means the persisted PredictionHistory row matches what the
# user was already shown, instead of a second, independently-invented
# calculation drifting from it over time.
#
# predicted_traffic (a vehicle-count/volume figure) is never used as a
# stand-in for speed here - speed is derived only from the congestion
# tier (Low/Medium/High), which is itself derived from predicted_traffic
# by the existing classification a few lines below, exactly as the
# frontend does.
# --------------------------------------------------------------------------

CONGESTION_AVERAGE_SPEED_KMH = {
    "Low": 60.0,
    "Medium": 40.0,
    "High": 25.0,
}

# Free-flow baseline used for the delay calculation - matches the
# frontend's `idealTime`, which uses this same 60 km/h value (the
# Low-congestion speed above). "delay" means minutes lost compared to
# covering this distance at Low-congestion speed.
IDEAL_SPEED_KMH = 60.0


def _travel_stats(congestion: str, distance_km):
    """
    Returns:
        (
            average_speed_kmh,
            travel_time_minutes,
            delay_minutes
        )

    Uses the same congestion-tier speed assumptions already used by
    frontend/src/pages/Prediction.jsx.
    """

    average_speed = CONGESTION_AVERAGE_SPEED_KMH.get(
        congestion,
        IDEAL_SPEED_KMH
    )

    distance_km = distance_km or 0.0

    travel_time = (
        distance_km / average_speed
    ) * 60

    ideal_time = (
        distance_km / IDEAL_SPEED_KMH
    ) * 60

    delay = travel_time - ideal_time

    return (
        round(average_speed, 1),
        round(travel_time, 1),
        round(delay, 1),
    )


def predict_traffic(data, db, current_user):

    print("Supported Holidays:")
    print(holiday_encoder.classes_)

    holiday = holiday_encoder.transform(
        [data.holiday]
    )[0]

    weather = weather_encoder.transform(
        [data.weather_main]
    )[0]

    print("Supported Weather Descriptions:")
    print(description_encoder.classes_)

    description = description_encoder.transform(
        [data.weather_description]
    )[0]

    # ------------------------------------------------------------------
    # Prepare ML feature vector
    #
    # IMPORTANT:
    # This feature order must remain exactly the same as the order used
    # while training traffic_model.pkl.
    # ------------------------------------------------------------------

    features = np.array([[
        holiday,
        data.temp,
        data.rain_1h,
        data.snow_1h,
        data.clouds_all,
        weather,
        description,
        data.hour,
        data.day,
        data.month,
        data.weekday
    ]])

    # ------------------------------------------------------------------
    # Traffic prediction
    # ------------------------------------------------------------------

    prediction = model.predict(features)

    predicted_value = int(
        prediction[0]
    )

    # ------------------------------------------------------------------
    # Confidence proxy
    #
    # RandomForestRegressor does not expose classification probabilities.
    # We therefore use the spread of predictions across the individual
    # trees as an uncertainty proxy:
    #
    # smaller spread = higher confidence
    # larger spread  = lower confidence
    # ------------------------------------------------------------------

    tree_predictions = np.array([
        tree.predict(features)[0]
        for tree in model.estimators_
    ])

    mean_tree_pred = float(
        tree_predictions.mean()
    )

    std_tree_pred = float(
        tree_predictions.std()
    )

    relative_dispersion = (
        std_tree_pred
        / max(mean_tree_pred, 1.0)
    )

    confidence = round(
        max(
            50.0,
            min(
                99.0,
                100
                - relative_dispersion * 100
            )
        ),
        1
    )

    # ------------------------------------------------------------------
    # Congestion classification
    # ------------------------------------------------------------------

    if predicted_value < 2500:

        congestion = "Low"

    elif predicted_value < 4500:

        congestion = "Medium"

    else:

        congestion = "High"

    route = "Best Route"

    # ------------------------------------------------------------------
    # Travel statistics
    # ------------------------------------------------------------------

    average_speed, travel_time, delay = _travel_stats(
        congestion,
        data.distance
    )

    # ------------------------------------------------------------------
    # Save prediction history
    # ------------------------------------------------------------------

    history = PredictionHistory(

        user_id=current_user.id,

        holiday=data.holiday,

        temp=data.temp,

        rain_1h=data.rain_1h,

        snow_1h=data.snow_1h,

        clouds_all=data.clouds_all,

        weather_main=data.weather_main,

        weather_description=data.weather_description,

        hour=data.hour,

        day=data.day,

        month=data.month,

        weekday=data.weekday,

        distance=data.distance,

        source=data.source,

        destination=data.destination,

        source_lat=data.source_lat,

        source_lng=data.source_lng,

        destination_lat=data.destination_lat,

        destination_lng=data.destination_lng,

        predicted_traffic=predicted_value,

        confidence=confidence,

        congestion=congestion,

        recommended_route=route,

        average_speed=average_speed,

        travel_time=travel_time,

        delay=delay,
    )

    db.add(history)

    db.commit()

    db.refresh(history)

    # ------------------------------------------------------------------
    # Automatic alert generation
    #
    # No manual alert creation by users.
    # ------------------------------------------------------------------

    alert = generate_alert_for_prediction(

        db,

        user_id=current_user.id,

        prediction=history,

        data=data,

        congestion=congestion,

        recommended_route=route,

        predicted_value=predicted_value,
    )

    # ------------------------------------------------------------------
    # AI / recommendation layer
    #
    # Currently uses your existing recommendation service.
    # If you later switch to recommendation_orchestrator.py for the
    # real OpenAI-based recommendation feature, only this import should
    # change.
    # ------------------------------------------------------------------

    recommendation = build_recommendation(

        alert=alert,

        data=data,

        congestion=congestion,

        confidence=confidence,

        recommended_route=route,
    )

    # ------------------------------------------------------------------
    # API response
    # ------------------------------------------------------------------

    return {

        "predicted_traffic":
            predicted_value,

        "congestion":
            congestion,

        "recommended_route":
            route,

        "confidence":
            confidence,

        "alert":
            alert,

        "ai_recommendation":
            recommendation,
    }