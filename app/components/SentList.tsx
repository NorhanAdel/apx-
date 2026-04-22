"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

const GET_SENT = `
query {
  mySentRequests {
    id
    playerName
    status
    payload
    created_at
    player {
      profile_image_url
    }
  }
}
`;

const CANCEL = `
mutation CancelRequest($requestId: String!) {
  cancelRequest(requestId: $requestId) {
    id
    status
  }
}
`;

export default function SentList() {
  const { theme } = useTheme();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ query: GET_SENT }),
    });

    const json = await res.json();
    setData(json?.data?.mySentRequests || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({
        query: CANCEL,
        variables: { requestId: id },
      }),
    });

    load();
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="space-y-4">

      {data.map((req) => {
        const image =
          req.player?.profile_image_url
            ? req.player.profile_image_url.startsWith("http")
              ? req.player.profile_image_url
              : `${API_URL}${req.player.profile_image_url}`
            : "/b2.jpg";

        return (
          <div
            key={req.id}
            className={`rounded-xl px-5 py-4 flex justify-between items-center transition
            ${
              theme === "dark"
                ? "bg-[#0b1736]/60 border border-[#1e2d5a]"
                : "bg-white border border-gray-300 shadow-sm"
            }`}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">

              {/* IMAGE */}
              <img
                src={image}
                className="w-12 h-12 rounded-full object-cover border"
              />

              {/* TEXT */}
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm uppercase tracking-wide">
                  {req.playerName || "Player"}
                </span>

                <span className="text-xs opacity-70">
                  {req.payload?.message || "No message"}
                </span>

                <span className="text-[10px] opacity-50">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full
                ${
                  req.status === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : req.status === "ACCEPTED"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {req.status}
              </span>

              {req.status === "PENDING" && (
                <button
                  onClick={() => handleCancel(req.id)}
                  className={`px-4 py-2 rounded-md font-bold italic text-xs uppercase transition
                  ${
                    theme === "dark"
                      ? "bg-[#081f55] border-x-2 border-red-400 text-white hover:bg-red-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  Cancel
                </button>
              )}

              <ChevronRight size={18} className="opacity-50" />
            </div>
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="text-center opacity-60 mt-10">
          No sent requests
        </div>
      )}

    </div>
  );
}