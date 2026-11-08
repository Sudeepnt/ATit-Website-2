// One-time converter: splits the single-file site (atit-capital.html) into
// per-route HTML fragments, shared chrome and global CSS for the Next.js app.
//
//   node scripts/extract.mjs ../atit-capital.html
//
// Re-running overwrites content/ and app/globals.css. After the migration the
// files in content/ are the source of truth; only re-run if you go back to
// editing the single HTML file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/extract.mjs <atit-capital.html>'); process.exit(1); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const s = fs.readFileSync(src, 'utf8');

const decode = (t) => t.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
  .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const text = (h) => decode(h.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

// ---------- pages ----------
const starts = [...s.matchAll(/<section class="page"([^>]*)>/g)];
const mainEnd = s.indexOf('</main>');
const pages = starts.map((m, i) => {
  const attrs = m[1];
  const id = /id="([^"]+)"/.exec(attrs)[1];
  const group = /data-group="([^"]+)"/.exec(attrs)?.[1] ?? id;
  const dataTitle = /data-title="([^"]+)"/.exec(attrs)?.[1];
  const end = i + 1 < starts.length ? starts[i + 1].index : mainEnd;
  let chunk = s.slice(m.index + m[0].length, end).replace(/<script>[\s\S]*?<\/script>/g, '').trimEnd();
  if (!chunk.endsWith('</section>')) throw new Error('page ' + id + ' does not end with </section>');
  chunk = chunk.slice(0, -'</section>'.length);
  return { id, group, dataTitle, start: m.index, end, inner: chunk };
});
const pageIds = new Set(pages.map((p) => p.id));

// every element id -> the page it lives on
const idToPage = {};
for (const m of s.matchAll(/\bid="([^"]+)"/g)) {
  const pg = pages.find((p) => m.index >= p.start && m.index < p.end);
  if (pg && !pageIds.has(m[1])) idToPage[m[1]] = pg.id;
}
const pagePath = (id) => (id === 'home' ? '/' : '/' + id);
const resolveHash = (h) => {
  if (h === '' || h === 'top') return null;
  if (pageIds.has(h)) return pagePath(h);
  if (idToPage[h]) return (idToPage[h] === 'home' ? '/' : '/' + idToPage[h]) + '#' + h;
  return null;
};
const rewrite = (html) => html.replace(/href="#([^"]*)"/g, (all, h) => {
  const to = resolveHash(decodeURIComponent(h));
  if (!to) { if (h) console.warn('unresolved link #' + h); return all; }
  return `href="${to}"`;
});

// ---------- chrome ----------
const between = (a, b, from = 0) => {
  const i = s.indexOf(a, from); if (i < 0) throw new Error('missing ' + a);
  const j = s.indexOf(b, i + a.length); if (j < 0) throw new Error('missing ' + b);
  return s.slice(i + a.length, j);
};
const header = between('<header class="site">', '</header>');
const ovOpen = '<div class="overlay" id="overlay" role="dialog" aria-modal="true" aria-label="Site menu">';
let overlay = between(ovOpen, '<main id="top">').trimEnd();
if (!overlay.endsWith('</div>')) throw new Error('overlay end');
overlay = overlay.slice(0, -'</div>'.length);
const footer = between('<footer class="site">', '</footer>', mainEnd);

// ---------- css ----------
let css = [...s.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1].trim()).join('\n\n');
css = css
  .replace('--f-display:"Source Serif 4",', '--f-display:var(--font-serif),"Source Serif 4",')
  .replace('--f-body:"Hanken Grotesk",', '--f-body:var(--font-sans),"Hanken Grotesk",')
  .replace('--f-mono:"IBM Plex Mono",', '--f-mono:var(--font-mono),"IBM Plex Mono",');
if (!css.includes('var(--font-serif)') || !css.includes('var(--font-sans)') || !css.includes('var(--font-mono)')) throw new Error('font vars not replaced');
css += '\n\n/* Next.js migration: hash targets land below the sticky header (was scrollTo(top - 90) in the hash router). */\n[id]{scroll-margin-top:90px}\n';

// ---------- metadata ----------
const siteDesc = /<meta name="description" content="([^"]+)"/.exec(s)[1];
const meta = pages.map((p) => {
  const crumbs = /<div class="crumbs">([\s\S]*?)<\/div>/.exec(p.inner);
  const spans = crumbs ? [...crumbs[1].matchAll(/<span>([^<]+)<\/span>/g)].map((m) => decode(m[1])).filter((t) => t !== '/') : [];
  const title = p.id === 'home' ? null : (p.dataTitle ? decode(p.dataTitle) : spans.at(-1) ?? text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(p.inner)?.[1] ?? p.id));
  const lede = /<p class="(?:lede|tp-intro)"[^>]*>([\s\S]*?)<\/p>/.exec(p.inner);
  const description = p.id === 'home' ? decode(siteDesc) : (lede ? text(lede[1]) : decode(siteDesc));
  return { id: p.id, group: p.group, title, description };
});

// ---------- write ----------
const w = (rel, data) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
for (const p of pages) w(`content/pages/${p.id}.html`, rewrite(p.inner).trim() + '\n');
w('content/chrome/header.html', rewrite(header).trim() + '\n');
w('content/chrome/overlay.html', rewrite(overlay).trim() + '\n');
w('content/chrome/footer.html', rewrite(footer).trim() + '\n');
w('app/globals.css', css);
w('content/site.json', JSON.stringify({ siteDescription: decode(siteDesc), pages: meta, legacyHash: Object.fromEntries([...pageIds, ...Object.keys(idToPage)].map((h) => [h, resolveHash(h)]).filter(([, v]) => v)) }, null, 2) + '\n');
console.log('pages:', pages.map((p) => p.id).join(', '));
