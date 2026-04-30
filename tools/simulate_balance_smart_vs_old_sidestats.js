#!/usr/bin/env node
/*
  Headless balance simulator for Split Seconds.
  ------------------------------------------------------------
  This is intentionally UI-free. It approximates the current combat
  rules and ability identities so we can catch obvious balance problems.

  Run:
    node tools/simulate_balance.js --games 5000 --seed 123

  Outputs:
    balance_reports/latest.json
    balance_reports/character_summary.csv
    balance_reports/ability_summary.csv
*/

const fs = require("fs");
const path = require("path");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] != null) return process.argv[i + 1];
  return fallback;
}

const GAMES = Number(arg("games", "3000"));
let SEED = Number(arg("seed", "1337"));

function rand() {
  // LCG: deterministic and fast
  SEED = (SEED * 1664525 + 1013904223) >>> 0;
  return SEED / 4294967296;
}
function choice(arr) { return arr[Math.floor(rand() * arr.length)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(rand()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}

let ROSTER = require("./generated_roster_from_game.js").ROSTER;

function clone(def, side, row, col) {
  return {
    ...JSON.parse(JSON.stringify(def)),
    side, row, col,
    maxHp:def.hp, hp:def.hp, baseArmor:def.armor, tempArmor:0,
    shield:0, status:{}, buff:{}, dead:false,
    stats:{damage:0,taken:0,healing:0,statusApplied:0,guards:0}
  };
}
function alive(g,side){ return g.units.filter(u=>u.side===side && !u.dead); }
function enemies(g,u){ return alive(g, u.side==="A" ? "B" : "A"); }
function allies(g,u){ return alive(g,u.side); }
function rowUnits(g,side,row){ return alive(g,side).filter(u=>u.row===row); }
function frontBlocked(g,side){ return alive(g,side).some(u=>u.row==="front"); }
function hasDebuff(u){ return ["poison","bleed","freeze","hypnosis","exposed","exhausted","dread"].some(s=>(u.status[s]||0)>0); }
function armor(u){ return Math.max(0, (u.baseArmor||0) + (u.tempArmor||0)); }
function addStatus(g,u,s,n=1,source=null){
  if(!u || u.dead || !s) return;
  if(["hypnosis","exposed","exhausted","dread","frozen"].includes(s)) u.status[s]=1;
  else u.status[s]=(u.status[s]||0)+n;
  if(source) source.stats.statusApplied += n;
  if(s==="freeze" && (u.status.freeze||0)>=5){ u.status.freeze=0; u.status.frozen=1; }
}
function heal(u,n){
  if(!u || u.dead || n<=0) return 0;
  const before=u.hp;
  u.hp=Math.min(u.maxHp,u.hp+n);
  const h=u.hp-before;
  u.stats.healing += h;
  return h;
}
function triggerBloodEcho(g,u,source=null){
  if(!source || !u || u.side!==source.side || g.bloodEchoUsed) return;
  const yaura=alive(g,source.side).find(x=>x.id==="yaura");
  if(!yaura) return;
  g.bloodEchoUsed=true;
  for(const enemy of rowUnits(g,source.side==="A"?"B":"A","front")) addStatus(g,enemy,"bleed",1,yaura);
}
function lifeLoss(g,u,n,source=null){
  if(!u || u.dead || n<=0) return;
  const before=u.hp;
  u.hp -= n; u.stats.taken += n; if(source) source.stats.damage += n;
  if(before>u.hp) triggerBloodEcho(g,u,source);
  if(u.hp<=0){ u.hp=0; u.dead=true; }
}
function killCheck(u){ if(u.hp<=0){u.hp=0;u.dead=true;} }
function applyBleedBurst(t, raw) {
  const b=t.status.bleed||0;
  if(b>0){ t.status.bleed=0; return raw+b; }
  return raw;
}
function damage(g,src,t,amount,opt={}){
  if(!src || !t || src.dead || t.dead) return 0;

  // Poom mass taunt: redirect offensive actions to Poom
  if(src.buff.poomTauntTarget && opt.attack) {
    const poom = g.units.find(u=>u.id===src.buff.poomTauntTarget && !u.dead);
    if(poom && poom.side!==src.side) t=poom;
  }

  if(opt.attack && t.buff.protectedBy) {
    const guard = g.units.find(u=>u.id===t.buff.protectedBy && !u.dead && u.side===t.side);
    delete t.buff.protectedBy;
    if(guard) t=guard;
  }

  // dodge
  if(t.buff.dodge){ t.buff.dodge=false; return 0; }

  let raw=amount;
  if(opt.attack && src.buff?.bloodInfusion){
    raw += src.buff.bloodInfusion.bonus || 0;
  }
  if(src.id==="kahro" && hasDebuff(t)) raw += 1;
  if(src.id==="maoja" && (t.status.poison||0)>0) raw += 1;
  if(src.id==="smithen" && (t.status.freeze||0)>0) raw += 2;
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) raw += 2;
  if(t.status.exposed){ raw += 2; t.status.exposed=0; }
  if(opt.attack) raw=applyBleedBurst(t, raw);

  let reduced = raw;
  if(!opt.ignoreArmor) reduced = Math.max(0, raw - Math.max(0, armor(t) - (opt.pierce||0)));
  const block = Math.min(t.shield||0, reduced);
  t.shield -= block;
  reduced -= block;

  if(reduced>0){
    t.hp -= reduced; t.stats.taken += reduced; src.stats.damage += reduced;
    if(t.buff.bloodWard){
      addStatus(g,src,"bleed",t.buff.bloodWard.bleed||2,t);
      delete t.buff.bloodWard;
    }
    if(src.buff.poisonHands) addStatus(g,t,"poison",2,src);
    if(opt.attack && src.buff?.bloodInfusion){
      addStatus(g,t,"bleed",src.buff.bloodInfusion.bleed||1,src);
      src.buff.bloodInfusion=null;
    }
    if(t.id==="poom" && opt.melee) addStatus(g,src,"hypnosis",1,t); // Purple Blood approximation: any melee HP hit
    if(t.id==="kku" && opt.melee) addStatus(g,src,"freeze",1,t);
    if(t.buff.frostArmorRetaliate && opt.melee) addStatus(g,src,"freeze",1,t);
    if(src.id==="eva" && (t.status.bleed||0)>0) heal(src,1);
    killCheck(t);
  }
  return reduced;
}

function validTargets(g,u,a){
  if(a.kind==="poomMassGuardMind") return [u];
  if(a.kind==="dodge" || a.kind==="selfCounter") return [u];
  if(a.kind==="protect" || a.kind==="bloodWard" || a.kind==="poisonHands" || a.kind==="frontDamageForAllyHp" || a.kind==="frontStatusForAllyHp" || a.kind==="empowerNextAttack" || a.kind==="frostArmorRetaliate") return allies(g,u);
  const es=enemies(g,u);
  if(["rowStatus","rowDamageStatus","rowMultiStatus"].includes(a.kind)) return es; // target picks row
  if(a.kind==="hypnosisCancelPayoff" || a.kind==="hypnosisPoisonCancelPayoff") return es.filter(t=>t.status.hypnosis);
  return es.filter(t=>{
    if(a.range!=="melee") return true;
    return t.row==="front" || !frontBlocked(g,t.side);
  });
}

function payoffReady(a,t,g,u){
  if(!t && a.kind!=="poomMassGuardMind") return false;
  switch(a.kind){
    case "bleedPayoff": return (t.status.bleed||0)>0;
    case "poisonPayoff": return (t.status.poison||0)>0;
    case "freezePayoff": case "glacier": return (t.status.freeze||0)>0;
    case "hypnosisDamagePayoff": case "mesmerPayoff": case "mindToxinConsume": return !!t.status.hypnosis;
    case "hypnosisCancelPayoff": case "hypnosisPoisonCancelPayoff": return !!t.status.hypnosis;
    case "poomMassGuardMind": return enemies(g,u).some(e=>e.status.hypnosis);
    case "absoluteZero": case "absoluteZeroConsume": return enemies(g,u).some(e=>e.status.freeze);
    default: return true;
  }
}
function isSetup(a){
  return ["status","multiStatus","rowStatus","rowMultiStatus","rowDamageStatus","attackSetup","damageStatus","damageStatusOnHit","freezeSetup","bloodWard","poisonHands","frontStatusForAllyHp","selfAllStatus","empowerNextAttack","whiteout","frontHypno","frostArmorRetaliate","proliferate"].includes(a.kind);
}
function isPayoff(a){
  return ["bleedPayoff","poisonPayoff","freezePayoff","glacier","hypnosisDamagePayoff","mesmerPayoff","mindToxinConsume","hypnosisCancelPayoff","hypnosisPoisonCancelPayoff","poomMassGuardMind","absoluteZero","absoluteZeroConsume","demonRupture"].includes(a.kind);
}
function approxDamage(a,t,g,u){
  if(!a) return 0;
  let d=a.dmg||0;
  switch(a.kind){
    case "bleedPayoff": d=(t.status.bleed||0)*(a.mult||1)+(a.bonus||0); break;
    case "poisonPayoff": d=(t.status.poison||0)*(a.mult||2)+(a.bonus||0); break;
    case "demonRupture": d=((t.status.poison||0)+(t.status.bleed||0))*(a.mult||2)+(a.bonus||0); break;
    case "freezePayoff": d=4+(t.status.freeze||0)*2; break;
    case "glacier": d=5+((t.status.freeze||0)?(a.bonus||0):0); break;
    case "absoluteZeroConsume": d=(t.status.freeze||0)*(a.mult||2); break;
    case "hypnosisDamagePayoff": d=t.status.hypnosis?a.payoffDmg:a.dmg; break;
    case "mesmerPayoff": d=(a.dmg||0)+(t.status.hypnosis?(a.bonus||0):0); break;
    case "damageStatus": case "damageStatusOnHit": d=a.dmg||0; break;
    case "armorStrike": d=armor(u); break;
    case "bloodDash": d=a.dmg||2; break;
  }
  return d;
}
function scoreAction(g,u,a,t,ap){
  let s=8 + rand()*5;
  if(a.cost>ap) return -999;
  if(isPayoff(a) && !payoffReady(a,t,g,u)) s -= 35;
  if(isPayoff(a) && payoffReady(a,t,g,u)) s += 18;
  if(isSetup(a)) s += 6;
  if(t && t.side!==u.side){
    s += Math.max(0, 16-t.hp)*1.2;
    if(approxDamage(a,t,g,u)>=t.hp) s += 20;
    if(a.onHit?.bleed && !t.status.bleed) s+=4;
    if(a.onHit?.freeze && !t.status.freeze) s+=4;
    if(a.status==="hypnosis" && !t.status.hypnosis) s+=5;
  }
  if(a.guard){
    if(u.hp/u.maxHp < .55) s+=8;
    if(a.kind==="poomMassGuardMind" && payoffReady(a,t,g,u)) s+=18;
  }
  if(["drain"].includes(a.kind) && u.hp<u.maxHp) s+=8;
  return Math.max(1,s);
}
function pickPlan(g,u,ap){
  let options=[];
  for(const a of u.abilities){
    if(a.cost>ap) continue;
    const ts=validTargets(g,u,a);
    if(!ts.length) continue;
    for(const t of ts){
      const score=scoreAction(g,u,a,t,ap);
      options.push({a,t,w:score});
    }
  }
  if(!options.length) return null;
  const total=options.reduce((x,o)=>x+o.w,0);
  let r=rand()*total;
  for(const o of options){ r-=o.w; if(r<=0) return o; }
  return options[options.length-1];
}
function choosePlansOldAI(g,side){
  let ap=3, safety=0;
  const plans=[];
  while(ap>0 && safety++<8){
    const candidates=[];
    for(const u of alive(g,side)){
      const p=pickPlan(g,u,ap);
      if(p) candidates.push({u,...p,w:p.w});
    }
    if(!candidates.length) break;
    const total=candidates.reduce((x,o)=>x+o.w,0);
    let r=rand()*total, chosen=candidates[0];
    for(const o of candidates){ r-=o.w; if(r<=0){chosen=o;break;} }
    plans.push({side,u:chosen.u,a:chosen.a,t:chosen.t});
    ap -= chosen.a.cost;
  }
  return plans;
}

function applyAbility(g,u,a,t){
  if(!u || u.dead || !a) return;
  const abilityKey = `${u.id}:${a.id}`;
  g.abilityUses[abilityKey]=(g.abilityUses[abilityKey]||0)+1;
  const metricBefore = {
    selfHp:u.hp,
    enemyHp:enemies(g,u).reduce((s,x)=>s+x.hp,0),
    allyHp:allies(g,u).reduce((s,x)=>s+x.hp,0),
    enemyStatus:enemies(g,u).reduce((s,x)=>s+Object.values(x.status||{}).reduce((a,b)=>a+(Number(b)||0),0),0),
    kills:enemies(g,u).filter(x=>x.dead).length,
    selfDead:u.dead,
    teamHp:hpTotal(g.units,u.side),
    enemyTeamHp:hpTotal(g.units,u.side==="A"?"B":"A")
  };
  if(a.guard) u.stats.guards += 1;

  // Frozen cancels non-guard
  if(u.status.frozen && !a.guard){ u.status.frozen=0; return; }

  // Dread approximation: 20% chance to cancel next non-guard
  if(u.status.dread && !a.guard && rand()<0.2){ u.status.dread=0; return; }

  switch(a.kind){
    case "attack":
      if((a.self||0)>0) lifeLoss(g,u,a.self,u);
      damage(g,u,t,a.dmg,{attack:true,melee:a.range==="melee",ignoreArmor:a.ignoreArmor,pierce:a.pierce});
      break;
    case "attackSetup": {
      if((a.self||0)>0) lifeLoss(g,u,a.self,u);
      const dealt=damage(g,u,t,a.dmg,{attack:true,melee:a.range==="melee",ignoreArmor:a.ignoreArmor,pierce:a.pierce});
      if(dealt>0 && a.onHit) for(const [s,n] of Object.entries(a.onHit)) addStatus(g,t,s,n,u);
      break;
    }
    case "damageStatus": {
      damage(g,u,t,a.dmg,{attack:true,melee:a.range==="melee",ignoreArmor:a.ignoreArmor,pierce:a.pierce});
      addStatus(g,t,a.status,a.stacks,u);
      break;
    }
    case "damageStatusOnHit": {
      const dealt=damage(g,u,t,a.dmg,{attack:true,melee:a.range==="melee",ignoreArmor:a.ignoreArmor,pierce:a.pierce});
      if(dealt>0) addStatus(g,t,a.status,a.stacks,u);
      break;
    }
    case "armorStrike": damage(g,u,t,(a.dmg||2)+armor(u),{attack:true,melee:true}); break;
    case "whiteout": if(t.status.freeze) addStatus(g,t,"exposed",1,u); else addStatus(g,t,"freeze",1,u); break;
    case "frontHypno": for(const x of rowUnits(g,u.side==="A"?"B":"A","front")){ addStatus(g,x,"hypnosis",1,u); addStatus(g,x,"exposed",1,u); } break;
    case "spirit": u.shield=(u.shield||0)+5; u.buff.dodge=true; break;
    case "frostArmorRetaliate": if(t){ t.tempArmor += a.armor||2; t.buff.frostArmorRetaliate=true; } break;
    case "proliferate": for(const x of enemies(g,u)){ if(x.status.poison) addStatus(g,x,"poison",1,u); if(x.status.bleed) addStatus(g,x,"bleed",1,u); } break;
    case "multi": for(let i=0;i<a.hits;i++) if(!t.dead) damage(g,u,t,a.dmg,{attack:true,melee:a.range==="melee"}); break;
    case "drain": { const dealt=damage(g,u,t,a.dmg,{attack:true,melee:a.range==="melee"}); if(dealt>0) heal(u,a.heal); break; }
    case "status": addStatus(g,t,a.status,a.stacks,u); break;
    case "multiStatus": for(const [s,n] of a.statuses) addStatus(g,t,s,n,u); break;
    case "rowStatus": for(const x of rowUnits(g,t.side,t.row||"front")) { addStatus(g,x,a.status,a.stacks,u); if(a.exhausted) addStatus(g,x,"exhausted",a.exhausted,u); } break;
    case "rowMultiStatus": for(const x of rowUnits(g,t.side,t.row||"front")) for(const [s,n] of a.statuses) addStatus(g,x,s,n,u); break;
    case "rowDamageStatus": for(const x of rowUnits(g,t.side,t.row||"front")){ const dealt=damage(g,u,x,a.dmg,{attack:true}); if(dealt>0) addStatus(g,x,a.status,a.stacks,u); } break;
    case "bleedPayoff": { const b=t.status.bleed||0; t.status.bleed=0; const dealt=damage(g,u,t,b*(a.mult||1)+(a.bonus||0),{attack:true,melee:a.range==="melee"}); if(b>0) heal(u,a.heal||0); break; }
    case "poisonPayoff": { const p=t.status.poison||0; t.status.poison=0; damage(g,u,t,p*(a.mult||2),{attack:true,ignoreArmor:a.ignoreArmor}); break; }
    case "freezePayoff": { const f=t.status.freeze||0; t.status.freeze=0; damage(g,u,t,4+f*2,{attack:true,pierce:a.pierce||0}); break; }
    case "glacier": damage(g,u,t,a.dmg+(t.status.freeze?a.bonus:0),{attack:true,melee:true}); break;
    case "freezeSetup": addStatus(g,t,"freeze",a.freeze,u); if(a.exposedIfFrozen && t.status.freeze) addStatus(g,t,"exposed",1,u); break;
    case "bloodDash": { const had=(t.status.bleed||0)>0; damage(g,u,t,a.dmg||2,{attack:true,pierce:a.pierce||0}); if(had) addStatus(g,t,"exposed",1,u); break; }
    case "hypnosisDamagePayoff": { const had=!!t.status.hypnosis; if(had) t.status.hypnosis=0; damage(g,u,t,had?a.payoffDmg:a.dmg,{attack:true,ignoreArmor:a.ignoreArmor}); break; }
    case "mesmerPayoff": { const had=!!t.status.hypnosis; if(had) t.status.hypnosis=0; damage(g,u,t,a.dmg+(had?a.bonus:0),{attack:true}); break; }
    case "mindToxinConsume": { const had=!!t.status.hypnosis; if(had) t.status.hypnosis=0; damage(g,u,t,had?(a.payoffDmg||6):(a.dmg||3),{attack:true,ignoreArmor:had&&!!a.ignoreArmor}); if(had&&!t.dead) addStatus(g,t,"poison",a.poison||2,u); break; }
    case "hypnosisCancelPayoff": if(t.status.hypnosis){ t.status.hypnosis=0; t.buff.cancelNextAttack=true; } break;
    case "hypnosisPoisonCancelPayoff": if(t.status.hypnosis){ t.status.hypnosis=0; t.buff.cancelNextAttackPoison=2; } break;
    case "poomMassGuardMind": {
      const affected=enemies(g,u).filter(e=>e.status.hypnosis);
      for(const e of affected){ e.status.hypnosis=0; e.buff.poomTauntTarget=u.id; }
      u.tempArmor += Math.max(a.minArmor||0, affected.length);
      break;
    }
    case "dodge": u.buff.dodge=true; break;
    case "selfCounter": u.buff.selfCounter={status:a.status, stacks:a.stacks}; break;
    case "protect": if(t) { t.buff.protectedBy=u.id; if(a.armor) t.tempArmor += a.armor; if(a.cleanse){ for(const st of ["poison","bleed","freeze","hypnosis","dread","exposed","exhausted"]){ if(t.status[st]){ t.status[st]=Math.max(0,t.status[st]-a.cleanse); break; } } } } break;
    case "empowerNextAttack": if(t) { t.buff.bloodInfusion={bonus:a.bonus||2, bleed:a.bleed||1}; } break;
    case "bloodWard": if(t){ lifeLoss(g,t,a.self??0,u); t.tempArmor += a.armor||0; t.buff.bloodWard={bleed:a.stacks??a.bleed??2}; } break;
    case "poisonHands": t.buff.poisonHands=true; break;
    case "frontDamageForAllyHp": lifeLoss(g,t,a.self||2,u); for(const x of rowUnits(g,u.side==="A"?"B":"A","front")) damage(g,u,x,a.dmg,{attack:true}); break;
    case "frontStatusForAllyHp": lifeLoss(g,t,a.self||2,u); if(a.armorSelf) u.tempArmor += a.armorSelf; for(const x of rowUnits(g,u.side==="A"?"B":"A","front")) { addStatus(g,x,a.status,a.stacks,u); if(a.exhausted) addStatus(g,x,"exhausted",a.exhausted,u); } break;
    case "selfAllStatus": lifeLoss(g,u,a.self||2,u); for(const x of enemies(g,u)) addStatus(g,x,a.status,a.stacks,u); break;
    case "toxicGrip": { const already=!!t.status.poison; damage(g,u,t,a.dmg,{attack:true,melee:true}); if(already) addStatus(g,t,"exhausted",1,u); addStatus(g,t,"poison",a.poison,u); break; }
    case "punishGuard": damage(g,u,t,t.buff.usedGuard?a.guardedDmg:a.dmg,{attack:true}); break;
    case "assassinate": damage(g,u,t,a.dmg+(t.row==="back"&&!frontBlocked(g,t.side)?a.bonus:0),{attack:true,pierce:a.pierce}); break;
    case "revenge": lifeLoss(g,u,a.self||3,u); damage(g,u,t,a.dmg+(u.buff.wasAttacked?a.bonus:0),{attack:true,melee:true}); break;
    case "absoluteZero": for(const x of enemies(g,u).filter(x=>x.status.freeze)){damage(g,u,x,a.dmg,{attack:true}); if(!x.dead) addStatus(g,x,"exhausted",1,u);} break;
    case "absoluteZeroConsume": for(const x of enemies(g,u).filter(x=>x.status.freeze)){ const f=x.status.freeze||0; x.status.freeze=0; damage(g,u,x,f*(a.mult||2),{attack:true,ignoreArmor:!!a.ignoreArmor}); if(!x.dead) addStatus(g,x,"exhausted",1,u); } break;
    case "demonRupture": { const total=(t.status.poison||0)+(t.status.bleed||0); t.status.poison=0; t.status.bleed=0; damage(g,u,t,total*(a.mult||2)+(a.bonus||0),{attack:true,ignoreArmor:a.ignoreArmor}); break; }
    default: break;
  }

  const metricAfter = {
    selfHp:u.hp,
    enemyHp:enemies(g,u).reduce((s,x)=>s+x.hp,0),
    allyHp:allies(g,u).reduce((s,x)=>s+x.hp,0),
    enemyStatus:enemies(g,u).reduce((s,x)=>s+Object.values(x.status||{}).reduce((a,b)=>a+(Number(b)||0),0),0),
    kills:enemies(g,u).filter(x=>x.dead).length,
    selfDead:u.dead,
    teamHp:hpTotal(g.units,u.side),
    enemyTeamHp:hpTotal(g.units,u.side==="A"?"B":"A")
  };
  const os = ensureAbilityOutcome(abilityKey, u.name, a.name, a.kind, a.cost);
  os.uses++;
  const damageDelta = Math.max(0, metricBefore.enemyHp - metricAfter.enemyHp);
  const healDelta = Math.max(0, metricAfter.allyHp - metricBefore.allyHp);
  const statusDelta = Math.max(0, metricAfter.enemyStatus - metricBefore.enemyStatus);
  const killsDelta = Math.max(0, metricAfter.kills - metricBefore.kills);
  os.totalDamage += damageDelta;
  os.totalHealing += healDelta;
  os.totalStatus += statusDelta;
  os.totalKills += killsDelta;
  os.totalPoison += t?.status?.poison || 0;
  os.totalBleed += t?.status?.bleed || 0;
  os.totalFreeze += t?.status?.freeze || 0;
  os.totalHypnosis += t?.status?.hypnosis || 0;
  os.totalValue += damageDelta + healDelta*.7 + statusDelta*.65 + killsDelta*8;
  if(metricAfter.selfDead && !metricBefore.selfDead) os.deadUses++;
  if(metricBefore.teamHp < metricBefore.enemyTeamHp) os.usedWhenBehind++;
}

function endRound(g){
  g.bloodEchoUsed=false;
  for(const u of g.units){
    if(u.dead) continue;
    const p=u.status.poison||0;
    if(p>0){
      const dmg=Math.ceil(p/2);
      u.status.poison=Math.max(0,p-dmg);
      lifeLoss(g,u,dmg,null);
    }
    u.shield=0; u.tempArmor=0;
    delete u.status.exhausted; delete u.status.dread;
    u.buff={};
  }
}

function makeTeam(side, ids){
  const positions=[["front",0],["back",1],["front",2]];
  // Put warrior/brute front, squishies back
  const defs=ids.map(id=>ROSTER.find(c=>c.id===id));
  defs.sort((a,b)=>((["warrior","brute"].includes(b.cls)?1:0)-(["warrior","brute"].includes(a.cls)?1:0)));
  return defs.map((d,i)=>clone(d,side,positions[i][0],positions[i][1]));
}
function randomTeamIds(){
  return shuffle(ROSTER.map(c=>c.id)).slice(0,3);
}


/* ===== AI comparison mode: smart AI only, no ability/stat changes ===== */
function expectedRawDamageSmartAI(a,t,g,u){
  if(!a || !t) return 0;
  let d = approxDamage(a,t,g,u) || 0;
  if(a.kind==="attackSetup") d = a.dmg || 0;
  if(a.kind==="rowDamageStatus") d = (a.dmg||0) * Math.max(1,rowUnits(g,t.side,t.row||"front").length);
  if(a.kind==="frontDamageForAllyHp") d = (a.dmg||0) * Math.max(1,rowUnits(g,u.side==="A"?"B":"A","front").length);
  if(a.kind==="absoluteZeroConsume") d = enemies(g,u).reduce((s,x)=>s+(x.status.freeze||0)*(a.mult||2),0);
  return d;
}
function statusPotentialSmartAI(a,t,g,u){
  let v=0;
  const add=(s,n,target=t)=>{
    if(!s || !target) return;
    const has=target.status?.[s]||0;
    const m=s==="poison"?1.1:s==="bleed"?1.25:s==="freeze"?1.1:s==="hypnosis"?1.35:s==="exposed"?1.0:.8;
    v+=(n||1)*m*(has?0.7:1.15);
  };
  if(a.onHit) for(const [s,n] of Object.entries(a.onHit)) add(s,n);
  if(a.status) add(a.status,a.stacks||1);
  if(a.statuses) for(const [s,n] of a.statuses) add(s,n);
  return v;
}
function targetScoreSmartAI(g,u,a,t,ap){
  if(!t) return a.kind==="poomMassGuardMind" ? (payoffReady(a,t,g,u)?30:-40) : 0;
  const raw=expectedRawDamageSmartAI(a,t,g,u);
  const effective = a.ignoreArmor ? raw : Math.max(0, raw - armor(t) + (a.pierce||0));
  let s = effective*2.2 + statusPotentialSmartAI(a,t,g,u)*3 + Math.max(0,14-t.hp)*1.1;
  if(effective>=t.hp) s+=34;
  else if(effective>=t.hp*.65) s+=12;
  if(isPayoff(a)) s += payoffReady(a,t,g,u) ? 24 : -42;
  if(isSetup(a)){
    const already=(a.status&&t.status[a.status])||(a.statuses&&a.statuses.every(([st])=>t.status[st]));
    s += already ? -4 : 8;
  }
  if(u.cls==="assassin" && t.row==="back") s+=7;
  if(u.cls==="brute" && a.range==="melee") s+=5;
  if(u.cls==="sorcerer" && /row|absolute|fog|wave|field/i.test(a.name)) s+=6;
  if(a.pierce || a.ignoreArmor) s += armor(t)*1.2;
  return s;
}
function abilityScoreSmartAI(g,u,a,ts,ap,plans){
  if(a.cost>ap) return -999;
  let s=8+a.cost+(ts?.length?Math.max(...ts.map(t=>targetScoreSmartAI(g,u,a,t,ap))):targetScoreSmartAI(g,u,a,null,ap));
  const lowSelf=u.hp<=u.maxHp*.45;
  const lowAlly=allies(g,u).some(x=>x.hp<=x.maxHp*.45);
  if(a.guard){
    s += lowSelf ? 10 : -3;
    s += lowAlly ? 8 : 0;
    if(["protect","bloodWard"].includes(a.kind)) s += lowAlly ? 8 : -8;
    if(a.kind==="poomMassGuardMind") s += payoffReady(a,null,g,u) ? 22 : -40;
  }
  if(isPayoff(a) && a.kind!=="poomMassGuardMind" && !(ts||[]).some(t=>payoffReady(a,t,g,u))) s-=36;
  if((plans||[]).some(p=>p.u===u)) s-=8;
  s += rand()*4-1.5;
  return Math.max(.5,s);
}
function pickPlanSmartAI(g,u,ap,plans=[]){
  const opts=[];
  for(const a of u.abilities){
    if(a.cost>ap) continue;
    const ts=validTargets(g,u,a);
    if(!ts.length) continue;
    const base=abilityScoreSmartAI(g,u,a,ts,ap,plans);
    for(const t of ts) opts.push({a,t,w:base+targetScoreSmartAI(g,u,a,t,ap)*.25});
  }
  if(!opts.length) return null;
  opts.sort((a,b)=>b.w-a.w);
  const top=opts.slice(0,3);
  const total=top.reduce((s,o)=>s+Math.max(1,o.w),0);
  let r=rand()*total;
  for(const o of top){ r-=Math.max(1,o.w); if(r<=0) return o; }
  return top[0];
}
function choosePlansSmartAI(g,side){
  let ap=3, safety=0;
  const plans=[];
  while(ap>0 && safety++<7){
    const candidates=[];
    for(const u of alive(g,side)){
      const p=pickPlanSmartAI(g,u,ap,plans);
      if(p) candidates.push({side,u,...p,w:p.w});
    }
    if(!candidates.length) break;
    candidates.sort((a,b)=>b.w-a.w);
    const top=candidates.slice(0,3);
    const total=top.reduce((s,o)=>s+Math.max(1,o.w),0);
    let r=rand()*total, chosen=top[0];
    for(const o of top){ r-=Math.max(1,o.w); if(r<=0){chosen=o;break;} }
    plans.push({side,u:chosen.u,a:chosen.a,t:chosen.t});
    ap -= chosen.a.cost;
  }
  return plans;
}

function simulateGame(gameId){
  const idsA=randomTeamIds(), idsB=randomTeamIds();
  const g={id:gameId, round:1, units:[...makeTeam("A",idsA),...makeTeam("B",idsB)], abilityUses:{}};
  const maxRounds=20;
  for(; g.round<=maxRounds; g.round++){
    const plans=[...choosePlansSmartAI(g,"A"), ...choosePlansOldAI(g,"B")];
    for(const p of plans) p.u.buff.usedGuard = p.u.buff.usedGuard || !!p.a.guard;
    plans.sort((x,y)=>((y.a.guard?1:0)-(x.a.guard?1:0)) || ((y.u.speed+y.a.spd)-(x.u.speed+x.a.spd)) || (rand()-.5));
    for(const p of plans){
      if(p.u.dead) continue;
      // cancel buffs
      if(p.u.buff.cancelNextAttack && !p.a.guard){ p.u.buff.cancelNextAttack=false; continue; }
      if(p.u.buff.cancelNextAttackPoison && !p.a.guard){ const poison=p.u.buff.cancelNextAttackPoison; p.u.buff.cancelNextAttackPoison=0; addStatus(g,p.u,"poison",poison,null); continue; }
      if(p.t && p.t.dead) {
        const vt=validTargets(g,p.u,p.a);
        p.t=vt.length?choice(vt):null;
      }
      if(!p.t && !["poomMassGuardMind","dodge","selfCounter"].includes(p.a.kind)) continue;
      applyAbility(g,p.u,p.a,p.t);
      if(!alive(g,"A").length || !alive(g,"B").length) break;
    }
    if(!alive(g,"A").length || !alive(g,"B").length) break;
    endRound(g);
    if(!alive(g,"A").length || !alive(g,"B").length) break;
  }
  const aAlive=alive(g,"A").length, bAlive=alive(g,"B").length;
  const winner = aAlive>bAlive ? "A" : bAlive>aAlive ? "B" : (g.units.filter(u=>u.side==="A").reduce((s,u)=>s+u.hp,0) >= g.units.filter(u=>u.side==="B").reduce((s,u)=>s+u.hp,0) ? "A":"B");
  return {g,winner,idsA,idsB,rounds:g.round};
}

const charStats={};
const abilityStats={};
const profStats={};
const classStats={};
const armorBuckets={};
const pairStats={};
const teamStats={};

const matchupStats={};
const abilityOutcomeStats={};
const roundStats={};
const sideStats={};
const teamTraitStats={};
const hpMarginStats={wins:0,totalMargin:0,totalWinnerHp:0,totalLoserHp:0};

function ensureAbilityOutcome(key, character, ability, kind, cost){
  abilityOutcomeStats[key] ||= {
    key, character, ability, kind, cost,
    uses:0, wins:0,
    totalDamage:0, totalHealing:0, totalStatus:0, totalKills:0,
    totalPoison:0, totalBleed:0, totalFreeze:0, totalHypnosis:0,
    totalValue:0, deadUses:0,
    usedWhenBehind:0, winsWhenBehind:0
  };
  return abilityOutcomeStats[key];
}

function teamTraits(ids){
  const defs=ids.map(id=>ROSTER.find(c=>c.id===id));
  const cls={}; const prof={}; let armor=0; let hp=0;
  for(const d of defs){
    cls[d.cls]=(cls[d.cls]||0)+1;
    for(const p of d.prof) prof[p]=(prof[p]||0)+1;
    armor+=d.armor; hp+=d.hp;
  }
  const traits=[];
  for(const [k,v] of Object.entries(cls)) if(v>=2) traits.push(`2plus_class_${k}`);
  for(const [k,v] of Object.entries(prof)) if(v>=2) traits.push(`2plus_prof_${k}`);
  if(armor>=6) traits.push("high_armor_team");
  if(hp>=78) traits.push("high_hp_team");
  return traits;
}

function addWinLoss(obj, won){
  obj.picks=(obj.picks||0)+1;
  if(won) obj.wins=(obj.wins||0)+1;
}

function hpTotal(units, side){
  return units.filter(u=>u.side===side).reduce((s,u)=>s+(u.hp||0),0);
}


for(const c of ROSTER){
  charStats[c.id]={
    id:c.id,name:c.name,cls:c.cls,prof:c.prof.join(" "),baseHp:c.hp,baseArmor:c.armor,
    picks:0,wins:0,damage:0,taken:0,healing:0,statusApplied:0,guards:0,rounds:0,
    teamWins:0, teamGames:0
  };
  classStats[c.cls] ||= {type:"class", key:c.cls, picks:0, wins:0, chars:new Set()};
  classStats[c.cls].chars.add(c.name);
  for(const p of c.prof){
    profStats[p] ||= {type:"proficiency", key:p, picks:0, wins:0, chars:new Set()};
    profStats[p].chars.add(c.name);
  }
  const bucket = c.armor<=0 ? "0" : c.armor===1 ? "1" : c.armor===2 ? "2" : c.armor===3 ? "3" : "4+";
  armorBuckets[bucket] ||= {armorBucket:bucket, picks:0, wins:0, chars:new Set()};
  armorBuckets[bucket].chars.add(c.name);

  for(const a of c.abilities){
    abilityStats[`${c.id}:${a.id}`]={character:c.name,ability:a.name,kind:a.kind,cost:a.cost,uses:0,winsWhenOnWinnerTeam:0,usesPerPick:0};
  }
}

function addPair(ids, winnerSide, side){
  const sorted=[...ids].sort();
  for(let i=0;i<sorted.length;i++) for(let j=i+1;j<sorted.length;j++){
    const key=`${sorted[i]}+${sorted[j]}`;
    pairStats[key] ||= {pair:key,picks:0,wins:0};
    pairStats[key].picks++;
    if(side===winnerSide) pairStats[key].wins++;
  }
}

let totalRounds=0;
const sidePolicyStats={A:{policy:'smart',wins:0,games:0},B:{policy:'old',wins:0,games:0}};
for(let i=0;i<GAMES;i++){
  const {g,winner,idsA,idsB,rounds}=simulateGame(i);
  totalRounds+=rounds;
  sidePolicyStats.A.games++;
  sidePolicyStats.B.games++;
  sidePolicyStats[winner].wins++;

  const winnerHp = hpTotal(g.units,winner);
  const loserSide = winner==="A" ? "B" : "A";
  const loserHp = hpTotal(g.units,loserSide);
  hpMarginStats.wins++;
  hpMarginStats.totalWinnerHp += winnerHp;
  hpMarginStats.totalLoserHp += loserHp;
  hpMarginStats.totalMargin += (winnerHp-loserHp);

  const teamA=[...idsA].sort().join("+");
  const teamB=[...idsB].sort().join("+");

  for(const t of teamTraits(idsA)){
    teamTraitStats[t] ||= {trait:t,picks:0,wins:0};
    teamTraitStats[t].picks++;
    if(winner==="A") teamTraitStats[t].wins++;
  }
  for(const t of teamTraits(idsB)){
    teamTraitStats[t] ||= {trait:t,picks:0,wins:0};
    teamTraitStats[t].picks++;
    if(winner==="B") teamTraitStats[t].wins++;
  }

  for(const a of idsA) for(const b of idsB){
    const key=`${a}_vs_${b}`;
    matchupStats[key] ||= {character:a, opponent:b, games:0, wins:0};
    matchupStats[key].games++;
    if(winner==="A") matchupStats[key].wins++;
    const rkey=`${b}_vs_${a}`;
    matchupStats[rkey] ||= {character:b, opponent:a, games:0, wins:0};
    matchupStats[rkey].games++;
    if(winner==="B") matchupStats[rkey].wins++;
  }
  teamStats[teamA] ||= {team:teamA,picks:0,wins:0};
  teamStats[teamB] ||= {team:teamB,picks:0,wins:0};
  teamStats[teamA].picks++; teamStats[teamB].picks++;
  if(winner==="A") teamStats[teamA].wins++; else teamStats[teamB].wins++;

  addPair(idsA,winner,"A");
  addPair(idsB,winner,"B");

  for(const u of g.units){
    const st=charStats[u.id];
    st.picks++;
    if(u.side===winner) st.wins++;
    st.damage+=u.stats.damage; st.taken+=u.stats.taken; st.healing+=u.stats.healing; st.statusApplied+=u.stats.statusApplied; st.guards+=u.stats.guards; st.rounds+=rounds;

    classStats[u.cls].picks++;
    if(u.side===winner) classStats[u.cls].wins++;

    for(const p of u.prof){
      profStats[p].picks++;
      if(u.side===winner) profStats[p].wins++;
    }

    const bucket = u.baseArmor<=0 ? "0" : u.baseArmor===1 ? "1" : u.baseArmor===2 ? "2" : u.baseArmor===3 ? "3" : "4+";
    armorBuckets[bucket].picks++;
    if(u.side===winner) armorBuckets[bucket].wins++;
  }
  for(const [key,n] of Object.entries(g.abilityUses)){
    abilityStats[key].uses += n;
    const charId=key.split(":")[0];
    const unit=g.units.find(u=>u.id===charId);
    if(unit && unit.side===winner) {
      abilityStats[key].winsWhenOnWinnerTeam += n;
      if(abilityOutcomeStats[key]) abilityOutcomeStats[key].wins += n;
    }
  }
}

function pct(x){return Math.round(x*1000)/10;}
function rate(obj){ return pct(obj.wins/Math.max(1,obj.picks)); }
const characterSummary=Object.values(charStats).map(s=>({
  id:s.id, name:s.name, cls:s.cls, prof:s.prof, baseHp:s.baseHp, baseArmor:s.baseArmor,
  picks:s.picks, winRate:rate(s),
  avgDamage:+(s.damage/Math.max(1,s.picks)).toFixed(2),
  avgTaken:+(s.taken/Math.max(1,s.picks)).toFixed(2),
  avgHealing:+(s.healing/Math.max(1,s.picks)).toFixed(2),
  avgStatusApplied:+(s.statusApplied/Math.max(1,s.picks)).toFixed(2),
  avgGuards:+(s.guards/Math.max(1,s.picks)).toFixed(2),
  avgRounds:+(s.rounds/Math.max(1,s.picks)).toFixed(2),
  damageTakenRatio:+((s.damage+1)/(s.taken+1)).toFixed(2)
})).sort((a,b)=>b.winRate-a.winRate);

const abilitySummary=Object.entries(abilityStats).map(([key,s])=>({
  key, character:s.character, ability:s.ability, kind:s.kind, cost:s.cost, uses:s.uses,
  usesPerPick:+(s.uses/Math.max(1,charStats[key.split(":")[0]].picks)).toFixed(2),
  winShareWhenUsed:pct(s.winsWhenOnWinnerTeam/Math.max(1,s.uses))
})).sort((a,b)=>b.uses-a.uses);

const classSummary=Object.values(classStats).map(s=>({
  class:s.key, picks:s.picks, winRate:rate(s), characters:[...s.chars].join(", ")
})).sort((a,b)=>b.winRate-a.winRate);

const proficiencySummary=Object.values(profStats).map(s=>({
  proficiency:s.key, picks:s.picks, winRate:rate(s), characters:[...s.chars].join(", ")
})).sort((a,b)=>b.winRate-a.winRate);

const armorSummary=Object.values(armorBuckets).map(s=>({
  armor:s.armorBucket, picks:s.picks, winRate:rate(s), characters:[...s.chars].join(", ")
})).sort((a,b)=>Number(a.armor.replace("+",""))-Number(b.armor.replace("+","")));

const pairSummary=Object.values(pairStats).filter(s=>s.picks>=GAMES*0.04).map(s=>({
  pair:s.pair, picks:s.picks, winRate:rate(s)
})).sort((a,b)=>b.winRate-a.winRate);

const teamSummary=Object.values(teamStats).filter(s=>s.picks>=Math.max(5,GAMES*0.002)).map(s=>({
  team:s.team, picks:s.picks, winRate:rate(s)
})).sort((a,b)=>b.winRate-a.winRate);

const flags=[];
for(const c of characterSummary){
  if(c.winRate>=58) flags.push({type:"overperformer", item:c.name, note:`${c.winRate}% win rate`});
  if(c.winRate<=42) flags.push({type:"underperformer", item:c.name, note:`${c.winRate}% win rate`});
  if(c.avgGuards>2.2) flags.push({type:"guard-heavy", item:c.name, note:`${c.avgGuards} guards/game`});
}
for(const a of abilitySummary){
  if(a.uses>GAMES*0.35 && a.winShareWhenUsed>=58) flags.push({type:"ability-high-impact", item:`${a.character} — ${a.ability}`, note:`used ${a.uses} times, ${a.winShareWhenUsed}% winner-side use`});
  if(a.uses<Math.max(10,GAMES*0.03)) flags.push({type:"ability-low-use", item:`${a.character} — ${a.ability}`, note:`used ${a.uses} times`});
}
for(const a of armorSummary){
  if(a.winRate>=57) flags.push({type:"armor-outlier-high", item:`Armor ${a.armor}`, note:`${a.winRate}% win rate; chars: ${a.characters}`});
  if(a.winRate<=43) flags.push({type:"armor-outlier-low", item:`Armor ${a.armor}`, note:`${a.winRate}% win rate; chars: ${a.characters}`});
}
for(const p of proficiencySummary){
  if(p.winRate>=57) flags.push({type:"proficiency-outlier-high", item:p.proficiency, note:`${p.winRate}% win rate; chars: ${p.characters}`});
  if(p.winRate<=43) flags.push({type:"proficiency-outlier-low", item:p.proficiency, note:`${p.winRate}% win rate; chars: ${p.characters}`});
}
for(const c of classSummary){
  if(c.winRate>=57) flags.push({type:"class-outlier-high", item:c.class, note:`${c.winRate}% win rate; chars: ${c.characters}`});
  if(c.winRate<=43) flags.push({type:"class-outlier-low", item:c.class, note:`${c.winRate}% win rate; chars: ${c.characters}`});
}

const abilityPrecisionSummary=Object.values(abilityOutcomeStats).map(s=>({
  key:s.key,
  character:s.character,
  ability:s.ability,
  kind:s.kind,
  cost:s.cost,
  uses:s.uses,
  winRateWhenUsed:pct(s.wins/Math.max(1,s.uses)),
  avgDamage:+(s.totalDamage/Math.max(1,s.uses)).toFixed(2),
  avgHealing:+(s.totalHealing/Math.max(1,s.uses)).toFixed(2),
  avgStatus:+(s.totalStatus/Math.max(1,s.uses)).toFixed(2),
  avgKills:+(s.totalKills/Math.max(1,s.uses)).toFixed(3),
  avgValue:+(s.totalValue/Math.max(1,s.uses)).toFixed(2),
  deathRateAfterUse:pct(s.deadUses/Math.max(1,s.uses)),
  usedWhenBehind:s.usedWhenBehind
})).sort((a,b)=>b.avgValue-a.avgValue);

const matchupSummary=Object.values(matchupStats).filter(s=>s.games>=GAMES*.015).map(s=>({
  character:s.character,
  opponent:s.opponent,
  games:s.games,
  winRate:pct(s.wins/Math.max(1,s.games))
})).sort((a,b)=>a.character.localeCompare(b.character)||b.winRate-a.winRate);

const matchupOutliers=matchupSummary
  .filter(s=>s.games>=GAMES*.015 && (s.winRate>=65 || s.winRate<=35))
  .sort((a,b)=>Math.abs(b.winRate-50)-Math.abs(a.winRate-50));

const teamTraitSummary=Object.values(teamTraitStats).map(s=>({
  trait:s.trait,
  picks:s.picks,
  winRate:pct(s.wins/Math.max(1,s.picks))
})).sort((a,b)=>b.winRate-a.winRate);

const closeGameSummary={
  avgWinnerHp:+(hpMarginStats.totalWinnerHp/Math.max(1,hpMarginStats.wins)).toFixed(2),
  avgLoserHp:+(hpMarginStats.totalLoserHp/Math.max(1,hpMarginStats.wins)).toFixed(2),
  avgHpMargin:+(hpMarginStats.totalMargin/Math.max(1,hpMarginStats.wins)).toFixed(2)
};

const surgicalBalanceFlags=[];
for(const a of abilityPrecisionSummary){
  if(a.uses>=GAMES*.12 && a.avgValue>=7) surgicalBalanceFlags.push({type:"ability-too-efficient", item:`${a.character} — ${a.ability}`, note:`avg value ${a.avgValue}, used ${a.uses}, win ${a.winRateWhenUsed}%`});
  if(a.uses>=GAMES*.12 && a.avgValue<=1.25) surgicalBalanceFlags.push({type:"ability-too-weak", item:`${a.character} — ${a.ability}`, note:`avg value ${a.avgValue}, used ${a.uses}, win ${a.winRateWhenUsed}%`});
  if(a.uses<Math.max(20,GAMES*.015)) surgicalBalanceFlags.push({type:"dead-ability", item:`${a.character} — ${a.ability}`, note:`only ${a.uses} uses`});
  if(a.deathRateAfterUse>=18) surgicalBalanceFlags.push({type:"self-punishing-ability", item:`${a.character} — ${a.ability}`, note:`${a.deathRateAfterUse}% death after use`});
}
for(const m of matchupOutliers.slice(0,50)){
  surgicalBalanceFlags.push({type:m.winRate>50?"matchup-dominant":"matchup-weak", item:`${m.character} vs ${m.opponent}`, note:`${m.winRate}% over ${m.games} games`});
}

const report={
  meta:{games:GAMES, seed:SEED, avgRounds:+(totalRounds/GAMES).toFixed(2), generatedAt:new Date().toISOString()},
  notes:[
    "This is a headless approximation, not a replacement for human playtesting.",
    "It is useful for finding obvious overperformers, underperformers, overused guards, and dead abilities.",
    "AI-vs-AI results are biased by the AI heuristic."
  ],
  flags,
  characterSummary,
  abilitySummary,
  classSummary,
  proficiencySummary,
  armorSummary,
  pairSummary,
  teamSummary,
  abilityPrecisionSummary,
  matchupSummary,
  matchupOutliers,
  teamTraitSummary,
  closeGameSummary,
  surgicalBalanceFlags,
  sidePolicyStats,
  policyWinRates:{A:pct(sidePolicyStats.A.wins/Math.max(1,sidePolicyStats.A.games)),B:pct(sidePolicyStats.B.wins/Math.max(1,sidePolicyStats.B.games))}
};

const outDir=path.join(process.cwd(),"balance_reports");
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,"latest.json"), JSON.stringify(report,null,2));

