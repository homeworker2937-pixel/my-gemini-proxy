export default async function handler(req, res) {
  // 1. 核心修复：允许所有跨域请求（接待侦察兵）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // 如果是侦察兵（OPTIONS请求），直接放行
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 拼接谷歌真实的请求地址
  const url = new URL(req.url, `https://${req.headers.host}`);
  const cleanPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = 'https://generativelanguage.googleapis.com' + cleanPath + url.search;

  try {
    // 3. 准备发送给谷歌的数据
    let fetchBody = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // 确保传给谷歌的是字符串格式
      fetchBody = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    // 4. 正式发请求给谷歌
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': req.query.key || req.headers['x-goog-api-key'] || ''
      },
      body: fetchBody,
    });

    // 5. 将谷歌的回答原样返回给 Chatbox
    const data = await response.text();
    try {
      res.status(response.status).json(JSON.parse(data));
    } catch(e) {
      res.status(response.status).send(data);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
