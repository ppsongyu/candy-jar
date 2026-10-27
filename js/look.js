/* 在一起时间条、自定义外观、设置抽屉 */
// ===== US TIME BAR =====
function updateUsClock(){
  const now=new Date();
  const hh=String(now.getHours()).padStart(2,'0');
  const mm=String(now.getMinutes()).padStart(2,'0');
  document.getElementById('us-clock').textContent=hh+':'+mm;
  const weekdays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const isWeekend=now.getDay()===0||now.getDay()===6;
  document.getElementById('us-date').textContent=`${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日 ${weekdays[now.getDay()]}`;
  const h=now.getHours();
  let msg='';
  if(h>=0&&h<6) msg='夜深了，早点休息';
  else if(h<9) msg='早安，新的一天';
  else if(h<12) msg='上午好';
  else if(h<14) msg='中午了，记得吃饭';
  else if(h<18) msg='下午好';
  else if(h<22) msg='晚上好';
  else msg='夜深了，早点休息';
  if(isWeekend) msg+=' -- 周末快乐';
  document.getElementById('us-time-msg').textContent=msg;
}
setInterval(()=>{
  const page=document.getElementById('page-us');
  if(page&&page.classList.contains('active')) updateUsClock();
},30000);

try{localStorage.removeItem('candyJarNight');}catch(e){}
// ===== CUSTOM LOOK 自定义外观 =====
// 设置存 localStorage('candyJarLook')，方案存 'candyJarLookSchemes'，壁纸图片存 IndexedDB('candyJarLook')
const LK_KEY='candyJarLook', LK_SCHEMES='candyJarLookSchemes';
const LK_P='html body.cl-on ';
const LK_GROUPS=[
  {id:'card',name:'卡片',sel:'.card,.candy-option:not(.selected),.note-option,.series-item:not(.empty),.timeline-item,.view-filter-btn:not(.selected),.period-toggle,.mood-section,.mood-face:not(.selected),.reading-section,.book-item,.note-content,.milestone,.capsule-item,.abebe-page-bg,.abebe-action,.meow-item,.pb-tl-card,.chat-option-btn,.shop-item,.snack-book-item,.weather-card,.dex-cell,.capsule-add-form,.us-settings-fab'},
  {id:'topbar',name:'顶栏',sel:'.topbar'},
  {id:'nav',name:'底部导航',sel:'.nav'},
  {id:'popup',name:'弹窗',sel:'.overlay,.cv-win,.story-mask,.day-popup,.card-menu-popup,.confirm-box,.edit-box,.delete-confirm,.pb-menu-popup,.snack-confirm,.weather-city-box,.settings-drawer,.dex-pop,.game-box,.mem-box'},
  {id:'btn',name:'按钮',sel:'.step-btn:not(:disabled),.add-confirm,.confirm-delete,.edit-save,.delete-confirm-btns .confirm,.shop-feed-btn,.snack-confirm-btns .confirm,.weather-city-btn-ok'},
  {id:'input',name:'输入框',sel:'.add-input,.add-input-sm,.edit-box textarea,.edit-box input[type="text"],.edit-box input[type="date"],.capsule-add-form textarea,.capsule-add-form input[type="date"],.weather-city-input,.write-textarea'}
];
const LK_TEXTS=[
  {id:'main',name:'正文字'},
  {id:'sub',name:'浅色小字'},
  {id:'btntext',name:'按钮上的字'}
];
const LK_LINES=[
  {id:'line',name:'边框线'},
  {id:'accent',name:'点缀色'},
  {id:'accenttext',name:'点缀字'},
  {id:'shadow',name:'卡片阴影'},
  {id:'soft',name:'淡底色'},
  {id:'bubble',name:'阿贝贝说话'},
  {id:'bubbletext',name:'阿贝贝说话的字'},
  {id:'track',name:'阿贝贝进度条'}
];
let lkLook=lkLoad();
let lkWpUrl=null;

