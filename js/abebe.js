/* 阿贝贝主系统 */
// ===== ABEBE SYSTEM =====
// abebeLines：内容在 data/abebe-words.js


function randFrom(arr){return arr[Math.floor(Math.random()*arr.length)]}

// ===== ABEBE CORE STATE =====
let abebeState={mood:80,sleep:70,food:75,miss:90,clean:85};
let abebeSaidGoodnight=false;
let abebeSaidGoodmorning=false;
let abebeLastAction='';
let abebeSessionStart=Date.now();
let abebeLastVisit=Date.now()-3600000*2;
let abebeFedTime=Date.now()-3600000*3;
let abebeLastGroomTime=Date.now()-3600000*4;
let abebeConsecutiveEarlyDays=0;
let abebeVisitedThisSession=false;
let abebeChatCount=0;
let abebeChatDate='';

// ===== 1. MISS MECHANISM =====
function calcMiss(){
  const hrsAway=(Date.now()-abebeLastVisit)/3600000;
  if(hrsAway<1) return 95;
  if(hrsAway<4) return Math.max(60,95-hrsAway*8);
  if(hrsAway<8) return Math.max(30,60-(hrsAway-4)*7);
  return Math.max(5,30-(hrsAway-8)*3);
}
function getMissCategory(){
  const hrsAway=(Date.now()-abebeLastVisit)/3600000;
  if(hrsAway<1) return 'none';
  if(hrsAway<4) return 'light';
  if(hrsAway<8) return 'medium';
  return 'heavy';
}

// ===== 2. STATE DECAY =====
// ===== 小肚子 =====
// 存的是"上次记下时有多饱"和"那是什么时候"，现在有多饱按经过的时间算：
// 白天（7点到22点）每小时消化 6，晚上睡觉每小时只消化 3，所以早上醒来是有点饿
let abebeTummy=null; // {v:0-100, at:时间戳}
const TUMMY_DAY_RATE=6, TUMMY_NIGHT_RATE=3, TUMMY_HUNGRY=30, TUMMY_STARVING=10, TUMMY_MAX=100;
function tummyRateAt(t){const h=new Date(t).getHours();return (h>=22||h<7)?TUMMY_NIGHT_RATE:TUMMY_DAY_RATE;}
function getTummy(){
  if(!abebeTummy){
    // 第一次：从以前的"上次喂糖时间"接过来
    const hrs=(Date.now()-abebeFedTime)/3600000;
    abebeTummy={v:Math.max(20,Math.min(TUMMY_MAX,100-hrs*18)),at:Date.now()};
  }
  let v=abebeTummy.v, t=abebeTummy.at; const now=Date.now();
  let guard=0;
  while(t<now&&v>0&&guard++<200){
    const next=Math.min(now,(Math.floor(t/3600000)+1)*3600000);
    v-=tummyRateAt(t)*(next-t)/3600000;
    t=next;
  }
  return Math.max(0,Math.min(TUMMY_MAX,v));
}
function setTummy(v){abebeTummy={v:Math.max(0,Math.min(TUMMY_MAX+10,v)),at:Date.now()};}
function calcFood(){return getTummy();}
function calcSleep(){
  const h=new Date().getHours();
  if(abebeSaidGoodnight) return 95;
  // after goodmorning or during day: starts high, drops toward evening
  if(h>=6&&h<12) return 85;
  if(h>=12&&h<18) return 70;
  if(h>=18&&h<21) return 55;
  if(h>=21&&h<23) return 35;
  return 15; // late night, very sleepy
}
function calcMood(){
  // base random wobble
  const wobble=(Math.random()-0.5)*16;
  // influenced by other states
  const avgOthers=(abebeState.food+abebeState.sleep+abebeState.miss+abebeState.clean)/4;
  let base=65+wobble;
  if(avgOthers>70) base+=10;
  else if(avgOthers<40) base-=15;
  else if(avgOthers<25) base-=25;
  if(getTummy()<TUMMY_STARVING) base-=15;
  return Math.max(5,Math.min(100,Math.round(base)));
}
function calcClean(){
  const hrsSinceGroom=(Date.now()-abebeLastGroomTime)/3600000;
  return Math.max(10,100-hrsSinceGroom*6);
}
function updateAllStates(){
  abebeState.miss=Math.round(calcMiss());
  abebeState.food=Math.round(calcFood());
  abebeState.sleep=Math.round(calcSleep());
  abebeState.clean=Math.round(calcClean());
  abebeState.mood=calcMood();
}

