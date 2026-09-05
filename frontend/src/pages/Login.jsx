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
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const login = async () => {
        setLoading(true);

        try {
            const formData = new URLSearchParams({
                username: email,
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
        <div className="split-login-container">

            <div className="split-login-card">

                {/* SVG Convex Separation Layer */}
                <svg className="split-curve-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
                    <path d="M 0,0 L 175,0 Q 610,240 550,600 L 0,600 Z" fill="#ffffff" />
                    <path d="M 175,0 Q 610,240 550,600" fill="none" stroke="#cbd5e1" strokeWidth="6" />
                </svg>

                {/* LEFT: Brand Showcase matching reference */}
                <div className="split-brand-panel">

                    <Link to="/" className="split-back-home">
                        ← Back to Home
                    </Link>

                    <div className="brand-visual-box">

                        <div className="brand-logo-circle">
                            <img
                                src="/trafficvision-logo.png"
                                alt="TrafficVision AI"
                            />
                        </div>

                        <div className="brand-title-row">
                            <span className="brand-title-dark">TRAFFIC</span>
                            <span className="brand-title-cyan">VISION</span>
                        </div>

                        <div className="brand-underline-row">
                            <div className="brand-underline-line"></div>
                            <span className="brand-underline-tag">AI Data</span>
                        </div>

                        <p className="brand-slogan">
                            Smarter Roads. Safer Tomorrows.
                        </p>

                    </div>

                </div>

                {/* RIGHT: Navy Form Area matching reference */}
                <div className="split-form-panel">

                    {/* Username / Email */}
                    <div className="form-group-custom">

                        <label className="form-label-white">
                            Username
                        </label>

                        <div className="input-pill-container">

                            <div className="input-pill-icon-badge">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0284c7">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>

                            <input
                                type="email"
                                className="input-pill-field"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") login();
                                }}
                            />

                        </div>

                    </div>

                    {/* Password */}
                    <div className="form-group-custom">

                        <label className="form-label-white">
                            Password
                        </label>

                        <div className="input-pill-container">

                            <div className="input-pill-icon-badge">
                                <svg width="19" height="19" viewBox="0 0 24 24" fill="#0284c7">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                </svg>
                            </div>

                            <input
                                type="password"
                                className="input-pill-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") login();
                                }}
                            />

                        </div>

                    </div>

                    {/* Remember Me */}
                    <label className="remember-me-row">
                        <input
                            type="checkbox"
                            className="remember-me-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember Me</span>
                    </label>

                    {/* Login Button */}
                    <button
                        className="btn-pill-login"
                        onClick={login}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {/* Forgot Password */}
                    <Link to="/forgot-password" className="forgot-password-link">
                        Forgot Password?
                    </Link>

                    {/* Google Login */}
                    <div className="google-auth-split">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => {
                                toast.error("Google login failed");
                            }}
                            shape="pill"
                        />
                    </div>

                    {/* Bottom Pill Actions matching mockup */}
                    <div className="bottom-pill-row">
                        <Link to="/" className="btn-bottom-pill">
                            ← Back to Home
                        </Link>
                        <Link to="/register" className="btn-bottom-pill">
                            Create Account
                        </Link>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;