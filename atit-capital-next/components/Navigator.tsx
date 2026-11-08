'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

declare global {
  interface Window { AT?: { page: () => boolean; closeMenu: () => void } }
}

// Page markup is plain HTML, so its <a href="/…"> links are ordinary anchors.
// This turns same-site clicks into client-side navigations (only the new
// page's content is fetched) and prefetches a page when a link is hovered,
// focused or touched, so the click itself is instant.
export default function Navigator() {
  const router = useRouter();
  const pathname = usePathname();

  // Before paint: wire up the new page's widgets and reveal animations.
  useLayoutEffect(() => {
    if (window.AT && !window.AT.page()) {
      requestAnimationFrame(() => window.AT?.page());
    }
  }, [pathname]);

  useEffect(() => {
    const done = new Set<string>();
    const internal = (el: EventTarget | null): URL | null => {
      const a = (el as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
      const url = new URL(a.href, location.href);
      return url.origin === location.origin ? url : null;
    };
    const prefetch = (url: URL | null) => {
      if (!url || url.pathname === location.pathname || done.has(url.pathname)) return;
      done.add(url.pathname);
      router.prefetch(url.pathname);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = internal(e.target);
      if (!url) return;
      window.AT?.closeMenu();
      if (url.pathname === location.pathname) {
        if (url.hash) return; // same page: let the browser scroll to the anchor
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
      e.preventDefault();
      router.push(url.pathname + url.search + url.hash);
    };
    const onIntent = (e: Event) => prefetch(internal(e.target));

    document.addEventListener('click', onClick);
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);

    // When idle, warm the pages in the top navigation.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    idle(() => document.querySelectorAll('header.site a[href^="/"]').forEach((a) => prefetch(internal(a))));

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('touchstart', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [router]);

  return null;
}
