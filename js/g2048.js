/* 糖糖2048：阿贝贝坐在棋盘边看妈妈滑。颜色和台词在 data/game2048-words.js */
let g2Prev=null, g2UndoUsed=false;
let g2N=4, g2Grid=[], g2Score=0, g2Id=0, g2Busy=false, g2Shown={}, g2FullSaid=false, g2BestDirty=false;

function g2Data(){
  if(typeof snackData==='undefined') return {best:{},rewardDate:''};
  if(!snackData.g2048) snackData.g2048={best:{},rewardDate:''};
  if(!snackData.g2048.best) snackData.g2048.best={};
  return snackData.g2048;
}
function g2Pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function g2Say(key,face,n){
  const lines=G2048_WORDS[key]; if(!lines) return;
  let t=g2Pick(lines); if(n!==undefined) t=t.replace('{n}',n);
  const b=document.getElementById('g2-bubble');
  b.textContent=t; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  const img=document.getElementById('g2-abebe');
  img.src=face||'./愉快阿贝贝.png';
  img.classList.remove('hop'); void img.offsetWidth;
  if(key!=='full'&&key!=='over') img.classList.add('hop');
}

function open2048(){
  try{g2N=+localStorage.getItem('candy2048size')||4;}catch(e){}
  if(![3,4,5,6].includes(g2N)) g2N=4;
  document.getElementById('g2-overlay').classList.add('show');
  g2RenderSizes();
  g2Load();
  g2Say('start','./愉快阿贝贝.png');
}
function close2048(){
  document.getElementById('g2-overlay').classList.remove('show');
  g2SaveBoard();
  if(g2BestDirty){g2BestDirty=false;saveApp();}
}

function g2RenderSizes(){
  document.getElementById('g2-sizes').innerHTML=[3,4,5,6].map(n=>
    `<div class="g2-size${n===g2N?' on':''}" onclick="g2SetSize(${n})">${n}×${n}</div>`).join('');
}
function g2SetSize(n){
  if(n===g2N) return;
  g2SaveBoard();
  g2N=n; try{localStorage.setItem('candy2048size',n);}catch(e){}
  g2RenderSizes(); g2Load();
  g2Say('start','./愉快阿贝贝.png');
}

function g2Load(){
  let saved=null;
  try{saved=JSON.parse(localStorage.getItem('candy2048board_'+g2N)||'null');}catch(e){}
  g2Setup();
  if(saved&&saved.cells&&saved.cells.length===g2N*g2N&&!saved.over){
    g2Score=saved.score||0; g2Shown=saved.shown||{}; g2UndoUsed=!!saved.undoUsed;
    saved.cells.forEach((v,i)=>{if(v) g2Add(Math.floor(i/g2N),i%g2N,v,false);});
  }else{
    g2Add2(); g2Add2();
  }
  g2Hud();
}
function g2Restart(){
  try{localStorage.removeItem('candy2048board_'+g2N);}catch(e){}
  g2Setup(); g2Add2(); g2Add2(); g2Hud();
  g2Say('start','./愉快阿贝贝.png');
}
function g2Setup(){
  g2Grid=Array.from({length:g2N},()=>Array(g2N).fill(null));
  g2Score=0; g2Shown={}; g2FullSaid=false; g2Prev=null; g2UndoUsed=false;
  const board=document.getElementById('g2-board');
  board.style.setProperty('--n',g2N);
  board.innerHTML='<div class="g2-cells">'+'<div class="g2-cell"></div>'.repeat(g2N*g2N)+'</div><div class="g2-tiles" id="g2-tiles"></div>';
  document.getElementById('g2-over').style.display='none';
}
function g2SaveBoard(){
  if(!g2Grid.length) return;
  const cells=[]; g2Grid.forEach(row=>row.forEach(t=>cells.push(t?t.v:0)));
  try{localStorage.setItem('candy2048board_'+g2N,JSON.stringify({cells,score:g2Score,shown:g2Shown,undoUsed:g2UndoUsed,over:!g2CanMove()}));}catch(e){}
}

