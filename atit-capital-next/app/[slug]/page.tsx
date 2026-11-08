import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageSection from '@/components/PageSection';
import { getPage, pages } from '@/lib/content';

// Every route is prerendered at build time; anything else is a static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return pages.filter((p) => p.id !== 'home').map((p) => ({ slug: p.id }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage((await params).slug);
  if (!page) return {};
  return { title: page.title ?? undefined, description: page.description };
}

export default async function Page({ params }: Props) {
  const page = getPage((await params).slug);
  if (!page || page.id === 'home') notFound();
  return <PageSection page={page} />;
}
