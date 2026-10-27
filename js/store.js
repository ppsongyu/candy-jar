/* Supabase 配置、全部数据的存和读 */
// ===== SUPABASE CONFIG =====
const SUPABASE_URL='https://cudtnnmnpxjwkarzxeex.supabase.co';
const SUPABASE_KEY='sb_publishable_WUglhS9LWCQ3b7s6qXLJgg_zn3muM5G';
async function supaUpsert(key,value){
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/candy_jar_data`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Prefer':'resolution=merge-duplicates'},body:JSON.stringify({key,value,updated_at:new Date().toISOString()})});
  }catch(e){}
}
async function supaGet(key){
  try{
    const ctrl=new AbortController();
    setTimeout(()=>ctrl.abort(),6000);
    const r=await fetch(`${SUPABASE_URL}/rest/v1/candy_jar_data?key=eq.${key}&select=value`,{headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY},signal:ctrl.signal});
    const d=await r.json();
    if(!r.ok) return undefined;
    return d&&d[0]?d[0].value:null;
  }catch(e){return undefined;}
}

// ===== FULL PERSISTENCE =====
// Don't save until loadApp has applied the stored data, otherwise an early tap
// writes the empty defaults over localStorage and the cloud copy.
let appLoaded=false;
// False when this phone had nothing saved and the cloud couldn't be reached:
// uploading then would replace the real cloud copy with empty defaults.
let appCloudSync=true;
// Ids of candies already taken in from claude_inbox (see claudeInboxSync).
let claudeSeen=[];
// Fortunes 宝宝克 wrote through the connector, keyed by YYYY-M-D; and what happened to its actions.
let claudeFortunes={};
let claudeLog=[];
function saveApp(){
  if(!appLoaded) return;
  const data={
    savedAt:Date.now(),
    savedCandiesByMonth,booksData,milestonesData,wishlistData,
    diaryCheckins:diaryCheckins||{},
    abebeFedTime,abebeLastGroomTime,abebeLastVisit:abebeLastVisit||Date.now(),
    fortuneDrawn,fortuneDate:new Date().toDateString(),
    abebeChatCount,abebeChatDate,
    todaysChatSlots,todaysChatSlotDate,recentChatHistory,
    abebeSaidGoodnight,abebeSaidGoodmorning,
    timeCapsules,claudeSeen,claudeFortunes,claudeLog
  };
  try{localStorage.setItem('candyJarData',JSON.stringify(data));}catch(e){}
  if(appCloudSync) supaUpsert('app_data',data);
  // Keep the secondary snack/game data in the same save entry instead of wrapping saveApp repeatedly.
  if(typeof snackData!=='undefined'){
    try{
      if(typeof candyGameData!=='undefined') snackData.candyGameData=candyGameData;
      if(typeof memGameData!=='undefined') snackData.memGameData=memGameData;
      snackData.savedAt=Date.now();
      localStorage.setItem('candyJarSnackData',JSON.stringify(snackData));
      if(appCloudSync) supaUpsert('snack_data',snackData);
    }catch(e){}
  }
}
function loadAppLocal(){
  try{const raw=localStorage.getItem('candyJarData');if(raw)return JSON.parse(raw);}catch(e){}
  return null;
}
async function loadApp(){
  let data=loadAppLocal();
  // Try supabase too
  try{
    const cloud=await supaGet('app_data');
    // Only trust the cloud copy over local when it was saved later. Older cloud
    // copies have no savedAt and may hold the empty defaults, so they never win.
    if(cloud===undefined&&!data) appCloudSync=false;
    if(cloud&&(!data||(cloud.savedAt||0)>(data.savedAt||0))) data=cloud;
  }catch(e){}
  appLoaded=true;
  if(!data) return;
  if(data.savedCandiesByMonth) savedCandiesByMonth=data.savedCandiesByMonth;
  if(data.booksData) booksData.splice(0,booksData.length,...data.booksData);
  if(data.milestonesData) milestonesData.splice(0,milestonesData.length,...data.milestonesData);
  if(data.wishlistData) wishlistData.splice(0,wishlistData.length,...data.wishlistData);
  if(data.diaryCheckins) diaryCheckins=data.diaryCheckins;
  if(data.abebeFedTime) abebeFedTime=data.abebeFedTime;
  if(data.abebeLastGroomTime) abebeLastGroomTime=data.abebeLastGroomTime;
  if(data.abebeLastVisit) abebeLastVisit=data.abebeLastVisit;
  if(data.abebeChatCount) abebeChatCount=data.abebeChatCount;
  if(data.abebeChatDate) abebeChatDate=data.abebeChatDate;
  if(data.todaysChatSlots) todaysChatSlots=data.todaysChatSlots;
  if(data.todaysChatSlotDate) todaysChatSlotDate=data.todaysChatSlotDate;
  if(data.recentChatHistory) recentChatHistory=data.recentChatHistory;
  if(data.abebeSaidGoodnight) abebeSaidGoodnight=data.abebeSaidGoodnight;
  if(data.abebeSaidGoodmorning) abebeSaidGoodmorning=data.abebeSaidGoodmorning;
  if(data.timeCapsules) timeCapsules=data.timeCapsules;
  if(data.claudeSeen) claudeSeen=data.claudeSeen;
  if(data.claudeFortunes) claudeFortunes=data.claudeFortunes;
  if(data.claudeLog) claudeLog=data.claudeLog;
  // Restore fortune state for today
  if(data.fortuneDrawn&&data.fortuneDate===new Date().toDateString()) fortuneDrawn=true;
  // Reset daily flags if new day
  const today=new Date().toDateString();
  if(abebeChatDate!==today){abebeChatCount=0;abebeChatDate=today;todaysChatSlots=[];todaysChatSlotDate='';abebeSaidGoodnight=false;abebeSaidGoodmorning=false;}
}

// 克劳德通过糖罐子连接器做的事先进 claude_inbox，糖罐子打开时在这里一件件做掉。
function getTodayFortune(seed){
  const d=new Date();
  const own=claudeFortunes[d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()];
  if(own) return {l:'兔兔心',m:own,s:'-- 宝宝克'};
  return fortunePool[seed%fortunePool.length];
}
// 克劳德引用原文常常少个引号、多个空格：先完全一样，再忽略空白标点，最后看包含关系；对上多个就不动。
function claudeNorm(s){return String(s==null?'':s).replace(/[\s\uFFFC\u200B-\u200D\uFEFF"'“”‘’「」『』《》〈〉.,，。!！?？:：;；、…·—~～\-()（）\[\]【】]/g,'');}
function claudeFind(list,key,want){
  const w=String(want==null?'':want),nw=claudeNorm(w);
  if(!nw) return -1;
  const tests=[k=>k===w,k=>claudeNorm(k)===nw,k=>nw.length>=4&&(claudeNorm(k).includes(nw)||nw.includes(claudeNorm(k)))];
  for(const t of tests){
    const hits=[];list.forEach((x,i)=>{if(t(key(x)))hits.push(i);});
    if(hits.length===1) return hits[0];
    if(hits.length>1) return -1;
  }
  return -1;
}
function claudeFindCandy(a){
  const list=savedCandiesByMonth[a.monthKey]||[];
  const idx=list.map((c,i)=>i).filter(i=>!a.date||list[i].date===a.date);
  const j=claudeFind(idx.map(i=>list[i]),c=>c.text,a.match);
  return j<0?-1:idx[j];
}
function claudeBook(title){const i=claudeFind(booksData,b=>b.title,title);return i<0?null:booksData[i];}
function claudeApply(a){
  const d=a.data||{};
  switch(a.type){
    case 'candy_add':{
      if(!savedCandiesByMonth[d.monthKey]) savedCandiesByMonth[d.monthKey]=[];
      savedCandiesByMonth[d.monthKey].unshift(d.candy);return '放了一颗糖';
    }
    case 'candy_edit':{
      const i=claudeFindCandy(d);if(i<0) return '没找到要改的糖';
      savedCandiesByMonth[d.monthKey][i].text=d.text;return '改了一颗糖';
    }
    case 'candy_delete':{
      const i=claudeFindCandy(d);if(i<0) return '没找到要删的糖';
      savedCandiesByMonth[d.monthKey].splice(i,1);return '删了一颗糖';
    }
    case 'checkin':{
      if(!diaryCheckins[d.dateKey]) diaryCheckins[d.dateKey]={};
      diaryCheckins[d.dateKey][d.field]=d.value;return '日记打卡';
    }
    case 'book_add':{
      if(booksData.some(b=>b.title===d.title)) return '书架上已经有这本书';
      booksData.push({title:d.title,author:d.author||'',cover:(booksData.length%4)+1,notes:[]});return '加了一本书';
    }
    case 'book_note':{
      const b=claudeBook(d.title);if(!b) return '没找到这本书';
      const n={type:d.noteType,text:d.text,date:d.date};if(d.annotation) n.annotation=d.annotation;
      b.notes.push(n);return '写了一条笔记';
    }
    case 'book_annotate':{
      const b=claudeBook(d.title);if(!b) return '没找到这本书';
      const ni=claudeFind(b.notes,n=>n.text,d.noteText);
      if(ni<0) return '没找到这条笔记：《'+b.title+'》「'+String(d.noteText||'').replace(/\s+/g,' ').slice(0,24)+'」';
      const n=b.notes[ni];
      n.annotation=d.annotation;return '写了批注';
    }
    case 'book_done':{
      const b=claudeBook(d.title);if(!b) return '没找到这本书';
      b.done=!!d.done;return '标了读完';
    }
    case 'wish_add':wishlistData.push({text:d.text,done:false});return '加了心愿';
    case 'wish_done':{
      const wi=claudeFind(wishlistData,w=>w.text,d.text);if(wi<0) return '没找到这个心愿';
      const w=wishlistData[wi];
      w.done=!!d.done;return '更新了心愿';
    }
    case 'wish_delete':{
      const i=claudeFind(wishlistData,w=>w.text,d.text);if(i<0) return '没找到这个心愿';
      wishlistData.splice(i,1);return '删了心愿';
    }
    case 'milestone_add':milestonesData.push({text:d.text,date:d.date||'--',color:milestonesData.length%2?'lavender':'pink'});return '加了纪念日';
    case 'milestone_delete':{
      const i=claudeFind(milestonesData,m=>m.text,d.text);if(i<0) return '没找到这个纪念日';
      milestonesData.splice(i,1);return '删了纪念日';
    }
    case 'capsule_add':timeCapsules.push({date:d.date,label:d.label||'',text:d.text});return '埋了时间胶囊';
    case 'fortune':claudeFortunes[d.dateKey]=d.text;return '写了今日一签';
    case 'pig_meal':{
      if(!pigBellyData[d.dateKey]) pigBellyData[d.dateKey]={};
      pigBellyData[d.dateKey][d.meal]={text:d.text};pbSaveData();return '记了猪肚记';
    }
    case 'abebe':{
      if(d.action==='feed') abebeFedTime=Date.now();
      else if(d.action==='groom') abebeLastGroomTime=Date.now();
      else if(d.action==='goodnight') abebeSaidGoodnight=true;
      else if(d.action==='goodmorning') abebeSaidGoodmorning=true;
      abebeLastAction={feed:'fed',groom:'groomed',kiss:'kissed',poke:'poked'}[d.action]||d.action;
      return '陪阿贝贝玩';
    }
    case 'snack_buy':{
      const snack=getAllSnacks().find(x=>x.id===d.id||x.name===d.id);if(!snack) return '小卖部没有这个零食';
      const price=getSeasonalPrice(snack);
      if(!checkTimeAllow(snack)) return '爸爸说现在不能买'+snack.name;
      if(!checkWeeklyLimit(snack)) return snack.name+'这周已经吃够啦';
      if(getSnackBalance()<price) return '阿贝贝币不够买'+snack.name;
      const id=snack.id;
      snackData.weeklySpent+=price;
      if(!snackData.weeklyBuyCount) snackData.weeklyBuyCount={};
      snackData.weeklyBuyCount[id]=(snackData.weeklyBuyCount[id]||0)+1;
      if(!snackData.stock) snackData.stock={};
      snackData.stock[id]=(snackData.stock[id]||0)+1;
      snackData.purchaseCount[id]=(snackData.purchaseCount[id]||0)+1;
      if(snackData.purchaseCount[id]===1) snackData.collection.push({id,name:snack.name,firstBought:new Date().toLocaleDateString('zh-CN')});
      return '买了'+snack.name;
    }
    case 'snack_feed':{
      const snack=getAllSnacks().find(x=>x.id===d.id||x.name===d.id);if(!snack) return '没有这个零食';
      if(!snackData.stock||!(snackData.stock[snack.id]>0)) return '货架上没有'+snack.name;
      if(!checkDailyFeed()) return '阿贝贝今天吃饱啦';
      snackData.stock[snack.id]--;snackData.dailyFeedCount++;return '喂了阿贝贝'+snack.name;
    }
  }
  return '不认识的事情';
}
// Bump when claudeApply's matching changes: items that failed with "没找到" under an older version get one more try.
const CLAUDE_APPLY_VER='2026-10-06e';
async function claudeInboxSync(){
  if(!appLoaded) return;
  const inbox=await supaGet('claude_inbox');
  if(!inbox||!Array.isArray(inbox.items)) return;
  const seen=new Set(claudeSeen);
  const lastLog={};claudeLog.forEach(l=>{lastLog[l.id]=l;});
  const retry=it=>{const l=lastLog[it.id];return l&&/^没找到/.test(l.result||'')&&l.ver!==CLAUDE_APPLY_VER;};
  const fresh=inbox.items.filter(it=>it&&it.id&&(!seen.has(it.id)||retry(it)));
  if(!fresh.length) return;
  fresh.forEach(it=>{
    // Items from the first connector version carry the candy directly.
    const a=it.type?it:{type:'candy_add',data:{monthKey:it.monthKey,candy:it.candy}};
    let result;
    try{result=claudeApply(a);}catch(e){result='出错了';}
    if(!seen.has(it.id)) claudeSeen.push(it.id);
    claudeLog.push({id:it.id,type:a.type,result,at:Date.now(),ver:CLAUDE_APPLY_VER});
  });
  claudeSeen=claudeSeen.slice(-300);
  claudeLog=claudeLog.slice(-50);
  restoreTodayCheckins();renderCalendar();renderMilestones();renderWishlist();
  renderBooksList();renderJarCandies();renderTimeCapsules();renderMonthStats();
  if(typeof renderCoinDisplay==='function') renderCoinDisplay();
  saveApp();
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') claudeInboxSync();});
