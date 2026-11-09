import { preload } from 'react-dom';
import PageSection from '@/components/PageSection';
import { getPage } from '@/lib/content';

export const dynamic = 'force-static';

export default function Home() {
  // Fetch the hero scene as early as possible. Keep the version in step with lib/site-runtime.js.
  preload('/hero-story.js?v=2', { as: 'script' });
  return <PageSection page={getPage('home')!} />;
}
