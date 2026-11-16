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
  // new areas: snow grass, desert scrub, jungle grass, bridge planks
  TILE[24]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+410);for(let i=0;i<6;i++){const a=1+i*2.6+Math.floor(r()*2),h=5+Math.floor(r()*6);x.fillStyle='#2f5a4a';x.fillRect(a,16-h,2,h);x.fillStyle='#5f8f7a';x.fillRect(a,16-h+1,1,h-1);x.fillStyle='#f4f8fc';x.fillRect(a,16-h,2,1);x.fillStyle='#cfe0ea';x.fillRect(a+1,16-h+2,1,1)}}));
  TILE[25]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+420);for(let i=0;i<3;i++){const cx=2+i*5+Math.floor(r()*2),cy=10+Math.floor(r()*3);for(let k=0;k<6;k++){const a=-Math.PI/2+(k-2.5)*0.45,L=3+Math.floor(r()*3);for(let t=0;t<L;t++)P1(x,Math.round(cx+Math.cos(a)*t),Math.round(cy+Math.sin(a)*t),t===L-1?'#c9a25a':k%2?'#8a6a2a':'#6f5420')}}}));
  TILE[26]=[0,1,2].map(v=>tileCanvas(x=>{const r=mulberry32(v+430);for(let i=0;i<4;i++){const a=1+i*4,h=8+Math.floor(r()*6);x.fillStyle='#0c3a1c';x.fillRect(a,16-h,1,h);for(let k=0;k<h-1;k+=2){x.fillStyle=k%4?'#1f7a3a':'#2fa050';x.fillRect(a-2,16-h+k+1,2,1);x.fillRect(a+1,16-h+k+1,2,1)}x.fillStyle='#7ad06a';x.fillRect(a,16-h,1,1)}}));
  TILE[27]=[tileCanvas(x=>{x.fillStyle='#5a3a1c';x.fillRect(0,0,16,16);for(let y=0;y<16;y+=4){x.fillStyle='#a8743c';x.fillRect(0,y,16,3);x.fillStyle='#c48c4c';x.fillRect(0,y,16,1);x.fillStyle='#6b4420';x.fillRect(5+(y%8),y+1,1,1)}x.fillStyle='#3a2410';x.fillRect(0,0,1,16);x.fillRect(15,0,1,16)})];
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
 rock:['#4f4a42','#6a645a','#857e72','#a19a8c','#bdb6a6'],moss:['#3f7a26','#5c9a38','#7fbf4c'],
 snow:['#a9b8c9','#bfccd9','#d3dde8','#e5ecf3','#f6f9fc'],desert:['#c08a4a','#cf9b58','#dcae6a','#e7c07e','#f0d294'],jungle:['#1f5a2a','#277034','#2f833c','#3a9646','#4aaa52'],
 pine:['#0f2a1c','#163a26','#1e4a30','#2a5c3c','#3a704a','#4a8458'],palm:['#1a4a14','#22611a','#2d7a22','#3c9230','#55aa3e','#79c254'],cactus:['#1f4a22','#2a6a2e','#3a8a3c','#56a84e','#7cc46a'],peak:['#3a3e48','#545a66','#717885','#9aa2ae','#e8eef4','#ffffff']};
