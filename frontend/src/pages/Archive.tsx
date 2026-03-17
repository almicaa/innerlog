import { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  content: string;
  ai_reflection?: string;
  mood?: string;
}

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Auto-refresh every 3 seconds to catch the AI updates
    const interval = setInterval(fetchPosts, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper to assign colors based on mood
  const getMoodColor = (mood?: string) => {
    const m = mood?.toLowerCase() || "";
    if (m.includes("joyful")) return "#FFD700";
    if (m.includes("anxious") || m.includes("angry")) return "#FF6B6B";
    if (m.includes("calm")) return "#1DB954";
    if (m.includes("sad")) return "#4D96FF";
    if (m.includes("inspired")) return "#B197FC";
    if (m.includes("philosophical") || m.includes("contemplative")) return "#888";
    return "#333"; // Default
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "2rem", fontSize: "2.2rem" }}>Thought Archive</h2>
      
      {posts.length === 0 && (
        <p style={{ color: "#666", textAlign: "center", marginTop: "2rem" }}>
          No entries found. Start by capturing your first mindset!
        </p>
      )}

      {posts.map(post => (
        <div key={post.id} style={{
          ...cardStyle,
          borderLeft: `6px solid ${getMoodColor(post.mood)}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{post.title}</h3>
            {post.mood && (
              <span style={{
                backgroundColor: getMoodColor(post.mood),
                color: "#121212",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.7rem",
                fontWeight: "bold",
                textTransform: "uppercase"
              }}>
                {post.mood}
              </span>
            )}
          </div>
          
          <p style={{ color: "#ccc", lineHeight: "1.6", marginTop: "1rem" }}>{post.content}</p>
          
          {post.ai_reflection && (
            <div style={aiBoxStyle}>
              <small style={{ 
                display: "block", 
                color: "#1DB954", 
                fontWeight: "bold", 
                marginBottom: "5px",
                fontSize: "0.7rem"
              }}>
                AI REFLECTION
              </small>
              <div style={{ fontStyle: "italic" }}>{post.ai_reflection}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#1e1e1e",
  padding: "1.5rem",
  borderRadius: "12px",
  marginBottom: "1.5rem",
  border: "1px solid #333",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
};

const aiBoxStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  padding: "1rem",
  backgroundColor: "#121212",
  borderLeft: "4px solid #1DB954",
  color: "#00ff99",
  fontSize: "0.95rem",
  borderRadius: "4px"
};