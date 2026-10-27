/* 小卖部、添加零食 */
// ===== SNACK SHOP SYSTEM =====
// snackShop：内容在 data/snacks.js

let candyGameData={
  candyPoints:0,        // 糖果积分
  totalCoinsEarned:0,   // 游戏总共赚的币
  playsToday:0,
  playDate:'',
  highScore:0
};
let memGameData={
  playsToday:0,
  playDate:'',
  highScore:999 // lower is better
};
let snackData={
  purchaseCount:{},
  collection:[],
  weeklySpent:0,
  weekStart:'',
  stock:{},           // { 'strawberry_milk': 2 } - items in inventory
  weeklyBuyCount:{},  // { 'strawberry_milk': 1 } - buys this week per item
  dailyFeedCount:0,
  dailyFeedDate:''
};

function getWeekStart(){
  const now=new Date();
  const day=now.getDay()||7;
  const mon=new Date(now);
  mon.setDate(mon.getDate()-(day-1));
  return mon.getFullYear()+'-'+(mon.getMonth()+1)+'-'+mon.getDate();
}

function getWeeklyCandyCount(){
  const now=new Date();
  const day=now.getDay()||7;
  const monDate=new Date(now);
  monDate.setDate(monDate.getDate()-(day-1));
  monDate.setHours(0,0,0,0);
  
  let count=0;
  for(const mk in savedCandiesByMonth){
    const arr=savedCandiesByMonth[mk]||[];
    arr.forEach(c=>{
      // Parse candy date: format "M.D" in current month context
      const parts=mk.split('-');
      const y=parseInt(parts[0]),m=parseInt(parts[1]);
      const candyDate=new Date(y,m,c.day);
      if(candyDate>=monDate&&candyDate<=now) count++;
    });
  }
  return count;
}

function getSnackBalance(){
  const ws=getWeekStart();
  if(snackData.weekStart!==ws){
    snackData.weekStart=ws;
    snackData.weeklySpent=0;
    snackData.weeklyBuyCount={};
    saveApp();
  }
  return getWeeklyCandyCount()-snackData.weeklySpent+(typeof candyGameData!=='undefined'?(candyGameData.totalCoinsEarned||0):0);
}

function renderCoinDisplay(){
  const el=document.getElementById('abebe-coin-display');
  if(el) el.textContent='本周阿贝贝币：'+getSnackBalance();
}

// Shop
let pendingSnackId='';

// 小卖部是一条小街：先选店（shopStore=null 时显示街），再进店买东西
let shopStore=null;
function openSnackShop(){
  shopStore=null;
  document.getElementById('overlay-shop').classList.add('show');
  renderShop();
}
function snackUseOf(s){return SNACK_STORE_USE[snackStoreOf(s)]||{tummy:15,give:'喂阿贝贝'};}
function snackTummyOf(s){return typeof s.tummy==='number'?s.tummy:snackUseOf(s).tummy;}
function snackStoreOf(s){
  if(s.shop) return s.shop;
  const st=SNACK_STREET.find(x=>x.ids.includes(s.id));
  return st?st.id:'za';
}
function enterSnackStore(id){
  shopStore=id;
  document.getElementById('shop-add-form').style.display='none';
  renderShop();
  document.getElementById('shop-content').scrollTop=0;
}
function leaveSnackStore(){
  shopStore=null;
  document.getElementById('shop-add-form').style.display='none';
  renderShop();
  document.getElementById('shop-content').scrollTop=0;
}
function closeSnackShop(){
  document.getElementById('overlay-shop').classList.remove('show');
  refreshAbebeStatus();
}

function getAllSnacks(){
  const builtInNames=snackShop.map(s=>s.name);
  const custom=(snackData.customSnacks||[])
    .filter(s=>!builtInNames.includes(s.name))
    .map(s=>({
      id:s.id,name:s.name,price:s.price,img:s.img||'',
      story:s.story||'',repeatLines:s.repeatLines||[],
      dadWords:s.dadWords||'',dadBlock:s.dadBlock||'',
      rating:s.rating||0,weeklyLimit:0,timeAllow:null,shop:s.shop||'za'
    }));
  return [...snackShop,...custom];
}

