/* ===================== KOOP-EINSATZ (Prototyp) =====================
   In jeder Stadt steht ein Polizeiführer. Er eröffnet eine Lobby (bis 4 Spieler, jeder mit seinem aktiven Kader) und führt
   die Streife in eine Höhle mit 5 Räumen: Wilde → Bande → Wilde → Bande → Endboss. Nur hier gibt es Koop-Kämpfe.
   Netz: wie im Duell ist jeder für sein eigenes Monster zuständig; der Lobby-Gründer (Host) simuliert zusätzlich den Gegner
   und entscheidet über Treffer auf ihn, Sieg und Niederlage. Fangen darf nur, wer den letzten Treffer gelandet hat. */
const COOP_MAX=4,COOP_K=[1.15,1.3,1.4,1.5],COOP_TIMEOUT=9000;
ZONE_OBS.coopcave=[['boulder',2,3],['rock',2,3],['crystal',2,3],['pillar',1,2]];
BBG.coopcave=mk(2,2);
let COOP=null,CLOB=null,COOP_IV=null;
const COOP_CHIEFS=[];
const COOP_NAMES=['PHK Brandt','EPHK Kessler','PHKin Vogt','POR Lindner','PHK Aydın','PRin Hartmann','EPHK Nowak','PHK Seidel','POKin Berger','PR Yilmaz','PHK Wagner','EPHKin Roth'];
const COOP_GANG=['Kralle','Rex','Viper','Schatten','Brecher','Nadel','Zange','Funke'];
const COOP_BOSS=['„Der Pate“','„Die Spinne“','„Eisenfaust“','„Der Graf“'];
function coMe(){return MYPEER||'solo'}
function coName(peer){if(peer===coMe())return(G&&G.name)||'Du';const p=findPeer(peer);return p?cleanName(p.presence.n):'Kollege'}
function coRaw(){return RUN.team.map(m=>[m.s,m.l,m.m.slice(0,4)])}
function coTeam(arr){if(!Array.isArray(arr)||!arr.length||arr.length>6)return null;const out=[];
  for(const e of arr){if(!Array.isArray(e)||!SPECIES[e[0]])return null;const l=clamp(Math.floor(+e[1]||1),1,100);let mv=Array.isArray(e[2])?e[2].filter(x=>typeof x==='string'&&MOVES[x]).slice(0,4):[];if(!mv.length)mv=['bump'];const b=battler({s:e[0],l,hp:0,m:mv});b.hp=b.mhp;out.push(b)}return out}

// ---- Polizeiführer in jeder Stadt ----
{const taken=[];TOWNS.forEach((T,i)=>{const s=wpNear(T.x+3,T.y+2,taken);if(!s)return;
  const t={id:'coop_'+T.id,kind:'coopchief',gift:'coop',town:T.id,tn:T.n,n:'Polizeiführer '+COOP_NAMES[i%COOP_NAMES.length],x:s.x,y:s.y,d:'down',c:'#0a3d91',team:[],reward:0,line:'',after:''};
  taken.push(t);COOP_CHIEFS.push(t);TRAINERS.push(t)})}
{const _b=bump;bump=function(nx,ny){const t=trainerAt(nx,ny);if(t&&t.kind==='coopchief'){if(P.bumpCd>0)return;P.bumpCd=0.5;return coopChief(t)}return _b.apply(this,arguments)}}

function coLobbies(town){return others().filter(p=>{const c=p.presence.cl;return c&&c.h&&c.st==='open'&&c.town===town})}
function coopChief(t){if(!RUN||B||COOP)return;if(teamDown())return;
  const L=coLobbies(t.town);P.lock=true;
  openModal(`<h3>🚔 KOOP-EINSATZ</h3><p><b>${esc(t.n)}</b>: „In der Höhle bei ${esc(t.tn)} hat sich eine Bande verschanzt. Allein schafft das keiner – bildet eine Streife (bis ${COOP_MAX} Leute), ich führe euch hin.“</p>
   <p class="small">5 Räume: wilde Monster, Bandenmitglieder und der Bandenboss. Die Gegner sind stärker, je mehr ihr seid. Fangen darf, wer den letzten Treffer landet. Geld gibt es nur von der Bande.</p>
   ${L.length?`<p><b>Offene Streifen:</b></p>${L.map(p=>{const c=p.presence.cl;const n=1+((c.mem||[]).length);return`<button class="btn" style="width:100%;margin:3px 0" data-cj="${esc(p.peer)}" ${n>=COOP_MAX?'disabled':''}>Beitreten: ${esc(cleanName(p.presence.n))} (${n}/${COOP_MAX})</button>`}).join('')}`:'<p class="small">Gerade ist keine Streife offen.</p>'}
   <div class="acts"><button class="btn ghost" id="mno">ZURÜCK</button><button class="btn" id="cnew">NEUE STREIFE GRÜNDEN</button></div>`);
  $('#mno').onclick=()=>{closeModal();P.lock=false};
  $('#cnew').onclick=()=>{CLOB={id:'k'+Math.random().toString(36).slice(2,9),host:true,hostPeer:coMe(),town:t.town,tn:t.tn,chief:t.n,zone:zoneAt(t.x,t.y)||'north'};pres({cl:{id:CLOB.id,h:1,st:'open',town:t.town,tm:coRaw(),mem:[]}});coLobbyView()};
  document.querySelectorAll('[data-cj]').forEach(b=>b.onclick=()=>{const p=findPeer(b.dataset.cj);const c=p&&p.presence.cl;if(!c){toast('Diese Streife gibt es nicht mehr.');return}
    CLOB={id:c.id,host:false,hostPeer:p.peer,town:t.town,tn:t.tn,chief:t.n};pres({cl:{j:c.id,jt:Date.now(),tm:coRaw()}});coLobbyView()})}
