#!/usr/bin/env node
/*
  validate_sim_true_to_game.js

  Verifies that the balance simulator roster matches the actual browser game roster
  after game.js tuning blocks are evaluated.

  This is a guardrail for auto-balancing:
  if the simulator diverges from the real game, balance iterations are not trustworthy.
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "balance_reports");
fs.mkdirSync(REPORT_DIR, {recursive:true});

function loadGameRoster() {
  const code = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");

  const handler = {
    get(target, prop) {
      if (prop === "style") return {};
      if (prop === "classList") return {add(){}, remove(){}, toggle(){}, contains(){return false;}};
      if (["appendChild","removeChild","addEventListener","setAttribute","remove","focus","scrollIntoView"].includes(prop)) return function(){};
      if (prop === "getContext") return function(){return {};};
      if (prop === "querySelector") return function(){return el;};
      if (prop === "querySelectorAll") return function(){return [];};
      if (prop === "children") return [];
      if (prop === "dataset") return {};
      if (["textContent","innerHTML","value","disabled","checked","id","src"].includes(prop)) return "";
      return target[prop] ?? "";
    },
    set(target, prop, val) { target[prop] = val; return true; }
  };
  const el = new Proxy({}, handler);
  const doc = {
    getElementById(){return el;},
    querySelector(){return el;},
    querySelectorAll(){return [];},
    createElement(){return el;},
    addEventListener(){},
    body:el,
    documentElement:el
  };
  const sandbox = {
    console:{log(){}, warn(){}, error(){}},
    document:doc,
    window:{addEventListener(){}, innerWidth:1200, innerHeight:800, matchMedia(){return {matches:false, addEventListener(){}};}},
    localStorage:{getItem(){return null;}, setItem(){}, removeItem(){}},
    Audio:function(){return {play(){return Promise.resolve();}, pause(){}, addEventListener(){}, volume:1, currentTime:0};},
    setTimeout(){return 0;}, clearTimeout(){}, setInterval(){return 0;}, clearInterval(){},
    requestAnimationFrame(){return 0;},
    performance:{now(){return 0;}},
    Math, JSON, Array, Object, String, Number, Boolean, RegExp, Date, Set, Map
  };
  sandbox.window = Object.assign(sandbox.window, sandbox);
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(code + "\nglobalThis.__ROSTER = ROSTER;", sandbox, {timeout:1500});

  return sandbox.__ROSTER.map(c => ({
    id:c.id,
    name:c.name,
    class:c.class,
    prof:c.prof,
    hp:c.hp,
    armor:c.armor,
    speed:c.speed,
    passive:c.passive,
    abilities:(c.abilities||[]).map(a => ({
      id:a.id,
      name:a.name,
      cost:a.cost,
      spd:a.spd,
      desc:a.desc,
      effect:a.effect,
      range:a.range,
      dmg:a.dmg,
      status:a.status,
      stacks:a.stacks,
      bonus:a.bonus,
      bleed:a.bleed,
      ignoreArmor:a.ignoreArmor,
      mult:a.mult,
      pierce:a.pierce,
      armor:a.armor,
      cleanse:a.cleanse,
      armorSelf:a.armorSelf,
      exhausted:a.exhausted,
      payoffDmg:a.payoffDmg,
      statuses:a.statuses,
      onHit:a.onHit
    }))
  }));
}

function loadSimRoster(simPath) {
  let code = fs.readFileSync(path.join(ROOT, simPath), "utf8");
  const cut = code.indexOf("const charStats=");
  if (cut > 0) code = code.slice(0, cut);

  const sandbox = {
    console,
    require,
    __dirname: path.join(ROOT, "tools"),
    process:{argv:["node","sim"], exit(){}},
    Math, JSON, Array, Object, String, Number, Boolean, RegExp, Date, Set, Map
  };
  vm.createContext(sandbox);
  vm.runInContext(code + "\nglobalThis.__ROSTER = ROSTER;", sandbox, {timeout:1500});
  return sandbox.__ROSTER;
}

function normProf(v) {
  if (Array.isArray(v)) return v.map(x => String(x).toLowerCase()).sort().join("|");
  if (v == null) return "";
  return String(v).toLowerCase().split(/[,\s]+/).filter(Boolean).sort().join("|");
}

function comparableGameAbility(a) {
  return {
    id:a.id,
    name:a.name,
    cost:a.cost,
    spd:a.spd,
    range:a.range,
    dmg:a.dmg,
    status:a.status,
    stacks:a.stacks,
    bonus:a.bonus,
    bleed:a.bleed,
    ignoreArmor:a.ignoreArmor,
    mult:a.mult,
    pierce:a.pierce,
    armor:a.armor,
    cleanse:a.cleanse,
    armorSelf:a.armorSelf,
    exhausted:a.exhausted,
    payoffDmg:a.payoffDmg
  };
}

function comparableSimAbility(a) {
  return {
    id:a.id,
    name:a.name,
    cost:a.cost,
    spd:a.spd,
    range:a.range,
    dmg:a.dmg,
    status:a.status,
    stacks:a.stacks,
    bonus:a.bonus,
    bleed:a.bleed,
    ignoreArmor:a.ignoreArmor,
    mult:a.mult,
    pierce:a.pierce,
    armor:a.armor,
    cleanse:a.cleanse,
    armorSelf:a.armorSelf,
    exhausted:a.exhausted,
    payoffDmg:a.payoffDmg
  };
}

function csv(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

const simPath = process.argv[2] || "tools/simulate_balance_smart_ai_only.js";
const gameRoster = loadGameRoster();
const simRoster = loadSimRoster(simPath);

const gameById = Object.fromEntries(gameRoster.map(c => [c.id, c]));
const simById = Object.fromEntries(simRoster.map(c => [c.id, c]));

const mismatches = [];

for (const id of Object.keys(gameById).sort()) {
  if (!simById[id]) {
    mismatches.push({character:id, ability:"", field:"character_missing_in_sim", game:gameById[id].name, sim:""});
    continue;
  }

  const g = gameById[id];
  const s = simById[id];

  const charFields = [
    ["name", g.name, s.name],
    ["class", g.class, s.cls],
    ["prof", normProf(g.prof), normProf(s.prof)],
    ["hp", g.hp, s.hp],
    ["armor", g.armor, s.armor],
    ["speed", g.speed, s.speed],
  ];

  for (const [field, gv, sv] of charFields) {
    if (gv !== sv) mismatches.push({character:id, ability:"", field, game:gv, sim:sv});
  }

  const ga = Object.fromEntries((g.abilities || []).map(a => [a.id, comparableGameAbility(a)]));
  const sa = Object.fromEntries((s.abilities || []).map(a => [a.id, comparableSimAbility(a)]));

  for (const aid of Object.keys(ga).sort()) {
    if (!sa[aid]) {
      mismatches.push({character:id, ability:aid, field:"ability_missing_in_sim", game:ga[aid].name, sim:""});
    }
  }
  for (const aid of Object.keys(sa).sort()) {
    if (!ga[aid]) {
      mismatches.push({character:id, ability:aid, field:"ability_extra_or_renamed_in_sim", game:"", sim:sa[aid].name});
    }
  }
  for (const aid of Object.keys(ga).filter(aid => sa[aid]).sort()) {
    for (const key of Object.keys(ga[aid])) {
      const gv = ga[aid][key];
      const sv = sa[aid][key];
      const bothEmpty = (gv == null || gv === false) && (sv == null || sv === false);
      if (!bothEmpty && JSON.stringify(gv) !== JSON.stringify(sv)) {
        mismatches.push({character:id, ability:aid, field:key, game:JSON.stringify(gv), sim:JSON.stringify(sv)});
      }
    }
  }
}

for (const id of Object.keys(simById).sort()) {
  if (!gameById[id]) mismatches.push({character:id, ability:"", field:"character_extra_in_sim", game:"", sim:simById[id].name});
}

const report = {
  ok:mismatches.length === 0,
  checkedSimulator:simPath,
  gameCharacters:gameRoster.length,
  simCharacters:simRoster.length,
  mismatchCount:mismatches.length,
  mismatches,
  generatedAt:new Date().toISOString()
};

fs.writeFileSync(path.join(REPORT_DIR, "simulation_truth_report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(REPORT_DIR, "simulation_truth_mismatches.csv"), csv(mismatches));
fs.writeFileSync(path.join(REPORT_DIR, "extracted_game_roster.json"), JSON.stringify(gameRoster, null, 2));
fs.writeFileSync(path.join(REPORT_DIR, "extracted_sim_roster.json"), JSON.stringify(simRoster, null, 2));

if (!report.ok) {
  console.error(`Simulation is NOT true-to-game: ${mismatches.length} mismatches found.`);
  console.error(`See balance_reports/simulation_truth_report.json and simulation_truth_mismatches.csv`);
  process.exit(2);
}

console.log("Simulation is true-to-game.");