function lkLoad(){try{const v=JSON.parse(localStorage.getItem(LK_KEY)||'null');if(v&&typeof v==='object')return lkNorm(v);}catch(e){}return lkNorm({});}
function lkNorm(v){return {bg:v.bg||null,wp:v.wp||null,wpA:(typeof v.wpA==='number')?v.wpA:1,blur:(typeof v.blur==='number')?v.blur:0,pw:Object.assign({},v.pw||{}),g:Object.assign({},v.g||{}),t:Object.assign({},v.t||{})};}
function lkSave(){try{localStorage.setItem(LK_KEY,JSON.stringify(lkLook));}catch(e){lkMsg('存不下了，手机空间可能满了');}}
function lkSchemes(){try{const v=JSON.parse(localStorage.getItem(LK_SCHEMES)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}}
function lkSetSchemes(list){try{localStorage.setItem(LK_SCHEMES,JSON.stringify(list));}catch(e){lkMsg('方案存不下了');}}
function lkIsEmpty(l){return !l.bg&&!l.wp&&!l.blur&&!Object.keys(l.pw).length&&!Object.keys(l.g).length&&!Object.keys(l.t).length;}
const LK_PAGES=[{id:'sweets',name:'糖罐子'},{id:'diary',name:'日历'},{id:'books',name:'读书'},{id:'abebe',name:'阿贝贝'},{id:'us',name:'Bond'}];
function lkCurPage(){const a=document.querySelector('.page.active');return a?a.id.replace('page-',''):'sweets';}
function lkCurWp(){return lkLook.pw[lkCurPage()]||lkLook.wp||null;}

function lkRgba(o){const h=o.c.replace('#','');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return `rgba(${r},${g},${b},${Math.round(o.a*100)/100})`;}
let lkCtx=null;
function lkParse(str){
  if(!lkCtx)lkCtx=document.createElement('canvas').getContext('2d');
  lkCtx.fillStyle='#000000';lkCtx.fillStyle=(str||'').trim()||'#000000';
  const v=lkCtx.fillStyle;
  if(v[0]==='#')return {c:v.toLowerCase(),a:1};
  const m=v.match(/rgba?\(([^)]+)\)/);if(!m)return {c:'#000000',a:1};
  const p=m[1].split(',').map(x=>parseFloat(x));
  return {c:'#'+p.slice(0,3).map(x=>Math.round(x).toString(16).padStart(2,'0')).join(''),a:p.length>3?p[3]:1};
}

