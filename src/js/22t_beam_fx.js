/* ===== Strahlen mit eigenen Partikeln: jede Strahl-Attacke sieht anders aus, nicht nur in der Farbe =====
   Aufladen: eigene Teilchen sammeln sich an der Quelle. Feuern: über dem Grundstrahl liegt ein eigener Effekt
   (Zickzack-Blitz, Verästelung, Spiralringe, Gischt, Polarlicht-Bänder, Eiskristalle, Sonnenstrahlen, Druckringe,
   Windwirbel, Schattenaugen, Glitzersterne). Alles Pixel-Rechtecke wie der Rest der Grafik. */
const BEAM_STYLE={boltstrike:'lance',thunderbolt:'fork',confuseray:'spiral',hydropump:'spray',aurorabeam:'aurora',eisstrahl:'frost',
  solarbeam:'sun',hyperbeam:'hyper',aeroblast:'wind',horrorblick:'shadow',leer:'glint'};
const BEAM_CHG={lance:['#ffe14d','#ffffff'],fork:['#ffe14d','#9fd8ff'],spiral:['#f472b6','#c4b5fd'],spray:['#5aa8ff','#e8f4ff'],aurora:['#7ef0d0','#f0a0ff'],
  frost:['#c8f0ff','#ffffff'],sun:['#ffd23d','#9be36b'],hyper:['#ffb347','#ffffff'],wind:['#e8f4ff','#b8d8f0'],shadow:['#6a3a9a','#14141f'],glint:['#e8ecf2','#ffffff']};
function bfPath(s){const pts=[[s.x,s.y]];if(s.segs&&s.segs.length)for(const g of s.segs)pts.push([g[2],g[3]]);else{const L=Math.hypot(s.vx,s.vy)||1;pts.push([s.x+s.vx/L*(s.len||250),s.y+s.vy/L*(s.len||250)])}
  const seg=[];let tot=0;for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[x,y]=pts[i],l=Math.hypot(x-a,y-b);if(l<0.5)continue;seg.push({a,b,x,y,l,ux:(x-a)/l,uy:(y-b)/l,o:tot});tot+=l}return{seg,tot}}
