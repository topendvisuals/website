import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Top End Visuals — Christmas photography in Darwin & the Top End';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(160deg, #0E1B1D 0%, #17454B 55%, #1F5A61 100%)',
          color: '#FAF7F0',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: 6,
            width: 260,
            marginBottom: 40,
            background: 'linear-gradient(90deg, #123338, #D9A441, #C1442D)',
          }}
        />
        <div style={{ fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', color: '#D9A441', marginBottom: 20 }}>
          Top End Visuals
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.15, maxWidth: 900 }}>
          Christmas photography in Darwin &amp; the Top End
        </div>
      </div>
    ),
    { ...size }
  );
}