// 生成覆盖样式
function lkApply(){
  let st=document.getElementById('cl-style');
  if(!st){st=document.createElement('style');st.id='cl-style';document.head.appendChild(st);}
  const L=lkLook;let css='';
  if(L.bg)css+=`html body.cl-on{background:${lkRgba({c:L.bg,a:1})}!important}`;
  LK_GROUPS.forEach(gr=>{
    const o=L.g[gr.id];if(!o)return;
    const sel=gr.sel.split(',').map(s=>LK_P+s.trim()).join(',');
    css+=`${sel}{background:${lkRgba(o)}!important}`;
    if(gr.id==='topbar')css+=`${sel}{border-color:transparent!important}`;
    if(L.blur>0&&o.a<0.99&&['card','topbar','nav','popup'].includes(gr.id))css+=`${sel}{-webkit-backdrop-filter:blur(${L.blur}px)!important;backdrop-filter:blur(${L.blur}px)!important}`;
  });
  const vars=[];
  if(L.t.main)vars.push(`--text-primary:${lkRgba(L.t.main)}!important`);
  if(L.t.sub){vars.push(`--text-secondary:${lkRgba(L.t.sub)}!important`);vars.push(`--text-muted:${lkRgba({c:L.t.sub.c,a:L.t.sub.a*0.75})}!important`);}
  if(L.t.line)vars.push(`--border-light:${lkRgba(L.t.line)}!important`);
  if(L.t.accent){vars.push(`--pink-400:${lkRgba(L.t.accent)}!important`);vars.push(`--pink-500:${lkRgba(L.t.accent)}!important`);}
  if(vars.length)css+=`html body.cl-on{${vars.join(';')}}`;
  const P=a=>a.split(',').map(x=>LK_P+x.trim()).join(',');
  if(L.t.line)css+=`${P('.mood-face:not(.selected),.abebe-action:not(.done),.add-book-btn,.dex-tab:not(.on)')}{border-color:${lkRgba(L.t.line)}!important}`;
  if(L.t.soft){const c=lkRgba(L.t.soft);css+=`${P('.cal-day.has-mood,.dex-tab.on,.mood-face.selected,.abebe-action:active,.view-filter-btn.selected')}{background:${c}!important}${P('.book-cover')}{background:${c}!important}`;}
  if(L.t.accenttext)css+=`${P('.nav-item.active .nav-label,.view-filter-btn.selected,.cal-day.weekend')}{color:${lkRgba(L.t.accenttext)}!important}`;
  if(L.t.bubbletext)css+=`${P('.abebe-speech')}{color:${lkRgba(L.t.bubbletext)}!important}`;
  if(L.t.bubble)css+=`${P('.abebe-speech,.abebe-speech::after')}{background:${lkRgba(L.t.bubble)}!important}`;
  if(L.t.track)css+=`${P('.abebe-status-track')}{background:linear-gradient(90deg,${lkRgba({c:L.t.track.c,a:L.t.track.a*0.15})},${lkRgba({c:L.t.track.c,a:L.t.track.a*0.55})},${lkRgba(L.t.track)})!important}`;
  if(L.t.shadow){
    const sel=LK_GROUPS.find(g=>g.id==='card').sel.split(',').concat(['.nav']).map(s=>LK_P+s.trim()).join(',');
    const sh=L.t.shadow.a<0.01?'none':`0 4px 20px ${lkRgba(L.t.shadow)},0 1px 4px ${lkRgba({c:L.t.shadow.c,a:L.t.shadow.a*0.6})}`;
    css+=`${sel}{box-shadow:${sh}!important}`;
  }
  if(L.t.btntext){
    const sel=LK_GROUPS.find(g=>g.id==='btn').sel.split(',').map(s=>LK_P+s.trim()).join(',');
    css+=`${sel}{color:${lkRgba(L.t.btntext)}!important}`;
  }
  st.textContent=css;
  document.body.classList.toggle('cl-on',!lkIsEmpty(L));
  lkApplyWp();
  lkThemeColor();
}
// 顶上状态栏颜色：有壁纸就取壁纸最上边的颜色（按浓淡和底色混合），只改底色就用底色
const LK_THEME_COLORS={'theme-claude':'#0D0D14','theme-water':'#E4EDE8','theme-cream':'#CFD9E6','theme-grape':'#B6A9C8','':'#FFF8FA'};
let lkTopColors={};try{lkTopColors=JSON.parse(localStorage.getItem('candyJarTopColors')||'{}')||{};}catch(e){}
function lkThemeColor(){
  let mc=document.querySelector('meta[name="theme-color"]');
  if(!mc){mc=document.createElement('meta');mc.name='theme-color';document.head.appendChild(mc);}
  const theme=localStorage.getItem('candyJarTheme')||'';
  const base=lkLook.bg||LK_THEME_COLORS[theme]||'#FFF8FA';
  let out=lkLook.bg||null;
  const cw=lkCurWp();
  if(cw&&lkTopColors[cw]){
    const a=lkLook.wpA,w=lkTopColors[cw],bb=lkParse(base).c;
    const mix=i=>Math.round(parseInt(w.slice(1+i*2,3+i*2),16)*a+parseInt(bb.slice(1+i*2,3+i*2),16)*(1-a));
    out='#'+[0,1,2].map(i=>mix(i).toString(16).padStart(2,'0')).join('');
  }
  mc.content=out||LK_THEME_COLORS[theme]||'#FFF8FA';
  try{localStorage.setItem('candyJarLastTop',mc.content);}catch(e){}
}
function lkSampleTop(url,id){
  const img=new Image();
  img.onload=()=>{
    try{
      const W=48,H=Math.max(1,Math.round(img.naturalHeight*W/img.naturalWidth));
      const cv=document.createElement('canvas');cv.width=W;cv.height=H;
      const cx=cv.getContext('2d');cx.drawImage(img,0,0,W,H);
      const rows=Math.max(1,Math.round(H*0.02));
      const d=cx.getImageData(0,0,W,rows).data;let r=0,g=0,b=0,n=0;
      for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
      lkTopColors[id]='#'+[r,g,b].map(x=>Math.round(x/n).toString(16).padStart(2,'0')).join('');
      try{localStorage.setItem('candyJarTopColors',JSON.stringify(lkTopColors));}catch(e){}
      lkThemeColor();
    }catch(e){}
  };
  img.src=url;
}

