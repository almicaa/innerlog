import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import CreatePost from "./pages/CreatePost";

function App() {
  return (
    <Router>
      <div style={{
        backgroundColor: "#121212",
        color: "#f0f0f0",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        {/* Global Navigation */}
        <nav style={{
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #333",
          backgroundColor: "#181818",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}>
          <Link to="/" style={{ textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", backgroundColor: "#1DB954", borderRadius: "50%" }}></div>
            <span style={{ fontWeight: "bold", fontSize: "1.3rem", letterSpacing: "-0.5px" }}>InnerLog</span>
          </Link>
          <div style={{ display: "flex", gap: "2rem" }}>
            <Link to="/" style={navLinkStyle}>Home</Link>
            <Link to="/write" style={navLinkStyle}>New Entry</Link>
            <Link to="/archive" style={navLinkStyle}>Archive</Link>
          </div>
        </nav>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: "2rem" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/write" element={<CreatePost />} />
            <Route path="/archive" element={<Archive />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ 
          padding: "2rem", 
          textAlign: "center", 
          borderTop: "1px solid #333", 
          color: "#777",
          fontSize: "0.9rem"
        }}>
          Created by <span style={{ color: "#aaa", fontWeight: "bold" }}>Palmica</span> 
          <img src="/palmica.png" alt="" style={{ 
            width: "25px", 
            height: "25px",
            borderRadius: "50%", 
            marginLeft: "8px",
            verticalAlign: "middle",
            border: "1px solid #444"
          }} />
        </footer>
      </div>
    </Router>
  );
}

const navLinkStyle = {
  color: "#aaa",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "1rem",
  transition: "color 0.3s ease",
};

export default App;