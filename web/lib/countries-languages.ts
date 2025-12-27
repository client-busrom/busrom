export interface Country {
  code: string
  name: string
  shortName: string  // 缩写名称，用于 header 显示
  flag: string
}

export interface Language {
  code: string
  name: string
  nativeName: string
}

export const countries: Record<string, Country[]> = {
  "North America": [
    { code: "US", name: "United States", shortName: "USA", flag: "🇺🇸" },
    { code: "CA", name: "Canada", shortName: "CAN", flag: "🇨🇦" },
  ],
  "South America": [
    { code: "MX", name: "Mexico", shortName: "MEX", flag: "🇲🇽" },
    { code: "BR", name: "Brazil", shortName: "BRA", flag: "🇧🇷" },
    { code: "CO", name: "Colombia", shortName: "COL", flag: "🇨🇴" },
    { code: "GY", name: "Guyana", shortName: "GUY", flag: "🇬🇾" },
    { code: "BS", name: "Bahamas", shortName: "BHS", flag: "🇧🇸" },
    { code: "PA", name: "Panama", shortName: "PAN", flag: "🇵🇦" },
    { code: "UY", name: "Uruguay", shortName: "URY", flag: "🇺🇾" },
    { code: "CL", name: "Chile", shortName: "CHL", flag: "🇨🇱" },
    { code: "CR", name: "Costa Rica", shortName: "CRI", flag: "🇨🇷" },
    { code: "AR", name: "Argentina", shortName: "ARG", flag: "🇦🇷" },
    { code: "DO", name: "Dominican Republic", shortName: "DOM", flag: "🇩🇴" },
    { code: "TT", name: "Trinidad and Tobago", shortName: "TTO", flag: "🇹🇹" },
  ],
  Europe: [
    { code: "AT", name: "Austria", shortName: "AUT", flag: "🇦🇹" },
    { code: "BE", name: "Belgium", shortName: "BEL", flag: "🇧🇪" },
    { code: "CZ", name: "Czech Republic", shortName: "CZE", flag: "🇨🇿" },
    { code: "DK", name: "Denmark", shortName: "DNK", flag: "🇩🇰" },
    { code: "DE", name: "Germany", shortName: "DEU", flag: "🇩🇪" },
    { code: "HU", name: "Hungary", shortName: "HUN", flag: "🇭🇺" },
    { code: "IE", name: "Ireland", shortName: "IRL", flag: "🇮🇪" },
    { code: "IS", name: "Iceland", shortName: "ISL", flag: "🇮🇸" },
    { code: "IT", name: "Italy", shortName: "ITA", flag: "🇮🇹" },
    { code: "LU", name: "Luxembourg", shortName: "LUX", flag: "🇱🇺" },
    { code: "NL", name: "Netherlands", shortName: "NLD", flag: "🇳🇱" },
    { code: "NO", name: "Norway", shortName: "NOR", flag: "🇳🇴" },
    { code: "PL", name: "Poland", shortName: "POL", flag: "🇵🇱" },
    { code: "SK", name: "Slovakia", shortName: "SVK", flag: "🇸🇰" },
    { code: "ES", name: "Spain", shortName: "ESP", flag: "🇪🇸" },
    { code: "SE", name: "Sweden", shortName: "SWE", flag: "🇸🇪" },
    { code: "CH", name: "Switzerland", shortName: "CHE", flag: "🇨🇭" },
    { code: "GB", name: "United Kingdom", shortName: "GBR", flag: "🇬🇧" },
    { code: "FI", name: "Finland", shortName: "FIN", flag: "🇫🇮" },
  ],
  Africa: [
    { code: "SC", name: "Seychelles", shortName: "SYC", flag: "🇸🇨" },
    { code: "MU", name: "Mauritius", shortName: "MUS", flag: "🇲🇺" },
    { code: "GA", name: "Gabon", shortName: "GAB", flag: "🇬🇦" },
    { code: "GQ", name: "Equatorial Guinea", shortName: "GNQ", flag: "🇬🇶" },
    { code: "EG", name: "Egypt", shortName: "EGY", flag: "🇪🇬" },
    { code: "BW", name: "Botswana", shortName: "BWA", flag: "🇧🇼" },
    { code: "DZ", name: "Algeria", shortName: "DZA", flag: "🇩🇿" },
    { code: "ZA", name: "South Africa", shortName: "ZAF", flag: "🇿🇦" },
    { code: "LY", name: "Libya", shortName: "LBY", flag: "🇱🇾" },
    { code: "TN", name: "Tunisia", shortName: "TUN", flag: "🇹🇳" },
    { code: "SZ", name: "Eswatini", shortName: "SWZ", flag: "🇸🇿" },
    { code: "NA", name: "Namibia", shortName: "NAM", flag: "🇳🇦" },
    { code: "CV", name: "Cabo Verde", shortName: "CPV", flag: "🇨🇻" },
    { code: "MA", name: "Morocco", shortName: "MAR", flag: "🇲🇦" },
    { code: "AO", name: "Angola", shortName: "AGO", flag: "🇦🇴" },
  ],
  "Middle East": [
    { code: "AE", name: "United Arab Emirates", shortName: "UAE", flag: "🇦🇪" },
    { code: "SA", name: "Saudi Arabia", shortName: "SAU", flag: "🇸🇦" },
    { code: "QA", name: "Qatar", shortName: "QAT", flag: "🇶🇦" },
    { code: "BH", name: "Bahrain", shortName: "BHR", flag: "🇧🇭" },
    { code: "KW", name: "Kuwait", shortName: "KWT", flag: "🇰🇼" },
    { code: "IL", name: "Israel", shortName: "ISR", flag: "🇮🇱" },
    { code: "TR", name: "Turkey", shortName: "TUR", flag: "🇹🇷" },
    { code: "OM", name: "Oman", shortName: "OMN", flag: "🇴🇲" },
    { code: "AZ", name: "Azerbaijan", shortName: "AZE", flag: "🇦🇿" },
    { code: "LB", name: "Lebanon", shortName: "LBN", flag: "🇱🇧" },
    { code: "JO", name: "Jordan", shortName: "JOR", flag: "🇯🇴" },
    { code: "IR", name: "Iran", shortName: "IRN", flag: "🇮🇷" },
    { code: "IQ", name: "Iraq", shortName: "IRQ", flag: "🇮🇶" },
  ],
  Oceania: [
    { code: "AU", name: "Australia", shortName: "AUS", flag: "🇦🇺" },
    { code: "NZ", name: "New Zealand", shortName: "NZL", flag: "🇳🇿" },
    { code: "PW", name: "Palau", shortName: "PLW", flag: "🇵🇼" },
    { code: "NR", name: "Nauru", shortName: "NRU", flag: "🇳🇷" },
    { code: "FJ", name: "Fiji", shortName: "FJI", flag: "🇫🇯" },
    { code: "TV", name: "Tuvalu", shortName: "TUV", flag: "🇹🇻" },
    { code: "TO", name: "Tonga", shortName: "TON", flag: "🇹🇴" },
    { code: "WS", name: "Samoa", shortName: "WSM", flag: "🇼🇸" },
    { code: "MH", name: "Marshall Islands", shortName: "MHL", flag: "🇲🇭" },
    { code: "FM", name: "Micronesia", shortName: "FSM", flag: "🇫🇲" },
    { code: "KI", name: "Kiribati", shortName: "KIR", flag: "🇰🇮" },
    { code: "VU", name: "Vanuatu", shortName: "VUT", flag: "🇻🇺" },
    { code: "PG", name: "Papua New Guinea", shortName: "PNG", flag: "🇵🇬" },
    { code: "SB", name: "Solomon Islands", shortName: "SLB", flag: "🇸🇧" },
  ],
  "Rest Of The World": [{ code: "ROW", name: "Rest Of The World", shortName: "ROW", flag: "🌍" }],
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
