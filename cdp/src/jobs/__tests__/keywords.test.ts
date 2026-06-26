import { describe, expect, it } from 'vitest'
import {
  buildSearchKeywords,
  detectSearchEngine,
  extractKeywordFromReferrer,
} from '../keywords'

describe('detectSearchEngine', () => {
  it('recognizes Google', () => {
    expect(
      detectSearchEngine('https://www.google.com/search?q=busrom')
    ).toBe('google')
  })

  it('recognizes Bing', () => {
    expect(
      detectSearchEngine('https://www.bing.com/search?q=busrom')
    ).toBe('bing')
  })

  it('recognizes Baidu', () => {
    expect(detectSearchEngine('https://www.baidu.com/s?wd=busrom')).toBe(
      'baidu'
    )
  })

  it('returns null for non-search referrers', () => {
    expect(detectSearchEngine('https://example.com/article')).toBeNull()
  })
})

describe('extractKeywordFromReferrer', () => {
  it('extracts the "q" parameter', () => {
    expect(
      extractKeywordFromReferrer('https://www.google.com/search?q=hello+world')
    ).toBe('hello world')
  })

  it('extracts the "query" parameter', () => {
    expect(
      extractKeywordFromReferrer(
        'https://search.yahoo.com/search?query=busrom+shoes'
      )
    ).toBe('busrom shoes')
  })

  it('extracts the "wd" parameter for Baidu', () => {
    expect(
      extractKeywordFromReferrer('https://www.baidu.com/s?wd=%E6%90%9C%E7%B4%A2')
    ).toBe('搜索')
  })

  it('returns null when no keyword parameter is present', () => {
    expect(
      extractKeywordFromReferrer('https://www.google.com/search?client=safari')
    ).toBeNull()
  })
})

describe('buildSearchKeywords', () => {
  it('aggregates clicks by date, keyword and pagePath', () => {
    const rawData = [
      {
        pagePath: '/products',
        channel: 'organic',
        referrer: 'https://www.google.com/search?q=running+shoes',
      },
      {
        pagePath: '/products',
        channel: 'organic',
        referrer: 'https://www.google.com/search?q=running+shoes',
      },
      {
        pagePath: '/about',
        channel: 'organic',
        referrer: 'https://www.google.com/search?q=running+shoes',
      },
    ]

    const result = buildSearchKeywords(rawData, '2026-06-23')

    expect(result).toHaveLength(2)

    const products = result.find((item) => item.pagePath === '/products')
    expect(products).toBeDefined()
    expect(products?.keyword).toBe('running shoes')
    expect(products?.clicks).toBe(2)

    const about = result.find((item) => item.pagePath === '/about')
    expect(about).toBeDefined()
    expect(about?.clicks).toBe(1)
  })

  it('uses utmTerm when present', () => {
    const rawData = [
      {
        pagePath: '/campaign',
        channel: 'paid',
        utmTerm: '  Summer Sale  ',
        utmSource: 'google',
      },
      {
        pagePath: '/campaign',
        channel: 'paid',
        utmTerm: 'summer sale',
        utmSource: 'google',
      },
    ]

    const result = buildSearchKeywords(rawData, '2026-06-23')
    expect(result).toHaveLength(1)
    expect(result[0].keyword).toBe('summer sale')
    expect(result[0].clicks).toBe(2)
    expect(result[0].searchEngine).toBe('google')
  })
})
