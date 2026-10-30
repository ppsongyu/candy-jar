/* 声音：背景音乐（窗边雨、下午茶、拇指琴、小夜灯）和小音效。
   全部用 Web Audio 现场合成，没有音频文件。设置在 设置 → 声音，存在这台手机上，默认都关着。
   小音效是把别的文件里的函数包一层挂上去的（放在最后加载），见文件底部。 */
const SND_TRACKS=[
  {id:'rain',name:'窗边雨'},
  {id:'tea',name:'下午茶'},
  {id:'kal',name:'拇指琴'},
  {id:'night',name:'小夜灯'}
];
let sndCfg={music:false,track:'rain',vol:55,fx:false};
try{Object.assign(sndCfg,JSON.parse(localStorage.getItem('candyJarSound')||'{}'));}catch(e){}
function sndSave(){try{localStorage.setItem('candyJarSound',JSON.stringify(sndCfg));}catch(e){}}

let SA=null,SM=null,SFXG=null,sndNoise=null;
let sndPlaying=null,sndTimers=[],sndTrackGain=null,sndRain=null;
function sndCtx(){
  if(!SA){
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null;
    SA=new AC(); SM=SA.createGain(); SM.gain.value=sndCfg.vol/100; SM.connect(SA.destination);
    SFXG=SA.createGain(); SFXG.gain.value=.7; SFXG.connect(SA.destination);
  }
  if(SA.state==='suspended') SA.resume();
  return SA;
}
const sHz=m=>440*Math.pow(2,(m-69)/12);
function sEnv(g,t,a,p,d){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(p,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);}
function sTone(type,f,t,a,p,d,out){const o=SA.createOscillator(),g=SA.createGain();o.type=type;o.frequency.value=f;sEnv(g,t,a,p,d);o.connect(g);g.connect(out);o.start(t);o.stop(t+a+d+.05);return o;}
function sNoise(){if(!sndNoise){sndNoise=SA.createBuffer(1,SA.sampleRate*2,SA.sampleRate);const d=sndNoise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}return sndNoise;}
function sHit(t,type,freq,v,dec,out){const s=SA.createBufferSource();s.buffer=sNoise();const f=SA.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=SA.createGain();sEnv(g,t,.002,v,dec);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*1.5);s.stop(t+dec+.05);}
// 乐器
function sBell(m,t,v,out,len){len=len||1.4;sTone('sine',sHz(m),t,.004,v,len,out);sTone('sine',sHz(m)*2,t,.003,v*.06,len*.4,out);}
function sMar(m,t,v,out){sTone('sine',sHz(m),t,.003,v,.38,out);sTone('sine',sHz(m)*4,t,.001,v*.16,.08,out);}
function sToy(m,t,v,out){sTone('triangle',sHz(m),t,.002,v,.28,out);sTone('sine',sHz(m)*3,t,.001,v*.25,.07,out);}
function sKal(m,t,v,out,len){len=len||1.6;sTone('sine',sHz(m),t,.014,v,len,out);sTone('sine',sHz(m)*2,t,.01,v*.04,.35,out);}
function sEp(m,t,v,out,len){sTone('sine',sHz(m),t,.01,v,len||1.6,out);sTone('triangle',sHz(m)*2,t,.005,v*.12,.4,out);}
function sPad(m,t,len,v,out,cut,soft){[0,5].forEach(dt=>{const o=SA.createOscillator(),g=SA.createGain(),f=SA.createBiquadFilter();o.type='triangle';o.frequency.value=sHz(m);o.detune.value=dt;f.type='lowpass';f.frequency.value=cut||1000;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+(soft?len*.4:Math.min(1.2,len/3)));g.gain.setValueAtTime(v,t+len*.75);g.gain.linearRampToValueAtTime(0.0001,t+len+.5);o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+len+.7);});}
function sPno(m,t,v,out,len){len=len||2.2;const o=SA.createOscillator(),f=SA.createBiquadFilter(),g=SA.createGain();o.type='triangle';o.frequency.value=sHz(m);f.type='lowpass';f.frequency.setValueAtTime(2200,t);f.frequency.exponentialRampToValueAtTime(600,t+len);sEnv(g,t,.006,v,len);o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+len+.1);sTone('sine',sHz(m),t,.006,v*.6,len*.8,out);}
function sKick(t,v,out){const o=SA.createOscillator(),g=SA.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(50,t+.12);sEnv(g,t,.002,v,.18);o.connect(g);g.connect(out);o.start(t);o.stop(t+.25);}
function sWood(t,v,out){sTone('sine',1150,t,.001,v,.05,out);sTone('sine',1700,t,.001,v*.4,.03,out);}
function sTri(t,v,out){sTone('sine',2794,t,.002,v,1.6,out);sTone('sine',3720,t,.002,v*.6,1.2,out);}
function sSlide(t,v,out){const o=SA.createOscillator(),g=SA.createGain(),l=SA.createOscillator(),lg=SA.createGain();o.frequency.setValueAtTime(700,t);o.frequency.exponentialRampToValueAtTime(1500,t+.45);l.frequency.value=7;lg.gain.value=25;l.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+.08);g.gain.linearRampToValueAtTime(0.0001,t+.5);o.connect(g);g.connect(out);o.start(t);l.start(t);o.stop(t+.55);l.stop(t+.55);}

