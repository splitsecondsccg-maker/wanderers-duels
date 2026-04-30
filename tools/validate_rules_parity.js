#!/usr/bin/env node
/*
  validate_rules_parity.js

  Executes scripted micro-scenarios against:
  1. real game.js functions in a DOM-stubbed VM
  2. simulator functions from simulate_balance_smart_ai_only.js

  This validates rules/logic parity, not just roster parity.
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "balance_reports");
fs.mkdirSync(REPORT_DIR, {recursive:true});

function run(script,args=[]){
  const r=spawnSync("node",[script,...args],{cwd:ROOT,encoding:"utf8"});
  if(r.status!==0){ console.error(r.stdout); console.error(r.stderr); process.exit(r.status); }
}

function makeDomStub() {
  const handler = {
    get(target, prop) {
      if (prop === "style") return {};
      if (prop === "classList") return {add(){}, remove(){}, toggle(){}, contains(){return false;}};
      if (["appendChild","removeChild","addEventListener","setAttribute","remove","focus","scrollIntoView"].includes(prop)) return function(){};
      if (prop === "getBoundingClientRect") return function(){return {left:0, top:0, width:100, height:100, right:100, bottom:100};};
      if (prop === "getContext") return function(){return {};};
      if (prop === "querySelector") return function(){return el;};
      if (prop === "querySelectorAll") return function(){return [];};
      if (prop === "children") return [];
      if (prop === "dataset") return {};
      if (["textContent","innerHTML","value","disabled","checked","id","src","title"].includes(prop)) return "";
      return target[prop] ?? "";
    },
    set(target, prop, val) { target[prop] = val; return true; }
  };
  const el = new Proxy({}, handler);
  return {
    getElementById(){return el;},
    querySelector(){return el;},
    querySelectorAll(){return [];},
    createElement(){return el;},
    addEventListener(){},
    body:el,
    documentElement:el
  };
}

function loadGameApi() {
  const code = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
  const sandbox = {
    console:{log(){}, warn(){}, error(){}},
    document:makeDomStub(),
    window:{addEventListener(){}, innerWidth:1200, innerHeight:800, matchMedia(){return {matches:false, addEventListener(){}};}},
    localStorage:{getItem(){return null;}, setItem(){}, removeItem(){}},
    Audio:function(){return {play(){return Promise.resolve();}, pause(){}, addEventListener(){}, volume:1, currentTime:0};},
    setTimeout(){return 0;}, clearTimeout(){}, setInterval(){return 0;}, clearInterval(){},
    requestAnimationFrame(){return 0;},
    alert(){},
    performance:{now(){return 0;}},
    structuredClone:global.structuredClone,
    Math, JSON, Array, Object, String, Number, Boolean, RegExp, Date, Set, Map
  };
  sandbox.window = Object.assign(sandbox.window, sandbox);
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code + `
    globalThis.__api = {
      getRoster:()=>ROSTER,
      setState:(s)=>{state=s;},
      getState:()=>state,
      damage, addStatus, endRound, apply,
      alive, other, targets
    };
  `, sandbox, {timeout:2500});
  return sandbox.__api;
}

function loadSimApi() {
  run("tools/sync_sim_from_game_roster.js");
  let code = fs.readFileSync(path.join(ROOT, "tools", "simulate_balance_smart_ai_only.js"), "utf8");
  const cut = code.indexOf("const charStats=");
  if (cut > 0) code = code.slice(0, cut);
  const sandbox = {
    console:{log(){}, warn(){}, error(){}},
    require,
    __dirname:path.join(ROOT, "tools"),
    process:{argv:["node","sim"], exit(){}},
    Math, JSON, Array, Object, String, Number, Boolean, RegExp, Date, Set, Map
  };
  vm.createContext(sandbox);
  vm.runInContext(code + `
    if (typeof hpTotal === "undefined") {
      globalThis.hpTotal = (units, side)=>units.filter(u=>u.side===side && !u.dead).reduce((s,u)=>s+Math.max(0,u.hp||0),0);
    }
    if (typeof ensureAbilityOutcome === "undefined") {
      globalThis.ensureAbilityOutcome = ()=>({uses:0,wins:0,totalDamage:0,totalHealing:0,totalStatus:0,totalKills:0,totalValue:0,deadUses:0,usedWhenBehind:0,winsWhenBehind:0});
    }
    globalThis.__api = {
      getRoster:()=>ROSTER,
      damage, addStatus, endRound, applyAbility,
      armor, validTargets
    };
  `, sandbox, {timeout:2500});
  return sandbox.__api;
}

function unit(id, side, overrides={}) {
  return {
    id, name:overrides.name || id, side,
    hp:overrides.hp ?? 10,
    maxHp:overrides.maxHp ?? overrides.hp ?? 10,
    armor:overrides.armor ?? 0,
    baseArmor:overrides.armor ?? 0,
    tempArmor:overrides.tempArmor ?? 0,
    shield:overrides.shield ?? 0,
    status:JSON.parse(JSON.stringify(overrides.status || {})),
    buff:JSON.parse(JSON.stringify(overrides.buff || {})),
    row:overrides.row || "front",
    col:overrides.col || 0,
    dead:false,
    stats:{damage:0,taken:0,healing:0,statusApplied:0,guards:0}
  };
}

function gameState(units) {
  return {
    round:1,
    phase:"planning",
    units,
    protects:[],
    dodges:[],
    predicts:[],
    counters:[],
    guarded:{},
    attacked:{},
    plans:[],
    currentActionKey:null
  };
}
function simState(units) {
  return {units, abilityUses:{}};
}

function normalizeUnits(units) {
  return units.map(u => ({
    id:u.id,
    side:u.side,
    hp:u.hp,
    armor:u.armor,
    baseArmor:u.baseArmor,
    tempArmor:u.tempArmor || u.bonusArmor || 0,
    shield:u.shield || 0,
    status:Object.fromEntries(Object.entries(u.status||{}).filter(([k,v])=>!!v).sort()),
    buff:JSON.parse(JSON.stringify(u.buff || {})),
    dead:!!u.dead
  })).sort((a,b)=>a.id.localeCompare(b.id)||a.side.localeCompare(b.side));
}

function pick(state, id) { return state.units.find(u=>u.id===id); }

function runCase(name, fn) {
  const game = loadGameApi();
  const sim = loadSimApi();
  try {
    const result = fn(game, sim);
    return {name, pass:result.pass, game:result.game, sim:result.sim, note:result.note||""};
  } catch (e) {
    return {name, pass:false, error:String(e.stack||e)};
  }
}

const cases = [];

// 1. Basic armor damage.
cases.push(runCase("damage: 3 attack into 2 armor deals 1", (game, sim) => {
  const gu=[unit("src","player"),unit("tgt","enemy",{armor:2})];
  const su=[unit("src","A"),unit("tgt","B",{armor:2})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.damage(pick(gs,"src"), pick(gs,"tgt"), 3, {attack:true, melee:true});
  const ss=simState(su);
  sim.damage(ss, pick(ss,"src"), pick(ss,"tgt"), 3, {attack:true, melee:true});
  return compare("basicArmor", gs, ss);
}));

// 2. Shield absorbs after armor.
cases.push(runCase("damage: armor then shield", (game, sim) => {
  const gu=[unit("src","player"),unit("tgt","enemy",{armor:1, shield:2})];
  const su=[unit("src","A"),unit("tgt","B",{armor:1, shield:2})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.damage(pick(gs,"src"), pick(gs,"tgt"), 5, {attack:true, melee:true});
  const ss=simState(su);
  sim.damage(ss, pick(ss,"src"), pick(ss,"tgt"), 5, {attack:true, melee:true});
  return compare("shield", gs, ss);
}));

// 3. Exposed adds damage and clears.
cases.push(runCase("status: exposed adds +2 and clears", (game, sim) => {
  const gu=[unit("src","player"),unit("tgt","enemy",{status:{exposed:1}})];
  const su=[unit("src","A"),unit("tgt","B",{status:{exposed:1}})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.damage(pick(gs,"src"), pick(gs,"tgt"), 2, {attack:true, melee:true});
  const ss=simState(su);
  sim.damage(ss, pick(ss,"src"), pick(ss,"tgt"), 2, {attack:true, melee:true});
  return compare("exposed", gs, ss);
}));

// 4. Freeze threshold.
cases.push(runCase("status: freeze threshold creates frozen", (game, sim) => {
  const gu=[unit("tgt","enemy",{status:{freeze:4}})];
  const su=[unit("tgt","B",{status:{freeze:4}})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.addStatus(pick(gs,"tgt"), "freeze", 1);
  const ss=simState(su);
  sim.addStatus(ss, pick(ss,"tgt"), "freeze", 1, null);
  return compare("freeze", gs, ss);
}));

// 5. Poison end round.
cases.push(runCase("endRound: poison halves rounded up", (game, sim) => {
  const gu=[unit("tgt","enemy",{hp:10,status:{poison:3}})];
  const su=[unit("tgt","B",{hp:10,status:{poison:3}})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.endRound();
  const ss=simState(su);
  sim.endRound(ss);
  return compare("poison", gs, ss);
}));

// 6. Poom melee passive.
cases.push(runCase("passive: melee hit on Poom applies hypnosis to attacker", (game, sim) => {
  const gu=[unit("src","player"),unit("poom","enemy",{armor:0})];
  const su=[unit("src","A"),unit("poom","B",{armor:0})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.damage(pick(gs,"src"), pick(gs,"poom"), 2, {attack:true, melee:true});
  const ss=simState(su);
  sim.damage(ss, pick(ss,"src"), pick(ss,"poom"), 2, {attack:true, melee:true});
  return compare("poom", gs, ss);
}));

// 7. Bleed behavior. This intentionally detects whether simulator and game agree.
cases.push(runCase("status: bleed behavior on attack", (game, sim) => {
  const gu=[unit("src","player"),unit("tgt","enemy",{status:{bleed:2}})];
  const su=[unit("src","A"),unit("tgt","B",{status:{bleed:2}})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.damage(pick(gs,"src"), pick(gs,"tgt"), 2, {attack:true, melee:true});
  const ss=simState(su);
  sim.damage(ss, pick(ss,"src"), pick(ss,"tgt"), 2, {attack:true, melee:true});
  return compare("bleed", gs, ss);
}));

// 8. Blood Infusion next attack.
cases.push(runCase("buff: Blood Infusion next attack", (game, sim) => {
  const gu=[unit("src","player",{buff:{bloodInfusion:{bonus:3,bleed:2}}}),unit("tgt","enemy")];
  const su=[unit("src","A",{buff:{bloodInfusion:{bonus:3,bleed:2}}}),unit("tgt","B")];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.damage(pick(gs,"src"), pick(gs,"tgt"), 2, {attack:true, melee:true});
  const ss=simState(su);
  sim.damage(ss, pick(ss,"src"), pick(ss,"tgt"), 2, {attack:true, melee:true});
  return compare("bloodInfusion", gs, ss);
}));

// 9. Blood Ward self-cost, Armor, and once-only Bleed counter.
cases.push(runCase("buff: Blood Ward protects and bleeds attacker", (game, sim) => {
  const ward={id:"ward",name:"Blood Ward",effect:"bloodWard",kind:"bloodWard",guard:true,range:"ally",self:1,armor:1,stacks:2};
  const gu=[unit("yaura","player"),unit("ally","player"),unit("atk","enemy")];
  const su=[unit("yaura","A"),unit("ally","A"),unit("atk","B")];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.apply(pick(gs,"yaura"), ward, pick(gs,"ally"));
  game.damage(pick(gs,"atk"), pick(gs,"ally"), 3, {attack:true, melee:true});
  const ss=simState(su);
  sim.applyAbility(ss, pick(ss,"yaura"), ward, pick(ss,"ally"));
  sim.damage(ss, pick(ss,"atk"), pick(ss,"ally"), 3, {attack:true, melee:true});
  return compare("bloodWard", gs, ss);
}));

// 10. Protect Ally redirects the first incoming attack to Dravain.
cases.push(runCase("guard: Protect Ally redirects first attack", (game, sim) => {
  const protect={id:"protect",name:"Protect Ally",effect:"protect",kind:"protect",guard:true,range:"ally",cleanse:1};
  const gu=[unit("dravain","player",{hp:12,armor:0}),unit("ally","player",{hp:10,armor:0}),unit("atk","enemy",{hp:10,armor:0})];
  const su=[unit("dravain","A",{hp:12,armor:0}),unit("ally","A",{hp:10,armor:0}),unit("atk","B",{hp:10,armor:0})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.apply(pick(gs,"dravain"), protect, pick(gs,"ally"));
  game.damage(pick(gs,"atk"), pick(gs,"ally"), 4, {attack:true, melee:true});
  const ss=simState(su);
  sim.applyAbility(ss, pick(ss,"dravain"), protect, pick(ss,"ally"));
  sim.damage(ss, pick(ss,"atk"), pick(ss,"ally"), 4, {attack:true, melee:true});
  return compare("protectRedirect", gs, ss);
}));

// 11. Blood Price is now a self-cost single-target attack.
cases.push(runCase("ability: Blood Price loses 2 HP and deals 6 damage", (game, sim) => {
  const price={id:"price",name:"Blood Price",effect:"bloodPrice",kind:"attack",range:"ranged",self:2,dmg:6};
  const gu=[unit("yaura","player",{hp:12,armor:0}),unit("tgt","enemy",{hp:12,armor:0})];
  const su=[unit("yaura","A",{hp:12,armor:0}),unit("tgt","B",{hp:12,armor:0})];
  game.setState(gameState(gu));
  const gs=game.getState();
  game.apply(pick(gs,"yaura"), price, pick(gs,"tgt"));
  const ss=simState(su);
  sim.applyAbility(ss, pick(ss,"yaura"), price, pick(ss,"tgt"));
  return compare("bloodPrice", gs, ss);
}));

function compare(label, gameState, simState) {
  const g = normalizeUnits(gameState.units);
  const s = normalizeUnits(simState.units);
  // Map sides to common labels for comparison.
  for (const u of s) {
    if (u.side === "A") u.side = "player";
    if (u.side === "B") u.side = "enemy";
  }
  const pass = JSON.stringify(g) === JSON.stringify(s);
  return {pass, game:g, sim:s, note:label};
}

const passed = cases.filter(c=>c.pass).length;
const report = {
  ok: passed === cases.length,
  passed,
  total: cases.length,
  cases,
  generatedAt:new Date().toISOString()
};
fs.writeFileSync(path.join(REPORT_DIR, "rules_parity_report.json"), JSON.stringify(report, null, 2));
const rows = cases.map(c => ({name:c.name, pass:c.pass, note:c.note||"", error:c.error||""}));
const csv = ["name,pass,note,error", ...rows.map(r => [r.name,r.pass,r.note,r.error].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(","))].join("\n");
fs.writeFileSync(path.join(REPORT_DIR, "rules_parity_report.csv"), csv);

if (!report.ok) {
  console.error(`Rules parity failed: ${passed}/${cases.length} passing.`);
  console.error("See balance_reports/rules_parity_report.json");
  process.exit(2);
}

console.log(`Rules parity passed: ${passed}/${cases.length}.`);
