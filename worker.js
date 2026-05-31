// Cloudflare Worker 入口（Workers + 静态资源模式）
// - /api/daily：服务器端代理 AIHOT 日报 API（绕开浏览器 CORS）
// - 其余所有请求：交给 public/ 里的静态资源
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/daily') {
      try {
        const upstream = await fetch('https://aihot.virxact.com/api/public/daily', {
          headers: { Accept: 'application/json', 'User-Agent': 'Zest-Homepage/1.0' },
        });
        if (!upstream.ok) {
          return Response.json({ error: 'upstream ' + upstream.status }, { status: 502 });
        }
        const body = await upstream.text();
        return new Response(body, {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=900',
          },
        });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }

    // 其余请求 → 静态资源
    return env.ASSETS.fetch(request);
  },
};
