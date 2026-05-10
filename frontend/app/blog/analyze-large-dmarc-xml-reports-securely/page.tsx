import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Blockquote, Note, Tip, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'How to Analyze Large DMARC XML Reports (100MB+) Securely — Complete Technical Guide',
  description:
    'Learn how to parse large DMARC XML files without upload limits, understand SPF/DKIM alignment, enrich IP data, and protect your email sender reputation — completely free and privacy-first.',
  keywords: [
    'analyze DMARC XML reports',
    'large DMARC XML file',
    'DMARC report analysis',
    'DMARC XML parser',
    'DMARC aggregate report',
    'SPF DKIM alignment',
    'email deliverability',
  ],
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.dmarclabsds1.xyz/blog/analyze-large-dmarc-xml-reports-securely',
  },
  openGraph: {
    title:
      'How to Analyze Large DMARC XML Reports (100MB+) Securely — Complete Technical Guide',
    description:
      'Learn how to parse large DMARC XML files without upload limits, understand SPF/DKIM alignment, enrich IP data, and protect your email sender reputation.',
    url: 'https://www.dmarclabsds1.xyz/blog/analyze-large-dmarc-xml-reports-securely',
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
      name: 'What is a DMARC XML report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A DMARC XML report (also called an aggregate report or RUA report) is an XML file sent by receiving mail servers to the domain owner. It summarises how many messages were received that claimed to be from your domain, how many passed SPF and DKIM authentication, and how many were handled according to your DMARC policy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why are some DMARC XML files so large (100MB+)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DMARC aggregate reports grow large when your domain sends a high volume of email. Each <record> entry in the XML represents a unique combination of source IP, authentication result, and disposition. High-volume senders — especially those using third-party email services like Mailchimp, Salesforce, or transactional email APIs — can accumulate millions of records per reporting period, pushing file sizes into the hundreds of megabytes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I analyze a large DMARC XML file without uploading it to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. DMARC Labs uses a browser-native XML parser that processes your file entirely on your device. The file is never sent to any server. This approach also removes file-size limits: your browser can process files of any size (limited only by your device RAM), including 100MB+ reports that would overwhelm typical SaaS DMARC tools.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is SPF/DKIM alignment in DMARC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Alignment means that the domain in the From: header of the email matches (or is a subdomain of) the domain verified by SPF or DKIM. DMARC requires at least one of SPF or DKIM to both pass AND align. An SPF pass with a misaligned domain still fails DMARC. Strict alignment requires exact domain matches; relaxed alignment allows organizational domain matches.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I move from DMARC monitoring (p=none) to enforcement (p=quarantine or p=reject)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Start by publishing p=none and collecting reports for 2–4 weeks. Use the reports to identify all legitimate email sources and ensure they have working SPF and DKIM alignment. Once you are confident that all legitimate traffic is authenticated, move to p=quarantine at pct=10, gradually increasing the percentage. When the quarantine pass rate stabilises above 95%, move to p=reject.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do IP addresses in DMARC reports reveal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each DMARC record includes the source IP address of the server that delivered the message. With WHOIS enrichment, these IPs reveal the hosting provider, ASN (Autonomous System Number), country, and often the specific email service (such as Google Workspace, Amazon SES, or Mailchimp) that sent the message. This helps identify unauthorized senders and forgotten third-party services.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is DMARC Labs free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, DMARC Labs is completely free. There is no signup required, no file size limit, and no data is ever sent to a server. All parsing, analysis, and IP enrichment happens in your browser using client-side JavaScript.',
      },
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline:
    'How to Analyze Large DMARC XML Reports (100MB+) Securely and Fix Email Deliverability',
  description:
    'Complete technical guide to parsing large DMARC XML files, understanding SPF/DKIM alignment, enriching IP data, and fixing email deliverability.',
  author: { '@type': 'Organization', name: 'DMARC Labs' },
  publisher: { '@type': 'Organization', name: 'DMARC Labs', url: 'https://www.dmarclabsds1.xyz' },
  datePublished: '2025-07-01',
  url: 'https://www.dmarclabsds1.xyz/blog/analyze-large-dmarc-xml-reports-securely',
};