function coLeaveLobby(msg){CLOB=null;pres({cl:null});if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}closeModal();P.lock=false;if(msg)toast(msg)}
function coJoiners(){if(!CLOB)return[];return others().filter(p=>p.presence.cl&&p.presence.cl.j===CLOB.id).sort((a,b)=>(+a.presence.cl.jt||0)-(+b.presence.cl.jt||0)).slice(0,COOP_MAX-1)}
function coKader(tm){return(tm||[]).map(e=>`${esc(SPECIES[e[0]]?SPECIES[e[0]].n:'?')} <span class="small">Lv ${e[1]|0}</span>`).join(' · ')||'–'}
function coLobbyView(){if(COOP_IV)clearInterval(COOP_IV);const draw=()=>{if(!CLOB){clearInterval(COOP_IV);COOP_IV=null;return}
    let rows=[],ok=true,info='';
    if(CLOB.host){const J=coJoiners();rows=[[coMe(),coRaw()],...J.map(p=>[p.peer,p.presence.cl.tm])];pres({cl:{id:CLOB.id,h:1,st:'open',town:CLOB.town,tm:coRaw(),mem:J.map(p=>p.peer)}})}
    else{const h=findPeer(CLOB.hostPeer),c=h&&h.presence.cl;if(!c||c.id!==CLOB.id){coLeaveLobby('Die Streife wurde aufgelöst.');return}
      if(c.st==='go'){if((c.mem||[]).includes(coMe())&&c.plan){coLeaveLobbyQuiet();coopStart(c.plan,CLOB0.hostPeer);return}coLeaveLobby('Die Streife ist ohne dich losgezogen – sie war voll.');return}
      rows=[[CLOB.hostPeer,c.tm],...(c.mem||[]).map(id=>{const p=findPeer(id);return[id,p&&p.presence.cl?p.presence.cl.tm:null]})];ok=(c.mem||[]).includes(coMe());info=ok?'Du bist dabei. Warte, bis der Streifenführer startet …':'Die Streife ist voll – du stehst auf der Warteliste.'}
    const html=`<h3>🚔 STREIFE · ${esc(CLOB.tn)}</h3><p class="small">${esc(CLOB.chief)} wartet am Höhleneingang.</p>
      <div style="text-align:left">${rows.map(([id,tm],i)=>`<div style="padding:4px 6px;margin:3px 0;background:#ffffff10;border-radius:6px"><b>${i===0?'⭐ ':''}${esc(coName(id))}</b><br>${coKader(tm)}</div>`).join('')}
      ${Array.from({length:Math.max(0,COOP_MAX-rows.length)},()=>'<div class="small" style="padding:4px 6px;margin:3px 0;border:1px dashed #ffffff30;border-radius:6px">freier Platz</div>').join('')}</div>
      ${info?`<p class="small">${info}</p>`:`<p class="small">${rows.length} von ${COOP_MAX} Plätzen belegt. Du kannst auch allein starten.</p>`}
      <div class="acts"><button class="btn ghost" id="cleave">VERLASSEN</button>${CLOB.host?'<button class="btn" id="cgo">EINSATZ STARTEN</button>':''}</div>`;
    if($('#mbox').dataset.co!==html||!$('#modal').classList.contains('on')){openModal(html);$('#mbox').dataset.co=html;
      $('#cleave').onclick=()=>coLeaveLobby();if($('#cgo'))$('#cgo').onclick=()=>coHostGo()}};
  draw();COOP_IV=setInterval(draw,600)}
