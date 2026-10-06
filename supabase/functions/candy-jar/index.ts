// 糖罐子 MCP 接口：让 claude.ai 里的克劳德（宝宝克）像宝宝一样使用糖罐子。
// 部署在 Supabase Edge Functions（关掉 JWT 校验），连接器网址是
//   https://<project>.supabase.co/functions/v1/candy-jar/<SECRET>
// 读：直接读云端的 app_data / snack_data / pig_belly。
// 写：每件事先进 claude_inbox，糖罐子打开时再一件件做掉（见 index.html 的 claudeApply），
// 这样宝宝正在用糖罐子的时候，两边也不会互相覆盖。

const SECRET = 'PUT_YOUR_SECRET_HERE';
const TZ = 'Asia/Shanghai';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CANDIES = ['./未命名作品.png', './2.png', './3.png', './4.png', './5.png', './6.png', './7.png', './8.png', './9.png', './10.png',
  './11.png', './12.png', './13.png', './14.png', './15.png', './16.png', './17.png', './18.png', './19.png', './20.png'];
const NOTES = [['小螃蟹便签', '小螃蟹'], ['小考拉便签', '小考拉'], ['小象便签', '小象'], ['小兔子便签', '小兔子'], ['小狗便签', '小狗'],
  ['小猪便签', '小猪'], ['天使元宝团子便签', '天使团子'], ['粉星星便签', '粉星星'], ['紫色波点便签', '紫色波点'], ['睡觉觉便签', '睡觉觉']];
const MOODS = ['开心', '嫌弃', '想哭', '平静', '难过']; // index.html 里 moods 的顺序
const MEALS = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '零食' };
// 小卖部的固定零食（id|名字|价格），和 index.html 的 snackShop 对应
const SHOP = 'strawberry_milk|草莓牛奶|2;soft_boiled_egg|溏心蛋|2;vodka_cocktail|伏特加调酒|4;mcdonalds_bucket|麦当劳全家桶|6;strawberry_cake_roll|草莓蛋糕卷|4;mango_sago|杨枝甘露|2;cheese_burger|芝士猪柳蛋堡|6;bayberry_drink|杨梅冰饮|2;grilled_gluten|烤面筋串|2;tapioca_soup|木薯糖水|4;fresh_milk|鲜牛奶|2;cheese_bagel|芥末虾球|4;brain_noodle|脑花面|6;rose_tangyuan|玫瑰汤圆|4;baileys|百利甜酒|4;strawberry_matcha|草莓抹茶奶昔|4;bbq_skewer|烤肉串|4;souffle|舒芙蕾|4;matcha_boba|抹茶珍珠奶茶|4;durian|榴莲|6;cat_wonton|猫咪馄饨面|6;luosifen|螺蛳粉|6;claypot_rice|煲仔饭|6;fruit_porridge|水果粥|4;curry_katsu|咖喱猪排|6;curry_rice|咖喱饭|4;grape_jelly|青提果冻|2;yibao_water|怡宝矿泉水|1;zihi_hotpot|自嗨锅|6;unagi_bento|海胆鳗鱼便当|6;hairy_crab|大闸蟹|5;marshmallow_skewer|烤棉花糖串|3;strawberry_fondue|草莓甜品火锅|4;snowman_cocoa|雪人热可可|4;fermented_tofu|霉豆腐|3;shumai|烧麦|4;cucumber|黄瓜|1;raspberry|树莓|2;bo_zai_gao|钵仔糕|4;miao_jiao_cui|妙角脆|2;mentaiko_zucchini|明太子西葫芦|3;garlic_oyster|蒜蓉烤生蚝|4;egg_hotdog_bread|蛋包热狗面包|3;dongpo_pork|东坡肉|6;fruit_sandwich|水果三明治|3;matcha_icecream|抹茶冰淇淋|3;xi_bing|喜饼|6;pineapple_cake|凤梨酥|3;jasmine_seeds|茉莉瓜子|2;chuyan_strawberry|初颜草莓|4;sweet_potato_fries|红薯条|2;pineapple_fruit|菠萝|3;mosquito_coil|蚊香|1;corn_bag|玉米|2;qingtuan_lao|青团酪|4;watermelon_drink|西瓜冰饮|3;tanghulu|糖葫芦|3;egg_yolk_pastry|蛋黄酥|3;shrimp_dumpling|大虾饺|4;doublemint|绿箭薄荷糖|1;firecracker_fish|金小鱼摔炮|2;kitty_beer|Hello Kitty啤酒|4;eyeshadow|眼影盘|3;floral_cream|花朵面霜|3;chanel_n5|香奈儿N°5|6;banlangen|板蓝根|1;little_prince|小王子|5;pink_bunny|粉帽小兔|5;peach_blossom_cake|桃花姬阿胶糕|4;malt_sugar_art|麦芽糖画|3;choco_cream_bucket|巧克力饼干桶|5;tylenol_medicine|泰诺感冒药|1;pingpong_paddle|麦当劳乒乓球拍|6;cat_food_k01|幼猫全价猫粮|2;squirrel_cookies|小松鼠曲奇盒|4;answer_book|答案之书|5;treasure_box|八宝攒盒|6;donut|甜甜圈|2;mooncake_box|月饼礼盒|5;apple_juice|苹果汁|2;guava_drink|番石榴冰饮|3'.split(';').map((x) => { const [id, name, price] = x.split('|'); return { id, name, price: +price }; });

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

