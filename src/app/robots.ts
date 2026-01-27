import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://venturescope.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/terms'],
        disallow: ['/dashboard/', '/api/', '/settings/', '/companies/', '/assessments/', '/team/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
