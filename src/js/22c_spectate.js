/* ===================== COURT: arena choice, spectating =====================
   Spectators render a running tournament duel purely from the two duelists' presence ("du": positions, HP, shots),
   which is broadcast to the whole room anyway — watching costs no extra bandwidth. Nothing is simulated or hit here. */
const ARENA_ZONES=['arena','north','east','south','west','snow','desert','jungle','knast'];
function arenaName(z){return z==='arena'?'Gerichtssaal':(ZONES[z]&&ZONES[z].n)||z}
// the battle map of a duel: chosen in the lobby settings, otherwise random per duel (same for both players and spectators)
function duelZone(id){const a=RUN&&!RUN.free&&RUN.cfg&&RUN.cfg.arena;if(a&&ARENA_ZONES.includes(a))return a;if(!RUN||RUN.free)return'arena';return ARENA_ZONES[hashStr(String(id))%ARENA_ZONES.length]}
// tournament duels running right now (both duelists publish "du" with an id of this lobby)
function runningDuels(){if(!RUN||RUN.free)return[];const seen=new Map();
  for(const p of others()){const du=p.presence.du;if(!du||typeof du.id!=='string'||du.tb||!du.id.startsWith(RUN.id+'-')||typeof du.opp!=='string')continue;
    // only live duels: both duelists publish it, neither is finished
    if(du.ov||!Array.isArray(du.hp)||!du.hp.some(h=>+h>0))continue;const e=seen.get(du.id)||{id:du.id,peers:new Set(),pub:new Set()};e.peers.add(p.peer);e.peers.add(du.opp);e.pub.add(p.peer);seen.set(du.id,e)}
  const nm=id=>{const q=findPeer(id);return q?cleanName(q.presence.n):'?'};
  return[...seen.values()].filter(e=>e.peers.size===2&&e.pub.size===2&&![...e.peers].includes(MYPEER||'me')).map(e=>{const ps=[...e.peers].sort();return{id:e.id,L:ps[0],R:ps[1],nL:nm(ps[0]),nR:nm(ps[1])}})}
function specStart(d){if(B)return;const myB={mode:'spec',state:'fight',id:d.id,pL:d.L,pR:d.R,oppName:d.nR,nL:d.nL,nR:d.nR,zone:duelZone(d.id),shots:[],parts:[],nums:[],log:[],vshots:[],seen:new Set(),me:null,foe:null,miss:0,t0:performance.now(),tb:false,obs:[]};
  B=myB;B.obs=genObs(hashStr(String(d.id)),B.zone);held.length=0;aimHeld.length=0;
  $('#battle').classList.add('on');buildSpecUI();say(`👁 Du schaust zu: ${d.nL} gegen ${d.nR}`);RUN.specT=Date.now()}
function specStop(manual){if(!B||B.mode!=='spec')return;B=null;try{FX=null;fxc.clearRect(0,0,fxcv.width,fxcv.height)}catch(e){}$('#battle').classList.remove('on');$('#bpick').classList.remove('on');
  try{$('#stage').style.transform='';placeDpad()}catch(e){}if(manual&&RUN)RUN.specOff=Date.now();if(RUN&&RUN.phase==='arena'){$('#abox').dataset.h='';showArena()}}
function buildSpecUI(){const el=$('#bact');if(!el)return;el.innerHTML=`<div class="specbar"><span>👁 ZUSCHAUER</span><span id="specrdy"></span><button class="btn ghost" id="specchat">💬 CHAT</button><button class="btn ghost" id="specx">✕ ZURÜCK</button></div>`;
  $('#specx').onclick=()=>specStop(true);$('#specchat').onclick=()=>{switchTab('chat');setSide(true);try{$('#chatin').focus()}catch(e){}};
  const k=$('#bctl .keys');if(k)k.remove();const bp=$('#bpad');if(bp)bp.innerHTML=''}
// ready button inside the spectator bar while my own next duel waits for ✔
function specReadyUI(){const el=$('#specrdy');if(!el||!RUN)return;const p=RUN.pair,need=RUN.st==='wait'&&p&&p.r===RUN.r&&p.opp!=='bye'&&RUN.r>1;
  const key=need?(RUN.rdy>=RUN.r?'y':'n')+p.opp:'';if(el.dataset.k===key)return;el.dataset.k=key;
  el.innerHTML=need?`<button class="btn ${RUN.rdy>=RUN.r?'ghost':'green'}" id="specready">${RUN.rdy>=RUN.r?'✔ BEREIT – warte…':'✔ BEREIT für Runde '+RUN.r}</button>`:'';const b=$('#specready');if(b)b.onclick=()=>{toggleReady();el.dataset.k=''}}
