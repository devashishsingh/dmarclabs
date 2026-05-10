import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Blockquote, Note, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'How to Read a DMARC XML Report: A Field Guide for Email Admins',
  description:
    'DMARC aggregate XML reports are dense and technical. This guide walks through every field — from report_metadata to auth_results — with real examples and plain-English explanations.',
  keywords: [
    'how to read DMARC XML report',
    'DMARC aggregate report fields',
    'DMARC XML structure',
    'DMARC report explained',
    'DMARC XML tutorial',
  ],
  robots: 'index, follow',
  alternates: { canonical: 'https://www.dmarclabsds1.xyz/blog/how-to-read-dmarc-xml-report' },
  openGraph: {
    title: 'How to Read a DMARC XML Report: A Field Guide for Email Admins',
    description:
      'Field-by-field guide to understanding DMARC aggregate XML reports, with real examples.',
    url: 'https://www.dmarclabsds1.xyz/blog/how-to-read-dmarc-xml-report',
    siteName: 'DMARC Labs',
    type: 'article',
  },
};

export default function Page() {
  return (
    <BlogPostLayout
      title="How to Read a DMARC XML Report: A Field Guide for Email Admins"
      description="DMARC aggregate XML reports are dense and technical. This guide walks through every field — from report_metadata to auth_results — with real examples and plain-English explanations."
      date="2025-07-05"
      readTime="12 min read"
      tags={['Tutorial', 'XML', 'DMARC']}
    >
      <Lead>
        DMARC aggregate reports look intimidating the first time you open one. Nested
        XML elements, Unix timestamps, IP addresses, and cryptic result codes — it reads
        like a debug log. This guide walks through every element, explains what it means
        in plain English, and shows you what to look for when diagnosing email
        authentication problems.
      </Lead>

      <H2>The Top-Level Structure</H2>
      <P>
        Every DMARC aggregate report follows the RFC 7489 schema. The root element is
        always <Code>&lt;feedback&gt;</Code>, and it contains exactly three types of
        children:
      </P>
      <OL>
        <OLI><Code>&lt;report_metadata&gt;</Code> — information about the report itself</OLI>
        <OLI><Code>&lt;policy_published&gt;</Code> — your DMARC policy as seen by the reporter</OLI>
        <OLI><Code>&lt;record&gt;</Code> — one entry per unique sending source (one or more)</OLI>
      </OL>
      <Pre>{`<?xml version="1.0" encoding="UTF-8" ?>
<feedback>
  <report_metadata> ... </report_metadata>
  <policy_published> ... </policy_published>
  <record> ... </record>
  <record> ... </record>
  <!-- potentially thousands more records -->
</feedback>`}</Pre>

      <H2>report_metadata: Who Sent This Report</H2>
      <Pre>{`<report_metadata>
  <org_name>Google LLC</org_name>
  <email>noreply-dmarc-support@google.com</email>
  <extra_contact_info>https://support.google.com/a/answer/2466580</extra_contact_info>
  <report_id>12456789012345678</report_id>
  <date_range>
    <begin>1751241600</begin>
    <end>1751327999</end>
  </date_range>
</report_metadata>`}</Pre>

      <H3>org_name</H3>
      <P>
        The name of the organization that generated this report. For Google Workspace
        and Gmail, this is &ldquo;Google LLC&rdquo;. For Microsoft (Outlook.com /
        Office 365), it is &ldquo;Microsoft Corporation&rdquo;. Smaller providers may
        use their company name or their mail server hostname.
      </P>

      <H3>email</H3>
      <P>
        The email address of the reporting organization. This is for reference only —
        do not reply to it. DMARC reporting is one-way.
      </P>

      <H3>report_id</H3>
      <P>
        A unique identifier for this report, assigned by the sending organization. Useful
        if you need to correlate a specific report with a provider when troubleshooting.
      </P>

      <H3>date_range / begin / end</H3>
      <P>
        Unix timestamps (seconds since January 1, 1970 UTC) indicating the start and
        end of the reporting period. DMARC reports cover a 24-hour window, typically
        midnight-to-midnight UTC.
      </P>
      <Note>
        To convert a Unix timestamp to a human-readable date, run:{' '}
        <Code>new Date(1751241600 * 1000).toISOString()</Code> in your browser console,
        or use an online converter.
      </Note>

      <H2>policy_published: Your DMARC Policy</H2>
      <Pre>{`<policy_published>
  <domain>example.com</domain>
  <adkim>r</adkim>
  <aspf>r</aspf>
  <p>reject</p>
  <sp>reject</sp>
  <pct>100</pct>
</policy_published>`}</Pre>

      <H3>domain</H3>
      <P>
        The domain this DMARC policy applies to. This is the organizational domain, not
        necessarily the exact sending domain.
      </P>

      <H3>adkim — DKIM alignment mode</H3>
      <P>
        <Code>r</Code> = relaxed (subdomain of the organizational domain qualifies)
        <br />
        <Code>s</Code> = strict (exact domain match required)
      </P>
      <P>
        Most organizations use <Code>r</Code> (relaxed). Strict mode is used when you
        need to prevent subdomains from satisfying alignment for the parent domain.
      </P>

      <H3>aspf — SPF alignment mode</H3>
      <P>
        Same as <Code>adkim</Code> but for SPF. <Code>r</Code> is relaxed, <Code>s</Code>{' '}
        is strict.
      </P>

      <H3>p — policy</H3>
      <P>The main DMARC policy applied to the organizational domain:</P>
      <UL>
        <LI><Code>none</Code> — deliver and report, no action taken on failures</LI>
        <LI><Code>quarantine</Code> — send failures to spam/junk folder</LI>
        <LI><Code>reject</Code> — reject failures at the SMTP layer</LI>
      </UL>

      <H3>sp — subdomain policy</H3>
      <P>
        Policy applied to subdomains of your organizational domain. If absent, the main
        policy <Code>p</Code> applies to subdomains as well. Common to set{' '}
        <Code>sp=reject</Code> even while <Code>p=none</Code> to immediately protect
        subdomains from spoofing.
      </P>

      <H3>pct — percentage</H3>
      <P>
        The percentage of messages that the policy is applied to. Ranges from 1 to 100.
        Using <Code>pct=10</Code> means the policy applies to a random 10% of failing
        messages — useful for gradual rollout. When not specified, defaults to 100.
      </P>

      <H2>record: The Core Data</H2>
      <P>
        Each <Code>&lt;record&gt;</Code> element represents a unique combination of
        source IP address and authentication outcomes. A report can contain one record
        or thousands.
      </P>
      <Pre>{`<record>
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
    <envelope_to>example.com</envelope_to>
    <envelope_from>bounce.example.com</envelope_from>
    <header_from>example.com</header_from>
  </identifiers>
  <auth_results>
    <dkim>
      <domain>example.com</domain>
      <selector>google</selector>
      <result>pass</result>
    </dkim>
    <spf>
      <domain>bounce.example.com</domain>
      <result>pass</result>
    </spf>
  </auth_results>
</record>`}</Pre>

      <H3>row / source_ip</H3>
      <P>
        The IP address of the server that connected to the receiving mail server (the
        MTA that did the actual SMTP delivery). This is typically the IP of your ESP,
        your own mail server, or a legitimate/illegitimate third party.
      </P>

      <H3>row / count</H3>
      <P>
        How many messages were sent from this source IP with this exact combination of
        authentication outcomes during the reporting period. A count of 4821 means
        4,821 messages from that IP, all with the same policy_evaluated result.
      </P>

      <H3>policy_evaluated / disposition</H3>
      <P>
        What the receiving server <Strong>actually did</Strong> with these messages
        based on your policy:
      </P>
      <UL>
        <LI><Code>none</Code> — delivered normally</LI>
        <LI><Code>quarantine</Code> — placed in spam/junk</LI>
        <LI><Code>reject</Code> — rejected at SMTP layer (not delivered)</LI>
      </UL>
      <P>
        When your policy is <Code>p=none</Code>, the disposition will always be{' '}
        <Code>none</Code> regardless of authentication results — the provider is
        reporting without taking action.
      </P>

      <H3>policy_evaluated / dkim and spf</H3>
      <P>
        These are the critical fields. They indicate whether DKIM/SPF{' '}
        <Strong>passed AND aligned</Strong>. This is different from the raw authentication
        result in <Code>auth_results</Code>:
      </P>
      <Table>
        <THead>
          <tr>
            <TH>auth_results result</TH>
            <TH>Alignment</TH>
            <TH>policy_evaluated result</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>pass</TD>
            <TD>Domain aligns with From:</TD>
            <TD>pass</TD>
          </tr>
          <tr>
            <TD>pass</TD>
            <TD>Domain does NOT align with From:</TD>
            <TD>fail</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>N/A</TD>
            <TD>fail</TD>
          </tr>
        </tbody>
      </Table>
      <P>
        A message passes DMARC if{' '}
        <Strong>at least one of policy_evaluated/dkim or policy_evaluated/spf is &ldquo;pass&rdquo;</Strong>.
      </P>

      <H3>identifiers / header_from</H3>
      <P>
        The domain in the visible <Code>From:</Code> header of the email — the domain
        your recipients see in their mail client. This is the domain that DMARC alignment
        is checked against.
      </P>

      <H3>auth_results / dkim</H3>
      <P>The raw DKIM check result, before alignment is applied:</P>
      <UL>
        <LI><Code>pass</Code> — signature verified successfully</LI>
        <LI><Code>fail</Code> — signature verification failed (key mismatch, body modified)</LI>
        <LI><Code>temperror</Code> — temporary DNS lookup failure, try again later</LI>
        <LI><Code>permerror</Code> — permanent error (malformed key record, invalid signature)</LI>
        <LI><Code>neutral</Code> — no result (domain not in DNS)</LI>
      </UL>
      <P>
        The <Code>selector</Code> field identifies which DKIM key was used (e.g.,
        <Code>google</Code>, <Code>s1</Code>, <Code>default</Code>). If you see a
        selector you don&apos;t recognize, a third-party platform may be signing your
        messages with its own key.
      </P>

      <H3>auth_results / spf</H3>
      <P>
        The raw SPF check result for the envelope sender domain (Return-Path):
      </P>
      <UL>
        <LI><Code>pass</Code> — sending IP is listed in the SPF record</LI>
        <LI><Code>fail</Code> — sending IP is explicitly unauthorized (<Code>-all</Code>)</LI>
        <LI><Code>softfail</Code> — sending IP is weakly unauthorized (<Code>~all</Code>)</LI>
        <LI><Code>neutral</Code> — policy does not make an assertion (<Code>?all</Code>)</LI>
        <LI><Code>none</Code> — no SPF record found</LI>
        <LI><Code>temperror</Code> / <Code>permerror</Code> — DNS errors</LI>
      </UL>

      <H2>Common Record Patterns and What They Mean</H2>

      <H3>Pattern: Both pass — healthy</H3>
      <Pre>{`<policy_evaluated>
  <disposition>none</disposition>
  <dkim>pass</dkim>
  <spf>pass</spf>
</policy_evaluated>`}</Pre>
      <P>
        This is what you want. The source IP is a known, authenticated sender with
        correct alignment. All is well.
      </P>

      <H3>Pattern: SPF pass, DKIM fail — common for third-party senders</H3>
      <Pre>{`<policy_evaluated>
  <disposition>none</disposition>
  <dkim>fail</dkim>
  <spf>pass</spf>
</policy_evaluated>`}</Pre>
      <P>
        The sender is in your SPF record and SPF aligns. But DKIM is absent or not
        aligned. This is passing DMARC via SPF but is fragile — if the message is
        forwarded, SPF will break. Configure DKIM signing on this platform.
      </P>

      <H3>Pattern: Both fail — unauthenticated sender</H3>
      <Pre>{`<policy_evaluated>
  <disposition>reject</disposition>
  <dkim>fail</dkim>
  <spf>fail</spf>
</policy_evaluated>`}</Pre>
      <P>
        This is either an unauthorized sender being actively blocked (if you are at{' '}
        <Code>p=reject</Code>) or a gap in your authentication coverage that you need
        to address before enforcing. Check the source IP via WHOIS to determine if this
        is a legitimate sender with missing configuration or spoofing traffic.
      </P>

      <HR />

      <Blockquote>
        Understanding the difference between <Code>auth_results</Code> (raw crypto
        result) and <Code>policy_evaluated</Code> (alignment-aware result) is the single
        most important concept in reading DMARC reports. Most confusion in DMARC
        troubleshooting comes from not knowing which section is relevant to DMARC
        compliance.
      </Blockquote>
    </BlogPostLayout>
  );
}
