import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Note, Tip, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'DMARC rua vs ruf: Aggregate vs Forensic Reports Explained',
  description:
    'What is the difference between DMARC rua and ruf? Learn what aggregate reports and forensic reports contain, when to use each, privacy implications of ruf, and how to configure both in your DMARC record.',
  keywords: [
    'dmarc rua vs ruf',
    'rua ruf dmarc difference',
    'dmarc forensic reports explained',
    'dmarc aggregate vs forensic',
    'what is rua dmarc',
    'what is ruf dmarc',
    'dmarc ruf privacy',
    'dmarc report types',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://dmarclabsds1.xyz/blog/dmarc-rua-vs-ruf',
  },
  openGraph: {
    title: 'DMARC rua vs ruf: Aggregate vs Forensic Reports Explained',
    description:
      'What is the difference between DMARC rua and ruf? A plain-English explanation of aggregate and forensic reports, their privacy implications, and when to configure each.',
    url: 'https://dmarclabsds1.xyz/blog/dmarc-rua-vs-ruf',
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
      name: 'What is rua in DMARC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'rua (Reporting URI for Aggregate reports) is the DMARC tag that specifies where receiving mail servers should send aggregate reports. Aggregate reports are XML files that summarise authentication results for all mail claiming to be from your domain during a 24-hour window. They contain statistical data: source IPs, message counts, DKIM/SPF pass/fail rates, and policy dispositions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is ruf in DMARC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ruf (Reporting URI for Failure/Forensic reports) is the DMARC tag that specifies where receiving mail servers should send failure reports. Forensic reports (also called failure reports) are generated for individual messages that fail DMARC. They contain a copy of the message headers (and sometimes the full message body) for each failing email, giving you detailed information about specific failures.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I configure ruf in my DMARC record?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most domains should configure rua but think carefully before adding ruf. Forensic reports can contain sensitive personally identifiable information from real email messages, including recipient addresses, subject lines, and message bodies. Many large providers (including Google and Microsoft) do not send ruf reports at all due to privacy concerns. For most deployments, rua alone provides sufficient information to monitor and enforce DMARC policy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which providers send DMARC forensic reports (ruf)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google and Microsoft do not send DMARC forensic reports (ruf) due to privacy concerns. Yahoo and some smaller providers do send them. In practice, most domain owners receive very few or no forensic reports even when ruf is configured. The aggregate reports (rua) from Google, Microsoft, and Yahoo are far more useful for monitoring and diagnosing DMARC issues.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the fo tag in a DMARC record?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The fo tag controls when forensic reports are generated. fo=0 (default) sends a report only when all authentication mechanisms fail. fo=1 sends a report when any authentication mechanism fails. fo=d sends a report when DKIM fails. fo=s sends a report when SPF fails. Most domains that use ruf specify fo=1 to get a report for any authentication failure.',
      },
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'DMARC rua vs ruf: Aggregate vs Forensic Reports Explained',
  description:
    'What is the difference between DMARC rua and ruf? Plain-English explanation of both report types.',
  datePublished: '2025-07-10',
  dateModified: '2025-07-10',
  author: { '@type': 'Organization', name: 'DMARC Labs' },
  publisher: { '@type': 'Organization', name: 'DMARC Labs', url: 'https://dmarclabsds1.xyz' },
  mainEntityOfPage: 'https://dmarclabsds1.xyz/blog/dmarc-rua-vs-ruf',
  wordCount: 2400,
};