// ===== 3. SEASONAL & HOLIDAY LINES =====
function getSeason(){
  const m=new Date().getMonth();
  if(m>=2&&m<=4) return 'spring';
  if(m>=5&&m<=7) return 'summer';
  if(m>=8&&m<=10) return 'autumn';
  return 'winter';
}
function getHoliday(){
  const now=new Date();
  const m=now.getMonth()+1,d=now.getDate();
  if(m===1&&d===1) return 'newyear';
  if(m===12&&d===25) return 'christmas';
  if(m===12&&d===31) return 'birthday_her';
  if(m===3&&d===14) return 'birthday_him';
  if(m===6&&d===18) return 'anniversary';
  if(m===10&&d===1) return 'national';
  // 端午 approximate (varies yearly, ~June)
  if(m===6&&d>=10&&d<=16) return 'duanwu';
  // 中秋 approximate (varies yearly, ~Sept)
  if(m===9&&d>=10&&d<=18) return 'midautumn';
  return null;
}
// seasonLines：内容在 data/abebe-words.js
// holidayLines：内容在 data/abebe-words.js

// ===== 4. DATA LINKAGE =====
function getDataLine(){
  if(getTodayCandies().length>=20&&Math.random()<0.3) return "罐子快要装不下了，阿贝贝在想要不要再找一个罐子";
  if(getTodayCandies().length>=10&&Math.random()<0.3) return "罐子里的糖越来越多了，阿贝贝偷偷数了一遍又一遍";
  if(getTodayCandies().length>=10&&Math.random()<0.2) return "阿贝贝觉得自己是世界上最富有的兔子，因为有这么多糖";
  if(getTodayCandies().length>=5&&Math.random()<0.25) return "阿贝贝趴在罐子边上看了一眼，糖果排得整整齐齐的";
  if(getTodayCandies().length>=5&&Math.random()<0.2) return "阿贝贝给每颗糖都取了名字，但她不告诉你叫什么";
  if(getTodayCandies().length>=3&&Math.random()<0.2) return "阿贝贝发现糖罐里的糖在排队，第三颗总是歪歪扭扭的";
  if(getTodayCandies().length>=1&&Math.random()<0.15) return "阿贝贝拿出最新的那颗糖看了看，又轻轻放回去了";
  if(getTodayCandies().length===0&&Math.random()<0.3) return "阿贝贝看了一眼空空的罐子，又看了一眼你";
  if(getTodayCandies().length===0&&Math.random()<0.2) return "阿贝贝对着空罐子叹了口气，但立刻又笑了：'没关系，人在就好'";
  return null;
}

// ===== 5. EASTER EGG SYSTEM =====
function checkEasterEgg(){
  const now=new Date();
  const h=now.getHours(),m=now.getMinutes();
  
  // 整点
  if(m===0&&Math.random()<0.8) return "刚好赶上整点。阿贝贝闭上眼睛，好像在许愿";
  
  // 重复数字时间 11:11, 22:22, 12:12 etc
  if(h===m&&Math.random()<0.7){
    return `${h}:${String(m).padStart(2,'0')}，好巧的时间。阿贝贝说这是幸运的信号`;
  }
  
  // 凌晨1-3点
  if(h>=1&&h<3) return "你怎么还不睡呀...阿贝贝揉着眼睛，但她说她陪你";
  
  // 周五晚上
  if(now.getDay()===5&&h>=18) return "周末到啦！阿贝贝在床上翻了个跟头庆祝";
  
  // 糖果数是质数
  if(getTodayCandies().length>1){
    const n=getTodayCandies().length;
    let isPrime=true;
    for(let i=2;i<=Math.sqrt(n);i++){if(n%i===0){isPrime=false;break;}}
    if(isPrime&&Math.random()<0.4) return `罐子里有${n}颗糖，${n}是质数诶。阿贝贝觉得这很酷`;
  }
  
  // 糖果整十
  if(getTodayCandies().length>0&&getTodayCandies().length%10===0&&Math.random()<0.6) return `${getTodayCandies().length}颗糖了！阿贝贝绕着罐子跑了一圈庆祝`;
  
  // 04:44 或其他有趣时间
  if(h===4&&m===44) return "4:44，阿贝贝说这个时间连影子都在打瞌睡";
  
  // 早上7:07
  if(h===7&&m===7) return "7:07，阿贝贝说七是她最喜欢的数字，因为像兔子的耳朵";
  
  // 周日下午
  if(now.getDay()===0&&h>=14&&h<18&&Math.random()<0.3) return "周日下午，阿贝贝说这是世界上最温柔的时间段";
  
  // 520时间
  if(h===5&&m===20) return "5:20，阿贝贝红着耳朵说了一句什么，但声音太小听不清";
  
  // 13:14
  if(h===13&&m===14) return "13:14，一生一世。阿贝贝把这四个数字用糖纸摆在了窗台上";
  
  // 下雨天（随机模拟）
  if(Math.random()<0.05) return "阿贝贝趴在窗边，好像听到了雨的声音，耳朵一动一动的";
  
  // 深夜偷偷做事
  if(h>=23&&Math.random()<0.3) return "阿贝贝以为你走了，正在偷偷给明天的自己写信";
  
  return null;
}

