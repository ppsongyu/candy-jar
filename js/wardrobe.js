/* 阿贝贝的衣柜：小香兔子卖衣服，买了进衣柜，点一件就换到阿贝贝页上 */
// 存在 snackData.wardrobe：owned 买过的、wearing 正在穿的、seen 已经看过第一次穿的故事
const ABEBE_DEFAULT_IMG='./愉快阿贝贝.png';
// 图换过的衣服在数据里写 v，带上版本号，手机就不会一直用旧图
function outfitImg(o){return './outfits/'+o.id+'.webp'+(o.v?'?v='+o.v:'');}
function outfitThumb(o){return './outfits/'+o.id+'_s.webp'+(o.v?'?v='+o.v:'');}
function outfitById(id){return OUTFITS.find(o=>o.id===id);}
function wardrobeData(){
  if(!snackData.wardrobe) snackData.wardrobe={owned:[],wearing:'',seen:[]};
  const w=snackData.wardrobe;
  if(!Array.isArray(w.owned)) w.owned=[];
  if(!Array.isArray(w.seen)) w.seen=[];
  if(!Array.isArray(w.rewards)) w.rewards=[];
  return w;
}
const OSETS=(typeof OUTFIT_SETS!=='undefined')?OUTFIT_SETS:[];
function outfitSet(sid){return OSETS.find(x=>x.id===sid);}
function setOfOutfit(o){return o&&o.set?outfitSet(o.set):null;}
function setOwnedCount(st){return st.items.filter(ownsOutfit).length;}
function outfitListingCount(){return OSETS.filter(x=>x.kind==='bundle').length+OUTFITS.filter(o=>{const st=setOfOutfit(o);return !st||st.kind!=='bundle';}).length;}
function ownsOutfit(id){return wardrobeData().owned.includes(id);}

// 阿贝贝页上的她穿什么
function applyOutfit(){
  const img=document.querySelector('.abebe-img');
  if(!img) return;
  const o=outfitById(wardrobeData().wearing);
  const src=o?outfitImg(o):ABEBE_DEFAULT_IMG;
  if(img.getAttribute('src')!==src) img.setAttribute('src',src);
}

