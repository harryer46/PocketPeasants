
/* ===================== P2P ROOM (Trystero, serverless WebRTC) ===================== */
const ROOM_ID=(()=>{try{const q=new URLSearchParams(location.search).get('room');if(q&&/^[a-z0-9_-]{1,32}$/i.test(q))return q.toLowerCase()}catch(e){}return'world'})();
const NET_KEY='discountmon-net';
function loadNet(){try{return JSON.parse(localStorage.getItem(NET_KEY)||'{}')||{}}catch(e){return{}}}
function saveNet(v){try{localStorage.setItem(NET_KEY,JSON.stringify(v))}catch(e){}}
let TURN_ACTIVE=[],TURN_SRC='',JOIN_ERRORS=0;
function manualServers(cfg){const urls=String(cfg.urls||'').split(/[\s,]+/).filter(u=>/^(turns?|stun):/i.test(u));return urls.length?[{urls,username:cfg.user||'',credential:cfg.pass||''}]:[]}
async function fetchApi(url){
  const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),5000);
  try{const r=await fetch(url,{signal:ctl.signal});const j=await r.json();const arr=Array.isArray(j)?j:Array.isArray(j.iceServers)?j.iceServers:j.iceServers?[j.iceServers]:[];return arr.filter(x=>x&&x.urls)}
  finally{clearTimeout(t)}
}
async function getTurnServers(){
  const cfg=loadNet();let list=[],src=[];
  const api=(cfg.api||'').trim()||TURN_CONFIG.apiUrl;
  if(api){try{const a=await fetchApi(api);if(a.length){list=list.concat(a);src.push(cfg.api?'API aus Einstellungen':'API aus Datei')}}catch(e){console.warn('TURN API failed',e)}}
  const man=manualServers(cfg);if(man.length){list=list.concat(man);src.push('Einstellungen')}
  if(Array.isArray(TURN_CONFIG.servers)&&TURN_CONFIG.servers.length){list=list.concat(TURN_CONFIG.servers.filter(x=>x&&x.urls));src.push('Datei')}
  TURN_SRC=src.join(' + ');return list;
}
function makeP2PRoom(roomId,turn){
  const TR=window.Trystero;
  const cfg={appId:'discountmon-budget-edition-v1',password:pwGet()||undefined};if(turn&&turn.length)cfg.turnConfig=turn;
  plog('[raum] betrete',roomId,'· TURN-Server:',(turn||[]).length,'· Quelle:',TURN_SRC||'—');
  const room=TR.joinRoom(cfg,roomId,{onJoinError:d=>{JOIN_ERRORS++;plog('[raum] Verbindungsfehler',d&&(d.error||d.message||d));console.warn('join error',d);if(JOIN_ERRORS===1||JOIN_ERRORS%5===0)toast(turn&&turn.length?'Ein Spieler konnte sich nicht einmal über TURN verbinden. Prüfe die TURN-Einstellungen.':'Ein Spieler konnte sich nicht direkt verbinden. Richte einen TURN-Fallback ein: ⚙ STEUERUNG → NETZWERK.');setConnLabel()}});
  const act=room.makeAction('pres');const png=room.makeAction('png');const me=TR.selfId;
  let mine={jt:Date.now()};const others=new Map();const RTT=new Map();let snap=Object.freeze([]);const hs=[],cs=[];let lastSend=0,pending=false,lastFull=0,sent={};const SJ={};
  // bandwidth: only changed keys are sent (one level deep for objects like the duel state); a full snapshot every 15 s heals anything missed
  const js=v=>{try{return JSON.stringify(v)}catch(e){return''}};
  function diff(){const out={},del=[],part={};let any=false;
    for(const k in mine){const v=mine[k],j=js(v);if(SJ[k]===j)continue;any=true;const o=sent[k];
      if(v&&o&&typeof v==='object'&&typeof o==='object'&&!Array.isArray(v)&&!Array.isArray(o)&&v.id===o.id){const sub={};for(const q in v){if(js(v[q])!==js(o[q]))sub[q]=v[q]}for(const q in o)if(!(q in v))sub[q]=null;part[k]=sub}
      else out[k]=v;SJ[k]=j;sent[k]=v}
    for(const k in sent)if(!(k in mine)){del.push(k);delete sent[k];delete SJ[k];any=true}
    if(!any)return null;const m={};if(Object.keys(out).length)m.s=out;if(del.length)m.d=del;if(Object.keys(part).length)m.p=part;return m}
  function fullMsg(){for(const k in mine){sent[k]=mine[k];SJ[k]=js(mine[k])}for(const k in sent)if(!(k in mine)){delete sent[k];delete SJ[k]}return{_f:1,s:mine}}
  function entry(id,p,isMe){return Object.freeze({peer:id,by:null,isMe,sameTab:isMe,kind:'viewer',guest:false,presence:p,updatedAt:Date.now()})}
  function rebuild(j,l){const arr=[entry(me,Object.freeze({...mine}),true)];for(const[id,p]of others)arr.push(entry(id,p,false));snap=Object.freeze(arr);const ch={peers:snap,joined:j||[],left:l||[],updated:[]};hs.forEach(h=>{try{h(ch)}catch(e){console.error(e)}})}
  function flush(full){pending=false;const now=performance.now();if(!others.size&&!full){lastSend=now;return}
    let m;if(full||now-lastFull>15000){m=fullMsg();lastFull=now}else m=diff();if(!m)return;lastSend=now;try{const j=JSON.stringify(m);BS+=j.length*others.size;MS++;act.send(m)}catch(e){}}
  let BS=0,BR=0,MS=0,MR=0;
  function watchPc(id){try{const pcs=room.getPeers&&room.getPeers();const pc=pcs&&pcs[id];if(!pc||pc.__w)return;pc.__w=1;
    pc.addEventListener('connectionstatechange',()=>plog('[peer]',id,'Verbindung:',pc.connectionState));
    pc.addEventListener('iceconnectionstatechange',()=>plog('[peer]',id,'ICE:',pc.iceConnectionState));
    setTimeout(async()=>{try{const st=await pc.getStats();let pair=null;const cands={};st.forEach(r=>{if(r.type==='candidate-pair'&&(r.nominated||r.selected)&&r.state==='succeeded')pair=r;if(r.type==='local-candidate'||r.type==='remote-candidate')cands[r.id]=r});
      if(pair){const l=cands[pair.localCandidateId],r=cands[pair.remoteCandidateId];plog('[peer]',id,'Weg:',(l&&l.candidateType)+' → '+(r&&r.candidateType),(l&&l.candidateType==='relay')||(r&&r.candidateType==='relay')?'(über TURN)':'(direkt)','RTT',pair.currentRoundTripTime!=null?Math.round(pair.currentRoundTripTime*1000)+'ms':'?')}}catch(e){plog('[peer] stats-fehler',e.message)}},4000)}catch(e){}}
  room.onPeerJoin=id=>{plog('[peer] verbunden',id);try{act.send({_f:1,s:mine},{target:id})}catch(e){}watchPc(id);cs.forEach(h=>h(true))};
  room.onPeerLeave=id=>{plog('[peer] getrennt',id);RTT.delete(id);if(others.delete(id))rebuild([],[{peer:id}])};
  act.onMessage=(data,info)=>{const id=info&&info.peerId;if(!id||!data||typeof data!=='object'||Array.isArray(data))return;try{const L=JSON.stringify(data).length;BR+=L;MR++;if(L>8000){plog('[peer] nachricht zu gross',id,L);return}}catch(e){return}const isNew=!others.has(id);
    let st;if(data._f&&data.s&&typeof data.s==='object')st={...data.s};
    else if(data.s||data.d||data.p){st={...(others.get(id)||{})};if(data.s&&typeof data.s==='object')Object.assign(st,data.s);if(Array.isArray(data.d))for(const k of data.d)delete st[k];
      if(data.p&&typeof data.p==='object')for(const k in data.p){const sub=data.p[k];if(!sub||typeof sub!=='object')continue;const o={...(st[k]&&typeof st[k]==='object'?st[k]:{})};for(const q in sub){if(sub[q]===null)delete o[q];else o[q]=sub[q]}st[k]=o}}
    else st={...data};
    others.set(id,Object.freeze(st));rebuild(isNew?[{peer:id}]:[],[])};
  png.onMessage=(d,info)=>{const id=info&&info.peerId;if(!id||!d)return;if(typeof d.q==='number'){try{png.send({a:d.q},{target:id})}catch(e){}}else if(typeof d.a==='number'){const r=Math.round(performance.now()-d.a);if(r>=0&&r<10000)RTT.set(id,RTT.has(id)?Math.round(RTT.get(id)*0.6+r*0.4):r)}};
  let dead=false;
  const t3=setInterval(()=>{if(dead)return;plog('[netz] 60s:',others.size,'Spieler · gesendet',MS,'Nachr./',Math.round(BS/1024),'KB · empfangen',MR,'Nachr./',Math.round(BR/1024),'KB');BS=BR=MS=MR=0},60000);
  const t1=setInterval(()=>{if(!dead)flush()},5000);
  const t2=setInterval(()=>{if(!dead&&others.size&&!document.hidden){try{png.send({q:performance.now()})}catch(e){}}},5000);
  addEventListener('pagehide',()=>{try{room.leave()}catch(e){}});
  return{
    presence(patch){for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}rebuild();const now=performance.now();if(now-lastSend>66)flush();else if(!pending){pending=true;setTimeout(flush,66-(now-lastSend))}return Promise.resolve()},
    peers(){return snap},
    onPeers(h){hs.push(h);setTimeout(()=>{rebuild()},0);return()=>{}},
    onConnection(h){cs.push(h);setTimeout(()=>h(true),0);return()=>{}},
    rtt(id){return RTT.has(id)?RTT.get(id):null},
    leave(){plog('[raum] verlassen');dead=true;clearInterval(t1);clearInterval(t2);clearInterval(t3);try{room.leave()}catch(e){}const gone=[...others.keys()].map(peer=>({peer}));others.clear();RTT.clear();rebuild([],gone)}
  };
}
function pingOf(id){return ROOM&&ROOM.rtt?ROOM.rtt(id):null}
function setConnLabel(){if(!ROOM){setConn(false,'Solo (offline)');return}setConn(true,`Online · Raum „${ROOM_ID}“${TURN_ACTIVE.length?' · TURN':''}${JOIN_ERRORS?' · ⚠':''}`)}
function testTurn(servers){
  return new Promise(res=>{
    if(!servers.length){res('✗ Kein TURN-Server eingetragen.');return}
    let pc;try{pc=new RTCPeerConnection({iceServers:servers,iceTransportPolicy:'relay'})}catch(e){res('✗ Ungültige Konfiguration: '+e.message);return}
    let done=false;const fin=m=>{if(done)return;done=true;try{pc.close()}catch(e){}res(m)};
    const t=setTimeout(()=>fin('✗ Keine Relay-Adresse erhalten — prüfe URL, Benutzername und Passwort.'),8000);
    pc.onicecandidate=e=>{if(e.candidate&&/typ relay/.test(e.candidate.candidate)){clearTimeout(t);fin('✓ TURN funktioniert — Relay-Adresse erhalten.')}};
    pc.createDataChannel('t');pc.createOffer().then(o=>pc.setLocalDescription(o)).catch(err=>{clearTimeout(t);fin('✗ '+err.message)});
  });
}
function netSettingsHtml(){
  const n=loadNet();const fileSet=!!(TURN_CONFIG.apiUrl||(TURN_CONFIG.servers&&TURN_CONFIG.servers.length));
  const inp=(id,ph,val,type)=>`<input id="${id}" type="${type||'text'}" placeholder="${ph}" value="${esc(val||'')}" autocomplete="off" style="width:100%;margin-bottom:5px;background:#0b0d16;border:2px solid #000;color:var(--text);font-family:inherit;font-size:17px;padding:3px 6px">`;
  return `<div class="lbl2" style="margin-top:14px">NETZWERK · TURN-FALLBACK</div>
  <div class="small" style="text-align:left;line-height:1.1;margin:4px 0 8px">Status: ${TURN_ACTIVE.length?`<span style="color:#3ddc6b">aktiv (${esc(TURN_SRC)})</span>`:'<span style="color:#f2c230">nicht eingerichtet</span> — nur direkte Verbindungen'}${fileSet?' · in index.html gesetzt':''}${JOIN_ERRORS?` · <span style="color:#ef4444">${JOIN_ERRORS} fehlgeschlagene Verbindung(en)</span>`:''}<br>Nur nötig, wenn Freunde sich nicht sehen. Am einfachsten in index.html eintragen, dann haben es alle (siehe README). Einstellungen hier gelten nur für diesen Browser.</div>
  ${inp('nturl','TURN-URL(s), z. B. turn:host:80, turns:host:443?transport=tcp',n.urls)}
  <div style="display:flex;gap:5px">${inp('ntuser','Benutzername',n.user)}${inp('ntpass','Passwort',n.pass,'password')}</div>
  ${inp('ntapi','…oder API-URL für Zugangsdaten (z. B. Metered)',n.api)}
  <div class="small" id="nttest" style="text-align:left;min-height:18px;margin-bottom:4px"></div>
  <div class="seg" style="margin:0"><button class="btn ghost" id="ntt">TESTEN</button><button class="btn ghost" id="ntclr">LEEREN</button><button class="btn green" id="nts">SPEICHERN &amp; NEU VERBINDEN</button></div>`;
}
function readNetForm(){return{urls:$('#nturl').value.trim(),user:$('#ntuser').value.trim(),pass:$('#ntpass').value,api:$('#ntapi').value.trim()}}
function bindNetSettings(){
  const out=$('#nttest');if(!out)return;
  $('#ntt').onclick=async()=>{out.textContent='Teste…';out.style.color='';const f=readNetForm();let servers=manualServers(f);
    if(f.api){try{servers=servers.concat(await fetchApi(f.api))}catch(e){out.textContent='✗ API-URL fehlgeschlagen: '+e.message;out.style.color='#ef4444';return}}
    if(!servers.length&&!f.urls&&!f.api)servers=TURN_ACTIVE;
    const r=await testTurn(servers);out.textContent=r;out.style.color=r[0]==='✓'?'#3ddc6b':'#ef4444'};
  $('#ntclr').onclick=()=>{['nturl','ntuser','ntpass','ntapi'].forEach(i=>$('#'+i).value='');saveNet({});out.textContent='Geleert — drücke SPEICHERN & NEU VERBINDEN.'};
  $('#nts').onclick=()=>{saveNet(readNetForm());save();location.reload()};
}

