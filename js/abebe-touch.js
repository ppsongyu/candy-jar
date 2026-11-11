/* 阿贝贝页手势版（2026-11-08）
   点一下=戳戳，来回划=梳毛，按住不放=亲亲（指尖冒一群淡淡的小爱心），
   一阵子不碰她就自己发呆（气泡下面是一串小泡泡），换衣服时软软的云团把她包起来。
   这里会替换 abebe.js 的 showBubble、extras.js 的 startIdleChatter、wardrobe.js 的 applyOutfit / openWardrobe，
   所以要放在 wardrobe.js 后面加载。 */

const AB_POKE_MORE=["再戳……再戳我就要咬手指了哦","阿贝贝把脸埋进爪子里：不给戳了","阿贝贝鼓起腮帮子，瞪了你一眼","戳戳戳，你是啄木鸟吗","阿贝贝转过身去，只给你看后脑勺"];
const AB_POKE_MAX=["哼！阿贝贝生气了，要一根胡萝卜才能哄好","阿贝贝跺了跺脚：我要告诉爸爸！","阿贝贝缩成一个球，谁也不理","不理你了不理你了不理你了"];
const AB_ANGRY_START=["哼！阿贝贝生气了，要一根胡萝卜才能哄好","阿贝贝跺了跺脚：我要告诉爸爸！","不理你了不理你了不理你了","阿贝贝把头一扭：今天不跟你好了"];
const AB_ANGRY_POKE=["还戳！","阿贝贝把脸埋进耳朵里，假装这里没有兔子","哼。","阿贝贝背着手，看天花板","不听不听，兔子念经","阿贝贝小声说：再戳我就哭给你看","阿贝贝在心里给你记了一笔","现在是生气时间，请勿打扰"];
const AB_ANGRY_GROOM=["别以为梳毛我就原谅你了","……左边一点。不是，我是说，哼","阿贝贝眯了一下眼睛，又赶紧瞪回去","梳得还行。但我还在生气","阿贝贝的耳朵偷偷软下来了，她自己没发现"];
const AB_FORGIVE=["……那好吧，就原谅你这一次","阿贝贝憋了半天，还是笑了","哼，下不为例","阿贝贝把脸凑过来：那你再亲一下","原谅你了。但是胡萝卜还是要给的"];
const AB_GRUDGE=["你刚才戳了我十下，我都记着呢","又来？我还没完全消气哦","阿贝贝翻出小本本：某年某月某日，有人戳我","戳一下可以，戳十下不行"];
const AB_WAKE=["啊？我刚刚……没在发呆哦","阿贝贝一激灵，耳朵竖了起来","嗯？你叫我啦？","阿贝贝眨眨眼，好像刚从很远的地方回来"];
const AB_GROOM_DONE=["阿贝贝的毛被梳得蓬蓬的，像一朵云","阿贝贝舒服得眯起眼，差点睡着了","阿贝贝转了一圈给你看：香香的！"];
const AB_CLOUD_LINES=["阿贝贝钻进云朵里换衣服啦，不许偷看","云朵里面窸窸窣窣的……","阿贝贝说：等一下等一下，扣子扣歪了","云朵鼓了一下，好像有只爪子在里面乱挥","嘘——阿贝贝在挑配哪双袜子","云朵缝里露出一只耳朵，又缩回去了","阿贝贝小声说：你先闭上眼睛"];
const AB_CHANGED=["当当！好看吗","阿贝贝原地转了个圈，差点把自己转晕","阿贝贝低头看看自己，又抬头看看你","新衣服！阿贝贝站得直直的给你看"];
const AB_HEART='<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.7C19.5 15.9 12 20.5 12 20.5z" fill="currentColor" stroke="#fff" stroke-width="1.2"/></svg>';
const AB_HEART_SOFT='<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.7C19.5 15.9 12 20.5 12 20.5z" fill="currentColor" opacity=".55"/></svg>';
const AB_PUFFS=[[2,12,42],[34,0,46],[58,16,40],[0,44,44],[28,30,56],[60,48,40],[12,66,40],[46,64,42]];

