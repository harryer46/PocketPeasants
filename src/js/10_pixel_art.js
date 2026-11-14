/* ===================== PIXEL ART ===================== */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function E(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,Math.PI*2)}
function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath()}
function fs(c,f){c.fillStyle=f;c.fill();c.stroke()}
// vector "blueprint" of every monster; it gets pixelated afterwards
function drawMon(c,sid,x,y,s){
  const sp=SPECIES[sid];const[c1,c2,c3]=sp.c;const f=new Set(sp.f);const form=sp.form;
  c.save();c.translate(x,y);const u=s/100*(sp.sc||1);
  c.lineWidth=Math.max(1.2,2.6*u);c.strokeStyle=c3;c.lineJoin='round';c.lineCap='round';
  const LW=c.lineWidth;const hx=form==='blob'?0:-14*u,hy=form==='blob'?6*u:-12*u,hr=form==='blob'?0:21*u;
  if(f.has('flametail')){c.beginPath();c.moveTo(20*u,22*u);c.quadraticCurveTo(46*u,22*u,40*u,-4*u);c.lineWidth=9*u;c.stroke();c.lineWidth=6*u;c.strokeStyle=c1;c.stroke();c.lineWidth=LW;c.strokeStyle=c3;
    poly(c,[30*u,-2*u,40*u,-30*u,44*u,-14*u,52*u,-24*u,50*u,2*u]);fs(c,'#ffb02e');E(c,42*u,-4*u,5*u,8*u);c.fillStyle='#fff3a3';c.fill()}
  if(f.has('tail')){c.beginPath();c.moveTo(20*u,26*u);c.quadraticCurveTo(50*u,30*u,52*u,6*u);c.lineWidth=11*u;c.stroke();c.lineWidth=7.5*u;c.strokeStyle=c1;c.stroke();c.lineWidth=LW;c.strokeStyle=c3}
  if(f.has('bolttail')){c.beginPath();c.moveTo(22*u,24*u);c.lineTo(34*u,14*u);c.lineTo(28*u,6*u);c.lineTo(42*u,-8*u);c.lineTo(36*u,-14*u);c.lineTo(52*u,-26*u);c.lineWidth=8*u;c.stroke();c.lineWidth=5*u;c.strokeStyle='#ffe14d';c.stroke();c.lineWidth=LW;c.strokeStyle=c3}
  if(f.has('wings')){E(c,20*u,4*u,26*u,13*u,-0.6);fs(c,c1);E(c,20*u,6*u,16*u,7*u,-0.6);c.fillStyle=c2;c.fill()}
  if(f.has('leafback'))for(let i=0;i<3;i++){E(c,(-2+i*13)*u,(-10+i*3)*u,6*u,13*u,0.3+i*0.2);fs(c,'#2f8a3c')}
  if(f.has('fin')){poly(c,[-2*u,-6*u,14*u,-34*u,22*u,0]);fs(c,'#5fb4ff')}
  if(f.has('mane')){c.beginPath();for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=(i%2?20:30)*u;c.lineTo(hx+Math.cos(a)*r+2*u,hy+Math.sin(a)*r)}c.closePath();fs(c,'#ffb02e')}
  if(form==='blob'){
    if(f.has('drop')){c.beginPath();c.moveTo(0,-34*u);c.bezierCurveTo(14*u,-14*u,34*u,4*u,32*u,20*u);c.bezierCurveTo(30*u,44*u,-30*u,44*u,-32*u,20*u);c.bezierCurveTo(-34*u,4*u,-14*u,-14*u,0,-34*u);fs(c,c1)}
    else{E(c,0,14*u,34*u,30*u);fs(c,c1)}
    E(c,0,24*u,19*u,13*u);c.fillStyle=c2;c.fill();E(c,-16*u,40*u,8*u,5*u);fs(c,c1);E(c,16*u,40*u,8*u,5*u);fs(c,c1);
    if(f.has('moss')){c.fillStyle='#3e7a30';for(const[a,b,r]of[[-18,-2,5],[10,-8,6],[20,10,4],[-24,14,3.5]]){E(c,a*u,b*u,r*u,r*u);c.fill()}
      for(const dx of[-10,0,10]){c.beginPath();c.moveTo(dx*u,-14*u);c.lineTo(dx*u,-24*u);c.stroke();E(c,dx*u+3*u,-25*u,4*u,2.5*u,-.4);fs(c,'#8fd46b')}}
    if(f.has('sprout')){c.beginPath();c.moveTo(0,-15*u);c.lineTo(0,-30*u);c.stroke();E(c,-9*u,-32*u,10*u,5*u,0.4);fs(c,'#3fbf4f');E(c,9*u,-34*u,10*u,5*u,-0.4);fs(c,'#3fbf4f')}
  }else if(form==='crab'){
    E(c,0,18*u,38*u,22*u);fs(c,c1);E(c,0,24*u,22*u,11*u);c.fillStyle=c2;c.fill();
    for(const s of[-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(s*24*u,(28+i*4)*u);c.lineTo(s*(40+i*2)*u,(40+i*2)*u);c.stroke()}
    for(const s of[-1,1]){c.beginPath();c.moveTo(s*30*u,10*u);c.lineTo(s*44*u,-6*u);c.stroke();E(c,s*48*u,-14*u,12*u,10*u);fs(c,c1)}
    for(const[a,b]of[[-14,0],[4,-4],[18,2]]){poly(c,[a*u,b*u,(a+8)*u,(b-8)*u,(a+14)*u,b*u,(a+8)*u,(b+4)*u]);fs(c,'#9aa0a6')}
    for(const s of[-1,1]){c.beginPath();c.moveTo(s*8*u,2*u);c.lineTo(s*10*u,-12*u);c.stroke()}
  }else if(form==='bug'){
    E(c,6*u,18*u,32*u,24*u);fs(c,c1);c.beginPath();c.moveTo(6*u,-6*u);c.lineTo(6*u,42*u);c.stroke();
    c.fillStyle='#2b0805';for(const[a,b]of[[-8,8],[18,6],[-4,26],[22,26]]){E(c,a*u,b*u,4.5*u,4.5*u);c.fill()}
    for(let i=0;i<3;i++){c.beginPath();c.moveTo((-12+i*14)*u,38*u);c.lineTo((-16+i*14)*u,46*u);c.stroke()}
  }else{
    E(c,6*u,20*u,form==='bird'?24*u:30*u,form==='bird'?22*u:20*u);fs(c,c1);E(c,0,26*u,15*u,11*u);c.fillStyle=c2;c.fill();
    if(form==='quad'){for(const dx of[-14,-2,14,24]){E(c,dx*u,38*u,6*u,7*u);fs(c,c1)}}
    else{c.strokeStyle='#e6a21a';for(const dx of[-6,8]){c.beginPath();c.moveTo(dx*u,40*u);c.lineTo(dx*u,46*u);c.stroke()}c.strokeStyle=c3}
  }
  if(form==='quad'||form==='bird'||form==='bug'){
    const bx=form==='bug'?-22*u:hx,by=form==='bug'?10*u:hy,br=form==='bug'?14*u:hr;
    if(f.has('ears'))for(const s of[-1,1]){poly(c,[bx+s*6*u,by-14*u,bx+s*16*u,by-40*u,bx+s*20*u,by-8*u]);fs(c,c1);poly(c,[bx+s*9*u,by-14*u,bx+s*15*u,by-31*u,bx+s*17*u,by-11*u]);c.fillStyle=c2;c.fill()}
    if(f.has('roundears'))for(const s of[-1,1]){E(c,bx+s*15*u,by-16*u,10*u,10*u);fs(c,c1);E(c,bx+s*15*u,by-16*u,5*u,5*u);c.fillStyle=c2;c.fill()}
    if(f.has('antenna'))for(const s of[-1,1]){c.beginPath();c.moveTo(bx+s*5*u,by-10*u);c.quadraticCurveTo(bx+s*8*u,by-30*u,bx+s*16*u,by-32*u);c.stroke();E(c,bx+s*16*u,by-32*u,4*u,4*u);fs(c,'#ffb02e')}
    if(f.has('crest')){poly(c,[bx-6*u,by-18*u,bx-2*u,by-38*u,bx+4*u,by-20*u,bx+10*u,by-34*u,bx+12*u,by-16*u]);fs(c,'#ffd23f')}
    if(f.has('tuft'))for(const dx of[-6,0,6]){c.beginPath();c.moveTo(bx+dx*u,by-18*u);c.quadraticCurveTo(bx+(dx-4)*u,by-30*u,bx+(dx+4)*u,by-32*u);c.stroke()}
    E(c,bx,by,br,br*0.95);fs(c,c1);
    if(form==='bird'){poly(c,[bx-br+2*u,by-2*u,bx-br-12*u,by+4*u,bx-br+2*u,by+8*u]);fs(c,'#ffb02e')}
    if(form==='quad'){E(c,bx-6*u,by+8*u,9*u,6*u);c.fillStyle=c2;c.fill();E(c,bx-13*u,by+5*u,3*u,2.4*u);c.fillStyle=c3;c.fill()}
    if(f.has('whiskers')){c.lineWidth=Math.max(1,1.4*u);for(const dy of[-2,4]){c.beginPath();c.moveTo(bx-12*u,by+(6+dy*.4)*u);c.lineTo(bx-30*u,by+(4+dy)*u);c.stroke()}c.lineWidth=LW}
    eyes(c,bx-6*u,by-3*u,u,form==='bug'?.8:1.1);
  }else if(form==='blob')eyes(c,-2*u,8*u,u,1.3);else eyes(c,0,-14*u,u,1.1,20);
  c.restore();
}
function eyes(c,x,y,u,k,gap){const g=(gap||15)*u;for(const s of[-1,1]){E(c,x+s*g/2,y,6*u*k,7*u*k);c.fillStyle='#ffffff';c.fill();E(c,x+s*g/2-1.5*u,y+0.8*u,3.6*u*k,4.6*u*k);c.fillStyle='#141414';c.fill()}}
const EXTRA=['#ffb02e','#fff3a3','#ffe14d','#2f8a3c','#3fbf4f','#9aa0a6','#ffd23f','#3e7a30','#8fd46b','#e6a21a','#5fb4ff','#2b0805','#ffffff','#141414'];
const SPR={};
// render the blueprint small, then snap to a hard palette with a 1px outline -> real pixel art
function monSprite(sid,N){
  const key=sid+':'+N;if(SPR[key])return SPR[key];
  if(SPECIES[sid].img)return imgSprite(sid,N,key);
  const big=mk(N*4,N*4),bx=big.getContext('2d');drawMon(bx,sid,N*2,N*2,N*4*0.74);
  const c=mk(N,N),x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(big,0,0,N,N);
  const sp=SPECIES[sid];const pal=[...sp.c,...EXTRA].map(hex2rgb);const dark=hex2rgb(sp.c[2]);
  const id=x.getImageData(0,0,N,N),d=id.data,op=new Uint8Array(N*N);
  for(let i=0;i<N*N;i++){if(d[i*4+3]>105){op[i]=1;let best=0,bd=1e9;for(let j=0;j<pal.length;j++){const p=pal[j];const dd=(p[0]-d[i*4])**2+(p[1]-d[i*4+1])**2+(p[2]-d[i*4+2])**2;if(dd<bd){bd=dd;best=j}}const p=pal[best];d[i*4]=p[0];d[i*4+1]=p[1];d[i*4+2]=p[2];d[i*4+3]=255}else d[i*4+3]=0}
  shadePixels(d,op,N,N,dark);
  x.putImageData(id,0,0);SPR[key]=c;return c;
}
// artwork → our pixel style: downscale, snap to the monster's own palette, then the same GBA shading/outline as all monsters
function imgSprite(sid,N,key){
  const sp=SPECIES[sid],im=ALT_IM[imgKey(sid)],S=Math.round(N*64/24),c=mk(S,S);if(!im||!im.complete||!im.naturalWidth)return c;
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;const w=im.naturalWidth,h=im.naturalHeight,k=Math.min((S-2)/w,(S-2)/h)>=1?Math.max(1,Math.floor(Math.min((S-2)/w,(S-2)/h))):Math.min((S-2)/w,(S-2)/h);
  const dx=Math.round((S-w*k)/2),dy=Math.round(S-h*k-1);
  if(sp.mega){const t=mk(S,S),tx=t.getContext('2d');tx.imageSmoothingEnabled=false;tx.drawImage(im,dx,dy,w*k,h*k);tx.globalCompositeOperation='source-in';tx.fillStyle='#ffd23f';tx.fillRect(0,0,S,S);
    for(const[ox,oy]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])x.drawImage(t,ox,oy);x.globalCompositeOperation='source-over'}
  x.drawImage(im,dx,dy,w*k,h*k);SPR[key]=c;return c;
}

