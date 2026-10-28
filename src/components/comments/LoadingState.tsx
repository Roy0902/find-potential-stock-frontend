import { en } from '@/locales/en';

export function LoadingState() {
  return (
    <>
      <p className="sr-only">{en.comments.loading}</p>
      <div
        className="grid grid-cols-3 gap-[1.15rem] max-[1100px]:grid-cols-2 max-[1023px]:grid-cols-2 max-[767px]:grid-cols-1"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="h-[14.5rem] animate-skeleton-shimmer rounded-xl border border-border bg-[linear-gradient(90deg,#edf2f4_25%,#f8fafb_37%,#edf2f4_63%)] bg-[length:400%_100%]"
            key={index}
          />
        ))}
      </div>
    </>
  );
}
