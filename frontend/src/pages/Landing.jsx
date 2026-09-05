import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();
    const [faqOpen, setFaqOpen] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    return (
        <div style={{
            background: "#f9fdfe",
            color: "#0f172a",
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
            minHeight: "100vh",
            overflowX: "hidden"
        }}>
            <style>{`
                @keyframes pulseDot {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .nav-link-custom {
                    color: #334155;
                    text-decoration: none;
                    font-size: 16.5px;
                    font-weight: 600;
                    padding: 8px 14px;
                    transition: all 0.2s ease;
                }
                .nav-link-custom:hover {
                    color: #059669;
                }
                .btn-green-pill {
                    background: #059669;
                    color: #ffffff;
                    border: none;
                    border-radius: 50px;
                    padding: 13px 30px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
                    transition: all 0.25s ease;
                    text-decoration: none;
                }
                .btn-green-pill:hover {
                    background: #047857;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 22px rgba(5, 150, 105, 0.45);
                }
                .btn-login-pill {
                    background: #ffffff;
                    color: #0f172a;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 50px;
                    padding: 12px 28px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .btn-login-pill:hover {
                    border-color: #059669;
                    color: #059669;
                    background: #f0fdf4;
                }
                .feature-circle-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: transform 0.25s ease;
                }
                .feature-circle-item:hover {
                    transform: translateY(-4px);
                }
                @media (max-width: 1024px) {
                    .hero-split-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                        text-align: center;
                    }
                    .hero-left-content {
                        align-items: center !important;
                        margin: 0 auto;
                    }
                    .hero-left-content p {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .stats-flex-row {
                        justify-content: center !important;
                    }
                    .nav-center-links {
                        display: none !important;
                    }
                    .features-circle-row {
                        justify-content: center !important;
                    }
                }
            `}</style>

            {/* ================= NAVBAR ================= */}
            <header style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "26px 36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 20
            }}>
                {/* Brand Logo matching reference */}
                <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                    <img
                        src="/trafficvision-logo.png"
                        alt="TrafficVision AI - Smarter Roads. Safer Tomorrows."
                        style={{ height: "52px", objectFit: "contain" }}
                    />
                </Link>

                {/* Nav Links */}
                <nav className="nav-center-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                    <a
                        href="#home"
                        className="nav-link-custom"
                        style={{
                            color: "#059669",
                            borderBottom: "3px solid #059669",
                            paddingBottom: "4px",
                            fontWeight: "700"
                        }}
                    >
                        Home
                    </a>
                    <a href="#features" className="nav-link-custom">Features</a>
                    <a href="#about" className="nav-link-custom">About</a>
                    <a href="#contact" className="nav-link-custom">Contact</a>
                    <a href="#faq" className="nav-link-custom">FAQ</a>
                </nav>

                {/* Right Action Items: Search Icon + Login + Get Started */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    {/* Search Icon */}
                    <button
                        onClick={() => navigate("/prediction")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#334155",
                            cursor: "pointer",
                            padding: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        title="Search Routes"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>

                    {/* Login Button */}
                    <Link to="/login" className="btn-login-pill">
                        Login
                    </Link>

                    {/* Get Started Button */}
                    <button onClick={() => navigate("/login")} className="btn-green-pill">
                        <span>Get Started</span>
                        <span>→</span>
                    </button>
                </div>
            </header>

            {/* ================= HERO SECTION ================= */}
            <main id="home" style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "10px 36px 60px",
                position: "relative"
            }}>
                <div className="hero-split-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.1fr",
                    gap: "36px",
                    alignItems: "center"
                }}>
                    {/* LEFT COLUMN: Clean Typography & Features */}
                    <div className="hero-left-content" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        maxWidth: "540px"
                    }}>
                        {/* Eyebrow Badge */}
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#ecfdf5",
                            border: "1px solid #d1fae5",
                            color: "#047857",
                            padding: "7px 18px",
                            borderRadius: "50px",
                            fontSize: "13.5px",
                            fontWeight: "800",
                            letterSpacing: "0.05em",
                            marginBottom: "20px"
                        }}>
                            <span style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#059669",
                                display: "inline-block",
                                animation: "pulseDot 2s ease-in-out infinite"
                            }} />
                            AI-POWERED TRAFFIC MANAGEMENT
                        </div>

                        {/* Grand Two-Tone Headline */}
                        <h1 style={{
                            fontSize: "clamp(44px, 5.2vw, 60px)",
                            fontWeight: "800",
                            color: "#0f172a",
                            lineHeight: "1.12",
                            letterSpacing: "-0.03em",
                            margin: "0 0 20px 0"
                        }}>
                            Smarter Traffic <br />
                            <span style={{ color: "#059669" }}>
                                for Safer, Greener Cities
                            </span>
                        </h1>

                        {/* Subtitle Description */}
                        <p style={{
                            fontSize: "17.5px",
                            lineHeight: "1.75",
                            color: "#475569",
                            margin: "0 0 30px 0",
                            maxWidth: "510px"
                        }}>
                            TrafficVision AI uses real-time data and advanced machine learning to predict congestion, detect risks, and suggest smarter routes — helping cities move faster, cleaner, and more safely.
                        </p>

                        {/* Primary Action Button */}
                        <button
                            onClick={() => navigate("/prediction")}
                            className="btn-green-pill"
                            style={{
                                padding: "16px 36px",
                                fontSize: "17px",
                                marginBottom: "44px"
                            }}
                        >
                            <span>Explore Features</span>
                            <span>→</span>
                        </button>

                        {/* 4 Feature Circles Row matching reference */}
                        <div className="features-circle-row" style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                            marginBottom: "46px"
                        }}>
                            {/* Circle 1: Real-time Insights */}
                            <div className="feature-circle-item" onClick={() => navigate("/prediction")}>
                                <div style={{
                                    width: "62px",
                                    height: "62px",
                                    borderRadius: "50%",
                                    background: "#e6fffa",
                                    border: "1px solid #b2f5ea",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#0d9488",
                                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.12)"
                                }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b", maxWidth: "95px", lineHeight: "1.3" }}>
                                    Real-time Insights
                                </span>
                            </div>

                            {/* Circle 2: Traffic Predictions */}
                            <div className="feature-circle-item" onClick={() => navigate("/prediction")}>
                                <div style={{
                                    width: "62px",
                                    height: "62px",
                                    borderRadius: "50%",
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#2563eb",
                                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)"
                                }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M5 17h14v-5H5z" />
                                        <circle cx="7.5" cy="17.5" r="2.5" />
                                        <circle cx="16.5" cy="17.5" r="2.5" />
                                        <path d="M5 12l2-6h10l2 6" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b", maxWidth: "95px", lineHeight: "1.3" }}>
                                    Traffic Predictions
                                </span>
                            </div>

                            {/* Circle 3: Accident Risk Alerts */}
                            <div className="feature-circle-item" onClick={() => navigate("/prediction")}>
                                <div style={{
                                    width: "62px",
                                    height: "62px",
                                    borderRadius: "50%",
                                    background: "#fef3c7",
                                    border: "1px solid #fde68a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#d97706",
                                    boxShadow: "0 4px 12px rgba(217, 119, 6, 0.12)"
                                }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b", maxWidth: "95px", lineHeight: "1.3" }}>
                                    Accident Risk Alerts
                                </span>
                            </div>

                            {/* Circle 4: Smart Route Recommendations */}
                            <div className="feature-circle-item" onClick={() => navigate("/prediction")}>
                                <div style={{
                                    width: "62px",
                                    height: "62px",
                                    borderRadius: "50%",
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#16a34a",
                                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.12)"
                                }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b", maxWidth: "115px", lineHeight: "1.3" }}>
                                    Smart Route Recommendations
                                </span>
                            </div>
                        </div>

                        {/* Stats Row matching reference */}
                        <div className="stats-flex-row" style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "36px",
                            paddingTop: "24px",
                            borderTop: "1px solid #e2e8f0",
                            width: "100%",
                            marginBottom: "28px"
                        }}>
                            <div>
                                <div style={{ fontSize: "38px", fontWeight: "800", color: "#059669" }}>30%</div>
                                <div style={{ fontSize: "14.5px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>Reduced Congestion</div>
                            </div>
                            <div style={{ width: "1px", height: "42px", background: "#cbd5e1" }} />
                            <div>
                                <div style={{ fontSize: "38px", fontWeight: "800", color: "#0284c7" }}>15+</div>
                                <div style={{ fontSize: "14.5px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>Key City Routes</div>
                            </div>
                            <div style={{ width: "1px", height: "42px", background: "#cbd5e1" }} />
                            <div>
                                <div style={{ fontSize: "38px", fontWeight: "800", color: "#0f172a" }}>100%</div>
                                <div style={{ fontSize: "14.5px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>Towards Safer Cities</div>
                            </div>
                        </div>

                        {/* Bottom Tagline */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "14.5px",
                            fontWeight: "600",
                            color: "#64748b"
                        }}>
                            <span style={{ fontSize: "17px" }}>🌿</span>
                            <span>Cleaner Cities</span>
                            <span>|</span>
                            <span>Smarter Commutes</span>
                            <span>|</span>
                            <span>Brighter Tomorrows</span>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The High-Res Smart Highway Visual & Wave */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative"
                    }}>
                        <img
                            src="/hero-illustration.png"
                            alt="TrafficVision AI - Smarter Traffic for Safer Greener Cities"
                            style={{
                                width: "100%",
                                maxWidth: "660px",
                                height: "auto",
                                objectFit: "contain",
                                filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.06))",
                                transition: "transform 0.4s ease"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        />
                    </div>
                </div>
            </main>

            {/* ================= FEATURES SECTION ================= */}
            <section id="features" style={{
                background: "#ffffff",
                padding: "100px 36px",
                borderTop: "1px solid #e2e8f0"
            }}>
                <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 56px" }}>
                        <span style={{
                            color: "#059669",
                            fontSize: "14px",
                            fontWeight: "800",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase"
                        }}>
                            INTELLIGENT URBAN MOBILITY
                        </span>
                        <h2 style={{ fontSize: "40px", fontWeight: "800", color: "#0f172a", margin: "14px 0 12px 0" }}>
                            Core Capabilities of TrafficVision AI
                        </h2>
                        <p style={{ fontSize: "17.5px", color: "#64748b", lineHeight: "1.65" }}>
                            Explore how machine learning and real-time mapping work together to optimize transit networks.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "28px"
                    }}>
                        {/* Feature 1 */}
                        <div style={{
                            padding: "32px",
                            borderRadius: "20px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.25s"
                        }}>
                            <div style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                background: "#ecfdf5",
                                color: "#059669",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                marginBottom: "20px"
                            }}>
                                📊
                            </div>
                            <h3 style={{ fontSize: "21px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
                                Predictive Volume Modeling
                            </h3>
                            <p style={{ fontSize: "15.5px", color: "#64748b", lineHeight: "1.65" }}>
                                Trained on historical traffic records and weather parameters (rain, clouds, snow) using an optimized XGBoost engine.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div style={{
                            padding: "32px",
                            borderRadius: "20px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.25s"
                        }}>
                            <div style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                marginBottom: "20px"
                            }}>
                                🗺️
                            </div>
                            <h3 style={{ fontSize: "21px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
                                Multi-Corridor Leaflet Maps
                            </h3>
                            <p style={{ fontSize: "15.5px", color: "#64748b", lineHeight: "1.65" }}>
                                Live interactive routing comparing distances, transit durations, and speed variations across urban corridors.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div style={{
                            padding: "32px",
                            borderRadius: "20px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.25s"
                        }}>
                            <div style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                background: "#fef3c7",
                                color: "#d97706",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                marginBottom: "20px"
                            }}>
                                🚨
                            </div>
                            <h3 style={{ fontSize: "21px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
                                Accident Risk Advisories
                            </h3>
                            <p style={{ fontSize: "15.5px", color: "#64748b", lineHeight: "1.65" }}>
                                Automated warning triggers and email dispatches during severe weather conditions to safeguard commuters.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div style={{
                            padding: "32px",
                            borderRadius: "20px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.25s"
                        }}>
                            <div style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                background: "#f0fdf4",
                                color: "#16a34a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                marginBottom: "20px"
                            }}>
                                📄
                            </div>
                            <h3 style={{ fontSize: "21px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
                                Downloadable PDF Reports
                            </h3>
                            <p style={{ fontSize: "15.5px", color: "#64748b", lineHeight: "1.65" }}>
                                Instant 2-page executive traffic intelligence summaries with neat autoTable formatting and eco-driving guidance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FAQ SECTION ================= */}
            <section id="faq" style={{ padding: "90px 36px", background: "#f9fdfe" }}>
                <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "44px" }}>
                        <span style={{ color: "#059669", fontSize: "14px", fontWeight: "800", letterSpacing: "0.06em", textTransform: "uppercase" }}>FAQ</span>
                        <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", marginTop: "10px" }}>Frequently Asked Questions</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            {
                                q: "How does TrafficVision AI predict congestion levels?",
                                a: "Our system combines meteorological factors (rainfall, temperature, cloud cover) with calendar parameters (hour of day, weekday, holidays) in an XGBoost machine learning model trained on tens of thousands of historical journeys."
                            },
                            {
                                q: "Can I download and export traffic predictions?",
                                a: "Yes! Every route prediction generates an exportable, professional 2-page PDF report with detailed route parameters, driver advisories, and fuel-saving recommendations."
                            },
                            {
                                q: "How are accident risk alerts triggered?",
                                a: "When weather data indicates torrential rain, snow, or visibility drops below threshold levels alongside peak traffic volume, the system automatically surfaces high-risk alert banners and sends email notifications."
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "18px",
                                    border: "1px solid #e2e8f0",
                                    padding: "22px 28px",
                                    cursor: "pointer"
                                }}
                                onClick={() => toggleFaq(idx)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "700", color: "#0f172a", fontSize: "17.5px" }}>
                                    <span>{item.q}</span>
                                    <span style={{ color: "#059669", fontSize: "22px" }}>{faqOpen === idx ? "−" : "+"}</span>
                                </div>
                                {faqOpen === idx && (
                                    <p style={{ marginTop: "14px", color: "#475569", fontSize: "15.5px", lineHeight: "1.65" }}>
                                        {item.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer style={{
                background: "#0f172a",
                color: "#94a3b8",
                padding: "40px 36px",
                fontSize: "15px"
            }}>
                <div style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "18px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>🌿</span>
                        <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "16px" }}>TrafficVision AI</span>
                        <span>— Smarter Roads. Safer Tomorrows.</span>
                    </div>

                    <div>
                        © {new Date().getFullYear()} TrafficVision AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