// GBA-style shading: light from top-left -> highlight rim, shadow on bottom-right, selective (colored) outline
// per-species idle animation (alternative set); classic monsters keep the soft breathing
function idleAnim(an,t){const S=Math.sin,b=S(t*4.5);let sx=1-b*0.025,sy=1+b*0.04,rot=0,ox=0,oy=0;
  switch(an){
   case'flap':{const f=S(t*7);oy=-Math.abs(f)*3-1;sy=1+f*0.06;sx=1-f*0.04;break}            // owl: hovers with wing beats
   case'peck':{const p=Math.max(0,S(t*3.2))**6;rot=-p*0.22;ox=-p*2;sy=1+S(t*6.4)*0.03;sx=1;break} // rooster: proud head bobs / pecks
   case'sniff':{const h=Math.abs(S(t*6));oy=-h*h*2.5;sx=1+S(t*12)*0.02;sy=1-S(t*12)*0.02;break} // marten: twitchy little hops
   case'wobble':rot=S(t*2.2)*0.07;ox=S(t*2.2)*1.5;sy=1+S(t*4.4)*0.02;sx=1;break             // pensioner: unsteady sway
   case'rock':{const q=(t%3.4)<0.25?S(t*60)*0.6:0;ox=q;sx=1+b*0.01;sy=1-b*0.01;break}       // stone: still, grumbles now and then
   case'jelly':sx=1+S(t*5)*0.07;sy=1-S(t*5)*0.07;break                                    // mushroom: squishy
   case'sway':rot=S(t*1.8)*0.06;sy=1+S(t*3.6)*0.03;sx=1-S(t*3.6)*0.015;break              // plant: rustles in the wind
   case'flex':{const f=Math.max(0,S(t*2.6))**4;sx=1+f*0.09;sy=1+f*0.05;oy=-f*1;break}      // pill: flexes the muscles
   case'squirm':sx=1+S(t*3.1)*0.05;sy=1+S(t*3.9+1)*0.05;rot=S(t*2.3)*0.04;oy=-Math.abs(S(t*1.5))*2;break // noodles wriggle and float
   case'tank':{const r=S(t*3);oy=-Math.max(0,r)*1;sx=1+Math.abs(r)*0.02;sy=1-Math.abs(r)*0.02;break} // heavy armour: slow stomp
   case'float':oy=-4-S(t*2)*3;rot=S(t*1.3)*0.05;sx=1;sy=1;break                            // book: hovers ominously
  }
  return{sx,sy,rot,ox,oy}}