// ---- AFK: idle or hidden tabs leave the room (saves TURN data); any key, click or touch reconnects ----
let LAST_ACT=Date.now(),HID_SINCE=0,AFK=false;
function markActive(){LAST_ACT=Date.now();if(AFK)afkBack()}
['keydown','pointerdown','touchstart','wheel'].forEach(ev=>addEventListener(ev,markActive,{passive:true,capture:true}));
let _pm=0;addEventListener('pointermove',()=>{const n=Date.now();if(n-_pm>2000){_pm=n;markActive()}},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)HID_SINCE=Date.now();else{HID_SINCE=0;markActive()}});
function afkLimits(){const tour=typeof RUN!=='undefined'&&RUN&&!RUN.free&&(RUN.phase==='train'||RUN.phase==='arena'||RUN.phase==='lobby');return tour?{idle:30*60e3,hid:30*60e3}:{idle:10*60e3,hid:4*60e3}}
setInterval(()=>{if(AFK||!ROOM)return;if(typeof B!=='undefined'&&B&&B.mode==='duel'&&B.state!=='over')return;const L=afkLimits(),n=Date.now();
  if(n-LAST_ACT>L.idle||(HID_SINCE&&n-HID_SINCE>L.hid))afkGo()},15000);
function afkGo(){if(AFK||!ROOM)return;plog('[afk] getrennt · inaktiv',Math.round((Date.now()-LAST_ACT)/1000)+'s','· versteckt',HID_SINCE?Math.round((Date.now()-HID_SINCE)/1000)+'s':'nein');AFK=true;try{ROOM.leave()}catch(e){}ROOM=null;setConn(false,'💤 AFK — getrennt');
  let el=document.getElementById('afkban');if(!el){el=document.createElement('div');el.id='afkban';el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9000;background:#14141f;border:3px solid #000;box-shadow:4px 4px 0 #000;color:#fff;padding:16px 20px;text-align:center;font-family:VT323,monospace;font-size:20px;max-width:90vw';document.body.appendChild(el)}
  el.innerHTML='💤 <b>Du warst eine Weile inaktiv</b><br>Die Verbindung zu den anderen Spielern wurde getrennt, um Datenvolumen zu sparen.<br><span style="color:#ffcb3d">Drück eine Taste oder tippe, um wieder zu verbinden.</span>';el.style.display='block'}
function afkBack(){if(!AFK)return;plog('[afk] zurück, verbinde neu');AFK=false;const el=document.getElementById('afkban');if(el)el.style.display='none';LAST_ACT=Date.now();
  try{ROOM=makeP2PRoom(ROOM_ID,TURN_ACTIVE);ROOM.onPeers(onRoomPeers);setConnLabel();pushFull();toast('Wieder verbunden.')}catch(e){console.error(e);ROOM=null;setConn(false,'Solo (offline)')}}

// ---- room cap: at most MAX_ROOM players; the latest arrivals step back and retry later ----
let FULL=false;
setInterval(()=>{if(!ROOM||AFK||FULL)return;const ps=ROOM.peers();if(ps.length<=MAX_ROOM)return;
  const order=ps.slice().sort((a,b)=>((+a.presence.jt||9e15)-(+b.presence.jt||9e15))||(a.peer<b.peer?-1:1));const i=order.findIndex(p=>p.isMe);
  if(i>=MAX_ROOM&&!(typeof B!=='undefined'&&B&&B.mode==='duel'))roomFull()},2000);
function roomFull(){plog('[raum] voll — zurückgetreten');FULL=true;try{ROOM.leave()}catch(e){}ROOM=null;setConn(false,'Server voll');
  let el=document.getElementById('afkban');if(!el){el=document.createElement('div');el.id='afkban';el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9000;background:#14141f;border:3px solid #000;box-shadow:4px 4px 0 #000;color:#fff;padding:16px 20px;text-align:center;font-family:VT323,monospace;font-size:20px;max-width:90vw';document.body.appendChild(el)}
  el.innerHTML=`🚧 <b>Server voll</b><br>Es sind schon ${MAX_ROOM} Spieler online. Du kannst solange solo weiterspielen.<br><button class="btn" id="fullretry" style="margin-top:8px">ERNEUT VERSUCHEN</button> <button class="btn ghost" id="fullx" style="margin-top:8px">SOLO WEITER</button>`;el.style.display='block';
  document.getElementById('fullretry').onclick=()=>{el.style.display='none';FULL=false;try{ROOM=makeP2PRoom(ROOM_ID,TURN_ACTIVE);ROOM.onPeers(onRoomPeers);setConnLabel();pushFull()}catch(e){ROOM=null}};
  document.getElementById('fullx').onclick=()=>{el.style.display='none'}}