function bfAt(P,d){for(const g of P.seg){if(d<=g.o+g.l){const t=d-g.o;return[g.a+g.ux*t,g.b+g.uy*t,g.ux,g.uy]}}const g=P.seg[P.seg.length-1];return g?[g.x,g.y,g.ux,g.uy]:[0,0,1,0]}
{const _ds=drawSpecial;drawSpecial=function(c,s,col,now){const r=_ds.apply(this,arguments);if(s.k!=='beam')return r;const st=BEAM_STYLE[s.mid];if(!st)return r;try{bfDraw(c,s,st,now)}catch(e){}return r}}
function bfDraw(c,s,st,now){const R=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};
  const L0=Math.hypot(s.vx,s.vy)||1,ux0=s.vx/L0,uy0=s.vy/L0;
  if(!s.fired){// charging: particles gather at the muzzle
    const k=Math.min(1,s.age/Math.max(0.05,typeof BEAM_CH!=='undefined'?BEAM_CH:0.35)),C=BEAM_CHG[st]||['#ffffff','#ffffff'],rnd=mulberry32(hashStr(String(s.id))+7);
    for(let i=0;i<10;i++){const a=rnd()*6.283,d0=16+rnd()*14,ph=(rnd()+now/420)%1,d=d0*(1-ph),x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d*0.7,cl=i%2?C[0]:C[1];c.globalAlpha=0.4+0.6*k;
      if(st==='frost'){R(x-1,y,3,1,cl);R(x,y-1,1,3,cl)}else if(st==='sun'&&i%3===0){R(x,y,2,1,'#9be36b');R(x+1,y-1,1,1,'#5fa236')}else if(st==='shadow'){R(x-1,y-1,3,2,cl)}else if(st==='spray'){R(x,y,1,2,cl)}else R(x,y,2,2,cl)}
    c.globalAlpha=1;return}
  const k=clamp((s.age-0.3)/Math.max(0.1,s.life-0.3),0,1),al=Math.min(1,(1-k)*1.7),P=bfPath(s);if(!P.seg.length)return;const tot=P.tot,fr=Math.floor(now/55),rnd=mulberry32(hashStr(String(s.id))*31+fr);
  if(!s.bfEm&&B&&B.parts){s.bfEm=1;bfEmit(s,st,P)}c.save();c.globalAlpha=Math.max(0,al);
  if(st==='lance'||st==='fork'){// zigzag lightning over the beam (thunderbolt adds branches)
    const bolt=(x0,y0,dx,dy,len,amp,w,cl)=>{let px=x0,py=y0;const n=Math.max(2,Math.round(len/12)),nx=-dy,ny=dx;c.strokeStyle=cl;c.lineWidth=w;c.beginPath();c.moveTo(Math.round(px),Math.round(py));
      for(let i=1;i<=n;i++){const t=i/n,o=i===n?0:(rnd()-0.5)*2*amp;px=x0+dx*len*t+nx*o;py=y0+dy*len*t+ny*o;c.lineTo(Math.round(px),Math.round(py))}c.stroke()};
    for(const g of P.seg){bolt(g.a,g.b,g.ux,g.uy,g.l,st==='fork'?10:6,5,'#14141f');bolt(g.a,g.b,g.ux,g.uy,g.l,st==='fork'?10:6,3,'#ffe14d');bolt(g.a,g.b,g.ux,g.uy,g.l,4,1,'#ffffff')}
    if(st==='fork')for(let i=0;i<4;i++){const d=tot*(0.2+0.18*i),[x,y,dx,dy]=bfAt(P,d),sg=i%2?1:-1,a=Math.atan2(dy,dx)+sg*(0.6+rnd()*0.5);bolt(x,y,Math.cos(a),Math.sin(a),24+rnd()*20,5,2,i%2?'#9fd8ff':'#ffe14d')}
    const[ex,ey]=bfAt(P,tot);for(let i=0;i<6;i++){const a=rnd()*6.283,d=3+rnd()*9;R(ex+Math.cos(a)*d,ey+Math.sin(a)*d,1,1,i%2?'#ffffff':'#ffe14d')}}
  else if(st==='spiral'){// rings travel along a wavy line
    for(let d=0;d<tot;d+=3){const[x,y,dx,dy]=bfAt(P,d),o=Math.sin(d/9-now/70)*8;R(x-dy*o-1,y+dx*o-1,3,3,'#f472b6')}
    for(let i=0;i<5;i++){const d=((now/3.2+i*tot/5)%tot),[x,y]=bfAt(P,d),rr=7+((now/90+i)%3)*2;c.strokeStyle=i%2?'#c4b5fd':'#f472b6';c.lineWidth=2;c.strokeRect(Math.round(x-rr),Math.round(y-rr*0.7),Math.round(rr*2),Math.round(rr*1.4))}}
  else if(st==='spray'){// spray droplets and foam flying off the jet, splash at the end
    for(let i=0;i<26;i++){const d=rnd()*tot,[x,y,dx,dy]=bfAt(P,d),sd=(rnd()-0.5)*2,lat=7+rnd()*10;R(x-dy*lat*sd,y+dx*lat*sd+rnd()*3,i%3?2:3,i%3?3:2,i%4?'#8fc8f0':'#ffffff')}
    for(let d=6;d<tot;d+=14){const[x,y]=bfAt(P,d+((now/8)%14));R(x-1,y-1,3,2,'#e8f4ff')}
    const[ex,ey]=bfAt(P,tot);for(let i=0;i<10;i++){const a=-Math.PI*rnd(),d=4+rnd()*12;R(ex+Math.cos(a)*d,ey+Math.sin(a)*d*0.8,2,2,i%2?'#5aa8ff':'#ffffff')}}
  else if(st==='aurora'){// three shimmering ribbons weave around the beam
    const cols=['#7ef0d0','#f0a0ff','#9fd8ff'];for(let b=0;b<3;b++)for(let d=0;d<tot;d+=2){const[x,y,dx,dy]=bfAt(P,d),o=Math.sin(d/14+b*2.1-now/120)*11;c.globalAlpha=Math.max(0,al)*(0.55+0.45*Math.sin(d/20+b+now/90));R(x-dy*o,y+dx*o,2,2,cols[b])}c.globalAlpha=Math.max(0,al)}
  else if(st==='frost'){// ice crystals along the beam, flakes drifting down
    for(let d=8;d<tot;d+=16){const[x,y]=bfAt(P,d),sz=3+((d/16)|0)%2*2;R(x-sz,y,sz*2+1,1,'#ffffff');R(x,y-sz,1,sz*2+1,'#ffffff');R(x-2,y-2,5,5,'#c8f0ff');R(x-1,y-1,3,3,'#ffffff')}
    for(let i=0;i<14;i++){const d=rnd()*tot,[x,y]=bfAt(P,d),fall=((now/25+i*7)%18);R(x+(rnd()-0.5)*10,y+fall,1,1,i%2?'#ffffff':'#c8f0ff')}}
  else if(st==='sun'){// thick golden core, short rays sideways, leaves and light motes
    for(let d=0;d<tot;d+=2){const[x,y]=bfAt(P,d);R(x-1,y-3,2,6,'#fff2a8')}
    for(let d=10;d<tot;d+=18){const[x,y,dx,dy]=bfAt(P,d),ln=6+((d+fr)%3)*3;for(let t=5;t<5+ln;t++){R(x-dy*t,y+dx*t,1,1,'#ffd23d');R(x+dy*t,y-dx*t,1,1,'#ffd23d')}}
    for(let i=0;i<8;i++){const d=((now/6+i*tot/8)%tot),[x,y,dx,dy]=bfAt(P,d),o=Math.sin(now/80+i)*8;R(x-dy*o,y+dx*o,2,1,'#9be36b');R(x-dy*o+1,y+dx*o-1,1,1,'#5fa236')}}
  else if(st==='hyper'){// wide halo and pressure rings rushing down the beam
    for(let d=0;d<tot;d+=2){const[x,y,dx,dy]=bfAt(P,d);for(const o of[-8,-7,7,8])R(x-dy*o,y+dx*o,1,1,'#ffb347')}
    for(let i=0;i<4;i++){const d=((now/2.2+i*tot/4)%tot),[x,y,dx,dy]=bfAt(P,d),rr=10+((now/60+i)%3)*3;for(let t=-rr;t<=rr;t++)R(x-dy*t+dx*Math.abs(t)*0.25,y+dx*t+dy*Math.abs(t)*0.25,2,2,t%2?'#ffffff':'#ffb347')}
    if(B&&s.age<0.5)B.shakeUntil=Math.max(B.shakeUntil||0,performance.now()+40)}
  else if(st==='wind'){// curved gust lines spinning around the axis, speed streaks
    for(let i=0;i<7;i++){const d0=((now/3+i*tot/7)%tot);for(let t=0;t<10;t++){const d=Math.min(tot,d0+t*2),[x,y,dx,dy]=bfAt(P,d),o=Math.sin((t/10)*Math.PI+i)*(9+i%3*2);R(x-dy*o,y+dx*o,2,2,t<3?'#b8d8f0':'#ffffff')}}
    for(let i=0;i<10;i++){const d=rnd()*tot,[x,y,dx,dy]=bfAt(P,d),o=(rnd()-0.5)*18;R(x-dy*o,y+dx*o,Math.abs(dx)>0.5?6:1,Math.abs(dx)>0.5?1:6,'#e8f4ff')}}
  else if(st==='shadow'){// dark smoke puffs and staring eyes along the beam
    for(let i=0;i<16;i++){const d=rnd()*tot,[x,y,dx,dy]=bfAt(P,d),o=(rnd()-0.5)*16;R(x-dy*o-2,y+dx*o-2,5,4,i%2?'#3a1a5a':'#14141f')}
    for(let i=0;i<3;i++){const d=tot*(0.25+0.25*i),[x,y]=bfAt(P,d),bl=((now/160+i)|0)%4===0;R(x-7,y-3,14,6,'#14141f');if(!bl){R(x-6,y-2,12,4,'#e8e8f0');R(x-2,y-2,4,4,'#ef4444');R(x-1,y-1,2,2,'#14141f')}}}
  else if(st==='glint'){// silver stare with blinking four-point stars
    for(let i=0;i<6;i++){const d=tot*((i+0.5)/6),[x,y]=bfAt(P,d),on=((fr+i)%3)===0,sz=on?5:2;R(x-sz,y,sz*2+1,1,'#ffffff');R(x,y-sz,1,sz*2+1,'#ffffff');if(on)R(x-1,y-1,3,3,'#e8ecf2')}}
  c.restore()}

