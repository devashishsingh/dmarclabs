import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import {
  H2, H3, P, Lead, Strong, Code, Pre, UL, LI, OL, OLI,
  Note, Tip, Table, THead, TH, TD, HR,
} from '@/components/blog';

export const metadata: Metadata = {
  title: 'DMARC p=none vs p=quarantine vs p=reject — When to Use Each Policy',
  description:
    'Should you set p=none, p=quarantine, or p=reject? A practical decision guide for moving through DMARC policy levels safely, with readiness criteria, rollback steps, and real-world timelines.',
  keywords: [
    'dmarc p=none vs quarantine vs reject',
    'dmarc policy none quarantine reject',
    'when to set dmarc reject',
    'dmarc policy levels',
    'move to dmarc reject',
    'dmarc quarantine vs reject',
    'dmarc enforcement',
    'dmarc p=none monitoring',
    'dmarc policy rollout',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://dmarclabsds1.xyz/blog/dmarc-policy-none-quarantine-reject',
  },
  openGraph: {
    title: 'DMARC p=none vs p=quarantine vs p=reject — When to Use Each Policy',
    description:
      'A practical decision guide for moving through DMARC policy levels safely — with readiness criteria, rollback steps, and recommended timelines.',
    url: 'https://dmarclabsds1.xyz/blog/dmarc-policy-none-quarantine-reject',
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
      name: 'What is DMARC p=none?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DMARC p=none is the monitoring policy. When p=none is set, receiving mail servers report authentication results to your rua= address but take no action on messages that fail DMARC. Failing messages are delivered normally. p=none is the starting point for all DMARC deployments and should be maintained until you have identified and authenticated all legitimate sending sources.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is DMARC p=quarantine?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DMARC p=quarantine instructs receiving mail servers to treat messages that fail DMARC as suspicious — typically by delivering them to the recipient\'s spam or junk folder rather than the inbox. p=quarantine is an intermediate enforcement step that reduces spoofing impact while leaving a recovery path if legitimate senders are incorrectly failing DMARC.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is DMARC p=reject?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DMARC p=reject is full enforcement. Receiving mail servers reject (block) messages that fail DMARC at the SMTP level — the message never reaches the recipient\'s mailbox. p=reject provides the strongest protection against domain spoofing and phishing. It should only be set once your DMARC pass rate is consistently above 95-98% and you have identified and fixed all legitimate senders.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long should I stay at p=none before moving to p=quarantine?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Typically 2–4 weeks, or until you have collected enough data to identify all legitimate sending sources. The readiness criterion is a DMARC pass rate above 95% for at least two consecutive weeks across all providers (Google, Microsoft, Yahoo). Use the rua aggregate reports to verify that no legitimate senders are failing before advancing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the pct tag do in DMARC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The pct (percentage) tag controls what percentage of non-passing messages the policy is applied to. pct=10 with p=quarantine means 10% of failing messages go to spam; the other 90% are delivered normally. pct allows gradual rollout — you can start at pct=5 or pct=10 and increase over time as you gain confidence. pct=100 is full enforcement.',
      },
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'DMARC p=none vs p=quarantine vs p=reject — When to Use Each Policy',
  description:
    'A practical decision guide for moving through DMARC policy levels safely.',
  datePublished: '2025-07-11',
  dateModified: '2025-07-11',
  author: { '@type': 'Organization', name: 'DMARC Labs' },
  publisher: { '@type': 'Organization', name: 'DMARC Labs', url: 'https://dmarclabsds1.xyz' },
  mainEntityOfPage: 'https://dmarclabsds1.xyz/blog/dmarc-policy-none-quarantine-reject',
  wordCount: 2900,
};

