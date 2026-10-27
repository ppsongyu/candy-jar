/* 阿贝贝聊天：对话库 + 微信式聊天记录 */
// ===== CHAT SYSTEM =====
// chatThemes：内容在 data/chat-words.js

// Chat engine
let chatState={active:false,themeIdx:-1,convoIdx:-1,round:0,branch:[]};

// 每天固定选好3个对话存在这里，循环使用
let todaysChatSlots=[];      // [{ti,ci}, {ti,ci}, {ti,ci}]
let todaysChatSlotDate='';   // 用来判断是否需要重新抽签
let recentChatHistory=[];    // 最近看过的对话 [{ti,ci}]，最多保留15个（约5天）

function buildTodaysChatSlots(){
  const today=new Date();
  const h=today.getHours();
  const dateStr=today.toDateString();
  if(todaysChatSlotDate===dateStr&&todaysChatSlots.length===3) return; // 今天已经抽好了

  // 根据当前时间段建候选池，按主题分组
  const themeGroups={};
  chatThemes.forEach((t,ti)=>{
    let include=false;
    if(t.trigger==='night'&&(h>=22||h<6)) include=true;
    else if(t.trigger==='season') include=true;
    else if(t.trigger==='mood') include=true;
    else if(t.trigger==='time') include=true;
    else if(t.trigger==='random') include=true;
    if(include){
      if(!themeGroups[t.theme]) themeGroups[t.theme]=[];
      t.convos.forEach((_,ci)=>themeGroups[t.theme].push({ti,ci}));
    }
  });

  // 用日期+更大的变化量做种子
  let seed=today.getFullYear()*366+(today.getMonth()+1)*31+today.getDate();
  seed=(seed*2654435761)&0x7fffffff; // 黄金比例哈希，让相邻日期差异更大

  const themeKeys=Object.keys(themeGroups);
  const shuffledThemes=[...themeKeys];
  for(let i=shuffledThemes.length-1;i>0;i--){
    seed=(seed*1103515245+12345)&0x7fffffff;
    const j=seed%(i+1);
    [shuffledThemes[i],shuffledThemes[j]]=[shuffledThemes[j],shuffledThemes[i]];
  }

  // 检查某个对话是否最近看过
  const isRecent=(ti,ci)=>recentChatHistory.some(r=>r.ti===ti&&r.ci===ci);

  // 从不同主题各取1个对话，优先排除最近看过的
  todaysChatSlots=[];
  for(let i=0;i<shuffledThemes.length&&todaysChatSlots.length<3;i++){
    const theme=shuffledThemes[i];
    const group=themeGroups[theme];
    // 先尝试找没看过的
    const fresh=group.filter(g=>!isRecent(g.ti,g.ci));
    seed=(seed*1103515245+12345)&0x7fffffff;
    if(fresh.length>0){
      todaysChatSlots.push(fresh[seed%fresh.length]);
    } else {
      todaysChatSlots.push(group[seed%group.length]);
    }
  }
  while(todaysChatSlots.length<3){
    const allOptions=Object.values(themeGroups).flat();
    const freshAll=allOptions.filter(g=>!isRecent(g.ti,g.ci));
    seed=(seed*1103515245+12345)&0x7fffffff;
    if(freshAll.length>0){
      todaysChatSlots.push(freshAll[seed%freshAll.length]);
    } else {
      todaysChatSlots.push(allOptions[seed%allOptions.length]);
    }
  }

  // 把今天的3个加入历史记录
  todaysChatSlots.forEach(s=>recentChatHistory.push({ti:s.ti,ci:s.ci}));
  // 只保留最近15个（约5天的量）
  if(recentChatHistory.length>15) recentChatHistory=recentChatHistory.slice(-15);

  todaysChatSlotDate=dateStr;
  saveApp();
}

