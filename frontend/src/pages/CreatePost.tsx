import API_URL from "../api";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setStatus("Processing...");
    try {
      await axios.post("${API_URL}/posts", {
        title,
        content,
        is_private: isPrivate,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle("");
      setContent("");
      setStatus("Saved!");
      setTimeout(() => navigate("/archive"), 1000);
    } catch {
      setStatus("Error. Are you logged in?");
    }
  };

  return (
    <div className="max-w-[600px] mx-auto mt-8 px-6">
      <h2 className="text-2xl font-bold mb-6">New Entry</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="px-4 py-4 rounded-[10px] border border-[#333] bg-[#1e1e1e] text-white outline-none focus:border-[#1DB954] transition-colors"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write..."
          rows={8}
          className="px-4 py-4 rounded-[10px] border border-[#333] bg-[#1e1e1e] text-white outline-none focus:border-[#1DB954] transition-colors resize-none"
        />
        <label className="flex items-center gap-3 text-[#aaa] cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={e => setIsPrivate(e.target.checked)}
            className="accent-[#1DB954] w-4 h-4"
          />
          Private entry
        </label>
        <button
          type="submit"
          className="py-4 bg-[#1DB954] text-[#121212] font-bold rounded-full hover:opacity-85 transition-opacity"
        >
          Save
        </button>
      </form>
      {status && <p className="mt-4 text-[#aaa] text-sm">{status}</p>}
    </div>
  );
}