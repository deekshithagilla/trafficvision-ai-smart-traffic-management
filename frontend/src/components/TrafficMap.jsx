import { useEffect, useState } from "react";

import { getRoutes } from "../services/routeService";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    CircleMarker,
    useMap
} from "react-leaflet";

import L from "leaflet";

import HeatmapLayer from "./HeatmapLayer";

import api from "../services/api";

import "leaflet/dist/leaflet.css";


// ======================================================
// MARKER ICON
// ======================================================

const markerIcon = new L.Icon({

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41]

});


// ======================================================
// CHANGE MAP CENTER
//
// IMPORTANT:
// Only changes when the actual source coordinates
// change. Clicking another route will NOT move the map.
// ======================================================

function ChangeMapCenter({
    center
}) {

    const map = useMap();


    useEffect(() => {

        if (!center) {
            return;
        }


        map.setView(
            center,
            map.getZoom()
        );


    }, [
        center?.[0],
        center?.[1],
        map
    ]);


    return null;

}


// ======================================================
// FIT ALL ROUTES
//
// IMPORTANT:
// We fit the map only when the actual route set changes.
//
// We DO NOT use the currently selected route here.
//
// Therefore clicking Route 1 / Route 2 / Route 3
// does not make the map jump.
// ======================================================

function FitRoutes({
    routes
}) {

    const map = useMap();


    useEffect(() => {

        if (
            !routes ||
            routes.length === 0
        ) {

            return;

        }


        const allPoints = [];


        routes.forEach(
            (route) => {

                if (
                    route?.coordinates &&
                    route.coordinates.length > 0
                ) {

                    allPoints.push(
                        ...route.coordinates
                    );

                }

            }
        );


        if (
            allPoints.length === 0
        ) {

            return;

        }


        map.fitBounds(
            allPoints,
            {
                padding: [50, 50]
            }
        );


    }, [
        routes,
        map
    ]);


    return null;

}


// ======================================================
// TRAFFIC MAP
// ======================================================

