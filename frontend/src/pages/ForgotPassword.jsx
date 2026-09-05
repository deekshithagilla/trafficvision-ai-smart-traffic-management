import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submit = async () => {

        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/forgot-password",
                { email }
            );

            toast.success(response.data.message);

            // The backend never reveals whether the email exists, so the
            // success UI is shown the same way regardless.
            setSubmitted(true);

        } catch (error) {

            toast.error(
                error.response?.data?.detail ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="hero-login-screen">

            {/* TOP BAR */}
            <header className="hero-login-topbar">
                <Link to="/" className="hero-brand-logo-link">
                    <span style={{ fontSize: "36px" }}>🚦</span>
                    <span>
                        TrafficVision <span className="brand-ai">AI</span>
                    </span>
                </Link>

                <div className="hero-top-tagline">
                    Smarter Roads. Safer Tomorrows.
                </div>
            </header>

            {/* MAIN SPLIT CONTENT */}
            <main className="hero-login-main">

                {/* LEFT HERO COLUMN */}
                <div className="hero-left-col">

                    {/* Eyebrow Pill */}
                    <div className="hero-eyebrow-pill">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        <span>AI-Powered Traffic Prediction & Urban Intelligence</span>
                    </div>

                    {/* Grand Title */}
                    <h1 className="hero-grand-title">
                        Smarter Traffic
                        <span className="blue-text">for Brighter Cities</span>
                    </h1>

                    {/* Description */}
                    <p className="hero-description">
                        TrafficVision AI harnesses advanced predictive machine learning, real-time meteorological signals, and urban traffic monitoring to forecast delays, eliminate bottlenecks, and ensure safer journeys for modern cities.
                    </p>

                    {/* 4 Feature Cards (2x2 Grid) */}
                    <div className="hero-features-grid">

                        <div className="hero-feature-card">
                            <div className="hero-card-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                                📊
                            </div>
                            <div>
                                <h4>Real-Time Insights</h4>
                                <p>Live volume & peak congestion tracking across urban routes</p>
                            </div>
                        </div>

                        <div className="hero-feature-card">
                            <div className="hero-card-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                🛡️
                            </div>
                            <div>
                                <h4>Safer Roads</h4>
                                <p>Automated hazard warning triggers & severe weather advisories</p>
                            </div>
                        </div>

                        <div className="hero-feature-card">
                            <div className="hero-card-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                                ⚡
                            </div>
                            <div>
                                <h4>Smart Predictions</h4>
                                <p>XGBoost ML modeling for precision delay & duration forecasts</p>
                            </div>
                        </div>

                        <div className="hero-feature-card">
                            <div className="hero-card-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                                🍃
                            </div>
                            <div>
                                <h4>Greener Tomorrow</h4>
                                <p>Eco-optimized routes reducing fuel consumption & emissions</p>
                            </div>
                        </div>

                    </div>

                    {/* Stats Impact Bar */}
                    <div className="hero-stats-row">
                        <div className="stat-col">
                            <div className="stat-num">30%</div>
                            <div className="stat-lbl">Reduced Delay</div>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-col">
                            <div className="stat-num">15+</div>
                            <div className="stat-lbl">City Corridors</div>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-col">
                            <div className="stat-num">100%</div>
                            <div className="stat-lbl">Safety Driven</div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: FLOATING CARD */}
                <div className="hero-login-card-wrap">

                    <div className="hero-floating-card">

                        <div className="card-top-icon">
                            🚦
                        </div>

                        <h2 className="card-title">
                            Forgot <span className="blue-text">Password</span>
                        </h2>

                        <p className="card-subtitle">
                            {submitted
                                ? "Check your inbox for the reset link."
                                : "Enter your email and we'll send you a reset link."}
                        </p>

                        {!submitted ? (
                            <>
                                {/* Email Field */}
                                <div className="field-group">
                                    <label className="field-label">Email</label>
                                    <div className="field-input-box">
                                        <span className="field-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            className="field-input"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") submit();
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Send Reset Link Button */}
                                <button
                                    className="btn-blue-action"
                                    onClick={submit}
                                    disabled={loading}
                                    style={{ marginTop: "12px" }}
                                >
                                    <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
                                <div style={{ fontSize: "42px", marginBottom: "12px" }}>📬</div>
                                <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>
                                    We have dispatched a secure password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                                </p>
                            </div>
                        )}

                        {/* Back to Login Link */}
                        <div className="card-bottom-link" style={{ marginTop: "24px" }}>
                            <Link to="/login">
                                ← Back to Login
                            </Link>
                        </div>

                    </div>

                </div>

            </main>

            {/* BOTTOM FOOTER BAR */}
            <footer className="hero-login-footer">
                <div>
                    Built for Safer, Smarter and Sustainable Cities 🍃
                </div>
            </footer>

        </div>
    );
}

export default ForgotPassword;
    