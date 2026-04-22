// app/components/PersonalInfo.tsx
"use client";

import React from "react";

interface Player {
  first_name: string;
  last_name: string;
  date_of_birth?: string | Date | null;
  city?: string | null;
  country?: string | null;
  nationality?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  email_address?: string | null;
  phone?: string | null;
}

interface Position {
  id: string;
  name: string;
  category: string;
}

interface FootballInfo {
  preferred_foot?: string | null;
  jersey_number?: number | null;
  position?: Position | null;
  playing_style?: string | null;
  strengths?: string[] | null;
  market_value?: number | null;
  description?: string | null;
}

interface ClubCareer {
  current_club?: string | null;
  professional_debut?: string | Date | null;
  previous_clubs?: string | null;
}

interface PersonalInfoProps {
  player: Player | null | undefined;
  footballInfo?: FootballInfo | null | undefined;
  clubCareer?: ClubCareer | null | undefined;
}

export default function PersonalInfo({
  player,
  footballInfo,
  clubCareer,
}: PersonalInfoProps) {
  if (!player) return null;

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatMarketValue = (value?: number | null) => {
    if (!value) return "N/A";
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`;
    }
    return `${value} €`;
  };

  const formatStrengths = (strengths?: string[] | null) => {
    if (!strengths || strengths.length === 0) return "N/A";
    return strengths.join(", ");
  };

  const getPositionName = () => {
    if (!footballInfo?.position) return "N/A";
    return footballInfo.position.name;
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-yellow-400 font-semibold mb-3">
          Personal Information
        </h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>
            <strong>Full Name:</strong> {player.first_name} {player.last_name}
          </li>
          <li>
            <strong>Date of Birth:</strong> {formatDate(player.date_of_birth)}
          </li>
          <li>
            <strong>Place of Birth:</strong> {player.city || "Unknown"},{" "}
            {player.country || "Unknown"}
          </li>
          <li>
            <strong>Nationality:</strong> {player.nationality || "N/A"}
          </li>
          <li>
            <strong>Height:</strong>{" "}
            {player.height_cm
              ? `${(player.height_cm / 100).toFixed(2)} m`
              : "N/A"}
          </li>
          <li>
            <strong>Weight:</strong>{" "}
            {player.weight_kg ? `${player.weight_kg} kg` : "N/A"}
          </li>
          <li>
            <strong>Email:</strong> {player.email_address || "N/A"}
          </li>
          <li>
            <strong>Phone:</strong> {player.phone || "N/A"}
          </li>
        </ul>
      </div>

      {/* Football Information */}
      {footballInfo && (
        <div>
          <h3 className="text-yellow-400 font-semibold mb-3">
            Football Information
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <strong>Position:</strong> {getPositionName()}
            </li>
            <li>
              <strong>Preferred Foot:</strong>{" "}
              {footballInfo.preferred_foot || "N/A"}
            </li>
            <li>
              <strong>Jersey Number:</strong>{" "}
              {footballInfo.jersey_number || "N/A"}
            </li>
            <li>
              <strong>Playing Style:</strong>{" "}
              {footballInfo.playing_style || "N/A"}
            </li>
            <li>
              <strong>Strengths:</strong>{" "}
              {formatStrengths(footballInfo.strengths)}
            </li>
            <li>
              <strong>Market Value:</strong>{" "}
              {formatMarketValue(footballInfo.market_value)}
            </li>
            <li>
              <strong>Description:</strong>
              <p className="mt-1 text-gray-400 leading-relaxed">
                {footballInfo.description || "No description available"}
              </p>
            </li>
          </ul>
        </div>
      )}

      {/* Club Career */}
      {clubCareer && (
        <div>
          <h3 className="text-yellow-400 font-semibold mb-3">Club Career</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <strong>Current Club:</strong> {clubCareer.current_club || "N/A"}
            </li>
            <li>
              <strong>Professional Debut:</strong>{" "}
              {formatDate(clubCareer.professional_debut)}
            </li>
            <li>
              <strong>Previous Clubs:</strong>
              <p className="mt-1 text-gray-400">
                {clubCareer.previous_clubs || "No previous clubs"}
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}