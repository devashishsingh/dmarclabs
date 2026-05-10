import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      // Allow AI crawlers explicitly — improves GEO (Generative Engine Optimization)
      // so tools like ChatGPT, Perplexity, and Gemini can index and cite content
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'Googlebot-Extended',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: 'https://www.dmarclabsds1.xyz/sitemap.xml',
    host: 'https://www.dmarclabsds1.xyz',
  };
}