const SCH={C:[60,64,67],G:[55,59,62],F:[53,57,60],Am:[57,60,64],Dm:[50,53,57],Bb:[58,62,65],Gm:[55,58,62],D:[62,66,69],A:[57,61,64],Bm:[59,62,66],
  Cmaj7:[60,64,67,71],Am7:[57,60,64,67],Fmaj7:[53,57,60,64],G6:[55,59,62,64],Em7:[52,55,59,62],Dm7:[50,53,57,60]};

// ===== 窗边雨 =====
const RAINc=['Cmaj7','Am7','Fmaj7','G6','Em7','Am7','Dm7','G6'];
const RAINm=[[[76,2],[79,1],[77,1]],[[76,3],[72,1]],[[69,2],[72,1],[76,1]],[[74,4]],[[71,2],[74,1],[76,1]],[[72,3],[76,1]],[[77,2],[76,1],[74,1]],[[71,2],[74,2]]];
function sPlayRain(out,t0){const len=4.4,q=len/4;let t=t0;RAINc.forEach((n,i)=>{const c=SCH[n];c.forEach(m=>sPad(m,t,len,.028,out,1000));sEp(c[0]-24,t,.14,out,3.5);sEp(c[0]-12,t+2*q,.06,out,2);c.forEach((m,k)=>sEp(m+12,t+k*.38+.1,.045,out,1.8));let tt=t;RAINm[i].forEach(([m,l])=>{sEp(m,tt+.2,.11,out,l*q+.6);tt+=l*q;});t+=len;});return t-t0;}
function sStartRain(out){
  const s=SA.createBufferSource();s.buffer=sNoise();s.loop=true;
  const hp=SA.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;
  const lp=SA.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4500;
  const g=SA.createGain();g.gain.value=.055;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(out);s.start();sndRain=s;
  const drip=()=>{if(sndPlaying!=='rain')return;const t=SA.currentTime,o=SA.createOscillator(),gg=SA.createGain();o.frequency.setValueAtTime(1800+Math.random()*1400,t);o.frequency.exponentialRampToValueAtTime(900,t+.06);sEnv(gg,t,.002,.045,.08);o.connect(gg);gg.connect(out);o.start(t);o.stop(t+.12);sndTimers.push(setTimeout(drip,300+Math.random()*1300));};drip();
  const thunder=()=>{if(sndPlaying!=='rain')return;const t=SA.currentTime,ts=SA.createBufferSource();ts.buffer=sNoise();const f=SA.createBiquadFilter();f.type='lowpass';f.frequency.value=160;const g2=SA.createGain();g2.gain.setValueAtTime(0.0001,t);g2.gain.linearRampToValueAtTime(.35,t+.8);g2.gain.exponentialRampToValueAtTime(0.0001,t+4);ts.connect(f);f.connect(g2);g2.connect(out);ts.start(t);ts.stop(t+4.2);sndTimers.push(setTimeout(thunder,18000+Math.random()*16000));};
  sndTimers.push(setTimeout(thunder,9000));
}

