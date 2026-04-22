"use client";

import { useRef, useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

const CREATE_SCOUT_PROFILE = `
mutation CreateScoutProfile($profile_image: Upload, $input: CreateScoutProfileInput!) {
  createScoutProfile(profile_image: $profile_image, input: $input) {
    id
    first_name
    last_name
    bio
    country
    city
    nationality
    email_address
    phone
    search_regions
    birth_date
    profile_image_url
    is_verified
    created_at
  }
}
`;

const UPDATE_MY_SCOUT_PROFILE = `
mutation UpdateMyScoutProfile($input: UpdateScoutProfileInput!) {
  updateMyScoutProfile(input: $input) {
    id
    first_name
    last_name
    profile_image_url
  }
}
`;

const MY_SCOUT_PROFILE = `
query {
  myScoutProfile {
    id
    first_name
    last_name
    bio
    country
    city
    nationality
    email_address
    phone
    search_regions
    birth_date
    profile_image_url
  }
}
`;

export default function PersonalInformation() {
  const router = useRouter();
  const { theme } = useTheme();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    country: "",
    city: "",
    nationality: "",
    email_address: "",
    phone: "",
    birth_date: "",
    search_regions: "Africa",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: MY_SCOUT_PROFILE }),
        });

        const json = await res.json();
        const profile = json?.data?.myScoutProfile;

        if (profile) {
          setExists(true);

          setForm({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            bio: profile.bio || "",
            country: profile.country || "",
            city: profile.city || "",
            nationality: profile.nationality || "",
            email_address: profile.email_address || "",
            phone: profile.phone || "",
            birth_date: profile.birth_date?.split("T")[0] || "",
            search_regions: profile.search_regions?.[0] || "Africa",
          });

          setPreview(profile.profile_image_url || null);
        }
      } catch (err) {
        console.log(err);
      }

      setFetching(false);
    };

    load();
  }, []);

  const handleChange = (e: any) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const input = {
        ...form,
        search_regions: Array.isArray(form.search_regions)
          ? form.search_regions
          : [form.search_regions],
      };

      let result;

      if (exists) {
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            query: UPDATE_MY_SCOUT_PROFILE,
            variables: { input },
          }),
        });

        result = await res.json();
      } else {
        const formData = new FormData();

        formData.append(
          "operations",
          JSON.stringify({
            query: CREATE_SCOUT_PROFILE,
            variables: {
              input,
              profile_image: null,
            },
          })
        );

        formData.append(
          "map",
          JSON.stringify({
            "0": ["variables.profile_image"],
          })
        );

        if (image) formData.append("0", image);

        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        });

        result = await res.json();
      }

      if (result?.errors) {
        alert(result.errors[0].message);
        setLoading(false);
        return;
      }

      alert(exists ? "Updated Successfully" : "Created Successfully");

      router.push("/scout/profile/clubcareer");
    } catch (err) {
      console.log(err);
      alert("Error happened");
    }

    setLoading(false);
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className={`min-h-screen flex justify-center py-30 items-center p-6 ${
      theme === "dark" ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
    }`}>
      <div className="w-full max-w-5xl">

        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
            <User className="text-yellow-500" size={18} />
          </div>

          <div className={`w-20 h-[1px] ${
            theme === "dark" ? "bg-gray-600" : "bg-gray-400"
          }`}></div>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === "dark" ? "bg-[#0f1c3d]" : "bg-gray-200"
          }`}>
            <LayoutGrid size={18} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-10 text-yellow-500">
          Scout Profile
        </h1>

        <div className="flex justify-center mb-10">
          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }}
          />

          <div
            onClick={() => fileRef.current?.click()}
            className="w-80 h-40 border-2 border-dashed flex items-center justify-center rounded-xl cursor-pointer overflow-hidden"
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Plus />
                Upload Photo
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input icon={User} label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <Input icon={User} label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
          <Input icon={Mail} label="Email" name="email_address" value={form.email_address} onChange={handleChange} />
          <Input icon={Phone} label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input icon={Globe} label="Country" name="country" value={form.country} onChange={handleChange} />
          <Input icon={MapPin} label="City" name="city" value={form.city} onChange={handleChange} />
          <Input icon={Globe} label="Nationality" name="nationality" value={form.nationality} onChange={handleChange} />
          <Input icon={Calendar} label="Birth Date" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />

          <div className="md:col-span-2 relative">
            <FileText className="absolute left-3 top-4 text-gray-400" size={18} />
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full h-32 border p-3 pl-10 rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-between mt-10">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ChevronLeft /> Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-yellow-500 px-6 py-2 rounded font-bold"
          >
            {loading ? "Saving..." : exists ? "Update" : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
}

function Input({ label, icon: Icon, ...props }: any) {
  return (
    <div>
      <label className="text-sm font-bold">{label}</label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input {...props} className="w-full border p-2 pl-10 rounded-lg" />
      </div>
    </div>
  );
}