function getSeasonalPrice(snack){
  if(!snack.seasonDiscount) return snack.price;
  const m=new Date().getMonth();
  const season=m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'autumn':'winter';
  if(snack.seasonDiscount.season===season) return Math.max(1,snack.price-snack.seasonDiscount.discount);
  return snack.price;
}

function checkTimeAllow(snack){
  if(!snack.timeAllow) return true;
  if(snack.timeAllow.end===-1) return false; // permanently blocked
  const h=new Date().getHours();
  return h>=snack.timeAllow.start&&h<snack.timeAllow.end;
}

function checkWeeklyLimit(snack){
  if(!snack.weeklyLimit) return true;
  const ws=getWeekStart();
  if(snackData.weekStart!==ws){snackData.weeklyBuyCount={};}
  return (snackData.weeklyBuyCount[snack.id]||0)<snack.weeklyLimit;
}


function renderShop(){
  const balance=getSnackBalance();
  const daily=shopDaily();
  const today=shopToday();
  let bar1='本周阿贝贝币：'+balance;
  const promo=[];
  if(typeof getTummy==='function'&&getTummy()<TUMMY_HUNGRY) promo.unshift(tummyLines.street[Math.floor(shopRand(shopDayKey()+'|st'+new Date().getHours())*tummyLines.street.length)%tummyLines.street.length]);
  if(isMemberDay()) promo.push('今天18号会员日 · 全场八折');
  promo.push(daily.rebated?'今天的满10返2已经领到啦':'今天已花 '+daily.spent+' 币 · 满10返2');
  document.getElementById('shop-coin-bar').innerHTML=bar1+'<div class="shop-promo-line">'+promo.join('　')+'</div>';
  
  const all=getAllSnacks();
  const visible=all.filter(s=>!s.weekendOnly||isWeekendToday());
  
  const grid=document.getElementById('shop-grid');
  const bar=document.getElementById('shop-store-bar');
  const promos=document.getElementById('shop-promos');
  const stampRow=document.getElementById('shop-stamp-row');
  const addBtn=document.querySelector('#overlay-shop .shop-add-btn');
  const byId=id=>all.find(x=>x.id===id);
  const storeName=s=>{const st=SNACK_STREET.find(x=>x.id===snackStoreOf(s));return st?st.name:'';};
  if(!shopStore){
    // 小街：九家店 + 爸爸的推车
    bar.style.display='none';
    stampRow.style.display='none';
    addBtn.style.display='none';
    grid.className='shop-grid shop-street';
    grid.innerHTML=SNACK_STREET.map(st=>{
      const items=visible.filter(x=>snackStoreOf(x)===st.id);
      const onShelf=items.filter(snackOnShelf).length;
      const cover=byId(st.cover);
      const waiting=items.reduce((n,x)=>n+((snackData.stock[x.id]||0)>0?1:0),0);
      return '<div class="shop-item shop-store" onclick="enterSnackStore(\''+st.id+'\')">'
        +'<div class="shop-item-img">'+(cover&&cover.img?'<img class="shop-item-placeholder" src="'+cover.img+'">':'')
        +(waiting?'<div class="shop-item-stock">'+waiting+' 样待喂</div>':'')+'</div>'
        +'<div class="shop-store-name">'+st.name+'</div>'
        +'<div class="shop-store-count">今天上架 '+onShelf+'/'+items.length+'</div>'
      +'</div>';
    }).join('');
    const cards=[];
    const sp=byId(today.special);
    if(sp){
      const st=SNACK_STREET.find(x=>x.id===snackStoreOf(sp));
      cards.push('<div class="shop-item shop-promo" onclick="enterSnackStore(\''+(st?st.id:'za')+'\')">'
        +'<div class="shop-promo-tag hot">今日特价</div>'
        +'<div class="shop-promo-imgs"><img src="'+sp.img+'"></div>'
        +'<div class="shop-promo-name">'+sp.name+'</div>'
        +'<div class="shop-promo-sub">'+storeName(sp)+' · <span class="shop-discount">'+sp.price+'</span> '+getShopPrice(sp)+' 币</div></div>');
    }
    const fl=today.flash.map(byId).filter(Boolean);
    if(fl.length){
      const st=SNACK_STREET.find(x=>x.id===snackStoreOf(fl[0]));
      cards.push('<div class="shop-item shop-promo" onclick="enterSnackStore(\''+(st?st.id:'za')+'\')">'
        +'<div class="shop-promo-tag">限量抢购</div>'
        +'<div class="shop-promo-imgs">'+fl.map(x=>'<img src="'+x.img+'"'+(flashSoldOut(x)?' class="gone"':'')+'>').join('')+'</div>'
        +'<div class="shop-promo-name">'+fl.map(x=>x.name).join('、')+'</div>'
        +'<div class="shop-promo-sub">'+fl.map(x=>flashSoldOut(x)?'已抢光':storeName(x)+'仅1份').join(' · ')+'</div></div>');
    }
    const b=today.bundle;
    if(b){
      const its=b.items.map(byId);
      const sum=its.reduce((n,x)=>n+x.price,0);
      cards.push('<div class="shop-item shop-promo" onclick="openBundle()">'
        +'<div class="shop-promo-tag">今日套餐</div>'
        +'<div class="shop-promo-imgs">'+its.map(x=>'<img src="'+x.img+'">').join('')+'</div>'
        +'<div class="shop-promo-name">'+b.name+'</div>'
        +'<div class="shop-promo-sub"><span class="shop-discount">'+sum+'</span> '+b.price+' 币</div></div>');
    }
    cards.push('<div class="shop-item shop-promo" onclick="openLuckyBag()">'
      +'<div class="shop-promo-tag">爸爸的福袋</div>'
      +'<div class="shop-promo-imgs"><div class="shop-bag">?</div></div>'
      +'<div class="shop-promo-name">神秘福袋</div>'
      +'<div class="shop-promo-sub">'+(daily.bag?'今天拆过啦':LUCKY_BAG_PRICE+' 币 · 每天1个')+'</div></div>');
    promos.style.display='';
    promos.innerHTML='<div class="shop-promo-title">爸爸的小推车</div><div class="shop-promo-grid">'+cards.join('')+'</div>';
    return;
  }
  const store=SNACK_STREET.find(x=>x.id===shopStore)||{name:'杂货铺'};
  bar.style.display='flex';
  promos.style.display='none';
  addBtn.style.display='';
  document.getElementById('shop-store-name').textContent=store.name;
  const stamps=(snackData.stamps&&snackData.stamps[shopStore])||0;
  let dots='';for(let i=0;i<STAMP_GOAL;i++) dots+='<span class="shop-stamp'+(i<stamps?' on':'')+'"></span>';
  stampRow.style.display='flex';
  stampRow.innerHTML='<span>集章卡</span>'+dots+'<span class="shop-stamp-tip">满'+STAMP_GOAL+'个送一样</span>';
  grid.className='shop-grid';
  const list=visible.filter(s=>snackStoreOf(s)===shopStore);
  // 今天上架的排前面，缺货的排后面
  list.sort((a,b)=>(snackOnShelf(b)?1:0)-(snackOnShelf(a)?1:0));
  grid.innerHTML=list.map(s=>{
    const price=getShopPrice(s);
    const noStory=!s.story;
    const onShelf=snackOnShelf(s);
    const sold=flashSoldOut(s);
    const off=!noStory&&(!onShelf||sold);
    const isFlash=today.flash.includes(s.id);
    const isSpecial=today.special===s.id;
    const buyCount=snackData.purchaseCount[s.id]||0;
    const isFav=buyCount>=3;
    const stk=snackData.stock[s.id]||0;
    const isDiscounted=price<s.price;
    const imgHtml=s.img?`<img class="shop-item-placeholder" src="${s.img}">`:'<div class="shop-item-placeholder"></div>';
    let ratingHtml='';
    if(s.rating&&!noStory){
      ratingHtml='<div class="shop-item-rating">';
      for(let i=0;i<5;i++) ratingHtml+=i<s.rating?'♥':'♡';
      ratingHtml+='</div>';
    }
    let tag='';
    if(!onShelf&&!noStory) tag='<div class="shop-item-weekend grey">今日缺货</div>';
    else if(sold) tag='<div class="shop-item-weekend grey">已抢光</div>';
    else if(isFlash) tag='<div class="shop-item-weekend">限量1份</div>';
    else if(s.weekendOnly) tag='<div class="shop-item-weekend">周末限定</div>';
    let priceHtml;
    if(noStory) priceHtml='<span class="shop-stocking">备货中</span>';
    else if(off) priceHtml='<span class="shop-stocking">'+(sold?'明天再来':'今天没货')+'</span>';
    else priceHtml=(isDiscounted?'<span class="shop-discount">'+s.price+'</span> ':'')+price+' 币';
    return '<div class="shop-item '+(noStory?'no-story':'')+(off?' off-shelf':'')+'" onclick="'+(noStory||off?'':'tryBuySnack(\''+s.id+'\')')+'">'
      +'<div class="shop-item-img">'
        +imgHtml
        +(isFav?'<div class="shop-item-fav">♥</div>':'')
        +(isSpecial&&!off?'<div class="shop-item-special">特价</div>':'')
        +(stk>0?'<div class="shop-item-stock">×'+stk+'</div>':'')
        +tag
      +'</div>'
      +'<div class="shop-item-info">'
        +'<div class="shop-item-name">'+s.name+'</div>'
        +'<div class="shop-item-price">'+priceHtml+'</div>'
        +ratingHtml
        +(stk>0?'<div class="shop-feed-btn" onclick="event.stopPropagation();feedSnack(\''+s.id+'\')">'+snackUseOf(s).give+'</div>':'')
      +'</div>'
    +'</div>';
  }).join('');
}


