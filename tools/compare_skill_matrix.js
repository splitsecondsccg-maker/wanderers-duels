#!/usr/bin/env node
const fs=require("fs"), path=require("path"), {spawnSync}=require("child_process");
function arg(n,f){const i=process.argv.indexOf("--"+n);return i>=0?process.argv[i+1]:f;}
const games=Number(arg("games","200")), seed=Number(arg("seed","72000")), root=process.cwd();
const configs=[["old","old"],["smart","smart"],["smart","old"],["old","smart"]];
const all=[];
for(let i=0;i<configs.length;i++){
  const [a,b]=configs[i];
  const res=spawnSync("node",["tools/simulate_balance_policy_matrix.js","--games",String(games),"--seed",String(seed+i*101),"--policyA",a,"--policyB",b],{cwd:root,encoding:"utf8",stdio:["ignore","ignore","pipe"]});
  if(res.status!==0){console.error(res.stderr);process.exit(res.status);}
  const rep=JSON.parse(fs.readFileSync(path.join(root,"balance_reports","latest.json"),"utf8"));
  fs.writeFileSync(path.join(root,"balance_reports",`matrix_${a}_vs_${b}.json`),JSON.stringify(rep,null,2));
  all.push(...rep.policyCharacterSummary);
}
const by={};
for(const r of all){by[r.character] ||= {}; by[r.character][`${r.pilotPolicy}_vs_${r.opponentPolicy}`]=r;}
const rows=Object.keys(by).sort().map(ch=>{
  const x=by[ch], oo=x["old_vs_old"]?.winRate, ss=x["smart_vs_smart"]?.winRate, so=x["smart_vs_old"]?.winRate, os=x["old_vs_smart"]?.winRate;
  const pilotGain=so!=null&&oo!=null?+(so-oo).toFixed(1):null;
  const oppSuppress=so!=null&&ss!=null?+(so-ss).toFixed(1):null;
  const punish=oo!=null&&os!=null?+(oo-os).toFixed(1):null;
  let label="ok";
  if(oo>=55&&ss>=56) label="too-good-baseline";
  else if(oo<=45&&ss>=54&&ss<=59) label="healthy-skill-intensive";
  else if(so>=60&&ss<=55) label="farms-bad-opponents/counterable";
  else if(oo>=55&&ss<50) label="knowledge-check-countered";
  else if(ss<43&&oo<48) label="underpowered";
  else if(ss>=60) label="optimized-too-strong";
  return {character:ch,oldVsOld:oo,smartVsSmart:ss,smartPilotVsOldOpp:so,oldPilotVsSmartOpp:os,pilotSkillGainVsOldOpp:pilotGain,smartOpponentSuppression:oppSuppress,smartOpponentPunishesOldPilot:punish,label};
}).sort((a,b)=>b.smartVsSmart-a.smartVsSmart);
const summary={gamesPerConfig:games,seed,definitions:{oldVsOld:"bad vs bad",smartVsSmart:"optimized vs optimized",smartPilotVsOldOpp:"good pilot vs bad opponent",oldPilotVsSmartOpp:"bad pilot vs good opponent",smartOpponentSuppression:"smartPilotVsOldOpp - smartVsSmart"},rows};
fs.writeFileSync(path.join(root,"balance_reports","skill_matrix_summary.json"),JSON.stringify(summary,null,2));
const cols=Object.keys(rows[0]); fs.writeFileSync(path.join(root,"balance_reports","skill_matrix_summary.csv"),[cols.join(","),...rows.map(r=>cols.map(c=>`"${String(r[c]??"").replace(/"/g,'""')}"`).join(","))].join("\n"));
