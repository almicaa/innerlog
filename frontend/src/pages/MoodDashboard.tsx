import API_URL from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";

interface MoodEntry {
  id: number;
  title: string;
  mood_score: number;
  mood_label: string;
  created_at: string;
}

const moodEmoji: { [key: string]: string } = {
  distressed: "😰", sad: "😢", anxious: "😟", melancholic: "😔",
  neutral: "😐", reflective: "🤔", calm: "😌", hopeful: "🌱",
  happy: "😊", joyful: "✨"
};

const moodColor: { [key: string]: string } = {
  distressed: "#ef4444", sad: "#f97316", anxious: "#eab308",
  melancholic: "#a855f7", neutral: "#6b7280", reflective: "#3b82f6",
  calm: "#06b6d4", hopeful: "#84cc16", happy: "#1DB954", joyful: "#1DB954"
};

export default function MoodDashboard() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get("${API_URL}/mood/history", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setEntries(res.data);
    }).finally(() => setLoading(false));
  }, [token]);

  const avg = entries.length
    ? (entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length).toFixed(1)
    : null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("hr-HR", {
    day: "numeric", month: "short"
  });

  const maxScore = 10;
  const chartHeight = 120;

  if (loading) return (
    <div className="flex items-center justify-center mt-32 text-[#555]">Loading...</div>
  );

  return (
    <div className="max-w-[800px] mx-auto px-6 mt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mood Dashboard</h1>
        <p className="text-[#555] text-sm">Your emotional journey through writing.</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-[#555]">
          <p className="text-4xl mb-4">📊</p>
          <p>No mood data yet. Write some posts first!</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1e1e1e] border border-[#222] rounded-[12px] p-4 text-center">
              <p className="text-3xl font-bold text-[#1DB954]">{avg}</p>
              <p className="text-xs text-[#555] mt-1">Average mood</p>
            </div>
            <div className="bg-[#1e1e1e] border border-[#222] rounded-[12px] p-4 text-center">
              <p className="text-3xl font-bold text-[#1DB954]">{entries.length}</p>
              <p className="text-xs text-[#555] mt-1">Posts tracked</p>
            </div>
            <div className="bg-[#1e1e1e] border border-[#222] rounded-[12px] p-4 text-center">
              <p className="text-3xl">
                {moodEmoji[entries[entries.length - 1]?.mood_label] || "😐"}
              </p>
              <p className="text-xs text-[#555] mt-1">Latest mood</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#1e1e1e] border border-[#222] rounded-[12px] p-6 mb-8">
            <p className="text-sm text-[#555] mb-4">Mood over time</p>
            <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ minHeight: chartHeight + 40 }}>
              {entries.map((entry, i) => {
                const barH = (entry.mood_score / maxScore) * chartHeight;
                const color = moodColor[entry.mood_label] || "#1DB954";
                return (
                  <div key={entry.id} className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: 48 }}>
                    <span className="text-xs text-[#555]">{entry.mood_score}</span>
                    <div
                      className="w-8 rounded-t-[4px] transition-all duration-500"
                      style={{ height: barH, backgroundColor: color, opacity: 0.85 }}
                      title={`${entry.title}: ${entry.mood_label} (${entry.mood_score})`}
                    />
                    <span className="text-[10px] text-[#555] text-center leading-tight" style={{ maxWidth: 48 }}>
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Entry list */}
          <div className="flex flex-col gap-3">
            {[...entries].reverse().map(entry => (
              <div
                key={entry.id}
                onClick={() => navigate(`/post/${entry.id}`)}
                className="flex items-center gap-4 bg-[#1e1e1e] border border-[#222] rounded-[10px] px-4 py-3 cursor-pointer hover:border-[#333] transition-colors"
              >
                <span className="text-2xl">{moodEmoji[entry.mood_label] || "😐"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.title}</p>
                  <p className="text-xs text-[#555] capitalize">{entry.mood_label} · {formatDate(entry.created_at)}</p>
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: moodColor[entry.mood_label] || "#1DB954" }}
                >
                  {entry.mood_score}/10
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}