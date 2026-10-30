/* 糖果接接乐、记忆翻牌 */
// ===== CANDY CATCH GAME =====
const GAME_MAX_PLAYS=2;
const GAME_POINTS_PER_COIN=5;     // 5积分=1币
const GAME_CATCH_PER_POINT=20;    // 20颗=1积分

// Load game data from snackData
(function loadGameData(){
  try{
    const raw=localStorage.getItem('candyJarSnackData');
    if(raw){
      const d=JSON.parse(raw);
      if(d.candyGameData) Object.assign(candyGameData,d.candyGameData);
    }
  }catch(e){}
  const today=new Date().toDateString();
  if(candyGameData.playDate!==today){candyGameData.playsToday=0;candyGameData.playDate=today;}
})();

// Game state
let gameActive=false;
let gameScore=0;
let gameLives=3;
let gameFallInterval=null;
let gameAnimFrame=null;
let gameCandies=[];
let gameAbebeX=0.5; // 0-1 position ratio
let gameAreaW=0;
let gameAreaH=0;
let gameSpeed=1.5;

const gameEndLines=[
  {min:0,max:5,text:'阿贝贝歪歪头：「没关系，糖果会再来的」',face:'./大哭阿贝贝.png'},
  {min:6,max:15,text:'阿贝贝舔舔嘴：「嗯……刚好尝了个味道」',face:'./委屈阿贝贝.png'},
  {min:16,max:30,text:'阿贝贝拍拍肚子：「今天份的甜够啦」',face:'./害羞阿贝贝.png'},
  {min:31,max:50,text:'阿贝贝眯着眼睛笑：「嘿嘿，好多糖呀」',face:'./开心阿贝贝.png'},
  {min:51,max:999,text:'阿贝贝转圈圈：「最幸福的小兔叽就是我！！」',face:'./玩耍阿贝贝.png'}
];

function openCandyGame(){
  const today=new Date().toDateString();
  if(candyGameData.playDate!==today){candyGameData.playsToday=0;candyGameData.playDate=today;}
  document.getElementById('game-overlay').classList.add('show');
  document.getElementById('game-start').style.display='flex';
  document.getElementById('game-end').style.display='none';
  const rewardLeft=Math.max(0,GAME_MAX_PLAYS-candyGameData.playsToday);
  document.getElementById('game-plays-left').textContent=rewardLeft>0?'今天还有 '+rewardLeft+' 次积分机会':'今天的积分用完啦，继续玩不给积分哦';
  document.getElementById('game-high-score').textContent=(candyGameData.highScore||0)>0?'最高记录：'+candyGameData.highScore+' 颗':'';
  document.querySelector('#game-start .game-start-btn').style.display='';
}

function closeGame(){
  if(gameActive) stopGame();
  document.getElementById('game-overlay').classList.remove('show');
}

function startGame(){
  const today=new Date().toDateString();
  if(candyGameData.playDate!==today){candyGameData.playsToday=0;candyGameData.playDate=today;}

  document.getElementById('game-start').style.display='none';
  document.getElementById('game-end').style.display='none';

  const area=document.getElementById('game-area');
  gameAreaW=area.clientWidth;
  gameAreaH=area.clientHeight;
  gameScore=0;
  gameLives=3;
  gameSpeed=2.2;
  gameCandies=[];
  gameActive=true;
  gameAbebeX=0.5;

  document.getElementById('game-score').textContent='0';
  document.getElementById('game-points').textContent='积分 '+(candyGameData.candyPoints||0)+'/'+GAME_POINTS_PER_COIN;
  renderGameLives();

  const abebe=document.getElementById('game-abebe');
  abebe.style.left=(gameAbebeX*gameAreaW-36)+'px';
  abebe.style.display='';
  const face=document.getElementById('game-face');
  face.src='./开心阿贝贝.png';
  face.style.display='';

  // Clear old candies
  area.querySelectorAll('.game-candy,.game-catch-flash').forEach(el=>el.remove());

  // Touch controls — finger follow
  area.ontouchstart=handleGameTouch;
  area.ontouchmove=handleGameTouch;

  // Spawn candies
  spawnGameCandy();
  gameFallInterval=setInterval(()=>{
    if(gameActive) spawnGameCandy();
  },Math.max(400,900-gameScore*8));

  // Animation loop
  gameLoop();
}

function handleGameTouch(e){
  if(!gameActive) return;
  e.preventDefault();
  const t=e.touches[0];
  const area=document.getElementById('game-area');
  const rect=area.getBoundingClientRect();
  gameAbebeX=Math.max(0.08,Math.min(0.92,(t.clientX-rect.left)/rect.width));
  document.getElementById('game-abebe').style.left=(gameAbebeX*gameAreaW-36)+'px';
}

