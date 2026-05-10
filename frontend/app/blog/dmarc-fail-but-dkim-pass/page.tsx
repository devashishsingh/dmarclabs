import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Note, Tip, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'DMARC Failing But DKIM Passes — 5 Root Causes and How to Fix Them',
  description:
    'Email failing DMARC even though DKIM passes? Here are the five most common causes — alignment mismatch, forwarding, subdomain policy, wrong selector, p=reject — and how to diagnose each one.',
  keywords: [
    'dmarc fail dkim pass',
    'dmarc fail dkim pass spf fail',
    'email failing dmarc but passing dkim',
    'dmarc fail but dkim pass',
    'dkim pass dmarc fail alignment',
    'dmarc alignment failure',
    'dkim aligned dmarc',
    'dmarc troubleshooting',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://dmarclabsds1.xyz/blog/dmarc-fail-but-dkim-pass',
  },
  openGraph: {
    title: 'DMARC Failing But DKIM Passes — 5 Root Causes and How to Fix Them',
    description:
      'Email failing DMARC even though DKIM passes? These five causes explain why and how to fix each one.',
    url: 'https://dmarclabsds1.xyz/blog/dmarc-fail-but-dkim-pass',
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
      name: 'Why does DMARC fail even when DKIM passes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DMARC requires that DKIM not only passes cryptographic verification but also aligns with the domain in the From: header. If DKIM passes for a different domain (such as your ESP\'s domain instead of yours), DMARC will still fail even though the DKIM signature itself is valid. This is called a DKIM alignment failure.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is DKIM alignment in DMARC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DKIM alignment means the domain in the DKIM d= tag (the signing domain) must match the domain in the From: header of the email. In relaxed alignment mode (adkim=r), the organizational domains must match — so mail.example.com and example.com align. In strict mode (adkim=s), the domains must be identical. If a third-party ESP signs with their own domain instead of yours, DKIM alignment fails even if the signature is cryptographically valid.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can an email fail DMARC if both DKIM and SPF pass?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. An email can fail DMARC even if both DKIM and SPF pass the raw authentication check, if neither of them is aligned with the From: domain. DMARC requires at least one aligned pass — a raw DKIM pass on the wrong domain and a raw SPF pass for the wrong envelope sender both count as DMARC failures.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I fix DKIM alignment failure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The fix depends on the sender. For third-party ESPs like Mailchimp, HubSpot, or Salesforce, configure custom domain signing — most ESPs have a "Custom Domain" or "Authenticated Domain" option that lets them sign email with your domain instead of their own. This requires adding a CNAME record to your DNS pointing to the ESP\'s signing key. Once configured, DKIM alignment passes automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does email forwarding cause DMARC failures?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Email forwarding almost always breaks SPF, because the forwarding server\'s IP is not in your SPF record. If DKIM is also not configured (or the forwarder modifies the message and breaks the DKIM signature), the forwarded message will fail DMARC. This is a known limitation of DMARC and is partially addressed by ARC (Authenticated Received Chain), which large providers like Google and Microsoft support.',
      },
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'DMARC Failing But DKIM Passes — 5 Root Causes and How to Fix Them',
  description:
    'Email failing DMARC even though DKIM passes? Five root causes explained with diagnosis checklists.',
  datePublished: '2025-07-09',
  dateModified: '2025-07-09',
  author: { '@type': 'Organization', name: 'DMARC Labs' },
  publisher: { '@type': 'Organization', name: 'DMARC Labs', url: 'https://dmarclabsds1.xyz' },
  mainEntityOfPage: 'https://dmarclabsds1.xyz/blog/dmarc-fail-but-dkim-pass',
  wordCount: 2700,
};

