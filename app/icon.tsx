import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E1B1D',
          borderRadius: 14,
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 34,
            color: '#D9A441',
            fontStyle: 'italic',
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size }
  );
}
