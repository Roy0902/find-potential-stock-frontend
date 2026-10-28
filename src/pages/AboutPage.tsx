import { Link } from 'react-router';
import { PageShell } from '@/components/layout/PageShell';
import { en } from '@/locales/en';

export function AboutPage() {
  return (
    <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
      <article>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground no-underline hover:text-accent-foreground"
        >
          {en.navigation.backToArchive}
        </Link>
        <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          {en.about.eyebrow}
        </p>
        <h1 className="mb-4 mt-0 text-[clamp(1.8rem,2.8vw,2.4rem)] font-bold tracking-[-0.035em]">
          {en.about.title}
        </h1>
        <p className="my-3 text-secondary-foreground leading-relaxed">
          {en.about.intro}
        </p>
        <p className="my-3 text-secondary-foreground leading-relaxed">{en.site.projectDisclaimer}</p>
        <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight">{en.about.sources}</h2>
        <ul className="my-3 list-disc space-y-2 pl-5 text-secondary-foreground leading-relaxed">
          <li>
            <a href="https://lihkg.com">{en.about.lihkg}</a>
          </li>
          <li>
            <a href="https://forum.hkgolden.com">{en.about.hkGolden}</a>
          </li>
        </ul>
        <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight">{en.about.detection}</h2>
        <p className="my-3 text-secondary-foreground leading-relaxed">
          {en.about.detectionDescription}
        </p>
      </article>
    </PageShell>
  );
}
