 
import React from "react";

interface Player {
  height_cm?: number | null;
  weight_kg?: number | null;
  nationality?: string | null;
  country?: string | null;
  city?: string | null;
  updated_at?: string | Date | null;
}

interface ClubCareerProps {
  player: Player | null | undefined;
}

export default function ClubCareer({ player }: ClubCareerProps) {
  if (!player) return null;

  return (
    <div className="mt-8 text-left">
      <h3 className="text-yellow-400 font-semibold mb-3">Player Information</h3>

      <ul className="text-gray-300 text-sm space-y-2">
        <li>
          <strong>Height:</strong>{" "}
          {player.height_cm ? (player.height_cm / 100).toFixed(2) : "N/A"}m
        </li>
        <li>
          <strong>Weight:</strong>{" "}
          {player.weight_kg ? `${player.weight_kg} kg` : "N/A"}
        </li>
        <li>
          <strong>Nationality:</strong> {player.nationality || "N/A"}
        </li>
        <li>
          <strong>Country:</strong> {player.country || "N/A"}
        </li>
        <li>
          <strong>City:</strong> {player.city || "N/A"}
        </li>
        <li>
          <strong>Last Updated:</strong>{" "}
          {player.updated_at
            ? new Date(player.updated_at).toLocaleDateString()
            : "N/A"}
        </li>
      </ul>
    </div>
  );
}
 
// "use client";

// import { useEffect, useState } from "react";

// interface FootballData {
//   id: string;
//   player_id: string;
//   position?: string;
//   preferred_foot?: string;
//   jersey_number?: number;
//   playing_style?: string;
//   strengths?: string;
//   market_value?: number;
//   description?: string;
// }

// interface Props {
//   playerId: string;
// }

// export default function FootballInfo({ playerId }: Props) {
//   const [footballInfo, setFootballInfo] = useState<FootballData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   useEffect(() => {
//     const fetchFootballInfo = async () => {
//       if (!playerId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const query = `
//           query GetPlayerFootballInfo($playerId: ID!) {
//             playerFootballInfo(playerId: $playerId) {
//               id
//               player_id
//               position
//               preferred_foot
//               jersey_number
//               playing_style
//               strengths
//               market_value
//               description
//             }
//           }
//         `;

//         const res = await fetch(`${API_URL}/graphql`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ query, variables: { playerId } }),
//         });

//         const json = await res.json();

//         if (json.errors) {
//           console.error("GraphQL Errors:", json.errors);
//           setError("Failed to load football info.");
//           return;
//         }

//         const data = json.data?.playerFootballInfo;
//         setFootballInfo(Array.isArray(data) ? data[0] || null : data || null);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load football info.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFootballInfo();
//   }, [playerId]);

//   if (loading) return <p className="text-gray-400 text-center mt-4">Loading football info...</p>;
//   if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;
//   if (!footballInfo) return <p className="text-gray-400 text-center mt-4">No football info available.</p>;

//   return (
//     <div className="mt-8 text-left">
//       <h3 className="text-yellow-400 font-semibold mb-3">Football Info</h3>
//       <ul className="space-y-2 text-gray-300 text-left text-sm">
//         <li>Position: {footballInfo.position || "N/A"}</li>
//         <li>Preferred Foot: {footballInfo.preferred_foot || "N/A"}</li>
//         <li>Jersey Number: {footballInfo.jersey_number ?? "N/A"}</li>
//         <li>Playing Style: {footballInfo.playing_style || "N/A"}</li>
//         <li>Strengths: {footballInfo.strengths || "N/A"}</li>
//         <li>Market Value: {footballInfo.market_value ?? "N/A"}</li>
//         {footballInfo.description && <li>Description: {footballInfo.description}</li>}
//       </ul>
//     </div>
//   );
// }
 