// ---- 壁纸 (IndexedDB) ----
function lkDB(){return new Promise((res,rej)=>{const r=indexedDB.open('candyJarLook',1);r.onupgradeneeded=()=>r.result.createObjectStore('wp');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function lkIdb(mode,fn){const db=await lkDB();return new Promise((res,rej)=>{const tx=db.transaction('wp',mode);const req=fn(tx.objectStore('wp'));tx.oncomplete=()=>res(req?req.result:undefined);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});}
let lkWpShownId=null;
async function lkApplyWp(){
  let el=document.getElementById('cl-wallpaper');
  if(!el){el=document.createElement('div');el.id='cl-wallpaper';document.body.insertBefore(el,document.body.firstChild);}
  const id=lkCurWp();
  el.style.opacity=lkLook.wpA;
  if(!id){el.style.display='none';el.style.backgroundImage='';if(lkWpUrl){URL.revokeObjectURL(lkWpUrl);lkWpUrl=null;}lkWpShownId=null;return;}
  if(lkWpShownId===id&&lkWpUrl){el.style.display='block';lkThemeColor();return;}
  try{
    const blob=await lkIdb('readonly',s=>s.get(id));
    if(!blob||lkCurWp()!==id)return;
    if(lkWpUrl)URL.revokeObjectURL(lkWpUrl);
    lkWpUrl=URL.createObjectURL(blob);lkWpShownId=id;
    el.style.backgroundImage=`url("${lkWpUrl}")`;el.style.display='block';
    if(!lkTopColors[id])lkSampleTop(lkWpUrl,id);
    lkThemeColor();
  }catch(e){console.warn('wallpaper load fail',e);}
}
function lkCompress(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file);const img=new Image();
    img.onload=()=>{
      const max=1600;let w=img.naturalWidth,h=img.naturalHeight;
      const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
      const cv=document.createElement('canvas');cv.width=w;cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
      cv.toBlob(b=>b?res(b):rej(new Error('toBlob')),'image/jpeg',0.85);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('img'));};
    img.src=url;
  });
}
async function lkPickWp(ev,page){
  const f=ev.target.files&&ev.target.files[0];ev.target.value='';
  if(!f)return;
  lkMsg('壁纸处理中…');
  try{
    const blob=await lkCompress(f);
    const id='wp'+Date.now();
    await lkIdb('readwrite',s=>s.put(blob,id));
    if(page)lkLook.pw[page]=id;else lkLook.wp=id;
    lkSave();lkApply();lkGc();lkRender();lkMsg(page?'这一页的壁纸换好啦':'壁纸换好啦');
  }catch(e){console.warn(e);lkMsg('这张图没放进去，换一张试试');}
}
function lkRemoveWp(page){if(page)delete lkLook.pw[page];else lkLook.wp=null;lkSave();lkApply();lkGc();lkRender();}
async function lkGc(){
  try{
    const ids=l=>l?[l.wp,...Object.values(l.pw||{})]:[];
    const keep=new Set([...ids(lkLook),...lkSchemes().flatMap(s=>ids(s.look))].filter(Boolean));
    const keys=await lkIdb('readonly',s=>s.getAllKeys());
    const dead=(keys||[]).filter(k=>!keep.has(k));
    if(dead.length)await lkIdb('readwrite',s=>{dead.forEach(k=>s.delete(k));return null;});
  }catch(e){}
  lkRefreshBackup();
}

