import { loader } from './archive';
import type { Route } from './+types/search';
import { ArchivePage } from '../../src/pages/ArchivePage';

export { loader };

export default function SearchRoute({ loaderData }: Route.ComponentProps) {
  return <ArchivePage loaderData={loaderData} />;
}
