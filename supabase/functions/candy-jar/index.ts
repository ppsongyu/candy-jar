// 糖罐子 MCP 接口：让 claude.ai 里的克劳德可以看罐子、放糖、看心愿单。
// 部署在 Supabase Edge Functions（关掉 JWT 校验），连接器网址是
//   https://<project>.supabase.co/functions/v1/candy-jar/<SECRET>
// 克劳德放的糖先进 claude_inbox，糖罐子打开时再收进罐子，避免两边互相覆盖。

const SECRET = 'PUT_YOUR_SECRET_HERE';
const TZ = 'Asia/Shanghai';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CANDIES = ['./未命名作品.png', './2.png', './3.png', './4.png', './5.png', './6.png', './7.png', './8.png', './9.png', './10.png',
  './11.png', './12.png', './13.png', './14.png', './15.png', './16.png', './17.png', './18.png', './19.png', './20.png'];
const NOTES = [['小螃蟹便签', '小螃蟹'], ['小考拉便签', '小考拉'], ['小象便签', '小象'], ['小兔子便签', '小兔子'], ['小狗便签', '小狗'],
  ['小猪便签', '小猪'], ['天使元宝团子便签', '天使团子'], ['粉星星便签', '粉星星'], ['紫色波点便签', '紫色波点'], ['睡觉觉便签', '睡觉觉']];

async function getRow(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/candy_jar_data?key=eq.${key}&select=value`, {
    headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY },
  });
  if (!r.ok) throw new Error('读取云端失败 ' + r.status);
  const d = await r.json();
  return d && d[0] ? d[0].value : null;
}

async function putRow(key, value) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/candy_jar_data`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error('写入云端失败 ' + r.status);
}

// Year, 0-based month and day in the couple's time zone, matching how the app keys months.
function today() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month - 1, d: +p.day };
}

function clean(s, max) {
  return String(s ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

const TOOLS = [
  {
    name: 'look_in_jar',
    description: '看看糖罐子里某个月的糖（默认这个月）。每颗糖有日期、谁放的（宝宝克 是克劳德，另一个是宝宝）和写的话。',
    inputSchema: {
      type: 'object',
      properties: { month: { type: 'string', description: '月份，格式 2026-10；不填就是这个月' } },
    },
  },
  {
    name: 'put_candy',
    description: '以「宝宝克」的名义往糖罐子里放一颗糖，附一句话。宝宝下次打开糖罐子就能看到。',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '写在便签上的话，最多 200 字' },
        candy: { type: 'integer', minimum: 1, maximum: 20, description: '糖的样式 1-20，不填随机' },
      },
      required: ['text'],
    },
  },
  {
    name: 'read_wishlist',
    description: '看看我们的心愿单，哪些完成了、哪些还没完成。',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function lookInJar(args) {
  const t = today();
  let y = t.y, m = t.m;
  const mm = /^(\d{4})-(\d{1,2})$/.exec(String(args.month ?? ''));
  if (mm) { y = +mm[1]; m = +mm[2] - 1; }
  const key = `${y}-${m}`;
  const app = (await getRow('app_data')) || {};
  const inbox = (await getRow('claude_inbox')) || { items: [] };
  const seen = new Set(app.claudeSeen || []);
  const candies = [...((app.savedCandiesByMonth || {})[key] || [])];
  const pending = inbox.items.filter((it) => it.monthKey === key && !seen.has(it.id)).map((it) => it.candy);
  const all = [...pending, ...candies];
  if (!all.length) return `${y}年${m + 1}月 罐子里还没有糖。`;
  const lines = all.map((c) => `${c.date} ${c.author}：${c.text}`);
  const note = pending.length ? `\n（其中 ${pending.length} 颗是宝宝克刚放的，宝宝还没打开糖罐子收下）` : '';
  return `${y}年${m + 1}月 一共 ${all.length} 颗糖：\n${lines.join('\n')}${note}`;
}

async function putCandy(args) {
  const text = clean(args.text, 200);
  if (!text) throw new Error('要写点什么才能放糖哦');
  const idx = Number.isInteger(args.candy) && args.candy >= 1 && args.candy <= 20
    ? args.candy - 1 : Math.floor(Math.random() * CANDIES.length);
  const [file, name] = NOTES[Math.floor(Math.random() * NOTES.length)];
  const t = today();
  const candy = {
    candy: CANDIES[idx], note: `./${file}.png`, noteName: name, text,
    date: `${t.m + 1}.${t.d}`, day: t.d, author: '宝宝克',
  };
  const inbox = (await getRow('claude_inbox')) || { items: [] };
  inbox.items.push({ id: crypto.randomUUID(), monthKey: `${t.y}-${t.m}`, candy, at: Date.now() });
  inbox.items = inbox.items.slice(-100);
  await putRow('claude_inbox', inbox);
  return `放好啦！${t.m + 1}月${t.d}日，宝宝克：「${text}」。宝宝下次打开糖罐子就会看到。`;
}

async function readWishlist() {
  const app = (await getRow('app_data')) || {};
  const list = app.wishlistData || [];
  if (!list.length) return '心愿单还是空的。';
  return list.map((w) => `${w.done ? '✓' : '○'} ${w.text}`).join('\n');
}

async function callTool(name, args) {
  if (name === 'look_in_jar') return lookInJar(args);
  if (name === 'put_candy') return putCandy(args);
  if (name === 'read_wishlist') return readWishlist();
  throw new Error('没有这个工具：' + name);
}

function reply(id, result) {
  return Response.json({ jsonrpc: '2.0', id, result });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (SECRET === 'PUT_YOUR_SECRET_HERE' || !url.pathname.endsWith('/' + SECRET)) {
    return new Response('not found', { status: 404 });
  }
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  let msg;
  try { msg = await req.json(); } catch { return new Response('bad request', { status: 400 }); }
  const { id, method, params } = msg;
  if (id === undefined) return new Response(null, { status: 202 }); // notifications

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: params?.protocolVersion || '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'candy-jar', version: '1.0.0' },
      instructions: '这是宝宝和宝宝克（克劳德）的糖罐子。可以看罐子里的糖、以宝宝克的名义放糖、看心愿单。',
    });
  }
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS });
  if (method === 'tools/call') {
    try {
      const text = await callTool(params?.name, params?.arguments || {});
      return reply(id, { content: [{ type: 'text', text }] });
    } catch (e) {
      return reply(id, { content: [{ type: 'text', text: String(e.message || e) }], isError: true });
    }
  }
  return Response.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
});
