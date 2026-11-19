/* ===================== VERSION ===================== */
// bump with every release (MAJOR.MINOR.PATCH). Players can only share lobbies/duels with the same version.
const VERSION='0.99.0';
// access password: changes every Monday 00:00 (local time). Only the hashes are stored here (one per week from PW_W0);
// the password itself also keys the P2P room, so clients without the current one cannot connect. The plain list lives offline.
const PW_KEY='knast_pw',PW_W0=Date.UTC(2026,10,16),PW_WH=[3239358969,4147130060,2718625794,3495965776,1618054998,4028240764,3044289461,1207180107,4242648729,353861226,2672313786,600614717,407529519,2270237167,3207113251,1525244515,870970040,319006638,3847934078,944313310,2153038366,3950944742,2733334548,4002544240,2736690288,645338530,1884329338,4268902487,2483246182,3828308270,2182929315,3152020422,1311886195,3461060417,3407580460,2544240283,1017220184,1277844250,4288535363,461397931,853058720,2065298771,219387161,3215594984,1108518435,2250837220,3171827014,1035538317,1537090466,1716649754,2848461661,1266925999,653943759,1307642793,3319845926,629631788,4180878311,1080582197,4114403588,2360104553,3811730973,3337788437,695971354,2424950805],MAX_ROOM=10,MAX_LOBBY=5;
function pwWeek(){const n=new Date();return Math.floor((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-PW_W0)/6048e5)}
function pwHash(s){let h=2166136261;s='knast:'+s;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function pwCheck(v){if(!v)return false;if(typeof window!=='undefined'&&window.PW_TEST&&v==='TEST')return true;const w=pwWeek();return w>=0&&w<PW_WH.length&&pwHash(v)===PW_WH[w]}
function pwGet(){try{const v=localStorage.getItem(PW_KEY)||'';return pwCheck(v)?v:''}catch(e){return''}}
function pwOK(){return!!pwGet()}
function cmpV(a,b){const x=String(a||'0').split('.').map(Number),y=String(b||'0').split('.').map(Number);for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d}return 0}