let abWearing=false, abPendingLine=null, abBubT=null, abEntering=false;
let abDazing=false, abIdleT=null, abDazeTalkT=null;
let abPokeTimes=[], abAngryUntil=0, abForgivenAt=0, abAngryGroom=0;
const AB_ANGRY_MS=120000, AB_GRUDGE_MS=60000;
const abAngry=()=>Date.now()<abAngryUntil;
function abSetAngry(on){
  const st=abEl('abebe-bunny'); if(st) st.classList.toggle('angry',on);
  if(on){abAngryUntil=Date.now()+AB_ANGRY_MS;abAngryGroom=0;clearTimeout(abSetAngry._t);abSetAngry._t=setTimeout(()=>{if(!abAngry()) abSetAngry(false);},AB_ANGRY_MS+50);}
  else{abAngryUntil=0;}
}
function abForgive(){
  abSetAngry(false); abForgivenAt=Date.now(); abPokeTimes=[];
  abAnim('shy'); showBubble(randFrom(AB_FORGIVE));
  abebeState.mood=Math.min(100,abebeState.mood+6); renderAbebeStatus(); saveApp();
}
const abEl=id=>document.getElementById(id);
const abImg=()=>document.querySelector('#abebe-bunny .abebe-img');
const abPageOn=()=>{const p=abEl('page-abebe');return p&&p.classList.contains('active');};

// ---- 气泡：飘在头顶，说完淡掉；换衣服时先憋着，换好了再说 ----
showBubble=function(text,think){
  const b=abEl('abebe-speech'); if(!b||!text) return;
  if(abWearing){abPendingLine=text;return;}
  clearTimeout(abBubT);
  const had=b.classList.contains('visible');
  b.classList.remove('visible');
  setTimeout(()=>{b.textContent=text;b.classList.toggle('think',!!think);abFitBubble(b);b.classList.add('visible');},had?140:30);
  abBubT=setTimeout(()=>b.classList.remove('visible'),2800+String(text).length*90);
};

/* 字多的时候气泡往上长会顶出页面：先缩小字、放宽一点；还放不下就限高，能用手指往上滑着看 */
function abFitBubble(b){
  b.classList.remove('long');b.style.maxHeight='';b.scrollTop=0;
  const pg=b.closest('.abebe-page-bg'); if(!pg) return;
  const dr=abEl('dream-btn');
  let lim=pg.getBoundingClientRect().top+10;
  if(dr&&dr.offsetParent) lim=Math.max(lim,dr.getBoundingClientRect().bottom+6);
  if(b.getBoundingClientRect().top>=lim) return;
  b.classList.add('long');
  const r=b.getBoundingClientRect();
  if(r.top<lim) b.style.maxHeight=Math.max(80,r.bottom-lim)+'px';
}

function abAnim(cls){
  const img=abImg(); if(!img) return;
  img.classList.remove('poke','grumpy','shy','wake'); void img.offsetWidth; img.classList.add(cls);
  setTimeout(()=>img.classList.remove(cls),750);
  const sc={poke:'squish',grumpy:'squish',shy:'hop',wake:'hop'}[cls], sh=abEl('abebe-shadow');
  if(sc&&sh){sh.classList.remove('hop','squish');void sh.offsetWidth;sh.classList.add(sc);setTimeout(()=>sh.classList.remove(sc),600);}
}
function abFx(){return abEl('abebe-fx');}
function abRipple(x,y){const r=document.createElement('div');r.className='abebe-ripple';r.style.left=x+'px';r.style.top=y+'px';abFx().appendChild(r);setTimeout(()=>r.remove(),520);}
function abFluff(x,y){
  const fx=abFx(),f=document.createElement('div');f.className='abebe-fluff';
  const s=3+Math.random()*4;f.style.width=s*1.6+'px';f.style.height=s+'px';f.style.left=x+'px';f.style.top=y+'px';fx.appendChild(f);
  f.animate([{transform:'translate(0,0) rotate(0)',opacity:.95},{transform:`translate(${(Math.random()-.5)*40}px,${-20-Math.random()*40}px) rotate(${(Math.random()-.5)*180}deg)`,opacity:0}],{duration:900+Math.random()*500,easing:'ease-out'}).onfinish=()=>f.remove();
  if(Math.random()<.35){
    const sp=document.createElement('div');sp.className='abebe-spark';
    sp.innerHTML='<svg viewBox="0 0 10 10"><path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4z" fill="currentColor"/></svg>';
    sp.style.left=(x+(Math.random()-.5)*16)+'px';sp.style.top=(y+(Math.random()-.5)*16)+'px';fx.appendChild(sp);
    sp.animate([{transform:'scale(0)',opacity:0},{transform:'scale(1.2)',opacity:1,offset:.4},{transform:'scale(0)',opacity:0}],{duration:700}).onfinish=()=>sp.remove();
  }
}
function abBurstHearts(x,y){
  const fx=abFx();
  for(let i=0;i<13;i++){
    const h=document.createElement('div');h.className='abebe-heart';h.innerHTML=Math.random()<.5?AB_HEART:AB_HEART_SOFT;
    const s=.45+Math.random()*.8;h.style.left=x+'px';h.style.top=y+'px';fx.appendChild(h);
    const ang=-Math.PI/2+(Math.random()-.5)*2.4,dist=50+Math.random()*90;
    const dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist-30-Math.random()*40,op=.35+Math.random()*.4,rot=(Math.random()-.5)*50;
    h.animate([
      {transform:`translate(0,0) scale(${s*.3})`,opacity:0},
      {transform:`translate(${dx*.4}px,${dy*.4}px) scale(${s}) rotate(${rot*.4}deg)`,opacity:op,offset:.25},
      {transform:`translate(${dx+(Math.random()-.5)*20}px,${dy}px) scale(${s*.9}) rotate(${rot}deg)`,opacity:0}
    ],{duration:1400+Math.random()*900,easing:'cubic-bezier(.2,.7,.3,1)',delay:i*35}).onfinish=()=>h.remove();
  }
}

