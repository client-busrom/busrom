export interface Country {
  code: string
  name: string
  flag: string
}

export interface Language {
  code: string
  name: string
  nativeName: string
}

export const countries: Record<string, Country[]> = {
  "North America": [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
  ],
  "South America": [
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "CO", name: "Colombia", flag: "🇨🇴" },
    { code: "GY", name: "Guyana", flag: "🇬🇾" },
    { code: "BS", name: "Bahamas", flag: "🇧🇸" },
    { code: "PA", name: "Panama", flag: "🇵🇦" },
    { code: "UY", name: "Uruguay", flag: "🇺🇾" },
    { code: "CL", name: "Chile", flag: "🇨🇱" },
    { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
    { code: "AR", name: "Argentina", flag: "🇦🇷" },
    { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
    { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹" },
  ],
  Europe: [
    { code: "AT", name: "Austria", flag: "🇦🇹" },
    { code: "BE", name: "Belgium", flag: "🇧🇪" },
    { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
    { code: "DK", name: "Denmark", flag: "🇩🇰" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "HU", name: "Hungary", flag: "🇭🇺" },
    { code: "IE", name: "Ireland", flag: "🇮🇪" },
    { code: "IS", name: "Iceland", flag: "🇮🇸" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "NO", name: "Norway", flag: "🇳🇴" },
    { code: "PL", name: "Poland", flag: "🇵🇱" },
    { code: "SK", name: "Slovakia", flag: "🇸🇰" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "SE", name: "Sweden", flag: "🇸🇪" },
    { code: "CH", name: "Switzerland", flag: "🇨🇭" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "FI", name: "Finland", flag: "🇫🇮" },
  ],
  Africa: [
    { code: "SC", name: "Seychelles", flag: "🇸🇨" },
    { code: "MU", name: "Mauritius", flag: "🇲🇺" },
    { code: "GA", name: "Gabon", flag: "🇬🇦" },
    { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶" },
    { code: "EG", name: "Egypt", flag: "🇪🇬" },
    { code: "BW", name: "Botswana", flag: "🇧🇼" },
    { code: "DZ", name: "Algeria", flag: "🇩🇿" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "LY", name: "Libya", flag: "🇱🇾" },
    { code: "TN", name: "Tunisia", flag: "🇹🇳" },
    { code: "SZ", name: "Eswatini", flag: "🇸🇿" },
    { code: "NA", name: "Namibia", flag: "🇳🇦" },
    { code: "CV", name: "Cabo Verde", flag: "🇨🇻" },
    { code: "MA", name: "Morocco", flag: "🇲🇦" },
    { code: "AO", name: "Angola", flag: "🇦🇴" },
  ],
  "Middle East": [
    { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "QA", name: "Qatar", flag: "🇶🇦" },
    { code: "BH", name: "Bahrain", flag: "🇧🇭" },
    { code: "KW", name: "Kuwait", flag: "🇰🇼" },
    { code: "IL", name: "Israel", flag: "🇮🇱" },
    { code: "TR", name: "Turkey", flag: "🇹🇷" },
    { code: "OM", name: "Oman", flag: "🇴🇲" },
    { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
    { code: "LB", name: "Lebanon", flag: "🇱🇧" },
    { code: "JO", name: "Jordan", flag: "🇯🇴" },
    { code: "IR", name: "Iran", flag: "🇮🇷" },
    { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  ],
  Oceania: [
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
    { code: "PW", name: "Palau", flag: "🇵🇼" },
    { code: "NR", name: "Nauru", flag: "🇳🇷" },
    { code: "FJ", name: "Fiji", flag: "🇫🇯" },
    { code: "TV", name: "Tuvalu", flag: "🇹🇻" },
    { code: "TO", name: "Tonga", flag: "🇹🇴" },
    { code: "WS", name: "Samoa", flag: "🇼🇸" },
    { code: "MH", name: "Marshall Islands", flag: "🇲🇭" },
    { code: "FM", name: "Micronesia", flag: "🇫🇲" },
    { code: "KI", name: "Kiribati", flag: "🇰🇮" },
    { code: "VU", name: "Vanuatu", flag: "🇻🇺" },
    { code: "PG", name: "Papua New Guinea", flag: "🇵🇬" },
    { code: "SB", name: "Solomon Islands", flag: "🇸🇧" },
  ],
  "Rest Of The World": [{ code: "ROW", name: "Rest Of The World", flag: "🌍" }],
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ber", name: "Berber", nativeName: "Tamazight" },
  { code: "ku", name: "Kurdish", nativeName: "Kurdî" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
]

// 默认设置
export const DEFAULT_COUNTRY = "US"
export const DEFAULT_LANGUAGE = "en"

// 获取国家信息
export function getCountryByCode(code: string): Country | undefined {
  for (const region of Object.values(countries)) {
    const country = region.find((c) => c.code === code)
    if (country) return country
  }
  return undefined
}

// 获取语言信息
export function getLanguageByCode(code: string): Language | undefined {
  return languages.find((l) => l.code === code)
}

// 获取所有国家的扁平列表
export function getAllCountries(): Country[] {
  return Object.values(countries).flat()
}

// 根据语言代码推断默认国家
// 用于首次访问时根据 URL locale 设置合理的默认国家
export function getCountryFromLocale(locale: string): string {
  const localeToCountry: Record<string, string> = {
    'zh': 'CN',  // 中文 -> 中国
    'en': 'US',  // 英文 -> 美国
    'es': 'ES',  // 西班牙语 -> 西班牙
    'fr': 'FR',  // 法语 -> 法国
    'de': 'DE',  // 德语 -> 德国
    'pt': 'BR',  // 葡萄牙语 -> 巴西
    'nl': 'NL',  // 荷兰语 -> 荷兰
    'da': 'DK',  // 丹麦语 -> 丹麦
    'no': 'NO',  // 挪威语 -> 挪威
    'sv': 'SE',  // 瑞典语 -> 瑞典
    'fi': 'FI',  // 芬兰语 -> 芬兰
    'is': 'IS',  // 冰岛语 -> 冰岛
    'cs': 'CZ',  // 捷克语 -> 捷克
    'hu': 'HU',  // 匈牙利语 -> 匈牙利
    'pl': 'PL',  // 波兰语 -> 波兰
    'sk': 'SK',  // 斯洛伐克语 -> 斯洛伐克
    'it': 'IT',  // 意大利语 -> 意大利
    'ar': 'SA',  // 阿拉伯语 -> 沙特阿拉伯
    'tr': 'TR',  // 土耳其语 -> 土耳其
    'he': 'IL',  // 希伯来语 -> 以色列
    'fa': 'IR',  // 波斯语 -> 伊朗
    'az': 'AZ',  // 阿塞拜疆语 -> 阿塞拜疆
  }
  return localeToCountry[locale] || DEFAULT_COUNTRY
}
