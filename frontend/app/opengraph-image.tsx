import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DMARC Labs — Free, Private DMARC Report Analyzer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000000',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Warm red top gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '320px',
            background: 'linear-gradient(180deg, #1a0505 0%, #000000 100%)',
          }}
        />

        {/* Radial red glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,35,60,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Grid overlay — simulated with repeating lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 80px',
            height: '100%',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '56px' }}>
            {/* Diamond logo */}
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: '#ef233c',
                borderRadius: '6px',
                transform: 'rotate(45deg)',
                boxShadow: '0 0 24px rgba(239,35,60,0.5)',
              }}
            />
            <span
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '-0.5px',
              }}
            >
              DMARC Labs
            </span>
            {/* Free pill */}
            <div
              style={{
                marginLeft: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '100px',
                padding: '6px 14px',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '500' }}>
                Free &amp; Private
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div
              style={{
                fontSize: '72px',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.05',
                letterSpacing: '-2px',
              }}
            >
              Stop Guessing{' '}
              <span style={{ color: '#ef233c' }}>Who&apos;s Sending</span>
              <br />
              From Your Domain.
            </div>

            <div
              style={{
                fontSize: '24px',
                color: '#71717a',
                lineHeight: '1.5',
                maxWidth: '680px',
              }}
            >
              Instant DMARC report analysis with WHOIS-enriched sender intelligence.
              No signup. No credit card. Your data deleted after analysis.
            </div>
          </div>

          {/* Bottom stat row */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>
            {[
              ['&lt;5s', 'avg analysis time'],
              ['100%', 'private'],
              ['Forever', 'free up to 100 MB'],
            ].map(([stat, label]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  minWidth: '160px',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: stat === '100%' || stat === 'Forever' ? '#ffffff' : '#ef233c',
                    letterSpacing: '-0.5px',
                  }}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: stat }}
                />
                <span style={{ fontSize: '13px', color: '#52525b', marginTop: '2px' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
