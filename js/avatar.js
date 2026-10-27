/* 头像和情侣名 */
// ===== AVATAR & COUPLE NAME =====
const AVATAR_KEY='candyJarAvatars';
const COUPLE_NAME_KEY='candyJarCoupleName';

function loadCustomAvatars(){
  try{
    const raw=localStorage.getItem(AVATAR_KEY);
    if(raw){
      const d=JSON.parse(raw);
      if(d.her){
        document.getElementById('us-avatar-her').src=d.her;
        const sweetsHer=document.querySelector('.avatar-btn:nth-child(2) .avatar-img');
        if(sweetsHer) sweetsHer.src=d.her;
        const authorHer=document.querySelector('.author-option:nth-child(2) img');
        if(authorHer) authorHer.src=d.her;
      }
      if(d.him){
        document.getElementById('us-avatar-him').src=d.him;
        const sweetsHim=document.querySelector('.avatar-btn:nth-child(1) .avatar-img');
        if(sweetsHim) sweetsHim.src=d.him;
        const authorHim=document.querySelector('.author-option:nth-child(1) img');
        if(authorHim) authorHim.src=d.him;
      }
    }
  }catch(e){}
}

function changeAvatar(who){
  const input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  input.onchange=function(e){
    const file=e.target.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=function(ev){
      const img=new Image();
      img.onload=function(){
        const canvas=document.createElement('canvas');
        const size=200;
        canvas.width=size;canvas.height=size;
        const ctx=canvas.getContext('2d');
        const s=Math.min(img.width,img.height);
        const sx=(img.width-s)/2,sy=(img.height-s)/2;
        ctx.drawImage(img,sx,sy,s,s,0,0,size,size);
        const base64=canvas.toDataURL('image/jpeg',0.8);
        let d={};
        try{const raw=localStorage.getItem(AVATAR_KEY);if(raw) d=JSON.parse(raw);}catch(e){}
        d[who]=base64;
        try{localStorage.setItem(AVATAR_KEY,JSON.stringify(d));}catch(e){}
        loadCustomAvatars();
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function loadCoupleName(){
  try{
    const raw=localStorage.getItem(COUPLE_NAME_KEY);
    if(raw){
      document.getElementById('us-couple-name').textContent=raw;
    }
  }catch(e){}
}

function editCoupleName(){
  const current=document.getElementById('us-couple-name').textContent;
  const el=document.getElementById('us-couple-name');
  el.innerHTML='<input id="couple-name-input" type="text" value="" style="width:100%;border:1px solid var(--pink-300);border-radius:8px;padding:6px 10px;font-family:SGH,Georgia,serif;font-size:11px;color:var(--text-primary);text-align:center;outline:none;background:var(--bg-card)" placeholder="输入情侣名...">';
  const inp=document.getElementById('couple-name-input');
  inp.value=current;
  inp.focus();
  inp.select();
  function save(){
    const v=inp.value.trim()||current;
    el.textContent=v;
    try{localStorage.setItem(COUPLE_NAME_KEY,v);}catch(e){}
  }
  inp.addEventListener('blur',save);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();save();}});
}

loadCustomAvatars();
loadCoupleName();
