import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "./signup.css";

const API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/admin/login";

function LoginButton() {
  const [email, setEmail] = useState(""); // Changed 'username' to 'email'
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(null); // State for errors
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // Send 'email' instead of 'username'
          password,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Read plain text response
        throw new Error(errorText || "Unknown error occurred");
      }
  
      const data = await response.json(); // Parse JSON response
      console.log("Login Successful:", data);
  
      // Store the token if necessary (e.g., in localStorage)
      localStorage.setItem("token", data.token);
  
      // Navigate to the dashboard
      navigate("/dash");
    } catch (err) {
      console.error("Error:", err.message); // Log plain text error
      setError(err.message); // Display error to the user
    }
  };
  

  return (
    <div className="login-content">
      <div className="wrapper">
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="email" // Change to 'email' input type for better validation
              placeholder="Email"
              value={email} // Use 'email' state instead of 'username'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaUser />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock />
          </div>
          <div className="forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="login" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginButton;