// ---- 默认值：读当前主题本来的样子 ----
function lkDefaults(){
  const b=document.body;const was=b.classList.contains('cl-on');b.classList.remove('cl-on');
  const cs=getComputedStyle(b);const v=n=>cs.getPropertyValue(n);
  const bgBase=lkParse(v('--bg-base'));
  const d={bg:bgBase.c,g:{},t:{}};
  d.g.card=lkParse(v('--bg-card'));
  const tb=document.querySelector('.topbar');const tbc=tb?lkParse(getComputedStyle(tb).backgroundColor):{c:bgBase.c,a:0};
  d.g.topbar=tbc.a===0?{c:bgBase.c,a:0}:tbc;
  const nv=document.querySelector('.nav');d.g.nav=nv?lkParse(getComputedStyle(nv).backgroundColor):d.g.card;
  d.g.popup=lkParse(v('--overlay-bg')||'rgba(255,248,250,0.97)');
  d.g.btn=lkParse(v('--pink-400'));
  d.g.input=lkParse(v('--bg-card'));
  d.t.main=lkParse(v('--text-primary'));d.t.sub=lkParse(v('--text-secondary'));d.t.btntext={c:'#ffffff',a:1};
  d.t.line=lkParse(v('--border-light'));d.t.accent=lkParse(v('--pink-400'));d.t.shadow=lkParse(v('--shadow-pink')||'rgba(232,160,191,0.12)');
  d.t.soft=lkParse(v('--pink-100'));
  const sp=document.getElementById('abebe-speech');d.t.bubble=sp?lkParse(getComputedStyle(sp).backgroundColor):lkParse('#F2AFC1');if(d.t.bubble.a===0)d.t.bubble=lkParse('#F2AFC1');
  d.t.track=lkParse(v('--pink-500'));
  d.t.accenttext=lkParse(v('--pink-500'));
  d.t.bubbletext=sp?lkParse(getComputedStyle(sp).color):{c:'#ffffff',a:1};
  if(was)b.classList.add('cl-on');
  return d;
}

// ---- 编辑面板 ----
let lkDef=null;
function lkMsg(t){const m=document.getElementById('lk-msg');if(!m)return;m.textContent=t||'';clearTimeout(lkMsg._t);if(t)lkMsg._t=setTimeout(()=>{m.textContent='';},2600);}
function openLookEditor(){
  if(typeof closeSettingsDrawer==='function')closeSettingsDrawer();
  lkDef=lkDefaults();
  const sh=document.getElementById('lk-sheet');sh.classList.remove('mini');
  lkRender();
  requestAnimationFrame(()=>sh.classList.add('show'));
}
function closeLookEditor(){document.getElementById('lk-sheet').classList.remove('show','mini');}
function lkToggleMini(){const sh=document.getElementById('lk-sheet');sh.classList.toggle('mini');document.getElementById('lk-mini-btn').textContent=sh.classList.contains('mini')?'展开':'收起';}

