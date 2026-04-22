"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Pencil,
  LayoutGrid,
  Users,
  Trophy,
  LogOut,
  Share2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { useTheme } from "../context/ThemeContext";
import { MY_SCOUT_PROFILE } from "../graphql/query/scout.queries";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

export default function ClubProfile() {
  const router = useRouter();
  const { theme } = useTheme();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: MY_SCOUT_PROFILE }),
        });

        const json = await res.json();

        const data = json?.data?.myScoutProfile;

        setProfile(data || null);
      } catch (err) {
        console.log(err);
        setProfile(null);
      }

      setLoading(false);
    };

    load();
  }, []);

  /* ================= THEME ================= */

  const dark = {
    bg: "bg-[#020617] text-white",
    card: "bg-[#051139]",
    btn: "bg-[#0A1A44] hover:bg-[#102B70] transition",
    menu: "bg-[#051139] hover:bg-[#0A1A44] border border-blue-900/30 transition",
    icon: "text-yellow-400",
  };

  const light = {
    bg: "bg-gray-100 text-black",
    card: "bg-white",
    btn: "bg-blue-600 hover:bg-blue-700 transition",
    menu: "bg-white hover:bg-gray-200 border border-gray-300 transition",
    icon: "text-yellow-500",
  };

  const t = theme === "dark" ? dark : light;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.bg}`}>
        Loading...
      </div>
    );
  }

  /* ================= IMAGE FIX ================= */

  const imageUrl =
    profile?.profile_image_url && profile.profile_image_url.trim() !== ""
      ? profile.profile_image_url
      : "/Club.jpg";

  return (
    <div className={`min-h-screen md:p-10 flex justify-center relative ${t.bg}`}>

      {/* ================= MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white text-black p-6 rounded-xl w-96 relative text-center">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-4">Logout</h2>
            <p className="mb-6">Are you sure?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Cancel
              </button>
              <button className="flex-1 bg-red-600 text-white py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row gap-8 mb-6">

          {/* IMAGE */}
          <div className="relative w-full md:w-[400px] aspect-square rounded-md overflow-hidden border border-blue-900/40">
            <Image
              src={imageUrl}
              fill
              alt="profile"
              className="object-cover"
              unoptimized
            />
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-4 pt-4">

            <h1 className="text-4xl font-black uppercase italic">
              {profile?.first_name} {profile?.last_name}
            </h1>

            <div className="flex gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>

            <div className="space-y-2 text-sm">

              <div className="flex items-center gap-2">
                <Trophy size={16} className={t.icon} />
                <span className="bg-yellow-400 text-black px-2 text-xs font-bold rounded">
                  Scout
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} className={t.icon} />
                {profile?.country}
              </div>

              <div className="flex items-center gap-2">
                <Mail size={16} className={t.icon} />
                {profile?.email_address}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className={t.icon} />
                {profile?.phone}
              </div>

            </div>
          </div>
        </div>

        {/* ================= EDIT BUTTON (FIXED STYLE) ================= */}
        <button
          onClick={() => router.push("/agent/profile")}
          className={`w-full ${t.btn} py-3 rounded-md font-black uppercase mb-6 flex justify-center items-center gap-2 text-white`}
        >
          Edit Profile <Pencil size={18} />
        </button>

        {/* ================= MENU (IMPROVED BUTTONS ONLY) ================= */}
        <div className="grid md:grid-cols-2 gap-3 mb-12">

          {[
            { label: "Requests", icon: <LayoutGrid size={18} />, path: "/scout//profile/requests" },
            { label: "Share AD", icon: <Share2 size={18} />, path: "/scout/profile/share" },
            { label: "Favourite Players", icon: <Users size={18} />, path: "/players" },
            { label: "Participation Prime", icon: <Trophy size={18} />, path: "/ParticipationPrime" },
            { label: "Logout", icon: <LogOut size={18} />, action: () => setShowLogoutModal(true) },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() =>
                "path" in btn ? router.push(btn.path) : btn.action?.()
              }
              className={`${t.menu} p-4 flex justify-between rounded-lg`}
            >
              <span className="font-bold uppercase text-sm">{btn.label}</span>
              <span className={btn.label === "Logout" ? "text-red-500" : t.icon}>
                {btn.icon}
              </span>
            </button>
          ))}

        </div>

      </div>
    </div>
  );
}