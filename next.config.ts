import { NextConfig } from 'next';

const config: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "frame-ancestors 'self'",
              "https://krc-20-arb-tracker.vercel.app",
              "http://127.0.0.1:3000",
              "http://localhost:3000",
              "https://oauth.telegram.org",
              "https://telegram.org"
            ].join(' ')
          }
        ]
      }
    ];
  },
};

export default config;