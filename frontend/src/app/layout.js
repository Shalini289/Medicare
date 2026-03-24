"use client";

import "./globals.css";

export default function RootLayout({ children }) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <html>
      <body>

        {/* 🔵 NAVBAR */}
        <div
          style={{
            background: "linear-gradient(135deg,#0072ff,#00c6ff)",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          {/* Logo */}
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>
            🩺 HealthCare AI
          </div>

          {/* Links */}
          <div>
            <a href="/" style={linkStyle}>Home</a>
            <a href="/dashboard" style={linkStyle}>Dashboard</a>
            <a href="/chatbot" style={linkStyle}>Chatbot</a>
            <a href="/admin" style={linkStyle}>Admin</a>
            <a href="/login" style={linkStyle}>Login</a>

            <button onClick={logout} style={logoutBtn}>
              Logout
            </button>
          </div>
        </div>

        {/* 🔥 PAGE CONTENT */}
        <div style={{ padding: "10px" }}>
          {children}
        </div>

        {/* 🤖 FLOATING CHAT BUTTON */}
        <a
          href="/chatbot"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "linear-gradient(135deg,#0072ff,#00c6ff)",
            color: "white",
            padding: "14px",
            borderRadius: "50%",
            fontSize: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            textDecoration: "none"
          }}
        >
          🤖
        </a>

      </body>
    </html>
  );
}

// 🎨 Styles
const linkStyle = {
  margin: "0 10px",
  color: "white",
  textDecoration: "none",
  fontWeight: "500"
};

const logoutBtn = {
  marginLeft: "10px",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  background: "#ff4d4d",
  color: "white",
  cursor: "pointer"
};