function g2Pos(el,r,c){
  // 位置用百分比，换屏幕大小也不会乱
  const gap=g2N>=6?1.6:2.2, size=(100-gap*(g2N+1))/g2N;
  el.style.width=el.style.height=size+'%';
  el.style.left=(gap+c*(size+gap))+'%';
  el.style.top=(gap+r*(size+gap))+'%';
}
function g2Paint(t){
  const col=G2048_COLORS[t.v]||['#E3C9F0','#FFFFFF'];
  t.el.style.background=col[0]; t.el.style.color=col[1];
  const digits=String(t.v).length;
  const base={3:30,4:26,5:21,6:17}[g2N];
  t.el.style.fontSize=Math.round(base*(digits<=2?1:digits===3?.82:digits===4?.68:.56))+'px';
  t.el.textContent=t.v;
}
function g2Add(r,c,v,anim){
  const el=document.createElement('div');
  el.className='g2-tile'+(anim?' new':'');
  const t={id:++g2Id,v,r,c,el};
  g2Pos(el,r,c); g2Paint(t);
  document.getElementById('g2-tiles').appendChild(el);
  g2Grid[r][c]=t; return t;
}
function g2Empty(){const e=[];g2Grid.forEach((row,r)=>row.forEach((t,c)=>{if(!t)e.push([r,c]);}));return e;}
function g2Add2(){const e=g2Empty(); if(!e.length) return; const [r,c]=g2Pick(e); g2Add(r,c,Math.random()<.9?2:4,true);}

function g2CanMove(){
  for(let r=0;r<g2N;r++)for(let c=0;c<g2N;c++){
    const t=g2Grid[r][c]; if(!t) return true;
    if(c+1<g2N&&g2Grid[r][c+1]&&g2Grid[r][c+1].v===t.v) return true;
    if(r+1<g2N&&g2Grid[r+1][c]&&g2Grid[r+1][c].v===t.v) return true;
  }
  return false;
}

function g2Move(dir){
  if(g2Busy||document.getElementById('g2-over').style.display!=='none') return;
  const dr={up:-1,down:1,left:0,right:0}[dir], dc={up:0,down:0,left:-1,right:1}[dir];
  const rows=[...Array(g2N).keys()], cols=[...Array(g2N).keys()];
  if(dr===1) rows.reverse(); if(dc===1) cols.reverse();
  const snap=g2Snap();
  let moved=false, gained=0, maxNew=0;
  const merged=new Set(), dying=[];
  rows.forEach(r=>cols.forEach(c=>{
    const t=g2Grid[r][c]; if(!t) return;
    let nr=r, nc=c;
    while(true){
      const tr=nr+dr, tc=nc+dc;
      if(tr<0||tr>=g2N||tc<0||tc>=g2N) break;
      const o=g2Grid[tr][tc];
      if(!o){nr=tr;nc=tc;continue;}
      if(o.v===t.v&&!merged.has(o.id)){
        g2Grid[r][c]=null;
        o.v*=2; merged.add(o.id); gained+=o.v; if(o.v>maxNew) maxNew=o.v;
        t.r=tr; t.c=tc; g2Pos(t.el,tr,tc); t.el.style.zIndex=1; dying.push([t,o]);
        moved=true; return;
      }
      break;
    }
    if(nr!==r||nc!==c){g2Grid[r][c]=null; g2Grid[nr][nc]=t; t.r=nr; t.c=nc; g2Pos(t.el,nr,nc); moved=true;}
  }));
  if(!moved) return;
  g2Prev=snap;
  g2Busy=true;
  setTimeout(()=>{
    dying.forEach(([t,o])=>{
      t.el.remove(); g2Paint(o);
      o.el.classList.remove('merge'); void o.el.offsetWidth; o.el.classList.add('merge');
    });
    g2Score+=gained; g2Add2(); g2Busy=false;
    g2AfterMove(maxNew);
  },120);
}