const RGB={};for(const k in PAL)RGB[k]=PAL[k].map(hex2rgb);
// the world is baked lazily in chunks of 32×32 tiles (ground + tree-canopy layer) around the player, kept in a small LRU cache
let WORLD=null,CANOPY=null,BAKE=null,BAKE_FAIL=false;const CS=32,CHUNKS=new Map(),CH_MAX=18;let BN=null;
function bakeNoise(){if(BN)return BN;const W=MW*16,H=MHT*16;BN={nL:noise2(101,46,W,H),nS:noise2(202,13,W,H),nD:noise2(303,22,W,H),jx:noise2(404,9,W,H),jy:noise2(505,9,W,H),nW:noise2(606,30,W,H)};return BN}
function chunkKey(cx,cy){return cx+','+cy}
function neededChunks(){const px=Math.floor((P.fx||VSPAWN.x)/CS),py=Math.floor((P.fy||VSPAWN.y)/CS),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const cx=px+dx,cy=py+dy;if(cx<0||cy<0||cx*CS>=MW||cy*CS>=MHT)continue;out.push([cx,cy,Math.abs(dx)+Math.abs(dy)])}return out.sort((a,b)=>a[2]-b[2])}
function bakeTick(budget){if(BAKE_FAIL)return;try{const t0=performance.now();const urgent=neededChunks().some(c=>c[2]<=1&&!CHUNKS.has(chunkKey(c[0],c[1])));budget=budget||(urgent?28:8);
  while(performance.now()-t0<budget){if(!BAKE){const nx=neededChunks().find(([cx,cy])=>!CHUNKS.has(chunkKey(cx,cy)));if(!nx)break;BAKE={k:chunkKey(nx[0],nx[1]),it:bakeChunkGen(nx[0],nx[1])}}
    const r=BAKE.it.next();if(r.done){CHUNKS.set(BAKE.k,Object.assign(r.value,{t:performance.now()}));BAKE=null;
      if(CHUNKS.size>CH_MAX){const keep=new Set(neededChunks().map(([a,b])=>chunkKey(a,b)));let old=null;for(const[k,v]of CHUNKS)if(!keep.has(k)&&(!old||v.t<old[1].t))old=[k,v];if(old)CHUNKS.delete(old[0])}}}
  const need=neededChunks().filter(c=>c[2]<=1),done=need.filter(([a,b])=>CHUNKS.has(chunkKey(a,b))).length;
  const lb=document.querySelector('#loadbar i');if(lb&&!WORLD)lb.style.width=Math.round(done/need.length*100)+'%';
  if(!WORLD&&done===need.length){WORLD=true;CANOPY=true;const L=$('#loadbar');if(L)L.style.display='none'}}
  catch(e){if(BAKE){CHUNKS.set(BAKE.k,{g:null,c:null,t:performance.now()});plog('[karte] chunk '+BAKE.k+': '+e.message)}BAKE=null}}
function bakeWorld(){WORLD=true}
// after a teleport: bake the chunks around the player right away (hidden behind the fade)
function bakeNow(){const t0=performance.now();while(performance.now()-t0<1600&&neededChunks().some(c=>c[2]<=1&&!CHUNKS.has(chunkKey(c[0],c[1]))))bakeTick(60)}
// draw the visible part of the baked world (layer 'g' = ground, 'c' = canopy); unbaked chunks fall back to flat colours
function drawWorldLayer(c,camX,camY,LW,LH,layer){const x0=Math.floor(Math.max(0,camX)/(CS*16)),y0=Math.floor(Math.max(0,camY)/(CS*16)),x1=Math.floor((camX+LW)/(CS*16)),y1=Math.floor((camY+LH)/(CS*16));
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){if(cx*CS>=MW||cy*CS>=MHT)continue;const ch=CHUNKS.get(chunkKey(cx,cy));const X=cx*CS*16-camX,Y=cy*CS*16-camY;
    if(ch&&ch.g){ch.t=performance.now();c.drawImage(layer==='g'?ch.g:ch.c,X,Y);continue}
    if(layer!=='g')continue;const tx0=Math.max(cx*CS,Math.floor(camX/16)),ty0=Math.max(cy*CS,Math.floor(camY/16)),tx1=Math.min(cx*CS+CS-1,Math.floor((camX+LW)/16),MW-1),ty1=Math.min(cy*CS+CS-1,Math.floor((camY+LH)/16),MHT-1);
    for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){c.fillStyle=MCOL[tget(x,y)]||'#000';c.fillRect(x*16-camX,y*16-camY,16,16)}}}