// ===== 每日上架、特价、限量、会员日、满返、集章、福袋、套餐 =====
// 所有"今天"的随机都用日期当种子：同一天里怎么刷新都一样，第二天换一批
function shopDayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function shopRand(seed){let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967296;}
function shopDaily(){
  const k=shopDayKey();
  if(!snackData.daily||snackData.daily.date!==k) snackData.daily={date:k,spent:0,rebated:false,flash:{},bag:0};
  if(!snackData.daily.flash) snackData.daily.flash={};
  return snackData.daily;
}
function isMemberDay(){return new Date().getDate()===18;}
function isWeekendToday(){const d=new Date().getDay();return d===0||d===6;}
function snackSellable(s){
  // 有故事、不是永远不卖的、周末限定只在周末算
  return !!s.story&&!(s.timeAllow&&s.timeAllow.end===-1)&&(!s.weekendOnly||isWeekendToday());
}
function shopPick(list,seed){
  if(!list.length) return null;
  return list[Math.floor(shopRand(seed)*list.length)%list.length];
}
let _shopTodayCache=null;
function shopToday(){
  const k=shopDayKey();
  if(_shopTodayCache&&_shopTodayCache.k===k) return _shopTodayCache;
  const pool=snackShop.filter(x=>snackSellable(x)&&x.price>=2);
  const special=shopPick(pool,k+'|special');
  const rest=pool.filter(x=>x!==special);
  const f1=shopPick(rest,k+'|flash1');
  const f2=shopPick(rest.filter(x=>x!==f1),k+'|flash2');
  const bundles=SNACK_BUNDLES.filter(b=>b.items.every(i=>snackShop.some(x=>x.id===i)));
  const bundle=shopPick(bundles,k+'|bundle');
  _shopTodayCache={k,special:special&&special.id,flash:[f1,f2].filter(Boolean).map(x=>x.id),bundle};
  return _shopTodayCache;
}
function specialPriceOf(p){return Math.max(1,p-Math.max(1,Math.round(p*0.3)));}
function getShopPrice(s){
  let p=getSeasonalPrice(s);
  if(shopToday().special===s.id) p=Math.min(p,specialPriceOf(s.price));
  if(isMemberDay()) p=Math.max(1,Math.floor(p*0.8));
  return p;
}
function snackOnShelf(s){
  if(String(s.id).indexOf('custom_')===0) return true;
  const st=SNACK_STREET.find(x=>x.ids.includes(s.id));
  if(!st||st.ids.length<=4) return true;
  if((st.always||[]).includes(s.id)) return true;
  const t=shopToday();
  if(t.special===s.id||t.flash.includes(s.id)) return true;
  return shopRand(shopDayKey()+'|shelf|'+s.id)<0.55;
}
function flashSoldOut(s){return shopToday().flash.includes(s.id)&&!!shopDaily().flash[s.id];}

