import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Note, Tip, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'DMARC XML Report Fields Explained — Complete Field Reference',
  description:
    'A plain-English reference for every field in a DMARC aggregate XML report: report_metadata, policy_published, source_ip, disposition, dkim, spf, count, and more.',
  keywords: [
    'dmarc xml report fields',
    'dmarc aggregate report format',
    'dmarc xml schema',
    'feedback element dmarc',
    'policy_evaluated dmarc',
    'dmarc report explained',
    'dmarc xml structure',
    'source_ip dmarc',
    'dmarc report_metadata',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.dmarclabsds1.xyz/blog/dmarc-xml-report-fields-explained',
  },
  openGraph: {
    title: 'DMARC XML Report Fields Explained — Complete Field Reference',
    description:
      'Plain-English reference for every field in a DMARC aggregate XML report. Covers report_metadata, policy_published, source_ip, disposition, dkim, spf, count, and auth_results.',
    url: 'https://www.dmarclabsds1.xyz/blog/dmarc-xml-report-fields-explained',
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
      name: 'What does the source_ip field mean in a DMARC report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The source_ip field contains the IP address of the mail server that sent the message claiming to be from your domain. This is the server that the receiving provider actually connected from — not the domain in the From: header. Identifying the source IP is critical for understanding which sending services are generating DMARC pass or fail results.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between disposition and policy_evaluated in a DMARC report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'policy_evaluated shows what DMARC actually decided to do with the message (none, quarantine, or reject), based on your published policy and the pct (percentage) tag. disposition is what the receiving mail server actually did with the message. These can differ when a server overrides the policy for local reasons.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does count mean in a DMARC XML report?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The count field is the number of messages that matched this specific combination of source IP, authentication results, and policy outcome during the reporting period. A single record can represent millions of messages from a high-volume sender like Google Workspace or Mailchimp.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between dkim in policy_evaluated and dkim in auth_results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The dkim field inside policy_evaluated tells you whether DKIM passed AND aligned with your From: domain (which is what DMARC cares about). The dkim section inside auth_results tells you the raw DKIM signature result for each domain that signed the message, regardless of alignment. You can have a raw dkim pass in auth_results but still fail DMARC if the signing domain does not align.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does adkim and aspf mean in policy_published?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'adkim controls DKIM alignment mode: r (relaxed) allows organizational domain matches, s (strict) requires exact domain matches. aspf controls SPF alignment mode with the same r/s values. Most domains use relaxed alignment (adkim=r, aspf=r) to accommodate subdomains and third-party senders.',
      },
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'DMARC XML Report Fields Explained — Complete Field Reference',
  description:
    'A plain-English reference for every field in a DMARC aggregate XML report.',
  datePublished: '2025-07-07',
  dateModified: '2025-07-07',
  author: { '@type': 'Organization', name: 'DMARC Labs' },
  publisher: { '@type': 'Organization', name: 'DMARC Labs', url: 'https://www.dmarclabsds1.xyz' },
  mainEntityOfPage: 'https://www.dmarclabsds1.xyz/blog/dmarc-xml-report-fields-explained',
  wordCount: 2800,
};

