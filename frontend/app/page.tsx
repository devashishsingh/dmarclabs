import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'DMARC Labs — Free DMARC RUA Report Analyzer | No Login, Files Never Stored',
  description:
    'Parse, merge and analyze multiple DMARC RUA XML files instantly. Upload up to 100 MB — .gz and .zip supported. No account needed, files never stored. Free single report or $5 for 2 full reports with PDF export.',
  keywords: [
    'DMARC RUA parser',
    'bulk DMARC report analyzer',
    'DMARC XML reader',
    'parse DMARC gz file',
    'DMARC aggregate report no login',
  ],
  alternates: {
    canonical: 'https://www.dmarclabsds1.xyz/',
  },
  verification: {
    google: 'googlec38bf89a55d491da',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.dmarclabsds1.xyz/',
    title: 'DMARC Labs — Free DMARC RUA Report Analyzer | No Login, Files Never Stored',
    description:
      'Bulk upload your DMARC RUA files. Get a comprehensive report instantly. No account, no storage, download and go.',
    siteName: 'DMARC Labs',
  },
  twitter: {
    card: 'summary',
    title: 'DMARC RUA Report Analyzer — DMARC Labs',
    description: 'Bulk upload DMARC RUA files. Instant report. No login required.',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DMARC Labs Report Analyzer',
  url: 'https://www.dmarclabsds1.xyz',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '5.00',
    priceCurrency: 'USD',
    description: '2 full DMARC reports with PDF export',
  },
  description:
    'Bulk DMARC RUA report parser and analyzer. Upload multiple .gz or .zip files up to 100MB. No account required, files never stored.',
  featureList: [
    'Bulk .gz and .zip upload up to 100MB',
    'No login or account required',
    'Files never stored',
    'PDF and CSV export',
    'Multi-file aggregation',
    'Syntax error detection',
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <HomePageClient />
    </>
  );
}
