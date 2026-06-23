import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("Response OK:", response.ok);
      console.log(" Data:", data);
      console.log("Token from backend:", data.token);
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Token stored in localStorage:", localStorage.getItem("token"));
        console.log("User stored in localStorage:", localStorage.getItem("user"));
        alert("Login successful!");
        navigate("/");
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("An error occurred while logging in", error);
    }
  };
  return (
    <div className="login-page">
      <div className="glass-card">

        <div className="left-section">
          <h1>Every great journey has a return.</h1>

          <h2>
            Sign in to continue yours.
          </h2>
        </div>

        <div className="divider"></div>

        <div className="right-section">

          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className="forgot-password">
            Forgot password?
          </p>

          <button className="login-btn"
            onClick={handleLogin}>
            LOGIN
          </button>

          <div className="social-login">
            <span>Continue with</span>

            <button className="social-btn google-btn" aria-label="Sign in with Google">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2045C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
            </button>

            <span>or</span>

            <button className="social-btn apple-btn" aria-label="Sign in with Apple">
              <svg width="16" height="19" viewBox="0 0 16 19" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.7402 10.0332C12.7256 12.1162 14.3818 12.916 14.3965 12.9238C14.3818 12.9678 14.1299 13.876 13.4941 14.8281C12.9189 15.7012 12.3145 16.5684 11.293 16.583C10.2861 16.5977 9.94727 15.9648 8.7793 15.9648C7.61133 15.9648 7.22852 16.5684 6.2666 16.5977C5.27539 16.627 4.58398 15.6543 3.99414 14.7891C2.78516 12.9941 1.86523 9.62891 3.10352 7.38281C3.71582 6.26562 4.90234 5.55859 6.17676 5.54395C7.13867 5.5293 8.05664 6.20605 8.66211 6.20605C9.26758 6.20605 10.3906 5.38281 11.5576 5.5293C12.1094 5.55859 13.377 5.79297 14.1904 7.08984C14.1162 7.13379 12.7549 7.88086 12.7695 9.83398L12.7402 10.0332ZM10.4785 3.625C11.0293 2.95898 11.3965 2.01172 11.293 1.05078C10.4492 1.08789 9.39941 1.62891 8.83398 2.29492C8.32617 2.90234 7.875 3.87891 7.99316 4.80469C8.92578 4.875 9.92773 4.29102 10.4785 3.625Z" fill="white"/>
              </svg>
            </button>
          </div>

          <div className="signup-link">
            <p>Don't have an account?</p>
            <Link to="/signup">Create Account</Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;