// ---- 发呆：一阵子不碰她，她自己放空；一碰就回神 ----
startIdleChatter=function(){
  clearTimeout(abIdleT);clearTimeout(abDazeTalkT);
  if(!abPageOn()||abWearing) return;
  abIdleT=setTimeout(abStartDaze,18000);
};
function abStartDaze(){
  if(!abPageOn()||abWearing) return;
  if(abAngry()){startIdleChatter();return;}
  abDazing=true; const img=abImg(); if(img) img.classList.add('daze');
  abebeState.mood=Math.min(100,abebeState.mood+3);
  showBubble((typeof tummyLineNow==='function'&&tummyLineNow(0.5))||randFrom(abebeLines.dazed),true);
  const talk=()=>{abDazeTalkT=setTimeout(()=>{
    if(!abDazing||!abPageOn()) return;
    const h=new Date().getHours();
    showBubble((typeof tummyLineNow==='function'&&tummyLineNow(0.6))||randFrom((h>=22||h<6)?idleLinesNight:idleLinesDay),true);
    talk();
  },16000+Math.random()*10000);};
  talk();
}
function abWake(){
  if(!abDazing) return false;
  abDazing=false; const img=abImg(); if(img) img.classList.remove('daze');
  abAnim('wake'); showBubble(randFrom(AB_WAKE)); return true;
}

// ---- 戳戳：连着戳多了会烦 ----
function abPoke(x,y){
  abRipple(x,y);
  if(abAngry()){abAnim('grumpy');showBubble(randFrom(AB_ANGRY_POKE));abAngryUntil=Math.max(abAngryUntil,Date.now()+30000);return;}
  const now=Date.now(); abPokeTimes=abPokeTimes.filter(t=>now-t<8000); abPokeTimes.push(now);
  const n=abPokeTimes.length;
  if(abForgivenAt&&now-abForgivenAt<AB_GRUDGE_MS&&n===1){abAnim('grumpy');showBubble(randFrom(AB_GRUDGE));return;}
  if(n>=10){
    abAnim('grumpy'); abSetAngry(true);
    abebeState.mood=Math.max(5,abebeState.mood-4);
    showBubble(randFrom(AB_ANGRY_START)); renderAbebeStatus(); saveApp();
  }else if(n>=6){abAnim('grumpy');showBubble(randFrom(AB_POKE_MORE));}
  else{abAnim('poke'); abebeAction('poke');}
}

