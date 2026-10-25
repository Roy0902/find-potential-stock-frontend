import type { ReactNode } from 'react';

/** Base container for empty and error panels. */
export function StateMessage({ children }: { children: ReactNode }) {
  return <div className="state">{children}</div>;
}