function csv(rows){
  if(!rows.length) return "";
  const cols=Object.keys(rows[0]);
  const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  return [cols.join(","), ...rows.map(r=>cols.map(c=>esc(r[c])).join(","))].join("\n");
}
fs.writeFileSync(path.join(outDir,"character_summary.csv"), csv(characterSummary));
fs.writeFileSync(path.join(outDir,"ability_summary.csv"), csv(abilitySummary));
fs.writeFileSync(path.join(outDir,"class_summary.csv"), csv(classSummary));
fs.writeFileSync(path.join(outDir,"proficiency_summary.csv"), csv(proficiencySummary));
fs.writeFileSync(path.join(outDir,"armor_summary.csv"), csv(armorSummary));
fs.writeFileSync(path.join(outDir,"pair_summary.csv"), csv(pairSummary));
fs.writeFileSync(path.join(outDir,"team_summary.csv"), csv(teamSummary));
fs.writeFileSync(path.join(outDir,"ability_precision_summary.csv"), csv(abilityPrecisionSummary));
fs.writeFileSync(path.join(outDir,"matchup_summary.csv"), csv(matchupSummary));
fs.writeFileSync(path.join(outDir,"matchup_outliers.csv"), csv(matchupOutliers));
fs.writeFileSync(path.join(outDir,"team_trait_summary.csv"), csv(teamTraitSummary));
fs.writeFileSync(path.join(outDir,"surgical_balance_flags.csv"), csv(surgicalBalanceFlags));