// ---- 手势 ----
(function(){
  const LP_DELAY=180, LP_FULL=720, MOVE_TOL=12;
  let g=null;
  function pos(e,el){const r=el.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function cancelCharge(){
    if(!g) return; clearTimeout(g.fullT);
    if(g.charge){const c=g.charge;c.classList.remove('grow');c.classList.add('shrink');setTimeout(()=>c.remove(),260);g.charge=null;}
  }
  function end(e){
    if(!g||e.pointerId!==g.id) return;
    clearTimeout(g.lpT);
    if(g.mode==='kiss') cancelCharge();
    if(!g.mode&&!g.woke&&Date.now()-g.t<350) abPoke(g.lx,g.ly);
    if(g.mode==='groom'&&!g.groomSaid&&g.path>90){if(abAngry()) showBubble(randFrom(AB_ANGRY_GROOM)); else abebeAction('groom');}
    const img=abImg(); if(img) img.classList.remove('comb');
    g=null; startIdleChatter();
  }
  function bind(){
    const bunny=abEl('abebe-bunny'); if(!bunny||bunny._abBound) return; bunny._abBound=true;
    bunny.addEventListener('pointerdown',e=>{
      if(e.target.closest&&e.target.closest('.abebe-speech.long')) return; /* 长气泡留给手指滑着看 */
      e.preventDefault(); if(abWearing) return;
      try{bunny.setPointerCapture(e.pointerId);}catch(_){}
      const hint=abEl('abebe-hint'); if(hint) hint.classList.remove('on');
      const woke=abWake(), p=pos(e,bunny);
      g={id:e.pointerId,sx:p.x,sy:p.y,lx:p.x,ly:p.y,t:Date.now(),path:0,mode:null,woke,fluffAcc:0,groomSaid:false,groomDone:false,charge:null};
      g.lpT=setTimeout(()=>{
        if(!g||g.mode) return;
        g.mode='kiss';
        const c=document.createElement('div');c.className='abebe-charge';c.innerHTML=AB_HEART;
        c.style.left=g.lx+'px';c.style.top=(g.ly-26)+'px';abFx().appendChild(c);
        requestAnimationFrame(()=>c.classList.add('grow')); g.charge=c;
        g.fullT=setTimeout(()=>{
          if(!g||g.mode!=='kiss') return;
          c.remove(); g.charge=null; g.mode='kissed';
          abBurstHearts(g.lx,g.ly-26);
          if(abAngry()) abForgive(); else {abAnim('shy'); abebeAction('kiss');}
        },LP_FULL);
      },LP_DELAY);
      clearTimeout(abIdleT);clearTimeout(abDazeTalkT);
    });
    bunny.addEventListener('pointermove',e=>{
      if(!g||e.pointerId!==g.id) return;
      const p=pos(e,bunny), d=Math.hypot(p.x-g.lx,p.y-g.ly);
      g.path+=d; g.lx=p.x; g.ly=p.y;
      const far=Math.hypot(p.x-g.sx,p.y-g.sy)>MOVE_TOL;
      if(g.mode==='kiss'&&far){cancelCharge();g.mode='groom';}
      if(!g.mode&&far){clearTimeout(g.lpT);g.mode='groom';}
      if(g.mode==='groom'){
        const img=abImg(); if(img) img.classList.add('comb');
        g.fluffAcc+=d; while(g.fluffAcc>14){g.fluffAcc-=14;abFluff(p.x,p.y);}
        if(abAngry()){
          abAngryGroom+=d;
          if(!g.groomSaid&&g.path>320){g.groomSaid=true;showBubble(randFrom(AB_ANGRY_GROOM));}
          if(abAngryGroom>1800){abForgive();g.groomDone=true;}
        }else{
          if(!g.groomSaid&&g.path>320){g.groomSaid=true;abebeAction('groom');}
          if(g.groomSaid&&!g.groomDone&&g.path>1100){g.groomDone=true;abebeState.mood=Math.min(100,abebeState.mood+3);showBubble(randFrom(AB_GROOM_DONE));renderAbebeStatus();}
        }
      }
    });
    bunny.addEventListener('pointerup',end);
    bunny.addEventListener('pointercancel',end);
    bunny.addEventListener('contextmenu',e=>e.preventDefault());
  }
  whenReady(bind);
})();

// ---- 换衣服：云团把她包起来，图下好了再散开 ----
function abShowCloud(){
  const c=abEl('abebe-cloud'), t=abEl('abebe-ctext'); if(!c) return;
  abEl('abebe-cline').textContent=randFrom(AB_CLOUD_LINES);
  c.classList.remove('out');
  const ps=c.querySelectorAll('i');
  ps.forEach((p,k)=>{const [x,y,w]=AB_PUFFS[k];p.style.left=x+'%';p.style.top=y+'%';p.style.width=w+'%';p.style.height=w+'%';
    p.style.transition='none';p.style.transform=`translate(${(x+w/2-50)*3}%,${(y+w/2-50)*3}%) scale(.4)`;p.style.animationDelay=(-k*.37)+'s';});
  void c.offsetWidth;
  ps.forEach((p,k)=>{p.style.transition='';setTimeout(()=>p.style.transform='translate(0,0) scale(1)',k*45);});
  c.classList.add('on'); setTimeout(()=>t.classList.add('on'),250);
}
function abHideCloud(){
  const c=abEl('abebe-cloud'), t=abEl('abebe-ctext'); if(!c) return;
  t.classList.remove('on');
  c.querySelectorAll('i').forEach(p=>{const x=parseFloat(p.style.left),y=parseFloat(p.style.top),w=parseFloat(p.style.width);p.style.transform=`translate(${(x+w/2-50)*3}%,${(y+w/2-50)*3}%) scale(1.3)`;});
  c.classList.add('out'); setTimeout(()=>c.classList.remove('on','out'),850);
}
(function(){
  const plainApply=applyOutfit;
  function targetSrc(){
    const w=wardrobeData(), ce=candyWearing();
    const o=ce?candyOutfitById(ce.id):outfitById(w.wearing);
    return o?outfitImg(o):ABEBE_DEFAULT_IMG;
  }
  applyOutfit=function(){
    const img=abImg();
    if(!img||!abPageOn()||abWearing||abEntering){plainApply();return;}
    candyExpireCheck();
    const src=targetSrc();
    if(img.getAttribute('src')===src) return;
    abWearing=true; abPendingLine=null;
    clearTimeout(abBubT); const b=abEl('abebe-speech'); if(b) b.classList.remove('visible');
    if(abDazing){abDazing=false;img.classList.remove('daze');}
    clearTimeout(abIdleT);clearTimeout(abDazeTalkT);
    abShowCloud();
    const t0=Date.now(); let done=false;
    const finish=()=>{if(done) return; done=true;
      setTimeout(()=>{img.setAttribute('src',src);
        setTimeout(()=>{abHideCloud();
          setTimeout(()=>{
            abAnim('wake');
            const r=abEl('abebe-bunny').getBoundingClientRect();
            for(let i=0;i<10;i++) setTimeout(()=>abFluff(r.width*(.3+Math.random()*.4),r.height*(.25+Math.random()*.45)),i*40);
            abWearing=false;
            const line=abPendingLine; abPendingLine=null;
            showBubble(line||randFrom(AB_CHANGED));
            startIdleChatter();
          },350);
        },150);
      },Math.max(0,1600-(Date.now()-t0)));};
    const pre=new Image(); pre.onload=finish; pre.onerror=finish; pre.src=src; setTimeout(finish,8000);
  };
  // 打开衣柜时，先把已经有的衣服大图偷偷下载好，点"换上"就快
  const plainOpen=openWardrobe, seen={};
  openWardrobe=function(){
    plainOpen.apply(this,arguments);
    try{
      const w=wardrobeData();
      OUTFITS.filter(o=>w.owned.includes(o.id)).forEach(o=>{const s=outfitImg(o);if(seen[s])return;seen[s]=new Image();seen[s].src=s;});
    }catch(e){}
  };
})();

// ---- 进阿贝贝页时：晚上摇得慢一点；手势小提示只出现前三次 ----
(function(){
  const plainEnter=enterAbebe;
  enterAbebe=function(){
    abEntering=true;
    try{plainEnter.apply(this,arguments);}finally{abEntering=false;}
    const img=abImg(), h=new Date().getHours();
    if(img) img.classList.toggle('night',h>=22||h<6);
    try{
      const n=+(localStorage.getItem('abebeGestureHint')||0);
      if(n<3){localStorage.setItem('abebeGestureHint',n+1);const el=abEl('abebe-hint');
        setTimeout(()=>el&&el.classList.add('on'),900);setTimeout(()=>el&&el.classList.remove('on'),9000);}
    }catch(e){}
  };
})();