// ---- 小香兔子里的衣服 ----
function outfitCardHtml(o){
  const own=ownsOutfit(o.id);
  return '<div class="shop-item'+(own?' outfit-owned':'')+'" onclick="'+(own?'showOwnedDad(\''+o.id+'\')':'tryBuyOutfit(\''+o.id+'\')')+'">'
    +'<div class="shop-item-img"><img class="shop-item-placeholder" src="'+outfitThumb(o)+'" loading="lazy">'
    +(own?'<div class="shop-item-weekend">已拥有</div>':'')+'</div>'
    +'<div class="shop-item-info"><div class="shop-item-name">'+o.name+'</div>'
    +'<div class="shop-item-price">'+(own?'<span class="shop-stocking">在衣柜里</span>':o.price+' 币')+'</div>'
    +(own?'<div class="shop-feed-btn" onclick="event.stopPropagation();openWardrobe()">去衣柜</div>':'')
    +'</div></div>';
}
// 限时卖的衣服（sale）：notice 那天起小街上有预告，from～to 能买，其余时间只能看；promo 是某一天某个钟点的特价
function outfitSaleState(st){
  if(!st||!st.sale) return {on:true,price:st?st.price:0};
  const sa=st.sale, now=new Date(), md=(now.getMonth()+1)*100+now.getDate(), h=now.getHours();
  const v=a=>a[0]*100+a[1];
  const on=md>=v(sa.from)&&md<=v(sa.to);
  const notice=!on&&sa.notice&&md>=v(sa.notice)&&md<v(sa.from);
  const p=sa.promo, promo=on&&p&&md===p.m*100+p.d&&h>=p.h1&&h<p.h2;
  return {on,notice,promo,price:promo?p.price:st.price};
}
function outfitSaleBanner(){
  let h='';
  OSETS.filter(st=>st.sale).forEach(st=>{
    const s=outfitSaleState(st), p=st.sale.promo;
    if(setOwnedCount(st)===st.items.length) return;
    const cn=x=>['零','一','两','三','四','五','六','七','八','九','十','十一','十二'][x>12?x-12:x];
    const when=p?p.m+'月'+p.d+'日'+(p.h1>=18?'晚上':'下午')+cn(p.h1)+'点到'+cn(p.h2)+'点':'';
    if(s.notice&&p) h+='<div class="outfit-sale-banner">🔔 小香兔子预告：「'+st.name+'」'+st.sale.from[0]+'月'+st.sale.from[1]+'日上架，'+when+'只要 '+p.price+' 币</div>';
    else if(s.promo) h+='<div class="outfit-sale-banner hot">🔔 「'+st.name+'」特价中！现在只要 '+p.price+' 币，打烊前结束</div>';
    else if(s.on) h+='<div class="outfit-sale-banner">🔔 小香兔子的「'+st.name+'」卖到 '+st.sale.to[0]+'月'+st.sale.to[1]+'日</div>';
  });
  return h;
}
function outfitNotOnSale(sid){
  const st=outfitSet(sid);
  snackNotice(['「'+st.name+'」'+st.sale.from[0]+'月'+st.sale.from[1]+'日才上架，','现在只能先看看～']);
}
// 一组卖的：一格，图片可以左右滑
function outfitBundleCardHtml(st){
  const own=setOwnedCount(st)===st.items.length;
  const items=st.items.map(outfitById);
  const sale=outfitSaleState(st);
  const tap=own?'showOwnedDad(\''+st.id+'\')':(sale.on?'tryBuyOutfitSet(\''+st.id+'\')':'outfitNotOnSale(\''+st.id+'\')');
  const priceHtml=own?'<span class="shop-stocking">在衣柜里</span>'
    :!sale.on?'<span class="shop-stocking">'+(st.sale.label||'还没上架')+'</span>'
    :sale.promo?'<span class="shop-discount">'+st.price+'</span> '+sale.price+' 币':st.price+' 币';
  return '<div class="shop-item outfit-bundle'+(own?' outfit-owned':'')+(!own&&!sale.on?' outfit-preview':'')+'" onclick="'+tap+'">'
    +'<div class="shop-item-img"><div class="ob-strip" onscroll="obDots(this)">'
    +items.map(o=>'<img src="'+outfitThumb(o)+'" loading="lazy" alt="'+o.name+'">').join('')+'</div>'
    +'<div class="ob-dots">'+items.map((o,i)=>'<i'+(i?'':' class="on"')+'></i>').join('')+'</div>'
    +'<div class="ob-tag">一组'+items.length+'件</div>'
    +(own?'<div class="shop-item-weekend">已拥有</div>':'')+'</div>'
    +'<div class="shop-item-info"><div class="shop-item-name">'+st.name+'</div>'
    +'<div class="shop-item-price">'+priceHtml+'</div>'
    +(own?'<div class="shop-feed-btn" onclick="event.stopPropagation();openWardrobe()">去衣柜</div>':'')
    +'</div></div>';
}
function obDots(el){
  const i=Math.round(el.scrollLeft/Math.max(1,el.clientWidth));
  const d=el.parentNode.querySelectorAll('.ob-dots i');
  d.forEach((x,k)=>x.classList.toggle('on',k===i));
}
// 一组衣服翻页：不只靠手机自带的横向滑动（有的手机在会上下滚的页面里吃掉横滑），
// 自己认一下手指往左还是往右，翻到上一张/下一张；点下面的小圆点也能翻
function obGo(strip,i){
  const n=strip.children.length; i=Math.max(0,Math.min(n-1,i));
  strip.scrollTo({left:i*strip.clientWidth,behavior:'smooth'});
  setTimeout(()=>obDots(strip),350);
}
let obTouch=null, obSwipedAt=0;
document.addEventListener('touchstart',e=>{
  const strip=e.target.closest&&e.target.closest('.ob-strip');
  if(!strip){obTouch=null;return;}
  obTouch={strip,x:e.touches[0].clientX,y:e.touches[0].clientY,i:Math.round(strip.scrollLeft/Math.max(1,strip.clientWidth))};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!obTouch) return;
  const t=obTouch; obTouch=null;
  const dx=e.changedTouches[0].clientX-t.x, dy=e.changedTouches[0].clientY-t.y;
  if(Math.abs(dx)<25||Math.abs(dx)<Math.abs(dy)) return;
  obSwipedAt=Date.now();
  obGo(t.strip,t.i+(dx<0?1:-1));
},{passive:true});
document.addEventListener('click',e=>{
  // 刚滑完手指抬起时不要算成「点了这件衣服」
  if(Date.now()-obSwipedAt<450&&e.target.closest&&e.target.closest('.outfit-bundle')){e.stopPropagation();e.preventDefault();return;}
  const dot=e.target.closest&&e.target.closest('.ob-dots i');
  if(!dot) return;
  e.stopPropagation();
  const strip=dot.closest('.shop-item-img').querySelector('.ob-strip');
  obGo(strip,[...dot.parentNode.children].indexOf(dot));
},true);
function outfitShopHtml(balance){
  let h='<div class="shop-outfit-title">小衣服</div>';
  OSETS.filter(st=>st.kind==='bundle').forEach(st=>{h+=outfitBundleCardHtml(st);});
  OSETS.filter(st=>st.kind==='collect').forEach(st=>{
    const n=setOwnedCount(st);
    h+='<div class="shop-outfit-title outfit-series">'+st.name+'<span>'+(n===st.items.length?'集齐啦':'已集 '+n+' / '+st.items.length)+'</span></div>';
    st.items.map(outfitById).forEach(o=>{h+=outfitCardHtml(o);});
  });
  const rest=OUTFITS.filter(o=>!setOfOutfit(o));
  if(OSETS.length) h+='<div class="shop-outfit-title outfit-series">单件</div>';
  rest.forEach(o=>{h+=outfitCardHtml(o);});
  return h;
}
function confirmOutfitHtml(dad,name,price,balance){
  const btnBuy=document.getElementById('snack-buy-btn');
  let html='<div class="dad-label">爸爸说：</div><div class="dad-words">'+dad+'</div>';
  if(balance<price){html+='<div class="dad-price">'+name+' · '+price+' 币（余额不足）</div>';btnBuy.disabled=true;btnBuy.textContent='币不够啦';}
  else{html+='<div class="dad-price">'+name+' · '+price+' 币</div>';btnBuy.disabled=false;btnBuy.textContent='买给她！';}
  document.getElementById('snack-confirm-text').innerHTML=html;
  document.getElementById('snack-confirm-mask').classList.add('show');
}
// 买过的也能再看爸爸说的话
function showOwnedDad(id){
  const st=outfitSet(id), o=outfitById(id);
  const dad=st&&st.dad?st.dad:(o?o.dad:''); const name=st?st.name:(o?o.name:'');
  if(!dad) {openWardrobe();return;}
  pendingSnackId='__gowd';
  document.getElementById('snack-confirm-text').innerHTML='<div class="dad-label">爸爸说：</div><div class="dad-words">'+dad+'</div><div class="dad-price">'+name+' · 在衣柜里</div>';
  const btn=document.getElementById('snack-buy-btn'); btn.disabled=false; btn.textContent='去衣柜';
  const c=document.querySelector('#snack-confirm-mask .cancel'); if(c) c.textContent='收起';
  document.getElementById('snack-confirm-mask').classList.add('show');
}
function tryBuyOutfit(id){
  const o=outfitById(id); if(!o||ownsOutfit(id)) return;
  const st=setOfOutfit(o); if(st&&st.kind==='bundle'){tryBuyOutfitSet(st.id);return;}
  pendingSnackId='__outfit:'+id;
  confirmOutfitHtml(o.dad,o.name,o.price,getSnackBalance());
}
function tryBuyOutfitSet(sid){
  const st=outfitSet(sid); if(!st||setOwnedCount(st)===st.items.length) return;
  const sale=outfitSaleState(st); if(!sale.on){outfitNotOnSale(sid);return;}
  pendingSnackId='__outfitset:'+sid;
  confirmOutfitHtml(st.dad,st.name+'（一组'+st.items.length+'件）'+(sale.promo?'·特价':''),sale.price,getSnackBalance());
}
function buyOutfit(id){
  const o=outfitById(id); if(!o||ownsOutfit(id)) return;
  if(getSnackBalance()<o.price) return;
  const lines=['买好啦！「'+o.name+'」挂进衣柜了'];
  lines.push(snackSpend(o.price));
  wardrobeData().owned.push(id);
  lines.push(snackStamp('mei'));
  saveApp();renderShop();snackNotice(lines);
  checkSetReward(setOfOutfit(o));
}
function buyOutfitSet(sid){
  const st=outfitSet(sid); if(!st) return;
  const w=wardrobeData();
  if(st.items.every(i=>w.owned.includes(i))) return;
  const sale=outfitSaleState(st); if(!sale.on) return;
  if(getSnackBalance()<sale.price) return;
  const lines=['买好啦！「'+st.name+'」'+st.items.length+'件都挂进衣柜了'];
  lines.push(snackSpend(sale.price));
  st.items.forEach(i=>{if(!w.owned.includes(i)) w.owned.push(i);});
  lines.push(snackStamp('mei'));
  saveApp();renderShop();snackNotice(lines);
}
// 集齐一整组：惊喜只在这一天冒出来，以后在衣柜里能重看
function checkSetReward(st){
  if(!st||st.kind!=='collect') return;
  const w=wardrobeData();
  if(setOwnedCount(st)<st.items.length||w.rewards.includes(st.id)) return;
  w.rewards.push(st.id); saveApp();
  setTimeout(()=>showSetReward(st.id),2600);
}
function showSetReward(sid){
  const st=outfitSet(sid); if(!st) return;
  showStory(st.rewardTitle,st.reward);
  const b=document.getElementById('story-bubble');
  const nm=b.querySelector('.story-snack-name');
  if(nm&&st.rewardImg) nm.insertAdjacentHTML('afterend','<img class="set-reward-img" src="./outfits/'+st.rewardImg+'.webp" alt="">');
}

