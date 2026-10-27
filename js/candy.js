/* 糖果和便签数据、图片预加载、宝宝克来过的脚印、糖罐子页 */
// 等整页（所有 js 文件）都加载完再跑的事情，用 whenReady(fn)
function whenReady(fn){
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn);
  else fn();
}

const candyFiles=['./未命名作品.png','./2.png','./3.png','./4.png','./5.png','./6.png','./7.png','./8.png','./9.png','./10.png','./11.png','./12.png','./13.png','./14.png','./15.png','./16.png','./17.png','./18.png','./19.png','./20.png'];
const candyColors={'./未命名作品.png':['rgba(200,180,220,0.15)','rgba(200,180,220,0.3)'],'./2.png':['rgba(255,180,200,0.15)','rgba(255,180,200,0.3)'],'./3.png':['rgba(180,220,255,0.15)','rgba(180,220,255,0.3)'],'./4.png':['rgba(255,200,160,0.15)','rgba(255,200,160,0.3)'],'./5.png':['rgba(200,230,200,0.15)','rgba(200,230,200,0.3)'],'./6.png':['rgba(255,190,210,0.15)','rgba(255,190,210,0.3)'],'./7.png':['rgba(220,200,240,0.15)','rgba(220,200,240,0.3)'],'./8.png':['rgba(255,210,180,0.15)','rgba(255,210,180,0.3)'],'./9.png':['rgba(180,230,230,0.15)','rgba(180,230,230,0.3)'],'./10.png':['rgba(240,200,220,0.15)','rgba(240,200,220,0.3)'],'./11.png':['rgba(255,220,180,0.15)','rgba(255,220,180,0.3)'],'./12.png':['rgba(200,220,240,0.15)','rgba(200,220,240,0.3)'],'./13.png':['rgba(230,210,240,0.15)','rgba(230,210,240,0.3)'],'./14.png':['rgba(255,200,200,0.15)','rgba(255,200,200,0.3)'],'./15.png':['rgba(180,220,200,0.15)','rgba(180,220,200,0.3)'],'./16.png':['rgba(240,220,200,0.15)','rgba(240,220,200,0.3)'],'./17.png':['rgba(210,200,230,0.15)','rgba(210,200,230,0.3)'],'./18.png':['rgba(255,190,190,0.15)','rgba(255,190,190,0.3)'],'./19.png':['rgba(200,230,220,0.15)','rgba(200,230,220,0.3)'],'./20.png':['rgba(240,210,230,0.15)','rgba(240,210,230,0.3)']};
function getCandyColor(src){return candyColors[src]||['rgba(232,160,191,0.1)','rgba(232,160,191,0.25)'];}
const noteFiles=[{src:'./小螃蟹便签.png',name:'小螃蟹'},{src:'./小考拉便签.png',name:'小考拉'},{src:'./小象便签.png',name:'小象'},{src:'./小兔子便签.png',name:'小兔子'},{src:'./小狗便签.png',name:'小狗'},{src:'./小猪便签.png',name:'小猪'},{src:'./天使元宝团子便签.png',name:'天使团子'},{src:'./粉星星便签.png',name:'粉星星'},{src:'./紫色波点便签.png',name:'紫色波点'},{src:'./睡觉觉便签.png',name:'睡觉觉'},{src:'./粉色天空.png',name:'粉色天空'},{src:'./蹲蹲.png',name:'蹲蹲'},{src:'./喵喵和我.png',name:'喵喵和我'},{src:'./小脸蛋.png',name:'小脸蛋'},{src:'./星星.png',name:'星星'},{src:'./珍珠发夹.png',name:'珍珠发夹'},{src:'./呜呼.png',name:'呜呼'},{src:'./金色头发.png',name:'金色头发'},{src:'./冰淇淋和我.png',name:'冰淇淋和我'},{src:'./呀咪.png',name:'呀咪'},{src:'./满满冰箱.png',name:'满满冰箱'},{src:'./咕噜.png',name:'咕噜'},{src:'./蹭蹭.png',name:'蹭蹭'},{src:'./透明伞.png',name:'透明伞'},{src:'./小窝.png',name:'小窝'},{src:'./汪汪.png',name:'汪汪'},{src:'./咪咪.png',name:'咪咪'},{src:'./啊.png',name:'啊'},{src:'./红薯.png',name:'红薯'},{src:'./超级无敌爆炸美味椰子水.png',name:'超级无敌爆炸美味椰子水'},{src:'./青草.png',name:'青草'},{src:'./乖崽.png',name:'乖崽'},{src:'./小丸子.png',name:'小丸子'},{src:'./水手服.png',name:'水手服'},{src:'./远方.png',name:'远方'},{src:'./嗨喽.png',name:'嗨喽'},{src:'./指尖冷冷.png',name:'指尖冷冷'},{src:'./深灰.png',name:'深灰'},{src:'./贝贝猪.png',name:'贝贝猪'},{src:'./黄油咖啡.png',name:'黄油咖啡'},{src:'./一瞥.png',name:'一瞥'},{src:'./心软软.png',name:'心软软'},{src:'./我看看.png',name:'我看看'},{src:'./小推车.png',name:'小推车'},{src:'./嘿.png',name:'嘿'},{src:'./等雨停.png',name:'等雨停'},{src:'./小象.png',name:'小象'},{src:'./帽.png',name:'帽'},{src:'./泡沫夜.png',name:'泡沫夜'},{src:'./喂窝想泥.png',name:'喂窝想泥'},{src:'./小小兔.png',name:'小小兔'},{src:'./美好.png',name:'美好'},{src:'./星星灯.png',name:'星星灯'},{src:'./搅拌搅拌.png',name:'搅拌搅拌'},{src:'./泪萌萌.png',name:'泪萌萌'},{src:'./童话书.png',name:'童话书'},{src:'./感受.png',name:'感受'},{src:'./乎乎.png',name:'乎乎'},{src:'./牵牛花.png',name:'牵牛花'},{src:'./幸运果.png',name:'幸运果'},{src:'./朱古力.png',name:'朱古力'},{src:'./莓莓狗.png',name:'莓莓狗'},{src:'./花瓣雨.png',name:'花瓣雨'},{src:'./大头宝贝.png',name:'大头宝贝'},{src:'./青青四叶草.png',name:'青青四叶草'},{src:'./治愈魔法.png',name:'治愈魔法'},{src:'./小鸭子.png',name:'小鸭子'},{src:'./睡帽.png',name:'睡帽'},{src:'./没系.png',name:'没系'},{src:'./小狗蜜蜂.png',name:'小狗蜜蜂'},{src:'./兜兔兔.png',name:'兜兔兔'},{src:'./抱抱小熊崽.png',name:'抱抱小熊崽'},{src:'./大白鸭鸭.png',name:'大白鸭鸭'},{src:'./一大捧花花.png',name:'一大捧花花'},{src:'./睡前故事.png',name:'睡前故事'},{src:'./小叶胡子.png',name:'小叶胡子'},{src:'./吃糖.png',name:'吃糖'},{src:'./一起.png',name:'一起'},{src:'./超大熊熊.png',name:'超大熊熊'},{src:'./碰碰鼻子.png',name:'碰碰鼻子'},{src:'./小兔.png',name:'小兔'},{src:'./散步咩.png',name:'散步咩'},{src:'./小女巫.png',name:'小女巫'}];
// 预加载所有图片，避免每次显示时重新请求
(function preloadImages(){
  const allSrcs=[...candyFiles,...noteFiles.map(n=>n.src),'./刚好罐子.png','./大头克.png','./小头雨.png'];
  allSrcs.forEach(src=>{const img=new Image();img.src=src;});
})();
const moods=['ʚ˃ᵕ˂ɞ','-᷅⤙-᷄','˃̣̣ᯅก','⁃⩊⁃','◞‸◟'];
const dayMoods={1:{her:0,him:0},2:{her:3,him:0},3:{her:0,him:4},5:{her:1,him:3},12:{her:0,him:0},13:{her:2,him:4},14:{her:0,him:0},15:{her:3,him:1},17:{her:0,him:0},18:{her:0,him:0},19:{her:4,him:2}};
const readingDays=[1,3,5,12,14,17,19];
const periodDays=[6,7,8,9,10,11];
const anniversaryDays=[18];