function townArea(x,y){let best=1,bd=1e9;for(const T of TOWN_DEF){const d=Math.abs(T.x-x)+Math.abs(T.y-y);if(d<bd){bd=d;best=T.b}}return best}
const GROUND_PAL=b=>b===2?RGB.forest:b===3?RGB.shore:b===4?RGB.hills:b===6?RGB.snow:b===7?RGB.desert:b===8?RGB.jungle:RGB.meadow;
function* bakeChunkGen(cx,cy){
  const X0=cx*CS,Y0=cy*CS,S=CS*16,PX0=X0*16,PY0=Y0*16,g=mk(S,S),gc=g.getContext('2d'),id=gc.createImageData(S,S),d=id.data,{nL,nS,nD,jx,jy,nW}=bakeNoise();
  const T=(x,y)=>tget(Math.floor(x/16),Math.floor(y/16));
  const JX=new Float32Array((S>>1)+1),JY=new Float32Array((S>>1)+1);
  const SW=Math.min(S,MW*16-PX0),SH=Math.min(S,MHT*16-PY0);
  for(let ly=0;ly<SH;ly++){if((ly&7)===0)yield;const py=PY0+ly;if(!(ly&1))for(let k=0;k<=S>>1;k++){JX[k]=(jx(PX0+k*2,py)-0.5)*7;JY[k]=(jy(PX0+k*2,py)-0.5)*7}
    for(let lx=0;lx<SW;lx++){const px=PX0+lx;
    const ox=JX[lx>>1],oy=JY[lx>>1];let t=T(px+ox,py+oy);const t0=T(px,py);
    if(t0===6||t0===7||t0===8||t0===10||t0===11||t0===12||t0===20||t0>=21&&t0<=23||t0===27||t0===13||t0===36)t=t0;
    const tx=clamp(Math.floor((px+ox)/16),0,MW-1),ty=clamp(Math.floor((py+oy)/16),0,MHT-1),b=BIOME[ty*MW+tx];
    const dth=BAYER[(py&3)*4+(px&3)]*0.22;let v=nL(px,py)*0.62+nS(px,py)*0.38+dth;let pal;const o=(ly*S+lx)*4;
    if(t===3||t===27){pal=RGB.water;v=nW(px,py+((px*7)%3))*0.7+0.15+dth;
      const nearLand=[[-2,0],[2,0],[0,-2],[0,2]].some(([a,c2])=>{const q=T(px+a+ox*0.3,py+c2+oy*0.3);return q!==3&&q!==27});if(nearLand){d[o]=200;d[o+1]=232;d[o+2]=245;d[o+3]=255;continue}}
    else if(t===5)pal=RGB.sand;else if(t===18)pal=nD(px,py)>0.5?RGB.sand:RGB.shore;
    else if(t===4||t===7||t===12)pal=b===6?RGB.stone:b===7?RGB.desert:RGB.dirt;else if(t===13||t===20)pal=RGB.stone;
    else if(t===28||t===24)pal=RGB.snow;else if(t===29||t===25)pal=RGB.desert;else if(t===30||t===26)pal=RGB.jungle;
    else{pal=GROUND_PAL(b);
      if(t===1||t===17)v-=0.18;
      if((b===4&&nD(px,py)>0.52)||((b<=1||b===3)&&nD(px,py)>0.74&&t!==1&&t!==17)||(t===19&&nD(px,py)>0.4))pal=RGB.dirt}
    if(pal===RGB.desert&&nD(px,py)>0.7)v-=0.15;
    const k=clamp(Math.floor(v*pal.length),0,pal.length-1),c=pal[k];d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}}
  gc.putImageData(id,0,0);yield;
  gc.save();gc.translate(-PX0,-PY0);
  const inC=(x,y)=>x>=X0&&y>=Y0&&x<X0+CS&&y<Y0+CS;
  // building tiles (PÄD walls/roof are covered by its sprite)
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){const t=tget(x,y);if([10,11,12,20,27,36].includes(t)){const arr=TILE[t];gc.drawImage(arr[(t===20?(x+y)%arr.length:0)],x*16,y*16)}}
  for(const p of PADS){if(p.bx+6<X0||p.bx>X0+CS||p.by+4<Y0||p.by>Y0+CS)continue;gc.fillStyle='rgba(20,30,10,0.28)';gc.fillRect(p.bx*16,(p.by+4)*16,96,4);gc.drawImage(p.old?padSpriteOld():dienstSprite(),p.bx*16,p.by*16)}
  for(const Bd of BLDG){if(Bd.x+Bd.w<X0||Bd.x>X0+CS||Bd.y+Bd.h<Y0||Bd.y>Y0+CS)continue;gc.fillStyle='rgba(20,30,10,0.28)';gc.fillRect(Bd.x*16,(Bd.y+Bd.h)*16,Bd.w*16,4);gc.drawImage(Bd.id==='shop'?(Bd.old?shopSpriteOld():shopSprite()):(Bd.old?hfpolSpriteOld():hfpolSprite()),Bd.x*16,Bd.y*16)}
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){const t=tget(x,y);if(t===13)gc.drawImage(TILE[13][0],x*16,y*16)}
  // ledges: a row of stones; rounded tops that blend into the grass on the high side, cast shadow on the side you jump down to
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){const t=tget(x,y);if(t<32||t>35)continue;const X=x*16,Y=y*16,v0=th(x,y);
    // local coords: u runs along the step (0..15), v across it (0 = high side … 15 = low side / jump side)
    const P_=(u,v,col)=>{if(u<0||u>15||v<0||v>15)return;gc.fillStyle=col;const px=t===32?u:t===33?u:t===34?15-v:v,py=t===32?v:t===33?15-v:u;gc.fillRect(X+px,Y+py,1,1)};
    const R_=(u,v,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)P_(u+i,v+j,col)};
    for(let k=0;k<2;k++){const u0=k*8,v=4+((v0>>k)&1),w=8,h=7;
      // shadow on the jump side
      R_(u0+1,v+h,w-1,3,'rgba(0,0,0,0.34)');R_(u0+2,v+h+3,w-3,1,'rgba(0,0,0,0.16)');
      // body with rounded high side
      for(let j=0;j<h;j++){const ins=j===0?2:j===1?1:0;R_(u0+ins,v+j,w-ins*2,1,'#2a2a30');if(j>0&&j<h-1){const ii=j===1?2:1;R_(u0+ii,v+j,w-ii*2,1,j<3?'#b4b4be':j<h-2?'#8e8e98':'#6e6e78')}}
      P_(u0+3,v+2,'#dcdce4');P_(u0+4,v+2,'#dcdce4');P_(u0+w-2,v+3,'#76767f');
      // grass growing over the rounded top
      const g=mulberry32(v0+k*7);for(let i=0;i<4;i++){const uu=u0+1+Math.floor(g()*(w-2));P_(uu,v-1,'#3a7424');P_(uu,v,'#4ea53c');if(g()<0.5)P_(uu+1,v,'#5cb848')}}}
  // ground details: tufts, flowers, pebbles
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){const t=tget(x,y),b=BIOME[y*MW+x],r=mulberry32(th(x,y));
    if(t===0||t===14||t===15||t===30){const n=1+Math.floor(r()*3);for(let i=0;i<n;i++){const X=x*16+Math.floor(r()*14)+1,Y=y*16+Math.floor(r()*13)+2;gc.fillStyle=b===2?'#1d4416':b===4?'#6a6a2a':b===8?'#123a18':'#3a7424';gc.fillRect(X,Y,1,2);gc.fillRect(X-1,Y,1,1);gc.fillRect(X+1,Y-1,1,2);if(r()<0.4){gc.fillStyle=b===2?'#5c9a3a':'#9ad25a';gc.fillRect(X+1,Y-1,1,1)}}}
    if(t===28&&r()<0.4){gc.fillStyle='#ffffff';gc.fillRect(x*16+Math.floor(r()*14),y*16+Math.floor(r()*14),2,1)}
    if(t===29&&r()<0.35){gc.fillStyle='#b07a3e';gc.fillRect(x*16+Math.floor(r()*14),y*16+Math.floor(r()*14),2,1)}
    if(t===9||(t===0&&b<=1&&r()<0.12)){const cols=['#ffffff','#ffe36b','#ff8fb3','#c9b6ff'];for(let i=0;i<(t===9?4:1);i++){const X=x*16+2+Math.floor(r()*12),Y=y*16+2+Math.floor(r()*12),col=cols[Math.floor(r()*cols.length)];gc.fillStyle='#2f6a20';gc.fillRect(X,Y+1,1,2);gc.fillStyle=col;gc.fillRect(X-1,Y,3,1);gc.fillRect(X,Y-1,1,3);gc.fillStyle='#ffcb3d';gc.fillRect(X,Y,1,1)}}
    if((t===4||t===5||t===15)&&r()<0.5){gc.fillStyle=t===5?'#c2a56c':'#8a6a44';gc.fillRect(x*16+Math.floor(r()*14),y*16+Math.floor(r()*14),2,1)}}
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){const t=tget(x,y);if(ENC.has(t))gc.drawImage(TILE[t][(x*7+y*3)%TILE[t].length],x*16,y*16)}
  gc.restore();yield;
  // rocks / peaks (local coordinates)
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){const t=tget(x,y);if(t!==16&&t!==31)continue;const v=th(x,y)%4;
    if(t===16){const sp=propSprite('rock'+(BIOME[y*MW+x]===7?'d':'')+v);gc.drawImage(sp,(x-X0)*16-4,(y-Y0)*16-2)}else{const sp=propSprite('peak'+v);gc.drawImage(sp,(x-X0)*16-4,(y-Y0)*16-4)}}
  // trees: shadow + trunk on the ground, canopy on its own layer (above the players)
  const cv=mk(S,S),cc=cv.getContext('2d');
  for(let y=Y0;y<Y0+CS;y++)for(let x=X0;x<X0+CS;x++){if(tget(x,y)!==2)continue;const b=BIOME[y*MW+x],X=(x-X0)*16,Y=(y-Y0)*16;gc.fillStyle='rgba(10,25,8,0.32)';gc.beginPath();gc.ellipse(X+10,Y+14,10,5,0,0,7);gc.fill();
    if(b===7)continue;gc.fillStyle='#3e2814';gc.fillRect(X+6,Y+8,4,8);gc.fillStyle=b===8?'#8a6a3a':'#6b4423';gc.fillRect(X+7,Y+8,2,7);gc.fillStyle='#8a5a30';gc.fillRect(X+7,Y+9,1,4)}
  const trees=[];for(let y=Y0-2;y<Y0+CS+2;y++)for(let x=X0-2;x<X0+CS+2;x++)if(tget(x,y)===2&&x>=0&&y>=0&&x<MW&&y<MHT)trees.push([x,y]);
  for(const[x,y]of trees.sort((a,b)=>a[1]-b[1])){const b=BIOME[y*MW+x]||townArea(x,y),X=(x-X0)*16+8,Y=(y-Y0)*16+3,v=th(x,y)%5;
    const kind=b===6?'pine':b===7?'cactus':(b===8||(b===3&&tget(x,y+1)!==2))?'palm':b===2?'forest':'leaf';cc.drawImage(propSprite(kind+v),X-24,Y-24)}
  return{g,c:cv};
}
// pre-rendered props (trees, rocks, peaks) – painted once per variant, then just blitted into the chunks
const PROPS={};
function propSprite(k){if(PROPS[k])return PROPS[k];const v=+k.slice(-1),kind=k.slice(0,-1),sd=v*977+13;let c;
  if(kind==='rock'||kind==='rockd'){c=mk(24,24);const x=c.getContext('2d',{willReadFrequently:true});paintRock(x,12,12,7+(v%2),mulberry32(sd),kind==='rockd'?RGB.desert:null)}
  else if(kind==='peak'){c=mk(24,24);const x=c.getContext('2d');paintPeak(x,4,4,mulberry32(sd))}
  else{c=mk(48,48);const x=c.getContext('2d'),id=x.createImageData(48,48);
    if(kind==='pine')paintPine(id.data,48,48,24,24,sd);else if(kind==='cactus')paintCactus(id.data,48,48,24,28,sd);else if(kind==='palm')paintPalm(id.data,48,48,24,24,sd);
    else paintCanopy(id.data,48,48,24,24,kind==='forest'?11:10,kind==='forest'?RGB.leafF:RGB.leaf,sd);x.putImageData(id,0,0)}
  PROPS[k]=c;return c}