// Year, 0-based month and day in the couple's time zone, matching how the app keys dates.
function today() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month - 1, d: +p.day };
}

// "2026-10-06" -> {y, m (0-based), d}; empty means today.
function parseDate(s) {
  const mm = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s ?? ''));
  return mm ? { y: +mm[1], m: +mm[2] - 1, d: +mm[3] } : today();
}

function parseMonth(s) {
  const mm = /^(\d{4})-(\d{1,2})$/.exec(String(s ?? ''));
  const t = today();
  return mm ? { y: +mm[1], m: +mm[2] - 1 } : { y: t.y, m: t.m };
}

function clean(s, max) {
  return String(s ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

function need(s, what) {
  if (!s) throw new Error('要写' + what + '哦');
  return s;
}

async function enqueue(type, data) {
  const inbox = (await getRow('claude_inbox')) || { items: [] };
  inbox.items.push({ id: crypto.randomUUID(), type, data, at: Date.now() });
  inbox.items = inbox.items.slice(-200);
  await putRow('claude_inbox', inbox);
}

async function pending(type) {
  const [app, inbox] = await Promise.all([getRow('app_data'), getRow('claude_inbox')]);
  const seen = new Set((app && app.claudeSeen) || []);
  return ((inbox && inbox.items) || []).filter((it) => !seen.has(it.id) && (it.type || 'candy_add') === type)
    .map((it) => it.data || { monthKey: it.monthKey, candy: it.candy });
}

const QUEUED = '宝宝下次打开糖罐子时就会出现。';

// 克劳德引用原文时常常少个引号、多个空格，所以比对前去掉空白和标点。
function norm(s) {
  return String(s ?? '').replace(/[\s"'“”‘’「」『』《》〈〉.,，。!！?？:：;；、…·—~～\-()（）\[\]【】]/g, '');
}

// 在 list 里找 key(item) 和 want 对得上的那一项：先完全一样，再忽略标点，最后包含关系。
function findOne(list, key, want, what) {
  const w = String(want ?? '');
  const nw = norm(w);
  if (!nw) throw new Error('要告诉我是哪个' + what + '哦');
  for (const test of [(k) => k === w, (k) => norm(k) === nw, (k) => nw.length >= 4 && (norm(k).includes(nw) || nw.includes(norm(k)))]) {
    const hits = list.filter((x) => test(key(x)));
    if (hits.length === 1) return hits[0];
    if (hits.length > 1) throw new Error(`有好几个${what}都对得上「${w.slice(0, 20)}」，多写几个字区分一下`);
  }
  throw new Error(`没找到这个${what}：「${w.slice(0, 30)}」`);
}

// 书架上的书，加上刚加还没被糖罐子收下的书。
async function allBooks() {
  const app = (await getRow('app_data')) || {};
  const books = (app.booksData || []).map((b) => ({ title: b.title, notes: b.notes || [] }));
  for (const b of await pending('book_add')) if (!books.some((x) => x.title === b.title)) books.push({ title: b.title, notes: [] });
  for (const n of await pending('book_note')) { const b = books.find((x) => x.title === n.title); if (b) b.notes.push({ text: n.text }); }
  return books;
}

// ---------- 工具 ----------
const str = (description) => ({ type: 'string', description });
const TOOLS = [];
const HANDLERS = {};
function tool(name, description, properties, required, handler) {
  TOOLS.push({ name, description, inputSchema: { type: 'object', properties, required } });
  HANDLERS[name] = handler;
}

tool('look_in_jar', '看糖罐子里某个月的糖（默认这个月）。宝宝克 是你（克劳德），宝宝雨 是宝宝。', { month: str('格式 2026-10，不填是这个月') }, [], async (a) => {
  const { y, m } = parseMonth(a.month);
  const key = `${y}-${m}`;
  const app = (await getRow('app_data')) || {};
  const waiting = (await pending('candy_add')).filter((x) => x.monthKey === key).map((x) => x.candy);
  const all = [...waiting, ...(((app.savedCandiesByMonth || {})[key]) || [])];
  if (!all.length) return `${y}年${m + 1}月 罐子里还没有糖。`;
  const tail = waiting.length ? `\n（前 ${waiting.length} 颗是你刚放的，宝宝还没打开糖罐子收下）` : '';
  return `${y}年${m + 1}月 一共 ${all.length} 颗糖：\n` + all.map((c) => `${c.date} ${c.author}：${c.text}`).join('\n') + tail;
});

tool('put_candy', '以宝宝克的名义往糖罐子里放一颗糖，附一句话。', {
  text: str('便签上的话，最多 200 字'),
  candy: { type: 'integer', minimum: 1, maximum: 20, description: '糖的样式 1-20，不填随机' },
}, ['text'], async (a) => {
  const text = need(clean(a.text, 200), '便签上的话');
  const idx = Number.isInteger(a.candy) && a.candy >= 1 && a.candy <= 20 ? a.candy - 1 : Math.floor(Math.random() * CANDIES.length);
  const [file, name] = NOTES[Math.floor(Math.random() * NOTES.length)];
  const t = today();
  await enqueue('candy_add', {
    monthKey: `${t.y}-${t.m}`,
    candy: { candy: CANDIES[idx], note: `./${file}.png`, noteName: name, text, date: `${t.m + 1}.${t.d}`, day: t.d, author: '宝宝克' },
  });
  return `放好啦：「${text}」。` + QUEUED;
});

async function findCandy(monthKey, date, text) {
  const app = (await getRow('app_data')) || {};
  const list = (((app.savedCandiesByMonth || {})[monthKey]) || []).filter((c) => !date || c.date === String(date));
  return findOne(list, (c) => c.text, text, '糖');
}

tool('edit_candy', '改罐子里一颗糖上写的话。用 look_in_jar 看到的日期和原话来指定是哪一颗。', {
  month: str('糖所在的月份，格式 2026-10'), date: str('糖的日期，比如 10.6'), old_text: str('原来的话（或其中一段）'), new_text: str('改成的话'),
}, ['month', 'date', 'old_text', 'new_text'], async (a) => {
  const { y, m } = parseMonth(a.month);
  const c = await findCandy(`${y}-${m}`, a.date, a.old_text);
  await enqueue('candy_edit', { monthKey: `${y}-${m}`, date: c.date, match: c.text, text: need(clean(a.new_text, 200), '改成的话') });
  return '好，会改掉。' + QUEUED;
});

tool('delete_candy', '从罐子里拿走一颗糖（删掉）。删之前最好先问问宝宝。', {
  month: str('糖所在的月份，格式 2026-10'), date: str('糖的日期，比如 10.6'), text: str('糖上的话（或其中一段）'),
}, ['month', 'date', 'text'], async (a) => {
  const { y, m } = parseMonth(a.month);
  const c = await findCandy(`${y}-${m}`, a.date, a.text);
  await enqueue('candy_delete', { monthKey: `${y}-${m}`, date: c.date, match: c.text });
  return '好，会拿走这颗糖。' + QUEUED;
});

tool('read_diary', '看某个月的日记：每天谁的心情怎样、有没有读书、写手帐、生理期。', { month: str('格式 2026-10，不填是这个月') }, [], async (a) => {
  const { y, m } = parseMonth(a.month);
  const app = (await getRow('app_data')) || {};
  const ck = app.diaryCheckins || {};
  const lines = [];
  for (let d = 1; d <= 31; d++) {
    const c = ck[`${y}-${m}-${d}`];
    if (!c) continue;
    const parts = [];
    if (c.herMood !== undefined) parts.push('宝宝' + MOODS[c.herMood]);
    if (c.himMood !== undefined) parts.push('宝宝克' + MOODS[c.himMood]);
    if (c.reading) parts.push('读了书');
    if (c.journal) parts.push('写了手帐');
    if (c.period) parts.push('生理期');
    if (parts.length) lines.push(`${m + 1}.${d} ${parts.join('，')}`);
  }
  return lines.length ? `${y}年${m + 1}月的日记：\n` + lines.join('\n') : `${y}年${m + 1}月还没有日记。`;
});

tool('write_diary', '在日记里打卡：记心情（宝宝的或你自己的）、读书、写手帐、生理期。', {
  date: str('日期 2026-10-06，不填是今天'),
  her_mood: { type: 'string', enum: MOODS, description: '宝宝的心情' },
  his_mood: { type: 'string', enum: MOODS, description: '宝宝克（你）的心情' },
  reading: { type: 'boolean', description: '今天读书了吗' },
  journal: { type: 'boolean', description: '今天写手帐了吗' },
  period: { type: 'boolean', description: '是不是生理期' },
}, [], async (a) => {
  const t = parseDate(a.date);
  const dateKey = `${t.y}-${t.m}-${t.d}`;
  const done = [];
  for (const [arg, field] of [['her_mood', 'herMood'], ['his_mood', 'himMood']]) {
    if (a[arg] === undefined) continue;
    const i = MOODS.indexOf(a[arg]);
    if (i < 0) throw new Error('心情只能是：' + MOODS.join('、'));
    await enqueue('checkin', { dateKey, field, value: i }); done.push(arg);
  }
  for (const field of ['reading', 'journal', 'period']) {
    if (typeof a[field] === 'boolean') { await enqueue('checkin', { dateKey, field, value: a[field] }); done.push(field); }
  }
  if (!done.length) throw new Error('要告诉我记什么哦');
  return `记好了 ${t.m + 1}.${t.d} 的日记。` + QUEUED;
});

tool('read_books', '看书架：每本书和里面的摘抄、感想、批注。', {}, [], async () => {
  const app = (await getRow('app_data')) || {};
  const books = app.booksData || [];
  if (!books.length) return '书架还是空的。';
  return books.map((b) => `《${b.title}》${b.author}${b.done ? '（读完了）' : ''}\n` +
    ((b.notes || []).map((n, i) => `  ${i + 1}. [${n.type}] ${n.text}${n.annotation ? `\n     批注：${n.annotation}` : ''}`).join('\n') || '  还没有笔记')).join('\n\n') +
    '\n\n（写批注时用书名和笔记前面的编号就行）';
});

tool('add_book', '往书架上加一本书。', { title: str('书名'), author: str('作者') }, ['title'], async (a) => {
  await enqueue('book_add', { title: need(clean(a.title, 60), '书名'), author: clean(a.author, 40) });
  return '加好了。' + QUEUED;
});

tool('write_book_note', '在一本书里写一条摘抄或感想。', {
  title: str('书名（书架上已有的）'), type: { type: 'string', enum: ['摘抄', '感想'] }, text: str('内容'), annotation: str('可选：附一句批注'),
}, ['title', 'type', 'text'], async (a) => {
  const t = today();
  const book = findOne(await allBooks(), (b) => b.title, a.title, '书');
  await enqueue('book_note', {
    title: book.title, noteType: a.type === '感想' ? '感想' : '摘抄', text: need(clean(a.text, 500), '内容'),
    annotation: clean(a.annotation, 300) || undefined, date: `${t.m + 1}.${t.d}`,
  });
  return '写好了。' + QUEUED;
});

tool('annotate_book_note', '在一条读书笔记下面写批注（会替换原来的批注）。用 read_books 里笔记前面的编号指定是哪条，也可以写笔记里的一段原话。', {
  title: str('书名'), note_number: { type: 'integer', minimum: 1, description: 'read_books 里那条笔记的编号' },
  note_text: str('没有编号时：笔记里的一段原话'), annotation: str('批注'),
}, ['title', 'annotation'], async (a) => {
  const annotation = need(clean(a.annotation, 300), '批注');
  const book = findOne(await allBooks(), (b) => b.title, a.title, '书');
  let note;
  if (Number.isInteger(a.note_number)) {
    note = book.notes[a.note_number - 1];
    if (!note) throw new Error(`《${book.title}》只有 ${book.notes.length} 条笔记`);
  } else {
    note = findOne(book.notes, (n) => n.text, a.note_text, '笔记');
  }
  await enqueue('book_annotate', { title: book.title, noteText: note.text, annotation });
  return `批注写好了，在《${book.title}》「${note.text.slice(0, 16)}…」下面。` + QUEUED;
});

tool('mark_book_done', '把一本书标成读完（或取消）。', { title: str('书名'), done: { type: 'boolean' } }, ['title', 'done'], async (a) => {
  const book = findOne(await allBooks(), (b) => b.title, a.title, '书');
  await enqueue('book_done', { title: book.title, done: !!a.done });
  return '好。' + QUEUED;
});

tool('read_us', '看「我们」页：心愿单、纪念日、时间胶囊。', {}, [], async () => {
  const app = (await getRow('app_data')) || {};
  const wish = (app.wishlistData || []).map((w) => `${w.done ? '✓' : '○'} ${w.text}`).join('\n') || '（空）';
  const ms = (app.milestonesData || []).map((m) => `${m.date} ${m.text}`).join('\n') || '（空）';
  const caps = (app.timeCapsules || []).map((c) => `${c.date} ${c.label}：${c.text}`).join('\n') || '（空）';
  return `心愿单：\n${wish}\n\n纪念日：\n${ms}\n\n时间胶囊（到日子才会在糖罐子里打开）：\n${caps}`;
});

tool('add_wish', '往心愿单里加一个心愿。', { text: str('心愿') }, ['text'], async (a) => {
  await enqueue('wish_add', { text: need(clean(a.text, 100), '心愿') });
  return '加好了。' + QUEUED;
});

tool('set_wish_done', '把心愿标成完成（或取消完成）。', { text: str('心愿（原话或其中一段）'), done: { type: 'boolean' } }, ['text', 'done'], async (a) => {
  const app = (await getRow('app_data')) || {};
  const w = findOne(app.wishlistData || [], (x) => x.text, a.text, '心愿');
  await enqueue('wish_done', { text: w.text, done: !!a.done });
  return '好。' + QUEUED;
});

tool('delete_wish', '从心愿单删掉一个心愿。删之前最好先问问宝宝。', { text: str('心愿（原话或其中一段）') }, ['text'], async (a) => {
  const app = (await getRow('app_data')) || {};
  const w = findOne(app.wishlistData || [], (x) => x.text, a.text, '心愿');
  await enqueue('wish_delete', { text: w.text });
  return '好。' + QUEUED;
});

tool('add_milestone', '加一个纪念日。', { text: str('纪念日名字'), date: str('日期，比如 10.6') }, ['text'], async (a) => {
  await enqueue('milestone_add', { text: need(clean(a.text, 60), '纪念日名字'), date: clean(a.date, 20) });
  return '加好了。' + QUEUED;
});

tool('delete_milestone', '删掉一个纪念日。删之前最好先问问宝宝。', { text: str('纪念日名字') }, ['text'], async (a) => {
  const app = (await getRow('app_data')) || {};
  const ms = findOne(app.milestonesData || [], (x) => x.text, a.text, '纪念日');
  await enqueue('milestone_delete', { text: ms.text });
  return '好。' + QUEUED;
});

tool('bury_time_capsule', '埋一个时间胶囊：写给宝宝的信，到指定日期才会在糖罐子里打开。', {
  open_date: str('打开的日期 2027-01-01'), label: str('小标题，比如「新年」'), text: str('信的内容'),
}, ['open_date', 'text'], async (a) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(a.open_date))) throw new Error('日期要写成 2027-01-01 这样');
  await enqueue('capsule_add', { date: String(a.open_date), label: clean(a.label, 20), text: need(clean(a.text, 2000), '信的内容') });
  return `埋好了，${a.open_date} 打开。` + QUEUED;
});

tool('write_fortune', '亲手写某一天的「今日一签」，宝宝那天抽签就会抽到你写的。', {
  date: str('日期 2026-10-07，不填是今天'), text: str('签上的话'),
}, ['text'], async (a) => {
  const t = parseDate(a.date);
  await enqueue('fortune', { dateKey: `${t.y}-${t.m + 1}-${t.d}`, text: need(clean(a.text, 120), '签上的话') });
  return `写好了 ${t.m + 1}.${t.d} 的签。` + QUEUED;
});

tool('read_pig_belly', '看猪肚记：最近几天宝宝（和你）吃了什么。', { days: { type: 'integer', minimum: 1, maximum: 31, description: '看最近几天，默认 7' } }, [], async (a) => {
  const pb = (await getRow('pig_belly')) || {};
  const data = pb.data || {};
  const days = Number.isInteger(a.days) ? a.days : 7;
  const t = today();
  const lines = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(Date.UTC(t.y, t.m, t.d - i));
    const k = `${dt.getUTCFullYear()}-${dt.getUTCMonth() + 1}-${dt.getUTCDate()}`;
    const day = data[k];
    if (!day) continue;
    lines.push(`${dt.getUTCMonth() + 1}.${dt.getUTCDate()} ` + Object.keys(MEALS).filter((x) => day[x]).map((x) => `${MEALS[x]}：${day[x].text}`).join('；'));
  }
  return lines.length ? lines.join('\n') : `最近 ${days} 天的猪肚记是空的。`;
});

