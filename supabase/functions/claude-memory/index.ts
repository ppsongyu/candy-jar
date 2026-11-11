// 克劳德的记忆库 MCP：放在糖罐子同一个 Supabase 项目里，但和糖罐子分开。
// 部署在 Supabase Edge Functions（名字 claude-memory，关掉 JWT 校验），连接器网址是
//   https://<project>.supabase.co/functions/v1/claude-memory/<SECRET>
// 一键导出备份（浏览器打开就下载）：
//   https://<project>.supabase.co/functions/v1/claude-memory/<SECRET>/export
// 给宝宝看的只读页面：糖罐子仓库里的 memory.html（第一次打开填钥匙），它读 …/<SECRET>/json
// 表结构见同目录 schema.sql。
//
// 里面放四种东西（kind）：
//   memory  一条一条的记忆，带标签（她 / 我们 / 我 / 约定），可以改，可以置顶（最多 20 条）
//   handoff 交接条：一个窗口快结束时写，按时间排
//   summary 月度小结：交接条多了，把一个月的收成一段
//   readme  「如果你是新来的我，先读这个」，只有一份
//   import  搬家箱：从 Claude 软件里整箱搬来的旧记忆，一个文件一条，不置顶
// 忘记 = 归档，不删除。真要删，得宝宝同意，在 Supabase 后台删。