function paintPine(d,W,H,cx,cy,seed){const r=mulberry32(seed),pal=RGB.pine;for(let y=-12;y<=10;y++){const w=Math.max(1,Math.round((y+13)*0.42));for(let x=-w;x<=w;x++){const X=cx+x,Y=cy+y;if(X<0||Y<0||X>=W||Y>=H)continue;
    let v=0.6-(x/w)*0.35+BAYER[((Y&3)*4)+(X&3)]*0.25;if(Math.abs(x)>=w-0.5)v-=0.3;let c=pal[clamp(Math.floor(v*(pal.length-1)),0,pal.length-2)];if((y%5===-1||y%5===4)&&x<w-1&&r()<0.8)c=[240,246,252];const o=(Y*W+X)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}}}
function paintPalm(d,W,H,cx,cy,seed){const r=mulberry32(seed),pal=RGB.palm;const put=(X,Y,c)=>{if(X<0||Y<0||X>=W||Y>=H)return;const o=(Y*W+X)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255};
  for(let y=0;y<10;y++){put(cx-1+Math.round(Math.sin(y/4)),cy+y,[90,62,30]);put(cx+Math.round(Math.sin(y/4)),cy+y,[138,100,52])}
  for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*0.62+(r()-0.5)*0.2,L=9+Math.floor(r()*4);for(let t=0;t<L;t++){const X=Math.round(cx+Math.cos(a)*t),Y=Math.round(cy-2+Math.sin(a)*t+t*t*0.045);const c=pal[clamp(Math.floor((0.85-t/L*0.6)*pal.length),0,pal.length-1)];put(X,Y,c);if(t>2&&t<L-1){put(X,Y+1,pal[1])}}}
  put(cx,cy-2,[200,170,60]);put(cx+1,cy-1,[160,120,40])}