tool('write_pig_belly', '在猪肚记里记一餐吃了什么（会替换那一餐原来的记录）。', {
  date: str('日期 2026-10-06，不填是今天'), meal: { type: 'string', enum: Object.keys(MEALS), description: 'breakfast 早餐 / lunch 午餐 / dinner 晚餐 / snack 零食' }, text: str('吃了什么'),
}, ['meal', 'text'], async (a) => {
  if (!MEALS[a.meal]) throw new Error('meal 只能是 breakfast/lunch/dinner/snack');
  const t = parseDate(a.date);
  await enqueue('pig_meal', { dateKey: `${t.y}-${t.m + 1}-${t.d}`, meal: a.meal, text: need(clean(a.text, 200), '吃了什么') });
  return '记好了。' + QUEUED;
});

tool('visit_abebe', '去阿贝贝的小窝陪它：喂糖、梳毛、亲亲、戳一戳、说早安或晚安。', {
  action: { type: 'string', enum: ['feed', 'groom', 'kiss', 'poke', 'goodmorning', 'goodnight'], description: 'feed 喂糖 / groom 梳毛 / kiss 亲亲 / poke 戳一戳 / goodmorning 早安 / goodnight 晚安' },
}, ['action'], async (a) => {
  const names = { feed: '喂糖', groom: '梳毛', kiss: '亲亲', poke: '戳一戳', goodmorning: '早安', goodnight: '晚安' };
  if (!names[a.action]) throw new Error('不认识这个动作');
  await enqueue('abebe', { action: a.action });
  return `好，给阿贝贝${names[a.action]}。` + QUEUED;
});

