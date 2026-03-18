export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  
  // 修正路径：删掉 Vercel 自带的 /api 前缀
  const cleanPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = 'https://generativelanguage.googleapis.com' + cleanPath + url.search;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': req.query.key || req.headers['x-goog-api-key'] || ''
      },
      // 只有非 GET 请求才发送 body
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
