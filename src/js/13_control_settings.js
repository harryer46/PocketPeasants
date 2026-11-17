/* ===================== CONTROL SETTINGS ===================== */
//@inc js/data/changelog.js
const SET_KEY='discountmon-controls';
const DEF_KEYS={a1:'1',a2:'2',a3:'3',a4:'4',dash:' ',sw:'x',cap:'c',run:'r'};
const KEY_NAMES={a1:'Attacke 1',a2:'Attacke 2',a3:'Attacke 3',a4:'Attacke 4',dash:'Sprint / Ausweichen',sw:'Monster wechseln',cap:'Handschellen werfen',run:'Fliehen'};
let SET={ctrl:'auto',dp:'m',side:'right',keys:{...DEF_KEYS}};
try{const v=JSON.parse(localStorage.getItem(SET_KEY)||'null');if(v)SET={...SET,...v,keys:{...DEF_KEYS,...(v.keys||{})}};if(SET.keys.sw==='q')SET.keys.sw='x'}catch(e){}
function aimLead(){const v=SET.lead;return Number.isFinite(v)?clamp(Math.round(v),0,10):7}
function saveSet(){try{localStorage.setItem(SET_KEY,JSON.stringify(SET))}catch(e){}}
function isMob(){return SET.ctrl==='mobile'||(SET.ctrl==='auto'&&matchMedia('(pointer:coarse)').matches)}
function normKey(k){return k.length===1?k.toLowerCase():k}
function keyLabel(k){return k===' '?'LEERTASTE':k.length===1?k.toUpperCase():k.toUpperCase()}
function applyControls(){setTimeout(()=>{try{checkOrient()}catch(e){}},0);TB_KEY='';
  document.body.classList.toggle('mob',isMob());document.body.classList.toggle('left',SET.side==='left');
  document.documentElement.style.setProperty('--dp',{s:'42px',m:'52px',l:'66px'}[SET.dp]||'52px');placeDpad();
  if(B)buildBattleUI();
}
function placeDpad(){const d=$('#dpad');if(B&&isMob()){if(d.parentElement.id!=='bpad')$('#bpad').appendChild(d)}else if(d.parentElement!==$('#stage'))$('#stage').appendChild(d)}
let capturing=null;
function openSettings(){
  const segBtn=(group,val,label,cur)=>`<button class="btn ${cur===val?'sel':''}" data-g="${group}" data-v="${val}">${label}</button>`;
  const mob=isMob();
  let h=`<h3>⚙ STEUERUNG</h3><div class="lbl2">STEUERUNGSMODUS</div><div class="seg">${segBtn('ctrl','auto','AUTO',SET.ctrl)}${segBtn('ctrl','pc','PC',SET.ctrl)}${segBtn('ctrl','mobile','MOBIL',SET.ctrl)}</div>
  <div class="small" style="text-align:left;margin:-6px 0 10px">Aktuell: ${mob?'Mobil (Touch-Steuerkreuz + Knöpfe)':'PC (Tastatur)'}${SET.ctrl==='auto'?' — automatisch gewählt':''}</div>`;
  if(mob)h+=`<div class="lbl2">STEUERKREUZ-GRÖSSE</div><div class="seg">${segBtn('dp','s','KLEIN',SET.dp)}${segBtn('dp','m','MITTEL',SET.dp)}${segBtn('dp','l','GROSS',SET.dp)}</div><div class="lbl2">STEUERKREUZ-SEITE</div><div class="seg">${segBtn('side','left','LINKS',SET.side)}${segBtn('side','right','RECHTS',SET.side)}</div><div class="small" style="text-align:left;margin-bottom:10px">Tipp: Im Kampf kannst du auch den Finger aufs Kampffeld halten, um dorthin zu laufen.</div>`;
  else{h+=`<div class="lbl2">TASTENBELEGUNG</div><div class="krow"><span>Laufen</span><span class="small">WASD (Welt: auch Pfeiltasten)</span></div><div class="krow"><span>Zielen (Kampf)</span><span class="small">Pfeiltasten</span></div>`;
    for(const k of Object.keys(DEF_KEYS))h+=`<div class="krow"><span>${KEY_NAMES[k]}</span><button class="btn ghost" data-key="${k}">${capturing===k?'TASTE DRÜCKEN…':keyLabel(SET.keys[k])}</button></div>`;}
  h+=`<div class="lbl2">ZIELEN (FREIES SPIEL)</div><div class="seg">${segBtn('aim','0','8 RICHTUNGEN',SET.aim||'0')}${segBtn('aim','2','FREI 360°',SET.aim||'0')}${segBtn('aim','1','AUTO-ZIELEN',SET.aim||'0')}</div>`;
  
  if(typeof netSettingsHtml==='function')h+=netSettingsHtml();
  h+=`<div class="lbl2">SPIELSTAND</div><div class="seg"><button class="btn" id="ssave">💾 JETZT SPEICHERN</button><button class="btn ghost" id="sexp">⬇ EXPORTIEREN</button><button class="btn ghost" id="simp">⬆ IMPORTIEREN</button></div><div class="small" style="margin:2px 0 6px">Export = Sicherungsdatei zum Aufheben oder für ein anderes Gerät.</div>`;
  h+=`<div class="lbl2">FEHLERSUCHE</div><div class="seg"><button class="btn" id="slog">🧾 PROTOKOLL HERUNTERLADEN</button></div>`;
  h+=`<div class="lbl2">CHANGELOG</div><div id="clog" style="text-align:left;max-height:170px;overflow-y:auto;background:#0b0d16;border:2px solid #000;padding:6px 8px;font-size:16px;line-height:1.1">${CHANGELOG.map(([v,d,t])=>`<div style="margin-bottom:6px"><b style="color:var(--accent)">v${v}</b> <span class="small">${d.split('-').reverse().join('.')}</span><br>${esc(t)}</div>`).join('')}</div>`;
  if(isMob())h+=`<div class="lbl2">NOTFALL</div><div class="seg"><button class="btn red" id="spanic">🚨 PANIK-MODUS</button></div><div class="small" style="margin:2px 0 6px">Zeigt sofort einen Gesetzestext und pausiert das Spiel. Doppeltippen beendet ihn wieder.</div>`;
  h+=`<div class="acts" style="margin-top:12px"><button class="btn ghost" id="sreset">ZURÜCKSETZEN</button><button class="btn" id="sdone">FERTIG</button></div>`;
  openModal(h);if(typeof bindNetSettings==='function')bindNetSettings();
  document.querySelectorAll('#mbox [data-g]').forEach(b=>b.onclick=()=>{SET[b.dataset.g]=b.dataset.v;saveSet();if(b.dataset.g==='alt'&&RUN&&RUN.free){RUN.cfg=Object.assign({},RUN.cfg,{alt:+b.dataset.v});save();renderTeam();toast(+b.dataset.v?'Alternative Monster im freien Spiel!':'Klassische Monster im freien Spiel.')}applyControls();openSettings()});
  document.querySelectorAll('#mbox [data-key]').forEach(b=>b.onclick=()=>{capturing=b.dataset.key;openSettings()});
  {const pb=$('#spanic');if(pb)pb.onclick=()=>panicOn()}
  {const lb=$('#slog');if(lb)lb.onclick=downloadLog;$('#ssave').onclick=manualSave;$('#sexp').onclick=exportSave;$('#simp').onclick=importSave}
  $('#sreset').onclick=()=>{if(B){toast('Nicht während eines Kampfes.');return}openModal(`<h3>⟲ ALLES ZURÜCKSETZEN?</h3><p>Spielstand, Team, Box, Geld, Items, Story-Fortschritt (Beschlüsse, Laufbahn, Abschlussprüfung), Monster-Dex, Trophäen und Einstellungen werden gelöscht.<br><span class="small">Nur dein Name und Aussehen bleiben. Das lässt sich nicht rückgängig machen – vorher ggf. exportieren.</span></p><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn red" id="myes">ALLES ZURÜCKSETZEN</button></div>`);
    $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();SET={ctrl:'auto',dp:'m',side:'right',keys:{...DEF_KEYS}};capturing=null;saveSet();applyControls();if(G)fullReset();toast('Alles zurückgesetzt.')}};
  $('#sdone').onclick=()=>{capturing=null;closeModal()};
}
function captureKey(e){
  e.preventDefault();if(e.key==='Escape'){capturing=null;openSettings();return}
  if(KEYMAP[e.key]){toast('Diese Taste ist fürs Laufen belegt.');return}
  const k=normKey(e.key);const other=Object.keys(SET.keys).find(a=>a!==capturing&&SET.keys[a]===k);if(other)SET.keys[other]=SET.keys[capturing];
  SET.keys[capturing]=k;capturing=null;saveSet();openSettings();if(B)buildBattleUI();
}
$('#hset').onclick=openSettings;
addEventListener('resize',()=>{if(SET.ctrl==='auto')applyControls()});

