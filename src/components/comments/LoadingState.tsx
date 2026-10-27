export function LoadingState() {
  return (
    <>
      <p className="visually-hidden">Loading…</p>
      <div className="skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton-card" key={index} />
        ))}
      </div>
    </>
  );
}
