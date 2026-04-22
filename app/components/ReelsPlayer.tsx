"use client";

import { useEffect, useState, useRef } from "react";
import { Heart } from "lucide-react";
import useTranslate from "../hooks/useTranslate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Video {
  id: string | number;
  title?: string;
  video_url: string;
}

interface Props {
  videos?: Video[];
}

export default function ReelsPlayer({ videos = [] }: Props) {
  const { t } = useTranslate();
  const [selected, setSelected] = useState<string>("");
  const [likes, setLikes] = useState(6);
  const [liked, setLiked] = useState(false);
  const hasSetInitial = useRef(false);

  const getFullUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    if (!videos.length) return;

    if (!hasSetInitial.current) {
      hasSetInitial.current = true;
      const timer = setTimeout(() => {
        const first = videos[0]?.video_url;
        if (first) setSelected(getFullUrl(first));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [videos]);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (!liked ? prev + 1 : prev - 1));
  };

  if (!videos.length) return null;

  return (
    <div className="w-full max-w-[900px] mx-auto mt-20 text-white">
      <h2 className="text-yellow-400 text-3xl font-bold text-center mb-6">
        {t("Reels")}
      </h2>

      {/* Main Video */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-[#1c2c55]">
        {selected && (
          <video
            key={selected}
            src={selected}
            controls
            className="w-full h-[420px] object-cover"
          />
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <Heart
            onClick={handleLike}
            className={`cursor-pointer transition ${
              liked ? "text-red-500 fill-red-500" : "text-white"
            }`}
            size={18}
          />
          <span className="text-sm">{likes}</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {videos.map((v) => {
          const url = getFullUrl(v.video_url);

          return (
            <video
              key={v.id}
              src={url}
              onClick={() => setSelected(url)}
              className={`w-[150px] h-[90px] object-cover rounded-lg cursor-pointer border ${
                selected === url ? "border-yellow-400" : "border-[#1c2c55]"
              }`}
            />
          );
        })}
      </div>

      <button className="w-full mt-6 py-3 bg-[#0a1a3a] hover:bg-[#11265e] rounded-lg font-semibold">
        {t("Send Request")}
      </button>
    </div>
  );
}