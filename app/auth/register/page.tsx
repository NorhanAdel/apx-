"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import {
  REGISTER_MUTATION,
  GOOGLE_REGISTER_MUTATION,
} from "@/app/graphql/mutation/auth.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  role: "PLAYER" | "SCOUT" | "AGENT" | "CLUB" | "USER";
};

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSuccess, setGoogleSuccess] = useState(false);
  const [error, setError] = useState("");

  const getRegisterSchema = useMemo(() => {
    return z.object({
      username: z.string().min(3, t("Username must be at least 3 characters")),
      email: z.string().email(t("Invalid email address")),
      password: z.string().min(6, t("Password must be at least 6 characters")),
      role: z.enum(["PLAYER", "SCOUT", "AGENT", "CLUB", "USER"]),
    });
  }, [t]);

  const registerSchema = getRegisterSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "USER",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchGraphQL<{ register: { message: string } }>(
        REGISTER_MUTATION,
        { input: data },
      );

      if (result.data?.register) {
        localStorage.setItem("pending_email", data.email);
        toast.success(
          t("Registration successful! OTP has been sent to your email."),
        );
        router.push("/auth/verify-otp");
      } else if (result.errors) {
        const errorMsg = result.errors[0].message;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(t("Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setGoogleSuccess(false);

      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );
        const userInfo = await userInfoResponse.json();

        const fullUsername = userInfo.email.split("@")[0];
        const username = fullUsername.slice(0, 30);

        const result = await fetchGraphQL<{ googleRegister: string }>(
          GOOGLE_REGISTER_MUTATION,
          {
            input: {
              email: userInfo.email,
              username: username,
              googleId: userInfo.sub,
            },
          },
        );

        if (result.data?.googleRegister) {
          localStorage.setItem("pending_email", userInfo.email);
          setGoogleSuccess(true);
          toast.success(
            t("Google registration successful! Check your email for the OTP."),
          );
          router.push("/auth/verify-otp");
        } else if (result.errors) {
          toast.error(result.errors[0].message);
          setIsGoogleLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(t("Failed to register with Google. Please try again."));
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setIsGoogleLoading(false);
      toast.error(t("Failed to sign in with Google. Please try again."));
    },
    flow: "implicit",
  });

  const handleGoogleRegister = () => {
    googleLogin();
  };

  return (
    <div className="relative min-h-screen py-20 flex items-center justify-center px-4">
      <Image src="/b3.jpg" alt="bg" fill className="object-cover" />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md px-6 sm:px-8 md:px-10 py-8 sm:py-10 rounded-xl sm:rounded-2xl bg-[#090B6E]/30 backdrop-blur-2xl border border-white/10 shadow-2xl my-10 sm:my-16 md:my-20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 italic mb-6 sm:mb-8">
          {t("Register")}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 sm:mb-6">
            <label className="text-gray-200 font-semibold text-sm">
              {t("Username")}
            </label>
            <div className="flex items-center mt-2 bg-white/30 rounded-xl px-3 sm:px-4">
              <User size={18} className="text-blue-900 mr-2 sm:mr-3" />
              <input
                type="text"
                placeholder={t("Username")}
                className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base"
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="text-gray-200 font-semibold text-sm">
              {t("Email")}
            </label>
            <div className="flex items-center mt-2 bg-white/30 rounded-xl px-3 sm:px-4">
              <Mail size={18} className="text-blue-900 mr-2 sm:mr-3" />
              <input
                type="email"
                placeholder={t("Email")}
                className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="text-gray-200 font-semibold text-sm">
              {t("Password")}
            </label>
            <div className="flex items-center mt-2 bg-white/30 rounded-xl px-3 sm:px-4">
              <Lock size={18} className="text-blue-900 mr-2 sm:mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("Password")}
                className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-blue-900"
              >
                <Eye size={18} />
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="text-gray-200 font-semibold text-sm">
              {t("Role")}
            </label>
            <div className="mt-2 bg-white/30 rounded-xl px-3 sm:px-4">
              <select
                className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base"
                {...register("role")}
              >
                <option value="USER" className="text-black">
                  {t("User")}
                </option>
                <option value="PLAYER" className="text-black">
                  {t("Player")}
                </option>
                <option value="SCOUT" className="text-black">
                  {t("Scout")}
                </option>
                <option value="AGENT" className="text-black">
                  {t("Agent")}
                </option>
                <option value="CLUB" className="text-black">
                  {t("Club")}
                </option>
              </select>
            </div>
            {errors.role && (
              <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-[#0b2a6b] text-white rounded-xl border-l-4 border-r-4 border-yellow-400 font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? t("Registering...") : t("Register")}
          </button>
        </form>

        <button
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading || googleSuccess}
          className="mt-4 w-full py-2.5 sm:py-3 rounded-xl border border-black/40 text-white flex items-center justify-center gap-3 hover:bg-white/10 transition disabled:opacity-50"
        >
          <Image
            src="/icons8-google-48.png"
            alt="Google Icon"
            width={20}
            height={20}
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
          />
          {isGoogleLoading
            ? t("Processing...")
            : googleSuccess
            ? t("OTP Sent! Redirecting...")
            : t("Register With Google")}
        </button>

        <p className="text-center text-xs sm:text-sm mt-4 sm:mt-5 text-gray-300">
          {t("Already have an account?")}{" "}
          <Link href="/auth/login" className="text-yellow-400 hover:underline">
            {t("Login")}
          </Link>
        </p>
      </div>
    </div>
  );
}