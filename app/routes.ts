import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/archive.tsx'),
  route('search', 'routes/search.tsx'),
  route('comments/:id', 'routes/comment.tsx'),
  route('about', 'routes/about.tsx'),
  route('admin/login', 'routes/admin-login.tsx'),
  route('admin', 'routes/admin.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