// ---- 衣柜 ----
function openWardrobe(){
  renderWardrobe();
  document.getElementById('overlay-wardrobe').classList.add('show');
}
function closeWardrobe(){document.getElementById('overlay-wardrobe').classList.remove('show');}
function renderWardrobe(){
  const w=wardrobeData();
  const have=OUTFITS.filter(o=>w.owned.includes(o.id)).length;
  document.getElementById('wardrobe-count').textContent='已经有 '+have+' / '+OUTFITS.length+' 件';
  const cell=(id,src,name,on,locked,click,story)=>'<div class="wd-item'+(on?' on':'')+(locked?' locked':'')+'" onclick="'+(locked?'wardrobeLocked()':click)+'">'
    +'<div class="wd-img"><img src="'+src+'" loading="lazy" alt=""></div>'
    +'<div class="wd-name">'+(locked?'？？？':name)+'</div>'+(on?'<div class="wd-on">穿着</div>':'')
    +(story&&!locked?'<div class="wd-story" onclick="event.stopPropagation();'+story+'">故事</div>':'')+'</div>';
  let h=cell('',ABEBE_DEFAULT_IMG,'原来的样子',!w.wearing,false,'wearOutfit(\'\')','');
  const done={};
  OUTFITS.forEach(o=>{
    const st=setOfOutfit(o);
    if(st&&st.kind==='bundle'){
      if(done[st.id]) return; done[st.id]=1;
      const wearingHere=st.items.includes(w.wearing);
      const show=outfitById(wearingHere?w.wearing:st.items[0]);
      const owned=st.items.every(i=>w.owned.includes(i));
      h+=cell(st.id,outfitThumb(show),st.name+'<span class="wd-multi">'+st.items.length+'件</span>',wearingHere,!owned,'openSetPicker(\''+st.id+'\')','');
      return;
    }
    h+=cell(o.id,outfitThumb(o),o.name,w.wearing===o.id,!w.owned.includes(o.id),'wearOutfit(\''+o.id+'\')',w.seen.includes(o.id)?'rereadStory(\''+o.id+'\')':'');
    if(st&&st.kind==='collect'&&o.id===st.items[st.items.length-1]&&w.rewards.includes(st.id)){
      h+='<div class="wd-item wd-reward" onclick="closeWardrobe();showSetReward(\''+st.id+'\')"><div class="wd-img"><img src="./outfits/'+st.rewardImg+'.webp" alt=""></div><div class="wd-name">'+st.rewardTitle+'</div></div>';
    }
  });
  document.getElementById('wardrobe-grid').innerHTML=h;
}
// 一组的衣服：点开挑穿哪件
function openSetPicker(sid){
  const st=outfitSet(sid); if(!st) return;
  const w=wardrobeData();
  let m=document.getElementById('wd-picker');
  if(!m){m=document.createElement('div');m.id='wd-picker';m.className='wd-picker-mask';m.onclick=e=>{if(e.target===m) closeSetPicker();};document.body.appendChild(m);}
  m.innerHTML='<div class="wd-picker"><div class="wd-picker-title">'+st.name+'</div><div class="wd-picker-row">'
    +st.items.map(outfitById).map(o=>'<div class="wd-item'+(w.wearing===o.id?' on':'')+'" onclick="closeSetPicker();wearOutfit(\''+o.id+'\')">'
      +'<div class="wd-img"><img src="'+outfitThumb(o)+'" alt=""></div><div class="wd-name">'+o.name+'</div>'
      +(w.wearing===o.id?'<div class="wd-on">穿着</div>':'')
      +(w.seen.includes(o.id)?'<div class="wd-story" onclick="event.stopPropagation();closeSetPicker();rereadStory(\''+o.id+'\')">故事</div>':'')+'</div>').join('')
    +'</div><div class="wd-picker-hint">穿哪件呢</div></div>';
  requestAnimationFrame(()=>m.classList.add('show'));
}
function closeSetPicker(){const m=document.getElementById('wd-picker');if(m) m.classList.remove('show');}
// 已经看过的故事可以再看
function rereadStory(id){
  const o=outfitById(id); if(!o||!wardrobeData().seen.includes(id)) return;
  closeWardrobe();
  showStory(o.name,o.story);
}
function wardrobeLocked(){showRepeatLine('这件还没买呢，小香兔子有卖');}
function wearOutfit(id){
  const w=wardrobeData();
  if(id&&!w.owned.includes(id)) return;
  w.wearing=id||'';
  applyOutfit();
  saveApp();
  closeWardrobe();
  const o=outfitById(id);
  if(!o){if(typeof showBubble==='function') showBubble('阿贝贝脱下了小衣服，伸了个懒腰：\'还是光溜溜最舒服\'');return;}
  if(!w.seen.includes(id)){
    w.seen.push(id);saveApp();
    showStory(o.name,o.story);
  }else if(typeof showBubble==='function'){
    showBubble(o.lines[Math.floor(Math.random()*o.lines.length)]);
  }
}
whenReady(applyOutfit);
