/* 心情打卡、摇罐子、晃手机、删糖 */
// ===== DIARY CHECKINS =====
let diaryCheckins={}; // key: "2026-6-21" => {reading:bool,journal:bool,herMood:int,himMood:int,period:bool}
function getDiaryKey(y,m,d){return y+'-'+m+'-'+d;}
function getTodayCheckin(){
  const now=new Date();
  const k=getDiaryKey(now.getFullYear(),now.getMonth(),now.getDate());
  if(!diaryCheckins[k]) diaryCheckins[k]={};
  return diaryCheckins[k];
}

// Restore today's checkins on load
function restoreTodayCheckins(){
  const ck=getTodayCheckin();
  if(ck.reading) document.getElementById('reading-check').classList.add('checked');
  if(ck.journal) document.getElementById('journal-check').classList.add('checked');
  if(ck.period) document.getElementById('period-toggle').classList.add('on');
  // Restore mood selections
  if(ck.herMood!==undefined){
    const rows=document.querySelectorAll('.mood-row');
    if(rows[0]&&rows[0].children[ck.herMood]) rows[0].children[ck.herMood].querySelector('.mood-face').classList.add('selected');
  }
  if(ck.himMood!==undefined){
    const rows=document.querySelectorAll('.mood-row');
    if(rows[1]&&rows[1].children[ck.himMood]) rows[1].children[ck.himMood].querySelector('.mood-face').classList.add('selected');
  }
}



// Override showDayPopup to use diaryCheckins
function showDayPopup(day){
  const k=getDiaryKey(calYear,calMonth,day);
  const ck=diaryCheckins[k]||{};
  const legacyMood=(calYear===2026&&calMonth===6)?dayMoods[day]:null;
  const isPeriod=ck.period||((calYear===2026&&calMonth===6)&&periodDays.includes(day));
  const hasRead=ck.reading||((calYear===2026&&calMonth===6)&&readingDays.includes(day));
  const hasJournal=ck.journal;
  const monthNames=['1','2','3','4','5','6','7','8','9','10','11','12'];
  document.getElementById('popup-date').textContent=`${monthNames[calMonth]} 月 ${day} 日`;
  const herM=ck.herMood!==undefined?ck.herMood:(legacyMood?legacyMood.her:null);
  const himM=ck.himMood!==undefined?ck.himMood:(legacyMood?legacyMood.him:null);
  document.getElementById('popup-her-mood').textContent=herM!==null?moods[herM]:'--';
  document.getElementById('popup-him-mood').textContent=himM!==null?moods[himM]:'--';
  let tags='';
  if(isPeriod) tags+='<div class="day-popup-tag">经期中</div>';
  if(hasRead) tags+='<div class="day-popup-tag" style="background:#E8F0E4;color:#5A7A4A">读了书</div>';
  if(hasJournal) tags+='<div class="day-popup-tag" style="background:#F5E6D0;color:#8B7355">写手帐</div>';
  document.getElementById('popup-tags').innerHTML=tags;
  document.getElementById('day-popup-mask').classList.add('show');
};

// Monthly stats
function renderMonthStats(){
  let readDays=0,journalDays=0;
  const totalDays=new Date(calYear,calMonth+1,0).getDate();
  for(let d=1;d<=totalDays;d++){
    const k=getDiaryKey(calYear,calMonth,d);
    const ck=diaryCheckins[k]||{};
    const legacyRead=(calYear===2026&&calMonth===6)&&readingDays.includes(d);
    if(ck.reading||legacyRead) readDays++;
    if(ck.journal) journalDays++;
  }
  const el=document.getElementById('month-stats');
  if(el) el.textContent=`这个月读了 ${readDays} 天书 · 写了 ${journalDays} 天手帐`;
}

// ===== SHAKE JAR =====
function shakeJar(){
  const jar=document.querySelector('.jar-container');
  jar.classList.add('shaking');
  // randomize bounce vars on each candy
  jar.querySelectorAll('.jar-candy-mini').forEach(c=>{
    c.style.setProperty('--bx',(Math.random()*20-10)+'px');
    c.style.setProperty('--by',(Math.random()*-16-4)+'px');
    c.style.setProperty('--bx2',(Math.random()*16-8)+'px');
    c.style.setProperty('--by2',(Math.random()*-10)+'px');
  });
  setTimeout(()=>jar.classList.remove('shaking'),450);
}

// ===== 摇手机摇罐子 =====
// 第一次点罐子时向 iPhone 要"运动与方向"权限；之后晃手机=摇罐子，手机歪一歪糖会往低的那边滚
let motionOn=false,motionAsked=false,lastShakeAt=0,tiltX=0,motionHist=[];
function jarMotionReady(){return document.getElementById('page-sweets')?.classList.contains('active')&&!document.querySelector('.overlay.show,.candy-detail-mask.show,.lk-sheet.show,.settings-drawer.show');}
function onJarMotion(e){
  const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;
  if(!jarMotionReady())return;
  // 晃动力度：优先用去掉重力的加速度，没有就用"总加速度偏离重力多少"
  const l=e.acceleration;const now=Date.now();
  const f1=(l&&l.x!=null)?Math.hypot(l.x,l.y,l.z):0;
  // 第二种：跟 0.12 秒前的读数比，变化大就算晃
  motionHist.push({t:now,x:a.x,y:a.y,z:a.z});while(motionHist.length&&now-motionHist[0].t>120)motionHist.shift();
  const o=motionHist[0];const f2=o?Math.hypot(a.x-o.x,a.y-o.y,a.z-o.z):0;
  if((f1>5||f2>9)&&now-lastShakeAt>500){lastShakeAt=now;shakeJar();if(navigator.vibrate)try{navigator.vibrate(15);}catch(_){}}
  // 歪手机：糖往低的一边挪一点（iOS 和安卓 x 方向相反）
  const sign=/iPhone|iPad|iPod/.test(navigator.userAgent)?1:-1;
  tiltX=tiltX*0.8+Math.max(-9,Math.min(9,a.x*sign*1.4))*0.2;
  const box=document.getElementById('jar-candies');
  if(box)box.style.transform=`translateX(${tiltX.toFixed(1)}px)`;
}
function startJarMotion(){if(motionOn)return;motionOn=true;window.addEventListener('devicemotion',onJarMotion);}
function askJarMotion(){
  if(motionOn||motionAsked)return;motionAsked=true;
  const DM=window.DeviceMotionEvent;if(!DM)return;
  if(typeof DM.requestPermission==='function'){
    DM.requestPermission().then(r=>{if(r==='granted'){try{localStorage.setItem('candyJarMotion','1');}catch(_){}startJarMotion();}else motionAsked=false;}).catch(()=>{motionAsked=false;});
  }else startJarMotion();
}
(function(){
  const DM=window.DeviceMotionEvent;if(!DM)return;
  if(typeof DM.requestPermission!=='function'){startJarMotion();return;}
  // iPhone：以前同意过的话，点屏幕任意一下就悄悄重新接上
  try{if(localStorage.getItem('candyJarMotion')==='1')document.addEventListener('click',function once(){document.removeEventListener('click',once,true);askJarMotion();},true);}catch(_){}
})();


let viewFilterAuthor='all';
function setViewAuthorFilter(author){
  viewFilterAuthor=author;
  openViewCandies();
}
