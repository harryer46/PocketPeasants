/* ===================== VERSION ===================== */
// bump with every release (MAJOR.MINOR.PATCH). Players can only share lobbies/duels with the same version.
const VERSION='0.85.0';
// access password: only its hash is stored here; the password itself also keys the P2P room, so clients without it cannot connect
const PW_KEY='knast_pw',PW_H=2361915375,MAX_ROOM=10,MAX_LOBBY=5;
function pwHash(s){let h=2166136261;s='knast:'+s;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function pwCheck(v){return!!v&&pwHash(v)===PW_H}
function pwGet(){try{const v=localStorage.getItem(PW_KEY)||'';return pwCheck(v)?v:''}catch(e){return''}}
function pwOK(){return!!pwGet()}
function cmpV(a,b){const x=String(a||'0').split('.').map(Number),y=String(b||'0').split('.').map(Number);for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d}return 0}