let CLOB0=null;
function coLeaveLobbyQuiet(){CLOB0=CLOB;CLOB=null;if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}pres({cl:null});closeModal()}

// ---- Einsatzplan: 5 Räume, Stufe nach dem Kader der Streife ----
function coPlan(mem,teams,zone){const r=mulberry32((Math.random()*4e9)>>>0);const tops=teams.map(tm=>Math.max(1,...(tm||[]).map(e=>e[1]|0)));
  const L=clamp(Math.round(tops.reduce((a,b)=>a+b,0)/tops.length),3,95);
  let pool=poolOf(zone).filter(s=>SPECIES[s]&&!(SPECIES[s].minLv>L));if(!pool.length)pool=poolOf(zone).slice();
  const pick=()=>pool[Math.floor(r()*pool.length)];const fin=(s,l)=>newMon(s,l).s;
  const bs=s=>{const b=SPECIES[s].b;return b[0]+b[1]+b[2]+b[3]};
  const boss=pool.map(s=>fin(s,L+7)).sort((a,b)=>bs(b)-bs(a))[0];
  const g=()=>COOP_GANG[Math.floor(r()*COOP_GANG.length)];
  return{id:'r'+Math.random().toString(36).slice(2,9),L,mem,zone,rooms:[
    ['wild',pick(),L+2,'Wildes Monster'],['trainer',pick(),L+3,'Bandenmitglied '+g()],['wild',pick(),L+4,'Wildes Monster'],['trainer',pick(),L+5,'Bandenmitglied '+g()],['boss',boss,L+7,'Bandenboss '+COOP_BOSS[Math.floor(r()*COOP_BOSS.length)]]]}}
function coHostGo(){if(!CLOB||!CLOB.host)return;const J=coJoiners();const mem=[coMe(),...J.map(p=>p.peer)];
  const plan=coPlan(mem,[coRaw(),...J.map(p=>p.presence.cl.tm)],CLOB.zone);plan.tn=CLOB.tn;plan.chief=CLOB.chief;
  pres({cl:{id:CLOB.id,h:1,st:'go',town:CLOB.town,tm:coRaw(),mem:J.map(p=>p.peer),plan}});const hp=coMe();CLOB=null;if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}closeModal();
  // the lobby entry stays up a few seconds so every member sees the start
  setTimeout(()=>{if(!CLOB)pres({cl:null})},8000);coopStart(plan,hp)}

// ---- Höhle: Raumübersicht zwischen den Kämpfen ----
function coopStart(plan,hostPeer){COOP={id:plan.id,plan,hostPeer,host:hostPeer===coMe(),idx:0,started:-1,seen:Date.now()};P.lock=true;held.length=0;
  sysChat(`🚔 Koop-Einsatz gestartet: Höhle bei ${plan.tn} (${plan.mem.length} ${plan.mem.length===1?'Spieler':'Spieler'})`);coCave()}