// ===== 下午茶 =====
const TEA_A=[[[77,1],[0,1],[81,1],[84,1],[82,1],[81,1],[79,2]],[[77,1],[79,1],[81,1],[77,1],[74,2],[0,2]],[[72,1],[74,1],[77,1],[79,1],[81,2],[79,1],[77,1]],[[76,2],[79,2],[77,4]],[[84,1],[0,1],[84,1],[82,1],[81,2],[79,2]],[[77,1],[81,1],[79,1],[77,1],[76,2],[74,2]],[[72,1],[74,1],[76,1],[77,1],[79,2],[72,2]],[[77,6],[0,2]]],TEA_Ac=['F','Dm','Bb','C','F','Dm','C','F'];
const TEA_B=[[[82,2],[81,1],[79,1],[77,2],[79,2]],[[81,3],[79,1],[76,4]],[[81,1],[79,1],[77,1],[76,1],[74,2],[76,2]],[[77,2],[74,2],[72,4]],[[82,1],[84,1],[86,2],[84,1],[82,1],[81,2]],[[79,1],[81,1],[82,2],[81,4]],[[79,2],[77,1],[76,1],[74,2],[76,2]],[[77,4],[72,4]]],TEA_Bc=['Bb','C','Am','Dm','Bb','F','Gm','C'];
const TEA_C=[[[74,2],[77,2],[81,3],[0,1]],[[79,1],[77,1],[76,2],[74,4]],[[70,2],[74,2],[77,3],[0,1]],[[76,1],[77,1],[79,2],[72,4]],[[74,2],[77,2],[81,2],[84,2]],[[82,1],[81,1],[79,2],[77,4]],[[74,1],[76,1],[77,1],[79,1],[81,2],[79,2]],[[77,8]]],TEA_Cc=['Dm','Am','Bb','C','Dm','Gm','C','F'];
function sPlayTea(out,t0){const e=.24;let t=t0;const sec=(bars,chs,mode)=>{bars.forEach((bar,i)=>{const c=SCH[chs[i]],r=c[0]-12,quiet=mode==='break'&&i<4,full=mode!=='plain'&&!quiet;for(let k=0;k<8;k++)sHit(t+k*e,'highpass',7000,k%2?.04:.07,.04,out);sWood(t+3*e,.12,out);sWood(t+7*e,.1,out);if(!quiet){sKick(t,.3,out);sKick(t+4*e,.25,out);sMar(r,t,.2,out);sMar(r+7,t+3*e,.09,out);sMar(r+12,t+4*e,.14,out);sMar(r+7,t+7*e,.09,out);}else{sToy(r+12,t,.08,out);sToy(r+19,t+4*e,.06,out);}if(full){sHit(t+2*e,'bandpass',1800,.18,.08,out);sHit(t+6*e,'bandpass',1800,.18,.08,out);}[1,5].forEach(k=>c.forEach(m=>sTone('triangle',sHz(m),t+k*e,.004,.025,.12,out)));if(i%4===3)sTri(t+4*e,.03,out);let tt=t;bar.forEach(([m,l])=>{if(m){if(quiet)sToy(m,tt,.16,out);else sMar(m,tt,.21,out);if(l>=2&&!quiet)sToy(m+12,tt+(l>=4?2:1)*e,.07,out);}tt+=l*e;});if(i===bars.length-1){[0,2,4,7].forEach((d,k)=>sToy(c[0]+12+d+(k===3?5:0),t+(4+k*.5)*e,.08,out));sSlide(t+6.2*e,.05,out);}t+=8*e;});};sec(TEA_A,TEA_Ac,'plain');sec(TEA_B,TEA_Bc,'full');sec(TEA_C,TEA_Cc,'break');sec(TEA_A,TEA_Ac,'full');return t-t0;}

// ===== 拇指琴 =====
const KAL_A=[[[74,1],[78,1],[81,1]],[[83,2],[81,1]],[[78,1],[76,1],[74,1]],[[76,3]],[[74,1],[78,1],[81,1]],[[86,2],[85,1]],[[83,1],[81,1],[79,1]],[[81,3]]],KAL_Ac=['D','G','D','A','D','Bm','G','A'];
const KAL_B=[[[83,1],[81,1],[79,1]],[[78,2],[76,1]],[[79,1],[78,1],[76,1]],[[74,3]],[[71,1],[74,1],[78,1]],[[76,2],[78,1]],[[74,3]],[[0,3]]],KAL_Bc=['G','D','A','D','Bm','A','D','D'];
function sPlayKal(out,t0){const b=.5;let t=t0;const sec=(bars,chs,echo)=>{bars.forEach((bar,i)=>{const c=SCH[chs[i]];sPad(c[0]-12,t,3*b,.015,out,700,true);sPad(c[2]-12,t,3*b,.01,out,700,true);sKal(c[0]-12,t,.12,out,2);sKal(c[1],t+b,.04,out,1.1);sKal(c[2],t+2*b,.04,out,1.1);let tt=t;bar.forEach(([m,l])=>{if(m){sKal(m,tt,.14,out);if(echo&&l>=2)sKal(m-12,tt+b,.05,out,1.2);}tt+=l*b;});t+=3*b;});};sec(KAL_A,KAL_Ac,false);sec(KAL_B,KAL_Bc,false);sec(KAL_A,KAL_Ac,true);sec(KAL_B,KAL_Bc,true);return t-t0;}

