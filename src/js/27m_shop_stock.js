// ===== Copshop stock: every shop has a limited stock per product, refilled one unit at a time over (real) time =====
const STOCK={cap:[20,2],cap5:[3,6],great:[5,6],potion:[10,3],superp:[5,5],revive:[3,8],ether:[4,5],candy:[1,30]};   // [max, minutes per unit]
const STOCK_TM=[1,20];
function stockKey(){try{return shopTown().n}catch(e){return'shop'}}
function stockOf(k,tm){if(!RUN)return 0;const S=(RUN.stock=RUN.stock||{}),key=stockKey(),T=(S[key]=S[key]||{}),id=tm?'tm:'+k:k,[mx,min]=tm?STOCK_TM:(STOCK[k]||[99,1]),now=Date.now();
  let e=T[id];if(!e)e=T[id]={n:mx,t:now};
  if(e.n<mx){const add=Math.floor((now-e.t)/(min*60000));if(add>0){e.n=Math.min(mx,e.n+add);e.t=e.n>=mx?now:e.t+add*min*60000}}else e.t=now;
  return e.n}
function stockTake(k,tm){const S=RUN.stock[stockKey()],id=tm?'tm:'+k:k;const e=S[id];if(e.n>=(tm?STOCK_TM:(STOCK[k]||[99]))[0])e.t=Date.now();e.n--}
function stockNext(k,tm){const e=((RUN.stock||{})[stockKey()]||{})[tm?'tm:'+k:k];if(!e)return 0;const min=(tm?STOCK_TM:(STOCK[k]||[99,1]))[1];return Math.max(0,Math.ceil((e.t+min*60000-Date.now())/60000))}
{const _b=buy;buy=function(k){if(!RUN||!ITEMS[k])return;if(stockOf(k)<=0){toast(`${ITEMS[k].n} ist ausverkauft – Nachschub in ca. ${stockNext(k)} min.`);return}const m0=money(),e=RUN.stock[stockKey()][k],sv={n:e.n,t:e.t};stockTake(k);_b.apply(this,arguments);if(money()>=m0){Object.assign(e,sv);if($('#modal').classList.contains('on'))openShop()}}}
{const _b=buyTM;buyTM=function(k){if(!RUN)return;if(stockOf(k,1)<=0){toast(`TM ${MOVES[k].n} ist ausverkauft – Nachschub in ca. ${stockNext(k,1)} min.`);return}const m0=money(),e=RUN.stock[stockKey()]['tm:'+k],sv={n:e.n,t:e.t};stockTake(k,1);_b.apply(this,arguments);if(money()>=m0){Object.assign(e,sv);if($('#modal').classList.contains('on'))openShop()}}}
// shop window: stock next to every product, sold-out buttons disabled
{const _o=openShop;openShop=function(){const r=_o.apply(this,arguments);try{if(!$('#modal').classList.contains('on'))return r;
  document.querySelectorAll('#mbox [data-buy]').forEach(b=>{const k=b.dataset.buy,n=stockOf(k),mx=(STOCK[k]||[99])[0];const row=b.closest('.mvrow');const tag=document.createElement('span');tag.className='small';
    tag.style.cssText='display:block;color:'+(n?'#9aa1bd':'#ef4444');tag.textContent=n?`Lager ${n}/${mx}`:`ausverkauft · Nachschub in ${stockNext(k)} min`;b.insertAdjacentElement('afterend',tag);
    if(!n){b.disabled=true;b.classList.add('ghost')}if(row)row.style.flexWrap='wrap'});
  document.querySelectorAll('#mbox [data-btm]').forEach(b=>{const k=b.dataset.btm,n=stockOf(k,1);if(!n){b.disabled=true;b.classList.add('ghost');const tag=document.createElement('span');tag.className='small';tag.style.color='#ef4444';tag.textContent=`ausverkauft · ${stockNext(k,1)} min`;b.insertAdjacentElement('afterend',tag)}})}catch(e){console.warn(e)}return r}}