function lkRowHtml(kind,id,name,cur,def){
  const o=cur||def;const on=!!cur;const pct=Math.round(o.a*100);
  return `<div class="lk-row" data-kind="${kind}" data-id="${id}">
    <div class="lk-name${on?'':' off'}">${name}</div>
    <input type="color" class="lk-color" value="${o.c}" oninput="lkSet('${kind}','${id}','c',this.value)">
    <input type="range" class="lk-range" min="0" max="100" value="${pct}" oninput="lkSet('${kind}','${id}','a',this.value)">
    <div class="lk-pct">${pct}%</div>
    <div class="lk-undo${on?' on':''}" onclick="lkUnset('${kind}','${id}')" title="跟随主题">↺</div>
  </div>`;
}
function lkRender(){
  const body=document.getElementById('lk-body');if(!body)return;
  if(!lkDef)lkDef=lkDefaults();
  const L=lkLook,D=lkDef;
  const sch=lkSchemes();
  let h=`<div class="lk-sec">我的方案</div><div class="lk-schemes">`;
  h+=sch.length?sch.map((s,i)=>`<div class="lk-chip" onclick="lkUseScheme(${i})"><span>${lkEsc(s.name)}</span><span class="lk-chip-x" onclick="event.stopPropagation();lkAskDelScheme(${i})">×</span></div>`).join(''):`<div class="lk-empty">还没有，调好了可以存一套</div>`;
  h+=`</div><div class="lk-save-row"><input class="lk-input" id="lk-scheme-name" maxlength="12" placeholder="给这套起个名字"><button class="lk-btn main" style="flex:0 0 72px" onclick="lkSaveScheme()">存为方案</button></div><div id="lk-confirm-slot"></div>`;
  h+=`<div class="lk-sec">背景</div>`;
  h+=`<div class="lk-row"><div class="lk-name${L.bg?'':' off'}">底色</div><input type="color" class="lk-color" value="${L.bg||D.bg}" oninput="lkSetBg(this.value,this)"><div style="flex:1"></div><div class="lk-undo${L.bg?' on':''}" onclick="lkSetBg(null)">↺</div></div>`;
  h+=`<div class="lk-row"><div class="lk-name${L.wp?'':' off'}">总壁纸</div><div class="lk-wp-btns"><label class="lk-btn">${L.wp?'换一张':'上传图片'}<input type="file" accept="image/*" style="display:none" onchange="lkPickWp(event)"></label>${L.wp?'<div class="lk-btn" onclick="lkRemoveWp()">不要壁纸</div>':''}</div></div>`;
  const anyWp=L.wp||Object.keys(L.pw).length;
  if(anyWp)h+=`<div class="lk-row"><div class="lk-name">壁纸浓淡</div><input type="range" class="lk-range" min="0" max="100" value="${Math.round(L.wpA*100)}" oninput="lkSetWpA(this.value)"><div class="lk-pct" id="lk-wpa">${Math.round(L.wpA*100)}%</div><div class="lk-undo"></div></div>`;
  h+=`<div class="lk-row"><div class="lk-name${L.blur?'':' off'}">毛玻璃</div><input type="range" class="lk-range" min="0" max="20" value="${L.blur}" oninput="lkSetBlur(this.value)"><div class="lk-pct" id="lk-blur">${L.blur}</div><div class="lk-undo"></div></div>`;
  h+=`<div class="lk-hint">毛玻璃只对调成半透明的卡片、顶栏、导航、弹窗起作用</div>`;
  h+=`<div class="lk-sec">每页单独的壁纸 · 没设的用总壁纸</div>`;
  const cur=lkCurPage();
  LK_PAGES.forEach(pg=>{const has=!!L.pw[pg.id];
    h+=`<div class="lk-row"><div class="lk-name${has?'':' off'}">${pg.name}${pg.id===cur?' ·':''}</div><div class="lk-wp-btns"><label class="lk-btn">${has?'换一张':'上传'}<input type="file" accept="image/*" style="display:none" onchange="lkPickWp(event,'${pg.id}')"></label>${has?`<div class="lk-btn" onclick="lkRemoveWp('${pg.id}')">用总壁纸</div>`:''}</div></div>`;});
  h+=`<div class="lk-sec">板块底色 · 颜色和透明度</div>`;
  LK_GROUPS.forEach(g=>{h+=lkRowHtml('g',g.id,g.name,L.g[g.id],D.g[g.id]);});
  h+=`<div class="lk-sec">字</div>`;
  LK_TEXTS.forEach(t=>{h+=lkRowHtml('t',t.id,t.name,L.t[t.id],D.t[t.id]);});
  h+=`<div class="lk-sec">线和点缀</div>`;
  LK_LINES.forEach(t=>{h+=lkRowHtml('t',t.id,t.name,L.t[t.id],D.t[t.id]);});
  h+=`<div class="lk-hint">点缀色管今天的日期、小圆点这些；点缀字管选中的导航字、「全部」这类选中的字、周末日期；淡底色管有心情的日期、书的封面、图鉴选中的那栏；阴影透明度拉到0就是没有阴影</div>`;
  h+=`<div class="lk-msg" id="lk-msg"></div>`;
  h+=`<div class="lk-save-row" style="margin-top:4px"><div class="lk-btn" onclick="lkAskReset()">恢复原样</div><div class="lk-btn main" onclick="closeLookEditor()">完成</div></div>`;
  body.innerHTML=h;
}
function lkEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function lkSet(kind,id,field,val){
  const bag=kind==='g'?lkLook.g:lkLook.t;
  const def=(kind==='g'?lkDef.g:lkDef.t)[id];
  const o=bag[id]?Object.assign({},bag[id]):Object.assign({},def);
  if(field==='c')o.c=val;else o.a=Math.max(0,Math.min(1,Number(val)/100));
  bag[id]=o;
  const row=document.querySelector(`.lk-row[data-kind="${kind}"][data-id="${id}"]`);
  if(row){row.querySelector('.lk-name').classList.remove('off');row.querySelector('.lk-undo').classList.add('on');row.querySelector('.lk-pct').textContent=Math.round(o.a*100)+'%';}
  lkApply();lkSaveSoon();
}
function lkUnset(kind,id){delete (kind==='g'?lkLook.g:lkLook.t)[id];lkSave();lkApply();lkRender();}
function lkSetBg(v,el){lkLook.bg=v;lkApply();if(v===null){lkSave();lkRender();return;}lkSaveSoon();const r=el&&el.closest('.lk-row');if(r){r.querySelector('.lk-name').classList.remove('off');r.querySelector('.lk-undo').classList.add('on');}}
function lkSetWpA(v){lkLook.wpA=Math.max(0,Math.min(1,Number(v)/100));const el=document.getElementById('cl-wallpaper');if(el)el.style.opacity=lkLook.wpA;const p=document.getElementById('lk-wpa');if(p)p.textContent=Math.round(lkLook.wpA*100)+'%';lkThemeColor();lkSaveSoon();}
function lkSetBlur(v){lkLook.blur=Math.max(0,Math.min(20,Math.round(Number(v))));const p=document.getElementById('lk-blur');if(p){p.textContent=lkLook.blur;const n=p.parentElement.querySelector('.lk-name');if(n)n.classList.toggle('off',!lkLook.blur);}lkApply();lkSaveSoon();}
let lkSaveT=null;
function lkSaveSoon(){clearTimeout(lkSaveT);lkSaveT=setTimeout(()=>{lkSaveT=null;lkSave();},300);}
function lkFlush(){if(lkSaveT){clearTimeout(lkSaveT);lkSaveT=null;lkSave();}}
window.addEventListener('pagehide',lkFlush);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')lkFlush();});

