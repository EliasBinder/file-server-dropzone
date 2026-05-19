import en from "./en.json";
import de from "./de.json";

const languages = {
  en,
  de,
};

export const translate = (
  key: string,
  attributes?: Record<string, string>,
  language?: "en" | "de",
): string => {
  // Get browser language or fall back to English
  const browserLanguage = navigator.language.split("-")[0] as "en" | "de";
  language =
    language || (browserLanguage in languages ? browserLanguage : "en");

  let translation = languages[language][
    key as keyof (typeof languages)[typeof language]
  ] as string | undefined;
  if (!translation) {
    console.warn(
      `Translation for key "${key}" not found in language "${language}".`,
    );
    return key; // Fallback to the key itself if translation is missing
  }

  if (attributes) {
    for (const attr in attributes) {
      translation = translation.replace(`{{${attr}}}`, attributes[attr]!);
    }
  }

  return translation;
};
