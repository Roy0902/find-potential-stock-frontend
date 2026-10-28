import { en } from '@/locales/en';

export function SkipLink() {
  return (
    <a
      className="fixed left-4 top-[-4rem] z-[200] rounded-sm border border-primary bg-card px-4 py-3 font-bold shadow-lg transition-[top] focus:top-3"
      href="#main-content"
    >
      {en.accessibility.skipToMain}
    </a>
  );
}
