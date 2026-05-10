import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Note, Tip, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'How to Read Your Google DMARC Report — Gmail Aggregate Report Guide',
  description:
    'Google sends DMARC aggregate reports daily to every domain. Learn what a Google DMARC report contains, how to open the XML, and what each field means for your email deliverability.',
  keywords: [
    'google dmarc report',
    'gmail dmarc aggregate report',
    'how to read google dmarc report',
    'dmarc report from google',
    'google dmarc xml',
    'noreply-dmarc-support@google.com',
    'dmarc aggregate report gmail',
    'google mail dmarc',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://dmarclabsds1.xyz/blog/dmarc-report-for-gmail',
  },
  openGraph: {
    title: 'How to Read Your Google DMARC Report — Gmail Aggregate Report Guide',
    description:
      'Google sends DMARC aggregate reports daily to every domain. Learn what the report contains, how to open it, and what your pass rate means.',
    url: 'https://dmarclabsds1.xyz/blog/dmarc-report-for-gmail',
    siteName: 'DMARC Labs',
    type: 'article',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why am I receiving emails from noreply-dmarc-support@google.com?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You are receiving emails from noreply-dmarc-support@google.com because you have published a DMARC record for your domain with an rua= tag pointing to your email address. Google is sending you a daily DMARC aggregate report summarising how Gmail handled mail that claimed to be from your domain in the past 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does a Google DMARC report look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Google DMARC report is a compressed file (usually .xml.gz or a ZIP) attached to an email from noreply-dmarc-support@google.com. The attachment contains a standard DMARC aggregate XML file with report_metadata (org_name: Google LLC), policy_published (your DMARC policy as seen by Google), and one or more record elements showing each source IP, message count, and DKIM/SPF authentication results.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I open a Google DMARC XML file?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The attachment is usually a .gz or .zip compressed file. Decompress it to get the .xml file inside. You can then open it in a text editor, but the raw XML is difficult to read. The easiest way to analyze a Google DMARC report is to upload the compressed file directly to DMARC Labs — it accepts .xml, .gz, and .zip formats and shows the data in a human-readable dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a good DMARC pass rate for Google reports?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For a domain with a mature email setup, you should target a 95%+ DMARC pass rate in Google reports. A pass rate below 90% typically indicates misconfigured senders or active spoofing. Before moving to p=quarantine or p=reject, your pass rate should be consistently above 95% for at least two to four weeks.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does Google send DMARC reports but other providers do not?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All major email providers send DMARC aggregate reports — not just Google. You may also receive reports from Microsoft (from dmarcreport@microsoft.com), Yahoo (from postmaster@dmarc.yahoo.com), and many others. Google is simply the most common source because Gmail processes the largest volume of email globally. If you are only receiving reports from Google, check your rua= address is correctly configured and monitor your spam folder for reports from other providers.',
      },
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Read Your Google DMARC Report — Gmail Aggregate Report Guide',
  description:
    'Google sends DMARC aggregate reports daily to every domain. Learn what a Google DMARC report contains and how to act on it.',
  datePublished: '2025-07-08',
  dateModified: '2025-07-08',
  author: { '@type': 'Organization', name: 'DMARC Labs' },
  publisher: { '@type': 'Organization', name: 'DMARC Labs', url: 'https://dmarclabsds1.xyz' },
  mainEntityOfPage: 'https://dmarclabsds1.xyz/blog/dmarc-report-for-gmail',
  wordCount: 2600,
};

