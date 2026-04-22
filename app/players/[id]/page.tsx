"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import PlayerHeader from "@/app/components/PlayerHeader";
import PlayerDescription from "@/app/components/PlayerDescription";
import PersonalInfo from "@/app/components/PersonalInfo";
import PlayerGallery from "@/app/components/PlayerGallery";
import Ratings from "@/app/components/Ratings";
import Reviews from "@/app/components/Reviews";
import WriteReview from "@/app/components/WriteReview";
import ReelsPlayer from "@/app/components/ReelsPlayer";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_PLAYER_PROFILE } from "@/app/graphql/query/player.query";
import useTranslate from "@/app/hooks/useTranslate";
import { useTheme } from "@/app/context/ThemeContext";
import FootballInfo from "@/app/components/FootballInfo";
import ClubCareer from "@/app/components/ClubCareer";

interface PlayerPhoto {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

interface PlayerVideo {
  id: string;
  title: string;
  video_url: string;
  type: string;
  is_approved: boolean;
  views_count: number;
  created_at: string;
}

interface RatingRater {
  id: string;
  first_name?: string;
  last_name?: string;
}

interface PlayerRating {
  id: string;
  scalability?: number;
  technical_skill?: number;
  calculated_stars: number;
  notes?: string;
  created_at: string;
  rater: RatingRater;
}

interface PlayerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone?: string;
  nationality?: string;
  country?: string;
  city?: string;
  height_cm?: number;
  weight_kg?: number;
  date_of_birth?: string;
  profile_image_url?: string;
  verification_doc_url?: string;
  is_verified: boolean;
  trust_level?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  photos: PlayerPhoto[];
  videos: PlayerVideo[];
  ratings: PlayerRating[];
}

interface CurrentUser {
  id: string;
  role?: string;
  playerProfile?: { id: string };
}

export default function PlayerProfilePage() {
  const { id } = useParams();
  const { lang } = useTranslate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const fetchPlayer = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const playerResult = await fetchGraphQL<{ playerProfile: PlayerProfile }>(
        GET_PLAYER_PROFILE,
        { id: String(id) },
      );

      if (playerResult.errors || !playerResult.data?.playerProfile) {
        setPlayer(null);
      } else {
        setPlayer(playerResult.data.playerProfile);
      }
    } catch (err) {
      console.error(err);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }
    } catch (err) {
      console.error("Error getting current user:", err);
    }
  };

  const canViewContactInfo = () => {
    if (!currentUser || !player) return false;
    const isAdmin = currentUser.role === "ADMIN";
    const isOwner = currentUser.playerProfile?.id === player.id;
    return isAdmin || isOwner;
  };

  useEffect(() => {
    getCurrentUser();
    fetchPlayer();
  }, [fetchPlayer, lang]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617] text-white" : "bg-gray-50 text-black"
        }`}
      >
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <div className="text-red-500">Player not found</div>
      </div>
    );
  }

  const showContact = canViewContactInfo();
  const displayPlayer = {
    first_name: player.first_name,
    last_name: player.last_name,
    date_of_birth: player.date_of_birth,
    city: player.city,
    country: player.country,
    nationality: player.nationality,
    height_cm: player.height_cm,
    weight_kg: player.weight_kg,
    email_address: showContact ? player.email_address : null,
    phone: showContact ? player.phone : null,
  };

  return (
    <div
      className={`min-h-screen py-20 transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <PlayerHeader player={player} />
            <PlayerDescription player={player} />
            <PersonalInfo player={displayPlayer} />
          </div>
          <PlayerGallery player={player} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FootballInfo playerId={player.id} />
          <ClubCareer playerId={player.id} />
        </div>

        <ReelsPlayer videos={player.videos || []} />
        <Ratings ratings={player.ratings || []} />
        <Reviews />
        <WriteReview playerId={player.id} />
      </div>
    </div>
  );
}