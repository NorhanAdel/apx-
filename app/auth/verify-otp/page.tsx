"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  VERIFY_OTP_MUTATION,
  RESEND_OTP_MUTATION,
} from "@/app/graphql/mutation/auth.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

type UserRole = "PLAYER" | "CLUB" | "ADMIN" | "SCOUT" | "AGENT";

interface User {
  id: string;
  email: string;
  role: UserRole;
  playerProfile?: { id: string; full_name: string };
  clubProfile?: { id: string; club_name: string };
  scoutProfile?: { id: string; full_name: string };
  agentProfile?: { id: string; full_name: string };
}

type OtpFormData = z.infer<
  z.ZodObject<{
    otp: z.ZodString;
  }>
>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const { t } = useTranslate();
  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpSchema = useMemo(() => {
    return z.object({
      otp: z.string().length(6, t("Please enter the full 6-digit code")),
    });
  }, [t]);

  const {
    formState: { errors },
    setValue,
    trigger,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem("pending_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/auth/login");
    }

    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [router, timer]);

  const getProfileLink = (user: User): string => {
    switch (user.role) {
      case "PLAYER":
        if (user.playerProfile?.id) {
          return `/profile/player/${user.playerProfile.id}`;
        }
        return "/profile";

      case "CLUB":
        if (user.clubProfile?.id) {
          return `/club/${user.clubProfile.id}`;
        }
        return "/club/profile";

      case "ADMIN":
        return "/admin/dashboard";

      case "SCOUT":
        if (user.scoutProfile?.id) {
          return `/scout/${user.scoutProfile.id}`;
        }
        return "/scout/profile";

      case "AGENT":
        if (user.agentProfile?.id) {
          return `/agent/${user.agentProfile.id}`;
        }
        return "/agent/profile";

      default:
        return "/";
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text");
    const pasteData = data.replace(/\D/g, "").slice(0, 6).split("");

    if (pasteData.length > 0) {
      const newOtp = [...otpValues];
      pasteData.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtpValues(newOtp);
      const otpString = newOtp.join("");
      setValue("otp", otpString, { shouldValidate: true });
      const lastIndex = Math.min(pasteData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);
    const otpString = newOtp.join("");
    setValue("otp", otpString, { shouldValidate: true });
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (otpValues[index]) {
        const newOtp = [...otpValues];
        newOtp[index] = "";
        setOtpValues(newOtp);
        const otpString = newOtp.join("");
        setValue("otp", otpString, { shouldValidate: true });
      } else if (index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        const otpString = newOtp.join("");
        setValue("otp", otpString, { shouldValidate: true });
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      if (index < 5) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otpValues.join("");

    const isValid = await trigger("otp");
    if (!isValid) return;

    setLoading(true);

    try {
      const result = await fetchGraphQL<{
        verifyOtp: { token: string; user: User };
      }>(VERIFY_OTP_MUTATION, { input: { email, otp: otpString } });

      if (result.data?.verifyOtp) {
        const { token, user } = result.data.verifyOtp;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("pending_email");

        toast.success(
          t(`Welcome ${user.role}! Account verified successfully.`),
        );

        const redirectPath = getProfileLink(user);
        router.push(redirectPath);
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(t("Connection error. Failed to verify OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);

    try {
      const result = await fetchGraphQL<{ resendOtp: string }>(
        RESEND_OTP_MUTATION,
        { input: { email } },
      );

      if (result.data?.resendOtp) {
        setTimer(30);
        toast.success(t("A new code has been sent to your email."));
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch {
      toast.error(t("Failed to resend code. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden">
      <Image src="/b3.jpg" alt="bg" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/40"></div>

      <div
        style={{
          width: "740px",
          minHeight: "517px",
          background:
            "radial-gradient(98.05% 338.02% at 51.21% 50%, rgba(0, 0, 0, 0.6) 0%, rgba(9, 11, 110, 0.6) 100%)",
          backdropFilter: "blur(40px)",
          border: "1px solid #021448",
        }}
        className="relative max-w-full p-8 sm:p-16 rounded-[16px] shadow-2xl text-center flex flex-col justify-center items-center"
      >
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 italic mb-8 sm:mb-10">
          {t("Verify OTP")}
        </h2>

        <p className="text-center text-sm mb-6 -mt-4 text-gray-300">
          {t("Enter the 6-digit code sent to")}{" "}
          <span className="text-yellow-400 font-semibold">{email}</span>
        </p>

        <form
          onSubmit={handleVerify}
          className="w-full max-w-[560px] flex flex-col gap-[30px] sm:gap-[40px]"
        >
          <div className="grid grid-cols-6 gap-2 w-full">
            {otpValues.map((data, index) => {
              const opacity = 0.1 + index * 0.12;
              return (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={data}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  style={{ backgroundColor: `rgba(2, 20, 72, ${opacity})` }}
                  className="w-full h-16 sm:h-24 text-center text-xl sm:text-3xl font-bold text-white border-l-2 border-r-2 border-yellow-400 rounded-xl outline-none backdrop-blur-md transition-all focus:shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                />
              );
            })}
          </div>
          {errors.otp && (
            <p className="text-red-400 text-xs text-center -mt-2">
              {errors.otp.message}
            </p>
          )}

          <div className="flex flex-col gap-4 w-full">
            <button
              type="submit"
              disabled={loading || otpValues.join("").length < 6}
              className="w-full py-2.5 sm:py-3 bg-[#0b2a6b] text-white rounded-xl border-l-4 border-r-4 border-yellow-400 font-semibold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("Verifying...") : t("Verify OTP")}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timer > 0 || loading}
              className="w-full py-2.5 sm:py-3 bg-transparent text-gray-200 rounded-xl border-l-4 border-r-4 border-yellow-400 font-semibold hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {timer > 0 ? `${t("Resend Code")} (${timer}s)` : t("Resend Code")}
            </button>
          </div>
        </form>

        <p className="text-center text-xs sm:text-sm mt-8 text-gray-300">
          {t("Back to")}{" "}
          <Link
            href="/auth/login"
            className="text-yellow-400 font-semibold hover:underline transition"
          >
            {t("Login")}
          </Link>
        </p>
      </div>
    </div>
  );
}