function lkSaveScheme(){
  const inp=document.getElementById('lk-scheme-name');const name=(inp.value||'').trim();
  if(!name){lkMsg('先给这套起个名字');inp.focus();return;}
  if(lkIsEmpty(lkLook)){lkMsg('现在还是原样，先调一调再存');return;}
  const list=lkSchemes();const i=list.findIndex(s=>s.name===name);
  const item={name,look:JSON.parse(JSON.stringify(lkLook))};
  if(i>=0)list[i]=item;else list.push(item);
  lkSetSchemes(list);lkRender();lkMsg(i>=0?`「${name}」更新好了`:`存好了：「${name}」`);
}
function lkUseScheme(i){const s=lkSchemes()[i];if(!s)return;lkLook=lkNorm(JSON.parse(JSON.stringify(s.look)));lkSave();lkApply();lkRender();lkMsg(`换成「${s.name}」啦`);}
function lkConfirm(text,okLabel,fn){
  const slot=document.getElementById('lk-confirm-slot');if(!slot)return;
  slot.innerHTML=`<div class="lk-confirm">${text}<div class="lk-save-row"><div class="lk-btn" onclick="document.getElementById('lk-confirm-slot').innerHTML=''">算了</div><div class="lk-btn main" id="lk-confirm-ok">${okLabel}</div></div></div>`;
  document.getElementById('lk-confirm-ok').onclick=()=>{slot.innerHTML='';fn();};
  slot.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function lkAskDelScheme(i){const s=lkSchemes()[i];if(!s)return;lkConfirm(`删掉方案「${lkEsc(s.name)}」吗？`,'删掉',()=>{const l=lkSchemes();l.splice(i,1);lkSetSchemes(l);lkGc();lkRender();});}
function lkAskReset(){lkConfirm('回到主题原来的样子吗？<br>壁纸和调过的颜色都会清掉，存好的方案还在。','恢复',()=>{lkLook=lkNorm({});lkSave();lkApply();lkGc();lkRender();lkMsg('恢复好了');});}

lkApply();
// 切换页面时换成这一页的壁纸
(function(){const ob=new MutationObserver(()=>{if(lkLook.wp||Object.keys(lkLook.pw).length)lkApplyWp();});
  document.querySelectorAll('.page').forEach(pg=>ob.observe(pg,{attributes:true,attributeFilter:['class']}));})();
// ---- 备份：导出时带上外观、方案和壁纸 ----
let lkBackupWps={};
async function lkRefreshBackup(){
  try{
    const keys=await lkIdb('readonly',s=>s.getAllKeys())||[];const out={};
    for(const k of keys){
      const blob=await lkIdb('readonly',s=>s.get(k));if(!blob)continue;
      out[k]=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=()=>r(null);fr.readAsDataURL(blob);});
      if(!out[k])delete out[k];
    }
    lkBackupWps=out;
  }catch(e){}
}
function lkBackupData(){return {look:lkLook,schemes:lkSchemes(),wallpapers:lkBackupWps};}
async function lkRestoreBackup(d){
  if(!d||typeof d!=='object')return;
  if(d.wallpapers&&typeof d.wallpapers==='object'){
    for(const [k,url] of Object.entries(d.wallpapers)){
      try{const blob=await (await fetch(url)).blob();await lkIdb('readwrite',s=>s.put(blob,k));}catch(e){}
    }
  }
  try{if(d.look)localStorage.setItem(LK_KEY,JSON.stringify(lkNorm(d.look)));}catch(e){}
  try{if(Array.isArray(d.schemes))localStorage.setItem(LK_SCHEMES,JSON.stringify(d.schemes));}catch(e){}
}
setTimeout(lkRefreshBackup,3000);

