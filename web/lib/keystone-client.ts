/**
 * Keystone GraphQL Client
 *
 * This module provides a configured Apollo Client for communicating
 * with the Keystone CMS GraphQL API.
 *
 * Usage:
 * ```typescript
 * import { keystoneClient } from '@/lib/keystone-client'
 * import { gql } from '@apollo/client'
 *
 * const { data } = await keystoneClient.query({
 *   query: gql`
 *     query GetHomePage {
 *       homePage {
 *         heroHeadline_en
 *         heroSubheadline_en
 *       }
 *     }
 *   `
 * })
 * ```
 */

import { ApolloClient, InMemoryCache, HttpLink, DefaultOptions } from '@apollo/client'

/**
 * Keystone GraphQL API URL
 *
 * Falls back to localhost if environment variable is not set
 */
const KEYSTONE_GRAPHQL_URL = process.env.CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql'

/**
 * Apollo Client Default Options
 *
 * Configure default behavior for queries and mutations
 */
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all',
  },
}

/**
 * Apollo HTTP Link
 *
 * Configures the HTTP connection to Keystone GraphQL API
 */
const httpLink = new HttpLink({
  uri: KEYSTONE_GRAPHQL_URL,
  credentials: 'include', // Include cookies for authenticated requests
  fetchOptions: {
    cache: 'no-store', // Disable fetch cache for server-side rendering
  },
})

/**
 * Apollo In-Memory Cache Configuration
 *
 * Configure how GraphQL data is cached
 */
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Custom field policies can be defined here
        // Example: Configure pagination for product lists
      },
    },
  },
})

/**
 * Keystone Apollo Client Instance
 *
 * This is the main client used throughout the application
 * to communicate with Keystone CMS.
 */
export const keystoneClient = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions,
  ssrMode: typeof window === 'undefined', // Enable SSR mode on server
  connectToDevTools: process.env.NODE_ENV === 'development',
})

/**
 * GraphQL Query Builder Helpers
 *
 * These functions generate common GraphQL queries with multi-language support
 */

/**
 * Get localized field names for a given locale
 *
 * @param baseField - The base field name (e.g., "name")
 * @param locale - The locale code (e.g., "en", "zh")
 * @returns The localized field name (e.g., "name_en", "name_zh")
 */
export function getLocalizedField(baseField: string, locale: string): string {
  return `${baseField}_${locale}`
}

/**
 * Generate a list of localized field names
 *
 * @param baseFields - Array of base field names
 * @param locale - The locale code
 * @returns Array of localized field names
 *
 * @example
 * getLocalizedFields(['name', 'description'], 'en')
 * // Returns: ['name_en', 'description_en']
 */
export function getLocalizedFields(baseFields: string[], locale: string): string[] {
  return baseFields.map((field) => getLocalizedField(field, locale))
}

/**
 * Common GraphQL Fragments
 *
 * Reusable fragments for common data structures
 */
export const fragments = {
  /**
   * Media Fragment
   *
   * Standard fields for media/image data
   */
  media: `
    fragment MediaFields on Media {
      id
      filename
      file {
        url
        width
        height
      }
    }
  `,
}

/**
 * Error Handler for GraphQL Queries
 *
 * @param error - The error object from Apollo Client
 */
export function handleGraphQLError(error: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('GraphQL Error:', error)
  }
  // In production, you might want to send errors to a logging service
  // Example: Sentry.captureException(error)
}
