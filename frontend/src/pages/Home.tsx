import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "10vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2rem"
    }}>
      <div>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
          Your space for <span style={{ color: "#1DB954" }}>reflection</span>.
        </h1>
        <p style={{ color: "#aaa", maxWidth: "600px", fontSize: "1.2rem", lineHeight: "1.6" }}>
          InnerLog helps you track and organize your thoughts. Capture how you feel, 
          and let our AI provide deep philosophical and psychological insights into your daily life.
        </p>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/write" style={primaryButtonStyle}>Start Writing</Link>
        <Link to="/archive" style={secondaryButtonStyle}>Explore Archive</Link>
      </div>

      <div style={{ marginTop: "4rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", maxWidth: "900px" }}>
        <div style={featureStyle}>
          <h3 style={{ color: "#1DB954" }}>Private</h3>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>Your thoughts are secure and stored locally in your database.</p>
        </div>
        <div style={featureStyle}>
          <h3 style={{ color: "#1DB954" }}>Smart</h3>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>Powered by Gemini AI to analyze your tone and provide guidance.</p>
        </div>
        <div style={featureStyle}>
          <h3 style={{ color: "#1DB954" }}>Minimal</h3>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>Zero distractions. A clean interface focused entirely on your mind.</p>
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  padding: "0.8rem 2rem",
  backgroundColor: "#1DB954",
  color: "#121212",
  textDecoration: "none",
  borderRadius: "30px",
  fontWeight: "bold",
  fontSize: "1.1rem",
  transition: "0.3s"
};

const secondaryButtonStyle = {
  padding: "0.8rem 2rem",
  border: "1px solid #333",
  color: "#f0f0f0",
  textDecoration: "none",
  borderRadius: "30px",
  fontWeight: "bold",
  fontSize: "1.1rem",
  transition: "0.3s"
};

const featureStyle = {
  padding: "1.5rem",
  backgroundColor: "#181818",
  borderRadius: "15px",
  border: "1px solid #222"
};