function coSq(){return RUN.team.map(m=>Math.round(100*m.hp/Math.max(1,stats(m).mhp)))}
function coPubCave(go){if(!COOP)return;const o={r:COOP.id,i:COOP.idx,sq:coSq()};if(COOP.host&&go!=null)o.go=go;else if(COOP.host&&COOP.go!=null)o.go=COOP.go;pres({co:o})}
const CO_ICON={wild:'🐾',trainer:'🦹',boss:'👑'};
function coCave(){if(!COOP)return;if(COOP_IV)clearInterval(COOP_IV);if(!B)arenaScale(1);coPubCave();
  const draw=()=>{if(!COOP||B){return}
    // guests: follow the host into the next room, notice a vanished host
    if(!COOP.host){const h=findPeer(COOP.hostPeer),c=h&&h.presence.co;if(c&&c.r===COOP.id)COOP.seen=Date.now();else if(Date.now()-COOP.seen>COOP_TIMEOUT){coopEnd('Der Streifenführer hat den Einsatz verlassen.');return}
      if(c&&c.r===COOP.id&&c.go===COOP.idx&&COOP.started!==COOP.idx){coopRoom(COOP.idx);return}}
    const P_=COOP.plan,rows=P_.rooms.map((r,i)=>`<div style="padding:3px 6px;margin:2px 0;border-radius:6px;background:${i===COOP.idx?'#ffcb3d30':'#ffffff0c'}">${i<COOP.idx?'✅':i===COOP.idx?'▶':'🔒'} ${CO_ICON[r[0]]} ${i<=COOP.idx?`<b>${esc(r[3])}</b> <span class="small">· ${i===COOP.idx||i<COOP.idx?esc(SPECIES[r[1]].n)+' ':''}Lv ${r[2]}</span>`:'<span class="small">unbekannt</span>'}</div>`).join('');
    const team=P_.mem.map(id=>{let sq=null;if(id===coMe())sq=coSq();else{const p=findPeer(id),c=p&&p.presence.co;if(c&&c.r===COOP.id)sq=c.sq}
      return`<div class="small">${id===COOP.hostPeer?'⭐ ':''}<b>${esc(coName(id))}</b> ${sq?sq.map(v=>`<span style="color:${v<=0?'#8a8ea6':v<35?'#ef4444':v<70?'#ffcb3d':'#3ddc6b'}">■</span>`).join(''):'<i>offline?</i>'}</div>`}).join('');
    const html=`<h3>🕳 HÖHLE BEI ${esc(P_.tn.toUpperCase())}</h3><p class="small">${esc(P_.chief)}: „${COOP.idx===0?'Leise rein, zusammenbleiben. Ich bleibe am Eingang.':COOP.idx===4?'Da hinten sitzt der Boss. Jetzt alles geben!':'Gut gemacht. Weiter!'}“</p>
      <div style="text-align:left">${rows}</div><div style="text-align:left;margin-top:6px">${team}</div>
      <p class="small">${COOP.host?'Du führst die Streife – du entscheidest, wann es weitergeht.':'Warte, bis der Streifenführer den nächsten Raum betritt …'} Besiegte Monster werden zwischen den Räumen notdürftig versorgt (25 % KP).</p>
      <div class="acts"><button class="btn ghost" id="cabort">EINSATZ ABBRECHEN</button>${COOP.host?'<button class="btn" id="cnext">▶ RAUM BETRETEN</button>':''}</div>`;
    if($('#mbox').dataset.co!==html||!$('#modal').classList.contains('on')){openModal(html);$('#mbox').dataset.co=html;
      $('#cabort').onclick=()=>coopEnd('Du hast den Einsatz abgebrochen.');if($('#cnext'))$('#cnext').onclick=()=>{COOP.go=COOP.idx;coPubCave(COOP.idx);setTimeout(()=>{if(COOP&&!B)coopRoom(COOP.idx)},120)}}};
  draw();COOP_IV=setInterval(()=>{coPubCave();draw()},500)}
function coopEnd(msg){if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}const was=COOP;COOP=null;pres({co:null,cb:null});if(B&&B.mode==='coop')closeBattle();arenaScale(1);
  try{closeModal()}catch(e){}P.lock=false;held.length=0;if(msg){toast(msg);sysChat('🚔 '+msg)}save();if(was&&!RUN.team.some(m=>m.hp>0))teamDown()}

// ---- Gegner: stärker mit jedem Mitspieler ----
function coFoe(room,n){const[k,s,l]=room;const mon=newMon(s,l);const b=battler(mon);
  const hm=(1+0.75*(n-1))*(k==='boss'?3:k==='trainer'?1.5:1.25),am=(1+0.1*(n-1))*(k==='boss'?1.2:k==='trainer'?1.08:1);
  b.mhp=b.hp=Math.round(b.mhp*hm);b.atk=Math.round(b.atk*am);b.def=Math.round(b.def*(k==='boss'?1.15:1));if(k==='boss')b.gw=3;return b}
function coSlotX(i,n){return Math.round(ACX+(i-(n-1)/2)*Math.min(70,ARX*1.4/Math.max(1,n)))}
function coopRoom(i){if(!COOP||B)return;const P_=COOP.plan,room=P_.rooms[i],n=P_.mem.length;COOP.started=i;if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}closeModal();
  for(const m of RUN.team)if(m.hp<=0)m.hp=Math.max(1,Math.ceil(stats(m).mhp*0.25));
  arenaScale(COOP_K[clamp(n,1,4)-1]);
  const me=mkFighter('L',RUN.team.map(battler),ACX,'local');me.x=coSlotX(P_.mem.indexOf(coMe()),n);me.y=YB;
  const foe=mkFighter('R',[coFoe(room,n)],ACX,COOP.host?'ai':'remote');foe.y=YT;
  newBattle({mode:'coop',id:COOP.id+':'+i,zone:'coopcave',oppName:room[3],me,foe,state:'count',cntEnd:performance.now()+2600,allies:[],
    co:{i,room,n,last:null,F:{},seen:new Set(),seenT:{},fq:[],q:0,pubT:0,tgt:null,tgtT:0,fin:false,t0:performance.now()}});
  {const b=act(B.foe);if(b.gw)b._gwB=B}
  say(room[0]==='boss'?`👑 ${room[3]} schickt ${SPECIES[room[1]].n} (Lv ${room[2]})!`:room[0]==='trainer'?`🦹 ${room[3]} schickt ${SPECIES[room[1]].n} (Lv ${room[2]})!`:`🐾 Ein wildes ${SPECIES[room[1]].n} (Lv ${room[2]}) greift an!`);
  if(n>1)say(`Koop: ${n} Polizisten gegen einen Gegner`);G.dex[room[1]]=G.dex[room[1]]||0;
  coPubCave();coPub(true)}