// 把一样东西放进货架（买的、送的、福袋抽的都走这里）
function snackGrant(snack,countWeekly){
  if(countWeekly){
    if(!snackData.weeklyBuyCount) snackData.weeklyBuyCount={};
    snackData.weeklyBuyCount[snack.id]=(snackData.weeklyBuyCount[snack.id]||0)+1;
  }
  if(!snackData.stock) snackData.stock={};
  snackData.stock[snack.id]=(snackData.stock[snack.id]||0)+1;
  snackData.purchaseCount[snack.id]=(snackData.purchaseCount[snack.id]||0)+1;
  if(snackData.purchaseCount[snack.id]===1){
    snackData.collection.push({id:snack.id,name:snack.name,firstBought:new Date().toLocaleDateString('zh-CN')});
  }
}
// 集章：每家店买一次盖一个章，满5个爸爸送一样这家店的东西
const STAMP_GOAL=5;
function snackStamp(storeId){
  if(!snackData.stamps) snackData.stamps={};
  snackData.stamps[storeId]=(snackData.stamps[storeId]||0)+1;
  if(snackData.stamps[storeId]<STAMP_GOAL) return null;
  snackData.stamps[storeId]=0;
  const st=SNACK_STREET.find(x=>x.id===storeId);
  const pool=getAllSnacks().filter(x=>snackStoreOf(x)===storeId&&snackSellable(x));
  const gift=pool[Math.floor(Math.random()*pool.length)];
  if(!gift) return null;
  snackGrant(gift,false);
  return '集满'+STAMP_GOAL+'个章啦！'+(st?st.name:'')+'送你一个「'+gift.name+'」';
}
// 记账：今天花满10币，爸爸返2币
function snackSpend(price){
  snackData.weeklySpent+=price;
  const d=shopDaily();
  d.spent+=price;
  if(!d.rebated&&d.spent>=10){
    d.rebated=true;
    snackData.weeklySpent-=2;
    return '今天花满10币啦，爸爸返你2币';
  }
  return null;
}
function snackNotice(lines){showRepeatLine(lines.filter(Boolean).join('\n'));}