// ===== SETTINGS DRAWER =====
function openSettingsDrawer(){
  document.getElementById('settings-mask').classList.add('show');
  document.getElementById('settings-drawer').classList.add('show');
  const t=localStorage.getItem('candyJarTheme')||'';
  document.querySelectorAll('.theme-dot').forEach(d=>{
    d.classList.toggle('active', (d.dataset.theme||'')===t);
  });
  const keyInput=document.getElementById('gb-api-key-input');
  if(keyInput){const saved=localStorage.getItem('gb_api_key')||'';keyInput.value=saved?'••••••••••••••••••••':'';}
}
function saveGBKey(){
  const val=document.getElementById('gb-api-key-input').value.trim();
  if(!val)return;
  if(val.startsWith('•'))return;
  localStorage.setItem('gb_api_key',val);
  document.getElementById('gb-api-key-input').value='••••••••••••••••••••';
  document.getElementById('gb-key-status').textContent='已保存 ✓';
  setTimeout(()=>{document.getElementById('gb-key-status').textContent='';},2000);
}
function closeSettingsDrawer(){
  document.getElementById('settings-mask').classList.remove('show');
  document.getElementById('settings-drawer').classList.remove('show');
}
function toggleSettingsBlock(name){
  const body=document.getElementById('settings-body-'+name);
  const arrow=document.getElementById('settings-arrow-'+name);
  if(!body) return;
  const open=body.classList.toggle('open');
  if(arrow) arrow.textContent=open?'⌄':'›';
}

// Weekend marking is now handled inside the main renderCalendar override
