// React 18 ships the Web Streams server renderer under `server.browser`.
// Reuse the Node server types so TypeScript sees the same surface.
declare module 'react-dom/server.browser' {
  export * from 'react-dom/server';
}
