/* Gericht-Kämpfe (Turnier-Duelle und Zuschauen) bekommen eine epische Bühne:
   Publikum mit Blitzlichtern, schwenkende Scheinwerfer, goldener Ring, Waage-Emblem, Banner mit Runde —
   im letzten Kampf des Turniers „★ ENDKAMPF ★“ mit Goldfunken und großem Intro-Schriftzug. */
function courtEpic(){try{if(!B||!RUN||RUN.free)return null;if(!(B.mode==='duel'&&!B.spar)&&B.mode!=='spec')return null;
  const p=String(B.id||'').split('-'),r=+p[1]||RUN.r||1,R=roundsOf();return{r,R,fin:r>=R}}catch(e){return null}}
function courtCrowd(){if(B.crowd)return B.crowd;const rnd=mulberry32(hashStr(String(B.id)));const cols=['#c0392b','#2e86de','#f1c40f','#27ae60','#8e44ad','#e67e22','#ecf0f1','#34495e','#d35400','#16a085'];const skin=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'];
  const out=[];for(let row=0;row<3;row++){const y=66+row*11;for(let x=4+row*5;x<AW-4;x+=10+Math.floor(rnd()*3)){const ex=(x-ACX)/ARX,ey=(y+10-ACY)/ARY;if(ex*ex+ey*ey<1.05)continue;out.push({x,y,c:cols[Math.floor(rnd()*cols.length)],s:skin[Math.floor(rnd()*skin.length)],ph:rnd()*6.28,sp:2+rnd()*3})}}
  for(const side of[-1,1])for(let i=0;i<10;i++){const y=AH-30+((i/5)|0)*11,x=side<0?6+(i%5)*11:AW-8-(i%5)*11;const ex=(x-ACX)/ARX,ey=(y-ACY)/ARY;if(ex*ex+ey*ey<1.05)continue;out.push({x,y,c:cols[Math.floor(rnd()*cols.length)],s:skin[Math.floor(rnd()*skin.length)],ph:rnd()*6.28,sp:2+rnd()*3})}
  return B.crowd=out}
{const _da=drawArenaEv;drawArenaEv=function(c,now,layer){_da.apply(this,arguments);const E=courtEpic();if(!E)return;try{
  const gold=E.fin?'#ffcb3d':'#d9b45a',t=now/1000;
  if(layer===0){
    // dark stage floor edge + glowing ring
    c.save();c.globalAlpha=0.22;c.fillStyle='#000';c.beginPath();c.rect(0,0,AW,AH);c.ellipse(ACX,ACY,ARX,ARY,0,0,Math.PI*2,true);c.fill('evenodd');c.restore();
    const n=72;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+t*(E.fin?0.35:0.15),x=ACX+Math.cos(a)*ARX,y=ACY+Math.sin(a)*ARY;c.fillStyle=i%2?gold:'#7a5a12';c.globalAlpha=0.55+0.35*Math.sin(t*3+i);c.fillRect(Math.round(x)-1,Math.round(y)-1,3,2)}c.globalAlpha=1;
    // scales emblem on the floor
    c.save();c.globalAlpha=E.fin?0.2:0.13;c.fillStyle=gold;const X=ACX,Y=ACY+4;c.fillRect(X-1,Y-18,2,26);c.fillRect(X-16,Y-16,32,2);c.fillRect(X-8,Y+8,16,2);
    for(const s of[-1,1]){const px=X+s*14;c.fillRect(px,Y-14,1,9);c.fillRect(px-6,Y-5,13,2);c.fillRect(px-5,Y-3,11,1)}c.restore();
    // light pools under the fighters
    for(const F of[B.me,B.foe,B.pL&&B.vL,B.pR&&B.vR]){if(!F||F.out||typeof F.x!=='number')continue;c.save();c.globalAlpha=0.16;c.fillStyle='#fff7d0';c.beginPath();c.ellipse(F.x,F.y+2,22,8,0,0,Math.PI*2);c.fill();c.restore()}
    return}
  if(layer!==1)return;
  // spotlights sweeping from the top corners
  c.save();c.globalCompositeOperation='lighter';for(const s of[-1,1]){const ox=s<0?18:AW-18,oy=58,a=Math.PI/2+s*(-0.55)+Math.sin(t*0.7+(s>0?1.7:0))*0.35,L=AH,w=0.13;
    c.globalAlpha=E.fin?0.11:0.08;c.fillStyle=E.fin?'#ffe8a0':'#d8e6ff';c.beginPath();c.moveTo(ox,oy);c.lineTo(ox+Math.cos(a-w)*L,oy+Math.sin(a-w)*L);c.lineTo(ox+Math.cos(a+w)*L,oy+Math.sin(a+w)*L);c.closePath();c.fill()}c.restore();
  // crowd with camera flashes
  for(const p of courtCrowd()){const bob=Math.round(Math.max(0,Math.sin(t*p.sp+p.ph))*(E.fin?3:2));c.fillStyle='#14141f';c.fillRect(p.x-4,p.y-bob-1,9,12);c.fillStyle=p.c;c.fillRect(p.x-3,p.y-bob+4,7,6);c.fillStyle=p.s;c.fillRect(p.x-2,p.y-bob,5,4);
    if(Math.sin(t*p.sp*0.9+p.ph*7)>0.995||(E.fin&&Math.sin(t*5+p.ph*13)>0.997)){c.fillStyle='#ffffff';c.fillRect(p.x-1,p.y-bob-3,4,3);c.globalAlpha=0.25;c.fillRect(p.x-6,p.y-bob-6,13,10);c.globalAlpha=1}}
  // gold embers in the final
  if(E.fin){B.emb=B.emb||[];if(B.emb.length<40&&Math.random()<0.5)B.emb.push({x:Math.random()*AW,y:AH+4,v:12+Math.random()*20,ph:Math.random()*6});
    B.emb=B.emb.filter(e=>{e.y-=e.v/60;const x=e.x+Math.sin(t*2+e.ph)*4;c.fillStyle=Math.sin(t*9+e.ph)>0?'#ffcb3d':'#ff9a3d';c.fillRect(Math.round(x),Math.round(e.y),2,2);return e.y>50})}
  // banner
  const txt=E.fin?'★ ENDKAMPF ★':`⚖ GERICHT · RUNDE ${E.r}/${E.R}`;c.save();c.font='7px "Press Start 2P",monospace';const w=c.measureText(txt).width+14,x=Math.round(ACX-w/2),y=ACY-ARY-14;
  c.fillStyle='#14141f';c.fillRect(x-2,y-2,w+4,16);c.fillStyle=E.fin?'#5a1010':'#1f2a48';c.fillRect(x,y,w,12);c.fillStyle=gold;c.fillRect(x,y,w,1);c.fillRect(x,y+11,w,1);
  c.restore();pxText(c,txt,ACX,y+9,E.fin&&Math.floor(now/400)%2?'#fff3c8':gold,6,'center');
  // big intro text for the final
  if(E.fin&&B.state!=='over'){B.finIntro=B.finIntro||now;const k=(now-B.finIntro)/2600;if(k<1){c.globalAlpha=k<.15?k/.15:k>.75?(1-k)/.25:1;pxText(c,'ENDKAMPF',ACX,ACY-4,'#ffcb3d',16,'center');pxText(c,'um den Turniersieg',ACX,ACY+14,'#fff3c8',6,'center');c.globalAlpha=1}}
}catch(e){}}}
