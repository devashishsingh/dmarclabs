import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — DMARC Labs',
  description:
    'DMARC Labs privacy policy. We process DMARC XML files entirely in-memory and never store your data on disk or share it with third parties.',
  robots: 'index, follow',
};

const LAST_UPDATED = 'April 24, 2026';

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 pt-36 pb-20">
      {/* Page header */}
      <div className="mb-10 space-y-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-medium text-text-muted border border-white/10 rounded-full px-3 py-1 bg-white/[0.03]">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Privacy-first by design
        </span>
        <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-text-muted text-sm">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="prose-content space-y-10 text-text-secondary text-[15px] leading-relaxed">

        {/* TL;DR */}
        <section className="rounded-2xl border border-white/10 bg-card p-6 space-y-2">
          <h2 className="text-base font-semibold font-display text-text-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent rotate-45 block flex-shrink-0" style={{ boxShadow: '0 0 8px #ef233c' }} />
            TL;DR — The short version
          </h2>
          <ul className="space-y-1.5 text-sm text-text-muted list-none">
            <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Your DMARC XML files are processed entirely in RAM. Nothing is ever written to disk.</li>
            <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Sessions and all associated data are automatically deleted after 1 hour.</li>
            <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> We do not use advertising trackers, analytics cookies, or third-party marketing pixels.</li>
            <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> We do not sell, rent, or share your data with anyone.</li>
            <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> No account or sign-up is required.</li>
          </ul>
        </section>

        <Section title="1. Who we are">
          <p>
            DMARC Labs is a free, privacy-first tool for analyzing DMARC aggregate (rua) XML reports.
            The service is operated by an individual developer and is not affiliated with any
            corporation. For questions, use the{' '}
            <a href="/contact" className="text-accent hover:underline">contact form</a>.
          </p>
        </Section>

        <Section title="2. What data we collect and why">
          <Subsection heading="2.1 Uploaded files">
            <p>
              When you upload a DMARC XML report (or compressed .gz / .zip containing one), the file
              content is received by our API server and held exclusively in process memory for the
              duration of your session. It is never written to any database, object store, log file,
              or persistent medium. Once your session ends — either when you click "Purge Data", close
              the tab, or 1 hour elapses — the in-memory data is destroyed and is unrecoverable.
            </p>
          </Subsection>
          <Subsection heading="2.2 IP addresses in your report">
            <p>
              IP addresses extracted from your DMARC report are sent to the{' '}
              <a href="https://ip-api.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">ip-api.com</a>{' '}
              geolocation and ASN lookup service solely to enrich your analysis results (organisation
              name, country, threat classification). We do not log or retain these IP addresses.
              ip-api.com&apos;s own{' '}
              <a href="https://ip-api.com/docs/legal" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                privacy policy
              </a>{' '}
              applies to those requests.
            </p>
          </Subsection>
          <Subsection heading="2.3 Feedback submissions (optional)">
            <p>
              If you submit a rating or feedback comment via the in-app feedback widget, the content
              (emoji rating + optional text) is sent to our moderation email address. No personal
              identifier is attached; the submission is entirely voluntary.
            </p>
          </Subsection>
          <Subsection heading="2.4 Access requests (optional)">
            <p>
              If you submit a "Request higher limits" form, we collect your name and email address
              solely to respond to your request. This information is not used for marketing and is
              deleted after the request is resolved.
            </p>
          </Subsection>
          <Subsection heading="2.5 Server logs">
            <p>
              Our hosting infrastructure (Fly.io) may retain standard HTTP access logs (IP address,
              user agent, request path, status code) for up to 7 days for operational debugging.
              These logs are not analysed for commercial purposes.
            </p>
          </Subsection>
        </Section>

        <Section title="3. Cookies &amp; tracking">
          <p>
            DMARC Labs does <strong className="text-text-primary">not</strong> use cookies, local
            storage, or any client-side persistent identifiers. There are no analytics scripts (e.g.
            Google Analytics), advertising pixels, or social media tracking widgets on this site.
          </p>
          <p className="mt-3">
            The temporary session token used to associate your upload with your analysis result is
            stored only in React component state (in-memory in your browser tab). It is never written
            to <code className="font-mono text-xs text-accent bg-white/5 px-1 py-0.5 rounded">localStorage</code>,{' '}
            <code className="font-mono text-xs text-accent bg-white/5 px-1 py-0.5 rounded">sessionStorage</code>, or a cookie.
          </p>
        </Section>

        <Section title="4. Legal basis for processing (GDPR)">
          <p>
            DMARC Labs is accessible globally. For users in the European Economic Area (EEA) and
            the United Kingdom, our legal basis for processing is:
          </p>
          <ul className="mt-3 space-y-2 text-sm list-none">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5 font-bold">→</span>
              <span>
                <strong className="text-text-primary">Legitimate interests (Art. 6(1)(f) GDPR)</strong> — for
                processing uploaded file content and IP addresses to provide the requested analysis
                service. Our legitimate interest is delivering the analysis you explicitly requested.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5 font-bold">→</span>
              <span>
                <strong className="text-text-primary">Consent (Art. 6(1)(a) GDPR)</strong> — for
                optional feedback and access-request submissions, where you voluntarily provide
                personal information.
              </span>
            </li>
          </ul>
          <p className="mt-4">
            Because we do not retain any personal data beyond the 30-minute session window (or
            immediate purge on request), the data minimisation, storage limitation, and right to
            erasure principles under GDPR are satisfied by design.
          </p>
        </Section>

        <Section title="5. Your rights (GDPR / UK GDPR)">
          <p>
            As a data subject you have the following rights. Given our ephemeral architecture, most
            are satisfied automatically:
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ['Right of access', 'You can view all data in your session at any time via the results page.'],
              ['Right to erasure', 'Click "Purge Data" at any time to instantly delete your session. All data is auto-deleted after 1 hour regardless.'],
              ['Right to restriction', 'You may stop using the service at any time; no further processing occurs after session expiry.'],
              ['Right to portability', 'Download your results as CSV at any time before the session expires.'],
              ['Right to object', 'Contact us at devashish.singh12@gmail.com if you have objections to any processing.'],
              ['Right to lodge a complaint', 'You may lodge a complaint with your national supervisory authority (e.g. the ICO in the UK, or your local DPA in the EU).'],
            ].map(([right, desc]) => (
              <div key={right} className="flex gap-3">
                <span className="text-accent font-semibold whitespace-nowrap">{right}</span>
                <span className="text-text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="6. Data transfers">
          <p>
            IP-address lookup requests are processed by ip-api.com, whose servers may be located
            outside the EEA. These requests contain only the IP addresses from your DMARC report —
            no personal data belonging to you as the user. No transfer of personal data to third
            countries occurs.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            All data in transit is encrypted via TLS 1.2+. Our API enforces file-size limits, rate
            limiting, strict CORS policies, and security headers (CSP, HSTS, X-Frame-Options) via
            the Helmet middleware. In-memory session data is isolated per session ID (a
            cryptographically random UUID v4).
          </p>
        </Section>

        <Section title="8. Children">
          <p>
            DMARC Labs is not directed at children under the age of 16. We do not knowingly collect
            personal information from children.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this Privacy Policy to reflect changes in our practices or for legal
            reasons. When we do, we will update the "Last updated" date at the top of this page.
            Continued use of the service after changes are posted constitutes acceptance of the
            updated policy.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For privacy-related enquiries, please use our{' '}
            <Link href="/contact" className="text-accent hover:underline">
              contact form
            </Link>
            . We aim to respond within 5 business days.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold font-display text-text-primary border-b border-white/5 pb-2">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Subsection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 mt-4">
      <h3 className="text-sm font-semibold text-text-primary">{heading}</h3>
      {children}
    </div>
  );
}
