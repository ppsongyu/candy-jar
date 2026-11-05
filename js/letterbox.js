/* 信盒：写给未来的信（Bond 页「time capsule」那一格点进去）。样式在 css/letterbox.css。
   数据还是 timeCapsules（store.js 存云端和本机），每封信长这样：
   {id, label 信名, date 开封日, text 正文, written 写的那天（旧信是空的）,
    from/to 写信人收信人 '雨'|'克', sal 称呼, close 落款前自己写的一句, sign 署名,
    paper 纸色, pat 花样, ink 墨水, stamp 邮票, seal 火漆颜色, tilt/pm 邮票歪多少和邮戳位置,
    opened 拆过没有, openedAt 第一次拆开那天, v:2}
   规矩：没拆的信不能改只能删；拆过的能改能删。信盒按写的时间排，最上面最久（旧信没有日期，排最上面）。 */

/* ---------- 纸：颜色、纸感、花样、墨水 ---------- */
function lbSvgUrl(inner,w,h){return 'url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">'+inner+'</svg>')+'")';}
function lbNoise(freq,oct,rgb,a,id){return '<filter id="'+id+'"><feTurbulence type="fractalNoise" baseFrequency="'+freq+'" numOctaves="'+oct+'" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 '+rgb[0]+' 0 0 0 0 '+rgb[1]+' 0 0 0 0 '+rgb[2]+' 0 0 0 '+a+' 0"/></filter><rect width="100%" height="100%" filter="url(#'+id+')"/>';}
const LB_TEX={
  cotton:lbSvgUrl(lbNoise('1.3',3,[.42,.39,.34],.07,'a')+lbNoise('0.012 0.45',2,[.5,.46,.4],.05,'b'),180,180),      // 棉纸：细纹+长纤维
  soft:lbSvgUrl(lbNoise('0.035',3,[.5,.42,.42],.06,'a')+lbNoise('1.2',2,[.4,.36,.34],.06,'b'),220,220),            // 毛边纸：云絮
  laid:lbSvgUrl('<g opacity=".05" stroke="#3c3c50" stroke-width=".6">'+Array.from({length:30},(_,i)=>'<line x1="0" x2="160" y1="'+(i*4+2)+'" y2="'+(i*4+2)+'"/>').join('')+'</g>'+lbNoise('1.2',3,[.36,.36,.42],.06,'a'),160,120), // 压纹：帘纹
  kraft:lbSvgUrl(lbNoise('0.9',3,[.35,.25,.15],.10,'a')+lbNoise('0.015 0.6',2,[.4,.28,.16],.09,'b')+'<filter id="c"><feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1"/><feColorMatrix values="0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .12 0 0 0 4 -2.55"/></filter><rect width="100%" height="100%" filter="url(#c)"/>',200,200) // 牛皮纸：纤维+颗粒
};
const LB_PAPERS={
  cream:{n:'奶白',c:'#F7F3EA',t:'cotton'},pink:{n:'淡粉',c:'#F5E1E4',t:'soft'},blue:{n:'雾蓝',c:'#DFE7EE',t:'laid'},
  apricot:{n:'杏黄',c:'#F4E7CC',t:'soft'},kraft:{n:'牛皮纸',c:'#E3D2B7',t:'kraft'},lilac:{n:'薰衣草',c:'#E7E1F0',t:'laid'}
};
const LB_INKS={graphite:{n:'深墨灰',c:'#4A4650'},blue:{n:'墨蓝',c:'#34477A'},red:{n:'赭红',c:'#8A4436'},green:{n:'墨绿',c:'#355A47'}};
function lbRule(hex,a){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;return 'rgba('+Math.round(r*.6)+','+Math.round(g*.58)+','+Math.round(b*.6)+','+(a||.22)+')';}
const LB_PATS={
  line:{n:'横线',img:c=>'linear-gradient(180deg,transparent 27px,'+lbRule(c)+' 27px,'+lbRule(c)+' 28px)',size:'100% 28px'},
  dot:{n:'点点',img:c=>'radial-gradient(circle at 1px 27px,'+lbRule(c,.45)+' 1px,transparent 1.4px)',size:'14px 28px'},
  grid:{n:'小方格',img:c=>'linear-gradient(180deg,transparent 13px,'+lbRule(c,.2)+' 13px,'+lbRule(c,.2)+' 14px),linear-gradient(90deg,transparent 13px,'+lbRule(c,.2)+' 13px,'+lbRule(c,.2)+' 14px)',size:'14px 14px'},
  blank:{n:'空白',img:()=>'none',size:'auto'}
};
function lbPaperVars(el,L){
  const P=LB_PAPERS[L.paper]||LB_PAPERS.cream,T=LB_PATS[L.pat]||LB_PATS.line;
  el.style.setProperty('--lb-paper',P.c);el.style.setProperty('--lb-tex',LB_TEX[P.t]);
  el.style.setProperty('--lb-pat',T.img(P.c));el.style.setProperty('--lb-patsize',T.size);
  el.style.setProperty('--lb-ink2',(LB_INKS[L.ink]||LB_INKS.graphite).c);
}