function spawnGameCandy(){
  const area=document.getElementById('game-area');
  const img=document.createElement('img');
  img.className='game-candy';
  const idx=Math.random()<0.15?8:Math.floor(Math.random()*candyFiles.length);
  img.src=candyFiles[idx];
  const isBomb=(idx===8); // 9.png is index 8
  const x=Math.random()*(gameAreaW-40)+4;
  img.style.left=x+'px';
  img.style.top='-40px';
  area.appendChild(img);
  gameCandies.push({el:img,x:x,y:-40,speed:gameSpeed+(Math.random()*0.5),isBomb});
}

function gameLoop(){
  if(!gameActive) return;
  const area=document.getElementById('game-area');
  const abebeLeft=gameAbebeX*gameAreaW-36;
  const abebeRight=abebeLeft+72;
  const abebeTop=gameAreaH-80;

  for(let i=gameCandies.length-1;i>=0;i--){
    const c=gameCandies[i];
    c.y+=c.speed;
    c.el.style.top=c.y+'px';

    // Check catch
    const cx=c.x+18;
    const cy=c.y+36;
    if(cy>=abebeTop&&cy<=gameAreaH&&cx>=abebeLeft&&cx<=abebeRight){
      // Black candy = bomb!
      if(c.isBomb){
        gameLives--;
        renderGameLives();
        updateGameFace();
        c.el.remove();
        gameCandies.splice(i,1);
        if(gameLives<=0){endGame();return;}
        continue;
      }
      // Caught!
      gameScore++;
      if(typeof sfx==='function') sfx('catch');
      document.getElementById('game-score').textContent=gameScore;
      // Flash effect
      const flash=document.createElement('div');
      flash.className='game-catch-flash';
      flash.style.left=(cx-10)+'px';
      flash.style.top=(cy-10)+'px';
      area.appendChild(flash);
      setTimeout(()=>flash.remove(),400);
      c.el.remove();
      gameCandies.splice(i,1);
      // Speed up gradually
      if(gameScore%10===0) gameSpeed+=0.3;
      // Adjust spawn rate
      clearInterval(gameFallInterval);
      gameFallInterval=setInterval(()=>{if(gameActive)spawnGameCandy();},Math.max(350,900-gameScore*10));
      continue;
    }

    // Check miss (fell below screen)
    if(c.y>gameAreaH+10){
      c.el.remove();
      gameCandies.splice(i,1);
      if(!c.isBomb){
        gameLives--;
        renderGameLives();
        updateGameFace();
        if(gameLives<=0){
          endGame();
          return;
        }
      }
    }
  }
  gameAnimFrame=requestAnimationFrame(gameLoop);
}

function renderGameLives(){
  let html='';
  for(let i=0;i<3;i++){
    html+='<div class="game-life-dot'+(i>=gameLives?' lost':'')+'"></div>';
  }
  document.getElementById('game-lives').innerHTML=html;
}

function updateGameFace(){
  const face=document.getElementById('game-face');
  if(gameLives===3) face.src='./开心阿贝贝.png';
  else if(gameLives===2) face.src='./害羞阿贝贝.png';
  else if(gameLives===1) face.src='./委屈阿贝贝.png';
  else face.src='./大哭阿贝贝.png';
}

function stopGame(){
  gameActive=false;
  clearInterval(gameFallInterval);
  cancelAnimationFrame(gameAnimFrame);
  const area=document.getElementById('game-area');
  area.ontouchstart=null;
  area.ontouchmove=null;
}

function endGame(){
  stopGame();
  candyGameData.playsToday++;

  // Only reward for first N plays
  const hasReward=candyGameData.playsToday<=GAME_MAX_PLAYS;
  let pointsEarned=0;
  let newCoins=0;

  if(hasReward){
    pointsEarned=Math.floor(gameScore/GAME_CATCH_PER_POINT);
    candyGameData.candyPoints=(candyGameData.candyPoints||0)+pointsEarned;
    newCoins=Math.floor(candyGameData.candyPoints/GAME_POINTS_PER_COIN);
    candyGameData.totalCoinsEarned=(candyGameData.totalCoinsEarned||0)+newCoins;
    candyGameData.candyPoints=candyGameData.candyPoints%GAME_POINTS_PER_COIN;
  }

  if(gameScore>(candyGameData.highScore||0)) candyGameData.highScore=gameScore;

  saveApp();
  renderCoinDisplay();

  // Show end screen
  const endInfo=gameEndLines.find(l=>gameScore>=l.min&&gameScore<=l.max)||gameEndLines[0];
  document.getElementById('game-end-face').src=endInfo.face;
  document.getElementById('game-end-line').textContent=endInfo.text;

  let stats='接到 '+gameScore+' 颗糖';
  if(hasReward){
    if(pointsEarned>0) stats+='\n获得 '+pointsEarned+' 个糖果积分';
    if(newCoins>0) stats+='\n兑换了 '+newCoins+' 个阿贝贝币！';
    if(candyGameData.candyPoints>0) stats+='\n当前积分：'+candyGameData.candyPoints+'/'+GAME_POINTS_PER_COIN;
  }else{
    stats+='\n（今天的积分次数已用完，纯玩模式）';
  }
  document.getElementById('game-end-stats').innerText=stats;

  const retryBtn=document.querySelector('#game-end .game-end-btn');
  retryBtn.textContent='再玩一次';
  retryBtn.onclick=startGame;

  document.getElementById('game-end').style.display='flex';
  document.getElementById('game-abebe').style.display='none';
  document.getElementById('game-face').style.display='none';
}

