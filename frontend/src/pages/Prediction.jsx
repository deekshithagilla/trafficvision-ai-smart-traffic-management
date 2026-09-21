// Production Restore: original layout
import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import TrafficMap from "../components/TrafficMap";
import NotificationCard from "../components/NotificationCard";
import AIRecommendationCard from "../components/AIRecommendationCard";
import {
    getCoordinates,
    getRoutes
} from "../services/routeService";


function Prediction() {

    const [sourceCoords, setSourceCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);

    const [form, setForm] = useState({
        source: "",
        destination: "",
        holiday: "None",
        temp: "",
        rain_1h: 0,
        snow_1h: 0,
        clouds_all: "",
        weather_main: "Clear",
        weather_description: "sky is clear",
        hour: "",
        day: "",
        month: "",
        weekday: "",
        distance: 10
    });
    const [prediction, setPrediction] = useState(null);
    const [congestion, setCongestion] = useState("");
    const [travelTime, setTravelTime] = useState(null);
    const [actualDistance, setActualDistance] = useState(null);
    const [delay, setDelay] = useState(null);
    const [avgSpeed, setAvgSpeed] = useState(null);
    const [route, setRoute] = useState("");
    const [routes, setRoutes] = useState([]);
    const [bestRoute, setBestRoute] = useState(null);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [savedTime, setSavedTime] = useState("");
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [heatmap, setHeatmap] = useState([]);
    const [confidence, setConfidence] = useState(null);
    const [alertData, setAlertData] = useState(null);
    const [aiRecommendation, setAiRecommendation] = useState(null);

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        if (type === "number") {
            // Keep numeric inputs inside their valid ranges even when a
            // value is typed manually instead of using the arrow controls.
            const limits = {
                temp: { min: -50, max: 60 },
                rain_1h: { min: 0, max: 500 },
                snow_1h: { min: 0, max: 500 },
                clouds_all: { min: 0, max: 100 },
                hour: { min: 0, max: 23 },
                day: { min: 1, max: 31 },
                month: { min: 1, max: 12 },
                weekday: { min: 1, max: 7 },
                distance: { min: 0, max: 10000 }
            };

            if (value === "") {
                setForm({ ...form, [name]: "" });
                return;
            }

            const numberValue = Number(value);
            const limit = limits[name];

            if (limit) {
                const clampedValue = Math.min(
                    limit.max,
                    Math.max(limit.min, numberValue)
                );

                setForm({
                    ...form,
                    [name]: clampedValue
                });
                return;
            }
        }

        setForm({
            ...form,
            [name]: value
        });
    };

    const predictTraffic = async () => {

        setLoading(true);

        try {


            const sourceLocation = await getCoordinates(form.source);
            const destinationLocation = await getCoordinates(form.destination);

            // Get all available routes
            const routeData = await getRoutes(
                sourceLocation,
                destinationLocation
            );


            // Convert routes into a simple array
            const availableRoutes = routeData.features.map((route, index) => ({

                id: index + 1,

                distance: (
                    route.properties.summary.distance / 1000
                ).toFixed(2),

                duration: (
                    route.properties.summary.duration / 60
                ).toFixed(1)

            }));

            const loadHeatmap = async () => {

                const response = await api.get(
                    "/analytics/heatmap",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${localStorage.getItem("access_token")}`
                        }
                    }
                );

                setHeatmap(response.data);

            };


            setRoutes(availableRoutes);

            // Find fastest route
            const recommendedRoute = availableRoutes.reduce(

                (best, current) =>

                    Number(current.duration) < Number(best.duration)

                        ? current

                        : best

            );

            setBestRoute(recommendedRoute);

            const fastestIdx = availableRoutes.findIndex(
                (r) => r.id === recommendedRoute.id
            );
            setSelectedRouteIndex(fastestIdx >= 0 ? fastestIdx : 0);

            setActualDistance(recommendedRoute.distance);

            setForm(prev => ({
                ...prev,
                distance: Number(recommendedRoute.distance)
            }));

            // Save coordinates for map
            setSourceCoords({
                ...sourceLocation,
                name: form.source
            });

            setDestinationCoords({
                ...destinationLocation,
                name: form.destination
            });

            // Payload for backend
            const payload = {

                ...form,

                distance: Number(recommendedRoute.distance),

                source_lat: sourceLocation.lat,
                source_lng: sourceLocation.lng,

                destination_lat: destinationLocation.lat,
                destination_lng: destinationLocation.lng

            };

            // Predict traffic
            const response = await api.post(

                "/prediction/predict",

                payload,

                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem("access_token")}`
                    }
                }

            );

            const predicted = response.data.predicted_traffic;

            setPrediction(predicted);
            setConfidence(response.data.confidence);
            setAlertData(response.data.alert);
            setAiRecommendation(response.data.ai_recommendation);

            // Calculate travel speed
            let speed;

            if (predicted < 2500) {

                speed = 60;

            }
            else if (predicted < 4500) {

                speed = 40;

            }
            else {

                speed = 25;

            }

            // Travel statistics
            const distanceKm = Number(recommendedRoute.distance);

            const travelTimeMinutes =
                (distanceKm / speed) * 60;

            const idealTime =
                (distanceKm / 60) * 60;

            setAvgSpeed(speed);

            setTravelTime(
                travelTimeMinutes.toFixed(1)
            );

            setDelay(
                (travelTimeMinutes - idealTime).toFixed(1)
            );

            // Longest route
            const longestRoute = availableRoutes.reduce(

                (worst, current) =>

                    Number(current.duration) > Number(worst.duration)

                        ? current

                        : worst

            );

            const saved = (

                Number(longestRoute.duration)

                -

                Number(recommendedRoute.duration)

            ).toFixed(1);

            // Congestion
            let congestionLevel = "";
            let trafficStatus = "";

            if (predicted < 2500) {

                congestionLevel = "Low";
                trafficStatus = "Smooth Traffic";

            }
            else if (predicted < 4500) {

                congestionLevel = "Medium";
                trafficStatus = "Moderate Traffic";

            }
            else {

                congestionLevel = "High";
                trafficStatus = "Heavy Traffic";

            }

            setCongestion(congestionLevel);
            setStatus(trafficStatus);

            setRoute(`Route ${recommendedRoute.id}`);

            setSavedTime(saved);

            setReason(

                `Route ${recommendedRoute.id} is recommended because it has the lowest estimated travel time (${recommendedRoute.duration} minutes).`

            );

            await loadHeatmap();

            toast.success("Prediction completed.");

            // The backend automatically generates a traffic alert for
            // every prediction - surface it as a toast notification.
            const generatedAlert = response.data.alert;

            if (generatedAlert) {

                const toastBySeverity = {
                    High: toast.error,
                    Medium: toast.warning,
                    Low: toast.info
                };

                const notify =
                    toastBySeverity[generatedAlert.severity] || toast.info;

                notify(
                    `${generatedAlert.category} Alert: ${generatedAlert.message}`
                );

            }

        } catch (error) {

            console.error(error);

            toast.error(

                error.response?.data?.detail ||

                error.message ||

                "Prediction failed."

            );

        } finally {

            setLoading(false);

        }
    };

    const handleRouteSelected = (index, summary) => {
        setSelectedRouteIndex(index);
        const selRoute = routes[index];
        if (selRoute) {
            setRoute(`Route ${selRoute.id}`);
            setActualDistance(selRoute.distance);
            setTravelTime(selRoute.duration);

            let speed = 60;
            if (prediction !== null) {
                if (prediction < 2500) {
                    speed = 60;
                } else if (prediction < 4500) {
                    speed = 40;
                } else {
                    speed = 25;
                }
                setAvgSpeed(speed);

                const travelTimeMinutes = Number(selRoute.duration);
                const freeFlowTime = (Number(selRoute.distance) / 60) * 60;
                const currentDelay = Math.max(0, Math.round(travelTimeMinutes - freeFlowTime));
                setDelay(currentDelay);
            }
        }
    };

    const downloadReport = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });

        // Clean text helper to eliminate any Unicode emojis or special arrows that corrupt jsPDF fonts
        const clean = (val) => {
            if (val === null || val === undefined) return "N/A";
            return String(val)
                .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
                .replace(/➔|→/g, "->")
                .replace(/[^\x20-\x7E\t\n\r]/g, "")
                .trim();
        };

        const primaryBlue = [30, 58, 138];     // #1e3a8a
        const secondaryBlue = [37, 99, 235];  // #2563eb
        const darkText = [30, 41, 59];         // #1e293b
        const grayText = [100, 116, 139];     // #64748b

        // --- PAGE 1: PREDICTION & JOURNEY SUMMARY ---
        // Header Banner
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.rect(0, 0, 595.28, 70, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text("TrafficVision AI", 40, 36);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(219, 234, 254);
        doc.text("Smart Traffic Prediction & Congestion Analysis Report", 40, 52);

        // Right side metadata
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 555, 36, { align: "right" });
        doc.text("Status: Verified System Report", 555, 50, { align: "right" });

        // Journey Route Card Table
        autoTable(doc, {
            startY: 85,
            theme: "grid",
            head: [["Trip & Journey Overview", "Details"]],
            body: [
                ["Source Origin", clean(form.source)],
                ["Destination", clean(form.destination)],
                ["Estimated Distance", `${actualDistance || form.distance || "N/A"} km`],
                ["Estimated Travel Time", `${travelTime || "N/A"} minutes`],
                ["Expected Traffic Delay", `${delay || "0"} minutes`],
                ["Calculated Average Speed", `${avgSpeed || "N/A"} km/h`]
            ],
            headStyles: {
                fillColor: primaryBlue,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 9.5,
                textColor: darkText,
                cellPadding: 4.5
            },
            columnStyles: {
                0: { fontStyle: "bold", width: 170, fillColor: [241, 245, 249] },
                1: { width: 345 }
            },
            margin: { left: 40, right: 40 }
        });

        // AI Traffic Volume & Congestion Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 12,
            theme: "grid",
            head: [["Traffic Prediction & Forecast", "Result"]],
            body: [
                ["Predicted Traffic Volume", `${prediction || "N/A"} vehicles / hour`],
                ["Congestion Level", clean(congestion)],
                ["Traffic Flow Status", clean(status)],
                ["Recommended Route", clean(route || "Optimal Direct Route")],
                ["Estimated Time Saved", `${savedTime || "0"} minutes`],
                ["Recommendation Reason", clean(reason || "Selected as the fastest corridor based on predicted traffic.")]
            ],
            headStyles: {
                fillColor: secondaryBlue,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 9.5,
                textColor: darkText,
                cellPadding: 4.5
            },
            columnStyles: {
                0: { fontStyle: "bold", width: 170, fillColor: [241, 245, 249] },
                1: { width: 345 }
            },
            margin: { left: 40, right: 40 }
        });

        // Environmental & Weather Conditions Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 12,
            theme: "grid",
            head: [["Weather & Environmental Factors", "Value"]],
            body: [
                ["Weather Condition", `${clean(form.weather_main)} (${clean(form.weather_description)})`],
                ["Ambient Temperature", `${form.temp || "N/A"} °C`],
                ["Rainfall (Past 1 Hour)", `${form.rain_1h || "0"} mm`],
                ["Snowfall (Past 1 Hour)", `${form.snow_1h || "0"} mm`],
                ["Cloud Cover", `${form.clouds_all || "0"}%`],
                ["Holiday Event", clean(form.holiday || "None")]
            ],
            headStyles: {
                fillColor: [71, 85, 105], // Slate 600
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 9.5,
                textColor: darkText,
                cellPadding: 4.5
            },
            columnStyles: {
                0: { fontStyle: "bold", width: 170, fillColor: [241, 245, 249] },
                1: { width: 345 }
            },
            margin: { left: 40, right: 40 }
        });

        // Page 1 Footer
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text("TrafficVision AI - Intelligent Traffic Management System • Page 1 of 2", 297, 820, { align: "center" });

        // --- PAGE 2: AI INSIGHTS & DRIVER ADVISORY ---
        doc.addPage();

        // Header Banner Page 2
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.rect(0, 0, 595.28, 70, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text("AI Traffic Insights & Safety Advisory", 40, 36);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(219, 234, 254);
        doc.text("Real-Time Route Intelligence, Departure Guidance & Safety Protocols", 40, 52);

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`Report ID: TV-${Date.now().toString().slice(-6)}`, 555, 36, { align: "right" });
        doc.text("AI Confidence: " + (aiRecommendation?.confidence ? `${aiRecommendation.confidence}%` : "85%"), 555, 50, { align: "right" });

        // AI Advisory Table
        autoTable(doc, {
            startY: 85,
            theme: "grid",
            head: [["AI Decision Metric", "Intelligent Advisory"]],
            body: [
                ["Risk / Traffic Status", clean(aiRecommendation?.traffic_status || status || "Normal Traffic")],
                ["Congestion Classification", clean(aiRecommendation?.congestion_level || congestion || "Normal")],
                ["Recommended Route", clean(aiRecommendation?.recommended_route || route || "Primary Route")],
                ["Route Selection Rationale", clean(aiRecommendation?.reason || reason || "Fastest transit path available.")],
                ["Optimal Departure Window", clean(aiRecommendation?.suggested_departure || "Travel at regular scheduled time.")],
                ["Predicted Transit Delay", `${aiRecommendation?.estimated_delay ?? delay ?? 0} minutes`]
            ],
            headStyles: {
                fillColor: primaryBlue,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 9.5,
                textColor: darkText,
                cellPadding: 5
            },
            columnStyles: {
                0: { fontStyle: "bold", width: 170, fillColor: [241, 245, 249] },
                1: { width: 345 }
            },
            margin: { left: 40, right: 40 }
        });

        // Safety Recommendations Table
        const safetyTips = (aiRecommendation?.safety_tips && aiRecommendation.safety_tips.length > 0)
            ? aiRecommendation.safety_tips.map((tip, i) => [`${i + 1}.`, clean(tip)])
            : [
                ["1.", "Maintain safe following distance behind other vehicles."],
                ["2.", "Watch for sudden braking and congestion bottlenecks."],
                ["3.", "Keep headlights active and drive with caution in adverse weather."]
            ];

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 12,
            theme: "striped",
            head: [["#", "Driver Safety & Caution Guidelines"]],
            body: safetyTips,
            headStyles: {
                fillColor: [185, 28, 28], // Crimson Red
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 9,
                textColor: darkText,
                cellPadding: 4.5
            },
            columnStyles: {
                0: { fontStyle: "bold", width: 30, halign: "center" },
                1: { width: 485 }
            },
            margin: { left: 40, right: 40 }
        });

        // Fuel Saving Tips Table
        const fuelTips = (aiRecommendation?.fuel_tips && aiRecommendation.fuel_tips.length > 0)
            ? aiRecommendation.fuel_tips.map((tip, i) => [`${i + 1}.`, clean(tip)])
            : [
                ["1.", "Maintain steady speed to optimize fuel efficiency."],
                ["2.", "Avoid abrupt accelerations and hard decelerations in traffic."],
                ["3.", "Turn off engine during extended standstill idling."]
            ];

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 12,
            theme: "striped",
            head: [["#", "Fuel Economy & Eco-Driving Recommendations"]],
            body: fuelTips,
            headStyles: {
                fillColor: [21, 128, 61], // Emerald Green
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 9,
                textColor: darkText,
                cellPadding: 4.5
            },
            columnStyles: {
                0: { fontStyle: "bold", width: 30, halign: "center" },
                1: { width: 485 }
            },
            margin: { left: 40, right: 40 }
        });

        // Page 2 Footer
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text("TrafficVision AI - Intelligent Traffic Management System • Page 2 of 2", 297, 820, { align: "center" });

        // Save PDF
        const filename = `TrafficVision_Report_${clean(form.source || "Origin")}_to_${clean(form.destination || "Destination")}.pdf`.replace(/\s+/g, "_");
        doc.save(filename);
    };

    const inputStyle = {
        width: "100%",
        padding: "13px",
        marginTop: "6px",
        marginBottom: "20px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box"
    };

    const statCard = {
        background: "linear-gradient(135deg,#2563eb,#1e40af)",
        color: "white",
        borderRadius: "18px",
        padding: "25px",
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,.15)"
    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    background: "#f5f7fb",
                    minHeight: "100vh",
                    padding: "35px"
                }}
            >
                <div
                    style={{
                        maxWidth: "900px",
                        margin: "auto",
                        background: "white",
                        borderRadius: "20px",
                        padding: "35px",
                        boxShadow: "0 15px 35px rgba(0,0,0,.08)"
                    }}
                >

                    <h1
                        style={{
                            color: "#1e3a8a",
                            marginBottom: "5px",
                            fontSize: "36px",
                            fontWeight: "700"
                        }}
                    >
                        🤖 AI Traffic Prediction
                    </h1>

                    <p
                        style={{
                            color: "#666",
                            marginBottom: "30px"
                        }}
                    >
                        Enter weather and date information to predict traffic volume.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2,1fr)",
                            gap: "20px"
                        }}
                    >

                        <div>
                            <label>Holiday</label>

                            <select
                                name="holiday"
                                value={form.holiday}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="None">None</option>
                                <option value="Christmas Day">Christmas Day</option>
                                <option value="Columbus Day">Columbus Day</option>
                                <option value="Independence Day">Independence Day</option>
                                <option value="Labor Day">Labor Day</option>
                                <option value="Martin Luther King Jr Day">Martin Luther King Jr Day</option>
                                <option value="Memorial Day">Memorial Day</option>
                                <option value="New Years Day">New Years Day</option>
                                <option value="State Fair">State Fair</option>
                                <option value="Thanksgiving Day">Thanksgiving Day</option>
                                <option value="Veterans Day">Veterans Day</option>
                                <option value="Washingtons Birthday">Washingtons Birthday</option>
                            </select>
                        </div>

                        <div>
                            <label>Temperature (°C)</label>

                            <input
                                type="number"
                                name="temp"
                                value={form.temp}
                                min="-50"
                                max="60"
                                step="0.1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Source</label>

                            <input
                                type="text"
                                name="source"
                                value={form.source}
                                onChange={handleChange}
                                placeholder="e.g. Hyderabad"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Destination</label>

                            <input
                                type="text"
                                name="destination"
                                value={form.destination}
                                onChange={handleChange}
                                placeholder="e.g. Secunderabad"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Rain (1 hour) (mm)</label>

                            <input
                                type="number"
                                name="rain_1h"
                                value={form.rain_1h}
                                min="0"
                                max="500"
                                step="0.1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Snow (1 hour) (mm)</label>

                            <input
                                type="number"
                                name="snow_1h"
                                value={form.snow_1h}
                                min="0"
                                max="500"
                                step="0.1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Cloud Cover (%)</label>

                            <input
                                type="number"
                                name="clouds_all"
                                value={form.clouds_all}
                                min="0"
                                max="100"
                                step="1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Weather</label>

                            <select
                                name="weather_main"
                                value={form.weather_main}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option>Clear</option>
                                <option>Clouds</option>
                                <option>Rain</option>
                                <option>Snow</option>
                                <option>Mist</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: "1 / span 2" }}>
                            <label>Weather Description</label>

                            <select
                                name="weather_description"
                                value={form.weather_description}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="sky is clear">sky is clear</option>
                                <option value="Sky is Clear">Sky is Clear</option>
                                <option value="few clouds">few clouds</option>
                                <option value="scattered clouds">scattered clouds</option>
                                <option value="broken clouds">broken clouds</option>
                                <option value="overcast clouds">overcast clouds</option>
                                <option value="light rain">light rain</option>
                                <option value="moderate rain">moderate rain</option>
                                <option value="heavy intensity rain">heavy intensity rain</option>
                                <option value="very heavy rain">very heavy rain</option>
                                <option value="light snow">light snow</option>
                                <option value="heavy snow">heavy snow</option>
                                <option value="mist">mist</option>
                                <option value="fog">fog</option>
                                <option value="haze">haze</option>
                                <option value="smoke">smoke</option>
                                <option value="drizzle">drizzle</option>
                                <option value="light intensity drizzle">light intensity drizzle</option>
                                <option value="heavy intensity drizzle">heavy intensity drizzle</option>
                                <option value="proximity thunderstorm">proximity thunderstorm</option>
                                <option value="thunderstorm">thunderstorm</option>
                            </select>
                        </div>

                        <div>
                            <label>Hour (0–23)</label>

                            <input
                                type="number"
                                name="hour"
                                value={form.hour}
                                min="0"
                                max="23"
                                step="1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Day (1–31)</label>

                            <input
                                type="number"
                                name="day"
                                value={form.day}
                                min="1"
                                max="31"
                                step="1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Month (1–12)</label>

                            <input
                                type="number"
                                name="month"
                                value={form.month}
                                min="1"
                                max="12"
                                step="1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Weekday (1–7)</label>

                            <input
                                type="number"
                                name="weekday"
                                value={form.weekday}
                                min="1"
                                max="7"
                                step="1"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                    </div>

                    <button
                        onClick={predictTraffic}
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: "15px",
                            padding: "16px",
                            border: "none",
                            borderRadius: "12px",
                            background: loading
                                ? "#9ca3af"
                                : "#2563eb",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "700",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            transition: ".3s"
                        }}
                        onMouseEnter={(e) => {
                            if (!loading)
                                e.target.style.background = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                            if (!loading)
                                e.target.style.background = "#2563eb";
                        }}
                    >
                        {loading
                            ? "Predicting..."
                            : "🚀 Predict Traffic"}
                    </button>

                    {prediction !== null && (

                        <div
                            style={{
                                marginTop: "35px",
                                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                                color: "white",
                                borderRadius: "18px",
                                padding: "30px",
                                textAlign: "center",
                                boxShadow: "0 10px 25px rgba(0,0,0,.2)"
                            }}
                        >

                            <h2 style={{ marginBottom: "20px" }}>
                                🚦 Traffic Prediction Result
                            </h2>

                            <h1
                                style={{
                                    fontSize: "52px",
                                    marginBottom: "10px"
                                }}
                            >
                                {prediction}
                            </h1>

                            <h3>Vehicles / Hour</h3>

                            <hr
                                style={{
                                    margin: "25px 0",
                                    borderColor: "rgba(255,255,255,.3)"
                                }}
                            />

                            <h3>Congestion Level</h3>

                            <h2
                                style={{
                                    color:
                                        congestion.includes("Low")
                                            ? "#22c55e"
                                            : congestion.includes("Medium")
                                            ? "#facc15"
                                            : "#ef4444"
                                }}
                            >
                                {congestion}
                            </h2>

                            <h3>{status}</h3>

                            <div
                                style={{
                                    width: "100%",
                                    height: "16px",
                                    background: "rgba(255,255,255,.25)",
                                    borderRadius: "30px",
                                    marginTop: "20px",
                                    overflow: "hidden"
                                }}
                            >
                                <div
                                    style={{
                                        width:
                                            prediction < 2500
                                                ? "30%"
                                                : prediction < 4500
                                                ? "65%"
                                                : "95%",
                                        height: "100%",
                                        background:
                                            prediction < 2500
                                                ? "#22c55e"
                                                : prediction < 4500
                                                ? "#facc15"
                                                : "#ef4444",
                                        transition: "1s"
                                    }}
                                />
                            </div>

                            <p style={{ marginTop: "18px", fontSize: "18px" }}>
                                Prediction Confidence :
                                <b> {confidence != null ? `${confidence}%` : "N/A"}</b>
                            </p>

                            <hr
                                style={{
                                    margin: "25px 0",
                                    borderColor: "rgba(255,255,255,.3)"
                                }}
                            />

                            <h3>🚗 Travel Estimation</h3>

                            <p>
                                Distance :
                                    <b>
                                    {
                                    actualDistance
                                    ?? form.distance
                                    }
                                    km
                                    </b>
                            </p>

                            <p>
                                Average Speed : <b>{avgSpeed} km/h</b>
                            </p>

                            <p>
                                Estimated Time :
                                <b> {travelTime} minutes</b>
                            </p>

                            <p>
                                Delay :
                                <b> +{delay} minutes</b>
                            </p>

                            <p
                                style={{
                                    marginTop: "20px",
                                    opacity: 0.9
                                }}
                            >
                                Generated on: {new Date().toLocaleString()}
                            </p>

                        </div>

                    )}

                    {prediction !== null && alertData && (

                        <div style={{ marginTop: "25px" }}>
                            <NotificationCard alert={alertData} route={route} />
                        </div>

                    )}

                    {prediction !== null && aiRecommendation && (

                        <div style={{ marginTop: "25px" }}>
                            <AIRecommendationCard data={aiRecommendation} />
                        </div>

                    )}

                    {prediction !== null && (

                        <div
                            style={{
                                marginTop: "30px",
                                background: "#ffffff",
                                borderRadius: "15px",
                                padding: "25px",
                                boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                            }}
                        >

                            <h2
                                style={{
                                    color: "#1e3a8a",
                                    marginBottom: "20px"
                                }}
                            >
                                🚗 Route Recommendation
                            </h2>

                            <p>
                                <b>Recommended Route:</b> {route}
                            </p>

                            <p>
                                <b>Estimated Travel Time:</b> {travelTime} minutes
                            </p>

                            <p>
                                <b>Distance:</b> {actualDistance} km
                            </p>

                            <p>
                                <b>Time Saved:</b> {savedTime} minutes
                            </p>

                            <p>
                                <b>Reason:</b> {reason}
                            </p>

                            <hr style={{ margin: "20px 0" }} />

                            <h3>📊 Route Statistics</h3>

                            <p>
                                📍 Distance :
                                <b> {actualDistance} km</b>
                            </p>

                            <p>
                                ⏱ Travel Time :
                                <b> {travelTime} min</b>
                            </p>

                            <p>
                                🚦 Congestion :
                                <b> {congestion}</b>
                            </p>

                            <p>
                                🛣 Recommended Route :
                                <b> {route}</b>
                            </p>

                        </div>

                    )}

                    {prediction !== null && (

                    <div
                        style={{
                            marginTop: "40px"
                        }}
                    >
                        <h2
                            style={{
                                color: "#1e3a8a",
                                marginBottom: "20px"
                            }}
                        >
                            🗺 Traffic Map
                        </h2>

                        <TrafficMap
                            source={sourceCoords}
                            destination={destinationCoords}
                            congestion={congestion}
                            heatmap={heatmap}
                            selectedRouteIndex={selectedRouteIndex}
                            onRouteSelected={handleRouteSelected}
                            onRouteLoaded={(summary) => {

                                setTravelTime(
                                    (summary.duration / 60).toFixed(1)
                                );

                                setActualDistance(
                                    (summary.distance / 1000).toFixed(2)
                                );

                            }}
                        />

                        {prediction && (
                            <div
                                style={{
                                    marginTop: "25px",
                                    padding: "20px",
                                    borderRadius: "15px",
                                    background: "#eef6ff",
                                    border: "1px solid #bfdbfe"
                                }}
                            >
                                <h2>📋 Route Summary</h2>

                                <p>
                                    <b>Recommended Route:</b> {route}
                                </p>

                                <p>
                                    <b>Distance:</b> {actualDistance} km
                                </p>

                                <p>
                                    <b>Estimated Travel Time:</b> {travelTime} min
                                </p>

                                <p>
                                    <b>Average Speed:</b> {avgSpeed} km/h
                                </p>

                                <p>
                                    <b>Expected Delay:</b> {delay} min
                                </p>

                                <p>
                                    <b>Time Saved:</b> {savedTime} min
                                </p>

                                <p>
                                    <b>Reason:</b> {reason}
                                </p>
                            </div>
                        )}

                        {routes.length > 0 && (
                            <div
                                style={{
                                    marginTop: "30px",
                                    background: "#fff",
                                    padding: "25px",
                                    borderRadius: "18px",
                                    boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                                }}
                            >
                                <h2
                                    style={{
                                        color: "#1e3a8a",
                                        marginBottom: "20px"
                                    }}
                                >
                                    🛣 Route Comparison
                                </h2>

                                <div
                                    style={{
                                        display: "grid",
                                        gap: "15px"
                                    }}
                                >
                                    {routes.map((item, index) => {
                                        const isBest = bestRoute?.id === item.id;
                                        const isSelected = selectedRouteIndex === index;

                                        let altNumber = 0;
                                        for (let i = 0; i <= index; i++) {
                                            if (routes[i].id !== bestRoute?.id) {
                                                altNumber++;
                                            }
                                        }

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleRouteSelected(index, item)}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "18px",
                                                    borderRadius: "15px",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    background: isSelected
                                                        ? "#dbeafe"
                                                        : isBest
                                                            ? "#f0fdf4"
                                                            : "#f8fafc",
                                                    border: isSelected
                                                        ? "2px solid #2563eb"
                                                        : isBest
                                                            ? "2px solid #16a34a"
                                                            : "1px solid #e5e7eb"
                                                }}
                                            >
                                                <div>
                                                    <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                                        Route {item.id}
                                                        {isBest ? (
                                                            <span style={{ fontSize: "12px", background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                                🏆 Recommended
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                                Alternative Route {altNumber}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <span style={{ fontSize: "12px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                                ✓ Active
                                                            </span>
                                                        )}
                                                    </h3>

                                                    <p style={{ margin: "8px 0" }}>
                                                        📏 Distance :
                                                        <b> {item.distance} km</b>
                                                    </p>

                                                    <p style={{ margin: 0 }}>
                                                        ⏱ Time :
                                                        <b> {item.duration} min</b>
                                                    </p>
                                                </div>

                                                <div>
                                                    {isSelected ? (
                                                        <div
                                                            style={{
                                                                background: "#2563eb",
                                                                color: "white",
                                                                padding: "8px 14px",
                                                                borderRadius: "25px",
                                                                fontWeight: "bold",
                                                                fontSize: "13px"
                                                            }}
                                                        >
                                                            Selected
                                                        </div>
                                                    ) : isBest ? (
                                                        <div
                                                            style={{
                                                                background: "#16a34a",
                                                                color: "white",
                                                                padding: "8px 14px",
                                                                borderRadius: "25px",
                                                                fontWeight: "bold",
                                                                fontSize: "13px"
                                                            }}
                                                        >
                                                            Fastest
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                background: "#f1f5f9",
                                                                color: "#475569",
                                                                padding: "8px 14px",
                                                                borderRadius: "25px",
                                                                fontSize: "13px",
                                                                fontWeight: "500"
                                                            }}
                                                        >
                                                            Select Route
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {prediction && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                                    gap: "20px",
                                    marginTop: "30px"
                                }}
                            >
                                <div className="statCard">
                                    <h3>🚗 Traffic</h3>
                                    <h1>{prediction}</h1>
                                    <p>vehicles/hour</p>
                                </div>

                                <div className="statCard">
                                    <h3>⚡ Speed</h3>
                                    <h1>{avgSpeed}</h1>
                                    <p>km/h</p>
                                </div>

                                <div className="statCard">
                                    <h3>⏱ Delay</h3>
                                    <h1>{delay}</h1>
                                    <p>minutes</p>
                                </div>

                                <div className="statCard">
                                    <h3>🛣 Best Route</h3>
                                    <h1>{route}</h1>
                                    <p>{savedTime} min saved</p>
                                </div>
                            </div>
                        )}
                    </div>

                )}

                {routes.length > 0 && (

                    <div
                        style={{
                            marginTop: "35px",
                            background: "#ffffff",
                            borderRadius: "15px",
                            padding: "25px",
                            boxShadow: "0 10px 25px rgba(0,0,0,.08)"
                        }}
                    >

                        <h2
                            style={{
                                color: "#1e3a8a",
                                marginBottom: "20px"
                            }}
                        >
                            🚗 Available Routes
                        </h2>

                        {routes.map((r, index) => {
                            const isBest = bestRoute?.id === r.id;
                            const isSelected = selectedRouteIndex === index;

                            let altNumber = 0;
                            for (let i = 0; i <= index; i++) {
                                if (routes[i].id !== bestRoute?.id) {
                                    altNumber++;
                                }
                            }

                            return (
                                <div
                                    key={r.id}
                                    onClick={() => handleRouteSelected(index, r)}
                                    style={{
                                        padding: "18px",
                                        marginBottom: "15px",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        border:
                                            isSelected
                                                ? "3px solid #2563eb"
                                                : isBest
                                                    ? "2px solid #16a34a"
                                                    : "1px solid #ddd",
                                        background:
                                            isSelected
                                                ? "#eff6ff"
                                                : isBest
                                                    ? "#ecfdf5"
                                                    : "#fafafa"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                            Route {r.id}
                                            {isBest ? (
                                                <span style={{ fontSize: "12px", background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                    ⭐ Recommended Route
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                                                    Alternative Route {altNumber}
                                                </span>
                                            )}
                                        </h3>
                                        {isSelected && (
                                            <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "bold" }}>
                                                ✓ Active on Map
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ margin: "8px 0 4px" }}>
                                        Distance :
                                        <b> {r.distance} km</b>
                                    </p>

                                    <p style={{ margin: 0 }}>
                                        Estimated Time :
                                        <b> {r.duration} min</b>
                                    </p>
                                </div>
                            );
                        })}

                    </div>

                )}

                    {prediction !== null && (

                        <div
                            style={{
                                display: "flex",
                                gap: "20px",
                                marginTop: "20px",
                                justifyContent: "center"
                            }}
                        >

                            <button
                                onClick={downloadReport}
                                style={{
                                    background: "#16a34a",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 24px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    transition: ".3s"
                                }}
                            >
                                📄 Download PDF Report
                            </button>

                            <button
                                onClick={() => window.print()}
                                style={{
                                    background: "#f59e0b",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 24px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    transition: ".3s"
                                }}
                            >
                                🖨 Print Report
                            </button>

                            <button
                                onClick={() => window.location.href = "/prediction/history"}
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "14px 24px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px"
                                }}
                            >
                                📜 View Prediction History
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </>
    );
}

export default Prediction;