/* 主题、阿贝贝的梦 */
// ===== THEME SYSTEM =====
function setTheme(theme){
  const themes=['theme-water','theme-cream','theme-grape','theme-claude'];
  themes.forEach(t=>document.body.classList.remove(t));
  if(theme)document.body.classList.add(theme);
  localStorage.setItem('candyJarTheme',theme);
  document.querySelectorAll('.theme-dot').forEach(d=>{
    d.classList.toggle('active',d.dataset.theme===theme);
  });
  // 更新状态栏颜色
  const themeColors={'theme-claude':'#0D0D14','theme-water':'#E4EDE8','theme-cream':'#CFD9E6','theme-grape':'#B6A9C8','':"#FFF8FA"};
  let mc=document.querySelector('meta[name="theme-color"]');
  if(!mc){mc=document.createElement('meta');mc.name='theme-color';document.head.appendChild(mc);}
  mc.content=themeColors[theme]||'#FFF8FA';
  if(typeof lkThemeColor==='function')lkThemeColor();
}
(function loadTheme(){
  const t=localStorage.getItem('candyJarTheme')||'';
  if(t)document.body.classList.add(t);
  const themeColors={'theme-claude':'#0D0D14','theme-water':'#E4EDE8','theme-cream':'#CFD9E6','theme-grape':'#B6A9C8','':"#FFF8FA"};
  let mc=document.querySelector('meta[name="theme-color"]');
  if(!mc){mc=document.createElement('meta');mc.name='theme-color';document.head.appendChild(mc);}
  mc.content=themeColors[t]||'#FFF8FA';
  if(typeof lkThemeColor==='function')lkThemeColor();
  setTimeout(()=>{
    document.querySelectorAll('.theme-dot').forEach(d=>{
      d.classList.toggle('active',d.dataset.theme===t);
    });
  },100);
})();

// ===== DREAM SYSTEM =====
// abebeDreams：内容在 data/dreams.js

function getDreamIndex(){
  const d=new Date();
  const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  return seed%abebeDreams.length;
}

function checkDreamBtn(){
  const h=new Date().getHours();
  const btn=document.getElementById('dream-btn');
  if(btn) btn.style.display=(h>=22||h<6)?'block':'none';
}

function showDream(){
  const dream=abebeDreams[getDreamIndex()];
  const esc=t=>t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const lines=dream.split('\n').filter(l=>l.trim());
  const start=1.4,step=0.75;
  const ov=document.createElement('div');
  ov.className='dream-overlay';
  // 云、闪光
  let deco='';
  [[150,60,'8%','-30px',0],[190,70,'22%','62%',3],[130,50,'48%','-40px',6],[210,80,'70%','55%',1.5],[160,60,'86%','-20px',4.5]].forEach(c=>{
    deco+=`<div class="dm-cloud" style="width:${c[0]}px;height:${c[1]}px;top:${c[2]};left:${c[3]};animation-delay:-${c[4]}s"></div>`;});
  [['12%','18%',0],['18%','78%',.8],['34%','90%',1.6],['62%','8%',.4],['78%','82%',1.2],['90%','40%',2]].forEach(p=>{
    deco+=`<span class="dm-spark" style="top:${p[0]};left:${p[1]};animation-delay:${p[2]}s"></span>`;});
  // 雾：一圈大白雾从中间往四周散开
  let fog='';
  [[-120,-160],[140,-140],[-150,120],[150,160],[0,-220],[0,230],[-200,0],[210,0],[0,0]].forEach((f,i)=>{
    fog+=`<div class="dm-fog" style="width:420px;height:420px;left:calc(50% - 210px);top:calc(50% - 210px);--fx:${f[0]}px;--fy:${f[1]}px;animation-delay:${0.05*i}s"></div>`;});
  const body=lines.map((l,i)=>`<div class="dm-line" style="animation-delay:${(start+i*step).toFixed(2)}s">${esc(l)}</div>`).join('');
  ov.innerHTML=deco+`<div class="dm-wrap"><div class="dm-title" style="animation-delay:${start-0.4}s">ᶻ 𝗓 𝐙　阿贝贝的梦</div><div class="dm-body">${body}</div><div class="dm-close" style="animation-delay:${(start+lines.length*step+0.3).toFixed(2)}s">轻触回到现实</div></div>`+fog;
  const doneAt=Date.now()+(start+lines.length*step)*1000;
  ov.onclick=()=>{
    if(Date.now()<doneAt&&!ov.classList.contains('skip')){ov.classList.add('skip');return;}  // 还在讲：先一下子讲完
    if(ov.classList.contains('closing'))return;
    ov.classList.add('closing');setTimeout(()=>ov.remove(),700);
  };
  document.body.appendChild(ov);
}

// also check on interval
setInterval(checkDreamBtn,60000);