function shadePixels(d,op,W,H,dark){
  const at=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&op[y*W+x];const src=new Uint8ClampedArray(d);
  const isNeutral=i=>{const r=src[i],g=src[i+1],b=src[i+2];return(r>235&&g>235&&b>235)||(r<35&&g<35&&b<35)};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(!op[y*W+x]||isNeutral(i))continue;
    let k=0;if(!at(x-1,y-1)||!at(x,y-2)||!at(x-2,y))k=0.22;else if(!at(x+1,y+1)||!at(x,y+2)||!at(x+2,y+1))k=-0.24;else if(!at(x+2,y+3)||!at(x+3,y+2))k=-0.1;
    if(k>0)for(let j=0;j<3;j++)d[i+j]=src[i+j]+(255-src[i+j])*k;else if(k<0)for(let j=0;j<3;j++)d[i+j]=src[i+j]*(1+k)}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(op[i])continue;let n=-1;
    if(at(x,y-1))n=(y-1)*W+x;else if(at(x-1,y))n=i-1;else if(at(x+1,y))n=i+1;else if(at(x,y+1))n=(y+1)*W+x;if(n<0)continue;
    const below=at(x,y-1);const f=below?0.32:0.45;
    d[i*4]=Math.min(src[n*4]*f,dark?dark[0]+30:255);d[i*4+1]=Math.min(src[n*4+1]*f,dark?dark[1]+30:255);d[i*4+2]=Math.min(src[n*4+2]*f+8,dark?dark[2]+40:255);d[i*4+3]=255}
}
// police officer sprites (player and cops; the chosen colour is the cap band) 14x15 + outline
const CH={
 down:["....NNNNNN....","...NNNYYNNN...","..NNNNYYNNNN..","..CCCCCCCCCC..","..VVVVVVVVVV..","..KSSSSSSSSK..","..SSESSSSESS..","...SSSSSSSS...","..UUUUUUUUUU..",".SUUUUUUUYUUS.",".SUUUUUUUUUUS.","..BBBBBYBBBB..","...PPPPPPPP...","...PPP..PPP...","...BBB..BBB..."],
 up:["....NNNNNN....","...NNNNNNNN...","..NNNNNNNNNN..","..CCCCCCCCCC..","..NNNNNNNNNN..","..KKKKKKKKKK..","..KKKKKKKKKK..","...KKKKKKKK...","..UUUUUUUUUU..",".SUUUUUUUUUUS.",".SUUUUUUUUUUS.","..BBBBBBBBBB..","...PPPPPPPP...","...PPP..PPP...","...BBB..BBB..."],
 side:["....NNNNNN....","...NNNNNNYN...","..NNNNNNNNNN..","..CCCCCCCCCC..","..NNNNNNVVVVVV","..KKKSSSSSSS..","..KKSSSSSESS..","...SSSSSSSS...","...UUUUUUUU...","...UUUUUUYU...","...USSUUUUU...","...BBBBBBBB...","....PPPPPP....","....PPPPPP....","....BBBBBB...."]
};
const CHS={};
// trainer looks (Wasserschutz, SEK, Ausbilder, Hubschrauber, Einsatzhundertschaft, Kripo, Bezirksdienst, Hausmeister, Lehrer) — 4 directions each
//@inc js/data/trainer_small.js
const TRL={};for(const k in TRL_SRC){const im=new Image();im.src=TRL_SRC[k];TRL[k]=im}
const TR_LOOK={ben:'bezirk',lina:'kripo',gwen:'ausb',rita:'ehu',hank:'sek',sue:'wsp',axel:'heli'};
function trainerImg(t,dir){const lk=TR_LOOK[t.id]||(/^toll/.test(t.id)?'lehrer':null);if(!lk)return null;const im=TRL[lk+'_'+(dir||'down')];return im&&im.complete&&im.naturalWidth?im:null}
// detailed versions for the VS intro (large display)
//@inc js/data/trainer_big.js
const TRLB={};for(const k in TRLB_SRC){const im=new Image();im.src=TRLB_SRC[k];TRLB[k]=im}
function trainerBig(t,dir){const lk=TR_LOOK[t.id]||(/^toll/.test(t.id)?'lehrer':null);if(!lk)return null;const im=TRLB[lk+'_'+(dir||'down')];return im&&im.complete&&im.naturalWidth?im:null}
//@inc js/data/cop_big.js
const COPBPAL={O:'#14141c',W:'#f4f4f0',w:'#c9cbd3',N:'#26305a',n:'#171d38',S:'#f6c89c',s:'#d6986e',G:'#e8b428',H:'#2a2220',h:'#7a4a2c',g:'#5f6470',L:'#d8dce4'};const CBS={};
function copBig(col,dir,sx){sx=sx==='f'?'f':'m';const k=col+dir+sx;if(CBS[k])return CBS[k];const rows=COPBIG[sx+'_'+dir]||COPBIG[sx+'_down'];const c=mk(18,28),x=c.getContext('2d');
  rows.forEach((r,y)=>[...r].forEach((ch,xx)=>{const v=ch==='C'?col:COPBPAL[ch];if(v){x.fillStyle=v;x.fillRect(xx,y,1,1)}}));return CBS[k]=c}
