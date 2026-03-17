import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setStatus("Processing your thoughts...");

    try {
      await axios.post("http://127.0.0.1:8000/posts", { title, content });
      setTitle("");
      setContent("");
      setStatus("Entry published! Redirecting...");
      
      // Automatsko prebacivanje na Arhivu nakon 1.5 sekunde
      setTimeout(() => {
        navigate("/archive");
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setStatus("Failed to publish entry. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>New Mindset Entry</h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Title of your reflection"
          style={inputStyle} 
        />
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="What's flowing through your mind right now?" 
          rows={8}
          style={inputStyle} 
        />
        <button 
          type="submit" 
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#17a84b")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1DB954")}
        >
          Publish Entry
        </button>
      </form>

      {status && (
        <p style={{ 
          color: status.includes("Failed") ? "#ff4d4d" : "#1DB954", 
          marginTop: "1.5rem",
          fontWeight: "500",
          textAlign: "center"
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "1rem",
  borderRadius: "10px",
  border: "1px solid #333",
  backgroundColor: "#1e1e1e",
  color: "#f0f0f0",
  fontSize: "1rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};

const buttonStyle: React.CSSProperties = {
  padding: "1rem",
  backgroundColor: "#1DB954",
  color: "#121212",
  border: "none",
  borderRadius: "30px", 
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1.1rem",
  transition: "background-color 0.3s ease"
};