/* ===================== EP-GEWINN IM KAMPF =====================
   Wird ein Gegner besiegt, fliegen EP-Funken vom besiegten Monster in die neue EP-Leiste unten im eigenen Kampf-Panel;
   über dem Gegner steigt "+N EP" auf, die Leiste füllt sich sichtbar (bei Level-Up: voll, Blitz, von vorn). */
function epBattleMon(){try{return B&&B.me&&B.me.ctrl!=='remote'&&RUN&&RUN.team?RUN.team[B.me.a]:null}catch(e){return null}}
{const _gx=gainXp;gainXp=function(m,amt){const l0=m&&m.l,x0=m&&m.xp;const out=_gx.apply(this,arguments);
  try{if(B&&m&&m===epBattleMon()&&B.state!=='count'){const now=performance.now(),real=Math.round(amt*((RUN.cfg&&RUN.cfg.xp)||1));
    const src=B.foe?[B.foe.x,B.foe.y-18]:[AW/2,AH/2];const[sx,sy]=w2s(src[0],src[1]);
    const ps=[];for(let i=0;i<16;i++){const a=Math.random()*Math.PI*2,r=10+Math.random()*26;ps.push({dx:Math.cos(a)*r,dy:Math.sin(a)*r*.7-8,d:i*28,tx:.1+.8*Math.random(),col:i%3?'#7fd0ff':'#ffe14d'})}
    B.epFx={t0:now,x:sx/UI,y:sy/UI,amt:real,r0:x0/xpNeed(l0),l0,r1:m.xp/xpNeed(m.l),l1:m.l,ps};
    gainXp.quiet=1}}catch(e){}return out}}
const EP_FLY=760,EP_FILL=900;
function epShown(fx,now){const k=clamp((now-fx.t0-EP_FLY+200)/EP_FILL,0,1),e=1-(1-k)*(1-k);const a=fx.l0+fx.r0,b=fx.l1+fx.r1,cur=a+(b-a)*e,lv=Math.floor(cur);
  return{r:fx.l1>fx.l0&&e>=1?fx.r1:cur-lv,flash:lv>fx.l0?1:0}}
{const _hp=hudPanel;hudPanel=function(c,x,y,F,right,label){_hp.apply(this,arguments);try{if(!B||F!==B.me)return;const m=epBattleMon();if(!m)return;
  const now=performance.now(),w=112,h=33,X=right?x-w:x,fx=B.epFx&&now-B.epFx.t0<EP_FLY+EP_FILL+900?B.epFx:null;
  let r=clamp(m.xp/xpNeed(m.l),0,1),flash=0;if(fx){const s=epShown(fx,now);r=clamp(s.r,0,1);flash=s.flash}
  const by=y+h+1,bx=X+12,bw=w-12;c.fillStyle='#14141f';c.fillRect(X-1,by-1,w+2,5);vtText(c,'EP',X+1,by+3,'#7fd0ff',7);c.fillStyle='#2b3350';c.fillRect(bx,by,bw-1,3);
  const fill=fx&&now-fx.t0>EP_FLY-200&&now-fx.t0<EP_FLY+EP_FILL;c.fillStyle=fill&&Math.floor(now/70)%2?'#bfe8ff':'#4aa3ff';c.fillRect(bx,by,Math.round((bw-1)*r),3);c.fillStyle='#ffffff66';c.fillRect(bx,by,Math.round((bw-1)*r),1);
  if(!fx)return;const t=now-fx.t0;
  // glow when the sparks arrive / on level-up
  if(t>EP_FLY-200&&t<EP_FLY+EP_FILL+300){const a=0.35+0.35*Math.sin(t/60);c.globalAlpha=a;c.fillStyle=flash?'#ffe14d':'#9fdcff';c.fillRect(X-2,by-2,w+4,7);c.globalAlpha=1;c.fillStyle='#4aa3ff';c.fillRect(bx,by,Math.round((bw-1)*r),3)}
  // floating "+N EP" above the defeated monster
  if(t<1500){const k=t/1500;c.globalAlpha=k<.8?1:(1-k)/.2;pxText(c,`+${fx.amt} EP`,Math.round(fx.x),Math.round(fx.y-8-k*18),'#7fd0ff',8,'center');c.globalAlpha=1}
  // sparks: burst out, then home into the bar
  for(const p of fx.ps){const u=(t-p.d)/EP_FLY;if(u<0||u>1)continue;const tx=bx+bw*p.tx,ty=by+1;let px,py;
    if(u<.3){const e=u/.3;px=fx.x+p.dx*e;py=fx.y+p.dy*e}else{const e=(u-.3)/.7,ee=e*e;px=fx.x+p.dx+(tx-fx.x-p.dx)*ee;py=fx.y+p.dy+(ty-fx.y-p.dy)*ee}
    const s=u<.85?3:2;c.fillStyle='#14141f';c.fillRect(Math.round(px)-1,Math.round(py)-1,s+2,s+2);c.fillStyle=p.col;c.fillRect(Math.round(px),Math.round(py),s,s)}}catch(e){}}}
