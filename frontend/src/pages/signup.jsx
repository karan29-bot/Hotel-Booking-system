import { Link } from "react-router-dom";
import "./styles/signup.css";

function Signup() {
    return (
        <div className="signup-page">
            <div className="glass-card">
                <div className="left-section">
                    <h1>Every great journey starts with a single step.</h1>
                    <h2>Create your account and begin yours.</h2>
                </div>
                <div className="divider"></div>
                <div className="right-section">
                    <input type="text" placeholder="NAME" />
                    <input type="email" placeholder="EMAIL ADDRESS" />
                    <input type="password" placeholder="PASSWORD" />
                    <input type="password" placeholder="RETYPE PASSWORD" />
                    <button className="signup-btn">SIGN UP</button>
                    <p className="login-link">
                        Already have an account? <Link to="/login">LOGIN</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Signup;
