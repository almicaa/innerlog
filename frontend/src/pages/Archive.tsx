import API_URL from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [myReactions, setMyReactions] = useState<{ [key: number]: string | null }>({});
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const res = await axios.get("${API_URL}/posts");
    setPosts(res.data);
    res.data.forEach((post: Post) => {
      if (!post.is_private) fetchMyReaction(post.id);
    });
  };

  const fetchMyReaction = async (postId: number) => {
    try {
      const res = await axios.get(`${API_URL}/posts/${postId}/my-reaction`);
      setMyReactions(prev => ({ ...prev, [postId]: res.data.reaction }));
    } catch {}
  };

  const fetchComments = async (postId: number) => {
    const res = await axios.get(`${API_URL}/posts/${postId}/comments`);
    setComments(prev => ({ ...prev, [postId]: res.data }));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPosts(); }, []);

  const toggleExpand = (id: number) => setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleComments = (id: number) => {
    setShowComments(prev => ({ ...prev, [id]: !prev[id] }));
    if (!comments[id]) fetchComments(id);
  };

  const handleReact = async (postId: number, reaction: string) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/react`, { reaction });
      await fetchPosts();
      await fetchMyReaction(postId);
    } catch {}
  };

  const handleComment = async (postId: number) => {
    const text = commentText[postId]?.trim();
    const nick = nickname.trim();
    if (!text || !nick) return;
    try {
      await axios.post(`${API_URL}/posts/${postId}/comments`, {
        nickname: nick, content: text,
      });
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
      fetchPosts();
    } catch {}
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch {}
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments(postId);
      fetchPosts();
    } catch {}
  };

  const truncate = (text: string, words: number) => {
    const w = text.split(" ");
    return w.length <= words ? text : w.slice(0, words).join(" ") + "...";
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

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 pb-16">
      <h2 className="text-2xl font-bold mb-6">Archive</h2>

      {posts.map(post => (
        <div
          key={post.id}
          className={`mb-4 rounded-[12px] border overflow-hidden ${
            post.is_private ? "bg-[#161616] border-[#2a2a2a]" : "bg-[#1e1e1e] border-[#222]"
          }`}
        >
          {/* Card body */}
          <div className="p-4 sm:p-6">

            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Mood emoji */}
                {post.mood_label && !post.is_private && (
                  <span className="text-xl shrink-0 mt-0.5" title={post.mood_label}>
                    {moodEmoji[post.mood_label] || "😐"}
                  </span>
                )}
                {/* Title */}
                <h3
                  onClick={() => !post.is_private && navigate(`/post/${post.id}`)}
                  className={`text-base sm:text-lg font-semibold leading-snug ${
                    !post.is_private ? "cursor-pointer hover:text-[#1DB954] transition-colors" : ""
                  }`}
                >
                  {post.title}
                </h3>
              </div>

              {/* Badges + delete */}
              <div className="flex items-center gap-2 shrink-0">
                {post.is_private && (
                  <span className="text-xs text-[#888] bg-[#222] px-2 py-0.5 rounded-full border border-[#333]">
                    🔒
                  </span>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Date */}
            {post.created_at && (
              <p className="text-xs text-[#555] mb-3 ml-8">{formatDate(post.created_at)}</p>
            )}

            {/* Content preview */}
            {!post.is_private && post.content && (
              <p className="text-[#bbb] text-sm leading-relaxed">
                {expandedPosts[post.id] ? post.content : truncate(post.content, 35)}
              </p>
            )}

            {/* AI reflection */}
            {!post.is_private && post.ai_reflection && (
              <p className="mt-3 italic text-[#1DB954] text-sm leading-relaxed">
                {expandedPosts[post.id] ? post.ai_reflection : truncate(post.ai_reflection, 12)}
              </p>
            )}

            {/* Show more / Read full */}
            {!post.is_private && (
              <div className="mt-2 flex items-center gap-4">
                <button
                  className="text-xs text-[#1DB954] hover:underline"
                  onClick={() => toggleExpand(post.id)}
                >
                  {expandedPosts[post.id] ? "Show less" : "Show more"}
                </button>
                <button
                  className="text-xs text-[#555] hover:text-[#888] transition-colors"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  Read full post →
                </button>
              </div>
            )}

            {/* Private */}
            {post.is_private && (
              <div className="flex items-center gap-2 py-2 text-[#555]">
                <span>🔒</span>
                <span className="text-xs">This entry is private</span>
              </div>
            )}
          </div>

          {/* Reactions + comments bar */}
          {!post.is_private && (
            <div className="border-t border-[#2a2a2a] px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Like */}
              <button
                onClick={() => handleReact(post.id, "like")}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  myReactions[post.id] === "like"
                    ? "bg-[#1DB954] border-[#1DB954] text-[#121212] font-bold"
                    : "border-[#333] text-[#888] hover:border-[#1DB954] hover:text-[#1DB954]"
                }`}
              >
                👍 <span>{post.likes}</span>
              </button>

              {/* Dislike */}
              <button
                onClick={() => handleReact(post.id, "dislike")}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  myReactions[post.id] === "dislike"
                    ? "bg-red-500 border-red-500 text-white font-bold"
                    : "border-[#333] text-[#888] hover:border-red-500 hover:text-red-400"
                }`}
              >
                👎 <span>{post.dislikes}</span>
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Comments toggle */}
              <button
                onClick={() => toggleComments(post.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  showComments[post.id] ? "text-[#1DB954]" : "text-[#888] hover:text-[#1DB954]"
                }`}
              >
                💬
                <span className="hidden sm:inline">
                  {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
                </span>
                <span className="sm:hidden">{post.comment_count}</span>
              </button>
            </div>
          )}

          {/* Comments section */}
          {!post.is_private && showComments[post.id] && (
            <div className="border-t border-[#2a2a2a] px-4 sm:px-6 py-4 bg-[#191919]">

              {/* Comment list */}
              <div className="flex flex-col gap-3 mb-4">
                {(comments[post.id] || []).length === 0 && (
                  <p className="text-xs text-[#555]">No comments yet. Be the first!</p>
                )}
                {(comments[post.id] || []).map(comment => {
                  const verdict = parseVerdict(comment.ai_verdict);
                  return (
                    <div key={comment.id} className="bg-[#161616] rounded-[8px] px-3 py-3 border border-[#2a2a2a]">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-[#1DB954]">{comment.nickname}</span>
                          <span className="text-xs text-[#555]">{formatDate(comment.created_at)}</span>
                          {verdict && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${verdictColor[verdict.label] || verdictColor.neutral}`}>
                              {verdict.label}
                            </span>
                          )}
                          {!verdict && comment.ai_verdict === "analyzing..." && (
                            <span className="text-xs text-[#555] italic">analyzing...</span>
                          )}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComment(post.id, comment.id)}
                            className="text-xs text-red-500 hover:text-red-400 shrink-0"
                          >✕</button>
                        )}
                      </div>
                      <p className="text-sm text-[#ccc]">{comment.content}</p>
                      {verdict?.reasoning && (
                        <p className="text-xs text-[#555] mt-1.5 italic">AI: {verdict.reasoning}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add comment */}
              <div className="flex flex-col gap-2">
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  maxLength={30}
                  className="px-3 py-2.5 text-sm rounded-[8px] border border-[#333] bg-[#1a1a1a] text-white outline-none focus:border-[#1DB954] transition-colors"
                />
                <textarea
                  value={commentText[post.id] || ""}
                  onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                  placeholder="Write a comment..."
                  rows={2}
                  maxLength={500}
                  className="px-3 py-2.5 text-sm rounded-[8px] border border-[#333] bg-[#1a1a1a] text-white outline-none focus:border-[#1DB954] transition-colors resize-none"
                />
                <button
                  onClick={() => handleComment(post.id)}
                  className="self-end px-5 py-2 bg-[#1DB954] text-[#121212] text-sm font-bold rounded-full hover:opacity-85 transition-opacity"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}