// police officers (Beamter / Beamtin), same scale as the old characters (16×19 canvas); the cap band takes the player's colour
//@inc js/data/cop_small.js
const COPIMG={};for(const k in COP_SRC){const im=new Image();im.onload=()=>{for(const q in CHS)delete CHS[q]};im.src=COP_SRC[k];COPIMG[k]=im}
function charSprite(col,dir,fr,sx){
  sx=sx==='f'?'f':'m';if(!COPIMG[sx+'_'+dir])dir='down';const key=col+dir+fr+sx;if(CHS[key])return CHS[key];
  const im=COPIMG[sx+'_'+dir],c=mk(16,19),x=c.getContext('2d');if(!im.complete||!im.naturalWidth)return c;
  const w=im.naturalWidth,h=im.naturalHeight,ox=Math.round((16-w)/2),oy=19-h;x.drawImage(im,ox,oy);
  const id=x.getImageData(0,0,16,19),d=id.data,at=(X,Y)=>(Y*16+X)*4;
  // cap band: first dark-blue pixels right below the white cap
  const cr=parseInt(col.slice(1,3),16),cg=parseInt(col.slice(3,5),16),cb=parseInt(col.slice(5,7),16);
  for(let X=0;X<16;X++){let white=false,n=0;for(let Y=0;Y<8;Y++){const o=at(X,Y);if(!d[o+3])continue;const r=d[o],g=d[o+1],b=d[o+2];
    if(r>190&&g>190&&b>190){white=true;continue}if(white&&b>r+12&&r+g+b<330&&n<1){d[o]=cr;d[o+1]=cg;d[o+2]=cb;n++;continue}if(white)break}}
  // walk cycle on the bottom rows
  if(fr){const src=new Uint8ClampedArray(d),side=dir==='left'||dir==='right';
    for(let Y=15;Y<19;Y++)for(let X=0;X<16;X++){const o=at(X,Y);let sX=X,sY=Y;
      if(side){if(Y>=16)sX=X+(fr===1?-1:1)*(X<8?1:-1)}else{const lift=(fr===1?X<8:X>=8);if(lift)sY=Y+1}
      if(sX<0||sX>15||sY>18){d[o+3]=0;continue}const q=at(sX,sY);d[o]=src[q];d[o+1]=src[q+1];d[o+2]=src[q+2];d[o+3]=src[q+3]}}
  x.putImageData(id,0,0);CHS[key]=c;return c;
}
// tiles
const TILE={};
function tileCanvas(fn){const c=mk(16,16);const x=c.getContext('2d');fn(x);return c}
function P1(x,a,b,col){x.fillStyle=col;x.fillRect(a,b,1,1)}
function grassBase(x,v){x.fillStyle='#5cb848';x.fillRect(0,0,16,16);const r=mulberry32(v*31+7);for(let i=0;i<7;i++)P1(x,Math.floor(r()*16),Math.floor(r()*16),'#4ea53c');for(let i=0;i<3;i++){const a=Math.floor(r()*15),b=Math.floor(r()*15);P1(x,a,b,'#73cf5c');P1(x,a,b+1,'#4ea53c')}}
const TREE=["....GGGGGGG.....","..GGGLLGGGGGG...",".GGLLLGGGGGGGG..",".GGLLGGGGGGGGGG.","GGGGGGGGGGGDGGG.","GGGGGGGGGGDDGGGG","GGGGGGGGGDDGGGGG",".GGGGGGGDDGGGGG.",".GGDGGGGGGGGGDG.","..GGDDGGGGGDDG..","...GGGGGGGGGG...",".....DTTTTD.....","......TTTT......","......TTTT......",".....TTTTTT.....","................"];
function buildTiles(){
  TILE[0]=[0,1,2,3].map(v=>tileCanvas(x=>grassBase(x,v)));
  TILE[1]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+90);for(let i=0;i<6;i++){const a=1+i*2.6+Math.floor(r()*2),h=6+Math.floor(r()*6);x.fillStyle='#1f4f18';x.fillRect(a,16-h,2,h);x.fillStyle='#3f8a2c';x.fillRect(a,16-h+1,1,h-1);x.fillStyle='#7cc24a';x.fillRect(a,16-h,1,2);x.fillStyle='#2a6420';x.fillRect(a+1,16-h+2,1,1)}}));
  TILE[2]=[0,1].map(v=>tileCanvas(x=>{grassBase(x,v+5);const pal={G:'#2e8b3a',L:'#5cc05c',D:'#1d6428',T:'#7a4a24'};TREE.forEach((r,y)=>[...r].forEach((ch,xx)=>{if(pal[ch])P1(x,xx,y,pal[ch])}))}));
  TILE[3]=[0,1].map(fr=>tileCanvas(x=>{x.fillStyle='#3b8fd9';x.fillRect(0,0,16,16);x.fillStyle='#6db6f0';for(const[a,b]of[[2,4],[9,10],[11,2]]){x.fillRect((a+fr*2)%16,b,4,1)}x.fillStyle='#2f7cc2';x.fillRect((6+fr*3)%16,7,3,1)}));
  TILE[4]=[0,1].map(v=>tileCanvas(x=>{x.fillStyle='#d8bd84';x.fillRect(0,0,16,16);const r=mulberry32(v+40);for(let i=0;i<5;i++)P1(x,Math.floor(r()*16),Math.floor(r()*16),i%2?'#c2a56c':'#e8d3a3')}));
  TILE[5]=[0,1].map(v=>tileCanvas(x=>{x.fillStyle='#ecd79a';x.fillRect(0,0,16,16);const r=mulberry32(v+60);for(let i=0;i<6;i++)P1(x,Math.floor(r()*16),Math.floor(r()*16),'#d6bf80')}));
  TILE[8]=[tileCanvas(x=>{x.fillStyle='#d23b3b';x.fillRect(0,0,16,16);x.fillStyle='#a92b2b';for(let y=3;y<16;y+=4)x.fillRect(0,y,16,1);x.fillStyle='#e85c5c';for(let y=0;y<16;y+=4)x.fillRect(0,y,16,1)})];
  TILE[10]=[tileCanvas(x=>{x.fillStyle='#5b4bc4';x.fillRect(0,0,16,16);x.fillStyle='#463a9c';for(let y=3;y<16;y+=4)x.fillRect(0,y,16,1);x.fillStyle='#7a6ae0';for(let y=0;y<16;y+=4)x.fillRect(0,y,16,1)})];
  const wall=(x,base,line)=>{x.fillStyle=base;x.fillRect(0,0,16,16);x.fillStyle=line;x.fillRect(0,14,16,2)};
  TILE[6]=[tileCanvas(x=>wall(x,'#efe8dc','#bfb6a2')),tileCanvas(x=>{wall(x,'#efe8dc','#bfb6a2');x.fillStyle='#3c3c4c';x.fillRect(3,3,10,8);x.fillStyle='#8fd0ff';x.fillRect(4,4,8,6);x.fillStyle='#c8ecff';x.fillRect(4,4,3,2)})];
  TILE[11]=[tileCanvas(x=>{wall(x,'#a9a9bd','#77778c');x.fillStyle='#8e8ea3';for(let y=0;y<14;y+=4){x.fillRect(0,y,16,1);x.fillRect((y%8)?4:12,y,1,4)}}),tileCanvas(x=>{wall(x,'#a9a9bd','#77778c');x.fillStyle='#ffcb3d';x.fillRect(5,3,6,6);x.fillStyle='#9a5b00';x.fillRect(7,5,2,2)})];
  TILE[7]=[tileCanvas(x=>{wall(x,'#efe8dc','#bfb6a2');x.fillStyle='#3a2210';x.fillRect(2,1,12,15);x.fillStyle='#7c4a22';x.fillRect(3,2,10,14);x.fillStyle='#9a5d2c';x.fillRect(3,2,1,14);x.fillStyle='#ffd23f';x.fillRect(11,9,1,1)})];
  TILE[20]=[0,1,2].map(v=>tileCanvas(x=>{x.fillStyle='#7d818c';x.fillRect(0,0,16,16);x.fillStyle='#8e929c';x.fillRect(1,1,7,7);x.fillRect(9,1,6,7);x.fillRect(1,9,7,6);x.fillRect(9,9,6,6);x.fillStyle='#5d616b';x.fillRect(0,8,16,1);x.fillRect(8,0,1,16);if(v===1){x.fillStyle='#6a6e78';x.fillRect(3,3,2,1);x.fillRect(11,12,3,1)}if(v===2){x.fillStyle='#a3a7b0';x.fillRect(2,10,1,1);x.fillRect(12,3,1,1)}}));
  TILE[12]=[tileCanvas(x=>{wall(x,'#a9a9bd','#77778c');x.fillStyle='#1b1430';x.fillRect(0,1,16,15);x.fillStyle='#2d2350';x.fillRect(1,2,14,14)})];
  TILE[13]=[tileCanvas(x=>{x.fillStyle='#cfc8ae';x.fillRect(0,0,16,16);x.fillStyle='#b5ad90';x.fillRect(0,0,16,1);x.fillRect(0,0,1,16);x.fillStyle='#e6dfc6';x.fillRect(15,0,1,16);x.fillRect(0,15,16,1);x.fillStyle='#d9a90b';x.fillRect(7,7,2,2)})];
  TILE[14]=[0,1,2].map(v=>tileCanvas(x=>{x.fillStyle='#3f8f3a';x.fillRect(0,0,16,16);const r=mulberry32(v+300);for(let i=0;i<7;i++)P1(x,Math.floor(r()*16),Math.floor(r()*16),i%3?'#357a31':'#4fa046')}));
  TILE[15]=[0,1,2].map(v=>tileCanvas(x=>{x.fillStyle='#c4a374';x.fillRect(0,0,16,16);const r=mulberry32(v+310);for(let i=0;i<7;i++){const a=Math.floor(r()*15),b=Math.floor(r()*15);P1(x,a,b,i%2?'#a8875a':'#d8bd8c');if(i%3===0)P1(x,a+1,b,'#a8875a')}}));
  TILE[16]=[0,1].map(v=>tileCanvas(x=>{x.fillStyle='#c4a374';x.fillRect(0,0,16,16);x.fillStyle='#4a443c';x.fillRect(2,5,12,10);x.fillRect(3,4,10,1);x.fillRect(1,7,1,7);x.fillRect(14,7,1,7);x.fillStyle='#8a8478';x.fillRect(3,5,10,9);x.fillStyle='#a7a196';x.fillRect(4,6,5,3);x.fillStyle='#6d675d';x.fillRect(3,12,10,2);if(v){x.fillStyle='#6d675d';x.fillRect(9,7,1,4)}}));
  TILE[17]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+320);for(let i=0;i<4;i++){const a=1+i*4,h=7+Math.floor(r()*5);x.fillStyle='#123a12';x.fillRect(a,16-h,1,h);for(let k=0;k<h-1;k+=2){x.fillStyle=k%4?'#2e6a24':'#4a8c34';x.fillRect(a-1-(k%4?1:0),16-h+k+1,1+(k%4?1:0),1);x.fillRect(a+1,16-h+k+1,1+(k%4?0:1),1)}x.fillStyle='#6fb04a';x.fillRect(a,16-h,1,1)}}));
  TILE[18]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+330);for(let i=0;i<6;i++){const a=1+i*2.5+Math.floor(r()*2),h=8+Math.floor(r()*6);x.fillStyle='#4f7a28';x.fillRect(a,16-h,1,h);x.fillStyle='#7fa83f';x.fillRect(a,16-h+2,1,h-3);if(i%2){x.fillStyle='#6a4420';x.fillRect(a,16-h-1,1,3);x.fillStyle='#8a5a2a';x.fillRect(a,16-h-1,1,1)}}}));
  TILE[19]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+340);for(let i=0;i<6;i++){const a=Math.floor(r()*13),b=6+Math.floor(r()*8);x.fillStyle='#4f4a42';x.fillRect(a,b,3,2);x.fillStyle='#8a8478';x.fillRect(a,b,2,1);x.fillStyle='#a7a196';x.fillRect(a,b,1,1)}for(let i=0;i<4;i++){const a=1+i*4,h=5+Math.floor(r()*4);x.fillStyle='#8a7a3a';x.fillRect(a,16-h,1,h);x.fillStyle='#b8a456';x.fillRect(a+1,16-h+2,1,h-2)}}));
  TILE[9]=[0,1,2].map(v=>tileCanvas(x=>{grassBase(x,v+12);const r=mulberry32(v+77);const cols=['#ffffff','#ffd84a','#ff7aa8'];for(let i=0;i<3;i++){const a=2+Math.floor(r()*11),b=2+Math.floor(r()*11),col=cols[i%3];P1(x,a,b-1,col);P1(x,a-1,b,col);P1(x,a+1,b,col);P1(x,a,b+1,col);P1(x,a,b,'#ffb02e')}}));
}
buildTiles();
function noise2(seed,cell,w,h){const r=mulberry32(seed),gw=Math.ceil(w/cell)+2,gh=Math.ceil(h/cell)+2,G=new Float32Array(gw*gh);for(let i=0;i<G.length;i++)G[i]=r();
  return(x,y)=>{const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),g=(a,b)=>G[b*gw+a];
    return(g(ix,iy)*(1-sx)+g(ix+1,iy)*sx)*(1-sy)+(g(ix,iy+1)*(1-sx)+g(ix+1,iy+1)*sx)*sy}}
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>v/16-0.5);
const PAL={
 meadow:['#3f7a26','#4f8f2e','#5fa236','#72b43f','#86c450'],forest:['#22481a','#2c5a20','#376b27','#437c2e','#548f37'],
 shore:['#4c8a30','#5c9a38','#6cad41','#7fbf4c','#93cf5a'],hills:['#6f6f30','#83803a','#979344','#aca650','#c0b860'],
 dirt:['#8e6338','#a5784a','#b98c57','#cca067','#dcb57a'],sand:['#cdb27a','#d9c08a','#e4cd98','#eedaa6','#f6e6b8'],
 water:['#255da6','#2f6fb8','#3b82c8','#4a95d6','#5fa8e0'],stone:['#8f8872','#a69f88','#bdb59c','#d2cab0','#e6dfc6'],
 leaf:['#173d16','#21521d','#2c6826','#3b8030','#56993c','#76b24c'],leafF:['#10300f','#183f15','#22521d','#2e6626','#3e7c30','#549439'],
 rock:['#4f4a42','#6a645a','#857e72','#a19a8c','#bdb6a6'],moss:['#3f7a26','#5c9a38','#7fbf4c']};
