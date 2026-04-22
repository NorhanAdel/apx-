// app/players/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { PlayerCard } from "../components/PlayerCard";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
// import { GET_ALL_PLAYERS } from "@/app/graphql/query/player.query";
import useTranslate from "../hooks/useTranslate";
import { GET_ALL_PLAYERS } from "../graphql/query/player.queries";

interface PlayerData {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  nationality?: string;
  date_of_birth?: string;
  trust_level?: number;
}

interface FormattedPlayer {
  id: string;
  name: string;
  image: string;
  rating: number;
  position: string;
  country: string;
  age: number;
}

export default function PlayersPage() {
  const { theme } = useTheme();
  const { lang } = useTranslate();
  const isDark = theme === "dark";

  const [players, setPlayers] = useState<FormattedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "age" | "name">("rating");

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{
        getAllPlayers: {
          data: PlayerData[];
        };
      }>(GET_ALL_PLAYERS, { skip: 0, take: 50 });

      if (result.errors || !result.data?.getAllPlayers) {
        console.error("Failed to fetch players:", result.errors);
        setPlayers([]);
        return;
      }

      const formatted = result.data.getAllPlayers.data.map((p: PlayerData) => {
        let age = 0;
        if (p.date_of_birth) {
          age =
            new Date().getFullYear() - new Date(p.date_of_birth).getFullYear();
        }

        let image = "/b2.jpg";
        if (p.profile_image_url) {
          image = p.profile_image_url.startsWith("http")
            ? p.profile_image_url
            : `${process.env.NEXT_PUBLIC_API_URL}${p.profile_image_url}`;
        }

        return {
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          image,
          rating: p.trust_level || 3,
          position: "Player",
          country: p.nationality || "Unknown",
          age: age || 0,
        };
      });

      setPlayers(formatted);
    } catch (err) {
      console.error(err);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [lang]);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "age":
        return a.age - b.age;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  /* THEME COLORS */
  const bg = isDark ? "bg-[#01040a]" : "bg-gray-100";
  const text = isDark ? "text-white" : "text-black";
  const card = isDark ? "bg-[#030816]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-gray-300";
  const accent = isDark ? "text-[#eab308]" : "text-yellow-600";

  return (
    <div
      className={`min-h-screen py-30 px-4 sm:px-6 md:px-8 pb-10 ${bg} ${text}`}
    >
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto pt-20 sm:pt-24 md:pt-28 mb-8 flex flex-col gap-4">
        {/* SEARCH */}
        <div className="relative w-full">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${accent}/60`}
            size={18}
          />

          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full rounded-lg py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4
              text-xs sm:text-sm italic font-bold
              border focus:outline-none transition
              ${card} ${border} ${accent}
              focus:border-yellow-500/50
            `}
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span
            className={`text-xs font-bold italic mr-2 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Sort by:
          </span>

          <button
            onClick={() => setSortBy("rating")}
            className={`
              flex items-center justify-between gap-2
              px-3 py-2 rounded-lg
              text-[10px] sm:text-xs font-bold
              border transition
              ${card} ${border}
              hover:opacity-80
              ${sortBy === "rating" ? "border-yellow-400 text-yellow-400" : ""}
            `}
          >
            Highest Rated
            <ChevronDown size={12} className="text-gray-500" />
          </button>

          <button
            onClick={() => setSortBy("age")}
            className={`
              flex items-center justify-between gap-2
              px-3 py-2 rounded-lg
              text-[10px] sm:text-xs font-bold
              border transition
              ${card} ${border}
              hover:opacity-80
              ${sortBy === "age" ? "border-yellow-400 text-yellow-400" : ""}
            `}
          >
            Age
            <ChevronDown size={12} className="text-gray-500" />
          </button>

          <button
            onClick={() => setSortBy("name")}
            className={`
              flex items-center justify-between gap-2
              px-3 py-2 rounded-lg
              text-[10px] sm:text-xs font-bold
              border transition
              ${card} ${border}
              hover:opacity-80
              ${sortBy === "name" ? "border-yellow-400 text-yellow-400" : ""}
            `}
          >
            Name
            <ChevronDown size={12} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <p className="col-span-full text-center opacity-70">Loading...</p>
        ) : sortedPlayers.length === 0 ? (
          <p className="col-span-full text-center opacity-70">
            No players found
          </p>
        ) : (
          sortedPlayers.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <div className="cursor-pointer">
                <PlayerCard {...player} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}