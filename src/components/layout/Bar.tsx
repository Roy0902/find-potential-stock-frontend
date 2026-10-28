import type { ReactNode } from 'react';

/** Base header bar shared by the public header and the admin bar. */
export function Bar({ children }: { children: ReactNode }) {
  return (
    <header className="relative sticky top-0 z-50 grid grid-cols-[minmax(0,1fr)_minmax(18rem,34rem)_minmax(0,1fr)] items-center gap-6 border-b border-border bg-white/90 px-[clamp(1rem,3vw,2rem)] py-3 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[linear-gradient(90deg,var(--primary)_0%,#2f8fa3_62%,#c7a96b_100%)] max-[1100px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[1100px]:gap-4 max-[900px]:grid-cols-[auto_1fr_auto] max-[900px]:gap-3 max-[767px]:grid-cols-[minmax(0,1fr)_auto] max-[767px]:gap-x-4 max-[767px]:gap-y-3">
      {children}
    </header>
  );
}
