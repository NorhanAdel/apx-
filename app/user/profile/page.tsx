"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  ImagePlus,
  ChevronDown,
} from "lucide-react";

import useTranslate from "../../hooks/useTranslate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

const GET_PROFILE = `
query {
  myUserProfile {
    id
    first_name
    last_name
    email_address
    phone
    country
    city
    profile_image_url
  }
}
`;

const CREATE = `
mutation CreateUserProfile($input: CreateUserProfileInput!, $profile_image: Upload) {
  createUserProfile(input: $input, profile_image: $profile_image) {
    id
  }
}
`;

const UPDATE = `
mutation UpdateMyUserProfile($input: UpdateUserProfileInput!, $profile_image: Upload) {
  updateMyUserProfile(input: $input, profile_image: $profile_image) {
    id
  }
}
`;

export default function PersonalInformationForm() {
  const { t } = useTranslate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone: "",
    country: "",
    city: "",
  });

  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ query: GET_PROFILE }),
      });

      const json = await res.json();
      const data = json?.data?.myUserProfile;

      if (data) {
        setHasProfile(true);

        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email_address: data.email_address || "",
          phone: data.phone || "",
          country: data.country || "",
          city: data.city || "",
        });

        if (data.profile_image_url) {
          const full = data.profile_image_url.startsWith("http")
            ? data.profile_image_url
            : `${API_URL}${data.profile_image_url}`;

          setPreview(full);
        }
      }
    };

    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const operations = JSON.stringify({
      query: hasProfile ? UPDATE : CREATE,
      variables: {
        input: form,
        profile_image: null,
      },
    });

    const map = JSON.stringify({
      0: ["variables.profile_image"],
    });

    const formData = new FormData();
    formData.append("operations", operations);
    formData.append("map", map);

    if (image) {
      formData.append("0", image);
    }

    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        "apollo-require-preflight": "true",
      },
      body: formData,
    });

    const json = await res.json();

    if (!json.errors) {
      alert(hasProfile ? t("updated") : t("created"));
      setHasProfile(true);
    } else {
      alert(json.errors[0].message);
    }

    setLoading(false);
  };

  const fields = [
    { key: "first_name", label: t("first_name"), icon: User },
    { key: "last_name", label: t("last_name"), icon: User },
    { key: "email_address", label: t("email_address"), icon: Mail },
    { key: "phone", label: t("phone_number"), icon: Phone },
  ];

  const selects = [
    { key: "country", label: t("country"), icon: Globe },
    { key: "city", label: t("city"), icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl py-30 relative">

        <h2 className="text-3xl font-black italic text-[#fbbf24] text-center mb-8 tracking-wider uppercase">
          {t("personal_information")}
        </h2>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border border-yellow-500/30 overflow-hidden flex items-center justify-center">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
        </div>

        <div className="space-y-8">

          <label className="border border-yellow-500/50 rounded-2xl p-12 bg-black/20 flex flex-col items-center justify-center cursor-pointer hover:bg-black/40 transition-all border-dashed group">

            {preview ? (
              <img
                src={preview}
                className="w-32 h-32 object-cover rounded-full mb-4"
              />
            ) : (
              <ImagePlus size={48} className="mb-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
            )}

            <p className="text-gray-400 font-medium italic">
              {t("add_profile_photo")}
            </p>

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setImage(file);
                setPreview(URL.createObjectURL(file));
              }}
            />

          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="text-white font-bold italic block ml-1 uppercase text-xs tracking-wide">
                  {field.label}
                </label>

                <div className="relative">
                  <field.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" />

                  <input
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white"
                  />
                </div>
              </div>
            ))}

            {selects.map((select, index) => (
              <div key={index} className="space-y-2">
                <label className="text-white font-bold italic block ml-1 uppercase text-xs tracking-wide">
                  {select.label}
                </label>

                <div className="relative">
                  <select.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" />

                  <input
                    value={form[select.key]}
                    onChange={(e) => handleChange(select.key, e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white"
                  />

                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500" />
                </div>
              </div>
            ))}

          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#0f172a] border-2 border-yellow-500 text-white font-black italic px-16 py-3 rounded-md uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
            >
              {loading ? t("loading") : hasProfile ? t("update") : t("submit")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}