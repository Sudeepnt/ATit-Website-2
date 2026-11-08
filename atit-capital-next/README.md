# ATit Capital — Next.js

The ATit Capital site, migrated from the single file `../atit-capital.html` to Next.js 16 (App Router), built to be hosted on Vercel.

## How it's built for speed

- **One route per page** (`/`, `/capital`, `/thesis`, … 17 in all). Visitors download only the page they open, not all 17.
- **Fully static.** Every route is prerendered at build time and served from Vercel's CDN; no server runs per request.
- **CSS inlined** into each HTML document (`experimental.inlineCss`), so there's no render-blocking stylesheet request.
- **Fonts self-hosted** through `next/font`: preloaded, no request to Google, and size-matched fallbacks so text doesn't jump.
- **Instant page changes.** Links are prefetched on hover, focus or touch (and the top-nav pages when the browser is idle), then navigated client-side.
- **No flicker.** The site behaviour (`lib/site-runtime.js`) is inlined and runs during the first parse, before React loads.

## Layout

```
app/layout.tsx          header, menu overlay, footer, fonts, inline runtime
app/page.tsx            home
app/[slug]/page.tsx     every other page (static params from content/site.json)
app/globals.css         the site's CSS (unchanged except font variables + scroll offset)
content/pages/*.html    page markup, one file per route  <- edit content here
content/chrome/*.html   header, overlay, footer markup
content/site.json       page titles, descriptions, nav groups, old #hash -> route map
lib/site-runtime.js     menu, carousel, filters, contact form, reveal animations, canvas plots
components/Navigator.tsx client-side navigation + prefetch
scripts/extract.mjs     one-time converter from the single HTML file
```

Internal links are plain `href="/route"` or `href="/route#anchor"`. Old single-file links such as `/#gcc` redirect to `/operating#gcc`.

`scripts/extract.mjs` regenerates `content/` and `app/globals.css` from the single HTML file (`npm run extract`). Only use it if you go back to editing `atit-capital.html`, because it overwrites edits made in `content/`.

## Commands

```
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Deploy to Vercel

Push this folder to a Git repo and import it in Vercel (framework preset: Next.js, defaults are fine). If the repo also contains the parent folder, set **Root Directory** to `atit-capital-next`. Or, from this folder: `npx vercel` (preview) then `npx vercel --prod`.
