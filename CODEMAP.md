# 糖罐子代码地图

2026-10-27 把原来 8600 行的 index.html 拆成了下面这些文件。功能没变，只是分开放。

## 文件

| 文件 | 里面是什么 |
|---|---|
| `index.html` | 页面骨架（所有 HTML），按顺序引用下面的 css 和 js |
| `css/main.css` | 全部样式 |
| `js/candy.js` | 糖果/便签数据、图片预加载、「宝宝克来过」脚印、糖罐子页；最上面有 `whenReady()` |
| `js/chat.js` | 阿贝贝聊天：对话库 + 微信式聊天记录 |
| `js/store.js` | Supabase 配置、全部数据的存和读 |
| `js/pigbelly.js` | 猪肚记 |
| `js/diary.js` | 心情打卡、摇罐子、晃手机、删糖 |
| `js/books.js` | 读书 |
| `js/extras.js` | 阿贝贝闲聊和上次来访、时间胶囊、卡片菜单、纪念日开屏 |
| `js/init.js` | 启动、今日一签 |
| `js/abebe.js` | 阿贝贝主系统 |
| `js/look.js` | 在一起时间条、自定义外观、设置抽屉 |
| `js/snack.js` | 小卖部、添加零食 |
| `js/backup.js` | 数据导出导入 |
| `js/theme.js` | 主题、阿贝贝的梦 |
| `js/games.js` | 糖果接接乐、记忆翻牌 |
| `js/avatar.js` | 头像和情侣名 |
| `js/weather.js` | 天气 |
| `js/crab.js` | 克劳德灵动岛、小螃蟹、螃蟹图鉴（图和台词在 data/） |
| `data/candy-pics.js` | 糖果和便签：图片文件、底色、名字 |
| `data/chat-words.js` | 阿贝贝聊天的对话库 |
| `data/abebe-words.js` | 阿贝贝的台词：日常、季节、节日 |
| `data/snacks.js` | 小卖部的零食和零食故事；SNACK_STREET 九家店（ids 店里有什么、always 每天都有货、cover 门口招牌）；SNACK_BUNDLES 套餐 |
| `data/dreams.js` | 阿贝贝的梦 |
| `data/fortunes.js` | 今日一签的签文 |
| `data/crab-art.js` | 小螃蟹的图（SVG 和 sprite） |
| `data/crab-words.js` | 小螃蟹的状态、台词、图鉴名字 |
| `supabase/functions/candy-jar/` | 连接器（克劳德放糖用的 MCP） |

## 文字和图片放 data/，干活的代码放 js/

想加新的梦、新零食、新螃蟹台词，去 `data/` 里对应的文件加就行。
data/ 里的文件只能放纯内容（文字、数字、图片字符串），不要在里面写函数或用到别的变量。

## 改代码时的规矩

1. **改完 css/、js/ 或 data/ 里的任何文件，推送前跑一次 `python3 bump.py`**。
   它会更新 index.html 里每个文件后面的 `?v=` 版本号。不跑的话手机可能继续用旧文件。
2. js 文件都是普通 `<script>`，共用一个全局作用域，**加载顺序有意义**：
   后面的文件可以用前面文件里的东西；前面文件在加载时**立刻执行**的代码不能用后面文件里的函数。
   （放在函数里、点击时才跑的不受影响。）
3. 需要等所有文件都加载完再跑的事（读云端数据、启动），用 `whenReady(fn)` 包起来。
4. 图片路径写 `./xxx.png` 就行（相对 index.html）；css 里的字体路径是 `../fonts/`。
5. 推送后 GitHub Pages 大约 10 分钟才更新，测试时等一会儿再把 app 彻底划掉重开。
6. 加了新糖、新便签或新零食，想让克劳德的连接器也认识：跑 `python3 sync_connector.py`，
   再把 `supabase/functions/candy-jar/index.ts` 重新部署到 Supabase（Edge Functions → candy-jar → 编辑代码 → Deploy）。
   注意第 8 行 `const SECRET = 'PUT_YOUR_SECRET_HERE';` 要换回你自己的那串钥匙，不然连接器网址会失效。
