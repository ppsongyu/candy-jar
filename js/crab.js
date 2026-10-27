/* 克劳德灵动岛 / 小螃蟹 / 螃蟹图鉴 */
// ── 克劳德灵动岛 ──
(function(){
  const C=CRAB_ART; // 内容在 data/crab-art.js
  const STATES=CRAB_STATES; // 内容在 data/crab-words.js
  let idx=0,bubbleOpen=false,closeTimer=null,nextTimer=null;
  const anchor=document.getElementById('clabAnchor');
  const crab=document.getElementById('clabCrab');
  const crabSvg=document.getElementById('clabCrabSvg');
  const bubble=document.getElementById('clabBubble');
  const msg=document.getElementById('clabMsg');
  const sub=document.getElementById('clabSub');

  // 动态扫描所有页面（除阿贝贝）里的可藏身元素
  var PAGE_IDS=['page-sweets','page-diary','page-books','page-us'];
  // 每个页面里认为是"板块/卡片"的selector
  var CARD_SELECTORS=['.card','.jar-area','.avatars','.book-item','.book-list','.us-section','.period-toggle','.fortune-card','.milestone-item','.wish-item','.snack-item','.capsule-item'];

  // 元素到所在页面之间有没有被折叠/隐藏的祖先（页面本身隐藏不算）
  function foldedInPage(el){
    var e=el;
    while(e&&!(e.classList&&e.classList.contains('page'))){
      if(getComputedStyle(e).display==='none')return true;
      e=e.parentElement;
    }
    return false;
  }

  function gatherSpots(){
    var spots=[];
    PAGE_IDS.forEach(function(pid){
      var pg=document.getElementById(pid);
      if(!pg)return;
      CARD_SELECTORS.forEach(function(sel){
        pg.querySelectorAll(sel).forEach(function(el){
          if(foldedInPage(el))return;
          // 每个元素贡献左右两个藏身点
          spots.push({el:el,side:'left'});
          spots.push({el:el,side:'right'});
        });
      });
    });
    return spots;
  }

  function pickSpot(pageFilter){
    var spots=gatherSpots();
    if(pageFilter){
      spots=spots.filter(function(s){
        return s.el.closest('#'+pageFilter);
      });
    }
    if(!spots.length)return null;
    // 先平均抽页面，再在页面里抽位置（避免书多的书架被抽中太多次）
    var byPage={};
    spots.forEach(function(s){var pg=s.el.closest('.page');var id=pg?pg.id:'';(byPage[id]=byPage[id]||[]).push(s);});
    var pages=Object.keys(byPage);
    var list=byPage[pages[Math.floor(Math.random()*pages.length)]];
    return list[Math.floor(Math.random()*list.length)];
  }

  function pickState(){
    var next;
    do{next=Math.floor(Math.random()*STATES.length);}while(next===idx&&STATES.length>1);
    return next;
  }

  // 记住螃蟹藏在哪个页面，被重渲染删掉后回到同一页面重新藏
  var curPage=null;
  function hideIn(pageFilter){
    var spot=pickSpot(pageFilter);
    if(spot)placeAt(spot);
    return !!spot;
  }
  setInterval(function(){
    if(!crabSvg.innerHTML)return; // 还没初始化
    if(anchor.isConnected&&anchor.closest('.page')&&!foldedInPage(anchor))return;
    if(!hideIn(STATES[idx].page||curPage))hideIn(STATES[idx].page||null);
  },1000);

  function placeAt(spot){
    if(!spot||!spot.el)return;
    closeBubble();
    crab.classList.remove('visible');
    var side=spot.side||'left';
    curSide=side;
    if(side==='left'){
      anchor.style.justifyContent='flex-start';
      anchor.style.paddingLeft='24px';
      anchor.style.paddingRight='0';
      crab.style.transition='none';
      crab.style.transform='translateX(-40px) scale(.7)';
      crab.style.opacity='0';
      bubble.style.left='100%';bubble.style.right='auto';
      bubble.style.top='auto';bubble.style.bottom='0';
      bubble.style.transform='translateX(4px) translateY(-4px)';
    }else{
      anchor.style.justifyContent='flex-end';
      anchor.style.paddingRight='24px';
      anchor.style.paddingLeft='0';
      crab.style.transition='none';
      crab.style.transform='translateX(40px) scale(.7)';
      crab.style.opacity='0';
      bubble.style.right='100%';bubble.style.left='auto';
      bubble.style.top='auto';bubble.style.bottom='0';
      bubble.style.transform='translateX(-4px) translateY(-4px)';
    }
    spot.el.after(anchor);
    var pg=spot.el.closest('.page');curPage=pg?pg.id:null;
    setTimeout(function(){
      crab.style.transition='transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s';
      crab.style.transform='translateX(0) scale(1)';
      crab.style.opacity='1';
    },60);
  }

  var rareNow=false;
  // 换新状态时，稀有月份里有一点点机会变成金螃蟹
  function setNew(i){rareNow=eggRareActive()&&Math.random()<0.06;set(i);}
  function set(i){
    const s=rareNow?CRAB_RARE:STATES[i];
    const svg=C[rareNow?CRAB_RARE.art:s.k]||'';
    crab.classList.toggle('rare',rareNow);
    crabSvg.innerHTML=svg;
    // 从该状态的msgs里随机选一条
    var msgs=s.msgs||[s.msg||''];
    var pi=Math.floor(Math.random()*msgs.length);
    var picked=msgs[pi];curPick=pi;
    msg.innerHTML=picked;
    sub.style.display='none';
    if(!s.anim){
      const svgEl=crabSvg.querySelector('svg');
      if(svgEl){svgEl.style.opacity='0.95';}
    }
  }

  var curSide='left';
  function openBubble(){
    if(curSide==='left'){bubble.style.transform='translateX(4px) translateY(0)';}
    else{bubble.style.transform='translateX(-4px) translateY(0)';}
    bubble.classList.add('show');bubbleOpen=true;
  }
  function closeBubble(){bubble.classList.remove('show');bubbleOpen=false;}

  // 用真实时间戳控制状态切换，不怕后台冻住
  var CRAB_LS_KEY='crab_next_change';
  var CRAB_IDX_KEY='crab_state_idx';

  function saveNextChangeTime(){
    var minMs=5*60*1000,maxMs=30*60*1000;
    var ms=minMs+Math.random()*(maxMs-minMs);
    try{localStorage.setItem(CRAB_LS_KEY,String(Date.now()+ms));}catch(e){}
    return ms;
  }

  function checkAndMaybeChange(){
    var stored=0;
    try{stored=Number(localStorage.getItem(CRAB_LS_KEY))||0;}catch(e){}
    if(Date.now()>=stored){
      idx=pickState();
      setNew(idx);
      hideIn(STATES[idx].page||null);
      try{localStorage.setItem(CRAB_IDX_KEY,String(idx));}catch(e){}
      saveNextChangeTime();
    }
  }

  function restoreSavedState(){
    try{
      var savedIdx=Number(localStorage.getItem(CRAB_IDX_KEY));
      if(!isNaN(savedIdx)&&savedIdx>=0&&savedIdx<STATES.length){
        idx=savedIdx;
        set(idx);
        return true;
      }
    }catch(e){}
    return false;
  }

  function scheduleNext(){
    clearTimeout(nextTimer);
    var minMs=5*60*1000,maxMs=30*60*1000;
    var ms=minMs+Math.random()*(maxMs-minMs);
    // 页面打开期间仍用setTimeout，眼皮底下也会换
    nextTimer=setTimeout(function(){
      idx=pickState();
      setNew(idx);
      hideIn(STATES[idx].page||null);
      try{localStorage.setItem(CRAB_IDX_KEY,String(idx));}catch(e){}
      saveNextChangeTime();
      scheduleNext();
    },ms);
  }

  // 页面从后台恢复时检查真实时间
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden){checkAndMaybeChange();}
  });

  crab.addEventListener('click',function(e){
    e.stopPropagation();
    clearTimeout(closeTimer);
    if(bubbleOpen){closeBubble();}
    else{openBubble();dexRecord(rareNow?CRAB_RARE.k:STATES[idx].k,curPick);closeTimer=setTimeout(closeBubble,5000);}
  });
  bubble.addEventListener('click',function(e){
    e.stopPropagation();
    clearTimeout(closeTimer);
    closeBubble();
  });

  // 初始化：等DOM稳定后放置，找不到位置就重试
  function initCrab(retries){
    if(!pickSpot()&&retries>0){
      setTimeout(function(){initCrab(retries-1);},500);
      return;
    }
    // 先检查真实时间，决定要不要换状态
    var stored=0;
    try{stored=Number(localStorage.getItem(CRAB_LS_KEY))||0;}catch(e){}
    if(stored&&Date.now()<stored){
      // 时间还没到，恢复上次的状态
      if(!restoreSavedState()){
        idx=Math.floor(Math.random()*STATES.length);
        set(idx);
        try{localStorage.setItem(CRAB_IDX_KEY,String(idx));}catch(e){}
      }
    }else{
      // 时间到了或第一次，随机新状态
      idx=Math.floor(Math.random()*STATES.length);
      setNew(idx);
      try{localStorage.setItem(CRAB_IDX_KEY,String(idx));}catch(e){}
      saveNextChangeTime();
    }
    hideIn(STATES[idx].page||null);
    scheduleNext();
  }
  // 数据渲染完成后，在原页面重新藏一次
  document.addEventListener('appReady',function(){
    if(crabSvg.innerHTML)hideIn(STATES[idx].page||curPage);
  });
  setTimeout(function(){initCrab(5);},500);

  // ── 小螃蟹图鉴 ──
  var curPick=0;
  var DEX_KEY='crabDex';
  var DEX_NAMES=CRAB_NAMES; // 内容在 data/crab-words.js
  var DEX_YU={babysongyu:1};
  function dexLoad(){try{return JSON.parse(localStorage.getItem(DEX_KEY)||'{}')||{};}catch(e){return {};}}
  function dexSave(d){try{localStorage.setItem(DEX_KEY,JSON.stringify(d));}catch(e){}}
  function dexRecord(k,pi){
    var d=dexLoad();var a=d[k]||(d[k]=[]);
    if(a.indexOf(pi)<0)a.push(pi);
    dexSave(d);
    if(k!==CRAB_RARE.k)eggCheck(k,d);
    var f=document.getElementById('dex-fold');
    if(f&&f.classList.contains('open'))dexRender();else dexHint();
  }
  function stateOf(k){return k===CRAB_RARE.k?CRAB_RARE:STATES.filter(function(x){return x.k===k;})[0];}
  function msgCount(s){return (s.msgs||[s.msg||'']).length;}
  // 0 没抓到 / 1 半亮（还有话没听过）/ 2 全亮
  function dexLevel(d,s){var a=d[s.k];if(!a||!a.length)return 0;return a.length>=msgCount(s)?2:1;}

  // ── 彩蛋：每个月重新算 ──
  var EGG_KEY='crabEgg';
  function monthKey(t){var x=t||new Date();return x.getFullYear()+'-'+(x.getMonth()+1<10?'0':'')+(x.getMonth()+1);}
  function nextMonthKey(){var x=new Date();return monthKey(new Date(x.getFullYear(),x.getMonth()+1,1));}
  function eggLoad(){
    var e;try{e=JSON.parse(localStorage.getItem(EGG_KEY)||'{}')||{};}catch(err){e={};}
    if(!Array.isArray(e.hist))e.hist=[];if(!Array.isArray(e.rare))e.rare=[];
    if(e.m!==monthKey()){e.m=monthKey();e.got=[];}
    if(!Array.isArray(e.got))e.got=[];
    return e;
  }
  function eggSave(e){try{localStorage.setItem(EGG_KEY,JSON.stringify(e));}catch(err){}}
  function eggRareActive(){return eggLoad().rare.indexOf(monthKey())>=0;}
  function monthIdx(m){var p=m.split('-');return Number(p[0])*12+Number(p[1]);}
  function eggText(m,t){
    if(t===1)return CRAB_EGG_NOTES[monthIdx(m)%CRAB_EGG_NOTES.length];
    if(t===2)return '这个月你抓到了 '+CRAB_EGG_TIERS[1]+' 只螃蟹。\n\n有一只平时不出门的螃蟹听说了，它说下个月要出来见见你。\n\n它很难遇到，浑身亮晶晶的。下个月在糖罐子里多翻翻，说不定哪天就撞见了。';
    if(t===3)return CRAB_EGG_LETTERS[monthIdx(m)%CRAB_EGG_LETTERS.length];
    return CRAB_EGG_FINAL;
  }
  var EGG_TITLE={1:'小螃蟹的小纸条',2:'稀有螃蟹的消息',3:'小螃蟹的大惊喜',4:'全部点亮的那封信'};
  function eggShow(m,t,delay){
    setTimeout(function(){if(typeof showStory==='function')showStory(EGG_TITLE[t],eggText(m,t));},delay||0);
  }
  function eggCheck(k,d){
    var e=eggLoad();
    if(e.got.indexOf(k)<0)e.got.push(k);
    var newT=0;
    CRAB_EGG_TIERS.forEach(function(n,i){
      var t=i+1;
      if(e.got.length>=n&&!e.hist.some(function(h){return h.m===e.m&&h.t===t;})){
        e.hist.push({m:e.m,t:t});newT=t;
        if(t===2){var nm=nextMonthKey();if(e.rare.indexOf(nm)<0)e.rare.push(nm);}
      }
    });
    var allFull=STATES.every(function(s){return dexLevel(d,s)===2;});
    var fin=false;
    if(allFull&&!e.final){e.final=1;e.hist.push({m:e.m,t:4});fin=true;}
    eggSave(e);
    if(newT)eggShow(e.m,newT,1400);
    if(fin)eggShow(e.m,4,newT?9000:1400);
  }
  window.crabEggOpen=function(m,t){eggShow(m,t,0);};

  var dexCurTab='ke';
  function dexList(tab){return STATES.filter(function(s){return tab==='yu'?DEX_YU[s.k]:!DEX_YU[s.k];});}
  function dexHint(){
    var d=dexLoad();var n=0;STATES.forEach(function(s){if(dexLevel(d,s)===2)n++;});
    var h=document.getElementById('dex-hint');if(h)h.textContent=' · 全亮 '+n+'/'+STATES.length;
  }
  // 把一只螃蟹的html塞进盒子，按盒子大小等比缩放
  function dexFitOne(box,k,size,still){
    var fit=document.createElement('div');fit.className='dex-fit'+(still?' dex-still':'');
    fit.innerHTML=C[k]||'';box.appendChild(fit);
    var el=fit.firstElementChild;if(!el)return;
    var w=el.offsetWidth||parseFloat(getComputedStyle(el).width)||64;
    var hh=el.offsetHeight||parseFloat(getComputedStyle(el).height)||64;
    var s=Math.min(size/w,size/hh);
    fit.style.width=w+'px';fit.style.height=hh+'px';fit.style.transform='scale('+s+')';
    if(still){var svg=fit.querySelector('svg');if(svg&&svg.pauseAnimations)try{svg.pauseAnimations();svg.setCurrentTime(0);}catch(e){}}
  }
  // level 0 黑影子 / 1 左边一半有颜色 / 2 全亮
  function dexFit(box,k,size,still,level){
    box.innerHTML='';
    if(level!==1){dexFitOne(box,k,size,still);return;}
    ['sil','col'].forEach(function(c){
      var layer=document.createElement('div');layer.className='dex-layer '+c;box.appendChild(layer);
      dexFitOne(layer,k,size,true);
    });
  }
  function dexRender(){
    var d=dexLoad();var list=dexList(dexCurTab);var full=0,half=0;
    var grid=document.getElementById('dex-grid');if(!grid)return;
    grid.innerHTML='';
    list.forEach(function(s){
      var cell=document.createElement('div');
      var lv=dexLevel(d,s);if(lv===2)full++;else if(lv===1)half++;
      cell.className='dex-cell'+(lv===0?' locked':lv===1?' half':'');
      grid.appendChild(cell);
      dexFit(cell,s.k,40,true,lv);
      cell.onclick=function(){dexOpen(s.k);};
    });
    // 金螃蟹抓到过才出现在最后
    if(dexCurTab==='ke'&&d[CRAB_RARE.k]){
      var rc=document.createElement('div');var rl=dexLevel(d,CRAB_RARE);
      rc.className='dex-cell rare'+(rl===1?' half':'');grid.appendChild(rc);
      dexFit(rc,CRAB_RARE.art,40,true,rl);
      rc.onclick=function(){dexOpen(CRAB_RARE.k);};
    }
    document.getElementById('dex-count').textContent='全亮 '+full+' · 半亮 '+half+' / '+list.length;
    document.querySelectorAll('.dex-tab').forEach(function(t){t.classList.toggle('on',t.dataset.tab===dexCurTab);});
    eggRender();
    dexHint();
  }
  function eggRender(){
    var box=document.getElementById('dex-egg');if(!box)return;
    var e=eggLoad();var n=e.got.length;
    var next=CRAB_EGG_TIERS.filter(function(x){return x>n;})[0];
    var steps=CRAB_EGG_TIERS.map(function(x,i){
      var on=n>=x;
      return '<span class="dex-egg-step'+(on?' on':'')+'"'+(on?' onclick="crabEggOpen(\''+e.m+'\','+(i+1)+')"':'')+'>'+['✉','✦','🎁'][i]+' '+x+'</span>';
    }).join('');
    var past=e.hist.filter(function(h){return h.m!==e.m||h.t===4;}).map(function(h){
      var mm=h.t===4?'全亮':Number(h.m.split('-')[1])+'月';
      return '<span class="dex-egg-old" onclick="crabEggOpen(\''+h.m+'\','+h.t+')">'+mm+' '+['','✉','✦','🎁','💌'][h.t]+'</span>';
    }).join('');
    box.innerHTML='<div class="dex-egg-head">这个月抓到 '+n+' 只'+(next?' · 再抓 '+(next-n)+' 只开下一个彩蛋':' · 这个月的彩蛋都开完啦')+'</div>'
      +'<div class="dex-egg-steps">'+steps+'</div>'
      +(past?'<div class="dex-egg-past">以前的彩蛋：'+past+'</div>':'');
  }
  window.dexTab=function(t){dexCurTab=t;dexRender();};
  window.toggleDex=function(){
    var body=document.getElementById('dex-fold');var arrow=document.getElementById('dex-arrow');
    var open=body.classList.toggle('open');if(arrow)arrow.textContent=open?'⌄':'›';
    if(open)dexRender();
  };
  function dexShowLine(s,i){
    var line=document.getElementById('dex-line');
    var raw=(s.msgs||[])[i]||'';
    line.className='dex-line';line.innerHTML=raw;
    document.querySelectorAll('#dex-dots .dex-dot').forEach(function(dot,j){dot.classList.toggle('cur',j===i);});
  }
  function dexOpen(k){
    var s=stateOf(k);if(!s)return;
    var d=dexLoad();var seen=d[k]||[];var lv=dexLevel(d,s);
    var big=document.getElementById('dex-big');
    big.className='dex-big'+(lv===0?' locked':lv===1?' half':'')+(k===CRAB_RARE.k?' rare':'');
    document.getElementById('dex-mask').classList.add('show');
    dexFit(big,k===CRAB_RARE.k?CRAB_RARE.art:k,170,lv!==2,lv);
    document.getElementById('dex-name').textContent=lv?(k===CRAB_RARE.k?CRAB_RARE.name:(DEX_NAMES[k]||k)):'？？？';
    var dots=document.getElementById('dex-dots');dots.innerHTML='';
    var n=msgCount(s);
    for(var i=0;i<n;i++){(function(i){
      var dot=document.createElement('div');var ok=seen.indexOf(i)>=0;
      dot.className='dex-dot'+(ok?' seen':'');
      if(ok)dot.onclick=function(){dexShowLine(s,i);};
      dots.appendChild(dot);
    })(i);}
    var line=document.getElementById('dex-line');line.className='dex-line hint';
    line.textContent=lv===0?'还没抓到它哦，去页面里找找看':lv===1?('听过 '+seen.length+' / '+n+' 句 · 话都听完它才会全亮'):('全亮啦 · '+n+' 句都听过 · 点小点可以再听一次');
  }
  window.closeDex=function(){document.getElementById('dex-mask').classList.remove('show');document.getElementById('dex-big').innerHTML='';};
  setTimeout(dexHint,800);
})();
