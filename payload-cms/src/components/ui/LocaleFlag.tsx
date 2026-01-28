'use client'

import React from 'react'
import { Globe } from 'lucide-react'

// Import SVG strings for each flag
import US from 'country-flag-icons/string/3x2/US'
import CN from 'country-flag-icons/string/3x2/CN'
import ES from 'country-flag-icons/string/3x2/ES'
import FR from 'country-flag-icons/string/3x2/FR'
import DE from 'country-flag-icons/string/3x2/DE'
import JP from 'country-flag-icons/string/3x2/JP'
import KR from 'country-flag-icons/string/3x2/KR'
import BR from 'country-flag-icons/string/3x2/BR'
import IT from 'country-flag-icons/string/3x2/IT'
import NL from 'country-flag-icons/string/3x2/NL'
import PL from 'country-flag-icons/string/3x2/PL'
import RU from 'country-flag-icons/string/3x2/RU'
import SA from 'country-flag-icons/string/3x2/SA'
import TH from 'country-flag-icons/string/3x2/TH'
import VN from 'country-flag-icons/string/3x2/VN'
import ID from 'country-flag-icons/string/3x2/ID'
import MY from 'country-flag-icons/string/3x2/MY'
import TR from 'country-flag-icons/string/3x2/TR'
import IN from 'country-flag-icons/string/3x2/IN'
import BD from 'country-flag-icons/string/3x2/BD'
import SE from 'country-flag-icons/string/3x2/SE'
import DK from 'country-flag-icons/string/3x2/DK'
import NO from 'country-flag-icons/string/3x2/NO'
import FI from 'country-flag-icons/string/3x2/FI'

// Map locale codes to SVG strings
const FLAG_SVGS: Record<string, string> = {
  en: US,
  zh: CN,
  es: ES,
  fr: FR,
  de: DE,
  ja: JP,
  ko: KR,
  pt: BR,
  it: IT,
  nl: NL,
  pl: PL,
  ru: RU,
  ar: SA,
  th: TH,
  vi: VN,
  id: ID,
  ms: MY,
  tr: TR,
  hi: IN,
  bn: BD,
  sv: SE,
  da: DK,
  no: NO,
  fi: FI,
}

interface LocaleFlagProps {
  localeCode: string
  className?: string
  style?: React.CSSProperties
}

export const LocaleFlag: React.FC<LocaleFlagProps> = ({
  localeCode,
  className = '',
  style,
}) => {
  const svgString = FLAG_SVGS[localeCode]

  if (!svgString) {
    return <Globe className={className} style={style} />
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-block', lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  )
}

export default LocaleFlag
