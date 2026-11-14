/* ===================== UTIL ===================== */
const $=s=>document.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function validColor(c){return typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?c:'#888888'}
function cleanName(n){return String(n==null?'':n).replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g,'').trim().slice(0,16)||'Player'}
function hpColor(r){return r>.5?'#3ddc6b':r>.2?'#f2c230':'#ef4444'}
function hex2rgb(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function shade(h,k){return'#'+hex2rgb(h).map(v=>Math.max(0,Math.min(255,Math.round(v*(1+k)))).toString(16).padStart(2,'0')).join('')}
function fmt(ms){ms=Math.max(0,ms);const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
let toastT=0;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2800)}

