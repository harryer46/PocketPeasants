/* ===================== STORY WORLD =====================
   Underground dungeons for the four legendary FEM monsters (Schlagstock, Taser, Pfefferspray, Kelle) in the rows MH..MHT
   below the overworld, cave entrances at their old shrines, PPLK examiners in the four training towns and the
   career advisor in Villingen. Everything here is deterministic, so every player gets the same world. */
const T_CAVE=36;WALK0.add(T_CAVE);
// law book → training town → dungeon (ordered by difficulty)
const DUNGEONS=[
  {id:'kelle',n:'Damentaler Wurzelhöhle',law:'GG',town:'dam',b:2,floor:14,enc:17,wall:2,lv:[15,19],leg:20},
  {id:'pfefferspray',n:'Marderacher Brandungsgrotte',law:'StPO',town:'mar',b:3,floor:5,enc:18,wall:16,lv:[18,22],leg:23},
  {id:'schlagstock',n:'Lahribarer Eisstollen',law:'PolG',town:'lah',b:6,floor:28,enc:24,wall:31,lv:[23,27],leg:28},
  {id:'taser',n:'Mostbacher Dschungelbunker',law:'StGB',town:'unt',b:8,floor:30,enc:26,wall:2,lv:[28,32],leg:33}];
const PPLK={dam:{law:'GG',n:'PPLK-Prüfer Menschenwürde',lv:14},mar:{law:'StPO',n:'PPLK-Prüferin Beweiskette',lv:17},lah:{law:'PolG',n:'PPLK-Prüfer Generalklausel',lv:22},unt:{law:'StGB',n:'PPLK-Prüferin Tatbestand',lv:27}};
const MOST={x:251,y:111,r:26,lv:[34,42]};   // Mostbach: Einsatzzentrum with the strongest monsters
function dungeonAt(x,y){if(y<MH)return null;return DUNGEONS.find(d=>x>=d.x0&&x<d.x0+d.w&&y>=d.y0&&y<d.y0+d.h)||null}
function storyLv(x,y){const dg=dungeonAt(x,y);if(dg)return dg.lv[0]+((x*7+y*13)%(dg.lv[1]-dg.lv[0]+1));
  const d=Math.hypot(x-MOST.x,y-MOST.y);if(d<MOST.r&&y<MH)return Math.round(MOST.lv[1]-(MOST.lv[1]-MOST.lv[0])*d/MOST.r);return 0}
