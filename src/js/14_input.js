/* ===================== INPUT ===================== */
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
const held=[],aimHeld=[];
function typing(){const a=document.activeElement;return a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT')}
addEventListener('keydown',e=>{
  // emergency mode first: Enter always toggles it and never also skips/confirms whatever is open underneath
  if(PANIC){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Enter'&&!e.repeat)panicOff();return}
  if(e.key==='Enter'&&!typing()&&!capturing&&G){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)panicOn();return}
  if(B&&(B.vs||B.wi)&&!e.repeat&&vsSkip()){e.preventDefault();return}
  if(TALK){if(!e.repeat){e.preventDefault();talkTap()}return}
  if(capturing){captureKey(e);return}
  if(typing()){if(e.key==='Escape')document.activeElement.blur();return}
  if(B&&B.mode==='spec'){if(e.key==='Escape'){e.preventDefault();specStop(true)}else if(e.key==='t'||e.key==='T'){e.preventDefault();switchTab('chat');setSide(true);$('#chatin').focus()}return}
  // slot-machine reel open: A/D (and ←/→) spin it instead of moving
  if(B&&!B.tb&&!CQ&&pickMode()&&!(pickMode()==='lead'&&B.leadPicked)&&!$('#modal').classList.contains('on')){const kk=e.key.toLowerCase();if(kk==='a'||e.key==='ArrowLeft'){e.preventDefault();reelSpin(-1);return}if(kk==='d'||e.key==='ArrowRight'){e.preventDefault();reelSpin(1);return}}
  const d=KEYMAP[e.key];if(d){e.preventDefault();if(e.key.startsWith('Arrow')&&B&&!B.tb){if(!aimHeld.includes(d))aimHeld.push(d);return}if(!held.includes(d))held.push(d);return}
  if(B&&CQ){const n=+e.key;if(n>=1&&n<=4&&!CQ.done){e.preventDefault();cqAnswer(CQ.order[n-1])}return}
  if(!B&&CQ&&$('#cquiz').classList.contains('on')){const n=+e.key;if(n>=1&&n<=4&&!CQ.done&&CQ_PICK){e.preventDefault();CQ_PICK(CQ.order[n-1])}else if((e.key===' '||e.key==='Enter')&&CQ.done&&$('#cqnext')){e.preventDefault();$('#cqnext').click()}return}
  if(B){if($('#modal').classList.contains('on')||$('#study').classList.contains('on'))return;const k=normKey(e.key),K=SET.keys;
    if(pickMode()&&!(pickMode()==='lead'&&B.leadPicked)){const kk=e.key.toLowerCase();if(kk==='a'||e.key==='ArrowLeft'){e.preventDefault();reelSpin(-1);return}if(kk==='d'||e.key==='ArrowRight'){e.preventDefault();reelSpin(1);return}if(k===K.sw){e.preventDefault();reelConfirm();return}if(e.key==='Escape'&&B.qsel){B.qsel=false;return}if(B.qsel)return}
    if((B.qsel&&B.state==='fight')||(B.leadWait&&B.state==='count')){const n=+e.key;if(n>=1&&n<=6){e.preventDefault();const alive=B.me.team.map((m,i)=>i).filter(i=>B.me.team[i].hp>0);const i=alive[n-1];if(i!=null){if(B.qsel)quickPick(i);else{const b=document.querySelector(`#bpick [data-pk="${i}"]`);if(b)b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}}return}if(e.key==='Escape'&&B.qsel){B.qsel=false;return}}
    for(let i=0;i<4;i++)if(k===K['a'+(i+1)]){e.preventDefault();battleMove(i);return}
    if(k===K.dash){e.preventDefault();battleDash()}else if(k===K.sw)battleSwitch();else if(k===K.cap){if(!e.repeat)capPress()}else if(k===K.run){if(!e.repeat)tryRun()}
    return}
  if((e.key==='m'||e.key==='M')&&G){toggleMap();return}
  if((e.key==='f'||e.key==='F')&&G&&!e.repeat&&!modalOpen()){e.preventDefault();toggleFly();return}
  if((e.key==='b'||e.key==='B')&&G&&!e.repeat&&!modalOpen()){e.preventDefault();toggleBike();return}
  if(e.key==='Escape'&&mapOpen()){closeMap();return}
  if(mapOpen()&&(e.key==='+'||e.key==='='||e.key==='-'||e.key==='_')){e.preventDefault();mapZoom(e.key==='+'||e.key==='='?1:-1);return}
  if((e.key==='t'||e.key==='T')&&G){e.preventDefault();switchTab('chat');setSide(true);$('#chatin').focus()}
},true);
addEventListener('keyup',e=>{const d=KEYMAP[e.key];if(d){const i=held.indexOf(d);if(i>=0)held.splice(i,1);const j=aimHeld.indexOf(d);if(j>=0)aimHeld.splice(j,1)}if(B&&B.aim&&normKey(e.key)===SET.keys.cap)capRelease()});
addEventListener('blur',()=>{held.length=0;aimHeld.length=0});
// intro screens: a tap anywhere on the screen skips (not only on the battle picture)
addEventListener('pointerdown',e=>{if(!PANIC&&B&&(B.vs||B.wi)&&vsSkip()){e.preventDefault();e.stopPropagation()}},true);
['#stage','#battle'].forEach(sel=>{const el=$(sel);if(el)el.addEventListener('pointerdown',e=>{if(typing()&&!e.target.closest('input,select,textarea'))document.activeElement.blur()})});
document.querySelectorAll('#dpad button').forEach(b=>{const d=b.dataset.d;
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(!held.includes(d))held.push(d)});
  const up=()=>{const i=held.indexOf(d);if(i>=0)held.splice(i,1)};['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,up))});
const JOY={active:false,id:null,ox:0,oy:0,x:0,y:0};
function heldDir(){if(JOY.active){const m=Math.hypot(JOY.x,JOY.y);if(m>0.35)return Math.abs(JOY.x)>Math.abs(JOY.y)?(JOY.x>0?'right':'left'):(JOY.y>0?'down':'up')}return held[held.length-1]||null}
(function setupJoystick(){
  const z=$('#joyzone'),j=$('#joy'),k=$('#joyk'),R=50;
  const upd=e=>{let dx=e.clientX-JOY.ox,dy=e.clientY-JOY.oy;const L=Math.hypot(dx,dy);if(L>R){dx=dx/L*R;dy=dy/L*R}JOY.x=dx/R;JOY.y=dy/R;k.style.transform=`translate(${dx}px,${dy}px)`};
  z.addEventListener('pointerdown',e=>{e.preventDefault();if(JOY.active)return;const r=$('#stage').getBoundingClientRect();JOY.active=true;JOY.id=e.pointerId;JOY.ox=e.clientX;JOY.oy=e.clientY;JOY.x=JOY.y=0;
    j.style.left=(e.clientX-r.left)+'px';j.style.top=(e.clientY-r.top)+'px';j.style.display='block';k.style.transform='';$('#joyhint').style.display='none';try{z.setPointerCapture(e.pointerId)}catch(_){}});
  z.addEventListener('pointermove',e=>{if(JOY.active&&e.pointerId===JOY.id){e.preventDefault();upd(e)}});
  const end=e=>{if(e.pointerId!==JOY.id)return;JOY.active=false;JOY.id=null;JOY.x=JOY.y=0;j.style.display='none'};
  z.addEventListener('pointerup',end);z.addEventListener('pointercancel',end);z.addEventListener('lostpointercapture',end);
})();
// right-hand action buttons (multi-touch: each button tracks its own finger)
function tbBtn(label,cls,pos,down,up,drag){const b=document.createElement('button');b.className='tbb '+(cls||'');Object.assign(b.style,pos);b.innerHTML=`<div class="cdr"></div><span>${label}</span>`;
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}const r=b.getBoundingClientRect();b._cx=r.left+r.width/2;b._cy=r.top+r.height/2;down&&down()});
  b.addEventListener('pointermove',e=>{if(drag&&b.classList.contains('on')){e.preventDefault();drag(e.clientX-b._cx,e.clientY-b._cy)}});
  const rel=()=>{if(!b.classList.contains('on'))return;b.classList.remove('on');up&&up()};['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,rel));
  b.addEventListener('contextmenu',e=>e.preventDefault());return b}
