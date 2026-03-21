import API_URL from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);
      const res = await axios.post(`${API_URL}/auth/login`, form);
      login(res.data.token);
      navigate("/write");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[400px] mx-auto mt-16 px-6">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-[#1DB954] rounded-full mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Admin Login</h2>
        <p className="text-[#888] text-sm mt-1">Only you can write here.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="px-4 py-4 rounded-[10px] border border-[#333] bg-[#1e1e1e] text-white outline-none focus:border-[#1DB954] transition-colors"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="px-4 py-4 rounded-[10px] border border-[#333] bg-[#1e1e1e] text-white outline-none focus:border-[#1DB954] transition-colors"
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="py-4 bg-[#1DB954] text-[#121212] font-bold rounded-full hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}