export default function Page() {
  return (
    <BlogPostLayout
      title="How to Analyze Large DMARC XML Reports (100MB+) Securely and Fix Email Deliverability"
      description="Learn how to parse large DMARC XML files without upload limits, understand SPF/DKIM alignment, enrich IP data, and protect your email sender reputation — completely free and privacy-first."
      date="2025-07-01"
      readTime="18 min read"
      tags={['DMARC', 'XML', 'Email Security', 'Privacy']}
      jsonLd={[faqJsonLd, articleJsonLd]}
    >
      <Lead>
        You pull your DMARC aggregate report from Google Postmaster, Microsoft SNDS, or
        your email provider — and the XML file is 180MB. Every online DMARC tool either
        refuses to load it, charges you for enterprise access, or makes you upload it to
        their servers. This guide shows you exactly how to analyze those large files
        privately, for free, and what to do with the data you find.
      </Lead>

      <H2>What Is a DMARC Aggregate Report?</H2>
      <P>
        DMARC (Domain-based Message Authentication, Reporting, and Conformance) is an
        email authentication protocol that builds on SPF and DKIM. When a receiving mail
        server processes a message from your domain, it checks whether SPF and DKIM pass
        and whether they align with the <Code>From:</Code> domain. The results of every
        message processed during a 24-hour window are bundled into an{' '}
        <Strong>aggregate report</Strong> — an XML file — and sent to the address
        specified in your <Code>rua=</Code> tag.
      </P>
      <P>
        Every major receiving provider sends these reports: Google, Microsoft, Yahoo,
        Apple, and hundreds of smaller providers. If your domain sends any meaningful
        volume of email, you are receiving dozens or hundreds of these XML files per day.
      </P>

      <H3>The anatomy of a DMARC aggregate report</H3>
      <P>
        At the top level, every DMARC XML report contains two sections:{' '}
        <Code>report_metadata</Code> and <Code>policy_published</Code>, followed by one
        or more <Code>record</Code> elements.
      </P>
      <Pre>{`<feedback>
  <report_metadata>
    <org_name>Google LLC</org_name>
    <email>noreply-dmarc-support@google.com</email>
    <report_id>12345678901234567</report_id>
    <date_range>
      <begin>1751241600</begin>
      <end>1751327999</end>
    </date_range>
  </report_metadata>

  <policy_published>
    <domain>example.com</domain>
    <adkim>r</adkim>
    <aspf>r</aspf>
    <p>reject</p>
    <sp>reject</sp>
    <pct>100</pct>
  </policy_published>

  <record>
    <row>
      <source_ip>209.85.128.0</source_ip>
      <count>4821</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <identifiers>
      <header_from>example.com</header_from>
    </identifiers>
    <auth_results>
      <dkim>
        <domain>example.com</domain>
        <result>pass</result>
        <selector>google</selector>
      </dkim>
      <spf>
        <domain>example.com</domain>
        <result>pass</result>
      </spf>
    </auth_results>
  </record>
</feedback>`}</Pre>
      <P>
        Each <Code>record</Code> represents a unique combination of source IP address,
        authentication outcomes, and policy disposition. A single report from Google can
        contain thousands of records if your domain sends from many different IP
        addresses or uses multiple third-party services.
      </P>

      <H2>Why Large DMARC XML Files Are a Problem</H2>
      <P>
        For high-volume senders — companies sending millions of emails per month through
        multiple platforms — DMARC aggregate reports grow fast. Here is why:
      </P>
      <UL>
        <LI>
          <Strong>Record explosion:</Strong> Every unique source IP gets its own record.
          If you use five email platforms each sending from 10 different IPs, that is 50
          records per report per receiving provider.
        </LI>
        <LI>
          <Strong>Multiple providers:</Strong> Google, Microsoft, Yahoo, and dozens of
          smaller providers all send separate reports. A popular domain might receive
          200+ reports per day.
        </LI>
        <LI>
          <Strong>Forwarding complexity:</Strong> Email forwarding creates new records
          with different alignment outcomes, multiplying the record count.
        </LI>
        <LI>
          <Strong>Attack traffic:</Strong> Active phishing or spoofing campaigns add
          hundreds of records from attacker IPs, inflating file sizes significantly.
        </LI>
      </UL>
      <P>
        The result is that production DMARC deployments routinely generate 50MB–100MB+
        XML files per reporting period. Most SaaS DMARC tools enforce upload limits of
        10–25MB. Enterprise tiers unlock higher limits but cost hundreds of dollars per
        month.
      </P>

      <H2>How Browser-Native Parsing Solves the File Size Problem</H2>
      <P>
        Traditional DMARC tools send your XML file to their servers, parse it in a
        backend process, store the results in a database, and show you a dashboard. This
        architecture creates three constraints: upload bandwidth limits, server memory
        limits, and the privacy problem of your authentication data sitting on someone
        else&apos;s infrastructure.
      </P>
      <P>
        Browser-native parsing works differently. Modern browsers expose a{' '}
        <Strong>DOMParser API</Strong> that can parse arbitrarily large XML files in-tab.
        The file is read directly from disk using the{' '}
        <Code>FileReader</Code> API — it never leaves your device.
      </P>
      <Tip>
        DMARC Labs uses a chunked streaming parser. Files are read in 10MB slices and
        parsed progressively, so even a 500MB XML file can be processed without a memory
        spike on your device.
      </Tip>
      <P>
        The entire analysis pipeline runs in your browser tab:
      </P>
      <OL>
        <OLI>File selected via drag-and-drop or file picker</OLI>
        <OLI>JavaScript reads the file using <Code>FileReader.readAsText()</Code></OLI>
        <OLI>XML is parsed using the browser&apos;s native DOMParser</OLI>
        <OLI>Records are extracted and aggregated</OLI>
        <OLI>IPs are looked up via WHOIS API to identify sending services</OLI>
        <OLI>Results are displayed as an interactive dashboard</OLI>
      </OL>
      <P>
        No bytes of your DMARC report are transmitted to any third-party server during
        this process.
      </P>

      <H2>Understanding SPF and DKIM Alignment</H2>
      <P>
        DMARC is often misunderstood as simply &ldquo;SPF + DKIM.&rdquo; The critical
        concept that distinguishes DMARC is <Strong>alignment</Strong> — and it is the
        most common source of DMARC failures for organizations that already have SPF and
        DKIM configured.
      </P>

      <H3>SPF alignment</H3>
      <P>
        SPF checks the <Code>Return-Path</Code> (envelope sender) domain against your
        SPF record. For DMARC, the <Code>Return-Path</Code> domain must also match the
        <Code>From:</Code> header domain. If you use a third-party email service like
        Mailchimp, the Return-Path might be{' '}
        <Code>bounce.mcsv.net</Code> — which will fail SPF alignment for your domain
        even if Mailchimp&apos;s SPF passes.
      </P>

      <H3>DKIM alignment</H3>
      <P>
        DKIM signs the message with a private key, embedding a{' '}
        <Code>d=</Code> domain tag in the signature header. For DMARC alignment, this{' '}
        <Code>d=</Code> domain must match the <Code>From:</Code> header domain. Most
        email platforms allow you to configure a custom DKIM domain — this is the
        correct fix for DKIM alignment failures.
      </P>

      <H3>Relaxed vs strict alignment</H3>
      <Table>
        <THead>
          <tr>
            <TH>Mode</TH>
            <TH>SPF alignment rule</TH>
            <TH>DKIM alignment rule</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Strong>Relaxed (default)</Strong></TD>
            <TD>Organizational domain must match</TD>
            <TD>Organizational domain must match</TD>
          </tr>
          <tr>
            <TD><Strong>Strict</Strong></TD>
            <TD>Exact domain match required</TD>
            <TD>Exact domain match required</TD>
          </tr>
        </tbody>
      </Table>
      <P>
        Relaxed alignment means <Code>mail.example.com</Code> aligns with{' '}
        <Code>example.com</Code>. Strict alignment does not. Most organizations use
        relaxed alignment (<Code>adkim=r; aspf=r</Code>) unless they have specific
        security requirements for exact-match enforcement.
      </P>

      <H2>Reading Your DMARC Report: What Each Field Means</H2>
      <P>
        When you open a DMARC aggregate report in an analyzer, you will see a table of
        records. Here is how to read the key columns:
      </P>

      <H3>policy_evaluated fields</H3>
      <UL>
        <LI>
          <Strong>disposition:</Strong> What the receiving server did with the message —
          <Code>none</Code> (delivered), <Code>quarantine</Code> (sent to spam), or{' '}
          <Code>reject</Code> (dropped).
        </LI>
        <LI>
          <Strong>dkim:</Strong> Whether DKIM both passed AND aligned with the From:
          domain. Possible values: <Code>pass</Code> or <Code>fail</Code>.
        </LI>
        <LI>
          <Strong>spf:</Strong> Whether SPF both passed AND aligned. Possible values:{' '}
          <Code>pass</Code> or <Code>fail</Code>.
        </LI>
      </UL>
      <Note>
        A message &ldquo;passes DMARC&rdquo; if at least one of <Code>dkim</Code> or{' '}
        <Code>spf</Code> in <Code>policy_evaluated</Code> shows <Code>pass</Code>. Both
        can fail individually in <Code>auth_results</Code> but one must pass AND align
        in <Code>policy_evaluated</Code>.
      </Note>

      <H3>auth_results fields</H3>
      <P>
        The <Code>auth_results</Code> section shows the raw authentication outcome before
        alignment is applied. This is useful for debugging:
      </P>
      <UL>
        <LI>
          <Strong>SPF result:</Strong> <Code>pass</Code>, <Code>fail</Code>,{' '}
          <Code>softfail</Code>, <Code>neutral</Code>, <Code>temperror</Code>, or{' '}
          <Code>permerror</Code>
        </LI>
        <LI>
          <Strong>DKIM result:</Strong> <Code>pass</Code>, <Code>fail</Code>,{' '}
          <Code>policy</Code>, <Code>neutral</Code>, <Code>temperror</Code>, or{' '}
          <Code>permerror</Code>
        </LI>
      </UL>
      <P>
        A common failure pattern is seeing <Code>spf: pass</Code> in{' '}
        <Code>auth_results</Code> but <Code>spf: fail</Code> in{' '}
        <Code>policy_evaluated</Code> — this means SPF passed technically but the domain
        did not align with the From: header.
      </P>

      <H2>IP Intelligence: Enriching Your DMARC Data with WHOIS</H2>
      <P>
        Every record in a DMARC report contains a <Code>source_ip</Code> — the IP
        address of the server that delivered the message to the receiving provider. Raw
        IPs alone are almost meaningless. The diagnostic value comes from{' '}
        <Strong>IP enrichment</Strong>: resolving each IP to its owner organization,
        hosting provider, ASN, and country.
      </P>

      <H3>What WHOIS enrichment reveals</H3>
      <UL>
        <LI>
          <Strong>Authorized senders you forgot about:</Strong> That IP block owned by
          &ldquo;SendGrid&rdquo; is your transactional email service from 3 years ago.
        </LI>
        <LI>
          <Strong>Third-party platforms with broken authentication:</Strong> If your CRM
          is sending from its own servers but not signing with your DKIM key, you will see
          alignment failures attributed to their IP range.
        </LI>
        <LI>
          <Strong>Unauthorized senders and spoofing attempts:</Strong> IPs owned by
          random hosting providers, VPN services, or overseas data centers that should
          never be sending as your domain.
        </LI>
        <LI>
          <Strong>Forwarding infrastructure:</Strong> IPs from university mail servers or
          mailing list managers that re-send your messages with broken alignment.
        </LI>
      </UL>

      <H3>Reading enriched DMARC data</H3>
      <P>
        When you analyze a DMARC report with DMARC Labs, each IP is enriched with:
      </P>
      <UL>
        <LI><Strong>Organization name</Strong> (e.g., &ldquo;Google LLC&rdquo;, &ldquo;Amazon.com, Inc.&rdquo;)</LI>
        <LI><Strong>ASN</Strong> (Autonomous System Number)</LI>
        <LI><Strong>Country</Strong></LI>
        <LI><Strong>IP range</Strong> (CIDR notation)</LI>
      </UL>
      <P>
        Cross-reference this with your known sending sources. Any IP organization you
        don&apos;t recognize is a candidate for investigation — either an unauthorized
        sender or a legitimate service that needs authentication configured.
      </P>

      <H2>Common DMARC Failure Patterns and How to Fix Them</H2>

      <H3>Pattern 1: Third-party sender with no DKIM signing</H3>
      <P>
        <Strong>Symptoms:</Strong> DMARC fail on records from an IP range belonging to
        your CRM, newsletter platform, or marketing automation tool. SPF passes but DKIM
        fails or is absent.
      </P>
      <P>
        <Strong>Fix:</Strong> Log in to the third-party platform and enable custom domain
        DKIM signing. You will be asked to add a CNAME or TXT record to your DNS. Once
        added, the platform will sign messages with a key that aligns to your domain.
      </P>

      <H3>Pattern 2: SPF pass but alignment failure</H3>
      <P>
        <Strong>Symptoms:</Strong> <Code>auth_results/spf: pass</Code> but{' '}
        <Code>policy_evaluated/spf: fail</Code>. The source IP is in your SPF record
        but the Return-Path domain doesn&apos;t match your From: domain.
      </P>
      <P>
        <Strong>Fix:</Strong> Configure the sending platform to use a custom Return-Path
        domain that matches your From: domain. Alternatively, ensure DKIM is aligned so
        DMARC passes via the DKIM mechanism instead.
      </P>

      <H3>Pattern 3: Forwarding failures</H3>
      <P>
        <Strong>Symptoms:</Strong> Records from university mail servers, mailing lists,
        or personal email forwarders showing SPF failures. These are almost always
        legitimate emails being forwarded.
      </P>
      <P>
        <Strong>Fix:</Strong> This is a known limitation of SPF with email forwarding.
        The correct long-term fix is ensuring your messages are DKIM-signed (DKIM
        survives forwarding if the message body is not modified). You cannot fix
        forwarding-related SPF failures without the cooperation of the forwarding server.
      </P>

      <H3>Pattern 4: Spoofing or phishing traffic</H3>
      <P>
        <Strong>Symptoms:</Strong> Records from IPs in anonymous hosting providers,
        Eastern European or Asian data centers, or IP ranges with no obvious legitimate
        use. Volume is typically low but the DMARC failure rate is 100%.
      </P>
      <P>
        <Strong>Fix:</Strong> This is not a configuration problem — it is attack traffic.
        Move your DMARC policy from <Code>p=none</Code> to{' '}
        <Code>p=reject</Code>. The receiving provider will drop these messages. If you
        are already at <Code>p=reject</Code>, these failures are expected and your policy
        is working.
      </P>

      <H2>From p=none to p=reject: A Safe Escalation Path</H2>
      <P>
        The biggest risk when enforcing DMARC is rejecting legitimate email. The
        escalation path below minimizes this risk while making progress toward full
        enforcement.
      </P>

      <H3>Phase 1: Monitor (p=none)</H3>
      <P>
        Publish a DMARC record with <Code>p=none</Code> and both <Code>rua</Code>{' '}
        (aggregate reports) and <Code>ruf</Code> (forensic reports) tags. Collect
        reports for 2–4 weeks. Use this period to inventory all email sending sources
        and identify authentication failures.
      </P>
      <Pre>{`v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1;`}</Pre>

      <H3>Phase 2: Quarantine at low percentage</H3>
      <P>
        Once you have fixed authentication for all known legitimate senders, move to{' '}
        <Code>p=quarantine; pct=10</Code>. This applies the quarantine policy to only
        10% of failing messages, giving you a safety net.
      </P>
      <Pre>{`v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@yourdomain.com;`}</Pre>

      <H3>Phase 3: Quarantine at full coverage</H3>
      <P>
        Increase <Code>pct</Code> to 100 once you confirm the quarantine is not catching
        legitimate traffic. Monitor the failure rate closely.
      </P>

      <H3>Phase 4: Reject</H3>
      <P>
        Move to <Code>p=reject</Code> when your pass rate is above 95% and you are
        confident all legitimate senders are authenticated. This is the gold standard —
        receiving providers will outright reject messages that fail DMARC.
      </P>
      <Pre>{`v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com;`}</Pre>
      <Blockquote>
        Once at p=reject, spoofed emails using your domain are dropped by receiving
        providers before they reach any inbox. This is the most effective anti-phishing
        control available for your domain.
      </Blockquote>

      <H2>SPF Record Best Practices for Large Organizations</H2>
      <P>
        SPF records have a hard limit of <Strong>10 DNS lookups</Strong>. Large
        organizations using multiple email platforms routinely hit this limit, causing
        SPF <Code>permerror</Code> across all their sending sources.
      </P>
      <UL>
        <LI>
          Audit your SPF record using a lookup counter. Include mechanisms like{' '}
          <Code>include:</Code>, <Code>a</Code>, <Code>mx</Code> each consume one lookup.
        </LI>
        <LI>
          Flatten your SPF record by replacing <Code>include:</Code> chains with
          explicit <Code>ip4:</Code> and <Code>ip6:</Code> ranges. Use an SPF flattening
          service if the IP ranges of your providers change frequently.
        </LI>
        <LI>
          Consider switching your primary DMARC pass mechanism to DKIM, which has no
          lookup limits. If DKIM is aligned, SPF failures don&apos;t affect your DMARC
          pass rate.
        </LI>
      </UL>

      <H2>DKIM Configuration: What Can Go Wrong</H2>
      <P>
        DKIM is more reliable than SPF for DMARC alignment because it survives email
        forwarding and is independent of the sending IP. However, several configuration
        issues can cause DKIM alignment failures:
      </P>
      <UL>
        <LI>
          <Strong>Wrong <Code>d=</Code> domain:</Strong> The platform is signing with its
          own domain (e.g., <Code>sendgrid.net</Code>) instead of yours. Fix: enable
          custom DKIM domain in the platform.
        </LI>
        <LI>
          <Strong>Key rotation without DNS update:</Strong> After rotating DKIM keys, the
          public key in DNS must be updated. A mismatch causes all DKIM signatures to
          fail until the DNS propagates.
        </LI>
        <LI>
          <Strong>Message body modification:</Strong> Some email security gateways
          rewrite URLs or add footers, breaking the DKIM body hash. This is typically a
          problem with inbound gateways re-routing outbound mail.
        </LI>
        <LI>
          <Strong>Missing DKIM selector in DNS:</Strong> The selector specified in the
          <Code>s=</Code> tag of the DKIM header must exist as a TXT record at{' '}
          <Code>selector._domainkey.yourdomain.com</Code>.
        </LI>
      </UL>

      <H2>How to Use DMARC Labs to Analyze Your Reports</H2>
      <P>
        DMARC Labs is built specifically to handle the large, complex DMARC aggregate
        reports that other tools struggle with. Here is the complete workflow:
      </P>
      <OL>
        <OLI>
          <Strong>Collect your XML files.</Strong> Download DMARC reports from your{' '}
          <Code>rua=</Code> mailbox. They arrive as ZIP or GZIP attachments. Extract the
          XML file inside.
        </OLI>
        <OLI>
          <Strong>Drop the file into DMARC Labs.</Strong> No signup. No size limit. The
          file is read directly from your disk — nothing is uploaded.
        </OLI>
        <OLI>
          <Strong>Review the dashboard.</Strong> The analyzer shows DMARC pass/fail
          rates, SPF and DKIM alignment breakdowns, top sending IPs with WHOIS enrichment,
          country distribution, and suspicious IP flags.
        </OLI>
        <OLI>
          <Strong>Identify failing senders.</Strong> Focus on records where{' '}
          <Code>policy_evaluated/dkim</Code> and <Code>policy_evaluated/spf</Code> are
          both <Code>fail</Code>. These are the messages that your DMARC policy is
          catching.
        </OLI>
        <OLI>
          <Strong>Enrich the IPs.</Strong> The dashboard shows the organization name and
          country for each source IP. Use this to identify whether failing senders are
          legitimate (requiring auth fixes) or unauthorized (requiring policy enforcement).
        </OLI>
        <OLI>
          <Strong>Export and act.</Strong> Download a CSV of the enriched data. Use it
          to prioritize which sending platforms to configure first.
        </OLI>
      </OL>

      <H2>Interpreting the DMARC Pass Rate</H2>
      <P>
        Your <Strong>DMARC pass rate</Strong> is the percentage of messages where at
        least one of SPF or DKIM passes with alignment. Healthy email programs typically
        see rates above 95%.
      </P>
      <Table>
        <THead>
          <tr>
            <TH>Pass rate</TH>
            <TH>Meaning</TH>
            <TH>Recommended action</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>95–100%</TD>
            <TD>Nearly all legitimate traffic authenticated</TD>
            <TD>Safe to move to p=quarantine or p=reject</TD>
          </tr>
          <tr>
            <TD>80–95%</TD>
            <TD>Most sources authenticated, some gaps remain</TD>
            <TD>Identify and fix the failing sources before enforcing</TD>
          </tr>
          <tr>
            <TD>50–80%</TD>
            <TD>Significant authentication gaps</TD>
            <TD>Major third-party services missing DKIM/SPF alignment</TD>
          </tr>
          <tr>
            <TD>Below 50%</TD>
            <TD>Active spoofing or major configuration issues</TD>
            <TD>Audit all sending sources before any policy changes</TD>
          </tr>
        </tbody>
      </Table>

      <H2>Privacy Considerations When Analyzing DMARC Reports</H2>
      <P>
        DMARC aggregate reports contain more sensitive data than many organizations
        realize:
      </P>
      <UL>
        <LI>
          Source IP addresses that reveal your sending infrastructure and the third-party
          services you use
        </LI>
        <LI>
          Message volume data that reveals business activity patterns
        </LI>
        <LI>
          Authentication failure patterns that reveal security weaknesses
        </LI>
      </UL>
      <P>
        Uploading these reports to a SaaS DMARC tool means a third party has visibility
        into your email infrastructure. For regulated industries (healthcare, finance,
        legal), this can create compliance concerns. Browser-native analysis eliminates
        this risk entirely — the data never leaves your device.
      </P>

      <HR />

      <H2>Frequently Asked Questions</H2>

      <H3>What is a DMARC XML report?</H3>
      <P>
        A DMARC XML report (also called an aggregate report or RUA report) is an XML
        file sent by receiving mail servers to the domain owner. It summarises how many
        messages were received claiming to be from your domain, how many passed SPF and
        DKIM authentication, and how many were handled according to your DMARC policy.
      </P>

      <H3>Why are some DMARC XML files so large (100MB+)?</H3>
      <P>
        DMARC aggregate reports grow large when your domain sends a high volume of email.
        Each <Code>record</Code> entry represents a unique combination of source IP,
        authentication result, and disposition. High-volume senders — especially those
        using third-party email services — can accumulate millions of records per
        reporting period, pushing file sizes into the hundreds of megabytes.
      </P>

      <H3>Can I analyze a large DMARC XML file without uploading it?</H3>
      <P>
        Yes. DMARC Labs uses a browser-native XML parser that processes your file
        entirely on your device. The file is never sent to any server. This removes
        file-size limits — your browser can process files of any size, including 100MB+
        reports that would overwhelm typical SaaS DMARC tools.
      </P>

      <H3>How do I move from p=none to p=reject safely?</H3>
      <P>
        Start with <Code>p=none</Code>, collect reports for 2–4 weeks, and identify all
        legitimate email sources. Fix authentication for each. Then move to{' '}
        <Code>p=quarantine; pct=10</Code>, gradually increasing the percentage. Once the
        pass rate stabilizes above 95%, move to <Code>p=reject</Code>.
      </P>

      <H3>Is DMARC Labs free to use?</H3>
      <P>
        Yes, completely free. No signup required, no file size limit, and no data is
        ever sent to a server. All parsing, analysis, and IP enrichment happens in your
        browser using client-side JavaScript.
      </P>
    </BlogPostLayout>
  );
}
