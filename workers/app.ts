import { createRequestHandler } from 'react-router';

type Env = {
  API_PROXY_TARGET: string;
};

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    // React Router loaders and the /api proxy read the target from process.env.
    // nodejs_compat maps Worker variables there, but set it explicitly so the
    // value is available regardless of the compatibility flag.
    if (env.API_PROXY_TARGET) {
      process.env.API_PROXY_TARGET = env.API_PROXY_TARGET;
    }

    return requestHandler(request, { cloudflare: { env, ctx } });
  },
} satisfies ExportedHandler<Env>;
