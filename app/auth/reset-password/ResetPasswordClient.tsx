"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { RESET_PASSWORD_MUTATION } from "@/app/graphql/mutations/auth.mutations";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Invalid reset link");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: RESET_PASSWORD_MUTATION,
          variables: {
            input: {
              email,
              token,
              newPassword,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.data?.resetPassword) {
        toast.success("Password Reset Successfully!");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error(result.errors?.[0]?.message || "Error");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4">
      <div className="w-full max-w-md p-6 rounded-xl bg-[#0a1a3a]/40 backdrop-blur border border-white/10">
        <h1 className="text-3xl text-yellow-500 font-bold text-center mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleReset} className="space-y-5">

          {/* New Password */}
          <div>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-3 rounded bg-[#2d3055] text-white"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-3 rounded bg-[#2d3055] text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-500 text-black font-bold rounded"
          >
            {loading ? "Loading..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}