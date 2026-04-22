"use client";

import { useRef, useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATION ================= */

const T: any = {
  en: {
    title: "Scout Profile",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    city: "City",
    nationality: "Nationality",
    birthDate: "Birth Date",
    back: "Back",
    saving: "Saving...",
    create: "Create",
    update: "Update",
  },
  ar: {
    title: "ملف الكشاف",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    country: "الدولة",
    city: "المدينة",
    nationality: "الجنسية",
    birthDate: "تاريخ الميلاد",
    back: "رجوع",
    saving: "جاري الحفظ...",
    create: "إنشاء",
    update: "تحديث",
  },
};

/* ================= GRAPHQL ================= */

const CREATE_SCOUT_PROFILE = `
mutation CreateScoutProfile($profile_image: Upload, $input: CreateScoutProfileInput!) {
  createScoutProfile(profile_image: $profile_image, input: $input) {
    id
  }
}
`;

const UPDATE_SCOUT_PROFILE = `
mutation UpdateMyScoutProfile($input: UpdateScoutProfileInput!) {
  updateMyScoutProfile(input: $input) {
    id
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
    birth_date
    profile_image_url
  }
}
`;

export default function PersonalInformation() {
  const router = useRouter();
  const { theme } = useTheme();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const t = T[lang] || T.en;

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
  });

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ query: MY_SCOUT_PROFILE }),
        });

        const json = await res.json();
        const p = json?.data?.myScoutProfile;

        if (p) {
          setExists(true);

          setForm({
            first_name: p.first_name || "",
            last_name: p.last_name || "",
            bio: p.bio || "",
            country: p.country || "",
            city: p.city || "",
            nationality: p.nationality || "",
            email_address: p.email_address || "",
            phone: p.phone || "",
            birth_date: p.birth_date?.split("T")[0] || "",
          });

          // ✅ الصورة الصح
          if (p.profile_image_url) {
            setPreview(
              p.profile_image_url.startsWith("http")
                ? p.profile_image_url
                : `${API_URL}${p.profile_image_url}`
            );
          }
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

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (exists) {
        // UPDATE (بدون صورة)
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            query: UPDATE_SCOUT_PROFILE,
            variables: { input: form },
          }),
        });

        const json = await res.json();

        if (json?.errors) {
          toast.error(json.errors[0].message);
          setLoading(false);
          return;
        }

        toast.success(t.update);
      } else {
        // CREATE (مع صورة)
        const formData = new FormData();

        formData.append(
          "operations",
          JSON.stringify({
            query: CREATE_SCOUT_PROFILE,
            variables: {
              input: form,
              profile_image: null,
            },
          })
        );

        formData.append(
          "map",
          JSON.stringify({
            file: ["variables.profile_image"],
          })
        );

        if (image) formData.append("file", image);

        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        });

        const json = await res.json();

        if (json?.errors) {
          toast.error(json.errors[0].message);
          setLoading(false);
          return;
        }

        toast.success(t.create);
      }

      router.push("/scout/profile/clubcareer");
    } catch (err) {
      console.log(err);
      toast.error("Error");
    }

    setLoading(false);
  };

  if (fetching) return <div>{t.saving}</div>;

  return (
    <div className={`min-h-screen flex justify-center py-30 items-center p-6 ${
      theme === "dark" ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
    }`}>
      <div className="w-full max-w-5xl">

        {/* HEADER ICONS */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
            <User className="text-yellow-500" size={18} />
          </div>

          <div className="w-20 h-[1px] bg-gray-400"></div>

          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
            <LayoutGrid size={18} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-10 text-yellow-500">
          {t.title}
        </h1>

        {/* IMAGE */}
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
            className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
          >
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <User size={30} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* FORM */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input icon={User} label={t.firstName} name="first_name" value={form.first_name} onChange={handleChange} />
          <Input icon={User} label={t.lastName} name="last_name" value={form.last_name} onChange={handleChange} />
          <Input icon={Mail} label={t.email} name="email_address" value={form.email_address} onChange={handleChange} />
          <Input icon={Phone} label={t.phone} name="phone" value={form.phone} onChange={handleChange} />
          <Input icon={Globe} label={t.country} name="country" value={form.country} onChange={handleChange} />
          <Input icon={MapPin} label={t.city} name="city" value={form.city} onChange={handleChange} />
          <Input icon={Globe} label={t.nationality} name="nationality" value={form.nationality} onChange={handleChange} />
          <Input icon={Calendar} label={t.birthDate} name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-10">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ChevronLeft /> {t.back}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-yellow-500 px-6 py-2 rounded font-bold"
          >
            {loading ? t.saving : exists ? t.update : t.create}
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