// ===== 小夜灯 =====
const NIGHT=[[[71,3],[74,2],[71,1]],[[72,3],[69,3]],[[67,2],[69,1],[71,2],[72,1]],[[74,6]],[[76,3],[74,2],[72,1]],[[71,3],[69,3]],[[67,2],[69,1],[71,2],[69,1]],[[67,6]]],NIGHTc=['G','C','G','D','C','G','D','G'];
function sPlayNight(out,t0){const e=.32;let t=t0;[0,1].forEach(rep=>{NIGHT.forEach((bar,i)=>{const c=SCH[NIGHTc[i]],r=c[0]-12;[r,r+7,r+12,c[1],r+7,r+12].forEach((m,k)=>sPno(m,t+k*e,k?.045:.08,out,2.4));let tt=t;bar.forEach(([m,l])=>{sPno(m+(rep?12:0),tt,rep?.1:.14,out,l*e+1.2);tt+=l*e;});if(i===3||i===7)c.forEach((m,k)=>sBell(m+12,t+3*e+k*.24,.035,out,1.6));t+=6*e;});});return t-t0;}

const SND_PLAY={rain:sPlayRain,tea:sPlayTea,kal:sPlayKal,night:sPlayNight};

function sndStop(){
  sndTimers.forEach(clearTimeout); sndTimers=[];
  if(sndTrackGain&&SA){const g=sndTrackGain;g.gain.setTargetAtTime(0,SA.currentTime,.15);setTimeout(()=>{try{g.disconnect();}catch(e){}},900);}
  sndTrackGain=null;
  if(sndRain){try{sndRain.stop(SA.currentTime+.5);}catch(e){} sndRain=null;}
  sndPlaying=null;
}
function sndStart(){
  if(!sndCtx()) return;
  sndStop();
  const id=SND_PLAY[sndCfg.track]?sndCfg.track:'rain';
  sndPlaying=id;
  const out=SA.createGain(); out.connect(SM); sndTrackGain=out;
  if(id==='rain') sStartRain(out);
  const fn=SND_PLAY[id];
  const loop=t0=>{if(sndPlaying!==id||sndTrackGain!==out)return;const len=fn(out,t0);sndTimers.push(setTimeout(()=>loop(t0+len),(t0+len-SA.currentTime-.5)*1000));};
  loop(SA.currentTime+.1);
}

// ===== 小音效 =====
function sfx(k){
  if(!sndCfg.fx) return;
  if(!sndCtx()) return;
  const t=SA.currentTime+.02,o=SFXG;
  try{
  if(k==='drop'){sBell(88,t,.25,o);sBell(84,t+.13,.25,o);}
  else if(k==='shake'){for(let i=0;i<7;i++)sHit(t+i*.07,'bandpass',2500+Math.random()*2500,.35,.05,o);}
  else if(k==='poke'){const os=SA.createOscillator(),g=SA.createGain();os.frequency.setValueAtTime(700,t);os.frequency.exponentialRampToValueAtTime(1500,t+.12);sEnv(g,t,.01,.22,.18);os.connect(g);g.connect(o);os.start(t);os.stop(t+.25);}
  else if(k==='groom'){const s=SA.createBufferSource();s.buffer=sNoise();const f=SA.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(1500,t);f.frequency.linearRampToValueAtTime(3500,t+.35);const g=SA.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(.12,t+.12);g.gain.linearRampToValueAtTime(0.0001,t+.4);s.connect(f);f.connect(g);g.connect(o);s.start(t);s.stop(t+.45);}
  else if(k==='kiss'){[0,.13].forEach(d=>{const os=SA.createOscillator(),g=SA.createGain();os.frequency.setValueAtTime(900,t+d);os.frequency.exponentialRampToValueAtTime(1800,t+d+.06);sEnv(g,t+d,.004,.16,.07);os.connect(g);g.connect(o);os.start(t+d);os.stop(t+d+.1);});}
  else if(k==='daze'){sBell(79,t,.08,o,1.2);sBell(76,t+.35,.07,o,1.2);sBell(72,t+.7,.06,o,1.6);}
  else if(k==='munch'){[0,.16,.32].forEach(d=>sHit(t+d,'lowpass',1600,.5,.07,o));}
  else if(k==='cash'){sMar(84,t,.25,o);sMar(88,t+.08,.25,o);sBell(91,t+.18,.22,o);}
  else if(k==='merge'){const os=SA.createOscillator(),g=SA.createGain();os.frequency.setValueAtTime(520,t);os.frequency.exponentialRampToValueAtTime(260,t+.09);sEnv(g,t,.003,.3,.1);os.connect(g);g.connect(o);os.start(t);os.stop(t+.15);}
  else if(k==='catch'){const os=SA.createOscillator(),g=SA.createGain();os.type='triangle';os.frequency.setValueAtTime(900,t);os.frequency.exponentialRampToValueAtTime(2200,t+.07);sEnv(g,t,.003,.2,.09);os.connect(g);g.connect(o);os.start(t);os.stop(t+.12);}
  else if(k==='level'){[72,76,79,84].forEach((m,i)=>sBell(m,t+i*.08,.18,o));}
  }catch(e){}
}

