import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/logo.webp";

const c = {
  primary: "#2563eb",
  border: "#e3e9f4",
  text: "#0f172a",
  muted: "#64748b",
  danger: "#dc2626",
  dangerSoft: "#fdecec",
};
const font = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";

const paths = {
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};

const Icon = ({ name, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
    dangerouslySetInnerHTML={{ __html: paths[name] }}
  />
);

const inputStyle = {
  width: "100%",
  padding: "12px 14px 12px 42px",
  border: `1px solid ${c.border}`,
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  fontFamily: font,
  color: c.text,
  background: "#fff",
  boxSizing: "border-box",
};

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexWrap: "wrap",
        fontFamily: font,
        background: "#fff",
      }}
    >
      {/* left blue panel */}
      <div
        style={{
          flex: "1 1 420px",
          background:
            "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{ width: 140, height: 140, objectFit: "contain" }}
          />
        </div>
        <h1 style={{ margin: "28px 0 8px", fontSize: 30, lineHeight: 1.25 }}>
          Shri Rajkot Lohana Boarding House
        </h1>
        <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>
          Attendance Management System
        </p>
        <div
          style={{
            marginTop: 22,
            padding: "6px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          SERVING SINCE 1896
        </div>
      </div>

      {/* right form panel */}
      <div
        style={{
          flex: "1 1 420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          boxSizing: "border-box",
        }}
      >
        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 380 }}>
          <h2 style={{ margin: 0, fontSize: 28, color: c.text }}>
            Welcome back
          </h2>
          <p style={{ margin: "8px 0 28px", color: c.muted, fontSize: 14 }}>
            Sign in to continue to your dashboard
          </p>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: c.text,
              display: "block",
              marginBottom: 6,
            }}
          >
            Username
          </label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: 13,
                color: c.muted,
              }}
            >
              <Icon name="user" />
            </span>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: c.text,
              display: "block",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: 13,
                color: c.muted,
              }}
            >
              <Icon name="lock" />
            </span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                background: c.dangerSoft,
                color: c.danger,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 18px",
              border: "none",
              borderRadius: 10,
              background: c.primary,
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: font,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