// ===== CATEGORY SELECTION (with all 5 systems) =====
function getAbebeLine(){
  const now=new Date();
  const h=now.getHours();
  
  // Priority 1: holiday
  const holiday=getHoliday();
  if(holiday&&holidayLines[holiday]&&Math.random()<0.6) return randFrom(holidayLines[holiday]);
  
  // Priority 1.5: 小肚子饿了就闹
  const tum=getTummy();
  if(tum<TUMMY_STARVING&&Math.random()<0.85) return randFrom(tummyLines.starving);
  if(tum<TUMMY_HUNGRY&&Math.random()<0.6) return randFrom(tummyLines.hungry);

  // Priority 2: easter egg
  const egg=checkEasterEgg();
  if(egg) return egg;
  
  // Priority 3: data linkage
  const dataLine=getDataLine();
  if(dataLine&&Math.random()<0.35) return dataLine;
  
  // Priority 4: miss-based lines
  const missLvl=getMissCategory();
  if(missLvl==='heavy') return randFrom(abebeLines.miss);
  if(missLvl==='medium'&&Math.random()<0.6) return randFrom(abebeLines.miss);
  if(missLvl==='light'&&Math.random()<0.3) return randFrom([
    "阿贝贝刚才在窗边坐了一会儿",
    "阿贝贝把你的位置留好了，桌上有两杯茶",
    "阿贝贝揉了揉眼睛，看到你回来了",
    "阿贝贝假装不在意，但尾巴出卖了她",
    "阿贝贝说'我才没有等你们呢'，但窝里多了一个给你的垫子",
    "阿贝贝抬头看了你一眼，轻轻嘟囔了一句'回来啦'",
    "阿贝贝的耳朵动了一下——她听到你的脚步声了",
    "阿贝贝假装在忙，但明显在偷看门口"
  ]);
  
  
  // Priority 5: time-based states
  if(h>=23||h<6){
    if(abebeSaidGoodnight) return randFrom(abebeLines.goodnight);
    return randFrom(abebeLines.sleepy);
  }
  if(h>=6&&h<10&&!abebeSaidGoodmorning) return randFrom(abebeLines.morning);
  
  // Priority 6: seasonal flavor (30% chance)
  const season=getSeason();
  if(seasonLines[season]&&Math.random()<0.3) return randFrom(seasonLines[season]);
  
  // Default: daily + visit mix
  if(!abebeVisitedThisSession){
    abebeVisitedThisSession=true;
    return randFrom(abebeLines.visit);
  }
  return randFrom(abebeLines.daily);
}

// ===== RENDER =====
function renderAbebeStatus(){
  const items=[
    {name:'兔兔心',val:abebeState.mood},
    {name:'睡觉觉',val:abebeState.sleep},
    {name:'吃饱饱',val:abebeState.food},
    {name:'想泥萌',val:abebeState.miss},
    {name:'洗香香',val:abebeState.clean}
  ];
  document.getElementById('abebe-status').innerHTML=items.map(it=>{
    const pos=Math.max(0,Math.min(100,it.val)); // 越往右越满
    return `<div class="abebe-status-row"><div class="abebe-status-name">${it.name}</div><div class="abebe-status-track"><div class="abebe-status-knob" style="left:${pos}%"></div></div></div>`;
  }).join('');
}

// Hidden button pool