function specFighter(side,du){let t=sanitizeTeam(du.team);if(!t)return null;t=t.slice(0,cfgOf().team);const F=mkFighter(side,t,side==='L'?XL:XR,'remote');if(Number.isFinite(+du.x)&&+du.x){F.x=+du.x;F.y=+du.y}F.spawnT=0;F.inv=0;return F}
function specSide(F,du,dt,now){const tx=+du.x,ty=+du.y;if(Number.isFinite(tx)&&tx){const k=Math.min(1,dt*14);F.x+=(tx-F.x)*k;F.y+=(ty-F.y)*k}
  const a=Math.floor(+du.a);if(a>=0&&a<F.team.length&&a!==F.a)F.a=a;
  if(Array.isArray(du.hp))F.team.forEach((m,i)=>{const v=clamp(Math.floor(+du.hp[i]),0,m.mhp);if(Number.isFinite(v)&&v<m.hp){F.hurtT=now;B.nums.push({x:F.x,y:F.y-34,t:'-'+(m.hp-v),c:'#fff',at:now});F.flash=0.25}if(Number.isFinite(v))m.hp=v});
  if(Array.isArray(du.sg))F.stg={a:clamp(du.sg[0]|0,-4,4),d:clamp(du.sg[1]|0,-4,4),s:clamp(du.sg[2]|0,-4,4)};
  F.stShow=Array.isArray(du.fx)?du.fx.filter(k=>typeof k==='string'&&k in F.st):[];F.out=F.team.every(m=>m.hp<=0);F.faint=act(F).hp<=0?1:0;F.flash=Math.max(0,(F.flash||0)-dt);
  if(Array.isArray(du.ob)&&B.obs)for(const id of du.ob){const o=B.obs.find(o=>o.id===+id);if(o&&!o.dead)breakObs(o)}
  // shots: only drawn (they fly along their path), the duelists decide the hits
  if(Array.isArray(du.sh))for(const e of du.sh.slice(-14)){if(!Array.isArray(e))continue;const id=String(e[0]).slice(0,40);if(B.seen.has(id))continue;B.seen.add(id);
    const ai=clamp(Math.floor(+e[1]),0,F.team.length-1),mid=MOVES[e[2]]?e[2]:'bump',sp=shotParams(mid);
    B.shots.push({id,side:F.side,att:F.team[ai],mid,x:clamp(+e[3]||0,0,AW),y:clamp(+e[4]||0,0,AH),vx:+e[5]||0,vy:+e[6]||0,age:0,life:sp.life,r:sp.r,p:sp.p,mel:sp.mel,wave:sp.wave,k:sp.k,h:sp.h,nm:sp.nm,spec:1})}}
function specUpdate(dt){const now=performance.now();if(dt>0)B.fps=B.fps?B.fps*0.95+(1/dt)*0.05:1/dt;
  const pL=findPeer(B.pL),pR=findPeer(B.pR),dL=pL&&pL.presence.du,dR=pR&&pR.presence.du;
  const okL=dL&&dL.id===B.id,okR=dR&&dR.id===B.id;
  if(!okL||!okR){B.miss+=dt;if(B.miss>4){say('Der Kampf ist vorbei.');setTimeout(()=>specStop(),900);B.miss=-99}return}B.miss=0;
  if(!B.me){B.me=specFighter('L',dL);B.foe=specFighter('R',dR);if(!B.me||!B.foe){B.me=B.foe=null;return}}
  specSide(B.me,dL,dt,now);specSide(B.foe,dR,dt,now);
  for(const s of B.shots){s.age+=dt;if(s.k==='lob'){if(s.x0==null){s.x0=s.x;s.y0=s.y}const u=lobU(Math.min(1,s.age/s.life));s.x=s.x0+s.vx*s.life*u;s.y=s.y0+s.vy*s.life*u}
    else if(s.k!=='air'&&s.k!=='beam'&&s.k!=='breath'&&s.k!=='fly'){s.x+=s.vx*dt;s.y+=s.vy*dt}
    if(s.k==='beam'&&s.age>=BEAM_CH)s.fired=1;if(s.age>=s.life&&!s.dead){s.dead=1;if(s.k==='lob'||s.k==='air')burst(s.x,s.y+(s.k==='lob'?12:0),TYPES[MOVES[s.mid].t].c,10)}}
  B.shots=B.shots.filter(s=>!s.dead);
  for(const p of B.parts){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=0.9;p.vy*=0.9}B.parts=B.parts.filter(p=>p.age<p.life);
  if(!B.endSaid&&(B.me.out||B.foe.out)){B.endSaid=1;say(`${B.me.out?B.nR:B.nL} gewinnt das Duell!`);setTimeout(()=>{if(B&&B.mode==='spec')specStop()},3500)}
  specReadyUI()}
// waiting in the court: watch a running duel automatically (unless the player just closed the spectator view)
function specAuto(){if(B||!RUN||RUN.free||RUN.phase!=='arena'||RUN.st==='duel'||RUN.st==='pick'||document.hidden)return;if(Date.now()-(RUN.specOff||0)<45000)return;
  const d=runningDuels()[0];if(d)specStart(d)}
