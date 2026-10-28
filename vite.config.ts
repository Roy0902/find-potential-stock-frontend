import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { en } from './src/locales/en';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const localeHtml = {
    name: 'localize-html-metadata',
    transformIndexHtml(html: string) {
      return html
        .replace('%SITE_TITLE%', en.site.name)
        .replace('%SITE_DESCRIPTION%', en.site.description);
    },
  };

  return {
    plugins: [react(), localeHtml],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET ?? 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