function TrafficMap({

    source,

    destination,

    congestion,

    heatmap = [],

    selectedRouteIndex = 0,

    onRouteSelected,

    onRouteLoaded

}) {


    // ==================================================
    // ROUTES
    // ==================================================

    const [
        routes,
        setRoutes
    ] = useState([]);


    // ==================================================
    // BEST ROUTE
    // ==================================================

    const [
        bestRouteIndex,
        setBestRouteIndex
    ] = useState(0);


    // ==================================================
    // BACKEND HEATMAP
    // ==================================================

    const [
        heatPoints,
        setHeatPoints
    ] = useState([]);


    // ==================================================
    // LOAD BACKEND HEATMAP
    // ==================================================

    useEffect(() => {

        async function loadHeatmap() {

            try {

                const response =
                    await api.get(
                        "/analytics/heatmap",
                        {
                            headers: {

                                Authorization:
                                    `Bearer ${localStorage.getItem(
                                        "access_token"
                                    )}`

                            }
                        }
                    );


                setHeatPoints(
                    response.data || []
                );


            } catch (err) {

                console.error(
                    "Heatmap Error:",
                    err
                );

            }

        }


        loadHeatmap();

    }, []);


    // ==================================================
    // LOAD ROUTES
    // ==================================================

    useEffect(() => {

        let cancelled = false;


        async function loadRoute() {

            if (
                !source ||
                !destination
            ) {

                setRoutes([]);

                return;

            }


            try {

                console.log(
                    "Loading routes..."
                );


                const data =
                    await getRoutes(
                        source,
                        destination
                    );


                if (cancelled) {
                    return;
                }


                // ==================================================
                // VALIDATE RESPONSE
                // ==================================================

                if (
                    !data ||
                    !data.features ||
                    data.features.length === 0
                ) {

                    console.warn(
                        "No routes returned from OpenRouteService."
                    );


                    setRoutes([]);

                    return;

                }


                console.log(
                    "Total routes returned after deduplication:",
                    data.features.length
                );


                // ==================================================
                // CONVERT GEOJSON ROUTES
                // ==================================================

                const allRoutes =
                    data.features
                        .map(
                            (
                                feature,
                                index
                            ) => {

                                if (
                                    !feature?.geometry?.coordinates
                                ) {

                                    return null;

                                }


                                const coordinates =
                                    feature
                                        .geometry
                                        .coordinates
                                        .map(
                                            ([lng, lat]) => [
                                                lat,
                                                lng
                                            ]
                                        );


                                const summary =
                                    feature
                                        .properties
                                        ?.summary || {
                                            distance: 0,
                                            duration: 0
                                        };


                                return {

                                    id: index,

                                    coordinates,

                                    summary,

                                    feature

                                };

                            }
                        )
                        .filter(Boolean);


                console.log(
                    "Routes displayed on map:",
                    allRoutes.length
                );


                // ==================================================
                // FIND FASTEST ROUTE
                // ==================================================

                const fastestRouteIndex =
                    allRoutes.reduce(

                        (
                            bestIndex,
                            currentRoute,
                            currentIndex,
                            array
                        ) => {

                            if (
                                currentRoute
                                    .summary
                                    .duration
                                <
                                array[bestIndex]
                                    .summary
                                    .duration
                            ) {

                                return currentIndex;

                            }


                            return bestIndex;

                        },

                        0

                    );


                console.log(
                    "Best route index:",
                    fastestRouteIndex
                );


                console.log(
                    "Best route number:",
                    fastestRouteIndex + 1
                );


                // ==================================================
                // SAVE ROUTES
                // ==================================================

                setRoutes(
                    allRoutes
                );


                setBestRouteIndex(
                    fastestRouteIndex
                );


                // ==================================================
                // SEND BEST ROUTE TO PARENT
                // ==================================================

                if (
                    onRouteLoaded &&
                    allRoutes[fastestRouteIndex]
                ) {

                    onRouteLoaded(
                        allRoutes[
                            fastestRouteIndex
                        ].summary
                    );

                }


            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Route loading error:",
                    error
                );


                setRoutes([]);

            }

        }


        loadRoute();


        return () => {

            cancelled = true;

        };


    }, [
        source,
        destination
    ]);


    // ==================================================
    // MAP CENTER
    // ==================================================

    const center = source
        ? [
            Number(source.lat),
            Number(source.lng)
        ]
        : [
            17.3850,
            78.4867
        ];


    // ==================================================
    // ACTIVE ROUTE
    //
    // Sync with parent selectedRouteIndex prop and
    // keep track of internally clicked route.
    // ==================================================

    const [
        selectedRouteIdx,
        setSelectedRouteIdx
    ] = useState(selectedRouteIndex ?? 0);

    useEffect(() => {
        if (selectedRouteIndex !== undefined && selectedRouteIndex !== null) {
            setSelectedRouteIdx(selectedRouteIndex);
        }
    }, [selectedRouteIndex]);

    useEffect(() => {
        if (bestRouteIndex !== undefined && bestRouteIndex !== null) {
            setSelectedRouteIdx(bestRouteIndex);
        }
    }, [bestRouteIndex]);

    const activeRouteIndex =
        selectedRouteIdx >= 0 &&
        selectedRouteIdx < routes.length
            ? selectedRouteIdx
            : bestRouteIndex;


    // ==================================================
    // CONGESTION COLOR
    // ==================================================

    const congestionColor =
        congestion?.includes("Low")
            ? "#16a34a"
            : congestion?.includes("Medium")
                ? "#f59e0b"
                : "#dc2626";


    // ==================================================
    // HANDLE ROUTE CLICK
    // ==================================================

    const handleRouteClick = (
        index
    ) => {

        setSelectedRouteIdx(index);

        const selectedRoute =
            routes[index];


        if (!selectedRoute) {
            return;
        }


        console.log(
            "Selected route:",
            index + 1
        );


        if (onRouteSelected) {

            onRouteSelected(
                index,
                selectedRoute.summary
            );

        }

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div
            style={{
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow:
                    "0 8px 20px rgba(0,0,0,.15)"
            }}
        >

            <MapContainer

                center={center}

                zoom={12}

                style={{
                    height: "550px",
                    width: "100%"
                }}

            >

                {/* ==================================================
                    OPEN STREET MAP
                ================================================== */}

                <TileLayer

                    attribution="&copy; OpenStreetMap contributors"

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* ==================================================
                    KEEP CENTER STABLE
                ================================================== */}

                <ChangeMapCenter
                    center={center}
                />


                {/* ==================================================
                    FIT ALL ROUTES
                ================================================== */}

                <FitRoutes
                    routes={routes}
                />


                {/* ==================================================
                    SOURCE MARKER
                ================================================== */}

                {source && (

                    <Marker

                        position={[
                            Number(source.lat),
                            Number(source.lng)
                        ]}

                        icon={markerIcon}

                    >

                        <Popup>

                            📍 <b>Source</b>

                            <br />

                            {source.name}

                        </Popup>

                    </Marker>

                )}


                {/* ==================================================
                    DESTINATION MARKER
                ================================================== */}

                {destination && (

                    <Marker

                        position={[
                            Number(destination.lat),
                            Number(destination.lng)
                        ]}

                        icon={markerIcon}

                    >

                        <Popup>

                            📍 <b>Destination</b>

                            <br />

                            {destination.name}

                        </Popup>

                    </Marker>

                )}


                {/* ==================================================
                    ALL ROUTES
                ================================================== */}

                {routes.map(
                    (
                        routeItem,
                        index
                    ) => {

                        const isSelected =
                            index ===
                            activeRouteIndex;


                        const isBest =
                            index ===
                            bestRouteIndex;

                        // Calculate sequential alternative number (1, 2, ...) among non-best routes
                        let altNumber = 0;
                        for (let i = 0; i <= index; i++) {
                            if (i !== bestRouteIndex) {
                                altNumber++;
                            }
                        }


                        return (

                            <Polyline

                                key={
                                    `route-${routeItem.id}`
                                }

                                positions={
                                    routeItem.coordinates
                                }


                                // ==================================================
                                // COLOR
                                // ==================================================

                                color={
                                    isSelected
                                        ? congestionColor
                                        : "#64748b"
                                }


                                // ==================================================
                                // WIDTH
                                // ==================================================

                                weight={
                                    isSelected
                                        ? 8
                                        : 5
                                }


                                // ==================================================
                                // OPACITY
                                // ==================================================

                                opacity={
                                    isSelected
                                        ? 1
                                        : 0.65
                                }


                                // ==================================================
                                // ALTERNATIVE ROUTES
                                // ==================================================

                                dashArray={
                                    isSelected
                                        ? undefined
                                        : "10 8"
                                }


                                // ==================================================
                                // CLICK ROUTE
                                // ==================================================

                                eventHandlers={{

                                    click: () => {

                                        handleRouteClick(
                                            index
                                        );

                                    },

                                    add: (
                                        event
                                    ) => {

                                        if (
                                            isSelected &&
                                            event.target
                                        ) {

                                            event.target
                                                .bringToFront();

                                        }

                                    }

                                }}

                            >

                                {/* ==================================================
                                    ROUTE POPUP
                                ================================================== */}

                                <Popup>

                                    <div
                                        style={{
                                            minWidth: "210px",
                                            padding: "4px"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "8px",
                                                gap: "8px"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    background: isBest ? "#16a34a" : "#475569",
                                                    color: "#ffffff",
                                                    padding: "3px 9px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    display: "inline-block"
                                                }}
                                            >

                                                {isBest ? "🏆 Recommended Route" : `Alternative Route ${altNumber}`}

                                            </span>

                                            {isSelected && (

                                                <span
                                                    style={{
                                                        background: "#eff6ff",
                                                        color: "#2563eb",
                                                        border: "1px solid #bfdbfe",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontSize: "11px",
                                                        fontWeight: "600"
                                                    }}
                                                >

                                                    ✓ Selected

                                                </span>

                                            )}

                                        </div>

                                        <h3
                                            style={{
                                                margin: "0 0 6px 0",
                                                color: "#1e3a8a",
                                                fontSize: "15px"
                                            }}
                                        >

                                            {isBest
                                                ? `Route ${index + 1} (Fastest Route)`
                                                : `Route ${index + 1} • Alternative Route ${altNumber}`}

                                        </h3>


                                        <p
                                            style={{
                                                margin: "4px 0",
                                                fontSize: "13px",
                                                color: "#334155"
                                            }}
                                        >

                                            <b>
                                                Distance:
                                            </b>

                                            {" "}

                                            {(
                                                routeItem
                                                    .summary
                                                    .distance /
                                                1000
                                            ).toFixed(2)}

                                            {" km"}

                                        </p>


                                        <p
                                            style={{
                                                margin: "4px 0",
                                                fontSize: "13px",
                                                color: "#334155"
                                            }}
                                        >

                                            <b>
                                                Estimated Time:
                                            </b>

                                            {" "}

                                            {(
                                                routeItem
                                                    .summary
                                                    .duration /
                                                60
                                            ).toFixed(1)}

                                            {" minutes"}

                                        </p>


                                        {isBest && (

                                            <p
                                                style={{
                                                    margin: "8px 0 0 0",
                                                    color: "#16a34a",
                                                    fontWeight: "bold",
                                                    fontSize: "12px"
                                                }}
                                            >

                                                ✓ Fastest route with lowest travel time

                                            </p>

                                        )}


                                        {isSelected &&
                                            !isBest && (

                                                <p
                                                    style={{
                                                        margin: "8px 0 0 0",
                                                        color: "#2563eb",
                                                        fontWeight: "bold",
                                                        fontSize: "12px"
                                                    }}
                                                >

                                                    ✓ Currently selected alternative route

                                                </p>

                                            )}

                                        {!isSelected &&
                                            !isBest && (

                                                <p
                                                    style={{
                                                        margin: "8px 0 0 0",
                                                        color: "#64748b",
                                                        fontSize: "12px"
                                                    }}
                                                >

                                                    👉 Click to select Alternative Route {altNumber}

                                                </p>

                                            )}

                                    </div>

                                </Popup>

                            </Polyline>

                        );

                    }
                )}


                {/* ==================================================
                    TRAFFIC HOTSPOTS
                ================================================== */}

                {heatmap.map(
                    (
                        point,
                        index
                    ) => {

                        const intensity =
                            Number(
                                point.intensity
                            ) || 0;


                        return (

                            <CircleMarker

                                key={
                                    `hotspot-${index}`
                                }

                                center={[
                                    Number(point.lat),
                                    Number(point.lng)
                                ]}


                                radius={
                                    6 +
                                    intensity * 12
                                }


                                color={
                                    intensity > 0.7
                                        ? "#dc2626"
                                        : intensity > 0.4
                                            ? "#f59e0b"
                                            : "#22c55e"
                                }


                                fillOpacity={0.8}

                            >

                                <Popup>

                                    <b>
                                        🚦 Traffic Hotspot
                                    </b>

                                    <br />

                                    Intensity:

                                    {" "}

                                    {(
                                        intensity * 100
                                    ).toFixed(0)}

                                    %

                                </Popup>

                            </CircleMarker>

                        );

                    }
                )}


                {/* ==================================================
                    BACKEND HEATMAP
                ================================================== */}

                {heatPoints.length > 0 && (

                    <HeatmapLayer
                        points={
                            heatPoints
                        }
                    />

                )}

            </MapContainer>

        </div>

    );

}


export default TrafficMap;