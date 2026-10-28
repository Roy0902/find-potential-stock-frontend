import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Base container for empty and error panels. */
export function StateMessage({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'error';
}) {
  return (
    <div
      className={cn(
        'grid justify-items-start gap-2 rounded-xl border border-border bg-card p-8 shadow-sm [&>p]:m-0 [&>p]:text-muted-foreground [&>p:first-of-type]:text-base [&>p:first-of-type]:font-bold [&>p:first-of-type]:text-foreground max-[480px]:p-5',
        tone === 'error' &&
          'border-[#f0cbc7] bg-gradient-to-b from-[#fef3f2] to-card',
      )}
    >
      {children}
    </div>
  );
}
