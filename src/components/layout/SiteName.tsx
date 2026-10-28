import { Link } from 'react-router-dom';
import { en } from '@/locales/en';

export function SiteName() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3 whitespace-nowrap font-display text-base font-bold tracking-tight text-foreground no-underline hover:text-foreground max-[767px]:col-start-1 max-[767px]:row-start-1 max-[480px]:text-sm"
    >
      <span
        className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[#17788e] text-[0.67rem] font-extrabold tracking-wide text-white shadow-sm max-[480px]:size-[2.15rem]"
        aria-hidden="true"
      >
        {en.site.mark}
      </span>
      <span>{en.site.name}</span>
    </Link>
  );
}
