import { MetadataRoute } from 'next';

const SITE_URL = 'https://www.dmarclabsds1.xyz';

const blogPosts = [
  { slug: 'analyze-large-dmarc-xml-reports-securely', date: '2025-07-01' },
  { slug: 'large-dmarc-xml-analyzer', date: '2025-07-02' },
  { slug: 'dmarc-report-privacy-security', date: '2025-07-03' },
  { slug: 'why-dmarc-tools-fail-large-files', date: '2025-07-04' },
  { slug: 'how-to-read-dmarc-xml-report', date: '2025-07-05' },
  { slug: 'ip-enrichment-email-security-dmarc', date: '2025-07-06' },
  { slug: 'dmarc-xml-report-fields-explained', date: '2025-07-07' },
  { slug: 'dmarc-report-for-gmail', date: '2025-07-08' },
  { slug: 'dmarc-fail-but-dkim-pass', date: '2025-07-09' },
  { slug: 'dmarc-rua-vs-ruf', date: '2025-07-10' },
  { slug: 'dmarc-policy-none-quarantine-reject', date: '2025-07-11' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: SITE_URL + '/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
    {
      url: SITE_URL + '/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: SITE_URL + '/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