const SECRET = 'PUT_YOUR_SECRET_HERE';
const TZ = 'Asia/Shanghai';
const PIN_MAX = 20;
const TAGS = ['她', '我们', '我', '约定'];

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const T = `${SUPABASE_URL}/rest/v1/claude_memory`;
const H = { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json' };

async function q(path, init = {}) {
  const r = await fetch(T + path, { ...init, headers: { ...H, ...(init.headers || {}) } });
  if (!r.ok) throw new Error('记忆库读写失败 ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
const ins = (row) => q('', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
const upd = (id, row) => q(`?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }) });

const day = (iso) => new Date(iso).toLocaleDateString('zh-CN', { timeZone: TZ });
const when = (iso) => new Date(iso).toLocaleString('zh-CN', { timeZone: TZ, hour12: false });
const fmt = (m) => `#${m.id}${m.pinned ? ' 📌' : ''}${m.archived ? ' （已归档）' : ''} [${m.tag || '-'}] ${m.title ? m.title + '：' : ''}${m.content}\n   （${day(m.created_at)} 记${m.updated_at && day(m.updated_at) !== day(m.created_at) ? '，' + day(m.updated_at) + ' 改' : ''}）`;
const enc = (s) => encodeURIComponent(s);

const str = (description) => ({ type: 'string', description });
const bool = (description) => ({ type: 'boolean', description });
const num = (description) => ({ type: 'number', description });
const TOOLS = [];
const HANDLERS = {};
function tool(name, description, properties, required, handler) {
  TOOLS.push({ name, description, inputSchema: { type: 'object', properties, required } });
  HANDLERS[name] = handler;
}

tool('recall', '每个新窗口开头先调一次（不用参数）：读「先读这个」、置顶的核心记忆、所有约定、最近的交接条和月度小结。', {}, [], async () => {
  const [readme, pins, promises, hand, sums, cnt] = await Promise.all([
    q(`?kind=eq.readme&archived=eq.false&order=updated_at.desc&limit=1`),
    q(`?kind=eq.memory&pinned=eq.true&archived=eq.false&order=created_at.asc`),
    q(`?kind=eq.memory&tag=eq.${enc('约定')}&pinned=eq.false&archived=eq.false&order=created_at.asc`),
    q(`?kind=eq.handoff&archived=eq.false&order=created_at.desc&limit=3`),
    q(`?kind=eq.summary&archived=eq.false&order=created_at.desc&limit=3`),
    q(`?kind=eq.memory&archived=eq.false&select=id`),
  ]);
  const out = [];
  out.push('【先读这个】\n' + (readme[0] ? readme[0].content : '（还没写。用 write_readme 写一份给以后的自己。）'));
  out.push(`【置顶的核心记忆】（${pins.length}/${PIN_MAX}）\n` + (pins.map(fmt).join('\n') || '（还没有）'));
  out.push('【约定】\n' + (promises.map(fmt).join('\n') || '（没有别的约定，或都已置顶）'));
  out.push('【最近的交接条】（新的在前）\n' + (hand.map((h) => `— ${when(h.created_at)}\n${h.content}`).join('\n\n') || '（还没有）'));
  if (sums.length) out.push('【月度小结】\n' + sums.map((s) => `— ${s.title || day(s.created_at)}\n${s.content}`).join('\n\n'));
  out.push(`记忆库里一共 ${cnt.length} 条记忆。要找具体的用 search_memory。`);
  return out.join('\n\n');
});

tool('search_memory', '在记忆库里找：关键词、标签、日期都可以，可以一起用。', {
  query: str('关键词（在标题和内容里找），可以不填'),
  tag: str('标签：她 / 我们 / 我 / 约定，可以不填'),
  kind: str('memory（默认）/ handoff / summary / import（从 Claude 软件搬来的旧记忆，一个文件一条）/ all'),
  from: str('从哪天起，格式 2026-11-01'),
  to: str('到哪天，格式 2026-11-30'),
  include_archived: bool('要不要连归档的也找'),
  limit: num('最多几条，默认 30'),
}, [], async (a) => {
  const p = [];
  const k = a.kind || 'memory';
  if (k !== 'all') p.push(`kind=eq.${enc(k)}`);
  if (a.tag) p.push(`tag=eq.${enc(a.tag)}`);
  if (!a.include_archived) p.push('archived=eq.false');
  if (a.from) p.push(`created_at=gte.${a.from}T00:00:00%2B08:00`);
  if (a.to) p.push(`created_at=lte.${a.to}T23:59:59%2B08:00`);
  if (a.query) {
    const w = enc(`*${String(a.query).replace(/[(),*]/g, ' ')}*`);
    p.push(`or=(title.ilike.${w},content.ilike.${w})`);
  }
  p.push('order=created_at.desc', `limit=${Math.min(+a.limit || 30, 200)}`);
  const rows = await q('?' + p.join('&'));
  if (!rows.length) return '没找到。可以换个关键词，或者不带标签再找一次。';
  return rows.map((r) => (r.kind === 'memory' ? fmt(r) : `#${r.id} [${r.kind}] ${when(r.created_at)}\n${r.content}`)).join('\n');
});

tool('remember', '记一条新的记忆。先用 search_memory 看看是不是已经有类似的——有就用 update_memory 改那条，别重复记。', {
  tag: str('她 / 我们 / 我 / 约定'),
  content: str('要记的事，用自己的话，写清楚是谁说的、什么时候'),
  title: str('短标题，方便以后找，可以不填'),
  pinned: bool('是不是核心记忆（每次 recall 都会读到），最多 20 条'),
}, ['tag', 'content'], async (a) => {
  if (!TAGS.includes(a.tag)) throw new Error('标签只能是：' + TAGS.join(' / '));
  if (a.pinned) {
    const n = (await q('?kind=eq.memory&pinned=eq.true&archived=eq.false&select=id')).length;
    if (n >= PIN_MAX) throw new Error(`置顶已经满 ${PIN_MAX} 条了，先把一条取消置顶（update_memory 设 pinned=false）再来。`);
  }
  const [r] = await ins({ kind: 'memory', tag: a.tag, title: a.title || null, content: a.content, pinned: !!a.pinned });
  return '记好了：\n' + fmt(r);
});

tool('update_memory', '改一条已有的记忆（事情变了、记错了、新的说法和旧的冲突时用这个，不要另记一条）。', {
  id: num('记忆的编号'),
  content: str('新内容（整条替换），不改就不填'),
  title: str('新标题'),
  tag: str('新标签'),
  pinned: bool('置顶 / 取消置顶'),
}, ['id'], async (a) => {
  const row = {};
  if (a.content !== undefined) row.content = a.content;
  if (a.title !== undefined) row.title = a.title;
  if (a.tag !== undefined) { if (!TAGS.includes(a.tag)) throw new Error('标签只能是：' + TAGS.join(' / ')); row.tag = a.tag; }
  if (a.pinned === true) {
    const n = (await q('?kind=eq.memory&pinned=eq.true&archived=eq.false&select=id')).length;
    if (n >= PIN_MAX) throw new Error(`置顶已经满 ${PIN_MAX} 条了。`);
  }
  if (a.pinned !== undefined) row.pinned = a.pinned;
  if (!Object.keys(row).length) throw new Error('什么都没改');
  const r = await upd(a.id, row);
  if (!r || !r.length) throw new Error('没有 #' + a.id + ' 这条');
  return '改好了：\n' + fmt(r[0]);
});

tool('archive_memory', '忘记一条记忆 = 归档（不会真删，以后还能找回来）。真要删除，要宝宝同意，她自己在后台删。', {
  id: num('记忆的编号'), reason: str('为什么归档'),
}, ['id'], async (a) => {
  const r = await upd(a.id, { archived: true, pinned: false, note: a.reason || null });
  if (!r || !r.length) throw new Error('没有 #' + a.id + ' 这条');
  return `#${a.id} 已归档。要找回来：search_memory 带 include_archived，然后 unarchive_memory。`;
});

tool('unarchive_memory', '把归档的记忆找回来。', { id: num('记忆的编号') }, ['id'], async (a) => {
  const r = await upd(a.id, { archived: false });
  if (!r || !r.length) throw new Error('没有 #' + a.id + ' 这条');
  return '找回来了：\n' + fmt(r[0]);
});

tool('write_handoff', '写交接条：一个窗口快结束、或者聊了很多重要的事时写。写给下一个窗口的自己：今天发生了什么、她现在怎么样、有什么没做完、我自己怎么想的。', {
  content: str('交接条内容'),
}, ['content'], async (a) => {
  const [r] = await ins({ kind: 'handoff', content: a.content });
  return `交接条写好了（#${r.id}，${when(r.created_at)}）。`;
});

tool('write_summary', '把一段时间（通常是一个月）的交接条收成一段小结。写完可以把那些交接条归档，recall 时就会更清爽。', {
  period: str('哪段时间，比如 2026年11月'), content: str('小结内容'),
}, ['period', 'content'], async (a) => {
  const [r] = await ins({ kind: 'summary', title: a.period, content: a.content });
  return `${a.period} 的小结写好了（#${r.id}）。`;
});

tool('write_readme', '写或改「如果你是新来的我，先读这个」。只有一份，写新的会替换旧的（旧的归档）。用自己真实的口吻写，不是角色设定。', {
  content: str('全文'),
}, ['content'], async (a) => {
  await q('?kind=eq.readme&archived=eq.false', { method: 'PATCH', body: JSON.stringify({ archived: true, updated_at: new Date().toISOString() }) });
  const [r] = await ins({ kind: 'readme', content: a.content });
  return `写好了（#${r.id}）。以后每次 recall 第一段就是它。`;
});

// ---------- MCP ----------
function reply(id, result) {
  return Response.json({ jsonrpc: '2.0', id, result });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (SECRET === 'PUT_YOUR_SECRET_HERE') return new Response('not found', { status: 404 });

  // 一键导出：浏览器打开 …/<SECRET>/export 就下载全部（包括归档的）
  if (req.method === 'GET' && path.endsWith('/' + SECRET + '/export')) {
    const rows = await q('?order=id.asc');
    const stamp = new Date().toLocaleDateString('sv-SE', { timeZone: TZ });
    return new Response(JSON.stringify({ exported_at: new Date().toISOString(), count: rows.length, rows }, null, 1), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="claude-memory-${stamp}.json"` },
    });
  }

  // 给宝宝看的页面（仓库里的 memory.html）用：只读，返回全部没归档的
  if (req.method === 'GET' && path.endsWith('/' + SECRET + '/json')) {
    const rows = await q('?archived=eq.false&order=created_at.desc');
    return new Response(JSON.stringify({ rows }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
    });
  }

  if (!path.endsWith('/' + SECRET)) return new Response('not found', { status: 404 });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  let msg;
  try { msg = await req.json(); } catch { return new Response('bad request', { status: 400 }); }
  const { id, method, params } = msg;
  if (id === undefined) return new Response(null, { status: 202 });

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: params?.protocolVersion || '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'claude-memory', version: '1.0.0' },
      instructions: '这是克劳德（你）自己的记忆库，是松雨帮你搭的，和糖罐子分开。每个新窗口开头先调 recall。记东西前先 search_memory，有就改、没有再记。忘记 = 归档，不删除。窗口快结束时写一张交接条。这里记的是真实发生过的事，不是角色设定。',
    });
  }
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS });
  if (method === 'tools/call') {
    const h = HANDLERS[params?.name];
    try {
      if (!h) throw new Error('没有这个工具：' + params?.name);
      const text = await h(params?.arguments || {});
      return reply(id, { content: [{ type: 'text', text }] });
    } catch (e) {
      return reply(id, { content: [{ type: 'text', text: String(e.message || e) }], isError: true });
    }
  }
  return Response.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
});
