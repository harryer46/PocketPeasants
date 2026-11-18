/* ===================== EP GAIN EFFECTS =====================
   epPop: floating "+N EP" with a burst of pixel sparks; with a target element (an EP bar) the sparks fly into it and it glows.
   Every gainXp() shows its EP (and a LEVEL UP banner); in the study hall each correct answer pops at the clicked answer
   and its sparks fly into the EP bar, the bar fills smoothly at the end. */
function epPop(x,y,txt,opt){opt=opt||{};try{
  const el=document.createElement('div');el.className='epfx'+(opt.big?' big':'')+(opt.lvl?' lvl':'');el.textContent=txt;el.style.left=x+'px';el.style.top=y+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),opt.lvl?2000:1500);
  if(opt.lvl)return;const to=opt.to&&opt.to.isConnected?opt.to:null,tg=to&&to.getBoundingClientRect(),n=opt.n||(opt.big?18:10);
  for(let i=0;i<n;i++){const p=document.createElement('i');p.className='epp';p.style.left=x+'px';p.style.top=y+'px';document.body.appendChild(p);
    const a=Math.random()*Math.PI*2,r=24+Math.random()*(opt.big?70:40),dx=Math.cos(a)*r,dy=Math.sin(a)*r-20;
    const tx=tg?tg.left+tg.width*(.2+.6*Math.random())-x:dx*1.6,ty=tg?tg.top+tg.height/2-y:dy-50;
    const an=p.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy}px)`,opacity:1,offset:.35},{transform:`translate(${tx}px,${ty}px) scale(${tg?.6:.3})`,opacity:tg?1:0}],{duration:650+i*35,easing:'cubic-bezier(.4,0,.6,1)'});
    an.onfinish=()=>p.remove()}
  if(to)setTimeout(()=>{if(!to.isConnected)return;to.classList.remove('epglow');void to.offsetWidth;to.classList.add('epglow')},700+n*20)}catch(e){}}
function epCenter(){const st=$('#stage'),r=st?st.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight};return{x:r.left+r.width/2,y:r.top+r.height*0.38}}
{const _gx=gainXp;gainXp=function(m,amt){const l0=m&&m.l,out=_gx.apply(this,arguments);try{if(!m||!G)return out;const real=Math.round(amt*((RUN&&RUN.cfg&&RUN.cfg.xp)||1));
    if(gainXp.quiet){gainXp.quiet=0;}else{const box=$('#sbox'),r=box&&box.offsetParent?box.getBoundingClientRect():null,c=r?{x:r.left+r.width/2,y:r.top+r.height*0.3}:epCenter();
      const nw=performance.now();gainXp.k=nw-(gainXp.t||0)<400?(gainXp.k||0)+1:0;gainXp.t=nw;setTimeout(()=>epPop(c.x,c.y+gainXp.k*0,`+${real} EP`+(gainXp.k||!r?' · '+SPECIES[m.s].n:''),{big:real>=50,to:box&&box.offsetParent?box.querySelector('.sbar'):null}),gainXp.k*350)}
    if(m.l>l0){const c=epCenter();setTimeout(()=>epPop(c.x,c.y+40,`LEVEL UP! ${SPECIES[m.s].n} Lv ${m.l}`,{lvl:1}),500)}}catch(e){}return out}}
// study hall: pop at the right answer when it is chosen, sparks into the EP bar
{const _sa=studyAnswer;studyAnswer=function(k){const was=ST&&ST.state==='ask',p0=ST?(ST.pend||0):0;const btn=document.querySelector(`#sbox .sa[data-k="${k}"]`),br=btn&&btn.getBoundingClientRect();
  const r=_sa.apply(this,arguments);try{if(was&&ST&&ST.qs[ST.i]&&ST.qs[ST.i].right){const add=Math.round((ST.pend-p0)*((RUN.cfg&&RUN.cfg.xp)||1));const ok=document.querySelector('#sbox .sa.ok'),q=(ok||btn)&&(ok||btn).getBoundingClientRect()||br;
      if(q)epPop(q.left+q.width/2,q.top+q.height/2,`+${add} EP`,{to:document.querySelector('#sbox .sbar'),n:12})}}catch(e){}return r}}
// the study EP bar fills smoothly instead of jumping (also across a level-up)
{const _rs=renderStudy;renderStudy=function(){const old=ST&&ST._xpR;const r=_rs.apply(this,arguments);try{if(!ST||!ST.m)return r;const bar=document.querySelector('#sbox .sbar i');if(!bar)return r;
    const now=clamp(ST.m.xp/xpNeed(ST.m.l),0,1),lv=ST.m.l,ol=ST._xpL;ST._xpR=now;ST._xpL=lv;if(old==null||(old===now&&ol===lv))return r;
    bar.style.transition='none';bar.style.width=(old*100)+'%';void bar.offsetWidth;bar.style.transition='';
    if(ol!=null&&lv>ol){bar.style.width='100%';setTimeout(()=>{if(!bar.isConnected)return;bar.style.transition='none';bar.style.width='0%';void bar.offsetWidth;bar.style.transition='';bar.style.width=(now*100)+'%'},720)}else bar.style.width=(now*100)+'%'}catch(e){}return r}}
