import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/signup.css";

function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [retypedPassword, setRetypedPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignup() {
        setError("");

        if (password !== retypedPassword) {
            setError("Passwords don't match!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                return;
            }

            navigate("/login", { state: { signupSuccess: true } });
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signup-page">
            <div className="glass-card">
                <div className="left-section">
                    <h1>Every great journey starts with a single step.</h1>
                    <h2>Create your account and begin yours.</h2>
                </div>
                <div className="divider"></div>
                <div className="right-section">
                    <input type="text" placeholder="NAME" value={name} onChange={(e) => setName(e.target.value)} />

                    <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input type="password" placeholder="RETYPE PASSWORD" value={retypedPassword} onChange={(e) => setRetypedPassword(e.target.value)} />

                    {error && <p className="signup-error">{error}</p>}

                    <button className="signup-btn" onClick={handleSignup} disabled={loading}>
                        {loading ? "Signing up..." : "SIGN UP"}
                    </button>
                    <p className="login-link">
                        Already have an account? <Link to="/login">LOGIN</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Signup;