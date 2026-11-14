/* ===================== PLAYER CHALLENGES (during training) ===================== */
let myCh=null,incoming=null;const handledCh=new Set();
function canSpar(){return!!(RUN&&(RUN.phase==='train'||RUN.phase==='lobby')&&!B)}
function challenge(peer){
  if(!canSpar()||myCh)return;const p=findPeer(peer);if(!p)return;const mt=p.presence.mt;
  if(!mt||(mt.st!=='train'&&mt.st!=='free'&&mt.st!=='lobby')||p.presence.bt){toast("Dieser Spieler kann gerade nicht kämpfen.");return}
  if(p.presence.v!==VERSION){toast(`${cleanName(p.presence.n)} spielt eine andere Version (v${String(p.presence.v||'alt').slice(0,12)}). Ihr braucht beide dieselbe — neu laden.`);return}
  const id='s'+Math.random().toString(36).slice(2,10);myCh={to:peer,id,t:Date.now()};pres({ch:{to:peer,id}});toast(`Kampfanfrage an ${cleanName(p.presence.n)} gesendet…`);lastPlr='';renderPlayers();
}
/* lobby invites: shown as a dialog on the other player's screen */
const INVITED=new Set(),handledInv=new Set();
function canInvite(){return!!(RUN&&!RUN.free&&(RUN.phase==='lobby'||(RUN.phase==='train'&&RUN.end>Date.now()+20000)))}
function invite(peer){if(!canInvite())return;const p=findPeer(peer);if(!p)return;INVITED.add(peer+RUN.id);pres({inv:{to:peer,id:RUN.id,k:Math.random().toString(36).slice(2,8)}});toast(`Einladung an ${cleanName(p.presence.n)} gesendet.`);lastPlr='';renderPlayers()}
function checkInvites(){
  if(modalOpen()||B||!MYPEER)return;
  for(const p of others()){const iv=p.presence.inv;if(!iv||typeof iv!=='object'||iv.to!==MYPEER||typeof iv.id!=='string'||iv.id.length>40)continue;
    const key=p.peer+':'+iv.id+':'+iv.k;if(handledInv.has(key))continue;handledInv.add(key);
    if(RUN&&RUN.id===iv.id)continue;const m=runningMatches().find(x=>x.id===iv.id);if(!m)continue;
    const nm=cleanName(p.presence.n);
    openModal(`<h3>✉ LOBBY-EINLADUNG</h3><p><b>${esc(nm)}</b> lädt dich ein in <b>${esc(m.cfg.name||"Lobby von "+nm)}</b> (${m.names.length} Spieler · ${esc(lobbyLine(m))}).<br><span class="small">${esc(cfgSummary(m.cfg))}</span>${RUN&&!RUN.free?'<br>Du verlässt dabei deine aktuelle Lobby.':''}</p><div class="acts"><button class="btn ghost" id="mno">NEIN DANKE</button><button class="btn green" id="myes">BEITRETEN</button></div>`);
    $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();joinLobby(iv.id)};return}
}
function cancelCh(msg){myCh=null;pres({ch:null});if(msg)toast(msg);lastPlr='';renderPlayers()}
function checkChallenges(){
  if(!ROOM||!MYPEER||!G)return;
  try{checkInvites()}catch(e){console.error(e)}
  for(const p of others()){const ch=p.presence.ch;
    if(ch&&typeof ch==='object'&&ch.to===MYPEER&&typeof ch.id==='string'&&ch.id.length<40&&!handledCh.has(ch.id)){handledCh.add(ch.id);
      // both challenged each other at the same moment → just fight (the lower id accepts the other's request)
      if(myCh&&myCh.to===p.peer&&canSpar()){if((MYPEER||'')<p.peer){myCh=null;pres({ch:null});startDuel(p.peer,ch.id,true)}continue}
      if(!canSpar()||modalOpen()||myCh||p.presence.v!==VERSION)pres({dec:ch.id});else showChallenge(p.peer,ch.id,cleanName(p.presence.n))}}
  if(incoming){const p=findPeer(incoming.peer);if(!p||!p.presence.ch||p.presence.ch.id!==incoming.id||!canSpar()){closeModal();incoming=null}}
  if(myCh){const tp=findPeer(myCh.to);
    if(!tp)cancelCh('Der Spieler ist gegangen.');else if(!canSpar())cancelCh();
    else if(tp.presence.dec===myCh.id)cancelCh(`${cleanName(tp.presence.n)} declined.`);
    else if(tp.presence.du&&tp.presence.du.id===myCh.id&&tp.presence.du.opp===MYPEER){const id=myCh.id;myCh=null;pres({ch:null});startDuel(tp.peer,id,true)}
    else if(Date.now()-myCh.t>30000)cancelCh('Keine Antwort.')}
}
function showChallenge(peer,id,name){
  incoming={peer,id};
  openModal(`<h3>⚔ KAMPFANFRAGE</h3><p><b>${esc(name)}</b> möchte einen freundschaftlichen Echtzeit-Kampf. Beide Teams werden dafür voll geheilt, das Monster des Siegers bekommt EP.</p><div class="acts"><button class="btn ghost" id="mno">ABLEHNEN</button><button class="btn" id="myes">KÄMPFEN!</button></div>`);
  $('#mno').onclick=()=>{pres({dec:id});incoming=null;closeModal()};
  $('#myes').onclick=()=>{incoming=null;closeModal();if(canSpar())startDuel(peer,id,true)};
}

