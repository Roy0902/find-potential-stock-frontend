import { Link } from 'react-router-dom';
import { DISCLAIMER, PROJECT_DISCLAIMER } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-[clamp(1rem,3vw,2rem)] pb-10 pt-8">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-start gap-x-8 gap-y-4 max-[767px]:grid-cols-1">
        <div>
          <p className="mb-2 font-display text-[0.95rem] font-bold tracking-tight text-foreground">
            Find Potential Stock
          </p>
          <p className="m-0 text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
          <p className="mt-1 text-xs text-muted-foreground">{PROJECT_DISCLAIMER}</p>
        </div>
        <Link
          to="/about"
          className="justify-self-end text-sm font-semibold text-accent-foreground no-underline hover:underline max-[767px]:justify-self-start"
        >
          More information
        </Link>
      </div>
    </footer>
  );
}