function paintCactus(d,W,H,cx,cy,seed){const r=mulberry32(seed),pal=RGB.cactus;const put=(X,Y,v)=>{if(X<0||Y<0||X>=W||Y>=H)return;const c=pal[clamp(Math.floor(v*pal.length),0,pal.length-1)],o=(Y*W+X)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255};
  for(let y=-8;y<10;y++)for(let x=-2;x<=2;x++)put(cx+x,cy+y,0.7-x*0.15+(y===-8&&Math.abs(x)===2?-1:0));
  const arm=(s,h)=>{for(let x=1;x<=3;x++)put(cx+s*(2+x),cy+h,0.45);for(let y=h-5;y<=h;y++){put(cx+s*5,cy+y,0.6);put(cx+s*6,cy+y,0.35)}};arm(1,0+Math.floor(r()*3));arm(-1,-3+Math.floor(r()*3))}
function paintPeak(gc,X,Y,r){const pal=RGB.peak;gc.fillStyle='rgba(10,20,30,0.25)';gc.fillRect(X+1,Y+13,15,3);
  const h=14+Math.floor(r()*4),top=Y+16-h,cx=X+8+Math.floor(r()*3)-1;for(let y=0;y<h;y++){const w=Math.round(y*0.62)+1;for(let x=-w;x<=w;x++){const xx=cx+x,yy=top+y;let v=0.55-(x/w)*0.3+BAYER[((yy&3)*4)+(xx&3)]*0.2;let c=pal[clamp(Math.floor(v*4),0,3)];if(y<h*0.35-(x>0?1:0))c=x>0?pal[4]:pal[5];gc.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;gc.fillRect(xx,yy,1,1)}}}
