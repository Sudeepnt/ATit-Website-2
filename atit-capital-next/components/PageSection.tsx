import type { PageMeta } from '@/lib/content';

// Server component: the page's markup ships as plain HTML, no client JS.
export default function PageSection({ page }: { page: PageMeta & { html: string } }) {
  return (
    <section
      className="page active"
      id={page.id}
      data-group={page.group}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: page.html }}
    />
  );
}