const RGB={};for(const k in PAL)RGB[k]=PAL[k].map(hex2rgb);
let WORLD=null,CANOPY=null;
let BAKE=null,BAKE_FAIL=false;
function bakeWorld(){try{const it=bakeWorldGen();let r;do{r=it.next()}while(!r.done)}catch(e){BAKE_FAIL=true;showErr('Karte: '+e.message)}}
// baked in slices so phones never freeze; progress shown on the start screen
function bakeTick(){if(WORLD||BAKE_FAIL)return;try{if(!BAKE)BAKE=bakeWorldGen();const t0=performance.now();let r;do{r=BAKE.next()}while(!r.done&&performance.now()-t0<12);
  const lb=document.querySelector('#loadbar i');if(lb)lb.style.width=Math.round((r.done?1:r.value||0)*100)+'%';if(r.done){BAKE=null;const L=$('#loadbar');if(L)L.style.display='none'}}
  catch(e){BAKE_FAIL=true;BAKE=null;showErr('Karte: '+e.message);const L=$('#loadbar');if(L)L.style.display='none'}}
function* bakeWorldGen(){
  const W=MW*16,H=MH*16;const g=mk(W,H),gc=g.getContext('2d'),id=gc.createImageData(W,H),d=id.data;
  const nL=noise2(101,46,W,H),nS=noise2(202,13,W,H),nD=noise2(303,22,W,H),jx=noise2(404,9,W,H),jy=noise2(505,9,W,H),nW=noise2(606,30,W,H);
  const T=(x,y)=>tget(Math.floor(x/16),Math.floor(y/16));
  for(let py=0;py<H;py++){if((py&7)===0)yield py/H*0.9;for(let px=0;px<W;px++){
    const ox=(jx(px,py)-0.5)*7,oy=(jy(px,py)-0.5)*7;let t=T(px+ox,py+oy);const t0=T(px,py);
    if(t0===6||t0===7||t0===8||t0===10||t0===11||t0===12||t0===20||t0>=21&&t0<=23)t=t0;
    const tx=clamp(Math.floor((px+ox)/16),0,MW-1),ty=clamp(Math.floor((py+oy)/16),0,MH-1),b=BIOME[ty*MW+tx];
    const dth=BAYER[(py&3)*4+(px&3)]*0.22;let v=nL(px,py)*0.62+nS(px,py)*0.38+dth;let pal;
    if(t===3){pal=RGB.water;v=nW(px,py+((px*7)%3))*0.7+0.15+dth;
      const nearLand=[[-2,0],[2,0],[0,-2],[0,2]].some(([a,c])=>T(px+a+ox*0.3,py+c+oy*0.3)!==3);if(nearLand){const o=(py*W+px)*4;d[o]=200;d[o+1]=232;d[o+2]=245;d[o+3]=255;continue}}
    else if(t===5)pal=RGB.sand;else if(t===18)pal=nD(px,py)>0.5?RGB.sand:RGB.shore;
    else if(t===4||t===7||t===12)pal=RGB.dirt;else if(t===13||t===20)pal=RGB.stone;
    else{pal=b===2?RGB.forest:b===3?RGB.shore:b===4?RGB.hills:RGB.meadow;
      if(t===1||t===17)v-=0.18;
      if((b===4&&nD(px,py)>0.52)||((b<=1||b===3)&&nD(px,py)>0.74&&t!==1&&t!==17)||(t===19&&nD(px,py)>0.4))pal=RGB.dirt;}
    const k=clamp(Math.floor(v*pal.length),0,pal.length-1),c=pal[k],o=(py*W+px)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}}
  gc.putImageData(id,0,0);yield 0.92;
  const r=mulberry32(777);
  // buildings / doors keep their tiles; soft shadow under buildings
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tget(x,y);if([6,7,8,10,11,12,20].includes(t)){const arr=TILE[t];let v=t===6?((y===19&&x!==25)?1:0):t===11?((x===34||x===37)&&y===19?1:0):0;gc.drawImage(arr[Math.min(v,arr.length-1)],x*16,y*16)}}
  gc.fillStyle='rgba(20,30,10,0.28)';gc.fillRect(22*16,21*16,6*16,4);gc.fillRect(33*16,21*16,6*16,4);
  gc.drawImage(g,22*16,13*16,96,64,22*16,17*16,96,64);gc.drawImage(dienstSprite(),22*16,17*16);
  for(const Bd of BLDG){gc.fillStyle='rgba(20,30,10,0.28)';gc.fillRect(Bd.x*16,(Bd.y+Bd.h)*16,Bd.w*16,4);gc.drawImage(Bd.id==='shop'?shopSprite():hfpolSprite(),Bd.x*16,Bd.y*16)}
  // ground details: tufts, flowers, pebbles
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tget(x,y),b=BIOME[y*MW+x];
    if(t===0||t===14||t===15){const n=1+Math.floor(r()*3);for(let i=0;i<n;i++){const X=x*16+Math.floor(r()*14)+1,Y=y*16+Math.floor(r()*13)+2;gc.fillStyle=b===2?'#1d4416':b===4?'#6a6a2a':'#3a7424';gc.fillRect(X,Y,1,2);gc.fillRect(X-1,Y,1,1);gc.fillRect(X+1,Y-1,1,2);if(r()<0.4){gc.fillStyle=b===2?'#5c9a3a':'#9ad25a';gc.fillRect(X+1,Y-1,1,1)}}}
    if(t===9||(t===0&&b<=1&&r()<0.12)){const cols=['#ffffff','#ffe36b','#ff8fb3','#c9b6ff'];for(let i=0;i<(t===9?4:1);i++){const X=x*16+2+Math.floor(r()*12),Y=y*16+2+Math.floor(r()*12),col=cols[Math.floor(r()*cols.length)];gc.fillStyle='#2f6a20';gc.fillRect(X,Y+1,1,2);gc.fillStyle=col;gc.fillRect(X-1,Y,3,1);gc.fillRect(X,Y-1,1,3);gc.fillStyle='#ffcb3d';gc.fillRect(X,Y,1,1)}}
    if((t===4||t===5||t===15)&&r()<0.5){gc.fillStyle=t===5?'#c2a56c':'#8a6a44';gc.fillRect(x*16+Math.floor(r()*14),y*16+Math.floor(r()*14),2,1)}}
  // encounter vegetation
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=tget(x,y);if(ENC.has(t))gc.drawImage(TILE[t][(x*7+y*3)%TILE[t].length],x*16,y*16)}
  // rocks
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tget(x,y)===16)paintRock(gc,x*16+8,y*16+10,7+Math.floor(r()*2),r);
  // trees: shadow + trunk on ground, canopy on its own layer (drawn above players)
  const cv=mk(W,H),cc=cv.getContext('2d'),cid=cc.createImageData(W,H);
  const trees=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(tget(x,y)===2)trees.push([x,y]);
  for(const[x,y]of trees){gc.fillStyle='rgba(10,25,8,0.32)';gc.beginPath();gc.ellipse(x*16+10,y*16+14,10,5,0,0,7);gc.fill();
    gc.fillStyle='#3e2814';gc.fillRect(x*16+6,y*16+8,4,8);gc.fillStyle='#6b4423';gc.fillRect(x*16+7,y*16+8,2,7);gc.fillStyle='#8a5a30';gc.fillRect(x*16+7,y*16+9,1,4)}
  for(const[x,y]of trees.sort((a,b)=>a[1]-b[1])){const forest=BIOME[y*MW+x]===2;paintCanopy(cid.data,W,H,x*16+8,y*16+3,forest?11:10,forest?RGB.leafF:RGB.leaf,x*31+y*17)}
  cc.putImageData(cid,0,0);
  WORLD=g;CANOPY=cv;return 1;
}
function paintCanopy(d,W,H,cx,cy,R,pal,seed){
  const r=mulberry32(seed),blobs=[[0,0,R]];for(let i=0;i<4;i++){const a=r()*6.28;blobs.push([Math.cos(a)*R*0.55,Math.sin(a)*R*0.45,R*(0.5+r()*0.25)])}
  const n=noise2(seed,4,40,40);
  for(let y=-R-6;y<=R+6;y++)for(let x=-R-6;x<=R+6;x++){let inside=false,best=9;for(const[bx,by,br]of blobs){const q=((x-bx)**2+(y-by)**2)/(br*br);if(q<1){inside=true;best=Math.min(best,q)}}if(!inside)continue;
    const X=cx+x,Y=cy+y;if(X<0||Y<0||X>=W||Y>=H)continue;
    let v=0.55-(x+y)/(R*2.4)*0.6+(n(x+R+6,y+R+6)-0.5)*0.55+BAYER[((Y&3)*4)+(X&3)]*0.25;if(best>0.82)v-=0.35;
    const c=pal[clamp(Math.floor(v*pal.length),0,pal.length-1)],o=(Y*W+X)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
}
function paintRock(gc,cx,cy,R,r){
  const id=gc.getImageData(cx-R-2,cy-R-2,R*2+4,R*2+4),d=id.data,w=R*2+4;
  gc.fillStyle='rgba(10,20,8,0.3)';gc.beginPath();gc.ellipse(cx+2,cy+R-1,R+1,3,0,0,7);gc.fill();
  const id2=gc.getImageData(cx-R-2,cy-R-2,w,w),d2=id2.data;
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){const dx=(x-R-2)/R,dy=(y-R-2)/(R*0.85);const q=dx*dx+dy*dy;if(q>1)continue;const o=(y*w+x)*4;
    let v=0.6-(dx+dy)*0.35+BAYER[(y&3)*4+(x&3)]*0.2;let pal=RGB.rock;if(dy<-0.25&&r()<0.75)pal=RGB.moss;if(q>0.8)v-=0.4;const c=pal[clamp(Math.floor(v*pal.length),0,pal.length-1)];d2[o]=c[0];d2[o+1]=c[1];d2[o+2]=c[2];d2[o+3]=255}
  gc.putImageData(id2,cx-R-2,cy-R-2);
}
function th(x,y){return((x*73856093)^(y*19349663))>>>0}