// ===== 设置里的「声音」 =====
function sndRender(){
  const m=document.getElementById('snd-music'), f=document.getElementById('snd-fx');
  if(m) m.classList.toggle('on',!!sndCfg.music);
  if(f) f.classList.toggle('on',!!sndCfg.fx);
  const tr=document.getElementById('snd-tracks');
  if(tr) tr.innerHTML=SND_TRACKS.map(x=>'<div class="snd-chip'+(x.id===sndCfg.track?' on':'')+'" onclick="sndPick(\''+x.id+'\')">'+x.name+'</div>').join('');
  const v=document.getElementById('snd-vol'); if(v) v.value=sndCfg.vol;
  const box=document.getElementById('snd-music-opts'); if(box) box.style.opacity=sndCfg.music?1:.5;
}
function sndToggleMusic(){sndCfg.music=!sndCfg.music;sndSave();sndRender();if(sndCfg.music)sndStart();else sndStop();}
function sndToggleFx(){sndCfg.fx=!sndCfg.fx;sndSave();sndRender();if(sndCfg.fx)sfx('drop');}
function sndPick(id){sndCfg.track=id;sndSave();sndRender();if(!sndCfg.music){sndCfg.music=true;sndSave();sndRender();}sndStart();}
function sndSetVol(v){sndCfg.vol=+v;sndSave();if(SM&&SA)SM.gain.setTargetAtTime(sndCfg.vol/100,SA.currentTime,.05);}

// 切到后台就停，回来接着放；打开 app 后第一次碰屏幕才能出声（手机的规矩）
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){sndStop();if(SA&&SA.state==='running')SA.suspend();}
  else if(sndCfg.music&&SA){SA.resume();sndStart();}
});
(function(){
  const first=()=>{document.removeEventListener('pointerdown',first,true);if(sndCfg.music&&!sndPlaying)sndStart();};
  document.addEventListener('pointerdown',first,true);
})();

// 把小音效挂到各处
(function(){
  const wrap=(name,fn)=>{const orig=window[name];if(typeof orig!=='function')return;window[name]=function(){try{fn.apply(this,arguments);}catch(e){}return orig.apply(this,arguments);};};
  wrap('submitCandy',()=>sfx('drop'));
  wrap('shakeJar',()=>sfx('shake'));
  wrap('abebeAction',type=>sfx({poke:'poke',groom:'groom',kiss:'kiss',daze:'daze'}[type]||'poke'));
  wrap('feedSnack',()=>sfx('munch'));
  wrap('snackSpend',price=>{if(price>0)sfx('cash');});
  if(typeof g2AfterMove==='function'){
    const orig=g2AfterMove;
    window.g2AfterMove=function(maxNew){
      try{if(maxNew>=64&&typeof g2Shown!=='undefined'&&!g2Shown[maxNew])sfx('level');else if(maxNew>0)sfx('merge');}catch(e){}
      return orig.apply(this,arguments);
    };
  }
  sndRender();
})();
