"use client";

import {
  User,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeContext";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= UPSERT (NEW API) ================= */

const UPSERT_SCOUT_CLUB_CAREER = `
mutation UpsertScoutClubCareer($input: CreateScoutClubCareerInput!) {
  upsertScoutClubCareer(input: $input) {
    id
    scout_id
    current_club
    previous_clubs
    created_at
    updated_at
  }
}
`;

/* ================= GET ================= */

const GET_MY_CAREER = `
query {
  myScoutClubCareer {
    id
    current_club
    previous_clubs
    created_at
    updated_at
  }
}
`;

export default function ClubCareer() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);

  const [form, setForm] = useState({
    current_club: "",
    previous_clubs: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: GET_MY_CAREER,
          }),
        });

        const json = await res.json();
        const data = json?.data?.myScoutClubCareer;

        if (data) {
          setExists(true);

          setForm({
            current_club: data.current_club || "",
            previous_clubs: data.previous_clubs || "",
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  /* ================= HANDLE ================= */

  const handleChange = (e: any) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: UPSERT_SCOUT_CLUB_CAREER,
          variables: {
            input: {
              current_club: form.current_club,
              previous_clubs: form.previous_clubs,
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

      alert(exists ? "Updated Successfully ✅" : "Created Successfully ✅");

      router.push("/scout/profile");

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div
      className={`min-h-screen py-20 flex items-center justify-center relative overflow-hidden transition
      ${theme === "dark" ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"}`}
    >

      {/* Background (same) */}
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-center bg-cover"></div>

      <div className="relative w-full max-w-4xl px-6 py-10">

        {/* TITLE (same style) */}
        <h1
          className={`text-center text-3xl font-black italic mb-10 uppercase tracking-wider
          ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
        >
          Club Career
        </h1>

        {/* ICONS (same vibe) */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            ${theme === "dark" ? "bg-[#0f1c3d]" : "bg-gray-200"}`}
          >
            <User size={20} />
          </div>

          <div className={`w-20 h-[1px]
            ${theme === "dark" ? "bg-gray-600" : "bg-gray-400"}`}
          ></div>

          <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
            <LayoutGrid className="text-yellow-500" size={16} />
          </div>
        </div>

        {/* FORM (same layout style) */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">

          {/* Current Club */}
          <input
            name="current_club"
            placeholder="Current Club"
            value={form.current_club}
            onChange={handleChange}
            className={`w-full rounded-xl px-4 py-4 outline-none text-sm
              ${theme === "dark"
                ? "bg-[#0b1736]/60 border border-[#1e2d5a]"
                : "bg-gray-100 border border-gray-300"}`}
          />

          {/* Previous Clubs */}
          <textarea
            name="previous_clubs"
            placeholder="Previous Clubs (comma separated)"
            value={form.previous_clubs}
            onChange={handleChange}
            className={`w-full rounded-xl px-4 py-4 outline-none text-sm h-32
              ${theme === "dark"
                ? "bg-[#0b1736]/60 border border-[#1e2d5a]"
                : "bg-gray-100 border border-gray-300"}`}
          />

          {/* BUTTONS (same style) */}
          <div className="flex justify-between mt-20">

            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-10 py-3 rounded-md font-bold italic
              ${theme === "dark"
                ? "bg-[#081f55] border-x-2 border-yellow-500 text-white"
                : "bg-gray-200 border-x-2 border-yellow-600 text-black"}`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-14 py-3 rounded-md font-bold italic shadow-lg uppercase tracking-widest
              ${theme === "dark"
                ? "bg-[#081f55] border-x-2 border-yellow-500 text-white hover:bg-[#0b2b6b]"
                : "bg-yellow-500 border-x-2 border-yellow-600 text-black hover:bg-yellow-400"}`}
            >
              {loading ? "Saving..." : exists ? "Update" : "Submit"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}