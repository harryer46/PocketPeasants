/* ===================== VM-SPERREN AUF DEN ROUTEN (v0.125) =====================
   Like the HMs of the originals, the way on is blocked by obstacles you can only clear with a field license:
   small trees (ZERSCHNEIDER) on every way into the Lahribarer Gebirge, boulders (STÄRKE) on every way into the
   Unterwertheimer Canyon. The places are a minimum vertex cut between Villingen and the target town (max flow on the
   tile grid), restricted to the gated area, so every path – roads, shortcuts, meadows – runs through an obstacle. */
function vmCut(target,area,blocked){const N=MW*MH,INF=1e9;
  const ok=i=>{const x=i%MW,y=(i-x)/MW;if(x<1||y<1||x>=MW-1||y>=MH-1)return false;const t=MAP[i];return(WALK0.has(t)||!!(LEDGE_DIR&&LEDGE_DIR[t]))&&t!==3&&!blocked.has(i)};
  const tr=new Set(TRAINERS.filter(t=>t.y<MH).map(t=>t.y*MW+t.x));for(const t of tollSpots())tr.add(t.y*MW+t.x);
  const cap=i=>{if(SIGNSET.has(i))return 0;if(tr.has(i))return INF;const t=MAP[i];if(BIOME[i]!==area||t===27||t===36||t===13||ENC.has(t)&&false)return INF;
    const x=i%MW,y=(i-x)/MW;if(TRAINERS.some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<=1&&q.y<MH)||fieldAt(x,y))return INF;return 1};
  const C=new Float64Array(N);for(let i=0;i<N;i++)C[i]=ok(i)?cap(i):0;
  const fn=new Float64Array(N),fe=new Float64Array(N*4),D=[1,-1,MW,-MW],RV=[1,0,3,2];
  const s=VSPAWN.y*MW+VSPAWN.x,t=target;let flow=0;
  const aug=()=>{const prev=new Int32Array(2*N).fill(-1),q=new Int32Array(2*N);let h=0,n=0;const S=2*s+1;prev[S]=S;q[n++]=S;
    while(h<n){const u=q[h++],i=u>>1,out=u&1;if(!out&&i===t)break;
      const push=v=>{if(prev[v]<0){prev[v]=u;q[n++]=v}};
      if(!out){if(C[i]-fn[i]>0)push(2*i+1);for(let d=0;d<4;d++){const j=i-D[d];if(j>=0&&j<N&&fe[j*4+d]>0)push(2*j+1)}}
      else{if(fn[i]>0&&i!==s)push(2*i);for(let d=0;d<4;d++){const j=i+D[d];if(j>=0&&j<N&&C[j]>0)push(2*j)}}}
    if(prev[2*t]<0)return false;
    for(let v=2*t;v!==2*s+1;){const u=prev[v],i=u>>1,j=v>>1;
      if((u&1)===0&&(v&1)===1&&i===j)fn[i]++;else if((u&1)===1&&(v&1)===0&&i===j)fn[i]--;
      else if((u&1)===1){const d=D.indexOf(j-i);const r=fe[j*4+RV[d]];if(r>0)fe[j*4+RV[d]]--;else fe[i*4+d]++}
      else{const d=D.indexOf(i-j);fe[j*4+d]--}v=u}return true};
  while(flow<12&&aug())flow++;if(flow>=12)return null;
  // cut = cap-1 tiles whose in-node is reachable in the residual graph from the source and whose out-node is not
  const seen=new Uint8Array(2*N),q=[2*s+1];seen[2*s+1]=1;while(q.length){const u=q.pop(),i=u>>1,out=u&1;const go=v=>{if(!seen[v]){seen[v]=1;q.push(v)}};
    if(!out){if(C[i]-fn[i]>0)go(2*i+1);for(let d=0;d<4;d++){const j=i-D[d];if(j>=0&&j<N&&fe[j*4+d]>0)go(2*j+1)}}
    else{if(fn[i]>0&&i!==s)go(2*i);for(let d=0;d<4;d++){const j=i+D[d];if(j>=0&&j<N&&C[j]>0)go(2*j)}}}
  const cut=[];for(let i=0;i<N;i++)if(C[i]===1&&seen[2*i]&&!seen[2*i+1])cut.push(i);return cut}
const VM_GATES=[];
(function placeVmGates(){try{const blocked=new Set();const town=id=>{const T=TOWNS.find(t=>t.id===id);return T?T.y*MW+T.x:null};
  const reach=(from,blk)=>{const seen=new Uint8Array(MW*MH),q=[from];seen[from]=1;while(q.length){const i=q.pop();for(const j of[i-1,i+1,i-MW,i+MW]){if(j<0||j>=MW*MH||seen[j]||blk.has(j))continue;const t=MAP[j];if(!(WALK0.has(t)||(LEDGE_DIR&&LEDGE_DIR[t]))||t===3)continue;seen[j]=1;q.push(j)}}return seen};
  const giver=id=>{const t=TRAINERS.find(q=>q.id===id);return t?t.y*MW+t.x:null};
  let id=900;
  for(const[kind,tid,area,needs]of[['cut','lah',6,'rita'],['str','unt',7,'hank']]){const tg=town(tid);if(tg==null)continue;const cut=vmCut(tg,area,blocked);
    if(!cut||!cut.length){console.warn('vm gate: no cut for',tid);continue}
    // the trainer handing out the license must stay reachable without it
    const all=new Set([...blocked,...cut]),g=giver(needs),R=reach(VSPAWN.y*MW+VSPAWN.x,all);
    const near=g!=null&&[g-1,g+1,g-MW,g+MW].some(j=>R[j]);if(!near){console.warn('vm gate: license giver cut off',kind);continue}
    for(const i of cut){blocked.add(i);const x=i%MW,y=(i-x)/MW;FIELD.push({id:id++,x,y,kind,vm:1});VM_GATES.push({kind,x,y,area})}}
  }catch(e){console.error('vm gates',e)}})();
