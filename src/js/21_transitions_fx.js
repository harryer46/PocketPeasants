/* ===================== TRANSITIONS / FX ===================== */
let FX=null;const fxcv=$('#fxcv'),fxc=fxcv.getContext('2d');
// kind: 'wild' | 'trainer' | 'legend' | 'fade'. mid() runs when the screen is fully covered.
function transition(kind,mid,cover,uncover){FX={kind,t0:performance.now(),cover:cover||(kind==='fade'?320:kind==='legend'?1100:850),uncover:uncover||300,mid,midDone:false};held.length=0}
function drawFX(){
  if(!FX){if(fxcv.width){fxcv.width=0;fxcv.height=0}return}
  const st=$('#stage');const W=st.clientWidth,H=st.clientHeight;if(fxcv.width!==W||fxcv.height!==H){fxcv.width=W;fxcv.height=H}
  const c=fxc;c.clearRect(0,0,W,H);const now=performance.now(),el=now-FX.t0;
  let k;if(el<FX.cover)k=el/FX.cover;else{if(!FX.midDone){FX.midDone=true;try{FX.mid&&FX.mid()}catch(e){console.error(e)}}k=1-(el-FX.cover)/FX.uncover}
  if(el>FX.cover+FX.uncover||el>6000){if(!FX.midDone){FX.midDone=true;try{FX.mid&&FX.mid()}catch(e){}}FX=null;c.clearRect(0,0,W,H);$('#stage').style.transform='';return}
  const covering=el<FX.cover;c.fillStyle='#000';
  if(FX.kind==='fade'){c.globalAlpha=clamp(k,0,1);c.fillRect(0,0,W,H);c.globalAlpha=1;return}
  if(!covering){c.globalAlpha=clamp(k,0,1);c.fillRect(0,0,W,H);c.globalAlpha=1;return}
  if(FX.kind==='wild'){
    // three white flashes, then horizontal bands slide in alternately
    if(k<0.35){if(Math.floor(k/0.35*6)%2===0){c.fillStyle='#ffffff';c.globalAlpha=0.85;c.fillRect(0,0,W,H);c.globalAlpha=1}return}
    const q=(k-0.35)/0.65,n=10,bh=Math.ceil(H/n);for(let i=0;i<n;i++){const w=W*q;if(i%2)c.fillRect(0,i*bh,w,bh);else c.fillRect(W-w,i*bh,w,bh)}
  }else if(FX.kind==='trainer'){
    // diagonal stripes sweeping across
    const n=12,sz=Math.hypot(W,H)/n;c.save();c.translate(W/2,H/2);c.rotate(-0.6);for(let i=-n;i<n;i++){const ph=clamp(k*1.6-Math.abs(i)/n*0.6,0,1);c.fillRect(-W,i*sz,(W*2)*ph,sz*0.55);c.fillRect(W-(W*2)*ph,i*sz+sz*0.5,(W*2)*ph,sz*0.55)}c.restore();
  }else{
    // legendary: screen shakes, golden flashes, then closing circle
    if(k<0.45){const a=Math.floor(k*30)%2;c.fillStyle=a?'#ffcb3d':'#ffffff';c.globalAlpha=0.35+0.4*Math.sin(k*40)**2;c.fillRect(0,0,W,H);c.globalAlpha=1;st.style.transform=`translate(${(Math.random()-.5)*10}px,${(Math.random()-.5)*10}px)`;return}
    st.style.transform='';const q=(k-0.45)/0.55;const R=Math.hypot(W,H)/2*(1-q);c.beginPath();c.rect(0,0,W,H);c.arc(W/2,H/2,Math.max(0,R),0,7,true);c.fill('evenodd');
  }
}

