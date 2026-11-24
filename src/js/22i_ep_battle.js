/* ===================== EP-GEWINN IM KAMPF =====================
   Wird ein Gegner besiegt, fliegen EP-Funken vom besiegten Monster in die neue EP-Leiste unten im eigenen Kampf-Panel;
   über dem Gegner steigt "+N EP" auf, die Leiste füllt sich sichtbar (bei Level-Up: voll, Blitz, von vorn). */
function epBattleMon(){try{return B&&B.me&&B.me.ctrl!=='remote'&&RUN&&RUN.team?RUN.team[B.me.a]:null}catch(e){return null}}
{const _gx=gainXp;gainXp=function(m,amt){const l0=m&&m.l,x0=m&&m.xp;const out=_gx.apply(this,arguments);
  try{if(B&&m&&m===epBattleMon()&&B.state!=='count'){const now=performance.now(),real=XP_LAST_REAL!=null?XP_LAST_REAL:Math.round(amt*((RUN.cfg&&RUN.cfg.xp)||1));
    const src=B.foe?[B.foe.x,B.foe.y-18]:[AW/2,AH/2];const[sx,sy]=w2s(src[0],src[1]);
    const ps=[];for(let i=0;i<16;i++){const a=Math.random()*Math.PI*2,r=10+Math.random()*26;ps.push({dx:Math.cos(a)*r,dy:Math.sin(a)*r*.7-8,d:i*55,tx:.1+.8*Math.random(),col:i%3?'#7fd0ff':'#ffe14d'})}
    B.epFx={t0:now,x:sx/UI,y:sy/UI,amt:real,r0:x0/xpNeed(l0),l0,r1:m.xp/xpNeed(m.l),l1:m.l,ps};
    gainXp.quiet=1}}catch(e){}return out}}
const EP_FLY=1400,EP_FILL=2400,EP_TXT=3000,EP_END=EP_FLY+EP_FILL+700;
function epBusy(){return!!(B&&B.epFx&&performance.now()-B.epFx.t0<EP_END)}
function epShown(fx,now){const k=clamp((now-fx.t0-EP_FLY+200)/EP_FILL,0,1),e=1-(1-k)*(1-k);const a=fx.l0+fx.r0,b=fx.l1+fx.r1,cur=a+(b-a)*e,lv=Math.floor(cur);
  return{r:fx.l1>fx.l0&&e>=1?fx.r1:cur-lv,flash:lv>fx.l0?1:0}}
function epBar(c,X,y,r,glow,flash,now){const w=112,h=33,by=y+h+1,bx=X+12,bw=w-12;
  if(glow){const a=0.35+0.35*Math.sin(now/90);c.globalAlpha=a;c.fillStyle=flash?'#ffe14d':'#9fdcff';c.fillRect(X-2,by-2,w+4,7);c.globalAlpha=1}
  c.fillStyle='#14141f';c.fillRect(X-1,by-1,w+2,5);vtText(c,'EP',X+1,by+3,'#7fd0ff',7);c.fillStyle='#2b3350';c.fillRect(bx,by,bw-1,3);
  c.fillStyle=glow&&Math.floor(now/110)%2?'#bfe8ff':'#4aa3ff';c.fillRect(bx,by,Math.round((bw-1)*r),3);c.fillStyle='#ffffff66';c.fillRect(bx,by,Math.round((bw-1)*r),1);return{bx,bw,by}}
{const _hp=hudPanel;hudPanel=function(c,x,y,F,right,label){_hp.apply(this,arguments);try{if(!B||F!==B.me||epBusy())return;const m=epBattleMon();if(!m)return;
  epBar(c,right?x-112:x,y,clamp(m.xp/xpNeed(m.l),0,1),0,0,performance.now())}catch(e){}}}
// drawn last (after the SIEG/finale overlay), so the EP gain is always in front
function epTop(c,K,now){try{const fx=B.epFx;if(!fx||now-fx.t0>=EP_END||B.me.spawnT===Infinity)return;c.setTransform(K*UI,0,0,K*UI,0,0);c.imageSmoothingEnabled=false;
  const t=now-fx.t0,s=epShown(fx,now),glow=t>EP_FLY-300&&t<EP_FLY+EP_FILL+400;
  const{bx,bw,by}=epBar(c,4,4,clamp(s.r,0,1),glow,s.flash,now);
  if(t<EP_TXT){const k=t/EP_TXT;c.globalAlpha=k<.8?1:(1-k)/.2;pxText(c,`+${fx.amt} EP`,Math.round(fx.x),Math.round(fx.y-8-k*20),'#9fe0ff',8,'center');c.globalAlpha=1}
  for(const p of fx.ps){const u=(t-p.d)/EP_FLY;if(u<0||u>1)continue;const tx=bx+bw*p.tx,ty=by+1;let px,py;
    if(u<.3){const e=u/.3;px=fx.x+p.dx*e;py=fx.y+p.dy*e}else{const e=(u-.3)/.7,ee=e*e;px=fx.x+p.dx+(tx-fx.x-p.dx)*ee;py=fx.y+p.dy+(ty-fx.y-p.dy)*ee}
    const sz=u<.85?3:2;c.fillStyle='#14141f';c.fillRect(Math.round(px)-1,Math.round(py)-1,sz+2,sz+2);c.fillStyle=p.col;c.fillRect(Math.round(px),Math.round(py),sz,sz)}}catch(e){}}