function renderAbebeActions(){
  const h=new Date().getHours();
  
  let btns='';
  btns+=`<div class="abebe-action" onclick="abebeAction('poke')"><div class="abebe-action-text">戳一戳</div></div>`;
  btns+=`<div class="abebe-action" onclick="abebeAction('groom')"><div class="abebe-action-text">梳毛</div></div>`;
  btns+=`<div class="abebe-action" onclick="abebeAction('kiss')"><div class="abebe-action-text">亲亲</div></div>`;
  btns+=`<div class="abebe-action" onclick="abebeAction('daze')"><div class="abebe-action-text">发呆</div></div>`;
  // 聊天在左上角的消息图标里；两天以上没聊就冒小圆点
  const msgBtn=document.getElementById('abebe-msg-btn');
  if(msgBtn){
    const old=msgBtn.querySelector('.cv-dot'); if(old) old.remove();
    if(typeof cvUnreadDays==='function'&&cvUnreadDays()>=2) msgBtn.insertAdjacentHTML('beforeend','<span class="cv-dot"></span>');
  }
  if(h>=20||h<6) btns+=`<div class="abebe-action" onclick="abebeAction('goodnight')"><div class="abebe-action-text">哄睡觉</div></div>`;
  if(h>=5&&h<12) btns+=`<div class="abebe-action" onclick="abebeAction('goodmorning')"><div class="abebe-action-text">早安</div></div>`;
  
  
  document.getElementById('abebe-actions').innerHTML=btns;
}

// 饿了的时候，阿贝贝说的话优先变成闹饿（没饿就返回 null）
function tummyLineNow(chance){
  if(typeof getTummy!=='function') return null;
  const t=getTummy();
  if(t<TUMMY_STARVING&&Math.random()<(chance==null?1:Math.min(1,chance+0.2))) return randFrom(tummyLines.starving);
  if(t<TUMMY_HUNGRY&&Math.random()<(chance==null?1:chance)) return randFrom(tummyLines.hungry);
  return null;
}
function showBubble(text){
  const bubble=document.getElementById('abebe-speech');
  bubble.classList.remove('visible');
  bubble.textContent=text;
  setTimeout(()=>bubble.classList.add('visible'),50);
}
function enterAbebe(){
  updateAllStates();
  const visitLine=getLastVisitLine();
  const hungryLine=tummyLineNow();
  if(hungryLine){
    showBubble(hungryLine);
    abebeVisitedThisSession=true;
  }else if(visitLine&&!abebeVisitedThisSession){
    showBubble(visitLine);
    abebeVisitedThisSession=true;
  }else if(abebeLastAction){
    showBubble(randFrom(abebeLines[abebeLastAction]));
  }else{
    showBubble(getAbebeLine());
  }
  abebeLastAction='';
  abebeLastVisit=Date.now();
  saveApp();
  renderAbebeStatus();
  renderAbebeActions();
  startIdleChatter();
  if(typeof renderCoinDisplay==='function') renderCoinDisplay();
  if(typeof checkDreamBtn==='function') checkDreamBtn();
}

function abebeAction(type){
  if(type==='poke'){
    abebeLastAction='poked';
    abebeState.mood=Math.min(100,abebeState.mood+5);
  }else if(type==='feed'){
    const todayCandies=getTodayCandies();
    if(todayCandies.length===0) return;
    abebeLastAction='fed';
    abebeFedTime=Date.now();
    setTummy(Math.min(TUMMY_MAX,getTummy()+5));
    abebeState.food=Math.round(getTummy());
    abebeState.mood=Math.min(100,abebeState.mood+5);
  }else if(type==='groom'){
    abebeLastAction='groomed';
    abebeLastGroomTime=Date.now();
    abebeState.clean=Math.min(100,abebeState.clean+30);
    abebeState.mood=Math.min(100,abebeState.mood+5);
  }else if(type==='kiss'){
    abebeLastAction='kissed';
    abebeState.mood=Math.min(100,abebeState.mood+10);
    abebeState.miss=Math.min(100,abebeState.miss+10);
  }else if(type==='daze'){
    abebeLastAction='dazed';
    abebeState.mood=Math.min(100,abebeState.mood+3);
  }else if(type==='goodnight'){
    if(!abebeSaidGoodnight){
      abebeSaidGoodnight=true;
      abebeState.sleep=100;
    }
    abebeLastAction='goodnight';
  }else if(type==='goodmorning'){
    if(!abebeSaidGoodmorning){
      abebeSaidGoodmorning=true;
      abebeState.mood=Math.min(100,abebeState.mood+10);
    }
    abebeLastAction='goodmorning';
  }else{
    // Hidden button actions
    abebeLastAction=type;
    abebeState.mood=Math.min(100,abebeState.mood+5);
  }
  const lines=abebeLines[abebeLastAction]||abebeLines.hiddenDefault;
  showBubble((type!=='goodnight'&&tummyLineNow(0.5))||randFrom(lines));
  renderAbebeStatus();
  renderAbebeActions();
  saveApp();
}

// Auto-decay timer: update states every 10 min
setInterval(()=>{
  const page=document.getElementById('page-abebe');
  if(page&&page.classList.contains('active')){
    updateAllStates();
    renderAbebeStatus();
  }
},600000);
