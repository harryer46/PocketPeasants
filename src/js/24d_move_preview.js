/* Attacken-Vorschau: beim Überfahren (Touch: Antippen) einer Attacke in Details, Team-Liste, TM-Menü oder Kampf-Knöpfen
   erscheint ein kleines Pixel-Kampffeld, auf dem die Attacke als Schleife läuft (stilisiert, je Wirkungsart ein Ablauf). */
let PREV_SID=null,MVP=null;
{const _omi=openMonInfo;openMonInfo=function(s){PREV_SID=s;return _omi.apply(this,arguments)}}
(function(){const st=document.createElement('style');st.textContent=`#mvprev{position:fixed;z-index:60;pointer-events:none;background:#14141f;border:3px solid #000;box-shadow:4px 4px 0 #000;padding:3px;display:none}
#mvprev canvas{display:block;width:264px;height:144px;image-rendering:pixelated}#mvprev .cap{font-family:VT323,monospace;font-size:15px;color:#e8e8f0;padding:2px 2px 0;display:flex;justify-content:space-between;gap:8px}`;document.head.appendChild(st)})();
const PW=176,PH=96,PAX=34,PTX=142,PGY=70;
function pvDummy(c,x,y,shake,hit){x+=shake;c.fillStyle='#14141f';c.fillRect(x-2,y-2,4,6);c.fillRect(x-7,y-24,14,20);c.fillRect(x-5,y-30,10,7);
  c.fillStyle='#6b4a2a';c.fillRect(x-1,y-4,2,6);c.fillStyle=hit?'#ffffff':'#d9b45a';c.fillRect(x-6,y-23,12,18);c.fillStyle=hit?'#ffffff':'#e8c878';c.fillRect(x-4,y-29,8,6);c.fillStyle='#a0552a';c.fillRect(x-6,y-16,12,2);c.fillStyle='#ef4444';c.fillRect(x-2,y-19,4,4)}