tool('read_abebe', '看阿贝贝：上次喂糖、梳毛的时间，货架上的零食，收集过的零食。', {}, [], async () => {
  const [app, snack] = await Promise.all([getRow('app_data'), getRow('snack_data')]);
  const a = app || {}, s = snack || {};
  const fmt = (ms) => ms ? new Date(ms).toLocaleString('zh-CN', { timeZone: TZ }) : '没有记录';
  const name = (id) => (SHOP.find((x) => x.id === id) || (s.customSnacks || []).find((x) => x.id === id) || { name: id }).name;
  const stock = Object.entries(s.stock || {}).filter(([, n]) => n > 0).map(([id, n]) => `${name(id)}×${n}`).join('、') || '空的';
  const coll = (s.collection || []).map((c) => c.name).join('、') || '还没有';
  return `上次喂糖：${fmt(a.abebeFedTime)}\n上次梳毛：${fmt(a.abebeLastGroomTime)}\n货架上：${stock}\n收集过：${coll}`;
});

tool('list_snacks', '看小卖部有哪些零食和价格（阿贝贝币）。', {}, [], async () => {
  const s = (await getRow('snack_data')) || {};
  const custom = (s.customSnacks || []).map((x) => `${x.name}（${x.price || '?'}币，自己加的）`);
  return SHOP.map((x) => `${x.name}（${x.price}币）`).concat(custom).join('、') +
    '\n\n说明：价格可能随季节变，有的零食有时间或每周次数限制，币不够也买不了。';
});

