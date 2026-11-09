import fs from 'node:fs';
import path from 'node:path';
import site from '@/content/site.json';

// All content is static HTML produced by scripts/extract.mjs. It is read at
// build time only: every route is prerendered, so nothing here runs per request.

export type PageMeta = { id: string; group: string; title: string | null; description: string };

const dir = path.join(process.cwd(), 'content');

export const pages: PageMeta[] = site.pages;
export const siteDescription: string = site.siteDescription;
export const legacyHash: Record<string, string> = site.legacyHash;

export function getPage(id: string) {
  const meta = pages.find((p) => p.id === id);
  if (!meta) return null;
  return { ...meta, html: fs.readFileSync(path.join(dir, 'pages', `${id}.html`), 'utf8') };
}

export function chrome(name: 'header' | 'overlay' | 'footer' | 'cookie') {
  return fs.readFileSync(path.join(dir, 'chrome', `${name}.html`), 'utf8');
}

export function siteScript() {
  const js = fs.readFileSync(path.join(process.cwd(), 'lib', 'site-runtime.js'), 'utf8');
  return js.replace('__LEGACY_HASH__', JSON.stringify(legacyHash)).replace(/<\/script/gi, '<\\/script');
}
