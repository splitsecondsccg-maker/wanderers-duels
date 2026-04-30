#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = process.cwd();
const outPath = process.argv[2] || path.join("balance_reports", "game_roster_source.json");

function makeDomStub() {
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
const code = fs.readFileSync(path.join(ROOT, "game.js"), "utf8");
const sandbox = {
  console:{log(){}, warn(){}, error(){}},
  document:makeDomStub(),
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
vm.runInContext(code + "\nglobalThis.__ROSTER = ROSTER;", sandbox, {timeout:2000});
function profArray(v){
  if(Array.isArray(v)) return v;
  if(!v) return [];
  return String(v).split(/[,\s]+/).filter(Boolean);
}
const roster = (sandbox.__ROSTER || []).map(c => ({
  id:c.id,
  name:c.name,
  cls:c.class || c.cls,
  prof:profArray(c.prof || c.proficiencies || c.talents),
  hp:c.hp,
  armor:c.armor,
  speed:c.speed,
  passive:c.passive || "",
  abilities:(c.abilities||[]).map(a => {
    const out = {};
    for (const k of Object.keys(a)) if (typeof a[k] !== "function") out[k] = a[k];
    return out;
  })
}));
fs.mkdirSync(path.dirname(path.join(ROOT, outPath)), {recursive:true});
fs.writeFileSync(path.join(ROOT, outPath), JSON.stringify(roster, null, 2));
console.log(`Wrote ${roster.length} characters to ${outPath}`);
