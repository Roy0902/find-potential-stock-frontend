import type { ReactNode } from 'react';
import { AdminBar } from './AdminBar';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Standard page frame: one bar, one main landmark, one footer.
 * The archive page composes its own two-column layout and does not use this.
 */
export function PageShell({
  bar = 'public',
  mainClassName,
  children,
}: {
  bar?: 'public' | 'admin';
  mainClassName?: string;
  children: ReactNode;
}) {
  const BarComponent = bar === 'admin' ? AdminBar : Header;
  return (
    <>
      <BarComponent />
      <main id="main-content" className={mainClassName}>
        {children}
      </main>
      <Footer />
    </>
  );
}