function g2AfterMove(maxNew){
  const d=g2Data();
  // 每天第一次玩，阿贝贝随机给1或2个币
  const today=new Date().toDateString();
  let said=false;
  if(d.rewardDate!==today){
    const n=1+Math.floor(Math.random()*2);
    d.rewardDate=today;
    if(typeof candyGameData!=='undefined') candyGameData.totalCoinsEarned=(candyGameData.totalCoinsEarned||0)+n;
    saveApp(); if(typeof renderCoinDisplay==='function') renderCoinDisplay();
    g2Say('reward','./开心阿贝贝.png',n); said=true;
  }
  if(g2Score>(d.best[g2N]||0)){d.best[g2N]=g2Score; g2BestDirty=true;}
  g2Hud();
  if(maxNew>=64&&!g2Shown[maxNew]&&G2048_WORDS['m'+maxNew]){
    g2Shown[maxNew]=1;
    g2Say('m'+maxNew,maxNew>=2048?'./玩耍阿贝贝.png':'./开心阿贝贝.png'); said=true;
  }
  const empty=g2Empty().length;
  if(!g2CanMove()){
    const isBest=g2Score>0&&g2Score>=(d.best[g2N]||0)&&g2BestDirty;
    g2Say(isBest?'best':'over',isBest?'./害羞阿贝贝.png':'./大哭阿贝贝.png');
    document.getElementById('g2-over-text').textContent='这一盘 '+g2Score+' 分';
    document.getElementById('g2-over').style.display='flex';
    if(g2BestDirty){g2BestDirty=false;saveApp();}
  }else if(empty<=Math.max(1,g2N-3)){
    if(!g2FullSaid&&!said){g2FullSaid=true; g2Say('full','./委屈阿贝贝.png');}
  }else if(empty>g2N){
    g2FullSaid=false;
  }
  g2SaveBoard();
}

function g2Hud(){
  document.getElementById('g2-score').textContent=g2Score;
  document.getElementById('g2-best').textContent=g2Data().best[g2N]||0;
  const u=document.getElementById('g2-undo');
  if(u){u.classList.toggle('used',g2UndoUsed); u.textContent=g2UndoUsed?'阿贝贝已经帮过啦':'求助阿贝贝';}
}

// 求助阿贝贝：每盘可以悔一步
function g2Snap(){
  const cells=[]; g2Grid.forEach(row=>row.forEach(t=>cells.push(t?t.v:0)));
  return {cells,score:g2Score,shown:{...g2Shown}};
}
function g2Undo(){
  if(g2Busy) return;
  if(g2UndoUsed){g2Say('undoUsed','./委屈阿贝贝.png'); return;}
  if(!g2Prev){g2Say('undoNone','./愉快阿贝贝.png'); return;}
  const p=g2Prev;
  g2Grid=Array.from({length:g2N},()=>Array(g2N).fill(null));
  document.getElementById('g2-tiles').innerHTML='';
  p.cells.forEach((v,i)=>{if(v) g2Add(Math.floor(i/g2N),i%g2N,v,false);});
  g2Score=p.score; g2Shown=p.shown; g2Prev=null; g2UndoUsed=true; g2FullSaid=false;
  document.getElementById('g2-over').style.display='none';
  g2Hud(); g2SaveBoard();
  g2Say('undo','./害羞阿贝贝.png');
}

// 手势和键盘
(function(){
  let sx=0,sy=0,on=false;
  document.addEventListener('touchstart',e=>{
    if(!e.target.closest||!e.target.closest('#g2-board')) return;
    on=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY;
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if(!on) return; on=false;
    const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<24) return;
    g2Move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  },{passive:true});
  document.addEventListener('keydown',e=>{
    const ov=document.getElementById('g2-overlay');
    if(!ov||!ov.classList.contains('show')) return;
    const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];
    if(k){e.preventDefault(); g2Move(k);}
  });
})();
