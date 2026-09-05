import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "../styles/auth.css";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const login = async () => {
        if (!email.trim() || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setLoading(true);

        try {
            const formData = new URLSearchParams({
                username: email.trim(),
                password: password
            });

            const response = await api.post(
                "/auth/login",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            toast.success("Welcome back!");

            navigate("/dashboard");

        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    // Google Login
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await api.post(
                "/auth/google",
                {
                    credential: credentialResponse.credential
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            toast.success("Google login successful!");

            navigate("/dashboard");

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Google login failed"
            );
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

                {/* RIGHT COLUMN: FLOATING LOGIN CARD */}
                <div className="hero-login-card-wrap">

                    <div className="hero-floating-card">

                        <div className="card-top-icon">
                            🚦
                        </div>

                        <h2 className="card-title">
                            TrafficVision <span className="blue-text">AI</span>
                        </h2>

                        <p className="card-subtitle">
                            Smart Traffic Prediction System
                        </p>

                        {/* Email Field with Mail Icon */}
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
                                        if (e.key === "Enter") login();
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field with Lock Icon and Eye Toggle */}
                        <div className="field-group">
                            <label className="field-label">Password</label>
                            <div className="field-input-box">
                                <span className="field-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="field-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") login();
                                    }}
                                />
                                <button
                                    type="button"
                                    className="field-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
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

                        {/* Forgot Password Link */}
                        <div className="forgot-pass-row">
                            <Link to="/forgot-password" className="forgot-pass-link">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Login Button with Arrow */}
                        <button
                            className="btn-blue-action"
                            onClick={login}
                            disabled={loading}
                        >
                            <span>{loading ? "Logging in..." : "Login"}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>

                        {/* OR Divider */}
                        <div className="google-divider">
                            <span>OR</span>
                        </div>

                        {/* Google Login Component */}
                        <div className="google-login">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                    toast.error("Google login failed");
                                }}
                            />
                        </div>

                        {/* Register Link */}
                        <div className="card-bottom-link">
                            Don't have an account?{" "}
                            <Link to="/register">
                                Create Account
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

export default Login;