import { Link } from 'react-router-dom';
import { DISCLAIMER, PROJECT_DISCLAIMER } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="site-footer">
      <p>{DISCLAIMER}</p>
      <p className="disclaimer-project">{PROJECT_DISCLAIMER}</p>
      <Link to="/about">More information</Link>
    </footer>
  );
}