function openBundle(){
  const b=shopToday().bundle; if(!b) return;
  const items=b.items.map(i=>getAllSnacks().find(x=>x.id===i));
  const sum=items.reduce((n,x)=>n+x.price,0);
  const balance=getSnackBalance();
  const blocked=items.find(x=>!checkTimeAllow(x));
  const weekFull=items.find(x=>!checkWeeklyLimit(x));
  const textEl=document.getElementById('snack-confirm-text');
  const btnBuy=document.getElementById('snack-buy-btn');
  pendingSnackId='__bundle';
  let html='<div class="dad-label">爸爸说：</div><div class="dad-words">今天的套餐是「'+b.name+'」：'+items.map(x=>x.name).join(' + ')+'。一起买比分开买便宜，不过要一次付清哦。</div>';
  if(blocked){html+='<div class="dad-words">'+(blocked.dadBlock||'这个现在不卖。')+'</div>';btnBuy.disabled=true;btnBuy.textContent='现在不行';}
  else if(weekFull){html+='<div class="dad-words">「'+weekFull.name+'」这周已经买够啦，下周再来。</div>';btnBuy.disabled=true;btnBuy.textContent='下周再来';}
  else if(balance<b.price){html+='<div class="dad-price"><span class="shop-discount">'+sum+'</span> '+b.price+' 币（余额不足）</div>';btnBuy.disabled=true;btnBuy.textContent='币不够啦';}
  else{html+='<div class="dad-price"><span class="shop-discount">'+sum+'</span> '+b.price+' 币</div>';btnBuy.disabled=false;btnBuy.textContent='都要！';}
  textEl.innerHTML=html;
  document.getElementById('snack-confirm-mask').classList.add('show');
}
const LUCKY_BAG_PRICE=3;
function openLuckyBag(){
  const textEl=document.getElementById('snack-confirm-text');
  const btnBuy=document.getElementById('snack-buy-btn');
  pendingSnackId='__bag';
  let html='<div class="dad-label">爸爸说：</div><div class="dad-words">福袋里装了什么，爸爸也不知道。可能是一瓶水，也可能是很贵很贵的东西。每天只能买一个。</div>';
  if(shopDaily().bag>=1){html+='<div class="dad-words">今天的福袋已经买过啦，明天再来。</div>';btnBuy.disabled=true;btnBuy.textContent='明天再来';}
  else if(getSnackBalance()<LUCKY_BAG_PRICE){html+='<div class="dad-price">福袋 · '+LUCKY_BAG_PRICE+' 币（余额不足）</div>';btnBuy.disabled=true;btnBuy.textContent='币不够啦';}
  else{html+='<div class="dad-price">福袋 · '+LUCKY_BAG_PRICE+' 币</div>';btnBuy.disabled=false;btnBuy.textContent='拆！';}
  textEl.innerHTML=html;
  document.getElementById('snack-confirm-mask').classList.add('show');
}
function buyBundle(){
  const b=shopToday().bundle; if(!b) return;
  const items=b.items.map(i=>getAllSnacks().find(x=>x.id===i));
  const lines=['套餐买好啦！'+items.map(x=>x.name).join('和')+'都放上货架了'];
  lines.push(snackSpend(b.price));
  items.forEach(x=>{snackGrant(x,true);lines.push(snackStamp(snackStoreOf(x)));});
  saveApp();renderShop();snackNotice(lines);
}
function buyLuckyBag(){
  const pool=getAllSnacks().filter(snackSellable);
  const gift=pool[Math.floor(Math.random()*pool.length)];
  if(!gift) return;
  shopDaily().bag++;
  const lines=['打开福袋……是「'+gift.name+'」！'];
  lines.push(snackSpend(LUCKY_BAG_PRICE));
  snackGrant(gift,false);
  saveApp();renderShop();snackNotice(lines);
}

