/**
 * Generic JSON-LD structured data component.
 *
 * Usage:
 *   <JsonLd type="WebSite" data={{ name: '懒老板', url: '...' }} />
 *   <JsonLd type="Product" data={{ name: '...', description: '...' }} />
 *   <JsonLd type="Organization" data={{ name: '懒老板', url: '...' }} />
 *
 * Works in both server and client components.
 */

export type JsonLdType = 'WebSite' | 'Product' | 'Organization'

export interface JsonLdProps {
  type: JsonLdType
  data: Record<string, unknown>
}

export default function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