let TB_KEY='';
function buildTouchButtons(){
  const el=$('#tbtns');if(!el)return;const key=B?(B.mode+(B.tb?'tb':'rt')+(B.me?act(B.me).m.join():'')):'world';if(key===TB_KEY)return;TB_KEY=key;el.innerHTML='';
  if(!B){$('#joyhint').style.display=JOY.active?'none':'flex';return}
  const m=B.me?act(B.me).m:[];
  const spots=[{right:'0px',bottom:'0px',width:'82px',height:'82px'},{right:'94px',bottom:'4px',width:'60px',height:'60px'},{right:'70px',bottom:'74px',width:'60px',height:'60px'},{right:'4px',bottom:'94px',width:'60px',height:'60px'}];
  const aimDrag=(dx,dy)=>{if(B&&Math.hypot(dx,dy)>14){setAim(dx,dy);B.aimDrag=1}};
  for(let i=0;i<4;i++){const mid=m[i];if(!mid)continue;const mv=MOVES[mid];const b=tbBtn(esc(mv.n.split(' ')[0].toUpperCase()).slice(0,8)+'<br>'+apCost(mid)+' AP','mvb',Object.assign({},spots[i],{background:TYPES[mv.t].c+'dd'}),B.tb?()=>battleMove(i):null,B.tb?null:()=>{if(B){B.aimDrag=0;battleMove(i)}},B.tb?null:aimDrag);b.dataset.i=i;el.appendChild(b)}
  if(!B.tb)el.appendChild(tbBtn('SPRINT','',{right:'166px',bottom:'4px',width:'60px',height:'60px'},battleDash));
  el.appendChild(tbBtn('TAUSCH','',{right:'140px',bottom:'80px',width:'48px',height:'48px'},battleSwitch));
  {const bg=tbBtn('BEUTEL','',{right:'146px',bottom:'140px',width:'46px',height:'46px',background:'#8b5cf6cc'},null);bg.id='tbag';bindBag(bg);el.appendChild(bg);if(B)B.bagK=null}
  if(B.mode==='wild'){el.appendChild(tbBtn('⛓<br>ZIEHEN','',{right:'78px',bottom:'146px',width:'56px',height:'56px',background:'#2fb7b0cc'},capPress,()=>{if(B)B.aimDrag=0;capRelease()},B.tb?null:aimDrag));el.appendChild(tbBtn('FLUCHT','',{right:'10px',bottom:'166px',width:'44px',height:'44px'},tryRun))}
  else if(B.mode!=='trainer')el.appendChild(tbBtn('AUF-<br>GEBEN','',{right:'10px',bottom:'166px',width:'44px',height:'44px',background:'#ef4444cc'},forfeit));
  $('#joyhint').style.display=B.tb?'none':(JOY.active?'none':'flex');
  if(!B.tb&&!buildTouchButtons.tip){buildTouchButtons.tip=1;say('Tipp: Zieh einen Attacken-Knopf zum Zielen — loslassen zum Feuern.')}
}
function updateTouch(){
  const t=$('#touch');if(!t)return;document.body.classList.toggle('inbattle',!!B);
  const blocked=!$('#start').classList.contains('off')||$('#modal').classList.contains('on')||$('#arena').classList.contains('on')||mapOpen()||$('#side').classList.contains('open')||!G||(B&&B.closing);
  const show=isMob()&&!blocked;t.classList.toggle('on',show);if(!show){if(JOY.active){JOY.active=false;JOY.x=JOY.y=0;$('#joy').style.display='none'}return}
  buildTouchButtons();
  if(B&&B.me){const mon=act(B.me),F=B.me;document.querySelectorAll('#tbtns .mvb').forEach(b=>{const i=+b.dataset.i,mid=mon.m[i];if(!mid)return;const cd=B.tb?0:F.cd[i]/cdOf(mid);b.style.setProperty('--cd',clamp(cd,0,1)+'turn');b.classList.toggle('off',(!!B.tb&&B.state!=='tbChoose')||(B.tb?Math.min(AP_MAX,(F.ap??AP_MAX)+TB_AP_REGEN):(F.ap??AP_MAX))<apCost(mid))})}
}
// top menu bar: on desktop it switches the side panel, on phones it opens the slide-in drawer
// clicking the tab that is already open closes the panel again (mobile: slide out, desktop: hide the side bar)
function sideOpen(){const sd=$('#side');return isMob()?sd.classList.contains('open'):!sd.classList.contains('shut')}
function setSide(on){const sd=$('#side');if(isMob())sd.classList.toggle('open',on);else{sd.classList.toggle('shut',!on);setTimeout(()=>dispatchEvent(new Event('resize')),0)}
  document.querySelectorAll('#topbar button[data-t]').forEach(b=>b.classList.toggle('act',on&&b.dataset.t===curTab))}
