#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "balance_reports");
fs.mkdirSync(REPORT_DIR, {recursive:true});

function runExtract() {
  const res = spawnSync("node", ["tools/extract_game_roster.js", "balance_reports/game_roster_source.json"], {cwd:ROOT, encoding:"utf8"});
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    process.exit(res.status);
  }
}
function loadJson(p, fallback=null) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8")); }
  catch { return fallback; }
}
function profArray(v){
  if(Array.isArray(v)) return v;
  if(!v) return [];
  return String(v).split(/[,\s]+/).filter(Boolean);
}
runExtract();
const gameRoster = loadJson("balance_reports/game_roster_source.json", []);

const BALANCE_OVERLAY = {
  dravain: {
    hp:23, armor:3,
    abilities: {
      protect:{cost:2, cleanse:1, armor:undefined},
      bash:{dmg:2},
      drain:{dmg:3, heal:2},
      claim:{bonus:2, mult:1, heal:1}
    }
  },
  yaura: {
    abilities: {
      bolt:{name:"Blood Infusion", effect:"bloodInfusion", kind:"empowerNextAttack", range:"ally", dmg:0, ignoreArmor:false, bonus:3, bleed:2},
      price:{effect:"bloodPrice", kind:"attack", range:"ranged", dmg:6, self:2, bonus:0, ignoreArmor:false},
      rain:{cost:1, effect:"allStatus", kind:"allStatus", range:"self", status:"bleed", stacks:1, self:0},
      ward:{cost:1, armor:1, stacks:3}
    }
  },
  hyafrost: {
    hp:22,
    abilities: {
      blast:{dmg:4, stacks:3},
      zero:{mult:2, ignoreArmor:true, dmg:3},
      armor:{armor:3},
      field:{stacks:3}
    }
  },
  poom: {
    abilities: {
      guard:{minArmor:2},
      bash:{dmg:4, stacks:2},
      revenge:{dmg:5, self:2, bonus:3},
      bodyguard:{kind:"revenge", effect:"revenge", dmg:5, self:2, bonus:3},
      roar:{dmg:3, bonus:6}
    }
  },
  shaman: {
    hp:23,
    abilities: {
      pact:{armorSelf:1, self:2},
      plague:{dmg:1, stacks:2},
      rupture:{bonus:3}
    }
  },
  kku: {
    hp:29,
    abilities: {
      guard:{armor:1},
      roar:{exhausted:1},
      slam:{dmg:3},
      break:{dmg:5, bonus:2}
    }
  },
  paleya: {
    hp:20,
    abilities: {
      lance:{dmg:2, payoffDmg:8, ignoreArmor:false},
      mesmer:{stacks:1},
      mass:{status:"hypnosis", stacks:1, spd:1},
      mirror:{exposed:1}
    }
  },
  bakub: {
    abilities: {
      vial:{statuses:[["poison",1],["hypnosis",1]]},
      toxin:{dmg:3, payoffDmg:5, poison:2, ignoreArmor:true}
    }
  },
  maoja: {
    abilities: {
      grip:{dmg:3, poison:1},
      breath:{stacks:3},
      burst:{mult:2, bonus:0}
    }
  },
  eva: {
    abilities: {
      stab:{dmg:3, status:"bleed", stacks:1},
      kiss:{dmg:2, status:"bleed", stacks:2, bleed:2, ignoreArmor:true},
      bite:{bonus:1, mult:2, heal:2}
    }
  },
  kahro: {
    abilities: {
      assassinate:{dmg:5, bonus:3},
      needle:{dmg:3},
      mark:{statuses:[["dread",1],["exposed",1]]}
    }
  }
};

