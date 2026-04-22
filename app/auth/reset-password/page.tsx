"use client";
import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RESET_PASSWORD_MUTATION } from "@/app/graphql/mutation/auth.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

type ResetPasswordFormData = z.infer<
  z.ZodObject<{
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
  }>
>;

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { t } = useTranslate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPasswordSchema = useMemo(() => {
    return z
      .object({
        newPassword: z
          .string()
          .min(6, t("Password must be at least 6 characters")),
        confirmPassword: z
          .string()
          .min(6, t("Password must be at least 6 characters")),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: t("Passwords do not match"),
        path: ["confirmPassword"],
      });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!token || !email) {
      toast.error(t("Invalid reset link. Please request a new one."));
      router.push("/auth/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const result = await fetchGraphQL<{ resetPassword: string }>(
        RESET_PASSWORD_MUTATION,
        {
          input: {
            email: email,
            token: token,
            newPassword: data.newPassword,
          },
        },
      );

      if (result.data) {
        toast.success(t("Password Reset Successfully!"), {
          description: t("Your password has been updated. You can now log in."),
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch {
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/b3.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

      <div className="relative w-full max-w-md px-6 sm:px-8 md:px-10 py-8 sm:py-10 rounded-xl sm:rounded-2xl bg-[#0a1a3a]/40 backdrop-blur-2xl border border-white/10 shadow-2xl my-20 sm:my-16 md:my-20">
        <h1 className="text-4xl font-black italic text-center text-yellow-500 mb-10 uppercase tracking-tighter">
          {t("Reset Password")}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-bold italic text-sm text-white">
              {t("New Password")}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/80">
                <Lock size={18} />
              </span>
              <input
                type={showNewPassword ? "text" : "password"}
                className="w-full bg-[#2d3055]/60 border border-white/10 rounded-xl py-4 px-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] transition-all"
                placeholder={t("Password")}
                {...register("newPassword")}
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-bold italic text-sm text-white">
              {t("Confirm Password")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/80">
                <Lock size={18} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-[#2d3055]/60 border border-white/10 rounded-xl py-4 px-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#facc15] transition-all"
                placeholder={t("Password")}
                {...register("confirmPassword")}
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#051139] border-x-3 border-[#facc15]/80 text-white font-black italic text-sm uppercase rounded-lg hover:bg-[#08184d] transition-all disabled:opacity-50"
          >
            {loading ? t("Resetting...") : t("Reset Password")}
          </button>
        </form>
      </div>
    </div>
  );
}