// ===== MEMORY GAME =====
const MEM_MAX_REWARD_PLAYS=2;
const MEM_PAIRS=8;

// Load memory game data
(function loadMemGameData(){
  try{
    const raw=localStorage.getItem('candyJarSnackData');
    if(raw){
      const d=JSON.parse(raw);
      if(d.memGameData) Object.assign(memGameData,d.memGameData);
    }
  }catch(e){}
  const today=new Date().toDateString();
  if(memGameData.playDate!==today){memGameData.playsToday=0;memGameData.playDate=today;}
})();

let memFlips=0;
let memMatched=0;
let memFirstCard=null;
let memLocked=false;
let memCards=[];

const memEndLines=[
  {min:0,max:20,text:'阿贝贝瞪大眼睛：「妈妈记性好好！」',face:'./玩耍阿贝贝.png'},
  {min:21,max:25,text:'阿贝贝拍手：「厉害厉害，很快呢」',face:'./开心阿贝贝.png'},
  {min:26,max:35,text:'阿贝贝点点头：「还不错嘛嘿嘿」',face:'./害羞阿贝贝.png'},
  {min:36,max:50,text:'阿贝贝挠挠头：「再来一次会更好的！」',face:'./委屈阿贝贝.png'},
  {min:51,max:999,text:'阿贝贝歪头：「妈妈是不是没睡醒呀」',face:'./大哭阿贝贝.png'}
];

function openMemoryGame(){
  const today=new Date().toDateString();
  if(memGameData.playDate!==today){memGameData.playsToday=0;memGameData.playDate=today;}
  document.getElementById('mem-overlay').classList.add('show');
  document.getElementById('mem-start').style.display='flex';
  document.getElementById('mem-playing').style.display='none';
  document.getElementById('mem-end').style.display='none';
  const rewardLeft=Math.max(0,MEM_MAX_REWARD_PLAYS-memGameData.playsToday);
  document.getElementById('mem-plays-left').textContent=rewardLeft>0?'今天还有 '+rewardLeft+' 次积分机会':'今天的积分用完啦，继续玩不给积分哦';
  document.getElementById('mem-high-score').textContent=(memGameData.highScore<999)?'最佳记录：'+memGameData.highScore+' 次':'';
}

function closeMemoryGame(){
  document.getElementById('mem-overlay').classList.remove('show');
}

let memCurrentPairs=8;
let memCurrentCols=4;

function startMemoryGame(pairs,cols){
  pairs=pairs||8;
  cols=cols||4;
  memCurrentPairs=pairs;
  memCurrentCols=cols;
  const today=new Date().toDateString();
  if(memGameData.playDate!==today){memGameData.playsToday=0;memGameData.playDate=today;}

  document.getElementById('mem-start').style.display='none';
  document.getElementById('mem-end').style.display='none';
  document.getElementById('mem-playing').style.display='';

  memFlips=0;
  memMatched=0;
  memFirstCard=null;
  memLocked=false;
  document.getElementById('mem-flips').textContent='0';
  document.getElementById('mem-points-hud').textContent='积分 '+(candyGameData.candyPoints||0)+'/'+GAME_POINTS_PER_COIN;

  // Pick random candies (avoid black candy index 8)
  const available=candyFiles.map((f,i)=>i).filter(i=>i!==8);
  const shuffled=available.sort(()=>Math.random()-0.5);
  const picked=shuffled.slice(0,pairs);

  // Create pairs and shuffle
  memCards=[...picked,...picked].sort(()=>Math.random()-0.5);

  const grid=document.getElementById('mem-grid');
  grid.style.gridTemplateColumns='repeat('+cols+',1fr)';
  grid.innerHTML=memCards.map((ci,i)=>`
    <div class="mem-card" onclick="flipMemCard(${i})" id="mem-card-${i}">
      <div class="mem-card-inner">
        <div class="mem-card-front"></div>
        <div class="mem-card-back"><img src="${candyFiles[ci]}" alt=""></div>
      </div>
    </div>
  `).join('');
}