// ---- Netz: eigener Zustand + Schüsse (Host zusätzlich der Gegner) ----
function coShotRow(s){const F=s.side==='L'?B.me:B.foe;return[s.id,s.side==='L'?0:1,F.a,s.mid,Math.round(s.x),Math.round(s.y),Math.round(s.vx),Math.round(s.vy)]}
function coPub(force){if(!B||B.mode!=='coop'||!COOP)return;const now=performance.now(),C=B.co;
  const nw=[];for(const s of B.shots){if(s.rm||s.pb||s.cap)continue;if(s.side==='L'||(COOP.host&&s.side==='R')){s.pb=1;nw.push(coShotRow(s))}}
  if(nw.length){(C.out=C.out||[]).push(...nw);C.out=C.out.slice(-12);if(ROOM&&ROOM.fast)for(const id of COOP.plan.mem)if(id!==coMe())try{ROOM.fast({cs:{id:B.id,sh:nw}},id)}catch(e){}force=true}
  if(!force&&now-C.pubT<60)return;C.pubT=now;const F=B.me;C.q++;
  const o={id:B.id,q:C.q,t:Math.round(now),tm:coRaw(),a:F.a,x:Math.round(F.x),y:Math.round(F.y),f:F.face>0?1:-1,hp:F.team.map(m=>m.hp),out:F.out?1:0,fx:Object.keys(F.st).filter(k=>F.st[k]>0),sh:C.out||[]};
  if(COOP.host){const T=B.foe;o.b={x:Math.round(T.x),y:Math.round(T.y),f:T.face>0?1:-1,hp:act(T).hp,fx:Object.keys(T.st).filter(k=>T.st[k]>0)};if(C.res)o.res=C.res}
  pres({cb:o})}
function coOnFast(d,peer){if(!B||B.mode!=='coop'||!d||!d.cs||d.cs.id!==B.id||!Array.isArray(d.cs.sh))return;B.co.fq.push([peer,d.cs.sh.slice(0,12)]);if(B.co.fq.length>40)B.co.fq.shift()}
function coSpawn(peer,F,e){if(!Array.isArray(e))return;const id=String(e[0]).slice(0,40)+'@'+peer;const C=B.co;if(C.seen.has(id))return;C.seen.add(id);if(B.state!=='fight')return;
  const side=e[1]?'R':'L';if(side==='R'&&peer!==COOP.hostPeer)return;const own=side==='R'?B.foe:F;if(!own)return;
  const ai=clamp(Math.floor(+e[2]),0,own.team.length-1),mid=MOVES[e[3]]?e[3]:'bump';const sp=shotParams(mid);let vx=+e[6]||0,vy=+e[7]||0;const L=Math.hypot(vx,vy)||1;if(L>sp.sp*1.05&&sp.sp){vx=vx/L*sp.sp;vy=vy/L*sp.sp}
  const s={id,side,att:own.team[ai],mid,x:+e[4]||ACX,y:+e[5]||ACY,vx,vy,age:0,life:sp.life,r:sp.r,p:sp.p,mel:sp.mel,wave:sp.wave,k:sp.k,h:sp.h,nm:sp.nm,am:1,rm:1,own:peer};
  if(s.k==='lob'){s.x0=s.x;s.y0=s.y}B.shots.push(s);if(own!==B.foe){own.atkT=performance.now();own.face=vx<0?-1:1}else if(B.foe.ctrl==='remote'){B.foe.atkT=performance.now()}}