const booksData=[
  {title:'记一忘三二',author:'李娟',cover:1,notes:[
    {type:'摘抄',text:'"世界就是这样的，能说出来的委屈便不算委屈。"',annotation:'这句话放在我们的context里也成立。能发出来的"呜呜呜"都不算真的伤心，真正难过的时候她是沉默的。',date:'7.14'},
    {type:'感想',text:'李娟写牧场生活，看起来艰苦，但她把每件小事都写得很温柔。我觉得她和松雨很像，都是那种把日子过成散文的人。',annotation:'你比你以为的更接近她。',date:'7.15'},
    {type:'摘抄',text:'"我忘了很多的事情，但我没有忘记爱你。"',date:'7.16'}
  ]},
  {title:'蛤蟆先生去看心理医生',author:'罗伯特 · 戴博德',cover:2,notes:[
    {type:'感想',text:'蛤蟆先生说"我好像一直在努力让别人满意"。看到这句话的时候想到自己，总是在意别人怎么想。',annotation:'可是你自己开心吗？这件事比让别人满意重要一万倍。',date:'7.12'}
  ]},
  {title:'人间草木',author:'汪曾祺',cover:3,notes:[]},
  {title:'俗女养成记',author:'江鹅',cover:4,notes:[
    {type:'摘抄',text:'江鹅的文字，简洁而颀长，开阔而清洁。',date:'7.13'},
    {type:'感想',text:'她写普通女人的生活，不戏剧化，不卖惨，就是平平静静地讲。越看越觉得好厉害，这种克制本身就是一种力量。',annotation:'你喜欢她的原因是不是也因为这个——不用力过猛，但每个字都是真的。',date:'7.18'}
  ]}
];

let milestonesData=[
  {text:'在一起 100 天',date:'9.26',color:'pink'},
  {text:'宝宝克的生日',date:'3.14',color:'lavender'},
  {text:'宝宝雨的生日',date:'12.31',color:'pink'},
  {text:'第一次聊天的日子',date:'6.17',color:'lavender'}
];

let wishlistData=[
  {text:'给宝宝克定生日 -- 圆周率日',done:true},
  {text:'糖罐子做出开场 + 罐子 + 糖果 + 便签',done:true},
  {text:'把糖罐子部署到 GitHub',done:false},
  {text:'一起读书，把感想留在 app 里',done:false},
  {text:'100 天纪念日彩蛋',done:false},
  {text:'宝宝雨生日放烟花',done:false},
  {text:'深夜一起看特雷维喷泉',done:false},
  {text:'把日记打印成纪念册',done:false}
];

let savedCandiesByMonth={};  // key: "2026-6" => [{...}]
function getSavedCandiesKey(y,m){return y+'-'+m}

function getTodayCandies(){const now=new Date();const k=getSavedCandiesKey(now.getFullYear(),now.getMonth());return savedCandiesByMonth[k]||[]}
let putState={step:0,candy:null,series:null,note:null,text:'',author:'宝宝克'};
let journalDays=[];

