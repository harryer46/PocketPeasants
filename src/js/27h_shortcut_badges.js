/* Tastenkürzel sichtbar auf allen Knöpfen (nicht auf Touch-Geräten) + neue Kürzel für die Kopfleiste und Beutel/Info im Kampf.
   Kopfleiste: L Lobby · K Team (Kader) · I Beutel (Inventar) · U Spieler · T Chat · P Monster-Dex · M Karte · V Vollbild · O Einstellungen
   Kampf: Attacken/Sprint/Wechseln/Handschellen/Fliehen wie in den Einstellungen · B Beutel benutzen · I Attacken-Info · O Einstellungen */
const TOP_KEYS=[['[data-t="lobby"]','l'],['[data-t="team"]','k'],['#hbag','i'],['[data-t="players"]','u'],['[data-t="chat"]','t'],['#hdex','p'],['#hmap','m'],['#hfs','v'],['#hset','o']];
(function(){const st=document.createElement('style');st.textContent=`.kb{display:inline-block;font-family:'Press Start 2P',monospace;font-size:7px;line-height:1;background:#0009;color:#ffcb3d;border:1px solid #ffcb3d66;padding:2px 3px 1px;margin-left:4px;vertical-align:middle;border-radius:2px;pointer-events:none;text-transform:uppercase;letter-spacing:0}
#topbar button .kb{position:absolute;right:-2px;bottom:-3px;margin:0;font-size:6px;padding:1px 2px}#topbar button{position:relative}
body.touch .kb{display:none!important}`;document.head.appendChild(st)})();
function kbSet(el,k){if(!el||!k)return;const lab=keyLabel(k)==='LEERTASTE'?'␣':keyLabel(k);let s=el.querySelector(':scope > .kb');if(s&&s.textContent===lab)return;if(!s){s=document.createElement('span');s.className='kb';el.appendChild(s)}s.textContent=lab;
  if(el.title&&!/\(Taste /.test(el.title))el.title+=` (Taste ${keyLabel(k)})`}
function kbApply(){try{document.body.classList.toggle('touch',isMob());if(isMob())return;
  for(const[sel,k]of TOP_KEYS)document.querySelectorAll('#topbar '+sel).forEach(b=>kbSet(b,k));
  document.querySelectorAll('#side .tabs button').forEach(b=>{const m=TOP_KEYS.find(([s])=>s==='[data-t="'+b.dataset.t+'"]');if(m)kbSet(b,m[1])});
  document.querySelectorAll('[data-hmuse="fly"]').forEach(b=>kbSet(b,'f'));document.querySelectorAll('[data-gear="bike"]').forEach(b=>kbSet(b,'b'));
  const K=SET.keys;document.querySelectorAll('#bact .brow button').forEach(b=>{const t=b.textContent;
    const k=t.startsWith('SPRINT')?K.dash:t.startsWith('WECHSELN')?K.sw:b.id==='bcap'?K.cap:t.startsWith('FLIEHEN')?K.run:b.id==='bbag'?'b':t.startsWith('ℹ')?'i':t.startsWith('⚙')?'o':null;if(k)kbSet(b,k)});
  const mapZ=document.querySelectorAll('#mapov button');mapZ.forEach(b=>{const t=b.textContent.trim();if(t.startsWith('+'))kbSet(b,'+');else if(t.startsWith('−')||t.startsWith('-'))kbSet(b,'-');else if(/SCHLIESS|✕/.test(t))kbSet(b,'Esc')})}catch(e){}}
setInterval(kbApply,400);
{let busy=0;const mo=new MutationObserver(()=>{if(busy)return;busy=1;kbApply();busy=0});const hook=()=>{const el=$('#bact');if(el&&!el.dataset.kbmo){el.dataset.kbmo=1;mo.observe(el,{childList:true,subtree:true,characterData:true})}};setInterval(hook,500)}
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||typing()||PANIC||capturing||e.repeat)return;const k=e.key.toLowerCase();
  if(B){if(Object.values(SET.keys).includes(k))return;if(B.mode==='spec'||$('#modal').classList.contains('on')||$('#study').classList.contains('on')||(typeof pickMode==='function'&&pickMode()))return;
    if(k==='b'){e.preventDefault();bagTry()}else if(k==='i'){e.preventDefault();if(B.me)openMonInfo(act(B.me).s,act(B.me))}else if(k==='o'){e.preventDefault();openSettings()}return}
  if(!G||modalOpen())return;const m=TOP_KEYS.find(([,kk])=>kk===k&&k!=='m'&&k!=='t');if(!m)return;const b=document.querySelector('#topbar '+m[0]);if(b&&b.offsetParent!==null){e.preventDefault();b.click()}});
