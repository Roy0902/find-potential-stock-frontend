export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="pagination">
      <p className="pagination-status" aria-live="polite">
        Page {page} of {Math.max(totalPages, 1)}
      </p>
      <div className="pagination-actions">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
