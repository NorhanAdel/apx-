"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState("en");

  
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);
  }, []);

  // ✅ تغيير اللغة + حفظها
  const changeLang = (newLang: string) => {
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  };

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <GoogleOAuthProvider clientId="889740084185-xxxx.apps.googleusercontent.com">
          <AuthProvider>
            <ThemeProvider>
    
              <Toaster position="top-center" />

             
              <Navbar lang={lang} setLang={changeLang} />

            
              <main className="min-h-screen">{children}</main>

           
              <Footer lang={lang} />
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}