/* 读书 */
// ===== BOOK MANAGEMENT =====
function toggleBookDone(){
  booksData[currentBookIdx].done=!booksData[currentBookIdx].done;
  saveApp();renderBookDetail();renderBooksList();
}
function deleteBook(){
  if(!confirm('确定要删除这本书吗？')) return;
  booksData.splice(currentBookIdx,1);
  saveApp();closeBook();renderBooksList();
}
// Override renderBooksList to show done badge


// Save fortune on draw
function drawFortune(){
  if(fortuneDrawn)return;
  fortuneDrawn=true;
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
  document.getElementById('fortune-pre').onclick=null; // 禁掉外层div的点击
  saveApp();
}
