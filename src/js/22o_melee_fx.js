// ===== melee animations in the style of the original games =====
// every melee move gets its own swing (while the hit travels) and its own impact
// (claw marks, jaws, fist, foot, karate chop, whip, wings, drill beak, sparks, splash, ground crack ...)
const MFX_STYLE={
  scratch:'claw',furyswipes:'claw',metalclaw:'claw',
  biss:'jaw',crunch:'jaw',cinderbite:'jaw',
  flexpunch:'fist',dynamopunch:'fist',quickjab:'fist',gegenschlag2:'fist',
  dreifachkick:'kick',
  karateschlag:'chop',tempohieb:'chop',canewhack:'chop',
  bump:'body',headrush:'body',bodyslam:'body',
  vinelash:'whip',noodlelash:'whip',
  wingattack:'wing',steelwing:'wing',
  drillpeck:'peck',irontail:'tail',jolt:'spark',waveslam:'splash',quakestomp:'crack',
  divebomb:'dive',skyslam:'dive',whirl:'whirl',geowurf:'throw',dieb:'snatch'};
const MFX_BIG={dynamopunch:1,bodyslam:1,quakestomp:1,skyslam:1,geowurf:1,crunch:1};
const MFX_COL={metalclaw:'#c8ccd8',steelwing:'#c8ccd8',irontail:'#b0b6c6',crunch:'#6a4a8a',biss:'#ffffff',cinderbite:'#ff8a3d',noodlelash:'#ffd96b',canewhack:'#a8743a'};
const MK='#14141f';
// small pixel sprites (facing right); W light, L shade, K outline
const MBM={
  fist:['.KKKKK..','KWWWWWK.','KWWWWWWK','KWWWWWWK','KWLWLWWK','.KWWWWK.','..KKKK..'],
  foot:['..KKKK...','..KWWK...','..KWWKKKK','.KWWWWWWK','KWWWWWWWK','.KKKKKKK.'],
  hand:['.KKK.','KWWWK','KWWWK','KWWWK','KWWWK','KWWWK','KWWWK','KLLLK','.KKK.'],
  wing:['KKK.......','KWWKK.....','KWWWWKK...','.KWWWWWKK.','..KWWWWWWK','...KKWWWWK','.....KKKK.'],
  grab:['K.K.K.','KWKWKW','KWKWKW','KWWWWK','KWWWWK','.KKKK.']};
function mBm(c,rows,x,y,W,L,fx,fy,S){S=S||2;const h=rows.length,w=rows[0].length,x0=Math.round(x-w*S/2),y0=Math.round(y-h*S/2);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[fy?h-1-j:j][fx?w-1-i:i];if(ch==='.')continue;c.fillStyle=ch==='K'?MK:ch==='L'?L:W;c.fillRect(x0+i*S,y0+j*S,S,S)}}
function mLine(c,x0,y0,x1,y1,col,w){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));c.fillStyle=col;w=w||1;
  for(let i=0;i<=n;i++){const t=i/n;c.fillRect(Math.round(x0+(x1-x0)*t-w/2),Math.round(y0+(y1-y0)*t-w/2),w,w)}}
function mStar(c,x,y,R,col,sp){sp=sp||8;R*=1.6;for(let i=0;i<sp;i++){const a=i/sp*6.283+(i%2?0.2:0),r=i%2?R*0.55:R;mLine(c,x,y,x+Math.cos(a)*r,y+Math.sin(a)*r*0.8,col,i%2?2:3)}
  c.fillStyle='#ffffff';c.fillRect(Math.round(x)-3,Math.round(y)-3,6,6)}
function mSpeed(c,x,y,a,len,col,n){const px=-Math.sin(a),py=Math.cos(a);for(let i=0;i<(n||4);i++){const o=(i-(n||4)/2+0.5)*6,l=len*(0.6+((i*37)%10)/25);
  mLine(c,x+px*o-Math.cos(a)*12,y+py*o-Math.sin(a)*12,x+px*o-Math.cos(a)*(12+l*1.6),y+py*o-Math.sin(a)*(12+l*1.6),col,2)}}