function tryBuySnack(id){
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack||!snack.story) return;
  
  if(!snackOnShelf(snack)||flashSoldOut(snack)) return;
  const price=getShopPrice(snack);
  const balance=getSnackBalance();
  const timeOk=checkTimeAllow(snack);
  const weekOk=checkWeeklyLimit(snack);
  
  // Show dad's words popup
  pendingSnackId=id;
  const confirmEl=document.getElementById('snack-confirm-mask');
  const textEl=document.getElementById('snack-confirm-text');
  const btnBuy=document.getElementById('snack-buy-btn');
  
  if(!timeOk){
    // Time restricted
    textEl.innerHTML='<div class="dad-label">爸爸说：</div><div class="dad-words">'+snack.dadBlock+'</div>';
    btnBuy.disabled=true;
    btnBuy.textContent='现在不行';
  }else if(!weekOk){
    textEl.innerHTML='<div class="dad-label">爸爸说：</div><div class="dad-words">这个这周已经吃够啦，下周再来嘛。</div>';
    btnBuy.disabled=true;
    btnBuy.textContent='下周再来';
  }else if(balance<price){
    textEl.innerHTML='<div class="dad-label">爸爸说：</div><div class="dad-words">'+snack.dadWords+'</div><div class="dad-price">'+snack.name+' · '+price+' 币（余额不足）</div>';
    btnBuy.disabled=true;
    btnBuy.textContent='币不够啦';
  }else{
    textEl.innerHTML='<div class="dad-label">爸爸说：</div><div class="dad-words">'+snack.dadWords+'</div><div class="dad-price">'+snack.name+' · '+price+' 币</div>';
    btnBuy.disabled=false;
    btnBuy.textContent='买！';
  }
  confirmEl.classList.add('show');
}

function closeSnackConfirm(){
  document.getElementById('snack-confirm-mask').classList.remove('show');
  pendingSnackId='';
}

function confirmBuySnack(){
  const id=pendingSnackId;
  const btn=document.getElementById('snack-buy-btn');
  if(btn.disabled) return;
  if(id==='__bundle'){closeSnackConfirm();buyBundle();return;}
  if(id==='__bag'){closeSnackConfirm();buyLuckyBag();return;}
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack) return;
  closeSnackConfirm();
  const price=getShopPrice(snack);
  const lines=['已购入！去货架上点它喂阿贝贝吧'];
  if(shopToday().flash.includes(id)) shopDaily().flash[id]=1;
  lines.push(snackSpend(price));
  snackGrant(snack,true);
  lines.push(snackStamp(snackStoreOf(snack)));
  saveApp();
  renderShop();
  snackNotice(lines);
}