function pvBush(c,x,y,burn,gone){if(gone)return;c.fillStyle='#14141f';c.fillRect(x-7,y-10,14,11);c.fillStyle=burn?'#7a3a10':'#3d8a3d';c.fillRect(x-6,y-9,12,9);c.fillStyle=burn?'#ef7a1a':'#5fb85f';c.fillRect(x-4,y-8,5,4);if(burn)for(let i=0;i<3;i++){c.fillStyle=i%2?'#ffcb3d':'#ef4444';c.fillRect(x-5+i*4,y-14-((i+Math.floor(performance.now()/90))%3)*2,3,4)}}
function pvRock(c,x,y){c.fillStyle='#14141f';c.fillRect(x-8,y-11,16,12);c.fillStyle='#7d838c';c.fillRect(x-7,y-10,14,10);c.fillStyle='#9aa0a6';c.fillRect(x-5,y-9,6,4)}
function pvPuddle(c,x,y,zap,t){c.fillStyle=zap?'#3d8bf2':'#2f7fd0';c.fillRect(x-12,y-2,24,5);c.fillRect(x-9,y-3,18,7);c.fillStyle='#8fc8f0';c.fillRect(x-6,y-1,5,1);if(zap){c.fillStyle=Math.floor(t*20)%2?'#ffe14d':'#fff';c.fillRect(x-4+((t*40)|0)%8,y-6,2,5)}}
function pvBall(c,x,y,r,col){r=Math.max(1,Math.round(r));c.fillStyle='#14141f';c.fillRect(Math.round(x)-r-1,Math.round(y)-r-1,2*r+2,2*r+2);c.fillStyle=col;c.fillRect(Math.round(x)-r,Math.round(y)-r,2*r,2*r);c.fillStyle='#ffffffb0';c.fillRect(Math.round(x)-r,Math.round(y)-r,1,1)}
function pvBurst(c,x,y,col,k){for(let i=0;i<8;i++){const a=i/8*6.283,d=3+k*12;c.fillStyle=i%2?col:'#ffffff';c.fillRect(Math.round(x+Math.cos(a)*d)-1,Math.round(y+Math.sin(a)*d*0.8)-1,2,2)}}
function pvText(c,t,x,y,col){c.font='8px VT323,monospace';c.textAlign='center';c.fillStyle='#14141f';c.fillText(t,x+1,y+1);c.fillStyle=col;c.fillText(t,x,y);c.textAlign='left'}
function pvDraw(c,mid,sid,t,spr){const mv=MOVES[mid]||MOVES.bump,col=(TYPES[mv.t]||TYPES.normal).c,k=mv.k||'shot',rnd=mulberry32(7);
  // ground
  c.fillStyle='#4f7a3a';c.fillRect(0,0,PW,PH);for(let i=0;i<120;i++){c.fillStyle=i%3?'#5f8a46':'#46703a';c.fillRect(Math.floor(rnd()*PW),Math.floor(rnd()*PH),2,1)}
  c.fillStyle='#8a6a40';for(let x=0;x<PW;x+=2)c.fillRect(x,PGY+6+((x>>3)%2),2,PH);c.fillStyle='#14141f';c.fillRect(0,0,PW,1);
  let ax=PAX,ay=PGY,tx=PTX,ty=PGY,tsh=0,thit=false,aShow=true,tShow=true,fxLbl=null;const T0=ty-14,A0=ay-14;
  const hitAt=(p)=>{if(t>p&&t<p+0.12){thit=true;tsh=Math.round(Math.sin(t*200)*2)}if(t>p&&t<p+0.35&&mv.fx)fxLbl=mv.fx.toUpperCase().slice(0,4)};
  const proj=(t0,t1,r,arc)=>{if(t<t0||t>t1)return;const u=(t-t0)/(t1-t0);pvBall(c,ax+(tx-ax)*u,A0+(T0-A0)*u-(arc?Math.sin(u*Math.PI)*arc:0),r,col)};
  const pre=[];  // scenery for environment moves
  if(k==='shortcircuit')pre.push(()=>{pvPuddle(c,88,PGY+2,t>0.25&&t<0.8,t);pvPuddle(c,tx,PGY+2,t>0.25&&t<0.8,t)});
  if(k==='wildfire'){pre.push(()=>{pvBush(c,62,PGY+1,t>0.2,false);pvBush(c,96,PGY-4,t>0.4,false);pvBush(c,122,PGY+3,t>0.6,false)})}
  if(k==='bigwave')pre.push(()=>pvBush(c,96,PGY,false,t>0.45));
  for(const f of pre)f();
  switch(k){
    case 'melee':case 'dash':case 'chase':case 'sucker':case 'counter':case 'steal':case 'dun':{const u=t<0.35?t/0.35:t<0.55?1:Math.max(0,1-(t-0.55)/0.3);ax=PAX+(tx-PAX-22)*u;if(t>0.33&&t<0.5){for(let i=-2;i<=2;i++){c.fillStyle=i%2?'#fff':col;c.fillRect(tx-8+i*3,T0-6+i*3,6,2)}}hitAt(0.34);break}
    case 'jumpkick':{const u=Math.min(1,t/0.5);ax=PAX+(tx-PAX-18)*u;ay=PGY-Math.sin(u*Math.PI)*26;if(t>0.5&&t<0.65)pvBurst(c,tx,T0,col,(t-0.5)/0.15);hitAt(0.5);break}
    case 'spin':{for(let i=0;i<10;i++){const a=i/10*6.283+t*20;c.fillStyle=i%2?'#fff':col;c.fillRect(Math.round(ax+Math.cos(a)*18),Math.round(A0+6+Math.sin(a)*8),3,2)}break}
    case 'blink':{aShow=!(t>0.25&&t<0.4);if(t>=0.4&&t<0.7)ax=tx-22;if(t>0.4&&t<0.55)pvBurst(c,tx-22,A0,col,(t-0.4)/0.15);hitAt(0.45);break}
    case 'self':case 'grow':case 'belly':case 'focus':case 'veil':case 'mirror':case 'decoy':{const r=6+((t*2)%1)*18;c.globalAlpha=1-((t*2)%1);c.strokeStyle=col;c.lineWidth=2;c.strokeRect(ax-r,A0-r*0.8,2*r,1.6*r);c.globalAlpha=1;for(let i=0;i<3;i++){const y=A0-((t*40+i*12)%30);c.fillStyle=col;c.fillRect(ax-10+i*10,y,3,5);c.fillRect(ax-11+i*10,y+1,5,1)}break}
    case 'protect':case 'screen':{c.globalAlpha=0.5+0.3*Math.sin(t*20);c.fillStyle=col;c.fillRect(ax+14,A0-14,3,28);c.fillRect(ax+12,A0-10,2,20);c.globalAlpha=1;proj(0.2,0.55,3);if(t>0.5&&t<0.6)pvBurst(c,ax+18,A0,'#ffffff',(t-0.5)/0.1);tx=PTX;break}
    case 'nova':case 'ring':{const u=(t%0.7)/0.7,R=u*120;for(let a=0;a<40;a++){const q=a/40*6.283;c.fillStyle=a%3?col:'#fff';c.fillRect(Math.round(ax+Math.cos(q)*R),Math.round(A0+Math.sin(q)*R*0.6),2,2)}hitAt(0.62);break}
    case 'beam':{if(t<0.3){const r=2+t*14;pvBall(c,ax+10,A0,r,'#ffffff')}else if(t<0.6){c.fillStyle='#14141f';c.fillRect(ax+8,A0-4,tx-ax-8,8);c.fillStyle=col;c.fillRect(ax+8,A0-3,tx-ax-8,6);c.fillStyle='#ffffff';c.fillRect(ax+8,A0-1,tx-ax-8,2)}hitAt(0.32);break}
    case 'jet':{const L=Math.min(tx-ax-8,(t/0.5)*(tx-ax));if(t<0.8)for(let i=0;i<L;i+=4){c.fillStyle=i%8?'#3d8bf2':'#5aa8ff';c.fillRect(ax+8+i,A0-3+Math.round(Math.sin(t*30+i)*1),4,6)}if(t>0.45&&t<0.8){tx=PTX+Math.round((t-0.45)*30);tsh=1}hitAt(0.45);break}
    case 'spread':case 'boomer':{for(const d of[-14,0,14]){if(t<0.6){const u=t/0.6;pvBall(c,ax+(tx-ax)*u,A0+d*u,2,col)}}hitAt(0.6);break}
    case 'multi':case 'rapid':case 'quad':case 'stack':{for(let i=0;i<4;i++)proj(i*0.12,i*0.12+0.4,2);hitAt(0.4);break}
    case 'big':case 'roll':{proj(0,0.7,6);hitAt(0.7);if(t>0.7&&t<0.85)pvBurst(c,tx,T0,col,(t-0.7)/0.15);break}
    case 'arc':case 'lob':{proj(0,0.6,3,30);if(t>0.6&&t<0.8){const r=(t-0.6)/0.2*16;c.globalAlpha=0.6;c.fillStyle=col;c.fillRect(tx-r,PGY-r*0.3,2*r,r*0.6);c.globalAlpha=1}hitAt(0.6);break}
    case 'breath':{if(t<0.65)for(let i=0;i<12;i++){const u=((t*2+i*0.08)%1),x=ax+10+u*(tx-ax-10),y=A0+(i%3-1)*u*8;c.fillStyle=i%2?col:'#ffcb3d';c.fillRect(Math.round(x),Math.round(y),3,3)}hitAt(0.35);break}
    case 'vortex':case 'orbit':{const u=Math.min(1,t/0.6);for(let i=0;i<10;i++){const a=i/10*12.56+t*25,r=2+i;c.fillStyle=i%3?col:'#fff';c.fillRect(Math.round(ax+(tx-ax)*u+Math.cos(a)*r),Math.round(A0+(T0-A0)*u+Math.sin(a)*r*0.6),2,2)}hitAt(0.6);break}
    case 'whirl4':{for(let v=0;v<4;v++){const cx=60+v*24+Math.sin(t*6+v)*10,cy=PGY-6+Math.cos(t*5+v*2)*10;for(let i=0;i<8;i++){const a=i/8*12.56+t*20*(v%2?1:-1),r=1+i;c.fillStyle=i%3?'#3d8bf2':'#d8f0ff';c.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r*0.6),2,2)}}tsh=Math.round(Math.sin(t*40));break}
    case 'wave':case 'bigwave':{const x=ax+(PW+10-ax)*Math.min(1,t/0.8),h=k==='bigwave'?26:14;for(let y=8;y<PH;y+=4){c.fillStyle='#14141f';c.fillRect(Math.round(x)-5,y,10,4);c.fillStyle='#2f7fd0';c.fillRect(Math.round(x)-4,y,8,4);c.fillStyle=(y/4)%3?'#5aa8ff':'#ffffff';c.fillRect(Math.round(x)+2,y,2,4)}if(k==='bigwave'&&x>tx-6&&x<tx+12)tx+=Math.round((x-tx+6)*0.8);hitAt(0.62);break}
    case 'weather':case 'rain':{const w=mv.w||(k==='rain'?'rain':'sun');c.globalAlpha=0.35;c.fillStyle=w==='sun'?'#ffcb3d':w==='rain'?'#1e3a6b':'#c8a060';c.fillRect(0,0,PW,PH);c.globalAlpha=1;
      for(let i=0;i<26;i++){const x=(i*37+t*(w==='sand'?200:20))%PW,y=(i*23+t*(w==='rain'?260:40))%PH;c.fillStyle=w==='sun'?'#fff3c8':w==='rain'?'#8fc8f0':'#e0c070';c.fillRect(Math.round(x),Math.round(y),w==='rain'?1:2,w==='rain'?5:1)}break}
    case 'fly':case 'dive':case 'air':{if(t<0.35){ay=PGY-t/0.35*80}else if(t<0.6){aShow=false}else{const u=Math.min(1,(t-0.6)/0.15);ax=tx-14;ay=PGY-80+80*u;if(u>=1&&t<0.85)pvBurst(c,tx,T0,col,(t-0.75)/0.1)}hitAt(0.75);break}
    case 'taunt':case 'gloom':{pvText(c,k==='taunt'?'! ? !':'☁',tx,T0-20+Math.round(Math.sin(t*12)*2),col);break}
    case 'pull':case 'tether':{for(let i=0;i<8;i++){const u=((1-t*2)%1+1)%1;c.fillStyle=i%2?col:'#fff';c.fillRect(Math.round(ax+10+(tx-ax-10)*((u+i/8)%1)),A0-1,3,2)}tx=PTX-Math.round(Math.min(1,t/0.7)*50);break}
    case 'blow':case 'gale':case 'windstream':{for(let i=0;i<14;i++){const u=((t*1.6+i*0.071)%1),y=A0-14+(i*7)%28;c.fillStyle=i%3?'#e8f4ff':'#9fd0f0';c.fillRect(Math.round(ax+10+u*(PW-ax)),y,7,1)}tx=PTX+Math.round(Math.min(1,t/(k==='windstream'?0.8:0.3))*(k==='windstream'?26:20));thit=t>0.25&&t<0.35;break}
    case 'spikes':case 'mine':case 'seed':case 'wall':case 'oil':case 'magnet':case 'ground':{const u=Math.min(1,t/0.4);for(let i=0;i<3;i++){const x=ax+30+i*22,y=PGY+2;if(u<1)pvBall(c,ax+(x-ax)*u,A0+(y-A0)*u-Math.sin(u*Math.PI)*16,2,col);else{c.fillStyle='#14141f';c.fillRect(x-4,y-3,8,5);c.fillStyle=col;c.fillRect(x-3,y-2,6,3)}}break}
    case 'rockthrow':{if(t<0.25){const u=t/0.25;pvRock(c,ax+16-u*16,ay-u*30)}else if(t<0.7){const u=(t-0.25)/0.45;pvRock(c,ax+(tx-ax)*u,ay-30+(16)*u)}else if(t<0.85)pvBurst(c,tx,T0,'#9aa0a6',(t-0.7)/0.15);hitAt(0.7);break}
    case 'shortcircuit':{if(t>0.25&&t<0.8)for(let i=0;i<10;i++){const u=i/10,x=ax+10+(tx-ax-10)*u,y=A0+8+(Math.random()-.5)*10;c.fillStyle=i%2?'#ffe14d':'#fff';c.fillRect(Math.round(x),Math.round(y),3,2)}hitAt(0.3);break}
    case 'wildfire':{hitAt(0.65);break}
    default:{proj(0,0.5,3);hitAt(0.5);if(t>0.5&&t<0.65)pvBurst(c,tx,T0,col,(t-0.5)/0.15)}}
  if(tShow)pvDummy(c,tx,ty,tsh,thit);
  if(aShow&&spr){c.imageSmoothingEnabled=false;const S=40;c.drawImage(spr,Math.round(ax-S/2),Math.round(ay-S+4),S,S)}else if(aShow){pvBall(c,ax,ay-10,8,'#9aa1bd')}
  if(fxLbl&&mv.fx)pvText(c,fxLbl,tx,T0-24,'#ffcb3d');
  if(thit&&(mv.p||0)>0)pvText(c,'-'+mv.p,tx+14,T0-10-Math.round((t%0.3)*20),'#ffffff')}