(function genStory(){
  const near=(cx,cy,r0,r1,ok)=>{for(let r=r0;r<=r1;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=cx+dx,y=cy+dy;if(ok(x,y))return{x,y}}return null};
  const used=new Set();
  // an NPC must stand in the open (all 8 neighbours walkable) so it never closes a path
  const open=(x,y)=>{if(used.has(x+','+y))return false;const t=tget(x,y);if(!WALK0.has(t)||ENC.has(t)||[7,12,13,22,23,27,T_CAVE].includes(t)||LEDGE_DIR[t])return false;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const q=tget(x+dx,y+dy);if(!WALK0.has(q)||[7,12,22,23].includes(q))return false}
    if(TRAINERS.some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<3))return false;return true};
  const put=(t,cx,cy)=>{const s=near(cx,cy,2,12,open)||{x:cx,y:cy};used.add(s.x+','+s.y);Object.assign(t,{x:s.x,y:s.y,d:'down'});TRAINERS.push(t);return t};
  // career advisor right next to the start in Villingen
  put({id:'berater',story:'berater',n:'Karriereberater Gnädig',c:'#c9a227',team:[],reward:0,line:'',after:''},VSPAWN.x+2,VSPAWN.y-1);
  for(const id in PPLK){const T=TOWNS.find(t=>t.id===id);if(!T)continue;const p=PPLK[id];put({id:'pplk_'+id,story:'pplk',town:id,law:p.law,n:p.n,c:'#6b2fb3',team:[],reward:5,line:'',after:''},T.x,T.y)}
  // ---- dungeons: 3×3 rooms connected in a snake from the entrance (bottom left) to the shrine (top right)
  DUNGEONS.forEach((dg,i)=>{const L=LEGENDS.find(l=>l.id===dg.id);if(!L)return;const r=mulberry32(7100+i*31);const ri=n=>Math.floor(r()*n);
    dg.x0=3+i*74;dg.y0=MH+2;dg.w=70;dg.h=DH-4;
    for(let y=dg.y0;y<dg.y0+dg.h;y++)for(let x=dg.x0;x<dg.x0+dg.w;x++){tset(x,y,dg.wall!==31&&r()<0.07?16:dg.wall);BIOME[y*MW+x]=dg.b}
    const cw=Math.floor((dg.w-2)/3),ch=Math.floor((dg.h-2)/3),rooms=[];
    for(let ry=0;ry<3;ry++)for(let rx=0;rx<3;rx++){const w=8+ri(Math.max(1,cw-12)),h=6+ri(Math.max(1,ch-10));const x=dg.x0+1+rx*cw+1+ri(Math.max(1,cw-w-2)),y=dg.y0+1+ry*ch+1+ri(Math.max(1,ch-h-2));rooms[ry*3+rx]={x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)}}
    const order=[6,7,8,5,4,3,0,1,2].map(k=>rooms[k]);dg.rooms=order;
    const floor=(x,y)=>{if(dungeonAt(x,y)===dg||(x>=dg.x0&&x<dg.x0+dg.w&&y>=dg.y0&&y<dg.y0+dg.h))tset(x,y,dg.floor)};
    for(const R of order)for(let y=R.y;y<R.y+R.h;y++)for(let x=R.x;x<R.x+R.w;x++)floor(x,y);
    for(let k=1;k<order.length;k++){const a=order[k-1],b=order[k];const hFirst=r()<0.5;
      const lineH=(x0,x1,y)=>{for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++){floor(x,y);floor(x,y+1)}},lineV=(y0,y1,x)=>{for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++){floor(x,y);floor(x+1,y)}};
      if(hFirst){lineH(a.cx,b.cx,a.cy);lineV(a.cy,b.cy,b.cx)}else{lineV(a.cy,b.cy,a.cx);lineH(a.cx,b.cx,b.cy)}}
    // patches of tall grass (wild monsters) in the rooms between entrance and shrine
    for(let k=1;k<order.length-1;k++){const R=order[k];for(let n=0;n<2;n++){const px=R.x+1+ri(Math.max(1,R.w-2)),py=R.y+1+ri(Math.max(1,R.h-2)),rr=2+ri(2);
      for(let y=py-rr;y<=py+rr;y++)for(let x=px-rr-1;x<=px+rr+1;x++)if(x>R.x&&x<R.x+R.w-1&&y>R.y&&y<R.y+R.h-1&&((x-px)/(rr+1))**2+((y-py)/rr)**2<=1&&!(Math.abs(x-R.cx)<=1&&Math.abs(y-R.cy)<=1))tset(x,y,dg.enc)}}
    // entrance room: exit hole in its bottom wall, players arrive just above it
    const S=order[0];dg.sx=S.cx;dg.sy=S.y+S.h-1;tset(S.cx,S.y+S.h,T_CAVE);tset(dg.sx,dg.sy,dg.floor);
    // shrine room with the legendary monster
    const Gr=order[8];for(let y=Gr.cy-1;y<=Gr.cy+1;y++)for(let x=Gr.cx-1;x<=Gr.cx+1;x++)tset(x,y,13);
    // cave entrance on the overworld where the shrine used to be
    dg.ex=L.x;dg.ey=L.y;tset(L.x,L.y,T_CAVE);L.ex=L.x;L.ey=L.y;L.x=Gr.cx;L.y=Gr.cy;L.l=dg.leg;L.dg=dg.id;
    // two task-force leaders guard the way (fixed teams from the dungeon's law book)
    const pool=(typeof lawSpecies==='function'?lawSpecies(dg.law):[]).filter(s=>SPECIES[s]&&RAR[s]!=='legendary');
    [2,5].forEach((k,j)=>{const R=order[k];const t={id:'dg_'+dg.id+'_'+j,n:['Einsatzleiter','Einsatzleiterin'][j]+' '+['Razzia','Zugriff','Lage','Absperrung'][(i+j)%4],c:['#7a2a2a','#2a4a7a'][j],fixed:true,
      team:[0,1,2].map(q=>[pool.length?pool[(i*5+j*3+q*7)%pool.length]:'owigon',dg.lv[1]+1+q]),reward:4,line:'Durchsuchung läuft! Hier kommst du nur mit Kampf weiter.',after:'Der Beschluss ist echt. Weitermachen.'};
      const s=near(R.cx,R.cy,1,6,(x,y)=>tget(x,y)===dg.floor&&!used.has(x+','+y)&&WALK0.has(tget(x-1,y))&&WALK0.has(tget(x+1,y)));if(!s)return;used.add(s.x+','+s.y);Object.assign(t,{x:s.x,y:s.y,d:j?'left':'down'});TRAINERS.push(t)});
  });
})();
