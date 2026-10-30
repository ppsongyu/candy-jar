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
  try{const raw=localStorage.getItem('crabEgg');if(raw) data.crabEgg=JSON.parse(raw);}catch(e){}
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
      if(data.appData&&data.appData.savedCandiesByMonth&&appLoaded){
        const merge=confirm('要用「找回模式」吗？\n\n找回模式：只把备份里有、现在罐子里没有的糖放回来，别的东西都不动（推荐）。\n\n点「确定」= 找回模式\n点「取消」= 整个覆盖，回到备份那天的样子');
        if(merge){await mergeCandiesFromBackup(data.appData.savedCandiesByMonth);return;}
      }
      if(data.crabDex){try{localStorage.setItem('crabDex',JSON.stringify(data.crabDex));}catch(e){}}
      if(data.crabEgg){try{localStorage.setItem('crabEgg',JSON.stringify(data.crabEgg));}catch(e){}}
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

// 找回模式：备份里有、现在没有的糖放回去，已有的一颗都不动
async function mergeCandiesFromBackup(backup){
  let added=0;
  Object.keys(backup||{}).forEach(k=>{
    const cur=savedCandiesByMonth[k]||(savedCandiesByMonth[k]=[]);
    const have=new Set(cur.map(c=>keCandySig(k,c)));
    (backup[k]||[]).forEach(c=>{
      if(!c) return;
      const sig=keCandySig(k,c);
      if(have.has(sig)) return;
      have.add(sig); cur.push(c); added++;
    });
    // 新的在前面：按日子从大到小排，同一天里保持原来的先后
    cur.forEach((c,i)=>c.__i=i);
    cur.sort((a,b)=>(b.day||0)-(a.day||0)||a.__i-b.__i);
    cur.forEach(c=>delete c.__i);
  });
  if(!added){alert('备份里的糖现在罐子里都有，不用找回');return;}
  saveApp();
  // 等云端真的写好再刷新，不然刷新会把上传打断
  if(appCloudSync){try{await supaUpsert('app_data',JSON.parse(localStorage.getItem('candyJarData')));}catch(e){}}
  alert('找回了 '+added+' 颗糖！'+(appCloudSync?'':'\n（这次没连上云端，糖先存在手机里，下次打开会自动同步）'));
  location.reload();
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
