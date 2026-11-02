import type { Config } from '@react-router/dev/config';

const isCloudflare = process.env.CF === '1';

export default {
  ssr: true,
  // Keep the Cloudflare Worker bundle separate from the Node/Docker bundle.
  buildDirectory: isCloudflare ? 'build-cloudflare' : 'build',
  future: {
    // Required by @cloudflare/vite-plugin; the Node build keeps the default.
    v8_viteEnvironmentApi: isCloudflare,
  },
} satisfies Config;
