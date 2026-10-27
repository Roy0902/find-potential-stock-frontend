import { Link } from 'react-router-dom';
import { DISCLAIMER, PROJECT_DISCLAIMER } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">Find Potential Stock</p>
          <p className="footer-copy">{DISCLAIMER}</p>
          <p className="disclaimer-project">{PROJECT_DISCLAIMER}</p>
        </div>
        <Link to="/about" className="footer-link">
          More information
        </Link>
      </div>
    </footer>
  );
}