export default function Page() {
  return (
    <BlogPostLayout
      title="DMARC XML Report Fields Explained — Complete Field Reference"
      description="A plain-English reference for every field in a DMARC aggregate XML report: report_metadata, policy_published, source_ip, disposition, dkim, spf, count, and more."
      date="2025-07-07"
      readTime="10 min read"
      tags={['DMARC', 'XML', 'Reference']}
      jsonLd={[faqJsonLd, articleJsonLd]}
    >
      <Lead>
        You downloaded a DMARC aggregate report and opened the XML. What you saw probably
        looked like this: hundreds of nested elements with names like{' '}
        <Code>policy_evaluated</Code>, <Code>auth_results</Code>, and{' '}
        <Code>disposition</Code>. This reference decodes every field, one by one, in plain
        English.
      </Lead>

      <Note>
        <Strong>What is a DMARC aggregate report?</Strong> — A DMARC aggregate report (also
        called an RUA report) is an XML file that receiving mail servers send to your domain
        to report how they handled mail claiming to be from you. Every Gmail, Outlook, and
        Yahoo server that receives your email sends one of these daily.
      </Note>

      <H2>Top-level structure</H2>
      <P>
        Every DMARC XML file has exactly one root element: <Code>feedback</Code>. Inside it
        you will always find two metadata sections followed by one or more{' '}
        <Code>record</Code> elements.
      </P>
      <Pre>{`<feedback>
  <report_metadata>…</report_metadata>
  <policy_published>…</policy_published>
  <record>…</record>
  <record>…</record>
</feedback>`}</Pre>
      <P>
        The number of <Code>record</Code> elements equals the number of unique combinations
        of source IP, authentication result, and policy outcome observed during the reporting
        period. A single report from Google can have thousands of records.
      </P>

      <H2>report_metadata fields</H2>
      <P>
        The <Code>report_metadata</Code> block identifies who sent the report and when.
      </P>

      <Table>
        <THead>
          <tr>
            <TH>Field</TH>
            <TH>Example value</TH>
            <TH>What it means</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Code>org_name</Code></TD>
            <TD>Google LLC</TD>
            <TD>The name of the receiving organization that generated this report. Common values: Google LLC, Microsoft Corporation, Yahoo Inc.</TD>
          </tr>
          <tr>
            <TD><Code>email</Code></TD>
            <TD>noreply-dmarc-support@google.com</TD>
            <TD>The email address of the reporting organization. Not a contact you can reply to.</TD>
          </tr>
          <tr>
            <TD><Code>report_id</Code></TD>
            <TD>12345678901234567</TD>
            <TD>A unique identifier for this specific report, assigned by the sender. Useful for deduplication when processing multiple reports.</TD>
          </tr>
          <tr>
            <TD><Code>date_range/begin</Code></TD>
            <TD>1751241600</TD>
            <TD>Unix timestamp for the start of the reporting period. Typically 00:00:00 UTC of the report day.</TD>
          </tr>
          <tr>
            <TD><Code>date_range/end</Code></TD>
            <TD>1751327999</TD>
            <TD>Unix timestamp for the end of the reporting period. Typically 23:59:59 UTC — so most reports cover exactly one day.</TD>
          </tr>
        </tbody>
      </Table>

      <H2>policy_published fields</H2>
      <P>
        The <Code>policy_published</Code> block records the DMARC policy that was in your
        DNS at the time the messages were received. This is a snapshot of your policy as the
        receiving server saw it — not your current policy.
      </P>

      <Table>
        <THead>
          <tr>
            <TH>Field</TH>
            <TH>Possible values</TH>
            <TH>What it means</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Code>domain</Code></TD>
            <TD>example.com</TD>
            <TD>The domain for which this DMARC policy applies — the domain in your From: header.</TD>
          </tr>
          <tr>
            <TD><Code>adkim</Code></TD>
            <TD>r, s</TD>
            <TD>DKIM alignment mode. <Strong>r</Strong> (relaxed) allows organizational domain matches. <Strong>s</Strong> (strict) requires exact domain match. Most domains use r.</TD>
          </tr>
          <tr>
            <TD><Code>aspf</Code></TD>
            <TD>r, s</TD>
            <TD>SPF alignment mode. Same r/s values as adkim. Controls whether the SPF-authenticated domain must exactly match the From: domain.</TD>
          </tr>
          <tr>
            <TD><Code>p</Code></TD>
            <TD>none, quarantine, reject</TD>
            <TD>Your DMARC policy for the organizational domain. <Strong>none</Strong> = monitoring only. <Strong>quarantine</Strong> = send to spam. <Strong>reject</Strong> = block the message.</TD>
          </tr>
          <tr>
            <TD><Code>sp</Code></TD>
            <TD>none, quarantine, reject</TD>
            <TD>Subdomain policy. Applies to all subdomains not explicitly listed. If omitted, falls back to p.</TD>
          </tr>
          <tr>
            <TD><Code>pct</Code></TD>
            <TD>0–100</TD>
            <TD>The percentage of non-passing messages to which the policy is applied. Useful for gradual rollout. pct=100 means full enforcement.</TD>
          </tr>
        </tbody>
      </Table>

      <H2>record — the core data</H2>
      <P>
        Each <Code>record</Code> represents a unique sending scenario observed during the
        reporting period. If Google saw 12 different IP addresses sending mail from your
        domain, there will be 12 or more records (potentially more if the same IP had
        different auth results).
      </P>

      <H3>row fields</H3>
      <Table>
        <THead>
          <tr>
            <TH>Field</TH>
            <TH>Example value</TH>
            <TH>What it means</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Code>source_ip</Code></TD>
            <TD>209.85.128.0</TD>
            <TD>The IP address of the mail server that delivered the message. This is the actual sending server — a Google Workspace IP, a Mailchimp relay, your own mail server, or a spoofing attempt.</TD>
          </tr>
          <tr>
            <TD><Code>count</Code></TD>
            <TD>4821</TD>
            <TD>How many messages this record represents. One record can cover millions of identical authentication results from the same source. High counts from unknown IPs are a red flag.</TD>
          </tr>
        </tbody>
      </Table>

      <H3>policy_evaluated fields</H3>
      <P>
        This is what DMARC decided, based on your policy and the authentication results.
      </P>
      <Table>
        <THead>
          <tr>
            <TH>Field</TH>
            <TH>Possible values</TH>
            <TH>What it means</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Code>disposition</Code></TD>
            <TD>none, quarantine, reject</TD>
            <TD>What the receiving server actually did with the message. May differ from your published policy if the server applied a local override.</TD>
          </tr>
          <tr>
            <TD><Code>dkim</Code></TD>
            <TD>pass, fail</TD>
            <TD>Whether DKIM passed AND aligned with your From: domain. This is the DMARC DKIM result — a raw DKIM pass that is misaligned still shows as fail here.</TD>
          </tr>
          <tr>
            <TD><Code>spf</Code></TD>
            <TD>pass, fail</TD>
            <TD>Whether SPF passed AND aligned with your From: domain. Same alignment logic applies: a pass on a misaligned domain shows as fail in DMARC context.</TD>
          </tr>
        </tbody>
      </Table>

      <Note>
        <Strong>DMARC pass requires only one of the two.</Strong> — A message passes DMARC
        if either DKIM or SPF (or both) show <Code>pass</Code> in{' '}
        <Code>policy_evaluated</Code>. Both failing means the message failed DMARC entirely.
      </Note>

      <H3>auth_results fields</H3>
      <P>
        The <Code>auth_results</Code> section gives you the raw authentication results,
        separate from alignment. This is where you diagnose <em>why</em> alignment failed.
      </P>
      <Table>
        <THead>
          <tr>
            <TH>Field</TH>
            <TH>Example value</TH>
            <TH>What it means</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD><Code>dkim/domain</Code></TD>
            <TD>mailchimp.com</TD>
            <TD>The domain used in the DKIM signature — the <Code>d=</Code> value. If this does not match or share an organizational domain with your From: header domain, DMARC DKIM alignment fails.</TD>
          </tr>
          <tr>
            <TD><Code>dkim/result</Code></TD>
            <TD>pass, fail, temperror, permerror, neutral, policy, none</TD>
            <TD>The raw DKIM signature verification result. <Code>pass</Code> = signature valid. <Code>fail</Code> = signature invalid or key missing. <Code>permerror</Code> = misconfigured DKIM record.</TD>
          </tr>
          <tr>
            <TD><Code>dkim/selector</Code></TD>
            <TD>k1</TD>
            <TD>The DKIM selector used to find the public key in DNS. Useful for diagnosing which signing key was used.</TD>
          </tr>
          <tr>
            <TD><Code>spf/domain</Code></TD>
            <TD>mailchimp.com</TD>
            <TD>The domain used in the SPF check — the envelope sender (Return-Path) domain. For DMARC alignment, this must match your From: domain.</TD>
          </tr>
          <tr>
            <TD><Code>spf/result</Code></TD>
            <TD>pass, fail, softfail, neutral, none, temperror, permerror</TD>
            <TD>The raw SPF lookup result. <Code>pass</Code> = sending IP is authorized. <Code>softfail</Code> = IP not explicitly authorized (often ~all in SPF record). <Code>fail</Code> = IP explicitly blocked (-all).</TD>
          </tr>
        </tbody>
      </Table>

      <H2>Reading a complete record: annotated example</H2>
      <Pre>{`<record>
  <row>
    <source_ip>198.2.128.150</source_ip>     <!-- Mailchimp relay IP -->
    <count>12847</count>                      <!-- 12,847 messages -->
    <policy_evaluated>
      <disposition>none</disposition>         <!-- p=none, so no action -->
      <dkim>pass</dkim>                       <!-- DKIM aligned ✓ -->
      <spf>fail</spf>                         <!-- SPF not aligned ✗ -->
    </policy_evaluated>
  </row>
  <auth_results>
    <dkim>
      <domain>example.com</domain>            <!-- matches From: domain -->
      <selector>mc1</selector>
      <result>pass</result>                   <!-- signature valid -->
    </dkim>
    <spf>
      <domain>mcsv.net</domain>               <!-- Mailchimp envelope domain -->
      <result>pass</result>                   <!-- SPF passes for mcsv.net -->
    </spf>                                    <!-- but mcsv.net ≠ example.com -->
  </auth_results>
</record>`}</Pre>
      <P>
        This record passes DMARC (because DKIM is aligned and passing) even though SPF
        alignment fails. The message is from Mailchimp, which signs with your domain via
        DKIM but sends using its own envelope domain.
      </P>

      <H2>Common field combinations and what they mean</H2>
      <Table>
        <THead>
          <tr>
            <TH>DKIM (policy_evaluated)</TH>
            <TH>SPF (policy_evaluated)</TH>
            <TH>DMARC result</TH>
            <TH>Most likely cause</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>pass</TD>
            <TD>pass</TD>
            <TD>PASS</TD>
            <TD>Fully authenticated mail from a correctly configured sender.</TD>
          </tr>
          <tr>
            <TD>pass</TD>
            <TD>fail</TD>
            <TD>PASS</TD>
            <TD>Third-party sender (ESP like Mailchimp) with DKIM set up correctly but using its own envelope domain.</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>pass</TD>
            <TD>PASS</TD>
            <TD>Your own mail server (SMTP) with correct SPF but no DKIM, or DKIM signing the wrong domain.</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>fail</TD>
            <TD>FAIL</TD>
            <TD>Spoofing attempt, misconfigured sender, or forwarded mail that broke both SPF and DKIM.</TD>
          </tr>
        </tbody>
      </Table>

      <H2>Diagnosing failures: what to look for</H2>
      <OL>
        <OLI>
          <Strong>High count DMARC failures from unknown IPs</Strong> — Check the source IP
          against known ESP ranges. If it does not belong to any service you use, it is
          likely spoofing or phishing.
        </OLI>
        <OLI>
          <Strong>DKIM fail with auth_results showing pass</Strong> — The DKIM signature
          verified, but the signing domain (<Code>dkim/domain</Code> in auth_results) does
          not align with your From: domain. Fix: configure your ESP to sign with your domain
          instead of its own.
        </OLI>
        <OLI>
          <Strong>SPF fail with auth_results showing pass</Strong> — SPF verified for the
          envelope domain, but that domain does not align with your From: domain. Fix: either
          add the sending IP to your own SPF record or configure DKIM alignment instead.
        </OLI>
        <OLI>
          <Strong>disposition = quarantine or reject despite p=none</Strong> — The receiving
          server applied a local policy override. This is rare but indicates the server
          ignores your published p=none in certain conditions.
        </OLI>
      </OL>

      <Tip>
        Instead of manually parsing this XML, upload your report to the{' '}
        <a href="/#upload" className="text-accent hover:underline">
          DMARC Labs analyzer
        </a>
        . It decodes every field instantly, enriches each source IP with WHOIS data, and
        shows you pass/fail rates in a readable dashboard — no signup required.
      </Tip>

      <H2>Frequently asked questions</H2>

      <H3>What does the source_ip field mean in a DMARC report?</H3>
      <P>
        The <Code>source_ip</Code> field contains the IP address of the mail server that
        actually delivered the message to the receiving provider. This is the outbound SMTP
        server — a Google Workspace relay, a Mailchimp IP, your office mail server, or a
        spoofing server. Identifying and cross-referencing these IPs is the core task in
        DMARC report analysis.
      </P>

      <H3>What is the difference between disposition and policy_evaluated?</H3>
      <P>
        <Code>policy_evaluated/disposition</Code> is what DMARC calculated should happen
        based on your policy and the authentication result. The actual{' '}
        <Code>disposition</Code> is what the receiving server did. These differ when a server
        applies a local override — for example, a mailbox provider might refuse to reject
        mail even when your policy says <Code>p=reject</Code> if the message passed a
        reputation check.
      </P>

      <H3>Why does count matter?</H3>
      <P>
        Count lets you prioritize. A failure with count=1 is background noise. A failure with
        count=500,000 means half a million of your emails are failing DMARC and potentially
        being rejected. Always sort your records by count descending before investigating.
      </P>

      <HR />
      <P>
        Every field in the DMARC XML format serves a specific diagnostic purpose. The fastest
        way to analyze them without manually reading XML is to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          upload your report to DMARC Labs
        </a>{' '}
        — your file is processed entirely in your browser, never sent to a server.
      </P>
    </BlogPostLayout>
  );
}