function mBolt(c,x0,y0,x1,y1,col,seed){let px=x0,py=y0;const n=5;for(let i=1;i<=n;i++){const t=i/n,j=i<n?((Math.sin(seed*13+i*7.1)*0.5)*8):0;
  const nx=x0+(x1-x0)*t+j,ny=y0+(y1-y0)*t+j*0.5;mLine(c,px,py,nx,ny,'#ffffff',2);mLine(c,px,py,nx,ny,col,1);px=nx;py=ny}}
function mClaw(c,x,y,a,len,col,k,flip,n){const d=a+(flip?-0.9:0.9),ux=Math.cos(d),uy=Math.sin(d),px=-uy,py=ux;n=n||3;
  for(let i=0;i<n;i++){const o=(i-(n-1)/2)*7,cx=x+px*o,cy=y+py*o,L=len*Math.min(1,k);
    mLine(c,cx-ux*len/2,cy-uy*len/2,cx-ux*len/2+ux*L,cy-uy*len/2+uy*L,MK,5);mLine(c,cx-ux*len/2,cy-uy*len/2,cx-ux*len/2+ux*L,cy-uy*len/2+uy*L,col,3);
    mLine(c,cx-ux*len/2+ux*2,cy-uy*len/2+uy*2,cx-ux*len/2+ux*Math.max(2,L-2),cy-uy*len/2+uy*Math.max(2,L-2),'#ffffff',1)}}
function mJaw(c,x,y,k,R,col){const gap=Math.round(R*1.3*(1-k)),w=R*2;// upper and lower row of teeth snapping shut
  for(const s of [-1,1]){const by=Math.round(y+s*(gap+3));c.fillStyle=MK;c.fillRect(Math.round(x-w/2)-1,by-(s<0?5:0)-1,w+2,7);c.fillStyle=col;c.fillRect(Math.round(x-w/2),by-(s<0?5:0),w,5);
    for(let i=0;i<5;i++){const tx=Math.round(x-w/2+2+i*(w-4)/4);for(let r=0;r<6;r++){const hw=Math.max(0,3-Math.floor(r/2));c.fillStyle=r===5?MK:'#ffffff';c.fillRect(tx-hw,by+s*(r+1),hw*2+1,1)}}}}
function mWhip(c,x0,y0,x1,y1,col,now,k){const n=14,dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,px=-dy/L,py=dx/L;let lx=x0,ly=y0;
  for(let i=1;i<=n;i++){const t=i/n*Math.min(1,k*1.2),w=Math.sin(t*9-now/40)*5*(1-t*0.4);const nx=x0+dx*t+px*w,ny=y0+dy*t+py*w;mLine(c,lx,ly,nx,ny,MK,4);mLine(c,lx,ly,nx,ny,col,3);lx=nx;ly=ny}
  c.fillStyle='#ffffff';c.fillRect(Math.round(lx)-1,Math.round(ly)-1,2,2)}
function mOwner(s){if(!B)return null;return B.me&&B.me.side===s.side?B.me:B.foe}
function mfxStyle(mid){return MFX_STYLE[mid]||'slash'}
function mfxCol(mid){return MFX_COL[mid]||(TYPES[MOVES[mid].t]||{}).c||'#ffffff'}

