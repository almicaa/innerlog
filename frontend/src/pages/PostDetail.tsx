import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../App";

interface Post {
  id: number;
  title: string;
  content?: string;
  ai_reflection?: string;
  is_private: boolean;
  created_at?: string;
  likes: number;
  dislikes: number;
  comment_count: number;
  mood_score?: number;
  mood_label?: string;
}

interface Comment {
  id: number;
  post_id: number;
  nickname: string;
  content: string;
  created_at: string;
  ai_verdict?: string;
  ai_verdict_score?: number;
}

const moodEmoji: { [key: string]: string } = {
  distressed: "😰", sad: "😢", anxious: "😟", melancholic: "😔",
  neutral: "😐", reflective: "🤔", calm: "😌", hopeful: "🌱",
  happy: "😊", joyful: "✨"
};

const verdictColor: { [key: string]: string } = {
  insightful: "text-[#1DB954] border-[#1DB954]",
  valid: "text-blue-400 border-blue-400",
  neutral: "text-[#888] border-[#444]",
  "off-topic": "text-yellow-500 border-yellow-500",
  superficial: "text-orange-400 border-orange-400",
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/posts/${id}`);
      setPost(res.data);
    } catch {
      navigate("/archive");
    }
  };

  const fetchComments = async () => {
    const res = await axios.get(`http://127.0.0.1:8000/posts/${id}/comments`);
    setComments(res.data);
  };

  const fetchMyReaction = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/posts/${id}/my-reaction`);
      setMyReaction(res.data.reaction);
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments(), fetchMyReaction()])
      .finally(() => setLoading(false));
  }, [id]);

  const handleReact = async (reaction: string) => {
    await axios.post(`http://127.0.0.1:8000/posts/${id}/react`, { reaction });
    fetchPost();
    fetchMyReaction();
  };

  const handleComment = async () => {
    if (!commentText.trim() || !nickname.trim()) return;
    await axios.post(`http://127.0.0.1:8000/posts/${id}/comments`, {
      nickname: nickname.trim(),
      content: commentText.trim(),
    });
    setCommentText("");
    fetchComments();
    fetchPost();
  };

  const handleDeleteComment = async (commentId: number) => {
    await axios.delete(`http://127.0.0.1:8000/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchComments();
    fetchPost();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("hr-HR", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  const parseVerdict = (verdict?: string) => {
    if (!verdict || verdict === "analyzing...") return null;
    const [label, ...rest] = verdict.split("|");
    return { label, reasoning: rest.join("|") };
  };

  if (loading) return (
    <div className="flex items-center justify-center mt-32 text-[#555]">Loading...</div>
  );

  if (!post) return null;

  return (
    <div className="max-w-[720px] mx-auto px-6 mt-8 pb-16">
      {/* Back */}
      <button
        onClick={() => navigate("/archive")}
        className="text-sm text-[#888] hover:text-[#1DB954] transition-colors mb-6 flex items-center gap-2"
      >
        ← Back to Archive
      </button>

      {/* Post header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
          {post.mood_label && (
            <div className="shrink-0 flex flex-col items-center gap-1 bg-[#1e1e1e] border border-[#333] rounded-[10px] px-3 py-2">
              <span className="text-2xl">{moodEmoji[post.mood_label] || "😐"}</span>
              <span className="text-xs text-[#888] capitalize">{post.mood_label}</span>
              <span className="text-xs text-[#555]">{post.mood_score?.toFixed(1)}/10</span>
            </div>
          )}
        </div>
        {post.created_at && (
          <p className="text-sm text-[#555]">{formatDate(post.created_at)}</p>
        )}
      </div>

      {/* Private */}
      {post.is_private ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="text-5xl">🔒</span>
          <p className="text-[#666]">This entry is private.</p>
        </div>
      ) : (
        <>
          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-[#ddd] text-base leading-[1.8] whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* AI Reflection */}
          {post.ai_reflection && (
            <div className="mt-8 p-5 bg-[#181818] border border-[#2a2a2a] rounded-[12px]">
              <p className="text-xs text-[#555] uppercase tracking-widest mb-2">AI Reflection</p>
              <p className="text-[#1DB954] italic text-sm leading-relaxed">{post.ai_reflection}</p>
            </div>
          )}

          {/* Reactions */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => handleReact("like")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${myReaction === "like" ? "bg-[#1DB954] border-[#1DB954] text-[#121212] font-bold scale-105" : "border-[#333] text-[#888] hover:border-[#1DB954] hover:text-[#1DB954]"}`}
            >
              👍 {post.likes}
            </button>
            <button
              onClick={() => handleReact("dislike")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 ${myReaction === "dislike" ? "bg-red-500 border-red-500 text-white font-bold scale-105" : "border-[#333] text-[#888] hover:border-red-500 hover:text-red-400"}`}
            >
              👎 {post.dislikes}
            </button>
          </div>

          {/* Comments */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-5">
              Comments <span className="text-[#555] font-normal text-sm">({comments.length})</span>
            </h2>

            {/* Comment list */}
            <div className="flex flex-col gap-4 mb-8">
              {comments.length === 0 && (
                <p className="text-[#555] text-sm">No comments yet. Be the first to share your thoughts.</p>
              )}
              {comments.map(comment => {
                const verdict = parseVerdict(comment.ai_verdict);
                return (
                  <div key={comment.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-semibold text-[#1DB954]">{comment.nickname}</span>
                        <span className="text-xs text-[#555] ml-2">{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {verdict && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${verdictColor[verdict.label] || verdictColor.neutral}`}>
                            {verdict.label}
                          </span>
                        )}
                        {!verdict && comment.ai_verdict === "analyzing..." && (
                          <span className="text-xs text-[#555] italic">analyzing...</span>
                        )}
                        {isAdmin && (
                          <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 hover:text-red-400">✕</button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[#ccc] leading-relaxed">{comment.content}</p>
                    {verdict?.reasoning && (
                      <p className="text-xs text-[#555] mt-2 italic">AI: {verdict.reasoning}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add comment */}
            <div className="bg-[#181818] border border-[#2a2a2a] rounded-[12px] p-5">
              <h3 className="text-sm font-semibold mb-3 text-[#aaa]">Leave a comment</h3>
              <div className="flex flex-col gap-3">
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  maxLength={30}
                  className="px-4 py-3 rounded-[8px] border border-[#333] bg-[#1e1e1e] text-white text-sm outline-none focus:border-[#1DB954] transition-colors"
                />
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  maxLength={500}
                  className="px-4 py-3 rounded-[8px] border border-[#333] bg-[#1e1e1e] text-white text-sm outline-none focus:border-[#1DB954] transition-colors resize-none"
                />
                <button
                  onClick={handleComment}
                  className="self-end px-6 py-2.5 bg-[#1DB954] text-[#121212] text-sm font-bold rounded-full hover:opacity-85 transition-opacity"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}