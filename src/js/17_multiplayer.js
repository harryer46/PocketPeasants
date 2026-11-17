/* ===================== MULTIPLAYER ===================== */
let ROOM=null,MYPEER=null;
const OTH=new Map();let myBubble=null,chatN=0;
function pres(p){if(!ROOM)return;try{ROOM.presence(p).catch(()=>{})}catch(e){}}
function leadInfo(){return RUN&&RUN.team[0]?[RUN.team[0].s,RUN.team[0].l]:null}
// followers: up to 3 team monsters walk behind the player along the last tiles they stepped on (only the species list is shared, positions are derived locally)
function folCount(){const f=RUN&&RUN.cfg&&RUN.cfg.fol!=null?+RUN.cfg.fol:3;return clamp(isNaN(f)?3:f,0,4)}
function folInfo(){if(!RUN)return null;const n=Math.min(4,RUN.team.length);return n?RUN.team.slice(0,n).map(m=>m.s):[]}
function trailPush(o,x,y){o.trail=o.trail||[];o.trail.unshift({x,y});if(o.trail.length>5)o.trail.length=5;o.fols=o.fols||[];for(let k=0;k<4;k++){const t=o.trail[k];if(!t)break;const f=o.fols[k]||(o.fols[k]={x:t.x,y:t.y,fx:t.x,fy:t.y,tx:t.x,ty:t.y});f.tx=t.x;f.ty=t.y}}
function trailReset(o,x,y){o.trail=[];o.fols=[];for(let k=0;k<4;k++)o.fols[k]={x,y,fx:x,fy:y,tx:x,ty:y}}
function folEnts(o,list,ents,px,py){if(!list||!list.length||!o.fols)return;for(let k=0;k<list.length&&k<4;k++){const f=o.fols[k];if(!f||f.fx==null||!SPECIES[list[k]])continue;
  const prev=k===0?{fx:px,fy:py}:o.fols[k-1];if(Math.abs(f.fx-prev.fx)+Math.abs(f.fy-prev.fy)<0.3)continue;if(tget(Math.round(f.fx),Math.round(f.fy))===3)continue;ents.push({fx:f.fx,fy:f.fy,mon:list[k]})}}