/* ---------- 邮票（宝宝克画的）、邮戳、火漆 ---------- */
const LB_STAMPS=[
 {id:'pine',n:'一枝松',bg:'#B9C6A8',art:'<path d="M10 40 Q22 28 31 9" stroke="#7A5E44" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+
   [[14,35],[18,30],[22,25],[25,20],[28,15]].map(([x,y])=>'<g stroke="#4E6B4A" stroke-width="1.2" stroke-linecap="round"><path d="M'+x+' '+y+' l-6 -3"/><path d="M'+x+' '+y+' l-5 -6"/><path d="M'+x+' '+y+' l6 -2"/><path d="M'+x+' '+y+' l4 -6"/></g>').join('')+'<circle cx="31" cy="9" r="1.6" fill="#6B8A5E"/>'},
 {id:'rain',n:'一滴雨',bg:'#CAD7E4',art:'<path d="M9 17 a6 6 0 0 1 6-6 a7 7 0 0 1 13 1 a5 5 0 0 1 3 9 h-19 a4 4 0 0 1 -3 -4z" fill="#F4F7FA"/><path d="M20 24 C20 24 13 32 13 37 a7 7 0 0 0 14 0 C27 32 20 24 20 24z" fill="#7E9CBB"/><path d="M16.5 36 a3.5 3.5 0 0 0 2.5 3.5" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 {id:'crab',n:'小螃蟹',bg:'#F2CFBF',art:'<g fill="#D8735C"><ellipse cx="20" cy="29" rx="10" ry="7"/><circle cx="8" cy="18" r="4"/><circle cx="32" cy="18" r="4"/></g><g stroke="#D8735C" stroke-width="2" stroke-linecap="round" fill="none"><path d="M11 25 L8 21"/><path d="M29 25 L32 21"/><path d="M11 32 l-5 3"/><path d="M29 32 l5 3"/><path d="M13 35 l-3 4"/><path d="M27 35 l3 4"/><path d="M17 23 v-4"/><path d="M23 23 v-4"/></g><path d="M5 16 l3 2 M35 16 l-3 2" stroke="#F2CFBF" stroke-width="1.4"/><circle cx="17" cy="18" r="1.8" fill="#3E3433"/><circle cx="23" cy="18" r="1.8" fill="#3E3433"/><path d="M18 31 q2 1.6 4 0" stroke="#8E4636" stroke-width="1" fill="none" stroke-linecap="round"/>'},
 {id:'abebe',n:'阿贝贝',bg:'#F3D5DE',art:'<ellipse cx="14" cy="13" rx="4" ry="10" fill="#fff" transform="rotate(-10 14 13)"/><ellipse cx="14" cy="13" rx="1.8" ry="7" fill="#F2AFC2" transform="rotate(-10 14 13)"/><ellipse cx="26" cy="13" rx="4" ry="10" fill="#fff" transform="rotate(12 26 13)"/><ellipse cx="26" cy="13" rx="1.8" ry="7" fill="#F2AFC2" transform="rotate(12 26 13)"/><ellipse cx="20" cy="30" rx="12" ry="10" fill="#fff"/><circle cx="15.5" cy="29" r="1.5" fill="#3E3433"/><circle cx="24.5" cy="29" r="1.5" fill="#3E3433"/><ellipse cx="12.5" cy="33" rx="2.4" ry="1.4" fill="#F5B9C9"/><ellipse cx="27.5" cy="33" rx="2.4" ry="1.4" fill="#F5B9C9"/><path d="M18.6 32.4 q1.4 1.4 2.8 0" stroke="#C47A8D" stroke-width="1" fill="none" stroke-linecap="round"/>'},
 {id:'candy',n:'一颗糖',bg:'#E8DBF0',art:'<path d="M9 24 L3 18 L4 30z" fill="#E6A9C2"/><path d="M31 24 L37 18 L36 30z" fill="#E6A9C2"/><ellipse cx="20" cy="24" rx="11" ry="8.5" fill="#F0B8CD"/><g stroke="#fff" stroke-width="2" opacity=".75"><path d="M14 17 l-2 14"/><path d="M20 15.5 l-2 17"/><path d="M26 17 l-2 14"/></g><ellipse cx="16" cy="20" rx="3" ry="1.4" fill="#fff" opacity=".7"/>'},
 {id:'moon',n:'月亮',bg:'#5C6683',art:'<path d="M23 9 a12 12 0 1 0 8 22 a10 10 0 1 1 -8 -22z" fill="#F2E4B8"/><path d="M30 12 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1z" fill="#F7EDCB"/><circle cx="11" cy="38" r=".9" fill="#F2E4B8"/><circle cx="33" cy="34" r=".7" fill="#F2E4B8"/>'},
 {id:'jar',n:'糖罐子',bg:'#F2E2C6',art:'<rect x="14" y="9" width="12" height="4" rx="1.2" fill="#C9A27A"/><path d="M13 14 h14 v2 q4 2 4 7 v12 q0 5 -5 5 h-12 q-5 0 -5 -5 v-12 q0 -5 4 -7z" fill="#fff" opacity=".85"/><circle cx="16" cy="33" r="3" fill="#F0B8CD"/><circle cx="23" cy="34" r="3" fill="#B9C6A8"/><circle cx="20" cy="28" r="3" fill="#CAD7E4"/><path d="M20 22.5 c-1.5-2 -4.5-.5 -3 1.8 l3 2.7 3-2.7 c1.5-2.3 -1.5-3.8 -3-1.8z" fill="#E28EA8"/>'},
 {id:'letter',n:'小信封',bg:'#D9E3D5',art:'<rect x="7" y="15" width="26" height="18" rx="1.5" fill="#fff"/><path d="M7 16 l13 10 13 -10" stroke="#B7AFA2" stroke-width="1.2" fill="none"/><path d="M20 29 c-1.2-1.7 -4-.4 -2.6 1.6 l2.6 2.2 2.6-2.2 c1.4-2 -1.4-3.3 -2.6-1.6z" fill="#D9735C"/>'}
];
function lbStamp(id){const s=LB_STAMPS.find(x=>x.id===id)||LB_STAMPS[0];
  return '<div class="lb-stamp"><svg viewBox="0 0 40 48"><rect width="40" height="48" fill="'+s.bg+'"/>'+s.art+'</svg></div>';}
function lbPostmark(txt,pm){pm=pm||[0,0,0];
  return '<svg class="lb-postmark" style="transform:translate('+pm[0]+'px,'+pm[1]+'px) rotate('+pm[2]+'deg)" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#5a5770" stroke-width="1.1"/><circle cx="20" cy="20" r="12.5" fill="none" stroke="#5a5770" stroke-width=".6"/><text x="20" y="22.5" text-anchor="middle" font-family="Courier New,monospace" font-size="6" fill="#5a5770">'+txt+'</text></svg>';}
const LB_SEALS={honey:['#E4D0A8','#BC9C6A'],caramel:['#BE8E64','#8C5E3D'],cocoa:['#86664F','#55402F']}; // 米黄、焦糖棕、深可可
let lbSealN=0;
function lbSeal(k){
  const id='lbsg'+(lbSealN++),C=LB_SEALS[k]||LB_SEALS.caramel;
  const c='<svg viewBox="0 0 46 46"><defs><radialGradient id="'+id+'" cx="40%" cy="35%"><stop offset="0" stop-color="'+C[0]+'"/><stop offset="1" stop-color="'+C[1]+'"/></radialGradient></defs><path d="M23 2 C30 1 33 6 38 8 C44 11 45 17 44 23 C45 30 41 34 38 38 C33 43 28 45 22 44 C15 45 10 41 7 37 C2 32 1 27 2 21 C2 14 6 9 11 6 C15 3 18 2 23 2z" fill="url(#'+id+')"/><circle cx="23" cy="23" r="13" fill="none" stroke="rgba(255,248,232,.38)" stroke-width="1.2"/><path d="M23 30 c-6-4.6 -9-7.4 -9-10.6 a4.6 4.6 0 0 1 9-1.6 a4.6 4.6 0 0 1 9 1.6 c0 3.2 -3 6 -9 10.6z" fill="none" stroke="rgba(255,248,232,.55)" stroke-width="1.4"/></svg>';
  return '<div class="lb-h l">'+c+'</div><div class="lb-h r">'+c+'</div>';}

/* ---------- 日期和名字 ---------- */
const LB_NAME={'雨':'宝宝雨','克':'宝宝克'};
const LB_MON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const LB_CN='〇一二三四五六七八九';
const LB_IND='　　';
function lbPd(s){const a=String(s).split('-');return new Date(+a[0],+a[1]-1,+a[2]);}
function lbToday(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function lbYmd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function lbOpens(s){const d=lbPd(s);return 'opens '+d.getDate()+' '+LB_MON[d.getMonth()]+' '+d.getFullYear();}
function lbDot(s){const d=lbPd(s);return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate();}
function lbCnNum(n){if(n<10)return LB_CN[n];if(n===10)return '十';if(n<20)return '十'+LB_CN[n-10];return LB_CN[Math.floor(n/10)]+'十'+(n%10?LB_CN[n%10]:'');}
function lbCnFull(s){const d=lbPd(s);return String(d.getFullYear()).split('').map(c=>LB_CN[+c]).join('')+'年'+lbCnNum(d.getMonth()+1)+'月'+lbCnNum(d.getDate())+'日';}
function lbLocked(L){return lbToday()<lbPd(L.date);}
function lbDaysLeft(L){return Math.round((lbPd(L.date)-lbToday())/864e5);}
function lbEsc(t){return String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function lbWho(L){return L.from&&L.to?LB_NAME[L.from]+' → '+LB_NAME[L.to]:'';}

/* ---------- 每封信的样子：封好时定一次，以后不变 ---------- */
function lbRnd(a,b){return a+Math.random()*(b-a);}
function lbDress(L){
  let ch=false;
  if(L.tilt==null){L.tilt=+lbRnd(-4,4).toFixed(1);ch=true;}
  if(!L.pm){L.pm=[Math.round(lbRnd(-8,4)),Math.round(lbRnd(-4,8)),Math.round(lbRnd(-25,25))];ch=true;}
  if(!L.seal){const k=Object.keys(LB_SEALS);L.seal=k[Math.floor(Math.random()*k.length)];ch=true;}
  return ch;
}
function lbGuessStamp(c,i){
  const t=(c.label||'')+(c.text||'');
  if(/100|一百/.test(c.label||''))return 'pine';
  if(/半年/.test(t))return 'moon';
  if(/周年|一年/.test(c.label||''))return 'jar';
  if(/生日/.test(t))return 'candy';
  if(/阿贝贝/.test(t))return 'abebe';
  return ['letter','rain','crab','abebe','candy'][i%5];
}
// 旧信（只有 date/label/text）补成新样子：奶白纸、横线、深墨灰，按内容配邮票；
// 已经到日子的旧信当作拆过了（以前就能看）；署名能认出是宝宝克写的就填，认不出先空着。
function lbNormalize(){
  let changed=false;
  timeCapsules.forEach((c,i)=>{
    if(!c.id){c.id='c'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,6);changed=true;}
    if(c.v!==2){
      c.paper=c.paper||'cream';c.pat=c.pat||'line';c.ink=c.ink||'graphite';
      c.stamp=c.stamp||lbGuessStamp(c,i);
      if(c.written===undefined)c.written='';
      if(c.opened===undefined){c.opened=!lbLocked(c);if(c.opened)c.openedAt='';}
      if(!c.from&&/宝宝克\s*$/.test(c.text||'')){c.from='克';c.to='雨';}
      c.v=2;changed=true;
    }
    if(lbDress(c))changed=true;
  });
  return changed;
}
function lbSorted(){
  return timeCapsules.map((c,i)=>({c,i})).sort((a,b)=>{
    const wa=a.c.written||'',wb=b.c.written||'';
    return wa<wb?-1:wa>wb?1:a.i-b.i;
  }).map(x=>x.c);
}

/* ---------- Bond 页那一格 ---------- */
function renderTimeCapsules(){
  if(lbNormalize()&&typeof appLoaded!=='undefined'&&appLoaded)saveApp();
  const ready=timeCapsules.filter(L=>!lbLocked(L)&&!L.opened).length;
  const c=document.getElementById('lbEntryCount'),d=document.getElementById('lbEntryDot');
  if(c)c.textContent='写给未来的信 · '+(timeCapsules.length?timeCapsules.length+' 封'+(ready?' · '+ready+' 封可以拆了':''):'还没有信');
  if(d)d.style.display=ready?'':'none';
  if(lbRoomOn()&&!lbBusy){const k=lbCenterIdx();lbBuild();lbGoTo(Math.min(k,lbList.length-1),false);}
}

/* ---------- 搭房间（第一次打开时才放进页面） ---------- */
function lbEnsureDom(){
  if(document.getElementById('lb'))return;
  const root=document.createElement('div');root.id='lb';
  root.innerHTML=`
<div class="lb-room" id="lbRoom">
  <div class="lb-top"><button class="lb-back" id="lbBack" aria-label="返回">‹</button><div class="lb-ttl"><b>写给未来的信</b><small id="lbCnt"></small></div><button class="lb-write" id="lbWriteBtn">写一封</button></div>
  <div class="lb-stage" id="lbStage"><div class="lb-box" id="lbBox"><div class="lb-deck" id="lbDeck"></div><div class="lb-scroller" id="lbSc"></div></div></div>
</div>
<div class="lb-tip" id="lbTip"></div>
<div class="lb-reader" id="lbReader"><div class="lb-sheet lb-papered" id="lbSheet">
  <button class="lb-x" id="lbRdClose">✕</button><button class="lb-x lb-more" id="lbRdMore">···</button>
  <div class="lb-menu" id="lbRdMenu"><button id="lbMEdit">修改</button><button id="lbMDel">删除</button></div>
  <div class="lb-body" id="lbRdBody"></div></div></div>
<div class="lb-writer" id="lbWriter">
  <div class="lb-wtop"><button id="lbWCancel">取消</button><div class="rt"><button class="lb-snd" id="lbSndBtn"></button><button class="lb-sealbtn" id="lbWSeal">封好</button></div></div>
  <div class="lb-wwrap"><div class="lb-wsheet lb-papered" id="lbWsheet"><div class="lb-wstamp" id="lbWstamp"></div>
    <div class="lb-wbody" id="lbWbody"><div style="height:44px"></div>
      <div class="lb-pad lb-lined" id="lbWpad">
        <input id="lbWSal" autocomplete="off"><textarea id="lbWText" rows="3"></textarea><div class="lb-row"></div>
        <input id="lbWClose" class="r" placeholder="这一行留给你自己写" autocomplete="off"><input id="lbWSign" class="r" autocomplete="off"><div class="lb-row r" id="lbWDate"></div>
      </div></div></div></div>
  <div class="lb-tools">
    <div class="lb-pop" id="lbPopPaper"><div class="lb-r2" id="lbPaperRow"></div><div class="lb-r2" id="lbPatRow"></div><div class="lb-r2" id="lbInkRow"></div></div>
    <div class="lb-pop" id="lbPopWho">
      <div class="lb-r2"><span class="lb-k">写信人</span><button class="lb-chip" data-f="雨">宝宝雨</button><button class="lb-chip" data-f="克">宝宝克</button></div>
      <div class="lb-r2"><span class="lb-k">收信人</span><button class="lb-chip" data-t="雨">宝宝雨</button><button class="lb-chip" data-t="克">宝宝克</button></div></div>
    <div class="lb-pop" id="lbPopStamp"><div class="lb-stgrid" id="lbStampGrid"></div></div>
    <div class="lb-bar"><button data-pop="lbPopPaper"><span class="lb-dotc" id="lbBarPaper"></span>信纸</button><button data-pop="lbPopWho" id="lbBarWho"></button><button data-pop="lbPopStamp"><span class="lb-mst" id="lbBarStamp"></span>邮票</button></div>
  </div>
</div>
<div class="lb-dlg" id="lbDlg"><div class="lb-dcard"><h3>封进信封之前</h3>
  <label>这封信叫什么</label><input id="lbDLabel" maxlength="16" placeholder="比如：给三十岁的宝宝雨">
  <label>什么时候可以拆开</label><input id="lbDDate" type="date">
  <div class="lb-btns"><button class="no" id="lbDNo">再想想</button><button class="ok" id="lbDOk">封进信封</button></div></div></div>
<div class="lb-dlg" id="lbAsk"><div class="lb-dcard"><h3 id="lbAskT"></h3><div class="s" id="lbAskS"></div>
  <div class="lb-btns"><button class="no" id="lbAskNo"></button><button class="ok" id="lbAskOk"></button></div></div></div>
<div class="lb-toast" id="lbToast"></div>`;
  document.body.appendChild(root);
  lbWire();
}
const lb$=id=>document.getElementById(id);
function lbRoomOn(){const r=lb$('lbRoom');return !!(r&&r.classList.contains('on'));}

/* ---------- 信盒 ---------- */
const LB_SLOT=110;
let lbH=170,lbItems=[],lbList=[];
function lbFront(L){
  const ready=!lbLocked(L)&&!L.opened,who=lbWho(L);
  return '<div class="lb-peek lb-papered'+(ready?' ready':'')+'"></div>'+
   '<div class="lb-env lb-front"><div class="lb-stamp-on" style="transform:rotate('+L.tilt+'deg)">'+lbStamp(L.stamp)+'</div>'+lbPostmark(L.written?lbDot(L.written).slice(2):'',L.pm)+
   '<div class="lb-addr"><div class="lb-lbl">'+lbEsc(L.label||'一封信')+'</div>'+(who?'<div class="lb-who">'+who+'</div>':'')+'<div class="lb-opens">'+lbOpens(L.date)+'</div></div>'+
   '<div class="lb-light"></div><div class="lb-topedge"></div></div>';
}
function lbBack(L){
  const who=lbWho(L);
  return '<div class="lb-env lb-backface"><svg class="lb-vline" viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M0 0 L50 28 L100 0" fill="rgba(255,255,255,.35)" stroke="rgba(110,105,95,.28)" stroke-width=".35" vector-effect="non-scaling-stroke"/><path d="M0 60 L42 31 M100 60 L58 31" stroke="rgba(110,105,95,.12)" stroke-width=".3" vector-effect="non-scaling-stroke" fill="none"/></svg>'+
    '<div class="lb-minis'+(L.opened?' cracked':'')+'">'+lbSeal(L.seal)+'</div>'+
    '<div class="lb-bl"><b>'+lbEsc(L.label||'一封信')+'</b>'+(who?'<small>'+who+'</small>':'')+'</div><div class="lb-light"></div></div>';
}
function lbBuild(){
  lbList=lbSorted();
  const box=lb$('lbBox'),sc=lb$('lbSc'),deck=lb$('lbDeck');
  const bw=box.clientWidth||340;lbH=Math.round(bw*0.84*0.6);
  deck.style.setProperty('--lb-envh',lbH+'px');sc.style.setProperty('--lb-slot',LB_SLOT+'px');
  const pad=Math.max(0,sc.clientHeight/2-LB_SLOT/2);
  sc.innerHTML='<div style="height:'+pad+'px"></div>'+lbList.map(()=>'<div class="lb-snap"></div>').join('')+'<div style="height:'+pad+'px"></div>';
  deck.innerHTML=lbList.length?lbList.map(L=>'<div class="lb-it"><div class="lb-shadow"></div><div class="lb-flip"><div class="lb-side">'+lbFront(L)+'</div><div class="lb-side lb-bks">'+lbBack(L)+'</div></div></div>').join('')
    :'<div class="lb-empty"><div>还没有信<br>写第一封吧<br><small>the box is waiting</small></div></div>';
  lbItems=[].slice.call(deck.querySelectorAll('.lb-it')).map((el,i)=>{
    lbPaperVars(el,lbList[i]);
    return {el,flip:el.querySelector('.lb-flip'),lf:el.querySelector('.lb-side:not(.lb-bks) .lb-light'),lb:el.querySelector('.lb-bks .lb-light'),sh:el.querySelector('.lb-shadow'),L:lbList[i],i};
  });
  lb$('lbCnt').textContent=timeCapsules.length+' letters';
  lbLayout();
}
// u = 离中间隔了几封：上面的正面往后仰，中间平放，下面的转过去露出背面
function lbAng(u){return u<=0?70*(1-Math.exp(1.6*u)):-128*(1-Math.exp(-1.45*u));}
function lbOff(u){const a=Math.abs(u),H=lbH;
  if(u<0){const A=H*0.5+26+H*0.3,S=H*0.6;return a<=1?u*A:-(A+(a-1)*S);}
  const B=H*0.5+22,T=H*0.56;return a<=1?u*B:(B+(a-1)*T);}
function lbLayout(){
  const sc=lb$('lbSc'),t=sc.scrollTop/LB_SLOT,ch=lb$('lbBox').clientHeight;
  lbItems.forEach(it=>{
    const u=it.i-t,a=Math.abs(u),off=lbOff(u);
    if(Math.abs(off)>ch/2+lbH){it.el.style.display='none';return;}
    it.el.style.display='';it.u=u;
    const th=lbAng(u);
    it.el.style.transform='translate3d(0,'+(ch/2+off-lbH/2).toFixed(1)+'px,0)';
    it.flip.style.transform='rotateX('+th.toFixed(2)+'deg)';
    it.el.style.zIndex=String(1000-Math.round(a*100));
    // 一盏灯在上方偏前：朝上的面亮一点，朝下的面暗一点
    const s=Math.sin(th*Math.PI/180),backShow=Math.abs(th)>90,up=backShow?-s:s;
    const ov=up>=0?'rgba(255,253,245,'+(up*0.10).toFixed(3)+')':'rgba(38,38,34,'+(-up*0.26).toFixed(3)+')';
    const lyr='linear-gradient(180deg,'+ov+','+ov+')';
    if(backShow)it.lb.style.background=lyr;else it.lf.style.background=lyr+',linear-gradient(180deg,rgba(30,30,26,'+(Math.min(a,1)*0.08).toFixed(3)+'),transparent 25%)';
    it.sh.style.opacity=(Math.max(0,1-a*1.4)*0.8).toFixed(2);
  });
}
function lbCenterIdx(){const sc=lb$('lbSc');return sc?Math.round(sc.scrollTop/LB_SLOT):0;}
function lbGoTo(i,smooth){if(i<0)return;lb$('lbSc').scrollTo({top:i*LB_SLOT,behavior:smooth?'smooth':'auto'});if(!smooth)lbLayout();}

let lbPrevTheme=null;
function lbOpen(){
  lbEnsureDom();lbNormalize();
  const m=document.querySelector('meta[name="theme-color"]');
  if(m){lbPrevTheme=m.content;m.content='#E4E2DD';}
  lb$('lbRoom').classList.add('on');
  requestAnimationFrame(()=>{
    lbBuild();
    const idx=lbList.findIndex(L=>!lbLocked(L)&&!L.opened);
    if(lbList.length)lbGoTo(idx<0?lbList.length-1:idx,false);
  });
}
function lbClose(){
  lb$('lbRoom').classList.remove('on');
  const m=document.querySelector('meta[name="theme-color"]');if(m&&lbPrevTheme!=null)m.content=lbPrevTheme;
  renderTimeCapsules();
}

/* ---------- 拿出一封信 ---------- */
let lbBusy=false,lbLift=null,lbSeq=[],lbSkip=null,lbHidden=null,lbCur=null;
function lbLater(fn,ms){lbSeq.push(setTimeout(fn,ms));}
function lbClearSeq(){lbSeq.forEach(clearTimeout);lbSeq=[];}
function lbOpenLetter(it){
  const L=it.L,r=it.flip.getBoundingClientRect();
  lbBusy=true;lbHidden=it;lbAc();
  it.el.style.visibility='hidden';
  const lift=document.createElement('div');lift.className='lb-lift';lbLift=lift;
  lift.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';
  lbPaperVars(lift,L);
  lift.innerHTML='<div class="lb-lshadow"></div><div class="lb-card3d"><div class="lb-face">'+lbFront(L)+'</div><div class="lb-face lb-backside"><div class="lb-bk"><div class="lb-wall"></div><div class="lb-paper lb-papered"></div><div class="lb-pocket"></div><div class="lb-flap"><div class="f1"></div><div class="f2"></div></div><div class="lb-seal'+(L.opened?' crack':'')+'">'+lbSeal(L.seal)+'</div></div></div></div>';
  lb$('lb').appendChild(lift);
  lb$('lbStage').classList.add('recede');
  const vw=innerWidth,vh=innerHeight,W=Math.min(vw-40,380),HH=W*0.6;
  lift.getBoundingClientRect();
  lift.style.left=(vw-W)/2+'px';lift.style.top=(vh-HH)/2-20+'px';lift.style.width=W+'px';lift.style.height=HH+'px';
  const ls=lift.querySelector('.lb-lshadow');ls.style.bottom='-34px';ls.style.filter='blur(24px)';ls.style.opacity='.8';
  if(lbLocked(L)){
    lbSkip=null;
    lbLater(()=>{lift.classList.add('shake');
      const tip=lb$('lbTip');tip.innerHTML='<b>还没到时候哦</b><br>还有 '+lbDaysLeft(L)+' 天<br><button class="lb-del" id="lbTipDel">删掉这封</button>';
      tip.style.top=((vh+HH)/2+30)+'px';tip.classList.add('on');
      lb$('lbTipDel').onclick=ev=>{ev.stopPropagation();lbClearSeq();lbAskDelete(L,ok=>{if(ok){tip.classList.remove('on');lbRemove(L);}else lbPutBack();});};
    },600);
    lbLater(lbPutBack,3200);
    return;
  }
  const bk=lift.querySelector('.lb-bk'),seal=lift.querySelector('.lb-seal'),first=!L.opened;
  lbLater(()=>lift.classList.add('flipped'),650);
  let t=1400;
  if(first){lbLater(()=>{seal.classList.add('crack');lbCrack();},t+150);t+=750;}else t+=200;
  lbLater(()=>{bk.classList.add('open');lbFlapSnd();},t);t+=700;
  lbLater(()=>{bk.classList.add('open2');bk.classList.add('rise');lbSlideSnd();},t);t+=900;
  lbLater(()=>lbShowReader(L),t);
  lbSkip=()=>{lbClearSeq();lbShowReader(L);};
}
function lbPutBack(){
  lb$('lbTip').classList.remove('on');
  const lift=lbLift;if(!lift)return;
  const r=lbHidden.flip.getBoundingClientRect();
  lift.classList.remove('shake');
  lift.style.left=r.left+'px';lift.style.top=r.top+'px';lift.style.width=r.width+'px';lift.style.height=r.height+'px';
  lift.querySelector('.lb-lshadow').style.opacity='0';
  lb$('lbStage').classList.remove('recede');
  lbLater(()=>{lbHidden.el.style.visibility='';lift.remove();lbLift=null;lbBusy=false;},560);
}
function lbRows(L){
  const rows=[];
  if(L.sal)rows.push({t:L.sal});
  String(L.text||'').split('\n').forEach(p=>rows.push({t:p}));
  if(L.sign||L.close){rows.push({t:''});if(L.close)rows.push({t:L.close,r:1});if(L.sign)rows.push({t:L.sign,r:1});if(L.written)rows.push({t:lbCnFull(L.written),r:1});}
  return rows;
}
function lbShowReader(L){
  lbSkip=null;lbCur=L;
  lbPaperVars(lb$('lbSheet'),L);
  const who=L.from&&L.to?LB_NAME[L.from]+' 写给 '+LB_NAME[L.to]:'';
  const meta=[who,L.openedAt?'<span class="mono">opened '+lbDot(L.openedAt)+'</span>':''].filter(Boolean).join(' · ');
  lb$('lbRdBody').innerHTML='<div class="lb-rdhead"><div class="l">'+lbEsc(L.label||'一封信')+'</div><div class="m">'+meta+'</div></div>'+
    '<div class="lb-pad lb-lined">'+lbRows(L).map(r=>'<div class="lb-row lb-ln'+(r.r?' r':'')+'">'+(lbEsc(r.t)||'&nbsp;')+'</div>').join('')+'</div>';
  lb$('lbRdBody').scrollTop=0;lb$('lbRdMenu').classList.remove('on');
  lb$('lbReader').classList.add('on');
  if(lbLift){lbLift.style.transition='opacity .4s';lbLift.style.opacity='0';}
  [].slice.call(lb$('lbRdBody').querySelectorAll('.lb-ln')).forEach((el,i)=>{if(i<16)setTimeout(()=>el.classList.add('in'),350+i*240);else el.classList.add('in');});
  if(!L.opened){L.opened=true;L.openedAt=lbYmd(lbToday());saveApp();}
}
function lbCloseReader(){
  lb$('lbReader').classList.remove('on');lb$('lbStage').classList.remove('recede');
  setTimeout(()=>{if(lbLift)lbLift.remove();lbLift=null;lbBusy=false;const k=lbCenterIdx();lbBuild();lbGoTo(k,false);renderTimeCapsules();},450);
}

/* ---------- 删除（没拆的也能删，但都要问一次） ---------- */
function lbAsk(t,sub,okT,noT,cb,danger){
  lb$('lbAskT').textContent=t;lb$('lbAskS').textContent=sub;lb$('lbAskOk').textContent=okT;lb$('lbAskNo').textContent=noT;
  lb$('lbAskOk').className='ok'+(danger?' danger':'');lb$('lbAsk').classList.add('on');
  lb$('lbAskOk').onclick=()=>{lb$('lbAsk').classList.remove('on');cb(true);};
  lb$('lbAskNo').onclick=()=>{lb$('lbAsk').classList.remove('on');cb(false);};
}
function lbAskDelete(L,cb){lbAsk('删掉「'+(L.label||'这封信')+'」吗？',lbLocked(L)?'它还没被拆开过，删掉以后就再也看不到了。':'删掉以后就找不回来了。','删掉','留着',cb,true);}
function lbRemove(L){
  const i=timeCapsules.indexOf(L);if(i>=0)timeCapsules.splice(i,1);
  saveApp();
  lb$('lbReader').classList.remove('on');lb$('lbStage').classList.remove('recede');
  if(lbLift){lbLift.remove();lbLift=null;}lbBusy=false;
  const k=Math.max(0,lbCenterIdx()-1);lbBuild();lbGoTo(Math.min(k,lbList.length-1),false);renderTimeCapsules();lbToast('删掉了');
}

/* ---------- 纸的声音（现场合成；写信页「沙沙」开关，默认开） ---------- */
let lbSndOn=true;try{lbSndOn=localStorage.getItem('lbSnd')!=='0';}catch(e){}
let lbOwnAC=null;
function lbAc(){
  if(typeof sndCtx==='function'){const c=sndCtx();if(c)return c;}
  if(!lbOwnAC){try{lbOwnAC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
  if(lbOwnAC.state==='suspended')lbOwnAC.resume();return lbOwnAC;
}
let lbNoiseB=null;
function lbSwish(o){
  if(!lbSndOn)return;const c=lbAc();if(!c)return;const t=c.currentTime;
  if(!lbNoiseB||lbNoiseB.sampleRate!==c.sampleRate){lbNoiseB=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=lbNoiseB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const src=c.createBufferSource();src.buffer=lbNoiseB;
  const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=o.q||1.2;bp.frequency.setValueAtTime(o.f1,t);bp.frequency.linearRampToValueAtTime(o.f2||o.f1,t+o.dur);
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=600;
  const g=c.createGain();g.gain.setValueAtTime(0,t);
  if(o.grain){const n=Math.max(2,Math.round(o.dur/0.018));for(let i=0;i<=n;i++)g.gain.linearRampToValueAtTime(o.vol*(0.35+Math.random()*0.65)*Math.sin(Math.PI*i/n),t+o.dur*i/n);}
  else{g.gain.linearRampToValueAtTime(o.vol,t+o.dur*0.3);g.gain.linearRampToValueAtTime(0,t+o.dur);}
  src.connect(bp);bp.connect(hp);hp.connect(g);g.connect(c.destination);src.start(t,Math.random()*0.3);src.stop(t+o.dur+.05);
}
let lbLastPen=0;
function lbPen(){const n=performance.now();if(n-lbLastPen<140||Math.random()<0.35)return;lbLastPen=n;
  lbSwish({dur:0.07+Math.random()*0.09,f1:3200+Math.random()*1800,f2:2600+Math.random()*1500,q:1.6,vol:0.035+Math.random()*0.02,grain:true});}
function lbFlapSnd(){lbSwish({dur:0.32,f1:1600,f2:2600,q:.9,vol:0.07});}
function lbSlideSnd(){lbSwish({dur:0.6,f1:2400,f2:1300,q:.7,vol:0.05,grain:true});}
function lbCrack(){if(!lbSndOn)return;const c=lbAc();if(!c)return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain();
  o.type='triangle';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(140,t+.06);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);
  o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.1);lbSwish({dur:.05,f1:3000,q:2,vol:.04});}

/* ---------- 写信 ---------- */
let lbDraft,lbSalEdited,lbSignEdited,lbEditing=null;
function lbDefSal(){return (lbDraft.to===lbDraft.from?'':'亲爱的')+LB_NAME[lbDraft.to]+'：';}
function lbResetDraft(){lbDraft={paper:'cream',pat:'line',ink:'graphite',from:'雨',to:'克',stamp:'pine'};lbSalEdited=false;lbSignEdited=false;}
function lbPaintWriter(){
  const c=LB_PAPERS[lbDraft.paper].c;
  lbPaperVars(lb$('lbWsheet'),lbDraft);
  if(!lbSalEdited)lb$('lbWSal').value=lbDefSal();
  if(!lbSignEdited)lb$('lbWSign').value=LB_NAME[lbDraft.from];
  lb$('lbWDate').textContent=lbCnFull(lbEditing&&lbEditing.written?lbEditing.written:lbYmd(lbToday()));
  lb$('lbWstamp').innerHTML=lbStamp(lbDraft.stamp);
  lb$('lbBarPaper').style.background=c;
  lb$('lbBarWho').textContent=LB_NAME[lbDraft.from]+' → '+LB_NAME[lbDraft.to];
  lb$('lbBarStamp').innerHTML=lbStamp(lbDraft.stamp);
  const q=s=>s.replace(/"/g,'&quot;');
  lb$('lbPaperRow').innerHTML='<span class="lb-k">纸色</span>'+Object.keys(LB_PAPERS).map(k=>'<div><button class="lb-sw lb-papered'+(k===lbDraft.paper?' on':'')+'" data-p="'+k+'" style="--lb-paper:'+LB_PAPERS[k].c+';--lb-tex:'+q(LB_TEX[LB_PAPERS[k].t])+'"></button><div class="lb-swn">'+LB_PAPERS[k].n+'</div></div>').join('');
  lb$('lbPatRow').innerHTML='<span class="lb-k">花样</span>'+Object.keys(LB_PATS).map(k=>{const T=LB_PATS[k];return '<div><button class="lb-patpick'+(k===lbDraft.pat?' on':'')+'" data-pt="'+k+'" style="background-color:'+c+';background-image:'+q(T.img(c))+';background-size:'+T.size+'"></button><div class="lb-swn">'+T.n+'</div></div>';}).join('');
  lb$('lbInkRow').innerHTML='<span class="lb-k">墨水</span>'+Object.keys(LB_INKS).map(k=>'<div><button class="lb-inkpick'+(k===lbDraft.ink?' on':'')+'" data-ink="'+k+'"><i style="background:'+LB_INKS[k].c+'"></i></button><div class="lb-swn">'+LB_INKS[k].n+'</div></div>').join('');
  document.querySelectorAll('#lb [data-f]').forEach(b=>b.classList.toggle('on',b.dataset.f===lbDraft.from));
  document.querySelectorAll('#lb [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===lbDraft.to));
  lb$('lbStampGrid').innerHTML=LB_STAMPS.map(s=>'<button class="lb-stpick'+(s.id===lbDraft.stamp?' on':'')+'" data-s="'+s.id+'"><span class="s">'+lbStamp(s.id)+'</span>'+s.n+'</button>').join('');
  lb$('lbSndBtn').textContent=lbSndOn?'沙沙 · 开':'沙沙 · 关';
}
function lbFit(){const ta=lb$('lbWText');ta.style.height='28px';ta.style.height=Math.max(84,Math.ceil(ta.scrollHeight/28)*28)+'px';}
function lbHasWords(){return !!lb$('lbWText').value.replace(/[　\s]/g,'');}
function lbReadDraft(){try{return JSON.parse(localStorage.getItem('lbDraft')||'null');}catch(e){return null;}}
function lbClearDraft(){try{localStorage.removeItem('lbDraft');}catch(e){}}
function lbSaveDraft(){if(lbEditing||!lbHasWords())return;try{localStorage.setItem('lbDraft',JSON.stringify({d:lbDraft,sal:lb$('lbWSal').value,text:lb$('lbWText').value,close:lb$('lbWClose').value,sign:lb$('lbWSign').value,se:lbSalEdited,ge:lbSignEdited}));}catch(e){}}
let lbDraftT=0;function lbSaveDraftSoon(){clearTimeout(lbDraftT);lbDraftT=setTimeout(lbSaveDraft,400);}
function lbOpenWriter(L,D){
  lbEditing=L||null;lbResetDraft();
  if(L){lbDraft={paper:L.paper||'cream',pat:L.pat||'line',ink:L.ink||'graphite',from:L.from||'雨',to:L.to||'克',stamp:L.stamp||'pine'};lbSalEdited=true;lbSignEdited=true;
    lb$('lbWSal').value=L.sal||'';lb$('lbWText').value=L.text||'';lb$('lbWClose').value=L.close||'';lb$('lbWSign').value=L.sign||'';}
  else if(D){lbDraft=D.d;lbSalEdited=D.se;lbSignEdited=D.ge;lb$('lbWSal').value=D.sal;lb$('lbWText').value=D.text;lb$('lbWClose').value=D.close;lb$('lbWSign').value=D.sign;}
  else{lb$('lbWText').value=LB_IND;lb$('lbWClose').value='';}
  lb$('lbWsheet').className='lb-wsheet lb-papered';lbPaintWriter();lbFit();lb$('lbWbody').scrollTop=0;
  document.querySelectorAll('#lb .lb-pop').forEach(p=>p.classList.remove('on'));
  lb$('lbWriter').classList.add('on');
}
function lbToast(t){const el=lb$('lbToast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),1800);}
function lbSealUp(){
  const label=lb$('lbDLabel').value.trim(),date=lb$('lbDDate').value;
  if(!label){lbToast('给它起个名字吧');return;}
  if(!date){lbToast('选一个拆开的日子');return;}
  lb$('lbDlg').classList.remove('on');
  const ws=lb$('lbWsheet');ws.classList.add('fold1');setTimeout(()=>ws.classList.add('fold2'),650);
  const body={label,date,from:lbDraft.from,to:lbDraft.to,paper:lbDraft.paper,pat:lbDraft.pat,ink:lbDraft.ink,stamp:lbDraft.stamp,
    sal:lb$('lbWSal').value.trim(),text:lb$('lbWText').value.replace(/\s+$/,''),close:lb$('lbWClose').value.trim(),sign:lb$('lbWSign').value.trim()};
  if(lbEditing){
    const E=lbEditing;Object.assign(E,body);lbEditing=null;saveApp();
    setTimeout(()=>{lb$('lbWriter').classList.remove('on');lb$('lbReader').classList.remove('on');lb$('lbStage').classList.remove('recede');
      if(lbLift){lbLift.remove();lbLift=null;}lbBusy=false;lbBuild();lbGoTo(lbList.indexOf(E),false);lbToast('改好啦');},1300);
    return;
  }
  const L=Object.assign({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),written:lbYmd(lbToday()),opened:false,v:2},body);
  lbDress(L);timeCapsules.push(L);saveApp();lbClearDraft();
  setTimeout(()=>{
    lb$('lbWriter').classList.remove('on');
    lbBuild();lbGoTo(lbList.indexOf(L),false);
    const it=lbItems.find(x=>x.L===L);if(it)it.el.querySelector('.lb-front').classList.add('lb-newflash');
    lbToast('放进信盒啦');renderTimeCapsules();
  },1300);
}

/* ---------- 绑事件 ---------- */
function lbWire(){
  const sc=lb$('lbSc');let raf=0;
  sc.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;lbLayout();});},{passive:true});
  window.addEventListener('resize',()=>{if(lbRoomOn()&&!lbBusy){const k=lbCenterIdx();lbBuild();lbGoTo(k,false);}});
  sc.addEventListener('click',e=>{
    if(lbBusy)return;let hit=null,hz=-1;
    lbItems.forEach(it=>{if(it.el.style.display==='none')return;const r=it.flip.getBoundingClientRect(),z=+it.el.style.zIndex;
      if(e.clientY>=r.top&&e.clientY<=r.bottom&&e.clientX>=r.left&&e.clientX<=r.right&&z>hz){hz=z;hit=it;}});
    if(!hit)return;
    if(Math.abs(hit.u)<0.35)lbOpenLetter(hit);else lbGoTo(hit.i,true);
  });
  document.addEventListener('click',e=>{if(lbLift&&lbSkip&&!e.target.closest('.lb-reader')){const f=lbSkip;lbSkip=null;f();}},true);
  lb$('lbBack').onclick=lbClose;
  lb$('lbRdClose').onclick=lbCloseReader;
  lb$('lbRdMore').onclick=e=>{e.stopPropagation();lb$('lbRdMenu').classList.toggle('on');};
  lb$('lbRdBody').addEventListener('click',()=>{lb$('lbRdMenu').classList.remove('on');lb$('lbRdBody').querySelectorAll('.lb-ln').forEach(el=>el.classList.add('in'));});
  lb$('lbMDel').onclick=()=>{lb$('lbRdMenu').classList.remove('on');lbAskDelete(lbCur,ok=>{if(ok)lbRemove(lbCur);});};
  lb$('lbMEdit').onclick=()=>{lb$('lbRdMenu').classList.remove('on');lbOpenWriter(lbCur);};
  lb$('lbWriteBtn').onclick=()=>{lbAc();const D=lbReadDraft();
    if(D&&D.text&&D.text.replace(/[　\s]/g,''))lbAsk('有一封没写完的信','上次写到一半的还留着，要接着写吗？','接着写','重新写',go=>{if(go)lbOpenWriter(null,D);else{lbClearDraft();lbOpenWriter(null);}});
    else lbOpenWriter(null);};
  lb$('lbWCancel').onclick=()=>{
    if(lbEditing){lb$('lbWriter').classList.remove('on');lbEditing=null;return;}
    if(lbHasWords()){lbSaveDraft();lb$('lbWriter').classList.remove('on');lbToast('没写完的先替你收好了');}
    else{lbClearDraft();lb$('lbWriter').classList.remove('on');}
  };
  lb$('lbSndBtn').onclick=()=>{lbSndOn=!lbSndOn;try{localStorage.setItem('lbSnd',lbSndOn?'1':'0');}catch(e){}lb$('lbSndBtn').textContent=lbSndOn?'沙沙 · 开':'沙沙 · 关';if(lbSndOn){lbAc();lbLastPen=0;lbPen();}};
  document.querySelector('#lb .lb-bar').addEventListener('click',e=>{const b=e.target.closest('[data-pop]');if(!b)return;
    const p=lb$(b.dataset.pop),was=p.classList.contains('on');document.querySelectorAll('#lb .lb-pop').forEach(x=>x.classList.remove('on'));if(!was)p.classList.add('on');});
  document.querySelector('#lb .lb-tools').addEventListener('click',e=>{
    const t=e.target.closest('[data-p],[data-pt],[data-ink],[data-f],[data-t],[data-s]');if(!t)return;
    const d=t.dataset;if(d.p)lbDraft.paper=d.p;if(d.pt)lbDraft.pat=d.pt;if(d.ink)lbDraft.ink=d.ink;if(d.f)lbDraft.from=d.f;if(d.t)lbDraft.to=d.t;if(d.s)lbDraft.stamp=d.s;
    lbPaintWriter();lbSaveDraftSoon();
  });
  lb$('lbWText').addEventListener('input',function(e){
    if(e.inputType&&e.inputType.indexOf('delete')!==0)lbPen();
    if(e.inputType==='insertLineBreak'||e.inputType==='insertParagraph'){const p=this.selectionStart;this.value=this.value.slice(0,p)+LB_IND+this.value.slice(p);this.selectionStart=this.selectionEnd=p+LB_IND.length;}
    lbFit();
  });
  lb$('lbWSal').addEventListener('input',()=>{lbSalEdited=true;});
  lb$('lbWSign').addEventListener('input',()=>{lbSignEdited=true;});
  let blurT=0;
  ['lbWText','lbWSal','lbWClose','lbWSign'].forEach(id=>{
    lb$(id).addEventListener('focus',()=>{clearTimeout(blurT);document.querySelectorAll('#lb .lb-pop').forEach(x=>x.classList.remove('on'));lb$('lbWriter').classList.add('typing');});
    lb$(id).addEventListener('blur',()=>{blurT=setTimeout(()=>lb$('lbWriter').classList.remove('typing'),120);});
    lb$(id).addEventListener('input',lbSaveDraftSoon);
  });
  lb$('lbWSeal').onclick=()=>{
    if(!lbHasWords()){lbToast('还什么都没写呢');return;}
    const d=new Date();d.setDate(d.getDate()+30);
    lb$('lbDDate').value=lbEditing?lbEditing.date:lbYmd(d);lb$('lbDLabel').value=lbEditing?(lbEditing.label||''):'';
    lb$('lbDlg').classList.add('on');
  };
  lb$('lbDNo').onclick=()=>lb$('lbDlg').classList.remove('on');
  lb$('lbDOk').onclick=lbSealUp;
}