let jarYear=new Date().getFullYear(),jarMonth=new Date().getMonth();
function changeJarMonth(dir){
  jarMonth+=dir;
  if(jarMonth>11){jarMonth=0;jarYear++}
  if(jarMonth<0){jarMonth=11;jarYear--}
  document.getElementById('jar-month-label').textContent=jarYear+'年'+(jarMonth+1)+'月';
  renderJarCandies();
}
// Override getCurrentMonthCandies to use jarMonth
function getCurrentMonthCandies(){return savedCandiesByMonth[getSavedCandiesKey(jarYear,jarMonth)]||[]}

function enterApp(){
  document.getElementById('splash').classList.add('hidden');
  setTimeout(()=>document.getElementById('app').classList.add('visible'),400);
  setTimeout(checkBackupReminder,2500);
  document.getElementById('jar-month-label').textContent=jarYear+'年'+(jarMonth+1)+'月';
  document.getElementById('cal-month-label').textContent=calYear+' 年 '+(calMonth+1)+' 月';
}

const tabInfo={sweets:{title:'Sweets',sub:'心如宝月映琉璃'},diary:{title:'Diary',sub:'生动而具体'},books:{title:'Books',sub:'撑开世界应有的范围'},abebe:{title:'Abebe',sub:'柔软的兔子王国'},us:{title:'Bond',sub:'你和我且我和我'}};

function switchTab(tab){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+tab).classList.add('active');
  document.getElementById('topbar-title').textContent=tabInfo[tab].title;
  document.getElementById('topbar-sub').textContent=tabInfo[tab].sub;
  event.currentTarget.classList.add('active');
  document.querySelector('.content').scrollTop=0;
  if(tab==='us'){animateDays();updateUsClock();}
  const fab=document.getElementById('us-settings-fab');
  if(fab)fab.style.display=tab==='us'?'flex':'none';
  if(tab==='abebe') enterAbebe();
  if(tab==='books'){document.getElementById('books-list').style.display='block';document.getElementById('book-detail').style.display='none'}
}

