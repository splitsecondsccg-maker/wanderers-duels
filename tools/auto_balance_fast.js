#!/usr/bin/env node
/*
  v75 fast auto-balancer
  ----------------------
  Goal:
  - Run repeated smart-vs-smart balance iterations with compact reports.
  - Apply small, data-driven surgical patches between iterations.
  - Run the full 2x2 skill matrix only at the end.

  This is intentionally conservative:
  - One or two small changes per iteration.
  - No broad class-wide changes.
  - Yaura keeps no easy Armor-ignore; Blood Infusion remains a next-attack enhancer.

  Usage:
    node tools/auto_balance_fast.js --iterations 10 --games 5000 --seed 75000

  Outputs:
    balance_reports/auto_balance_fast_history.json
    balance_reports/auto_balance_fast_final_matrix.json
*/

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] != null ? process.argv[i + 1] : fallback;
}

const ITERATIONS = Number(arg("iterations", "10"));
const GAMES = Number(arg("games", "5000"));
const SEED = Number(arg("seed", "75000"));
const MATRIX_GAMES = Number(arg("matrixGames", "1500"));
const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "balance_reports");

function runNode(script, args, timeoutMs = 180000) {
  const res = spawnSync("node", [`tools/${script}`, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs
  });
  if (res.status !== 0) {
    throw new Error(`${script} failed\nSTDOUT:\n${res.stdout.slice(-2000)}\nSTDERR:\n${res.stderr.slice(-4000)}`);
  }
  return res;
}


runNode("sync_sim_from_game_roster.js", [], 30000);
// Hard gate: never auto-balance if the simulator is not true-to-game.
runNode("validate_rules_parity.js", [], 30000);
runNode("validate_sim_true_to_game.js", ["tools/simulate_balance_smart_ai_only.js"], 30000);

function runSmartVsSmart(games, seed) {
  runNode("simulate_balance_smart_ai_only.js", ["--games", String(games), "--seed", String(seed)]);
  return JSON.parse(fs.readFileSync(path.join(REPORT_DIR, "latest.json"), "utf8"));
}

function runMatrix(games, seed) {
  runNode("compare_skill_matrix.js", ["--games", String(games), "--seed", String(seed)], 240000);
  return JSON.parse(fs.readFileSync(path.join(REPORT_DIR, "skill_matrix_summary.json"), "utf8"));
}

