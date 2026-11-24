/* Treffer-Rückmeldung:
   - PvP: "SEHR EFFEKTIV" usw. erst, wenn der Gegner-Client den Treffer bestätigt (KP sinken). Vorher zeigte der lokale
     Schuss-Kontakt die Wirkung auch dann, wenn der Gegner auf seinem Bildschirm schon ausgewichen war → Wirkung ohne Schaden.
   - "KNAPP DANEBEN!" / "KNAPP AUSGEWICHEN!", wenn ein Geschoss das Ziel um wenige Pixel verfehlt. */
{const _el=effLabel;effLabel=function(s,T){if(B&&B.mode==='duel'&&T===B.foe&&s&&B.me&&s.side===B.me.side){T.pendEff={mid:s.mid,t:performance.now()};return}return _el.apply(this,arguments)}
 window.effConfirm=function(F){const p=F&&F.pendEff;if(!p||performance.now()-p.t>1500)return;F.pendEff=null;F.effT=0;_el({side:B.me.side,mid:p.mid},F)}}
{const _sh=shotHit;shotHit=function(s,T){if(s)s.didHit=1;return _sh.apply(this,arguments)}}
const NEAR_PX=12;
function nearTick(){if(!B||B.tb||!B.shots||!B.me||!B.foe)return;const now=performance.now();B.nearT=B.nearT||new Map();
  const live=new Set();
  for(const s of B.shots){if(s.cap||!s.mid||!MOVES[s.mid]||(MOVES[s.mid].p||0)<=0||s.mel||s.nm)continue;const T=s.side===B.me.side?B.foe:B.me;if(!T||T.out||T.faint>0)continue;
    const id=s.id||s;live.add(id);const gap=Math.hypot(s.x-T.x,s.y-(T.y-12))-((s.r||4)+11);let e=B.nearT.get(id);if(!e){e={gap,T,mine:s.side===B.me.side,s};B.nearT.set(id,e)}
    if(gap<e.gap)e.gap=gap;if(s.didHit)e.hit=1}
  for(const[id,e]of B.nearT){if(live.has(id)&&!e.s.dead)continue;B.nearT.delete(id);if(e.hit||e.s.didHit||e.gap<=0||e.gap>NEAR_PX)continue;const T=e.T;if(!T||(T.nearLT&&now-T.nearLT<700))continue;T.nearLT=now;
    B.nums.push({x:T.x,y:T.y-58,t:e.mine?'KNAPP DANEBEN!':'KNAPP AUSGEWICHEN!',c:e.mine?'#ff9a3d':'#7fd0ff',at:now,sz:9,life:1000})}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{nearTick()}catch(e){console.error(e)}}}
