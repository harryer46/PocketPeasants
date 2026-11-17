/* ===================== ERROR REPORTING ===================== */
function showErr(m){plog('[fehler]',String(m));try{const b=document.getElementById('errbox');if(!b)return;b.textContent='⚠ Fehler: '+String(m).slice(0,220)+' — bitte an den Entwickler schicken.';b.style.display='block';clearTimeout(showErr.t);showErr.t=setTimeout(()=>b.style.display='none',12000)}catch(e){}}
addEventListener('error',e=>showErr((e.message||'error')+(e.lineno?' @'+e.lineno:'')));
addEventListener('unhandledrejection',e=>showErr(e.reason&&e.reason.message||e.reason||'Promise-Fehler'));
document.addEventListener('visibilitychange',()=>{if(document.hidden||!B)return;const n=performance.now();B.lqT=n;B.tbT=n;if(B.t0)B.t0=Math.max(B.t0,n-20000)});
// new version on the server → big "!" banner (reload needed)
let UPD_SEEN=null,UPD_CL=null;
// changelog of the waiting version: read from the new page, entries newer than the running version
function updCl(t){try{const m=t.match(/const CHANGELOG=(\[[\s\S]*?\]\]);/);if(!m)return;const L=JSON.parse(m[1]);if(Array.isArray(L))UPD_CL=L.filter(e=>Array.isArray(e)&&cmpV(String(e[0]),VERSION)>0)}catch(e){}}
async function showNewCl(){if(!UPD_CL&&/^https?:/.test(location.protocol)){try{const r=await fetch(location.origin+location.pathname+'?u='+Date.now(),{cache:'no-store'});if(r.ok)updCl(await r.text())}catch(e){}}
  const L=UPD_CL||[];openModal(`<h3>📋 WAS IST NEU?</h3><div style="text-align:left;max-height:56vh;overflow:auto">${L.length?L.map(e=>`<p><b>v${esc(String(e[0]))}</b> <span class="small">${esc(String(e[1]||''))}</span><br>${esc(String(e[2]||''))}</p>`).join(''):'<p class="small">Die Änderungen konnten nicht geladen werden.</p>'}</div>
    <div class="acts"><button class="btn ghost" id="mno">SPÄTER</button><button class="btn" id="myes">JETZT NEU LADEN</button></div>`);
  $('#mno').onclick=closeModal;$('#myes').onclick=()=>{try{sessionStorage.setItem('pp_upd','1')}catch(e){}location.reload()}}
async function checkUpdate(){if(!/^https?:/.test(location.protocol))return;try{const r=await fetch(location.origin+location.pathname+'?u='+Date.now(),{cache:'no-store'});if(!r.ok)return;const t=await r.text();updCl(t);const m=t.match(/const VERSION='([0-9.]+)'/);if(m&&cmpV(m[1],VERSION)>0)showUpdate(m[1])}catch(e){}}
function showUpdate(v){if(UPD_SEEN===v)return;UPD_SEEN=v;let el=$('#updban');if(!el){el=document.createElement('div');el.id='updban';document.body.appendChild(el)}
  el.innerHTML=`<span class="ui">!</span><div><b>Neue Version v${esc(v)} verfügbar</b><br><span class="small">Du spielst v${esc(VERSION)}. Bitte neu laden — dein Spielstand und ein laufendes Lobby-Spiel bleiben erhalten.</span></div><button class="btn ghost" id="updcl">📋 WAS IST NEU?</button><button class="btn" id="updgo">NEU LADEN</button><button class="btn ghost" id="updx">✕</button>`;el.classList.add('on');
  $('#updgo').onclick=()=>{try{sessionStorage.setItem('pp_upd','1')}catch(e){}location.reload()};$('#updx').onclick=()=>el.classList.remove('on');$('#updcl').onclick=showNewCl;const b=$('#tupd');if(b){b.style.display='';b.textContent=`⬆ v${v} — NEU LADEN`}}
setTimeout(checkUpdate,20000);setInterval(checkUpdate,180000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate()});
setInterval(()=>{try{if(!ROOM)return;let nv=null;for(const p of others()){const v=p.presence.v;if(typeof v==='string'&&v.length<12&&cmpV(v,VERSION)>0&&(!nv||cmpV(v,nv)>0))nv=v}
  const b=$('#tupd');if(nv){b.style.display='';b.textContent=`⬆ v${nv} — NEU LADEN`;showUpdate(nv)}else if(!UPD_SEEN)b.style.display='none'}catch(e){}},3000);