function patchFile(file, replacements) {
  if (!fs.existsSync(file)) return 0;
  let s = fs.readFileSync(file, "utf8");
  let count = 0;
  for (const [from, to] of replacements) {
    if (s.includes(from)) count++;
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
  return count;
}

function patchAllSimulators(replacements) {
  const files = fs.readdirSync(path.join(ROOT, "tools"))
    .filter(f => f.startsWith("simulate_balance") && f.endsWith(".js"))
    .map(f => path.join(ROOT, "tools", f));
  let matched = 0;
  for (const f of files) matched += patchFile(f, replacements);
  return matched;
}

function simpleRows(report) {
  return report.characterSummary.map(c => ({
    character: c.name,
    winRate: c.winRate,
    avgDamage: c.avgDamage,
    avgTaken: c.avgTaken,
    avgGuards: c.avgGuards
  })).sort((a,b) => b.winRate - a.winRate);
}

function getTopBottom(rows) {
  return { top: rows[0], bottom: rows[rows.length - 1] };
}

function surgicalReplacements(rows, report) {
  const by = Object.fromEntries(rows.map(r => [r.character, r]));
  const flags = report.surgicalBalanceFlags || [];
  const replacements = [];
  const reasons = [];

  const top = rows[0], bottom = rows[rows.length - 1];

  // --- Primary data-driven outlier handling ---
  // Yaura: never give easy Armor-ignore back. Tune Blood Infusion / Blood Price only.
  const yaura = by["Yaura"];
  if (yaura) {
    if (yaura.winRate > 58) {
      replacements.push(
        ['{id:"bolt", name:"Blood Infusion", cost:1, spd:1, kind:"empowerNextAttack", bonus:3, bleed:3}',
         '{id:"bolt", name:"Blood Infusion", cost:1, spd:1, kind:"empowerNextAttack", bonus:3, bleed:2}'],
        ['{id:"price", name:"Blood Price", cost:1, spd:-1, kind:"frontDamageForAllyHp", dmg:4, self:2}',
         '{id:"price", name:"Blood Price", cost:1, spd:-1, kind:"frontDamageForAllyHp", dmg:3, self:2}']
      );
      reasons.push("Yaura high: reduce Blood Infusion/Blood Price, still no Armor-ignore.");
    } else if (yaura.winRate < 43) {
      replacements.push(
        ['{id:"bolt", name:"Blood Infusion", cost:1, spd:1, kind:"empowerNextAttack", bonus:2, bleed:2}',
         '{id:"bolt", name:"Blood Infusion", cost:1, spd:1, kind:"empowerNextAttack", bonus:3, bleed:2}'],
        ['{id:"bolt", name:"Blood Infusion", cost:1, spd:1, kind:"empowerNextAttack", bonus:3, bleed:2}',
         '{id:"bolt", name:"Blood Infusion", cost:1, spd:1, kind:"empowerNextAttack", bonus:3, bleed:3}']
      );
      reasons.push("Yaura low: improve Blood Infusion as enhancer, not Armor-ignore.");
    }
  }

  // Dravain: keep protection identity, avoid adding too much damage.
  const dravain = by["Dravain"];
  if (dravain) {
    if (dravain.winRate > 58) {
      replacements.push(
        ['{id:"protect", name:"Protect Ally", cost:1, spd:99, guard:true, kind:"protect", armor:1, cleanse:1}',
         '{id:"protect", name:"Protect Ally", cost:1, spd:99, guard:true, kind:"protect", cleanse:1}'],
        ['{id:"slash", name:"Blood Slash", cost:1, spd:0, range:"melee", kind:"attackSetup", dmg:3, onHit:{bleed:1}}',
         '{id:"slash", name:"Blood Slash", cost:1, spd:0, range:"melee", kind:"attackSetup", dmg:2, onHit:{bleed:1}}']
      );
      reasons.push("Dravain high: remove Protect Armor / reduce Blood Slash.");
    } else if (dravain.winRate < 43) {
      replacements.push(
        ['id:"dravain", name:"Dravain", cls:"warrior", prof:["vampire"], hp:23, armor:3, speed:5',
         'id:"dravain", name:"Dravain", cls:"warrior", prof:["vampire"], hp:24, armor:3, speed:5'],
        ['{id:"protect", name:"Protect Ally", cost:2, spd:99, guard:true, kind:"protect"}',
         '{id:"protect", name:"Protect Ally", cost:1, spd:99, guard:true, kind:"protect"}']
      );
      reasons.push("Dravain low: improve protection reliability/HP, not big damage.");
    }
  }

  // Hyafrost: tune Absolute Zero only first.
  const hyafrost = by["Hyafrost"];
  if (hyafrost) {
    if (hyafrost.winRate > 58) {
      replacements.push(
        ['{id:"zero", name:"Absolute Zero", cost:2, spd:-3, kind:"absoluteZeroConsume", dmg:0, mult:2, ignoreArmor:false}',
         '{id:"zero", name:"Absolute Zero", cost:2, spd:-3, kind:"absoluteZeroConsume", dmg:0, mult:1.5, ignoreArmor:false}'],
        ['{id:"blast", name:"Ice Blast", cost:1, spd:0, range:"ranged", kind:"attackSetup", dmg:4, onHit:{freeze:2}}',
         '{id:"blast", name:"Ice Blast", cost:1, spd:0, range:"ranged", kind:"attackSetup", dmg:3, onHit:{freeze:2}}']
      );
      reasons.push("Hyafrost high: trim Absolute Zero/Ice Blast.");
    } else if (hyafrost.winRate < 43) {
      replacements.push(
        ['{id:"zero", name:"Absolute Zero", cost:2, spd:-3, kind:"absoluteZeroConsume", dmg:0, mult:1.5, ignoreArmor:false}',
         '{id:"zero", name:"Absolute Zero", cost:2, spd:-3, kind:"absoluteZeroConsume", dmg:0, mult:2, ignoreArmor:false}'],
        ['id:"hyafrost", name:"Hyafrost", cls:"sorcerer", prof:["icecraft","spirit"], hp:21, armor:1, speed:3',
         'id:"hyafrost", name:"Hyafrost", cls:"sorcerer", prof:["icecraft","spirit"], hp:22, armor:1, speed:3']
      );
      reasons.push("Hyafrost low: restore Absolute Zero without Armor-ignore / small HP.");
    }
  }

  // Poom: raw damage should not carry; if low, improve taunt baseline first.
  const poom = by["Poom"];
  if (poom) {
    if (poom.winRate > 58) {
      replacements.push(
        ['{id:"bash", name:"Bash", cost:1, spd:-1, range:"melee", kind:"attack", dmg:5}',
         '{id:"bash", name:"Bash", cost:1, spd:-1, range:"melee", kind:"attack", dmg:4}'],
        ['{id:"revenge", name:"Revenge Body", cost:2, spd:-1, range:"melee", kind:"revenge", dmg:8, self:3, bonus:3}',
         '{id:"revenge", name:"Revenge Body", cost:2, spd:-1, range:"melee", kind:"revenge", dmg:7, self:3, bonus:3}']
      );
      reasons.push("Poom high: trim raw Bash/Revenge.");
    } else if (poom.winRate < 43) {
      replacements.push(
        ['{id:"guard", name:"Mesmeric Taunt", cost:1, spd:99, guard:true, kind:"poomMassGuardMind", minArmor:1}',
         '{id:"guard", name:"Mesmeric Taunt", cost:1, spd:99, guard:true, kind:"poomMassGuardMind", minArmor:2}'],
        ['{id:"guard", name:"Mesmeric Taunt", cost:1, spd:99, guard:true, kind:"poomMassGuardMind", minArmor:2}',
         '{id:"guard", name:"Mesmeric Taunt", cost:1, spd:99, guard:true, kind:"poomMassGuardMind", minArmor:3}']
      );
      reasons.push("Poom low: improve Mesmeric Taunt baseline, not raw damage.");
    }
  }

  // Bahl: setup safety, not payoff spike.
  const bahl = by["Bahl"];
  if (bahl) {
    if (bahl.winRate > 58) {
      replacements.push(
        ['{id:"pact", name:"Blood Pact", cost:1, spd:-1, kind:"frontStatusForAllyHp", self:1, status:"bleed", stacks:2, armorSelf:2}',
         '{id:"pact", name:"Blood Pact", cost:1, spd:-1, kind:"frontStatusForAllyHp", self:1, status:"bleed", stacks:2, armorSelf:1}'],
        ['{id:"rupture", name:"Demon Rupture", cost:2, spd:-1, range:"ranged", kind:"demonRupture", mult:2, bonus:2, ignoreArmor:true}',
         '{id:"rupture", name:"Demon Rupture", cost:2, spd:-1, range:"ranged", kind:"demonRupture", mult:2, bonus:1, ignoreArmor:true}']
      );
      reasons.push("Bahl high: reduce Blood Pact safety / Rupture bonus.");
    } else if (bahl.winRate < 43) {
      replacements.push(
        ['{id:"pact", name:"Blood Pact", cost:1, spd:-1, kind:"frontStatusForAllyHp", self:1, status:"bleed", stacks:2, armorSelf:1}',
         '{id:"pact", name:"Blood Pact", cost:1, spd:-1, kind:"frontStatusForAllyHp", self:1, status:"bleed", stacks:2, armorSelf:2}'],
        ['id:"shaman", name:"Bahl", cls:"sorcerer", prof:["bloodcraft","demon"], hp:21, armor:1, speed:3',
         'id:"shaman", name:"Bahl", cls:"sorcerer", prof:["bloodcraft","demon"], hp:22, armor:1, speed:3']
      );
      reasons.push("Bahl low: improve Blood Pact safety/HP, not Demon Rupture spike.");
    }
  }

  // K'ku: setup/guard, not Glacier Break.
  const kku = by["K'ku"];
  if (kku) {
    if (kku.winRate > 58) {
      replacements.push(
        ['{id:"roar", name:"Blizzard Roar", cost:2, spd:-3, kind:"rowStatus", row:"front", status:"freeze", stacks:2, exhausted:1}',
         '{id:"roar", name:"Blizzard Roar", cost:2, spd:-3, kind:"rowStatus", row:"front", status:"freeze", stacks:2}']
      );
      reasons.push("K'ku high: remove Exhausted from Blizzard Roar.");
    } else if (kku.winRate < 43) {
      replacements.push(
        ['{id:"guard", name:"Ice Guard", cost:1, spd:99, guard:true, kind:"selfCounter", status:"freeze", stacks:2, armor:1}',
         '{id:"guard", name:"Ice Guard", cost:1, spd:99, guard:true, kind:"selfCounter", status:"freeze", stacks:2, armor:2}']
      );
      reasons.push("K'ku low: improve Ice Guard, not Glacier Break.");
    }
  }

  // Generic small corrections for non-focus characters.
  const eva = by["Lady Eva"];
  if (eva && eva.winRate > 60) {
    replacements.push(
      ['{id:"fangs", name:"Crimson Fangs", cost:1, spd:1, range:"melee", kind:"attackSetup", dmg:4, onHit:{bleed:1}}',
       '{id:"fangs", name:"Crimson Fangs", cost:1, spd:1, range:"melee", kind:"attackSetup", dmg:3, onHit:{bleed:1}}']
    );
    reasons.push("Lady Eva high: trim Crimson Fangs.");
  }

  const bakub = by["Bakub"];
  if (bakub && bakub.winRate > 60) {
    replacements.push(
      ['{id:"toxin", name:"Mind Toxin", cost:1, spd:-1, range:"ranged", kind:"mindToxinConsume", dmg:3, payoffDmg:6, poison:2, ignoreArmor:true}',
       '{id:"toxin", name:"Mind Toxin", cost:1, spd:-1, range:"ranged", kind:"mindToxinConsume", dmg:3, payoffDmg:5, poison:2, ignoreArmor:true}']
    );
    reasons.push("Bakub high: trim Mind Toxin payoff.");
  }

  // De-duplicate.
  const seen = new Set();
  const out = [];
  for (const r of replacements) {
    const k = JSON.stringify(r);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(r);
    }
  }
  return { replacements: out, reasons, top, bottom };
}

