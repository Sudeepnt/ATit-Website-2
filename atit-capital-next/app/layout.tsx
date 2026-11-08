import type { Metadata, Viewport } from 'next';
import { Libre_Baskerville, Montserrat, IBM_Plex_Mono } from 'next/font/google';
import { chrome, siteDescription, siteScript } from '@/lib/content';
import Navigator from '@/components/Navigator';
import './globals.css';

// Self-hosted by next/font: no request to Google at runtime, preloaded, and
// size-adjusted fallbacks so text doesn't shift when the web font arrives.
const serif = Libre_Baskerville({ subsets: ['latin'], style: ['normal', 'italic'], weight: ['400', '700'], variable: '--font-serif', display: 'swap' });
const sans = Montserrat({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-sans', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'ATit Capital', template: '%s · ATit Capital' },
  description: siteDescription,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <div className="rail" aria-hidden="true" />
        <header className="site" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: chrome('header') }} />
        <div
          className="overlay"
          id="overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: chrome('overlay') }}
        />
        <main id="top">{children}</main>
        <footer className="site" dangerouslySetInnerHTML={{ __html: chrome('footer') }} />
        <button className="to-top" id="toTop" type="button" suppressHydrationWarning>
          TOP ↑
        </button>
        <script dangerouslySetInnerHTML={{ __html: siteScript() }} />
        <Navigator />
      </body>
    </html>
  );
}