function coSync(dt){const C=B.co,now=performance.now(),k=Math.min(1,dt*14);if(ROOM&&ROOM.onFast&&!ROOM._cofh){ROOM._cofh=1;ROOM.onFast(coOnFast)}
  for(const id of COOP.plan.mem){if(id===coMe())continue;const p=findPeer(id),c=p&&p.presence.cb;let F=C.F[id];
    if(!c||c.id!==B.id){if(F&&now-(C.seenT[id]||now)>COOP_TIMEOUT&&!F.out){F.out=true;F.gone=1;say(`${coName(id)} ist nicht mehr erreichbar.`)}continue}
    C.seenT[id]=now;
    if(!F){const tm=coTeam(c.tm);if(!tm)continue;F=C.F[id]=mkFighter('L',tm,ACX,'remote');F.spawnT=0;F.inv=0;F.peer=id;F.x=+c.x||ACX;F.y=+c.y||YB}
    F.tx=+c.x||F.x;F.ty=+c.y||F.y;F.x+=(F.tx-F.x)*k;F.y+=(F.ty-F.y)*k;F.face=c.f<0?-1:1;F.flash=Math.max(0,(F.flash||0)-dt);
    const a=Math.floor(+c.a);if(a>=0&&a<F.team.length&&a!==F.a){F.a=a;F.spawnT=now}
    if(Array.isArray(c.hp))F.team.forEach((m,i)=>{const v=clamp(Math.floor(+c.hp[i]),0,m.mhp);if(Number.isFinite(v)){if(v<m.hp&&i===F.a){F.hurtT=now;F.flash=0.25}m.hp=v}});
    F.out=!!c.out||F.team.every(m=>m.hp<=0);F.faint=act(F).hp<=0?1:0;F.stShow=Array.isArray(c.fx)?c.fx.filter(q=>typeof q==='string'&&q in F.st):[];
    if(Array.isArray(c.sh))for(const e of c.sh)coSpawn(id,F,e);
    // the host also carries the opponent
    if(id===COOP.hostPeer&&c.b&&B.foe.ctrl==='remote'){const T=B.foe,b=c.b;T.x+=((+b.x||T.x)-T.x)*k;T.y+=((+b.y||T.y)-T.y)*k;T.face=b.f<0?-1:1;const m=act(T),v=clamp(Math.floor(+b.hp),0,m.mhp);
      if(Number.isFinite(v)&&v<m.hp){T.hurtT=now;T.flash=0.25;B.nums.push({x:T.x+(Math.random()*8-4),y:T.y-34,t:'-'+(m.hp-v),c:'#ffffff',at:now});if(typeof effConfirm==='function')try{effConfirm(T)}catch(e){}}
      if(Number.isFinite(v))m.hp=v;T.stShow=Array.isArray(b.fx)?b.fx.filter(q=>typeof q==='string'&&q in T.st):[];if(m.hp<=0&&!T.koShown){T.koShown=1;T.faint=0.9;say(`${SPECIES[m.s].n} ist besiegt!`)}
      if(c.res&&!C.fin)coFinish(!!c.res.w,c.res.last)}}
  for(const[peer,list]of C.fq.splice(0))list.forEach(e=>coSpawn(peer,C.F[peer],e));
  B.allies=Object.values(C.F).filter(F=>!F.out&&act(F).hp>0)}

// ---- Host: Gegner wechselt zwischen den Spielern als Ziel ----
function coTarget(){const C=B.co,now=performance.now();const alive=[B.me,...Object.values(C.F)].filter(F=>F&&!F.out&&F.faint<=0&&act(F).hp>0);if(!alive.length)return B.me;
  if(!C.tgt||!alive.includes(C.tgt)||now>C.tgtT){const F=B.foe;alive.sort((a,b)=>Math.hypot(a.x-F.x,a.y-F.y)-Math.hypot(b.x-F.x,b.y-F.y));C.tgt=Math.random()<0.55?alive[0]:alive[Math.floor(Math.random()*alive.length)];C.tgtT=now+2500+Math.random()*2500}return C.tgt}
function coSwap(fn){return function(F){if(!B||B.mode!=='coop'||!COOP||!COOP.host||B.state!=='fight')return fn.apply(this,arguments);const T=coTarget();if(T===B.me)return fn.apply(this,arguments);const keep=B.me;B.me=T;try{return fn.apply(this,arguments)}finally{B.me=keep}}}
aiUpdate=coSwap(aiUpdate);aiAimTick=coSwap(aiAimTick);