function paintCanopy(d,W,H,cx,cy,R,pal,seed){
  const r=mulberry32(seed),blobs=[[0,0,R]];for(let i=0;i<4;i++){const a=r()*6.28;blobs.push([Math.cos(a)*R*0.55,Math.sin(a)*R*0.45,R*(0.5+r()*0.25)])}
  const n=noise2(seed,4,40,40);
  for(let y=-R-6;y<=R+6;y++)for(let x=-R-6;x<=R+6;x++){let inside=false,best=9;for(const[bx,by,br]of blobs){const q=((x-bx)**2+(y-by)**2)/(br*br);if(q<1){inside=true;best=Math.min(best,q)}}if(!inside)continue;
    const X=cx+x,Y=cy+y;if(X<0||Y<0||X>=W||Y>=H)continue;
    let v=0.55-(x+y)/(R*2.4)*0.6+(n(x+R+6,y+R+6)-0.5)*0.55+BAYER[((Y&3)*4)+(X&3)]*0.25;if(best>0.82)v-=0.35;
    const c=pal[clamp(Math.floor(v*pal.length),0,pal.length-1)],o=(Y*W+X)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
}
function paintRock(gc,cx,cy,R,r,palOv){
  const id=gc.getImageData(cx-R-2,cy-R-2,R*2+4,R*2+4),d=id.data,w=R*2+4;
  gc.fillStyle='rgba(10,20,8,0.3)';gc.beginPath();gc.ellipse(cx+2,cy+R-1,R+1,3,0,0,7);gc.fill();
  const id2=gc.getImageData(cx-R-2,cy-R-2,w,w),d2=id2.data;
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){const dx=(x-R-2)/R,dy=(y-R-2)/(R*0.85);const q=dx*dx+dy*dy;if(q>1)continue;const o=(y*w+x)*4;
    let v=0.6-(dx+dy)*0.35+BAYER[(y&3)*4+(x&3)]*0.2;let pal=palOv||RGB.rock;if(dy<-0.25&&r()<0.75)pal=RGB.moss;if(q>0.8)v-=0.4;const c=pal[clamp(Math.floor(v*pal.length),0,pal.length-1)];d2[o]=c[0];d2[o+1]=c[1];d2[o+2]=c[2];d2[o+3]=255}
  gc.putImageData(id2,cx-R-2,cy-R-2);
}
function th(x,y){return((x*73856093)^(y*19349663))>>>0}


