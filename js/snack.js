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
const DAILY_FEED_LIMIT=3;

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

function checkDailyFeed(){
  const today=new Date().toDateString();
  if(snackData.dailyFeedDate!==today){snackData.dailyFeedCount=0;snackData.dailyFeedDate=today;}
  return snackData.dailyFeedCount<DAILY_FEED_LIMIT;
}

function renderShop(){
  const balance=getSnackBalance();
  document.getElementById('shop-coin-bar').textContent='本周阿贝贝币：'+balance;
  
  const all=getAllSnacks();
  const isWeekend=(new Date().getDay()===0||new Date().getDay()===6);
  const visible=all.filter(s=>!s.weekendOnly||isWeekend);
  
  const grid=document.getElementById('shop-grid');
  const bar=document.getElementById('shop-store-bar');
  const addBtn=document.querySelector('#overlay-shop .shop-add-btn');
  if(!shopStore){
    // 小街：九家店
    bar.style.display='none';
    addBtn.style.display='none';
    grid.className='shop-grid shop-street';
    grid.innerHTML=SNACK_STREET.map(st=>{
      const items=visible.filter(x=>snackStoreOf(x)===st.id);
      const cover=all.find(x=>x.id===st.cover);
      const waiting=items.reduce((n,x)=>n+((snackData.stock[x.id]||0)>0?1:0),0);
      return '<div class="shop-item shop-store" onclick="enterSnackStore(\''+st.id+'\')">'
        +'<div class="shop-item-img">'+(cover&&cover.img?'<img class="shop-item-placeholder" src="'+cover.img+'">':'')
        +(waiting?'<div class="shop-item-stock">'+waiting+' 样待喂</div>':'')+'</div>'
        +'<div class="shop-store-name">'+st.name+'</div>'
        +'<div class="shop-store-count">'+items.length+' 样</div>'
      +'</div>';
    }).join('');
    return;
  }
  const store=SNACK_STREET.find(x=>x.id===shopStore)||{name:'杂货铺'};
  bar.style.display='flex';
  addBtn.style.display='';
  document.getElementById('shop-store-name').textContent=store.name;
  grid.className='shop-grid';
  grid.innerHTML=visible.filter(s=>snackStoreOf(s)===shopStore).map(s=>{
    const price=getSeasonalPrice(s);
    const canAfford=balance>=price;
    const noStory=!s.story;
    const buyCount=snackData.purchaseCount[s.id]||0;
    const isFav=buyCount>=3;
    const stk=snackData.stock[s.id]||0;
    const isDiscounted=price<s.price;
    const imgHtml=s.img?`<img class="shop-item-placeholder" src="${s.img}">`:'<div class="shop-item-placeholder"></div>';
    
    // Rating hearts
    let ratingHtml='';
    if(s.rating&&!noStory){
      ratingHtml='<div class="shop-item-rating">';
      for(let i=0;i<5;i++) ratingHtml+=i<s.rating?'♥':'♡';
      ratingHtml+='</div>';
    }
    
    return '<div class="shop-item '+(noStory?'no-story':'')+'" onclick="'+(noStory?'':'tryBuySnack(\''+s.id+'\')')+'">'
      +'<div class="shop-item-img">'
        +imgHtml
        +(isFav?'<div class="shop-item-fav">♥</div>':'')
        +(stk>0?'<div class="shop-item-stock">×'+stk+'</div>':'')
        +(s.weekendOnly?'<div class="shop-item-weekend">周末限定</div>':'')
      +'</div>'
      +'<div class="shop-item-info">'
        +'<div class="shop-item-name">'+s.name+'</div>'
        +'<div class="shop-item-price">'+(noStory?'<span class="shop-stocking">备货中</span>':(isDiscounted?'<span class="shop-discount">'+s.price+'</span> ':'')+price+' 币')+'</div>'
        +ratingHtml
        +(stk>0?'<div class="shop-feed-btn" onclick="event.stopPropagation();feedSnack(\''+s.id+'\')">喂阿贝贝</div>':'')
      +'</div>'
    +'</div>';
  }).join('');
}

function tryBuySnack(id){
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack||!snack.story) return;
  
  const price=getSeasonalPrice(snack);
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
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack) return;
  const btn=document.getElementById('snack-buy-btn');
  if(btn.disabled) return;
  closeSnackConfirm();
  
  const price=getSeasonalPrice(snack);
  
  // Deduct coins
  snackData.weeklySpent+=price;
  
  // Track weekly buy count
  if(!snackData.weeklyBuyCount) snackData.weeklyBuyCount={};
  if(!snackData.weeklyBuyCount[id]) snackData.weeklyBuyCount[id]=0;
  snackData.weeklyBuyCount[id]++;
  
  // Add to stock
  if(!snackData.stock) snackData.stock={};
  if(!snackData.stock[id]) snackData.stock[id]=0;
  snackData.stock[id]++;
  
  // Update purchase count
  if(!snackData.purchaseCount[id]) snackData.purchaseCount[id]=0;
  snackData.purchaseCount[id]++;
  
  // Add to collection if first time
  if(snackData.purchaseCount[id]===1){
    snackData.collection.push({id:id,name:snack.name,firstBought:new Date().toLocaleDateString('zh-CN')});
  }
  
  saveApp();
  renderShop();
  showRepeatLine('已购入！去货架上点它喂阿贝贝吧');
}

// Feed from stock
function feedSnack(id){
  const snack=getAllSnacks().find(s=>s.id===id);
  if(!snack) return;
  if(!snackData.stock[id]||snackData.stock[id]<=0) return;
  
  // Check daily feed limit
  if(!checkDailyFeed()){
    showRepeatLine('阿贝贝说肚子圆了……今天不能再吃了');
    return;
  }
  
  // Consume from stock
  snackData.stock[id]--;
  snackData.dailyFeedCount++;
  
  // Boost 舔嘴嘴
  const boost=snack.price<=2?20:snack.price<=4?30:40;
  abebeState.snackHappy=Math.min(100,abebeState.snackHappy+boost);
  abebeState.mood=Math.min(100,abebeState.mood+5);
  
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
}

function showRepeatLine(text){
  document.getElementById('repeat-line-bubble').textContent=text;
  document.getElementById('repeat-line-mask').classList.add('show');
  setTimeout(()=>closeRepeatLine(),2500);
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