function pvShow(el,mid,sid){if(!MOVES[mid])return;if(!MVP){MVP=document.createElement('div');MVP.id='mvprev';MVP.innerHTML='<canvas width="176" height="96"></canvas><div class="cap"><span class="n"></span><span class="d"></span></div>';document.body.appendChild(MVP)}
  const mv=MOVES[mid];MVP.querySelector('.n').textContent=mv.n;MVP.querySelector('.d').textContent=(TYPES[mv.t]||{}).n+(mv.p?' · '+mv.p:'');MVP.style.display='block';
  const r=el.getBoundingClientRect(),w=278,h=170;let x=r.right+8,y=r.top;if(x+w>innerWidth)x=Math.max(4,r.left-w-8);if(y+h>innerHeight)y=innerHeight-h-4;MVP.style.left=x+'px';MVP.style.top=Math.max(4,y)+'px';
  const spr=sid&&SPECIES[sid]?monSprite(sid,24):null;const cv=MVP.querySelector('canvas'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;const t0=performance.now(),cyc=1.8;MVP.dataset.mid=mid;
  cancelAnimationFrame(MVP.raf);const loop=()=>{if(MVP.style.display==='none'||MVP.dataset.mid!==mid)return;const t=((performance.now()-t0)/1000%cyc)/cyc;try{pvDraw(c,mid,sid,t,spr)}catch(e){}MVP.raf=requestAnimationFrame(loop)};loop()}
function pvHide(){if(MVP){MVP.style.display='none';cancelAnimationFrame(MVP.raf)}}
function pvTarget(e){const el=e.target&&e.target.closest&&e.target.closest('[data-prev],[data-tm],[data-tmgive],#bact .mv');if(!el)return null;let mid=el.dataset.prev||el.dataset.tm||el.dataset.tmgive;let sid=el.dataset.prevS||PREV_SID;
  if(!mid&&el.classList.contains('mv')&&B&&B.me){const a=act(B.me);mid=a&&a.m[+el.dataset.i];sid=a&&a.s}
  return mid?{el,mid,sid}:null}
document.addEventListener('mouseover',e=>{const p=pvTarget(e);if(p)pvShow(p.el,p.mid,p.sid)});
document.addEventListener('mouseout',e=>{const p=pvTarget(e);if(p&&!(e.relatedTarget&&p.el.contains(e.relatedTarget)))pvHide()});
document.addEventListener('touchstart',e=>{const p=pvTarget(e);if(p&&!(B&&B.state==='fight')){pvShow(p.el,p.mid,p.sid);clearTimeout(pvShow.to);pvShow.to=setTimeout(pvHide,2600)}},{passive:true});
{const _cm=closeModal;closeModal=function(){pvHide();return _cm.apply(this,arguments)}}
