/* ===================== PROTOKOLL (troubleshooting) ===================== */
const LOGB=[];const LOG_T0=Date.now();
function plog(...a){try{const t=new Date();const ts=t.toTimeString().slice(0,8)+'.'+String(t.getMilliseconds()).padStart(3,'0');
  LOGB.push(ts+' '+a.map(x=>typeof x==='string'?x:(()=>{try{return JSON.stringify(x)}catch(e){return String(x)}})()).join(' '));if(LOGB.length>3000)LOGB.splice(0,500)}catch(e){}}
{const ce=console.error.bind(console),cw=console.warn.bind(console);console.error=(...a)=>{plog('[console.error]',...a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' | '):x));ce(...a)};console.warn=(...a)=>{plog('[console.warn]',...a.map(x=>x&&x.message?x.message:x));cw(...a)}}
document.addEventListener('visibilitychange',()=>plog('[tab]',document.hidden?'versteckt':'sichtbar'));
addEventListener('online',()=>plog('[netz] online'));addEventListener('offline',()=>plog('[netz] offline'));
function logText(){const L=[];L.push('Pocket Peasants Protokoll — v'+VERSION,'Erstellt: '+new Date().toISOString(),'Laufzeit: '+Math.round((Date.now()-LOG_T0)/1000)+' s','Browser: '+navigator.userAgent,'Bildschirm: '+innerWidth+'×'+innerHeight+' · DPR '+(devicePixelRatio||1),'Online: '+navigator.onLine);
  try{L.push('Spieler: '+(G?G.name:'—')+' · Peer-ID: '+(typeof MYPEER!=='undefined'?MYPEER:'—'),'Raum: '+(typeof ROOM_ID!=='undefined'?ROOM_ID:'—')+' · verbunden: '+(typeof ROOM!=='undefined'&&ROOM?'ja':'nein')+(typeof TURN_ACTIVE!=='undefined'?' · TURN-Server: '+TURN_ACTIVE.length+(typeof TURN_SRC!=='undefined'&&TURN_SRC?' ('+TURN_SRC+')':''):''));
    L.push('Modus: '+(!RUN?'—':RUN.free?'Freies Spiel':'Lobby '+RUN.id+' · Phase '+RUN.phase+' · Status '+RUN.st+' · Runde '+RUN.r),'Kampf: '+(B?B.mode+'/'+B.state:'—'));
    if(typeof ROOM!=='undefined'&&ROOM)L.push('Andere Spieler: '+ROOM.peers().filter(p=>!p.isMe).map(p=>`${cleanName(p.presence.n)} [${p.peer}] v${p.presence.v||'?'} rtt ${pingOf(p.peer)??'?'}ms`).join(' · '))}catch(e){L.push('Status-Fehler: '+e.message)}
  return L.join('\n')+'\n\n--- Ereignisse ---\n'+LOGB.join('\n')+'\n'}
function downloadLog(){try{plog('[protokoll] heruntergeladen');const b=new Blob([logText()],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='pocketpeasants-protokoll-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.txt';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}catch(e){toast('Download fehlgeschlagen: '+e.message)}}
