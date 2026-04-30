#!/usr/bin/env node
const fs=require("fs"), path=require("path"), {spawnSync}=require("child_process");
function arg(n,f){const i=process.argv.indexOf("--"+n);return i>=0?process.argv[i+1]:f;}
const games=Number(arg("games","1000")), seed=Number(arg("seed","71000")), root=process.cwd();
function run(script,off,out){
 const r=spawnSync("node",["tools/"+script,"--games",String(games),"--seed",String(seed+off)],{cwd:root,encoding:"utf8"});
 if(r.status!==0){console.error(r.stderr);process.exit(r.status);}
 const rep=JSON.parse(fs.readFileSync(path.join(root,"balance_reports","latest.json"),"utf8"));
 fs.writeFileSync(path.join(root,"balance_reports",out),JSON.stringify(rep,null,2)); return rep;
}
function map(rep){const m={}; for(const c of rep.characterSummary)m[c.name]=c; return m;}
function cls(o,s,d){if(o>=55&&s>=58)return"too-good-even-bad"; if(o<=45&&s>=54&&s<=59)return"healthy-skill-reward"; if(o<=45&&s<52)return"underpowered-even-smart"; if(o>=50&&d>=10)return"skill-reward-but-too-safe-floor"; if(s>=60)return"too-strong-optimized"; if(o>=57)return"too-strong-low-skill"; if(s<43&&o<47)return"weak"; return"ok";}
const old=run("simulate_balance_old_ai.js",1,"skill_curve_old_ai.json"), smart=run("simulate_balance_smart_ai_only.js",2,"skill_curve_smart_ai.json");
const om=map(old), sm=map(smart);
const rows=Object.keys(om).sort().map(n=>{const o=om[n].winRate,s=sm[n].winRate,d=Math.round((s-o)*10)/10;return {character:n,oldAI:o,smartAI:s,skillDelta:d,classification:cls(o,s,d),oldAvgDamage:om[n].avgDamage,smartAvgDamage:sm[n].avgDamage,oldGuards:om[n].avgGuards,smartGuards:sm[n].avgGuards};}).sort((a,b)=>b.smartAI-a.smartAI);
fs.writeFileSync(path.join(root,"balance_reports","skill_curve_summary.json"),JSON.stringify({gamesPerPolicy:games,seed,target:{skillIntensive:"oldAI 40-45%, smartAI 55-58%"},rows,oldClassSummary:old.classSummary,smartClassSummary:smart.classSummary},null,2));
const cols=Object.keys(rows[0]); fs.writeFileSync(path.join(root,"balance_reports","skill_curve_summary.csv"),[cols.join(","),...rows.map(r=>cols.map(c=>`"${String(r[c]).replace(/"/g,'""')}"`).join(","))].join("\n"));
console.table(rows.map(r=>({character:r.character,old:r.oldAI,smart:r.smartAI,delta:r.skillDelta,class:r.classification})));