function openChat(){
  const chatDateStr=new Date().toDateString();
  // 新的一天重置计数
  if(abebeChatDate!==chatDateStr){
    abebeChatDate=chatDateStr;
    abebeChatCount=0;
    todaysChatSlots=[];
    todaysChatSlotDate='';
  }

  // 确保今天的3个槽位已生成
  buildTodaysChatSlots();

  // 在3个槽位里循环（0→1→2→0→1→2……）
  const slotIdx=abebeChatCount%3;
  const picked=todaysChatSlots[slotIdx];
  abebeChatCount++;

  chatState={active:true,themeIdx:picked.ti,convoIdx:picked.ci,round:0,branch:[]};

  const overlay=document.getElementById('chat-overlay');
  overlay.classList.add('show');
  document.getElementById('chat-end-msg').classList.remove('visible');
  document.getElementById('chat-end-msg').textContent='';
  cvStart();
  showChatRound();
}

// ===== 聊天记录（微信式左右气泡）=====
// 只保留上一次的聊天，存在 localStorage('abebeChatLast')
const CV_FACES=['./开心阿贝贝.png','./愉快阿贝贝.png','./玩耍阿贝贝.png','./害羞阿贝贝.png','./委屈阿贝贝.png','./大哭阿贝贝.png'];
function cvMeAva(){try{const d=JSON.parse(localStorage.getItem('candyJarAvatars')||'{}');if(d.her)return d.her;}catch(e){}return './小头雨.png';}
function cvMoodFace(){
  const st=(typeof abebeState==='object'&&abebeState)||{};
  if((st.mood??80)<25)return './大哭阿贝贝.png';
  if((st.miss??90)<35||(st.food??75)<30)return './委屈阿贝贝.png';
  if((st.mood??80)>85)return './玩耍阿贝贝.png';
  if((st.mood??80)>60)return './开心阿贝贝.png';
  return './愉快阿贝贝.png';
}
function cvAbAva(){let v='auto';try{v=localStorage.getItem('abebeChatAva')||'auto';}catch(e){}return v==='auto'?cvMoodFace():v;}
function cvName(){try{return localStorage.getItem('abebeChatName')||'阿贝贝';}catch(e){return '阿贝贝';}}
function cvRefreshHead(){const t=document.getElementById('cv-title');if(t)t.textContent=cvName();}
function cvRefreshAvatars(){const ab=cvAbAva(),me=cvMeAva();document.querySelectorAll('#cv-log .cv-row.ab .cv-ava').forEach(i=>i.src=ab);document.querySelectorAll('#cv-log .cv-row.me .cv-ava').forEach(i=>i.src=me);}
function cvCloseEdit(){const e=document.getElementById('cv-edit');e.classList.remove('show');e.innerHTML='';}
function cvEditName(){
  const e=document.getElementById('cv-edit');
  if(e.classList.contains('show')&&e.dataset.mode==='name'){cvCloseEdit();return;}
  e.dataset.mode='name';
  e.innerHTML=`<div class="cv-edit-lbl">给它改个备注</div><div class="cv-edit-row"><input class="add-input" id="cv-name-in" maxlength="10" value="${cvEsc(cvName())}" style="margin:0"><button class="add-confirm" onclick="cvSaveName()">好</button></div>`;
  e.classList.add('show');setTimeout(()=>document.getElementById('cv-name-in')?.focus(),50);
}
function cvSaveName(){const v=(document.getElementById('cv-name-in').value||'').trim();try{if(v&&v!=='阿贝贝')localStorage.setItem('abebeChatName',v);else localStorage.removeItem('abebeChatName');}catch(e){}cvRefreshHead();cvCloseEdit();}
function cvEditAva(){
  const e=document.getElementById('cv-edit');
  if(e.classList.contains('show')&&e.dataset.mode==='ava'){cvCloseEdit();return;}
  e.dataset.mode='ava';
  let cur='auto';try{cur=localStorage.getItem('abebeChatAva')||'auto';}catch(_){}
  const isUp=cur!=='auto'&&!CV_FACES.includes(cur);
  e.innerHTML=`<div class="cv-edit-lbl">换个头像 · 选"跟心情"会随它的心情自己变</div><div class="cv-faces">
    <div class="cv-face-txt${cur==='auto'?' on':''}" onclick="cvSetAva('auto')">跟心情</div>
    ${CV_FACES.map(f=>`<img class="cv-face${cur===f?' on':''}" src="${f}" onclick="cvSetAva('${f}')">`).join('')}
    ${isUp?`<img class="cv-face on" src="${cur}">`:''}
    <label class="cv-face-txt">上传<input type="file" accept="image/*" style="display:none" onchange="cvUploadAva(event)"></label></div>`;
  e.classList.add('show');
}
function cvSetAva(v){try{if(v==='auto')localStorage.removeItem('abebeChatAva');else localStorage.setItem('abebeChatAva',v);}catch(e){}cvRefreshAvatars();cvCloseEdit();}
function cvUploadAva(ev){
  const f=ev.target.files&&ev.target.files[0];if(!f)return;
  const url=URL.createObjectURL(f);const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=200;const s=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,200,200);URL.revokeObjectURL(url);
    try{localStorage.setItem('abebeChatAva',c.toDataURL('image/jpeg',0.82));}catch(e){}cvRefreshAvatars();cvCloseEdit();};
  img.src=url;
}
let cvSession=null,cvTypingTimer=null;
function cvFmt(t){const d=new Date(t);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`;}
function cvEsc(x){return String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function cvItemHtml(it,old){
  const o=old?' cv-old':'';
  if(it.k==='time')return `<div class="cv-time${o}">${cvFmt(it.t)}</div>`;
  if(it.k==='sys')return `<div class="cv-sys${o}">${cvEsc(it.text)}</div>`;
  const me=it.k==='me';
  return `<div class="cv-row ${me?'me':'ab'}${o}"><img class="cv-ava" src="${me?cvMeAva():cvAbAva()}"${me?'':' onclick="cvEditAva()"'}><div class="cv-msg">${cvEsc(it.text)}</div></div>`;
}
function cvScroll(){const l=document.getElementById('cv-log');if(l)requestAnimationFrame(()=>{l.scrollTop=l.scrollHeight;});}
// 好几天没聊天：聊天按钮冒小圆点，点进去阿贝贝先说一句想你
function cvLastChatAt(){try{const l=JSON.parse(localStorage.getItem('abebeChatLast')||'null');const it=l&&l.items&&l.items[0];if(it&&it.t)return it.t;}catch(e){}return 0;}
function cvUnreadDays(){const t=cvLastChatAt();if(!t)return 99;return Math.floor((Date.now()-t)/86400000);}
function cvMissLine(d){
  if(d>=99)return '你终于点开我啦！我有好多好多话想跟你说';
  if(d>=7)return `已经${d}天没跟我聊天了……我每天都在这里等你，耳朵都等耷拉了`;
  if(d>=4)return `${d}天没聊天啦，我把想说的话都攒起来了，攒了满满一兜`;
  return '你好几天没来找我聊天了……我还以为你把我忘了';
}
function cvStart(){
  const log=document.getElementById('cv-log');clearTimeout(cvTypingTimer);
  cvRefreshHead();cvCloseEdit();
  const missDays=cvUnreadDays();
  let last=null;try{last=JSON.parse(localStorage.getItem('abebeChatLast')||'null');}catch(e){}
  log.innerHTML=(last&&Array.isArray(last.items)?last.items.map(it=>cvItemHtml(it,true)).join(''):'');
  cvSession={items:[{k:'time',t:Date.now()}]};
  log.insertAdjacentHTML('beforeend',cvItemHtml(cvSession.items[0]));
  if(missDays>=2)cvPush({k:'ab',text:cvMissLine(missDays)});
  cvScroll();
}
function cvPush(it){
  if(!cvSession)return;
  cvSession.items.push(it);
  const log=document.getElementById('cv-log');
  log.querySelector('.cv-typing-row')?.remove();
  log.insertAdjacentHTML('beforeend',cvItemHtml(it));
  cvScroll();
}
function cvSave(){if(!cvSession||cvSession.items.length<2)return;try{localStorage.setItem('abebeChatLast',JSON.stringify(cvSession));}catch(e){}}

function showChatRound(){
  const convo=chatThemes[chatState.themeIdx].convos[chatState.convoIdx];
  const rounds=convo.rounds;
  const r=chatState.round;
  
  // Determine what to show
  let currentRound;
  if(r===0){
    currentRound=rounds[0];
  }else{
    // Navigate branch
    const prev=rounds[r];
    if(!prev) return endChat(convo.end);
    if(Array.isArray(prev)){
      // This is a response array, get the right one based on branch
      const branchIdx=chatState.branch[r-1];
      const item=prev[branchIdx];
      if(!item) return endChat(convo.end);
      if(typeof item==='string'||(!item.opts)){
        // Terminal response
        const text=typeof item==='string'?item:item.say;
        showChatBubble(text);
        document.getElementById('chat-options').innerHTML='';
        document.getElementById('chat-options').classList.remove('visible');
        setTimeout(()=>endChat(convo.end),2000);
        return;
      }
      currentRound=item;
    }else{
      currentRound=prev;
    }
  }
  
  if(!currentRound||!currentRound.say) return endChat(convo.end);
  
  showChatBubble(currentRound.say);
  
  if(currentRound.opts){
    setTimeout(()=>{
      const optsEl=document.getElementById('chat-options');
      optsEl.innerHTML=currentRound.opts.map((o,i)=>
        `<div class="chat-option-btn" onclick="chatChoose(${i})">${o.text}</div>`
      ).join('');
      optsEl.classList.add('visible');cvScroll();
    },1000);
  }else{
    document.getElementById('chat-options').innerHTML='';
    document.getElementById('chat-options').classList.remove('visible');
    setTimeout(()=>endChat(convo.end),2000);
  }
}

function showChatBubble(text){
  const log=document.getElementById('cv-log');
  log.querySelector('.cv-typing-row')?.remove();
  log.insertAdjacentHTML('beforeend',`<div class="cv-row ab cv-typing-row"><img class="cv-ava" src="${cvAbAva()}"><div class="cv-msg"><span class="cv-typing"><i></i><i></i><i></i></span></div></div>`);
  cvScroll();
  clearTimeout(cvTypingTimer);
  cvTypingTimer=setTimeout(()=>cvPush({k:'ab',text}),650);
}

function chatChoose(idx){
  const convo=chatThemes[chatState.themeIdx].convos[chatState.convoIdx];
  const rounds=convo.rounds;
  const r=chatState.round;
  
  let currentRound;
  if(r===0) currentRound=rounds[0];
  else{
    const prev=rounds[r];
    if(Array.isArray(prev)){
      currentRound=prev[chatState.branch[r-1]];
    }else currentRound=prev;
  }
  
  const nextRef=currentRound.opts[idx].next;
  cvPush({k:'me',text:currentRound.opts[idx].text});
  chatState.branch.push(nextRef);
  chatState.round++;
  
  document.getElementById('chat-options').classList.remove('visible');
  
  const nextRound=rounds[chatState.round];
  if(!nextRound) return setTimeout(()=>endChat(convo.end),400);
  
  setTimeout(()=>{
    if(Array.isArray(nextRound)){
      const item=nextRound[nextRef];
      if(!item) return endChat(convo.end);
      const text=typeof item==='string'?item:item.say;
      showChatBubble(text);
      
      if(item.opts){
        setTimeout(()=>{
          const optsEl=document.getElementById('chat-options');
          optsEl.innerHTML=item.opts.map((o,i)=>
            `<div class="chat-option-btn" onclick="chatChoose(${i})">${o.text}</div>`
          ).join('');
          optsEl.classList.add('visible');cvScroll();
        },1000);
      }else{
        document.getElementById('chat-options').innerHTML='';
        setTimeout(()=>endChat(convo.end),2500);
      }
    }else{
      showChatRound();
    }
  },400);
}

function endChat(msg){
  document.getElementById('chat-options').innerHTML='';
  document.getElementById('chat-options').classList.remove('visible');
  if(msg)setTimeout(()=>{cvPush({k:'sys',text:msg});cvSave();},300);else cvSave();
  chatState.active=false;
  renderAbebeActions();
  // Boost mood from chatting
  abebeState.mood=Math.min(100,abebeState.mood+8);
  abebeState.miss=Math.min(100,abebeState.miss+10);
}

function closeChat(){
  document.getElementById('chat-overlay').classList.remove('show');
  clearTimeout(cvTypingTimer);cvSave();
  chatState.active=false;
  if(typeof renderAbebeActions==='function')renderAbebeActions();
}
