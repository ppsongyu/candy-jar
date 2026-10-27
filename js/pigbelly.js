/* 猪肚记 */
// ===== 猪肚记 (PIG BELLY DIARY) =====
let pigBellyData={};
const pbMealNames={breakfast:'早餐',lunch:'午餐',dinner:'晚餐',snack:'零食'};
const pbMealKeys=['breakfast','lunch','dinner','snack'];
let pbSelMeal='breakfast';
let pbEditMeal=null;
let pbDelMeal=null;
let pbDelDateKey=null;
let pbOpenMenu=null;
let pbEditDateKey=null;

function pbDateKey(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function pbEsc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// pbCloudReady stays false until the cloud copy has been checked, so a save made
// before that can't overwrite a newer cloud copy.
let pbCloudReady=false;
function pbSaveData(){
  const savedAt=Date.now();
  try{
    localStorage.setItem('pigBellyData',JSON.stringify(pigBellyData));
    localStorage.setItem('pigBellySavedAt',String(savedAt));
  }catch(e){}
  if(pbCloudReady) supaUpsert('pig_belly',{savedAt,data:pigBellyData});
}
function pbLoadData(){try{const r=localStorage.getItem('pigBellyData');if(r)pigBellyData=JSON.parse(r);}catch(e){}}
async function pbSyncCloud(){
  const cloud=await supaGet('pig_belly');
  if(cloud===undefined) return; // offline: keep this session local-only
  let localSavedAt=0;
  try{localSavedAt=Number(localStorage.getItem('pigBellySavedAt'))||0;}catch(e){}
  const hasLocal=Object.keys(pigBellyData).length>0;
  pbCloudReady=true;
  if(cloud&&cloud.data&&(!hasLocal||(cloud.savedAt||0)>localSavedAt)){
    pigBellyData=cloud.data;
    try{
      localStorage.setItem('pigBellyData',JSON.stringify(pigBellyData));
      localStorage.setItem('pigBellySavedAt',String(cloud.savedAt||0));
    }catch(e){}
    if(document.getElementById('pigbelly-overlay').classList.contains('show')) pbRender();
  }else if(hasLocal&&(!cloud||localSavedAt>(cloud.savedAt||0))){
    pbSaveData();
  }
}

function openPigBelly(){
  document.getElementById('pigbelly-overlay').classList.add('show');
  pbRender();
}
function closePigBelly(){document.getElementById('pigbelly-overlay').classList.remove('show');}

function pbRender(){
  const el=document.getElementById('pigbelly-timeline');
  const today=new Date();
  const todayKey=pbDateKey(today);
  // Show 30 days before today + today + 7 days after
  const days=[];
  for(let i=-30;i<=7;i++){
    const d=new Date(today);
    d.setDate(d.getDate()+i);
    days.push(d);
  }
  let html='';
  days.forEach(function(d){
    const k=pbDateKey(d);
    const day=pigBellyData[k]||{};
    const m=d.getMonth()+1,dd=d.getDate();
    const w=['日','一','二','三','四','五','六'][d.getDay()];
    const isToday=k===todayKey;
    html+='<div class="pb-tl-row" data-datekey="'+k+'">';
    html+='<div class="pb-tl-left">';
    html+='<div class="pb-tl-date'+(isToday?' pb-tl-today':'')+'">'+m+'/'+dd+'</div>';
    html+='<div class="pb-tl-week">周'+w+'</div>';
    html+='</div>';
    html+='<div class="pb-tl-line"><div class="pb-tl-dot'+(isToday?' pb-tl-dot-today':'')+'"></div></div>';
    html+='<div class="pb-tl-card">';
    pbMealKeys.forEach(function(meal){
      const entry=day[meal];
      if(entry){
        html+='<div class="pb-tl-meal pb-tl-meal-filled" style="position:relative">';
        html+='<div class="pb-tl-meal-label">'+pbMealNames[meal]+'</div>';
        html+='<div class="pb-tl-meal-text">'+pbEsc(entry.text)+'</div>';
        html+='<button onclick="event.stopPropagation();pbToggleMenu(this,\''+meal+'\',\''+k+'\')" class="pb-tl-menu-btn">···</button>';
        html+='<div class="pb-menu-popup" style="display:none" onclick="event.stopPropagation()">';
        html+='<div onclick="pbEditEntry(\''+meal+'\',\''+k+'\')">修改</div>';
        html+='<div onclick="pbConfirmDel(\''+meal+'\',\''+k+'\')">删除</div>';
        html+='</div>';
        html+='</div>';
      } else {
        html+='<div class="pb-tl-meal pb-tl-meal-empty" onclick="pbOpenInput(\''+meal+'\',false,\''+k+'\')">';
        html+='<span>+ '+pbMealNames[meal]+'</span>';
        html+='</div>';
      }
    });
    html+='</div></div>';
  });
  el.innerHTML=html;
  // Scroll to today
  setTimeout(function(){
    const todayEl=el.querySelector('[data-datekey="'+todayKey+'"]');
    if(todayEl){
      const container=document.getElementById('pigbelly-container');
      const containerH=container.clientHeight;
      const elTop=todayEl.offsetTop-container.offsetTop;
      container.scrollTop=elTop-containerH/2+todayEl.clientHeight/2;
    }
  },50);
}

function pbToggleMenu(btn,meal,dateKey){
  if(pbOpenMenu&&pbOpenMenu!==btn.nextElementSibling){
    pbOpenMenu.style.display='none';
  }
  const menu=btn.nextElementSibling;
  if(menu.style.display==='none'){
    menu.style.display='block';
    pbOpenMenu=menu;
  } else {
    menu.style.display='none';
    pbOpenMenu=null;
  }
}

document.addEventListener('click',function(){
  if(pbOpenMenu){pbOpenMenu.style.display='none';pbOpenMenu=null;}
});

function pbEditEntry(meal,dateKey){
  if(pbOpenMenu){pbOpenMenu.style.display='none';pbOpenMenu=null;}
  pbOpenInput(meal,true,dateKey);
}

function pbOpenInput(meal,isEdit,dateKey){
  pbSelMeal=meal;
  pbEditMeal=isEdit?meal:null;
  pbEditDateKey=dateKey;
  document.getElementById('pb-text').value='';
  document.querySelectorAll('.pb-meal-btn').forEach(function(b){
    if(b.dataset.meal===meal){b.style.background='var(--pink-200)';b.style.borderColor='var(--pink-400)';}
    else{b.style.background='var(--bg-card)';b.style.borderColor='var(--border-light)';}
  });
  if(isEdit){
    const entry=(pigBellyData[dateKey]||{})[meal];
    if(entry){
      document.getElementById('pb-text').value=entry.text||'';
    }
    document.getElementById('pb-popup-title').textContent='修改'+pbMealNames[meal];
  } else {
    document.getElementById('pb-popup-title').textContent='记一餐';
  }
  document.getElementById('pb-input-mask').style.display='flex';
}

function pbPickMeal(m){
  pbSelMeal=m;
  document.querySelectorAll('.pb-meal-btn').forEach(function(b){
    if(b.dataset.meal===m){b.style.background='var(--pink-200)';b.style.borderColor='var(--pink-400)';}
    else{b.style.background='var(--bg-card)';b.style.borderColor='var(--border-light)';}
  });
}

function pbCloseInput(){
  document.getElementById('pb-input-mask').style.display='none';
  pbEditMeal=null;
  pbEditDateKey=null;
}

function pbSave(){
  const text=document.getElementById('pb-text').value.trim();
  if(!text){alert('写点什么呀~');return;}
  const k=pbEditDateKey;
  if(!pigBellyData[k])pigBellyData[k]={};
  const meal=pbEditMeal||pbSelMeal;
  pigBellyData[k][meal]={text:text};
  pbSaveData();
  pbCloseInput();
  pbRender();
}

function pbConfirmDel(meal,dateKey){
  if(pbOpenMenu){pbOpenMenu.style.display='none';pbOpenMenu=null;}
  pbDelMeal=meal;
  pbDelDateKey=dateKey;
  document.getElementById('pb-confirm-mask').style.display='flex';
}
function pbCloseConfirm(){
  document.getElementById('pb-confirm-mask').style.display='none';
  pbDelMeal=null;
  pbDelDateKey=null;
}
function pbDoDelete(){
  if(!pbDelMeal||!pbDelDateKey)return;
  if(pigBellyData[pbDelDateKey]&&pigBellyData[pbDelDateKey][pbDelMeal]){
    delete pigBellyData[pbDelDateKey][pbDelMeal];
    if(Object.keys(pigBellyData[pbDelDateKey]).length===0)delete pigBellyData[pbDelDateKey];
    pbSaveData();
  }
  pbCloseConfirm();
  pbRender();
}

pbLoadData();
whenReady(pbSyncCloud);
