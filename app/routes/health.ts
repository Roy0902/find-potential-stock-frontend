export function loader(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
    },
  });
}