function inferKind(a) {
  if (a.kind) return a.kind;
  const e = a.effect || "";
  if (e === "damage") return "attack";
  if (e === "bloodPrice") return "attack";
  if (e === "damageStatus") return "damageStatus";
  if (e === "damageStatusOnHit") return "damageStatusOnHit";
  if (e === "armorStrike") return "armorStrike";
  if (e === "allyPain") return "frontDamageForAllyHp";
  if (e === "allStatus") return a.kind || "allStatus";
  if (e === "bloodInfusion") return "empowerNextAttack";
  if (e === "hopeHeal") return "singleHeal";
  if (e === "hopeShield") return "grantShield";
  if (e === "hopeDelayedAttack") return "delayedAttack";
  if (e === "zahriaBloodMist") return "rowBleedAmplify";
  if (e === "zahriaMassDrain") return "massDrainBleed";
  if (e === "demonRupture") return "demonRupture";
  if (e === "absoluteZeroConsume") return "absoluteZeroConsume";
  if (e === "poisonBurst") return "poisonPayoff";
  if (e === "consumeBleed") return "bleedPayoff";
  if (e === "mindBreak") return "hypnosisDamagePayoff";
  if (e === "mesmerPayoff") return "mesmerPayoff";
  if (e === "frontHypno") return "frontHypno";
  if (e === "shatterScaling") return "freezePayoff";
  if (e === "shatter") return "freezePayoff";
  if (e === "protect") return "protect";
  if (e === "poomMassGuardMind") return "poomMassGuardMind";
  if (e === "bloodWard" || e === "ward") return "bloodWard";
  if (e === "selfCounter") return "selfCounter";
  if (e === "rowStatus") return "rowStatus";
  if (e === "rowDamageStatus") return "rowDamageStatus";
  if (e === "rowMultiStatus") return "rowMultiStatus";
  if (e === "multiStatus") return "multiStatus";
  if (e === "status") return "status";
  if (e === "frontStatusForAllyHp" || e === "allyBleed") return "frontStatusForAllyHp";
  if (e === "frontDamageForAllyHp") return "frontDamageForAllyHp";
  if (e === "attackSetup") return "attackSetup";
  if (e === "bloodDash") return "bloodDash";
  if (e === "whiteout") return "whiteout";
  if (e === "predict") return "hypnosisCancelPayoff";
  if (e === "predictPoison") return "hypnosisPoisonCancelPayoff";
  if (e === "frostArmorRetaliate") return "frostArmorRetaliate";
  if (e === "spirit") return "spirit";
  if (e === "proliferate") return "proliferate";
  if (a.statuses && a.statuses.length) return "multiStatus";
  if (a.status) return "status";
  if (a.guard) return "dodge";
  if ((a.dmg || 0) > 0 || (a.loss || 0) > 0) return "attack";
  return "utility";
}

function simAbilityFromGame(a) {
  const out = { id:a.id, name:a.name, cost:a.cost ?? 1, spd:a.spd ?? a.speed ?? 0, range:a.range || (a.guard ? "self" : "melee"), kind:inferKind(a) };
  const keys = ["dmg","loss","status","stacks","statuses","onHit","bonus","bleed","ignoreArmor","mult","pierce","armor","cleanse","armorSelf","exhausted","payoffDmg","guard","self","heal","poison","row","minArmor","shield","delay","effect"];
  for (const k of keys) if (a[k] !== undefined) out[k] = a[k];
  return out;
}
const syncLog = [];
const synced = gameRoster.map(c => {
  const overlay = BALANCE_OVERLAY[c.id] || {};
  const simChar = {
    id:c.id,
    name:c.name,
    cls:overlay.cls ?? c.cls ?? c.class,
    prof:profArray(overlay.prof ?? c.prof ?? []),
    hp:overlay.hp ?? c.hp,
    armor:overlay.armor ?? c.armor,
    speed:overlay.speed ?? c.speed,
    passive:c.passive || "",
    abilities:(c.abilities || []).map(a => {
      const base = simAbilityFromGame(a);
      const abilityOverlay = overlay.abilities?.[a.id] || {};
      const merged = {...base, ...abilityOverlay};
      for (const [k,v] of Object.entries(abilityOverlay)) syncLog.push({character:c.id, ability:a.id, field:k, source:"balanced-pass-overlay", game:base[k], chosen:v});
      return merged;
    })
  };
  for (const k of ["hp","armor","speed","cls","prof"]) if (overlay[k] !== undefined) syncLog.push({character:c.id, ability:"", field:k, source:"balanced-pass-overlay", game:c[k], chosen:overlay[k]});
  return simChar;
});

const v84PatchPath = path.join(REPORT_DIR, "v84_balance_patch.json");
if (fs.existsSync(v84PatchPath)) {
  const extra = JSON.parse(fs.readFileSync(v84PatchPath, "utf8"));
  for (const ch of synced) {
    const cPatch = extra[ch.id];
    if (!cPatch) continue;
    for (const [k,v] of Object.entries(cPatch)) {
      if (k !== "abilities") ch[k] = v;
    }
    if (cPatch.abilities) {
      for (const a of ch.abilities) {
        const aPatch = cPatch.abilities[a.id];
        if (!aPatch) continue;
        for (const [k,v] of Object.entries(aPatch)) a[k] = v;
      }
    }
  }
}

const generated = `// Auto-generated by tools/sync_sim_from_game_roster.js\n// Do not edit by hand.\nlet ROSTER = ${JSON.stringify(synced, null, 2)};\nif (typeof module !== "undefined") module.exports = { ROSTER };\n`;
fs.writeFileSync(path.join(ROOT, "tools", "generated_roster_from_game.js"), generated);
fs.writeFileSync(path.join(REPORT_DIR, "sim_roster_synced_from_game.json"), JSON.stringify(synced, null, 2));
fs.writeFileSync(path.join(REPORT_DIR, "roster_sync_report.json"), JSON.stringify({generatedAt:new Date().toISOString(), gameCharacters:gameRoster.length, syncedCharacters:synced.length, conflictPolicy:"game.js identities + balanced-pass overlay for conflicts", overlayChanges:syncLog}, null, 2));
console.log(`Synced ${synced.length} characters from game.js with balanced-pass overlay.`);
