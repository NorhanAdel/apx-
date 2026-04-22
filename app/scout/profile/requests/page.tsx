"use client";

import InboxList from "@/app/components/InboxList";
import SentList from "@/app/components/SentList";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";

export default function MessagesPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("inbox");

  return (
    <div className={`min-h-screen p-4 ${
      theme === "dark" ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"
    }`}>
      <div className="max-w-5xl py-32 mx-auto">

        <h1 className={`text-center text-2xl font-bold mb-6 italic ${
          theme === "dark" ? "text-yellow-400" : "text-yellow-600"
        }`}>
          Requests
        </h1>

        <div className={`flex border rounded-md mb-6 overflow-hidden ${
          theme === "dark" ? "border-[#1e293b]" : "border-gray-300"
        }`}>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 py-3 font-bold ${
              activeTab === "inbox"
                ? theme === "dark"
                  ? "bg-[#0f172a] text-yellow-400"
                  : "bg-gray-200 text-yellow-600"
                : "text-gray-400"
            }`}
          >
            Inbox
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-3 font-bold ${
              activeTab === "sent"
                ? theme === "dark"
                  ? "bg-[#0f172a] text-yellow-400"
                  : "bg-gray-200 text-yellow-600"
                : "text-gray-400"
            }`}
          >
            Sent
          </button>
        </div>

        {activeTab === "inbox" ? <InboxList /> : <SentList />}

        <Link href="/scout/profile/sendrequest">
          <button className={`w-full mt-8 py-4 rounded-md font-bold ${
            theme === "dark"
              ? "bg-[#081f55] border-x-2 border-yellow-400 text-white"
              : "bg-yellow-500 text-black"
          }`}>
            Send Request 📩
          </button>
        </Link>

      </div>
    </div>
  );
}