document.querySelectorAll('#topbar button[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t;if(t===curTab&&sideOpen()){setSide(false);return}switchTab(t);setSide(true)});
$('#tupd').onclick=()=>showNewCl();
// fullscreen on/off, always in the menu bar (hidden where the browser has no fullscreen, e.g. iPhone Safari)
{const fb=$('#hfs'),de=document.documentElement,can=document.fullscreenEnabled||document.webkitFullscreenEnabled;
 const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement),upd=()=>{fb.textContent=isFs()?'⛶ ✕':'⛶';fb.title=isFs()?'Vollbild beenden':'Vollbild'};
 if(can){fb.style.display='';upd();document.addEventListener('fullscreenchange',()=>{upd();setTimeout(()=>{try{checkOrient();setTbh()}catch(e){}},200)});document.addEventListener('webkitfullscreenchange',upd)}
 fb.onclick=()=>{try{if(isFs())(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const r=(de.requestFullscreen||de.webkitRequestFullscreen).call(de);if(r&&r.catch)r.catch(()=>toast('Vollbild ist hier nicht verfügbar.'))}}catch(e){toast('Vollbild ist hier nicht verfügbar.')}}}
$('#stage').addEventListener('pointerdown',e=>{if(isMob()&&$('#side').classList.contains('open')&&!e.target.closest('#side'))$('#side').classList.remove('open')},true);
function checkOrient(){const port=matchMedia('(orientation: portrait)').matches;document.body.classList.toggle('portrait',port);const r=$('#rotate');if(r)r.classList.remove('show');TB_KEY='';if(B)try{sizeBattle()}catch(e){}}
addEventListener('resize',checkOrient);
function setTbh(){try{document.documentElement.style.setProperty('--tbh',$('#topbar').offsetHeight+'px')}catch(e){}}addEventListener('resize',()=>setTimeout(setTbh,50));setInterval(setTbh,1500);addEventListener('orientationchange',()=>setTimeout(checkOrient,200));
$('#rotok').onclick=()=>{checkOrient.dismissed=true;checkOrient()};
// fullscreen + landscape lock (only where the browser allows it; iOS Safari does not)
{const fb=$('#sfs');if(fb){if(document.fullscreenEnabled&&matchMedia('(pointer:coarse)').matches)fb.style.display='inline-block';
  fb.onclick=()=>{try{document.documentElement.requestFullscreen().then(()=>{fb.style.display='none';try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>toast('Vollbild ist hier nicht verfügbar.'))}catch(_){toast('Vollbild ist hier nicht verfügbar.')}}}}




$('#hbag').addEventListener('click',e=>{e.currentTarget.blur();openBagMenu()});
