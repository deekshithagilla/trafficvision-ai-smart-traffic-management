import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";

function ResetPassword() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!token) {
            toast.error("This reset link is missing its token. Please request a new one.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/reset-password",
                {
                    token,
                    new_password: newPassword
                }
            );

            toast.success(response.data.message);
            navigate("/login");

        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Invalid or expired reset link."
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
                            Reset <span className="blue-text">Password</span>
                        </h2>

                        <p className="card-subtitle">
                            Choose a new secure password for your account.
                        </p>

                        {!token && (
                            <p style={{ color: "#dc2626", fontSize: "14px", textAlign: "center", marginBottom: "16px" }}>
                                This reset link is missing its token. Please request a new one from the Forgot Password page.
                            </p>
                        )}

                        {/* New Password */}
                        <div className="field-group">
                            <label className="field-label">New Password</label>
                            <div className="field-input-box">
                                <span className="field-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className="field-input"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") submit();
                                    }}
                                />
                                <button
                                    type="button"
                                    className="field-toggle-btn"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    title={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="field-group">
                            <label className="field-label">Confirm Password</label>
                            <div className="field-input-box">
                                <span className="field-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="field-input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") submit();
                                    }}
                                />
                                <button
                                    type="button"
                                    className="field-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Reset Password Button */}
                        <button
                            className="btn-blue-action"
                            onClick={submit}
                            disabled={loading || !token}
                            style={{ marginTop: "12px" }}
                        >
                            <span>{loading ? "Resetting..." : "Reset Password"}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>

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

export default ResetPassword;