export default function Page() {
  return (
    <BlogPostLayout
      title="DMARC Failing But DKIM Passes — 5 Root Causes and How to Fix Them"
      description="Email failing DMARC even though DKIM passes? Here are the five most common causes — alignment mismatch, forwarding, subdomain policy, wrong selector, p=reject — and how to diagnose each one."
      date="2025-07-09"
      readTime="11 min read"
      tags={['DMARC', 'DKIM', 'Troubleshooting']}
      jsonLd={[faqJsonLd, articleJsonLd]}
    >
      <Lead>
        Your DMARC report shows DKIM passing, but messages are still failing DMARC. This is
        one of the most common and confusing email deliverability problems. A DKIM pass alone
        is not enough — DMARC has an additional requirement called alignment that catches
        exactly this scenario.
      </Lead>

      <Note>
        <Strong>Why DMARC fail + DKIM pass happens:</Strong> DMARC requires that the DKIM
        signing domain (<Code>d=</Code> tag) match the domain in the From: header of the
        email. A valid DKIM signature on the wrong domain passes DKIM but fails DMARC
        alignment. This is the most common cause of this problem.
      </Note>

      <H2>Understanding DMARC alignment</H2>
      <P>
        DMARC does not just check if DKIM passes — it checks if DKIM passes{' '}
        <em>and aligns</em>. Alignment means the DKIM signing domain must match (or share an
        organizational domain with) the domain in the message From: header.
      </P>
      <P>
        There are two alignment modes, controlled by the <Code>adkim=</Code> tag in your
        DMARC record:
      </P>
      <Table>
        <THead>
          <tr>
            <TH>Mode</TH>
            <TH>Tag</TH>
            <TH>What it requires</TH>
            <TH>Example</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>Relaxed (default)</TD>
            <TD><Code>adkim=r</Code></TD>
            <TD>DKIM d= domain shares the same organizational domain as From:</TD>
            <TD>From: user@example.com, DKIM d=mail.example.com — PASS (same org domain)</TD>
          </tr>
          <tr>
            <TD>Strict</TD>
            <TD><Code>adkim=s</Code></TD>
            <TD>DKIM d= domain must exactly match the From: domain</TD>
            <TD>From: user@example.com, DKIM d=mail.example.com — FAIL (not exact match)</TD>
          </tr>
        </tbody>
      </Table>
      <P>
        Most domains use relaxed alignment (<Code>adkim=r</Code>). If your DMARC record does
        not specify <Code>adkim=</Code>, relaxed is the default.
      </P>

      <H2>Root cause 1: DKIM signing domain mismatch (most common)</H2>
      <P>
        The most common cause of "DKIM passes, DMARC fails" is a third-party email service
        provider (ESP) signing your email with <em>their</em> domain instead of yours.
      </P>
      <Pre>{`<!-- DMARC failure: DKIM passes but uses wrong domain -->
<auth_results>
  <dkim>
    <domain>mailchimp.com</domain>   <!-- ESP's domain, not yours -->
    <selector>k1</selector>
    <result>pass</result>            <!-- Signature is valid -->
  </dkim>
</auth_results>
<policy_evaluated>
  <dkim>fail</dkim>   <!-- Fails alignment: mailchimp.com ≠ yourdomain.com -->
</policy_evaluated>`}</Pre>

      <H3>Diagnosis checklist</H3>
      <UL>
        <LI>Open your DMARC report and find records where <Code>policy_evaluated/dkim = fail</Code></LI>
        <LI>Check the <Code>auth_results/dkim/domain</Code> field — is it your domain or an ESP domain?</LI>
        <LI>If it is an ESP domain (mailchimp.com, mcsv.net, amazonses.com, etc.), alignment is the issue</LI>
      </UL>

      <H3>Fix</H3>
      <P>
        Configure custom domain DKIM signing in your ESP. Every major ESP supports this:
      </P>
      <UL>
        <LI><Strong>Mailchimp</Strong>: Settings → Domains → Authenticate Domain</LI>
        <LI><Strong>SendGrid</Strong>: Settings → Sender Authentication → Domain Authentication</LI>
        <LI><Strong>HubSpot</Strong>: Settings → Marketing Email → Email Sending Domain</LI>
        <LI><Strong>Amazon SES</Strong>: Configuration → Verified Identities → DKIM</LI>
        <LI><Strong>Salesforce / Pardot</Strong>: Admin → Email → DKIM Keys</LI>
      </UL>
      <P>
        After setup, your ESP will give you CNAME records to add to your DNS. Once
        propagated, the ESP signs outgoing mail with your domain, and DKIM alignment passes.
      </P>

      <H2>Root cause 2: Email forwarding breaks alignment</H2>
      <P>
        When a recipient forwards email using server-side forwarding (an alias like{' '}
        <Code>info@yourdomain.com → personal@gmail.com</Code>), the forwarding server
        re-delivers the message from its own IP. This breaks SPF, because the forwarding
        server is not in your SPF record. If the forwarding server also modifies the message
        body (adding footers, rewriting links), it breaks the DKIM signature too.
      </P>
      <Pre>{`<!-- Forwarded message: both fail -->
<source_ip>203.0.113.50</source_ip>   <!-- Forwarding server IP -->
<policy_evaluated>
  <dkim>fail</dkim>   <!-- Message body modified, signature broken -->
  <spf>fail</spf>     <!-- Forwarding IP not in your SPF -->
</policy_evaluated>`}</Pre>

      <H3>Diagnosis checklist</H3>
      <UL>
        <LI>Look for source IPs that belong to hosting providers or small email servers you do not recognize</LI>
        <LI>Check if the <Code>auth_results/dkim/result</Code> is <Code>fail</Code> (not <Code>pass</Code>) — forwarding that modifies the body invalidates the signature entirely</LI>
        <LI>Ask your users if they forward email to a personal account</LI>
      </UL>

      <H3>Fix</H3>
      <P>
        Forwarding-induced failures are largely unavoidable. Options:
      </P>
      <UL>
        <LI>
          Accept the failures — forwarding failures are usually low-count and come from
          known ISPs. They will not affect your policy enforcement for real senders.
        </LI>
        <LI>
          Encourage users to use <Strong>redirect</Strong> (which preserves the original
          message envelope) instead of <Strong>forward</Strong> where possible.
        </LI>
        <LI>
          Note that major providers (Google, Microsoft) support ARC (Authenticated Received
          Chain), which allows them to recognize forwarded mail and avoid failing it.
        </LI>
      </UL>

      <H2>Root cause 3: Subdomain policy mismatch</H2>
      <P>
        If you send from a subdomain (e.g., <Code>From: noreply@mail.example.com</Code>) but
        your DMARC record is only published at the organizational domain level (
        <Code>_dmarc.example.com</Code>), the subdomain inherits your policy — but DKIM
        alignment requires the DKIM <Code>d=</Code> to match the subdomain or its
        organizational parent.
      </P>
      <P>
        With strict alignment (<Code>adkim=s</Code>), signing with{' '}
        <Code>d=example.com</Code> fails alignment for{' '}
        <Code>From: user@mail.example.com</Code>. With relaxed alignment (
        <Code>adkim=r</Code>), both share the organizational domain <Code>example.com</Code>
        and would align.
      </P>

      <H3>Diagnosis checklist</H3>
      <UL>
        <LI>Check if your From: domain is a subdomain different from the DKIM signing domain</LI>
        <LI>Check your DMARC record: is <Code>adkim=s</Code>? If so, relax it to <Code>adkim=r</Code></LI>
        <LI>Verify you do not have a separate DMARC record on the subdomain itself (<Code>_dmarc.mail.example.com</Code>) with a stricter policy</LI>
      </UL>

      <H3>Fix</H3>
      <P>
        Switch to relaxed alignment unless you have a specific reason for strict. In your
        DMARC TXT record:
      </P>
      <Pre>{`v=DMARC1; p=none; adkim=r; aspf=r; rua=mailto:dmarc@example.com`}</Pre>

      <H2>Root cause 4: DKIM selector missing or expired</H2>
      <P>
        DKIM keys are published in DNS as TXT records under a selector. If the selector
        record has expired, was deleted, or never existed for the signing domain, the DKIM
        verification fails cryptographically — so both DKIM and DMARC fail.
      </P>
      <P>
        This is different from alignment failure. In this case, you will see:
      </P>
      <Pre>{`<auth_results>
  <dkim>
    <domain>yourdomain.com</domain>
    <selector>k1</selector>
    <result>permerror</result>   <!-- DNS lookup failed for selector -->
  </dkim>
</auth_results>`}</Pre>

      <H3>Diagnosis checklist</H3>
      <UL>
        <LI>In your DMARC report, check <Code>auth_results/dkim/result</Code> — is it <Code>permerror</Code> or <Code>temperror</Code>?</LI>
        <LI>
          Look up the selector in DNS manually:
          <Pre>{`nslookup -type=TXT k1._domainkey.yourdomain.com`}</Pre>
        </LI>
        <LI>If it returns no records, the key was deleted or never created</LI>
      </UL>

      <H3>Fix</H3>
      <P>
        Re-create or re-publish the DKIM key in DNS. Most email providers and ESPs have a
        section in their settings to regenerate DKIM keys and provide the DNS records to
        publish. After publishing, allow 24–48 hours for DNS propagation and check your next
        DMARC report.
      </P>

      <H2>Root cause 5: p=reject or p=quarantine applied before alignment is fixed</H2>
      <P>
        If you moved to <Code>p=quarantine</Code> or <Code>p=reject</Code> before resolving
        alignment for all legitimate senders, those senders will be blocked or quarantined
        even though their DKIM signatures are technically valid. The DMARC report will show
        DKIM passing in <Code>auth_results</Code> but failing in <Code>policy_evaluated</Code>
        — and the disposition will be <Code>quarantine</Code> or <Code>reject</Code>.
      </P>

      <H3>Fix</H3>
      <P>
        Temporarily roll back to <Code>p=none</Code>, fix alignment for all failing senders,
        then re-advance your policy incrementally:
      </P>
      <OL>
        <OLI>Set <Code>p=none</Code> and collect reports for 2 weeks</OLI>
        <OLI>Fix DKIM alignment for all senders with high message counts</OLI>
        <OLI>Set <Code>p=quarantine; pct=10</Code> — apply quarantine to 10% of failures</OLI>
        <OLI>Increase pct gradually over 4–6 weeks to 100%</OLI>
        <OLI>Switch to <Code>p=reject</Code> once quarantine pass rate is stable above 95%</OLI>
      </OL>

      <H2>Quick diagnosis table</H2>
      <Table>
        <THead>
          <tr>
            <TH>policy_evaluated dkim</TH>
            <TH>auth_results dkim result</TH>
            <TH>auth_results dkim domain</TH>
            <TH>Root cause</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>fail</TD>
            <TD>pass</TD>
            <TD>esp-domain.com (not yours)</TD>
            <TD>Alignment failure — ESP signing with wrong domain</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>fail</TD>
            <TD>your domain</TD>
            <TD>DKIM signature verification failure — key missing, expired, or body modified</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>pass</TD>
            <TD>subdomain of your domain</TD>
            <TD>Strict alignment mismatch — relax to adkim=r</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>permerror</TD>
            <TD>your domain</TD>
            <TD>DKIM selector missing from DNS</TD>
          </tr>
          <tr>
            <TD>fail</TD>
            <TD>pass</TD>
            <TD>your domain</TD>
            <TD>Rare — check for multiple DKIM signatures where only one aligns</TD>
          </tr>
        </tbody>
      </Table>

      <Tip>
        Upload your DMARC report to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          DMARC Labs
        </a>{' '}
        to instantly see which source IPs are failing alignment, what their DKIM signing
        domain is, and how many messages are affected — without parsing raw XML.
      </Tip>

      <H2>Frequently asked questions</H2>

      <H3>Why does DMARC fail even when DKIM passes?</H3>
      <P>
        A valid DKIM signature on the wrong domain — typically your ESP signing with their
        domain instead of yours — passes the DKIM check but fails DMARC alignment. DMARC
        requires both: a valid signature AND a signing domain that matches your From: domain.
      </P>

      <H3>Can an email fail DMARC even if both DKIM and SPF raw checks pass?</H3>
      <P>
        Yes. If DKIM passes for <Code>mailchimp.com</Code> and SPF passes for{' '}
        <Code>mcsv.net</Code> but your From: domain is <Code>example.com</Code>, both
        alignment checks fail. DMARC requires at least one of them to be aligned — not just
        technically valid.
      </P>

      <H3>Does email forwarding cause DMARC failures?</H3>
      <P>
        Yes. Forwarding breaks SPF because the forwarding server is not in your SPF record.
        If the forwarder also modifies the message, it breaks DKIM too. ARC (Authenticated
        Received Chain) is the long-term fix, and major providers like Gmail and Outlook
        already support it for trusted intermediate forwarders.
      </P>

      <HR />
      <P>
        The fastest way to identify which specific senders are causing your DMARC failures is
        to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          analyze your DMARC report in DMARC Labs
        </a>
        . It enriches each source IP with WHOIS data so you can immediately see which service
        is behind each failure — without manually looking up every IP address.
      </P>
    </BlogPostLayout>
  );
}
