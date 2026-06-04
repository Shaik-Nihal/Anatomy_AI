import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "../../services/supabase";
import logo from "../../assets/logo.png";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Strong Password Validation
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {
      setError(
        "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character."
      );
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Wait a moment then redirect to login or if auto-login is enabled by Supabase, 
      // the AuthContext will catch the session and redirect automatically.
      // Usually, it requires email confirmation, so we show a success message.
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: "50vw",
          height: "50vw",
          background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="auth-card"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src={logo}
            alt="AR AnatomyAI Logo"
            className="auth-logo"
          />
        </motion.div>

        {/* Title */}
        <h1 className="auth-title">
          Create Account
        </h1>
        <p className="auth-subtitle">
          Start your futuristic anatomy learning experience
        </p>

        {error && (
          <div style={{ color: "#EF4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "10px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: "#10B981", backgroundColor: "rgba(16,185,129,0.1)", padding: "10px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center", border: "1px solid rgba(16,185,129,0.2)" }}>
            Registration successful! Please check your email to verify your account, or login if verification is not required.
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Name */}
          <input
            id="name"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            required
          />

          {/* Email */}
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />

          {/* Password */}
          <input
            id="password"
            type="password"
            placeholder="Strong Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(37,99,235,0.5)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "10px",
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>
        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "16px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: "#64748B", padding: "0 15px", fontSize: "14px" }}>or register with</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Google Login Button */}
        <motion.button
          whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          type="button"
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            fontSize: "15px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "background 0.2s ease",
          }}
        >
          <FcGoogle size={22} />
          Google
        </motion.button>

        {/* Login Link */}
        <p
          onClick={() => navigate("/login")}
          style={{
            color: "#94A3B8",
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Already have an account? <span style={{ color: "#38BDF8", fontWeight: "600" }}>Login</span>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
