<<<<<<< HEAD
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";

type Blog = {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
};

export default function BlogDetails({ lang }: { lang: string }) {
  const { theme } = useTheme();
  const { t } = useTranslate(lang); // 👈 نفس السلايدر

  const params = useParams();
  const blogId = params.id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    fetchBlog();
  }, [lang, blogId]);

  const fetchBlog = async () => {
    if (!blogId) return;

    setLoading(true);

    const query = `
      query GetBlog($id: ID!) {
        blog(id: $id) {
          id
          title
          content
          cover_image_url
          created_at
        }
      }
    `;

    const result = await fetchGraphQL<{ blog: Blog }>(
      query,
      { id: blogId },
      lang // 🔥 نفس السلايدر (بس هنا مهم جدًا)
    );

    if (result.data?.blog) {
      setBlog(result.data.blog);
    } else {
      setBlog(null);
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("loading") || "Loading..."}
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("not_found") || "Blog not found"}
      </div>
    );

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-28 ${
        theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-6xl w-full grid md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border ${
          theme === "dark" ? "border-blue-900" : "border-gray-300"
        }`}
      >
        {/* IMAGE */}
        <div className="relative h-[100%]">
          <Image
            src={
              blog.cover_image_url
                ? blog.cover_image_url.startsWith("http")
                  ? blog.cover_image_url
                  : `${process.env.NEXT_PUBLIC_API_URL}${blog.cover_image_url}`
                : "/b3.jpg"
            }
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>

        {/* TEXT */}
        <div
          className={`p-10 ${
            theme === "dark"
              ? "bg-[#06122a] text-white"
              : "bg-white text-black"
          }`}
        >
          <h1 className="text-4xl font-bold text-[#F0B100] mb-6">
            {blog.title}
          </h1>

          {/* 👇 نفس السلايدر */}
          <p className="text-sm opacity-70 mb-4">
            {new Date(blog.created_at).toLocaleDateString(lang)}
          </p>

          <div className="space-y-4 text-[18px] leading-relaxed">
            {blog.content.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
=======
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
}

export default function BlogDetails() {
  const { theme } = useTheme();  
  const params = useParams();
  const blogId = params.id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetBlog($id: ID!) {
                blog(id: $id) {
                  id
                  title
                  content
                  cover_image_url
                  created_at
                }
              }
            `,
            variables: { id: blogId },
          }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();

        if (json.errors) {
          throw new Error(json.errors.map((e: any) => e.message).join(", "));
        }

        const fetchedBlog = json.data.blog;

        if (!fetchedBlog) {
          setBlog(null);
        } else {
          setBlog({
            ...fetchedBlog,
            cover_image_url: fetchedBlog.cover_image_url || "/b3.jpg",
            created_at: new Date(fetchedBlog.created_at).toLocaleDateString(),
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch blog:", err);
        setError(err.message || "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"
        }`}
      >
        Loading blog...
      </div>
    );

  if (error)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617] text-red-500" : "bg-white text-red-600"
        }`}
      >
        {error}
      </div>
    );

  if (!blog)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"
        }`}
      >
        Blog not found
      </div>
    );

  return (
    <section
      dir="ltr"
      className={`min-h-screen flex items-center justify-center px-6 py-28 ${
        theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-6xl w-full grid md:grid-cols-2 rounded-xl  overflow-hidden shadow-2xl border ${
          theme === "dark" ? "border-blue-900" : "border-gray-300"
        }`}
      >
        {/* Image */}
        <div className="relative h-[100%]">
          <Image
            src={
              blog.cover_image_url?.startsWith("http")
                ? blog.cover_image_url
                : `${API_URL}${blog.cover_image_url}`
            }
            alt={blog.title}
            fill
            className="object-cover"
          />
          <div
            className={`absolute inset-0 ${
              theme === "dark"
                ? "bg-gradient-to-r from-[#020617]/10 via-[#020617]/40 to-[#020617]"
                : "bg-gradient-to-r from-white/10 via-white/40 to-white"
            }`}
          />
        </div>

        {/* Text Side */}
        <div
          className={`relative p-10 ${
            theme === "dark" ? "bg-[#06122a] text-white" : "bg-white text-black"
          }`}
        >
          <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')]" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-[#F0B100] mb-6 leading-snug">{blog.title}</h1>

            <div
              className={`space-y-4 text-[18px] leading-relaxed ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {blog.content.split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div
              className={`text-right mt-8 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-[#F0B100]"
              }`}
            >
              {blog.created_at}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
>>>>>>> b1046433e9941efc0e9f48827d5ef1886c47a34d
}