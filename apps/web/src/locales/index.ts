import type { SupportedLanguage, PageTranslations } from "./types";
import { cs } from "./cs";
import { en } from "./en";
import { de } from "./de";
import { sk } from "./sk";
import { pl } from "./pl";
import { uk } from "./uk";
import { ru } from "./ru";
import { zh } from "./zh";
import { ja } from "./ja";

export * from "./types";

export const LOCALES: Record<SupportedLanguage, PageTranslations> = {
  cs,
  en,
  de,
  sk,
  pl,
  uk,
  ru,
  zh,
  ja,
};

/**
 * Get translations for a specific page & language
 */
export function getTranslations(lang: SupportedLanguage = "cs"): PageTranslations {
  return LOCALES[lang] ?? LOCALES.cs;
}
