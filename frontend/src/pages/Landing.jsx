import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [activeDot, setActiveDot] = useState(0);

    const handlePredictSubmit = (e) => {
        e.preventDefault();
        navigate("/prediction");
    };

    return (
        <div style={{
            background: "linear-gradient(135deg, #0b111e 0%, #10192a 50%, #0d1424 100%)",
            color: "#ffffff",
            minHeight: "100vh",
            fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflowX: "hidden",
            position: "relative"
        }}>
            <style>{`
                ::placeholder {
                    color: #94a3b8;
                    opacity: 1;
                    font-size: 13.5px;
                }
                .pill-input {
                    width: 100%;
                    max-width: 320px;
                    padding: 13px 22px;
                    border-radius: 50px;
                    border: none;
                    outline: none;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 14px;
                    font-family: inherit;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }
                .pill-input:focus {
                    box-shadow: 0 0 0 3px rgba(0, 132, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                .btn-send {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    background: linear-gradient(90deg, #0070f3 0%, #0099ff 100%);
                    color: #ffffff;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 13.5px;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    box-shadow: 0 4px 18px rgba(0, 112, 243, 0.45);
                    transition: all 0.25s ease;
                }
                .btn-send:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 24px rgba(0, 112, 243, 0.6);
                    background: linear-gradient(90deg, #0060d0 0%, #0088ee 100%);
                }
                .nav-item {
                    color: #cbd5e1;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    transition: color 0.2s ease;
                    padding: 6px 4px;
                }
                .nav-item:hover {
                    color: #ffffff;
                }
                @media (max-width: 980px) {
                    .hero-container {
                        grid-template-columns: 1fr !important;
                        gap: 50px !important;
                        padding-top: 110px !important;
                        text-align: center;
                    }
                    .hero-left {
                        align-items: center !important;
                        max-width: 100% !important;
                    }
                    .hero-left p {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .form-container {
                        align-items: center !important;
                        width: 100%;
                    }
                    .nav-links-wrap {
                        display: none !important;
                    }
                    .visual-wrapper {
                        max-width: 420px;
                        margin: 0 auto;
                    }
                }
            `}</style>

            {/* ================= NAVBAR ================= */}
            <header style={{
                padding: "26px 48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 20
            }}>
                {/* Brand Logo */}
                <Link to="/" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    textDecoration: "none"
                }}>
                    {/* Modern geometric logo mark matching reference */}
                    <div style={{
                        width: "36px",
                        height: "36px",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                            <rect x="2" y="2" width="14" height="14" rx="4" fill="#0084ff" />
                            <rect x="20" y="2" width="14" height="14" rx="4" fill="#ff4d4f" />
                            <rect x="2" y="20" width="14" height="14" rx="4" fill="#52c41a" />
                            <rect x="20" y="20" width="14" height="14" rx="4" fill="#faad14" />
                        </svg>
                    </div>
                    <span style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        letterSpacing: "0.04em",
                        color: "#ffffff",
                        textTransform: "uppercase"
                    }}>
                        TrafficVision
                    </span>
                </Link>

                {/* Nav Links */}
                <nav className="nav-links-wrap" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "36px"
                }}>
                    <a href="#home" className="nav-item">Home</a>
                    <a href="#services" className="nav-item">Services</a>
                    <a href="#about" className="nav-item">About</a>
                    <a href="#contact" className="nav-item">Contact</a>
                    <a href="#faq" className="nav-item">FAQ</a>

                    {/* Search / Action Icon */}
                    <Link
                        to="/login"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: "700",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            background: "rgba(255, 255, 255, 0.08)",
                            padding: "8px 18px",
                            borderRadius: "50px",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            transition: "all 0.2s"
                        }}
                    >
                        <span>Sign In</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </nav>
            </header>

            {/* ================= HERO SECTION ================= */}
            <main style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                padding: "0 48px",
                position: "relative",
                zIndex: 10
            }}>
                <div className="hero-container" style={{
                    maxWidth: "1320px",
                    width: "100%",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "1.05fr 1fr",
                    gap: "40px",
                    alignItems: "center",
                    padding: "40px 0 60px"
                }}>
                    {/* LEFT COLUMN: Typography + Pill Input Form */}
                    <div className="hero-left" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        maxWidth: "520px"
                    }}>
                        <h1 style={{
                            fontSize: "clamp(38px, 4.8vw, 54px)",
                            fontWeight: "800",
                            lineHeight: "1.15",
                            color: "#ffffff",
                            letterSpacing: "-0.02em",
                            margin: "0 0 16px 0"
                        }}>
                            Predict Traffic <br />
                            <span style={{ color: "#0084ff" }}>
                                with AI Precision
                            </span>
                        </h1>

                        <p style={{
                            fontSize: "14.5px",
                            lineHeight: "1.65",
                            color: "#94a3b8",
                            margin: "0 0 32px 0",
                            maxWidth: "440px"
                        }}>
                            Forecast real-time vehicle density, mitigate transit delays, and receive dynamic multi-corridor route advisories powered by machine learning.
                        </p>

                        {/* Two Pill Inputs + Send Button matching reference */}
                        <form onSubmit={handlePredictSubmit} className="form-container" style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            width: "100%",
                            marginBottom: "40px"
                        }}>
                            <input
                                type="text"
                                className="pill-input"
                                placeholder="Source (e.g. Gachibowli)"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                            />

                            <input
                                type="text"
                                className="pill-input"
                                placeholder="Destination (e.g. HITEC City)"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />

                            <div>
                                <button type="submit" className="btn-send">
                                    <span>Predict</span>
                                    <span style={{ fontSize: "11px" }}>►</span>
                                </button>
                            </div>
                        </form>

                        {/* Subtle Website URL on bottom left */}
                        <div style={{
                            fontSize: "12.5px",
                            color: "rgba(148, 163, 184, 0.7)",
                            letterSpacing: "0.04em",
                            fontWeight: "500"
                        }}>
                            www.trafficvision-ai.com
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Organic Fluid Wave Cutout + Photo Mask */}
                    <div className="visual-wrapper" style={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        {/* Container SVG / Shape Composition */}
                        <div style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: "580px",
                            height: "500px"
                        }}>
                            {/* SVG Layer: Vibrant Fluid Blue Wave + White Tracing Contour */}
                            <svg
                                viewBox="0 0 600 520"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    overflow: "visible",
                                    zIndex: 1
                                }}
                            >
                                <defs>
                                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0070f3" />
                                        <stop offset="100%" stopColor="#00a8ff" />
                                    </linearGradient>

                                    {/* Organic curved shape mask for the photo */}
                                    <clipPath id="curvedMask">
                                        <path d="M 170 30 
                                                 C 320 5, 480 30, 520 160 
                                                 C 550 260, 530 400, 430 460 
                                                 C 330 510, 160 500, 100 400 
                                                 C 50 310, 60 70, 170 30 Z" />
                                    </clipPath>
                                </defs>

                                {/* Background Electric Blue Fluid Wave */}
                                <path
                                    d="M 50 420 
                                       C 70 300, 190 310, 260 300 
                                       C 340 290, 420 160, 460 120 
                                       C 510 70, 580 90, 590 190 
                                       C 600 320, 560 480, 460 500 
                                       C 360 520, 140 540, 50 420 Z"
                                    fill="url(#waveGrad)"
                                />

                                {/* White Outline Curve Tracing gracefully alongside */}
                                <path
                                    d="M 20 440 
                                       C 70 280, 200 290, 280 270 
                                       C 370 250, 430 140, 470 90 
                                       C 520 40, 595 60, 605 180 
                                       C 615 320, 575 500, 450 515 
                                       C 340 530, 120 560, 20 440 Z"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    opacity="0.9"
                                />

                                {/* Organic Masked Image */}
                                <g clipPath="url(#curvedMask)">
                                    <image
                                        href="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop"
                                        x="40"
                                        y="0"
                                        width="520"
                                        height="520"
                                        preserveAspectRatio="xMidYMid slice"
                                    />
                                    {/* Soft atmospheric gradient over photo */}
                                    <rect
                                        x="0"
                                        y="0"
                                        width="600"
                                        height="520"
                                        fill="linear-gradient(180deg, rgba(16, 25, 42, 0) 60%, rgba(16, 25, 42, 0.4) 100%)"
                                    />
                                </g>
                            </svg>

                            {/* Carousel Indicator Dots (Matching reference) */}
                            <div style={{
                                position: "absolute",
                                bottom: "35px",
                                left: "48%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                zIndex: 10
                            }}>
                                <span
                                    onClick={() => setActiveDot(0)}
                                    style={{
                                        width: activeDot === 0 ? "24px" : "8px",
                                        height: "8px",
                                        borderRadius: "50px",
                                        background: activeDot === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                />
                                <span
                                    onClick={() => setActiveDot(1)}
                                    style={{
                                        width: activeDot === 1 ? "24px" : "8px",
                                        height: "8px",
                                        borderRadius: "50px",
                                        background: activeDot === 1 ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                />
                                <span
                                    onClick={() => setActiveDot(2)}
                                    style={{
                                        width: activeDot === 2 ? "24px" : "8px",
                                        height: "8px",
                                        borderRadius: "50px",
                                        background: activeDot === 2 ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Spacer */}
            <div style={{ height: "20px" }} />
        </div>
    );
}
