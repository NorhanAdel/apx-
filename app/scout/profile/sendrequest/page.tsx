"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

const GET_PLAYERS = `
query GetAllPlayers($skip: Int, $take: Int) {
  getAllPlayers(skip: $skip, take: $take) {
    data {
      id
      first_name
      last_name
      profile_image_url
    }
  }
}
`;

const SEND_REQUEST = `
mutation SendRequest($input: CreateRequestInput!) {
  sendRequest(input: $input) {
    id
    status
  }
}
`;

export default function SendRequestPage() {
  const { theme } = useTheme();

  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_PLAYERS,
          variables: { skip: 0, take: 10 },
        }),
      });

      const json = await res.json();
      setPlayers(json?.data?.getAllPlayers?.data || []);
    };

    fetchPlayers();
  }, []);

  const handleSend = async () => {
    if (!selectedPlayer) {
      alert("Choose player first");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          query: SEND_REQUEST,
          variables: {
            input: {
              player_id: selectedPlayer.id,
              type: "SCOUT_OFFER",
              message: details,
            },
          },
        }),
      });

      const json = await res.json();

      if (json.errors) {
        alert(json.errors[0].message);
        setLoading(false);
        return;
      }

      alert("Request Sent ✅");
    } catch (err) {
      console.log(err);
      alert("Error");
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen py-32 px-4 ${
        theme === "dark"
          ? "bg-[#020617] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-4xl mx-auto">

        <h1 className="text-center text-3xl font-bold text-yellow-500 mb-10">
          Sent Request
        </h1>

        {/* PLAYER SELECT (LIKE IMAGE 🔥) */}
        <div className="mb-6 relative">
          <label className="block mb-2 font-bold">Player</label>

          <div
            onClick={() => setOpen(!open)}
            className={`flex items-center justify-between p-4 rounded cursor-pointer border
            ${
              theme === "dark"
                ? "bg-[#0f172a] border-[#1e293b]"
                : "bg-white border-gray-300"
            }`}
          >
            {selectedPlayer ? (
              <div className="flex items-center gap-3">
                <img
                  src={selectedPlayer.profile_image_url || "/player.jpg"}
                  className="w-10 h-10 rounded object-cover"
                />
                <span className="font-bold">
                  {selectedPlayer.first_name} {selectedPlayer.last_name}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Choose Player</span>
            )}

            <ChevronDown />
          </div>

          {/* DROPDOWN */}
          {open && (
            <div
              className={`absolute w-full mt-2 rounded shadow-lg z-50 max-h-60 overflow-auto
              ${
                theme === "dark"
                  ? "bg-[#020617] border border-[#1e293b]"
                  : "bg-white border border-gray-300"
              }`}
            >
              {players.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayer(p);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-yellow-500/20 transition"
                >
                  <img
                    src={p.profile_image_url || "/player.jpg"}
                    className="w-10 h-10 rounded object-cover"
                  />

                  <span className="font-bold">
                    {p.first_name} {p.last_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TITLE */}
        <div className="mb-6">
          <label className="block mb-2 font-bold">Title</label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of request"
            className={`w-full p-3 rounded border ${
              theme === "dark"
                ? "bg-[#0f172a] border-[#1e293b]"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* DETAILS */}
        <div className="mb-6">
          <label className="block mb-2 font-bold">Details</label>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder="Details of request"
            className={`w-full p-3 rounded border ${
              theme === "dark"
                ? "bg-[#0f172a] border-[#1e293b]"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full py-4 font-bold rounded ${
            theme === "dark"
              ? "bg-[#081f55] border-x-2 border-yellow-400"
              : "bg-yellow-500"
          }`}
        >
          {loading ? "Sending..." : "Send Request 🔁"}
        </button>
      </div>
    </div>
  );
}