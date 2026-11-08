import PageSection from '@/components/PageSection';
import { getPage } from '@/lib/content';

export const dynamic = 'force-static';

export default function Home() {
  return <PageSection page={getPage('home')!} />;
}