function flipMemCard(idx){
  if(memLocked) return;
  const card=document.getElementById('mem-card-'+idx);
  if(card.classList.contains('flipped')||card.classList.contains('matched')) return;

  card.classList.add('flipped');
  memFlips++;
  document.getElementById('mem-flips').textContent=memFlips;

  if(!memFirstCard){
    memFirstCard={idx,val:memCards[idx]};
    return;
  }

  // Second card
  const secondVal=memCards[idx];
  if(memFirstCard.val===secondVal){
    // Match!
    document.getElementById('mem-card-'+memFirstCard.idx).classList.add('matched');
    card.classList.add('matched');
    memMatched++;
    memFirstCard=null;
    if(memMatched===memCurrentPairs){
      setTimeout(endMemoryGame,500);
    }
  }else{
    // No match — flip back
    memLocked=true;
    const firstIdx=memFirstCard.idx;
    memFirstCard=null;
    setTimeout(()=>{
      document.getElementById('mem-card-'+firstIdx).classList.remove('flipped');
      card.classList.remove('flipped');
      memLocked=false;
    },600);
  }
}

function endMemoryGame(){
  memGameData.playsToday++;
  const hasReward=memGameData.playsToday<=MEM_MAX_REWARD_PLAYS;
  let pointsEarned=0;

  if(hasReward){
    // 难度越高积分越多，门槛按对数调整
    if(memCurrentPairs===8){
      if(memFlips<=25) pointsEarned=2;
      else if(memFlips<=35) pointsEarned=1;
    }else if(memCurrentPairs===10){
      if(memFlips<=30) pointsEarned=3;
      else if(memFlips<=42) pointsEarned=2;
      else if(memFlips<=50) pointsEarned=1;
    }else if(memCurrentPairs===12){
      if(memFlips<=35) pointsEarned=4;
      else if(memFlips<=50) pointsEarned=3;
      else if(memFlips<=60) pointsEarned=1;
    }
    candyGameData.candyPoints=(candyGameData.candyPoints||0)+pointsEarned;
    const newCoins=Math.floor(candyGameData.candyPoints/GAME_POINTS_PER_COIN);
    candyGameData.totalCoinsEarned=(candyGameData.totalCoinsEarned||0)+newCoins;
    candyGameData.candyPoints=candyGameData.candyPoints%GAME_POINTS_PER_COIN;
  }

  if(memFlips<memGameData.highScore) memGameData.highScore=memFlips;

  saveApp();
  renderCoinDisplay();

  document.getElementById('mem-playing').style.display='none';
  document.getElementById('mem-end').style.display='flex';

  // 调整评价台词门槛根据难度
  const ratio=memFlips/memCurrentPairs;
  let endInfo;
  if(ratio<=2.2) endInfo={text:'阿贝贝瞪大眼睛：「妈妈记性好好！」',face:'./玩耍阿贝贝.png'};
  else if(ratio<=3) endInfo={text:'阿贝贝拍手：「厉害厉害，很快呢」',face:'./开心阿贝贝.png'};
  else if(ratio<=4) endInfo={text:'阿贝贝点点头：「还不错嘛嘿嘿」',face:'./害羞阿贝贝.png'};
  else if(ratio<=5.5) endInfo={text:'阿贝贝挠挠头：「再来一次会更好的！」',face:'./委屈阿贝贝.png'};
  else endInfo={text:'阿贝贝歪头：「妈妈是不是没睡醒呀」',face:'./大哭阿贝贝.png'};

  document.getElementById('mem-end-face').src=endInfo.face;
  document.getElementById('mem-end-line').textContent=endInfo.text;

  const diffName=memCurrentPairs===8?'简单':memCurrentPairs===10?'普通':'困难';
  let stats=diffName+' · 用了 '+memFlips+' 次翻完';
  if(hasReward){
    if(pointsEarned>0) stats+='\n获得 '+pointsEarned+' 个糖果积分';
    if(candyGameData.candyPoints>0) stats+='\n当前积分：'+candyGameData.candyPoints+'/'+GAME_POINTS_PER_COIN;
  }else{
    stats+='\n（今天的积分次数已用完，纯玩模式）';
  }
  document.getElementById('mem-end-stats').innerText=stats;
}
