// Cloudflare Worker 入口（Workers + 静态资源模式）
// - /api/daily：服务器端代理 AIHOT 日报 API（绕开浏览器 CORS）
// - /api/weather：服务器端代理 Open-Meteo 天气（温州鹿城，固定坐标）
// - /api/inspire：调用 Cloudflare Workers AI 生成灵感
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

    if (url.pathname === '/api/weather') {
      try {
        const api = 'https://api.open-meteo.com/v1/forecast?latitude=28.02&longitude=120.66&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1';
        const upstream = await fetch(api, { headers: { Accept: 'application/json', 'User-Agent': 'Zest-Homepage/1.0' } });
        if (!upstream.ok) {
          return Response.json({ error: 'upstream ' + upstream.status }, { status: 502 });
        }
        const body = await upstream.text();
        return new Response(body, {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=1800',
          },
        });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }

    if (url.pathname === '/api/inspire') {
      const category = url.searchParams.get('category') || 'project';
      const prompts = {
        project: '给我一个独立开发者可以用业余时间做出来的有趣小项目点子，一句话描述，要具体、新颖、可落地。',
        writing: '给我一个适合写一篇博客或短文的写作选题，一句话，角度新鲜、能引发思考。',
        random: '给我一个有意思的灵感，可以是项目、写作、生活实验或学习方向，任意类型，一句话，出人意料一点。',
      };
      const userPrompt = prompts[category] || prompts.project;
      try {
        const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: '你是一个富有创意的中文灵感助手。只输出一句简洁的中文灵感，不要加引号、编号或多余解释，控制在 60 字以内。' },
            { role: 'user', content: userPrompt },
          ],
        });
        const text = ((r && r.response) || '').trim();
        return Response.json({ text }, { headers: { 'cache-control': 'no-store' } });
      } catch (e) {
        return Response.json({ error: String(e) }, { status: 502 });
      }
    }

    // 其余请求 → 静态资源
    return env.ASSETS.fetch(request);
  },
};
