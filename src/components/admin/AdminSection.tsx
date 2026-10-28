import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'mb-5 rounded-xl border border-border bg-card p-5 shadow-sm',
        className,
      )}
    >
      <h2 className="mb-4 text-base font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