console.log(`Simulated ${GAMES} games. Avg rounds: ${report.meta.avgRounds}`);
console.log("\nTop win rates:");
console.table(characterSummary.slice(0,6).map(c=>({name:c.name, winRate:c.winRate, avgDamage:c.avgDamage, avgTaken:c.avgTaken, avgGuards:c.avgGuards})));
console.log("\nLowest win rates:");
console.table(characterSummary.slice(-6).map(c=>({name:c.name, winRate:c.winRate, avgDamage:c.avgDamage, avgTaken:c.avgTaken, avgGuards:c.avgGuards})));
console.log("\nArmor buckets:");
console.table(armorSummary);
console.log("\nClass summary:");
console.table(classSummary);
console.log("\nProficiency summary:");
console.table(proficiencySummary);
console.log("\nTop pairs:");
console.table(pairSummary.slice(0,8));
console.log("\nAbility precision top value:");
console.table(abilityPrecisionSummary.slice(0,12).map(a=>({ability:`${a.character} — ${a.ability}`, uses:a.uses, value:a.avgValue, dmg:a.avgDamage, status:a.avgStatus, win:a.winRateWhenUsed})));
console.log("\nAbility precision low value:");
console.table(abilityPrecisionSummary.slice(-12).map(a=>({ability:`${a.character} — ${a.ability}`, uses:a.uses, value:a.avgValue, dmg:a.avgDamage, status:a.avgStatus, win:a.winRateWhenUsed})));
console.log("\nTeam traits:");
console.table(teamTraitSummary);
console.log("\nClose game summary:");
console.table([closeGameSummary]);
console.log("\nSurgical balance flags:");
console.table(surgicalBalanceFlags.slice(0,25));
console.log("\nImportant flags:");
console.table(flags.slice(0,25));