export default function Page() {
  return (
    <BlogPostLayout
      title="DMARC p=none vs p=quarantine vs p=reject — When to Use Each Policy"
      description="Should you set p=none, p=quarantine, or p=reject? A practical decision guide for moving through DMARC policy levels safely, with readiness criteria, rollback steps, and real-world timelines."
      date="2025-07-11"
      readTime="12 min read"
      tags={['DMARC', 'Policy', 'Email Security']}
      jsonLd={[faqJsonLd, articleJsonLd]}
    >
      <Lead>
        Every DMARC deployment starts with the same question: which policy do I set, and when
        do I move to the next level? The answer matters — move too fast and you block
        legitimate email. Stay at <Code>p=none</Code> forever and you provide no protection
        against spoofing.
      </Lead>

      <H2>What each DMARC policy does</H2>

      <H3>p=none — monitoring mode</H3>
      <Note>
        <Strong>What is DMARC p=none?</Strong> — The monitoring-only policy. Receiving
        servers report authentication results to your <Code>rua=</Code> address but deliver
        all messages normally, regardless of whether they pass or fail DMARC.
      </Note>
      <P>
        With <Code>p=none</Code>, your DMARC record looks like this:
      </P>
      <Pre>{`v=DMARC1; p=none; rua=mailto:dmarc@example.com`}</Pre>
      <P>
        What happens to failing messages: <Strong>nothing</Strong>. They are delivered
        normally. Spoofed email reaches inboxes. Your only gain from <Code>p=none</Code> is
        the aggregate reports — which tell you what is happening so you can fix it.
      </P>
      <P>
        <Strong>Purpose:</Strong> Discovery. Use <Code>p=none</Code> to identify every source
        that sends mail claiming to be from your domain and determine which ones are
        legitimate.
      </P>

      <H3>p=quarantine — partial enforcement</H3>
      <Note>
        <Strong>What is DMARC p=quarantine?</Strong> — The intermediate enforcement policy.
        Receiving servers send messages that fail DMARC to the spam or junk folder instead of
        the inbox. The message still reaches the recipient, but is flagged as suspicious.
      </Note>
      <Pre>{`v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@example.com`}</Pre>
      <P>
        The <Code>pct=10</Code> means only 10% of failing messages are quarantined — the
        other 90% are still delivered normally. This is the recommended starting point for
        enforcement. It reduces spoofing impact while preserving a safety margin if you have
        misconfigured legitimate senders you have not found yet.
      </P>
      <P>
        <Strong>Purpose:</Strong> Partial protection with a recovery path. Reduces spoofing
        visibility without risking total loss of legitimate mail.
      </P>

      <H3>p=reject — full enforcement</H3>
      <Note>
        <Strong>What is DMARC p=reject?</Strong> — Full enforcement. Receiving servers reject
        messages that fail DMARC at the SMTP level. The message is never delivered — not even
        to spam. The sender receives a bounce.
      </Note>
      <Pre>{`v=DMARC1; p=reject; rua=mailto:dmarc@example.com`}</Pre>
      <P>
        <Code>p=reject</Code> is the goal for most domains. It completely blocks spoofed
        email that fails DMARC. But it also blocks any legitimate email that fails DMARC —
        so readiness is critical.
      </P>
      <P>
        <Strong>Purpose:</Strong> Complete protection against domain spoofing and phishing
        using your domain.
      </P>

      <H2>The policy decision framework</H2>
      <P>
        Use this table to decide which policy level is appropriate for your current situation:
      </P>
      <Table>
        <THead>
          <tr>
            <TH>Situation</TH>
            <TH>Recommended policy</TH>
            <TH>Why</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>Just published DMARC record — no reports yet</TD>
            <TD>p=none</TD>
            <TD>Need data to identify all sending sources before enforcing</TD>
          </tr>
          <tr>
            <TD>Collecting reports, pass rate below 90%</TD>
            <TD>p=none</TD>
            <TD>Too many legitimate failures to enforce — fix auth first</TD>
          </tr>
          <tr>
            <TD>Pass rate 90–95% for 2+ weeks</TD>
            <TD>p=quarantine; pct=10</TD>
            <TD>Ready to start enforcement with a safety buffer</TD>
          </tr>
          <tr>
            <TD>Pass rate 95%+, pct=10 stable for 2 weeks</TD>
            <TD>p=quarantine; pct=50</TD>
            <TD>Ramp up enforcement gradually</TD>
          </tr>
          <tr>
            <TD>Pass rate 95%+, pct=100 quarantine stable for 2 weeks</TD>
            <TD>p=reject; pct=10</TD>
            <TD>Begin reject rollout cautiously</TD>
          </tr>
          <tr>
            <TD>p=reject pct=100, pass rate 98%+ for 2+ weeks</TD>
            <TD>p=reject; pct=100</TD>
            <TD>Full enforcement — your domain is protected</TD>
          </tr>
        </tbody>
      </Table>

      <H2>Readiness criteria before advancing policy</H2>

      <H3>Before moving from p=none to p=quarantine</H3>
      <UL>
        <LI>You have been collecting rua reports for at least 2 weeks</LI>
        <LI>You have identified all IP addresses appearing in your reports</LI>
        <LI>
          All legitimate senders (your own mail server, ESPs, transactional email
          services) are configured with DKIM alignment or SPF alignment
        </LI>
        <LI>Your DMARC pass rate is above 95% across Google and Microsoft reports</LI>
        <LI>
          Failing records either have low counts (forwarding noise) or belong to unknown
          IPs (likely spoofing)
        </LI>
      </UL>

      <H3>Before moving from p=quarantine to p=reject</H3>
      <UL>
        <LI>You have been at <Code>p=quarantine; pct=100</Code> for at least 2 weeks</LI>
        <LI>No legitimate mail has ended up in spam during this period</LI>
        <LI>Pass rate is above 98% consistently</LI>
        <LI>
          Any remaining failures are confirmed as forwarding artifacts or known spoofing
          sources — not legitimate senders
        </LI>
        <LI>
          You have informed all teams (marketing, IT, transactional systems) and all senders
          are correctly configured
        </LI>
      </UL>

      <H2>Using pct for gradual rollout</H2>
      <P>
        The <Code>pct=</Code> tag is your safety valve. It controls what percentage of
        failing messages the policy is applied to. The remaining percentage is treated as
        if <Code>p=none</Code>.
      </P>
      <Pre>{`v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@example.com`}</Pre>
      <P>
        This quarantines 25% of failing messages and delivers the other 75% normally. The
        selection is random — so even a small pct value gives you meaningful signal without
        risking all your mail.
      </P>
      <P>
        Recommended rollout timeline:
      </P>
      <Table>
        <THead>
          <tr>
            <TH>Week</TH>
            <TH>Policy</TH>
            <TH>pct</TH>
            <TH>Action if problems appear</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>1–4</TD>
            <TD>none</TD>
            <TD>100</TD>
            <TD>Fix all authentication failures in reports</TD>
          </tr>
          <tr>
            <TD>5–6</TD>
            <TD>quarantine</TD>
            <TD>10</TD>
            <TD>Roll back to p=none if legitimate mail is affected</TD>
          </tr>
          <tr>
            <TD>7–8</TD>
            <TD>quarantine</TD>
            <TD>50</TD>
            <TD>Check spam folders, interview teams for missed mail</TD>
          </tr>
          <tr>
            <TD>9–10</TD>
            <TD>quarantine</TD>
            <TD>100</TD>
            <TD>Monitor for 2 full weeks before advancing</TD>
          </tr>
          <tr>
            <TD>11–12</TD>
            <TD>reject</TD>
            <TD>10</TD>
            <TD>Watch for bounce reports from senders</TD>
          </tr>
          <tr>
            <TD>13–16</TD>
            <TD>reject</TD>
            <TD>100</TD>
            <TD>Full enforcement — domain protected</TD>
          </tr>
        </tbody>
      </Table>

      <H2>How to roll back safely</H2>
      <P>
        If you advance policy and notice legitimate mail is being blocked or quarantined, roll
        back immediately:
      </P>
      <OL>
        <OLI>
          Change your DMARC record back to the previous policy level (or to{' '}
          <Code>p=none</Code>). DNS changes propagate within minutes to hours.
        </OLI>
        <OLI>
          Analyze your DMARC reports to identify which sender was affected. Look at the
          source IP of bounced mail and cross-reference with your report records.
        </OLI>
        <OLI>
          Fix the authentication issue (usually DKIM alignment) for that sender, confirm in
          reports that they are now passing, then re-advance.
        </OLI>
      </OL>
      <Note>
        DMARC policy changes take effect quickly (TTL-dependent, usually 1 hour). You are
        never locked in — rollback is fast and does not require approval from anyone.
      </Note>

      <H2>The subdomain policy (sp=)</H2>
      <P>
        The <Code>sp=</Code> tag lets you set a different policy for subdomains. This is
        useful when your organizational domain uses <Code>p=reject</Code> but you have
        subdomains that send marketing or transactional mail not yet fully authenticated:
      </P>
      <Pre>{`v=DMARC1; p=reject; sp=quarantine; rua=mailto:dmarc@example.com`}</Pre>
      <P>
        This rejects failing mail from <Code>example.com</Code> but only quarantines failing
        mail from <Code>sub.example.com</Code> — giving subdomain senders more time to
        configure authentication while the main domain is fully enforced.
      </P>
      <P>
        If <Code>sp=</Code> is omitted, subdomains inherit the <Code>p=</Code> policy.
      </P>

      <H2>What happens to failing mail at each policy level</H2>
      <Table>
        <THead>
          <tr>
            <TH>Policy</TH>
            <TH>What Gmail does</TH>
            <TH>What Outlook does</TH>
            <TH>Recipient sees</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <TD>p=none</TD>
            <TD>Delivers normally</TD>
            <TD>Delivers normally</TD>
            <TD>Message in inbox</TD>
          </tr>
          <tr>
            <TD>p=quarantine</TD>
            <TD>Sends to spam folder</TD>
            <TD>Sends to junk folder</TD>
            <TD>Message in spam/junk</TD>
          </tr>
          <tr>
            <TD>p=reject</TD>
            <TD>Rejects at SMTP (bounce to sender)</TD>
            <TD>Rejects at SMTP (bounce to sender)</TD>
            <TD>Message never arrives</TD>
          </tr>
        </tbody>
      </Table>
      <P>
        Note: providers may deviate from this in specific circumstances — for example,
        applying a local policy override that delivers even rejected mail to junk. These
        deviations appear as unexpected <Code>disposition</Code> values in your DMARC reports.
      </P>

      <H2>Google and Yahoo email sender requirements</H2>
      <P>
        Since February 2024, Google and Yahoo require bulk email senders (those sending more
        than 5,000 messages per day to Gmail or Yahoo) to have a DMARC record with at least{' '}
        <Code>p=none</Code>. This is a minimum compliance threshold — not a recommendation.
        For meaningful protection against spoofing, you need <Code>p=quarantine</Code> or{' '}
        <Code>p=reject</Code>.
      </P>
      <P>
        Many ESPs now require or recommend <Code>p=reject</Code> for custom sending domains
        as a condition of their services, particularly for high-reputation domains.
      </P>

      <Tip>
        Before advancing your DMARC policy, upload your latest reports to{' '}
        <a href="/#upload" className="text-accent hover:underline">
          DMARC Labs
        </a>{' '}
        to verify your pass rate. The analyzer calculates your pass rate instantly and shows
        exactly which sources are failing — so you can fix them before enforcing.
      </Tip>

      <H2>Frequently asked questions</H2>

      <H3>What is DMARC p=none?</H3>
      <P>
        <Code>p=none</Code> is the monitoring policy — receiving servers report results but
        deliver all mail normally, even if it fails DMARC. It is the required starting point
        for every DMARC deployment.
      </P>

      <H3>When should I move to p=reject?</H3>
      <P>
        When your DMARC pass rate is above 98% consistently across Google and Microsoft
        reports, all legitimate senders are correctly authenticated, and you have been stable
        at <Code>p=quarantine; pct=100</Code> for at least 2 weeks without any legitimate
        mail going to spam.
      </P>

      <H3>What does pct do in DMARC?</H3>
      <P>
        <Code>pct=</Code> controls the percentage of non-passing messages to which the policy
        is applied. <Code>pct=10</Code> means 10% of failing messages are quarantined or
        rejected; 90% are treated as <Code>p=none</Code>. It is a safety mechanism for
        gradual enforcement rollout.
      </P>

      <H3>Can I skip p=quarantine and go straight to p=reject?</H3>
      <P>
        Technically yes, but it is not recommended. Going straight to <Code>p=reject</Code>
        without first verifying at quarantine level risks blocking legitimate mail with no
        warning. The quarantine phase lets you catch any remaining legitimate failures before
        they become hard rejections.
      </P>

      <H3>Does p=reject affect email forwarding?</H3>
      <P>
        Yes. Forwarded email often fails DMARC (because forwarding breaks SPF and sometimes
        DKIM). With <Code>p=reject</Code>, forwarded mail from your domain may be rejected by
        the final destination server. This is a known limitation. Providers that support ARC
        (Google, Microsoft) can work around this for trusted forwarders, but small or legacy
        forwarders may still reject the mail.
      </P>

      <HR />
      <P>
        The path from <Code>p=none</Code> to <Code>p=reject</Code> typically takes 8–16 weeks
        for most organizations. The key is using your DMARC aggregate reports at each step to
        verify readiness.{' '}
        <a href="/#upload" className="text-accent hover:underline">
          Upload your reports to DMARC Labs
        </a>{' '}
        to check your pass rate and identify any senders that need to be fixed before you
        advance to the next policy level.
      </P>
    </BlogPostLayout>
  );
}