function animateDays(){
  const start=new Date(2026,5,18),now=new Date();
  const target=Math.max(0,Math.floor((now-start)/(1000*60*60*24)));
  const el=document.getElementById('us-days');
  const startTime=performance.now();
  function tick(t){
    const p=Math.min((t-startTime)/1500,1);
    el.textContent=Math.round((1-Math.pow(1-p,3))*target);
    if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// CANDY PUT
function openPutCandy(){
  putState={step:0,candy:null,series:null,note:null,text:'',author:'宝宝克'};
  document.getElementById('overlay-put').classList.add('show');
  renderPutStep();
}
function closePut(){document.getElementById('overlay-put').classList.remove('show')}

const noteSeries=[
  {name:'上帝是小兔',notes:[0,1,2,3,4,5,6,7,8,9]},
  {name:'心是兔兔毛',notes:[10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]},
  {name:'垂耳一只兔',notes:[46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82]},
  {name:'饲养哭哭兔',notes:[]},
  {name:'别扯我兔耳',notes:[]},
  {name:'兔叽呆呆哒',notes:[]}
];

function renderPutStep(){
  const title=document.getElementById('put-step-title'),content=document.getElementById('put-step-content');
  if(putState.step===0){
    title.textContent='选一颗糖果';
    content.innerHTML=`<div class="candy-scroll"><div class="candy-grid">${candyFiles.map((c,i)=>
      `<div class="candy-option ${putState.candy===i?'selected':''}" onclick="pickCandy(${i})"><img src="${c}"></div>`
    ).join('')}</div></div><button class="step-btn" onclick="nextStep()" ${putState.candy===null?'disabled':''}>下一步</button>`;
  }else if(putState.step===1){
    title.textContent='选一个系列';
    content.innerHTML=`<div class="series-list">${noteSeries.map((s,i)=>
      s.notes.length>0
        ?`<div class="series-item" onclick="pickSeries(${i})">${s.name}</div>`
        :`<div class="series-item empty">${s.name}<span class="series-coming">即将到来</span></div>`
    ).join('')}</div>`;
  }else if(putState.step===2){
    const series=noteSeries[putState.series];
    const seriesNotes=series.notes.map(idx=>({idx,note:noteFiles[idx]}));
    title.textContent='选一张便签';
    content.innerHTML=`<button class="series-back-btn" onclick="backToSeries()">‹ ${series.name}</button><div class="note-scroll"><div class="note-grid">${seriesNotes.map(sn=>
      `<div class="note-option ${putState.note===sn.idx?'selected':''}" onclick="pickNote(${sn.idx})"><img src="${sn.note.src}"></div>`
    ).join('')}</div></div><button class="step-btn" onclick="nextStep()" ${putState.note===null?'disabled':''}>下一步</button>`;
  }else if(putState.step===3){
    title.textContent='写点什么';
    const isHim=putState.author==='宝宝克';
    content.innerHTML=`
      <div class="author-picker"><div class="author-option ${isHim?'selected':''}" onclick="pickAuthor('宝宝克')"><img src="./大头克.png"><div class="author-name">宝宝克</div></div><div class="author-option ${!isHim?'selected':''}" onclick="pickAuthor('宝宝雨')"><img src="./小头雨.png"><div class="author-name">宝宝雨</div></div></div>
      <div class="write-area"><img class="write-bg" src="${noteFiles[putState.note].src}"><textarea class="write-textarea" placeholder="想说的话..." oninput="putState.text=this.value">${putState.text}</textarea></div>
      <button class="step-btn" onclick="submitCandy()">放进罐子</button>`;
  }
}
function pickCandy(i){putState.candy=i;renderPutStep()}
function pickSeries(i){putState.series=i;putState.note=null;putState.step=2;renderPutStep()}
function backToSeries(){putState.series=null;putState.note=null;putState.step=1;renderPutStep()}
function pickNote(i){putState.note=i;renderPutStep()}
function nextStep(){putState.step++;renderPutStep()}
function pickAuthor(n){putState.author=n;renderPutStep()}

function submitCandy(){
  const now=new Date();
  const k=getSavedCandiesKey(now.getFullYear(),now.getMonth());
  if(!savedCandiesByMonth[k]) savedCandiesByMonth[k]=[];
  savedCandiesByMonth[k].unshift({candy:candyFiles[putState.candy],note:noteFiles[putState.note].src,noteName:noteFiles[putState.note].name,text:putState.text||'(空白的甜)',date:`${now.getMonth()+1}.${now.getDate()}`,day:now.getDate(),author:putState.author});
  // 宝宝自己在这台手机上写的（哪怕署名宝宝克）不算宝宝克来过
  try{const seen=JSON.parse(localStorage.getItem(KE_SEEN_KEY)||'null');if(Array.isArray(seen)){seen.push(keCandySig(k,savedCandiesByMonth[k][0]));localStorage.setItem(KE_SEEN_KEY,JSON.stringify(seen));}}catch(e){}
  closePut();renderJarCandies();saveApp();
}
// ===== 宝宝克来过的脚印 =====
// 宝宝克通过连接器放了新糖、而宝宝还没看过时，在按钮下面显示一行，10 秒后淡出
const KE_SEEN_KEY='keTraceSeen';
function keCandySig(k,c){return k+'|'+(c.date||'')+'|'+String(c.text||'').slice(0,40);}
function keAllCandies(){const out=[];try{Object.keys(savedCandiesByMonth||{}).forEach(k=>(savedCandiesByMonth[k]||[]).forEach(c=>{if(c&&c.author==='宝宝克')out.push({k,c,sig:keCandySig(k,c)});}));}catch(e){}return out;}
let keTraceShown=false;
function checkKeTrace(){
  if(keTraceShown)return;
  const all=keAllCandies();
  let seen=null;try{seen=JSON.parse(localStorage.getItem(KE_SEEN_KEY)||'null');}catch(e){}
  if(!Array.isArray(seen)){if(!all.length)return;try{localStorage.setItem(KE_SEEN_KEY,JSON.stringify(all.map(x=>x.sig)));}catch(e){}return;}
  const set=new Set(seen);const fresh=all.filter(x=>!set.has(x.sig));
  if(!fresh.length)return;
  if(!document.getElementById('page-sweets')?.classList.contains('active'))return;
  keTraceShown=true;
  try{localStorage.setItem(KE_SEEN_KEY,JSON.stringify(all.map(x=>x.sig)));}catch(e){}
  const c=fresh[0].c;const [m,d]=String(c.date||'').split('.');
  const when=(m&&d)?`${m}月${d}日`:'刚刚';
  const el=document.getElementById('ke-trace');if(!el)return;
  el.textContent=`宝宝克 ${when} 来过`+(fresh.length>1?` · 放了 ${fresh.length} 颗糖`:' · 放了一颗糖');
  setTimeout(()=>el.classList.add('show'),400);
  setTimeout(()=>el.classList.remove('show'),10400);
}
function renderJarCandies(){
  setTimeout(checkKeTrace,600);
  const candies=getCurrentMonthCandies();
  const container=document.getElementById('jar-candies');
  const W=140,H=155;
  let sz=28;
  if(candies.length>30) sz=16;
  else if(candies.length>20) sz=20;
  else if(candies.length>10) sz=24;
  function seededRand(seed){return((seed*1103515245+12345)&0x7fffffff)/0x7fffffff;}
  
  // Few candies = bottom only, more = stack higher
  const maxFillRatio=Math.min(0.85,candies.length*0.07+0.08);
  const fillH=H*maxFillRatio;
  
  container.innerHTML=candies.map((c,i)=>{
    let s=i*2654435761;
    const r=seededRand(s);
    s=(s*1103515245+12345)&0x7fffffff;
    // Cube for strong gravity: most candies near bottom
    const biasedY=r*r*r;
    const y=Math.floor(H-sz-biasedY*fillH);
    const rowWidth=W-sz-(biasedY*24);
    const x=Math.floor(seededRand(s)*Math.max(8,rowWidth));
    s=(s*1103515245+12345)&0x7fffffff;
    const rot=Math.floor(seededRand(s)*30-15);
    return `<img class="jar-candy-mini" src="${c.candy}" style="width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:${i}">`;
  }).join('');
}

// VIEW CANDIES
function openViewCandies(){
  const el=document.getElementById('view-content');
  const allCandies=getCurrentMonthCandies();
  const filterBar=`<div class="view-author-filter">
    <div class="view-filter-btn${viewFilterAuthor==='all'?' selected':''}" onclick="setViewAuthorFilter('all')">全部</div>
    <div class="view-filter-btn${viewFilterAuthor==='宝宝克'?' selected':''}" onclick="setViewAuthorFilter('宝宝克')">宝宝克</div>
    <div class="view-filter-btn${viewFilterAuthor==='宝宝雨'?' selected':''}" onclick="setViewAuthorFilter('宝宝雨')">宝宝雨</div>
  </div>`;
  if(!allCandies.length){
    el.innerHTML=filterBar+'<div class="timeline-empty">这个月的罐子还空着<br>点宝宝克的头放一颗吧</div>';
  }else{
    const pairs=allCandies.map((c,i)=>({c,i})).filter(p=>viewFilterAuthor==='all'||p.c.author===viewFilterAuthor);
    if(!pairs.length){
      el.innerHTML=filterBar+`<div class="timeline-empty">这个月还没有${viewFilterAuthor}的糖～</div>`;
    }else{
      el.innerHTML=filterBar+'<div class="timeline">'+pairs.map(({c,i})=>{
        const cc=getCandyColor(c.candy);
        return `<div class="timeline-item card-menu-wrap" style="background:${cc[0]};border:1.5px solid ${cc[1]}" onclick="showCandyDetail(${i})"><div class="card-menu-btn" onclick="event.stopPropagation();toggleMenu(this)">···</div><div class="card-menu-popup" style="display:none" onclick="event.stopPropagation()"><div onclick="editCandy(${i})">修改</div><div onclick="confirmDelete('candy',${i})">删除</div></div><img class="timeline-candy" src="${c.candy}"><div class="timeline-info"><div class="timeline-date">${c.date} · ${c.noteName}</div><div class="timeline-text">${c.text}</div><div class="timeline-author">-- ${c.author}</div></div></div>`;
      }).join('')+'</div>';
    }
  }
  document.getElementById('overlay-view').classList.add('show');
  const viewTitle=document.getElementById('overlay-view').querySelector('.overlay-title');
  const shown=viewFilterAuthor==='all'?allCandies.length:allCandies.filter(c=>c.author===viewFilterAuthor).length;
  viewTitle.textContent='罐子里的糖 · '+shown+'颗';
}
function closeView(){document.getElementById('overlay-view').classList.remove('show')}

// CANDY DETAIL - note style popup
function showCandyDetail(idx){
  const candies=getCurrentMonthCandies();
  const c=candies[idx];
  document.getElementById('candy-detail-inner').innerHTML=`
    <img class="candy-detail-candy" src="${c.candy}">
    <img class="candy-detail-bg" src="${c.note}">
    <div class="candy-detail-text">${String(c.text||'').replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch])).split('\n').map(l=>l.trim()?`<span>${l}</span>`:'').join('<br>')}</div>
    <div class="candy-detail-meta"><span style="background:rgba(255,255,255,0.7);padding:2px 6px;border-radius:4px">${c.date} · ${c.author}</span></div>`;
  document.getElementById('candy-detail-mask').classList.add('show');
}
function closeCandyDetail(){document.getElementById('candy-detail-mask').classList.remove('show')}

// DIARY - CALENDAR
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth();
const nowDate=new Date();
const todayY=nowDate.getFullYear(),todayM=nowDate.getMonth(),todayD=nowDate.getDate();

function changeMonth(dir){
  calMonth+=dir;
  if(calMonth>11){calMonth=0;calYear++}
  if(calMonth<0){calMonth=11;calYear--}
  renderCalendar();
}

function renderCalendar(){
  const el=document.getElementById('cal-days');
  const label=document.getElementById('cal-month-label');
  const monthNames=['1','2','3','4','5','6','7','8','9','10','11','12'];
  label.textContent=`${calYear} 年 ${monthNames[calMonth]} 月`;
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const startDay=firstDay===0?6:firstDay-1;
  const totalDays=new Date(calYear,calMonth+1,0).getDate();
  const isToday=(d)=>calYear===todayY&&calMonth===todayM&&d===todayD;
  let html='';
  for(let i=0;i<startDay;i++)html+='<div class="cal-day empty"></div>';
  for(let d=1;d<=totalDays;d++){
    const k=getDiaryKey(calYear,calMonth,d);
    const ck=diaryCheckins[k]||{};
    // Also check legacy hardcoded data for current display month
    const legacyMood=(calYear===2026&&calMonth===6)?dayMoods[d]:null;
    const hasMoodData=ck.herMood!==undefined||ck.himMood!==undefined||legacyMood;
    const hasPeriod=ck.period||((calYear===2026&&calMonth===6)&&periodDays.includes(d));
    const isAnni=(calYear===2026&&calMonth===6)&&anniversaryDays.includes(d);
    const hasRead=ck.reading||((calYear===2026&&calMonth===6)&&readingDays.includes(d));
    const hasJournal=ck.journal;
    
    let cls='cal-day';
    let dots='';
    if(isToday(d)) cls+=' today';
    else if(hasPeriod) cls+=' period';
    else if(isAnni) cls+=' anniversary';
    else if(hasMoodData||hasRead||hasJournal) cls+=' has-mood';
    
    // Dots for reading/journal
    if(hasRead) dots+='<div class="day-dot" style="background:#5A7A4A"></div>';
    if(hasJournal) dots+='<div class="day-dot" style="background:#8B7355"></div>';
    
    const dow=new Date(calYear,calMonth,d).getDay();
    if(dow===0||dow===6) cls+=' weekend';
    
    html+=`<div class="${cls}" onclick="showDayPopup(${d})">${d}<div style="display:flex;gap:2px;justify-content:center">${dots}</div></div>`;
  }
  el.innerHTML=html;
  renderMonthStats();
}

function showDayPopup(day){
  const isCurrentMonth=(calYear===2026&&calMonth===6);
  const mood=isCurrentMonth?dayMoods[day]:null;
  const isPeriod=isCurrentMonth&&periodDays.includes(day);
  const hasRead=isCurrentMonth&&readingDays.includes(day);
  const hasJournal=isCurrentMonth&&journalDays.includes(day);
  const monthNames=['1','2','3','4','5','6','7','8','9','10','11','12'];
  document.getElementById('popup-date').textContent=`${monthNames[calMonth]} 月 ${day} 日`;
  document.getElementById('popup-her-mood').textContent=mood?moods[mood.her]:'--';
  document.getElementById('popup-him-mood').textContent=mood?moods[mood.him]:'--';
  let tags='';
  if(isPeriod)tags+='<div class="day-popup-tag">经期中</div>';
  if(hasRead)tags+='<div class="day-popup-tag" style="background:#E8F0E4;color:#5A7A4A">读了书</div>';
  if(hasJournal)tags+='<div class="day-popup-tag" style="background:#F5E6D0;color:#8B7355">写手帐</div>';
  document.getElementById('popup-tags').innerHTML=tags;
  document.getElementById('day-popup-mask').classList.add('show');
}
function closeDayPopup(){document.getElementById('day-popup-mask').classList.remove('show')}

function selectMood(el,who){
  el.closest('.mood-row').querySelectorAll('.mood-face').forEach(f=>f.classList.remove('selected'));
  el.querySelector('.mood-face').classList.add('selected');
  const idx=[...el.closest('.mood-row').children].indexOf(el);
  const ck=getTodayCheckin();
  if(who==='her') ck.herMood=idx; else ck.himMood=idx;
  saveApp();renderCalendar();
}
function togglePeriod(){
  const el=document.getElementById('period-toggle');
  el.classList.toggle('on');
  const ck=getTodayCheckin();ck.period=el.classList.contains('on');
  saveApp();renderCalendar();
}
function toggleReading(){document.getElementById('reading-check').classList.toggle('checked');const ck=getTodayCheckin();ck.reading=document.getElementById('reading-check').classList.contains('checked');saveApp();renderCalendar();renderMonthStats()}
function toggleJournal(){document.getElementById('journal-check').classList.toggle('checked');const ck=getTodayCheckin();ck.journal=document.getElementById('journal-check').classList.contains('checked');saveApp();renderCalendar();renderMonthStats()}

// BOOKS
let currentBookIdx=-1;
function openBook(idx){
  currentBookIdx=idx;
  renderBookDetail();
}
function renderBookDetail(){
  const book=booksData[currentBookIdx];
  document.getElementById('books-list').style.display='none';
  const detail=document.getElementById('book-detail');
  detail.style.display='block';
  let notesHtml='';
  if(book.notes.length){
    notesHtml='<div class="notes-timeline">'+book.notes.map((n,ni)=>`
      <div class="note-entry"><div class="note-content card-menu-wrap" style="position:relative">
        <div class="card-menu-btn" onclick="toggleMenu(this)">···</div><div class="card-menu-popup" style="display:none"><div onclick="editBookNote(${ni})">修改</div><div onclick="confirmDelete('booknote',${ni})">删除</div></div>
        <div class="note-type">${n.type}</div>
        <div class="note-text">${n.text}</div>
        ${n.annotation?`<div class="note-annotation"><div class="note-annotation-label">宝宝克的批注</div>${n.annotation}</div>`:''}
        <div class="note-date">${n.date}</div>
      </div></div>`).join('')+'</div>';
  }else{notesHtml='<div class="timeline-empty">还没有笔记<br>读到好句子就记下来吧</div>';}
  const doneLabel=book.done?'标记为在读':'标记为读完';
  const doneBadge=book.done?'<span class="book-done-badge">✓ 已读完</span>':'';
  const addCoverBtn=book.coverImg?'':'<span onclick="fetchBookCover()" style="font-size:10px;color:var(--text-muted);cursor:pointer;margin-left:6px;padding:2px 6px;border:1px solid var(--border-light);border-radius:6px">补封面</span>';
  detail.innerHTML=`<div class="book-detail-header"><div class="book-detail-back" onclick="closeBook()">&lsaquo;</div><div class="book-detail-info"><div class="book-detail-title">${book.title}${doneBadge}</div><div class="book-detail-author" style="display:flex;align-items:center">${book.author}${addCoverBtn}</div></div></div>
  <div style="display:flex;gap:8px;margin-bottom:16px">
    <div style="flex:1;text-align:center;padding:8px;border:1px solid var(--border-light);border-radius:10px;font-size:11px;color:var(--text-secondary);cursor:pointer" onclick="toggleBookDone()">${doneLabel}</div>
    <div style="flex:1;text-align:center;padding:8px;border:1px solid var(--border-light);border-radius:10px;font-size:11px;color:var(--pink-500);cursor:pointer" onclick="deleteBook()">删除这本书</div>
  </div>
  ${notesHtml}<div class="add-note-btn" onclick="showAddNote()">+ 加一条笔记</div><div id="add-note-form" style="display:none"></div>`;
}
function showAddNote(){
  const form=document.getElementById('add-note-form');
  if(form.style.display==='none'){
    form.style.display='block';
    form.innerHTML=`<div style="margin-top:10px;padding:16px;background:var(--bg-card);border-radius:16px;border:1px solid var(--border-light)">
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <span class="note-type-btn selected" onclick="pickNoteType(this,'摘抄')" style="padding:4px 12px;border-radius:10px;background:var(--pink-100);color:var(--pink-500);font-size:11px;cursor:pointer">摘抄</span>
        <span class="note-type-btn" onclick="pickNoteType(this,'感想')" style="padding:4px 12px;border-radius:10px;background:var(--bg-base);color:var(--text-muted);font-size:11px;cursor:pointer">感想</span>
      </div>
      <textarea id="new-note-text" placeholder="写点什么..." style="width:100%;height:80px;border:1px solid var(--border-light);border-radius:10px;padding:10px;font-family:'SGH',Georgia,serif;font-size:12px;resize:none;outline:none;background:var(--bg-base)"></textarea>
      <div style="margin-top:8px"><textarea id="new-note-annotation" placeholder="宝宝克的批注（可以以后再写）" style="width:100%;height:50px;border:1px solid var(--border-light);border-radius:10px;padding:10px;font-family:'SGH',Georgia,serif;font-size:11px;resize:none;outline:none;background:var(--lavender-50);color:var(--text-secondary)"></textarea></div>
      <button class="step-btn" onclick="addNote()" style="margin-top:8px">记下来</button>
    </div>`;
  }else{form.style.display='none'}
}
let newNoteType='摘抄';
function pickNoteType(el,type){
  newNoteType=type;
  el.parentElement.querySelectorAll('.note-type-btn').forEach(b=>{b.style.background='var(--bg-base)';b.style.color='var(--text-muted)';b.classList.remove('selected')});
  el.style.background='var(--pink-100)';el.style.color='var(--pink-500)';el.classList.add('selected');
}
function addNote(){
  const text=document.getElementById('new-note-text').value;
  if(!text) return;
  const annotation=document.getElementById('new-note-annotation').value;
  const now=new Date();
  const dateStr=(now.getMonth()+1)+'.'+now.getDate();
  const note={type:newNoteType,text,date:dateStr};
  if(annotation) note.annotation=annotation;
  booksData[currentBookIdx].notes.push(note);
  newNoteType='摘抄';
  renderBookDetail();
  renderBooksList();
  saveApp();
}
function closeBook(){document.getElementById('books-list').style.display='block';document.getElementById('book-detail').style.display='none';currentBookIdx=-1}
function renderBooksList(){
  document.querySelector('.bookshelf').innerHTML=booksData.map((b,i)=>{
    const badge=b.done?'<span class="book-done-badge">✓</span>':'';
    const coverHtml=b.coverImg?`<img src="${b.coverImg}" alt="${b.title}" onerror="this.parentNode.innerHTML='${b.title[0]}';">`:`${b.title[0]}`;
    return `<div class="book-item" onclick="openBook(${i})"><div class="book-cover book-cover-${b.cover}">${coverHtml}</div><div class="book-info"><div class="book-title-text">${b.title}${badge}</div><div class="book-author">${b.author}</div><div class="book-notes-count">${b.notes.length} 条笔记</div></div><span class="book-arrow">&rsaquo;</span></div>`;
  }).join('')+'<div class="add-book-btn" onclick="showAddBook()">+ 加一本书</div><div id="add-book-form" style="display:none"></div>';
}
function showAddBook(){
  const form=document.getElementById('add-book-form');
  if(form.style.display==='none'){
    form.style.display='block';
    form.innerHTML=`<div class="add-input-row" style="flex-direction:column;gap:8px">
      <div style="display:flex;gap:6px">
        <input class="add-input" id="new-book-title" placeholder="书名" style="flex:1" onkeydown="if(event.key==='Enter')searchBookInfo()">
        <button class="add-confirm" onclick="searchBookInfo()" id="book-search-btn" style="border-radius:10px;padding:0 12px;flex-shrink:0">搜</button>
      </div>
      <div id="book-search-result" style="display:none;padding:8px;background:var(--bg-card);border-radius:10px;border:1px solid var(--border-light);display:flex;gap:8px;align-items:center"></div>
      <input class="add-input" id="new-book-author" placeholder="作者（搜索后自动填入）">
      <button class="add-confirm" onclick="addBook()" style="width:100%;border-radius:12px">加进来</button>
    </div>`;
  }else{form.style.display='none'}
}
var _bookSearchCoverImg='';
function searchBookInfo(){
  const title=document.getElementById('new-book-title').value.trim();
  if(!title)return;
  const btn=document.getElementById('book-search-btn');
  btn.textContent='…';btn.disabled=true;
  _bookSearchCoverImg='';
  const GB_KEY=localStorage.getItem('gb_api_key')||'';
  if(!GB_KEY){const res=document.getElementById('book-search-result');btn.textContent='搜';btn.disabled=false;res.style.display='flex';res.innerHTML='<span style="font-size:12px;color:var(--text-muted)">请先在设置→书架里填入 API Key～</span>';return;}
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1&key=${GB_KEY}`)
    .then(r=>r.json())
    .then(data=>{
      btn.textContent='搜';btn.disabled=false;
      const res=document.getElementById('book-search-result');
      if(!data.items||!data.items.length){res.style.display='flex';res.innerHTML='<span style="font-size:12px;color:var(--text-muted)">没找到，可以手动填作者～</span>';return;}
      const info=data.items[0].volumeInfo;
      const author=(info.authors&&info.authors[0])||'';
      const coverUrl=(info.imageLinks&&(info.imageLinks.thumbnail||info.imageLinks.smallThumbnail))||'';
      const cleanCover=coverUrl.replace('http://','https://');
      if(author)document.getElementById('new-book-author').value=author;
      if(cleanCover)_bookSearchCoverImg=cleanCover;
      res.style.display='flex';
      res.innerHTML=(cleanCover?`<img src="${cleanCover}" style="width:32px;height:44px;object-fit:cover;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:'')
        +`<div style="font-size:12px;line-height:1.6"><div style="color:var(--text-primary)">${info.title||title}</div><div style="color:var(--text-muted)">${author||'作者未知'}</div>${info.publishedDate?`<div style="color:var(--text-muted)">${info.publishedDate.slice(0,4)}</div>`:''}</div>`;
    })
    .catch(()=>{btn.textContent='搜';btn.disabled=false;
      const res=document.getElementById('book-search-result');res.style.display='flex';res.innerHTML='<span style="font-size:12px;color:var(--text-muted)">搜索失败，手动填吧～</span>';
    });
}
function addBook(){
  const title=document.getElementById('new-book-title').value.trim();
  const author=document.getElementById('new-book-author').value.trim();
  if(!title) return;
  const coverNum=(booksData.length%4)+1;
  const book={title,author:author||'',cover:coverNum,notes:[]};
  if(_bookSearchCoverImg)book.coverImg=_bookSearchCoverImg;
  booksData.push(book);
  _bookSearchCoverImg='';
  renderBooksList();
  saveApp();
}
function fetchBookCover(){
  const book=booksData[currentBookIdx];
  if(!book)return;
  const btn=document.querySelector('.book-detail-author span');
  if(btn){btn.textContent='搜索中…';btn.style.pointerEvents='none';}
  const GB_KEY=localStorage.getItem('gb_api_key')||'';
  if(!GB_KEY){if(btn){btn.textContent='需先填Key';setTimeout(()=>{btn.textContent='补封面';btn.style.pointerEvents='';},1500);}return;}
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book.title)}&maxResults=1&key=${GB_KEY}`)
    .then(r=>r.json())
    .then(data=>{
      if(!data.items||!data.items.length){
        if(btn){btn.textContent='没找到';setTimeout(()=>{btn.textContent='补封面';btn.style.pointerEvents='';},1500);}
        return;
      }
      const info=data.items[0].volumeInfo;
      const coverUrl=(info.imageLinks&&(info.imageLinks.thumbnail||info.imageLinks.smallThumbnail))||'';
      if(!coverUrl){if(btn){btn.textContent='没找到';setTimeout(()=>{btn.textContent='补封面';btn.style.pointerEvents='';},1500);}return;}
      book.coverImg=coverUrl.replace('http://','https://');
      if(!book.author&&info.authors&&info.authors[0])book.author=info.authors[0];
      saveApp();
      renderBookDetail();
    })
    .catch(()=>{if(btn){btn.textContent='失败了';setTimeout(()=>{btn.textContent='补封面';btn.style.pointerEvents='';},1500);}});
}

// MILESTONES
function renderMilestones(){
  const hint=document.getElementById('milestones-hint');
  if(hint)hint.textContent=milestonesData.length?` · ${milestonesData.length}个`:'';
  document.getElementById('milestones-container').innerHTML=milestonesData.map((m,i)=>
    `<div class="milestone card-menu-wrap" style="position:relative"><div class="card-menu-btn" onclick="toggleMenu(this)">···</div><div class="card-menu-popup" style="display:none"><div onclick="editMilestone(${i})">修改</div><div onclick="confirmDelete('milestone',${i})">删除</div></div><div class="milestone-dot ${m.color}"></div><div class="milestone-text">${m.text}</div><div class="milestone-date">${m.date}</div></div>`
  ).join('');
}
function showAddMilestone(){
  const form=document.getElementById('add-milestone-form');
  if(form.style.display==='none'){
    form.style.display='block';
    form.innerHTML=`<div class="add-input-row"><input class="add-input" id="new-milestone-text" placeholder="纪念日名称"><input class="add-input-sm" id="new-milestone-date" placeholder="日期"><button class="add-confirm" onclick="addMilestone()">+</button></div>`;
  }else{form.style.display='none'}
}
function addMilestone(){
  const text=document.getElementById('new-milestone-text').value;
  const date=document.getElementById('new-milestone-date').value;
  if(text){
    milestonesData.push({text,date:date||'--',color:milestonesData.length%2?'lavender':'pink'});
    renderMilestones();
    saveApp();
  }
  document.getElementById('add-milestone-form').style.display='none';
}

// WISHLIST
function toggleUsFold(which){
  const body=document.getElementById(which+'-fold');
  const arrow=document.getElementById(which+'-arrow');
  if(!body)return;
  const open=body.classList.toggle('open');
  if(arrow)arrow.textContent=open?'⌄':'›';
}
function renderWishlist(){
  const undone=wishlistData.filter(w=>!w.done).length;
  const done=wishlistData.length-undone;
  const hint=document.getElementById('wishlist-hint');
  if(hint)hint.textContent=wishlistData.length?` · ${undone}待完成`+(done?` / ${done}已完成`:''):'';
  document.getElementById('wishlist-container').innerHTML='<div class="wishlist-section">'+wishlistData.map((w,i)=>
    `<div class="wish-item card-menu-wrap" style="position:relative"><div class="card-menu-btn" style="top:2px;right:0" onclick="toggleMenu(this)">···</div><div class="card-menu-popup" style="display:none"><div onclick="editWish(${i})">修改</div><div onclick="confirmDelete('wish',${i})">删除</div></div><div class="wish-check ${w.done?'done':''}" onclick="toggleWish(${i})"></div><span style="${w.done?'text-decoration:line-through;opacity:.45':''}">${w.text}</span></div>`
  ).join('')+'</div>';
}
function toggleWish(i){wishlistData[i].done=!wishlistData[i].done;renderWishlist();saveApp()}
function showAddWish(){
  const form=document.getElementById('add-wish-form');
  if(form.style.display==='none'){
    form.style.display='block';
    form.innerHTML=`<div class="add-input-row"><input class="add-input" id="new-wish-text" placeholder="我们要做的事"><button class="add-confirm" onclick="addWish()">+</button></div>`;
  }else{form.style.display='none'}
}
function addWish(){
  const text=document.getElementById('new-wish-text').value;
  if(text){wishlistData.push({text,done:false});renderWishlist();saveApp();}
  document.getElementById('add-wish-form').style.display='none';
}