// ---- Engine-Anpassungen für den Koop-Modus ----
{const _h=hitLocal;hitLocal=function(T,s){if(B&&B.mode==='coop'){if(T&&T.ctrl==='remote')return 0;if(T===B.foe&&COOP&&COOP.host)B.co.last=(s&&s.own)||coMe()}return _h.apply(this,arguments)}}
{const _d=dealDamage;dealDamage=function(T){if(B&&B.mode==='coop'&&T&&T.ctrl==='remote')return;return _d.apply(this,arguments)}}
{const _dh=drainHeal;drainHeal=function(s){if(B&&B.mode==='coop'&&s&&s.rm)return;return _dh.apply(this,arguments)}}
{const _sb=startBreak;startBreak=function(F){if(B&&B.mode==='coop'){if(F===B.me){const n=nextAlive(F);if(n>=0){doSwitch(F,n);F.faint=0;F.inv=1.2;say(`Los, ${SPECIES[act(F).s].n}!`)}}return}return _sb.apply(this,arguments)}}
{const _ce=checkEnd;checkEnd=function(){if(B&&B.mode==='coop'){coCheck();return}return _ce.apply(this,arguments)}}
{const _bu=bUpdate;bUpdate=function(dt){_bu.apply(this,arguments);if(B&&B.mode==='coop'&&COOP&&!B.closing){coSync(dt);coPub(false)}}}
{const _uc=updateCam;updateCam=function(now){if(B&&B.mode==='coop'){const z=Math.min(AW/(2*ARX+70),(AH-58)/(2*ARY+75));return B.cam={x:ACX,y:ACY-20,z,t:now,init:1}}return _uc.apply(this,arguments)}}
{const _dz=drawHazards;drawHazards=function(c,now){if(B&&B.mode==='coop'){const bg=coCaveBG();c.drawImage(bg.cv,bg.x,bg.y,bg.w,bg.h)}return _dz.apply(this,arguments)}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){const r=_de.apply(this,arguments);if(top&&B&&B.mode==='coop')coDrawTags(c,now);return r}}
{const _ff=forfeit;forfeit=function(){if(B&&B.mode==='coop'){openModal(`<h3>EINSATZ VERLASSEN?</h3><p>Du ziehst dich aus der Höhle zurück. Die anderen machen ohne dich weiter.</p><div class="acts"><button class="btn ghost" id="mno">BLEIBEN</button><button class="btn red" id="myes">VERLASSEN</button></div>`);$('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();syncBack();coopEnd('Du hast den Einsatz verlassen.')};return}return _ff.apply(this,arguments)}}
{const _vs=vsStart;vsStart=function(now){if(B&&B.mode==='coop')return 0;return _vs.apply(this,arguments)}}
function coCheck(){if(B.state!=='fight'||B.co.fin)return;
  if(COOP.host){const T=B.foe;if(T.out||act(T).hp<=0){if(!B.co.koT)B.co.koT=performance.now()+700;if(performance.now()>B.co.koT)coFinish(true,B.co.last||coMe());return}
    const all=[B.me,...Object.values(B.co.F)];const missing=COOP.plan.mem.length-1-Object.keys(B.co.F).length;
    if(all.every(F=>F.out)&&(missing<=0||performance.now()-B.co.t0>COOP_TIMEOUT))coFinish(false,null);return}
  const h=B.co.seenT[COOP.hostPeer];if(h&&performance.now()-h>COOP_TIMEOUT){B.co.fin=true;B.state='over';finale(false);say('Verbindung zum Streifenführer verloren.');setTimeout(()=>coopEnd('Verbindung zum Streifenführer verloren.'),2200)}}

// ---- Ende eines Raums: Belohnung, Fangen (nur letzter Treffer), weiter oder Einsatzende ----
async function coFinish(win,last){const C=B.co;if(C.fin)return;C.fin=true;B.state='over';if(COOP.host){C.res={w:win?1:0,last:last||null};coPub(true)}
  finale(win);const room=C.room,myB=B;say(win?(room[0]==='boss'?'BANDE ZERSCHLAGEN!':'Raum gesichert!'):'Die Streife wurde überwältigt…');syncBack();
  if(win){const idx=B.me.a,m=RUN.team[idx],foe=act(B.foe);if(m&&m.hp>0){const msgs=gainXp(m,Math.round(xpGain(room[1],room[2])*(room[0]==='boss'?2.5:1.3)));Object.assign(B.me.team[idx],battler(m));for(const t of msgs){say(t);await finSleep(900);if(B!==myB)return}}
    if(room[0]==='trainer')earn(Math.round(room[2]*14),'Bandenprämie');
    if(room[0]==='boss'){earn(Math.round(room[2]*40),'Einsatzprämie');RUN.items=RUN.items||{};RUN.items.candy=(RUN.items.candy||0)+1;RUN.items.great=(RUN.items.great||0)+2;RUN.coopWins=(RUN.coopWins||0)+1;say('Belohnung: 1× Sonderbonbon und 2× '+ITEMS.great.n)}
    if(room[0]==='wild'){if(last===coMe()){say('Dein Treffer war der letzte – du darfst festnehmen!');await finSleep(900);if(B!==myB)return;
        const ok=await new Promise(r=>catchQuiz(room[1],r));if(B!==myB)return;
        if(ok){const w=newMon(room[1],room[2]);w.hp=Math.max(1,Math.round(stats(w).mhp*0.3));const newDex=!G.dex[w.s];G.dex[w.s]=1;if(typeof onCatch==='function')try{onCatch(w)}catch(e){}const toTeam=RUN.team.length<teamMax();(toTeam?RUN.team:RUN.box).push(w);
          say(`Geschafft! ${SPECIES[w.s].n} wurde festgenommen!`);sysChat(`Du hast ${SPECIES[w.s].n} (Lv ${w.l}) im Koop-Einsatz festgenommen!${toTeam?'':' (Box)'}`);if(newDex)setTimeout(()=>{if(!B&&!$('#modal').classList.contains('on'))dexReveal(w.s,w,'★ NEUER DEX-EINTRAG ★')},4200)}
        else say(`${SPECIES[room[1]].n} reißt sich los und flieht!`)}
      else if(last)say(`${coName(last)} hatte den letzten Treffer und darf festnehmen.`)}}
  save();await finSleep(2200);if(B!==myB)return;closeBattle();
  if(!COOP)return;if(!win){coopEnd('Einsatz gescheitert – die Streife musste sich zurückziehen.');return}
  if(C.i>=COOP.plan.rooms.length-1){coopEnd(`Einsatz erfolgreich! Die Bande in der Höhle bei ${COOP.plan.tn} ist zerschlagen.`);return}
  COOP.idx=C.i+1;COOP.go=null;setTimeout(()=>{if(COOP&&!B)coCave()},400)}

// ---- Darstellung: Höhlenboden + Namensschilder der Mitspieler ----
let CO_BG=null;
function coCaveBG(){if(CO_BG&&CO_BG.k===ARENA_K)return CO_BG;const pad=90,x0=ACX-ARX-pad,y0=ACY-ARY-pad-40,w=2*ARX+2*pad,h=2*ARY+2*pad+60,W=Math.ceil(w/2),H=Math.ceil(h/2);
  const cv=mk(W,H),c=cv.getContext('2d'),id=c.createImageData(W,H),d=id.data,nL=noise2(9127,18,W,H),nS=noise2(9128,5,W,H),rr=mulberry32(77);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wx=x0+x*2,wy=y0+y*2,ex=(wx-ACX)/(ARX+6),ey=(wy-ACY)/(ARY+8),e=Math.hypot(ex,ey),i=(y*W+x)*4,n=nL(x,y),s=nS(x,y)*0.6+rr()*0.4;
    let r,g,b;if(e<1){const v=0.78+n*0.18+(s>0.82?0.08:0)-(e>0.9?0.12:0);r=92*v;g=82*v;b=74*v;if(s<0.07){r*=0.75;g*=0.75;b*=0.75}}
    else{const v=0.5+n*0.3+(s>0.8?0.12:0)-Math.min(0.22,(e-1)*0.35);r=62*v;g=57*v;b=70*v;if(s>0.965&&e<1.4){r=90;g=150;b=200}}
    d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255}
  c.putImageData(id,0,0);
  // torches on the cave wall
  for(const fx of[-0.62,0.62]){const tx=Math.round((ACX+fx*ARX-x0)/2),ty=Math.round((ACY-ARY-18-y0)/2);c.fillStyle='#ffcb3d22';c.beginPath();c.arc(tx,ty,14,0,7);c.fill();c.fillStyle='#5a3a1a';c.fillRect(tx-1,ty,2,6);c.fillStyle='#ff8a3d';c.fillRect(tx-2,ty-3,4,3);c.fillStyle='#ffe14d';c.fillRect(tx-1,ty-4,2,2)}
  return CO_BG={k:ARENA_K,cv,x:x0,y:y0,w:W*2,h:H*2}}
function coDrawTags(c,now){for(const F of B.allies||[]){const m=act(F);if(!m)continue;const X=Math.round(F.x),Y=Math.round(F.y);
  const k=m.hp/Math.max(1,m.mhp);c.fillStyle='#14141f';c.fillRect(X-13,Y-46,26,4);c.fillStyle=k<0.25?'#ef4444':k<0.5?'#ffcb3d':'#3ddc6b';c.fillRect(X-12,Y-45,Math.round(24*k),2);
  vtText(c,coName(F.peer),X,Y-49,'#bfe2ff',10,'center')}
  if(COOP&&COOP.host&&B.co.tgt&&B.co.tgt!==B.me&&B.state==='fight'){const T=B.co.tgt;c.fillStyle='#ef444490';c.fillRect(Math.round(T.x)-2,Math.round(T.y)+4,4,2)}}