// Feed from stock
// 喂完、关掉小卖部、看完故事，都让阿贝贝页的状态栏马上跟上
function refreshAbebeStatus(){
  if(typeof getTummy==='function') abebeState.food=Math.round(getTummy());
  if(typeof renderAbebeStatus==='function') renderAbebeStatus();
}
function feedSnack(id){
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack) return;
  if(!snackData.stock[id]||snackData.stock[id]<=0) return;
  const amt=snackTummyOf(snack);
  // 吃的东西占小肚子；快满了就吃不下
  if(amt>0&&getTummy()+amt>TUMMY_MAX+10){
    showRepeatLine(randFrom(tummyLines.full));
    return;
  }
  snackData.stock[id]--;
  if(amt>0) setTummy(getTummy()+amt);
  // 吃了东西兔兔心也开心一点
  abebeState.mood=Math.min(100,abebeState.mood+5);
  refreshAbebeStatus();
  
  const totalFed=(snackData.purchaseCount[id]||1)-(snackData.stock[id]||0);
  
  if(totalFed<=1){
    // First time feeding this snack: show full story
    saveApp();
    closeSnackShop();
    showStory(snack.name,snack.story);
  }else{
    // Repeat feed
    if(snack.repeatLines&&snack.repeatLines.length>0){
      const line=snack.repeatLines[Math.floor(Math.random()*snack.repeatLines.length)];
      saveApp();
      renderShop();
      showRepeatLine(line);
    }else{
      saveApp();
      renderShop();
      showRepeatLine('谢谢你又给我吃了这个！');
    }
  }
}

function showStory(name,text){
  const bubble=document.getElementById('story-bubble');
  bubble.classList.remove('visible');
  bubble.innerHTML='<div class="story-snack-name">'+name+'</div>'+text.replace(/\n/g,'<br>');
  document.getElementById('story-mask').classList.add('show');
  setTimeout(()=>bubble.classList.add('visible'),100);
}

function closeStory(){
  document.getElementById('story-mask').classList.remove('show');
  document.getElementById('story-bubble').classList.remove('visible');
  refreshAbebeStatus();
}

function showRepeatLine(text){
  document.getElementById('repeat-line-bubble').textContent=text;
  document.getElementById('repeat-line-mask').classList.add('show');
  clearTimeout(showRepeatLine._t);
  showRepeatLine._t=setTimeout(()=>closeRepeatLine(),2500+1600*(String(text).split('\n').length-1));
}

function closeRepeatLine(){
  document.getElementById('repeat-line-mask').classList.remove('show');
}

// Snack Book
function openSnackBook(){
  document.getElementById('overlay-snack-book').classList.add('show');
  renderSnackBook();
}
function closeSnackBook(){
  document.getElementById('overlay-snack-book').classList.remove('show');
}

function renderSnackBook(){
  const el=document.getElementById('snack-book-content');
  if(!snackData.collection||!snackData.collection.length){
    el.innerHTML='<div class="snack-book-empty">还没有给阿贝贝买过零食<br>去小卖部看看吧</div>';
    return;
  }
  const items=[...snackData.collection].reverse();
  el.innerHTML='<div class="snack-book-list">'+items.map(c=>{
    const count=snackData.purchaseCount[c.id]||1;
    const isFav=count>=3;
    const snack=getAllSnacks().find(s=>s.id===c.id);
    const imgHtml=snack&&snack.img?'<img src="'+snack.img+'" style="width:100%;height:100%;object-fit:contain;padding:4px">':'';
    let ratingHtml='';
    if(snack&&snack.rating){
      ratingHtml='<span style="color:#E85A8A;font-size:10px;letter-spacing:1px;margin-left:8px">';
      for(let i=0;i<5;i++) ratingHtml+=i<snack.rating?'♥':'♡';
      ratingHtml+='</span>';
    }
    return `<div class="snack-book-item" onclick="viewSnackStory('${c.id}')">
      <div class="snack-book-thumb">${imgHtml}</div>
      <div class="snack-book-info">
        <div class="snack-book-name">${c.name}${isFav?' <span style="color:#E85A8A;font-size:12px">♥ 阿贝贝的最爱</span>':''}${ratingHtml}</div>
        <div class="snack-book-meta">首次购买：${c.firstBought}</div>
        <div class="snack-book-count">×${count}</div>
      </div>
    </div>`;
  }).join('')+'</div>';
}

