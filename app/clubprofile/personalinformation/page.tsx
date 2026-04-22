"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import {
  User, Mail, Lock, CheckCircle, X, Eye, EyeOff, ImagePlus
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function PersonalInformation() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  return (
    <div className={`min-h-screen py-38 md:p-12 flex justify-center font-sans transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className={`p-8 rounded-2xl max-w-sm w-full text-center relative
            ${isDark
              ? "bg-[#0A1A44] border border-[#FFD700]/50"
              : "bg-white border border-green-300"}`}>

            <button onClick={() => setShowSuccess(false)} className="absolute top-4 right-4 text-gray-400">
              <X size={20} />
            </button>

            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500">
              <CheckCircle size={40} className="text-green-500" />
            </div>

            <h2 className={`${isDark ? "text-[#FFD700]" : "text-green-600"} text-2xl font-bold`}>
              Done!
            </h2>

            <p className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mb-6`}>
              تمت إضافة بيانات النادي بنجاح
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-yellow-400 text-black rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full space-y-8 py-38">

        <h1 className={`text-center text-4xl font-black uppercase mb-10
          ${isDark ? "text-[#FFD700]" : "text-yellow-600"}`}>
          Personal Information
        </h1>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Image Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition
            ${isDark
              ? "border-[#FFD700]/40 bg-[#051139]/30 hover:bg-[#051139]/50"
              : "border-yellow-400 bg-white hover:bg-gray-50"}`}
        >
          {imagePreview ? (
            <Image src={imagePreview} alt="Preview" width={200} height={200} className="rounded-xl" />
          ) : (
            <>
              <ImagePlus size={40} className="text-yellow-500" />
              <p className="mt-3 text-sm text-gray-500">Click To Add Photo</p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">

          {/* Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
            <input
              placeholder="Name Of Club"
              className={`w-full py-4 pl-12 rounded-xl
                ${isDark
                  ? "bg-[#0A1A44]/40 border border-blue-900 text-white"
                  : "bg-white border border-gray-300 text-black"}`}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
            <input
              placeholder="Email"
              className={`w-full py-4 pl-12 rounded-xl
                ${isDark
                  ? "bg-[#0A1A44]/40 border border-blue-900 text-white"
                  : "bg-white border border-gray-300 text-black"}`}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full py-4 pl-12 pr-12 rounded-xl
                ${isDark
                  ? "bg-[#0A1A44]/40 border border-blue-900 text-white"
                  : "bg-white border border-gray-300 text-black"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-10">
            <button
              type="button"
              className={`px-6 py-3 rounded-xl
              ${isDark ? "bg-[#051139]" : "bg-gray-200"}`}
            >
              Previous
            </button>

            <button
              type="submit"
              className={`px-10 py-3 rounded-xl
              ${isDark
                ? "bg-[#0A1A44] text-white hover:bg-[#FFD700] hover:text-black"
                : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
            >
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}