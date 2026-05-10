import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — DMARC Labs',
  description:
    'Get in touch with DMARC Labs for support, feedback, or to request access for files larger than 100MB.',
  robots: 'index, follow',
  alternates: { canonical: 'https://www.dmarclabsds1.xyz/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
