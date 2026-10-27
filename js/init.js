/* 启动（等所有文件加载完才开始）、今日一签 */
// ===== INIT =====
whenReady(async function(){
  await loadApp();
  claudeInboxSync();
  restoreTodayCheckins();
  checkAnniversarySplash();
  renderCalendar();
  renderMilestones();
  renderWishlist();
  renderBooksList();
  renderJarCandies();
  renderTimeCapsules();
  renderMonthStats();
  // 数据全部渲染完成，通知螃蟹重新落位
  document.dispatchEvent(new CustomEvent('appReady'));
  // 如果今天已经抽过签，恢复显示结果
  if(fortuneDrawn){
    const today=new Date();
    const seed=today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();
    const f=getTodayFortune(seed);
    const levelCls={'兔兔心':'tutuxin','兔兔毛':'tutumao','兔兔爪':'tutuzhua','兔兔牙':'tutuya','兔兔屁':'tutupi'};
    document.getElementById('fortune-level').textContent=f.l;
    document.getElementById('fortune-level').className='fortune-level '+(levelCls[f.l]||'');
    document.getElementById('fortune-msg').textContent=f.m;
    document.getElementById('fortune-sign').textContent=f.s||'-- 哥哥';
    document.getElementById('fortune-result').classList.add('show');
    document.getElementById('fortune-btn').classList.add('drawn');
    document.getElementById('fortune-btn').textContent='今日已抽';
    document.getElementById('fortune-pre').onclick=null;
  }
});

// FORTUNE
// fortunePool：内容在 data/fortunes.js

let fortuneDrawn=false;