export default function Page() {
  return (
    <BlogPostLayout
      title="DMARC rua vs ruf: Aggregate vs Forensic Reports Explained"
      description="What is the difference between DMARC rua and ruf? Learn what aggregate reports and forensic reports contain, when to use each, privacy implications, and how to configure both."
      date="2025-07-10"
      readTime="8 min read"
      tags={['DMARC', 'Reports', 'Privacy']}
      jsonLd={[faqJsonLd, articleJsonLd]}
    >
      <Lead>
        Every DMARC record can include two reporting addresses: <Code>rua=</Code> for
        aggregate reports and <Code>ruf=</Code> for forensic (failure) reports. Most guides
        tell you to add both without explaining what they contain or why they are different.
        Here is what each one actually sends you.
      </Lead>

      <H2>What is rua?</H2>
      <Note>
        <Strong>Definition:</Strong> <Code>rua</Code> (Reporting URI for Aggregate reports)
        is the DMARC tag that tells receiving mail servers where to send daily XML summary
        reports. These reports aggregate all authentication activity for your domain into a
        single file per reporting period, per sending provider.
      </Note>
      <P>
        Aggregate reports are the workhorse of DMARC monitoring. They give you a statistical
        view of your email authentication posture:
      </P>
      <UL>
        <LI>Which IP addresses sent mail claiming to be from your domain</LI>
        <LI>How many messages each IP sent</LI>
        <LI>What DKIM and SPF results each IP produced</LI>
        <LI>What your DMARC policy was at the time</LI>
        <LI>What the receiving server did with each group of messages (none, quarantine, reject)</LI>
      </UL>
      <P>
        Aggregate reports do <em>not</em> contain individual message content, recipient
        addresses, subject lines, or message bodies. They are purely statistical.
      </P>

      <H2>What is ruf?</H2>
      <Note>
        <Strong>Definition:</Strong> <Code>ruf</Code> (Reporting URI for Failure/Forensic
        reports) is the DMARC tag that tells receiving mail servers where to send per-message
        failure reports. A forensic report is generated for each individual message that
        fails DMARC, and it includes detailed information about that specific message.
      </Note>
      <P>
        Forensic reports are modeled after the Abuse Reporting Format (ARF) and typically
        contain:
      </P>
      <UL>
        <LI>The full message headers of the failing email</LI>
        <LI>The original From:, To:, Subject:, and Date: headers</LI>
        <LI>Authentication results (DKIM, SPF, DMARC)</LI>
        <LI>In some cases, the full message body</LI>
      </UL>

      <H2>Side-by-side comparison</H2>
      <Table>
        <THead>
          <tr>
            <TH>Property</TH>
            <TH>rua (Aggregate)</TH>
            <TH>ruf (Forensic)</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>Report format</TD>
            <TD>XML (compressed .gz or .zip)</TD>
            <TD>MIME email with ARF attachment</TD>
          </tr>
          <tr>
            <TD>Frequency</TD>
            <TD>Once per day per reporting provider</TD>
            <TD>Once per failing message (can be very high volume)</TD>
          </tr>
          <tr>
            <TD>What it contains</TD>
            <TD>Aggregated statistics by source IP</TD>
            <TD>Headers and possibly body of each failing message</TD>
          </tr>
          <tr>
            <TD>Contains PII?</TD>
            <TD>No — only IPs, counts, pass/fail rates</TD>
            <TD>Yes — recipient addresses, subjects, sometimes message body</TD>
          </tr>
          <tr>
            <TD>Who sends it?</TD>
            <TD>Google, Microsoft, Yahoo, Apple, most providers</TD>
            <TD>Yahoo and some smaller providers. Google and Microsoft do not.</TD>
          </tr>
          <tr>
            <TD>Volume</TD>
            <TD>Predictable — one file per day per provider</TD>
            <TD>Unpredictable — can flood your inbox during a spoofing attack</TD>
          </tr>
          <tr>
            <TD>GDPR risk</TD>
            <TD>Low</TD>
            <TD>High — message headers contain personal data</TD>
          </tr>
          <tr>
            <TD>Usefulness</TD>
            <TD>High — primary tool for DMARC monitoring</TD>
            <TD>Low in practice — most providers do not send them</TD>
          </tr>
        </tbody>
      </Table>

      <H2>How to configure rua and ruf</H2>
      <P>
        Both tags are comma-separated lists of <Code>mailto:</Code> URIs in your DMARC TXT
        record:
      </P>
      <Pre>{`v=DMARC1; p=none; 
  rua=mailto:dmarc-reports@example.com; 
  ruf=mailto:dmarc-failures@example.com;
  fo=1`}</Pre>
      <P>
        You can send reports to multiple addresses by separating them with commas:
      </P>
      <Pre>{`rua=mailto:dmarc@example.com,mailto:dmarc@thirdparty-analyzer.com`}</Pre>
      <P>
        If the reporting address is on a different domain than the one being reported on, that
        other domain must publish a special DNS record granting permission:
      </P>
      <Pre>{`_report._dmarc.thirdparty.com  TXT  "v=DMARC1"`}</Pre>

      <H3>The fo tag — controlling when forensic reports are sent</H3>
      <P>
        The <Code>fo=</Code> tag controls the conditions under which forensic reports are
        generated. It only applies to <Code>ruf</Code>:
      </P>
      <Table>
        <THead>
          <tr>
            <TH>fo value</TH>
            <TH>Report generated when…</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Code>fo=0</Code> (default)</TD>
            <TD>Both SPF and DKIM fail (the message fails both checks)</TD>
          </tr>
          <tr>
            <TD><Code>fo=1</Code></TD>
            <TD>Either SPF or DKIM fails (generates more reports)</TD>
          </tr>
          <tr>
            <TD><Code>fo=d</Code></TD>
            <TD>DKIM fails (only DKIM-specific failures)</TD>
          </tr>
          <tr>
            <TD><Code>fo=s</Code></TD>
            <TD>SPF fails (only SPF-specific failures)</TD>
          </tr>
        </tbody>
      </Table>

      <H2>Should you configure ruf?</H2>
      <P>
        For most domains, the answer is: <Strong>configure rua, skip ruf for now</Strong>.
        Here is why:
      </P>
      <OL>
        <OLI>
          <Strong>Google and Microsoft do not send ruf reports.</Strong> Since these two
          providers account for the majority of email received globally, configuring ruf will
          result in very few reports from the sources that matter most.
        </OLI>
        <OLI>
          <Strong>Forensic reports contain personal data.</Strong> Message headers include
          real email addresses of real people. Storing these reports creates GDPR obligations
          and data retention complexity that aggregate reports do not.
        </OLI>
        <OLI>
          <Strong>ruf can flood your inbox during an attack.</Strong> If someone is
          spoofing your domain aggressively and a provider sends ruf reports, you could
          receive thousands of report emails per hour.
        </OLI>
        <OLI>
          <Strong>Aggregate reports (rua) contain all the information you need.</Strong>
          The source IP, count, and authentication result from the aggregate report is
          sufficient to diagnose and fix any DMARC configuration problem.
        </OLI>
      </OL>

      <Note>
        If you do configure <Code>ruf</Code>, use a dedicated mailbox (not a shared inbox),
        set <Code>fo=1</Code> to capture all failures, and ensure the mailbox has adequate
        retention controls to comply with your data protection obligations.
      </Note>

      <H2>Which providers send rua and ruf?</H2>
      <Table>
        <THead>
          <tr>
            <TH>Provider</TH>
            <TH>Sends rua?</TH>
            <TH>Sends ruf?</TH>
            <TH>Report sender address</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>Google / Gmail</TD>
            <TD>Yes</TD>
            <TD>No</TD>
            <TD>noreply-dmarc-support@google.com</TD>
          </tr>
          <tr>
            <TD>Microsoft / Outlook</TD>
            <TD>Yes</TD>
            <TD>No</TD>
            <TD>dmarcreport@microsoft.com</TD>
          </tr>
          <tr>
            <TD>Yahoo / AOL</TD>
            <TD>Yes</TD>
            <TD>Yes (limited)</TD>
            <TD>postmaster@dmarc.yahoo.com</TD>
          </tr>
          <tr>
            <TD>Apple</TD>
            <TD>Yes</TD>
            <TD>No</TD>
            <TD>postmaster@apple.com</TD>
          </tr>
          <tr>
            <TD>Fastmail</TD>
            <TD>Yes</TD>
            <TD>Yes</TD>
            <TD>Various</TD>
          </tr>
        </tbody>
      </Table>

      <H2>The privacy risk of ruf reports</H2>
      <P>
        DMARC forensic reports can contain personally identifiable information. A forensic
        report for a spoofed phishing message sent to a Gmail user might include:
      </P>
      <UL>
        <LI>The recipient Gmail address in the <Code>To:</Code> header</LI>
        <LI>The Subject line of the phishing email</LI>
        <LI>The full message body (in some implementations)</LI>
        <LI>Timestamps revealing when the recipient was targeted</LI>
      </UL>
      <P>
        Under GDPR and similar regulations, receiving and storing this data requires a legal
        basis and appropriate safeguards. This is the primary reason why Google and Microsoft
        declined to implement ruf reporting.
      </P>
      <P>
        For this reason,{' '}
        <a
          href="/blog/dmarc-report-privacy-security"
          className="text-accent hover:underline"
        >
          how you handle DMARC report data
        </a>{' '}
        matters. Processing reports locally — without uploading them to a third-party SaaS
        tool — keeps any sensitive data on your own device.
      </P>

      <H2>Frequently asked questions</H2>

      <H3>What is rua in DMARC?</H3>
      <P>
        <Code>rua</Code> is the Reporting URI for Aggregate reports — the email address where
        receiving providers send daily XML summary files showing authentication statistics for
        mail claiming to be from your domain.
      </P>

      <H3>What is ruf in DMARC?</H3>
      <P>
        <Code>ruf</Code> is the Reporting URI for Failure/Forensic reports — the email
        address where providers send per-message reports for individual emails that fail
        DMARC. These contain message headers and potentially message content.
      </P>

      <H3>Which providers send DMARC forensic reports?</H3>
      <P>
        Google and Microsoft do not send forensic reports due to privacy concerns. Yahoo and
        some smaller providers do. In practice, you will receive very few ruf reports even if
        you configure the tag.
      </P>

      <H3>What is the fo tag in DMARC?</H3>
      <P>
        The <Code>fo=</Code> tag controls when forensic reports are generated:{' '}
        <Code>fo=0</Code> (both mechanisms fail), <Code>fo=1</Code> (either mechanism fails),{' '}
        <Code>fo=d</Code> (DKIM fails), <Code>fo=s</Code> (SPF fails). Only relevant if you
        have <Code>ruf=</Code> configured.
      </P>

      <Tip>
        For analyzing your aggregate DMARC reports, upload your <Code>.xml</Code>,{' '}
        <Code>.gz</Code>, or <Code>.zip</Code> file to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          DMARC Labs
        </a>
        . Your file is processed entirely in your browser — it is never sent to a server,
        which addresses exactly the privacy concerns that make ruf problematic.
      </Tip>

      <HR />
      <P>
        In summary: configure <Code>rua=</Code> for every domain — it is the primary tool
        for DMARC monitoring. Add <Code>ruf=</Code> only if you have a specific need for
        per-message failure forensics and a process for handling the personal data it
        contains. The aggregate reports from Google and Microsoft alone are sufficient to
        monitor, diagnose, and enforce your DMARC policy.
      </P>
    </BlogPostLayout>
  );
}
