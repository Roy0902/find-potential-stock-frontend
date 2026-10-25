import type { ReactNode } from 'react';

/** Base header bar shared by the public header and the admin bar. */
export function Bar({ children }: { children: ReactNode }) {
  return <header className="site-header">{children}</header>;
}
