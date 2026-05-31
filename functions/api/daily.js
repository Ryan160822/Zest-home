// Cloudflare Pages Function —— 服务器端代理 AIHOT 日报 API（绕开浏览器 CORS 限制）
// 部署后可通过同源地址 /api/daily 访问
export async function onRequest() {
  const upstream = 'https://aihot.virxact.com/api/public/daily';
  try {
    const res = await fetch(upstream, {
      headers: { Accept: 'application/json', 'User-Agent': 'Zest-Homepage/1.0' },
      cf: { cacheTtl: 900, cacheEverything: true },
    });
    if (!res.ok) {
      return jsonError('upstream ' + res.status, 502);
    }
    const body = await res.text();
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=900, s-maxage=900',
      },
    });
  } catch (e) {
    return jsonError(String(e), 502);
  }
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