// classic PÄD (before the tower style): red tiled roof, white wall with windows, wooden door, blue light on the ridge
let PADSPR0=null;function padSpriteOld(){if(PADSPR0)return PADSPR0;const c=mk(96,64),x=c.getContext('2d'),F=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  F('#14141f',0,0,96,64);F('#d23b3b',1,1,94,31);for(let y=4;y<32;y+=4)F('#a92b2b',1,y,94,1);for(let y=1;y<32;y+=4)F('#e85c5c',1,y,94,1);F('#14141f',0,31,96,1);
  F('#efe8dc',1,32,94,31);F('#bfb6a2',1,60,94,3);
  for(const wx of[0,1,2,4,5]){const X=wx*16;F('#3c3c4c',X+3,35,10,8);F('#8fd0ff',X+4,36,8,6);F('#c8ecff',X+4,36,3,2);if(wx!==2&&wx!==4){F('#3c3c4c',X+3,48,10,8);F('#8fd0ff',X+4,49,8,6);F('#c8ecff',X+4,49,3,2)}}
  F('#3a2210',50,49,12,15);F('#7c4a22',51,50,10,14);F('#9a5d2c',51,50,1,14);F('#ffd23f',59,57,1,1);
  F('#14141f',42,8,12,8);F('#2f6fd0',43,9,10,6);F('#8fc8ff',44,10,3,2);F('#ffffff',46,10,4,1);
  return PADSPR0=c}