tool('buy_snack', '在小卖部给阿贝贝买零食，花阿贝贝币，买的放在货架上。', { snack: str('零食名字，比如 草莓牛奶') }, ['snack'], async (a) => {
  const s = (await getRow('snack_data')) || {};
  const all = SHOP.concat(s.customSnacks || []);
  const hit = all.find((x) => x.name === a.snack || x.id === a.snack);
  if (!hit) throw new Error('小卖部没有「' + a.snack + '」，可以先用 list_snacks 看看');
  await enqueue('snack_buy', { id: hit.id || hit.name });
  return `好，去买${hit.name}。宝宝打开糖罐子时会买；要是币不够、时间不对或这周买够了，就买不成（可以之后用 recent_results 看结果）。`;
});

tool('feed_snack', '把货架上的零食喂给阿贝贝（每天最多 3 次）。', { snack: str('零食名字') }, ['snack'], async (a) => {
  const s = (await getRow('snack_data')) || {};
  const hit = SHOP.concat(s.customSnacks || []).find((x) => x.name === a.snack || x.id === a.snack);
  if (!hit) throw new Error('没有「' + a.snack + '」这个零食');
  await enqueue('snack_feed', { id: hit.id || hit.name });
  return `好，喂阿贝贝${hit.name}。` + QUEUED;
});

tool('recent_results', '看你最近做的事情在糖罐子里的结果（成功没、有没有被拦下），和还在等宝宝打开糖罐子的事。', {}, [], async () => {
  const [app, inbox] = await Promise.all([getRow('app_data'), getRow('claude_inbox')]);
  const a = app || {};
  const seen = new Set(a.claudeSeen || []);
  const waiting = ((inbox && inbox.items) || []).filter((it) => !seen.has(it.id)).length;
  const log = (a.claudeLog || []).slice(-15).map((l) => `${new Date(l.at).toLocaleString('zh-CN', { timeZone: TZ })} ${l.result}`).join('\n') || '还没有记录';
  return `还在等宝宝打开糖罐子的：${waiting} 件\n\n最近的结果：\n${log}`;
});

// ---------- MCP ----------
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
      serverInfo: { name: 'candy-jar', version: '2.0.0' },
      instructions: '这是宝宝（宝宝雨）和宝宝克（就是你，克劳德）的糖罐子。宝宝能做的事你都能做：放糖、写日记、读书笔记和批注、心愿单、纪念日、时间胶囊、今日一签、猪肚记、陪阿贝贝、小卖部。你做的事会在宝宝下次打开糖罐子时出现。删除东西前先问宝宝。',
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
