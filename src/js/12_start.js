/* ===================== START ===================== */
const COLORS=['#e8433c','#f59e0b','#2fb556','#3b82f6','#a855f7','#ec4899'];
let pickColor=COLORS[3],pickSex='m';
function buildStart(){
  const cw=$('#scolors');
  const prev=()=>{const c=$('#sprev').getContext('2d');c.clearRect(0,0,16,19);c.drawImage(charSprite(pickColor,'down',0,pickSex),0,0);document.querySelectorAll('[data-sex]').forEach(b=>b.classList.toggle('green',b.dataset.sex===pickSex))};
  document.querySelectorAll('[data-sex]').forEach(b=>b.onclick=()=>{pickSex=b.dataset.sex;prev()});
  COLORS.forEach(col=>{const b=document.createElement('button');b.style.background=col;if(col===pickColor)b.classList.add('sel');b.onclick=()=>{pickColor=col;[...cw.children].forEach(x=>x.classList.remove('sel'));b.classList.add('sel');prev()};cw.appendChild(b)});
  prev();
  // a new session always starts here: a lobby from an earlier session is not resumed (free-play team, dex and trophies are kept)
  $('#sgo').onclick=()=>{if(!pwOK()){const v=($('#spw').value||'').trim().toUpperCase();if(!pwCheck(v)){toast('Falsches Passwort.');$('#spw').focus();return}try{localStorage.setItem(PW_KEY,v)}catch(e){}if(!ROOM)initRoom()}
    const nm=cleanName($('#sname').value);let resume=false;try{resume=sessionStorage.getItem('pp_live')==='1'}catch(e){}if(G){G.name=nm;G.color=pickColor;G.sex=pickSex;if(!resume||!Number.isFinite(G.x)){G.x=VSPAWN.x;G.y=VSPAWN.y;G.d='down'}const live=G.run&&!G.run.free&&Date.now()-(G.t||0)<30*60000&&!(G.run.phase!=='lobby'&&G.run.end&&Date.now()-G.run.end>20*60000);G.run=live?G.run:(G.freeRun||null)}else G={mapv:2,name:nm,color:pickColor,sex:pickSex,dex:{},tro:0,x:VSPAWN.x,y:VSPAWN.y,d:'down',run:null};RUN=G.run||G.freeRun||null;save();begin()};
  $('#sname').addEventListener('keydown',e=>{if(e.key==='Enter')$('#sgo').click()});$('#spw').addEventListener('keydown',e=>{if(e.key==='Enter')$('#sgo').click()});
  if(pwOK())$('#spwf').style.display='none';
  // after an update reload: continue right away (same name, same place)
  try{if(sessionStorage.getItem('pp_upd')==='1'&&G&&G.name&&pwOK()){sessionStorage.removeItem('pp_upd');if(!$('#sname').value)$('#sname').value=G.name;setTimeout(()=>$('#sgo').click(),60)}}catch(e){}
}
function begin(){
  $('#start').classList.add('off');try{sessionStorage.setItem('pp_live','1')}catch(e){}
  RUN=G.run||G.freeRun||null;
  // a lobby game saved long ago is dead (its players are gone) → back to free play instead of a lonely arena
  if(RUN&&!RUN.free){const age=Date.now()-(G.t||0),over=RUN.phase!=='lobby'&&RUN.end&&Date.now()-RUN.end>20*60000;if(age>30*60000||over){RUN=G.freeRun||null;G.run=RUN;setTimeout(()=>sysChat('Dein altes Lobby-Spiel ist beendet — zurück zum freien Spiel.'),500)}}
  // saves from before Knastémon may still hold the removed classic monsters → swap them for a base of the same level
  for(const R of[G.run,G.freeRun])if(R&&Array.isArray(R.team)){const fix=m=>{if(m&&SPECIES[m.s])return m;if(!m)return null;const pool=ALT_BASES;const n=newMon(pool[Math.floor(Math.random()*pool.length)],clamp(+m.l||START_LV,1,60));n.hp=stats(n).mhp;return n};
    R.team=R.team.map(fix).filter(Boolean);R.box=(R.box||[]).map(fix).filter(Boolean);if(!R.team.length)R.team=[newMon(ALT_STARTERS[0],START_LV)]}
  if(RUN){RUN.beat=RUN.beat||{};RUN.leg=RUN.leg||{};if(RUN.money==null)RUN.money=100;RUN.items=RUN.items||{};RUN.box=RUN.box||[];if(RUN.team.length>teamMax())RUN.box.push(...RUN.team.splice(teamMax()))}
  // a running lobby survives a reload (e.g. after an update): an interrupted duel or pick goes back to waiting
  if(RUN&&!RUN.free){if(RUN.st==='duel'||RUN.st==='pick')RUN.st=RUN.phase==='arena'?'wait':RUN.st;RUN.rdy=0;plog('[lobby] nach Neuladen fortgesetzt',RUN.id,RUN.phase);setTimeout(()=>sysChat('Dein Lobby-Spiel geht weiter — Team und Fortschritt sind erhalten.'),600)}
  if(G.freeRun&&G.freeRun!==RUN){if(G.freeRun.money==null)G.freeRun.money=100;G.freeRun.items=G.freeRun.items||{}}
  // free play has no timer and no arena (also repairs saves broken by an older version)
  if(RUN&&RUN.free){RUN.phase='train';RUN.st='free';RUN.r=1;RUN.res=[];$('#arena').classList.remove('on')}
  if(RUN&&!RUN.free&&RUN.phase==='train'&&Date.now()>=RUN.end){RUN.phase='arena_pending'}
  if(RUN&&!RUN.free&&RUN.phase==='arena'){RUN.res=RUN.res||[];if(RUN.st==='duel'){RUN.res.push([RUN.r,RUN.dopp||'?',0]);RUN.r++;RUN.st=RUN.r>roundsOf()?'done':'wait'}if(RUN.st==='pick')RUN.st='wait'}
  // new world (map v2): old positions and toll passes no longer fit → back to Villingen
  if(G.mapv!==2&&G.mapv!==3){G.mapv=2;G.x=VSPAWN.x;G.y=VSPAWN.y;for(const R of[G.run,G.freeRun])if(R){R.toll={};R.towns={vil:1};R.lastPad=null}}
  if(G.mapv!==3){G.mapv=3;G.x=VSPAWN.x;G.y=VSPAWN.y;for(const R of[G.run,G.freeRun])if(R)R.lastPad=null}
  P.x=P.fx=G.x;P.y=P.fy=G.y;P.d=G.d||'down';if(!walkable(P.x,P.y)){P.x=P.fx=VSPAWN.x;P.y=P.fy=VSPAWN.y}
  P.fol={x:P.x,y:P.y,tx:P.x,ty:P.y};
  renderTeam();updateHud();pushFull();sysChat(`Willkommen bei Pocket Peasants, ${G.name}! Dienstbeginn — schnapp sie dir alle!`);
  if(RUN&&RUN.phase==='arena_pending'){RUN.phase='train';enterArena()}else if(RUN&&RUN.phase==='arena')showArena();
  if(RUN)setSide(false);
}

