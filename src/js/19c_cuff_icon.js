// eigenes Pixel-Icon für Handschellen (statt ⛓-Kette): zwei Stahlbügel mit Schlosskasten und kurzer Kette
const CUFF_URL=(()=>{try{const W=26,H=15,c=mk(W,H),x=c.getContext('2d'),px=(a,b,col)=>{x.fillStyle=col;x.fillRect(a,b,1,1)};
  // two thin steel bracelets, each with its lock housing on the outside, joined by a short chain in the middle
  for(const[cx,side]of[[6.5,-1],[19.5,1]]){const cy=7.5;for(let y=0;y<H;y++)for(let X=0;X<W;X++){const d=Math.hypot(X+0.5-cx,(y+0.5-cy)*1.08);if(d<=5.9&&d>=3.4){const edge=d>5.1||d<4.1;px(X,y,edge?'#14141f':(y+0.5<cy-1?'#ffffff':y+0.5>cy+2?'#8a8ea6':'#c8ccd8'))}}
    const hx=side<0?0:W-5;x.fillStyle='#14141f';x.fillRect(hx,8,5,6);x.fillStyle='#6b7080';x.fillRect(hx+1,9,3,4);x.fillStyle='#9aa0ac';x.fillRect(hx+1,9,3,1);x.fillStyle='#14141f';x.fillRect(hx+2,11,1,1)}
  const link=(lx,ly,w,h)=>{x.fillStyle='#14141f';x.fillRect(lx,ly,w,h);x.fillStyle='#c8ccd8';x.fillRect(lx+1,ly+1,w-2,h-2);x.fillStyle='#14141f';if(w>3)x.fillRect(lx+2,ly+1,w-4,h-2)};
  link(11,6,4,3);link(13,5,0,0);link(14,6,3,3);link(16,6,0,0);
  return c.toDataURL()}catch(e){return''}})();
function cuffIcon(px){px=px||16;return`<img class="cuff" src="${CUFF_URL}" alt="Handschellen" style="width:${px}px;height:${Math.round(px*15/26)}px;image-rendering:pixelated;vertical-align:-2px">`}
ITEMS.cap.i=cuffIcon(24);ITEMS.cap5.i=cuffIcon(24);
