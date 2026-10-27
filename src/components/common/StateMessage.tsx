import type { ReactNode } from 'react';

/** Base container for empty and error panels. */
export function StateMessage({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'error';
}) {
  return <div className={`state${tone === 'error' ? ' state--error' : ''}`}>{children}</div>;
}
