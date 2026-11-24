/* EP-Teilung: Wer gegen das besiegte Gegner-Monster im Kampf war (auch nur kurz, per Wechsel), bekommt einen Teil der EP.
   Gewichtung nach Level-Abstand zum Gegner: niedrigere Level bekommen mehr, höhere weniger (Faktor 0,35…3). Summe bleibt gleich. */
let XP_LAST_REAL=null;
function xpPartTick(){if(!B||!B.me||!B.foe||(B.mode!=='wild'&&B.mode!=='trainer'))return;const key=B.foe.a+'|'+(B.foe.team.length);
  if(B.partKey!==key){B.partKey=key;B.part=new Set()}const F=B.me;if(F.out||F.faint>0||!(F.spawnT<=performance.now()))return;const a=act(F);if(a&&a.hp>0)B.part.add(F.a)}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{xpPartTick()}catch(e){}}}
{const _gx=gainXp;gainXp=function(m,amt){XP_LAST_REAL=null;
  try{if(B&&(B.mode==='wild'||B.mode==='trainer')&&RUN&&m&&m===RUN.team[B.me.a]&&B.part&&!gainXp._sharing){
    const foeLv=(act(B.foe)||{}).l||m.l,ids=[...B.part].filter(i=>RUN.team[i]&&RUN.team[i].hp>0&&B.me.team[i]&&B.me.team[i].hp>0);if(!ids.includes(B.me.a))ids.push(B.me.a);
    if(ids.length>1){const w=i=>clamp(Math.pow((foeLv+10)/(RUN.team[i].l+10),2),0.35,3),sw=ids.reduce((s,i)=>s+w(i),0);
      const share=i=>Math.max(1,Math.round(amt*w(i)/sw));gainXp._sharing=1;let out;
      try{for(const i of ids){if(i===B.me.a)continue;const o=RUN.team[i],msgs=_gx(o,share(i));msgs[0]=msgs[0].replace(' EP!',' EP (geteilt)!');msgs.forEach(t=>say(t));Object.assign(B.me.team[i],battler(o))}
        out=_gx(m,share(B.me.a));out[0]=out[0].replace(' EP!',' EP (geteilt)!');XP_LAST_REAL=Math.round(share(B.me.a)*((RUN.cfg&&RUN.cfg.xp)||1))}finally{gainXp._sharing=0}
      B.part=new Set();return out}}}catch(e){console.error(e)}
  return _gx.apply(this,arguments)}}
