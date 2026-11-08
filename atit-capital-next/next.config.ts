import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Set by the root vercel.json: the app lives in a subfolder and every route is
  // prerendered, so Vercel serves the exported files. Local `next start` is unaffected.
  output: process.env.STATIC_EXPORT ? 'export' : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Put the CSS straight into each HTML document: no render-blocking stylesheet request.
    inlineCss: true,
  },
};

export default nextConfig;
