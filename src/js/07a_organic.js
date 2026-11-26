/* ===================== ORGANIC CAVES (v0.125) =====================
   Helpers that turn the old box rooms and straight corridors of the underground into grown caves:
   blob rooms with a wobbly rim and winding tunnels. Deterministic (seeded), so every player gets the same world. */
// blob inside the rectangle R={x,y,w,h}; the centre cross is always floor. Returns the list of carved cells.
function orgBlob(R,rng,put,o){o=o||{};const hw=R.w/2,hh=R.h/2,cx=R.x+hw-0.5,cy=R.y+hh-0.5,cells=[];
  const ph=[rng()*6.283,rng()*6.283,rng()*6.283],A=o.amp??1,am=[A*(0.09+rng()*0.06),A*(0.05+rng()*0.04),A*0.03];
  for(let y=R.y;y<R.y+R.h;y++)for(let x=R.x;x<R.x+R.w;x++){const dx=(x-cx)/hw,dy=(y-cy)/hh,e=o.box?Math.max(Math.abs(dx),Math.abs(dy))*0.9+Math.hypot(dx,dy)*0.1:Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    const lim=1.04-am[0]*(1+Math.sin(2*a+ph[0]))-am[1]*(1+Math.sin(3*a+ph[1]))-am[2]*(1+Math.sin(5*a+ph[2]))+(rng()-0.5)*0.07;
    if(e<lim||(Math.abs(x-Math.round(cx))<=1&&Math.abs(y-Math.round(cy))<=1)){put(x,y);cells.push([x,y])}}
  return cells}
// winding 4-connected tunnel from a to b; w=1 or 2 tiles wide; wob = chance of a sideways step (drift ≤ maxOff)
function orgTunnel(ax,ay,bx,by,rng,put,o){o=o||{};const w=o.w||1,wob=o.wob??0.3,maxOff=o.maxOff??2,cells=[];let x=ax,y=ay,off=0,n=0;
  const add=(X,Y)=>{put(X,Y);if(w>1){put(X+1,Y);put(X,Y+1);put(X+1,Y+1)}cells.push([X,Y])};add(x,y);
  while((x!==bx||y!==by)&&n++<600){const dx=bx-x,dy=by-y,horiz=Math.abs(dx)>=Math.abs(dy);
    if(Math.abs(dx)+Math.abs(dy)>3&&rng()<wob){const s=rng()<0.5?-1:1;if(Math.abs(off+s)<=maxOff){off+=s;if(horiz)y+=s;else x+=s;add(x,y);continue}}
    if(rng()<Math.abs(dx)/(Math.abs(dx)+Math.abs(dy)))x+=Math.sign(dx);else y+=Math.sign(dy);add(x,y)}
  while(x!==bx){x+=Math.sign(bx-x);add(x,y)}while(y!==by){y+=Math.sign(by-y);add(x,y)}
  return cells}
// 4-neighbour flood fill on a local grid; pass(i) says whether a cell is open
function orgReach(W,H,s,pass){const seen=new Uint8Array(W*H),q=[s];seen[s]=1;while(q.length){const i=q.pop(),x=i%W,y=(i-x)/W;
    for(const j of[x>0?i-1:-1,x<W-1?i+1:-1,y>0?i-W:-1,y<H-1?i+W:-1])if(j>=0&&!seen[j]&&pass(j)){seen[j]=1;q.push(j)}}return seen}
