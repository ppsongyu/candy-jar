/* 数据导出导入 */
// ===== DATA BACKUP =====
function exportData(){
  const data={
    appData:null,
    snackData:null,
    exportDate:new Date().toISOString()
  };
  try{const raw=localStorage.getItem('candyJarData');if(raw) data.appData=JSON.parse(raw);}catch(e){}
  try{const raw=localStorage.getItem('candyJarSnackData');if(raw) data.snackData=JSON.parse(raw);}catch(e){}
  try{const raw=localStorage.getItem('pigBellyData');if(raw) data.pigBellyData=JSON.parse(raw);}catch(e){}
  try{const raw=localStorage.getItem('crabDex');if(raw) data.crabDex=JSON.parse(raw);}catch(e){}
  try{if(typeof lkBackupData==='function') data.lookData=lkBackupData();}catch(e){}
  
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const now=new Date();
  a.href=url;
  a.download='candy-jar-backup-'+(now.getMonth()+1)+'-'+now.getDate()+'.json';
  a.click();
  try{localStorage.setItem('candyJarLastBackup',String(Date.now()));}catch(e){}
  const tip=document.getElementById('backup-reminder');
  if(tip) tip.remove();
  URL.revokeObjectURL(url);
}

async function importData(event){
  const file=event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=async function(e){
    try{
      const data=JSON.parse(e.target.result);
      const now=Date.now();
      if(data.crabDex){try{localStorage.setItem('crabDex',JSON.stringify(data.crabDex));}catch(e){}}
      if(data.lookData&&typeof lkRestoreBackup==='function'){try{await lkRestoreBackup(data.lookData);}catch(e){}}
      if(data.appData){
        data.appData.savedAt=now;
        localStorage.setItem('candyJarData',JSON.stringify(data.appData));
        await supaUpsert('app_data',data.appData);
      }
      if(data.snackData){
        data.snackData.savedAt=now;
        localStorage.setItem('candyJarSnackData',JSON.stringify(data.snackData));
        await supaUpsert('snack_data',data.snackData);
      }
      if(data.pigBellyData){
        localStorage.setItem('pigBellyData',JSON.stringify(data.pigBellyData));
        localStorage.setItem('pigBellySavedAt',String(now));
        await supaUpsert('pig_belly',{savedAt:now,data:data.pigBellyData});
      }
      alert('数据恢复成功！页面将刷新');
      location.reload();
    }catch(err){
      alert('文件格式不对，请选择正确的备份文件');
    }
  };
  reader.readAsText(file);
  event.target.value='';
}

// Weekly nudge to export a backup. "晚点再说" snoozes it for a day.
function checkBackupReminder(){
  let last=0,snooze=0;
  try{
    last=Number(localStorage.getItem('candyJarLastBackup'))||0;
    snooze=Number(localStorage.getItem('candyJarBackupSnooze'))||0;
  }catch(e){}
  const now=Date.now();
  if(now-last<7*86400000||now<snooze||document.getElementById('backup-reminder')) return;
  const tip=document.createElement('div');
  tip.id='backup-reminder';
  tip.style.cssText='position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%);width:calc(100% - 48px);max-width:340px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.12);padding:14px 16px;z-index:9000;font-size:13px;color:var(--text-primary);text-align:center;line-height:1.6';
  tip.innerHTML='<div>'+(last?'好几天没备份啦':'还没有备份过哦')+'，存一份糖罐子吧 🍬</div>'+
    '<div style="display:flex;gap:10px;margin-top:10px">'+
    '<div class="add-milestone-btn" style="flex:1;margin-top:0" onclick="snoozeBackupReminder()">晚点再说</div>'+
    '<div class="add-milestone-btn" style="flex:1;margin-top:0" onclick="exportData()">现在备份</div></div>';
  document.body.appendChild(tip);
}
function snoozeBackupReminder(){
  try{localStorage.setItem('candyJarBackupSnooze',String(Date.now()+86400000));}catch(e){}
  const tip=document.getElementById('backup-reminder');
  if(tip) tip.remove();
}
