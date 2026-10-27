import { Link } from 'react-router-dom';

export function SiteName() {
  return (
    <Link to="/" className="site-name">
      <span className="site-mark" aria-hidden="true">
        FP
      </span>
      <span className="site-name-text">Find Potential Stock</span>
    </Link>
  );
}
