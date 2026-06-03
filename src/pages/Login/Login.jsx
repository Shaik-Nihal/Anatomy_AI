import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const email =
      document.getElementById("loginEmail").value;

    const password =
      document.getElementById("loginPassword").value;

    const savedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (
      savedUser &&
      email === savedUser.email &&
      password === savedUser.password
    ) {
      localStorage.setItem("isLoggedIn", "true");
      alert("Login Successful!");

      navigate("/dashboard");
    } else {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background:
          "linear-gradient(to bottom right, #020617, #0F172A, #111827)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(6,182,212,0.12)",
          borderRadius: "50%",
          filter: "blur(120px)",
        }}
      />

      {/* Login Card */}
      <div
        style={{
          width: "430px",
          padding: "40px",
          borderRadius: "25px",
          background: "rgba(30,41,59,0.45)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 30px rgba(6,182,212,0.15)",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src={logo}
            alt="AR AnatomyAI Logo"
            style={{
              width: "180px",
              height: "180px",
              objectFit: "contain",
              filter:
                "drop-shadow(0 0 25px rgba(6,182,212,0.5))",
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#F8FAFC",
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "36px",
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            color: "#94A3B8",
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          Login to continue your anatomy journey
        </p>

        {/* Email */}
        <input
          id="loginEmail"
          type="email"
          placeholder="Enter Email"
          defaultValue="pantajaajithareddy18@gmail.com"
          style={inputStyle}
        />

        {/* Password */}
        <input
          id="loginPassword"
          type="password"
          placeholder="Enter Password"
          defaultValue="Jaaji$18"
          style={inputStyle}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "20px",
            border: "none",
            borderRadius: "14px",
            background:
              "linear-gradient(to right, #06B6D4, #2563EB)",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(6,182,212,0.4)",
          }}
        >
          Login
        </button>

        {/* Register Link */}
        <p
          onClick={() => navigate("/register")}
          style={{
            color: "#CBD5E1",
            textAlign: "center",
            marginTop: "25px",
            cursor: "pointer",
          }}
        >
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "18px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none",
  fontSize: "16px",
  boxSizing: "border-box",
};

export default Login;