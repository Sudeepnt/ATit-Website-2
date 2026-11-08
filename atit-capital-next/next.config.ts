import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Put the CSS straight into each HTML document: no render-blocking stylesheet request.
    inlineCss: true,
  },
};

export default nextConfig;
