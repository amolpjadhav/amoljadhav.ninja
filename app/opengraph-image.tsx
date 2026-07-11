import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 1080,
            height: 510,
            border: '2px solid #0aee3c',
            borderRadius: 16,
          }}
        >
          <div style={{ display: 'flex', fontSize: 28, color: 'rgba(10,238,60,0.6)', marginBottom: 24 }}>
            {'$ whoami'}
          </div>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, color: '#0aee3c' }}>
            Amol Jadhav
          </div>
          <div style={{ display: 'flex', fontSize: 32, color: 'rgba(10,238,60,0.7)', marginTop: 28 }}>
            Blog &middot; Writing on AI &amp; software engineering
          </div>
        </div>
      </div>
    ),
    size
  );
}