const history = [];
let stopReason = "Reached requested iteration count";

for (let i = 0; i < ITERATIONS; i++) {
  const report = runSmartVsSmart(GAMES, SEED + i * 97);
  const rows = simpleRows(report);
  const { replacements, reasons, top, bottom } = surgicalReplacements(rows, report);

  history.push({
    iteration: i,
    games: GAMES,
    top,
    bottom,
    rows,
    reasons,
    replacementsApplied: replacements.length,
    surgicalFlags: (report.surgicalBalanceFlags || []).slice(0, 20)
  });

  const winRates = rows.map(r => r.winRate);
  const max = Math.max(...winRates);
  const min = Math.min(...winRates);

  if (i >= 2 && max <= 58.5 && min >= 42) {
    stopReason = `Reached smart-vs-smart band at iteration ${i}`;
    break;
  }

  if (!replacements.length) {
    stopReason = `No surgical replacement matched at iteration ${i}`;
    break;
  }

  patchAllSimulators(replacements);
}

fs.writeFileSync(path.join(REPORT_DIR, "auto_balance_fast_history.json"), JSON.stringify({ stopReason, history }, null, 2));

// Final validation.
const finalSmart = runSmartVsSmart(Math.max(GAMES, 5000), SEED + 9999);
fs.writeFileSync(path.join(REPORT_DIR, "auto_balance_fast_final_smart.json"), JSON.stringify(finalSmart, null, 2));

const finalMatrix = runMatrix(MATRIX_GAMES, SEED + 19999);
fs.writeFileSync(path.join(REPORT_DIR, "auto_balance_fast_final_matrix.json"), JSON.stringify(finalMatrix, null, 2));

console.log(JSON.stringify({
  stopReason,
  iterationsRun: history.length,
  finalSmart: simpleRows(finalSmart),
  finalMatrix: finalMatrix.rows
}, null, 2));