// beim Feuern einmal Teilchen ins Feld streuen, die kurz nachwirken – je Strahl eigene Art
function bfEmit(s,st,P){const tot=P.tot,rnd=mulberry32(hashStr(String(s.id))+99),add=(x,y,vx,vy,life,c)=>B.parts.push({x,y,vx,vy,life,age:0,c});
  const n=st==='glint'?10:26;for(let i=0;i<n;i++){const d=rnd()*tot,[x,y,dx,dy]=bfAt(P,d),sd=rnd()<0.5?-1:1,a=rnd()*6.283;
    if(st==='lance'||st==='fork')add(x,y,Math.cos(a)*(60+rnd()*90),Math.sin(a)*(60+rnd()*90),0.18+rnd()*0.15,i%2?'#ffe14d':'#ffffff');
    else if(st==='spiral')add(x,y,(rnd()-0.5)*20,-18-rnd()*20,0.6+rnd()*0.4,i%2?'#f472b6':'#c4b5fd');
    else if(st==='spray')add(x,y,-dy*sd*(40+rnd()*50),dx*sd*(40+rnd()*50)-20,0.35+rnd()*0.2,i%3?'#8fc8f0':'#ffffff');
    else if(st==='aurora')add(x,y,(rnd()-0.5)*14,-10-rnd()*14,0.7+rnd()*0.5,['#7ef0d0','#f0a0ff','#9fd8ff'][i%3]);
    else if(st==='frost')add(x+(rnd()-0.5)*10,y,(rnd()-0.5)*10,14+rnd()*16,0.8+rnd()*0.5,i%2?'#ffffff':'#c8f0ff');
    else if(st==='sun')add(x,y,(rnd()-0.5)*30,-16-rnd()*22,0.6+rnd()*0.4,i%3?'#ffd23d':'#9be36b');
    else if(st==='hyper')add(x,y,-dy*sd*(80+rnd()*80),dx*sd*(80+rnd()*80),0.3+rnd()*0.2,i%2?'#ffb347':'#ffffff');
    else if(st==='wind')add(x,y,dx*(160+rnd()*100),dy*(160+rnd()*100),0.25+rnd()*0.15,'#e8f4ff');
    else if(st==='shadow')add(x+(rnd()-0.5)*8,y,(rnd()-0.5)*8,-8-rnd()*10,0.8+rnd()*0.5,i%2?'#3a1a5a':'#6a3a9a');
    else if(st==='glint')add(x,y,0,-4,0.5+rnd()*0.3,'#ffffff')}}
