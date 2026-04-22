"use client";

import { useEffect, useState } from "react";

export default function useTranslate(langFromProps?: string) {
  const [lang, setLang] = useState(langFromProps || "en");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedLang = langFromProps || localStorage.getItem("lang") || "en";
    setLang(savedLang);

    const load = async () => {
      try {
        const file = await import(`../locales/${savedLang}.json`);
        setTranslations(file.default);
      } catch {
        const fallback = await import(`../locales/en.json`);
        setTranslations(fallback.default);
      }
    };

    load();
  }, [langFromProps]);

  const t = (key: string) => translations[key] ?? key;

  return { t, lang };
}