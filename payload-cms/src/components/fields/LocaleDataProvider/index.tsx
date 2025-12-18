'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { SUPPORTED_LOCALES, type LocaleCode } from '../../../lib/locales'

interface LocaleData {
  [locale: string]: Record<string, unknown>
}

interface LocaleDataContextValue {
  data: LocaleData
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  getFieldValue: (fieldPath: string, locale: LocaleCode) => unknown
}

const LocaleDataContext = createContext<LocaleDataContextValue | null>(null)

/**
 * Hook to access locale data context
 */
export function useLocaleData() {
  const context = useContext(LocaleDataContext)
  if (!context) {
    throw new Error('useLocaleData must be used within a LocaleDataProvider')
  }
  return context
}

/**
 * Hook to check if we're inside a LocaleDataProvider
 */
export function useHasLocaleDataProvider() {
  return useContext(LocaleDataContext) !== null
}

interface LocaleDataProviderProps {
  children: React.ReactNode
}

/**
 * LocaleDataProvider - Fetches all locale data once and shares it across components
 *
 * Uses Payload's locale=all parameter to get all localized content in a single request,
 * dramatically reducing the number of API calls needed.
 */
export function LocaleDataProvider({ children }: LocaleDataProviderProps) {
  const { id, collectionSlug, globalSlug } = useDocumentInfo()
  const [data, setData] = useState<LocaleData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  const fetchAllLocales = useCallback(async () => {
    if (!id) {
      // New document - no data to fetch
      setIsLoading(false)
      return
    }

    const endpoint = collectionSlug
      ? `/api/${collectionSlug}/${id}`
      : `/api/globals/${globalSlug}`

    try {
      // Fetch all locales in parallel (more reliable than locale=all which may not work in all versions)
      const results = await Promise.all(
        SUPPORTED_LOCALES.map(async (locale) => {
          try {
            const res = await fetch(`${endpoint}?locale=${locale.code}&depth=0`)
            if (!res.ok) {
              console.warn(`Failed to fetch locale ${locale.code}`)
              return { locale: locale.code, data: null }
            }
            const localeData = await res.json()
            return { locale: locale.code, data: localeData }
          } catch (err) {
            console.warn(`Error fetching locale ${locale.code}:`, err)
            return { locale: locale.code, data: null }
          }
        })
      )

      const localeData: LocaleData = {}
      results.forEach(result => {
        if (result.data) {
          localeData[result.locale] = result.data
        }
      })

      setData(localeData)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch locale data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch locale data')
    } finally {
      setIsLoading(false)
    }
  }, [id, collectionSlug, globalSlug])

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchAllLocales()
  }, [fetchAllLocales])

  const getFieldValue = useCallback((fieldPath: string, locale: LocaleCode): unknown => {
    const localeData = data[locale]
    if (!localeData) return undefined

    // Handle nested paths like "attributes" or "content.description"
    return fieldPath.split('.').reduce((acc: unknown, key: string) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key]
      }
      return undefined
    }, localeData)
  }, [data])

  const refetch = useCallback(async () => {
    hasFetchedRef.current = false
    setIsLoading(true)
    await fetchAllLocales()
  }, [fetchAllLocales])

  return (
    <LocaleDataContext.Provider value={{ data, isLoading, error, refetch, getFieldValue }}>
      {children}
    </LocaleDataContext.Provider>
  )
}

export default LocaleDataProvider
