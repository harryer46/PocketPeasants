/* Entwicklungs-Animation wie im Original: dunkler Bildschirm, „Nanu? … entwickelt sich!“, das Monster wird zur weißen
   Silhouette, alte und neue Form wechseln immer schneller, weißer Blitz, die neue Form erscheint mit Funkeln und
   „Glückwunsch!“. Läuft nach dem Kampf (bzw. sofort außerhalb), mehrere Entwicklungen nacheinander. Leertaste/Tippen: weiter. */
const EVO_Q=[];let EVO_ON=null;
{const _gx=gainXp;gainXp=function(m,amt){const s0=m&&m.s;const out=_gx.apply(this,arguments);try{if(m&&s0&&m.s!==s0){let a=s0;const chain=[];let s=a;while(SPECIES[s]&&SPECIES[s].evo&&s!==m.s){chain.push([s,SPECIES[s].evo[1]]);s=SPECIES[s].evo[1]}if(!chain.length)chain.push([s0,m.s]);for(const[f,t]of chain)EVO_Q.push({from:f,to:t})}}catch(e){}return out}}
function evoSil(spr,col){const c=mk(spr.width,spr.height),x=c.getContext('2d');x.drawImage(spr,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
function evoPlay(ev){const W=400,H=300;const ov=document.createElement('div');ov.id='evoov';ov.innerHTML=`<canvas width="${W}" height="${H}"></canvas><div class="evtx"></div>`;document.body.appendChild(ov);
  const cv=ov.querySelector('canvas'),c=cv.getContext('2d'),tx=ov.querySelector('.evtx');c.imageSmoothingEnabled=false;
  const A=monSprite(ev.from,24),Bs=monSprite(ev.to,24),SA=evoSil(A,'#ffffff'),SB=evoSil(Bs,'#ffffff');const nA=SPECIES[ev.from].n,nB=SPECIES[ev.to].n;
  const t0=performance.now(),T_SIL=1500,T_SWAP=4400,T_FLASH=4800,T_END=5800;let skip=false,done=false;const stars=[];
  const draw=s=>{const k=Math.max(1,Math.floor(Math.min(170/s.height,2.4)*2)/2);const w=s.width*k,h=s.height*k;c.drawImage(s,Math.round(W/2-w/2),Math.round(H*0.47-h/2),Math.round(w),Math.round(h))};
  const frame=()=>{if(done)return;let e=performance.now()-t0;if(skip&&e<T_FLASH)e=T_FLASH;
    // backdrop
    c.fillStyle='#0b0d16';c.fillRect(0,0,W,H);const g=c.createRadialGradient(W/2,H*0.47,10,W/2,H*0.47,190);g.addColorStop(0,e>T_SIL?'#3a4a8a':'#1f2a48');g.addColorStop(1,'#0b0d16');c.fillStyle=g;c.fillRect(0,0,W,H);
    // light rays while transforming
    if(e>T_SIL&&e<T_FLASH){c.save();c.translate(W/2,H*0.47);c.rotate(e/1600);c.globalAlpha=Math.min(0.35,(e-T_SIL)/3000);for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.fillStyle=i%2?'#ffffff':'#9fd0ff';c.beginPath();c.moveTo(0,0);c.lineTo(220,-12);c.lineTo(220,12);c.closePath();c.fill()}c.restore()}
    if(e>T_SIL*0.6&&Math.random()<0.6)stars.push({x:W/2+(Math.random()-.5)*240,y:H*0.47+(Math.random()-.5)*190,t:performance.now()});
    for(const s of stars){const a=(performance.now()-s.t)/600;if(a>1)continue;const r=Math.round(3*(1-Math.abs(a-.5)*2));c.fillStyle=e>T_FLASH?'#ffcb3d':'#ffffff';c.fillRect(Math.round(s.x)-r,Math.round(s.y),2*r+1,1);c.fillRect(Math.round(s.x),Math.round(s.y)-r,1,2*r+1)}
    while(stars.length&&performance.now()-stars[0].t>700)stars.shift();
    // sprite phases
    if(e<T_SIL*0.55)draw(A);
    else if(e<T_SIL){draw(A);c.globalAlpha=(e-T_SIL*0.55)/(T_SIL*0.45);draw(SA);c.globalAlpha=1}
    else if(e<T_SWAP){const u=(e-T_SIL)/(T_SWAP-T_SIL),per=520*(1-u)+55,ph=Math.floor((e-T_SIL)/per)%2;draw(ph?SB:SA)}
    else if(e<T_FLASH){draw(SB);c.fillStyle=`rgba(255,255,255,${(e-T_SWAP)/(T_FLASH-T_SWAP)})`;c.fillRect(0,0,W,H)}
    else{draw(Bs);const f=1-Math.min(1,(e-T_FLASH)/500);if(f>0){c.fillStyle=`rgba(255,255,255,${f})`;c.fillRect(0,0,W,H)}}
    const txt=e<T_FLASH?`Nanu? ${nA} entwickelt sich!`:`Glückwunsch! ${nA} hat sich zu ${nB} entwickelt!`;if(tx.dataset.t!==txt){tx.dataset.t=txt;tx.innerHTML=esc(txt)+(e>=T_FLASH?`<span class="evk">${isMob()?'Tippen':'LEERTASTE'} ▶</span>`:'')}
    if(e>=T_END&&!ov.dataset.ready){ov.dataset.ready=1}
    requestAnimationFrame(frame)};frame();
  return new Promise(res=>{const close=()=>{if(done)return;const e=performance.now()-t0;if(e<T_FLASH&&!skip){skip=true;return}if(e<T_FLASH+600)return;done=true;ov.remove();removeEventListener('keydown',kd,true);res()};
    const kd=e=>{if(e.key===' '||e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}};addEventListener('keydown',kd,true);ov.addEventListener('pointerdown',e=>{e.preventDefault();close()});
    setTimeout(()=>{if(!done){const auto=()=>{if(done)return;if(performance.now()-t0>T_END+4000)close();else setTimeout(auto,500)};auto()}},T_END)})}
setInterval(()=>{if(EVO_ON||!EVO_Q.length||B||PANIC||TALK||$('#modal').classList.contains('on'))return;if(($('#study')&&$('#study').classList.contains('on'))||$('#cquiz').classList.contains('on'))return;
  EVO_ON=EVO_Q.shift();evoPlay(EVO_ON).then(()=>{EVO_ON=null})},300);
(function(){const st=document.createElement('style');st.textContent=`#evoov{position:fixed;inset:0;z-index:99999;background:#0b0d16;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
#evoov canvas{width:min(92vw,800px);height:auto;image-rendering:pixelated;border:3px solid #000;box-shadow:6px 6px 0 #000}
#evoov .evtx{width:min(92vw,800px);box-sizing:border-box;background:#f6f1e1;color:#14141f;border:3px solid #14141f;box-shadow:4px 4px 0 #000;padding:10px 14px;font-family:VT323,monospace;font-size:24px;line-height:1.1;display:flex;justify-content:space-between;gap:10px;align-items:flex-end}
#evoov .evk{font:9px 'Press Start 2P',monospace;color:#5b3fd1;white-space:nowrap;animation:evb 1s steps(2) infinite}@keyframes evb{50%{opacity:.3}}`;document.head.appendChild(st)})();
