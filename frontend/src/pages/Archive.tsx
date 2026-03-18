import { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  content?: string;
  ai_reflection?: string;
  is_private: boolean;
}

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const res = await axios.get("http://127.0.0.1:8000/posts");
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-[800px] mx-auto px-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Archive</h2>

      {posts.map(post => (
        <div
          key={post.id}
          className={`relative p-6 mb-4 rounded-[10px] border overflow-hidden
            ${post.is_private
              ? "bg-[#161616] border-[#2a2a2a]"
              : "bg-[#1e1e1e] border-[#222]"
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            {post.is_private && (
              <span className="flex items-center gap-1.5 text-xs text-[#888] bg-[#222] px-3 py-1 rounded-full border border-[#333]">
                🔒 Private
              </span>
            )}
          </div>

          {/* Content */}
          <div className="relative">
            <p className={`text-[#ccc] text-sm leading-relaxed ${post.is_private ? "blur-sm select-none" : ""}`}>
              {post.is_private
                ? "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam voluptatem, quod, quia, quae quos quibusdam voluptates."
                : post.content}
            </p>

            {post.is_private && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">🔒</span>
                <span className="text-xs text-[#666]">This entry is private</span>
              </div>
            )}
          </div>

          {/* AI reflection */}
          {!post.is_private && post.ai_reflection && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] italic text-[#1DB954] text-sm">
              {post.ai_reflection}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}