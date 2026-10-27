/* 读书 */
// ===== BOOK MANAGEMENT =====
// Override renderBookDetail to add delete book + done toggle + note delete


function confirmDeleteNote(noteIdx){
  const mask=document.createElement('div');
  mask.className='delete-confirm-mask';
  mask.id='delete-note-mask';
  mask.innerHTML=`<div class="delete-confirm"><p style="margin-bottom:16px;line-height:1.8">要删掉这条笔记吗</p><div class="delete-confirm-btns"><button class="cancel" onclick="document.getElementById('delete-note-mask').remove()">留着</button><button class="confirm" onclick="doDeleteNote(${noteIdx})">删掉</button></div></div>`;
  document.body.appendChild(mask);
}
function doDeleteNote(noteIdx){
  document.getElementById('delete-note-mask')?.remove();
  booksData[currentBookIdx].notes.splice(noteIdx,1);
  saveApp();
  renderBookDetail();
  renderBooksList();
}
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
