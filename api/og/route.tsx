import { ImageResponse } from 'next/og';
import React from 'react';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        👋 Hello, this is your OG Image!
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