// --- swing: drawn while the melee hit is under way ---
function meleeSwing(c,s,col,now){const st=mfxStyle(s.mid),cl=mfxCol(s.mid),a=Math.atan2(s.vy,s.vx),k=clamp(s.age/(s.life||0.17),0,1),X=s.x,Y=s.y,fx=s.vx<0;
  const A=mOwner(s);
  switch(st){
    case 'claw':{const fl=(s.mid==='furyswipes'||s.mid==='metalclaw')&&((B.mcN||0)%2);mClaw(c,X,Y,a,22,cl,k,fl,3);break}
    case 'jaw':{const R=s.mid==='crunch'?15:11;mJaw(c,X,Y,k,R,s.mid==='crunch'?'#6a4a8a':'#c84a5a');break}
    case 'fist':{mSpeed(c,X,Y,a,s.mid==='quickjab'?16:10,'#ffffff',s.mid==='dynamopunch'?5:3);const big=s.mid==='dynamopunch';
      if(big){c.fillStyle='#ff8a3d';pxEl(c,X,Y,7,6,1)}mBm(c,MBM.fist,X,Y,big?'#ffd96b':'#f0e6d8',big?'#d89a3d':'#b9ab98',fx,0);break}
    case 'kick':mSpeed(c,X,Y,a,10,'#ffffff',3);mBm(c,MBM.foot,X,Y,'#f0e6d8','#b9ab98',fx,0);break;
    case 'chop':{const yy=Y-14*(1-k);if(s.mid==='canewhack'){mLine(c,X-6*(fx?-1:1),yy-10,X+4*(fx?-1:1),yy+6,MK,3);mLine(c,X-6*(fx?-1:1),yy-10,X+4*(fx?-1:1),yy+6,'#a8743a',2)}
      else{mBm(c,MBM.hand,X,yy,'#f0e6d8','#b9ab98',fx,0);if(s.mid==='tempohieb')mSpeed(c,X,yy,-Math.PI/2,8,'#ffffff',3)}break}
    case 'body':mSpeed(c,X,Y,a,s.mid==='bodyslam'?18:12,'#ffffff',s.mid==='bodyslam'?6:4);break;
    case 'whip':if(A)mWhip(c,A.x,A.y-10,X,Y,cl,now,k);break;
    case 'wing':{const f=Math.sin(k*Math.PI*2)*3;mBm(c,MBM.wing,X,Y-4-f,cl==='#c8ccd8'?'#e6e8f0':'#ffffff',cl==='#c8ccd8'?'#9aa1bd':'#c8d8ff',fx,0);mBm(c,MBM.wing,X,Y+4+f,cl==='#c8ccd8'?'#e6e8f0':'#ffffff',cl==='#c8ccd8'?'#9aa1bd':'#c8d8ff',fx,1);break}
    case 'peck':{const r=now/30;for(let i=0;i<6;i++){const aa=r+i*1.05,t=i/6;c.fillStyle=i%2?'#ffd96b':'#ffffff';c.fillRect(Math.round(X-Math.cos(a)*t*14+Math.cos(aa)*3*(1-t)),Math.round(Y-Math.sin(a)*t*14+Math.sin(aa)*3*(1-t)),2,2)}
      mLine(c,X,Y,X-Math.cos(a)*6+Math.sin(a)*3,Y-Math.sin(a)*6-Math.cos(a)*3,'#e8a33d',2);mLine(c,X,Y,X-Math.cos(a)*6-Math.sin(a)*3,Y-Math.sin(a)*6+Math.cos(a)*3,'#e8a33d',2);break}
    case 'tail':{if(!A)break;const r=18,a0=a-1.4,a1=a0+2.8*k;for(let t=a0;t<a1;t+=0.12){mLine(c,A.x+Math.cos(t)*r,A.y-8+Math.sin(t)*r*0.7,A.x+Math.cos(t+0.12)*r,A.y-8+Math.sin(t+0.12)*r*0.7,MK,4);mLine(c,A.x+Math.cos(t)*r,A.y-8+Math.sin(t)*r*0.7,A.x+Math.cos(t+0.12)*r,A.y-8+Math.sin(t+0.12)*r*0.7,cl,2)}break}
    case 'spark':for(let i=0;i<3;i++){const aa=a+(i-1)*0.7;mBolt(c,X-Math.cos(aa)*10,Y-Math.sin(aa)*10,X+Math.cos(aa)*4,Y+Math.sin(aa)*4,'#ffe14d',now/60+i)}break;
    case 'splash':for(let i=0;i<7;i++){const aa=a+(i-3)*0.3,d=4+k*10;c.fillStyle=i%2?'#ffffff':'#3d8bf2';c.fillRect(Math.round(X+Math.cos(aa)*d),Math.round(Y+Math.sin(aa)*d-Math.sin(k*Math.PI)*4),2,2)}break;
    case 'crack':mBm(c,MBM.foot,X,Y-12*(1-k),'#c8b89a','#8e7a5a',fx,0);break;
    case 'dive':for(let i=0;i<4;i++){const ox=(i-1.5)*5;mLine(c,X+ox,Y-30+k*10,X+ox,Y-12+k*10,'#ffffff',1)}c.fillStyle=cl;pxEl(c,X,Y,4,3,1);break;
    case 'whirl':{if(!A)break;const r=12+k*10;for(let t=0;t<6.28;t+=0.25){const aa=t+now/50;c.fillStyle=t<3.1?'#ffffff':cl;c.fillRect(Math.round(A.x+Math.cos(aa)*r),Math.round(A.y-8+Math.sin(aa)*r*0.6),2,2)}break}
    case 'throw':case 'snatch':mBm(c,MBM.grab,X,Y,'#f0e6d8','#b9ab98',fx,0);break;
    default:{c.fillStyle='#ffffff';for(let i=-3;i<=3;i++){const aa=a+i*0.25;c.fillRect(Math.round(X+Math.cos(aa)*6)-1,Math.round(Y+Math.sin(aa)*6)-1,2,2)}}}}

