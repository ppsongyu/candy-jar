/* 阿贝贝的衣柜：小香兔子卖衣服，买了进衣柜，点一件就换到阿贝贝页上 */
// 存在 snackData.wardrobe：owned 买过的、wearing 正在穿的、seen 已经看过第一次穿的故事
const ABEBE_DEFAULT_IMG='./愉快阿贝贝.png';
function outfitImg(o){return './outfits/'+o.id+'.webp';}
function outfitThumb(o){return './outfits/'+o.id+'_s.webp';}
function outfitById(id){return OUTFITS.find(o=>o.id===id);}
function wardrobeData(){
  if(!snackData.wardrobe) snackData.wardrobe={owned:[],wearing:'',seen:[]};
  const w=snackData.wardrobe;
  if(!Array.isArray(w.owned)) w.owned=[];
  if(!Array.isArray(w.seen)) w.seen=[];
  return w;
}
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
function outfitShopHtml(balance){
  return '<div class="shop-outfit-title">小衣服</div>'+OUTFITS.map(o=>{
    const own=ownsOutfit(o.id);
    return '<div class="shop-item'+(own?' outfit-owned':'')+'" onclick="'+(own?'openWardrobe()':'tryBuyOutfit(\''+o.id+'\')')+'">'
      +'<div class="shop-item-img"><img class="shop-item-placeholder" src="'+outfitThumb(o)+'" loading="lazy">'
      +(own?'<div class="shop-item-weekend">已拥有</div>':'')+'</div>'
      +'<div class="shop-item-info"><div class="shop-item-name">'+o.name+'</div>'
      +'<div class="shop-item-price">'+(own?'<span class="shop-stocking">在衣柜里</span>':o.price+' 币')+'</div>'
      +(own?'<div class="shop-feed-btn" onclick="event.stopPropagation();openWardrobe()">去衣柜</div>':'')
      +'</div></div>';
  }).join('');
}
function tryBuyOutfit(id){
  const o=outfitById(id); if(!o||ownsOutfit(id)) return;
  const balance=getSnackBalance();
  pendingSnackId='__outfit:'+id;
  const textEl=document.getElementById('snack-confirm-text');
  const btnBuy=document.getElementById('snack-buy-btn');
  let html='<div class="dad-label">爸爸说：</div><div class="dad-words">'+o.dad+'</div>';
  if(balance<o.price){html+='<div class="dad-price">'+o.name+' · '+o.price+' 币（余额不足）</div>';btnBuy.disabled=true;btnBuy.textContent='币不够啦';}
  else{html+='<div class="dad-price">'+o.name+' · '+o.price+' 币</div>';btnBuy.disabled=false;btnBuy.textContent='买给她！';}
  textEl.innerHTML=html;
  document.getElementById('snack-confirm-mask').classList.add('show');
}
function buyOutfit(id){
  const o=outfitById(id); if(!o||ownsOutfit(id)) return;
  if(getSnackBalance()<o.price) return;
  const lines=['买好啦！「'+o.name+'」挂进衣柜了'];
  lines.push(snackSpend(o.price));
  wardrobeData().owned.push(id);
  lines.push(snackStamp('mei'));
  saveApp();renderShop();snackNotice(lines);
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
  const cell=(id,src,name,on,locked)=>'<div class="wd-item'+(on?' on':'')+(locked?' locked':'')+'" onclick="'+(locked?'wardrobeLocked()':'wearOutfit(\''+id+'\')')+'">'
    +'<div class="wd-img"><img src="'+src+'" loading="lazy" alt=""></div>'
    +'<div class="wd-name">'+(locked?'？？？':name)+'</div>'+(on?'<div class="wd-on">穿着</div>':'')+'</div>';
  let h=cell('',ABEBE_DEFAULT_IMG,'原来的样子',!w.wearing,false);
  OUTFITS.forEach(o=>{h+=cell(o.id,outfitThumb(o),o.name,w.wearing===o.id,!w.owned.includes(o.id));});
  document.getElementById('wardrobe-grid').innerHTML=h;
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
