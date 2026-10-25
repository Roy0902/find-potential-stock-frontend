import { Route, Routes } from 'react-router-dom';
import { SkipLink } from '@/components/layout/SkipLink';
import { AboutPage } from '@/pages/AboutPage';
import { ArchivePage } from '@/pages/ArchivePage';
import { CommentPage } from '@/pages/CommentPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminPage } from '@/pages/admin/AdminPage';

export default function App() {
  return (
    <>
      <SkipLink />
      <Routes>
        <Route path="/" element={<ArchivePage />} />
        <Route path="/search" element={<ArchivePage />} />
        <Route path="/comments/:id" element={<CommentPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
