import { cookies } from "next/headers"
import { DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from "@/lib/countries-languages"
export async function getUserPreferencesFromCookies(): Promise<{ country: string; language: string }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user-preferences")?.value

  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw))
      return {
        country: parsed.country || DEFAULT_COUNTRY,
        language: parsed.language || DEFAULT_LANGUAGE,
      }
    } catch (error) {
      console.error("Failed to parse user-preferences cookie:", error)
    }
  }

  return {
    country: DEFAULT_COUNTRY,
    language: DEFAULT_LANGUAGE,
  }
}