function viewSnackStory(id){
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack||!snack.story) return;
  closeSnackBook();
  showStory(snack.name,snack.story);
}

whenReady(async function loadSnackData(){
  let localSavedAt=0,hasLocal=false;
  try{
    const raw=localStorage.getItem('candyJarSnackData');
    if(raw){
      const d=JSON.parse(raw);
      hasLocal=true;localSavedAt=d.savedAt||0;
      if(d.purchaseCount) snackData.purchaseCount=d.purchaseCount;
      if(d.collection) snackData.collection=d.collection;
      if(d.weeklySpent!==undefined) snackData.weeklySpent=d.weeklySpent;
      if(d.weekStart) snackData.weekStart=d.weekStart;
      if(d.customSnacks) snackData.customSnacks=d.customSnacks;
      if(d.stock) snackData.stock=d.stock;
      if(d.weeklyBuyCount) snackData.weeklyBuyCount=d.weeklyBuyCount;
      if(d.dailyFeedCount!==undefined) snackData.dailyFeedCount=d.dailyFeedCount;
      if(d.dailyFeedDate) snackData.dailyFeedDate=d.dailyFeedDate;
      if(d.daily) snackData.daily=d.daily;
      if(d.stamps) snackData.stamps=d.stamps;
    }
  }catch(e){}
  try{
    const cloud=await supaGet('snack_data');
    // Same rule as loadApp: older cloud copies never overwrite what's on this phone.
    if(cloud&&(!hasLocal||(cloud.savedAt||0)>localSavedAt)){
      if(cloud.purchaseCount) snackData.purchaseCount=cloud.purchaseCount;
      if(cloud.collection) snackData.collection=cloud.collection;
      if(cloud.weeklySpent!==undefined) snackData.weeklySpent=cloud.weeklySpent;
      if(cloud.weekStart) snackData.weekStart=cloud.weekStart;
      if(cloud.customSnacks) snackData.customSnacks=cloud.customSnacks;
      if(cloud.stock) snackData.stock=cloud.stock;
      if(cloud.weeklyBuyCount) snackData.weeklyBuyCount=cloud.weeklyBuyCount;
      if(cloud.dailyFeedCount!==undefined) snackData.dailyFeedCount=cloud.dailyFeedCount;
      if(cloud.dailyFeedDate) snackData.dailyFeedDate=cloud.dailyFeedDate;
      if(cloud.daily) snackData.daily=cloud.daily;
      if(cloud.stamps) snackData.stamps=cloud.stamps;
    }
  }catch(e){}
  // Check week reset
  getSnackBalance();
  renderCoinDisplay();
});

// ===== ADD SNACK FORM =====
let newSnackPrice=2;

function showAddSnackForm(){
  const form=document.getElementById('shop-add-form');
  if(form.style.display==='none'){
    form.style.display='block';
    document.getElementById('new-snack-name').value='';
    newSnackPrice=2;
    document.querySelectorAll('.price-option').forEach(p=>{
      p.classList.toggle('selected',parseInt(p.dataset.price)===2);
    });
  }else{
    form.style.display='none';
  }
}

function pickPrice(el,price){
  newSnackPrice=price;
  document.querySelectorAll('.price-option').forEach(p=>p.classList.remove('selected'));
  el.classList.add('selected');
}

function submitNewSnack(){
  const nameInput=document.getElementById('new-snack-name');
  const name=nameInput.value.trim();
  if(!name){
    nameInput.focus();
    return;
  }
  // Generate unique id
  const id='custom_'+Date.now();
  if(!snackData.customSnacks) snackData.customSnacks=[];
  snackData.customSnacks.push({
    id:id,
    name:name,
    price:newSnackPrice,
    shop:shopStore||'za',
    story:'',
    repeatLines:[]
  });
  saveApp();
  document.getElementById('shop-add-form').style.display='none';
  renderShop();
  showRepeatLine('新零食上架啦！等克克厨写好故事就能买了');
}
