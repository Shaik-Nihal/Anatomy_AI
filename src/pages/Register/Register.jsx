import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

function Register() {
  const navigate = useNavigate();

  const handleRegister = () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password =
      document.getElementById("password").value;

    // Strong Password Validation
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!strongPassword.test(password)) {
      alert(
        "Password must contain:\n• 8+ characters\n• Uppercase letter\n• Lowercase letter\n• Number\n• Special character"
      );
      return;
    }

    const user = {
      name,
      email,
      password,
    };

    localStorage.setItem("user", JSON.stringify(user));

    alert("Registration Successful!");

    navigate("/login");
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
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(37,99,235,0.15)",
          borderRadius: "50%",
          filter: "blur(120px)",
        }}
      />

      {/* Register Card */}
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
          Create Account
        </h1>

        <p
          style={{
            color: "#94A3B8",
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          Start your futuristic anatomy learning experience
        </p>

        {/* Name */}
        <input
          id="name"
          type="text"
          placeholder="Full Name"
          style={inputStyle}
        />

        {/* Email */}
        <input
          id="email"
          type="email"
          placeholder="Email Address"
          defaultValue="pantajaajithareddy18@gmail.com"
          style={inputStyle}
        />

        {/* Password */}
        <input
          id="password"
          type="password"
          placeholder="Strong Password"
          defaultValue="Jaaji$18"
          style={inputStyle}
        />

        {/* Register Button */}
        <button
          onClick={handleRegister}
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
          Register
        </button>

        {/* Login Link */}
        <p
          onClick={() => navigate("/login")}
          style={{
            color: "#CBD5E1",
            textAlign: "center",
            marginTop: "25px",
            cursor: "pointer",
          }}
        >
          Already have an account? Login
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

export default Register;