export default function Page() {
  return (
    <BlogPostLayout
      title="How to Read Your Google DMARC Report — Gmail Aggregate Report Guide"
      description="Google sends DMARC aggregate reports daily to every domain. Learn what a Google DMARC report contains, how to open the XML, and what your pass rate means."
      date="2025-07-08"
      readTime="9 min read"
      tags={['DMARC', 'Gmail', 'Google']}
      jsonLd={[faqJsonLd, articleJsonLd]}
    >
      <Lead>
        If you run any domain that sends email, Google is already sending you a daily XML
        file detailing exactly how Gmail handled your mail. Most domain owners never open it.
        The ones who do can catch spoofing, fix deliverability problems, and confidently move
        to full email enforcement.
      </Lead>

      <H2>Why you are receiving emails from Google</H2>
      <P>
        When you publish a DMARC record for your domain, you include an{' '}
        <Code>rua=</Code> tag — the address where receiving mail servers should send
        aggregate reports. The format looks like this:
      </P>
      <Pre>{`v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com`}</Pre>
      <P>
        Google honors this tag. Every day, Gmail sends a compressed XML file to your{' '}
        <Code>rua=</Code> address summarising every message it received that claimed to be
        from your domain in the previous 24 hours. The sender is{' '}
        <Code>noreply-dmarc-support@google.com</Code>.
      </P>
      <Note>
        <Strong>What is a DMARC aggregate report?</Strong> — An XML file sent by a receiving
        mail server (like Gmail) to a domain owner. It lists every source IP that sent mail
        claiming to be from your domain, the authentication results (DKIM and SPF), how many
        messages each source sent, and how Gmail handled them based on your DMARC policy.
      </Note>

      <H2>What the Google DMARC email looks like</H2>
      <P>
        The email from Google arrives with a subject line in the format:
      </P>
      <Pre>{`Report domain: yourdomain.com
Submitter: google.com
Report-ID: <17XXXXXXXXXXXXXXXXX>`}</Pre>
      <P>
        The attachment is named in this format and is always compressed:
      </P>
      <Pre>{`google.com!yourdomain.com!1751241600!1751327999.xml.gz`}</Pre>
      <P>
        The filename encodes: the reporting organization (<Code>google.com</Code>), your
        domain (<Code>yourdomain.com</Code>), the Unix timestamp start and end of the
        reporting period, and the file extension. Decompress the <Code>.gz</Code> file to get
        the raw <Code>.xml</Code> inside.
      </P>

      <Tip>
        You can upload the <Code>.gz</Code> file directly to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          DMARC Labs
        </a>{' '}
        — no need to decompress first. The analyzer handles <Code>.xml</Code>,{' '}
        <Code>.gz</Code>, and <Code>.zip</Code> formats and processes your file entirely in
        your browser.
      </Tip>

      <H2>Inside the XML: what Google reports</H2>
      <P>
        A Google DMARC XML file follows the standard DMARC aggregate report format (RFC
        7489). Here is a real-world example of what it looks like:
      </P>
      <Pre>{`<feedback>
  <report_metadata>
    <org_name>Google LLC</org_name>
    <email>noreply-dmarc-support@google.com</email>
    <report_id>17512345678901234</report_id>
    <date_range>
      <begin>1751241600</begin>
      <end>1751327999</end>
    </date_range>
  </report_metadata>

  <policy_published>
    <domain>yourdomain.com</domain>
    <adkim>r</adkim>
    <aspf>r</aspf>
    <p>none</p>
    <pct>100</pct>
  </policy_published>

  <record>
    <row>
      <source_ip>209.85.220.41</source_ip>
      <count>2847</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <auth_results>
      <dkim>
        <domain>yourdomain.com</domain>
        <selector>google</selector>
        <result>pass</result>
      </dkim>
      <spf>
        <domain>yourdomain.com</domain>
        <result>pass</result>
      </spf>
    </auth_results>
  </record>
</feedback>`}</Pre>

      <H2>How to interpret the key fields</H2>

      <H3>policy_published — your DMARC policy as Google saw it</H3>
      <P>
        The <Code>policy_published</Code> block is a snapshot of your DMARC DNS record at the
        time Gmail processed these messages. The critical fields:
      </P>
      <UL>
        <LI>
          <Code>p</Code>: Your policy — <Code>none</Code> (monitoring only),{' '}
          <Code>quarantine</Code> (send to spam), or <Code>reject</Code> (block). If this
          says <Code>none</Code>, Google is reporting but not acting on failures.
        </LI>
        <LI>
          <Code>adkim</Code> / <Code>aspf</Code>: Alignment mode — <Code>r</Code> (relaxed)
          or <Code>s</Code> (strict). Most domains use <Code>r</Code>.
        </LI>
        <LI>
          <Code>pct</Code>: What percentage of failing messages the policy applies to. 100
          means full enforcement.
        </LI>
      </UL>

      <H3>source_ip — who is sending mail as you</H3>
      <P>
        The <Code>source_ip</Code> in each record is the outbound mail server that delivered
        the message to Gmail. Cross-reference this IP against your known senders:
      </P>
      <Table>
        <THead>
          <tr>
            <TH>IP range example</TH>
            <TH>Likely source</TH>
            <TH>Expected auth result</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>209.85.x.x</TD>
            <TD>Google Workspace (your own Google mail)</TD>
            <TD>DKIM pass, SPF pass</TD>
          </tr>
          <tr>
            <TD>198.2.x.x</TD>
            <TD>Mailchimp</TD>
            <TD>DKIM pass (if configured), SPF fail (uses own envelope)</TD>
          </tr>
          <tr>
            <TD>149.72.x.x</TD>
            <TD>SendGrid</TD>
            <TD>DKIM pass (if configured), SPF fail (uses own envelope)</TD>
          </tr>
          <tr>
            <TD>Unknown</TD>
            <TD>Spoofing or unauthorized sender</TD>
            <TD>DKIM fail, SPF fail</TD>
          </tr>
        </tbody>
      </Table>

      <H3>count — how many messages this record represents</H3>
      <P>
        The <Code>count</Code> field tells you how many messages had this exact combination
        of source IP and authentication result during the day. Prioritize records with high
        counts — a failure with count=50,000 is far more urgent than one with count=3.
      </P>

      <H3>dkim and spf in policy_evaluated — your DMARC pass rate</H3>
      <P>
        These two fields are the bottom line of each record:
      </P>
      <UL>
        <LI>
          <Code>dkim: pass</Code> — DKIM signature verified AND the signing domain aligned
          with your From: domain. This message passed DMARC via DKIM.
        </LI>
        <LI>
          <Code>spf: pass</Code> — SPF verified AND the envelope sender domain aligned with
          your From: domain. This message passed DMARC via SPF.
        </LI>
        <LI>
          If both are <Code>fail</Code>, the message failed DMARC entirely. With{' '}
          <Code>p=none</Code> this is just a report; with <Code>p=reject</Code> the message
          would be blocked.
        </LI>
      </UL>

      <H2>Calculating your DMARC pass rate from a Google report</H2>
      <P>
        Your DMARC pass rate is: total messages where at least one of DKIM or SPF passes,
        divided by total messages. In mathematical terms:
      </P>
      <Pre>{`pass_rate = (sum of count where dkim=pass OR spf=pass) 
            ÷ (sum of all count) × 100`}</Pre>
      <P>
        To calculate this manually, sum the <Code>count</Code> from every record where{' '}
        <Code>policy_evaluated/dkim = pass</Code> or{' '}
        <Code>policy_evaluated/spf = pass</Code>. Divide by the total count across all
        records and multiply by 100.
      </P>
      <Note>
        DMARC Labs calculates this automatically when you upload your report and shows your
        pass rate as a percentage at the top of the dashboard.
      </Note>

      <H2>Why is Google the most common DMARC report sender?</H2>
      <P>
        Gmail processes a larger volume of email than any other provider. If your domain
        sends newsletters, transactional emails, or business mail to users, the majority of
        recipients likely use Gmail. Google also has a well-maintained DMARC reporting
        infrastructure and sends reports reliably every 24 hours.
      </P>
      <P>
        Other providers also send DMARC reports, including:
      </P>
      <UL>
        <LI>
          <Strong>Microsoft</Strong> — reports from{' '}
          <Code>dmarcreport@microsoft.com</Code>
        </LI>
        <LI>
          <Strong>Yahoo / AOL</Strong> — reports from{' '}
          <Code>postmaster@dmarc.yahoo.com</Code>
        </LI>
        <LI>
          <Strong>Apple</Strong> — reports from <Code>postmaster@apple.com</Code>
        </LI>
        <LI>
          <Strong>Many others</Strong> — any provider that implements RFC 7489
        </LI>
      </UL>
      <P>
        Google typically accounts for 40–70% of the total message volume in most DMARC
        report sets, which is why it appears as the dominant sender.
      </P>

      <H2>What to do when your Google DMARC report shows failures</H2>
      <OL>
        <OLI>
          <Strong>Identify the failing source IP.</Strong> Look at records where{' '}
          <Code>dkim = fail</Code> AND <Code>spf = fail</Code> with high counts. These are
          your highest-priority failures.
        </OLI>
        <OLI>
          <Strong>Determine if the IP is a legitimate sender.</Strong> Look up the IP in
          WHOIS or run it through the DMARC Labs analyzer, which enriches each IP
          automatically. If it belongs to an ESP you use (Mailchimp, HubSpot, etc.), fix
          their DKIM and SPF alignment. If it is unknown, it is likely spoofing.
        </OLI>
        <OLI>
          <Strong>Fix authentication for legitimate senders.</Strong> For ESP failures, the
          most reliable fix is configuring DKIM signing with your own domain — most ESPs
          support this as a "custom domain" or "authenticated domain" setting.
        </OLI>
        <OLI>
          <Strong>Monitor for 2–4 weeks before tightening policy.</Strong> Once your pass
          rate is consistently above 95%, move from <Code>p=none</Code> to{' '}
          <Code>p=quarantine</Code>, then to <Code>p=reject</Code>. Each step should include
          2+ weeks of monitoring.
        </OLI>
      </OL>

      <H2>Google DMARC report FAQ</H2>

      <H3>Why am I receiving emails from noreply-dmarc-support@google.com?</H3>
      <P>
        Your domain has a DMARC record with a <Code>rua=</Code> tag that includes your email
        address. Google is fulfilling its RFC 7489 obligation to send aggregate reports to
        that address. This is expected behavior — not spam.
      </P>

      <H3>How do I open a Google DMARC XML file?</H3>
      <P>
        Save the attachment, then decompress the <Code>.gz</Code> or <Code>.zip</Code> file.
        The XML inside can be read in a text editor, but it is easier to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          upload it directly to DMARC Labs
        </a>
        , which accepts compressed files and renders the data as a table.
      </P>

      <H3>What is a good DMARC pass rate for Google reports?</H3>
      <P>
        Target 95%+ before moving to <Code>p=quarantine</Code> and 98%+ before{' '}
        <Code>p=reject</Code>. A rate below 90% signals misconfigured senders or active
        spoofing that needs investigation.
      </P>

      <H3>Google is my only report sender — is that normal?</H3>
      <P>
        If most of your recipients use Gmail, Google will dominate your reports. Other
        providers send reports too — check your spam folder, as report emails sometimes
        trigger spam filters, and verify that your <Code>rua=</Code> address is publicly
        accessible.
      </P>

      <HR />
      <P>
        The fastest way to analyze your Google DMARC reports is to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          upload the attachment directly to DMARC Labs
        </a>
        . Your file is processed in your browser — never sent to a server — and you get an
        instant breakdown of pass rates, source IPs, and authentication results.
      </P>
    </BlogPostLayout>
  );
}