// --- impact: a short effect at the target when the hit lands ---
function mfxAdd(s,T){if(!B||!s||!MOVES[s.mid])return;const st=mfxStyle(s.mid);B.mcN=(B.mcN||0)+1;
  (B.mfx=B.mfx||[]).push({st,mid:s.mid,x:T.x,y:T.y-20,a:Math.atan2(s.vy||0,s.vx||1),t0:performance.now(),dur:st==='throw'?700:MFX_BIG[s.mid]?520:380,n:B.mcN,seed:Math.random()*99});
  if(B.mfx.length>14)B.mfx.shift();
  if(MFX_BIG[s.mid])B.shakeUntil=Math.max(B.shakeUntil||0,performance.now()+(s.mid==='geowurf'?120:220))}
function drawMeleeFx(c,now){if(!B||!B.mfx||!B.mfx.length)return;B.mfx=B.mfx.filter(e=>now-e.t0<e.dur);
  for(const e of B.mfx){const k=(now-e.t0)/e.dur,X=e.x,Y=e.y,cl=mfxCol(e.mid),fade=k<0.6?1:1-(k-0.6)/0.4,fx=Math.cos(e.a)<0;c.globalAlpha=Math.max(0,fade);
    switch(e.st){
      case 'claw':{const n=e.mid==='furyswipes'?3:3;mClaw(c,X,Y,e.a,30,cl,Math.min(1,k*4),e.n%2===1&&e.mid!=='scratch',n);if(e.mid==='metalclaw'&&k<0.3)mStar(c,X,Y,6,'#ffffff',6);break}
      case 'jaw':{const R=e.mid==='crunch'?18:13,q=Math.min(1,k*2.6);mJaw(c,X,Y,q,R,e.mid==='crunch'?'#6a4a8a':'#c84a5a');if(q>=1&&k<0.55)mStar(c,X,Y,R,'#ffffff',8);
        if(e.mid==='cinderbite')for(let i=0;i<6;i++){const fy=Y-k*20-(i%3)*3,fxx=X+(i-2.5)*4+Math.sin(now/60+i)*2;c.fillStyle=i%2?'#ffd96b':'#ff5a2a';c.fillRect(Math.round(fxx),Math.round(fy),2,3)}break}
      case 'fist':{const big=e.mid==='dynamopunch',R=(big?10:6)+k*(big?18:8);mStar(c,X,Y,R,big?'#ff8a3d':'#ffd96b',big?12:8);
        if(big){c.strokeStyle='#ffd96b';pxEl(c,X,Y,R*1.2,R*0.8,0);c.strokeStyle='#ffffff';pxEl(c,X,Y,R*0.8,R*0.55,0)}
        if(k<0.35)mBm(c,MBM.fist,X-Math.cos(e.a)*6,Y,'#f0e6d8','#b9ab98',fx,0);break}
      case 'kick':{mStar(c,X,Y,6+k*8,'#ffd96b',8);if(k<0.4)mBm(c,MBM.foot,X-Math.cos(e.a)*6,Y+2,'#f0e6d8','#b9ab98',fx,0);break}
      case 'chop':{const q=Math.min(1,k*4),yy=Y-16+16*q;if(e.mid==='canewhack'){mLine(c,X-8,yy-8,X+8,yy+4,MK,3);mLine(c,X-8,yy-8,X+8,yy+4,'#a8743a',2)}else mBm(c,MBM.hand,X,yy,'#f0e6d8','#b9ab98',fx,0);
        if(q>=1){mLine(c,X-12-k*6,Y+1,X+12+k*6,Y+1,'#ffffff',2);mStar(c,X,Y,5+k*6,'#ffffff',6)}break}
      case 'body':{const big=e.mid==='bodyslam',R=(big?9:6)+k*(big?14:9);mStar(c,X,Y,R,big?'#ffffff':'#ffd96b',big?12:8);if(big||e.mid==='headrush'){c.strokeStyle='#ffffff';pxEl(c,X,Y+10,R*1.3,R*0.45,0)}
        if(e.mid==='headrush'&&k<0.5)for(let i=0;i<3;i++){const aa=now/90+i*2.1;c.fillStyle='#ffe14d';c.fillRect(Math.round(X+Math.cos(aa)*10),Math.round(Y-14+Math.sin(aa)*3),2,2)}break}
      case 'whip':{const q=Math.min(1,k*3);mLine(c,X-16*q,Y-14*q,X+16*q,Y+14*q,cl,3);mLine(c,X+16*q,Y-14*q,X-16*q,Y+14*q,cl,3);if(k<0.4)mStar(c,X,Y,5,'#ffffff',6);break}
      case 'wing':{mStar(c,X,Y,5+k*6,'#ffffff',6);for(let i=0;i<5;i++){const aa=e.seed+i*1.26,d=6+k*18;c.fillStyle=e.mid==='steelwing'?'#c8ccd8':'#ffffff';
        const fxx=X+Math.cos(aa)*d,fyy=Y+Math.sin(aa)*d*0.6+k*10;c.fillRect(Math.round(fxx),Math.round(fyy),3,1);c.fillRect(Math.round(fxx)+1,Math.round(fyy)+1,2,1)}break}
      case 'peck':{for(let i=0;i<4;i++){const t=(k*4-i);if(t<0||t>1.2)continue;const aa=e.seed+i*1.9;mStar(c,X+Math.cos(aa)*6,Y+Math.sin(aa)*5,3+t*3,'#ffffff',6)}
        for(let t=0;t<6.28*1.5;t+=0.3){const r=2+t*1.4*(0.5+k);c.fillStyle='#ffd96b';c.fillRect(Math.round(X+Math.cos(t+now/40)*r),Math.round(Y+Math.sin(t+now/40)*r*0.6),1,1)}break}
      case 'tail':{const r=14,a0=e.a-1.2,a1=a0+2.4*Math.min(1,k*3);for(let t=a0;t<a1;t+=0.12){mLine(c,X-Math.cos(e.a)*8+Math.cos(t)*r,Y+Math.sin(t)*r*0.6,X-Math.cos(e.a)*8+Math.cos(t+0.12)*r,Y+Math.sin(t+0.12)*r*0.6,cl,2)}
        if(k>0.2)mStar(c,X,Y,4+k*8,'#ffffff',8);break}
      case 'spark':{for(let i=0;i<5;i++){const aa=e.seed+i*1.26+k;mBolt(c,X,Y,X+Math.cos(aa)*(10+k*8),Y+Math.sin(aa)*(8+k*6),'#ffe14d',e.seed+i+Math.floor(now/50))}break}
      case 'splash':{for(let i=0;i<12;i++){const aa=-Math.PI/2+(i-5.5)*0.25,v=14+((i*7)%5)*3,yy=Y-Math.sin(aa+Math.PI)*0+(-v*k+30*k*k)*1.2,xx=X+Math.cos(aa)*v*k*1.4;c.fillStyle=i%3?'#3d8bf2':'#ffffff';c.fillRect(Math.round(xx),Math.round(yy),2,2)}
        c.strokeStyle='#ffffff';pxEl(c,X,Y+10,6+k*12,2+k*4,0);break}
      case 'crack':{const gy=Y+12;for(let i=0;i<6;i++){const aa=e.seed+i*1.05;let px=X,py=gy;const L=Math.min(1,k*3)*(10+i%3*5);for(let j=1;j<=3;j++){const nx=X+Math.cos(aa+(j%2?0.25:-0.25))*L*j/3,ny=gy+Math.sin(aa)*L*j/3*0.45;mLine(c,px,py,nx,ny,MK,2);px=nx;py=ny}}
        for(let i=0;i<6;i++){const aa=e.seed*2+i;c.fillStyle='#c8b89a';c.fillRect(Math.round(X+Math.cos(aa)*(6+k*16)),Math.round(gy-k*10-Math.abs(Math.sin(aa))*6),2,2)}break}
      case 'dive':{const R=6+k*12;mStar(c,X,Y,R,'#ffffff',10);c.strokeStyle=cl;pxEl(c,X,Y+10,R*1.4,R*0.45,0);break}
      case 'whirl':{const r=8+k*10;for(let t=0;t<6.28;t+=0.2){const aa=t+k*12;c.fillStyle=t<3.1?'#ffffff':cl;c.fillRect(Math.round(X+Math.cos(aa)*r),Math.round(Y+Math.sin(aa)*r*0.6),2,2)}break}
      case 'throw':{// target is lifted, spun and thrown down (shown as an arc of afterimages and a heavy landing)
        if(k<0.6){const q=k/0.6;for(let i=0;i<5;i++){const t=Math.max(0,q-i*0.06);c.globalAlpha=Math.max(0,0.7-i*0.14);c.fillStyle=i?'#ffffff':cl;pxEl(c,X,Y-Math.sin(t*Math.PI)*34,5-i*0.6,4-i*0.5,1)}c.globalAlpha=1;
          mBm(c,MBM.grab,X,Y-Math.sin(q*Math.PI)*34-8,'#f0e6d8','#b9ab98',0,1)}
        else{const q=(k-0.6)/0.4;mStar(c,X,Y+4,8+q*14,'#ffd96b',12);c.strokeStyle='#ffffff';pxEl(c,X,Y+10,10+q*16,3+q*5,0)}break}
      case 'snatch':{const q=Math.min(1,k*2.2);mBm(c,MBM.grab,X-Math.cos(e.a)*q*14,Y,'#f0e6d8','#b9ab98',fx,0);
        if(k>0.25){const sx=X-Math.cos(e.a)*q*14,sy=Y-8-k*6;c.fillStyle='#ffe14d';c.fillRect(Math.round(sx)-1,Math.round(sy)-3,2,6);c.fillRect(Math.round(sx)-3,Math.round(sy)-1,6,2)}break}
      default:mStar(c,X,Y,4+k*8,'#ffffff',8)}
    c.globalAlpha=1}}

// hook: register the impact on every melee hit (runs on both clients, so the opponent sees it too)
{const _sh=shotHit;shotHit=function(s,T){if(s&&s.mel&&T&&!s.wv)try{mfxAdd(s,T)}catch(e){}return _sh.apply(this,arguments)}}
// draw the impacts on the top layer
{const _da=drawArenaEv;drawArenaEv=function(c,now,top){const r=_da.apply(this,arguments);if(top)try{drawMeleeFx(c,now)}catch(e){}return r}}
