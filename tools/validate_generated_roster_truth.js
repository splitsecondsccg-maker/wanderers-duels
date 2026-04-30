#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ROOT = process.cwd();
function run(script,args=[]){
  const r=spawnSync("node",[script,...args],{cwd:ROOT,encoding:"utf8"});
  if(r.status!==0){console.error(r.stdout);console.error(r.stderr);process.exit(r.status);}
}
run("tools/sync_sim_from_game_roster.js");
const game = JSON.parse(fs.readFileSync(path.join(ROOT,"balance_reports","game_roster_source.json"),"utf8"));
const sim = JSON.parse(fs.readFileSync(path.join(ROOT,"balance_reports","sim_roster_synced_from_game.json"),"utf8"));
const gameIds = game.map(c=>c.id).sort();
const simIds = sim.map(c=>c.id).sort();
const problems=[];
if(JSON.stringify(gameIds)!==JSON.stringify(simIds)) problems.push({field:"character_ids",game:gameIds,sim:simIds});
for(const g of game){
  const s=sim.find(x=>x.id===g.id);
  if(!s) continue;
  const ga=(g.abilities||[]).map(a=>a.id).sort();
  const sa=(s.abilities||[]).map(a=>a.id).sort();
  if(JSON.stringify(ga)!==JSON.stringify(sa)) problems.push({character:g.id,field:"ability_ids",game:ga,sim:sa});
}
const report={ok:problems.length===0, problemCount:problems.length, problems, note:"Generated simulator roster uses game.js character/ability identities; numeric conflicts are resolved by balanced-pass overlay and logged in roster_sync_report.json"};
fs.writeFileSync(path.join(ROOT,"balance_reports","generated_roster_truth_report.json"),JSON.stringify(report,null,2));
if(!report.ok){console.error(JSON.stringify(report,null,2));process.exit(2);}
console.log("Generated simulator roster is true-to-game for character and ability identities.");