function mtInfo(){if(RUN&&RUN.free)return{id:RUN.id,end:0,r:0,st:'free',prev:null};return RUN?{id:RUN.id,end:RUN.end,r:RUN.phase==='arena'?RUN.r:0,st:RUN.phase==='arena'?RUN.st:RUN.phase==='lobby'?'lobby':'train',prev:RUN.prev||null,res:RUN.res||[],cfg:RUN.cfg,rs:RUN.rs||0,rd:+RUN.rdy||0,R:RUN.R||0,jt:RUN.jt||0}:null}
function pushFull(){if(!G)return;pres({v:VERSION,lf:folInfo(),n:G.name,c:G.color,sx:G.sex==='f'?'f':'m',x:P.moving?P.tx:P.x,y:P.moving?P.ty:P.y,d:P.d,tr:G.tro,sb:sbInfo(),ld:leadInfo(),bt:B?(B.mode==='wild'?'wild':'duel'):null,mt:mtInfo()})}
// player overview stats: beaten trainers and the highest monster level (team + box) of the current game
function sbInfo(){if(!RUN)return{tb:0,hl:0};const tb=Object.keys(RUN.beat||{}).filter(k=>RUN.beat[k]).length,hl=Math.max(0,...(RUN.team||[]).concat(RUN.box||[]).map(m=>+m.l||0));return{tb,hl}}
function pushSb(){const s=sbInfo(),k=s.tb+'/'+s.hl;if(pushSb.k===k)return;pushSb.k=k;pres({sb:s})}
function pushMt(){pres({mt:mtInfo(),ld:leadInfo(),lf:folInfo()})}
function setConn(on,label){$('#hon').innerHTML=`<span class="dot ${on?'on':''}"></span>${label||(on?'Online':'Offline')}`}
async function initRoom(){
  setConn(false,'Verbinde…');
  try{
    if(!window.claude||typeof window.claude.use!=='function'){setConn(false,'Solo');return}
    const r=await window.claude.use('room');if(!r){setConn(false,'Solo');return}
    ROOM=r;r.onPeers(onRoomPeers,()=>{setConn(false,'Solo')});r.onConnection(c=>setConn(c,c?'Online':'Verbinde…'));pushFull();
  }catch(e){setConn(false,'Solo')}
}
function others(){if(!ROOM)return[];return ROOM.peers().filter(p=>!p.sameTab&&p.kind==='viewer'&&p.presence&&typeof p.presence.x==='number')}
function findPeer(id){return ROOM?ROOM.peers().find(p=>p.peer===id):null}
function onRoomPeers(ch){
  for(const p of ch.peers)if(p.sameTab)MYPEER=p.peer;
  for(const p of ch.left){const o=OTH.get(p.peer);plog('[peer] weg',p.peer,o?o.n:'');if(o){const n=o.n;GONE.set(p.peer,{n,t:Date.now(),tm:setTimeout(()=>{GONE.delete(p.peer);sysChat(`${n} ist gegangen.`)},12000)})}OTH.delete(p.peer)}
  for(const p of ch.peers){if(p.sameTab||p.kind!=='viewer')continue;syncOther(p)}
  renderPlayers();
}
const GONE=new Map();
function syncOther(p){
  const pr=p.presence||{};if(typeof pr.x!=='number'||typeof pr.y!=='number')return;
  let o=OTH.get(p.peer);const tx=clamp(Math.round(pr.x),0,MW-1),ty=clamp(Math.round(pr.y),0,MHT-1);const name=cleanName(pr.n);
  if(!o){o={fx:tx,fy:ty,tx,ty,ph:0,moving:false,chatI:pr.chat&&pr.chat.i,n:name,fol:{x:tx,y:ty,tx,ty},seenMt:null};OTH.set(p.peer,o);const g=GONE.get(p.peer);if(g){clearTimeout(g.tm);GONE.delete(p.peer);plog('[peer] kurz getrennt, wieder da',p.peer,name,Math.round((Date.now()-g.t)/1000)+'s')}else{plog('[peer] neu',p.peer,name,'v'+(pr.v||'?'));sysChat(`${name} ist der Welt beigetreten.`)}}
  if(tx!==o.tx||ty!==o.ty){o.fol.tx=o.tx;o.fol.ty=o.ty;if(Math.abs(tx-o.tx)+Math.abs(ty-o.ty)>3)trailReset(o,tx,ty);else trailPush(o,o.tx,o.ty)}
  o.lf=Array.isArray(pr.lf)?pr.lf.filter(x=>typeof x==='string'&&SPECIES[x]).slice(0,4):null;
  o.tx=tx;o.ty=ty;o.d=DIRS[pr.d]?pr.d:'down';o.n=name;o.c=validColor(pr.c);o.sx=pr.sx==='f'?'f':'m';o.bt=pr.bt==='duel'||pr.bt==='wild'?pr.bt:null;
  o.fl=pr.fl===1;o.bk=pr.bk===1;o.rd=typeof pr.rd==='string'&&SPECIES[pr.rd]?pr.rd:null;o.ld=Array.isArray(pr.ld)&&SPECIES[pr.ld[0]]?pr.ld[0]:null;
  if(pr.chat&&typeof pr.chat.t==='string'&&pr.chat.i!==o.chatI){o.chatI=pr.chat.i;const t=pr.chat.t.slice(0,120);o.bub={t,until:performance.now()+6000};addChat(o.n,o.c,t,true)}
  const mt=pr.mt;if(mt&&typeof mt.id==='string'&&mt.id!==o.seenMt){o.seenMt=mt.id;if(mt.st==='train'&&+mt.end>Date.now()&&(!RUN||RUN.id!==mt.id)){sysChat(`${name} ist in einer Lobby. Tritt ihr über den Reiter LOBBY bei!`);renderLobby()}}
}
function updateOthers(dt){
  for(const o of OTH.values()){const dx=o.tx-o.fx,dy=o.ty-o.fy,dist=Math.hypot(dx,dy);
    if(dist>4){o.fx=o.tx;o.fy=o.ty;o.moving=false;o.fol.fx=o.tx;o.fol.fy=o.ty;o.fol.tx=o.tx;o.fol.ty=o.ty;trailReset(o,o.tx,o.ty)}
    else if(dist>0.01){const sp=dt/STEP*1.15*(dist>1.5?1.6:1)*(o.fl||o.bk?2:1);if(dist<=sp){o.fx=o.tx;o.fy=o.ty}else{o.fx+=dx/dist*sp;o.fy+=dy/dist*sp}o.moving=true;o.ph+=dt}
    else o.moving=false;
    approach(o.fol,dt);if(o.fols)for(const f of o.fols)approach(f,dt)}
}

