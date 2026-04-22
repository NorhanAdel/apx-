"use client";

import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TYPES ================= */
interface Reel {
  id: string;
  clip_url: string;
  event_type: string;
  views_count: number;
  likes_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

/* ================= COMPONENT ================= */
export default function ReelsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");

  const [openComments, setOpenComments] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const viewed = useRef<Set<string>>(new Set());

  /* ================= FETCH REELS ================= */
  useEffect(() => {
    const fetchReels = async () => {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              recentReels {
                id
                clip_url
                event_type
                views_count
                likes_count
                created_at
              }
            }
          `,
        }),
      });

      const json = await res.json();
      setReels(json?.data?.recentReels || []);
    };

    fetchReels();
  }, []);

  /* ================= SCROLL ================= */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const index = Math.round(
      e.currentTarget.scrollTop / e.currentTarget.clientHeight
    );

    setCurrentIndex(index);

    const reel = reels[index];
    if (reel) incrementView(reel.id);
  };

  /* ================= LIKE ================= */
  const toggleLike = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const saved = JSON.parse(localStorage.getItem("likedReels") || "{}");

    if (saved[id]) return;

    saved[id] = true;
    localStorage.setItem("likedReels", JSON.stringify(saved));
    setLiked(saved);

    setReels((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, likes_count: r.likes_count + 1 } : r
      )
    );

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            likeReel(id: "${id}")
          }
        `,
      }),
    });
  };

  /* ================= VIEWS ================= */
  const incrementView = async (id: string) => {
    if (viewed.current.has(id)) return;
    viewed.current.add(id);

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            incrementReelViews(id: "${id}")
          }
        `,
      }),
    });

    setReels((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, views_count: r.views_count + 1 } : r
      )
    );
  };

  /* ================= FETCH COMMENTS ================= */
  const fetchComments = async (reelId: string) => {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            reelComments(reelId: "${reelId}") {
              id
              content
              user_id
              created_at
            }
          }
        `,
      }),
    });

    const json = await res.json();

    setComments((prev) => ({
      ...prev,
      [reelId]: json?.data?.reelComments || [],
    }));
  };

  /* ================= ADD COMMENT ================= */
  const addComment = async (reelId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !commentText) return;

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            createReelComment(input: {
              target_type: REEL
              target_id: "${reelId}"
              content: "${commentText}"
            }) {
              id
              content
              user_id
              created_at
            }
          }
        `,
      }),
    });

    fetchComments(reelId);
    setCommentText("");
    setReplyTo(null);
  };

  /* ================= DELETE COMMENT ================= */
  const deleteComment = async (commentId: string, reelId: string) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            deleteReelComment(id: "${commentId}")
          }
        `,
      }),
    });

    setComments((prev) => ({
      ...prev,
      [reelId]: prev[reelId].filter((c) => c.id !== commentId),
    }));
  };

  const bg = isDark ? "bg-[#020B1D]" : "bg-gray-100";

  return (
    <div
      className={`h-screen overflow-y-scroll py-30 snap-y snap-mandatory ${bg}`}
      onScroll={handleScroll}
    >
      {reels.map((reel, index) => {
        const videoSrc = reel.clip_url.startsWith("http")
          ? reel.clip_url
          : `${API_URL}${reel.clip_url}`;

        const isLiked = liked[reel.id];

        return (
          <div
            key={reel.id}
            className="relative h-screen w-full max-w-[420px] mx-auto snap-start"
          >
            {/* VIDEO */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={videoSrc}
              className="w-full h-full object-cover bg-black"
              autoPlay={currentIndex === index}
              muted
              loop
              playsInline
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />

            {/* ACTIONS */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10 text-white">

              {/* LIKE (Instagram style) */}
              <button
                onClick={() => toggleLike(reel.id)}
                className="flex flex-col items-center"
              >
                <Heart
                  size={26}
                  fill={isLiked ? "red" : "none"}
                  className={isLiked ? "text-red-500" : "text-white"}
                />
                <span className="text-xs">{reel.likes_count}</span>
              </button>

              {/* COMMENT (Instagram style) */}
              <button
                onClick={() => {
                  setOpenComments(reel.id);
                  fetchComments(reel.id);
                }}
                className="flex flex-col items-center"
              >
                <MessageCircle size={26} className="text-white" />
                <span className="text-xs">
                  {comments[reel.id]?.length || 0}
                </span>
              </button>

              {/* VIEWS */}
              <span className="text-xs">👁 {reel.views_count}</span>

              <MoreHorizontal size={22} />
            </div>

            {/* COMMENTS */}
            {openComments === reel.id && (
              <div className="absolute bottom-0 left-0 w-full h-[70%] bg-black/60 backdrop-blur-2xl rounded-t-3xl flex flex-col p-4 border-t border-white/10">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-white font-semibold text-sm">
                    Comments
                  </h2>

                  <button
                    onClick={() => setOpenComments(null)}
                    className="text-white/60 text-xs"
                  >
                    Close
                  </button>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">

                  {(comments[reel.id] || []).map((c) => (
                    <div
                      key={c.id}
                      className="flex gap-3 bg-white/10 p-3 rounded-2xl border border-white/10"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs text-white">
                        {c.user_id?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">

                        <div className="flex justify-between items-center">
                          <p className="text-white text-sm font-medium">
                            User
                          </p>

                          {/* 3 BUTTONS */}
                          <div className="flex gap-3 text-xs">

                            <button
                              onClick={() => {
                                setCommentText(c.content);
                                setReplyTo(c.id);
                              }}
                              className="text-yellow-400"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                setCommentText("@reply ");
                                setReplyTo(c.id);
                              }}
                              className="text-blue-400"
                            >
                              Reply
                            </button>

                            <button
                              onClick={() => deleteComment(c.id, reel.id)}
                              className="text-red-400"
                            >
                              Delete
                            </button>

                          </div>
                        </div>

                        <p className="text-white/80 text-sm mt-1">
                          {c.content}
                        </p>

                      </div>
                    </div>
                  ))}
                </div>

                {/* INPUT */}
                <div className="flex gap-2 mt-3">

                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white outline-none backdrop-blur-md"
                    placeholder="Write comment..."
                  />

                  <button
                    onClick={() => addComment(reel.id)}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white"
                  >
                    <Send size={16} />
                  </button>

                </div>

              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}