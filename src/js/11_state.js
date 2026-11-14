/* ===================== STATE ===================== */
const SAVE_KEY='mwo-v2';
let G=null,RUN=null,B=null,T=0;
const P={x:30,y:24,fx:30,fy:24,d:'down',moving:false,mt:0,sx:0,sy:0,tx:0,ty:0,ph:0,steps:0,fol:{x:30,y:24,tx:30,ty:24}};
let NO_SAVE=false;function save(){if(!G||NO_SAVE)return;G.run=RUN;G.t=Date.now();if(RUN&&RUN.free)G.freeRun=RUN;try{localStorage.setItem(SAVE_KEY,JSON.stringify(G))}catch(e){}}
addEventListener('pagehide',()=>{try{save()}catch(e){}});document.addEventListener('visibilitychange',()=>{if(document.hidden)try{save()}catch(e){}});
function loadSave(){try{const s=localStorage.getItem(SAVE_KEY);if(s){const g=JSON.parse(s);if(g&&g.name){g.dex=g.dex||{};g.tro=g.tro||0;return g}}}catch(e){}return null}

