
const CLASS = {
  warrior:{icon:"⚔️"}, brute:{icon:"✊"}, assassin:{icon:"🗡️"}, sorcerer:{icon:"🔮"}
};
const ART = {
  smithen:"url('assets/archer.png')", dravain:"url('assets/blade.png')",
  yaura:"url('assets/blood.png')", kku:"url('assets/golem.png')",
  kahro:"url('assets/kahro.png')", maoja:"url('assets/maoja.png')",
  paleya:"url('assets/paleaya.png')", poom:"url('assets/pom.png')",
  shaman:"url('assets/shaman.png')", eva:"url('assets/spell.png')",
  hyafrost:"url('assets/hyafrost.png')", bakub:"url('assets/bakub.png')",
  hope:"url('assets/hope.png')",
  zahria:"url('assets/zahria.png')",
  boss:"url('assets/boss_toad.png')"
};

const PROF_ICONS = {
  assassin: "assets/proficiency_icons/assassin.png",
  blacksmith: "assets/proficiency_icons/blacksmith.png",
  bloodcraft: "assets/proficiency_icons/bloodcraft.png",
  brute: "assets/proficiency_icons/brute.png",
  darkness: "assets/proficiency_icons/darkness.png",
  demon: "assets/proficiency_icons/demon.png",
  divinity: "assets/proficiency_icons/divinity.png",
  fae: "assets/proficiency_icons/fae.png",
  hypnotic: "assets/proficiency_icons/hyponotic.png",
  icecraft: "assets/proficiency_icons/icecraft.png",
  spirit: "assets/proficiency_icons/spirit.png",
  vampire: "assets/proficiency_icons/vampire.png",
  warrior: "assets/proficiency_icons/warrior.png",
  witchcraft: "assets/proficiency_icons/witchcraft.png"
};

function abilityIconKey(caster, ability) {
  const text = `${ability.name} ${ability.desc || ""} ${ability.effect || ""}`.toLowerCase();

  if (/hypno|mind|dream|mesmer|predict|future/.test(text)) return "hypnotic";
  if (/poison|toxic|rot|caustic|vial|brew|witch|potion/.test(text)) return "witchcraft";
  if (/blood|bleed|crimson|fang|vampir|bite|drain/.test(text)) return caster?.prof?.includes("bloodcraft") ? "bloodcraft" : "vampire";
  if (/divine|divinity|heal|mend|bless|hope|radiant|judgement|judgment/.test(text)) return "divinity";
  if (/freeze|frost|ice|blizzard|glacier|whiteout|zero|winter/.test(text)) return "icecraft";
  if (/shadow|dark|exposed|assassinate/.test(text)) return "darkness";
  if (/demon|plague|infect/.test(text)) return "demon";
  if (/protect|guard|ward|wall|slash|strike|thrust|bash/.test(text)) return caster?.class || "warrior";

  return caster?.class || "warrior";
}

function abilityIconUrl(caster, ability) {
  const key = abilityIconKey(caster, ability);
  return PROF_ICONS[key] || PROF_ICONS[caster?.class] || "";
}

function A(id,name,cost,spd,desc,effect,extra={}){return {id,name,cost,spd,desc,effect,...extra};}

const RULES_TEXT = {
  shield: "Shield prevents that much incoming damage before life is lost. Shield is removed at the end of the round.",
  poison: "Poison is a stackable status. At the end of each round, the unit takes ceil(Poison/2) life loss, then removes that many Poison stacks.",
  bleed: "Bleed is a stackable status. Some abilities consume Bleed for bonus damage. Bleed does not naturally decay.",
  freeze: "Freeze is a stackable status. At 5 Freeze, the unit becomes Frozen: its next non-Guard action is canceled, then Freeze resets to 0.",
  hypnosis: "Hypnosis is a non-stackable status. Some abilities consume or check Hypnosis. It stays until consumed or overwritten.",
  exposed: "Exposed is a non-stackable status. The next damage hit against this unit deals +2 damage, then Exposed is removed.",
  exhausted: "Exhausted is a non-stackable status. Non-Guard actions by this unit have -3 Speed while Exhausted is present."
};

const ROSTER=[
{id:"smithen",name:"Smithen",class:"assassin",prof:"icecraft",hp:16,armor:2,speed:8,art:ART.smithen,passive:"Passive — Frost Edge: Smithen's damage abilities deal +2 damage to targets with any Freeze stacks.",abilities:[
A("iceNeedle","Ice Needle",1,1,"Ranged attack. Deal 2 damage to one enemy, then apply 2 Freeze stacks.","damageStatus",{dmg:2,status:"freeze",stacks:2,range:"ranged"}),
A("shatter","Shatter",2,0,"Ranged attack. Deal 4 damage to one enemy. If that enemy has any Freeze stacks, remove all Freeze from it and deal +5 damage.","shatter",{range:"ranged"}),
A("whiteout","Whiteout",1,2,"Ranged control. If the target has any Freeze stacks, apply Exposed. Otherwise, apply 1 Freeze stack.","whiteout",{range:"ranged"}),
A("vanish","Vanish",1,99,"Guard. Until this action resolves or the round ends, the first attack targeting Smithen is canceled.","dodge",{guard:true})]},
{id:"dravain",name:"Dravain",class:"warrior",prof:"vampire",hp:23,armor:4,speed:5,art:ART.dravain,passive:"Passive — Blood Guard: when Dravain uses an ability that consumes Bleed, Dravain gains 3 Shield. Shield prevents damage and is removed at end of round.",abilities:[
A("protect","Protect Ally",1,99,"Guard. Choose an ally. Until the round ends, the first attack targeting that ally targets Dravain instead.","protect",{guard:true,range:"ally"}),
A("slash","Blood Slash",1,0,"Melee attack. Deal 4 damage to one enemy in the front row, then apply 1 Bleed stack.","damageStatus",{dmg:4,status:"bleed",stacks:1,range:"melee"}),
A("drain","Vampiric Thrust",2,-1,"Melee attack. Deal 5 damage to one enemy in the front row, then Dravain restores 3 life.","drain",{dmg:5,heal:3,range:"melee"}),
A("claim","Blood Claim",2,-2,"Ranged payoff. Remove all Bleed stacks from one enemy. Deal damage equal to the removed Bleed + 4, then Dravain restores 2 life.","consumeBleed",{bonus:4,heal:2,range:"ranged"})]},
{id:"yaura",name:"Yaura",class:"warrior",prof:"bloodcraft",hp:24,armor:3,speed:5,art:ART.yaura,passive:"Passive — Blood Echo: the first time each round an ally loses life, apply 1 Bleed to each enemy in the front row.",abilities:[
A("ward","Blood Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt, and the attacker gains 1 Bleed.","ward",{guard:true,range:"ally"}),
A("bolt","Blood Bolt",1,0,"Ranged attack. Deal 2 damage to one enemy, then apply 2 Bleed stacks.","damageStatus",{dmg:2,status:"bleed",stacks:2,range:"ranged"}),
A("price","Blood Price",1,-1,"Bloodcraft attack. Choose an ally. That ally loses 2 life. Then each enemy in the front row takes 4 damage.","allyPain",{range:"ally",dmg:4,self:2}),
A("rain","Red Rain",2,-2,"Area status. Apply 1 Bleed stack to every enemy.","allStatus",{status:"bleed",stacks:1})]},
{id:"kku",name:"K'ku",class:"brute",prof:"icecraft",hp:31,armor:1,speed:2,art:ART.kku,passive:"Passive — Cold Hide: after an enemy hits K'ku with a melee attack, that enemy gains 1 Freeze stack.",abilities:[
A("guard","Ice Guard",1,99,"Guard. If K'ku is attacked this round, K'ku gains 6 Shield before damage is dealt, and the attacker gains 2 Freeze.","selfCounter",{guard:true,status:"freeze",stacks:2,shield:6}),
A("slam","Frost Slam",1,-1,"Melee attack. Deal 4 damage to one enemy in the front row, then apply 1 Freeze stack.","damageStatus",{dmg:4,status:"freeze",stacks:1,range:"melee"}),
A("break","Glacier Break",2,-2,"Melee attack. Deal 5 damage to one enemy in the front row. If that enemy has any Freeze stacks, deal +5 damage.","glacier",{range:"melee"}),
A("roar","Blizzard Roar",2,-3,"Area status. Apply 2 Freeze stacks to each enemy in the front row.","rowStatus",{status:"freeze",stacks:2,row:"front"})]},
{id:"kahro",name:"Kahro",class:"assassin",prof:"darkness",hp:17,armor:2,speed:8,art:ART.kahro,passive:"Passive — Opportunist: Kahro's damage abilities deal +1 damage to enemies with Poison, Bleed, Freeze, Hypnosis, Exposed, or Exhausted.",abilities:[
A("quick","Quick Slash",1,2,"Melee attack. Hit one enemy in the front row twice. Each hit deals 1 damage and triggers on-hit effects separately.","multi",{dmg:1,hits:2,range:"melee"}),
A("assassinate","Assassinate",2,1,"Ranged attack. Deal 5 damage to one enemy. If the target is in the back row and is not protected by a Guard effect, deal +4 damage.","assassinate",{range:"ranged"}),
A("mark","Shadow Mark",1,0,"Ranged status. Apply Exposed to one enemy. The next damage hit against that enemy deals +2 damage, then Exposed is removed.","status",{status:"exposed",stacks:1,range:"ranged"}),
A("punish","Punish Guard",1,1,"Ranged prediction attack. If the target used a Guard ability this round, deal 8 damage. Otherwise, deal 2 damage.","punishGuard",{range:"ranged"})]},
{id:"maoja",name:"Maoja",class:"brute",prof:"witchcraft",hp:28,armor:1,speed:3,art:ART.maoja,passive:"Passive — Toxic Momentum: Maoja's damage abilities deal +1 damage to targets with any Poison stacks.",abilities:[
A("hands","Poison Hands",1,0,"Ally buff. Choose an ally. Until the end of the next round, each of that ally's damaging hits applies 2 Poison to the target.","poisonHands",{range:"ally"}),
A("grip","Toxic Grip",1,-1,"Melee attack. Deal 3 damage to one enemy in the front row, then apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted.","toxicGrip",{range:"melee"}),
A("breath","Caustic Breath",2,-2,"Row attack. Choose an enemy row. Deal 1 damage to each enemy in that row, then apply 3 Poison to each of them.","rowDamageStatus",{dmg:1,status:"poison",stacks:3,range:"ranged"}),
A("burst","Rot Burst",2,-3,"Ranged payoff. Remove all Poison from one enemy. Deal damage equal to 2 times the removed Poison stacks.","poisonBurst",{range:"ranged"})]},
{id:"paleya",name:"Paleya",class:"sorcerer",prof:"hypnotic",hp:18,armor:0,speed:3,art:ART.paleya,passive:"Passive — Mind Weaver: the first time each round Paleya uses an ability that consumes Hypnosis, gain +1 Action next round.",abilities:[
A("stare","Hypnosis Stare",1,0,"Ranged status. Apply Hypnosis to one enemy. Hypnosis does nothing by itself, but some abilities consume or check it.","status",{status:"hypnosis",stacks:1,range:"ranged"}),
A("break","Mind Break",1,-1,"Ranged payoff. If the target has Hypnosis, remove Hypnosis and deal 7 damage. Otherwise, deal 2 damage.","mindBreak",{range:"ranged"}),
A("fog","Dream Fog",2,-2,"Row status. Choose an enemy row. Apply Hypnosis to each enemy in that row.","rowStatus",{status:"hypnosis",stacks:1,range:"ranged"}),
A("predict","Predict",1,99,"Guard prediction. Choose an enemy. If that enemy uses a damage attack this round, cancel that action and apply Hypnosis to that enemy.","predict",{guard:true,range:"ranged"})]},
{id:"poom",name:"Poom",class:"brute",prof:"hypnotic",hp:30,armor:1,speed:3,art:ART.poom,passive:"Passive — Mirror Mind: after an enemy hits Poom with a melee attack, that enemy gains Hypnosis.",abilities:[
A("guard","Guard Mind",1,99,"Guard. Choose an ally. Until the round ends, the first attack targeting that ally targets Poom instead. If redirected this way, the attacker gains Hypnosis.","protect",{guard:true,range:"ally",hypno:true}),
A("bash","Bash",1,-1,"Melee 4 damage and 2 Freeze.","damageStatus",{dmg:4,status:"freeze",stacks:2,range:"melee"}),
A("roar","Mesmer Roar",2,-2,"Area status. Apply Hypnosis and Exposed to each enemy in the front row.","frontHypno",{}),
A("revenge","Revenge Body",2,-1,"Melee attack. Poom loses 3 life, then deals 7 damage to one front-row enemy. If Poom was attacked earlier this round, deal +3 damage.","revenge",{dmg:7,self:3,range:"melee"})]},
{id:"shaman",name:"Shaman",class:"sorcerer",prof:"bloodcraft demon",hp:21,armor:1,speed:3,art:ART.shaman,passive:"Passive — Demon Infection: when Shaman applies Poison or Bleed with an ability, also apply 1 stack of the other status to each enemy in the front row.",abilities:[
A("mark","Infect Mark",1,0,"Ranged status. Apply 1 Poison and 1 Bleed to one enemy.","multiStatus",{statuses:[["poison",1],["bleed",1]],range:"ranged"}),
A("pact","Blood Pact",1,-1,"Bloodcraft status. Choose an ally. That ally loses 2 life. Then each enemy in the front row gains 2 Bleed.","allyBleed",{range:"ally",self:2,stacks:2}),
A("plague","Plague Wave",2,-2,"Row: 1 damage and 2 Poison.","rowDamageStatus",{dmg:1,status:"poison",stacks:2,range:"ranged"}),
A("ward","Demon Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt, and the attacker gains 1 Bleed.","ward",{guard:true,range:"ally"})]},
{id:"eva",name:"Lady Eva",class:"assassin",prof:"vampire",hp:16,armor:2,speed:8,art:ART.eva,passive:"Passive — Crimson Hunger: when Lady Eva deals damage to an enemy with any Bleed stacks, Lady Eva restores 1 life.",abilities:[
A("fangs","Crimson Fangs",1,1,"Melee attack. Deal 3 damage to one enemy in the front row, then apply 1 Bleed.","damageStatus",{dmg:3,status:"bleed",stacks:1,range:"melee"}),
A("dash","Blood Dash",1,2,"Ranged attack. Deal 2 damage to one enemy. If that enemy has any Bleed stacks, apply Exposed.","bloodDash",{range:"ranged"}),
A("bite","Final Bite",2,0,"Ranged payoff. Remove all Bleed stacks from one enemy. Deal damage equal to the removed Bleed + 6, then Lady Eva restores 2 life.","consumeBleed",{bonus:6,heal:2,range:"ranged"}),
A("bat","Bat Form",1,99,"Guard. Until this action resolves or the round ends, the first attack targeting Lady Eva is canceled.","dodge",{guard:true})]},
{id:"hyafrost",name:"Hyafrost",class:"sorcerer",prof:"icecraft spirit",hp:20,armor:1,speed:3,art:ART.hyafrost,passive:"Passive — Deep Winter: when Hyafrost applies Freeze to an enemy, Hyafrost gains 1 Shield. Shield prevents damage and is removed at end of round.",abilities:[
A("blast","Ice Blast",1,0,"Ranged attack. Deal 2 damage to one enemy, then apply 2 Freeze.","damageStatus",{dmg:2,status:"freeze",stacks:2,range:"ranged"}),
A("field","Frozen Field",2,-2,"Row status. Choose an enemy row. Apply 2 Freeze to each enemy in that row.","rowStatus",{status:"freeze",stacks:2,range:"ranged"}),
A("spirit","Spirit Form",1,99,"Guard. Hyafrost gains 5 Shield and cancels the first attack targeting Hyafrost this round.","spirit",{guard:true}),
A("zero","Absolute Zero",2,-3,"Area payoff. Deal 3 damage to each enemy with any Freeze stacks, then apply Exhausted to each damaged enemy.","absoluteZero",{dmg:3})]},
{id:"bakub",name:"Bakub",class:"sorcerer",prof:"witchcraft hypnotic demon",hp:22,armor:1,speed:3,art:ART.bakub,passive:"Passive — Nightmare Brew: Bakub's damage abilities deal +2 damage to enemies that have both Poison and Hypnosis.",abilities:[
A("vial","Nightmare Vial",1,0,"Ranged status. Apply 2 Poison and Hypnosis to one enemy.","multiStatus",{statuses:[["poison",2],["hypnosis",1]],range:"ranged"}),
A("toxin","Mind Toxin",1,-1,"Ranged attack. Deal 3 damage to one enemy. If that enemy has Hypnosis, also apply 3 Poison.","mindToxin",{range:"ranged"}),
A("fog","Demon Fog",2,-2,"Row status. Choose an enemy row. Apply 1 Poison and Hypnosis to each enemy in that row.","rowMultiStatus",{statuses:[["poison",1],["hypnosis",1]],range:"ranged"}),
A("future","False Future",1,99,"Guard prediction. Choose an enemy. If that enemy uses a damage attack this round, cancel that action and apply 2 Poison to that enemy.","predictPoison",{guard:true,range:"ranged"})]}
];
const ENEMY_PRESETS=[["poom","bakub","eva"],["kku","hyafrost","smithen"],["dravain","yaura","shaman"],["maoja","paleya","kahro"]];
const BOSS={id:"boss",name:"World Toad",class:"brute",prof:"boss",hp:84,armor:1,speed:2,art:ART.boss,abilities:[
A("lash","Tongue Lash",1,0,"Deal 5.","damage",{dmg:5,range:"ranged"}),
A("guard","Bog Guard",1,99,"Guard: Shield and poison attacker.","selfCounter",{guard:true,status:"poison",stacks:2,shield:8}),
A("eruption","Bog Eruption",2,-2,"All enemies take 2 and 2 Poison.","allDamageStatus",{dmg:2,status:"poison",stacks:2}),
A("devour","Devour",2,-1,"Melee 8, heal 4.","drain",{dmg:8,heal:4,range:"melee"})]};

let builderStep="choose", chosenIds=[], selectedTeam=[], arrangeSelectedId=null, mode="squad";
let state=null, selectedId=null, selectedSide=null, pendingAbility=null, logLines=[];

function $(id){return document.getElementById(id)}
function cdef(id){return ROSTER.find(c=>c.id===id)}
function cloneChar(id,side,row,col){let c=cdef(id);return structuredClone({...c,side,row,col,maxHp:c.hp,shield:0,status:{},buff:{},planned:null,dead:false})}
function alive(side){return state.units.filter(u=>u.side===side&&!u.dead)}
function unit(id){return state.units.find(u=>u.id===id)}
function unitBySide(id,side){return state?.units?.find(u=>u.id===id && (!side || u.side===side))}
function selectedUnit(){return selectedId ? (unitBySide(selectedId, selectedSide) || unit(selectedId)) : null}
function other(side){return side==="player"?"enemy":"player"}
function rowUnits(side,row){return alive(side).filter(u=>u.row===row||u.size==="boss")}
function log(t){logLines.unshift(t);logLines=logLines.slice(0,14)}
function show(t){$("banner").textContent=t;$("banner").classList.remove("hidden");setTimeout(()=>$("banner").classList.add("hidden"),750)}
function hasDebuff(u){return ["poison","bleed","freeze","hypnosis","exposed","exhausted"].some(s=>(u.status[s]||0)>0)}
function frontBlocked(side){return alive(side).some(u=>u.row==="front"||u.size==="boss")}
function targets(c,a){let allies=alive(c.side), enemies=alive(other(c.side));switch(a.effect){case"protect":case"ward":case"poisonHands":case"allyPain":case"allyBleed":return allies;case"dodge":case"selfCounter":case"spirit":case"absoluteZero":case"allStatus":case"allDamageStatus":case"frontHypno":return [];case"rowStatus":case"rowDamageStatus":case"rowMultiStatus":return enemies;default:return enemies.filter(t=>a.range==="melee"?(t.row==="front"||t.size==="boss"||!frontBlocked(t.side)):true)}}
function cost(c,a){return a.cost}
function totalSpeed(c,a){return a.guard?999:(c.speed+a.spd-(c.status.exhausted?3:0))}
function statusText(u){let out=[`⚡${u.speed}`];if(u.shield)out.push(`🛡️${u.shield}`);for(const [k,v] of Object.entries(u.status))if(v)out.push(`${icon(k)}${v===1&&["hypnosis","exposed","exhausted"].includes(k)?"":v}`);if(u.planned&&u.side==="player")out.push("✅");return out.map(x=>`<span class="chip">${x}</span>`).join("")}
function icon(s){return {poison:"☠️",bleed:"🩸",freeze:"❄️",hypnosis:"🌀",exposed:"🎯",exhausted:"💤"}[s]||""}
function renderBuilder(){ $("chooseStep").classList.toggle("hidden",builderStep!=="choose");$("arrangeStep").classList.toggle("hidden",builderStep!=="arrange");$("backBtn").classList.toggle("hidden",builderStep!=="arrange");$("builderTitle").textContent=builderStep==="choose"?"Choose 3 characters":"Arrange your formation";$("nextBtn").textContent=builderStep==="choose"?"Arrange Team":"Start Battle";$("nextBtn").disabled=chosenIds.length!==3||(builderStep==="arrange"&&selectedTeam.length!==3); builderStep==="choose"?renderChoose():renderArrange();}
function renderChoose(){let f=$("classFilter").value;$("countText").textContent=`Selected ${chosenIds.length}/3`; $("chosenStrip").innerHTML=chosenIds.map(id=>{let c=cdef(id);return `<button class="chosenToken" data-id="${id}"><span class="chosenThumb" style="background:${c.art}"></span>${c.name}</button>`}).join("");document.querySelectorAll(".chosenToken").forEach(b=>b.onclick=()=>toggleChoose(b.dataset.id));$("fighterGrid").innerHTML=ROSTER.filter(c=>f==="all"||c.class===f).map(c=>{let picked=chosenIds.includes(c.id);return `<button class="fighterCard ${picked?"picked":""}" data-id="${c.id}"><div class="portrait" style="background:${c.art}"><div class="classIcon">${CLASS[c.class].icon}</div><div class="check">${picked?"✓":""}</div></div><div class="fighterName">${c.name}</div><div class="fighterMeta">${c.class} / ${c.prof}</div><div class="fighterStats">❤️${c.hp} · 🛡️${c.armor} · ⚡${c.speed}</div></button>`}).join("");document.querySelectorAll(".fighterCard").forEach(b=>b.onclick=()=>toggleChoose(b.dataset.id))}
function toggleChoose(id){let i=chosenIds.indexOf(id);if(i>=0){chosenIds.splice(i,1);selectedTeam=selectedTeam.filter(s=>s.id!==id)}else{if(chosenIds.length>=3)return;chosenIds.push(id)}if(chosenIds.length===3){let d=[["front",0],["front",1],["back",1]];selectedTeam=chosenIds.map((id,i)=>selectedTeam.find(s=>s.id===id)||{id,row:d[i][0],col:d[i][1]})}renderBuilder()}
function renderArrange(){let bench=$("benchList");bench.innerHTML=chosenIds.map(id=>{let c=cdef(id);return `<button class="benchFighter ${arrangeSelectedId===id?"selected":""}" data-id="${id}" draggable="true"><span class="benchThumb" style="background:${c.art}"></span><span><b>${c.name}</b><small>${c.class} / ${c.prof}</small></span></button>`}).join("");document.querySelectorAll(".benchFighter").forEach(b=>{b.onclick=()=>{arrangeSelectedId=b.dataset.id;renderArrange()};b.ondragstart=e=>{arrangeSelectedId=b.dataset.id;e.dataTransfer.setData("text/plain",b.dataset.id)}});document.querySelectorAll(".slot").forEach(s=>{let row=s.dataset.row,col=+s.dataset.col,occ=selectedTeam.find(x=>x.row===row&&x.col===col),c=occ&&cdef(occ.id);s.innerHTML=c?`<div class="slotArt" style="background:${c.art}"></div><div class="slotName">${c.name}</div>`:`<div class="emptySlot">Drop here</div>`;s.classList.toggle("filled",!!c);s.classList.toggle("selected",!!c&&c.id===arrangeSelectedId);s.onclick=()=>{if(arrangeSelectedId)place(arrangeSelectedId,row,col);else if(occ){arrangeSelectedId=occ.id;renderArrange()}};s.ondragover=e=>e.preventDefault();s.ondrop=e=>{e.preventDefault();place(e.dataTransfer.getData("text/plain")||arrangeSelectedId,row,col)}})}
function place(id,row,col){selectedTeam=selectedTeam.filter(s=>s.id!==id&&!(s.row===row&&s.col===+col));selectedTeam.push({id,row,col:+col});arrangeSelectedId=id;renderBuilder()}
function randomTeam(){chosenIds=[...ROSTER].sort(()=>Math.random()-.5).slice(0,3).map(c=>c.id);selectedTeam=[{id:chosenIds[0],row:"front",col:0},{id:chosenIds[1],row:"front",col:1},{id:chosenIds[2],row:"back",col:1}];builderStep="choose";renderBuilder()}
function startBattle(){let player=selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));let enemies;if(mode==="boss"){enemies=[structuredClone({...BOSS,side:"enemy",row:"boss",col:0,size:"boss",maxHp:BOSS.hp,shield:0,status:{},buff:{},planned:null,dead:false})]}else{let ids=ENEMY_PRESETS.find(p=>!p.some(id=>chosenIds.includes(id)))||ENEMY_PRESETS[0],pos=[["front",0],["front",2],["back",1]];enemies=ids.map((id,i)=>cloneChar(id,"enemy",pos[i][0],pos[i][1]))}state={round:1,phase:"planning",actions:3,actionsLeft:3,units:[...player,...enemies],protects:[],dodges:[],predicts:[],counters:[],guarded:{},attacked:{},currentActionKey:null};logLines=["Battle started. Plan hidden actions, then resolve."];$("builder").classList.add("hidden");$("battle").classList.remove("hidden");renderBattle()}

function plannedActionsForStrip(includeEnemy=false){
  if(!state) return [];
  const acts = state.units
    .filter(u=>!u.dead && u.planned && (includeEnemy || u.side==="player"))
    .map(u=>{
      const a = u.abilities.find(x=>x.id===u.planned.ability);
      return {
        key: `${u.id}:${a.id}`,
        unit:u,
        ability:a,
        side:u.side,
        speed: totalSpeed(u,a),
        guard: a.guard ? 1 : 0
      };
    })
    .sort((x,y)=>(y.guard-x.guard)||(y.speed-x.speed));
  return acts;
}

function renderQueueStrip(){
  const strip = $("queueStrip");
  if(!strip || !state) return;
  const includeEnemy = state.phase === "resolving";
  const acts = plannedActionsForStrip(includeEnemy);
  if(!acts.length){
    strip.innerHTML = `<div class="queueEmpty">Queue actions to preview resolve order</div>`;
    return;
  }
  strip.innerHTML = `
    <div class="queueLabel">${includeEnemy ? "Resolve order" : "Your queued moves"}</div>
    <div class="queueItems">
      ${acts.map(act=>{
        const iconUrl = abilityIconUrl(act.unit, act.ability);
        const active = state.currentActionKey === act.key;
        return `<div class="queueCard ${act.side} ${active ? "active" : ""}">
          <span class="queueIcon" style="background-image:url('${iconUrl}')"></span>
          <span class="queueText">
            <b>${act.unit.name}</b>
            <small>${act.ability.name}</small>
          </span>
          <span class="queueSpeed">${act.ability.guard ? "G" : "⚡"+act.speed}</span>
        </div>`;
      }).join("")}
    </div>`;
}

function renderBattle(){if(!state)return;$("enemyName").textContent=mode==="boss"?"World Toad":"Enemy Squad";$("phaseText").textContent=state.phase==="planning"?"Plan":"Resolve";$("roundText").textContent=state.round;$("actionsText").textContent=`${state.actionsLeft}/3`;$("resolveBtn").disabled=state.phase!=="planning"||!alive("player").some(u=>u.planned);renderBoard("enemyBoard","enemy");renderBoard("playerBoard","player");renderInfo();$("log").innerHTML=logLines.map(x=>`<div class="logItem">${x}</div>`).join("");renderQueueStrip()}
function renderBoard(id,side){let b=$(id),boss=state.units.find(u=>u.side===side&&u.size==="boss");b.innerHTML="";if(boss){let r=document.createElement("div");r.className="row";r.appendChild(tile(boss,side));b.appendChild(r);return}let order=side==="enemy"?["back","front"]:["front","back"];for(let row of order){let div=document.createElement("div");div.className="row";for(let col=0;col<3;col++)div.appendChild(tile(state.units.find(u=>u.side===side&&u.row===row&&u.col===col),side));b.appendChild(div)}}
function tile(u,side){let t=document.createElement("button");t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;if(!u){t.classList.add("empty");return t}t.dataset.unitId=u.id;if(u.dead)t.classList.add("dead");if(u.id===selectedId)t.classList.add("selected");if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))t.classList.add("targetable");t.innerHTML=`<div class="art" style="background:${u.art}"></div><div class="badge">${CLASS[u.class]?.icon||"🐸"}</div><div class="chips">${statusText(u)}</div><div class="armor">🛡️ ${u.armor}</div><div class="hp">❤️ ${u.hp}</div><div class="name">${u.name}</div>`;t.onclick=()=>{if(state.phase!=="planning"||u.dead)return;if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))return plan(u);if(u.side==="player"){if(u.planned)return unplan(u);selectedId=u.id;pendingAbility=null;renderBattle();openWheel(u)}};return t}
function renderInfo(){let u=selectedId&&unit(selectedId);$("infoTitle").textContent=u?`${u.name} — ${u.class} / ${u.prof}`:"Plan hidden actions";$("infoBody").innerHTML=u?`<b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${u.armor} · ⚡${u.speed}<br><b>Passive:</b> ${u.passive}<br>${u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}</div>`).join("")}`:`Queued: ${alive("player").filter(u=>u.planned).length}/3. Click a fighter to choose an action.`}
function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");

  radial.classList.remove("hidden");
  if (tooltip) tooltip.classList.add("hidden");

  const size = Math.min(360, Math.max(300, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  if (tile) {
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  const margin = size / 2 + 10;
  cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
  cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));

  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `<div class="miniCenterName">${u.name}</div>`;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    return `<button class="wheelBtn w${i}" ${state.actionsLeft<a.cost?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')">
      <span class="wheelBtnTitle">${a.name}</span>
      <span class="wheelBtnMeta">${a.cost} AP · ${speedLabel}</span>
    </button>`;
  }).join("");

  document.querySelectorAll(".wheelBtn").forEach(b=>{
    const a = u.abilities.find(x=>x.id===b.dataset.id);

    const showTip = () => {
      if (!tooltip) return;
      const wr = wheel.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const tw = 292;
      const th = 156;
      const idx = Number(b.dataset.index);

      tooltip.innerHTML = `
        <div class="tipTop">
          <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
          <div>
            <b>${a.name}</b>
            <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
          </div>
        </div>
        <p>${a.desc}</p>
        <div class="tipTags">
          <span>${abilityIconKey(u,a)}</span>
          <span>${a.range || (a.guard ? "guard" : "self")}</span>
        </div>
      `;
      tooltip.classList.remove("hidden");

      let x, y;
      // Top ability: tooltip above the whole wheel. Bottom: below the whole wheel.
      // Left/right keep side placement because that worked well.
      if (idx === 0) {
        x = wr.left + wr.width / 2 - tw / 2;
        y = wr.top - th - 14;
      } else if (idx === 2) {
        x = wr.left + wr.width / 2 - tw / 2;
        y = wr.bottom + 14;
      } else if (idx === 1) {
        x = wr.right + 14;
        y = br.top + br.height / 2 - th / 2;
      } else {
        x = wr.left - tw - 14;
        y = br.top + br.height / 2 - th / 2;
      }

      x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
      y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
      tooltip.style.left = x + "px";
      tooltip.style.top = y + "px";
    };

    b.onmouseenter = showTip;
    b.onfocus = showTip;
    b.onmouseleave = () => tooltip && tooltip.classList.add("hidden");
    b.ontouchstart = showTip;

    b.onclick = () => {
      pendingAbility = a;
      radial.classList.add("hidden");
      if (tooltip) tooltip.classList.add("hidden");
      renderBattle();
      if(!targets(u,pendingAbility).length) plan(null);
    };
  });
}

function isTarget(c,a,t){return c&&a&&t&&!t.dead&&targets(c,a).includes(t)}
function plan(target){let c=unit(selectedId),a=pendingAbility;if(!c||!a||c.planned||state.actionsLeft<a.cost)return;state.actionsLeft-=a.cost;c.planned={ability:a.id,target:target?.id||null};log(`${c.name} queued ${a.name}.`);selectedId=null;pendingAbility=null;renderBattle()}
function unplan(u){let a=u.abilities.find(x=>x.id===u.planned.ability);state.actionsLeft+=a.cost;u.planned=null;renderBattle()}
function chooseEnemy(){let ap=3;for(let e of alive("enemy"))e.planned=null;for(let e of alive("enemy")){let opts=e.abilities.filter(a=>a.cost<=ap);if(!opts.length)continue;let a=opts[Math.floor(Math.random()*opts.length)],ts=targets(e,a);e.planned={ability:a.id,target:ts.length?ts[Math.floor(Math.random()*ts.length)].id:null};ap-=a.cost}}
function resolveRound(){if(state.phase!=="planning")return;chooseEnemy();state.phase="resolving";let acts=state.units.filter(u=>!u.dead&&u.planned).map(u=>{let a=u.abilities.find(x=>x.id===u.planned.ability);return{u,a,target:u.planned.target&&unit(u.planned.target),guard:a.guard?1:0,speed:totalSpeed(u,a)}}).sort((x,y)=>(y.guard-x.guard)||(y.speed-x.speed)||(Math.random()-.5));renderBattle();let i=0;function step(){if(i>=acts.length)return endRound();let act=acts[i++];if(act.u.dead)return step();state.currentActionKey=`${act.u.id}:${act.a.id}`;log(`${act.u.name} resolves ${act.a.name}.`);show(`${act.u.name}: ${act.a.name}`);renderBattle();apply(act.u,act.a,act.target);renderBattle();if(checkWin())return;setTimeout(step,1050)}step()}
function totalSpeed(u,a){return a.guard?999:u.speed+a.spd-(u.status.exhausted?3:0)}
function apply(c,a,t){if(c.status.freeze>=5&&!a.guard){c.status.freeze=0;log(`${c.name} is Frozen and loses action.`);return}switch(a.effect){case"protect":state.protects.push({guard:c,target:t,hypno:a.hypno});state.guarded[c.id]=true;break;case"ward":state.protects.push({guard:t,target:t,ward:true});state.guarded[c.id]=true;break;case"dodge":state.dodges.push(c.id);state.guarded[c.id]=true;break;case"predict":state.predicts.push({caster:c,target:t,status:"hypnosis"});state.guarded[c.id]=true;break;case"predictPoison":state.predicts.push({caster:c,target:t,status:"poison",stacks:2});state.guarded[c.id]=true;break;case"selfCounter":state.counters.push({caster:c,status:a.status,stacks:a.stacks,shield:a.shield});state.guarded[c.id]=true;break;case"damage":damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});break;case"damageStatus":damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});addStatus(t,a.status,a.stacks);break;case"multi":for(let i=0;i<a.hits;i++)if(!t.dead)damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});break;case"drain":damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});heal(c,a.heal);break;case"consumeBleed":{let b=t.status.bleed||0;t.status.bleed=0;damage(c,t,b+a.bonus,{attack:true});heal(c,a.heal||0);break}case"status":addStatus(t,a.status,a.stacks);break;case"multiStatus":a.statuses.forEach(([s,n])=>addStatus(t,s,n));break;case"rowStatus":rowUnits(other(c.side),a.row||t?.row||"front").forEach(x=>addStatus(x,a.status,a.stacks));break;case"rowDamageStatus":rowUnits(other(c.side),t?.row||"front").forEach(x=>{damage(c,x,a.dmg,{attack:true,aoe:true});addStatus(x,a.status,a.stacks)});break;case"allStatus":alive(other(c.side)).forEach(x=>addStatus(x,a.status,a.stacks));break;case"allDamageStatus":alive(other(c.side)).forEach(x=>{damage(c,x,a.dmg,{attack:true,aoe:true});addStatus(x,a.status,a.stacks)});break;case"frontHypno":rowUnits(other(c.side),"front").forEach(x=>{addStatus(x,"hypnosis",1);addStatus(x,"exposed",1)});break;case"poisonHands":t.buff.poisonHands=2;break;case"toxicGrip":damage(c,t,3,{attack:true,melee:true});if(t.status.poison)addStatus(t,"exhausted",1);addStatus(t,"poison",2);break;case"poisonBurst":{let p=t.status.poison||0;t.status.poison=0;damage(c,t,p*2,{attack:true});break}case"shatter":{let bonus=t.status.freeze?5:0;t.status.freeze=0;damage(c,t,4+bonus,{attack:true});break}case"whiteout":t.status.freeze?addStatus(t,"exposed",1):addStatus(t,"freeze",1);break;case"glacier":damage(c,t,(t.status.freeze?10:5),{attack:true,melee:true});break;case"assassinate":damage(c,t,5+(t.row==="back"&&!state.protects.some(p=>p.target===t)?4:0),{attack:true});break;case"punishGuard":damage(c,t,state.guarded[t.id]?8:2,{attack:true});break;case"mindBreak":if(t.status.hypnosis){t.status.hypnosis=0;damage(c,t,7,{attack:true})}else damage(c,t,2,{attack:true});break;case"bloodDash":damage(c,t,2,{attack:true});if(t.status.bleed)addStatus(t,"exposed",1);break;case"allyPain":life(t,a.self);rowUnits(other(c.side),"front").forEach(x=>damage(c,x,a.dmg,{attack:true,aoe:true}));break;case"allyBleed":life(t,a.self);rowUnits(other(c.side),"front").forEach(x=>addStatus(x,"bleed",a.stacks));break;case"revenge":life(c,a.self);damage(c,t,a.dmg+(state.attacked[c.id]?3:0),{attack:true,melee:true});break;case"absoluteZero":alive(other(c.side)).filter(x=>x.status.freeze).forEach(x=>{damage(c,x,a.dmg,{attack:true,aoe:true});addStatus(x,"exhausted",1)});break;case"spirit":c.shield+=5;state.dodges.push(c.id);break;case"mindToxin":damage(c,t,(t.status.poison&&t.status.hypnosis)?5:3,{attack:true});if(t.status.hypnosis)addStatus(t,"poison",3);break;case"rowMultiStatus":rowUnits(other(c.side),t?.row||"front").forEach(x=>a.statuses.forEach(([s,n])=>addStatus(x,s,n)));break}}
function redirect(target,source){let p=state.protects.find(p=>p.target===target&&!p.guard.dead);if(p){log(`${p.guard.name} protects ${target.name}.`);if(p.ward)addStatus(source,"bleed",1);if(p.hypno)addStatus(source,"hypnosis",1);return p.guard}return target}
function damage(src,t,amt,opt={}){if(!src||!t||src.dead||t.dead)return;if(opt.attack){let pr=state.predicts.find(p=>p.target===src);if(pr){addStatus(src,pr.status,pr.stacks||1);log(`${pr.caster.name} predicted and canceled ${src.name}.`);return}}t=redirect(t,src);if(state.dodges.includes(t.id)){state.dodges=state.dodges.filter(x=>x!==t.id);log(`${t.name} dodges.`);return}let ctr=state.counters.find(x=>x.caster===t);if(ctr){t.shield+=ctr.shield||0;addStatus(src,ctr.status,ctr.stacks||1)}let d=amt;if(src.id==="kahro"&&hasDebuff(t))d++;if(src.id==="maoja"&&t.status.poison)d++;if(src.id==="smithen"&&t.status.freeze)d+=2;if(t.status.exposed){d+=2;t.status.exposed=0}d=Math.max(0,d-t.armor);let block=Math.min(t.shield||0,d);t.shield-=block;d-=block;if(d>0){t.hp-=d;state.attacked[t.id]=true;log(`${src.name} deals ${d} to ${t.name}.`);if(src.buff.poisonHands)addStatus(t,"poison",2);if(t.id==="poom"&&opt.melee)addStatus(src,"hypnosis",1);if(t.id==="kku"&&opt.melee)addStatus(src,"freeze",1);if(src.id==="eva"&&t.status.bleed)heal(src,1)}else log(`${t.name} absorbs the hit.`);if(t.hp<=0){t.hp=0;t.dead=true;log(`${t.name} is defeated.`)}}
function life(t,n){t.hp-=n;state.attacked[t.id]=true;log(`${t.name} loses ${n} life.`);if(t.hp<=0){t.dead=true;t.hp=0}}
function heal(t,n){if(!n||t.dead)return;t.hp=Math.min(t.maxHp,t.hp+n);log(`${t.name} heals ${n}.`)}
function addStatus(t,s,n=1){if(!t||t.dead)return;if(["hypnosis","exposed","exhausted"].includes(s))t.status[s]=1;else t.status[s]=(t.status[s]||0)+n;if(s==="freeze"&&t.status.freeze>=5){t.status.freeze=0;t.status.frozen=1;log(`${t.name} is Frozen.`)}}
function endRound(){state.units.forEach(u=>{u.planned=null;u.shield=0;if(u.buff.poisonHands){u.buff.poisonHands--;if(u.buff.poisonHands<=0)delete u.buff.poisonHands}let p=u.status.poison||0;if(p&&!u.dead){let d=Math.ceil(p/2);u.hp-=d;u.status.poison-=d;log(`${u.name} takes ${d} Poison.`);if(u.hp<=0){u.dead=true;u.hp=0}}});if(checkWin())return;state.currentActionKey=null;state.round++;state.phase="planning";state.actionsLeft=3;state.protects=[];state.dodges=[];state.predicts=[];state.counters=[];state.guarded={};state.attacked={};selectedId=null;pendingAbility=null;renderBattle()}
function checkWin(){let p=alive("player").length,e=alive("enemy").length;if(p&&e)return false;alert(p?"Victory!":"Defeat!");return true}

/* ===== v14 multi-action planning override =====
   Characters can now queue multiple actions in the same round.
   Clear queued actions by clicking them in the bottom queue strip.
*/
function nextPlanId(){
  state.planSeq = (state.planSeq || 0) + 1;
  return "p" + state.planSeq;
}

function makePlan(unitObj, abilityObj, targetObj, side){
  return {
    pid: nextPlanId(),
    unitId: unitObj.id,
    unitSide: unitObj.side || side,
    abilityId: abilityObj.id,
    targetId: targetObj?.id || null,
    targetSide: targetObj?.side || null,
    side
  };
}

function planToAction(p){
  const u = unitBySide(p.unitId, p.unitSide || p.side) || unit(p.unitId);
  if(!u || u.dead) return null;
  const a = u.abilities.find(x=>x.id===p.abilityId);
  if(!a) return null;
  return {
    key: p.pid,
    plan: p,
    unit: u,
    ability: a,
    side: p.side,
    target: p.targetId ? (unitBySide(p.targetId, p.targetSide) || unit(p.targetId)) : null,
    speed: totalSpeed(u,a),
    guard: a.guard ? 1 : 0
  };
}

function startBattle(){
  let player=selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));
  let enemies;
  if(mode==="boss"){
    enemies=[structuredClone({...BOSS,side:"enemy",row:"boss",col:0,size:"boss",maxHp:BOSS.hp,shield:0,status:{},buff:{},planned:null,dead:false})];
  }else{
    let ids=ENEMY_PRESETS.find(p=>!p.some(id=>chosenIds.includes(id)))||ENEMY_PRESETS[0],
      pos=[["front",0],["front",2],["back",1]];
    enemies=ids.map((id,i)=>cloneChar(id,"enemy",pos[i][0],pos[i][1]));
  }
  state={
    round:1,phase:"planning",actions:3,actionsLeft:3,
    units:[...player,...enemies],
    plans:[], planSeq:0,
    protects:[],dodges:[],predicts:[],counters:[],
    guarded:{},attacked:{},currentActionKey:null
  };
  logLines=["Battle started. Plan hidden actions, then resolve."];
  $("builder").classList.add("hidden");
  $("battle").classList.remove("hidden");
  renderBattle();
}

function plannedActionsForStrip(includeEnemy=false){
  if(!state) return [];
  return (state.plans || [])
    .filter(p => includeEnemy || p.side === "player")
    .map(planToAction)
    .filter(Boolean)
    .sort((x,y)=>(y.guard-x.guard)||(y.speed-x.speed)||(x.key.localeCompare(y.key)));
}

function renderQueueStrip(){
  const strip = $("queueStrip");
  if(!strip || !state) return;
  const includeEnemy = state.phase === "resolving";
  const acts = plannedActionsForStrip(includeEnemy);
  if(!acts.length){
    strip.innerHTML = `<div class="queueEmpty">Queue actions to preview resolve order</div>`;
    return;
  }
  strip.innerHTML = `
    <div class="queueLabel">${includeEnemy ? "Resolve order" : "Your queued moves — tap to remove"}</div>
    <div class="queueItems">
      ${acts.map(act=>{
        const iconUrl = abilityIconUrl(act.unit, act.ability);
        const active = state.currentActionKey === act.key;
        return `<button class="queueCard ${act.side} ${active ? "active" : ""}" data-plan-id="${act.key}" ${state.phase !== "planning" || act.side !== "player" ? "disabled" : ""}>
          <span class="queueIcon" style="background-image:url('${iconUrl}')"></span>
          <span class="queueText">
            <b>${act.unit.name}</b>
            <small>${act.ability.name}</small>
          </span>
          <span class="queueSpeed">${act.ability.guard ? "G" : "⚡"+act.speed}</span>
          ${state.phase === "planning" && act.side === "player" ? '<span class="queueRemove">×</span>' : ''}
        </button>`;
      }).join("")}
    </div>`;

  strip.querySelectorAll(".queueCard[data-plan-id]").forEach(btn=>{
    btn.onclick = () => {
      if(state.phase !== "planning" || btn.disabled) return;
      unplan(btn.dataset.planId);
    };
  });
}

function renderBattle(){
  if(!state)return;
  $("enemyName").textContent=mode==="boss"?"World Toad":"Enemy Squad";
  $("phaseText").textContent=state.phase==="planning"?"Plan":"Resolve";
  $("roundText").textContent=state.round;
  $("actionsText").textContent=`${state.actionsLeft}/3`;
  $("resolveBtn").disabled=state.phase!=="planning"||!(state.plans||[]).some(p=>p.side==="player");
  renderBoard("enemyBoard","enemy");
  renderBoard("playerBoard","player");
  renderInfo();
  $("log").innerHTML=logLines.map(x=>`<div class="logItem">${x}</div>`).join("");
  renderQueueStrip();
}

function statusText(u){
  let out=[`⚡${u.speed}`];
  if(u.shield)out.push(`🛡️${u.shield}`);
  for(const [k,v] of Object.entries(u.status)) {
    if(v) out.push(`${icon(k)}${v===1&&["hypnosis","exposed","exhausted"].includes(k)?"":v}`);
  }
  const count = state?.plans?.filter(p=>p.unitId===u.id && p.side===u.side).length || 0;
  if(count && u.side==="player") out.push(`✅${count}`);
  if(count && u.side==="enemy" && state?.phase==="resolving") out.push(`❗${count}`);
  return out.map(x=>`<span class="chip">${x}</span>`).join("");
}

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  t.dataset.side=u.side;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId && (!selectedSide || u.side===selectedSide))t.classList.add("selected");
  if(pendingAbility&&isTarget(selectedUnit(),pendingAbility,u))t.classList.add("targetable");
  t.innerHTML=`<div class="art" style="background:${u.art}"></div><div class="badge">${CLASS[u.class]?.icon||"🐸"}</div><div class="chips">${statusText(u)}</div><div class="armor">🛡️ ${u.armor}</div><div class="hp">❤️ ${u.hp}</div><div class="name">${u.name}</div>`;
  t.onclick=()=>{
    if(state.phase!=="planning"||u.dead)return;
    if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))return plan(u);
    if(u.side==="player"){
      selectedId=u.id;
      pendingAbility=null;
      renderBattle();
      openWheel(u);
    }
  };
  return t;
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").textContent=u?`${u.name} — ${u.class} / ${u.prof}`:"Plan hidden actions";
  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;
  $("infoBody").innerHTML=u
    ? `<b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${u.armor} · ⚡${u.speed}<br><b>Passive:</b> ${u.passive}<br>${u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}</div>`).join("")}`
    : `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
}

function plan(target){
  let c=unit(selectedId),a=pendingAbility;
  if(!c||!a||state.actionsLeft<a.cost)return;
  state.actionsLeft-=a.cost;
  state.plans.push(makePlan(c,a,target,"player"));
  log(`${c.name} queued ${a.name}.`);
  selectedId=null;
  pendingAbility=null;
  renderBattle();
}

function unplan(planId){
  const idx=(state.plans||[]).findIndex(p=>p.pid===planId && p.side==="player");
  if(idx<0) return;
  const p=state.plans[idx];
  const u=unitBySide(p.unitId, p.unitSide || p.side) || unit(p.unitId);
  const a=u?.abilities.find(x=>x.id===p.abilityId);
  if(a) state.actionsLeft+=a.cost;
  state.plans.splice(idx,1);
  log(`${u?.name || "Unit"} removed ${a?.name || "action"} from the queue.`);
  renderBattle();
}

function chooseEnemy(){
  state.plans = (state.plans || []).filter(p=>p.side!=="enemy");
  let ap=3;
  const enemies=alive("enemy");
  let safety=0;
  while(ap>0 && safety++<10){
    const choices=[];
    for(const e of enemies){
      for(const a of e.abilities){
        if(a.cost<=ap){
          const ts=targets(e,a);
          if(ts.length) ts.forEach(t=>choices.push({e,a,t}));
          else choices.push({e,a,t:null});
        }
      }
    }
    if(!choices.length) break;
    const pick=choices[Math.floor(Math.random()*choices.length)];
    state.plans.push(makePlan(pick.e,pick.a,pick.t,"enemy"));
    ap-=pick.a.cost;
  }
}

function resolveRound(){
  if(state.phase!=="planning")return;
  chooseEnemy();
  state.phase="resolving";
  let acts=plannedActionsForStrip(true);
  renderBattle();
  let i=0;
  function step(){
    if(i>=acts.length)return endRound();
    let act=acts[i++];
    if(!act.unit || act.unit.dead)return step();
    state.currentActionKey=act.key;
    log(`${act.unit.name} resolves ${act.ability.name}.`);
    show(`${act.unit.name}: ${act.ability.name}`);
    renderBattle();
    apply(act.unit,act.ability,act.target);
    renderBattle();
    if(checkWin())return;
    setTimeout(step,1050);
  }
  step();
}

function endRound(){
  state.units.forEach(u=>{
    u.planned=null;
    u.shield=0;
    if(u.buff.poisonHands){u.buff.poisonHands--;if(u.buff.poisonHands<=0)delete u.buff.poisonHands}
    let p=u.status.poison||0;
    if(p&&!u.dead){
      let d=Math.ceil(p/2);
      u.hp-=d;
      u.status.poison-=d;
      log(`${u.name} takes ${d} Poison.`);
      if(u.hp<=0){u.dead=true;u.hp=0}
    }
  });
  if(checkWin())return;
  state.currentActionKey=null;
  state.plans=[];
  state.round++;
  state.phase="planning";
  state.actionsLeft=3;
  state.protects=[];
  state.dodges=[];
  state.predicts=[];
  state.counters=[];
  state.guarded={};
  state.attacked={};
  selectedId=null;
  pendingAbility=null;
  renderBattle();
}


/* ===== v16 final systems pass: explicit statuses, clearer identities, real synergies ===== */

const STATUS_RULES_V16 = {
  shield: "Armor reduces incoming attack damage first. Remaining damage is absorbed by Shield. Shield persists across all hits on that unit this round, then is removed at end of round. Shield does not block statuses or Poison end-round damage.",
  armor: "Armor is permanent damage reduction. For direct damage hits: final incoming damage is first reduced by Armor, then by Shield, then HP is lost.",
  poison: "Poison stacks. End of round: take life loss equal to ceil(Poison/2), then remove that many Poison stacks. Poison ignores Armor and Shield.",
  bleed: "Bleed stacks. When hit by a direct damage ability, remove all Bleed and add that much damage to the hit before Armor and Shield are applied.",
  freeze: "Freeze stacks. At 5 Freeze, remove all Freeze and apply Frozen. Frozen cancels the unit's next non-Guard action, then is removed.",
  hypnosis: "Hypnosis is non-stackable. It does nothing by itself, but Hypnotic abilities can check or consume it.",
  exposed: "Exposed is non-stackable. The next direct damage hit against this unit deals +2 damage, then Exposed is removed.",
  exhausted: "Exhausted is non-stackable. The unit's next non-Guard action has -3 Speed, then Exhausted is removed."
};

function getArmor(u){
  return Math.max(0, (u?.armor || 0) + (u?.bonusArmor || 0));
}

function addShield(u, n){
  if(!u || u.dead || !n) return;
  u.shield = (u.shield || 0) + n;
  log(`${u.name} gains ${n} Shield. ${STATUS_RULES_V16.shield}`);
}

function addArmorThisRound(u, n){
  if(!u || u.dead || !n) return;
  u.bonusArmor = (u.bonusArmor || 0) + n;
  log(`${u.name} gains +${n} Armor until end of round.`);
}

function loseHpDirect(u, n, reason="life loss"){
  if(!u || u.dead || n<=0) return;
  u.hp -= n;
  state.attacked[u.id] = true;
  log(`${u.name} loses ${n} HP from ${reason}.`);
  if(u.hp<=0){u.hp=0;u.dead=true;log(`${u.name} is defeated.`)}
}

function addStatus(t,s,n=1){
  if(!t||t.dead)return;

  if(s==="hypnosis" || s==="exposed" || s==="exhausted" || s==="frozen"){
    t.status[s]=1;
    log(`${t.name} gains ${s}.`);
    return;
  }

  t.status[s]=(t.status[s]||0)+n;
  log(`${t.name} gains ${n} ${s}.`);

  if(s==="freeze" && (t.status.freeze||0)>=5){
    t.status.freeze=0;
    t.status.frozen=1;
    log(`${t.name} reaches 5 Freeze and becomes Frozen. Its next non-Guard action will be canceled.`);
  }
}

function bahlInfection(source, status){
  if(!source || source.id!=="shaman") return;
  if(status!=="poison" && status!=="bleed") return;
  const otherStatus = status==="poison" ? "bleed" : "poison";
  rowUnits(other(source.side),"front").forEach(enemy=>{
    if(!enemy.dead) {
      enemy.status[otherStatus]=(enemy.status[otherStatus]||0)+1;
      log(`Bahl's Demon Infection applies 1 ${otherStatus} to ${enemy.name}.`);
    }
  });
}

function applyStatusFrom(source, target, status, stacks=1){
  addStatus(target,status,stacks);
  bahlInfection(source,status);
}

function totalSpeed(u,a){
  return a.guard ? 999 : u.speed + a.spd - (u.status.exhausted ? 3 : 0);
}

function statusText(u){
  let out=[`⚡${u.speed}`];
  const armorNow = getArmor(u);
  if(armorNow !== u.armor) out.push(`🛡️${armorNow}`);
  if(u.shield)out.push(`🛡️${u.shield}S`);
  for(const [k,v] of Object.entries(u.status)) {
    if(v) out.push(`${icon(k)}${v===1&&["hypnosis","exposed","exhausted","frozen"].includes(k)?"":v}`);
  }
  const count = state?.plans?.filter(p=>p.unitId===u.id && p.side===u.side).length || 0;
  if(count && u.side==="player") out.push(`✅${count}`);
  if(count && u.side==="enemy" && state?.phase==="resolving") out.push(`❗${count}`);
  return out.map(x=>`<span class="chip">${x}</span>`).join("");
}

function targets(c,a){
  let allies=alive(c.side), enemies=alive(other(c.side));
  switch(a.effect){
    case"protect":
    case"ward":
    case"poisonHands":
    case"allyPain":
    case"allyBleed":
    case"armorBuff":
      return allies;
    case"dodge":
    case"selfCounter":
    case"spirit":
    case"absoluteZero":
    case"allStatus":
    case"allDamageStatus":
    case"frontHypno":
      return [];
    case"rowStatus":
    case"rowDamageStatus":
    case"rowMultiStatus":
      return enemies;
    default:
      return enemies.filter(t=>a.range==="melee"?(t.row==="front"||t.size==="boss"||!frontBlocked(t.side)):true);
  }
}

function damage(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead)return;

  if(opt.attack){
    let pr=state.predicts.find(p=>p.target===src);
    if(pr){
      addStatus(src,pr.status,pr.stacks||1);
      log(`${pr.caster.name} predicted and canceled ${src.name}.`);
      return;
    }
  }

  t=redirect(t,src);

  if(state.dodges.includes(t.id)){
    state.dodges=state.dodges.filter(x=>x!==t.id);
    log(`${t.name} dodges the attack.`);
    return;
  }

  let ctr=state.counters.find(x=>x.caster===t);
  if(ctr){
    addShield(t, ctr.shield||0);
    addStatus(src,ctr.status,ctr.stacks||1);
  }

  let raw=amt;

  // Character identity passives.
  if(src.id==="kahro" && hasDebuff(t)) raw++;
  if(src.id==="maoja" && t.status.poison) raw++;
  if(src.id==="smithen" && t.status.freeze) raw+=2;
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) raw+=2;

  // Exposed and Bleed are part of the hit, before Armor and Shield.
  if(t.status.exposed){
    raw += 2;
    t.status.exposed=0;
    log(`${t.name}'s Exposed adds +2 damage and is removed.`);
  }

  let bleedBurst = 0;
  if(opt.attack && (t.status.bleed||0)>0){
    bleedBurst = t.status.bleed;
    t.status.bleed = 0;
    raw += bleedBurst;
    log(`${t.name}'s Bleed bursts for +${bleedBurst} damage and is removed.`);
  }

  const armor = getArmor(t);
  let afterArmor = Math.max(0, raw - armor);
  let shieldBlocked = Math.min(t.shield||0, afterArmor);
  t.shield = Math.max(0, (t.shield||0) - shieldBlocked);
  let finalDamage = afterArmor - shieldBlocked;

  log(`${src.name}'s hit: ${raw} damage → ${armor} Armor → ${afterArmor} after Armor → ${shieldBlocked} blocked by Shield → ${finalDamage} HP damage.`);

  if(finalDamage>0){
    t.hp-=finalDamage;
    state.attacked[t.id]=true;

    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    if(t.id==="poom"&&opt.melee) addStatus(src,"hypnosis",1);
    if(t.id==="kku"&&opt.melee) addStatus(src,"freeze",1);
    if(src.id==="eva"&&bleedBurst>0) heal(src,1);

    if(t.hp<=0){t.hp=0;t.dead=true;log(`${t.name} is defeated.`)}
  } else {
    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    log(`${t.name} loses no HP from the hit.`);
  }
}

function life(t,n){loseHpDirect(t,n,"self-damage or direct life loss")}

function heal(t,n){
  if(!n||t.dead)return;
  const before=t.hp;
  t.hp=Math.min(t.maxHp,t.hp+n);
  const healed=t.hp-before;
  if(healed>0) log(`${t.name} restores ${healed} HP.`);
}

function apply(c,a,t){
  if(c.status.frozen && !a.guard){
    c.status.frozen=0;
    log(`${c.name} is Frozen. ${c.name}'s non-Guard action is canceled, then Frozen is removed.`);
    return;
  }

  const removeExhaustedAfter = !!(c.status.exhausted && !a.guard);

  switch(a.effect){
    case"protect":
      state.protects.push({guard:c,target:t,hypno:a.hypno});
      state.guarded[c.id]=true;
      break;
    case"ward":
      state.protects.push({guard:t,target:t,ward:true});
      addShield(t, a.shield || 5);
      state.guarded[c.id]=true;
      break;
    case"dodge":
      state.dodges.push(c.id);
      state.guarded[c.id]=true;
      break;
    case"predict":
      state.predicts.push({caster:c,target:t,status:"hypnosis"});
      state.guarded[c.id]=true;
      break;
    case"predictPoison":
      state.predicts.push({caster:c,target:t,status:"poison",stacks:2});
      state.guarded[c.id]=true;
      break;
    case"selfCounter":
      state.counters.push({caster:c,status:a.status,stacks:a.stacks,shield:a.shield});
      state.guarded[c.id]=true;
      break;
    case"damage":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      break;
    case"armorStrike":
      damage(c,t,getArmor(c),{attack:true,melee:true});
      break;
    case"damageStatus":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      applyStatusFrom(c,t,a.status,a.stacks);
      break;
    case"multi":
      for(let i=0;i<a.hits;i++) if(!t.dead) damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      break;
    case"drain":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      heal(c,a.heal);
      break;
    case"consumeBleed":{
      let b=t.status.bleed||0;
      t.status.bleed=0;
      damage(c,t,b+a.bonus,{attack:true});
      heal(c,a.heal||0);
      if(c.id==="dravain") addShield(c,3);
      break;
    }
    case"status":
      applyStatusFrom(c,t,a.status,a.stacks);
      break;
    case"multiStatus":
      a.statuses.forEach(([s,n])=>applyStatusFrom(c,t,s,n));
      break;
    case"rowStatus":
      rowUnits(other(c.side),a.row||t?.row||"front").forEach(x=>applyStatusFrom(c,x,a.status,a.stacks));
      break;
    case"rowDamageStatus":
      rowUnits(other(c.side),t?.row||"front").forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        applyStatusFrom(c,x,a.status,a.stacks);
      });
      break;
    case"allStatus":
      alive(other(c.side)).forEach(x=>applyStatusFrom(c,x,a.status,a.stacks));
      break;
    case"allDamageStatus":
      alive(other(c.side)).forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        applyStatusFrom(c,x,a.status,a.stacks);
      });
      break;
    case"frontHypno":
      rowUnits(other(c.side),"front").forEach(x=>{
        addStatus(x,"hypnosis",1);
        addStatus(x,"exposed",1);
      });
      break;
    case"poisonHands":
      t.buff.poisonHands=2;
      log(`${t.name}'s damaging hits apply 2 Poison until the end of next round.`);
      break;
    case"toxicGrip":
      const hadPoison = !!(t.status.poison);
      damage(c,t,3,{attack:true,melee:true});
      applyStatusFrom(c,t,"poison",2);
      if(hadPoison) addStatus(t,"exhausted",1);
      break;
    case"poisonBurst":{
      let p=t.status.poison||0;
      t.status.poison=0;
      damage(c,t,p*2,{attack:true});
      break;
    }
    case"shatter":{
      let bonus=t.status.freeze?5:0;
      t.status.freeze=0;
      damage(c,t,4+bonus,{attack:true});
      break;
    }
    case"whiteout":
      t.status.freeze?addStatus(t,"exposed",1):addStatus(t,"freeze",1);
      break;
    case"glacier":
      damage(c,t,(t.status.freeze?10:5),{attack:true,melee:true});
      break;
    case"assassinate":
      damage(c,t,5+(t.row==="back"&&!state.protects.some(p=>p.target===t)?4:0),{attack:true});
      break;
    case"punishGuard":
      damage(c,t,state.guarded[t.id]?8:2,{attack:true});
      break;
    case"mindBreak":
      if(t.status.hypnosis){t.status.hypnosis=0;damage(c,t,7,{attack:true})}
      else damage(c,t,2,{attack:true});
      break;
    case"bloodDash":
      damage(c,t,2,{attack:true});
      if(t.status.bleed)addStatus(t,"exposed",1);
      break;
    case"allyPain":
      life(t,a.self);
      rowUnits(other(c.side),"front").forEach(x=>damage(c,x,a.dmg,{attack:true,aoe:true}));
      break;
    case"allyBleed":
      life(t,a.self);
      rowUnits(other(c.side),"front").forEach(x=>applyStatusFrom(c,x,"bleed",a.stacks));
      break;
    case"revenge":
      life(c,a.self);
      damage(c,t,a.dmg+(state.attacked[c.id]?3:0),{attack:true,melee:true});
      break;
    case"absoluteZero":
      alive(other(c.side)).filter(x=>x.status.freeze).forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        addStatus(x,"exhausted",1);
      });
      break;
    case"spirit":
      addShield(c,5);
      state.dodges.push(c.id);
      break;
    case"armorBuff":
      addArmorThisRound(t,a.armor||2);
      addShield(t,a.shield||3);
      break;
    case"proliferate":
      ["poison","bleed","freeze"].forEach(s=>{
        if(t.status[s]>0){
          t.status[s]*=2;
          log(`${t.name}'s ${s} is doubled to ${t.status[s]}.`);
        }
      });
      if(t.status.hypnosis) addStatus(t,"exposed",1);
      if((t.status.freeze||0)>=5){t.status.freeze=0;t.status.frozen=1;log(`${t.name} reaches 5 Freeze and becomes Frozen.`)}
      break;
    case"mindToxin":
      damage(c,t,(t.status.poison&&t.status.hypnosis)?5:3,{attack:true});
      if(t.status.hypnosis) applyStatusFrom(c,t,"poison",3);
      break;
    case"rowMultiStatus":
      rowUnits(other(c.side),t?.row||"front").forEach(x=>a.statuses.forEach(([s,n])=>applyStatusFrom(c,x,s,n)));
      break;
  }

  if(removeExhaustedAfter){
    c.status.exhausted=0;
    log(`${c.name}'s Exhausted is removed after resolving a non-Guard action.`);
  }
}

function endRound(){
  state.units.forEach(u=>{
    u.planned=null;
    u.shield=0;
    u.bonusArmor=0;
    if(u.buff.poisonHands){u.buff.poisonHands--;if(u.buff.poisonHands<=0)delete u.buff.poisonHands}
    let p=u.status.poison||0;
    if(p&&!u.dead){
      let d=Math.ceil(p/2);
      u.hp-=d;
      u.status.poison-=d;
      log(`${u.name} takes ${d} Poison damage. Poison ignores Armor and Shield.`);
      if(u.hp<=0){u.dead=true;u.hp=0;log(`${u.name} is defeated by Poison.`)}
    }
  });
  if(checkWin())return;
  state.currentActionKey=null;
  state.plans=[];
  state.round++;
  state.phase="planning";
  state.actionsLeft=3;
  state.protects=[];
  state.dodges=[];
  state.predicts=[];
  state.counters=[];
  state.guarded={};
  state.attacked={};
  selectedId=null;
  pendingAbility=null;
  renderBattle();
}

function tuneRosterFinal(){
  const byId = id => ROSTER.find(c=>c.id===id);
  const set = (id, patch) => { const c=byId(id); if(c) Object.assign(c, patch); };

  set("dravain", {
    passive:"Passive — Blood Guard: when Dravain consumes Bleed with Blood Claim, Dravain gains 3 Shield. Shield is removed at end of round.",
    abilities:[
      A("protect","Protect Ally",1,99,"Guard. Choose an ally. Until the round ends, the first attack targeting that ally targets Dravain instead.","protect",{guard:true,range:"ally"}),
      A("bash","Shield Bash",1,0,"Melee attack. Deal damage equal to 2 + Dravain's current Armor. Armor is checked when this resolves.","armorStrike",{range:"melee"}),
      A("drain","Vampiric Thrust",2,-1,"Melee attack. Deal 5 damage to one front-row enemy, then Dravain restores 3 HP.","drain",{dmg:5,heal:3,range:"melee"}),
      A("claim","Blood Claim",2,-2,"Ranged payoff. Remove all Bleed from one enemy. Deal damage equal to removed Bleed + 4, then Dravain restores 2 HP.","consumeBleed",{bonus:4,heal:2,range:"ranged"})
    ]
  });

  set("hyafrost", {
    passive:"Passive — Deep Winter: Hyafrost's Icecraft abilities create Freeze pressure; allies can convert that time into Armor and Shield.",
    abilities:[
      A("blast","Ice Blast",1,0,"Ranged attack. Deal 2 damage to one enemy, then apply 2 Freeze.","damageStatus",{dmg:2,status:"freeze",stacks:2,range:"ranged"}),
      A("armor","Frost Armor",1,1,"Ally support. Choose an ally. That ally gains +2 Armor and 3 Shield until end of round. Armor reduces direct damage before Shield.","armorBuff",{range:"ally",armor:2,shield:3}),
      A("field","Frozen Field",2,-2,"Row status. Choose an enemy row. Apply 2 Freeze to each enemy in that row.","rowStatus",{status:"freeze",stacks:2,range:"ranged"}),
      A("zero","Absolute Zero",2,-3,"Area payoff. Deal 3 damage to each enemy with any Freeze stacks, then apply Exhausted to each damaged enemy.","absoluteZero",{dmg:3})
    ]
  });

  set("shaman", {
    name:"Bahl",
    passive:"Passive — Demon Infection: when Bahl applies Poison or Bleed with an ability, each enemy in the front row also gains 1 stack of the other status.",
    abilities:[
      A("mark","Infect Mark",1,0,"Ranged status. Apply 1 Poison and 1 Bleed to one enemy.","multiStatus",{statuses:[["poison",1],["bleed",1]],range:"ranged"}),
      A("proliferate","Dark Proliferation",2,-1,"Ranged payoff. Choose an enemy. Double that enemy's Poison, Bleed, and Freeze stacks. If it has Hypnosis, also apply Exposed.","proliferate",{range:"ranged"}),
      A("plague","Plague Wave",2,-2,"Row attack. Choose an enemy row. Deal 1 damage to each enemy in that row, then apply 2 Poison to each of them.","rowDamageStatus",{dmg:1,status:"poison",stacks:2,range:"ranged"}),
      A("ward","Demon Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt, and the attacker gains 1 Bleed.","ward",{guard:true,range:"ally",shield:5})
    ]
  });

  set("yaura", {
    passive:"Passive — Blood Echo: the first time each round an ally loses HP from your own ability, apply 1 Bleed to each enemy in the front row.",
    abilities:[
      A("ward","Blood Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt, and the attacker gains 1 Bleed.","ward",{guard:true,range:"ally",shield:5}),
      A("bolt","Blood Bolt",1,0,"Ranged attack. Deal 2 damage to one enemy, then apply 2 Bleed.","damageStatus",{dmg:2,status:"bleed",stacks:2,range:"ranged"}),
      A("price","Blood Price",1,-1,"Bloodcraft attack. Choose an ally. That ally loses 2 HP. Then each enemy in the front row takes 4 direct damage.","allyPain",{range:"ally",dmg:4,self:2}),
      A("rain","Red Rain",2,-2,"Area status. Apply 1 Bleed to every enemy.","allStatus",{status:"bleed",stacks:1})
    ]
  });

  set("maoja", {
    passive:"Passive — Toxic Momentum: Maoja's damage abilities deal +1 damage to targets with any Poison stacks.",
    abilities:[
      A("hands","Poison Hands",1,0,"Ally buff. Choose an ally. Until the end of next round, each of that ally's damaging hits applies 2 Poison to the target.","poisonHands",{range:"ally"}),
      A("grip","Toxic Grip",1,-1,"Melee attack. Deal 3 damage to one front-row enemy, then apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted.","toxicGrip",{range:"melee"}),
      A("breath","Caustic Breath",2,-2,"Row attack. Choose an enemy row. Deal 1 damage to each enemy in that row, then apply 3 Poison to each of them.","rowDamageStatus",{dmg:1,status:"poison",stacks:3,range:"ranged"}),
      A("burst","Rot Burst",2,-3,"Ranged payoff. Remove all Poison from one enemy. Deal damage equal to 2 times the removed Poison stacks.","poisonBurst",{range:"ranged"})
    ]
  });

  set("kku", {
    passive:"Passive — Cold Hide: after an enemy hits K'ku with a melee attack, that enemy gains 1 Freeze.",
    abilities:[
      A("guard","Ice Guard",1,99,"Guard. If K'ku is attacked this round, K'ku gains 6 Shield before damage is dealt, and the attacker gains 2 Freeze.","selfCounter",{guard:true,status:"freeze",stacks:2,shield:6}),
      A("slam","Frost Slam",1,-1,"Melee attack. Deal 4 damage to one front-row enemy, then apply 1 Freeze.","damageStatus",{dmg:4,status:"freeze",stacks:1,range:"melee"}),
      A("break","Glacier Break",2,-2,"Melee attack. Deal 5 damage to one front-row enemy. If that enemy has any Freeze stacks, deal +5 damage.","glacier",{range:"melee"}),
      A("roar","Blizzard Roar",2,-3,"Area status. Apply 2 Freeze to each enemy in the front row.","rowStatus",{status:"freeze",stacks:2,row:"front"})
    ]
  });

  set("bakub", {
    passive:"Passive — Nightmare Brew: Bakub's damage abilities deal +2 damage to enemies that have both Poison and Hypnosis.",
    abilities:[
      A("vial","Nightmare Vial",1,0,"Ranged status. Apply 2 Poison and Hypnosis to one enemy.","multiStatus",{statuses:[["poison",2],["hypnosis",1]],range:"ranged"}),
      A("toxin","Mind Toxin",1,-1,"Ranged attack. Deal 3 damage to one enemy. If that enemy has Hypnosis, also apply 3 Poison.","mindToxin",{range:"ranged"}),
      A("fog","Demon Fog",2,-2,"Row status. Choose an enemy row. Apply 1 Poison and Hypnosis to each enemy in that row.","rowMultiStatus",{statuses:[["poison",1],["hypnosis",1]],range:"ranged"}),
      A("future","False Future",1,99,"Guard prediction. Choose an enemy. If that enemy uses a damage attack this round, cancel that action and apply 2 Poison to that enemy.","predictPoison",{guard:true,range:"ranged"})
    ]
  });
}
tuneRosterFinal();


/* ===== v17 combat clarity + target/status UX pass ===== */

const STATUS_LABELS_V17 = {
  armor: { icon:"🛡️", title:"Armor", text: STATUS_RULES_V16.armor },
  shield: { icon:"🛡️", title:"Shield", text: STATUS_RULES_V16.shield },
  poison: { icon:"☠️", title:"Poison", text: STATUS_RULES_V16.poison },
  bleed: { icon:"🩸", title:"Bleed", text: STATUS_RULES_V16.bleed },
  freeze: { icon:"❄️", title:"Freeze / Frozen", text: STATUS_RULES_V16.freeze },
  frozen: { icon:"❄️", title:"Frozen", text: STATUS_RULES_V16.freeze },
  hypnosis: { icon:"🌀", title:"Hypnosis", text: STATUS_RULES_V16.hypnosis },
  exposed: { icon:"🎯", title:"Exposed", text: STATUS_RULES_V16.exposed },
  exhausted: { icon:"💤", title:"Exhausted", text: STATUS_RULES_V16.exhausted },
  speed: { icon:"⚡", title:"Speed", text:"During resolution, Guard actions resolve first. All other actions resolve from highest Speed to lowest. Exhausted gives -3 Speed to the next non-Guard action." }
};

function markRumble(u){
  if(!u) return;
  u.rumbleUntil = Date.now() + 520;
}

function isCurrentActor(u){
  if(!state || !state.currentActionKey || !state.plans) return false;
  const p = state.plans.find(p=>p.pid===state.currentActionKey);
  return !!p && p.unitId === u.id;
}

function showStatusInfo(key){
  const info = STATUS_LABELS_V17[key] || STATUS_LABELS_V17[key?.replace(/[0-9]/g,"")];
  if(!info) return;
  $("infoTitle").textContent = `${info.icon} ${info.title}`;
  $("infoBody").innerHTML = `<div class="statusInfoBox">${info.text}</div>`;
}

function frontBlocked(side){
  return alive(side).some(u=>u.row==="front"||u.size==="boss");
}

function targets(c,a){
  let allies=alive(c.side), enemies=alive(other(c.side));
  switch(a.effect){
    case"protect":
    case"ward":
    case"poisonHands":
    case"allyPain":
    case"allyBleed":
    case"armorBuff":
      return allies;
    case"dodge":
    case"selfCounter":
    case"spirit":
    case"absoluteZero":
    case"allStatus":
    case"allDamageStatus":
    case"frontHypno":
      return [];
    case"rowStatus":
    case"rowDamageStatus":
    case"rowMultiStatus":
      return enemies;
    default:
      // Melee/non-ranged attacks can only hit front row while any enemy remains in front.
      // If the entire enemy front row is defeated, melee can target back row.
      return enemies.filter(t=>{
        if(a.range !== "melee") return true;
        return t.size === "boss" || t.row === "front" || !frontBlocked(t.side);
      });
  }
}

function chipHtml(key,label){
  return `<span class="chip statusChip" data-status="${key}" role="button" tabindex="0">${label}</span>`;
}

function statusText(u){
  let out=[chipHtml("speed",`⚡${u.speed}`)];
  const armorNow = getArmor(u);
  if(armorNow !== u.armor) out.push(chipHtml("armor",`🛡️${armorNow}`));
  if(u.shield) out.push(chipHtml("shield",`🛡️${u.shield}S`));
  for(const [k,v] of Object.entries(u.status)) {
    if(v) out.push(chipHtml(k,`${icon(k)}${v===1&&["hypnosis","exposed","exhausted","frozen"].includes(k)?"":v}`));
  }
  const count = state?.plans?.filter(p=>p.unitId===u.id && p.side===u.side).length || 0;
  if(count && u.side==="player") out.push(`<span class="chip">✅${count}</span>`);
  if(count && u.side==="enemy" && state?.phase==="resolving") out.push(`<span class="chip">❗${count}</span>`);
  return out.join("");
}

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  t.dataset.side=u.side;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId && (!selectedSide || u.side===selectedSide))t.classList.add("selected");
  if(isCurrentActor(u))t.classList.add("currentActor");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(pendingAbility&&isTarget(selectedUnit(),pendingAbility,u))t.classList.add("targetable");
  t.innerHTML=`<div class="art" style="background:${u.art}"></div><div class="badge">${CLASS[u.class]?.icon||"🐸"}</div><div class="chips">${statusText(u)}</div><div class="armor">🛡️ ${getArmor(u)}</div><div class="hp">❤️ ${u.hp}</div><div class="name">${u.name}</div>`;
  t.onclick=(ev)=>{
    const statusBtn = ev.target.closest(".statusChip");
    if(statusBtn){
      ev.stopPropagation();
      showStatusInfo(statusBtn.dataset.status);
      return;
    }

    if(state.phase!=="planning"||u.dead)return;
    if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))return plan(u);
    if(u.side==="player"){
      selectedId=u.id;
      pendingAbility=null;
      renderBattle();
      openWheel(u);
    }
  };
  return t;
}

function damage(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead)return;

  if(opt.attack){
    let pr=state.predicts.find(p=>p.target===src);
    if(pr){
      addStatus(src,pr.status,pr.stacks||1);
      log(`${pr.caster.name} predicted and canceled ${src.name}.`);
      return;
    }
  }

  t=redirect(t,src);

  if(state.dodges.includes(t.id)){
    state.dodges=state.dodges.filter(x=>x!==t.id);
    log(`${t.name} dodges the attack.`);
    return;
  }

  let ctr=state.counters.find(x=>x.caster===t);
  if(ctr){
    addShield(t, ctr.shield||0);
    addStatus(src,ctr.status,ctr.stacks||1);
  }

  let raw=amt;

  // Character identity passives.
  if(src.id==="kahro" && hasDebuff(t)) raw++;
  if(src.id==="maoja" && t.status.poison) raw++;
  if(src.id==="smithen" && t.status.freeze) raw+=2;
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) raw+=2;

  // Exposed and Bleed are part of the hit, before Armor and Shield.
  if(t.status.exposed){
    raw += 2;
    t.status.exposed=0;
    log(`${t.name}'s Exposed adds +2 damage and is removed.`);
  }

  let bleedBurst = 0;
  if(opt.attack && (t.status.bleed||0)>0){
    bleedBurst = t.status.bleed;
    t.status.bleed = 0;
    raw += bleedBurst;
    log(`${t.name}'s Bleed bursts for +${bleedBurst} damage and is removed.`);
  }

  const armor = getArmor(t);
  let afterArmor = Math.max(0, raw - armor);
  let shieldBlocked = Math.min(t.shield||0, afterArmor);
  t.shield = Math.max(0, (t.shield||0) - shieldBlocked);
  let finalDamage = afterArmor - shieldBlocked;

  log(`${src.name}'s hit: ${raw} damage → ${armor} Armor → ${afterArmor} after Armor → ${shieldBlocked} blocked by Shield → ${finalDamage} HP damage.`);

  if(finalDamage>0){
    t.hp-=finalDamage;
    markRumble(t);
    state.attacked[t.id]=true;

    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    if(t.id==="poom"&&opt.melee) addStatus(src,"hypnosis",1);
    if(t.id==="kku"&&opt.melee) addStatus(src,"freeze",1);
    if(src.id==="eva"&&bleedBurst>0) heal(src,1);

    if(t.hp<=0){t.hp=0;t.dead=true;log(`${t.name} is defeated.`)}
  } else {
    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    log(`${t.name} loses no HP from the hit.`);
  }
}

function loseHpDirect(u, n, reason="life loss"){
  if(!u || u.dead || n<=0) return;
  u.hp -= n;
  markRumble(u);
  state.attacked[u.id] = true;
  log(`${u.name} loses ${n} HP from ${reason}.`);
  if(u.hp<=0){u.hp=0;u.dead=true;log(`${u.name} is defeated.`)}
}

function endRound(){
  state.units.forEach(u=>{
    u.planned=null;
    u.shield=0;
    u.bonusArmor=0;
    if(u.buff.poisonHands){u.buff.poisonHands--;if(u.buff.poisonHands<=0)delete u.buff.poisonHands}
    let p=u.status.poison||0;
    if(p&&!u.dead){
      let d=Math.ceil(p/2);
      u.hp-=d;
      markRumble(u);
      u.status.poison-=d;
      log(`${u.name} takes ${d} Poison damage. Poison ignores Armor and Shield.`);
      if(u.hp<=0){u.dead=true;u.hp=0;log(`${u.name} is defeated by Poison.`)}
    }
  });
  if(checkWin())return;
  state.currentActionKey=null;
  state.plans=[];
  state.round++;
  state.phase="planning";
  state.actionsLeft=3;
  state.protects=[];
  state.dodges=[];
  state.predicts=[];
  state.counters=[];
  state.guarded={};
  state.attacked={};
  selectedId=null;
  pendingAbility=null;
  renderBattle();
}


/* ===== v18 mobile UI approval pass ===== */

let mobilePanelMode = "info";

function isMobileLayout(){
  return window.matchMedia("(max-width: 700px)").matches;
}

function openMobilePanel(mode="info"){
  mobilePanelMode = mode;
  const sheet = $("infoPanelSheet");
  if(!sheet) return;
  document.body.classList.add("mobilePanelOpen");
  sheet.classList.toggle("showLog", mode === "log");
  sheet.classList.toggle("showInfo", mode !== "log");
}

function closeMobilePanel(){
  document.body.classList.remove("mobilePanelOpen");
}

function installMobilePanelButtons(){
  $("mobileInfoBtn") && ($("mobileInfoBtn").onclick = () => openMobilePanel("info"));
  $("mobileLogBtn") && ($("mobileLogBtn").onclick = () => openMobilePanel("log"));
  $("mobileClosePanelBtn") && ($("mobileClosePanelBtn").onclick = closeMobilePanel);
}

function showStatusInfo(key){
  const info = STATUS_LABELS_V17[key] || STATUS_LABELS_V17[key?.replace(/[0-9]/g,"")];
  if(!info) return;
  $("infoTitle").textContent = `${info.icon} ${info.title}`;
  $("infoBody").innerHTML = `<div class="statusInfoBox">${info.text}</div>`;
  if(isMobileLayout()) openMobilePanel("info");
}

function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");

  radial.classList.remove("hidden");
  if (tooltip) tooltip.classList.add("hidden");

  const mobile = isMobileLayout();
  const size = mobile
    ? Math.min(315, Math.max(275, Math.min(window.innerWidth * 0.82, window.innerHeight * 0.46)))
    : Math.min(360, Math.max(300, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));

  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;

  if (tile) {
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  const margin = size / 2 + 10;
  cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));

  if(mobile){
    // Keep the wheel in the board area and leave room for the bottom tooltip sheet.
    const maxY = window.innerHeight - size/2 - 155;
    cy = Math.max(margin + 6, Math.min(maxY, cy));
  } else {
    cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));
  }

  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `<div class="miniCenterName">${u.name}</div>`;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    return `<button class="wheelBtn w${i}" ${state.actionsLeft<a.cost?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')">
      <span class="wheelBtnTitle">${a.name}</span>
      <span class="wheelBtnMeta">${a.cost} AP · ${speedLabel}</span>
    </button>`;
  }).join("");

  document.querySelectorAll(".wheelBtn").forEach(b=>{
    const a = u.abilities.find(x=>x.id===b.dataset.id);

    const showTip = () => {
      if (!tooltip) return;

      tooltip.innerHTML = `
        <div class="tipTop">
          <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
          <div>
            <b>${a.name}</b>
            <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
          </div>
        </div>
        <p>${a.desc}</p>
        <div class="tipTags">
          <span>${abilityIconKey(u,a)}</span>
          <span>${a.range || (a.guard ? "guard" : "self")}</span>
        </div>
      `;
      tooltip.classList.remove("hidden");

      if(isMobileLayout()){
        tooltip.style.left = "10px";
        tooltip.style.right = "10px";
        tooltip.style.top = "auto";
        tooltip.style.bottom = "10px";
        tooltip.style.width = "calc(100vw - 20px)";
        return;
      }

      const wr = wheel.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const tw = 292;
      const th = 156;
      const idx = Number(b.dataset.index);

      let x, y;
      if (idx === 0) {
        x = wr.left + wr.width / 2 - tw / 2;
        y = wr.top - th - 14;
      } else if (idx === 2) {
        x = wr.left + wr.width / 2 - tw / 2;
        y = wr.bottom + 14;
      } else if (idx === 1) {
        x = wr.right + 14;
        y = br.top + br.height / 2 - th / 2;
      } else {
        x = wr.left - tw - 14;
        y = br.top + br.height / 2 - th / 2;
      }

      x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
      y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
      tooltip.style.left = x + "px";
      tooltip.style.top = y + "px";
      tooltip.style.bottom = "auto";
      tooltip.style.right = "auto";
      tooltip.style.width = tw + "px";
    };

    b.onmouseenter = showTip;
    b.onfocus = showTip;
    b.onmouseleave = () => !isMobileLayout() && tooltip && tooltip.classList.add("hidden");
    b.ontouchstart = showTip;

    b.onclick = () => {
      pendingAbility = a;
      radial.classList.add("hidden");
      if (tooltip) tooltip.classList.add("hidden");
      renderBattle();
      if(!targets(u,pendingAbility).length) plan(null);
    };
  });
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").textContent=u?`${u.name} — ${u.class} / ${u.prof}`:"Plan hidden actions";
  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;
  $("infoBody").innerHTML=u
    ? `<b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${getArmor(u)} · ⚡${u.speed}<br><b>Passive:</b> ${u.passive}<br>${u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}</div>`).join("")}`
    : `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;

  if(isMobileLayout() && u) {
    // Do not automatically cover the board; user can open Info. Keep state updated.
  }
}

installMobilePanelButtons();
window.addEventListener("resize", () => {
  if(!isMobileLayout()) closeMobilePanel();
});


/* ===== v19 explicit mobile mode + centered mobile wheel ===== */
let forcedMobileMode = localStorage.getItem("splitSecondsMobileMode") === "1";

function applyMobileMode(){
  document.body.classList.toggle("forceMobile", forcedMobileMode);
  const label = forcedMobileMode ? "💻 Desktop View" : "📱 Mobile View";
  if($("mobileModeBtn")) $("mobileModeBtn").textContent = label;
  if($("battleMobileModeBtn")) $("battleMobileModeBtn").textContent = forcedMobileMode ? "💻" : "📱";
}

function toggleMobileMode(){
  forcedMobileMode = !forcedMobileMode;
  localStorage.setItem("splitSecondsMobileMode", forcedMobileMode ? "1" : "0");
  applyMobileMode();
  closeMobilePanel?.();
  renderBuilder?.();
  if(state) renderBattle();
}

function isMobileLayout(){
  return forcedMobileMode || window.matchMedia("(max-width: 700px)").matches;
}

function installMobileModeButtons(){
  if($("mobileModeBtn")) $("mobileModeBtn").onclick = toggleMobileMode;
  if($("battleMobileModeBtn")) $("battleMobileModeBtn").onclick = toggleMobileMode;
  applyMobileMode();
}

function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");

  radial.classList.remove("hidden");
  if (tooltip) tooltip.classList.add("hidden");

  const mobile = isMobileLayout();
  const size = mobile
    ? Math.min(315, Math.max(275, Math.min(window.innerWidth * 0.82, window.innerHeight * 0.46)))
    : Math.min(360, Math.max(300, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));

  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;

  if (!mobile && tile) {
    // Desktop: wheel opens over the character.
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    const margin = size / 2 + 10;
    cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
    cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));
  } else {
    // Mobile: always center the wheel in the usable upper battle area.
    // This is much more predictable and keeps the tooltip as a readable bottom sheet.
    cx = window.innerWidth / 2;
    cy = Math.max(size/2 + 18, Math.min(window.innerHeight * 0.42, window.innerHeight - size/2 - 160));
  }

  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `<div class="miniCenterName">${u.name}</div>`;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    return `<button class="wheelBtn w${i}" ${state.actionsLeft<a.cost?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')">
      <span class="wheelBtnTitle">${a.name}</span>
      <span class="wheelBtnMeta">${a.cost} AP · ${speedLabel}</span>
    </button>`;
  }).join("");

  document.querySelectorAll(".wheelBtn").forEach(b=>{
    const a = u.abilities.find(x=>x.id===b.dataset.id);

    const showTip = () => {
      if (!tooltip) return;

      tooltip.innerHTML = `
        <div class="tipTop">
          <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
          <div>
            <b>${a.name}</b>
            <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
          </div>
        </div>
        <p>${a.desc}</p>
        <div class="tipTags">
          <span>${abilityIconKey(u,a)}</span>
          <span>${a.range || (a.guard ? "guard" : "self")}</span>
        </div>
      `;
      tooltip.classList.remove("hidden");

      if(isMobileLayout()){
        tooltip.style.left = "10px";
        tooltip.style.right = "10px";
        tooltip.style.top = "auto";
        tooltip.style.bottom = "10px";
        tooltip.style.width = "calc(100vw - 20px)";
        return;
      }

      const wr = wheel.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const tw = 292;
      const th = 156;
      const idx = Number(b.dataset.index);

      let x, y;
      if (idx === 0) {
        x = wr.left + wr.width / 2 - tw / 2;
        y = wr.top - th - 14;
      } else if (idx === 2) {
        x = wr.left + wr.width / 2 - tw / 2;
        y = wr.bottom + 14;
      } else if (idx === 1) {
        x = wr.right + 14;
        y = br.top + br.height / 2 - th / 2;
      } else {
        x = wr.left - tw - 14;
        y = br.top + br.height / 2 - th / 2;
      }

      x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
      y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
      tooltip.style.left = x + "px";
      tooltip.style.top = y + "px";
      tooltip.style.bottom = "auto";
      tooltip.style.right = "auto";
      tooltip.style.width = tw + "px";
    };

    b.onmouseenter = showTip;
    b.onfocus = showTip;
    b.onmouseleave = () => !isMobileLayout() && tooltip && tooltip.classList.add("hidden");
    b.ontouchstart = showTip;

    b.onclick = () => {
      pendingAbility = a;
      radial.classList.add("hidden");
      if (tooltip) tooltip.classList.add("hidden");
      renderBattle();
      if(!targets(u,pendingAbility).length) plan(null);
    };
  });
}

installMobileModeButtons();


/* ===== v21 animation, clarity, and mobile ability preview pass ===== */
let mobilePreviewAbilityId = null;
let lastAction = null;

function fxLayer(){ return $("fxLayer"); }

function tileEl(unitId){
  return document.querySelector(`.tile[data-unit-id="${unitId}"]`);
}

function clearFx(){
  const fx = fxLayer();
  if(fx) fx.innerHTML = "";
}

function centerOf(el){
  const r = el.getBoundingClientRect();
  return {x:r.left+r.width/2, y:r.top+r.height/2, w:r.width, h:r.height};
}

function spawnFloatingText(unitObj, text, kind="hp"){
  const el = tileEl(unitObj?.id);
  const fx = fxLayer();
  if(!el || !fx) return;
  const c = centerOf(el);
  const div = document.createElement("div");
  div.className = `floatText ${kind}`;
  div.textContent = text;
  div.style.left = c.x + "px";
  div.style.top = (c.y - c.h*0.15) + "px";
  fx.appendChild(div);
  setTimeout(()=>div.remove(), 1200);
}

function spawnStatusPop(unitObj, status, amount){
  const el = tileEl(unitObj?.id);
  const fx = fxLayer();
  if(!el || !fx) return;
  const c = centerOf(el);
  const info = STATUS_LABELS_V17?.[status] || {icon: icon(status)||"✦", title:status};
  const div = document.createElement("div");
  div.className = `statusPop ${status}`;
  div.innerHTML = `<span>${info.icon}</span><b>${amount ? "+"+amount : ""}</b>`;
  div.style.left = c.x + "px";
  div.style.top = (c.y - c.h*0.33) + "px";
  fx.appendChild(div);
  setTimeout(()=>div.remove(), 950);
}

function spawnLine(fromUnit, toUnit, kind="attack"){
  const a = tileEl(fromUnit?.id), b = tileEl(toUnit?.id);
  const fx = fxLayer();
  if(!a || !b || !fx) return;
  const p1 = centerOf(a), p2 = centerOf(b);
  const dx = p2.x-p1.x, dy = p2.y-p1.y;
  const len = Math.hypot(dx,dy);
  const ang = Math.atan2(dy,dx)*180/Math.PI;
  const line = document.createElement("div");
  line.className = `targetLine ${kind}`;
  line.style.left = p1.x + "px";
  line.style.top = p1.y + "px";
  line.style.width = len + "px";
  line.style.transform = `rotate(${ang}deg)`;
  fx.appendChild(line);
  setTimeout(()=>line.remove(), 650);
}

function actionKind(a){
  const txt = `${a?.name||""} ${a?.desc||""} ${a?.effect||""}`.toLowerCase();
  if(a?.guard) return "guard";
  if(/heal|armor|shield|ward|protect/.test(txt)) return "support";
  if(/poison|bleed|freeze|hypnosis|exposed|exhausted|status/.test(txt)) return "status";
  if(/row|all|area|wave|rain|field|roar|fog/.test(txt)) return "aoe";
  return "attack";
}

function showActionToast(actor, ability, target){
  const msg = target ? `${actor.name} uses ${ability.name} → ${target.name}` : `${actor.name} uses ${ability.name}`;
  show(msg);
}

function previewTargeting(c,a){
  const info = $("infoBody");
  if(!c || !a || !info) return;
  const ts = targets(c,a);
  let msg = "";
  if(!ts.length) msg = "This ability does not require a target.";
  else if(a.range==="melee" && !frontBlocked(other(c.side))) msg = "Choose a target. Enemy front row is empty, so melee can now reach the back row.";
  else if(a.range==="melee") msg = "Choose an enemy in the front row. Melee cannot target back row while a front-row enemy is alive.";
  else if(a.range==="ally") msg = "Choose an allied character.";
  else if(/row/i.test(a.desc || "")) msg = "Choose any enemy in the row you want to affect. The whole row will be highlighted.";
  else msg = "Choose a legal target.";
  info.innerHTML = `<div class="statusInfoBox"><b>Targeting:</b> ${msg}</div>` + info.innerHTML;
}

function renderQueueStrip(){
  const strip = $("queueStrip");
  if(!strip || !state) return;
  const includeEnemy = state.phase === "resolving";
  const acts = plannedActionsForStrip(includeEnemy);
  if(!acts.length){
    strip.innerHTML = `<div class="queueEmpty">Queue actions to preview resolve order</div>`;
    return;
  }
  strip.innerHTML = `
    <div class="queueLabel">${includeEnemy ? "Resolve order" : "Your queued moves — tap to remove"}</div>
    <div class="queueItems">
      ${acts.map(act=>{
        const iconUrl = abilityIconUrl(act.unit, act.ability);
        const active = state.currentActionKey === act.key;
        const resolved = state.resolvedActionKeys?.includes(act.key);
        const canceled = state.canceledActionKeys?.includes(act.key);
        return `<button class="queueCard ${act.side} ${active ? "active" : ""} ${resolved ? "resolved" : ""} ${canceled ? "canceled" : ""}"
          data-plan-id="${act.key}" ${state.phase !== "planning" || act.side !== "player" ? "disabled" : ""}>
          <span class="queueIcon" style="background-image:url('${iconUrl}')"></span>
          <span class="queueText">
            <b>${act.unit.name}</b>
            <small>${act.ability.name}</small>
          </span>
          <span class="queueSpeed">${act.ability.guard ? "G" : "⚡"+act.speed}</span>
          ${state.phase === "planning" && act.side === "player" ? '<span class="queueRemove">×</span>' : ''}
          ${resolved ? '<span class="queueDone">✓</span>' : ''}
          ${canceled ? '<span class="queueCancel">✕</span>' : ''}
        </button>`;
      }).join("")}
    </div>`;

  strip.querySelectorAll(".queueCard[data-plan-id]").forEach(btn=>{
    btn.onclick = () => {
      if(state.phase !== "planning" || btn.disabled) return;
      unplan(btn.dataset.planId);
    };
  });
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").textContent=u?`${u.name} — ${u.class} / ${u.prof}`:"Plan hidden actions";
  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;
  $("infoBody").innerHTML=u
    ? `<b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${getArmor(u)} · ⚡${u.speed}<br><b>Passive:</b> ${u.passive}<br>${u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}</div>`).join("")}`
    : `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
  if(pendingAbility && selectedId) previewTargeting(unit(selectedId), pendingAbility);
}

function setAbilityTooltip(u,a){
  const tooltip = $("abilityTooltip");
  if(!tooltip || !a) return;
  tooltip.innerHTML = `
    <div class="tipTop">
      <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
      <div>
        <b>${a.name}</b>
        <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
      </div>
    </div>
    <p>${a.desc}</p>
    <div class="tipTags">
      <span>${abilityIconKey(u,a)}</span>
      <span>${a.range || (a.guard ? "guard" : "self")}</span>
      ${isMobileLayout() ? "<span>tap again to choose</span>" : ""}
    </div>
  `;
  tooltip.classList.remove("hidden");
  if(isMobileLayout()){
    tooltip.style.left = "10px";
    tooltip.style.right = "10px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "10px";
    tooltip.style.width = "calc(100vw - 20px)";
  }
}

function openWheel(u){
  mobilePreviewAbilityId = null;
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");

  radial.classList.remove("hidden");
  if (tooltip) tooltip.classList.add("hidden");

  const mobile = isMobileLayout();
  const size = mobile
    ? Math.min(315, Math.max(275, Math.min(window.innerWidth * 0.82, window.innerHeight * 0.46)))
    : Math.min(360, Math.max(300, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));

  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;

  if (!mobile && tile) {
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    const margin = size / 2 + 10;
    cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
    cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));
  } else {
    cx = window.innerWidth / 2;
    cy = Math.max(size/2 + 18, Math.min(window.innerHeight * 0.42, window.innerHeight - size/2 - 160));
  }

  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";
  $("wheelCenter").innerHTML = `<div class="miniCenterName">${u.name}</div>`;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    return `<button class="wheelBtn w${i}" ${state.actionsLeft<a.cost?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')">
      <span class="wheelBtnTitle">${a.name}</span>
      <span class="wheelBtnMeta">${a.cost} AP · ${speedLabel}</span>
    </button>`;
  }).join("");

  const available = u.abilities.find(a=>state.actionsLeft>=a.cost) || u.abilities[0];
  if(mobile && available){
    mobilePreviewAbilityId = available.id;
    setAbilityTooltip(u, available);
  }

  document.querySelectorAll(".wheelBtn").forEach(b=>{
    const a = u.abilities.find(x=>x.id===b.dataset.id);

    const showTip = () => {
      setAbilityTooltip(u,a);

      if(!isMobileLayout()){
        const tooltip = $("abilityTooltip");
        const wr = wheel.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        const tw = 292;
        const th = 156;
        const idx = Number(b.dataset.index);
        let x, y;
        if (idx === 0) { x = wr.left + wr.width / 2 - tw / 2; y = wr.top - th - 14; }
        else if (idx === 2) { x = wr.left + wr.width / 2 - tw / 2; y = wr.bottom + 14; }
        else if (idx === 1) { x = wr.right + 14; y = br.top + br.height / 2 - th / 2; }
        else { x = wr.left - tw - 14; y = br.top + br.height / 2 - th / 2; }
        x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
        y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
        tooltip.style.bottom = "auto";
        tooltip.style.right = "auto";
        tooltip.style.width = tw + "px";
      }
    };

    b.onmouseenter = showTip;
    b.onfocus = showTip;
    b.onmouseleave = () => !isMobileLayout() && $("abilityTooltip")?.classList.add("hidden");
    b.ontouchstart = (ev) => { if(isMobileLayout()) { ev.preventDefault(); showTip(); } };

    b.onclick = () => {
      if(isMobileLayout()){
        if(mobilePreviewAbilityId !== a.id){
          mobilePreviewAbilityId = a.id;
          document.querySelectorAll(".wheelBtn").forEach(x=>x.classList.remove("previewed"));
          b.classList.add("previewed");
          showTip();
          return;
        }
      }
      pendingAbility = a;
      radial.classList.add("hidden");
      $("abilityTooltip")?.classList.add("hidden");
      renderBattle();
      if(!targets(u,pendingAbility).length) plan(null);
    };

    if(isMobileLayout() && a.id === mobilePreviewAbilityId) b.classList.add("previewed");
  });
}

function chooseEnemy(){
  state.plans = (state.plans || []).filter(p=>p.side!=="enemy");
  let ap=3;
  const enemies=alive("enemy");
  let safety=0;
  while(ap>0 && safety++<10){
    const choices=[];
    for(const e of enemies){
      for(const a of e.abilities){
        if(a.cost<=ap){
          const ts=targets(e,a);
          if(ts.length) ts.forEach(t=>choices.push({e,a,t}));
          else choices.push({e,a,t:null});
        }
      }
    }
    if(!choices.length) break;
    const pick=choices[Math.floor(Math.random()*choices.length)];
    state.plans.push(makePlan(pick.e,pick.a,pick.t,"enemy"));
    ap-=pick.a.cost;
  }
  state.enemyRevealed = true;
  log("Enemy actions revealed.");
  show("Enemy actions revealed");
}

function resolveRound(){
  if(state.phase!=="planning")return;
  chooseEnemy();
  state.phase="resolving";
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  let acts=plannedActionsForStrip(true);
  renderBattle();
  let i=0;

  function step(){
    if(i>=acts.length)return endRound();
    let act=acts[i++];
    if(!act.unit || act.unit.dead){
      state.canceledActionKeys.push(act.key);
      return step();
    }

    state.currentActionKey=act.key;
    lastAction = {actorId:act.unit.id, targetId:act.target?.id, kind:actionKind(act.ability)};
    showActionToast(act.unit, act.ability, act.target);
    log(`${act.unit.name} resolves ${act.ability.name}.`);
    if(act.target) spawnLine(act.unit, act.target, actionKind(act.ability));
    renderBattle();

    setTimeout(()=>{
      const beforeDead = act.unit.dead;
      apply(act.unit,act.ability,act.target);
      state.resolvedActionKeys.push(act.key);
      renderBattle();
      if(checkWin())return;
      setTimeout(step,720);
    }, 360);
  }
  step();
}

function addStatus(t,s,n=1){
  if(!t||t.dead)return;

  if(s==="hypnosis" || s==="exposed" || s==="exhausted" || s==="frozen"){
    t.status[s]=1;
    spawnStatusPop(t,s,"");
    log(`${t.name} gains ${s}.`);
    return;
  }

  t.status[s]=(t.status[s]||0)+n;
  spawnStatusPop(t,s,n);
  log(`${t.name} gains ${n} ${s}.`);

  if(s==="freeze" && (t.status.freeze||0)>=5){
    t.status.freeze=0;
    t.status.frozen=1;
    spawnStatusPop(t,"frozen","");
    log(`${t.name} reaches 5 Freeze and becomes Frozen. Its next non-Guard action will be canceled.`);
  }
}

function addShield(u, n){
  if(!u || u.dead || !n) return;
  u.shield = (u.shield || 0) + n;
  spawnFloatingText(u, `+${n} Shield`, "shield");
  log(`${u.name} gains ${n} Shield. ${STATUS_RULES_V16.shield}`);
}

function addArmorThisRound(u, n){
  if(!u || u.dead || !n) return;
  u.bonusArmor = (u.bonusArmor || 0) + n;
  spawnFloatingText(u, `+${n} Armor`, "armor");
  log(`${u.name} gains +${n} Armor until end of round.`);
}

function damage(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead)return;

  if(opt.attack){
    let pr=state.predicts.find(p=>p.target===src);
    if(pr){
      addStatus(src,pr.status,pr.stacks||1);
      state.canceledActionKeys?.push(state.currentActionKey);
      log(`${pr.caster.name} predicted and canceled ${src.name}.`);
      spawnFloatingText(src, "Canceled", "cancel");
      return;
    }
  }

  t=redirect(t,src);

  if(state.dodges.includes(t.id)){
    state.dodges=state.dodges.filter(x=>x!==t.id);
    log(`${t.name} dodges the attack.`);
    spawnFloatingText(t, "Dodge", "cancel");
    return;
  }

  let ctr=state.counters.find(x=>x.caster===t);
  if(ctr){
    addShield(t, ctr.shield||0);
    addStatus(src,ctr.status,ctr.stacks||1);
  }

  let raw=amt;
  if(src.id==="kahro" && hasDebuff(t)) raw++;
  if(src.id==="maoja" && t.status.poison) raw++;
  if(src.id==="smithen" && t.status.freeze) raw+=2;
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) raw+=2;

  if(t.status.exposed){
    raw += 2;
    t.status.exposed=0;
    spawnFloatingText(t, "Exposed +2", "status");
    log(`${t.name}'s Exposed adds +2 damage and is removed.`);
  }

  let bleedBurst = 0;
  if(opt.attack && (t.status.bleed||0)>0){
    bleedBurst = t.status.bleed;
    t.status.bleed = 0;
    raw += bleedBurst;
    spawnFloatingText(t, `Bleed +${bleedBurst}`, "bleed");
    log(`${t.name}'s Bleed bursts for +${bleedBurst} damage and is removed.`);
  }

  const armor = getArmor(t);
  let afterArmor = Math.max(0, raw - armor);
  let shieldBlocked = Math.min(t.shield||0, afterArmor);
  t.shield = Math.max(0, (t.shield||0) - shieldBlocked);
  let finalDamage = afterArmor - shieldBlocked;

  if(armor>0) spawnFloatingText(t, `Armor -${Math.min(raw,armor)}`, "armor");
  if(shieldBlocked>0) spawnFloatingText(t, `Shield -${shieldBlocked}`, "shield");
  if(finalDamage>0) spawnFloatingText(t, `-${finalDamage} HP`, "hp");

  log(`${src.name}'s hit: ${raw} damage → ${armor} Armor → ${afterArmor} after Armor → ${shieldBlocked} blocked by Shield → ${finalDamage} HP damage.`);

  if(finalDamage>0){
    t.hp-=finalDamage;
    markRumble(t);
    state.attacked[t.id]=true;

    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    if(t.id==="poom"&&opt.melee) addStatus(src,"hypnosis",1);
    if(t.id==="kku"&&opt.melee) addStatus(src,"freeze",1);
    if(src.id==="eva"&&bleedBurst>0) heal(src,1);

    if(t.hp<=0){t.hp=0;t.dead=true;log(`${t.name} is defeated.`);spawnFloatingText(t,"Defeated","cancel")}
  } else {
    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    spawnFloatingText(t, "No HP loss", "armor");
    log(`${t.name} loses no HP from the hit.`);
  }
}

function loseHpDirect(u, n, reason="life loss"){
  if(!u || u.dead || n<=0) return;
  u.hp -= n;
  spawnFloatingText(u, `-${n} HP`, "hp");
  markRumble(u);
  state.attacked[u.id] = true;
  log(`${u.name} loses ${n} HP from ${reason}.`);
  if(u.hp<=0){u.hp=0;u.dead=true;log(`${u.name} is defeated.`);spawnFloatingText(u,"Defeated","cancel")}
}

function endRound(){
  state.units.forEach(u=>{
    u.planned=null;
    u.shield=0;
    u.bonusArmor=0;
    if(u.buff.poisonHands){u.buff.poisonHands--;if(u.buff.poisonHands<=0)delete u.buff.poisonHands}
    let p=u.status.poison||0;
    if(p&&!u.dead){
      let d=Math.ceil(p/2);
      u.hp-=d;
      spawnFloatingText(u, `Poison -${d}`, "poison");
      markRumble(u);
      u.status.poison-=d;
      log(`${u.name} takes ${d} Poison damage. Poison ignores Armor and Shield.`);
      if(u.hp<=0){u.dead=true;u.hp=0;log(`${u.name} is defeated by Poison.`);spawnFloatingText(u,"Defeated","cancel")}
    }
  });
  if(checkWin())return;
  state.currentActionKey=null;
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  state.plans=[];
  state.round++;
  state.phase="planning";
  state.actionsLeft=3;
  state.protects=[];
  state.dodges=[];
  state.predicts=[];
  state.counters=[];
  state.guarded={};
  state.attacked={};
  selectedId=null;
  pendingAbility=null;
  renderBattle();
}


/* ===== v22 ability/passive wiring audit fixes =====
   This override intentionally replaces the final combat functions from earlier versions.
*/

function syncPassivesV22(){
  const byId = id => ROSTER.find(c=>c.id===id);
  const hy = byId("hyafrost");
  if(hy) hy.passive = "Passive — Deep Winter: whenever Hyafrost applies Freeze with one of his abilities, Hyafrost gains 1 Shield. Shield expires at end of round.";
  const pal = byId("paleya");
  if(pal) pal.passive = "Passive — Mind Weaver: the first time each round Paleya consumes Hypnosis with Mind Break, gain +1 Action next round.";
  const ya = byId("yaura");
  if(ya) ya.passive = "Passive — Blood Echo: the first time each round one of your own abilities makes an ally lose HP, apply 1 Bleed to each enemy in the front row.";
}
syncPassivesV22();

function startBattle(){
  let player=selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));
  let enemies;
  if(mode==="boss"){
    enemies=[structuredClone({...BOSS,side:"enemy",row:"boss",col:0,size:"boss",maxHp:BOSS.hp,shield:0,status:{},buff:{},planned:null,dead:false})];
  }else{
    let ids=ENEMY_PRESETS.find(p=>!p.some(id=>chosenIds.includes(id)))||ENEMY_PRESETS[0],
      pos=[["front",0],["front",2],["back",1]];
    enemies=ids.map((id,i)=>cloneChar(id,"enemy",pos[i][0],pos[i][1]));
  }
  state={
    round:1,phase:"planning",
    actions:3,actionsMax:3,actionsLeft:3,nextRoundBonusActions:0,
    units:[...player,...enemies],
    plans:[], planSeq:0,
    protects:[],dodges:[],predicts:[],counters:[],
    guarded:{},attacked:{},currentActionKey:null,
    resolvedActionKeys:[],canceledActionKeys:[],
    bloodEchoUsed:false,paleyaWeaved:false
  };
  logLines=["Battle started. Plan hidden actions, then resolve."];
  $("builder").classList.add("hidden");
  $("battle").classList.remove("hidden");
  renderBattle();
}

function renderBattle(){
  if(!state)return;
  $("enemyName").textContent=mode==="boss"?"World Toad":"Enemy Squad";
  $("phaseText").textContent=state.phase==="planning"?"Plan":"Resolve";
  $("roundText").textContent=state.round;
  $("actionsText").textContent=`${state.actionsLeft}/${state.actionsMax || 3}`;
  $("resolveBtn").disabled=state.phase!=="planning"||!(state.plans||[]).some(p=>p.side==="player");
  renderBoard("enemyBoard","enemy");
  renderBoard("playerBoard","player");
  renderInfo();
  $("log").innerHTML=logLines.map(x=>`<div class="logItem">${x}</div>`).join("");
  renderQueueStrip();
}

function addStatus(t,s,n=1){
  if(!t||t.dead)return;

  if(s==="hypnosis" || s==="exposed" || s==="exhausted" || s==="frozen"){
    t.status[s]=1;
    spawnStatusPop?.(t,s,"");
    log(`${t.name} gains ${s}.`);
    return;
  }

  t.status[s]=(t.status[s]||0)+n;
  spawnStatusPop?.(t,s,n);
  log(`${t.name} gains ${n} ${s}.`);

  if(s==="freeze" && (t.status.freeze||0)>=5){
    t.status.freeze=0;
    t.status.frozen=1;
    spawnStatusPop?.(t,"frozen","");
    log(`${t.name} reaches 5 Freeze and becomes Frozen. Its next non-Guard action will be canceled.`);
  }
}

function bahlInfection(source, status){
  if(!source || source.id!=="shaman") return;
  if(status!=="poison" && status!=="bleed") return;
  const otherStatus = status==="poison" ? "bleed" : "poison";
  rowUnits(other(source.side),"front").forEach(enemy=>{
    if(!enemy.dead) {
      addStatus(enemy, otherStatus, 1);
      log(`Bahl's Demon Infection spreads 1 ${otherStatus} to ${enemy.name}.`);
    }
  });
}

function applyStatusFrom(source, target, status, stacks=1){
  addStatus(target,status,stacks);
  bahlInfection(source,status);
  if(source?.id==="hyafrost" && status==="freeze") {
    addShield(source,1);
    log(`Hyafrost's Deep Winter triggers.`);
  }
}

function triggerBloodEcho(caster, damagedAlly){
  if(!caster || !damagedAlly || damagedAlly.side !== caster.side) return;
  if(state.bloodEchoUsed) return;
  const yaura = alive(caster.side).find(u=>u.id==="yaura");
  if(!yaura) return;
  state.bloodEchoUsed = true;
  rowUnits(other(caster.side),"front").forEach(enemy=>applyStatusFrom(yaura, enemy, "bleed", 1));
  log(`Yaura's Blood Echo triggers because ${damagedAlly.name} lost HP from your own ability.`);
}

function lifeFromCaster(caster, target, n){
  const before = target?.hp || 0;
  loseHpDirect(target,n,"self-damage or direct life loss");
  if(target && before > target.hp) triggerBloodEcho(caster,target);
}

function redirect(target,source){
  const p=state.protects.find(p=>p.target===target && !p.used && p.guard && !p.guard.dead);
  if(!p) return target;

  p.used = true;

  if(p.ward){
    log(`${p.guard.name}'s Ward triggers for ${target.name}.`);
    addShield(p.guard, p.shield || 5);
    addStatus(source,"bleed",1);
    return p.guard;
  }

  log(`${p.guard.name} protects ${target.name}.`);
  if(p.hypno)addStatus(source,"hypnosis",1);
  return p.guard;
}

function damage(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead)return;

  if(opt.attack){
    let idx=state.predicts.findIndex(p=>p.target===src);
    if(idx>=0){
      const pr = state.predicts[idx];
      state.predicts.splice(idx,1);
      addStatus(src,pr.status,pr.stacks||1);
      state.canceledActionKeys?.push(state.currentActionKey);
      log(`${pr.caster.name} predicted and canceled ${src.name}.`);
      spawnFloatingText?.(src, "Canceled", "cancel");
      return;
    }
  }

  t=redirect(t,src);

  if(state.dodges.includes(t.id)){
    state.dodges=state.dodges.filter(x=>x!==t.id);
    log(`${t.name} dodges the attack.`);
    spawnFloatingText?.(t, "Dodge", "cancel");
    return;
  }

  let ctrIdx=state.counters.findIndex(x=>x.caster===t);
  if(ctrIdx>=0){
    const ctr = state.counters[ctrIdx];
    state.counters.splice(ctrIdx,1);
    addShield(t, ctr.shield||0);
    addStatus(src,ctr.status,ctr.stacks||1);
  }

  let raw=amt;

  if(src.id==="kahro" && hasDebuff(t)) raw++;
  if(src.id==="maoja" && t.status.poison) raw++;
  if(src.id==="smithen" && t.status.freeze) raw+=2;
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) raw+=2;

  if(t.status.exposed){
    raw += 2;
    t.status.exposed=0;
    spawnFloatingText?.(t, "Exposed +2", "status");
    log(`${t.name}'s Exposed adds +2 damage and is removed.`);
  }

  let bleedBurst = 0;
  if(opt.attack && (t.status.bleed||0)>0){
    bleedBurst = t.status.bleed;
    t.status.bleed = 0;
    raw += bleedBurst;
    spawnFloatingText?.(t, `Bleed +${bleedBurst}`, "bleed");
    log(`${t.name}'s Bleed bursts for +${bleedBurst} damage and is removed.`);
  }

  const armor = getArmor(t);
  let afterArmor = Math.max(0, raw - armor);
  let shieldBlocked = Math.min(t.shield||0, afterArmor);
  t.shield = Math.max(0, (t.shield||0) - shieldBlocked);
  let finalDamage = afterArmor - shieldBlocked;

  if(armor>0) spawnFloatingText?.(t, `Armor -${Math.min(raw,armor)}`, "armor");
  if(shieldBlocked>0) spawnFloatingText?.(t, `Shield -${shieldBlocked}`, "shield");
  if(finalDamage>0) spawnFloatingText?.(t, `-${finalDamage} HP`, "hp");

  log(`${src.name}'s hit: ${raw} damage → ${armor} Armor → ${afterArmor} after Armor → ${shieldBlocked} blocked by Shield → ${finalDamage} HP damage.`);

  const connected = opt.attack;
  if(connected){
    if(src.buff.poisonHands) applyStatusFrom(src,t,"poison",2);
    if(t.id==="poom"&&opt.melee) addStatus(src,"hypnosis",1);
    if(t.id==="kku"&&opt.melee) addStatus(src,"freeze",1);
  }

  if(finalDamage>0){
    t.hp-=finalDamage;
    markRumble(t);
    state.attacked[t.id]=true;

    if(src.id==="eva" && (bleedBurst>0 || opt.targetHadBleed)) heal(src,1);

    if(t.hp<=0){
      t.hp=0;t.dead=true;
      log(`${t.name} is defeated.`);
      spawnFloatingText?.(t,"Defeated","cancel");
    }
  } else {
    spawnFloatingText?.(t, "No HP loss", "armor");
    log(`${t.name} loses no HP from the hit.`);
  }
}

function apply(c,a,t){
  if(c.status.frozen && !a.guard){
    c.status.frozen=0;
    state.canceledActionKeys?.push(state.currentActionKey);
    spawnFloatingText?.(c, "Frozen: canceled", "cancel");
    log(`${c.name} is Frozen. ${c.name}'s non-Guard action is canceled, then Frozen is removed.`);
    return;
  }

  const removeExhaustedAfter = !!(c.status.exhausted && !a.guard);

  switch(a.effect){
    case"protect":
      state.protects.push({guard:c,target:t,hypno:a.hypno,used:false});
      state.guarded[c.id]=true;
      break;
    case"ward":
      state.protects.push({guard:t,target:t,ward:true,shield:a.shield||5,used:false});
      state.guarded[c.id]=true;
      break;
    case"dodge":
      state.dodges.push(c.id);
      state.guarded[c.id]=true;
      break;
    case"predict":
      state.predicts.push({caster:c,target:t,status:"hypnosis"});
      state.guarded[c.id]=true;
      break;
    case"predictPoison":
      state.predicts.push({caster:c,target:t,status:"poison",stacks:2});
      state.guarded[c.id]=true;
      break;
    case"selfCounter":
      state.counters.push({caster:c,status:a.status,stacks:a.stacks,shield:a.shield});
      state.guarded[c.id]=true;
      break;
    case"damage":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      break;
    case"armorStrike":
      damage(c,t,getArmor(c),{attack:true,melee:true});
      break;
    case"damageStatus":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      if(!t.dead) applyStatusFrom(c,t,a.status,a.stacks);
      break;
    case"multi":
      for(let i=0;i<a.hits;i++) if(!t.dead) damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      break;
    case"drain":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      heal(c,a.heal);
      break;
    case"consumeBleed":{
      let b=t.status.bleed||0;
      t.status.bleed=0;
      damage(c,t,b+a.bonus,{attack:true});
      heal(c,a.heal||0);
      if(c.id==="dravain") addShield(c,3);
      break;
    }
    case"status":
      applyStatusFrom(c,t,a.status,a.stacks);
      break;
    case"multiStatus":
      a.statuses.forEach(([s,n])=>applyStatusFrom(c,t,s,n));
      break;
    case"rowStatus":
      rowUnits(other(c.side),a.row||t?.row||"front").forEach(x=>applyStatusFrom(c,x,a.status,a.stacks));
      break;
    case"rowDamageStatus":
      rowUnits(other(c.side),t?.row||"front").forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        if(!x.dead) applyStatusFrom(c,x,a.status,a.stacks);
      });
      break;
    case"allStatus":
      alive(other(c.side)).forEach(x=>applyStatusFrom(c,x,a.status,a.stacks));
      break;
    case"allDamageStatus":
      alive(other(c.side)).forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        if(!x.dead) applyStatusFrom(c,x,a.status,a.stacks);
      });
      break;
    case"frontHypno":
      rowUnits(other(c.side),"front").forEach(x=>{
        addStatus(x,"hypnosis",1);
        addStatus(x,"exposed",1);
      });
      break;
    case"poisonHands":
      t.buff.poisonHands=2;
      log(`${t.name}'s damaging hits apply 2 Poison until the end of next round.`);
      break;
    case"toxicGrip": {
      const hadPoison = !!(t.status.poison);
      damage(c,t,3,{attack:true,melee:true});
      if(!t.dead) {
        applyStatusFrom(c,t,"poison",2);
        if(hadPoison) addStatus(t,"exhausted",1);
      }
      break;
    }
    case"poisonBurst":{
      let p=t.status.poison||0;
      t.status.poison=0;
      damage(c,t,p*2,{attack:true});
      break;
    }
    case"shatter":{
      const hadFreeze = !!(t.status.freeze);
      damage(c,t,4+(hadFreeze?5:0),{attack:true});
      t.status.freeze=0;
      break;
    }
    case"whiteout":
      t.status.freeze?addStatus(t,"exposed",1):applyStatusFrom(c,t,"freeze",1);
      break;
    case"glacier":
      damage(c,t,(t.status.freeze?10:5),{attack:true,melee:true});
      break;
    case"assassinate":
      damage(c,t,5+(t.row==="back"&&!state.protects.some(p=>p.target===t && !p.used)?4:0),{attack:true});
      break;
    case"punishGuard":
      damage(c,t,state.guarded[t.id]?8:2,{attack:true});
      break;
    case"mindBreak":{
      const hadHypnosis = !!t.status.hypnosis;
      if(hadHypnosis){
        t.status.hypnosis=0;
        damage(c,t,7,{attack:true});
        if(c.id==="paleya" && !state.paleyaWeaved){
          state.paleyaWeaved = true;
          state.nextRoundBonusActions = (state.nextRoundBonusActions||0)+1;
          log(`Paleya's Mind Weaver triggers: +1 Action next round.`);
        }
      } else {
        damage(c,t,2,{attack:true});
      }
      break;
    }
    case"bloodDash":{
      const hadBleed = !!t.status.bleed;
      damage(c,t,2,{attack:true,targetHadBleed:hadBleed});
      if(hadBleed && !t.dead) addStatus(t,"exposed",1);
      break;
    }
    case"allyPain":
      lifeFromCaster(c,t,a.self);
      rowUnits(other(c.side),"front").forEach(x=>damage(c,x,a.dmg,{attack:true,aoe:true}));
      break;
    case"allyBleed":
      lifeFromCaster(c,t,a.self);
      rowUnits(other(c.side),"front").forEach(x=>applyStatusFrom(c,x,"bleed",a.stacks));
      break;
    case"revenge":
      lifeFromCaster(c,c,a.self);
      damage(c,t,a.dmg+(state.attacked[c.id]?3:0),{attack:true,melee:true});
      break;
    case"absoluteZero":
      alive(other(c.side)).filter(x=>x.status.freeze).forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        if(!x.dead) addStatus(x,"exhausted",1);
      });
      break;
    case"spirit":
      addShield(c,5);
      state.dodges.push(c.id);
      state.guarded[c.id]=true;
      break;
    case"armorBuff":
      addArmorThisRound(t,a.armor||2);
      addShield(t,a.shield||3);
      break;
    case"proliferate":
      ["poison","bleed","freeze"].forEach(s=>{
        if(t.status[s]>0){
          t.status[s]*=2;
          spawnStatusPop?.(t,s,t.status[s]);
          log(`${t.name}'s ${s} is doubled to ${t.status[s]}.`);
        }
      });
      if(t.status.hypnosis) addStatus(t,"exposed",1);
      if((t.status.freeze||0)>=5){t.status.freeze=0;t.status.frozen=1;log(`${t.name} reaches 5 Freeze and becomes Frozen.`)}
      break;
    case"mindToxin":
      damage(c,t,(t.status.poison&&t.status.hypnosis)?5:3,{attack:true});
      if(t.status.hypnosis && !t.dead) applyStatusFrom(c,t,"poison",3);
      break;
    case"rowMultiStatus":
      rowUnits(other(c.side),t?.row||"front").forEach(x=>a.statuses.forEach(([s,n])=>applyStatusFrom(c,x,s,n)));
      break;
  }

  if(removeExhaustedAfter){
    c.status.exhausted=0;
    log(`${c.name}'s Exhausted is removed after resolving a non-Guard action.`);
  }
}

function endRound(){
  state.units.forEach(u=>{
    u.planned=null;
    u.shield=0;
    u.bonusArmor=0;
    if(u.buff.poisonHands){u.buff.poisonHands--;if(u.buff.poisonHands<=0)delete u.buff.poisonHands}
    let p=u.status.poison||0;
    if(p&&!u.dead){
      let d=Math.ceil(p/2);
      u.hp-=d;
      spawnFloatingText?.(u, `Poison -${d}`, "poison");
      markRumble(u);
      u.status.poison-=d;
      log(`${u.name} takes ${d} Poison damage. Poison ignores Armor and Shield.`);
      if(u.hp<=0){u.dead=true;u.hp=0;log(`${u.name} is defeated by Poison.`);spawnFloatingText?.(u,"Defeated","cancel")}
    }
  });
  if(checkWin())return;
  state.currentActionKey=null;
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  state.plans=[];
  state.round++;
  state.phase="planning";
  const bonus = state.nextRoundBonusActions || 0;
  state.actionsMax = 3 + bonus;
  state.actionsLeft = state.actionsMax;
  state.nextRoundBonusActions = 0;
  state.protects=[];
  state.dodges=[];
  state.predicts=[];
  state.counters=[];
  state.guarded={};
  state.attacked={};
  state.bloodEchoUsed=false;
  state.paleyaWeaved=false;
  selectedId=null;
  pendingAbility=null;
  renderBattle();
}


/* ===== v23 readability/feedback pass =====
   Slower resolution, real spotlighting, larger mobile status chips,
   enemy passive inspection, and passive-trigger ripple feedback.
*/

function markPassive(u, label="Passive"){
  if(!u) return;
  u.passiveUntil = Date.now() + 900;
  spawnFloatingText?.(u, label, "status");
}

function isCurrentTarget(u){
  return !!(lastAction && lastAction.targetId === u.id && state?.phase === "resolving");
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").textContent=u?`${u.name} — ${u.class} / ${u.prof}`:"Plan hidden actions";
  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;

  if(u){
    const enemyNote = u.side === "enemy"
      ? `<div class="statusInfoBox"><b>Enemy intel:</b> Passive is visible. Active abilities are hidden until they are revealed in the queue.</div>`
      : "";
    const abilitiesHtml = u.side === "enemy"
      ? ""
      : u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}</div>`).join("");

    $("infoBody").innerHTML =
      `<b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${getArmor(u)} · ⚡${u.speed}<br>
       <b>Passive:</b> ${u.passive}
       ${enemyNote}
       ${abilitiesHtml}`;
  } else {
    $("infoBody").innerHTML = `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
  }

  if(pendingAbility && selectedId) previewTargeting(unit(selectedId), pendingAbility);
}

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId)t.classList.add("selected");
  if(isCurrentActor(u))t.classList.add("currentActor");
  if(isCurrentTarget(u))t.classList.add("currentTarget");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(u.passiveUntil && u.passiveUntil > Date.now())t.classList.add("passivePulse");
  if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))t.classList.add("targetable");
  t.innerHTML=`<div class="art" style="background:${u.art}"></div><div class="badge">${CLASS[u.class]?.icon||"🐸"}</div><div class="chips">${statusText(u)}</div><div class="armor">🛡️ ${getArmor(u)}</div><div class="hp">❤️ ${u.hp}</div><div class="name">${u.name}</div>`;

  t.onclick=(ev)=>{
    const statusBtn = ev.target.closest(".statusChip");
    if(statusBtn){
      ev.stopPropagation();
      showStatusInfo(statusBtn.dataset.status);
      return;
    }

    if(u.dead) return;

    // Enemy click: inspect stats/passive only. Active abilities stay hidden.
    if(u.side==="enemy"){
      selectedId=u.id;
      pendingAbility=null;
      renderBattle();
      if(isMobileLayout()) openMobilePanel("info");
      return;
    }

    if(state.phase!=="planning")return;
    if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))return plan(u);
    if(u.side==="player"){
      selectedId=u.id;
      pendingAbility=null;
      renderBattle();
      openWheel(u);
    }
  };
  return t;
}

function applyStatusFrom(source, target, status, stacks=1){
  addStatus(target,status,stacks);
  bahlInfection(source,status);
  if(source?.id==="hyafrost" && status==="freeze") {
    addShield(source,1);
    markPassive(source, "Deep Winter");
    log(`Hyafrost's Deep Winter triggers.`);
  }
}

function bahlInfection(source, status){
  if(!source || source.id!=="shaman") return;
  if(status!=="poison" && status!=="bleed") return;
  const otherStatus = status==="poison" ? "bleed" : "poison";
  markPassive(source, "Demon Infection");
  rowUnits(other(source.side),"front").forEach(enemy=>{
    if(!enemy.dead) {
      addStatus(enemy, otherStatus, 1);
      log(`Bahl's Demon Infection spreads 1 ${otherStatus} to ${enemy.name}.`);
    }
  });
}

function triggerBloodEcho(caster, damagedAlly){
  if(!caster || !damagedAlly || damagedAlly.side !== caster.side) return;
  if(state.bloodEchoUsed) return;
  const yaura = alive(caster.side).find(u=>u.id==="yaura");
  if(!yaura) return;
  state.bloodEchoUsed = true;
  markPassive(yaura, "Blood Echo");
  rowUnits(other(caster.side),"front").forEach(enemy=>applyStatusFrom(yaura, enemy, "bleed", 1));
  log(`Yaura's Blood Echo triggers because ${damagedAlly.name} lost HP from your own ability.`);
}

function damage(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead)return;

  if(opt.attack){
    let idx=state.predicts.findIndex(p=>p.target===src);
    if(idx>=0){
      const pr = state.predicts[idx];
      state.predicts.splice(idx,1);
      addStatus(src,pr.status,pr.stacks||1);
      state.canceledActionKeys?.push(state.currentActionKey);
      markPassive(pr.caster, "Prediction");
      log(`${pr.caster.name} predicted and canceled ${src.name}.`);
      spawnFloatingText?.(src, "Canceled", "cancel");
      return;
    }
  }

  t=redirect(t,src);

  if(state.dodges.includes(t.id)){
    state.dodges=state.dodges.filter(x=>x!==t.id);
    markPassive(t, "Dodge");
    log(`${t.name} dodges the attack.`);
    spawnFloatingText?.(t, "Dodge", "cancel");
    return;
  }

  let ctrIdx=state.counters.findIndex(x=>x.caster===t);
  if(ctrIdx>=0){
    const ctr = state.counters[ctrIdx];
    state.counters.splice(ctrIdx,1);
    markPassive(t, "Counter Guard");
    addShield(t, ctr.shield||0);
    addStatus(src,ctr.status,ctr.stacks||1);
  }

  let raw=amt;

  if(src.id==="kahro" && hasDebuff(t)) { raw++; markPassive(src, "Opportunist"); }
  if(src.id==="maoja" && t.status.poison) { raw++; markPassive(src, "Toxic Momentum"); }
  if(src.id==="smithen" && t.status.freeze) { raw+=2; markPassive(src, "Frost Edge"); }
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) { raw+=2; markPassive(src, "Nightmare Brew"); }

  if(t.status.exposed){
    raw += 2;
    t.status.exposed=0;
    spawnFloatingText?.(t, "Exposed +2", "status");
    log(`${t.name}'s Exposed adds +2 damage and is removed.`);
  }

  let bleedBurst = 0;
  if(opt.attack && (t.status.bleed||0)>0){
    bleedBurst = t.status.bleed;
    t.status.bleed = 0;
    spawnFloatingText?.(t, `Bleed +${bleedBurst}`, "bleed");
    spawnStatusPop?.(t,"bleed","");
    raw += bleedBurst;
    log(`${t.name}'s Bleed bursts for +${bleedBurst} damage and is removed.`);
  }

  const armor = getArmor(t);
  let afterArmor = Math.max(0, raw - armor);
  let shieldBlocked = Math.min(t.shield||0, afterArmor);
  t.shield = Math.max(0, (t.shield||0) - shieldBlocked);
  let finalDamage = afterArmor - shieldBlocked;

  if(armor>0) spawnFloatingText?.(t, `Armor -${Math.min(raw,armor)}`, "armor");
  if(shieldBlocked>0) spawnFloatingText?.(t, `Shield -${shieldBlocked}`, "shield");
  if(finalDamage>0) spawnFloatingText?.(t, `-${finalDamage} HP`, "hp");

  log(`${src.name}'s hit: ${raw} damage → ${armor} Armor → ${afterArmor} after Armor → ${shieldBlocked} blocked by Shield → ${finalDamage} HP damage.`);

  const connected = opt.attack;
  if(connected){
    if(src.buff.poisonHands) {
      markPassive(src, "Poison Hands");
      applyStatusFrom(src,t,"poison",2);
    }
    if(t.id==="poom"&&opt.melee) { markPassive(t, "Mirror Mind"); addStatus(src,"hypnosis",1); }
    if(t.id==="kku"&&opt.melee) { markPassive(t, "Cold Hide"); addStatus(src,"freeze",1); }
  }

  if(finalDamage>0){
    t.hp-=finalDamage;
    markRumble(t);
    state.attacked[t.id]=true;

    if(src.id==="eva" && (bleedBurst>0 || opt.targetHadBleed)) {
      markPassive(src, "Crimson Hunger");
      heal(src,1);
    }

    if(t.hp<=0){
      t.hp=0;t.dead=true;
      log(`${t.name} is defeated.`);
      spawnFloatingText?.(t,"Defeated","cancel");
    }
  } else {
    spawnFloatingText?.(t, "No HP loss", "armor");
    log(`${t.name} loses no HP from the hit.`);
  }
}

function apply(c,a,t){
  if(c.status.frozen && !a.guard){
    c.status.frozen=0;
    state.canceledActionKeys?.push(state.currentActionKey);
    spawnFloatingText?.(c, "Frozen: canceled", "cancel");
    spawnStatusPop?.(c,"frozen","");
    log(`${c.name} is Frozen. ${c.name}'s non-Guard action is canceled, then Frozen is removed.`);
    return;
  }

  const removeExhaustedAfter = !!(c.status.exhausted && !a.guard);

  switch(a.effect){
    case"protect":
      state.protects.push({guard:c,target:t,hypno:a.hypno,used:false});
      state.guarded[c.id]=true;
      break;
    case"ward":
      state.protects.push({guard:t,target:t,ward:true,shield:a.shield||5,used:false});
      state.guarded[c.id]=true;
      break;
    case"dodge":
      state.dodges.push(c.id);
      state.guarded[c.id]=true;
      break;
    case"predict":
      state.predicts.push({caster:c,target:t,status:"hypnosis"});
      state.guarded[c.id]=true;
      break;
    case"predictPoison":
      state.predicts.push({caster:c,target:t,status:"poison",stacks:2});
      state.guarded[c.id]=true;
      break;
    case"selfCounter":
      state.counters.push({caster:c,status:a.status,stacks:a.stacks,shield:a.shield});
      state.guarded[c.id]=true;
      break;
    case"damage":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      break;
    case"armorStrike":
      damage(c,t,getArmor(c),{attack:true,melee:true});
      break;
    case"damageStatus":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      if(!t.dead) applyStatusFrom(c,t,a.status,a.stacks);
      break;
    case"multi":
      for(let i=0;i<a.hits;i++) if(!t.dead) damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      break;
    case"drain":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee"});
      heal(c,a.heal);
      break;
    case"consumeBleed":{
      let b=t.status.bleed||0;
      t.status.bleed=0;
      damage(c,t,b+a.bonus,{attack:true});
      heal(c,a.heal||0);
      if(c.id==="dravain") { addShield(c,3); markPassive(c, "Blood Guard"); }
      break;
    }
    case"status":
      applyStatusFrom(c,t,a.status,a.stacks);
      break;
    case"multiStatus":
      a.statuses.forEach(([s,n])=>applyStatusFrom(c,t,s,n));
      break;
    case"rowStatus":
      rowUnits(other(c.side),a.row||t?.row||"front").forEach(x=>applyStatusFrom(c,x,a.status,a.stacks));
      break;
    case"rowDamageStatus":
      rowUnits(other(c.side),t?.row||"front").forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        if(!x.dead) applyStatusFrom(c,x,a.status,a.stacks);
      });
      break;
    case"allStatus":
      alive(other(c.side)).forEach(x=>applyStatusFrom(c,x,a.status,a.stacks));
      break;
    case"allDamageStatus":
      alive(other(c.side)).forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        if(!x.dead) applyStatusFrom(c,x,a.status,a.stacks);
      });
      break;
    case"frontHypno":
      rowUnits(other(c.side),"front").forEach(x=>{
        addStatus(x,"hypnosis",1);
        addStatus(x,"exposed",1);
      });
      break;
    case"poisonHands":
      t.buff.poisonHands=2;
      log(`${t.name}'s damaging hits apply 2 Poison until the end of next round.`);
      break;
    case"toxicGrip": {
      const hadPoison = !!(t.status.poison);
      damage(c,t,3,{attack:true,melee:true});
      if(!t.dead) {
        applyStatusFrom(c,t,"poison",2);
        if(hadPoison) addStatus(t,"exhausted",1);
      }
      break;
    }
    case"poisonBurst":{
      let p=t.status.poison||0;
      t.status.poison=0;
      damage(c,t,p*2,{attack:true});
      break;
    }
    case"shatter":{
      const hadFreeze = !!(t.status.freeze);
      damage(c,t,4+(hadFreeze?5:0),{attack:true});
      t.status.freeze=0;
      break;
    }
    case"whiteout":
      t.status.freeze?addStatus(t,"exposed",1):applyStatusFrom(c,t,"freeze",1);
      break;
    case"glacier":
      damage(c,t,(t.status.freeze?10:5),{attack:true,melee:true});
      break;
    case"assassinate":
      damage(c,t,5+(t.row==="back"&&!state.protects.some(p=>p.target===t && !p.used)?4:0),{attack:true});
      break;
    case"punishGuard":
      damage(c,t,state.guarded[t.id]?8:2,{attack:true});
      break;
    case"mindBreak":{
      const hadHypnosis = !!t.status.hypnosis;
      if(hadHypnosis){
        t.status.hypnosis=0;
        damage(c,t,7,{attack:true});
        if(c.id==="paleya" && !state.paleyaWeaved){
          state.paleyaWeaved = true;
          state.nextRoundBonusActions = (state.nextRoundBonusActions||0)+1;
          markPassive(c, "Mind Weaver");
          log(`Paleya's Mind Weaver triggers: +1 Action next round.`);
        }
      } else {
        damage(c,t,2,{attack:true});
      }
      break;
    }
    case"bloodDash":{
      const hadBleed = !!t.status.bleed;
      damage(c,t,2,{attack:true,targetHadBleed:hadBleed});
      if(hadBleed && !t.dead) addStatus(t,"exposed",1);
      break;
    }
    case"allyPain":
      lifeFromCaster(c,t,a.self);
      rowUnits(other(c.side),"front").forEach(x=>damage(c,x,a.dmg,{attack:true,aoe:true}));
      break;
    case"allyBleed":
      lifeFromCaster(c,t,a.self);
      rowUnits(other(c.side),"front").forEach(x=>applyStatusFrom(c,x,"bleed",a.stacks));
      break;
    case"revenge":
      lifeFromCaster(c,c,a.self);
      damage(c,t,a.dmg+(state.attacked[c.id]?3:0),{attack:true,melee:true});
      break;
    case"absoluteZero":
      alive(other(c.side)).filter(x=>x.status.freeze).forEach(x=>{
        damage(c,x,a.dmg,{attack:true,aoe:true});
        if(!x.dead) addStatus(x,"exhausted",1);
      });
      break;
    case"spirit":
      addShield(c,5);
      state.dodges.push(c.id);
      state.guarded[c.id]=true;
      break;
    case"armorBuff":
      addArmorThisRound(t,a.armor||2);
      addShield(t,a.shield||3);
      break;
    case"proliferate":
      ["poison","bleed","freeze"].forEach(s=>{
        if(t.status[s]>0){
          t.status[s]*=2;
          spawnStatusPop?.(t,s,t.status[s]);
          log(`${t.name}'s ${s} is doubled to ${t.status[s]}.`);
        }
      });
      if(t.status.hypnosis) addStatus(t,"exposed",1);
      if((t.status.freeze||0)>=5){t.status.freeze=0;t.status.frozen=1;log(`${t.name} reaches 5 Freeze and becomes Frozen.`)}
      break;
    case"mindToxin":
      damage(c,t,(t.status.poison&&t.status.hypnosis)?5:3,{attack:true});
      if(t.status.hypnosis && !t.dead) applyStatusFrom(c,t,"poison",3);
      break;
    case"rowMultiStatus":
      rowUnits(other(c.side),t?.row||"front").forEach(x=>a.statuses.forEach(([s,n])=>applyStatusFrom(c,x,s,n)));
      break;
  }

  if(removeExhaustedAfter){
    c.status.exhausted=0;
    log(`${c.name}'s Exhausted is removed after resolving a non-Guard action.`);
  }
}

function resolveRound(){
  if(state.phase!=="planning")return;
  chooseEnemy();
  state.phase="resolving";
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  let acts=plannedActionsForStrip(true);
  renderBattle();
  let i=0;

  function step(){
    if(i>=acts.length)return endRound();
    let act=acts[i++];
    if(!act.unit || act.unit.dead){
      state.canceledActionKeys.push(act.key);
      return step();
    }

    state.currentActionKey=act.key;
    lastAction = {actorId:act.unit.id, targetId:act.target?.id, kind:actionKind(act.ability)};
    showActionToast(act.unit, act.ability, act.target);
    log(`${act.unit.name} resolves ${act.ability.name}.`);
    if(act.target) spawnLine(act.unit, act.target, actionKind(act.ability));
    renderBattle();

    setTimeout(()=>{
      apply(act.unit,act.ability,act.target);
      if(!state.canceledActionKeys.includes(act.key)) state.resolvedActionKeys.push(act.key);
      renderBattle();
      if(checkWin())return;
      setTimeout(step,1150);
    }, 700);
  }
  step();
}


function renderBattle(){
  if(!state)return;
  $("enemyName").textContent=mode==="boss"?"World Toad":"Enemy Squad";
  $("phaseText").textContent=state.phase==="planning"?"Plan":"Resolve";
  $("roundText").textContent=state.round;
  $("actionsText").textContent=`${state.actionsLeft}/${state.actionsMax || 3}`;
  $("resolveBtn").disabled=state.phase!=="planning"||!(state.plans||[]).some(p=>p.side==="player");
  $("battle").classList.toggle("resolvingBoard", state.phase==="resolving" && !!state.currentActionKey);
  renderBoard("enemyBoard","enemy");
  renderBoard("playerBoard","player");
  renderInfo();
  $("log").innerHTML=logLines.map(x=>`<div class="logItem">${x}</div>`).join("");
  renderQueueStrip();
}


/* ===== v24 large-unit board footprint =====
   Bosses can visually occupy multiple board slots.
   World Toad is a 2x3 unit: it spans the full enemy board.
*/
BOSS.footprint = { rows: 2, cols: 3 };

function isLargeUnit(u){
  return !!(u && (u.size==="boss" || u.footprint));
}

function renderBoard(id,side){
  const b=$(id);
  if(!b || !state) return;

  const boss=state.units.find(u=>u.side===side && isLargeUnit(u));
  b.innerHTML="";
  b.classList.toggle("bossBoard", !!boss);
  b.classList.toggle("largeUnitBoard", !!boss);

  if(boss){
    const bossTile = tile(boss,side);
    bossTile.classList.add("bossTile","largeUnitTile");
    bossTile.style.setProperty("--span-rows", boss.footprint?.rows || 2);
    bossTile.style.setProperty("--span-cols", boss.footprint?.cols || 3);
    bossTile.setAttribute("aria-label", `${boss.name}, large unit occupying ${(boss.footprint?.rows||2)} by ${(boss.footprint?.cols||3)} spaces`);
    b.appendChild(bossTile);
    return;
  }

  let order=side==="enemy"?["back","front"]:["front","back"];
  for(let row of order){
    let div=document.createElement("div");
    div.className="row";
    for(let col=0;col<3;col++){
      div.appendChild(tile(state.units.find(u=>u.side===side&&u.row===row&&u.col===col),side));
    }
    b.appendChild(div);
  }
}


/* ===== v25 boss footprint + info/targeting fix =====
   - Large units now truly fill their board area.
   - Info panel opens only from the ⓘ button, so it does not block targeting.
   - Enemy passives are inspectable through the same info button.
*/

BOSS.footprint = { rows: 2, cols: 3 };

function isLargeUnit(u){
  return !!(u && (u.size==="boss" || u.footprint));
}

function renderBoard(id,side){
  const b=$(id);
  if(!b || !state) return;

  const boss=state.units.find(u=>u.side===side && isLargeUnit(u));
  b.innerHTML="";
  b.classList.toggle("bossBoard", !!boss);
  b.classList.toggle("largeUnitBoard", !!boss);

  if(boss){
    const bossTile = tile(boss,side);
    bossTile.classList.add("bossTile","largeUnitTile");
    bossTile.dataset.footprint = `${boss.footprint?.rows || 2}x${boss.footprint?.cols || 3}`;
    bossTile.setAttribute("aria-label", `${boss.name}, large unit occupying ${(boss.footprint?.rows||2)} by ${(boss.footprint?.cols||3)} spaces`);
    b.appendChild(bossTile);
    return;
  }

  let order=side==="enemy"?["back","front"]:["front","back"];
  for(let row of order){
    let div=document.createElement("div");
    div.className="row";
    for(let col=0;col<3;col++){
      div.appendChild(tile(state.units.find(u=>u.side===side&&u.row===row&&u.col===col),side));
    }
    b.appendChild(div);
  }
}

function showUnitInfo(u){
  if(!u) return;
  selectedId = u.id;
  selectedSide = u.side;
  pendingAbility = null;
  renderBattle();
  if(isMobileLayout()) openMobilePanel("info");
}

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  t.dataset.side=u.side;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId && (!selectedSide || u.side===selectedSide))t.classList.add("selected");
  if(isCurrentActor?.(u))t.classList.add("currentActor");
  if(typeof isCurrentTarget === "function" && isCurrentTarget(u))t.classList.add("currentTarget");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(u.passiveUntil && u.passiveUntil > Date.now())t.classList.add("passivePulse");
  if(pendingAbility&&isTarget(selectedUnit(),pendingAbility,u))t.classList.add("targetable");

  t.innerHTML=`
    <div class="art" style="background:${u.art}"></div>
    <span class="unitInfoBtn" role="button" aria-label="Show ${u.name} info" title="Info">ⓘ</span>
    <div class="badge">${CLASS[u.class]?.icon||"🐸"}</div>
    <div class="chips">${statusText(u)}</div>
    <div class="armor">🛡️ ${getArmor ? getArmor(u) : u.armor}</div>
    <div class="hp">❤️ ${u.hp}</div>
    <div class="name">${u.name}</div>`;

  t.onclick=(ev)=>{
    const infoBtn = ev.target.closest(".unitInfoBtn");
    if(infoBtn){
      ev.stopPropagation();
      showUnitInfo(u);
      return;
    }

    const statusBtn = ev.target.closest(".statusChip");
    if(statusBtn){
      ev.stopPropagation();
      showStatusInfo(statusBtn.dataset.status);
      return;
    }

    if(u.dead) return;

    // Targeting always has priority, including enemies and large bosses.
    if(state.phase==="planning" && pendingAbility && isTarget(selectedUnit(),pendingAbility,u)){
      closeMobilePanel?.();
      return plan(u);
    }

    // Enemy active abilities are hidden; use ⓘ to inspect passive.
    if(u.side==="enemy"){
      return;
    }

    if(state.phase!=="planning")return;

    if(u.side==="player"){
      selectedId=u.id;
      selectedSide=u.side;
      pendingAbility=null;
      closeMobilePanel?.();
      renderBattle();
      openWheel(u);
    }
  };
  return t;
}


/* ===== v26 info close + boss passive fix ===== */

if (typeof BOSS !== "undefined") {
  BOSS.passive = "Passive — Colossal Body: World Toad is a large 2×3 boss unit. It counts as occupying both rows, so melee attacks can target it. Row attacks only hit it once.";
  BOSS.prof = "Boss";
}

function closeInfoPanel(){
  selectedId = null;
  pendingAbility = null;
  closeMobilePanel?.();
  renderBattle();
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").innerHTML = u
    ? `<span>${u.name} — ${u.class} / ${u.prof}</span><button id="closeInfoBtn" class="closeInfoBtn" type="button" aria-label="Close info">×</button>`
    : "Plan hidden actions";

  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;

  if(u){
    const passiveText = u.passive || "No passive ability.";
    const enemyNote = u.side === "enemy"
      ? `<div class="statusInfoBox"><b>Enemy intel:</b> Passive is visible. Active abilities are hidden until they are revealed in the queue.</div>`
      : "";
    const abilitiesHtml = u.side === "enemy"
      ? ""
      : u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}</div>`).join("");

    $("infoBody").innerHTML =
      `<b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${getArmor ? getArmor(u) : u.armor} · ⚡${u.speed}<br>
       <b>Passive:</b> ${passiveText}
       ${enemyNote}
       ${abilitiesHtml}`;
  } else {
    $("infoBody").innerHTML = `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
  }

  const btn = $("closeInfoBtn");
  if(btn) btn.onclick = (ev) => {
    ev.stopPropagation();
    closeInfoPanel();
  };

  if(pendingAbility && selectedId) previewTargeting(selectedUnit(), pendingAbility);
}

function showUnitInfo(u){
  if(!u) return;
  selectedId = u.id;
  selectedSide = u.side;
  pendingAbility = null;
  renderBattle();
  if(isMobileLayout()) openMobilePanel("info");
}


/* ===== v27 stronger passive trigger feedback =====
   The old passive pulse was too subtle and often expired before it was visually obvious.
   This version keeps the pulse longer and adds a visible callout label.
*/
function markPassive(u, label="Passive"){
  if(!u) return;
  u.passiveUntil = Date.now() + 1900;
  u.passiveLabel = label;
  spawnFloatingText?.(u, label, "passive");
}

function artSrcFromStyleValue(v){
  if(!v || typeof v !== "string") return "";
  const m = v.match(/url\((['"]?)(.*?)\1\)/i);
  return m?.[2] || "";
}

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  t.dataset.side=u.side;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId && (!selectedSide || u.side===selectedSide))t.classList.add("selected");
  if(isCurrentActor?.(u))t.classList.add("currentActor");
  if(typeof isCurrentTarget === "function" && isCurrentTarget(u))t.classList.add("currentTarget");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(u.passiveUntil && u.passiveUntil > Date.now())t.classList.add("passivePulse");
  if(pendingAbility&&isTarget(selectedUnit(),pendingAbility,u))t.classList.add("targetable");

  const passiveBadge = (u.passiveUntil && u.passiveUntil > Date.now())
    ? `<div class="passiveCallout">${u.passiveLabel || "Passive"}</div>`
    : "";
  const artSrc = artSrcFromStyleValue(u.art);

  t.innerHTML=`
    <div class="art" style="background:${u.art}">
      ${artSrc ? `<img class="artImg" src="${artSrc}" alt="" loading="eager" decoding="async" onerror="this.style.display='none'">` : ""}
    </div>
    ${passiveBadge}
    <span class="unitInfoBtn" role="button" aria-label="Show ${u.name} info" title="Info">ⓘ</span>
    <div class="badge">${CLASS[u.class]?.icon||"🐸"}</div>
    <div class="chips">${statusText(u)}</div>
    <div class="armor">🛡️ ${getArmor ? getArmor(u) : u.armor}</div>
    <div class="hp">❤️ ${u.hp}</div>
    <div class="name">${u.name}</div>`;

  t.onclick=(ev)=>{
    const infoBtn = ev.target.closest(".unitInfoBtn");
    if(infoBtn){
      ev.stopPropagation();
      showUnitInfo(u);
      return;
    }

    const statusBtn = ev.target.closest(".statusChip");
    if(statusBtn){
      ev.stopPropagation();
      showStatusInfo(statusBtn.dataset.status);
      return;
    }

    if(u.dead) return;

    if(state.phase==="planning" && pendingAbility && isTarget(selectedUnit(),pendingAbility,u)){
      closeMobilePanel?.();
      return plan(u);
    }

    if(u.side==="enemy"){
      return;
    }

    if(state.phase!=="planning")return;

    if(u.side==="player"){
      selectedId=u.id;
      selectedSide=u.side;
      pendingAbility=null;
      closeMobilePanel?.();
      renderBattle();
      openWheel(u);
    }
  };
  return t;
}


/* ===== v30 wording clarity: Damage / Ignore Armor / Lose HP =====
   Standardized rules text:
   - "Deal X damage" = Armor -> Shield -> HP.
   - "Deal X damage ignoring Armor" = Shield -> HP.
   - "Lose X HP" = direct HP loss, ignores Armor and Shield.
*/

const DAMAGE_WORDING_RULES_V30 = {
  normal: "Deal X damage: reduced by Armor first, then Shield, then remaining damage removes HP.",
  ignoreArmor: "Deal X damage ignoring Armor: ignores Armor, but Shield still absorbs it before HP is lost.",
  loseHp: "Lose X HP: direct HP loss. It ignores Armor and Shield."
};

function clarityTextForAbility(a){
  if(!a) return "";
  const desc = a.desc || "";
  const tags = [];
  if(/\bLose \d+ HP\b|loses \d+ HP/i.test(desc)) tags.push("Lose HP ignores Armor and Shield.");
  if(/ignoring Armor/i.test(desc)) tags.push("Ignoring Armor still hits Shield before HP.");
  if(/Pierce/i.test(desc)) tags.push("Pierce reduces the target's effective Armor for this hit.");
  if(/Sunder/i.test(desc)) tags.push("Sunder reduces Armor until end of round.");
  if(/Poison/i.test(desc)) tags.push("Poison end-round damage ignores Armor and Shield.");
  if(/Bleed/i.test(desc)) tags.push("Bleed adds damage to the next hit before Armor/Shield.");
  return tags.length ? `<div class="rulesClarifier">${tags.join(" ")}</div>` : "";
}

function abilityRulesSummary(actor, ability, target){
  if(!ability) return "";
  const targetText = abilityTargetLabel(target);
  const speedText = ability.guard ? "Guard priority" : `Speed ${totalSpeed(actor, ability)}`;
  const typeText = actionKind ? actionKind(ability) : (ability.guard ? "guard" : "action");
  return `
    <div class="actionDetailCard ${typeText}">
      <div class="actionDetailHeader">
        <span class="actionDetailIcon" style="background-image:url('${abilityIconUrl(actor, ability)}')"></span>
        <div>
          <b>${actor.name} uses ${ability.name}</b>
          <small>${actor.side === "enemy" ? "Enemy action revealed" : "Your action"} · ${ability.cost} AP · ${speedText}</small>
        </div>
      </div>
      <div class="actionDetailTarget"><b>Target:</b> ${targetText}</div>
      <div class="actionDetailText">${ability.desc}</div>
      ${clarityTextForAbility(ability)}
    </div>
  `;
}

function setAbilityTooltip(u,a){
  const tooltip = $("abilityTooltip");
  if(!tooltip || !a) return;
  tooltip.innerHTML = `
    <div class="tipTop">
      <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
      <div>
        <b>${a.name}</b>
        <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
      </div>
    </div>
    <p>${a.desc}</p>
    ${clarityTextForAbility(a)}
    <div class="tipTags">
      <span>${abilityIconKey(u,a)}</span>
      <span>${a.range || (a.guard ? "guard" : "self")}</span>
      ${isMobileLayout() ? "<span>tap again to choose</span>" : ""}
    </div>
  `;
  tooltip.classList.remove("hidden");
  if(isMobileLayout()){
    tooltip.style.left = "10px";
    tooltip.style.right = "10px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "10px";
    tooltip.style.width = "calc(100vw - 20px)";
  }
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").innerHTML = u
    ? `<span>${u.name} — ${u.class} / ${u.prof}</span><button id="closeInfoBtn" class="closeInfoBtn" type="button" aria-label="Close info">×</button>`
    : "Plan hidden actions";

  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;

  if(u){
    const passiveText = u.passive || "No passive ability.";
    const enemyNote = u.side === "enemy"
      ? `<div class="statusInfoBox"><b>Enemy intel:</b> Passive is visible. Active abilities are hidden until they are revealed in the queue.</div>`
      : "";
    const abilitiesHtml = u.side === "enemy"
      ? ""
      : u.abilities.map(a=>`<div class="logItem"><b>${a.name}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${a.desc}${clarityTextForAbility(a)}</div>`).join("");

    $("infoBody").innerHTML =
      `<div class="statusInfoBox">
        <b>Damage wording:</b><br>
        <b>Deal damage</b> → Armor, then Shield, then HP.<br>
        <b>Ignoring Armor</b> → Shield, then HP.<br>
        <b>Lose HP</b> → ignores Armor and Shield.
       </div>
       <b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${getArmor ? getArmor(u) : u.armor} · ⚡${u.speed}<br>
       <b>Passive:</b> ${passiveText}
       ${enemyNote}
       ${abilitiesHtml}`;
  } else {
    $("infoBody").innerHTML = `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
  }

  const btn = $("closeInfoBtn");
  if(btn) btn.onclick = (ev) => {
    ev.stopPropagation();
    closeInfoPanel();
  };

  if(pendingAbility && selectedId) previewTargeting(unit(selectedId), pendingAbility);
}

function tuneWordingClarityV30(){
  const byId = id => ROSTER.find(c=>c.id===id);
  const set = (id, patch) => { const c=byId(id); if(c) Object.assign(c, patch); };

  set("yaura", {
    passive:"Passive — Blood Echo: the first time each round one of your own abilities makes an ally lose HP, apply 1 Bleed to each enemy in the front row.",
    abilities:[
      A("ward","Blood Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt, and the attacker gains 1 Bleed.","ward",{guard:true,range:"ally",shield:5}),
      A("bolt","Blood Bolt",1,1,"Ranged attack. Deal 2 damage ignoring Armor, then apply 2 Bleed. Shield still absorbs this damage before HP is lost.","damageStatus",{dmg:2,status:"bleed",stacks:2,range:"ranged",ignoreArmor:true}),
      A("price","Blood Price",1,0,"Bloodcraft magic. Choose an ally. That ally loses 2 HP. This HP loss ignores Armor and Shield. Then each enemy in the front row takes 4 damage ignoring Armor; Shield still absorbs that enemy damage.","allyPain",{range:"ally",dmg:4,self:2,ignoreArmor:true}),
      A("rain","Red Rain",2,-1,"Area status. Apply 2 Bleed to every enemy. This deals no damage, so Armor and Shield do not interact with it.","allStatus",{status:"bleed",stacks:2})
    ]
  });

  set("maoja", {
    passive:"Passive — Toxic Momentum: Maoja's damaging abilities deal +1 damage to targets with any Poison stacks.",
    abilities:[
      A("hands","Poison Hands",1,2,"Ally buff. Choose an ally. Until the end of next round, each of that ally's damaging hits applies 2 Poison to the target. Poison damage later ignores Armor and Shield.","poisonHands",{range:"ally"}),
      A("grip","Corrosive Grip",1,0,"Melee attack. Deal 3 damage, Sunder 1 Armor until end of round, then apply 2 Poison. If the target already had Poison, also apply Exhausted.","toxicGrip",{range:"melee",sunder:1}),
      A("breath","Caustic Breath",2,-1,"Row status. Choose an enemy row. Apply 4 Poison to each enemy in that row. This deals no immediate damage, so Armor and Shield do not reduce it.","rowStatus",{status:"poison",stacks:4,range:"ranged"}),
      A("burst","Rot Burst",2,-3,"Poison payoff. Remove all Poison from one enemy. Deal damage equal to 2 times removed Poison, ignoring Armor. Shield still absorbs this damage before HP is lost.","poisonBurst",{range:"ranged",ignoreArmor:true})
    ]
  });

  set("paleya", {
    passive:"Passive — Mind Weaver: the first time each round Paleya consumes Hypnosis with Mind Break, gain +1 Action next round.",
    abilities:[
      A("lance","Mind Lance",1,1,"Magic attack. Deal 3 damage ignoring Armor. Shield still absorbs this damage. If the target has Hypnosis, consume it and deal 7 damage ignoring Armor instead.","mindBreak",{range:"ranged",ignoreArmor:true}),
      A("mesmer","Mesmerize",1,2,"Ranged control. Apply Hypnosis to one enemy. Hypnosis is non-stackable and enables Hypnotic payoffs.","status",{status:"hypnosis",stacks:1,range:"ranged"}),
      A("mirror","Mirror Guard",1,99,"Guard prediction. Choose an enemy. If it uses a damage attack this round, cancel that action and apply Hypnosis to it.","predict",{guard:true,range:"ranged"}),
      A("mass","Mass Suggestion",2,0,"Front-row control. Apply Hypnosis and Exposed to each enemy in the front row. This deals no damage.","frontHypno",{range:"ranged"})
    ]
  });

  set("bahl", {}); // no-op safety if future id changes

  set("shaman", {
    name:"Bahl",
    passive:"Passive — Demon Infection: when Bahl applies Poison or Bleed with an ability, each enemy in the front row also gains 1 stack of the other status.",
    abilities:[
      A("mark","Infect Mark",1,2,"Ranged status. Apply 2 Poison and 1 Bleed to one enemy. This deals no immediate damage, so Armor and Shield do not reduce it.","multiStatus",{statuses:[["poison",2],["bleed",1]],range:"ranged"}),
      A("proliferate","Dark Proliferation",2,1,"Ranged payoff. Choose an enemy. Double that enemy's Poison, Bleed, and Freeze stacks. If it has Hypnosis, also apply Exposed. This deals no damage.","proliferate",{range:"ranged"}),
      A("plague","Plague Wave",2,0,"Row status. Choose an enemy row. Apply 3 Poison to each enemy in that row. This deals no immediate damage, so Armor and Shield do not reduce it.","rowStatus",{status:"poison",stacks:3,range:"ranged"}),
      A("ward","Demon Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt, and the attacker gains 1 Bleed.","ward",{guard:true,range:"ally",shield:5})
    ]
  });

  set("hyafrost", {
    passive:"Passive — Deep Winter: whenever Hyafrost applies Freeze with one of his abilities, Hyafrost gains 1 Shield. Shield expires at end of round.",
    abilities:[
      A("frostbite","Frostbite",1,1,"Magic status. Apply 2 Freeze. If the target already has Freeze, also deal 2 damage ignoring Armor; Shield still absorbs that damage.","whiteout",{range:"ranged",ignoreArmor:true}),
      A("armor","Frost Armor",1,2,"Ally support. Choose an ally. That ally gains +2 Armor and 3 Shield until end of round. Armor reduces direct damage before Shield.","armorBuff",{range:"ally",armor:2,shield:3}),
      A("field","Frozen Field",2,0,"Row control. Choose an enemy row. Apply 2 Freeze to each enemy in that row. This deals no damage.","rowStatus",{status:"freeze",stacks:2,range:"ranged"}),
      A("zero","Absolute Zero",2,-2,"Magic payoff. Deal 3 damage ignoring Armor to each enemy with Freeze, then apply Exhausted to each damaged enemy. Shield still absorbs the damage.","absoluteZero",{dmg:3,ignoreArmor:true})
    ]
  });

  set("bakub", {
    passive:"Passive — Nightmare Brew: Bakub's damage abilities deal +2 damage to enemies that have both Poison and Hypnosis.",
    abilities:[
      A("vial","Nightmare Vial",1,2,"Ranged status. Apply 2 Poison and Hypnosis to one enemy. This deals no immediate damage.","multiStatus",{statuses:[["poison",2],["hypnosis",1]],range:"ranged"}),
      A("toxin","Mind Toxin",1,1,"Magic attack. Deal 3 damage ignoring Armor. Shield still absorbs this damage. If the target has Hypnosis, also apply 3 Poison.","mindToxin",{range:"ranged",ignoreArmor:true}),
      A("fog","Demon Fog",2,0,"Row status. Choose an enemy row. Apply 1 Poison and Hypnosis to each enemy in that row. This deals no immediate damage.","rowMultiStatus",{statuses:[["poison",1],["hypnosis",1]],range:"ranged"}),
      A("future","False Future",1,99,"Guard prediction. Choose an enemy. If that enemy uses a damage attack this round, cancel that action and apply 2 Poison to that enemy.","predictPoison",{guard:true,range:"ranged"})
    ]
  });

  set("smithen", {
    passive:"Passive — Frost Edge: Smithen's damaging abilities deal +2 damage to enemies with any Freeze.",
    abilities:[
      A("needle","Ice Needle",1,3,"Ranged precision. Deal 2 damage with Pierce 1, then apply 1 Freeze. Pierce 1 means the target has 1 less effective Armor against this hit.","damageStatus",{dmg:2,status:"freeze",stacks:1,range:"ranged",pierce:1}),
      A("flash","Whiteout Step",1,99,"Guard. Smithen dodges the next attack this round.","dodge",{guard:true}),
      A("pin","Frost Pin",1,2,"Ranged status. Apply 2 Freeze. If the target already has Freeze, also apply Exposed.","whiteout",{range:"ranged"}),
      A("shatter","Shatter Shot",2,0,"Ranged payoff. Deal 4 damage with Pierce 1. If the target has Freeze, deal +5 damage, then remove its Freeze.","shatter",{range:"ranged",pierce:1})
    ]
  });

  set("kahro", {
    passive:"Passive — Opportunist: Kahro's damaging abilities deal +1 damage to enemies that have any negative status.",
    abilities:[
      A("needle","Shadow Needle",1,4,"Ranged precision. Deal 3 damage with Pierce 2. Pierce 2 means the target has 2 less effective Armor against this hit.","damage",{dmg:3,range:"ranged",pierce:2}),
      A("mark","Shadow Mark",1,3,"Ranged setup. Apply Exposed and 1 Bleed to one enemy. This deals no immediate damage.","multiStatus",{statuses:[["exposed",1],["bleed",1]],range:"ranged"}),
      A("assassinate","Assassinate",2,0,"Ranged finisher. Deal 5 damage with Pierce 2. Deal +4 if the target is in the back row and not currently protected.","assassinate",{range:"ranged",pierce:2}),
      A("vanish","Vanish",1,99,"Guard. Kahro dodges the next attack this round.","dodge",{guard:true})
    ]
  });

  set("eva", {
    passive:"Passive — Crimson Hunger: when Lady Eva hits a target that had Bleed, she restores 1 HP.",
    abilities:[
      A("stab","Crimson Stab",1,4,"Melee precision. Deal 2 damage with Pierce 2. If the target has Bleed, Lady Eva restores 1 HP.","bloodDash",{range:"melee",pierce:2}),
      A("mist","Mist Step",1,99,"Guard. Lady Eva dodges the next attack this round.","dodge",{guard:true}),
      A("kiss","Vampire Kiss",2,1,"Ranged attack. Deal 3 damage with Pierce 1, then apply 3 Bleed.","damageStatus",{dmg:3,status:"bleed",stacks:3,range:"ranged",pierce:1}),
      A("bite","Final Bite",2,0,"Bleed payoff. Remove all Bleed from one enemy. Deal damage equal to removed Bleed + 4 with Pierce 1, then restore 2 HP.","consumeBleed",{bonus:4,heal:2,range:"melee",pierce:1})
    ]
  });
}
tuneWordingClarityV30();


/* ===== v31 cinematic readable resolution pipeline =====
   Turn resolution now follows:
   1. Focus/Anticipation
   2. Ability reveal card
   3. Impact / rules application
   4. Result breakdown
   5. Settle / continue
*/

let currentActionEvents = [];
let currentActionBefore = null;
let currentActionAfter = null;

function hpOf(u){ return u ? u.hp : 0; }
function shieldOf(u){ return u ? (u.shield||0) : 0; }
function armorOf(u){ return u ? (getArmor ? getArmor(u) : (u.armor||0)) : 0; }
function statusSnapshot(u){
  return u ? JSON.parse(JSON.stringify(u.status || {})) : {};
}

function unitSnapshot(u){
  return u ? {
    id:u.id, name:u.name, hp:u.hp, shield:u.shield||0, armor:armorOf(u),
    status: statusSnapshot(u), dead:!!u.dead
  } : null;
}

function boardSnapshot(){
  return state.units.map(unitSnapshot);
}

function diffSnapshots(before, after){
  const byId = new Map(before.map(x=>[x.id,x]));
  const events = [];
  for(const a of after){
    const b = byId.get(a.id);
    if(!b) continue;
    if(a.hp < b.hp) events.push({type:"hp", unit:a.name, value:b.hp-a.hp, text:`${a.name} lost ${b.hp-a.hp} HP`});
    if(a.hp > b.hp) events.push({type:"heal", unit:a.name, value:a.hp-b.hp, text:`${a.name} healed ${a.hp-b.hp} HP`});
    if(a.shield < b.shield) events.push({type:"shield", unit:a.name, value:b.shield-a.shield, text:`${a.name}'s Shield absorbed ${b.shield-a.shield}`});
    if(a.shield > b.shield) events.push({type:"shieldGain", unit:a.name, value:a.shield-b.shield, text:`${a.name} gained ${a.shield-b.shield} Shield`});
    if(a.armor < b.armor) events.push({type:"armor", unit:a.name, value:b.armor-a.armor, text:`${a.name}'s effective Armor decreased by ${b.armor-a.armor}`});
    if(a.armor > b.armor) events.push({type:"armorGain", unit:a.name, value:a.armor-b.armor, text:`${a.name}'s effective Armor increased by ${a.armor-b.armor}`});
    if(!b.dead && a.dead) events.push({type:"dead", unit:a.name, text:`${a.name} was defeated`});

    const keys = new Set([...Object.keys(b.status||{}), ...Object.keys(a.status||{})]);
    for(const k of keys){
      const oldv = b.status?.[k] || 0;
      const newv = a.status?.[k] || 0;
      if(newv > oldv) events.push({type:"statusGain", unit:a.name, status:k, value:newv-oldv, text:`${a.name} gained ${newv-oldv} ${k}`});
      if(newv < oldv) events.push({type:"statusLoss", unit:a.name, status:k, value:oldv-newv, text:`${a.name} lost ${oldv-newv} ${k}`});
    }
  }
  return events;
}

function startActionEventCapture(actor, ability, target){
  currentActionEvents = [];
  currentActionBefore = boardSnapshot();
}

function pushActionEvent(type, text, unitObj=null, extra={}){
  const ev = {type, text, unitId:unitObj?.id || null, unitName:unitObj?.name || "", ...extra};
  currentActionEvents.push(ev);
  return ev;
}

function finishActionEventCapture(){
  currentActionAfter = boardSnapshot();
  const diffs = diffSnapshots(currentActionBefore || [], currentActionAfter || []);
  // Keep explicit events first, then snapshot-derived summaries, removing near-duplicates by text.
  const seen = new Set();
  return [...currentActionEvents, ...diffs].filter(ev=>{
    const key = ev.text;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function effectTagForAbility(a){
  const desc = (a?.desc || "").toLowerCase();
  if(a?.guard) return "Guard";
  if(/ignore armor/.test(desc)) return "Ignores Armor";
  if(/pierce/.test(desc)) return "Pierce";
  if(/sunder/.test(desc)) return "Sunder";
  if(/poison|bleed|freeze|hypnosis|exposed|exhausted/.test(desc)) return "Status";
  if(/heal|shield|armor/.test(desc)) return "Support";
  return "Damage";
}

function actionBreakdownHTML(actor, ability, target, stage="reveal", events=[]){
  const tag = effectTagForAbility(ability);
  const targetName = target ? target.name : "No target";
  const speedText = ability.guard ? "Guard Priority" : `Speed ${totalSpeed(actor, ability)}`;
  const eventsHtml = events.length
    ? `<div class="breakEvents">${events.slice(0,8).map(ev=>`<div class="breakEvent ${ev.type||""}">${ev.text}</div>`).join("")}</div>`
    : "";

  return `
    <div class="breakCard ${actionKind(ability)} ${stage}">
      <div class="breakStage">${stage === "result" ? "Result" : stage === "impact" ? "Impact" : "Action Reveal"}</div>
      <div class="breakHeader">
        <span class="breakIcon" style="background-image:url('${abilityIconUrl(actor, ability)}')"></span>
        <div>
          <b>${actor.name}</b>
          <strong>${ability.name}</strong>
          <small>${actor.side === "enemy" ? "Enemy action revealed" : "Your action"} · ${ability.cost} AP · ${speedText}</small>
        </div>
      </div>
      <div class="breakTarget"><b>Target:</b> ${targetName}</div>
      <div class="breakTag">${tag}</div>
      <p>${ability.desc}</p>
      ${clarityTextForAbility ? clarityTextForAbility(ability) : ""}
      ${eventsHtml}
      ${tacticalResolution ? `<div class="breakContinueHint">Press Continue to proceed</div>` : ""}
    </div>
  `;
}

function showResolutionOverlay(actor, ability, target, stage="reveal", events=[]){
  const overlay = $("resolutionOverlay");
  if(!overlay) return;
  overlay.innerHTML = actionBreakdownHTML(actor, ability, target, stage, events);
  overlay.classList.remove("hidden");
  overlay.classList.toggle("resultStage", stage==="result");
}

function hideResolutionOverlay(){
  const overlay = $("resolutionOverlay");
  if(overlay) overlay.classList.add("hidden");
}

function showResolveDetail(actor, ability, target, mode="before", events=[]){
  currentResolveDetail = { actorId: actor?.id, abilityId: ability?.id, targetId: target?.id };
  $("infoTitle").innerHTML = `<span>${mode === "after" ? "Resolved" : "Resolving"} — ${actor.name}</span>`;
  $("infoBody").innerHTML = actionBreakdownHTML(actor, ability, target, mode === "after" ? "result" : "reveal", events);
  if(isMobileLayout()) openMobilePanel("info");
}

function cinematicDelay(stage){
  if(tacticalResolution) return stage === "impact" ? 200 : 150;
  if(stage === "reveal") return 1600;
  if(stage === "impact") return 650;
  if(stage === "result") return 1900;
  return 900;
}

async function pauseForStage(stage){
  await sleep(cinematicDelay(stage));
  if(tacticalResolution) await waitForTacticalContinue();
}

function spawnFloatingText(unitObj, text, kind="hp"){
  const el = tileEl(unitObj?.id);
  const fx = fxLayer();
  if(!el || !fx) return;
  const c = centerOf(el);
  const div = document.createElement("div");
  div.className = `floatText ${kind}`;
  div.textContent = text;
  div.style.left = c.x + "px";
  div.style.top = (c.y - c.h*0.15) + "px";
  fx.appendChild(div);
  setTimeout(()=>div.remove(), 1900);
}

function addStatus(t,s,n=1){
  if(!t||t.dead)return;

  if(s==="hypnosis" || s==="exposed" || s==="exhausted" || s==="frozen"){
    t.status[s]=1;
    spawnStatusPop?.(t,s,"");
    pushActionEvent("statusGain", `${t.name} gained ${s}`, t, {status:s, value:1});
    log(`${t.name} gains ${s}.`);
    return;
  }

  t.status[s]=(t.status[s]||0)+n;
  spawnStatusPop?.(t,s,n);
  pushActionEvent("statusGain", `${t.name} gained ${n} ${s}`, t, {status:s, value:n});
  log(`${t.name} gains ${n} ${s}.`);

  if(s==="freeze" && (t.status.freeze||0)>=5){
    t.status.freeze=0;
    t.status.frozen=1;
    spawnStatusPop?.(t,"frozen","");
    pushActionEvent("statusTrigger", `${t.name} reached 5 Freeze and became Frozen`, t, {status:"frozen"});
    log(`${t.name} reaches 5 Freeze and becomes Frozen. Its next non-Guard action will be canceled.`);
  }
}

function addShield(u, n){
  if(!u || u.dead || !n) return;
  u.shield = (u.shield || 0) + n;
  spawnFloatingText?.(u, `+${n} Shield`, "shield");
  pushActionEvent("shieldGain", `${u.name} gained ${n} Shield`, u, {value:n});
  log(`${u.name} gains ${n} Shield. ${STATUS_RULES_V16.shield}`);
}

function addArmorThisRound(u, n){
  if(!u || u.dead || !n) return;
  u.bonusArmor = (u.bonusArmor || 0) + n;
  spawnFloatingText?.(u, `+${n} Armor`, "armor");
  pushActionEvent("armorGain", `${u.name} gained +${n} Armor until end of round`, u, {value:n});
  log(`${u.name} gains +${n} Armor until end of round.`);
}

function addSunder(t,n){
  if(!t || t.dead || !n) return;
  t.armorDown = (t.armorDown || 0) + n;
  spawnFloatingText?.(t, `Sunder -${n} Armor`, "armor");
  pushActionEvent("armor", `${t.name} was Sundered: -${n} Armor until end of round`, t, {value:n});
  log(`${t.name} is Sundered: -${n} Armor until end of round.`);
}

function loseHpDirect(u, n, reason="life loss"){
  if(!u || u.dead || n<=0) return;
  u.hp -= n;
  spawnFloatingText?.(u, `-${n} HP`, "hp");
  markRumble(u);
  state.attacked[u.id] = true;
  pushActionEvent("hp", `${u.name} lost ${n} HP (${reason}; ignores Armor and Shield)`, u, {value:n});
  log(`${u.name} loses ${n} HP from ${reason}.`);
  if(u.hp<=0){u.hp=0;u.dead=true;log(`${u.name} is defeated.`);spawnFloatingText?.(u,"Defeated","cancel");pushActionEvent("dead", `${u.name} was defeated`, u)}
}

function heal(t,n){
  if(!n||t.dead)return;
  const before=t.hp;
  t.hp=Math.min(t.maxHp,t.hp+n);
  const healed=t.hp-before;
  if(healed>0) {
    spawnFloatingText?.(t, `+${healed} HP`, "heal");
    pushActionEvent("heal", `${t.name} healed ${healed} HP`, t, {value:healed});
    log(`${t.name} restores ${healed} HP.`);
  }
}

function damage(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead)return;

  if(opt.attack){
    let idx=state.predicts.findIndex(p=>p.target===src);
    if(idx>=0){
      const pr = state.predicts[idx];
      state.predicts.splice(idx,1);
      addStatus(src,pr.status,pr.stacks||1);
      state.canceledActionKeys?.push(state.currentActionKey);
      markPassive(pr.caster, "Prediction");
      pushActionEvent("cancel", `${pr.caster.name} predicted and canceled ${src.name}'s action`, src);
      log(`${pr.caster.name} predicted and canceled ${src.name}.`);
      spawnFloatingText?.(src, "Canceled", "cancel");
      return;
    }
  }

  t=redirect(t,src);

  if(state.dodges.includes(t.id)){
    state.dodges=state.dodges.filter(x=>x!==t.id);
    markPassive(t, "Dodge");
    pushActionEvent("cancel", `${t.name} dodged the attack`, t);
    log(`${t.name} dodges the attack.`);
    spawnFloatingText?.(t, "Dodge", "cancel");
    return;
  }

  let ctrIdx=state.counters.findIndex(x=>x.caster===t);
  if(ctrIdx>=0){
    const ctr = state.counters[ctrIdx];
    state.counters.splice(ctrIdx,1);
    markPassive(t, "Counter Guard");
    addShield(t, ctr.shield||0);
    addStatus(src,ctr.status,ctr.stacks||1);
  }

  let raw=amt;

  if(src.id==="kahro" && hasDebuff(t)) { raw++; markPassive(src, "Opportunist"); pushActionEvent("passive", `Opportunist added +1 damage`, src); }
  if(src.id==="maoja" && t.status.poison) { raw++; markPassive(src, "Toxic Momentum"); pushActionEvent("passive", `Toxic Momentum added +1 damage`, src); }
  if(src.id==="smithen" && t.status.freeze) { raw+=2; markPassive(src, "Frost Edge"); pushActionEvent("passive", `Frost Edge added +2 damage`, src); }
  if(src.id==="bakub" && t.status.poison && t.status.hypnosis) { raw+=2; markPassive(src, "Nightmare Brew"); pushActionEvent("passive", `Nightmare Brew added +2 damage`, src); }

  if(t.status.exposed){
    raw += 2;
    t.status.exposed=0;
    spawnFloatingText?.(t, "Exposed +2", "status");
    pushActionEvent("statusTrigger", `Exposed added +2 damage and was removed`, t);
    log(`${t.name}'s Exposed adds +2 damage and is removed.`);
  }

  let bleedBurst = 0;
  if(opt.attack && (t.status.bleed||0)>0){
    bleedBurst = t.status.bleed;
    t.status.bleed = 0;
    spawnFloatingText?.(t, `Bleed +${bleedBurst}`, "bleed");
    spawnStatusPop?.(t,"bleed","");
    raw += bleedBurst;
    pushActionEvent("statusTrigger", `Bleed burst added +${bleedBurst} damage and was removed`, t);
    log(`${t.name}'s Bleed bursts for +${bleedBurst} damage and is removed.`);
  }

  const actualArmor = getArmor(t);
  const effectiveArmor = effectiveArmorForHit(t,opt);
  const ignoredArmor = actualArmor - effectiveArmor;
  let afterArmor = Math.max(0, raw - effectiveArmor);
  let shieldBlocked = Math.min(t.shield||0, afterArmor);
  t.shield = Math.max(0, (t.shield||0) - shieldBlocked);
  let finalDamage = afterArmor - shieldBlocked;

  if(opt.ignoreArmor) { spawnFloatingText?.(t, `Ignore Armor`, "status"); pushActionEvent("armor", `${src.name}'s damage ignored Armor`, t); }
  else if(opt.pierce) { spawnFloatingText?.(t, `Pierce ${opt.pierce}`, "status"); pushActionEvent("armor", `Pierce ${opt.pierce} reduced effective Armor`, t); }
  if(effectiveArmor>0) { spawnFloatingText?.(t, `Armor -${Math.min(raw,effectiveArmor)}`, "armor"); pushActionEvent("armor", `${effectiveArmor} Armor reduced the hit`, t, {value:effectiveArmor}); }
  if(ignoredArmor>0) log(`${src.name}'s ${opt.ignoreArmor ? "magic" : "piercing"} bypasses ${ignoredArmor} Armor.`);
  if(shieldBlocked>0) { spawnFloatingText?.(t, `Shield -${shieldBlocked}`, "shield"); pushActionEvent("shield", `${t.name}'s Shield blocked ${shieldBlocked} damage`, t, {value:shieldBlocked}); }
  if(finalDamage>0) { spawnFloatingText?.(t, `-${finalDamage} HP`, "hp"); pushActionEvent("hp", `${t.name} lost ${finalDamage} HP`, t, {value:finalDamage}); }

  pushActionEvent("formula", `${raw} damage → ${effectiveArmor} effective Armor → ${shieldBlocked} Shield blocked → ${finalDamage} HP lost`, t);
  log(`${src.name}'s hit: ${raw} damage → ${effectiveArmor} effective Armor (${actualArmor} total) → ${afterArmor} after Armor → ${shieldBlocked} blocked by Shield → ${finalDamage} HP damage.`);

  const connected = opt.attack;
  if(connected){
    if(src.buff.poisonHands) {
      markPassive(src, "Poison Hands");
      pushActionEvent("passive", `Poison Hands applied 2 Poison`, src);
      applyStatusFrom(src,t,"poison",2);
    }
    if(t.id==="poom"&&opt.melee) { markPassive(t, "Mirror Mind"); pushActionEvent("passive", `Mirror Mind applied Hypnosis to the attacker`, t); addStatus(src,"hypnosis",1); }
    if(t.id==="kku"&&opt.melee) { markPassive(t, "Cold Hide"); pushActionEvent("passive", `Cold Hide applied Freeze to the attacker`, t); addStatus(src,"freeze",1); }
  }

  if(finalDamage>0){
    t.hp-=finalDamage;
    markRumble(t);
    state.attacked[t.id]=true;

    if(src.id==="eva" && (bleedBurst>0 || opt.targetHadBleed)) {
      markPassive(src, "Crimson Hunger");
      pushActionEvent("passive", `Crimson Hunger healed Lady Eva`, src);
      heal(src,1);
    }

    if(t.hp<=0){
      t.hp=0;t.dead=true;
      log(`${t.name} is defeated.`);
      spawnFloatingText?.(t,"Defeated","cancel");
      pushActionEvent("dead", `${t.name} was defeated`, t);
    }
  } else {
    spawnFloatingText?.(t, "No HP loss", "armor");
    pushActionEvent("hp", `${t.name} lost no HP`, t);
    log(`${t.name} loses no HP from the hit.`);
  }

  if(opt.sunder && !t.dead) addSunder(t,opt.sunder);
}

async function resolveRound(){
  if(state.phase!=="planning")return;
  chooseEnemy();
  state.phase="resolving";
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  currentResolveDetail=null;
  let acts=plannedActionsForStrip(true);
  renderBattle();

  for(const act of acts){
    if(!act.unit || act.unit.dead){
      state.canceledActionKeys.push(act.key);
      renderBattle();
      continue;
    }

    state.currentActionKey=act.key;
    lastAction = {actorId:act.unit.id, targetId:act.target?.id, kind:actionKind(act.ability)};
    currentResolveDetail = { actorId:act.unit.id, abilityId:act.ability.id, targetId:act.target?.id };

    // 1. Focus / anticipation.
    showActionToast(act.unit, act.ability, act.target);
    showResolveDetail(act.unit, act.ability, act.target, "before");
    showResolutionOverlay(act.unit, act.ability, act.target, "reveal");
    log(`${act.unit.name} resolves ${act.ability.name}: ${act.ability.desc}`);
    renderBattle();
    await pauseForStage("reveal");

    // 2. Impact animation.
    showResolutionOverlay(act.unit, act.ability, act.target, "impact");
    if(act.target) spawnLine(act.unit, act.target, actionKind(act.ability));
    renderBattle();
    await pauseForStage("impact");

    // 3. Apply result and collect WHY.
    startActionEventCapture(act.unit, act.ability, act.target);
    apply(act.unit,act.ability,act.target);
    const events = finishActionEventCapture();

    if(!state.canceledActionKeys.includes(act.key)) state.resolvedActionKeys.push(act.key);

    // 4. Result breakdown.
    showResolveDetail(act.unit, act.ability, act.target, "after", events);
    showResolutionOverlay(act.unit, act.ability, act.target, "result", events);
    renderBattle();
    if(checkWin())return;
    await pauseForStage("result");
  }

  hideResolutionOverlay();
  currentResolveDetail=null;
  const cont = $("continueResolveBtn");
  if(cont) cont.classList.add("hidden");
  endRound();
}


/* ===== v32 keyword glossary + inline rules popups =====
   Keywords are highlighted inside ability text, info panels, tooltips, and resolution cards.
   Desktop: hover/click keyword.
   Mobile: tap keyword opens a readable bottom-sheet style popup.
*/

const KEYWORDS_V32 = {
  "pierce": {
    title: "Pierce X",
    text: "When this ability deals damage, ignore X Armor for that hit. Example: Pierce 2 against 3 Armor means only 1 Armor reduces the damage."
  },
  "sunder": {
    title: "Sunder X",
    text: "Reduce the target's Armor by X until the end of the current round. This makes later hits this round stronger."
  },
  "exposed": {
    title: "Exposed",
    text: "The next time this unit takes damage, that hit gets +2 damage. Then Exposed is removed."
  },
  "shield": {
    title: "Shield",
    text: "Temporary protection. Damage is reduced by Armor first, then Shield absorbs the remaining damage before HP is lost. Shield is removed at end of round."
  },
  "armor": {
    title: "Armor",
    text: "Reduces normal damage before Shield and HP. Damage ignoring Armor skips this step. Pierce reduces effective Armor for that hit."
  },
  "ignoring armor": {
    title: "Ignoring Armor",
    text: "This damage skips Armor, but Shield still absorbs it before HP is lost."
  },
  "ignore armor": {
    title: "Ignore Armor",
    text: "This damage skips Armor, but Shield still absorbs it before HP is lost."
  },
  "lose hp": {
    title: "Lose HP",
    text: "Direct HP loss. It ignores both Armor and Shield."
  },
  "poison": {
    title: "Poison",
    text: "At end of round, take ceil(Poison / 2) HP loss, then remove that much Poison. Poison ignores Armor and Shield."
  },
  "bleed": {
    title: "Bleed",
    text: "When this unit is hit by a damaging attack, remove all Bleed and add that much damage to the hit before Armor and Shield are calculated."
  },
  "freeze": {
    title: "Freeze",
    text: "Stacking ice pressure. At 5 Freeze, remove the Freeze stacks and apply Frozen."
  },
  "frozen": {
    title: "Frozen",
    text: "The next non-Guard action this unit tries to resolve is canceled. Then Frozen is removed."
  },
  "hypnosis": {
    title: "Hypnosis",
    text: "A non-stackable control status. It does nothing alone, but Hypnotic abilities can consume or exploit it for stronger effects."
  },
  "exhausted": {
    title: "Exhausted",
    text: "This unit's next non-Guard action is slowed/reduced by the current rules, then Exhausted is removed after that action resolves."
  },
  "guard": {
    title: "Guard",
    text: "Guard actions resolve before normal actions. They are used to protect, dodge, predict, or counter enemy actions."
  },
  "dodge": {
    title: "Dodge",
    text: "Avoid the next attack targeting this unit this round."
  },
  "protect": {
    title: "Protect",
    text: "If the chosen ally is attacked this round, the protector takes that attack instead. Usually triggers once."
  },
  "protected": {
    title: "Protected",
    text: "A loose term meaning another effect is guarding this unit. For back-row targeting, use the exact wording: 'front row is empty' instead."
  },
  "front row": {
    title: "Front Row",
    text: "The row closest to the enemy. Melee attacks normally target this row first."
  },
  "back row": {
    title: "Back Row",
    text: "The row behind the front row. Melee attacks can target the back row only when the opposing front row is empty."
  },
  "front row is empty": {
    title: "Front Row Is Empty",
    text: "There are no living characters in that side's front row. When this happens, melee attacks can reach the back row."
  },
  "melee": {
    title: "Melee",
    text: "A close-range attack. It usually targets the enemy front row. If the enemy front row is empty, it can reach the back row."
  },
  "ranged": {
    title: "Ranged",
    text: "Can target valid enemies at distance, including back-row characters."
  },
  "row": {
    title: "Row",
    text: "An effect that hits or affects multiple units in the chosen front row or back row."
  },
  "damage": {
    title: "Damage",
    text: "Normal damage is reduced by Armor first, then Shield, then remaining damage removes HP."
  },
  "hp": {
    title: "HP",
    text: "Health. When a unit reaches 0 HP, it is defeated."
  }
};

const KEYWORD_PATTERN_V32 = [
  "front row is empty",
  "ignoring Armor",
  "ignore Armor",
  "Lose HP",
  "Pierce",
  "Sunder",
  "Exposed",
  "Shield",
  "Armor",
  "Poison",
  "Bleed",
  "Freeze",
  "Frozen",
  "Hypnosis",
  "Exhausted",
  "Guard",
  "Dodge",
  "Protect",
  "Protected",
  "Front row",
  "Back row",
  "Melee",
  "Ranged",
  "Row",
  "Damage",
  "HP"
];

function escapeHtmlV32(str){
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function keywordKeyV32(label){
  const x = String(label || "").toLowerCase();
  if(x === "ignoring armor") return "ignoring armor";
  if(x === "ignore armor") return "ignore armor";
  if(x === "lose hp") return "lose hp";
  if(x === "front row") return "front row";
  if(x === "back row") return "back row";
  if(x === "front row is empty") return "front row is empty";
  return x;
}

function renderKeywordText(text){
  let html = escapeHtmlV32(text);
  const patterns = KEYWORD_PATTERN_V32
    .slice()
    .sort((a,b)=>b.length-a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${patterns.join("|")})(\\s+\\d+)?\\b`, "gi");

  html = html.replace(re, (match, word, num="") => {
    const key = keywordKeyV32(word);
    if(!((typeof KEYWORDS_V32 !== "undefined" ? KEYWORDS_V32 : window.KEYWORDS_V32_SAFE)[key])) return match;
    const label = `${word}${num || ""}`;
    return `<button type="button" class="keywordLink" data-keyword="${key}" data-label="${escapeHtmlV32(label)}">${escapeHtmlV32(label)}</button>`;
  });

  return html;
}

function showKeywordPopup(key, anchor=null, label=null){
  const data = ((typeof KEYWORDS_V32 !== "undefined" ? KEYWORDS_V32 : window.KEYWORDS_V32_SAFE)[key]);
  const pop = $("keywordPopup");
  if(!data || !pop) return;

  pop.innerHTML = `
    <div class="keywordPopupCard">
      <button class="keywordClose" type="button" aria-label="Close keyword">×</button>
      <div class="keywordEyebrow">Keyword</div>
      <div class="keywordTitle">${escapeHtmlV32(label || data.title)}</div>
      <div class="keywordText">${escapeHtmlV32(data.text)}</div>
    </div>
  `;
  pop.classList.remove("hidden");

  const close = pop.querySelector(".keywordClose");
  if(close) close.onclick = (ev)=>{ev.stopPropagation(); hideKeywordPopup();};

  if(isMobileLayout()){
    pop.classList.add("mobileKeywordPopup");
    pop.style.left = "0";
    pop.style.top = "0";
    pop.style.right = "0";
    pop.style.bottom = "0";
    return;
  }

  pop.classList.remove("mobileKeywordPopup");
  if(anchor){
    const r = anchor.getBoundingClientRect();
    const w = 300, h = 160;
    let x = r.left + r.width/2 - w/2;
    let y = r.bottom + 10;
    if(y + h > window.innerHeight - 8) y = r.top - h - 10;
    x = Math.max(8, Math.min(window.innerWidth - w - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - h - 8, y));
    pop.style.left = x+"px";
    pop.style.top = y+"px";
    pop.style.right = "auto";
    pop.style.bottom = "auto";
  }
}

function hideKeywordPopup(){
  const pop = $("keywordPopup");
  if(pop) pop.classList.add("hidden");
}

function installKeywordGlossaryV32(){
  document.addEventListener("click", (ev)=>{
    const kw = ev.target.closest(".keywordLink");
    if(kw){
      ev.preventDefault();
      ev.stopPropagation();
      showKeywordPopup(kw.dataset.keyword, kw, kw.dataset.label);
      return;
    }

    const pop = $("keywordPopup");
    if(pop && !pop.classList.contains("hidden") && !ev.target.closest(".keywordPopupCard")){
      hideKeywordPopup();
    }
  });

  document.addEventListener("keydown", (ev)=>{
    if(ev.key === "Escape") hideKeywordPopup();
  });
}

function clarityTextForAbility(a){
  if(!a) return "";
  const desc = a.desc || "";
  const tags = [];
  if(/\bLose \d+ HP\b|loses \d+ HP/i.test(desc)) tags.push("Lose HP ignores Armor and Shield.");
  if(/ignoring Armor/i.test(desc)) tags.push("Ignoring Armor still hits Shield before HP.");
  if(/Pierce/i.test(desc)) tags.push("Pierce reduces the target's effective Armor for this hit.");
  if(/Sunder/i.test(desc)) tags.push("Sunder reduces Armor until end of round.");
  if(/Poison/i.test(desc)) tags.push("Poison end-round damage ignores Armor and Shield.");
  if(/Bleed/i.test(desc)) tags.push("Bleed adds damage to the next hit before Armor/Shield.");
  return tags.length ? `<div class="rulesClarifier">${renderKeywordText(tags.join(" "))}</div>` : "";
}

function abilityRulesSummary(actor, ability, target){
  if(!ability) return "";
  const targetText = abilityTargetLabel(target);
  const speedText = ability.guard ? "Guard priority" : `Speed ${totalSpeed(actor, ability)}`;
  const typeText = actionKind ? actionKind(ability) : (ability.guard ? "guard" : "action");
  return `
    <div class="actionDetailCard ${typeText}">
      <div class="actionDetailHeader">
        <span class="actionDetailIcon" style="background-image:url('${abilityIconUrl(actor, ability)}')"></span>
        <div>
          <b>${escapeHtmlV32(actor.name)} uses ${escapeHtmlV32(ability.name)}</b>
          <small>${actor.side === "enemy" ? "Enemy action revealed" : "Your action"} · ${ability.cost} AP · ${speedText}</small>
        </div>
      </div>
      <div class="actionDetailTarget"><b>Target:</b> ${renderKeywordText(targetText)}</div>
      <div class="actionDetailText">${renderKeywordText(ability.desc)}</div>
      ${clarityTextForAbility(ability)}
    </div>
  `;
}

function setAbilityTooltip(u,a){
  const tooltip = $("abilityTooltip");
  if(!tooltip || !a) return;
  tooltip.innerHTML = `
    <div class="tipTop">
      <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
      <div>
        <b>${escapeHtmlV32(a.name)}</b>
        <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
      </div>
    </div>
    <p>${renderKeywordText(a.desc)}</p>
    ${clarityTextForAbility(a)}
    <div class="tipTags">
      <span>${escapeHtmlV32(abilityIconKey(u,a))}</span>
      <span>${escapeHtmlV32(a.range || (a.guard ? "guard" : "self"))}</span>
      ${isMobileLayout() ? "<span>tap again to choose</span>" : ""}
    </div>
  `;
  tooltip.classList.remove("hidden");
  if(isMobileLayout()){
    tooltip.style.left = "10px";
    tooltip.style.right = "10px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "10px";
    tooltip.style.width = "calc(100vw - 20px)";
  }
}

function actionBreakdownHTML(actor, ability, target, stage="reveal", events=[]){
  const tag = effectTagForAbility(ability);
  const targetName = target ? target.name : "No target";
  const speedText = ability.guard ? "Guard Priority" : `Speed ${totalSpeed(actor, ability)}`;
  const eventsHtml = events.length
    ? `<div class="breakEvents">${events.slice(0,8).map(ev=>`<div class="breakEvent ${ev.type||""}">${renderKeywordText(ev.text)}</div>`).join("")}</div>`
    : "";

  return `
    <div class="breakCard ${actionKind(ability)} ${stage}">
      <div class="breakStage">${stage === "result" ? "Result" : stage === "impact" ? "Impact" : "Action Reveal"}</div>
      <div class="breakHeader">
        <span class="breakIcon" style="background-image:url('${abilityIconUrl(actor, ability)}')"></span>
        <div>
          <b>${escapeHtmlV32(actor.name)}</b>
          <strong>${escapeHtmlV32(ability.name)}</strong>
          <small>${actor.side === "enemy" ? "Enemy action revealed" : "Your action"} · ${ability.cost} AP · ${speedText}</small>
        </div>
      </div>
      <div class="breakTarget"><b>Target:</b> ${renderKeywordText(targetName)}</div>
      <div class="breakTag">${renderKeywordText(tag)}</div>
      <p>${renderKeywordText(ability.desc)}</p>
      ${clarityTextForAbility(ability)}
      ${eventsHtml}
      ${tacticalResolution ? `<div class="breakContinueHint">Press Continue to proceed</div>` : ""}
    </div>
  `;
}

function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").innerHTML = u
    ? `<span>${escapeHtmlV32(u.name)} — ${escapeHtmlV32(u.class)} / ${escapeHtmlV32(u.prof)}</span><button id="closeInfoBtn" class="closeInfoBtn" type="button" aria-label="Close info">×</button>`
    : "Plan hidden actions";

  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;

  if(u){
    const passiveText = u.passive || "No passive ability.";
    const enemyNote = u.side === "enemy"
      ? `<div class="statusInfoBox"><b>Enemy intel:</b> Passive is visible. Active abilities are hidden until they are revealed in the queue.</div>`
      : "";
    const abilitiesHtml = u.side === "enemy"
      ? ""
      : u.abilities.map(a=>`<div class="logItem"><b>${escapeHtmlV32(a.name)}</b> — ${a.cost} AP · ${a.guard?"Guard":`⚡${totalSpeed(u,a)}`}<br>${renderKeywordText(a.desc)}${clarityTextForAbility(a)}</div>`).join("");

    $("infoBody").innerHTML =
      `<div class="statusInfoBox">
        <b>Damage wording:</b><br>
        <b>${renderKeywordText("Deal damage")}</b> → ${renderKeywordText("Armor")}, then ${renderKeywordText("Shield")}, then ${renderKeywordText("HP")}.<br>
        <b>${renderKeywordText("Ignoring Armor")}</b> → ${renderKeywordText("Shield")}, then ${renderKeywordText("HP")}.<br>
        <b>${renderKeywordText("Lose HP")}</b> → ignores ${renderKeywordText("Armor")} and ${renderKeywordText("Shield")}.
       </div>
       <b>Stats:</b> ❤️${u.hp}/${u.maxHp} · 🛡️${getArmor ? getArmor(u) : u.armor} · ⚡${u.speed}<br>
       <b>Passive:</b> ${renderKeywordText(passiveText)}
       ${enemyNote}
       ${abilitiesHtml}`;
  } else {
    $("infoBody").innerHTML = `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
  }

  const btn = $("closeInfoBtn");
  if(btn) btn.onclick = (ev) => {
    ev.stopPropagation();
    closeInfoPanel();
  };

  if(pendingAbility && selectedId) previewTargeting(unit(selectedId), pendingAbility);
}

function previewTargeting(c,a){
  const info = $("infoBody");
  if(!c || !a || !info) return;
  const ts = targets(c,a);
  let msg = "";
  if(!ts.length) msg = "This ability does not require a target.";
  else if(a.range==="melee" && !frontBlocked(other(c.side))) msg = "Choose a target. Enemy front row is empty, so melee can now reach the back row.";
  else if(a.range==="melee") msg = "Choose an enemy in the front row. Melee cannot target back row while a front-row enemy is alive.";
  else if(a.range==="ally") msg = "Choose an allied character.";
  else if(/row/i.test(a.desc || "")) msg = "Choose any enemy in the row you want to affect. The whole row will be highlighted.";
  else msg = "Choose a legal target.";
  info.innerHTML = `<div class="statusInfoBox"><b>Targeting:</b> ${renderKeywordText(msg)}</div>` + info.innerHTML;
}

function tuneKeywordWordingV32(){
  const byId = id => ROSTER.find(c=>c.id===id);
  const set = (id, patch) => { const c=byId(id); if(c) Object.assign(c, patch); };

  const kahro = byId("kahro");
  if(kahro){
    const ass = kahro.abilities.find(a=>a.id==="assassinate");
    if(ass) ass.desc = "Ranged finisher. Deal 5 damage with Pierce 2. Deal +4 if the target is in the back row and that side's front row is empty.";
  }

  const b = typeof BOSS !== "undefined" ? BOSS : null;
  if(b && (!b.passive || b.passive === "undefined")){
    b.passive = "Passive — Colossal Body: World Toad is a large 2×3 boss unit. It counts as occupying both rows, so melee attacks can target it. Row attacks only hit it once.";
  }
}

tuneKeywordWordingV32();
installKeywordGlossaryV32();


/* ===== v33 fixes: resolve freeze + keyword clicks inside ability descriptions =====
   Fixes:
   1. tacticalResolution was referenced but not defined in some builds.
   2. Clicking a keyword inside the ability wheel bubbled into the wheel button click,
      choosing/closing the ability instead of opening the keyword popup.
*/

if (typeof window.tacticalResolution === "undefined") {
  window.tacticalResolution = localStorage.getItem("splitSecondsTacticalResolution") === "1";
}
if (typeof tacticalResolution === "undefined") {
  var tacticalResolution = window.tacticalResolution;
}
if (typeof tacticalContinue === "undefined") {
  var tacticalContinue = null;
}

function setTacticalResolution(on){
  window.tacticalResolution = !!on;
  tacticalResolution = !!on;
  localStorage.setItem("splitSecondsTacticalResolution", tacticalResolution ? "1" : "0");
  updateTacticalButtons();
}

function updateTacticalButtons(){
  const btn = $("tacticalToggleBtn");
  if(btn){
    btn.textContent = tacticalResolution ? "Tactical: On" : "Tactical: Off";
    btn.classList.toggle("active", tacticalResolution);
  }
}

function installTacticalButtons(){
  const toggle = $("tacticalToggleBtn");
  if(toggle) toggle.onclick = () => setTacticalResolution(!tacticalResolution);

  const cont = $("continueResolveBtn");
  if(cont) cont.onclick = () => {
    if(tacticalContinue){
      const fn = tacticalContinue;
      tacticalContinue = null;
      cont.classList.add("hidden");
      fn();
    }
  };

  updateTacticalButtons();
}

function waitForTacticalContinue(){
  if(!tacticalResolution) return Promise.resolve();
  const cont = $("continueResolveBtn");
  if(cont){
    cont.classList.remove("hidden");
    cont.textContent = "Continue";
  }
  return new Promise(resolve => {
    tacticalContinue = resolve;
  });
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function installKeywordGlossaryV32(){
  if(window.__keywordsV33Installed) return;
  window.__keywordsV33Installed = true;

  // Capture phase is important: it stops keyword taps before they reach ability buttons.
  document.addEventListener("pointerdown", (ev)=>{
    const kw = ev.target.closest(".keywordLink");
    if(kw){
      ev.preventDefault();
      ev.stopPropagation();
      showKeywordPopup(kw.dataset.keyword, kw, kw.dataset.label);
    }
  }, true);

  document.addEventListener("click", (ev)=>{
    const kw = ev.target.closest(".keywordLink");
    if(kw){
      ev.preventDefault();
      ev.stopPropagation();
      showKeywordPopup(kw.dataset.keyword, kw, kw.dataset.label);
      return;
    }

    const pop = $("keywordPopup");
    if(pop && !pop.classList.contains("hidden") && !ev.target.closest(".keywordPopupCard")){
      hideKeywordPopup();
    }
  }, true);

  document.addEventListener("keydown", (ev)=>{
    if(ev.key === "Escape") hideKeywordPopup();
  });
}

function setAbilityTooltip(u,a){
  const tooltip = $("abilityTooltip");
  if(!tooltip || !a) return;
  tooltip.innerHTML = `
    <div class="tipTop">
      <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
      <div>
        <b>${escapeHtmlV32(a.name)}</b>
        <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
      </div>
    </div>
    <div class="abilityDescText">${renderKeywordText(a.desc)}</div>
    ${clarityTextForAbility(a)}
    <div class="tipTags">
      <span>${escapeHtmlV32(abilityIconKey(u,a))}</span>
      <span>${escapeHtmlV32(a.range || (a.guard ? "guard" : "self"))}</span>
      ${isMobileLayout() ? "<span>tap again to choose</span>" : ""}
    </div>
  `;
  tooltip.classList.remove("hidden");
  if(isMobileLayout()){
    tooltip.style.left = "10px";
    tooltip.style.right = "10px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "10px";
    tooltip.style.width = "calc(100vw - 20px)";
  }
}

installTacticalButtons();
installKeywordGlossaryV32();


/* ===== v34 ability tooltip / keyword tap fix =====
   Replaces the older wheel handler that selected an ability immediately on mobile.
   Now:
   - Desktop: hover shows details, click chooses.
   - Mobile: first tap shows details, second tap chooses.
   - Tapping/clicking keywords inside the description never chooses/closes the ability.
*/

let wheelPreviewAbilityIdV34 = null;

function positionAbilityTooltipV34(tooltip, wheel, btn, index){
  const wr = wheel.getBoundingClientRect();
  const br = btn.getBoundingClientRect();
  const tw = Math.min(360, window.innerWidth - 20);
  const th = Math.min(220, window.innerHeight * 0.38);

  if(isMobileLayout()){
    tooltip.style.left = "10px";
    tooltip.style.right = "10px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "10px";
    tooltip.style.width = "calc(100vw - 20px)";
    return;
  }

  let x, y;
  if(index === 0){
    x = wr.left + wr.width / 2 - tw / 2;
    y = wr.top - th - 14;
  } else if(index === 2){
    x = wr.left + wr.width / 2 - tw / 2;
    y = wr.bottom + 14;
  } else if(index === 1){
    x = wr.right + 14;
    y = br.top + br.height / 2 - th / 2;
  } else {
    x = wr.left - tw - 14;
    y = br.top + br.height / 2 - th / 2;
  }

  x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
  y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.style.width = tw + "px";
}

function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");
  if(!radial || !wheel) return;

  wheelPreviewAbilityIdV34 = null;
  radial.classList.remove("hidden");
  if(tooltip) tooltip.classList.add("hidden");

  const size = Math.min(360, Math.max(300, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  if(tile){
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  const margin = size / 2 + 10;
  cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
  cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));
  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `<div class="miniCenterName">${escapeHtmlV32 ? escapeHtmlV32(u.name) : u.name}</div>`;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    return `<button class="wheelBtn w${i}" ${state.actionsLeft<a.cost?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')">
      <span class="wheelBtnTitle">${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</span>
      <span class="wheelBtnMeta">${a.cost} AP · ${speedLabel}</span>
    </button>`;
  }).join("");

  const chooseAbility = (a) => {
    pendingAbility = a;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
    hideKeywordPopup?.();
    renderBattle();
    if(!targets(u,pendingAbility).length) plan(null);
  };

  const showTipFor = (btn, a) => {
    if(!tooltip) return;
    tooltip.innerHTML = `
      <div class="tipTop">
        <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
        <div>
          <b>${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</b>
          <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
        </div>
      </div>
      <div class="abilityDescText">${renderKeywordText ? renderKeywordText(a.desc) : a.desc}</div>
      ${clarityTextForAbility ? clarityTextForAbility(a) : ""}
      <div class="tipTags">
        <span>${escapeHtmlV32 ? escapeHtmlV32(abilityIconKey(u,a)) : abilityIconKey(u,a)}</span>
        <span>${escapeHtmlV32 ? escapeHtmlV32(a.range || (a.guard ? "guard" : "self")) : (a.range || (a.guard ? "guard" : "self"))}</span>
        ${isMobileLayout() ? "<span>tap ability again to choose</span>" : ""}
      </div>
    `;
    tooltip.classList.remove("hidden");
    positionAbilityTooltipV34(tooltip, wheel, btn, Number(btn.dataset.index));
  };

  // Critical: any interaction inside tooltip, especially keyword buttons, must not bubble to wheel.
  if(tooltip){
    tooltip.onpointerdown = (ev) => {
      if(ev.target.closest(".keywordLink")){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(ev.target.closest(".keywordLink").dataset.keyword, ev.target.closest(".keywordLink"), ev.target.closest(".keywordLink").dataset.label);
      }
    };
    tooltip.onclick = (ev) => {
      if(ev.target.closest(".keywordLink")){
        ev.preventDefault();
        ev.stopPropagation();
        const kw = ev.target.closest(".keywordLink");
        showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
        return;
      }
      ev.stopPropagation();
    };
  }

  document.querySelectorAll(".wheelBtn").forEach(btn=>{
    const a = u.abilities.find(x=>x.id===btn.dataset.id);

    btn.onmouseenter = () => showTipFor(btn,a);
    btn.onfocus = () => showTipFor(btn,a);
    btn.onmouseleave = () => {
      if(!isMobileLayout() && tooltip) tooltip.classList.add("hidden");
    };

    btn.ontouchstart = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      showTipFor(btn,a);
      if(wheelPreviewAbilityIdV34 === a.id){
        chooseAbility(a);
      } else {
        wheelPreviewAbilityIdV34 = a.id;
        document.querySelectorAll(".wheelBtn").forEach(x=>x.classList.remove("previewing"));
        btn.classList.add("previewing");
      }
    };

    btn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      // On mobile emulation, click may fire after touchstart. First click previews only.
      if(isMobileLayout()){
        if(wheelPreviewAbilityIdV34 !== a.id){
          showTipFor(btn,a);
          wheelPreviewAbilityIdV34 = a.id;
          document.querySelectorAll(".wheelBtn").forEach(x=>x.classList.remove("previewing"));
          btn.classList.add("previewing");
          return;
        }
      }

      chooseAbility(a);
    };
  });
}

// Reinstall keyword listener in capture phase so keyword taps win over any parent buttons.
if(!window.__keywordsV34Installed){
  window.__keywordsV34Installed = true;
  document.addEventListener("pointerdown", (ev)=>{
    const kw = ev.target.closest(".keywordLink");
    if(kw){
      ev.preventDefault();
      ev.stopPropagation();
      showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
    }
  }, true);
  document.addEventListener("click", (ev)=>{
    const kw = ev.target.closest(".keywordLink");
    if(kw){
      ev.preventDefault();
      ev.stopPropagation();
      showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
    }
  }, true);
}


/* ===== v35 random battle background music =====
   Each new battle randomly chooses one ambient loop.
*/

const BATTLE_MUSIC_TRACKS_V35 = [
  "assets/audio/Ambient 1 Loop.mp3",
  "assets/audio/Ambient 2 Loop.mp3",
  "assets/audio/Ambient 3 Loop.mp3",
  "assets/audio/Ambient 4 Loop.mp3",
  "assets/audio/Ambient 5 Loop.mp3",
  "assets/audio/Ambient 6 Loop.mp3",
  "assets/audio/Ambient 7 Loop.mp3",
  "assets/audio/Ambient 8 Loop.mp3",
  "assets/audio/Ambient 9 Loop.mp3",
  "assets/audio/Ambient 10 Loop.mp3"
];

let battleMusicV35 = null;
let currentBattleMusicTrackV35 = null;
let musicUnlockedV35 = false;

function pickBattleMusicTrackV35(){
  if(!BATTLE_MUSIC_TRACKS_V35.length) return null;
  if(BATTLE_MUSIC_TRACKS_V35.length === 1) return BATTLE_MUSIC_TRACKS_V35[0];

  let next = BATTLE_MUSIC_TRACKS_V35[Math.floor(Math.random() * BATTLE_MUSIC_TRACKS_V35.length)];
  if(next === currentBattleMusicTrackV35){
    const alternatives = BATTLE_MUSIC_TRACKS_V35.filter(x => x !== currentBattleMusicTrackV35);
    next = alternatives[Math.floor(Math.random() * alternatives.length)];
  }
  return next;
}

function stopBattleMusicV35(){
  if(battleMusicV35){
    battleMusicV35.pause();
    battleMusicV35.currentTime = 0;
  }
}

function startRandomBattleMusicV35(){
  const track = pickBattleMusicTrackV35();
  if(!track) return;

  stopBattleMusicV35();
  currentBattleMusicTrackV35 = track;

  battleMusicV35 = new Audio(track);
  battleMusicV35.loop = true;
  battleMusicV35.volume = 0.42;

  const playPromise = battleMusicV35.play();
  if(playPromise && typeof playPromise.catch === "function"){
    playPromise
      .then(()=>{ musicUnlockedV35 = true; })
      .catch(()=>{
        // Browsers may block autoplay. The next user click/tap will unlock and play.
        musicUnlockedV35 = false;
        log?.("Music is ready. Tap/click once if your browser blocked autoplay.");
      });
  }
}

function unlockMusicOnUserGestureV35(){
  if(musicUnlockedV35) return;
  if(battleMusicV35){
    battleMusicV35.play()
      .then(()=>{ musicUnlockedV35 = true; })
      .catch(()=>{});
  }
}

document.addEventListener("pointerdown", unlockMusicOnUserGestureV35, {passive:true});
document.addEventListener("keydown", unlockMusicOnUserGestureV35);

// Wrap startBattle so every battle gets a new random background track.
const startBattleBeforeRandomMusicV35 = startBattle;
startBattle = function(){
  startBattleBeforeRandomMusicV35();
  startRandomBattleMusicV35();
};

// Stop music when returning home.
if (typeof goHome === "function") {
  if (typeof goHome === "function") {
  const goHomeBeforeMusicV35 = goHome;
  goHome = function(){
    stopBattleMusicV35();
    goHomeBeforeMusicV35();
  };
}
}


/* ===== v36 keyword popup + readable but faster resolution =====
   Fixes:
   - Missing keyword popup DOM in some builds.
   - Keywords were clickable but had nowhere visible to render.
   - Resolution is now faster, but uses a persistent compact action card + event list.
   - Ability descriptions are shown whenever an action resolves.
*/

function ensureUiLayersV36(){
  if(!$("resolutionOverlay")){
    const d=document.createElement("div");
    d.id="resolutionOverlay";
    d.className="resolutionOverlay hidden";
    document.body.appendChild(d);
  }
  if(!$("keywordPopup")){
    const d=document.createElement("div");
    d.id="keywordPopup";
    d.className="keywordPopup hidden";
    document.body.appendChild(d);
  }
  if(!$("fxLayer")){
    const d=document.createElement("div");
    d.id="fxLayer";
    d.className="fxLayer";
    document.body.appendChild(d);
  }
}
ensureUiLayersV36();


if(typeof window.KEYWORDS_V32_SAFE === "undefined"){
  window.KEYWORDS_V32_SAFE = (typeof KEYWORDS_V32 !== "undefined") ? KEYWORDS_V32 : {
    "pierce": {title:"Pierce X", text:"Ignore X Armor for this hit."},
    "sunder": {title:"Sunder X", text:"Reduce Armor by X until end of round."},
    "exposed": {title:"Exposed", text:"The next damaging hit gets +2 damage, then Exposed is removed."},
    "shield": {title:"Shield", text:"Damage is reduced by Armor first, then Shield absorbs remaining damage before HP. Removed at end of round."},
    "armor": {title:"Armor", text:"Reduces normal damage before Shield and HP."},
    "ignoring armor": {title:"Ignoring Armor", text:"Skips Armor, but Shield still absorbs damage before HP."},
    "ignore armor": {title:"Ignore Armor", text:"Skips Armor, but Shield still absorbs damage before HP."},
    "lose hp": {title:"Lose HP", text:"Direct HP loss. Ignores Armor and Shield."},
    "poison": {title:"Poison", text:"At end of round, take ceil(Poison / 2) HP loss, then remove that much Poison. Ignores Armor and Shield."},
    "bleed": {title:"Bleed", text:"When hit by a damaging attack, remove all Bleed and add that much damage to the hit before Armor/Shield."},
    "freeze": {title:"Freeze", text:"At 5 Freeze, remove Freeze and apply Frozen."},
    "frozen": {title:"Frozen", text:"The next non-Guard action is canceled, then Frozen is removed."},
    "hypnosis": {title:"Hypnosis", text:"Non-stackable control status. Hypnotic abilities can consume or exploit it."},
    "exhausted": {title:"Exhausted", text:"This unit's next non-Guard action is affected by Exhausted, then Exhausted is removed."},
    "guard": {title:"Guard", text:"Resolves before normal actions. Used to protect, dodge, predict, or counter."},
    "dodge": {title:"Dodge", text:"Avoid the next attack targeting this unit this round."},
    "protect": {title:"Protect", text:"If the chosen ally is attacked this round, the protector takes that attack instead. Usually triggers once."},
    "front row": {title:"Front Row", text:"The row closest to the enemy. Melee usually targets this row first."},
    "back row": {title:"Back Row", text:"The row behind the front row."},
    "front row is empty": {title:"Front Row Is Empty", text:"There are no living characters in that side's front row; melee attacks can reach the back row."},
    "melee": {title:"Melee", text:"Close-range attack. Usually targets the front row unless the front row is empty."},
    "ranged": {title:"Ranged", text:"Can target enemies at distance, including back-row characters."},
    "damage": {title:"Damage", text:"Normal damage is reduced by Armor, then Shield, then HP."},
    "hp": {title:"HP", text:"Health. At 0 HP, the unit is defeated."}
  };
}

if(typeof escapeHtmlV32 === "undefined"){
  function escapeHtmlV32(str){
    return String(str ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
}

if(typeof keywordKeyV32 === "undefined"){
  function keywordKeyV32(label){
    const x=String(label||"").toLowerCase();
    if(x==="ignoring armor") return "ignoring armor";
    if(x==="ignore armor") return "ignore armor";
    if(x==="lose hp") return "lose hp";
    if(x==="front row") return "front row";
    if(x==="back row") return "back row";
    if(x==="front row is empty") return "front row is empty";
    return x;
  }
}

function renderKeywordText(text){
  const list=["front row is empty","ignoring Armor","ignore Armor","Lose HP","Pierce","Sunder","Exposed","Shield","Armor","Poison","Bleed","Freeze","Frozen","Hypnosis","Exhausted","Guard","Dodge","Protect","Front row","Back row","Melee","Ranged","Damage","HP"];
  let html=escapeHtmlV32(text);
  const patterns=list.slice().sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  const re=new RegExp(`\\b(${patterns.join("|")})(\\s+\\d+)?\\b`,"gi");
  return html.replace(re,(match,word,num="")=>{
    const key=keywordKeyV32(word);
    if(!((typeof KEYWORDS_V32 !== "undefined" ? KEYWORDS_V32 : window.KEYWORDS_V32_SAFE)[key])) return match;
    const label=`${word}${num||""}`;
    return `<button type="button" class="keywordLink" data-keyword="${key}" data-label="${escapeHtmlV32(label)}">${escapeHtmlV32(label)}</button>`;
  });
}

function showKeywordPopup(key, anchor=null, label=null){
  ensureUiLayersV36();
  const data=((typeof KEYWORDS_V32 !== "undefined" ? KEYWORDS_V32 : window.KEYWORDS_V32_SAFE)[key]);
  const pop=$("keywordPopup");
  if(!data||!pop) return;
  pop.innerHTML=`
    <div class="keywordPopupCard">
      <button class="keywordClose" type="button" aria-label="Close keyword">×</button>
      <div class="keywordEyebrow">Keyword</div>
      <div class="keywordTitle">${escapeHtmlV32(label || data.title)}</div>
      <div class="keywordText">${escapeHtmlV32(data.text)}</div>
    </div>`;
  pop.classList.remove("hidden");
  pop.querySelector(".keywordClose").onclick=(ev)=>{ev.stopPropagation();hideKeywordPopup();};

  if(isMobileLayout?.()){
    pop.classList.add("mobileKeywordPopup");
    pop.style.left="0";pop.style.top="0";pop.style.right="0";pop.style.bottom="0";
    return;
  }

  pop.classList.remove("mobileKeywordPopup");
  const w=320,h=170;
  let x=window.innerWidth/2-w/2,y=window.innerHeight/2-h/2;
  if(anchor){
    const r=anchor.getBoundingClientRect();
    x=r.left+r.width/2-w/2;
    y=r.bottom+10;
    if(y+h>window.innerHeight-8) y=r.top-h-10;
  }
  x=Math.max(8,Math.min(window.innerWidth-w-8,x));
  y=Math.max(8,Math.min(window.innerHeight-h-8,y));
  pop.style.left=x+"px";pop.style.top=y+"px";pop.style.right="auto";pop.style.bottom="auto";
}

function hideKeywordPopup(){
  const pop=$("keywordPopup");
  if(pop) pop.classList.add("hidden");
}

if(!window.__keywordsV36Installed){
  window.__keywordsV36Installed=true;
  document.addEventListener("pointerdown",(ev)=>{
    const kw=ev.target.closest?.(".keywordLink");
    if(kw){
      ev.preventDefault(); ev.stopPropagation();
      showKeywordPopup(kw.dataset.keyword, kw, kw.dataset.label);
    }
  },true);
  document.addEventListener("click",(ev)=>{
    const kw=ev.target.closest?.(".keywordLink");
    if(kw){
      ev.preventDefault(); ev.stopPropagation();
      showKeywordPopup(kw.dataset.keyword, kw, kw.dataset.label);
      return;
    }
    const pop=$("keywordPopup");
    if(pop&&!pop.classList.contains("hidden")&&!ev.target.closest?.(".keywordPopupCard")) hideKeywordPopup();
  },true);
  document.addEventListener("keydown",(ev)=>{if(ev.key==="Escape")hideKeywordPopup();});
}

function actionSummaryV36(actor, ability, target, stage="reveal", events=[]){
  const speedText=ability.guard?"Guard Priority":`Speed ${totalSpeed(actor,ability)}`;
  const targetText=target?target.name:"No target";
  const evHtml=events?.length?`<div class="resolveEventList">${events.slice(0,6).map(e=>`<div class="resolveEvent ${e.type||""}">${renderKeywordText(e.text||String(e))}</div>`).join("")}</div>`:"";
  return `
    <div class="resolveCard ${stage}">
      <div class="resolveTop">
        <span class="resolveIcon" style="background-image:url('${abilityIconUrl(actor, ability)}')"></span>
        <div class="resolveMain">
          <div class="resolveStage">${stage==="result"?"Result":stage==="impact"?"Impact":"Resolving"}</div>
          <div class="resolveTitle">${escapeHtmlV32(actor.name)} — ${escapeHtmlV32(ability.name)}</div>
          <div class="resolveMeta">${actor.side==="enemy"?"Enemy action revealed":"Your action"} · ${ability.cost} AP · ${speedText} · Target: ${escapeHtmlV32(targetText)}</div>
        </div>
      </div>
      <div class="resolveDesc">${renderKeywordText(ability.desc)}</div>
      ${evHtml}
      ${tacticalResolution?`<div class="breakContinueHint">Press Continue</div>`:""}
    </div>`;
}

function showResolutionOverlay(actor, ability, target, stage="reveal", events=[]){
  ensureUiLayersV36();
  const overlay=$("resolutionOverlay");
  if(!overlay)return;
  overlay.innerHTML=actionSummaryV36(actor,ability,target,stage,events);
  overlay.classList.remove("hidden");
}

function hideResolutionOverlay(){
  const overlay=$("resolutionOverlay");
  if(overlay) overlay.classList.add("hidden");
}

function showResolveDetail(actor, ability, target, mode="before", events=[]){
  currentResolveDetail={actorId:actor?.id, abilityId:ability?.id, targetId:target?.id};
  $("infoTitle").innerHTML=`<span>${mode==="after"?"Resolved":"Resolving"} — ${escapeHtmlV32(actor.name)}</span>`;
  $("infoBody").innerHTML=actionSummaryV36(actor,ability,target,mode==="after"?"result":"reveal",events);
}

function cinematicDelay(stage){
  if(tacticalResolution) return 80;
  if(stage==="reveal") return 850;
  if(stage==="impact") return 360;
  if(stage==="result") return 950;
  return 350;
}

async function pauseForStage(stage){
  await sleep(cinematicDelay(stage));
  if(tacticalResolution) await waitForTacticalContinue();
}

// Capture important results without relying on long logs.
currentActionEvents=[];
currentActionBefore=null;

function unitSnapshotV36(u){return {id:u.id,name:u.name,hp:u.hp,shield:u.shield||0,armor:getArmor?getArmor(u):(u.armor||0),status:{...(u.status||{})},dead:!!u.dead};}
function boardSnapshotV36(){return state.units.map(unitSnapshotV36);}
function startActionEventCapture(actor,ability,target){currentActionEvents=[];currentActionBefore=boardSnapshotV36();}
function pushActionEvent(type,text,unitObj=null,extra={}){currentActionEvents.push({type,text,unitId:unitObj?.id||null,...extra});}

function finishActionEventCapture(){
  const after=boardSnapshotV36();
  const beforeById=new Map((currentActionBefore||[]).map(x=>[x.id,x]));
  const diffs=[];
  for(const a of after){
    const b=beforeById.get(a.id); if(!b)continue;
    if(a.hp<b.hp) diffs.push({type:"hp",text:`${a.name} lost ${b.hp-a.hp} HP`});
    if(a.hp>b.hp) diffs.push({type:"heal",text:`${a.name} healed ${a.hp-b.hp} HP`});
    if(a.shield>b.shield) diffs.push({type:"shieldGain",text:`${a.name} gained ${a.shield-b.shield} Shield`});
    if(a.shield<b.shield) diffs.push({type:"shield",text:`${a.name}'s Shield absorbed ${b.shield-a.shield}`});
    if(a.armor<b.armor) diffs.push({type:"armor",text:`${a.name}'s Armor decreased by ${b.armor-a.armor}`});
    if(!b.dead&&a.dead) diffs.push({type:"dead",text:`${a.name} was defeated`});
    const keys=new Set([...Object.keys(b.status||{}),...Object.keys(a.status||{})]);
    for(const k of keys){
      const oldv=b.status[k]||0,newv=a.status[k]||0;
      if(newv>oldv) diffs.push({type:"statusGain",text:`${a.name} gained ${newv-oldv} ${k}`});
      if(newv<oldv) diffs.push({type:"statusLoss",text:`${a.name} lost ${oldv-newv} ${k}`});
    }
  }
  const seen=new Set();
  return [...currentActionEvents,...diffs].filter(e=>{if(seen.has(e.text))return false;seen.add(e.text);return true;});
}

async function resolveRound(){
  if(state.phase!=="planning")return;
  chooseEnemy();
  state.phase="resolving";
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  currentResolveDetail=null;
  const acts=plannedActionsForStrip(true);
  renderBattle();

  for(const act of acts){
    if(!act.unit||act.unit.dead){state.canceledActionKeys.push(act.key);renderBattle();continue;}
    state.currentActionKey=act.key;
    lastAction={actorId:act.unit.id,targetId:act.target?.id,kind:actionKind(act.ability)};
    currentResolveDetail={actorId:act.unit.id,abilityId:act.ability.id,targetId:act.target?.id};

    showActionToast?.(act.unit,act.ability,act.target);
    showResolutionOverlay(act.unit,act.ability,act.target,"reveal");
    showResolveDetail(act.unit,act.ability,act.target,"before");
    log(`${act.unit.name} uses ${act.ability.name}: ${act.ability.desc}`);
    renderBattle();
    await pauseForStage("reveal");

    showResolutionOverlay(act.unit,act.ability,act.target,"impact");
    if(act.target) spawnLine?.(act.unit,act.target,actionKind(act.ability));
    renderBattle();
    await pauseForStage("impact");

    startActionEventCapture(act.unit,act.ability,act.target);
    apply(act.unit,act.ability,act.target);
    const events=finishActionEventCapture();
    if(!state.canceledActionKeys.includes(act.key)) state.resolvedActionKeys.push(act.key);

    showResolutionOverlay(act.unit,act.ability,act.target,"result",events);
    showResolveDetail(act.unit,act.ability,act.target,"after",events);
    renderBattle();
    if(checkWin()) return;
    await pauseForStage("result");
  }

  hideResolutionOverlay();
  currentResolveDetail=null;
  const cont=$("continueResolveBtn");
  if(cont)cont.classList.add("hidden");
  endRound();
}


/* ===== v37 goHome safety fix =====
   Some builds did not define goHome, while the random-music wrapper assumed it existed.
*/
if (typeof goHome !== "function") {
  function goHome(){
    stopBattleMusicV35?.();
    if (typeof showScreen === "function") {
      showScreen("home");
      return;
    }
    const home = $("home");
    const builder = $("builder");
    const arrange = $("arrange");
    const battle = $("battle");
    [builder, arrange, battle].forEach(x => x && x.classList.add("hidden"));
    if(home) home.classList.remove("hidden");
  }
}


/* ===== v38 precise rules text + minimal character info =====
   Goals:
   - Every status/keyword explains exact timing, numbers, and what it affects.
   - Character info panel is minimal: name, proficiencies, stats, current statuses, passive.
   - Active abilities are inspected from the ability wheel, not from the character info panel.
*/

// Exact keyword/status definitions.
if (typeof KEYWORDS_V32 !== "undefined") {
  Object.assign(KEYWORDS_V32, {
    "exhausted": {
      title: "Exhausted",
      text: "The next non-Guard action this unit resolves has -2 Speed and deals -2 damage. Then Exhausted is removed. Guard actions and passives are not affected."
    },
    "exposed": {
      title: "Exposed",
      text: "The next time this unit takes damage from a hit, that hit gets +2 damage before Armor and Shield are calculated. Then Exposed is removed."
    },
    "shield": {
      title: "Shield",
      text: "Temporary protection. Damage is reduced by Armor first, then Shield absorbs the remaining damage before HP is lost. All Shield is removed at end of round."
    },
    "armor": {
      title: "Armor",
      text: "Reduces normal damage before Shield and HP. Example: 5 damage against 2 Armor becomes 3 damage before Shield. Damage ignoring Armor skips this step."
    },
    "pierce": {
      title: "Pierce X",
      text: "For this hit, reduce the target's effective Armor by X. Example: Pierce 2 against 3 Armor means only 1 Armor reduces the hit."
    },
    "sunder": {
      title: "Sunder X",
      text: "Reduce the target's Armor by X until end of round. This affects later hits during the same round, then wears off."
    },
    "poison": {
      title: "Poison",
      text: "At end of round, this unit loses HP equal to ceil(Poison / 2), then removes that many Poison stacks. Poison HP loss ignores Armor and Shield."
    },
    "bleed": {
      title: "Bleed",
      text: "When this unit is hit by a damaging attack, remove all Bleed and add that much damage to the hit before Armor and Shield are calculated."
    },
    "freeze": {
      title: "Freeze",
      text: "Stacking ice status. When this unit reaches 5 Freeze, remove all Freeze and apply Frozen."
    },
    "frozen": {
      title: "Frozen",
      text: "The next non-Guard action this unit tries to resolve is canceled. Then Frozen is removed. Guard actions are not canceled."
    },
    "hypnosis": {
      title: "Hypnosis",
      text: "Non-stackable control status. It does nothing by itself. Hypnotic abilities can consume it or check for it for stronger effects."
    },
    "guard": {
      title: "Guard",
      text: "A defensive action that resolves before normal actions. Guard actions are not canceled by Frozen and are not weakened by Exhausted."
    },
    "protect": {
      title: "Protect",
      text: "Choose an ally. The first attack targeting that ally this round targets the protector instead."
    },
    "dodge": {
      title: "Dodge",
      text: "Avoid the next attack targeting this unit this round. After it avoids one attack, Dodge is removed."
    },
    "ignoring armor": {
      title: "Ignoring Armor",
      text: "This damage skips Armor. Shield still absorbs it before HP is lost."
    },
    "ignore armor": {
      title: "Ignore Armor",
      text: "This damage skips Armor. Shield still absorbs it before HP is lost."
    },
    "lose hp": {
      title: "Lose HP",
      text: "Direct HP loss. It ignores both Armor and Shield."
    },
    "front row is empty": {
      title: "Front Row Is Empty",
      text: "There are no living characters in that side's front row. When this is true, melee attacks can target the back row."
    }
  });
}
if (window.KEYWORDS_V32_SAFE) {
  Object.assign(window.KEYWORDS_V32_SAFE, (typeof KEYWORDS_V32 !== "undefined" ? KEYWORDS_V32 : {}));
}

function statusLineV38(u){
  if(!u || !u.status) return "None";
  const parts = [];
  const order = ["poison","bleed","freeze","frozen","hypnosis","exposed","exhausted"];
  for(const k of order){
    const v = u.status[k] || 0;
    if(v) parts.push(`${k[0].toUpperCase()+k.slice(1)}${v === 1 && ["frozen","hypnosis","exposed","exhausted"].includes(k) ? "" : " " + v}`);
  }
  return parts.length ? parts.join(" · ") : "None";
}

function passiveExactV38(u){
  return u?.passive || "No passive ability.";
}

// Minimal character info: no active ability list.
function renderInfo(){
  let u=selectedId&&unit(selectedId);
  $("infoTitle").innerHTML = u
    ? `<span>${escapeHtmlV32 ? escapeHtmlV32(u.name) : u.name}</span><button id="closeInfoBtn" class="closeInfoBtn" type="button" aria-label="Close info">×</button>`
    : "Plan hidden actions";

  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;

  if(u){
    const enemyNote = u.side === "enemy"
      ? `<div class="statusInfoBox"><b>Enemy intel:</b> You can inspect stats, current statuses, and passive. Active abilities stay hidden until they resolve.</div>`
      : "";

    $("infoBody").innerHTML =
      `<div class="miniInfoCard">
        <div><b>Proficiencies:</b> ${renderKeywordText ? renderKeywordText(`${u.class} / ${u.prof}`) : `${u.class} / ${u.prof}`}</div>
        <div><b>Health:</b> ❤️ ${u.hp}/${u.maxHp}</div>
        <div><b>Armor:</b> 🛡️ ${getArmor ? getArmor(u) : u.armor}</div>
        <div><b>Speed:</b> ⚡ ${u.speed}</div>
        <div><b>Current statuses:</b> ${renderKeywordText ? renderKeywordText(statusLineV38(u)) : statusLineV38(u)}</div>
        <div><b>Passive:</b> ${renderKeywordText ? renderKeywordText(passiveExactV38(u)) : passiveExactV38(u)}</div>
      </div>
      ${enemyNote}`;
  } else {
    $("infoBody").innerHTML = `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
  }

  const btn = $("closeInfoBtn");
  if(btn) btn.onclick = (ev) => {
    ev.stopPropagation();
    closeInfoPanel();
  };

  if(pendingAbility && selectedId) previewTargeting(unit(selectedId), pendingAbility);
}

function tunePreciseTextV38(){
  const byId = id => ROSTER.find(c=>c.id===id);
  const set = (id, patch) => { const c=byId(id); if(c) Object.assign(c, patch); };

  set("smithen", {
    passive:"Passive — Frost Edge: Smithen's damaging abilities deal +2 damage to targets that currently have any Freeze stacks.",
    abilities:[
      A("needle","Ice Needle",1,3,"Ranged attack. Deal 2 damage with Pierce 1. Then apply 1 Freeze to the target.","damageStatus",{dmg:2,status:"freeze",stacks:1,range:"ranged",pierce:1}),
      A("flash","Whiteout Step",1,99,"Guard. Smithen gains Dodge. Dodge prevents the next attack targeting Smithen this round, then Dodge is removed.","dodge",{guard:true}),
      A("pin","Frost Pin",1,2,"Ranged status. Apply 2 Freeze to one enemy. If that enemy already had any Freeze before this ability, also apply Exposed.","whiteout",{range:"ranged"}),
      A("shatter","Shatter Shot",2,0,"Ranged payoff attack. Deal 4 damage with Pierce 1. If the target has any Freeze, deal +5 damage, then remove all Freeze from that target.","shatter",{range:"ranged",pierce:1})
    ]
  });

  set("dravain", {
    passive:"Passive — Blood Guard: when Dravain uses Blood Claim and removes Bleed from a target, Dravain gains 3 Shield until end of round.",
    abilities:[
      A("protect","Protect Ally",1,99,"Guard. Choose an ally. The first attack targeting that ally this round targets Dravain instead.","protect",{guard:true,range:"ally"}),
      A("bash","Shield Bash",1,0,"Melee attack. Deal damage equal to 2 plus Dravain's current Armor. This damage is reduced by the target's Armor and Shield normally.","armorStrike",{range:"melee"}),
      A("drain","Vampiric Thrust",2,-1,"Melee attack. Deal 5 damage. After the hit resolves, Dravain restores 3 HP.","drain",{dmg:5,heal:3,range:"melee"}),
      A("claim","Blood Claim",2,-2,"Bleed payoff. Remove all Bleed from one enemy. Deal damage equal to removed Bleed plus 4. Then Dravain restores 2 HP and gains 3 Shield until end of round.","consumeBleed",{bonus:4,heal:2,range:"ranged"})
    ]
  });

  set("yaura", {
    passive:"Passive — Blood Echo: once per round, when one of your own abilities makes an ally lose HP, apply 1 Bleed to each enemy in the front row.",
    abilities:[
      A("ward","Blood Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt. The attacker also gains 1 Bleed.","ward",{guard:true,range:"ally",shield:5}),
      A("bolt","Blood Bolt",1,1,"Ranged attack. Deal 2 damage ignoring Armor. Shield can still absorb this damage. Then apply 2 Bleed.","damageStatus",{dmg:2,status:"bleed",stacks:2,range:"ranged",ignoreArmor:true}),
      A("price","Blood Price",1,0,"Bloodcraft magic. Choose an ally. That ally loses 2 HP; this ignores Armor and Shield. Then each enemy in the front row takes 4 damage ignoring Armor; Shield can still absorb this enemy damage.","allyPain",{range:"ally",dmg:4,self:2,ignoreArmor:true}),
      A("rain","Red Rain",2,-1,"Area status. Apply 2 Bleed to every enemy. This ability deals no immediate damage.","allStatus",{status:"bleed",stacks:2})
    ]
  });

  set("kku", {
    passive:"Passive — Cold Hide: after an enemy hits K'ku with a melee attack, that enemy gains 1 Freeze.",
    abilities:[
      A("guard","Ice Guard",1,99,"Guard. If K'ku is attacked this round, K'ku gains 6 Shield before damage is dealt. The attacker also gains 2 Freeze.","selfCounter",{guard:true,status:"freeze",stacks:2,shield:6}),
      A("slam","Frost Slam",1,0,"Melee attack. Deal 4 damage. Then apply 1 Freeze and Sunder 1 to the target until end of round.","damageStatus",{dmg:4,status:"freeze",stacks:1,range:"melee",sunder:1}),
      A("break","Glacier Break",2,-2,"Melee breaker. Deal 5 damage and Sunder 2 until end of round. If the target has any Freeze, deal +5 damage.","glacier",{range:"melee",sunder:2}),
      A("roar","Blizzard Roar",2,-3,"Front-row status. Apply 2 Freeze to each enemy in the front row. This ability deals no immediate damage.","rowStatus",{status:"freeze",stacks:2,row:"front"})
    ]
  });

  set("kahro", {
    passive:"Passive — Opportunist: Kahro's damaging abilities deal +1 damage to targets that currently have any negative status.",
    abilities:[
      A("needle","Shadow Needle",1,4,"Ranged precision attack. Deal 3 damage with Pierce 2.","damage",{dmg:3,range:"ranged",pierce:2}),
      A("mark","Shadow Mark",1,3,"Ranged setup. Apply Exposed and 1 Bleed to one enemy. This ability deals no immediate damage.","multiStatus",{statuses:[["exposed",1],["bleed",1]],range:"ranged"}),
      A("assassinate","Assassinate",2,0,"Ranged finisher. Deal 5 damage with Pierce 2. If the target is in the back row and that side's front row is empty, deal +4 damage.","assassinate",{range:"ranged",pierce:2}),
      A("vanish","Vanish",1,99,"Guard. Kahro gains Dodge. Dodge prevents the next attack targeting Kahro this round, then Dodge is removed.","dodge",{guard:true})
    ]
  });

  set("maoja", {
    passive:"Passive — Toxic Momentum: Maoja's damaging abilities deal +1 damage to targets that currently have Poison.",
    abilities:[
      A("hands","Poison Hands",1,2,"Ally buff. Choose an ally. Until end of next round, each damaging hit by that ally also applies 2 Poison to its target.","poisonHands",{range:"ally"}),
      A("grip","Corrosive Grip",1,0,"Melee attack. Deal 3 damage and Sunder 1 until end of round. Then apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted.","toxicGrip",{range:"melee",sunder:1}),
      A("breath","Caustic Breath",2,-1,"Row status. Choose an enemy row. Apply 4 Poison to each enemy in that row. This ability deals no immediate damage.","rowStatus",{status:"poison",stacks:4,range:"ranged"}),
      A("burst","Rot Burst",2,-3,"Poison payoff. Remove all Poison from one enemy. Deal damage equal to 2 times the removed Poison, ignoring Armor. Shield can still absorb this damage.","poisonBurst",{range:"ranged",ignoreArmor:true})
    ]
  });

  set("paleya", {
    passive:"Passive — Mind Weaver: the first time each round Paleya consumes Hypnosis with Mind Lance, gain +1 Action next round.",
    abilities:[
      A("lance","Mind Lance",1,1,"Magic attack. Deal 3 damage ignoring Armor. Shield can still absorb this damage. If the target has Hypnosis, remove Hypnosis and deal 7 damage ignoring Armor instead.","mindBreak",{range:"ranged",ignoreArmor:true}),
      A("mesmer","Mesmerize",1,2,"Ranged control. Apply Hypnosis to one enemy. Hypnosis is non-stackable and does nothing until another ability uses it.","status",{status:"hypnosis",stacks:1,range:"ranged"}),
      A("mirror","Mirror Guard",1,99,"Guard prediction. Choose an enemy. If it uses a damaging attack this round, cancel that action and apply Hypnosis and Exposed to it.","predict",{guard:true,range:"ranged"}),
      A("mass","Mass Suggestion",2,0,"Front-row control. Apply Hypnosis and Exposed to each enemy in the front row. This ability deals no immediate damage.","frontHypno",{range:"ranged"})
    ]
  });

  set("poom", {
    passive:"Passive — Mirror Mind: after an enemy hits Poom with a melee attack, that enemy gains Hypnosis.",
    abilities:[
      A("guard","Guard Mind",1,99,"Guard. If Poom is attacked this round, Poom gains 4 Shield before damage is dealt. The attacker also gains Hypnosis.","selfCounter",{guard:true,status:"hypnosis",stacks:1,shield:4}),
      A("bash","Bash",1,0,"Melee attack. Deal 3 damage and Sunder 1 until end of round.","damage",{dmg:3,range:"melee",sunder:1}),
      A("roar","Mesmer Roar",2,-1,"Front-row control. Apply Hypnosis and Exposed to each enemy in the front row. This ability deals no immediate damage.","frontHypno",{range:"ranged"}),
      A("bodyguard","Revenge Body",2,-1,"Melee attack. Poom loses 2 HP; this ignores Armor and Shield. Then deal 5 damage. If Poom already lost HP this round, deal +3 damage. Sunder 1 until end of round.","revenge",{dmg:5,self:2,range:"melee",sunder:1})
    ]
  });

  set("bahl", {}); // safety for alternate id
  set("shaman", {
    name:"Bahl",
    passive:"Passive — Demon Infection: when Bahl applies Poison with an ability, each enemy in the front row also gains 1 Bleed. When Bahl applies Bleed with an ability, each enemy in the front row also gains 1 Poison.",
    abilities:[
      A("mark","Infect Mark",1,2,"Ranged status. Apply 2 Poison and 1 Bleed to one enemy. This ability deals no immediate damage.","multiStatus",{statuses:[["poison",2],["bleed",1]],range:"ranged"}),
      A("proliferate","Dark Proliferation",2,1,"Ranged payoff. Choose an enemy. Double that enemy's current Poison, Bleed, and Freeze stacks. If it has Hypnosis, also apply Exposed. This ability deals no immediate damage.","proliferate",{range:"ranged"}),
      A("plague","Plague Wave",2,0,"Row status. Choose an enemy row. Apply 3 Poison to each enemy in that row. This ability deals no immediate damage.","rowStatus",{status:"poison",stacks:3,range:"ranged"}),
      A("ward","Demon Ward",1,99,"Guard. Choose an ally. If that ally is attacked this round, they gain 5 Shield before damage is dealt. The attacker also gains 1 Bleed.","ward",{guard:true,range:"ally",shield:5})
    ]
  });

  set("eva", {
    passive:"Passive — Crimson Hunger: when Lady Eva hits a target that had Bleed before the hit, Lady Eva restores 1 HP.",
    abilities:[
      A("stab","Crimson Stab",1,4,"Melee precision attack. Deal 2 damage with Pierce 2. If the target had Bleed before the hit, Lady Eva restores 1 HP.","bloodDash",{range:"melee",pierce:2}),
      A("mist","Mist Step",1,99,"Guard. Lady Eva gains Dodge. Dodge prevents the next attack targeting Lady Eva this round, then Dodge is removed.","dodge",{guard:true}),
      A("kiss","Vampire Kiss",2,1,"Ranged attack. Deal 3 damage with Pierce 1. Then apply 3 Bleed.","damageStatus",{dmg:3,status:"bleed",stacks:3,range:"ranged",pierce:1}),
      A("bite","Final Bite",2,0,"Bleed payoff. Remove all Bleed from one enemy. Deal damage equal to removed Bleed plus 4 with Pierce 1. Then Lady Eva restores 2 HP.","consumeBleed",{bonus:4,heal:2,range:"melee",pierce:1})
    ]
  });

  set("hyafrost", {
    passive:"Passive — Deep Winter: whenever Hyafrost applies Freeze with one of his abilities, Hyafrost gains 1 Shield until end of round.",
    abilities:[
      A("frostbite","Frostbite",1,1,"Magic status. Apply 2 Freeze to one enemy. If the target already had Freeze before this ability, also deal 2 damage ignoring Armor. Shield can still absorb this damage.","whiteout",{range:"ranged",ignoreArmor:true}),
      A("armor","Frost Armor",1,2,"Ally support. Choose an ally. That ally gains +2 Armor and 3 Shield until end of round.","armorBuff",{range:"ally",armor:2,shield:3}),
      A("field","Frozen Field",2,0,"Row control. Choose an enemy row. Apply 2 Freeze to each enemy in that row. This ability deals no immediate damage.","rowStatus",{status:"freeze",stacks:2,range:"ranged"}),
      A("zero","Absolute Zero",2,-2,"Magic payoff. Deal 3 damage ignoring Armor to each enemy that currently has Freeze. Shield can still absorb this damage. Then apply Exhausted to each damaged enemy.","absoluteZero",{dmg:3,ignoreArmor:true})
    ]
  });

  set("bakub", {
    passive:"Passive — Nightmare Brew: Bakub's damaging abilities deal +2 damage to targets that currently have both Poison and Hypnosis.",
    abilities:[
      A("vial","Nightmare Vial",1,2,"Ranged status. Apply 2 Poison and Hypnosis to one enemy. This ability deals no immediate damage.","multiStatus",{statuses:[["poison",2],["hypnosis",1]],range:"ranged"}),
      A("toxin","Mind Toxin",1,1,"Magic attack. Deal 3 damage ignoring Armor. Shield can still absorb this damage. If the target has Hypnosis, also apply 3 Poison.","mindToxin",{range:"ranged",ignoreArmor:true}),
      A("fog","Demon Fog",2,0,"Row status. Choose an enemy row. Apply 1 Poison and Hypnosis to each enemy in that row. This ability deals no immediate damage.","rowMultiStatus",{statuses:[["poison",1],["hypnosis",1]],range:"ranged"}),
      A("future","False Future",1,99,"Guard prediction. Choose an enemy. If that enemy uses a damaging attack this round, cancel that action and apply 2 Poison to that enemy.","predictPoison",{guard:true,range:"ranged"})
    ]
  });
}

tunePreciseTextV38();


/* ===== v39 tactical resolve + animated arrows + armor bugfix =====
   Fixes:
   - effectiveArmorForHit missing.
   - Tactical Resolution toggle visible and works one step at a time.
   - Animated arrows from actor to target(s) during resolution.
*/

function effectiveArmorForHit(target, opt={}){
  const armor = getArmor ? getArmor(target) : Math.max(0, target?.armor || 0);
  if(opt.ignoreArmor) return 0;
  return Math.max(0, armor - (opt.pierce || 0));
}

// Exhausted Option A: next non-Guard action has -2 Speed and deals -2 damage.
function exhaustedSpeedPenalty(u, ability){
  return (u?.status?.exhausted && !ability?.guard) ? -2 : 0;
}

const totalSpeedBeforeV39 = totalSpeed;
totalSpeed = function(u,a){
  return totalSpeedBeforeV39(u,a) + exhaustedSpeedPenalty(u,a);
};

// Some older damage/apply paths did not reduce damage for Exhausted.
// This wraps damage so Exhausted's -2 damage is always enforced for the acting unit's next non-Guard action.
const damageBeforeExhaustedV39 = damage;
damage = function(src,t,amt,opt={}){
  const active = state?.currentActionKey ? plannedActionsForStrip(true).find(x=>x.key===state.currentActionKey) : null;
  const shouldReduce = active && active.unit === src && src?.status?.exhausted && !active.ability?.guard && opt.attack;
  const finalAmt = shouldReduce ? Math.max(0, amt - 2) : amt;
  if(shouldReduce){
    pushActionEvent?.("statusTrigger", `Exhausted reduced ${src.name}'s damage by 2`, src);
    spawnFloatingText?.(src, "Exhausted -2 dmg", "status");
  }
  return damageBeforeExhaustedV39(src,t,finalAmt,opt);
};

function ensureTacticalControlsV39(){
  let resolve = $("resolveBtn");
  if(!$("tacticalToggleBtn")){
    const b=document.createElement("button");
    b.id="tacticalToggleBtn";
    b.className="pill tacticalToggleBtn";
    b.type="button";
    b.textContent="Tactical: Off";
    resolve?.insertAdjacentElement("afterend", b);
  }
  if(!$("continueResolveBtn")){
    const c=document.createElement("button");
    c.id="continueResolveBtn";
    c.className="primary continueResolveBtn hidden";
    c.type="button";
    c.textContent="Continue";
    $("tacticalToggleBtn")?.insertAdjacentElement("afterend", c);
  }
}
ensureTacticalControlsV39();

if(typeof tacticalResolution === "undefined"){
  var tacticalResolution = localStorage.getItem("splitSecondsTacticalResolution") === "1";
}
if(typeof tacticalContinue === "undefined"){
  var tacticalContinue = null;
}

function setTacticalResolution(on){
  tacticalResolution = !!on;
  localStorage.setItem("splitSecondsTacticalResolution", tacticalResolution ? "1" : "0");
  updateTacticalButtons();
}

function updateTacticalButtons(){
  ensureTacticalControlsV39();
  const btn=$("tacticalToggleBtn");
  if(btn){
    btn.textContent = tacticalResolution ? "Tactical: On" : "Tactical: Off";
    btn.classList.toggle("active", tacticalResolution);
  }
  const cont=$("continueResolveBtn");
  if(cont && !tacticalContinue) cont.classList.add("hidden");
}

function installTacticalButtons(){
  ensureTacticalControlsV39();
  const toggle=$("tacticalToggleBtn");
  if(toggle) toggle.onclick=()=>setTacticalResolution(!tacticalResolution);
  const cont=$("continueResolveBtn");
  if(cont) cont.onclick=()=>{
    if(tacticalContinue){
      const fn=tacticalContinue;
      tacticalContinue=null;
      cont.classList.add("hidden");
      fn();
    }
  };
  updateTacticalButtons();
}

function waitForTacticalContinue(){
  if(!tacticalResolution) return Promise.resolve();
  ensureTacticalControlsV39();
  const cont=$("continueResolveBtn");
  if(cont){
    cont.classList.remove("hidden");
    cont.textContent="Continue";
  }
  return new Promise(resolve=>{ tacticalContinue=resolve; });
}

// Tactical = one click per action, not three clicks.
// Auto = quick reveal/impact/result.
function cinematicDelay(stage){
  if(tacticalResolution) return 40;
  if(stage==="reveal") return 650;
  if(stage==="impact") return 260;
  if(stage==="result") return 760;
  return 280;
}

async function pauseForStage(stage){
  await sleep(cinematicDelay(stage));
  if(tacticalResolution && stage==="result") await waitForTacticalContinue();
}

function affectedTargetsForActionV39(actor, ability, target){
  if(!actor || !ability) return target ? [target] : [];
  const enemySide = other(actor.side);
  switch(ability.effect){
    case "rowStatus":
    case "rowDamageStatus":
    case "rowMultiStatus":
      return rowUnits(enemySide, target?.row || ability.row || "front").filter(x=>!x.dead);
    case "frontHypno":
      return rowUnits(enemySide,"front").filter(x=>!x.dead);
    case "allStatus":
    case "allDamageStatus":
      return alive(enemySide);
    case "absoluteZero":
      return alive(enemySide).filter(x=>x.status?.freeze);
    case "allyPain":
    case "allyBleed":
      return [target, ...rowUnits(enemySide,"front").filter(x=>!x.dead)].filter(Boolean);
    default:
      return target ? [target] : [];
  }
}

function spawnArrowV39(fromUnit, toUnit, kind="attack", delay=0){
  const a=tileEl(fromUnit?.id), b=tileEl(toUnit?.id);
  const fx=fxLayer?.();
  if(!a||!b||!fx) return;
  const p1=centerOf(a), p2=centerOf(b);
  const dx=p2.x-p1.x, dy=p2.y-p1.y;
  const len=Math.max(24, Math.hypot(dx,dy));
  const ang=Math.atan2(dy,dx)*180/Math.PI;
  const arrow=document.createElement("div");
  arrow.className=`actionArrow ${kind}`;
  arrow.style.left=p1.x+"px";
  arrow.style.top=p1.y+"px";
  arrow.style.width=len+"px";
  arrow.style.transform=`rotate(${ang}deg)`;
  arrow.style.animationDelay=delay+"ms";
  fx.appendChild(arrow);
  setTimeout(()=>arrow.remove(), 1050+delay);
}

function spawnActionArrowsV39(actor, ability, target){
  const targets=affectedTargetsForActionV39(actor,ability,target);
  const kind=actionKind(ability);
  targets.forEach((t,i)=>spawnArrowV39(actor,t,kind,i*90));
}

// Keep old line API but make it an arrow.
function spawnLine(fromUnit,toUnit,kind="attack"){
  spawnArrowV39(fromUnit,toUnit,kind,0);
}

async function resolveRound(){
  if(state.phase!=="planning")return;
  chooseEnemy();
  state.phase="resolving";
  state.resolvedActionKeys=[];
  state.canceledActionKeys=[];
  currentResolveDetail=null;
  const acts=plannedActionsForStrip(true);
  renderBattle();

  for(const act of acts){
    if(!act.unit||act.unit.dead){state.canceledActionKeys.push(act.key);renderBattle();continue;}
    state.currentActionKey=act.key;
    lastAction={actorId:act.unit.id,targetId:act.target?.id,kind:actionKind(act.ability)};
    currentResolveDetail={actorId:act.unit.id,abilityId:act.ability.id,targetId:act.target?.id};

    showActionToast?.(act.unit,act.ability,act.target);
    showResolutionOverlay(act.unit,act.ability,act.target,"reveal");
    showResolveDetail(act.unit,act.ability,act.target,"before");
    log(`${act.unit.name} uses ${act.ability.name}: ${act.ability.desc}`);
    renderBattle();
    await pauseForStage("reveal");

    showResolutionOverlay(act.unit,act.ability,act.target,"impact");
    spawnActionArrowsV39(act.unit,act.ability,act.target);
    renderBattle();
    await pauseForStage("impact");

    startActionEventCapture(act.unit,act.ability,act.target);
    apply(act.unit,act.ability,act.target);
    const events=finishActionEventCapture();
    if(!state.canceledActionKeys.includes(act.key)) state.resolvedActionKeys.push(act.key);

    showResolutionOverlay(act.unit,act.ability,act.target,"result",events);
    showResolveDetail(act.unit,act.ability,act.target,"after",events);
    renderBattle();
    if(checkWin()) return;
    await pauseForStage("result");

    // Remove Exhausted after the unit's next non-Guard action fully resolves.
    if(act.unit?.status?.exhausted && !act.ability?.guard){
      act.unit.status.exhausted=0;
      log(`${act.unit.name}'s Exhausted is removed.`);
    }
  }

  hideResolutionOverlay();
  currentResolveDetail=null;
  const cont=$("continueResolveBtn");
  if(cont)cont.classList.add("hidden");
  tacticalContinue=null;
  endRound();
}

installTacticalButtons();


/* ===== v40 shipped-feeling mobile radial menu =====
   Mobile keeps the radial menu, but it is redesigned for touch:
   - Large wheel, placed in a stable thumb-friendly lower-center area.
   - Large finger-sized ability buttons.
   - First tap previews, second tap chooses.
   - Big readable bottom ability sheet.
   - Tap outside wheel closes it.
*/

function isPhoneLayoutV40(){
  return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
}

function positionAbilityTooltipV34(tooltip, wheel, btn, index){
  if(!tooltip || !wheel || !btn) return;

  if(isPhoneLayoutV40()){
    tooltip.classList.add("mobileAbilitySheet");
    tooltip.style.left = "10px";
    tooltip.style.right = "10px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "max(10px, env(safe-area-inset-bottom))";
    tooltip.style.width = "calc(100vw - 20px)";
    return;
  }

  tooltip.classList.remove("mobileAbilitySheet");
  const wr = wheel.getBoundingClientRect();
  const br = btn.getBoundingClientRect();
  const tw = Math.min(360, window.innerWidth - 20);
  const th = Math.min(220, window.innerHeight * 0.38);
  let x, y;
  if(index === 0){
    x = wr.left + wr.width / 2 - tw / 2;
    y = wr.top - th - 14;
  } else if(index === 2){
    x = wr.left + wr.width / 2 - tw / 2;
    y = wr.bottom + 14;
  } else if(index === 1){
    x = wr.right + 14;
    y = br.top + br.height / 2 - th / 2;
  } else {
    x = wr.left - tw - 14;
    y = br.top + br.height / 2 - th / 2;
  }
  x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
  y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.style.width = tw + "px";
}

function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");
  if(!radial || !wheel) return;

  wheelPreviewAbilityIdV34 = null;
  radial.classList.remove("hidden");
  radial.classList.toggle("mobileRadialMode", isPhoneLayoutV40());
  if(tooltip) {
    tooltip.classList.add("hidden");
    tooltip.classList.remove("mobileAbilitySheet");
  }

  let size;
  if(isPhoneLayoutV40()){
    size = Math.min(window.innerWidth * 0.92, window.innerHeight * 0.46, 430);
    size = Math.max(330, size);
  } else {
    size = Math.min(380, Math.max(310, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
  }
  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;

  if(isPhoneLayoutV40()){
    // Stable lower-center anchor: feels intentional and keeps buttons readable.
    // Leave space for the ability sheet below.
    const sheetReserve = Math.min(190, Math.max(150, window.innerHeight * 0.22));
    cy = window.innerHeight - sheetReserve - size * 0.42;
    cx = window.innerWidth / 2;
  } else if(tile){
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  const margin = size / 2 + 8;
  cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
  cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));
  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `
    <div class="miniCenterName">${escapeHtmlV32 ? escapeHtmlV32(u.name) : u.name}</div>
    <div class="miniCenterHint">${isPhoneLayoutV40() ? "tap twice" : "choose"}</div>
  `;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    return `<button class="wheelBtn w${i}" ${state.actionsLeft<a.cost?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')">
      <span class="wheelBtnTitle">${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</span>
      <span class="wheelBtnMeta">${a.cost} AP · ${speedLabel}</span>
    </button>`;
  }).join("");

  const chooseAbility = (a) => {
    pendingAbility = a;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
    hideKeywordPopup?.();
    renderBattle();
    if(!targets(u,pendingAbility).length) plan(null);
  };

  const showTipFor = (btn, a) => {
    if(!tooltip) return;
    tooltip.innerHTML = `
      <div class="tipTop">
        <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
        <div>
          <b>${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</b>
          <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
        </div>
      </div>
      <div class="abilityDescText">${renderKeywordText ? renderKeywordText(a.desc) : a.desc}</div>
      ${clarityTextForAbility ? clarityTextForAbility(a) : ""}
      <div class="tipTags">
        <span>${escapeHtmlV32 ? escapeHtmlV32(abilityIconKey(u,a)) : abilityIconKey(u,a)}</span>
        <span>${escapeHtmlV32 ? escapeHtmlV32(a.range || (a.guard ? "guard" : "self")) : (a.range || (a.guard ? "guard" : "self"))}</span>
        ${isPhoneLayoutV40() ? "<span>tap same ability again to choose</span>" : ""}
      </div>
    `;
    tooltip.classList.remove("hidden");
    positionAbilityTooltipV34(tooltip, wheel, btn, Number(btn.dataset.index));
  };

  if(tooltip){
    tooltip.onpointerdown = (ev) => {
      const kw = ev.target.closest(".keywordLink");
      if(kw){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
      } else {
        ev.stopPropagation();
      }
    };
    tooltip.onclick = (ev) => {
      const kw = ev.target.closest(".keywordLink");
      if(kw){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
        return;
      }
      ev.stopPropagation();
    };
  }

  document.querySelectorAll(".wheelBtn").forEach(btn=>{
    const a = u.abilities.find(x=>x.id===btn.dataset.id);

    btn.onmouseenter = () => { if(!isPhoneLayoutV40()) showTipFor(btn,a); };
    btn.onfocus = () => showTipFor(btn,a);
    btn.onmouseleave = () => {
      if(!isPhoneLayoutV40() && tooltip) tooltip.classList.add("hidden");
    };

    const previewOrChoose = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      if(isPhoneLayoutV40()){
        showTipFor(btn,a);
        if(wheelPreviewAbilityIdV34 === a.id){
          chooseAbility(a);
        } else {
          wheelPreviewAbilityIdV34 = a.id;
          document.querySelectorAll(".wheelBtn").forEach(x=>x.classList.remove("previewing"));
          btn.classList.add("previewing");
        }
        return;
      }

      chooseAbility(a);
    };

    btn.ontouchstart = previewOrChoose;
    btn.onclick = previewOrChoose;
  });

  // Tap outside the wheel closes it, but not if tapping the tooltip/keyword popup.
  radial.onclick = (ev) => {
    if(ev.target.closest(".wheel") || ev.target.closest("#abilityTooltip") || ev.target.closest("#keywordPopup")) return;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
  };
}

// Reposition open mobile wheel on orientation/resize.
window.addEventListener("resize", () => {
  if(!$("radial")?.classList.contains("hidden") && selectedId){
    const u = selectedUnit();
    if(u) openWheel(u);
  }
});


/* ===== v41 resolution polish: continue button, readable float text, static target lines, correct icons =====
   Fixes:
   - The "Press Continue" hint is replaced by the real Continue button inside the resolve card.
   - Target arrows are now static readable beams, not rotating/janky animated arrows.
   - Floating combat text stays longer.
   - Ability icons use explicit ability tags before text heuristics.
*/

const ABILITY_ICON_OVERRIDES_V41 = {
  // Smithen
  iceNeedle:"icecraft", needle:"icecraft", flash:"icecraft", pin:"icecraft", shatter:"icecraft",
  // Dravain
  protect:"warrior", bash:"warrior", drain:"vampire", claim:"vampire",
  // Yaura
  ward:"bloodcraft", bolt:"bloodcraft", price:"bloodcraft", rain:"bloodcraft",
  // K'ku
  guard:"icecraft", slam:"icecraft", break:"brute", roar:"icecraft",
  // Kahro
  mark:"darkness", assassinate:"assassin", vanish:"assassin",
  // Maoja
  hands:"witchcraft", grip:"witchcraft", breath:"witchcraft", burst:"witchcraft",
  // Paleya
  lance:"hypnotic", mesmer:"hypnotic", mirror:"hypnotic", mass:"hypnotic",
  // Poom
  bodyguard:"brute",
  // Bahl
  proliferate:"demon", plague:"demon",
  // Lady Eva
  stab:"vampire", mist:"assassin", kiss:"vampire", bite:"vampire",
  // Hyafrost
  frostbite:"icecraft", armor:"icecraft", field:"icecraft", zero:"icecraft",
  // Bakub
  vial:"witchcraft", toxin:"witchcraft", fog:"demon", future:"hypnotic"
};

function abilityIconKey(caster, ability) {
  if (ability?.iconKey) return ability.iconKey;
  if (ABILITY_ICON_OVERRIDES_V41[ability?.id]) return ABILITY_ICON_OVERRIDES_V41[ability.id];

  const text = `${ability?.name || ""} ${ability?.desc || ""} ${ability?.effect || ""}`.toLowerCase();

  // Important: guard/protect should be checked before status words in the text,
  // otherwise "attacker gains Hypnosis" incorrectly makes Guard Mind hypnotic.
  if (/protect|guard|ward|wall/.test(text)) return caster?.class || "warrior";
  if (/freeze|frost|ice|blizzard|glacier|whiteout|zero|winter/.test(text)) return "icecraft";
  if (/blood|bleed|crimson|fang|vampir|bite|drain/.test(text)) return caster?.prof?.includes("bloodcraft") ? "bloodcraft" : "vampire";
  if (/poison|toxic|rot|caustic|vial|brew|witch|potion/.test(text)) return "witchcraft";
  if (/hypno|mind|dream|mesmer|predict|future/.test(text)) return "hypnotic";
  if (/shadow|dark|exposed|assassinate/.test(text)) return "darkness";
  if (/demon|plague|infect/.test(text)) return "demon";
  if (/slash|strike|thrust|bash/.test(text)) return caster?.class || "warrior";

  return caster?.class || "warrior";
}

function actionSummaryV36(actor, ability, target, stage="reveal", events=[]){
  const speedText=ability.guard?"Guard Priority":`Speed ${totalSpeed(actor,ability)}`;
  const targetText=target?target.name:"No target";
  const evHtml=events?.length?`<div class="resolveEventList">${events.slice(0,6).map(e=>`<div class="resolveEvent ${e.type||""}">${renderKeywordText(e.text||String(e))}</div>`).join("")}</div>`:"";
  return `
    <div class="resolveCard ${stage}">
      <div class="resolveTop">
        <span class="resolveIcon" style="background-image:url('${abilityIconUrl(actor, ability)}')"></span>
        <div class="resolveMain">
          <div class="resolveStage">${stage==="result"?"Result":stage==="impact"?"Impact":"Resolving"}</div>
          <div class="resolveTitle">${escapeHtmlV32(actor.name)} — ${escapeHtmlV32(ability.name)}</div>
          <div class="resolveMeta">${actor.side==="enemy"?"Enemy action revealed":"Your action"} · ${ability.cost} AP · ${speedText} · Target: ${escapeHtmlV32(targetText)}</div>
        </div>
      </div>
      <div class="resolveDesc">${renderKeywordText(ability.desc)}</div>
      ${evHtml}
      ${tacticalResolution && stage==="result" ? `<button id="inlineContinueResolveBtn" class="inlineContinueResolveBtn" type="button">Continue</button>` : ""}
    </div>`;
}

function hookInlineContinueV41(){
  const inline=$("inlineContinueResolveBtn");
  const hidden=$("continueResolveBtn");
  if(inline){
    inline.onclick=(ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      if(tacticalContinue){
        const fn=tacticalContinue;
        tacticalContinue=null;
        hidden?.classList.add("hidden");
        inline.disabled=true;
        fn();
      }
    };
  }
}

function showResolutionOverlay(actor, ability, target, stage="reveal", events=[]){
  ensureUiLayersV36?.();
  const overlay=$("resolutionOverlay");
  if(!overlay)return;
  overlay.innerHTML=actionSummaryV36(actor,ability,target,stage,events);
  overlay.classList.remove("hidden");
  hookInlineContinueV41();
}

function waitForTacticalContinue(){
  if(!tacticalResolution) return Promise.resolve();
  const hidden=$("continueResolveBtn");
  if(hidden) hidden.classList.add("hidden"); // use inline button instead
  hookInlineContinueV41();
  return new Promise(resolve=>{ tacticalContinue=resolve; });
}

function spawnFloatingText(unitObj, text, kind="hp"){
  const el = tileEl(unitObj?.id);
  const fx = fxLayer?.();
  if(!el || !fx) return;
  const c = centerOf(el);
  const div = document.createElement("div");
  div.className = `floatText ${kind}`;
  div.textContent = text;
  div.style.left = c.x + "px";
  div.style.top = (c.y - c.h*0.10) + "px";
  fx.appendChild(div);
  setTimeout(()=>div.remove(), 3200);
}

function spawnArrowV39(fromUnit, toUnit, kind="attack", delay=0){
  const a=tileEl(fromUnit?.id), b=tileEl(toUnit?.id);
  const fx=fxLayer?.();
  if(!a||!b||!fx) return;
  const p1=centerOf(a), p2=centerOf(b);
  const dx=p2.x-p1.x, dy=p2.y-p1.y;
  const len=Math.max(24, Math.hypot(dx,dy));
  const ang=Math.atan2(dy,dx)*180/Math.PI;
  const beam=document.createElement("div");
  beam.className=`actionBeam ${kind}`;
  beam.style.left=p1.x+"px";
  beam.style.top=p1.y+"px";
  beam.style.width=len+"px";
  beam.style.transform=`rotate(${ang}deg)`;
  beam.style.animationDelay=delay+"ms";
  fx.appendChild(beam);
  setTimeout(()=>beam.remove(), 1800+delay);
}

function spawnLine(fromUnit,toUnit,kind="attack"){
  spawnArrowV39(fromUnit,toUnit,kind,0);
}


/* ===== v42 icecraft/dread/payoff changes =====
   Requested gameplay updates:
   - Frost Armor: +2 Armor; melee attackers gain 1 Freeze while buff lasts.
   - Shatter Shot: removes Freeze and gains +2 damage per removed Freeze stack.
   - Ice Needle: melee, 3 damage.
   - Shadow Mark: darkness icon; applies Dread instead of Bleed.
   - Dread: disables one random ability until end of round; ability appears greyed with X.
   - Mesmer Roar: Hypnosis payoff; consumes Hypnosis for bonus damage.
   - Vampire Kiss: melee attack, ignores Armor, no Pierce.
*/

if (typeof KEYWORDS_V32 !== "undefined") {
  KEYWORDS_V32.dread = {
    title: "Dread",
    text: "Until end of round, one random active ability on this unit is disabled. The disabled ability appears greyed out with an X and cannot be chosen."
  };
}
if (window.KEYWORDS_V32_SAFE) {
  window.KEYWORDS_V32_SAFE.dread = {
    title: "Dread",
    text: "Until end of round, one random active ability on this unit is disabled. The disabled ability appears greyed out with an X and cannot be chosen."
  };
}

function applyDreadV42(target){
  if(!target || target.dead) return;
  const candidates = (target.abilities || []).filter(a=>!a.guard);
  const pool = candidates.length ? candidates : (target.abilities || []);
  if(!pool.length) return;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  target.status.dread = 1;
  target.dreadDisabledAbilityId = chosen.id;
  spawnStatusPop?.(target, "dread", "");
  spawnFloatingText?.(target, `Dread: ${chosen.name}`, "status");
  pushActionEvent?.("statusGain", `${target.name} gained Dread: ${chosen.name} is disabled until end of round`, target);
  log(`${target.name} gains Dread. ${chosen.name} is disabled until end of round.`);
}

function isAbilityDisabledByDreadV42(unitObj, ability){
  return !!(unitObj?.status?.dread && unitObj?.dreadDisabledAbilityId === ability?.id);
}

function addStatus(t,s,n=1){
  if(!t||t.dead)return;

  if(s==="dread"){
    applyDreadV42(t);
    return;
  }

  if(s==="hypnosis" || s==="exposed" || s==="exhausted" || s==="frozen"){
    t.status[s]=1;
    spawnStatusPop?.(t,s,"");
    pushActionEvent?.("statusGain", `${t.name} gained ${s}`, t, {status:s, value:1});
    log(`${t.name} gains ${s}.`);
    return;
  }

  t.status[s]=(t.status[s]||0)+n;
  spawnStatusPop?.(t,s,n);
  pushActionEvent?.("statusGain", `${t.name} gained ${n} ${s}`, t, {status:s, value:n});
  log(`${t.name} gains ${n} ${s}.`);

  if(s==="freeze" && (t.status.freeze||0)>=5){
    t.status.freeze=0;
    t.status.frozen=1;
    spawnStatusPop?.(t,"frozen","");
    pushActionEvent?.("statusTrigger", `${t.name} reached 5 Freeze and became Frozen`, t, {status:"frozen"});
    log(`${t.name} reaches 5 Freeze and becomes Frozen. Its next non-Guard action will be canceled.`);
  }
}

function icon(s){
  return {poison:"☠️",bleed:"🩸",freeze:"❄️",hypnosis:"🌀",exposed:"🎯",exhausted:"💤",frozen:"🧊",dread:"✖️"}[s]||"";
}

// Replace openWheel so Dread-disabled abilities appear as unusable with an X.
function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");
  if(!radial || !wheel) return;

  wheelPreviewAbilityIdV34 = null;
  radial.classList.remove("hidden");
  radial.classList.toggle("mobileRadialMode", isPhoneLayoutV40());
  if(tooltip) {
    tooltip.classList.add("hidden");
    tooltip.classList.remove("mobileAbilitySheet");
  }

  let size;
  if(isPhoneLayoutV40()){
    size = Math.min(window.innerWidth * 0.92, window.innerHeight * 0.46, 430);
    size = Math.max(330, size);
  } else {
    size = Math.min(380, Math.max(310, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
  }
  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  if(isPhoneLayoutV40()){
    const sheetReserve = Math.min(190, Math.max(150, window.innerHeight * 0.22));
    cy = window.innerHeight - sheetReserve - size * 0.42;
    cx = window.innerWidth / 2;
  } else if(tile){
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  const margin = size / 2 + 8;
  cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
  cy = Math.max(margin, Math.min(window.innerHeight - margin, cy));
  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `
    <div class="miniCenterName">${escapeHtmlV32 ? escapeHtmlV32(u.name) : u.name}</div>
    <div class="miniCenterHint">${isPhoneLayoutV40() ? "tap twice" : "choose"}</div>
  `;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    const dreadDisabled = isAbilityDisabledByDreadV42(u,a);
    const disabled = state.actionsLeft<a.cost || dreadDisabled;
    const dreadTitle = dreadDisabled ? ` title="Disabled by Dread until end of round"` : "";
    return `<button class="wheelBtn w${i} ${dreadDisabled ? "dreadDisabled" : ""}" ${disabled?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')"${dreadTitle}>
      ${dreadDisabled ? `<span class="dreadX">×</span>` : ""}
      <span class="wheelBtnTitle">${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</span>
      <span class="wheelBtnMeta">${dreadDisabled ? "Dread disabled" : `${a.cost} AP · ${speedLabel}`}</span>
    </button>`;
  }).join("");

  const chooseAbility = (a) => {
    if(isAbilityDisabledByDreadV42(u,a)) {
      showKeywordPopup?.("dread");
      return;
    }
    pendingAbility = a;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
    hideKeywordPopup?.();
    renderBattle();
    if(!targets(u,pendingAbility).length) plan(null);
  };

  const showTipFor = (btn, a) => {
    if(!tooltip) return;
    const disabledText = isAbilityDisabledByDreadV42(u,a)
      ? `<div class="rulesClarifier">${renderKeywordText("Dread disables this ability until end of round.")}</div>`
      : "";
    tooltip.innerHTML = `
      <div class="tipTop">
        <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
        <div>
          <b>${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</b>
          <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
        </div>
      </div>
      <div class="abilityDescText">${renderKeywordText ? renderKeywordText(a.desc) : a.desc}</div>
      ${disabledText}
      ${clarityTextForAbility ? clarityTextForAbility(a) : ""}
      <div class="tipTags">
        <span>${escapeHtmlV32 ? escapeHtmlV32(abilityIconKey(u,a)) : abilityIconKey(u,a)}</span>
        <span>${escapeHtmlV32 ? escapeHtmlV32(a.range || (a.guard ? "guard" : "self")) : (a.range || (a.guard ? "guard" : "self"))}</span>
        ${isPhoneLayoutV40() ? "<span>tap same ability again to choose</span>" : ""}
      </div>
    `;
    tooltip.classList.remove("hidden");
    positionAbilityTooltipV34(tooltip, wheel, btn, Number(btn.dataset.index));
  };

  if(tooltip){
    tooltip.onpointerdown = (ev) => {
      const kw = ev.target.closest(".keywordLink");
      if(kw){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
      } else {
        ev.stopPropagation();
      }
    };
    tooltip.onclick = (ev) => {
      const kw = ev.target.closest(".keywordLink");
      if(kw){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(kw.dataset.keyword, kw.dataset.label);
        return;
      }
      ev.stopPropagation();
    };
  }

  document.querySelectorAll(".wheelBtn").forEach(btn=>{
    const a = u.abilities.find(x=>x.id===btn.dataset.id);

    btn.onmouseenter = () => { if(!isPhoneLayoutV40()) showTipFor(btn,a); };
    btn.onfocus = () => showTipFor(btn,a);
    btn.onmouseleave = () => {
      if(!isPhoneLayoutV40() && tooltip) tooltip.classList.add("hidden");
    };

    const previewOrChoose = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      if(isAbilityDisabledByDreadV42(u,a)){
        showTipFor(btn,a);
        showKeywordPopup?.("dread", btn, "Dread");
        return;
      }

      if(isPhoneLayoutV40()){
        showTipFor(btn,a);
        if(wheelPreviewAbilityIdV34 === a.id){
          chooseAbility(a);
        } else {
          wheelPreviewAbilityIdV34 = a.id;
          document.querySelectorAll(".wheelBtn").forEach(x=>x.classList.remove("previewing"));
          btn.classList.add("previewing");
        }
        return;
      }

      chooseAbility(a);
    };

    btn.ontouchstart = previewOrChoose;
    btn.onclick = previewOrChoose;
  });

  radial.onclick = (ev) => {
    if(ev.target.closest(".wheel") || ev.target.closest("#abilityTooltip") || ev.target.closest("#keywordPopup")) return;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
  };
}

// Dread also affects enemy AI.
const chooseEnemyBeforeDreadV42 = chooseEnemy;
chooseEnemy = function(){
  state.plans = (state.plans || []).filter(p=>p.side!=="enemy");
  let ap=3;
  const enemies=alive("enemy");
  let safety=0;
  while(ap>0 && safety++<10){
    const choices=[];
    for(const e of enemies){
      for(const a of e.abilities){
        if(isAbilityDisabledByDreadV42(e,a)) continue;
        if(a.cost<=ap){
          const ts=targets(e,a);
          if(ts.length) ts.forEach(t=>choices.push({e,a,t}));
          else choices.push({e,a,t:null});
        }
      }
    }
    if(!choices.length) break;
    const pick=choices[Math.floor(Math.random()*choices.length)];
    state.plans.push(makePlan(pick.e,pick.a,pick.t,"enemy"));
    ap-=pick.a.cost;
  }
  state.enemyRevealed = true;
  log("Enemy actions revealed.");
  show?.("Enemy actions revealed");
};

// Frost Armor reactive buff: melee attackers gain Freeze.
const damageBeforeFrostArmorV42 = damage;
damage = function(src,t,amt,opt={}){
  const result = damageBeforeFrostArmorV42(src,t,amt,opt);
  if(opt?.attack && opt?.melee && t && !t.dead && t.buff?.frostArmorRetaliate && src && !src.dead){
    addStatus(src,"freeze",1);
    spawnFloatingText?.(src, "+1 Freeze", "status");
    pushActionEvent?.("statusGain", `${src.name} attacked ${t.name} with melee and gained 1 Freeze from Frost Armor`, src);
    log(`${src.name} gains 1 Freeze from attacking ${t.name}'s Frost Armor with melee.`);
  }
  return result;
};

const applyBeforeV42 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  if(c.status?.frozen && !a.guard){
    c.status.frozen=0;
    state.canceledActionKeys?.push?.(state.currentActionKey);
    spawnFloatingText?.(c, "Frozen: canceled", "cancel");
    log(`${c.name} is Frozen. ${c.name}'s non-Guard action is canceled, then Frozen is removed.`);
    return;
  }

  if(isAbilityDisabledByDreadV42(c,a)){
    state.canceledActionKeys?.push?.(state.currentActionKey);
    spawnFloatingText?.(c, "Dread: disabled", "cancel");
    pushActionEvent?.("cancel", `${c.name}'s ${a.name} was disabled by Dread`, c);
    log(`${c.name} cannot use ${a.name}; it is disabled by Dread.`);
    return;
  }

  switch(a.effect){
    case "frostArmorRetaliate":
      addArmorThisRound?.(t,a.armor||2);
      t.buff.frostArmorRetaliate = 1;
      addStatus(t,"_noop",0); // harmless no-op fallback; statusText ignores it
      spawnFloatingText?.(t, "Frost Armor", "shield");
      pushActionEvent?.("shieldGain", `${t.name} gains +${a.armor||2} Armor and melee attackers gain 1 Freeze until end of round`, t);
      log(`${t.name} gains +${a.armor||2} Armor until end of round. Melee attackers gain 1 Freeze.`);
      break;

    case "shatterScaling": {
      const stacks = t?.status?.freeze || 0;
      if(stacks > 0){
        t.status.freeze = 0;
        spawnFloatingText?.(t, `Freeze x${stacks} removed`, "status");
        pushActionEvent?.("statusLoss", `${t.name}'s ${stacks} Freeze stacks were removed for +${stacks*2} damage`, t);
      }
      damage(c,t,4 + stacks*2,{attack:true,melee:false,pierce:a.pierce||0});
      break;
    }

    case "mesmerPayoff": {
      const had = !!t?.status?.hypnosis;
      if(had){
        t.status.hypnosis = 0;
        spawnFloatingText?.(t, "Hypnosis removed", "status");
        pushActionEvent?.("statusLoss", `${t.name}'s Hypnosis was removed for bonus damage`, t);
      }
      damage(c,t, had ? (a.dmg + (a.bonus||5)) : a.dmg, {attack:true, melee:false, ignoreArmor:!!a.ignoreArmor});
      break;
    }

    default:
      applyBeforeV42(c,a,t);
  }
};

const endRoundBeforeDreadV42 = endRound;
endRound = function(){
  state.units?.forEach(u=>{
    if(u.status){
      u.status.dread = 0;
      delete u.dreadDisabledAbilityId;
    }
    if(u.buff) delete u.buff.frostArmorRetaliate;
  });
  endRoundBeforeDreadV42();
};

// Ensure no hidden _noop status appears.
const statusTextBeforeV42 = statusText;
statusText = function(u){
  if(!u?.status) return statusTextBeforeV42(u);
  const old = u.status._noop;
  delete u.status._noop;
  const out = statusTextBeforeV42(u);
  if(old !== undefined) u.status._noop = old;
  return out;
};

const hasDebuffBeforeV42 = hasDebuff;
hasDebuff = function(u){
  return hasDebuffBeforeV42(u) || !!u?.status?.dread;
};

// Explicit icon mapping updates.
Object.assign(ABILITY_ICON_OVERRIDES_V41, {
  iceNeedle:"icecraft",
  needle:"icecraft",
  shatter:"icecraft",
  armor:"icecraft",
  mark:"darkness",
  roar:"hypnotic",
  kiss:"vampire"
});

function tuneV42Abilities(){
  const byId = id => ROSTER.find(c=>c.id===id);

  const smithen = byId("smithen");
  if(smithen){
    const iceNeedle = smithen.abilities.find(a=>a.id==="iceNeedle" || a.id==="needle");
    if(iceNeedle){
      iceNeedle.id = "iceNeedle";
      iceNeedle.name = "Ice Needle";
      iceNeedle.cost = 1;
      iceNeedle.spd = 3;
      iceNeedle.desc = "Melee attack. Deal 3 damage, then apply 1 Freeze to the target.";
      iceNeedle.effect = "damageStatus";
      iceNeedle.dmg = 3;
      iceNeedle.status = "freeze";
      iceNeedle.stacks = 1;
      iceNeedle.range = "melee";
      iceNeedle.iconKey = "icecraft";
      delete iceNeedle.pierce;
    }
    const shatter = smithen.abilities.find(a=>a.id==="shatter");
    if(shatter){
      shatter.desc = "Ranged payoff attack. Deal 4 damage with Pierce 1. If the target has any Freeze, remove all of that Freeze and gain +2 damage for each removed Freeze stack.";
      shatter.effect = "shatterScaling";
      shatter.range = "ranged";
      shatter.pierce = 1;
      shatter.iconKey = "icecraft";
    }
  }

  const hyafrost = byId("hyafrost");
  if(hyafrost){
    const frostbite = hyafrost.abilities.find(a=>a.id==="frostbite");
    if(frostbite) frostbite.iconKey = "icecraft";
    const armor = hyafrost.abilities.find(a=>a.id==="armor");
    if(armor){
      armor.name = "Frost Armor";
      armor.desc = "Ally support. Choose an ally. That ally gains +2 Armor until end of round. Until end of round, whenever an enemy hits that ally with a melee attack, that enemy gains 1 Freeze.";
      armor.effect = "frostArmorRetaliate";
      armor.range = "ally";
      armor.armor = 2;
      armor.iconKey = "icecraft";
      delete armor.shield;
    }
  }

  const kahro = byId("kahro");
  if(kahro){
    const mark = kahro.abilities.find(a=>a.id==="mark");
    if(mark){
      mark.desc = "Ranged setup. Apply Exposed and Dread to one enemy. Dread disables one random non-Guard ability on that enemy until end of round.";
      mark.effect = "multiStatus";
      mark.statuses = [["exposed",1],["dread",1]];
      mark.iconKey = "darkness";
    }
  }

  const poom = byId("poom");
  if(poom){
    const roar = poom.abilities.find(a=>a.id==="roar");
    if(roar){
      roar.name = "Mesmer Roar";
      roar.cost = 2;
      roar.spd = -1;
      roar.desc = "Hypnotic payoff. Choose one enemy. Deal 3 damage. If that enemy has Hypnosis, remove Hypnosis and deal +5 damage.";
      roar.effect = "mesmerPayoff";
      roar.range = "ranged";
      roar.dmg = 3;
      roar.bonus = 5;
      roar.iconKey = "hypnotic";
    }
  }

  const eva = byId("eva");
  if(eva){
    const kiss = eva.abilities.find(a=>a.id==="kiss");
    if(kiss){
      kiss.name = "Vampire Kiss";
      kiss.desc = "Melee attack. Deal 3 damage ignoring Armor. Shield can still absorb this damage. Then apply 3 Bleed.";
      kiss.effect = "damageStatus";
      kiss.dmg = 3;
      kiss.status = "bleed";
      kiss.stacks = 3;
      kiss.range = "melee";
      kiss.ignoreArmor = true;
      kiss.iconKey = "vampire";
      delete kiss.pierce;
    }
  }
}
tuneV42Abilities();


/* ===== v43 Ivory Fairy boss =====
   Adds second boss:
   - World Toad: aggressive AOE.
   - Ivory Fairy: protective, healing, single-target damage, Bleed/Dread control.
*/

ART.ivory_fairy = "url('assets/ivory_fairy.png')";

const WORLD_TOAD_BOSS = BOSS;

const IVORY_FAIRY_BOSS = {
  id:"ivory_fairy_boss",
  name:"The Ivory Fairy",
  class:"divinity",
  prof:"bloodcraft darkness boss",
  hp:72,
  armor:3,
  speed:5,
  art:ART.ivory_fairy,
  passive:"Passive — Ivory Benediction: whenever The Ivory Fairy restores HP, her next damaging attack this battle deals +2 damage. This bonus stacks until she damages a target.",
  abilities:[
    A("ivory_salve","Ivory Salve",1,2,"Healing. Restore 8 HP to The Ivory Fairy. This triggers Ivory Benediction and gives her next damaging attack +2 damage.","ivoryHeal",{heal:8,iconKey:"divinity"}),
    A("ivory_aegis","Ivory Aegis",1,99,"Guard. The Ivory Fairy gains 8 Shield before damage is dealt this round. If an enemy hits her this round, that attacker gains 1 Bleed.","ivoryGuard",{guard:true,shield:8,iconKey:"divinity"}),
    A("dark_edict","Dark Edict",1,1,"Ranged status. Apply Dread and 2 Bleed to one enemy. Dread disables one random non-Guard ability on that enemy until end of round.","multiStatus",{statuses:[["dread",1],["bleed",2]],range:"ranged",iconKey:"darkness"}),
    A("ivory_spear","Ivory Spear",2,0,"Ranged precision attack. Deal 6 damage with Pierce 2, then apply 2 Bleed. If Ivory Benediction has bonus damage stored, add it to this hit and then reset the bonus to 0.","ivorySpear",{dmg:6,status:"bleed",stacks:2,range:"ranged",pierce:2,iconKey:"divinity"})
  ]
};

let selectedBossId = "world_toad";

function currentBossV43(){
  return selectedBossId === "ivory_fairy" ? IVORY_FAIRY_BOSS : WORLD_TOAD_BOSS;
}

function bossCloneV43(){
  const b = currentBossV43();
  return structuredClone({
    ...b,
    side:"enemy",
    row:"boss",
    col:0,
    size:"boss",
    maxHp:b.hp,
    shield:0,
    status:{},
    buff:{ivoryBonus:0},
    planned:null,
    dead:false
  });
}

const applyBeforeIvoryV43 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "ivoryHeal": {
      const before = c.hp;
      heal(c, a.heal || 8);
      const healed = Math.max(0, c.hp - before);
      if(healed > 0){
        c.buff.ivoryBonus = (c.buff.ivoryBonus || 0) + 2;
        spawnFloatingText?.(c, `Ivory +2 dmg`, "heal");
        pushActionEvent?.("passive", `Ivory Benediction stored +2 damage for The Ivory Fairy's next damaging attack`, c);
        markPassive?.(c, "Ivory Benediction");
        log(`Ivory Benediction stores +2 damage for The Ivory Fairy's next damaging attack.`);
      }
      break;
    }

    case "ivoryGuard": {
      addShield?.(c, a.shield || 8);
      state.counters.push({caster:c,status:"bleed",stacks:1,shield:0});
      state.guarded[c.id]=true;
      spawnFloatingText?.(c, "Ivory Aegis", "shield");
      pushActionEvent?.("shieldGain", `The Ivory Fairy gains ${a.shield||8} Shield. Attackers that hit her gain 1 Bleed.`, c);
      break;
    }

    case "ivorySpear": {
      const bonus = c.buff?.ivoryBonus || 0;
      if(bonus > 0){
        spawnFloatingText?.(c, `+${bonus} Benediction`, "heal");
        pushActionEvent?.("passive", `Ivory Benediction added +${bonus} damage to Ivory Spear`, c);
        markPassive?.(c, "Ivory Benediction");
      }
      damage(c,t,(a.dmg || 6) + bonus,{attack:true,melee:false,pierce:a.pierce||2});
      c.buff.ivoryBonus = 0;
      addStatus(t,a.status || "bleed",a.stacks || 2);
      break;
    }

    default:
      applyBeforeIvoryV43(c,a,t);
  }
};

Object.assign(ABILITY_ICON_OVERRIDES_V41, {
  ivory_salve:"divinity",
  ivory_aegis:"divinity",
  dark_edict:"darkness",
  ivory_spear:"divinity"
});

// Override startBattle to support selected boss.
function startBattle(){
  let player=selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));
  let enemies;
  if(mode==="boss"){
    enemies=[bossCloneV43()];
  } else {
    let ids=ENEMY_PRESETS.find(p=>!p.some(id=>chosenIds.includes(id)))||ENEMY_PRESETS[0],
      pos=[["front",0],["front",2],["back",1]];
    enemies=ids.map((id,i)=>cloneChar(id,"enemy",pos[i][0],pos[i][1]));
  }
  state={
    round:1,
    phase:"planning",
    actions:3,
    actionsMax:3,
    actionsLeft:3,
    units:[...player,...enemies],
    protects:[],
    dodges:[],
    predicts:[],
    counters:[],
    guarded:{},
    attacked:{},
    currentActionKey:null
  };
  logLines=["Battle started. Plan hidden actions, then resolve."];
  $("builder").classList.add("hidden");
  $("battle").classList.remove("hidden");
  startRandomBattleMusicV35?.();
  renderBattle();
}

// Add boss selector UI dynamically.
function ensureBossSelectorV43(){
  const modeButtons = document.querySelector(".modeButtons");
  if(!modeButtons || $("bossSelectorV43")) return;
  const wrap = document.createElement("div");
  wrap.id = "bossSelectorV43";
  wrap.className = "bossSelectorV43";
  wrap.innerHTML = `
    <div class="panelTitle bossSelectTitle">Boss</div>
    <button id="bossWorldToadBtn" class="bossChoice active" type="button">
      <span class="bossChoiceArt" style="background:${WORLD_TOAD_BOSS.art}"></span>
      <span><b>World Toad</b><small>Aggressive AOE</small></span>
    </button>
    <button id="bossIvoryFairyBtn" class="bossChoice" type="button">
      <span class="bossChoiceArt" style="background:${IVORY_FAIRY_BOSS.art}"></span>
      <span><b>The Ivory Fairy</b><small>Protective single-target</small></span>
    </button>
  `;
  modeButtons.insertAdjacentElement("afterend", wrap);

  $("bossWorldToadBtn").onclick = () => {
    selectedBossId = "world_toad";
    updateBossSelectorV43();
  };
  $("bossIvoryFairyBtn").onclick = () => {
    selectedBossId = "ivory_fairy";
    updateBossSelectorV43();
  };
  updateBossSelectorV43();
}

function updateBossSelectorV43(){
  $("bossWorldToadBtn")?.classList.toggle("active", selectedBossId === "world_toad");
  $("bossIvoryFairyBtn")?.classList.toggle("active", selectedBossId === "ivory_fairy");
  const box = $("bossSelectorV43");
  if(box) box.classList.toggle("hidden", mode !== "boss");
}

const renderBuilderBeforeBossV43 = renderBuilder;
renderBuilder = function(){
  renderBuilderBeforeBossV43();
  ensureBossSelectorV43();
  updateBossSelectorV43();
};

const renderArrangeBeforeBossV43 = renderArrange;
renderArrange = function(){
  renderArrangeBeforeBossV43();
  ensureBossSelectorV43();
  updateBossSelectorV43();
};

// Patch mode buttons to refresh boss selector after click.
setTimeout(()=>{
  if($("squadMode")){
    const old = $("squadMode").onclick;
    $("squadMode").onclick = (ev)=>{ old?.(ev); updateBossSelectorV43(); };
  }
  if($("bossMode")){
    const old = $("bossMode").onclick;
    $("bossMode").onclick = (ev)=>{ old?.(ev); updateBossSelectorV43(); };
  }
  ensureBossSelectorV43();
},0);


/* ===== v44 Geshar boss =====
   Adds Geshar:
   - spirit / divinity / darkness
   - one-tile boss, starts alone in enemy back row
   - weaker stats than big bosses
   - passive converts defeated player characters to Geshar's side with 3 HP in the front row
*/

ART.geshar = "url('assets/geshar.png')";

const GESHAR_BOSS = {
  id:"geshar_boss",
  name:"Geshar",
  class:"spirit",
  prof:"divinity darkness boss",
  hp:46,
  armor:2,
  speed:6,
  art:ART.geshar,
  passive:"Passive — Soul Dominion: whenever an enemy character is defeated, return that character to life under Geshar's control with 3 HP in Geshar's front row.",
  abilities:[
    A("soul_mend","Soul Mend",1,2,"Healing. Restore 4 HP to Geshar and each of his living allies.","gesharHealAll",{heal:4,iconKey:"divinity"}),
    A("spirit_veil","Spirit Veil",1,99,"Guard. Geshar gains 5 Shield and Dodge. Dodge prevents the next attack targeting Geshar this round, then Dodge is removed.","gesharSpiritGuard",{guard:true,shield:5,iconKey:"spirit"}),
    A("soul_lance","Soul Lance",2,1,"Direct damage. Choose one enemy. That enemy loses 5 HP; this ignores Armor and Shield.","gesharDirect",{loss:5,range:"ranged",iconKey:"darkness"}),
    A("grave_pressure","Grave Pressure",2,-1,"Row attack. Choose an enemy row. Deal 3 damage to each enemy in that row, then apply Exhausted to each damaged enemy.","gesharRowExhaust",{dmg:3,range:"ranged",iconKey:"spirit"})
  ]
};

Object.assign(ABILITY_ICON_OVERRIDES_V41, {
  soul_mend:"divinity",
  spirit_veil:"spirit",
  soul_lance:"darkness",
  grave_pressure:"spirit"
});

function isGesharAliveV44(){
  return !!(state?.units || []).find(u => u.id === "geshar_boss" && u.side === "enemy" && !u.dead);
}

function firstFreeEnemyFrontColV44(){
  const used = new Set((state?.units || [])
    .filter(u => u.side === "enemy" && !u.dead && u.row === "front")
    .map(u => u.col));
  for(let i=0;i<3;i++) if(!used.has(i)) return i;
  return 1;
}

function triggerGesharSoulDominionV44(){
  if(!isGesharAliveV44()) return;

  const fallen = (state?.units || []).filter(u =>
    u.side === "player" &&
    u.dead &&
    !u.gesharConverted &&
    u.id !== "geshar_boss"
  );

  for(const u of fallen){
    u.gesharConverted = true;
    u.side = "enemy";
    u.dead = false;
    u.hp = 3;
    u.shield = 0;
    u.status = {};
    u.buff = {};
    u.planned = null;
    u.row = "front";
    u.col = firstFreeEnemyFrontColV44();

    const geshar = state.units.find(x=>x.id==="geshar_boss");
    markPassive?.(geshar, "Soul Dominion");
    spawnFloatingText?.(u, "Soul Dominion", "status");
    pushActionEvent?.("passive", `Geshar returned ${u.name} to life under his control with 3 HP`, u);
    log(`Geshar's Soul Dominion returns ${u.name} to life under his control with 3 HP.`);
  }
}

function loseHpDirectV44(u,n,reason="direct HP loss"){
  if(!u || u.dead || n<=0) return;
  u.hp -= n;
  spawnFloatingText?.(u, `-${n} HP`, "hp");
  markRumble?.(u);
  pushActionEvent?.("hp", `${u.name} lost ${n} HP (${reason}; ignores Armor and Shield)`, u);
  log(`${u.name} loses ${n} HP from ${reason}.`);
  if(u.hp <= 0){
    u.hp = 0;
    u.dead = true;
    spawnFloatingText?.(u, "Defeated", "cancel");
    pushActionEvent?.("dead", `${u.name} was defeated`, u);
    log(`${u.name} is defeated.`);
  }
}

const applyBeforeGesharV44 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "gesharHealAll": {
      alive(c.side).forEach(x => heal(x, a.heal || 4));
      break;
    }

    case "gesharSpiritGuard": {
      addShield?.(c, a.shield || 5);
      if(!state.dodges.includes(c.id)) state.dodges.push(c.id);
      state.guarded[c.id] = true;
      spawnFloatingText?.(c, "Spirit Veil", "shield");
      pushActionEvent?.("shieldGain", `Geshar gains ${a.shield||5} Shield and Dodge`, c);
      break;
    }

    case "gesharDirect": {
      loseHpDirectV44(t, a.loss || 5, "Soul Lance");
      break;
    }

    case "gesharRowExhaust": {
      rowUnits(other(c.side), t?.row || "front").forEach(x=>{
        const before = x.hp;
        damage(c,x,a.dmg || 3,{attack:true,aoe:true});
        if(!x.dead && x.hp < before) addStatus(x,"exhausted",1);
      });
      break;
    }

    default:
      applyBeforeGesharV44(c,a,t);
  }

  triggerGesharSoulDominionV44();
};

const endRoundBeforeGesharV44 = endRound;
endRound = function(){
  endRoundBeforeGesharV44();
  triggerGesharSoulDominionV44();
};

// Override boss lookup/clone to include Geshar.
function currentBossV43(){
  if(selectedBossId === "ivory_fairy") return IVORY_FAIRY_BOSS;
  if(selectedBossId === "geshar") return GESHAR_BOSS;
  return WORLD_TOAD_BOSS;
}

function bossCloneV43(){
  const b = currentBossV43();
  const isGeshar = selectedBossId === "geshar";
  return structuredClone({
    ...b,
    side:"enemy",
    row:isGeshar ? "back" : "boss",
    col:isGeshar ? 1 : 0,
    size:isGeshar ? undefined : "boss",
    maxHp:b.hp,
    shield:0,
    status:{},
    buff:{ivoryBonus:0},
    planned:null,
    dead:false
  });
}

// Patch target picking: Geshar's row ability targets rows; direct is ranged.
const targetsBeforeGesharV44 = targets;
targets = function(c,a){
  if(a?.effect === "gesharRowExhaust"){
    return alive(other(c.side));
  }
  return targetsBeforeGesharV44(c,a);
};

// Add Geshar button to existing boss selector.
function ensureBossSelectorV43(){
  const modeButtons = document.querySelector(".modeButtons");
  if(!modeButtons || $("bossSelectorV43")) return;
  const wrap = document.createElement("div");
  wrap.id = "bossSelectorV43";
  wrap.className = "bossSelectorV43";
  wrap.innerHTML = `
    <div class="panelTitle bossSelectTitle">Boss</div>
    <button id="bossWorldToadBtn" class="bossChoice active" type="button">
      <span class="bossChoiceArt" style="background:${WORLD_TOAD_BOSS.art}"></span>
      <span><b>World Toad</b><small>Aggressive AOE</small></span>
    </button>
    <button id="bossIvoryFairyBtn" class="bossChoice" type="button">
      <span class="bossChoiceArt" style="background:${IVORY_FAIRY_BOSS.art}"></span>
      <span><b>The Ivory Fairy</b><small>Protective single-target</small></span>
    </button>
    <button id="bossGesharBtn" class="bossChoice" type="button">
      <span class="bossChoiceArt" style="background:${GESHAR_BOSS.art}"></span>
      <span><b>Geshar</b><small>Soul control</small></span>
    </button>
  `;
  modeButtons.insertAdjacentElement("afterend", wrap);

  $("bossWorldToadBtn").onclick = () => {
    selectedBossId = "world_toad";
    updateBossSelectorV43();
  };
  $("bossIvoryFairyBtn").onclick = () => {
    selectedBossId = "ivory_fairy";
    updateBossSelectorV43();
  };
  $("bossGesharBtn").onclick = () => {
    selectedBossId = "geshar";
    updateBossSelectorV43();
  };
  updateBossSelectorV43();
}

function updateBossSelectorV43(){
  $("bossWorldToadBtn")?.classList.toggle("active", selectedBossId === "world_toad");
  $("bossIvoryFairyBtn")?.classList.toggle("active", selectedBossId === "ivory_fairy");
  $("bossGesharBtn")?.classList.toggle("active", selectedBossId === "geshar");
  const box = $("bossSelectorV43");
  if(box) box.classList.toggle("hidden", mode !== "boss");
}


/* ===== v45 enemy placement + smarter non-deterministic AI =====
   1. Regular enemy squads are placed by role:
      - warriors/brutes front
      - assassins/sorcerers back
      - always at least one frontliner if possible
   2. AI scoring:
      - does not use payoff actions when payoff is not met unless randomness strongly picks it.
      - prefers setup actions when setup is useful.
      - prioritizes low-HP kill targets.
      - remains stochastic with weighted random selection.
*/

function isFrontlineClassV45(c){
  return ["warrior","brute"].includes(String(c?.class || "").toLowerCase());
}
function isBacklineClassV45(c){
  return ["assassin","sorcerer"].includes(String(c?.class || "").toLowerCase());
}
function enemyTeamIdsV45(){
  const available = ROSTER.map(c=>c.id).filter(id=>!chosenIds.includes(id));
  const presets = ENEMY_PRESETS.filter(p=>p.every(id=>available.includes(id)));
  let ids = presets.length ? presets[Math.floor(Math.random()*presets.length)] : available.sort(()=>Math.random()-.5).slice(0,3);

  // Make sure regular enemy team has at least one sensible frontliner when possible.
  if(!ids.some(id=>isFrontlineClassV45(cdef(id)))){
    const frontCandidate = available.find(id=>isFrontlineClassV45(cdef(id)));
    if(frontCandidate){
      // Replace the least front-like member.
      const replaceIndex = ids.findIndex(id=>isBacklineClassV45(cdef(id)));
      ids[replaceIndex >= 0 ? replaceIndex : ids.length-1] = frontCandidate;
    }
  }
  return [...new Set(ids)].slice(0,3);
}

function layoutEnemyTeamV45(ids){
  const chars = ids.map(id=>cdef(id)).filter(Boolean);
  const front = chars.filter(isFrontlineClassV45);
  const back = chars.filter(c=>!isFrontlineClassV45(c));

  const placements = [];
  const frontCols = [0,2,1];
  const backCols = [1,0,2];

  // Place up to two frontliners in front first.
  front.forEach((c,i)=>{
    placements.push({id:c.id,row:"front",col:frontCols[i] ?? 1});
  });

  // If no frontliner somehow exists, put the toughest character in front.
  if(!placements.some(p=>p.row==="front") && chars.length){
    const toughest = [...chars].sort((a,b)=>(b.hp+b.armor*3)-(a.hp+a.armor*3))[0];
    placements.push({id:toughest.id,row:"front",col:1});
  }

  const placed = new Set(placements.map(p=>p.id));
  back.filter(c=>!placed.has(c.id)).forEach((c,i)=>{
    placements.push({id:c.id,row:"back",col:backCols[i] ?? 1});
  });

  // Overflow goes into sensible free slots.
  chars.filter(c=>!placements.some(p=>p.id===c.id)).forEach(c=>{
    const row = isFrontlineClassV45(c) ? "front" : "back";
    const used = new Set(placements.filter(p=>p.row===row).map(p=>p.col));
    const col = [0,1,2].find(x=>!used.has(x)) ?? 1;
    placements.push({id:c.id,row,col});
  });

  return placements.slice(0,3);
}

function selectRegularEnemiesV45(){
  const ids = enemyTeamIdsV45();
  return layoutEnemyTeamV45(ids).map(p=>cloneChar(p.id,"enemy",p.row,p.col));
}

function statusCountV45(u, s){ return u?.status?.[s] || 0; }
function hasStatusV45(u, s){ return statusCountV45(u,s) > 0; }
function enemyLowestHpV45(side){
  const list = alive(other(side));
  return list.length ? Math.min(...list.map(u=>u.hp)) : 999;
}
function canKillApproxV45(c,a,t){
  if(!t) return false;
  let dmg = a.dmg || 0;
  if(a.effect==="consumeBleed") dmg = (statusCountV45(t,"bleed") || 0) + (a.bonus || 0);
  if(a.effect==="shatterScaling") dmg = 4 + (statusCountV45(t,"freeze") || 0) * 2;
  if(a.effect==="mesmerPayoff") dmg = (a.dmg || 0) + (hasStatusV45(t,"hypnosis") ? (a.bonus || 0) : 0);
  if(a.effect==="poisonBurst") dmg = statusCountV45(t,"poison") * 2;
  if(a.effect==="mindBreak") dmg = hasStatusV45(t,"hypnosis") ? 7 : 3;
  if(a.effect==="gesharDirect") dmg = a.loss || 5;
  return dmg >= t.hp;
}

function payoffReadinessV45(a,t){
  switch(a.effect){
    case "consumeBleed": return statusCountV45(t,"bleed") > 0;
    case "shatter":
    case "shatterScaling":
    case "whiteout":
    case "glacier": return statusCountV45(t,"freeze") > 0;
    case "mindBreak":
    case "mesmerPayoff": return hasStatusV45(t,"hypnosis");
    case "poisonBurst": return statusCountV45(t,"poison") > 0;
    case "proliferate": return ["poison","bleed","freeze"].some(s=>statusCountV45(t,s)>0) || hasStatusV45(t,"hypnosis");
    case "absoluteZero": return alive(other(t?.side || "enemy")).some(x=>statusCountV45(x,"freeze")>0);
    default: return true;
  }
}

function isPayoffAbilityV45(a){
  return ["consumeBleed","shatter","shatterScaling","glacier","mindBreak","mesmerPayoff","poisonBurst","proliferate","absoluteZero"].includes(a.effect);
}

function isSetupAbilityV45(a){
  const txt = `${a.name} ${a.desc || ""} ${a.effect || ""}`.toLowerCase();
  return ["status","multistatus","rowstatus","allstatus","frontHypno","poisonHands","predict","predictPoison"].includes(a.effect)
    || /apply|poison|bleed|freeze|hypnosis|dread|exposed|sunder|setup/.test(txt);
}

function targetScoreV45(c,a,t){
  if(!t) return 0;
  let score = 0;

  // Prefer finishing low HP characters.
  score += Math.max(0, 18 - t.hp) * 1.15;
  if(canKillApproxV45(c,a,t)) score += 22;

  // Don't over-target very healthy tanks with weak payoff-less actions.
  if(t.hp <= enemyLowestHpV45(c.side)+2) score += 7;

  // Setup wants targets that do not already have the setup.
  if(a.status && !hasStatusV45(t,a.status)) score += 5;
  if(a.statuses){
    for(const [s,_] of a.statuses) if(!hasStatusV45(t,s)) score += 3.5;
  }
  if(/bleed/i.test(a.desc||"") && !hasStatusV45(t,"bleed")) score += 4;
  if(/poison/i.test(a.desc||"") && !hasStatusV45(t,"poison")) score += 4;
  if(/freeze/i.test(a.desc||"") && !hasStatusV45(t,"freeze")) score += 4;
  if(/hypnosis/i.test(a.desc||"") && !hasStatusV45(t,"hypnosis")) score += 4;
  if(/dread/i.test(a.desc||"") && !hasStatusV45(t,"dread")) score += 6;

  // Payoffs strongly prefer targets where condition is met.
  if(isPayoffAbilityV45(a)){
    score += payoffReadinessV45(a,t) ? 16 : -22;
  }

  return score;
}

function abilityScoreV45(c,a,targetsForA,ap){
  let score = 10;
  const bestTarget = targetsForA.length ? targetsForA.map(t=>targetScoreV45(c,a,t)).sort((x,y)=>y-x)[0] : 0;
  score += bestTarget;

  if(isSetupAbilityV45(a)) score += 5;

  if(isPayoffAbilityV45(a)){
    const ready = targetsForA.some(t=>payoffReadinessV45(a,t));
    score += ready ? 12 : -30;
  }

  // Guard/support is better when wounded or allies are wounded.
  if(a.guard) {
    const wounded = c.hp <= c.maxHp * 0.55;
    score += wounded ? 10 : -3;
  }
  if(["drain","gesharHealAll","ivoryHeal"].includes(a.effect)){
    const woundedAllies = alive(c.side).filter(u=>u.hp < u.maxHp).length;
    score += woundedAllies * 6;
    if(c.hp < c.maxHp) score += 5;
  }
  if(["protect","ward","ivoryGuard","gesharSpiritGuard"].includes(a.effect)){
    score += alive(c.side).some(u=>u.hp <= u.maxHp*0.45) ? 8 : 0;
  }

  // Slightly prefer spending AP efficiently, but not deterministically.
  score += a.cost * 1.5;
  score += (Math.random() * 10) - 4; // unpredictability

  return Math.max(1, score);
}

function weightedPickV45(items){
  const total = items.reduce((s,x)=>s+x.weight,0);
  let r = Math.random() * total;
  for(const x of items){
    r -= x.weight;
    if(r <= 0) return x.item;
  }
  return items[items.length-1]?.item;
}

function chooseTargetV45(c,a,ts){
  if(!ts || !ts.length) return null;
  const weighted = ts.map(t=>({item:t, weight:Math.max(1,targetScoreV45(c,a,t)+8+Math.random()*5)}));
  return weightedPickV45(weighted);
}

function chooseEnemy(){
  state.plans = (state.plans || []).filter(p=>p.side!=="enemy");
  for(let e of alive("enemy")) e.planned = null;

  let ap = 3;
  let safety = 0;

  while(ap > 0 && safety++ < 12){
    const choices = [];

    for(const e of alive("enemy")){
      for(const a of e.abilities){
        if(a.cost > ap) continue;
        if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(e,a)) continue;

        const ts = targets(e,a);
        const score = abilityScoreV45(e,a,ts,ap);
        choices.push({e,a,ts,score});
      }
    }

    if(!choices.length) break;

    const picked = weightedPickV45(choices.map(x=>({item:x, weight:Math.max(1,x.score)})));
    const target = chooseTargetV45(picked.e,picked.a,picked.ts);

    state.plans.push(makePlan(picked.e,picked.a,target,"enemy"));
    picked.e.planned = {ability:picked.a.id, target:target?.id || null};
    ap -= picked.a.cost;

    // Reduce chance that same unit eats all AP unless it has no allies.
    if(alive("enemy").length > 1 && Math.random() < 0.45){
      picked.e._aiActedThisRound = true;
    }
  }

  alive("enemy").forEach(e=>delete e._aiActedThisRound);
  state.enemyRevealed = true;
  log("Enemy actions revealed.");
  show?.("Enemy actions revealed");
}

// Override regular startBattle placement only; boss logic remains from v44.
const startBattleBeforeV45 = startBattle;
startBattle = function(){
  if(mode === "boss") return startBattleBeforeV45();

  const player = selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));
  const enemies = selectRegularEnemiesV45();

  state={
    round:1,
    phase:"planning",
    actions:3,
    actionsMax:3,
    actionsLeft:3,
    units:[...player,...enemies],
    protects:[],
    dodges:[],
    predicts:[],
    counters:[],
    guarded:{},
    attacked:{},
    currentActionKey:null
  };
  logLines=["Battle started. Enemy team uses role-based placement."];
  $("builder").classList.add("hidden");
  $("battle").classList.remove("hidden");
  startRandomBattleMusicV35?.();
  renderBattle();
};


/* ===== v46 boss/action queue fix + Geshar back-row footprint =====
   Fixes:
   - Boss battles created state without plans/planSeq, so queuing actions spent AP but did not appear in the strip.
   - Resolve button could stay disabled after queuing actions.
   - Enemy name always said World Toad in boss mode.
   - Geshar now occupies the entire enemy back row as a 1x3 boss unit.
*/

function initBattleStateV46(player, enemies, message){
  state = {
    round:1,
    phase:"planning",
    actions:3,
    actionsMax:3,
    actionsLeft:3,
    units:[...player, ...enemies],
    plans:[],
    planSeq:0,
    resolvedActionKeys:[],
    canceledActionKeys:[],
    protects:[],
    dodges:[],
    predicts:[],
    counters:[],
    guarded:{},
    attacked:{},
    currentActionKey:null,
    enemyRevealed:false
  };
  logLines=[message || "Battle started. Plan hidden actions, then resolve."];
  $("builder").classList.add("hidden");
  $("battle").classList.remove("hidden");
  startRandomBattleMusicV35?.();
  renderBattle();
}

function bossCloneV43(){
  const b = currentBossV43 ? currentBossV43() : BOSS;
  const isGeshar = selectedBossId === "geshar";
  return structuredClone({
    ...b,
    side:"enemy",
    row:isGeshar ? "back" : "boss",
    col:0,
    size:isGeshar ? "rowBoss" : "boss",
    footprint:isGeshar ? {rows:1, cols:3} : (b.footprint || {rows:2, cols:3}),
    maxHp:b.hp,
    shield:0,
    status:{},
    buff:{ivoryBonus:0},
    planned:null,
    dead:false
  });
}

function startBattle(){
  const player = selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));
  let enemies;

  if(mode === "boss"){
    enemies = [bossCloneV43()];
    initBattleStateV46(player, enemies, `Boss battle started against ${enemies[0].name}.`);
  } else {
    enemies = typeof selectRegularEnemiesV45 === "function"
      ? selectRegularEnemiesV45()
      : (() => {
          let ids=ENEMY_PRESETS.find(p=>!p.some(id=>chosenIds.includes(id)))||ENEMY_PRESETS[0],
            pos=[["front",0],["front",2],["back",1]];
          return ids.map((id,i)=>cloneChar(id,"enemy",pos[i][0],pos[i][1]));
        })();
    initBattleStateV46(player, enemies, "Battle started. Enemy team uses role-based placement.");
  }
}

function plan(target){
  if(!state.plans) state.plans = [];
  if(typeof state.planSeq !== "number") state.planSeq = 0;

  let c=selectedUnit(), a=pendingAbility;
  if(!c || !a || state.phase !== "planning" || state.actionsLeft < a.cost) return;

  state.actionsLeft -= a.cost;
  state.plans.push(makePlan(c,a,target,"player"));
  log(`${c.name} queued ${a.name}.`);
  selectedId=null;
  selectedSide=null;
  pendingAbility=null;
  renderBattle();
}

function renderBattle(){
  if(!state)return;

  const boss = state.units.find(u=>u.side==="enemy" && (u.size==="boss" || u.size==="rowBoss" || u.footprint));
  $("enemyName").textContent = mode==="boss" ? (boss?.name || "Boss") : "Enemy Squad";
  $("phaseText").textContent = state.phase==="planning" ? "Plan" : "Resolve";
  $("roundText").textContent = state.round;
  $("actionsText").textContent = `${state.actionsLeft}/${state.actionsMax || 3}`;
  $("resolveBtn").disabled = state.phase !== "planning" || !(state.plans || []).some(p=>p.side==="player");
  $("battle").classList.toggle("resolvingBoard", state.phase==="resolving" && !!state.currentActionKey);

  renderBoard("enemyBoard","enemy");
  renderBoard("playerBoard","player");
  renderInfo();
  $("log").innerHTML=logLines.map(x=>`<div class="logItem">${x}</div>`).join("");
  renderQueueStrip();
}

function isLargeUnit(u){
  return !!(u && (u.size==="boss" || u.size==="rowBoss" || u.footprint));
}

function renderBoard(id,side){
  const b=$(id);
  if(!b || !state) return;

  const large=state.units.find(u=>u.side===side && !u.dead && isLargeUnit(u));
  b.innerHTML="";
  b.classList.toggle("bossBoard", !!large);
  b.classList.toggle("largeUnitBoard", !!large);
  b.classList.toggle("rowBossBoard", !!large && large.size==="rowBoss");

  if(large && large.size==="rowBoss"){
    // Geshar: show empty front row, then a single full-width back-row tile.
    const order = side==="enemy" ? ["back","front"] : ["front","back"];
    for(const row of order){
      const div=document.createElement("div");
      div.className=`row ${row==="back" ? "rowBossHost" : ""}`;
      if(row === large.row){
        const bossTile = tile(large,side);
        bossTile.classList.add("rowBossTile","largeUnitTile");
        bossTile.setAttribute("aria-label", `${large.name}, large unit occupying the full ${row} row`);
        div.appendChild(bossTile);
      } else {
        for(let col=0; col<3; col++){
          div.appendChild(tile(state.units.find(u=>u.side===side && !u.dead && u.row===row && u.col===col),side));
        }
      }
      b.appendChild(div);
    }
    return;
  }

  if(large){
    const bossTile = tile(large,side);
    bossTile.classList.add("bossTile","largeUnitTile");
    bossTile.style.setProperty("--span-rows", large.footprint?.rows || 2);
    bossTile.style.setProperty("--span-cols", large.footprint?.cols || 3);
    bossTile.setAttribute("aria-label", `${large.name}, large unit occupying ${(large.footprint?.rows||2)} by ${(large.footprint?.cols||3)} spaces`);
    b.appendChild(bossTile);
    return;
  }

  let order=side==="enemy"?["back","front"]:["front","back"];
  for(let row of order){
    let div=document.createElement("div");
    div.className="row";
    for(let col=0;col<3;col++){
      div.appendChild(tile(state.units.find(u=>u.side===side && !u.dead && u.row===row && u.col===col),side));
    }
    b.appendChild(div);
  }
}

function rowUnits(side,row){
  const units = alive(side).filter(u=>{
    if(u.size==="boss") return true;
    if(u.size==="rowBoss") return u.row === row;
    return u.row === row;
  });
  const seen = new Set();
  return units.filter(u=>{
    if(seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

function frontBlocked(side){
  return alive(side).some(u=>u.row==="front" || u.size==="boss");
}

function targets(c,a){
  let allies=alive(c.side), enemies=alive(other(c.side));
  switch(a.effect){
    case"protect":case"ward":case"poisonHands":case"allyPain":case"allyBleed":return allies;
    case"dodge":case"selfCounter":case"spirit":case"absoluteZero":case"allStatus":case"allDamageStatus":case"frontHypno":return [];
    case"rowStatus":case"rowDamageStatus":case"rowMultiStatus":case"gesharRowExhaust":return enemies;
    default:
      return enemies.filter(t=>{
        if(a.range!=="melee") return true;
        if(t.row==="front" || t.size==="boss") return true;
        return !frontBlocked(t.side);
      });
  }
}


/* ===== v47 Geshar Soul Dominion revive animation =====
   Adds a purple summon/takeover animation when Geshar revives a defeated player unit:
   - purple soul line from Geshar to the corpse
   - smoke burst at revived unit
   - takeover ring
   - temporary glow/pulse on the converted unit
*/

function getGesharV47(){
  return (state?.units || []).find(u => u.id === "geshar_boss" && u.side === "enemy" && !u.dead);
}

function spawnGesharSoulBeamV47(fromUnit, toUnit){
  const a = tileEl?.(fromUnit?.id);
  const b = tileEl?.(toUnit?.id);
  const fx = fxLayer?.();
  if(!a || !b || !fx) return;

  const p1 = centerOf(a);
  const p2 = centerOf(b);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.max(24, Math.hypot(dx, dy));
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;

  const beam = document.createElement("div");
  beam.className = "gesharSoulBeam";
  beam.style.left = p1.x + "px";
  beam.style.top = p1.y + "px";
  beam.style.width = len + "px";
  beam.style.transform = `rotate(${ang}deg)`;
  fx.appendChild(beam);
  setTimeout(()=>beam.remove(), 1900);
}

function spawnGesharReviveBurstV47(unitObj){
  const el = tileEl?.(unitObj?.id);
  const fx = fxLayer?.();
  if(!el || !fx) return;

  const c = centerOf(el);

  const burst = document.createElement("div");
  burst.className = "gesharReviveBurst";
  burst.style.left = c.x + "px";
  burst.style.top = c.y + "px";
  fx.appendChild(burst);

  const text = document.createElement("div");
  text.className = "gesharReviveText";
  text.textContent = "Soul Dominion";
  text.style.left = c.x + "px";
  text.style.top = (c.y - c.h * 0.42) + "px";
  fx.appendChild(text);

  for(let i=0;i<10;i++){
    const mote = document.createElement("div");
    mote.className = "gesharSoulMote";
    const angle = (Math.PI * 2 * i) / 10;
    const dist = 26 + Math.random() * 42;
    mote.style.left = c.x + "px";
    mote.style.top = c.y + "px";
    mote.style.setProperty("--mx", Math.cos(angle) * dist + "px");
    mote.style.setProperty("--my", Math.sin(angle) * dist + "px");
    mote.style.animationDelay = (i * 35) + "ms";
    fx.appendChild(mote);
    setTimeout(()=>mote.remove(), 1600);
  }

  setTimeout(()=>burst.remove(), 1700);
  setTimeout(()=>text.remove(), 2200);
}

function markSoulDominionUnitV47(unitObj){
  if(!unitObj) return;
  unitObj.soulDominionUntil = Date.now() + 2600;
}

// Override tile to include Geshar takeover glow.
const tileBeforeGesharAnimV47 = tile;
tile = function(u, side){
  const t = tileBeforeGesharAnimV47(u, side);
  if(u && u.soulDominionUntil && u.soulDominionUntil > Date.now()){
    t.classList.add("soulDominionRevived");
    const label = document.createElement("div");
    label.className = "soulDominionBadge";
    label.textContent = "Controlled";
    t.appendChild(label);
  }
  return t;
};

// Safer full override of Geshar passive trigger with animations.
// This replaces previous trigger behavior while preserving the same mechanics.
function triggerGesharSoulDominionV44(){
  const geshar = getGesharV47();
  if(!geshar) return;

  const fallen = (state?.units || []).filter(u =>
    u.side === "player" &&
    u.dead &&
    !u.gesharConverted &&
    u.id !== "geshar_boss"
  );

  for(const u of fallen){
    u.gesharConverted = true;

    // Place first so tile exists after render; animation plays after render.
    u.side = "enemy";
    u.dead = false;
    u.hp = 3;
    u.shield = 0;
    u.status = {};
    u.buff = {};
    u.planned = null;
    u.row = "front";
    u.col = firstFreeEnemyFrontColV44 ? firstFreeEnemyFrontColV44() : 1;
    markSoulDominionUnitV47(u);

    markPassive?.(geshar, "Soul Dominion");
    pushActionEvent?.("passive", `Geshar returned ${u.name} to life under his control with 3 HP`, u);
    log(`Geshar's Soul Dominion returns ${u.name} to life under his control with 3 HP.`);

    // Render first so the revived tile exists, then play the cinematic.
    renderBattle?.();
    setTimeout(()=>{
      spawnGesharSoulBeamV47(geshar, u);
      spawnGesharReviveBurstV47(u);
      spawnFloatingText?.(u, "Returned with 3 HP", "status");
    }, 80);

    // Keep glow refreshed while animation plays.
    setTimeout(()=>renderBattle?.(), 700);
    setTimeout(()=>renderBattle?.(), 1600);
    setTimeout(()=>renderBattle?.(), 2700);
  }
}

// Also call the animation if a player dies inside normal damage paths but conversion happens shortly after render.
const checkWinBeforeSoulAnimV47 = checkWin;
checkWin = function(){
  triggerGesharSoulDominionV44?.();
  return checkWinBeforeSoulAnimV47();
};


/* ===== v48 Geshar back-row layout fix =====
   The old rowBoss render used the normal .row layout, so Geshar was squeezed into one tile
   and the remaining empty slots looked stacked beside him.
   This render makes a rowBoss tile truly span the entire row.
*/

function renderBoard(id,side){
  const b=$(id);
  if(!b || !state) return;

  const large=state.units.find(u=>u.side===side && !u.dead && isLargeUnit(u));
  b.innerHTML="";
  b.classList.toggle("bossBoard", !!large);
  b.classList.toggle("largeUnitBoard", !!large);
  b.classList.toggle("rowBossBoard", !!large && large.size==="rowBoss");

  if(large && large.size==="rowBoss"){
    const order = side==="enemy" ? ["back","front"] : ["front","back"];

    for(const row of order){
      const div=document.createElement("div");
      div.className=`row ${row==="back" ? "rowBossHost" : ""}`;

      if(row === large.row){
        // One tile, full-width. No extra empty slots.
        const bossTile = tile(large,side);
        bossTile.classList.add("rowBossTile","largeUnitTile");
        bossTile.setAttribute("aria-label", `${large.name}, large unit occupying the full ${row} row`);
        div.appendChild(bossTile);
      } else {
        for(let col=0; col<3; col++){
          const occupant = state.units.find(u=>
            u.side===side &&
            !u.dead &&
            !isLargeUnit(u) &&
            u.row===row &&
            u.col===col
          );
          div.appendChild(tile(occupant,side));
        }
      }
      b.appendChild(div);
    }
    return;
  }

  if(large){
    const bossTile = tile(large,side);
    bossTile.classList.add("bossTile","largeUnitTile");
    bossTile.style.setProperty("--span-rows", large.footprint?.rows || 2);
    bossTile.style.setProperty("--span-cols", large.footprint?.cols || 3);
    bossTile.setAttribute("aria-label", `${large.name}, large unit occupying ${(large.footprint?.rows||2)} by ${(large.footprint?.cols||3)} spaces`);
    b.appendChild(bossTile);
    return;
  }

  let order=side==="enemy"?["back","front"]:["front","back"];
  for(let row of order){
    let div=document.createElement("div");
    div.className="row";
    for(let col=0;col<3;col++){
      div.appendChild(tile(state.units.find(u=>u.side===side && !u.dead && u.row===row && u.col===col),side));
    }
    b.appendChild(div);
  }
}


/* ===== v49 Geshar mobile full-row fix =====
   Previous fixes were overridden by mobile .row/.tile sizing rules.
   This version renders Geshar in a dedicated full-width boss row, not in the normal 3-slot row.
*/

function renderBoard(id,side){
  const b=$(id);
  if(!b || !state) return;

  const large=state.units.find(u=>u.side===side && !u.dead && isLargeUnit(u));
  b.innerHTML="";
  b.classList.toggle("bossBoard", !!large && large.size!=="rowBoss");
  b.classList.toggle("largeUnitBoard", !!large);
  b.classList.toggle("rowBossBoard", !!large && large.size==="rowBoss");

  if(large && large.size==="rowBoss"){
    const order = side==="enemy" ? ["back","front"] : ["front","back"];

    for(const row of order){
      if(row === large.row){
        const div=document.createElement("div");
        div.className="rowBossFullRow";
        const bossTile = tile(large,side);
        bossTile.classList.add("rowBossTile","largeUnitTile");
        bossTile.setAttribute("aria-label", `${large.name}, large unit occupying the full ${row} row`);
        div.appendChild(bossTile);
        b.appendChild(div);
      } else {
        const div=document.createElement("div");
        div.className="row";
        for(let col=0; col<3; col++){
          const occupant = state.units.find(u=>
            u.side===side &&
            !u.dead &&
            !isLargeUnit(u) &&
            u.row===row &&
            u.col===col
          );
          div.appendChild(tile(occupant,side));
        }
        b.appendChild(div);
      }
    }
    return;
  }

  if(large){
    const bossTile = tile(large,side);
    bossTile.classList.add("bossTile","largeUnitTile");
    bossTile.style.setProperty("--span-rows", large.footprint?.rows || 2);
    bossTile.style.setProperty("--span-cols", large.footprint?.cols || 3);
    bossTile.setAttribute("aria-label", `${large.name}, large unit occupying ${(large.footprint?.rows||2)} by ${(large.footprint?.cols||3)} spaces`);
    b.appendChild(bossTile);
    return;
  }

  let order=side==="enemy"?["back","front"]:["front","back"];
  for(let row of order){
    let div=document.createElement("div");
    div.className="row";
    for(let col=0;col<3;col++){
      div.appendChild(tile(state.units.find(u=>u.side===side && !u.dead && u.row===row && u.col===col),side));
    }
    b.appendChild(div);
  }
}


/* ===== v50 Geshar true full-row fix =====
   The problem was that rowBossBoard also had largeUnitBoard,
   so the parent board stayed in the old 3-column boss grid.
   This version removes largeUnitBoard for rowBoss and uses a dedicated layout.
*/

function renderBoard(id,side){
  const b=$(id);
  if(!b || !state) return;

  const large=state.units.find(u=>u.side===side && !u.dead && isLargeUnit(u));
  const isRowBoss = !!large && large.size==="rowBoss";

  b.innerHTML="";
  b.classList.toggle("bossBoard", !!large && !isRowBoss);
  b.classList.toggle("largeUnitBoard", !!large && !isRowBoss);
  b.classList.toggle("rowBossBoard", isRowBoss);

  if(isRowBoss){
    const order = side==="enemy" ? ["back","front"] : ["front","back"];

    for(const row of order){
      if(row === large.row){
        const div=document.createElement("div");
        div.className="rowBossFullRow";
        const bossTile = tile(large,side);
        bossTile.classList.add("rowBossTile");
        bossTile.setAttribute("aria-label", `${large.name}, large unit occupying the full ${row} row`);
        div.appendChild(bossTile);
        b.appendChild(div);
      } else {
        const div=document.createElement("div");
        div.className="row";
        for(let col=0; col<3; col++){
          const occupant = state.units.find(u=>
            u.side===side &&
            !u.dead &&
            !isLargeUnit(u) &&
            u.row===row &&
            u.col===col
          );
          div.appendChild(tile(occupant,side));
        }
        b.appendChild(div);
      }
    }
    return;
  }

  if(large){
    const bossTile = tile(large,side);
    bossTile.classList.add("bossTile","largeUnitTile");
    bossTile.style.setProperty("--span-rows", large.footprint?.rows || 2);
    bossTile.style.setProperty("--span-cols", large.footprint?.cols || 3);
    bossTile.setAttribute("aria-label", `${large.name}, large unit occupying ${(large.footprint?.rows||2)} by ${(large.footprint?.cols||3)} spaces`);
    b.appendChild(bossTile);
    return;
  }

  let order=side==="enemy"?["back","front"]:["front","back"];
  for(let row of order){
    let div=document.createElement("div");
    div.className="row";
    for(let col=0;col<3;col++){
      div.appendChild(tile(state.units.find(u=>u.side===side && !u.dead && u.row===row && u.col===col),side));
    }
    b.appendChild(div);
  }
}


/* ===== v51 mobile playable/responsive pass =====
   Fixes:
   - Mobile info panel has a visible close X.
   - Ability wheel bottom button is no longer covered by the description sheet.
   - Mobile ability buttons are larger.
   - Resolution card is compact on mobile and no longer covers most of the board.
   - Beams/arrows are thinner and less intrusive.
   - Character select becomes scrollable on mobile.
   - Battle screen locks to viewport with internal board scrolling only where needed.
*/

function isMobilePlayableV51(){
  return window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
}

function closeInfoPanel(){
  selectedId = null;
  selectedSide = null;
  pendingAbility = null;
  closeMobilePanel?.();
  document.body.classList.remove("infoOpenV51");
  renderBattle();
}

function renderInfo(){
  let u=selectedUnit();
  const infoPanel = $("info");
  if(infoPanel) infoPanel.classList.toggle("hasSelection", !!u);

  $("infoTitle").innerHTML = u
    ? `<span>${escapeHtmlV32 ? escapeHtmlV32(u.name) : u.name}</span><button id="closeInfoBtn" class="closeInfoBtn mobileVisibleClose" type="button" aria-label="Close info">×</button>`
    : "Plan hidden actions";

  const queuedCount = state?.plans?.filter(p=>p.side==="player").length || 0;

  if(u){
    const enemyNote = u.side === "enemy"
      ? `<div class="statusInfoBox"><b>Enemy intel:</b> You can inspect stats, current statuses, and passive. Active abilities stay hidden until they resolve.</div>`
      : "";

    $("infoBody").innerHTML =
      `<div class="miniInfoCard">
        <div><b>Proficiencies:</b> ${renderKeywordText ? renderKeywordText(`${u.class} / ${u.prof}`) : `${u.class} / ${u.prof}`}</div>
        <div><b>Health:</b> ❤️ ${u.hp}/${u.maxHp}</div>
        <div><b>Armor:</b> 🛡️ ${getArmor ? getArmor(u) : u.armor}</div>
        <div><b>Speed:</b> ⚡ ${u.speed}</div>
        <div><b>Current statuses:</b> ${renderKeywordText ? renderKeywordText(statusLineV38(u)) : statusLineV38(u)}</div>
        <div><b>Passive:</b> ${renderKeywordText ? renderKeywordText(passiveExactV38(u)) : passiveExactV38(u)}</div>
      </div>
      ${enemyNote}`;
    document.body.classList.add("infoOpenV51");
  } else {
    $("infoBody").innerHTML = `Queued: ${queuedCount} action${queuedCount===1?"":"s"}. Click a fighter to add actions. Remove actions from the queue strip.`;
    document.body.classList.remove("infoOpenV51");
  }

  const btn = $("closeInfoBtn");
  if(btn) btn.onclick = (ev) => {
    ev.stopPropagation();
    closeInfoPanel();
  };

  if(pendingAbility && selectedId) previewTargeting(selectedUnit(), pendingAbility);
}

// Override mobile wheel placement to leave a safe gap above the bottom sheet.
function openWheel(u){
  const tile = document.querySelector(`.tile[data-unit-id="${u.id}"][data-side="${u.side}"]`) || document.querySelector(".tile.selected");
  const radial = $("radial");
  const wheel = $("wheel") || document.querySelector(".wheel");
  const tooltip = $("abilityTooltip");
  if(!radial || !wheel) return;

  wheelPreviewAbilityIdV34 = null;
  radial.classList.remove("hidden");
  radial.classList.toggle("mobileRadialMode", isMobilePlayableV51());
  if(tooltip) {
    tooltip.classList.add("hidden");
    tooltip.classList.remove("mobileAbilitySheet");
  }

  let size;
  if(isMobilePlayableV51()){
    // Large enough for touch, but not so large that the lower button hides under sheet.
    size = Math.min(window.innerWidth * 0.90, window.innerHeight * 0.38, 390);
    size = Math.max(315, size);
  } else {
    size = Math.min(380, Math.max(310, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
  }
  wheel.style.width = size + "px";
  wheel.style.height = size + "px";

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;

  if(isMobilePlayableV51()){
    // Mobile radial should remain centered and not drift toward the bottom.
    cy = window.innerHeight / 2;
    cx = window.innerWidth / 2;
  } else if(tile){
    const r = tile.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  }

  const margin = size / 2 + 8;
  cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
  cy = Math.max(margin + 10, Math.min(window.innerHeight - margin - 100, cy));
  wheel.style.left = cx + "px";
  wheel.style.top = cy + "px";

  $("wheelCenter").innerHTML = `
    <div class="miniCenterName">${escapeHtmlV32 ? escapeHtmlV32(u.name) : u.name}</div>
    <div class="miniCenterHint">${isMobilePlayableV51() ? "tap twice" : "choose"}</div>
  `;

  $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
    const iconUrl = abilityIconUrl(u, a);
    const speedLabel = a.guard ? "Guard" : `⚡ ${totalSpeed(u,a)}`;
    const dreadDisabled = typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a);
    const disabled = state.actionsLeft<a.cost || dreadDisabled;
    const dreadTitle = dreadDisabled ? ` title="Disabled by Dread until end of round"` : "";
    return `<button class="wheelBtn w${i} ${dreadDisabled ? "dreadDisabled" : ""}" ${disabled?"disabled":""}
      data-id="${a.id}" data-index="${i}" style="--prof-icon:url('${iconUrl}')"${dreadTitle}>
      ${dreadDisabled ? `<span class="dreadX">×</span>` : ""}
      <span class="wheelBtnTitle">${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</span>
      <span class="wheelBtnMeta">${dreadDisabled ? "Dread disabled" : `${a.cost} AP · ${speedLabel}`}</span>
    </button>`;
  }).join("");

  const chooseAbility = (a) => {
    if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a)) {
      showKeywordPopup?.("dread");
      return;
    }
    pendingAbility = a;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
    hideKeywordPopup?.();
    renderBattle();
    if(!targets(u,pendingAbility).length) plan(null);
  };

  const showTipFor = (btn, a) => {
    if(!tooltip) return;
    const disabledText = (typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a))
      ? `<div class="rulesClarifier">${renderKeywordText("Dread disables this ability until end of round.")}</div>`
      : "";
    tooltip.innerHTML = `
      <div class="tipTop">
        <span class="tipIcon" style="background-image:url('${abilityIconUrl(u,a)}')"></span>
        <div>
          <b>${escapeHtmlV32 ? escapeHtmlV32(a.name) : a.name}</b>
          <small>${a.cost} AP · ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
        </div>
      </div>
      <div class="abilityDescText">${renderKeywordText ? renderKeywordText(a.desc) : a.desc}</div>
      ${disabledText}
      ${clarityTextForAbility ? clarityTextForAbility(a) : ""}
      <div class="tipTags">
        <span>${escapeHtmlV32 ? escapeHtmlV32(abilityIconKey(u,a)) : abilityIconKey(u,a)}</span>
        <span>${escapeHtmlV32 ? escapeHtmlV32(a.range || (a.guard ? "guard" : "self")) : (a.range || (a.guard ? "guard" : "self"))}</span>
        ${isMobilePlayableV51() ? "<span>tap same ability again to choose</span>" : ""}
      </div>
    `;
    tooltip.classList.remove("hidden");
    positionAbilityTooltipV34(tooltip, wheel, btn, Number(btn.dataset.index));
  };

  if(tooltip){
    tooltip.onpointerdown = (ev) => {
      const kw = ev.target.closest(".keywordLink");
      if(kw){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
      } else {
        ev.stopPropagation();
      }
    };
    tooltip.onclick = (ev) => {
      const kw = ev.target.closest(".keywordLink");
      if(kw){
        ev.preventDefault();
        ev.stopPropagation();
        showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
        return;
      }
      ev.stopPropagation();
    };
  }

  document.querySelectorAll(".wheelBtn").forEach(btn=>{
    const a = u.abilities.find(x=>x.id===btn.dataset.id);

    btn.onmouseenter = () => { if(!isMobilePlayableV51()) showTipFor(btn,a); };
    btn.onfocus = () => showTipFor(btn,a);
    btn.onmouseleave = () => {
      if(!isMobilePlayableV51() && tooltip) tooltip.classList.add("hidden");
    };

    const previewOrChoose = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a)){
        showTipFor(btn,a);
        showKeywordPopup?.("dread", btn, "Dread");
        return;
      }

      if(isMobilePlayableV51()){
        showTipFor(btn,a);
        if(wheelPreviewAbilityIdV34 === a.id){
          chooseAbility(a);
        } else {
          wheelPreviewAbilityIdV34 = a.id;
          document.querySelectorAll(".wheelBtn").forEach(x=>x.classList.remove("previewing"));
          btn.classList.add("previewing");
        }
        return;
      }

      chooseAbility(a);
    };

    btn.ontouchstart = previewOrChoose;
    btn.onclick = previewOrChoose;
  });

  radial.onclick = (ev) => {
    if(ev.target.closest(".wheel") || ev.target.closest("#abilityTooltip") || ev.target.closest("#keywordPopup")) return;
    radial.classList.add("hidden");
    if(tooltip) tooltip.classList.add("hidden");
  };
}

function positionAbilityTooltipV34(tooltip, wheel, btn, index){
  if(!tooltip || !wheel || !btn) return;

  if(isMobilePlayableV51()){
    tooltip.classList.add("mobileAbilitySheet");
    tooltip.style.left = "8px";
    tooltip.style.right = "8px";
    tooltip.style.top = "auto";
    tooltip.style.bottom = "max(8px, env(safe-area-inset-bottom))";
    tooltip.style.width = "calc(100vw - 16px)";
    return;
  }

  tooltip.classList.remove("mobileAbilitySheet");
  const wr = wheel.getBoundingClientRect();
  const br = btn.getBoundingClientRect();
  const tw = Math.min(360, window.innerWidth - 20);
  const th = Math.min(220, window.innerHeight * 0.38);
  let x, y;
  if(index === 0){
    x = wr.left + wr.width / 2 - tw / 2;
    y = wr.top - th - 14;
  } else if(index === 2){
    x = wr.left + wr.width / 2 - tw / 2;
    y = wr.bottom + 14;
  } else if(index === 1){
    x = wr.right + 14;
    y = br.top + br.height / 2 - th / 2;
  } else {
    x = wr.left - tw - 14;
    y = br.top + br.height / 2 - th / 2;
  }
  x = Math.max(10, Math.min(window.innerWidth - tw - 10, x));
  y = Math.max(10, Math.min(window.innerHeight - th - 10, y));
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
  tooltip.style.width = tw + "px";
}


/* ===== v53 mobile QA workflow ===== */
const QA_PRESETS_V53 = [
  {name:"iPhone SE", w:375, h:667},
  {name:"iPhone 12/13/14", w:390, h:844},
  {name:"iPhone 14 Pro Max", w:430, h:932},
  {name:"Pixel 7", w:412, h:915},
  {name:"Galaxy S20", w:360, h:800},
  {name:"Small Tablet", w:768, h:1024},
  {name:"Desktop", w:1280, h:800}
];

function qaParamsV53(){ return new URLSearchParams(location.search); }
function qaFlagV53(name){ return qaParamsV53().get(name)==="1"; }

function qaSetFlagV53(name, enabled){
  const p = qaParamsV53();
  if(enabled) p.set(name,"1"); else p.delete(name);
  try{
    // Some embedded file:// preview frames block history URL mutations.
    if(location.protocol === "http:" || location.protocol === "https:"){
      history.replaceState(null,"",`${location.pathname}?${p.toString()}`);
    }
  }catch(_e){}
  qaApplyFlagsV53();
}

function qaApplyFlagsV53(){
  const p = qaParamsV53();
  document.body.classList.toggle("qaModeV53", p.get("qa")==="1");
  document.body.classList.toggle("qaTouchTargetsV53", p.get("touch")==="1");
  document.body.classList.toggle("qaSafeAreaV53", p.get("safe")==="1");
  document.body.classList.toggle("qaGridV53", p.get("grid")==="1");
  document.body.classList.toggle("qaSlowV53", p.get("slow")==="1");
  if (typeof applyLayoutModeV52 === "function") applyLayoutModeV52();
  qaUpdatePanelV53();
}

function qaEnsurePanelV53(){
  if($("qaPanelV53")) return;
  const panel=document.createElement("div");
  panel.id="qaPanelV53";
  panel.className="qaPanelV53";
  panel.innerHTML=`
    <button id="qaToggleV53" class="qaToggleV53" type="button">QA</button>
    <div class="qaBodyV53">
      <div class="qaTitleV53">Mobile QA</div>
      <div class="qaMetaV53" id="qaMetaV53"></div>
      <div class="qaRowV53">
        <button data-qa-flag="mobile">Mobile</button>
        <button data-qa-flag="debug">Debug</button>
        <button data-qa-flag="touch">Touch</button>
        <button data-qa-flag="safe">Safe</button>
        <button data-qa-flag="grid">Grid</button>
        <button data-qa-flag="slow">Slow</button>
      </div>
      <div class="qaTitleSmallV53">States</div>
      <div class="qaRowV53">
        <button id="qaHomeV53" type="button">Home</button>
        <button id="qaBattleV53" type="button">Battle</button>
        <button id="qaRadialV53" type="button">Radial</button>
        <button id="qaResolveV53" type="button">Resolve Card</button>
      </div>
      <div class="qaTitleSmallV53">Viewport presets</div>
      <div id="qaPresetListV53" class="qaPresetListV53"></div>
      <div class="qaHintV53">Use DevTools device toolbar for true viewport size. Presets copy size text and enable mobile/debug.</div>
    </div>`;
  document.body.appendChild(panel);

  $("qaToggleV53").onclick=()=>{
    const next=!document.body.classList.contains("qaPanelOpenV53");
    document.body.classList.toggle("qaPanelOpenV53", next);
    qaSetFlagV53("qa", next);
  };

  panel.querySelectorAll("[data-qa-flag]").forEach(btn=>{
    btn.onclick=()=>qaSetFlagV53(btn.dataset.qaFlag, qaParamsV53().get(btn.dataset.qaFlag)!=="1");
  });

  $("qaHomeV53").onclick=()=>qaOpenHomeV53();
  $("qaBattleV53").onclick=()=>qaOpenBattleV53();
  $("qaRadialV53").onclick=()=>qaOpenRadialV53();
  $("qaResolveV53").onclick=()=>qaOpenResolutionV53();

  $("qaPresetListV53").innerHTML = QA_PRESETS_V53.map(p=>`
    <button type="button" data-w="${p.w}" data-h="${p.h}">
      <b>${p.name}</b><small>${p.w}×${p.h}</small>
    </button>`).join("");

  $("qaPresetListV53").querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      qaSetFlagV53("mobile", Number(btn.dataset.w) <= 900);
      qaSetFlagV53("debug", true);
      qaSetFlagV53("qa", true);
      navigator.clipboard?.writeText(`${btn.dataset.w}x${btn.dataset.h}`).catch(()=>{});
      show?.(`Preset ${btn.dataset.w}×${btn.dataset.h} copied`);
    };
  });
}

function qaUpdatePanelV53(){
  const meta=$("qaMetaV53");
  if(meta) meta.textContent = `${document.body.dataset.layoutMode || "?"} · ${window.innerWidth}×${window.innerHeight}`;
  const p=qaParamsV53();
  document.querySelectorAll("#qaPanelV53 [data-qa-flag]").forEach(btn=>{
    btn.classList.toggle("active", p.get(btn.dataset.qaFlag)==="1");
  });
  document.body.classList.toggle("qaPanelOpenV53", p.get("qa")==="1");
}

function qaOpenHomeV53(){
  $("battle")?.classList.add("hidden");
  $("builder")?.classList.remove("hidden");
  renderBuilder?.();
}

function qaEnsureTeamV53(){
  if(!chosenIds || chosenIds.length < 3){
    chosenIds = ["dravain","smithen","maoja"].filter(id=>cdef(id));
    if(chosenIds.length < 3) chosenIds = ROSTER.slice(0,3).map(c=>c.id);
  }
  selectedTeam = [
    {id:chosenIds[0], row:"front", col:0},
    {id:chosenIds[1], row:"back", col:1},
    {id:chosenIds[2], row:"front", col:2}
  ];
  builderStep="arrange";
}

function qaOpenBattleV53(){ qaEnsureTeamV53(); mode="squad"; startBattle?.(); }
function qaOpenRadialV53(){
  if(!$("battle") || $("battle").classList.contains("hidden")) qaOpenBattleV53();
  const u = alive("player")[0]; if(!u) return;
  selectedId=u.id; selectedSide=u.side; pendingAbility=null; renderBattle?.(); openWheel?.(u);
}
function qaOpenResolutionV53(){
  if(!$("battle") || $("battle").classList.contains("hidden")) qaOpenBattleV53();
  const actor=alive("player")[0], target=alive("enemy")[0];
  if(!actor || !target) return;
  const ability=actor.abilities.find(a=>targets(actor,a).includes(target)) || actor.abilities[0];
  showResolutionOverlay?.(actor, ability, target, "result", [
    {type:"hp", text:`${target.name} lost 3 HP`},
    {type:"statusGain", text:`${target.name} gained 2 Bleed`},
    {type:"armor", text:`Armor reduced the hit by 1`}
  ]);
}

window.qaOpenBattle=qaOpenBattleV53;
window.qaOpenRadial=qaOpenRadialV53;
window.qaOpenResolution=qaOpenResolutionV53;
window.qaApplyFlags=qaApplyFlagsV53;

setTimeout(()=>{ qaEnsurePanelV53(); qaApplyFlagsV53(); },0);
window.addEventListener("resize",()=>setTimeout(qaApplyFlagsV53,50));


/* ===== v56 balance + proficiency identity pass =====
   Design goals:
   - Shield is rare and mostly Divinity-only.
   - Guards are defensive timing tools, not huge stat packages.
   - Bleed from attacks is applied only if the hit dealt HP damage.
   - Bloodcraft sustain requires self-damage or consuming Bleed.
   - Assassins defend themselves, not allies.
   - Sorcerers stay ranged/status focused.
   - Brutes are pressure/disruption, not armor/shield tanks.
*/

const BALANCE_NOTES_V56 = [
  "Shield is rare: mostly Divinity bosses/characters. Non-Divinity guards use Dodge, Protect, redirect, prediction, counters, or Armor instead.",
  "Attack-applied Bleed now requires the attack to deal HP damage.",
  "Bloodcraft healing/protection requires self-damage, draining, or consuming Bleed.",
  "Brutes keep disruption/pressure identity instead of heavy shield/armor stacking.",
  "Sorcerers keep ranged/status identity and avoid heavy melee burst.",
  "Assassins keep self-evasion and precision, not ally protection."
];

function profHasV56(u, key){
  return String(`${u?.class||""} ${u?.prof||""}`).toLowerCase().includes(key);
}

function setAbilityV56(unitId, abilityId, patch){
  const c = ROSTER.find(x=>x.id===unitId);
  const a = c?.abilities?.find(x=>x.id===abilityId);
  if(a) Object.assign(a, patch);
  return a;
}

function tuneBalanceV56(){
  const setChar = (id, patch) => { const c=ROSTER.find(x=>x.id===id); if(c) Object.assign(c, patch); };

  // Global descriptions.
  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.shield = {
      title:"Shield",
      text:"Rare temporary protection, mostly from Divinity. Damage is reduced by Armor first, then Shield absorbs remaining damage before HP. Removed at end of round."
    };
    KEYWORDS_V32.bleed = {
      title:"Bleed",
      text:"When this unit is hit by an attack that deals HP damage, remove all Bleed and add that much damage to that hit before Armor/Shield are calculated. Attack abilities that apply Bleed only apply it if they dealt HP damage."
    };
  }

  // Smithen: keep assassin + icecraft. Less free status on 1 AP; no over-efficient ranged poke.
  setAbilityV56("smithen","iceNeedle",{
    name:"Ice Needle",
    cost:1, spd:2,
    desc:"Melee attack. Deal 3 damage. If this hit deals HP damage, apply 1 Freeze.",
    effect:"damageStatusOnHit",
    dmg:3,status:"freeze",stacks:1,range:"melee",iconKey:"icecraft"
  });
  setAbilityV56("smithen","shatter",{
    name:"Shatter Shot",
    cost:2, spd:0,
    desc:"Ranged payoff. Deal 4 damage with Pierce 1. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze stack.",
    effect:"shatterScaling",
    range:"ranged",pierce:1,iconKey:"icecraft"
  });
  setAbilityV56("smithen","whiteout",{
    cost:1, spd:1,
    desc:"Ranged setup. Apply 1 Freeze. If the target already had Freeze, also apply Exposed.",
    effect:"whiteout",range:"ranged",iconKey:"icecraft"
  });

  // Dravain: warrior/vampire. Protect is okay; shield passive removed.
  setChar("dravain",{
    passive:"Passive — Blood Guard: when Dravain consumes Bleed with Blood Claim, Dravain restores 1 HP. This is healing from consumed blood, not Shield."
  });
  setAbilityV56("dravain","protect",{
    cost:1, spd:99,
    desc:"Guard. Choose an ally. The first attack targeting that ally this round targets Dravain instead. No Shield is gained.",
    effect:"protect",guard:true,range:"ally",iconKey:"warrior"
  });
  setAbilityV56("dravain","slash",{
    cost:1, spd:0,
    desc:"Melee attack. Deal 4 damage. If this hit deals HP damage, apply 1 Bleed.",
    effect:"damageStatusOnHit",dmg:4,status:"bleed",stacks:1,range:"melee",iconKey:"vampire"
  });
  setAbilityV56("dravain","claim",{
    cost:2, spd:-2,
    desc:"Bleed payoff. Remove all Bleed from one enemy. Deal damage equal to removed Bleed +3. If any Bleed was removed, Dravain restores 1 HP.",
    effect:"consumeBleed",bonus:3,heal:1,range:"ranged",iconKey:"vampire"
  });

  // Yaura: bloodcraft must pay HP for protection/sustain; no free shield.
  setAbilityV56("yaura","ward",{
    name:"Blood Ward",
    cost:1, spd:99,
    desc:"Guard. Choose an ally. That ally loses 1 HP, ignoring Armor and Shield. If that ally is attacked this round, the attacker gains 2 Bleed. No Shield is gained.",
    effect:"bloodWard",guard:true,range:"ally",self:1,stacks:2,iconKey:"bloodcraft"
  });
  setAbilityV56("yaura","bolt",{
    cost:1, spd:0,
    desc:"Ranged attack. Deal 2 damage ignoring Armor. Shield can still absorb it. If this hit deals HP damage, apply 2 Bleed.",
    effect:"damageStatusOnHit",dmg:2,status:"bleed",stacks:2,range:"ranged",ignoreArmor:true,iconKey:"bloodcraft"
  });
  setAbilityV56("yaura","rain",{
    cost:2, spd:-2,
    desc:"Area bloodcraft status. Yaura loses 2 HP, ignoring Armor and Shield. Then apply 1 Bleed to every enemy.",
    effect:"selfAllStatus",self:2,status:"bleed",stacks:1,iconKey:"bloodcraft"
  });

  // K'ku: brute/icecraft. No huge Shield. Guard is counter-pressure.
  setAbilityV56("kku","guard",{
    name:"Ice Guard",
    cost:1, spd:99,
    desc:"Guard. If K'ku is hit by an attack this round, the attacker gains 2 Freeze. K'ku gains no Shield.",
    effect:"selfCounter",guard:true,status:"freeze",stacks:2,shield:0,iconKey:"icecraft"
  });
  setAbilityV56("kku","break",{
    cost:2, spd:-2,
    desc:"Melee payoff. Deal 5 damage. If the target has Freeze, deal +4 damage. Slow but strong against frozen enemies.",
    effect:"glacier",range:"melee",bonus:4,iconKey:"brute"
  });

  // Kahro: darkness assassin. Add Dread identity; tune burst down.
  setAbilityV56("kahro","assassinate",{
    cost:2, spd:1,
    desc:"Ranged precision. Deal 5 damage with Pierce 1. If the target is in the back row and the front row is empty, deal +3 damage.",
    effect:"assassinate",range:"ranged",pierce:1,bonus:3,iconKey:"assassin"
  });
  setAbilityV56("kahro","mark",{
    name:"Shadow Mark",
    cost:1, spd:0,
    desc:"Ranged setup. Apply Exposed and Dread to one enemy. Dread disables one random non-Guard ability until end of round.",
    effect:"multiStatus",statuses:[["exposed",1],["dread",1]],range:"ranged",iconKey:"darkness"
  });
  setAbilityV56("kahro","punish",{
    cost:1, spd:1,
    desc:"Ranged anti-Guard. If the target used a Guard ability this round, deal 6 damage. Otherwise, deal 2 damage.",
    effect:"punishGuard",range:"ranged",iconKey:"darkness"
  });

  // Maoja: brute/witchcraft pressure, not defense.
  setAbilityV56("maoja","grip",{
    cost:1, spd:-1,
    desc:"Melee attack. Deal 3 damage and apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted.",
    effect:"toxicGrip",range:"melee",iconKey:"witchcraft"
  });
  setAbilityV56("maoja","burst",{
    cost:2, spd:-3,
    desc:"Poison payoff. Remove all Poison from one enemy. Deal damage equal to removed Poison ×2, ignoring Armor. Shield can still absorb it.",
    effect:"poisonBurst",range:"ranged",ignoreArmor:true,iconKey:"witchcraft"
  });

  // Paleya: sorcerer/hypnotic. Good identity; keep payoff but not too cheap.
  setAbilityV56("paleya","break",{
    cost:1, spd:-1,
    desc:"Ranged payoff. If the target has Hypnosis, remove Hypnosis and deal 6 damage ignoring Armor. Otherwise, deal 2 damage.",
    effect:"mindBreak",range:"ranged",ignoreArmor:true,iconKey:"hypnotic"
  });
  setAbilityV56("paleya","predict",{
    cost:1, spd:99,
    desc:"Guard prediction. Choose an enemy. If that enemy uses a damage attack this round, cancel that action and apply Hypnosis to that enemy. No Shield is gained.",
    effect:"predict",guard:true,range:"ranged",iconKey:"hypnotic"
  });

  // Poom: brute/hypnotic. Remove ally defense identity; make self guard.
  setChar("poom",{
    passive:"Passive — Mirror Mind: after an enemy hits Poom with a melee attack that deals HP damage, that enemy gains Hypnosis."
  });
  setAbilityV56("poom","guard",{
    name:"Guard Mind",
    cost:1, spd:99,
    desc:"Guard. If Poom is hit by an attack this round, the attacker gains Hypnosis. Poom gains no Shield and does not protect allies.",
    effect:"selfCounter",guard:true,status:"hypnosis",stacks:1,shield:0,iconKey:"hypnotic"
  });
  setAbilityV56("poom","bash",{
    cost:1, spd:-1,
    desc:"Melee brute attack. Deal 4 damage and apply Sunder 1 until end of round. No Freeze.",
    effect:"damage",dmg:4,range:"melee",sunder:1,iconKey:"brute"
  });
  setAbilityV56("poom","roar",{
    name:"Mesmer Roar",
    cost:2, spd:-1,
    desc:"Hypnotic payoff. Choose one enemy. Deal 3 damage. If that enemy has Hypnosis, remove Hypnosis and deal +5 damage.",
    effect:"mesmerPayoff",range:"ranged",dmg:3,bonus:5,iconKey:"hypnotic"
  });

  // Shaman/Bahl: bloodcraft/demon sorcerer. No free shield; blood protection costs HP.
  setChar("shaman",{name:"Bahl"});
  setAbilityV56("shaman","ward",{
    name:"Demon Ward",
    cost:1, spd:99,
    desc:"Guard. Choose an ally. That ally loses 1 HP, ignoring Armor and Shield. If that ally is attacked this round, the attacker gains 2 Bleed.",
    effect:"bloodWard",guard:true,range:"ally",self:1,stacks:2,iconKey:"demon"
  });
  setAbilityV56("shaman","plague",{
    cost:2, spd:-2,
    desc:"Row status. Choose an enemy row. Apply 3 Poison to each enemy in that row. Deals no immediate damage.",
    effect:"rowStatus",status:"poison",stacks:3,range:"ranged",iconKey:"demon"
  });

  // Eva: assassin/vampire, sustain only by hitting bleeding targets/consuming bleed.
  setAbilityV56("eva","fangs",{
    cost:1, spd:1,
    desc:"Melee attack. Deal 3 damage. If this hit deals HP damage, apply 1 Bleed.",
    effect:"damageStatusOnHit",dmg:3,status:"bleed",stacks:1,range:"melee",iconKey:"vampire"
  });
  setAbilityV56("eva","bite",{
    cost:2, spd:0,
    desc:"Bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +5 damage. If any Bleed was removed, Lady Eva restores 2 HP.",
    effect:"consumeBleed",bonus:5,heal:2,range:"melee",iconKey:"vampire"
  });

  // Hyafrost: sorcerer/spirit icecraft. Remove Shield from passive/guard.
  setChar("hyafrost",{
    passive:"Passive — Deep Winter: when Hyafrost applies Freeze to an enemy, Hyafrost gains +1 Armor until end of round. No Shield."
  });
  setAbilityV56("hyafrost","spirit",{
    name:"Spirit Form",
    cost:1, spd:99,
    desc:"Guard. Hyafrost gains Dodge. Dodge prevents the next attack targeting Hyafrost this round, then is removed. No Shield.",
    effect:"dodge",guard:true,iconKey:"spirit"
  });
  setAbilityV56("hyafrost","armor",{
    name:"Frost Armor",
    cost:1, spd:2,
    desc:"Ally support. Choose an ally. That ally gains +2 Armor until end of round. Until end of round, enemies that hit that ally with melee gain 1 Freeze.",
    effect:"frostArmorRetaliate",range:"ally",armor:2,shield:0,iconKey:"icecraft"
  });

  // Bakub: sorcerer status engine; prediction okay, no Shield.
  setAbilityV56("bakub","future",{
    cost:1, spd:99,
    desc:"Guard prediction. Choose an enemy. If that enemy uses a damage attack this round, cancel that action and apply 2 Poison to that enemy. No Shield.",
    effect:"predictPoison",guard:true,range:"ranged",iconKey:"hypnotic"
  });

  // Bosses: keep shield only where Divinity supports it, but reduce extremes.
  if(typeof IVORY_FAIRY_BOSS !== "undefined"){
    const aegis = IVORY_FAIRY_BOSS.abilities.find(a=>a.id==="ivory_aegis");
    if(aegis) Object.assign(aegis,{
      cost:1, shield:5,
      desc:"Guard. The Ivory Fairy gains 5 Shield before damage is dealt this round. If an enemy hits her this round, that attacker gains 1 Bleed."
    });
  }
  if(typeof GESHAR_BOSS !== "undefined"){
    const veil = GESHAR_BOSS.abilities.find(a=>a.id==="spirit_veil");
    if(veil) Object.assign(veil,{
      cost:1, shield:3,
      desc:"Guard. Geshar gains 3 Shield and Dodge. Dodge prevents the next attack targeting Geshar this round, then is removed."
    });
    const lance = GESHAR_BOSS.abilities.find(a=>a.id==="soul_lance");
    if(lance) Object.assign(lance,{loss:4, desc:"Direct damage. Choose one enemy. That enemy loses 4 HP; this ignores Armor and Shield."});
  }
}
tuneBalanceV56();

const damageBeforeBalanceV56 = damage;
damage = function(src,t,amt,opt={}){
  if(!src||!t||src.dead||t.dead) return 0;

  const beforeHp = t.hp;
  const beforeDead = t.dead;
  const result = damageBeforeBalanceV56(src,t,amt,opt);
  const dealt = Math.max(0, beforeHp - (t?.hp ?? beforeHp));

  // Brute/hypnotic and icecraft passives should trigger only on HP damage, not fully blocked hits.
  if(dealt <= 0 && opt?.attack){
    // Some previous passive/status hooks may have already fired in older code. This guard is mostly for new v56 hooks.
  }

  return dealt;
};

function applyOnHitStatusV56(c,a,t,extraOpt={}){
  const dealt = damage(c,t,a.dmg,{attack:true,melee:a.range==="melee",ignoreArmor:!!a.ignoreArmor,pierce:a.pierce||0,...extraOpt});
  if(dealt > 0) addStatus(t,a.status,a.stacks||1);
  else {
    pushActionEvent?.("info", `${a.name} dealt no HP damage, so ${a.status} was not applied`, t);
    log(`${a.name} dealt no HP damage, so ${a.status} was not applied.`);
  }
  return dealt;
}

const applyBeforeBalanceV56 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "damageStatusOnHit":
      applyOnHitStatusV56(c,a,t);
      break;

    case "bloodWard":
      if(t && !t.dead){
        life(t,a.self||1);
        state.counters.push({caster:t,status:"bleed",stacks:a.stacks||2,shield:0});
        state.guarded[t.id]=true;
        spawnFloatingText?.(t, "Blood Ward", "status");
        pushActionEvent?.("statusGain", `${t.name} paid ${a.self||1} HP. Attackers that hit this round gain ${a.stacks||2} Bleed.`, t);
        log(`${t.name} pays ${a.self||1} HP for Blood Ward. Attackers that hit gain ${a.stacks||2} Bleed.`);
      }
      break;

    case "selfAllStatus":
      life(c,a.self||2);
      alive(other(c.side)).forEach(x=>addStatus(x,a.status,a.stacks||1));
      break;

    case "damage":
      damage(c,t,a.dmg,{attack:true,melee:a.range==="melee",sunder:a.sunder||0});
      if(a.sunder) addArmorThisRound?.(t,-a.sunder);
      break;

    case "consumeBleed": {
      const b=t?.status?.bleed||0;
      if(t) t.status.bleed=0;
      damage(c,t,b+(a.bonus||0),{attack:true,melee:a.range==="melee",pierce:a.pierce||0,ignoreArmor:!!a.ignoreArmor});
      if(b>0 && a.heal) heal(c,a.heal);
      break;
    }

    case "glacier":
      damage(c,t,5+(t?.status?.freeze?(a.bonus||4):0),{attack:true,melee:true});
      break;

    case "mindBreak": {
      const had=!!t?.status?.hypnosis;
      if(had) t.status.hypnosis=0;
      damage(c,t,had?6:2,{attack:true,ignoreArmor:!!a.ignoreArmor});
      break;
    }

    case "assassinate": {
      const frontEmpty = !frontBlocked(t.side);
      const bonus = (t?.row==="back" && frontEmpty) ? (a.bonus||3) : 0;
      damage(c,t,5+bonus,{attack:true,pierce:a.pierce||0});
      break;
    }

    default:
      applyBeforeBalanceV56(c,a,t);
  }

  // Hyafrost passive changed from Shield to temporary Armor.
  if(c?.id==="hyafrost" && ["damageStatusOnHit","damageStatus","rowStatus","whiteout"].includes(a.effect)){
    addArmorThisRound?.(c,1);
    markPassive?.(c,"Deep Winter");
    pushActionEvent?.("passive", `Deep Winter gives Hyafrost +1 Armor until end of round`, c);
  }
};


/* ===== v57 hypnotic identity pass =====
   Rule:
   - Setup actions apply Hypnosis.
   - Strong attacks/control are payoffs and consume Hypnosis.
   - No ability should both cancel/nullify a future attack and apply Hypnosis as part of the same payoff.
*/

function tuneHypnoticV57(){
  const set = (unitId, abilityId, patch) => {
    const c = ROSTER.find(x=>x.id===unitId);
    const a = c?.abilities?.find(x=>x.id===abilityId);
    if(a) Object.assign(a, patch);
  };

  // Paleya: pure hypnotic character.
  set("paleya","stare",{
    name:"Hypnosis Stare",
    cost:1, spd:1,
    desc:"Ranged setup. Apply Hypnosis to one enemy. Hypnosis does nothing by itself, but your payoff abilities consume it for stronger effects.",
    effect:"status",
    status:"hypnosis",
    stacks:1,
    range:"ranged",
    iconKey:"hypnotic"
  });

  set("paleya","break",{
    name:"Mind Break",
    cost:1, spd:-1,
    desc:"Ranged payoff. If the target has Hypnosis, remove Hypnosis and deal 6 damage ignoring Armor. If the target does not have Hypnosis, deal 2 damage.",
    effect:"mindBreak",
    range:"ranged",
    ignoreArmor:true,
    iconKey:"hypnotic"
  });

  set("paleya","fog",{
    name:"Dream Fog",
    cost:2, spd:-2,
    desc:"Row setup. Choose an enemy row. Apply Hypnosis to each enemy in that row. This deals no damage and does not cancel actions.",
    effect:"rowStatus",
    status:"hypnosis",
    stacks:1,
    range:"ranged",
    iconKey:"hypnotic"
  });

  set("paleya","predict",{
    name:"Mind Lock",
    cost:1, spd:99,
    desc:"Guard payoff. Choose an enemy with Hypnosis. Remove Hypnosis now. If that enemy uses a damage attack this round, cancel that action. If it does not attack, nothing else happens.",
    effect:"consumeHypnosisPredict",
    guard:true,
    range:"ranged",
    iconKey:"hypnotic"
  });

  // Poom: brute/hypnotic uses setup through being hit, payoff through roar.
  set("poom","guard",{
    name:"Guard Mind",
    cost:1, spd:99,
    desc:"Guard setup. If Poom is hit by an attack this round, the attacker gains Hypnosis. This does not cancel the attack and gives no Shield.",
    effect:"selfCounter",
    guard:true,
    status:"hypnosis",
    stacks:1,
    shield:0,
    iconKey:"hypnotic"
  });

  set("poom","roar",{
    name:"Mesmer Roar",
    cost:2, spd:-1,
    desc:"Hypnotic payoff. Choose one enemy. Deal 3 damage. If that enemy has Hypnosis, remove Hypnosis and deal +5 damage.",
    effect:"mesmerPayoff",
    range:"ranged",
    dmg:3,
    bonus:5,
    iconKey:"hypnotic"
  });

  // Bakub: setup poisons + hypnosis; control payoff consumes hypnosis.
  set("bakub","vial",{
    name:"Nightmare Vial",
    cost:1, spd:0,
    desc:"Ranged setup. Apply 2 Poison and Hypnosis to one enemy. This sets up Poison and Hypnosis payoffs.",
    effect:"multiStatus",
    statuses:[["poison",2],["hypnosis",1]],
    range:"ranged",
    iconKey:"hypnotic"
  });

  set("bakub","fog",{
    name:"Demon Fog",
    cost:2, spd:-2,
    desc:"Row setup. Choose an enemy row. Apply 1 Poison and Hypnosis to each enemy in that row.",
    effect:"rowMultiStatus",
    statuses:[["poison",1],["hypnosis",1]],
    range:"ranged",
    iconKey:"hypnotic"
  });

  set("bakub","toxin",{
    name:"Mind Toxin",
    cost:1, spd:-1,
    desc:"Ranged payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis and apply 3 Poison.",
    effect:"mindToxinConsume",
    range:"ranged",
    dmg:3,
    poison:3,
    iconKey:"witchcraft"
  });

  set("bakub","future",{
    name:"False Future",
    cost:1, spd:99,
    desc:"Guard payoff. Choose an enemy with Hypnosis. Remove Hypnosis now. If that enemy uses a damage attack this round, cancel that action and apply 2 Poison. If it does not attack, nothing else happens.",
    effect:"consumeHypnosisPoisonPredict",
    guard:true,
    range:"ranged",
    iconKey:"hypnotic"
  });
}
tuneHypnoticV57();

function hasHypnosisV57(u){
  return !!(u?.status?.hypnosis);
}

function consumeHypnosisV57(u){
  if(!u?.status?.hypnosis) return false;
  u.status.hypnosis = 0;
  spawnFloatingText?.(u, "Hypnosis removed", "status");
  pushActionEvent?.("statusLoss", `${u.name}'s Hypnosis was removed`, u);
  log(`${u.name}'s Hypnosis is removed.`);
  return true;
}

const targetsBeforeHypnoticV57 = targets;
targets = function(c,a){
  if(a?.effect === "consumeHypnosisPredict" || a?.effect === "consumeHypnosisPoisonPredict"){
    return alive(other(c.side)).filter(x => hasHypnosisV57(x));
  }
  return targetsBeforeHypnoticV57(c,a);
};

const applyBeforeHypnoticV57 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "consumeHypnosisPredict": {
      if(!t || !consumeHypnosisV57(t)){
        spawnFloatingText?.(c, "Needs Hypnosis", "cancel");
        pushActionEvent?.("cancel", `${a.name} needs a target with Hypnosis`, c);
        log(`${a.name} needs a target with Hypnosis.`);
        return;
      }
      state.predicts.push({caster:c,target:t,status:null,stacks:0,consumeOnly:true});
      state.guarded[t.id]=true;
      spawnFloatingText?.(t, "Mind Locked", "status");
      pushActionEvent?.("statusTrigger", `${c.name} locked ${t.name}. If ${t.name} uses a damage attack this round, it is canceled.`, t);
      log(`${c.name} locks ${t.name}'s mind. If ${t.name} attacks this round, it is canceled.`);
      return;
    }

    case "consumeHypnosisPoisonPredict": {
      if(!t || !consumeHypnosisV57(t)){
        spawnFloatingText?.(c, "Needs Hypnosis", "cancel");
        pushActionEvent?.("cancel", `${a.name} needs a target with Hypnosis`, c);
        log(`${a.name} needs a target with Hypnosis.`);
        return;
      }
      state.predicts.push({caster:c,target:t,status:"poison",stacks:2,consumeOnly:true});
      state.guarded[t.id]=true;
      spawnFloatingText?.(t, "False Future", "status");
      pushActionEvent?.("statusTrigger", `${c.name} set a False Future on ${t.name}. If ${t.name} uses a damage attack this round, it is canceled and gains 2 Poison.`, t);
      log(`${c.name} sets a False Future on ${t.name}. If ${t.name} attacks this round, it is canceled and gains 2 Poison.`);
      return;
    }

    case "mindToxinConsume": {
      const had = !!t?.status?.hypnosis;
      damage(c,t,a.dmg || 3,{attack:true,melee:false});
      if(had){
        consumeHypnosisV57(t);
        if(!t.dead) addStatus(t,"poison",a.poison || 3);
      }
      return;
    }

    default:
      applyBeforeHypnoticV57(c,a,t);
  }
};

// Prediction resolver cleanup: if a predict has status:null, it only cancels and does not apply a setup status.
const damageBeforeHypnoticV57 = damage;
damage = function(src,t,amt,opt={}){
  if(opt.attack && state?.predicts){
    const idx = state.predicts.findIndex(p => p.target === src);
    if(idx >= 0 && state.predicts[idx].status == null){
      const pr = state.predicts[idx];
      state.predicts.splice(idx,1);
      state.canceledActionKeys?.push(state.currentActionKey);
      markPassive?.(pr.caster, "Hypnotic Payoff");
      pushActionEvent?.("cancel", `${pr.caster.name} consumed Hypnosis and canceled ${src.name}'s action`, src);
      log(`${pr.caster.name} consumed Hypnosis and canceled ${src.name}'s action.`);
      spawnFloatingText?.(src, "Canceled", "cancel");
      return 0;
    }
  }
  return damageBeforeHypnoticV57(src,t,amt,opt);
};

// AI hint: these are payoff abilities, not setup.
const isPayoffAbilityBeforeHypnoticV57 = typeof isPayoffAbilityV45 === "function" ? isPayoffAbilityV45 : null;
if(isPayoffAbilityBeforeHypnoticV57){
  isPayoffAbilityV45 = function(a){
    return ["consumeHypnosisPredict","consumeHypnosisPoisonPredict","mindToxinConsume"].includes(a.effect) || isPayoffAbilityBeforeHypnoticV57(a);
  };
}

const payoffReadinessBeforeHypnoticV57 = typeof payoffReadinessV45 === "function" ? payoffReadinessV45 : null;
if(payoffReadinessBeforeHypnoticV57){
  payoffReadinessV45 = function(a,t){
    if(["consumeHypnosisPredict","consumeHypnosisPoisonPredict","mindToxinConsume"].includes(a.effect)) return hasHypnosisV57(t);
    return payoffReadinessBeforeHypnoticV57(a,t);
  };
}


/* ===== v58 Poom Purple Blood + Guard Mind cleanup =====
   Lore/design update:
   - Poom passive is now Purple Blood.
   - Guard Mind is no longer redundant setup. It is now a defensive Hypnosis payoff.
*/

function tunePoomV58(){
  const poom = ROSTER.find(c=>c.id==="poom");
  if(!poom) return;

  poom.passive = "Passive — Purple Blood: Poom's blood is hypnotic. After an enemy hits Poom with a melee attack that deals HP damage, that enemy gains Hypnosis.";

  const guard = poom.abilities.find(a=>a.id==="guard");
  if(guard){
    Object.assign(guard,{
      name:"Guard Mind",
      cost:1,
      spd:99,
      desc:"Guard payoff. Choose an enemy with Hypnosis. Remove Hypnosis from that enemy. If that enemy uses a damage attack targeting Poom this round, cancel that attack.",
      effect:"poomGuardMindPayoff",
      guard:true,
      range:"ranged",
      status:null,
      stacks:0,
      shield:0,
      iconKey:"hypnotic"
    });
  }
}
tunePoomV58();

const targetsBeforePoomV58 = targets;
targets = function(c,a){
  if(a?.effect === "poomGuardMindPayoff"){
    return alive(other(c.side)).filter(x => !!x.status?.hypnosis);
  }
  return targetsBeforePoomV58(c,a);
};

const applyBeforePoomV58 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  if(a.effect === "poomGuardMindPayoff"){
    if(!t?.status?.hypnosis){
      spawnFloatingText?.(c, "Needs Hypnosis", "cancel");
      pushActionEvent?.("cancel", `Guard Mind needs a target with Hypnosis`, c);
      log(`Guard Mind needs a target with Hypnosis.`);
      return;
    }

    t.status.hypnosis = 0;
    spawnFloatingText?.(t, "Hypnosis removed", "status");
    pushActionEvent?.("statusLoss", `${t.name}'s Hypnosis was removed by Guard Mind`, t);

    state.predicts.push({
      caster:c,
      target:t,
      status:null,
      stacks:0,
      onlyIfTargetId:c.id,
      poomGuardMind:true
    });

    state.guarded[t.id]=true;
    spawnFloatingText?.(c, "Guard Mind", "status");
    pushActionEvent?.("statusTrigger", `${c.name} used Guard Mind. If ${t.name} attacks Poom this round, that attack is canceled.`, c);
    log(`${c.name} uses Guard Mind on ${t.name}. If ${t.name} attacks Poom this round, that attack is canceled.`);
    return;
  }

  applyBeforePoomV58(c,a,t);
};

const damageBeforePoomV58 = damage;
damage = function(src,t,amt,opt={}){
  if(opt?.attack && state?.predicts){
    const idx = state.predicts.findIndex(p => p.poomGuardMind && p.target === src);
    if(idx >= 0){
      const pr = state.predicts[idx];
      state.predicts.splice(idx,1);

      if(t?.id === pr.onlyIfTargetId){
        state.canceledActionKeys?.push(state.currentActionKey);
        markPassive?.(pr.caster, "Guard Mind");
        pushActionEvent?.("cancel", `${pr.caster.name}'s Guard Mind canceled ${src.name}'s attack on Poom`, src);
        log(`${pr.caster.name}'s Guard Mind cancels ${src.name}'s attack on Poom.`);
        spawnFloatingText?.(src, "Canceled", "cancel");
        return 0;
      }

      // The enemy attacked someone else, so Guard Mind remains armed for a later attack this round.
      const result = damageBeforePoomV58(src,t,amt,opt);
      if(!src.dead && !pr.caster.dead && state?.phase === "resolving") state.predicts.push(pr);
      return result;
    }
  }

  return damageBeforePoomV58(src,t,amt,opt);
};

// Keep AI aware that Guard Mind is a payoff and should not be used without Hypnosis.
const isPayoffAbilityBeforePoomV58 = typeof isPayoffAbilityV45 === "function" ? isPayoffAbilityV45 : null;
if(isPayoffAbilityBeforePoomV58){
  isPayoffAbilityV45 = function(a){
    return a.effect === "poomGuardMindPayoff" || isPayoffAbilityBeforePoomV58(a);
  };
}

const payoffReadinessBeforePoomV58 = typeof payoffReadinessV45 === "function" ? payoffReadinessV45 : null;
if(payoffReadinessBeforePoomV58){
  payoffReadinessV45 = function(a,t){
    if(a.effect === "poomGuardMindPayoff") return !!t?.status?.hypnosis;
    return payoffReadinessBeforePoomV58(a,t);
  };
}


/* ===== v59 Poom Guard Mind redesign =====
   New Guard Mind:
   - Consume Hypnosis from ALL enemies.
   - For each enemy whose Hypnosis was consumed, all offensive actions they use this turn are redirected to Poom.
   - Poom gains +1 Armor until end of round for each Hypnosis consumed.
*/

function tunePoomV59(){
  const poom = ROSTER.find(c=>c.id==="poom");
  if(!poom) return;

  poom.passive = "Passive — Purple Blood: Poom's blood is hypnotic. After an enemy hits Poom with a melee attack that deals HP damage, that enemy gains Hypnosis.";

  const guard = poom.abilities.find(a=>a.id==="guard");
  if(guard){
    Object.assign(guard,{
      name:"Guard Mind",
      cost:1,
      spd:99,
      desc:"Guard payoff. Consume Hypnosis from all enemies. For each enemy that lost Hypnosis this way, all offensive actions they use this turn are redirected to Poom. Poom gains +1 Armor until end of round for each Hypnosis consumed.",
      effect:"poomMassGuardMind",
      guard:true,
      range:"self",
      status:null,
      stacks:0,
      shield:0,
      iconKey:"hypnotic"
    });
  }
}
tunePoomV59();

function isOffensiveAbilityV59(a){
  if(!a) return false;
  if(a.guard) return false;
  const e = a.effect || "";
  const text = `${a.name||""} ${a.desc||""} ${e}`.toLowerCase();
  return /damage|attack|status|poison|bleed|freeze|hypnosis|dread|exposed|exhaust|direct|row|all/i.test(text)
    && !/heal|ally support|choose an ally|protect|ward|armor/.test(text);
}

function poomForSideV59(side){
  return alive(other(side)).find(u=>u.id==="poom");
}

function clearPoomRedirectsV59(){
  (state?.units||[]).forEach(u=>{
    if(u.buff) {
      delete u.buff.poomRedirectTargetId;
      delete u.buff.poomRedirectTargetSide;
      delete u.buff.poomRedirectSource;
    }
  });
}

const endRoundBeforePoomV59 = endRound;
endRound = function(){
  clearPoomRedirectsV59();
  endRoundBeforePoomV59();
};

const targetsBeforePoomV59 = targets;
targets = function(c,a){
  if(a?.effect === "poomMassGuardMind"){
    return [];
  }
  return targetsBeforePoomV59(c,a);
};

const applyBeforePoomV59 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  if(a.effect === "poomMassGuardMind"){
    const enemies = alive(other(c.side));
    const consumed = enemies.filter(x=>x.status?.hypnosis);

    if(!consumed.length){
      spawnFloatingText?.(c, "No Hypnosis", "cancel");
      pushActionEvent?.("cancel", `Guard Mind found no enemies with Hypnosis`, c);
      log(`Guard Mind found no enemies with Hypnosis.`);
      return;
    }

    consumed.forEach(enemy=>{
      enemy.status.hypnosis = 0;
      enemy.buff = enemy.buff || {};
      enemy.buff.poomRedirectTargetId = c.id;
      enemy.buff.poomRedirectTargetSide = c.side;
      enemy.buff.poomRedirectSource = "Guard Mind";
      spawnFloatingText?.(enemy, "Hypnosis consumed", "status");
      pushActionEvent?.("statusLoss", `${enemy.name}'s Hypnosis was consumed by Guard Mind`, enemy);
    });

    addArmorThisRound?.(c, consumed.length);
    state.guarded[c.id] = true;
    spawnFloatingText?.(c, `+${consumed.length} Armor`, "armor");
    pushActionEvent?.("statusTrigger", `${c.name} consumed Hypnosis from ${consumed.length} enemies. Their offensive actions this turn redirect to Poom.`, c);
    log(`${c.name} consumes Hypnosis from ${consumed.length} enemies. Their offensive actions this turn redirect to Poom. Poom gains +${consumed.length} Armor.`);
    return;
  }

  // If an enemy was caught by Guard Mind, force offensive actions onto Poom.
  if(c?.buff?.poomRedirectTargetId && isOffensiveAbilityV59(a)){
    const poom = unitBySide(c.buff.poomRedirectTargetId, c.buff.poomRedirectTargetSide) || unit(c.buff.poomRedirectTargetId);
    if(poom && !poom.dead && poom.side !== c.side){
      spawnFloatingText?.(c, "Redirected", "status");
      pushActionEvent?.("statusTrigger", `${c.name}'s ${a.name} was redirected to Poom by Guard Mind`, c);
      log(`${c.name}'s ${a.name} is redirected to Poom by Guard Mind.`);

      // Convert broad/row offensive actions into a single action on Poom.
      if(["rowStatus","rowDamageStatus","rowMultiStatus","frontHypno","allStatus","allDamageStatus","gesharRowExhaust"].includes(a.effect)){
        if(a.dmg) damage(c,poom,a.dmg,{attack:true,aoe:false,melee:false});
        if(a.status) addStatus(poom,a.status,a.stacks||1);
        if(a.statuses) a.statuses.forEach(([s,n])=>addStatus(poom,s,n));
        if(a.effect==="frontHypno"){
          addStatus(poom,"hypnosis",1);
          addStatus(poom,"exposed",1);
        }
        return;
      }

      return applyBeforePoomV59(c,a,poom);
    }
  }

  applyBeforePoomV59(c,a,t);
};

// AI: Guard Mind is a payoff, ready only if any enemy has Hypnosis.
const isPayoffAbilityBeforePoomV59 = typeof isPayoffAbilityV45 === "function" ? isPayoffAbilityV45 : null;
if(isPayoffAbilityBeforePoomV59){
  isPayoffAbilityV45 = function(a){
    return a.effect === "poomMassGuardMind" || isPayoffAbilityBeforePoomV59(a);
  };
}

const payoffReadinessBeforePoomV59 = typeof payoffReadinessV45 === "function" ? payoffReadinessV45 : null;
if(payoffReadinessBeforePoomV59){
  payoffReadinessV45 = function(a,t){
    if(a.effect === "poomMassGuardMind"){
      // t is not relevant for this no-target payoff.
      return alive("player").some(x=>x.status?.hypnosis) || alive("enemy").some(x=>x.status?.hypnosis);
    }
    return payoffReadinessBeforePoomV59(a,t);
  };
}


/* ===== v60 Poom ability rename =====
   Guard Mind did not describe the new mass-redirect payoff well enough.
   New name: Mesmeric Taunt.
*/

function renamePoomGuardMindV60(){
  const poom = ROSTER.find(c=>c.id==="poom");
  const ability = poom?.abilities?.find(a=>a.id==="guard");
  if(!ability) return;

  ability.name = "Mesmeric Taunt";
  ability.desc = "Guard payoff. Consume Hypnosis from all enemies. For each enemy that lost Hypnosis this way, all offensive actions they use this turn are redirected to Poom. Poom gains +1 Armor until end of round for each Hypnosis consumed.";
  ability.iconKey = "hypnotic";
}
renamePoomGuardMindV60();

// Keep logs/tooltips coherent if older code still references the old text.
const applyBeforePoomRenameV60 = apply;
apply = function(c,a,t){
  if(a?.effect === "poomMassGuardMind"){
    a.name = "Mesmeric Taunt";
  }
  return applyBeforePoomRenameV60(c,a,t);
};


/* ===== v63 balance patch after analytics =====
   Goals:
   - Armor is very strong, so Dravain loses the 4-Armor outlier.
   - Sorcerers are low-health/low-armor, so their payoff damage must actually matter.
   - Bahl gets a real Poison/Bleed payoff instead of more low-impact guarding.
   - Hyafrost and Paleya get better control-to-damage conversion.
*/

function tuneBalanceV63(){
  const char = id => ROSTER.find(c=>c.id===id);
  const abil = (id, aid) => char(id)?.abilities?.find(a=>a.id===aid);

  // Dravain was the dominant outlier: 83% simulated win rate and Armor 4 was too strong.
  const dravain = char("dravain");
  if(dravain){
    dravain.armor = 3;
    dravain.passive = "Passive — Blood Guard: when Dravain consumes Bleed with Blood Claim, Dravain restores 1 HP. This is healing from consumed blood, not Shield.";
  }
  Object.assign(abil("dravain","slash") || {}, {
    cost:1, dmg:3,
    desc:"Melee attack. Deal 3 damage. If this hit deals HP damage, apply 1 Bleed."
  });
  Object.assign(abil("dravain","drain") || {}, {
    cost:2, dmg:4, heal:2,
    desc:"Melee vampire attack. Deal 4 damage. If this deals HP damage, Dravain restores 2 HP."
  });
  Object.assign(abil("dravain","protect") || {}, {
    desc:"Guard. Choose an ally. The first damage attack targeting that ally this round targets Dravain instead. Does not redirect pure status/control effects and gives no Shield.",
    damageOnly:true
  });

  // K'ku was high but not absurd. Light nerf only.
  const kku = char("kku");
  if(kku){ kku.hp = 29; }
  Object.assign(abil("kku","break") || {}, {
    bonus:3,
    desc:"Melee payoff. Deal 5 damage. If the target has Freeze, deal +3 damage. Slow but strong against frozen enemies."
  });

  // Paleya: 0 Armor made her too fragile, and she lacked reliable payoff DPS.
  const paleya = char("paleya");
  if(paleya){ paleya.armor = 1; }
  Object.assign(abil("paleya","break") || {}, {
    dmg:3,
    desc:"Ranged payoff. If the target has Hypnosis, remove Hypnosis and deal 6 damage ignoring Armor. If the target does not have Hypnosis, deal 3 damage."
  });
  Object.assign(abil("paleya","fog") || {}, {
    cost:2,
    statuses:[["hypnosis",1],["exposed",1]],
    effect:"rowMultiStatus",
    desc:"Row setup. Choose an enemy row. Apply Hypnosis and Exposed to each enemy in that row. This sets up Mind Break and other payoff attacks."
  });

  // Hyafrost: better survival and a real Freeze payoff.
  const hyafrost = char("hyafrost");
  if(hyafrost){ hyafrost.hp = 22; }
  Object.assign(abil("hyafrost","blast") || {}, {
    dmg:3,
    desc:"Ranged icecraft attack. Deal 3 damage. If this hit deals HP damage, apply 2 Freeze."
  });
  Object.assign(abil("hyafrost","zero") || {}, {
    name:"Absolute Zero",
    cost:2,
    spd:-3,
    effect:"absoluteZeroConsume",
    desc:"Freeze payoff. For each enemy with Freeze, remove all Freeze from that enemy, deal 3 + removed Freeze damage, and apply Exhausted."
  });

  // Bahl had lots of setup but no payoff. Replace defensive ward with a real sorcerer/demon cashout.
  const bahl = char("shaman");
  const ward = abil("shaman","ward");
  if(ward){
    Object.assign(ward,{
      id:"rupture",
      name:"Demon Rupture",
      cost:2,
      spd:-1,
      guard:false,
      range:"ranged",
      effect:"demonRupture",
      iconKey:"demon",
      desc:"Demon payoff. Choose an enemy. Remove all Poison and Bleed from it. Deal damage equal to removed counters +3, ignoring Armor. Shield can still absorb it."
    });
  }

  // Maoja was also low. Slightly improve witchcraft pressure without making brute tankier.
  Object.assign(abil("maoja","grip") || {}, {
    dmg:4,
    desc:"Melee attack. Deal 4 damage and apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted."
  });
  Object.assign(abil("maoja","burst") || {}, {
    desc:"Poison payoff. Remove all Poison from one enemy. Deal damage equal to removed Poison ×2 +2, ignoring Armor. Shield can still absorb it.",
    bonus:2
  });
}
tuneBalanceV63();

const applyBeforeBalanceV63 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "absoluteZeroConsume": {
      alive(other(c.side)).filter(x=>(x.status?.freeze||0)>0).forEach(x=>{
        const stacks = x.status.freeze || 0;
        x.status.freeze = 0;
        damage(c,x,3+stacks,{attack:true,melee:false,ignoreArmor:false});
        if(!x.dead) addStatus(x,"exhausted",1);
        pushActionEvent?.("statusTrigger", `${c.name} consumed ${stacks} Freeze on ${x.name}`, x);
      });
      return;
    }

    case "demonRupture": {
      const poison = t?.status?.poison || 0;
      const bleed = t?.status?.bleed || 0;
      const total = poison + bleed;
      if(t){
        t.status.poison = 0;
        t.status.bleed = 0;
      }
      damage(c,t,total+3,{attack:true,melee:false,ignoreArmor:true});
      pushActionEvent?.("statusTrigger", `${c.name} consumed ${total} Poison/Bleed counters`, t);
      return;
    }

    case "poisonBurst": {
      const p = t?.status?.poison || 0;
      if(t) t.status.poison = 0;
      damage(c,t,p*2+(a.bonus||0),{attack:true,melee:false,ignoreArmor:true});
      return;
    }

    default:
      return applyBeforeBalanceV63(c,a,t);
  }
};

// Protect Ally should not redirect pure setup/control/status-only effects.
const redirectBeforeBalanceV63 = redirect;
redirect = function(target,source){
  const p=state.protects.find(p=>p.target===target && !p.used && p.guard && !p.guard.dead);
  if(!p) return target;

  // If a future version passes effect context, this hook can check it. For now Dravain's protect is still
  // primarily balanced by lower armor and lower damage/heal.
  return redirectBeforeBalanceV63(target,source);
};


/* ===== v64 five-iteration balance patch =====
   Based on five headless sim iterations.
   Notes:
   - No ability was changed to 0 cost.
   - Counter payoffs now use multiplication where buildup should matter.
*/

function tuneBalanceV64(){
  const char = id => ROSTER.find(c=>c.id===id);
  const abil = (id, aid) => char(id)?.abilities?.find(a=>a.id===aid);

  // Armor was the strongest stat. Dravain/Yaura no longer sit above the rest of the roster.
  const dravain = char("dravain");
  if(dravain){
    dravain.armor = 2;
    dravain.passive = "Passive — Blood Guard: when Dravain consumes Bleed with Blood Claim, Dravain restores 1 HP. This is healing from consumed blood, not Shield.";
  }
  Object.assign(abil("dravain","protect") || {}, {
    cost:2,
    desc:"Guard. Choose an ally. The first damage attack targeting that ally this round targets Dravain instead. Gives no Shield."
  });
  Object.assign(abil("dravain","slash") || {}, {
    dmg:2,
    desc:"Melee attack. Deal 2 damage. If this hit deals HP damage, apply 1 Bleed."
  });
  Object.assign(abil("dravain","drain") || {}, {
    dmg:4,
    heal:1,
    desc:"Melee vampire attack. Deal 4 damage. If this deals HP damage, Dravain restores 1 HP."
  });

  const yaura = char("yaura");
  if(yaura) yaura.armor = 2;
  Object.assign(abil("yaura","ward") || {}, {
    cost:2,
    desc:"Guard. Choose an ally. That ally loses 1 HP, ignoring Armor and Shield. If that ally is attacked this round, the attacker gains 2 Bleed. No Shield is gained."
  });

  // K'ku remains a strong brute, but less dominant.
  const kku = char("kku");
  if(kku) kku.hp = 29;
  Object.assign(abil("kku","break") || {}, {
    bonus:3,
    desc:"Melee payoff. Deal 5 damage. If the target has Freeze, deal +3 damage."
  });

  // Smithen was pushed high by icecraft after Dravain was nerfed. Trim payoff base.
  Object.assign(abil("smithen","shatter") || {}, {
    dmg:3,
    desc:"Ranged Freeze payoff. Deal 3 damage with Pierce 1. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze stack."
  });

  // Sorcerers need real payoff because they are low armor/low health.
  const paleya = char("paleya");
  if(paleya){
    paleya.hp = 20;
    paleya.armor = 1;
  }
  Object.assign(abil("paleya","break") || {}, {
    dmg:3,
    payoffDmg:8,
    desc:"Ranged payoff. If the target has Hypnosis, remove Hypnosis and deal 8 damage ignoring Armor. If the target does not have Hypnosis, deal 3 damage."
  });
  Object.assign(abil("paleya","fog") || {}, {
    cost:2,
    effect:"rowMultiStatus",
    statuses:[["hypnosis",1],["exposed",1]],
    desc:"Row setup. Choose an enemy row. Apply Hypnosis and Exposed to each enemy in that row. This sets up Mind Break and other payoff attacks."
  });

  const hyafrost = char("hyafrost");
  if(hyafrost) hyafrost.hp = 22;
  Object.assign(abil("hyafrost","blast") || {}, {
    dmg:3,
    desc:"Ranged icecraft attack. Deal 3 damage. If this hit deals HP damage, apply 2 Freeze."
  });
  Object.assign(abil("hyafrost","zero") || {}, {
    name:"Absolute Zero",
    cost:2,
    effect:"absoluteZeroConsume",
    desc:"Freeze payoff. For each enemy with Freeze, remove all Freeze from that enemy, deal 3 + removed Freeze damage, and apply Exhausted."
  });

  // Bahl now has true multiplicative counter payoff and stronger setup.
  Object.assign(abil("shaman","mark") || {}, {
    statuses:[["poison",2],["bleed",1]],
    desc:"Ranged setup. Apply 2 Poison and 1 Bleed to one enemy."
  });
  Object.assign(abil("shaman","plague") || {}, {
    stacks:4,
    desc:"Row setup. Choose an enemy row. Apply 4 Poison to each enemy in that row. Deals no immediate damage."
  });
  const oldWard = abil("shaman","ward") || abil("shaman","rupture");
  if(oldWard){
    Object.assign(oldWard,{
      id:"rupture",
      name:"Demon Rupture",
      cost:2,
      spd:-1,
      guard:false,
      range:"ranged",
      effect:"demonRupture",
      mult:2,
      ignoreArmor:true,
      iconKey:"demon",
      desc:"Demon payoff. Choose an enemy. Remove all Poison and Bleed from it. Deal damage equal to twice the removed counters, ignoring Armor. Shield can still absorb it."
    });
  }

  // Witchcraft payoff should reward buildup, not flat addition.
  Object.assign(abil("maoja","grip") || {}, {
    dmg:4,
    desc:"Melee attack. Deal 4 damage and apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted."
  });
  Object.assign(abil("maoja","burst") || {}, {
    mult:3,
    bonus:0,
    desc:"Poison payoff. Remove all Poison from one enemy. Deal damage equal to removed Poison ×3, ignoring Armor. Shield can still absorb it."
  });

  // Eva gets a multiplicative Bleed payoff so she is not just worse Dravain.
  Object.assign(abil("eva","fangs") || {}, {
    dmg:4,
    desc:"Melee attack. Deal 4 damage. If this hit deals HP damage, apply 1 Bleed."
  });
  Object.assign(abil("eva","bite") || {}, {
    mult:2,
    bonus:1,
    heal:2,
    desc:"Bleed payoff. Remove all Bleed from one enemy. Deal damage equal to removed Bleed ×2 +1. If any Bleed was removed, Lady Eva restores 2 HP."
  });
}
tuneBalanceV64();

const applyBeforeBalanceV64 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "consumeBleed": {
      const b = t?.status?.bleed || 0;
      if(t) t.status.bleed = 0;
      damage(c,t,b*(a.mult||1)+(a.bonus||0),{attack:true,melee:a.range==="melee",pierce:a.pierce||0,ignoreArmor:!!a.ignoreArmor});
      if(b>0 && a.heal) heal(c,a.heal);
      return;
    }

    case "poisonBurst": {
      const p = t?.status?.poison || 0;
      if(t) t.status.poison = 0;
      damage(c,t,p*(a.mult||2)+(a.bonus||0),{attack:true,melee:false,ignoreArmor:true});
      return;
    }

    case "demonRupture": {
      const poison = t?.status?.poison || 0;
      const bleed = t?.status?.bleed || 0;
      const total = poison + bleed;
      if(t){
        t.status.poison = 0;
        t.status.bleed = 0;
      }
      damage(c,t,total*(a.mult||2),{attack:true,melee:false,ignoreArmor:true});
      pushActionEvent?.("statusTrigger", `${c.name} consumed ${total} Poison/Bleed counters`, t);
      return;
    }

    case "absoluteZeroConsume": {
      alive(other(c.side)).filter(x=>(x.status?.freeze||0)>0).forEach(x=>{
        const stacks = x.status.freeze || 0;
        x.status.freeze = 0;
        damage(c,x,3+stacks,{attack:true,melee:false});
        if(!x.dead) addStatus(x,"exhausted",1);
        pushActionEvent?.("statusTrigger", `${c.name} consumed ${stacks} Freeze on ${x.name}`, x);
      });
      return;
    }

    default:
      return applyBeforeBalanceV64(c,a,t);
  }
};


/* ===== v65 class identity + sorcerer DPS pass =====
   Class identity:
   - Warrior: most resilient/protective; lower damage output.
   - Brute: most HP, low armor, strongest front-line single-target attacks.
   - Assassin: strong single-target damage, can reach backline, armor bypass tools.
   - Sorcerer: least resilient, but high DPS through AoE, Armor-ignore, and control.
*/

function tuneClassIdentityV65(){
  const C = id => ROSTER.find(c=>c.id===id);
  const A = (id, aid) => C(id)?.abilities?.find(a=>a.id===aid);

  // Warriors: resilient/protective, lower damage.
  const dravain = C("dravain");
  if(dravain){ dravain.armor = 2; dravain.hp = 23; }
  Object.assign(A("dravain","slash") || {}, {
    dmg:2,
    desc:"Melee warrior attack. Deal 2 damage. If this hit deals HP damage, apply 1 Bleed."
  });
  Object.assign(A("dravain","drain") || {}, {
    dmg:3, heal:1,
    desc:"Melee vampire attack. Deal 3 damage. If this deals HP damage, Dravain restores 1 HP."
  });
  Object.assign(A("dravain","claim") || {}, {
    bonus:2,
    desc:"Bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +2 damage. If any Bleed was removed, Dravain restores 1 HP."
  });

  const yaura = C("yaura");
  if(yaura){ yaura.armor = 2; yaura.hp = 24; }
  Object.assign(A("yaura","bolt") || {}, {
    dmg:1,
    desc:"Ranged bloodcraft setup. Deal 1 damage ignoring Armor. Shield can still absorb it. If this hit deals HP damage, apply 2 Bleed."
  });
  Object.assign(A("yaura","price") || {}, {
    dmg:3,
    desc:"Bloodcraft attack. Yaura or an ally loses 2 HP, ignoring Armor and Shield. Deal 3 damage to enemies in the front row."
  });

  // Brutes: high HP, low armor, strongest single-target attacks, but attacks are front-line constrained.
  const kku = C("kku");
  if(kku){ kku.hp = 30; kku.armor = 1; }
  Object.assign(A("kku","slam") || {}, {
    dmg:5, range:"melee",
    desc:"Front-line brute attack. Deal 5 damage. If this hit deals HP damage, apply 1 Freeze."
  });
  Object.assign(A("kku","break") || {}, {
    dmg:6, bonus:3, range:"melee",
    desc:"Front-line brute payoff. Deal 6 damage. If the target has Freeze, deal +3 damage."
  });

  const maoja = C("maoja");
  if(maoja){ maoja.hp = 29; maoja.armor = 1; }
  Object.assign(A("maoja","grip") || {}, {
    dmg:5, range:"melee",
    desc:"Front-line brute attack. Deal 5 damage and apply 2 Poison. If the target already had Poison before this ability, also apply Exhausted."
  });
  Object.assign(A("maoja","burst") || {}, {
    range:"melee", mult:3,
    desc:"Front-line witchcraft payoff. Remove all Poison from one enemy. Deal removed Poison ×3 damage, ignoring Armor. Shield can still absorb it."
  });

  const poom = C("poom");
  if(poom){ poom.hp = 30; poom.armor = 1; }
  Object.assign(A("poom","bash") || {}, {
    dmg:5, range:"melee",
    desc:"Front-line brute attack. Deal 5 damage."
  });
  Object.assign(A("poom","roar") || {}, {
    range:"melee", dmg:3, bonus:6,
    desc:"Front-line hypnotic payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis and deal +6 damage."
  });
  Object.assign(A("poom","revenge") || {}, {
    range:"melee", dmg:8, self:3, bonus:3,
    desc:"Front-line brute attack. Poom loses 3 HP, then deals 8 damage. If Poom was attacked this round, deal +3 damage."
  });

  // Assassins: keep backline reach and armor bypass.
  Object.assign(A("kahro","assassinate") || {}, {
    dmg:5, bonus:3, pierce:2, range:"ranged",
    desc:"Assassin precision. Deal 5 damage with Pierce 2. Can target backline. If the target is in the back row and the front row is empty, deal +3 damage."
  });
  Object.assign(A("eva","dash") || {}, {
    dmg:3, pierce:1, range:"ranged",
    desc:"Assassin backline tool. Deal 3 damage with Pierce 1. Can target backline. If the target has Bleed, apply Exposed."
  });
  Object.assign(A("eva","bite") || {}, {
    range:"ranged", mult:2, bonus:1, heal:2,
    desc:"Assassin/vampire payoff. Can target backline. Remove all Bleed from one enemy. Deal Bleed ×2 +1 damage. If any Bleed was removed, Lady Eva restores 2 HP."
  });
  Object.assign(A("smithen","shatter") || {}, {
    dmg:3, pierce:2, range:"ranged",
    desc:"Assassin icecraft payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze."
  });

  // Sorcerers: fragile, high DPS through AoE, control, and Armor-ignore.
  const paleya = C("paleya");
  if(paleya){ paleya.hp = 18; paleya.armor = 1; }
  Object.assign(A("paleya","break") || {}, {
    dmg:3, payoffDmg:9, ignoreArmor:true,
    desc:"Ranged hypnotic payoff. If the target has Hypnosis, remove Hypnosis and deal 9 damage ignoring Armor. If the target does not have Hypnosis, deal 3 damage ignoring Armor."
  });
  Object.assign(A("paleya","fog") || {}, {
    cost:2, effect:"rowMultiStatus", statuses:[["hypnosis",1],["exposed",1]],
    desc:"AoE control setup. Choose an enemy row. Apply Hypnosis and Exposed to each enemy in that row."
  });
  Object.assign(A("paleya","predict") || {}, {
    desc:"Guard payoff. Choose an enemy with Hypnosis. Remove Hypnosis now. If that enemy uses any non-Guard action this round, cancel it.",
    anyAction:true
  });

  const bahl = C("shaman");
  if(bahl){ bahl.hp = 20; bahl.armor = 1; }
  Object.assign(A("shaman","mark") || {}, {
    statuses:[["poison",2],["bleed",1]],
    desc:"Ranged demon setup. Apply 2 Poison and 1 Bleed to one enemy."
  });
  Object.assign(A("shaman","plague") || {}, {
    stacks:4,
    desc:"AoE demon setup. Choose an enemy row. Apply 4 Poison to each enemy in that row."
  });
  Object.assign(A("shaman","rupture") || {}, {
    mult:2,
    desc:"Demon payoff. Choose an enemy. Remove all Poison and Bleed from it. Deal removed counters ×2 damage, ignoring Armor. Shield can still absorb it."
  });

  const hyafrost = C("hyafrost");
  if(hyafrost){ hyafrost.hp = 20; hyafrost.armor = 1; }
  Object.assign(A("hyafrost","blast") || {}, {
    dmg:3,
    desc:"Ranged icecraft setup. Deal 3 damage. If this hit deals HP damage, apply 2 Freeze."
  });
  Object.assign(A("hyafrost","field") || {}, {
    stacks:2,
    desc:"AoE icecraft control. Choose an enemy row. Apply 2 Freeze to each enemy in that row."
  });
  Object.assign(A("hyafrost","zero") || {}, {
    effect:"absoluteZeroConsume",
    desc:"AoE Freeze payoff. For each enemy with Freeze, remove all Freeze, deal removed Freeze ×2 damage ignoring Armor, and apply Exhausted."
  });

  const bakub = C("bakub");
  if(bakub){ bakub.hp = 20; bakub.armor = 1; }
  Object.assign(A("bakub","toxin") || {}, {
    dmg:3, payoffDmg:6, poison:2, ignoreArmor:true,
    desc:"Ranged hypnotic/witchcraft payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis, deal 6 damage ignoring Armor instead, and apply 2 Poison."
  });
  Object.assign(A("bakub","fog") || {}, {
    statuses:[["poison",2],["hypnosis",1]],
    desc:"AoE demon setup. Choose an enemy row. Apply 2 Poison and Hypnosis to each enemy in that row."
  });
}
tuneClassIdentityV65();

const applyBeforeClassV65 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "absoluteZeroConsume": {
      alive(other(c.side)).filter(x=>(x.status?.freeze||0)>0).forEach(x=>{
        const stacks = x.status.freeze || 0;
        x.status.freeze = 0;
        damage(c,x,stacks*2,{attack:true,melee:false,ignoreArmor:true});
        if(!x.dead) addStatus(x,"exhausted",1);
        pushActionEvent?.("statusTrigger", `${c.name} consumed ${stacks} Freeze on ${x.name}`, x);
      });
      return;
    }

    case "demonRupture": {
      const poison = t?.status?.poison || 0;
      const bleed = t?.status?.bleed || 0;
      const total = poison + bleed;
      if(t){ t.status.poison = 0; t.status.bleed = 0; }
      damage(c,t,total*(a.mult||2),{attack:true,melee:false,ignoreArmor:true});
      pushActionEvent?.("statusTrigger", `${c.name} consumed ${total} Poison/Bleed counters`, t);
      return;
    }

    case "mindToxinConsume": {
      const had = !!t?.status?.hypnosis;
      if(had){
        t.status.hypnosis = 0;
        damage(c,t,a.payoffDmg||6,{attack:true,melee:false,ignoreArmor:!!a.ignoreArmor});
        if(!t.dead) addStatus(t,"poison",a.poison||2);
      } else {
        damage(c,t,a.dmg||3,{attack:true,melee:false});
      }
      return;
    }

    case "poisonBurst": {
      const p = t?.status?.poison || 0;
      if(t) t.status.poison = 0;
      damage(c,t,p*(a.mult||3),{attack:true,melee:false,ignoreArmor:true});
      return;
    }

    default:
      return applyBeforeClassV65(c,a,t);
  }
};


/* ===== v66 six-iteration class balance patch =====
   Six more sim/adjust cycles after the class identity pass.
   Constraints kept:
   - No 0-cost abilities.
   - Counter payoffs use multiplication to reward buildup.
   - Warriors: resilient/protective, lower damage.
   - Brutes: high HP, low Armor, front-line attacks.
   - Assassins: backline/Pierce/single-target tools.
   - Sorcerers: fragile, high DPS through AoE, control, Armor-ignore.
*/
function tuneClassBalanceV66(){
  const C = id => ROSTER.find(c=>c.id===id);
  const A = (id, aid) => C(id)?.abilities?.find(a=>a.id===aid);

  const dravain=C("dravain");
  if(dravain){ dravain.hp=24; dravain.armor=3; }
  Object.assign(A("dravain","protect")||{}, {cost:2, desc:"Guard. Choose an ally. The first damage attack targeting that ally this round targets Dravain instead. No Shield."});
  Object.assign(A("dravain","slash")||{}, {dmg:2, desc:"Melee warrior attack. Deal 2 damage. If this hit deals HP damage, apply 1 Bleed."});
  Object.assign(A("dravain","drain")||{}, {dmg:3, heal:2, desc:"Melee vampire attack. Deal 3 damage. If this deals HP damage, Dravain restores 2 HP."});
  Object.assign(A("dravain","claim")||{}, {bonus:2, desc:"Bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +2 damage. If any Bleed was removed, Dravain restores 1 HP."});

  const yaura=C("yaura");
  if(yaura){ yaura.hp=24; yaura.armor=3; }
  Object.assign(A("yaura","ward")||{}, {cost:2, desc:"Guard. Choose an ally. That ally loses 1 HP. If that ally is attacked this round, the attacker gains 2 Bleed. No Shield."});
  Object.assign(A("yaura","bolt")||{}, {dmg:2, desc:"Ranged bloodcraft setup. Deal 2 damage ignoring Armor. If this hit deals HP damage, apply 2 Bleed."});
  Object.assign(A("yaura","price")||{}, {dmg:4, desc:"Bloodcraft attack. Yaura or an ally loses 2 HP. Deal 4 damage to enemies in the front row."});
  Object.assign(A("yaura","rain")||{}, {stacks:2, desc:"Bloodcraft AoE setup. Yaura loses 2 HP. Apply 2 Bleed to every enemy."});

  const kku=C("kku");
  if(kku){ kku.hp=29; kku.armor=1; }
  Object.assign(A("kku","slam")||{}, {dmg:3, range:"melee", desc:"Front-line brute attack. Deal 3 damage. If this hit deals HP damage, apply 1 Freeze."});
  Object.assign(A("kku","break")||{}, {dmg:5, bonus:2, range:"melee", desc:"Front-line brute payoff. Deal 5 damage. If the target has Freeze, deal +2 damage."});

  const maoja=C("maoja");
  if(maoja){ maoja.hp=29; maoja.armor=1; }
  Object.assign(A("maoja","grip")||{}, {dmg:5, range:"melee", desc:"Front-line brute attack. Deal 5 damage and apply 2 Poison. If the target already had Poison, also apply Exhausted."});
  Object.assign(A("maoja","burst")||{}, {range:"melee", mult:3, desc:"Front-line witchcraft payoff. Remove all Poison. Deal removed Poison ×3 damage, ignoring Armor."});

  const poom=C("poom");
  if(poom){ poom.hp=30; poom.armor=1; }
  Object.assign(A("poom","bash")||{}, {dmg:4, range:"melee", desc:"Front-line brute attack. Deal 4 damage."});
  Object.assign(A("poom","roar")||{}, {range:"melee", dmg:3, bonus:6, desc:"Front-line hypnotic payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis and deal +6 damage."});
  Object.assign(A("poom","revenge")||{}, {range:"melee", dmg:7, self:3, bonus:3, desc:"Front-line brute attack. Poom loses 3 HP, then deals 7 damage. If Poom was attacked this round, deal +3 damage."});

  Object.assign(A("kahro","assassinate")||{}, {dmg:5, bonus:3, pierce:2, range:"ranged", desc:"Assassin precision. Deal 5 damage with Pierce 2. Can target backline. If the target is in the back row and the front row is empty, deal +3 damage."});
  Object.assign(A("eva","fangs")||{}, {dmg:3, desc:"Melee attack. Deal 3 damage. If this hit deals HP damage, apply 1 Bleed."});
  Object.assign(A("eva","dash")||{}, {dmg:3, pierce:1, range:"ranged", desc:"Assassin backline tool. Deal 3 damage with Pierce 1. If the target has Bleed, apply Exposed."});
  Object.assign(A("eva","bite")||{}, {range:"ranged", mult:2, bonus:1, heal:2, desc:"Assassin/vampire payoff. Can target backline. Remove all Bleed. Deal Bleed ×2 +1 damage. If any Bleed was removed, Lady Eva restores 2 HP."});
  Object.assign(A("smithen","whiteout")||{}, {exposedIfFrozen:false, desc:"Ranged setup. Apply 1 Freeze."});
  Object.assign(A("smithen","shatter")||{}, {dmg:3, pierce:2, range:"ranged", desc:"Assassin icecraft payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze."});

  const paleya=C("paleya");
  if(paleya){ paleya.hp=20; paleya.armor=1; }
  Object.assign(A("paleya","stare")||{}, {effect:"multiStatus", statuses:[["hypnosis",1],["exposed",1]], desc:"Ranged setup. Apply Hypnosis and Exposed to one enemy."});
  Object.assign(A("paleya","break")||{}, {dmg:4, payoffDmg:10, ignoreArmor:true, desc:"Ranged hypnotic payoff. If the target has Hypnosis, remove Hypnosis and deal 10 damage ignoring Armor. Otherwise, deal 4 damage ignoring Armor."});
  Object.assign(A("paleya","fog")||{}, {cost:2, effect:"rowMultiStatus", statuses:[["hypnosis",1],["exposed",1]], desc:"AoE control setup. Choose an enemy row. Apply Hypnosis and Exposed to each enemy in that row."});

  const bahl=C("shaman");
  if(bahl){ bahl.hp=21; bahl.armor=1; }
  Object.assign(A("shaman","mark")||{}, {statuses:[["poison",2],["bleed",1]], desc:"Ranged demon setup. Apply 2 Poison and 1 Bleed to one enemy."});
  Object.assign(A("shaman","pact")||{}, {self:1, desc:"Bloodcraft setup. An ally loses 1 HP. Apply 2 Bleed to enemies in the front row."});
  Object.assign(A("shaman","plague")||{}, {stacks:5, desc:"AoE demon setup. Choose an enemy row. Apply 5 Poison to each enemy in that row."});
  Object.assign(A("shaman","rupture")||{}, {mult:2, bonus:3, desc:"Demon payoff. Remove all Poison and Bleed from one enemy. Deal removed counters ×2 +3 damage, ignoring Armor."});

  const hyafrost=C("hyafrost");
  if(hyafrost){ hyafrost.hp=20; hyafrost.armor=1; }
  Object.assign(A("hyafrost","zero")||{}, {effect:"absoluteZeroConsume", mult:2, ignoreArmor:true, desc:"AoE Freeze payoff. For each enemy with Freeze, remove all Freeze, deal removed Freeze ×2 damage ignoring Armor, and apply Exhausted."});

  const bakub=C("bakub");
  if(bakub){ bakub.hp=20; bakub.armor=1; }
  Object.assign(A("bakub","toxin")||{}, {dmg:3, payoffDmg:6, poison:2, ignoreArmor:true, desc:"Ranged hypnotic/witchcraft payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis, deal 6 damage ignoring Armor instead, and apply 2 Poison."});
  Object.assign(A("bakub","fog")||{}, {statuses:[["poison",2],["hypnosis",1]], desc:"AoE demon setup. Choose an enemy row. Apply 2 Poison and Hypnosis to each enemy in that row."});
}
tuneClassBalanceV66();

const applyBeforeV66 = apply;
apply = function(c,a,t){
  if(!c || !a) return;
  switch(a.effect){
    case "absoluteZeroConsume": {
      alive(other(c.side)).filter(x=>(x.status?.freeze||0)>0).forEach(x=>{
        const stacks=x.status.freeze||0;
        x.status.freeze=0;
        damage(c,x,stacks*(a.mult||2),{attack:true,melee:false,ignoreArmor:!!a.ignoreArmor});
        if(!x.dead) addStatus(x,"exhausted",1);
      });
      return;
    }
    case "demonRupture": {
      const total=(t?.status?.poison||0)+(t?.status?.bleed||0);
      if(t){t.status.poison=0;t.status.bleed=0;}
      damage(c,t,total*(a.mult||2)+(a.bonus||0),{attack:true,melee:false,ignoreArmor:true});
      return;
    }
    case "mindToxinConsume": {
      const had=!!t?.status?.hypnosis;
      if(had){
        t.status.hypnosis=0;
        damage(c,t,a.payoffDmg||6,{attack:true,melee:false,ignoreArmor:!!a.ignoreArmor});
        if(!t.dead) addStatus(t,"poison",a.poison||2);
      } else {
        damage(c,t,a.dmg||3,{attack:true,melee:false});
      }
      return;
    }
    case "poisonBurst": {
      const p=t?.status?.poison||0;
      if(t) t.status.poison=0;
      damage(c,t,p*(a.mult||3),{attack:true,melee:false,ignoreArmor:true});
      return;
    }
    default:
      return applyBeforeV66(c,a,t);
  }
};


/* ===== v71 skill-curve balance pass =====
   Goal: skill-intensive characters should be weak/medium under bad play and rewarding under good play,
   not already strong when played badly. Target example: old-AI 40-45%, smart-AI 55-58%.
*/
function tuneSkillCurveV71(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);

  // Paleya: lower easy floor, preserve skill payoff.
  const paleya=C("paleya");
  if(paleya){ paleya.hp=20; paleya.armor=1; }
  Object.assign(A("paleya","break")||{}, {
    dmg:2,
    payoffDmg:8,
    ignoreArmor:true,
    desc:"Ranged hypnotic payoff. If the target has Hypnosis, remove Hypnosis and deal 8 damage ignoring Armor. Otherwise, deal 2 damage ignoring Armor."
  });
  Object.assign(A("paleya","fog")||{}, {
    effect:"rowStatus",
    status:"hypnosis",
    stacks:1,
    statuses:undefined,
    desc:"AoE control setup. Choose an enemy row. Apply Hypnosis to each enemy in that row."
  });

  // Reduce too-easy AoE/status pressure.
  Object.assign(A("yaura","rain")||{}, {stacks:1});
  Object.assign(A("yaura","bolt")||{}, {dmg:1});
  Object.assign(A("shaman","plague")||{}, {stacks:4});
  Object.assign(A("shaman","rupture")||{}, {bonus:1});
  Object.assign(A("bakub","vial")||{}, {statuses:[["poison",1],["hypnosis",1]]});

  // Reliability buffs for underperformers.
  const dravain=C("dravain");
  if(dravain){ dravain.hp=24; dravain.armor=3; }
  Object.assign(A("dravain","protect")||{}, {cost:1});
  Object.assign(A("poom","bash")||{}, {dmg:5});
  Object.assign(A("poom","revenge")||{}, {dmg:8});
  const hy=C("hyafrost");
  if(hy){ hy.hp=21; }
  Object.assign(A("hyafrost","blast")||{}, {dmg:4});
  Object.assign(A("eva","fangs")||{}, {dmg:4});
}
tuneSkillCurveV71();


/* ===== v72 2x2 skill-matrix balance pass =====
   Uses pilot/opponent matrix:
   old-vs-old = noob baseline,
   smart-vs-smart = optimized strength,
   smart-vs-old = skilled pilot farming bad opponents,
   old-vs-smart = punishability/counterability by good opponents.
*/
function tuneSkillMatrixV72(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  Object.assign(A("paleya","break")||{}, {dmg:2,payoffDmg:8,ignoreArmor:true,desc:"Ranged hypnotic payoff. If the target has Hypnosis, remove Hypnosis and deal 8 damage ignoring Armor. Otherwise, deal 2 damage ignoring Armor."});
  Object.assign(A("paleya","fog")||{}, {effect:"rowStatus",status:"hypnosis",stacks:1,statuses:undefined,desc:"AoE control setup. Choose an enemy row. Apply Hypnosis to each enemy in that row."});
  Object.assign(A("yaura","rain")||{}, {stacks:1});
  Object.assign(A("yaura","bolt")||{}, {dmg:1});
  Object.assign(A("shaman","plague")||{}, {stacks:4});
  Object.assign(A("shaman","rupture")||{}, {bonus:1});
  Object.assign(A("bakub","vial")||{}, {statuses:[["poison",1],["hypnosis",1]]});
  const dravain=C("dravain"); if(dravain){dravain.hp=24;dravain.armor=3;} Object.assign(A("dravain","protect")||{}, {cost:1});
  Object.assign(A("poom","bash")||{}, {dmg:5}); Object.assign(A("poom","revenge")||{}, {dmg:8});
  const hy=C("hyafrost"); if(hy){hy.hp=21;} Object.assign(A("hyafrost","blast")||{}, {dmg:4});
  Object.assign(A("eva","fangs")||{}, {dmg:4});
}
tuneSkillMatrixV72();


/* ===== v73 surgical balance pass =====
   Based on v72 data:
   - Yaura: remove easy Armor-ignore; Blood Bolt becomes a next-attack enhancer.
   - Poom: reduce raw damage, improve Mesmeric Taunt usability.
   - Hyafrost: nerf Absolute Zero spike.
   - Dravain: buff protection loop and Blood Slash.
   - Bahl: improve Blood Pact safety, not Rupture.
   - K'ku: buff setup/guard, not Glacier Break.
*/
function tuneSurgicalV73(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);

  Object.assign(A("yaura","bolt")||{}, {
    name:"Blood Infusion",
    effect:"bloodInfusion",
    range:"ally",
    dmg:0,
    ignoreArmor:false,
    desc:"Setup. Choose an ally. That ally's next attack this round deals +2 damage. If that attack deals HP damage, apply 2 Bleed."
  });

  Object.assign(A("poom","guard")||{}, {
    minArmor:1,
    desc:"Guard payoff. Consume Hypnosis from all enemies. For each enemy that lost Hypnosis this way, offensive actions they use this turn are redirected to Poom. Poom gains +1 Armor, plus +1 Armor for each Hypnosis consumed."
  });
  Object.assign(A("poom","bash")||{}, {dmg:4});
  Object.assign(A("poom","revenge")||{}, {dmg:7});

  Object.assign(A("hyafrost","zero")||{}, {
    mult:1.5,
    ignoreArmor:false,
    desc:"AoE Freeze payoff. For each enemy with Freeze, remove all Freeze, deal removed Freeze ×1.5 damage, and apply Exhausted."
  });

  Object.assign(A("dravain","protect")||{}, {
    armor:1,
    cleanse:1,
    desc:"Guard. Choose an ally. Remove 1 negative status from that ally. The first damage attack targeting that ally this round targets Dravain instead. The protected ally gains +1 Armor until end of round."
  });
  Object.assign(A("dravain","slash")||{}, {dmg:3});

  Object.assign(A("shaman","pact")||{}, {
    armorSelf:1,
    desc:"Bloodcraft setup. An ally loses 1 HP. Apply 2 Bleed to enemies in the front row. Bahl gains +1 Armor until end of round."
  });

  Object.assign(A("kku","guard")||{}, {
    armor:1,
    desc:"Guard. If K'ku is hit this round, the attacker gains 2 Freeze and K'ku gains +1 Armor until end of round."
  });
  Object.assign(A("kku","roar")||{}, {
    exhausted:1,
    desc:"Front-row setup. Apply 2 Freeze and Exhausted to enemies in the front row."
  });
}
tuneSurgicalV73();

const applyBeforeV73 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  if(a.effect==="bloodInfusion"){
    if(!t) return;
    t.buff = t.buff || {};
    t.buff.bloodInfusion = {bonus:2, bleed:2};
    spawnFloatingText?.(t, "Blood Infusion", "status");
    log(`${c.name} empowers ${t.name}'s next attack.`);
    return;
  }

  if(a.cleanse && t){
    for(const s of ["poison","bleed","freeze","hypnosis","dread","exposed","exhausted"]){
      if(t.status?.[s]){
        t.status[s]=Math.max(0,(t.status[s]||0)-a.cleanse);
        break;
      }
    }
  }

  return applyBeforeV73(c,a,t);
};



/* ===== v75 fast auto-balance support mechanics =====
   Adds support for surgical balance mechanics used by the simulator:
   - Yaura Blood Infusion: next attack enhancer, not Armor-ignore.
   - Protect cleanse.
   - Poom Mesmeric Taunt baseline Armor.
   - K'ku/Bahl guard/setup safety fields.
*/
function tuneAutoBalanceSupportV75(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);

  Object.assign(A("yaura","bolt")||{}, {
    name:"Blood Infusion",
    effect:"bloodInfusion",
    range:"ally",
    dmg:0,
    ignoreArmor:false,
    bonus:3,
    bleed:2,
    desc:"Setup. Choose an ally. That ally's next attack this round deals +3 damage. If that attack deals HP damage, apply 2 Bleed."
  });

  Object.assign(A("dravain","protect")||{}, {
    cleanse:1,
    desc:"Guard. Choose an ally. Remove 1 negative status from that ally. The first damage attack targeting that ally this round targets Dravain instead."
  });

  Object.assign(A("poom","guard")||{}, {minArmor:2});
  Object.assign(A("kku","guard")||{}, {armor:1});
  Object.assign(A("kku","roar")||{}, {exhausted:1});
  Object.assign(A("shaman","pact")||{}, {armorSelf:1});
}
tuneAutoBalanceSupportV75();

const applyBeforeV75 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  if(a.effect==="bloodInfusion"){
    if(!t) return;
    t.buff = t.buff || {};
    t.buff.bloodInfusion = {bonus:a.bonus||3, bleed:a.bleed||2};
    spawnFloatingText?.(t, "Blood Infusion", "status");
    log(`${c.name} empowers ${t.name}'s next attack.`);
    return;
  }

  if(a.cleanse && t){
    for(const s of ["poison","bleed","freeze","hypnosis","dread","exposed","exhausted"]){
      if(t.status?.[s]){
        t.status[s]=Math.max(0,(t.status[s]||0)-a.cleanse);
        break;
      }
    }
  }

  return applyBeforeV75(c,a,t);
};

const damageBeforeV75 = damage;
damage = function(src,t,amt,opt={}){
  if(opt?.attack && src?.buff?.bloodInfusion){
    amt += src.buff.bloodInfusion.bonus || 0;
    const bleed = src.buff.bloodInfusion.bleed || 0;
    const dealt = damageBeforeV75(src,t,amt,opt);
    if(dealt>0 && !t.dead) addStatus(t,"bleed",bleed);
    src.buff.bloodInfusion = null;
    return dealt;
  }
  return damageBeforeV75(src,t,amt,opt);
};



/* ===== v79 mobile layout + ally-targeting hotfix =====
   Fixes:
   1. applyLayoutModeV52 ReferenceError on mobile/QA layout refresh.
   2. Enemy AI could target player units with abilities whose text/range says "ally".
      The source of truth is now: if ability.range === "ally", targets are alive units on caster's side.
*/
function applyLayoutModeV52(){
  const w = window.innerWidth || document.documentElement?.clientWidth || 1024;
  const h = window.innerHeight || document.documentElement?.clientHeight || 768;
  let mode = "desktop";
  if(w <= 700) mode = "mobile";
  else if(w <= 1100 || h <= 760) mode = "tablet";
  document.body.dataset.layoutMode = mode;
  document.body.classList.toggle("mobileLayoutV52", mode === "mobile");
  document.body.classList.toggle("tabletLayoutV52", mode === "tablet");
  document.body.classList.toggle("desktopLayoutV52", mode === "desktop");
}

const targetsBeforeV79 = targets;
targets = function(c,a){
  if(!c || !a) return [];

  // Absolute rule: ally-range abilities can only target own living units.
  // Covers Blood Ward, Blood Infusion, Frost Armor, Protect Ally, Poison Hands, etc.
  if(a.range === "ally" || ["bloodWard","bloodInfusion","frostArmorRetaliate"].includes(a.effect)){
    return alive(c.side);
  }

  return targetsBeforeV79(c,a);
};

if(typeof chooseTargetV45 === "function"){
  const chooseTargetV45BeforeV79 = chooseTargetV45;
  chooseTargetV45 = function(c,a,ts){
    if(a?.range === "ally"){
      ts = (ts || []).filter(t => t && t.side === c.side && !t.dead);
    }
    return chooseTargetV45BeforeV79(c,a,ts);
  };
}

window.addEventListener?.("resize", ()=>applyLayoutModeV52());
window.addEventListener?.("orientationchange", ()=>setTimeout(applyLayoutModeV52, 50));
applyLayoutModeV52();



/* ===== v83 surgical follow-up mechanics =====
   Data-driven changes after v82:
   - Dravain Shield Bash is cost 2.
   - Yaura Blood Ward grants +1 Armor and applies 3 Bleed to melee/attackers when triggered.
   - Paleya Mirror Guard applies Exposed when the prediction cancels an attack.
*/
function tuneSurgicalV83(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);

  Object.assign(A("dravain","bash")||{}, {cost:2});

  Object.assign(A("yaura","ward")||{}, {
    cost:1,
    armor:1,
    stacks:3,
    desc:"Guard. Choose an ally. That ally loses 1 HP and gains +1 Armor this round. If that ally is attacked this round, the attacker gains 3 Bleed. No Shield."
  });

  Object.assign(A("paleya","mirror")||{}, {
    exposed:1,
    desc:"Guard prediction. Choose an enemy. If it uses a damaging attack this round, cancel that action and apply Hypnosis and Exposed to it."
  });
  Object.assign(A("paleya","mass")||{}, {spd:1});
}
tuneSurgicalV83();



/* ===== v84 final iterative balance tuning =====
{
  "dravain": {
    "abilities": {
      "bash": {
        "cost": 1
      },
      "protect": {
        "cost": 1,
        "cleanse": 1,
        "armor": 0
      }
    },
    "hp": 22
  },
  "yaura": {
    "abilities": {
      "price": {
        "self": 0,
        "dmg": 4
      },
      "ward": {
        "cost": 1,
        "self": 0,
        "armor": 4,
        "stacks": 3
      },
      "bolt": {
        "bonus": 3,
        "bleed": 4,
        "range": "ally",
        "ignoreArmor": false
      }
    },
    "hp": 23
  },
  "poom": {
    "abilities": {
      "bodyguard": {
        "dmg": 3,
        "self": 5
      },
      "roar": {
        "bonus": 4
      }
    }
  },
  "eva": {
    "abilities": {
      "stab": {
        "dmg": 2
      },
      "bite": {
        "bonus": 4,
        "heal": 1
      },
      "kiss": {
        "dmg": 2
      }
    }
  },
  "kahro": {
    "abilities": {
      "assassinate": {
        "dmg": 4,
        "bonus": 1
      },
      "needle": {
        "dmg": 2
      }
    }
  },
  "paleya": {
    "abilities": {
      "mirror": {
        "exposed": 1,
        "shield": 3
      },
      "mass": {
        "spd": 1,
        "stacks": 2
      }
    }
  }
}
*/
function tuneFinalV84(){
  const P = {"dravain": {"abilities": {"bash": {"cost": 1}, "protect": {"cost": 1, "cleanse": 1, "armor": 0}}, "hp": 22}, "yaura": {"abilities": {"price": {"self": 0, "dmg": 4}, "ward": {"cost": 1, "self": 0, "armor": 4, "stacks": 3}, "bolt": {"bonus": 3, "bleed": 4, "range": "ally", "ignoreArmor": false}}, "hp": 23}, "poom": {"abilities": {"bodyguard": {"dmg": 3, "self": 5}, "roar": {"bonus": 4}}}, "eva": {"abilities": {"stab": {"dmg": 2}, "bite": {"bonus": 4, "heal": 1}, "kiss": {"dmg": 2}}}, "kahro": {"abilities": {"assassinate": {"dmg": 4, "bonus": 1}, "needle": {"dmg": 2}}}, "paleya": {"abilities": {"mirror": {"exposed": 1, "shield": 3}, "mass": {"spd": 1, "stacks": 2}}}};
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  for(const [cid,cp] of Object.entries(P)){ const c=C(cid); if(!c) continue; for(const [k,v] of Object.entries(cp)){ if(k!=="abilities") c[k]=v; } if(cp.abilities){ for(const [aid,ap] of Object.entries(cp.abilities)){ Object.assign(A(cid,aid)||{}, ap); } } }
}
tuneFinalV84();



/* ===== v85 final balance tuning after 3 more iterations =====
{
  "dravain": {
    "abilities": {
      "bash": {
        "cost": 1
      },
      "protect": {
        "cost": 1,
        "cleanse": 1,
        "armor": 0
      }
    },
    "hp": 22
  },
  "yaura": {
    "abilities": {
      "price": {
        "self": 0,
        "dmg": 4
      },
      "ward": {
        "cost": 1,
        "self": 0,
        "armor": 4,
        "stacks": 3
      },
      "bolt": {
        "bonus": 3,
        "bleed": 4,
        "range": "ally",
        "ignoreArmor": false
      }
    },
    "hp": 24
  },
  "poom": {
    "abilities": {
      "bodyguard": {
        "dmg": 3,
        "self": 6
      },
      "roar": {
        "bonus": 4
      }
    }
  },
  "eva": {
    "abilities": {
      "stab": {
        "dmg": 2
      },
      "bite": {
        "bonus": 4,
        "heal": 1
      },
      "kiss": {
        "dmg": 2
      }
    }
  },
  "kahro": {
    "abilities": {
      "assassinate": {
        "dmg": 4,
        "bonus": 1
      },
      "needle": {
        "dmg": 2
      }
    }
  },
  "paleya": {
    "abilities": {
      "mirror": {
        "exposed": 1,
        "shield": 3
      },
      "mass": {
        "spd": 1,
        "stacks": 2
      }
    }
  },
  "bakub": {
    "abilities": {
      "vial": {
        "statuses": [
          [
            "poison",
            2
          ],
          [
            "hypnosis",
            1
          ]
        ]
      }
    },
    "hp": 21
  }
}
*/
function tuneFinalV85(){
  const P = {"dravain": {"abilities": {"bash": {"cost": 1}, "protect": {"cost": 1, "cleanse": 1, "armor": 0}}, "hp": 22}, "yaura": {"abilities": {"price": {"self": 0, "dmg": 4}, "ward": {"cost": 1, "self": 0, "armor": 4, "stacks": 3}, "bolt": {"bonus": 3, "bleed": 4, "range": "ally", "ignoreArmor": false}}, "hp": 24}, "poom": {"abilities": {"bodyguard": {"dmg": 3, "self": 6}, "roar": {"bonus": 4}}}, "eva": {"abilities": {"stab": {"dmg": 2}, "bite": {"bonus": 4, "heal": 1}, "kiss": {"dmg": 2}}}, "kahro": {"abilities": {"assassinate": {"dmg": 4, "bonus": 1}, "needle": {"dmg": 2}}}, "paleya": {"abilities": {"mirror": {"exposed": 1, "shield": 3}, "mass": {"spd": 1, "stacks": 2}}}, "bakub": {"abilities": {"vial": {"statuses": [["poison", 2], ["hypnosis", 1]]}}, "hp": 21}};
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  for(const [cid,cp] of Object.entries(P)){ const c=C(cid); if(!c) continue; for(const [k,v] of Object.entries(cp)){ if(k!=="abilities") c[k]=v; } if(cp.abilities){ for(const [aid,ap] of Object.entries(cp.abilities)){ Object.assign(A(cid,aid)||{}, ap); } } }
}
tuneFinalV85();



/* ===== v86 Yaura redesign: setup -> bleed payoff =====
   Yaura no longer relies on easy armor-ignore or repeated HP tax.
   - Blood Infusion: empowers ally's next attack; if it deals HP damage, applies Bleed.
   - Blood Price: payoff attack; if target has Bleed, consume it and deal bonus damage.
   - Blood Ward: protective bloodcraft; gives Armor and punishes attackers with Bleed.
   - Red Rain: AoE setup, small self-cost.
*/
function tuneYauraV86(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  const y=C("yaura");
  if(y) y.hp = 22;
  Object.assign(A("yaura","bolt")||{}, {
    name:"Blood Infusion",
    effect:"bloodInfusion",
    range:"ally",
    cost:1,
    dmg:0,
    ignoreArmor:false,
    bonus:3,
    bleed:3,
    desc:"Setup. Choose an ally. That ally's next attack this round deals +3 damage. If that attack deals HP damage, apply 3 Bleed."
  });
  Object.assign(A("yaura","price")||{}, {
    name:"Blood Price",
    effect:"consumeBleed",
    range:"ranged",
    cost:1,
    dmg:2,
    bonus:5,
    self:0,
    ignoreArmor:false,
    desc:"Bleed payoff. Deal 2 damage. If the target has Bleed, remove all Bleed from it and deal +5 damage."
  });
  Object.assign(A("yaura","ward")||{}, {
    name:"Blood Ward",
    effect:"bloodWard",
    range:"ally",
    cost:1,
    self:0,
    armor:2,
    stacks:3,
    desc:"Guard. Choose an ally. That ally gains +2 Armor this round. If that ally is attacked this round, the attacker gains 3 Bleed."
  });
  Object.assign(A("yaura","rain")||{}, {
    name:"Red Rain",
    effect:"allStatus",
    cost:2,
    self:1,
    status:"bleed",
    stacks:2,
    desc:"AoE bleed setup. Yaura loses 1 HP. Apply 2 Bleed to all enemies."
  });
}
tuneYauraV86();



/* ===== v86 final Yaura redesign patch =====
{
  "dravain": {
    "abilities": {
      "bash": {
        "cost": 1
      },
      "protect": {
        "cost": 1,
        "cleanse": 1,
        "armor": 0
      }
    },
    "hp": 22
  },
  "yaura": {
    "abilities": {
      "price": {
        "name": "Blood Price",
        "kind": "bleedPayoff",
        "range": "ranged",
        "cost": 1,
        "dmg": 2,
        "bonus": 5,
        "self": 0,
        "ignoreArmor": false
      },
      "ward": {
        "name": "Blood Ward",
        "kind": "bloodWard",
        "range": "ally",
        "cost": 1,
        "self": 0,
        "armor": 2,
        "stacks": 3
      },
      "bolt": {
        "name": "Blood Infusion",
        "effect": "bloodInfusion",
        "kind": "empowerNextAttack",
        "range": "ally",
        "cost": 1,
        "dmg": 0,
        "ignoreArmor": false,
        "bonus": 3,
        "bleed": 3
      },
      "rain": {
        "name": "Red Rain",
        "kind": "selfAllStatus",
        "cost": 2,
        "status": "bleed",
        "stacks": 2,
        "self": 1
      }
    },
    "hp": 22
  },
  "poom": {
    "abilities": {
      "bodyguard": {
        "dmg": 3,
        "self": 6
      },
      "roar": {
        "bonus": 4
      }
    }
  },
  "eva": {
    "abilities": {
      "stab": {
        "dmg": 2
      },
      "bite": {
        "bonus": 4,
        "heal": 1
      },
      "kiss": {
        "dmg": 2
      }
    }
  },
  "kahro": {
    "abilities": {
      "assassinate": {
        "dmg": 4,
        "bonus": 1
      },
      "needle": {
        "dmg": 2
      }
    }
  },
  "paleya": {
    "abilities": {
      "mirror": {
        "exposed": 1,
        "shield": 3
      },
      "mass": {
        "spd": 1,
        "stacks": 2
      }
    }
  },
  "bakub": {
    "abilities": {
      "vial": {
        "statuses": [
          [
            "poison",
            2
          ],
          [
            "hypnosis",
            1
          ]
        ]
      }
    },
    "hp": 21
  },
  "smithen": {
    "abilities": {
      "shatter": {
        "dmg": 3
      }
    }
  }
}
*/
function tuneFinalV86(){
  const P = {"dravain": {"abilities": {"bash": {"cost": 1}, "protect": {"cost": 1, "cleanse": 1, "armor": 0}}, "hp": 22}, "yaura": {"abilities": {"price": {"name": "Blood Price", "kind": "bleedPayoff", "range": "ranged", "cost": 1, "dmg": 2, "bonus": 5, "self": 0, "ignoreArmor": false}, "ward": {"name": "Blood Ward", "kind": "bloodWard", "range": "ally", "cost": 1, "self": 0, "armor": 2, "stacks": 3}, "bolt": {"name": "Blood Infusion", "effect": "bloodInfusion", "kind": "empowerNextAttack", "range": "ally", "cost": 1, "dmg": 0, "ignoreArmor": false, "bonus": 3, "bleed": 3}, "rain": {"name": "Red Rain", "kind": "selfAllStatus", "cost": 2, "status": "bleed", "stacks": 2, "self": 1}}, "hp": 22}, "poom": {"abilities": {"bodyguard": {"dmg": 3, "self": 6}, "roar": {"bonus": 4}}}, "eva": {"abilities": {"stab": {"dmg": 2}, "bite": {"bonus": 4, "heal": 1}, "kiss": {"dmg": 2}}}, "kahro": {"abilities": {"assassinate": {"dmg": 4, "bonus": 1}, "needle": {"dmg": 2}}}, "paleya": {"abilities": {"mirror": {"exposed": 1, "shield": 3}, "mass": {"spd": 1, "stacks": 2}}}, "bakub": {"abilities": {"vial": {"statuses": [["poison", 2], ["hypnosis", 1]]}}, "hp": 21}, "smithen": {"abilities": {"shatter": {"dmg": 3}}}};
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  for(const [cid,cp] of Object.entries(P)){ const c=C(cid); if(!c) continue; for(const [k,v] of Object.entries(cp)){ if(k!=="abilities") c[k]=v; } if(cp.abilities){ for(const [aid,ap] of Object.entries(cp.abilities)){ Object.assign(A(cid,aid)||{}, ap); } } }
}
tuneFinalV86();



/* ===== v87 requested buff tuning =====
{
  "Paleya": "Mass Suggestion cost 2 -> 1",
  "Hyafrost": "Frozen Field freeze stacks 2 -> 3",
  "Kahro": "Assassinate bonus +1",
  "Yaura": "Blood Price bonus 5 -> 6"
}
*/
function tuneRequestedBuffsV87(){
  const P = {"dravain": {"abilities": {"bash": {"cost": 1}, "protect": {"cost": 1, "cleanse": 1, "armor": 0}}, "hp": 22}, "yaura": {"abilities": {"price": {"name": "Blood Price", "kind": "bleedPayoff", "range": "ranged", "cost": 1, "dmg": 2, "bonus": 6, "self": 0, "ignoreArmor": false}, "ward": {"name": "Blood Ward", "kind": "bloodWard", "range": "ally", "cost": 1, "self": 0, "armor": 2, "stacks": 3}, "bolt": {"name": "Blood Infusion", "effect": "bloodInfusion", "kind": "empowerNextAttack", "range": "ally", "cost": 1, "dmg": 0, "ignoreArmor": false, "bonus": 3, "bleed": 3}, "rain": {"name": "Red Rain", "kind": "selfAllStatus", "cost": 2, "status": "bleed", "stacks": 2, "self": 1}}, "hp": 22}, "poom": {"abilities": {"bodyguard": {"dmg": 3, "self": 6}, "roar": {"bonus": 4}}}, "eva": {"abilities": {"stab": {"dmg": 2}, "bite": {"bonus": 4, "heal": 1}, "kiss": {"dmg": 2}}}, "kahro": {"abilities": {"assassinate": {"dmg": 4, "bonus": 2}, "needle": {"dmg": 2}}}, "paleya": {"abilities": {"mirror": {"exposed": 1, "shield": 3}, "mass": {"spd": 1, "stacks": 2, "cost": 1}}}, "bakub": {"abilities": {"vial": {"statuses": [["poison", 2], ["hypnosis", 1]]}}, "hp": 21}, "smithen": {"abilities": {"shatter": {"dmg": 3}}}, "hyafrost": {"abilities": {"field": {"stacks": 3}}}};
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  for(const [cid,cp] of Object.entries(P)){ const c=C(cid); if(!c) continue; for(const [k,v] of Object.entries(cp)){ if(k!=="abilities") c[k]=v; } if(cp.abilities){ for(const [aid,ap] of Object.entries(cp.abilities)){ Object.assign(A(cid,aid)||{}, ap); } } }
}
tuneRequestedBuffsV87();

/* ===== v88 project health alignment =====
   Keep the browser runtime and generated simulator on the same numeric rules.
   These are the values currently used by tools/generated_roster_from_game.js.
*/
function tuneRuntimeTruthV88(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  const patchChar=(id, patch)=>{ const c=C(id); if(c) Object.assign(c, patch); };
  const patchAbility=(id, aid, patch)=>{ const a=A(id,aid); if(a) Object.assign(a, patch); };

  patchChar("dravain", {hp:22, armor:3});
  patchAbility("dravain", "bash", {dmg:0, desc:"Melee attack. Deal damage equal to 2 plus Dravain's current Armor."});

  patchAbility("smithen", "flash", {range:"self"});

  patchAbility("yaura", "ward", {self:1, armor:1, stacks:2, desc:"Guard. Choose an ally. That ally loses 1 HP and gains +1 Armor this round. If that ally is attacked this round, the attacker gains 2 Bleed."});
  patchAbility("yaura", "price", {bonus:4, desc:"Bleed payoff. Deal 2 damage. If the target has Bleed, remove all Bleed from it and deal +4 damage."});
  patchAbility("yaura", "rain", {range:"melee", stacks:1, desc:"Area setup. Choose an enemy front row target. Apply 1 Bleed to every enemy in that row."});

  patchAbility("kku", "guard", {range:"self"});
  patchAbility("kku", "slam", {dmg:4, desc:"Front-line brute attack. Deal 4 damage. If this hit deals HP damage, apply 1 Freeze."});
  patchAbility("kku", "roar", {range:"melee"});

  patchAbility("maoja", "grip", {dmg:3, poison:1, desc:"Front-line brute attack. Deal 3 damage and apply 1 Poison. If the target already had Poison, also apply Exhausted."});
  patchAbility("maoja", "breath", {stacks:3, desc:"Row status. Choose an enemy row. Apply 3 Poison to each enemy in that row."});
  patchAbility("maoja", "burst", {mult:2, desc:"Front-line witchcraft payoff. Remove all Poison. Deal removed Poison x2 damage, ignoring Armor."});

  patchAbility("kahro", "vanish", {range:"self"});

  patchAbility("paleya", "lance", {dmg:2, payoffDmg:8, ignoreArmor:false, desc:"Magic attack. Deal 2 damage. If the target has Hypnosis, remove Hypnosis and deal 8 damage instead."});
  patchAbility("paleya", "mass", {status:"hypnosis"});

  patchAbility("poom", "bash", {stacks:2});

  patchChar("shaman", {hp:23});
  patchAbility("shaman", "plague", {dmg:1, stacks:2, desc:"AoE demon setup. Choose an enemy row. Apply 2 Poison to each enemy in that row."});
  patchAbility("shaman", "rupture", {bonus:2, desc:"Demon payoff. Remove all Poison and Bleed from one enemy. Deal removed counters x2 +2 damage, ignoring Armor."});

  patchAbility("eva", "stab", {status:"bleed", stacks:1});
  patchAbility("eva", "mist", {range:"self"});
  patchAbility("eva", "kiss", {stacks:2, desc:"Melee attack. Deal 2 damage ignoring Armor. Shield can still absorb this damage. Then apply 2 Bleed."});

  patchChar("hyafrost", {hp:22});
  patchAbility("hyafrost", "armor", {armor:3, desc:"Ally support. Choose an ally. That ally gains +3 Armor until end of round. Until end of round, enemies that hit that ally with melee gain 1 Freeze."});
  patchAbility("hyafrost", "zero", {range:"melee", ignoreArmor:true, mult:2, desc:"AoE Freeze payoff. For each enemy with Freeze, remove all Freeze, deal removed Freeze x2 damage ignoring Armor, and apply Exhausted."});

  patchAbility("bakub", "toxin", {payoffDmg:5, desc:"Ranged hypnotic/witchcraft payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis, deal 5 damage ignoring Armor instead, and apply 2 Poison."});
}
tuneRuntimeTruthV88();

const applyBeforeRuntimeTruthV88 = apply;
apply = function(c,a,t){
  if(!c || !a) return;

  switch(a.effect){
    case "protect":
      if(t && !t.dead){
        if(a.cleanse){
          for(const s of ["poison","bleed","freeze","hypnosis","dread","exposed","exhausted"]){
            if(t.status?.[s]){
              t.status[s] = Math.max(0, (t.status[s]||0) - a.cleanse);
              break;
            }
          }
        }
        if(a.armor) addArmorThisRound?.(t,a.armor);
        state.protects.push({guard:c,target:t,hypno:a.hypno,used:false});
        state.guarded[c.id]=true;
        state.guarded[t.id]=true;
        spawnFloatingText?.(t, "Protected", "status");
        log(`${c.name} protects ${t.name}. The first attack targeting ${t.name} redirects to ${c.name}.`);
      }
      return;

    case "armorStrike":
      damage(c,t,(a.dmg||2)+getArmor(c),{attack:true,melee:true});
      return;

    case "bloodWard":
      if(t && !t.dead){
        const selfLoss = a.self ?? 0;
        if(selfLoss > 0) lifeFromCaster(c,t,selfLoss);
        if(a.armor) addArmorThisRound?.(t,a.armor);
        state.counters.push({caster:t,status:"bleed",stacks:a.stacks ?? a.bleed ?? 2,shield:0});
        state.guarded[t.id]=true;
        spawnFloatingText?.(t, "Blood Ward", "status");
        log(`${t.name} gains Blood Ward. Attackers that hit gain ${a.stacks ?? a.bleed ?? 2} Bleed.`);
      }
      return;

    case "toxicGrip": {
      const hadPoison = !!t?.status?.poison;
      damage(c,t,a.dmg ?? 3,{attack:true,melee:true});
      if(!t?.dead){
        applyStatusFrom(c,t,"poison",a.poison ?? a.stacks ?? 2);
        if(hadPoison) addStatus(t,"exhausted",1);
      }
      return;
    }

    case "mindBreak": {
      const hadHypnosis = !!t?.status?.hypnosis;
      if(hadHypnosis) t.status.hypnosis = 0;
      damage(c,t,hadHypnosis ? (a.payoffDmg ?? 6) : (a.dmg ?? 2),{attack:true,ignoreArmor:!!a.ignoreArmor});
      if(hadHypnosis && c.id==="paleya" && !state.paleyaWeaved){
        state.paleyaWeaved = true;
        state.nextRoundBonusActions = (state.nextRoundBonusActions||0)+1;
        markPassive(c, "Mind Weaver");
        log(`Paleya's Mind Weaver triggers: +1 Action next round.`);
      }
      return;
    }

    case "bloodDash": {
      const hadBleed = !!t?.status?.bleed;
      damage(c,t,a.dmg ?? 2,{attack:true,melee:a.range==="melee",pierce:a.pierce||0,targetHadBleed:hadBleed});
      if(hadBleed && !t?.dead) addStatus(t,"exposed",1);
      return;
    }

    case "bloodPrice": {
      if(c && !c.dead && (a.self ?? 0) > 0) lifeFromCaster(c,c,a.self);
      if(t && !t.dead) damage(c,t,a.dmg ?? 6,{attack:true,melee:a.range==="melee",ignoreArmor:!!a.ignoreArmor});
      return;
    }

    default:
      return applyBeforeRuntimeTruthV88(c,a,t);
  }
};

const redirectBeforeProtectV91 = redirect;
redirect = function(target,source){
  const p=state?.protects?.find(p=>p.target===target && !p.used && p.guard && !p.guard.dead);
  if(!p) return redirectBeforeProtectV91(target,source);
  p.used = true;
  log(`${p.guard.name} protects ${target.name}.`);
  if(p.hypno && source) addStatus(source,"hypnosis",1);
  spawnFloatingText?.(p.guard, "Protect", "status");
  return p.guard;
};

const targetsBeforeProtectV91 = targets;
targets = function(c,a){
  const ts = targetsBeforeProtectV91(c,a);
  if(a?.effect==="protect") return ts.filter(t=>t && t.id!==c?.id);
  return ts;
};

function tuneRequestedRulesV91(){
  const C=id=>ROSTER.find(c=>c.id===id);
  const A=(id,aid)=>C(id)?.abilities?.find(a=>a.id===aid);
  const price=A("yaura","price");
  if(price) Object.assign(price, {
    name:"Blood Price",
    effect:"bloodPrice",
    kind:"attack",
    range:"ranged",
    cost:1,
    dmg:6,
    self:2,
    bonus:0,
    ignoreArmor:false,
    desc:"Bloodcraft attack. Yaura loses 2 HP, then attacks one enemy for 6 damage."
  });
  const protect=A("dravain","protect");
  if(protect) Object.assign(protect, {
    effect:"protect",
    kind:"protect",
    range:"ally",
    cost:1,
    guard:true,
    desc:"Guard. Choose another ally. Remove 1 negative status from that ally. The first attack targeting that ally this round targets Dravain instead."
  });
}
tuneRequestedRulesV91();

/* ===== v96 Hope: divinity warrior ===== */
function ensureHopeV96(){
  if(ROSTER.some(c=>c.id==="hope")) return;
  ROSTER.push({
    id:"hope",
    name:"Hope",
    class:"warrior",
    prof:"divinity",
    hp:22,
    armor:2,
    speed:4,
    art:ART.hope,
    passive:"Passive - Rising Grace: Hope gets +1 damage until end of round for each unique ally that gained life this round.",
    abilities:[
      A("mend","Mend Wounds",1,1,"Divinity support. Restore 5 HP to one ally.","hopeHeal",{kind:"singleHeal",heal:5,range:"ally"}),
      A("strike","Hopeful Strike",1,0,"Low damage melee attack. Deal 2 damage to one enemy in the front row.","damage",{kind:"attack",dmg:2,range:"melee"}),
      A("shield","Blessing Shield",1,99,"Guard. Choose one ally. That ally gains 4 Shield before attacks resolve.","hopeShield",{kind:"grantShield",guard:true,shield:4,range:"ally"}),
      A("judgement","Delayed Judgement",2,-2,"Delayed ranged attack. Choose one enemy. At the start of next round, deal 6 damage.","hopeDelayedAttack",{kind:"delayedAttack",dmg:6,range:"ranged",delay:1})
    ]
  });
}
ensureHopeV96();

function hopeHealedSetV96(side){
  if(!state) return null;
  state.hopeHealedAlliesV96 = state.hopeHealedAlliesV96 || {};
  state.hopeHealedAlliesV96[side] = state.hopeHealedAlliesV96[side] || [];
  return state.hopeHealedAlliesV96[side];
}

function hopeDamageBonusV96(u){
  return u?.id==="hope" ? (state?.hopeHealedAlliesV96?.[u.side]?.length || 0) : 0;
}

function noteHopeHealV96(t, amount){
  if(!t || !amount || !state?.units) return;
  const hopes = state.units.filter(u=>u.id==="hope" && u.side===t.side && !u.dead);
  if(!hopes.length) return;
  const healed = hopeHealedSetV96(t.side);
  if(!healed || healed.includes(t.id)) return;
  healed.push(t.id);
  for(const hope of hopes){
    markPassive?.(hope, "Rising Grace");
    spawnFloatingText?.(hope, `+${healed.length} damage`, "status");
  }
  pushActionEvent?.("passive", `Rising Grace: ${t.name} gained life, so Hope has +${healed.length} damage this round`, hopes[0]);
  log(`Hope's Rising Grace is now +${healed.length} damage this round.`);
}

const healBeforeHopeV96 = heal;
heal = function(t,n){
  if(!t || t.dead || !n) return 0;
  const before = t.hp;
  const result = healBeforeHopeV96(t,n);
  const healed = Math.max(0, (t.hp || 0) - before);
  noteHopeHealV96(t, healed);
  return result ?? healed;
};

const damageBeforeHopeV96 = damage;
damage = function(src,t,amt,opt={}){
  const bonus = opt?.attack ? hopeDamageBonusV96(src) : 0;
  if(bonus>0){
    markPassive?.(src, "Rising Grace");
    pushActionEvent?.("passive", `Rising Grace added +${bonus} damage`, src);
  }
  return damageBeforeHopeV96(src,t,(amt||0)+bonus,opt);
};

const targetsBeforeHopeV96 = targets;
targets = function(c,a){
  if(!c || !a) return [];
  if(a.effect==="hopeHeal" || a.effect==="hopeShield" || a.kind==="singleHeal" || a.kind==="grantShield") return alive(c.side);
  if(a.effect==="hopeDelayedAttack" || a.kind==="delayedAttack") return alive(other(c.side));
  return targetsBeforeHopeV96(c,a);
};

function scheduleHopeDelayedAttackV96(c,a,t){
  if(!c || !a || !t || c.dead || t.dead) return;
  state.delayedActionsV96 = state.delayedActionsV96 || [];
  state.delayedActionsV96.push({
    sourceId:c.id,
    sourceSide:c.side,
    targetId:t.id,
    targetSide:t.side,
    dueRound:(state.round || 1) + (a.delay || 1),
    dmg:a.dmg || 6,
    abilityName:a.name
  });
  spawnFloatingText?.(t, "Delayed", "status");
  pushActionEvent?.("delay", `${c.name}'s ${a.name} will hit ${t.name} next round`, t);
  log(`${c.name} prepares ${a.name}. It will hit ${t.name} next round.`);
}

function resolveHopeDelayedActionsV96(){
  const queue = state?.delayedActionsV96 || [];
  if(!queue.length) return;
  const ready = queue.filter(x=>x.dueRound <= state.round);
  state.delayedActionsV96 = queue.filter(x=>x.dueRound > state.round);
  for(const item of ready){
    const src = state.units.find(u=>u.id===item.sourceId && u.side===item.sourceSide && !u.dead);
    const t = state.units.find(u=>u.id===item.targetId && (!item.targetSide || u.side===item.targetSide) && !u.dead);
    if(!src || !t){
      log(`${item.abilityName || "Delayed attack"} fizzles because its source or target is gone.`);
      continue;
    }
    state.currentActionKey = `delayed:${item.sourceSide}:${item.sourceId}:${item.targetId}:${state.round}`;
    pushActionEvent?.("delay", `${src.name}'s delayed attack hits ${t.name}`, t);
    log(`${src.name}'s delayed attack hits ${t.name}.`);
    damage(src,t,item.dmg,{attack:true,melee:false});
    state.currentActionKey = null;
    if(checkWin()) break;
  }
}

const applyBeforeHopeV96 = apply;
apply = function(c,a,t){
  if(!c || !a) return;
  switch(a.effect){
    case "hopeHeal":
      if(t && !t.dead) heal(t,a.heal || 5);
      return;
    case "hopeShield":
      if(t && !t.dead){
        addShield(t,a.shield || 5);
        state.guarded = state.guarded || {};
        state.guarded[c.id]=true;
        state.guarded[t.id]=true;
      }
      return;
    case "hopeDelayedAttack":
      scheduleHopeDelayedAttackV96(c,a,t);
      return;
    default:
      return applyBeforeHopeV96(c,a,t);
  }
};

const endRoundBeforeHopeV96 = endRound;
endRound = function(){
  const result = endRoundBeforeHopeV96();
  if(state && state.phase==="planning"){
    state.hopeHealedAlliesV96 = {};
    resolveHopeDelayedActionsV96();
    renderBattle?.();
  }
  return result;
};

/* ===== v97 Zahria: bloodcraft sorceress ===== */
function ensureZahriaV97(){
  if(ROSTER.some(c=>c.id==="zahria")) return;
  ROSTER.push({
    id:"zahria",
    name:"Zahria",
    class:"sorcerer",
    prof:"bloodcraft",
    hp:20,
    armor:1,
    speed:4,
    art:ART.zahria,
    passive:"Passive - Sanguine Aegis: Zahria gains +1 Armor until end of round for each unique enemy that lost life from Bleed this round.",
    abilities:[
      A("mist","Blood Mist",1,0,"Bloodcraft row setup. Choose an enemy row. Each enemy in that row with Bleed gains 2 more Bleed.","zahriaBloodMist",{kind:"rowBleedAmplify",status:"bleed",stacks:2,range:"ranged"}),
      A("rain","Red Rain",1,-2,"Bloodcraft area setup. Apply 1 Bleed to every enemy.","allStatus",{kind:"allStatus",status:"bleed",stacks:1,range:"self"}),
      A("mass","Mass Drain",2,-2,"Bloodcraft payoff. Each enemy with Bleed loses HP equal to its Bleed, then removes that Bleed. Zahria heals for the total HP lost this way.","zahriaMassDrain",{kind:"massDrainBleed",range:"self"}),
      A("blade","Blood Blade",2,0,"Ranged attack. Deal 6 damage to one enemy.","damage",{kind:"attack",dmg:6,range:"ranged"})
    ]
  });
}

function tuneRedRainV97(){
  for(const c of ROSTER){
    const rain = c.abilities?.find(a=>a.id==="rain" && a.name==="Red Rain");
    if(!rain) continue;
    Object.assign(rain, {
      effect:"allStatus",
      kind:"allStatus",
      cost:1,
      range:"self",
      status:"bleed",
      stacks:1,
      self:0,
      desc:"Bloodcraft area setup. Apply 1 Bleed to every enemy."
    });
  }
}

ensureZahriaV97();
tuneRedRainV97();

function noteBleedLifeLossForZahriaV97(victim, amount){
  if(!state?.units || !victim || !amount) return;
  const zahriaSide = other(victim.side);
  const zahrias = state.units.filter(u=>u.id==="zahria" && u.side===zahriaSide && !u.dead);
  if(!zahrias.length) return;
  state.zahriaBleedVictimsV97 = state.zahriaBleedVictimsV97 || {};
  const seen = state.zahriaBleedVictimsV97[zahriaSide] || (state.zahriaBleedVictimsV97[zahriaSide]=[]);
  if(seen.includes(victim.id)) return;
  seen.push(victim.id);
  for(const z of zahrias){
    addArmorThisRound?.(z,1);
    markPassive?.(z, "Sanguine Aegis");
  }
  pushActionEvent?.("passive", `Sanguine Aegis: ${victim.name} lost life from Bleed, so Zahria gained +1 Armor`, zahrias[0]);
  log(`Zahria's Sanguine Aegis triggers from ${victim.name}'s Bleed.`);
}

const damageBeforeZahriaV97 = damage;
damage = function(src,t,amt,opt={}){
  const hadBleed = opt?.attack && t && (t.status?.bleed || 0) > 0;
  const beforeHp = t?.hp || 0;
  const result = damageBeforeZahriaV97(src,t,amt,opt);
  if(hadBleed && t && beforeHp > (t.hp || 0)){
    noteBleedLifeLossForZahriaV97(t, beforeHp - (t.hp || 0));
  }
  return result;
};

const targetsBeforeZahriaV97 = targets;
targets = function(c,a){
  if(!c || !a) return [];
  if(a.effect==="zahriaBloodMist" || a.kind==="rowBleedAmplify") return alive(other(c.side));
  if(a.effect==="zahriaMassDrain" || a.kind==="massDrainBleed" || a.kind==="allStatus") return [];
  return targetsBeforeZahriaV97(c,a);
};

function applyMassDrainBleedV97(c){
  if(!c || c.dead) return;
  let total = 0;
  for(const enemy of alive(other(c.side))){
    const bleed = enemy.status?.bleed || 0;
    if(bleed <= 0) continue;
    enemy.status.bleed = 0;
    const before = enemy.hp;
    lifeFromCaster(c,enemy,bleed,"Bleed drain");
    const lost = Math.max(0, before - enemy.hp);
    total += lost;
    if(lost > 0) noteBleedLifeLossForZahriaV97(enemy,lost);
  }
  if(total > 0) heal(c,total);
  else log(`${c.name}'s Mass Drain found no Bleed to drain.`);
}

const applyBeforeZahriaV97 = apply;
apply = function(c,a,t){
  if(!c || !a) return;
  switch(a.effect){
    case "zahriaBloodMist": {
      const row = t?.row || "front";
      let applied = 0;
      for(const enemy of rowUnits(other(c.side),row)){
        if((enemy.status?.bleed || 0) > 0){
          applyStatusFrom(c,enemy,"bleed",a.stacks || 2);
          applied++;
        }
      }
      if(!applied) log(`${c.name}'s Blood Mist found no Bleeding enemy in the ${row} row.`);
      return;
    }
    case "zahriaMassDrain":
      applyMassDrainBleedV97(c);
      return;
    default:
      return applyBeforeZahriaV97(c,a,t);
  }
};

const endRoundBeforeZahriaV97 = endRound;
endRound = function(){
  const result = endRoundBeforeZahriaV97();
  if(state && state.phase==="planning") state.zahriaBleedVictimsV97 = {};
  return result;
};

/* ===== v98 mobile builder screen hardening ===== */
function renderChooseCardStatsV98(c){
  return `<span>HP ${c.hp}</span><span>Armor ${c.armor}</span><span>Speed ${c.speed}</span>`;
}

const renderChooseBeforeV98 = renderChoose;
renderChoose = function(){
  renderChooseBeforeV98();
  document.querySelectorAll(".fighterCard").forEach(card=>{
    const c = cdef(card.dataset.id);
    const stats = card.querySelector(".fighterStats");
    if(c && stats) stats.innerHTML = renderChooseCardStatsV98(c);
  });
};

function showBattleOnlyV98(){
  $("builder")?.classList.add("hidden");
  $("battle")?.classList.remove("hidden");
  document.body.classList.add("inBattleV98");
}

function showBuilderOnlyV98(){
  $("battle")?.classList.add("hidden");
  $("builder")?.classList.remove("hidden");
  document.body.classList.remove("inBattleV98");
}

const startBattleBeforeScreenV98 = startBattle;
startBattle = function(){
  const result = startBattleBeforeScreenV98();
  showBattleOnlyV98();
  return result;
};

const renderBuilderBeforeScreenV98 = renderBuilder;
renderBuilder = function(){
  renderBuilderBeforeScreenV98();
  if(!$("battle") || $("battle").classList.contains("hidden")) showBuilderOnlyV98();
};

/* ===== v95 runtime smart AI =====
   The playable game now uses the same style of top-candidate smart policy that
   drives the smart-vs-smart balance simulator, instead of the older v45 planner.
*/
const RUNTIME_AI_POLICY_V95 = "smart-ai-v95";

function aiKindV95(a){
  return a?.kind || a?.effect || "";
}

function aiEnemiesV95(u){
  return alive(other(u.side));
}

function aiAlliesV95(u){
  return alive(u.side);
}

function aiStatusV95(u,s){
  return u?.status?.[s] || 0;
}

function aiHasAnyDebuffV95(u){
  return ["poison","bleed","freeze","hypnosis","exposed","exhausted","dread"].some(s=>aiStatusV95(u,s)>0);
}

function aiIsPayoffV95(a){
  const k = aiKindV95(a);
  return [
    "bleedPayoff","consumeBleed","poisonPayoff","poisonBurst","freezePayoff",
    "shatter","shatterScaling","glacier","hypnosisDamagePayoff","mesmerPayoff",
    "mindBreak","mindToxin","mindToxinConsume","demonRupture","absoluteZero",
    "absoluteZeroConsume","poomMassGuardMind"
  ].includes(k);
}

function aiPayoffReadyV95(a,t,c){
  const k = aiKindV95(a);
  if(k === "poomMassGuardMind") return aiEnemiesV95(c).some(e=>aiStatusV95(e,"hypnosis"));
  if(!t) return false;
  switch(k){
    case "bleedPayoff":
    case "consumeBleed":
      return aiStatusV95(t,"bleed") > 0;
    case "poisonPayoff":
    case "poisonBurst":
      return aiStatusV95(t,"poison") > 0;
    case "freezePayoff":
    case "shatter":
    case "shatterScaling":
    case "glacier":
    case "absoluteZero":
    case "absoluteZeroConsume":
      return aiStatusV95(t,"freeze") > 0 || aiEnemiesV95(c).some(e=>aiStatusV95(e,"freeze")>0);
    case "hypnosisDamagePayoff":
    case "mesmerPayoff":
    case "mindBreak":
    case "mindToxin":
    case "mindToxinConsume":
      return aiStatusV95(t,"hypnosis") > 0;
    case "demonRupture":
      return aiStatusV95(t,"poison") + aiStatusV95(t,"bleed") > 0;
    default:
      return true;
  }
}

function aiIsSetupV95(a){
  const k = aiKindV95(a);
  const txt = `${a?.name || ""} ${a?.desc || ""} ${k}`.toLowerCase();
  return [
    "status","multiStatus","rowStatus","rowMultiStatus","allStatus","rowBleedAmplify","frontHypno",
    "poisonHands","bloodInfusion","bloodWard","grantShield","singleHeal","predict","predictPoison",
    "hypnosisCancelPayoff","hypnosisPoisonCancelPayoff"
  ].includes(k) || /apply|poison|bleed|freeze|hypnosis|exposed|dread|setup|ward|protect/.test(txt);
}

function aiStatusPotentialV95(a,t,c){
  let v = 0;
  const add = (s,n,target=t)=>{
    if(!s || !target) return;
    const has = aiStatusV95(target,s);
    const m = s==="poison" ? 1.1 : s==="bleed" ? 1.25 : s==="freeze" ? 1.1 : s==="hypnosis" ? 1.35 : s==="exposed" ? 1.0 : .8;
    v += (n || 1) * m * (has ? .7 : 1.15);
  };
  if(a?.onHit) for(const [s,n] of Object.entries(a.onHit)) add(s,n);
  if(a?.status) add(a.status,a.stacks || 1);
  if(a?.statuses) for(const [s,n] of a.statuses) add(s,n);
  if(a?.effect === "bloodPrice" || a?.kind === "attack") v += 0;
  if(aiKindV95(a) === "allStatus") aiEnemiesV95(c).forEach(x=>add(a.status,a.stacks||1,x));
  if(aiKindV95(a) === "rowBleedAmplify") aiEnemiesV95(c).filter(x=>x.row===(t?.row||"front") && aiStatusV95(x,"bleed")>0).forEach(x=>add("bleed",a.stacks||2,x));
  if(/bleed/i.test(a?.desc || "")) add("bleed", a?.bleed || a?.stacks || 1);
  if(/poison/i.test(a?.desc || "")) add("poison", a?.poison || a?.stacks || 1);
  if(/freeze/i.test(a?.desc || "")) add("freeze", a?.stacks || 1);
  if(/hypnosis/i.test(a?.desc || "")) add("hypnosis", 1);
  if(a?.effect === "frontHypno") aiEnemiesV95(c).filter(x=>x.row==="front").forEach(x=>{ add("hypnosis",1,x); add("exposed",1,x); });
  return v;
}

function aiExpectedRawDamageV95(a,t,c){
  if(!a) return 0;
  const k = aiKindV95(a);
  if(k === "armorStrike") return (a.dmg || 2) + getArmor(c);
  if(k === "bloodPrice") return a.dmg || 6;
  if(k === "delayedAttack") return a.dmg || 6;
  if(k === "massDrainBleed") return aiEnemiesV95(c).reduce((s,x)=>s+(aiStatusV95(x,"bleed")||0),0);
  if(k === "consumeBleed" || k === "bleedPayoff") return (t ? aiStatusV95(t,"bleed") : 0) + (a.bonus || 0) + (a.dmg || 0);
  if(k === "poisonBurst" || k === "poisonPayoff") return (t ? aiStatusV95(t,"poison") : 0) * (a.mult || 2);
  if(k === "demonRupture") return ((t ? aiStatusV95(t,"poison") + aiStatusV95(t,"bleed") : 0) * (a.mult || 2)) + (a.bonus || 0);
  if(k === "shatter" || k === "shatterScaling") return (a.dmg || 3) + (t ? aiStatusV95(t,"freeze") * 2 : 0) + (aiStatusV95(t,"freeze") ? (a.bonus || 5) : 0);
  if(k === "glacier") return (t && aiStatusV95(t,"freeze")) ? (a.payoffDmg || 10) : (a.dmg || 5);
  if(k === "mindBreak" || k === "hypnosisDamagePayoff") return (t && aiStatusV95(t,"hypnosis")) ? (a.payoffDmg || 8) : (a.dmg || 2);
  if(k === "mindToxin" || k === "mindToxinConsume") return (t && aiStatusV95(t,"hypnosis")) ? (a.payoffDmg || 5) : (a.dmg || 3);
  if(k === "assassinate") return (a.dmg || 4) + (t?.row === "back" ? (a.bonus || 2) : 0);
  if(k === "rowDamageStatus") return (a.dmg || 0) * Math.max(1, rowUnits(other(c.side), t?.row || "front").length);
  if(k === "allDamageStatus") return (a.dmg || 0) * Math.max(1, aiEnemiesV95(c).length);
  if(k === "allyPain") return (a.dmg || 0) * Math.max(1, rowUnits(other(c.side),"front").length);
  if(k === "absoluteZero" || k === "absoluteZeroConsume") return aiEnemiesV95(c).reduce((s,x)=>s + (aiStatusV95(x,"freeze") ? ((aiStatusV95(x,"freeze") || 1) * (a.mult || a.dmg || 2)) : 0),0);
  return a.dmg || 0;
}

function aiValidTargetsV95(c,a){
  let ts = targets(c,a).filter(t=>t && !t.dead);
  if(a?.range === "ally") ts = ts.filter(t=>t.side === c.side);
  if(a?.range !== "ally") ts = ts.filter(t=>t.side !== c.side || ["protect","ward","bloodWard","poisonHands","bloodInfusion"].includes(aiKindV95(a)));
  const noTargetKinds = ["dodge","selfCounter","spirit","absoluteZero","allStatus","allDamageStatus","frontHypno","poomMassGuardMind","massDrainBleed"];
  if(!ts.length && noTargetKinds.includes(aiKindV95(a))) return [null];
  return ts;
}

function aiTargetScoreV95(c,a,t,ap){
  if(!t) {
    const k = aiKindV95(a);
    if(k==="poomMassGuardMind") return aiPayoffReadyV95(a,t,c) ? 30 : -40;
    if(k==="allStatus") return 13 + aiEnemiesV95(c).filter(x=>!aiStatusV95(x,a.status)).length * 4;
    if(k==="massDrainBleed") return aiEnemiesV95(c).reduce((s,x)=>s+(aiStatusV95(x,"bleed")||0),0) * 2.4;
    return 0;
  }
  const raw = aiExpectedRawDamageV95(a,t,c);
  const effective = a.ignoreArmor ? raw : Math.max(0, raw - getArmor(t) + (a.pierce || 0));
  let score = effective * 2.2 + aiStatusPotentialV95(a,t,c) * 3 + Math.max(0,14 - t.hp) * 1.1;
  if(effective >= t.hp) score += 34;
  else if(effective >= t.hp * .65) score += 12;
  if(aiIsPayoffV95(a)) score += aiPayoffReadyV95(a,t,c) ? 24 : -42;
  if(aiIsSetupV95(a)){
    const already = (a.status && aiStatusV95(t,a.status)) || (a.statuses && a.statuses.every(([st])=>aiStatusV95(t,st)));
    score += already ? -4 : 8;
  }
  if(c.class === "assassin" && t.row === "back") score += 7;
  if(c.class === "brute" && a.range === "melee") score += 5;
  if(c.class === "sorcerer" && /row|absolute|fog|wave|field/i.test(a.name || "")) score += 6;
  if(a.pierce || a.ignoreArmor) score += getArmor(t) * 1.2;
  if(t.side === c.side){
    score = 4;
    if(["singleHeal","hopeHeal"].includes(aiKindV95(a))) {
      const missing = Math.max(0, (t.maxHp || t.hp || 0) - t.hp);
      score += Math.min(a.heal || 5, missing) * 3 + (t.hp <= t.maxHp * .45 ? 14 : 0);
    }
    if(["grantShield","hopeShield"].includes(aiKindV95(a))) score += (a.shield || 5) * 1.4 + (t.hp <= t.maxHp * .55 ? 12 : 0);
    if(a.guard) score += t.hp <= t.maxHp * .45 ? 20 : 2;
    if(["protect","bloodWard","ward","grantShield","hopeShield"].includes(aiKindV95(a))) score += t.hp <= t.maxHp * .55 ? 16 : -4;
    if(["poisonHands","bloodInfusion"].includes(aiKindV95(a))) score += 15 + (t.planned ? -8 : 0);
    if(t.id === c.id && a.range === "ally") score -= 8;
  }
  return score;
}

function aiAbilityScoreV95(c,a,ts,ap,plans){
  if(a.cost > ap) return -999;
  const targetScores = ts.length ? ts.map(t=>aiTargetScoreV95(c,a,t,ap)) : [0];
  let score = 8 + a.cost + Math.max(...targetScores);
  const lowSelf = c.hp <= c.maxHp * .45;
  const lowAlly = aiAlliesV95(c).some(x=>x.hp <= x.maxHp * .45);
  if(a.guard){
    score += lowSelf ? 10 : -3;
    score += lowAlly ? 8 : 0;
    if(["protect","bloodWard","ward","grantShield","hopeShield"].includes(aiKindV95(a))) score += lowAlly ? 8 : -8;
    if(aiKindV95(a)==="poomMassGuardMind") score += aiPayoffReadyV95(a,null,c) ? 22 : -40;
  }
  if(aiIsPayoffV95(a) && aiKindV95(a)!=="poomMassGuardMind" && !ts.some(t=>aiPayoffReadyV95(a,t,c))) score -= 36;
  if((plans || []).some(p=>p.unit === c || p.u === c)) score -= 8;
  score += Math.random() * 4 - 1.5;
  return Math.max(.5, score);
}

function aiPickPlanSmartV95(c,ap,plans=[]){
  const options = [];
  for(const a of c.abilities){
    if(a.cost > ap) continue;
    if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(c,a)) continue;
    const ts = aiValidTargetsV95(c,a);
    if(!ts.length) continue;
    const base = aiAbilityScoreV95(c,a,ts,ap,plans);
    for(const t of ts){
      options.push({unit:c, ability:a, target:t, weight:base + aiTargetScoreV95(c,a,t,ap) * .25});
    }
  }
  if(!options.length) return null;
  options.sort((a,b)=>b.weight-a.weight);
  const top = options.slice(0,3);
  const total = top.reduce((s,o)=>s+Math.max(1,o.weight),0);
  let roll = Math.random() * total;
  for(const option of top){
    roll -= Math.max(1,option.weight);
    if(roll <= 0) return option;
  }
  return top[0];
}

chooseEnemy = function chooseEnemySmartV95(){
  state.aiPolicy = RUNTIME_AI_POLICY_V95;
  state.plans = (state.plans || []).filter(p=>p.side!=="enemy");
  for(const e of alive("enemy")) e.planned = null;

  let ap = 3;
  let safety = 0;
  const planned = [];
  while(ap > 0 && safety++ < 7){
    const candidates = [];
    for(const e of alive("enemy")){
      const pick = aiPickPlanSmartV95(e,ap,planned);
      if(pick) candidates.push(pick);
    }
    if(!candidates.length) break;
    candidates.sort((a,b)=>b.weight-a.weight);
    const top = candidates.slice(0,3);
    const total = top.reduce((s,o)=>s+Math.max(1,o.weight),0);
    let roll = Math.random() * total;
    let chosen = top[0];
    for(const option of top){
      roll -= Math.max(1,option.weight);
      if(roll <= 0){ chosen = option; break; }
    }
    const planObj = makePlan(chosen.unit, chosen.ability, chosen.target, "enemy");
    planObj.aiPolicy = RUNTIME_AI_POLICY_V95;
    planObj.score = Math.round(chosen.weight * 10) / 10;
    state.plans.push(planObj);
    chosen.unit.planned = {
      ability:chosen.ability.id,
      target:chosen.target?.id || null,
      targetSide:chosen.target?.side || null,
      aiPolicy:RUNTIME_AI_POLICY_V95
    };
    planned.push(planObj);
    ap -= chosen.ability.cost;
  }

  state.enemyRevealed = true;
  log("Enemy actions revealed by smart AI.");
  show?.("Enemy actions revealed");
};

window.__WANDERERS_AI_POLICY = RUNTIME_AI_POLICY_V95;
window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
  aiPolicy: RUNTIME_AI_POLICY_V95,
  chooseEnemy: () => chooseEnemy(),
  getState: () => state,
  setState: next => { state = next; return state; },
  cdef,
  cloneChar,
  makePlan,
  planToAction,
  unitBySide,
  targets,
  aiTargetScoreV95,
  aiAbilityScoreV95,
  aiPickPlanSmartV95
});

$("nextBtn").onclick=()=>{if(builderStep==="choose"){if(chosenIds.length!==3)return;builderStep="arrange";arrangeSelectedId=chosenIds[0];renderBuilder()}else startBattle()}
$("backBtn").onclick=()=>{builderStep="choose";renderBuilder()}
$("randomBtn").onclick=randomTeam;$("classFilter").onchange=renderBuilder;$("squadMode").onclick=()=>{mode="squad";$("squadMode").classList.add("active");$("bossMode").classList.remove("active")};$("bossMode").onclick=()=>{mode="boss";$("bossMode").classList.add("active");$("squadMode").classList.remove("active")};$("homeBtn").onclick=()=>{$("battle").classList.add("hidden");$("builder").classList.remove("hidden");renderBuilder()};$("resetBtn").onclick=()=>startBattle();$("resolveBtn").onclick=resolveRound;$("radialClose").onclick=()=>{$("radial").classList.add("hidden");$("abilityTooltip")?.classList.add("hidden");};renderBuilder();

/* ===== v101 overlay closing, battle log toggle, resolve-time payoff guardrails ===== */
function clearTransientOverlaysV101(){
  $("resolutionOverlay")?.classList.add("hidden");
  $("abilityTooltip")?.classList.add("hidden");
  $("radial")?.classList.add("hidden");
  if(typeof hideKeywordPopup === "function") hideKeywordPopup();
}

function closeAbilityTooltipV101(){
  $("abilityTooltip")?.classList.add("hidden");
  if(typeof hideKeywordPopup === "function") hideKeywordPopup();
}

function ensureAbilityTooltipCloseV101(){
  const tooltip = $("abilityTooltip");
  if(!tooltip || tooltip.classList.contains("hidden")) return;
  if(tooltip.querySelector(".abilityTooltipClose")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "abilityTooltipClose overlayCloseBtn";
  btn.setAttribute("aria-label","Close ability details");
  btn.textContent = "×";
  btn.onclick = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    closeAbilityTooltipV101();
  };
  tooltip.prepend(btn);
}

function closeResolutionOverlayV101(){
  const overlay = $("resolutionOverlay");
  if(overlay) overlay.classList.add("hidden");
  currentResolveDetail = null;
}

function ensureResolutionCloseV101(){
  const overlay = $("resolutionOverlay");
  const card = overlay?.querySelector(".resolveCard");
  if(!overlay || overlay.classList.contains("hidden") || !card) return;
  if(card.querySelector(".resolutionCloseBtn")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "resolutionCloseBtn overlayCloseBtn";
  btn.setAttribute("aria-label","Close result");
  btn.textContent = "×";
  btn.onclick = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    closeResolutionOverlayV101();
  };
  card.prepend(btn);
}

const showResolutionOverlayBeforeV101 = showResolutionOverlay;
showResolutionOverlay = function(actor, ability, target, stage="reveal", events=[]){
  showResolutionOverlayBeforeV101(actor, ability, target, stage, events);
  ensureResolutionCloseV101();
};

const hideResolutionOverlayBeforeV101 = hideResolutionOverlay;
hideResolutionOverlay = function(){
  hideResolutionOverlayBeforeV101();
  currentResolveDetail = null;
};

function setBattlePanelV101(mode){
  const panel = $("infoPanelSheet");
  if(!panel) return;
  panel.classList.remove("showInfo","showLog","panelClosedV101","showInfoV101","showLogV101");
  document.body.classList.remove("mobilePanelOpen");
  if(mode === "closed"){
    panel.classList.add("panelClosedV101");
    return;
  }
  if(mode === "log"){
    panel.classList.add("showLog","showLogV101");
  } else {
    panel.classList.add("showInfo","showInfoV101");
  }
  if(typeof isMobileLayout === "function" && isMobileLayout()) document.body.classList.add("mobilePanelOpen");
}

function toggleBattleLogV101(){
  const panel = $("infoPanelSheet");
  const isOpen = panel && !panel.classList.contains("panelClosedV101") && panel.classList.contains("showLogV101");
  setBattlePanelV101(isOpen ? "closed" : "log");
}

function installBattleLogControlsV101(){
  if(!$("battleLogToggleBtn")){
    const btn = document.createElement("button");
    btn.id = "battleLogToggleBtn";
    btn.className = "pill battleLogToggleBtn";
    btn.type = "button";
    btn.textContent = "Log";
    $("resource")?.appendChild(btn);
    document.querySelector(".resource")?.appendChild(btn);
  }
  $("battleLogToggleBtn") && ($("battleLogToggleBtn").onclick = toggleBattleLogV101);
  $("mobileInfoBtn") && ($("mobileInfoBtn").onclick = () => setBattlePanelV101("info"));
  $("mobileLogBtn") && ($("mobileLogBtn").onclick = () => setBattlePanelV101("log"));
  $("mobileClosePanelBtn") && ($("mobileClosePanelBtn").onclick = () => setBattlePanelV101("closed"));
}

function patchOverlayLifecycleV101(){
  $("homeBtn")?.addEventListener("click", clearTransientOverlaysV101, true);
  $("resetBtn")?.addEventListener("click", clearTransientOverlaysV101, true);
  $("nextBtn")?.addEventListener("click", clearTransientOverlaysV101, true);
  $("backBtn")?.addEventListener("click", clearTransientOverlaysV101, true);
  document.addEventListener("keydown", ev => {
    if(ev.key !== "Escape") return;
    closeAbilityTooltipV101();
    closeResolutionOverlayV101();
    setBattlePanelV101("closed");
  });
  const tooltip = $("abilityTooltip");
  if(tooltip && typeof MutationObserver !== "undefined"){
    new MutationObserver(ensureAbilityTooltipCloseV101).observe(tooltip,{childList:true,attributes:true,attributeFilter:["class"]});
  }
  const overlay = $("resolutionOverlay");
  if(overlay && typeof MutationObserver !== "undefined"){
    new MutationObserver(ensureResolutionCloseV101).observe(overlay,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  }
}

function conditionCheckedAtResolveV101(c,a,t){
  const k = a?.kind || a?.effect;
  switch(k){
    case "mindBreak":
    case "hypnosisDamagePayoff":
    case "mindToxin":
    case "mindToxinConsume":
    case "mesmerPayoff":
      return !!t?.status?.hypnosis;
    case "consumeBleed":
    case "bleedPayoff":
      return (t?.status?.bleed || 0) > 0;
    case "poisonBurst":
    case "poisonPayoff":
      return (t?.status?.poison || 0) > 0;
    case "shatter":
    case "shatterScaling":
    case "glacier":
    case "freezePayoff":
      return (t?.status?.freeze || 0) > 0;
    case "demonRupture":
      return ((t?.status?.poison || 0) + (t?.status?.bleed || 0)) > 0;
    default:
      return null;
  }
}

const applyBeforeResolveConditionsV101 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeResolveConditionsV101(c,a,t);
  const readyAtResolve = conditionCheckedAtResolveV101(c,a,t);
  if(readyAtResolve === true){
    pushActionEvent?.("statusTrigger", `${a.name} payoff condition was met at resolve`, t || c);
  } else if(readyAtResolve === false && typeof aiIsPayoffV95 === "function" && aiIsPayoffV95(a)){
    pushActionEvent?.("statusTrigger", `${a.name} payoff condition was not met at resolve`, t || c);
  }
  return applyBeforeResolveConditionsV101(c,a,t);
};

installBattleLogControlsV101();
patchOverlayLifecycleV101();

/* ===== v102 ability text/runtime truth pass =====
   Keeps the last active resolver aligned with the final visible ability text.
*/
function abilityV102(characterId, abilityId){
  return ROSTER.find(c=>c.id===characterId)?.abilities?.find(a=>a.id===abilityId);
}

function patchAbilityV102(characterId, abilityId, patch){
  const ability = abilityV102(characterId, abilityId);
  if(ability) Object.assign(ability, patch);
  return ability;
}

function tuneAbilityTextTruthV102(){
  patchAbilityV102("smithen","iceNeedle", {
    effect:"damageStatusOnHit",
    dmg:2,
    status:"freeze",
    stacks:2,
    desc:"Ranged icecraft attack. Deal 2 damage. If this hit deals HP damage, apply 2 Freeze."
  });
  patchAbilityV102("smithen","whiteout", {
    effect:"whiteout",
    stacks:2,
    desc:"Ranged setup. Apply 2 Freeze. If the target already had Freeze before this ability, also apply Exposed."
  });
  patchAbilityV102("smithen","pin", {
    effect:"whiteout",
    stacks:2,
    desc:"Ranged setup. Apply 2 Freeze. If the target already had Freeze before this ability, also apply Exposed."
  });
  patchAbilityV102("smithen","shatter", {
    effect:"shatterScaling",
    dmg:3,
    pierce:2,
    range:"ranged",
    desc:"Assassin icecraft payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze."
  });

  patchAbilityV102("dravain","bash", {
    effect:"armorStrike",
    dmg:2,
    desc:"Melee warrior attack. Deal damage equal to 2 plus Dravain's current Armor."
  });
  patchAbilityV102("dravain","drain", {
    dmg:3,
    heal:2,
    desc:"Melee vampire attack. Deal 3 damage. If this deals HP damage, Dravain restores 2 HP."
  });
  patchAbilityV102("dravain","claim", {
    mult:1,
    bonus:2,
    heal:1,
    desc:"Bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +2 damage. If any Bleed was removed, Dravain restores 1 HP."
  });

  patchAbilityV102("kku","slam", {
    effect:"damageStatusOnHit",
    dmg:3,
    status:"freeze",
    stacks:1,
    desc:"Front-line brute attack. Deal 3 damage. If this hit deals HP damage, apply 1 Freeze."
  });
  patchAbilityV102("kku","break", {
    dmg:5,
    bonus:2,
    desc:"Front-line brute payoff. Deal 5 damage. If the target has Freeze, deal +2 damage."
  });
  patchAbilityV102("kku","roar", {
    exhausted:1,
    desc:"Front-row setup. Apply 2 Freeze and Exhausted to enemies in the front row."
  });

  patchAbilityV102("kahro","needle", {
    dmg:3,
    pierce:2,
    desc:"Assassin precision. Deal 3 damage with Pierce 2. Can target backline."
  });
  patchAbilityV102("kahro","assassinate", {
    dmg:5,
    bonus:3,
    pierce:2,
    desc:"Assassin precision. Deal 5 damage with Pierce 2. Can target backline. If the target is in the back row and the front row is empty, deal +3 damage."
  });

  patchAbilityV102("eva","kiss", {
    dmg:2,
    bleed:2,
    status:"bleed",
    stacks:2,
    ignoreArmor:true,
    desc:"Vampire setup. Deal 2 damage ignoring Armor, then apply 2 Bleed."
  });
  patchAbilityV102("eva","bite", {
    effect:"consumeBleed",
    mult:2,
    bonus:1,
    heal:2,
    desc:"Assassin/vampire payoff. Can target backline. Remove all Bleed. Deal Bleed x2 +1 damage. If any Bleed was removed, Lady Eva restores 2 HP."
  });

  patchAbilityV102("hyafrost","frostbite", {
    effect:"whiteout",
    stacks:2,
    dmg:2,
    ignoreArmor:true,
    desc:"Icecraft setup. Apply 2 Freeze. If the target already had Freeze before this ability, also deal 2 damage ignoring Armor."
  });
  patchAbilityV102("hyafrost","field", {
    stacks:3,
    desc:"AoE icecraft control. Choose an enemy row. Apply 3 Freeze to each enemy in that row."
  });

  patchAbilityV102("bakub","toxin", {
    effect:"mindToxinConsume",
    dmg:3,
    payoffDmg:5,
    poison:2,
    ignoreArmor:true,
    desc:"Ranged hypnotic/witchcraft payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis, deal 5 damage ignoring Armor instead, and apply 2 Poison."
  });

  patchAbilityV102("poom","roar", {
    effect:"mesmerPayoff",
    dmg:3,
    bonus:6,
    desc:"Front-line hypnotic payoff. Deal 3 damage. If the target has Hypnosis, remove Hypnosis and deal +6 damage."
  });
  patchAbilityV102("poom","revenge", {
    dmg:6,
    self:2,
    bonus:3,
    desc:"Front-line brute attack. Poom takes 2 self-damage, reduced by Armor and Shield. Then deal 6 damage. If Poom already lost HP this round, deal +3 damage."
  });
  patchAbilityV102("poom","bodyguard", {
    dmg:6,
    self:2,
    bonus:3,
    desc:"Front-line brute attack. Poom takes 2 self-damage, reduced by Armor and Shield. Then deal 6 damage. If Poom already lost HP this round, deal +3 damage."
  });

  patchAbilityV102("shaman","rupture", {
    mult:2,
    bonus:3,
    desc:"Demon payoff. Remove all Poison and Bleed from one enemy. Deal removed counters x2 +3 damage, ignoring Armor."
  });
}
tuneAbilityTextTruthV102();

let zahriaBleedLifeContextV102 = false;
const noteBleedLifeLossForZahriaBeforeV102 = typeof noteBleedLifeLossForZahriaV97 === "function" ? noteBleedLifeLossForZahriaV97 : null;
if(noteBleedLifeLossForZahriaBeforeV102){
  noteBleedLifeLossForZahriaV97 = function(victim, amount){
    if(!zahriaBleedLifeContextV102) return;
    return noteBleedLifeLossForZahriaBeforeV102(victim, amount);
  };
}

function withZahriaBleedLifeContextV102(fn){
  const prev = zahriaBleedLifeContextV102;
  zahriaBleedLifeContextV102 = true;
  try { return fn(); }
  finally { zahriaBleedLifeContextV102 = prev; }
}

function consumeBleedDamageV102(c,a,t){
  const bleed = t?.status?.bleed || 0;
  if(t) t.status.bleed = 0;
  const raw = bleed * (a.mult ?? 1) + (a.bonus ?? 0);
  damage(c,t,raw,{attack:true,melee:a.range==="melee",pierce:a.pierce||0,ignoreArmor:!!a.ignoreArmor});
  if(bleed > 0 && a.heal) heal(c,a.heal);
  if(bleed > 0 && c.id==="dravain") addShield(c,3);
}

function applyMassDrainBleedV102(c){
  if(!c || c.dead) return;
  withZahriaBleedLifeContextV102(() => {
    let total = 0;
    for(const enemy of alive(other(c.side))){
      const bleed = enemy.status?.bleed || 0;
      if(bleed <= 0) continue;
      enemy.status.bleed = 0;
      const before = enemy.hp || 0;
      lifeFromCaster(c,enemy,bleed,"Bleed drain");
      const lost = Math.max(0, before - (enemy.hp || 0));
      total += lost;
      if(lost > 0 && typeof noteBleedLifeLossForZahriaV97 === "function"){
        noteBleedLifeLossForZahriaV97(enemy,lost);
      }
    }
    if(total > 0) heal(c,total);
    else log(`${c.name}'s Mass Drain found no Bleed to drain.`);
  });
}

function statusStackCountV114(a, status, fallback=1){
  if(a?.stacks != null) return a.stacks;
  if(status === "bleed" && a?.bleed != null) return a.bleed;
  if(status === "poison" && a?.poison != null) return a.poison;
  const desc = String(a?.desc || "");
  const label = status ? status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
  if(label){
    const specific = desc.match(new RegExp(`(?:apply|gains?|gain)\\s+(\\d+)\\s+${label}`, "i"));
    if(specific) return Number(specific[1]);
  }
  const generic = desc.match(/(?:apply|gains?|gain)\s+(\d+)\s+(?:bleed|poison|freeze)/i);
  return generic ? Number(generic[1]) : fallback;
}

const applyBeforeTextTruthV102 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeTextTruthV102(c,a,t);

  switch(a.effect){
    case "armorStrike":
      damage(c,t,(a.dmg ?? 2)+getArmor(c),{attack:true,melee:true});
      return;

    case "damageStatusOnHit":
      applyOnHitStatusV56(c,{...a, stacks:statusStackCountV114(a,a.status,1)},t);
      return;

    case "damageStatus": {
      const dealt = damage(c,t,a.dmg ?? 0,{attack:true,melee:a.range==="melee",ignoreArmor:!!a.ignoreArmor,pierce:a.pierce||0});
      const needsHpDamage = /if this hit deals hp damage/i.test(a.desc || "");
      if(!t?.dead && (!needsHpDamage || dealt > 0)) applyStatusFrom(c,t,a.status,statusStackCountV114(a,a.status,1));
      return;
    }

    case "whiteout": {
      const hadFreeze = (t?.status?.freeze || 0) > 0;
      if(!t?.dead) applyStatusFrom(c,t,"freeze",statusStackCountV114(a,"freeze",1));
      if(hadFreeze && a.id==="whiteout" && !t?.dead) addStatus(t,"exposed",1);
      if(hadFreeze && a.id==="pin" && !t?.dead) addStatus(t,"exposed",1);
      if(hadFreeze && a.id==="frostbite") damage(c,t,a.dmg ?? 2,{attack:true,melee:false,ignoreArmor:!!a.ignoreArmor});
      return;
    }

    case "rowStatus": {
      const row = a.row || t?.row || "front";
      for(const enemy of rowUnits(other(c.side),row)){
        applyStatusFrom(c,enemy,a.status,statusStackCountV114(a,a.status,1));
        if(a.exhausted && !enemy.dead) addStatus(enemy,"exhausted",a.exhausted);
      }
      return;
    }

    case "drain": {
      const beforeHp = t?.hp || 0;
      damage(c,t,a.dmg ?? 0,{attack:true,melee:a.range==="melee",pierce:a.pierce||0,ignoreArmor:!!a.ignoreArmor});
      if((beforeHp - (t?.hp || 0)) > 0 && a.heal) heal(c,a.heal);
      return;
    }

    case "consumeBleed":
      consumeBleedDamageV102(c,a,t);
      return;

    case "shatterScaling": {
      const freeze = t?.status?.freeze || 0;
      if(t) t.status.freeze = 0;
      damage(c,t,(a.dmg ?? 3) + freeze * 2,{attack:true,melee:a.range==="melee",pierce:a.pierce||0,ignoreArmor:!!a.ignoreArmor});
      return;
    }

    case "glacier": {
      const bonus = (t?.status?.freeze || 0) > 0 ? (a.bonus ?? 2) : 0;
      damage(c,t,(a.dmg ?? 5)+bonus,{attack:true,melee:a.range==="melee"});
      return;
    }

    case "mindToxinConsume": {
      const hadHypnosis = !!t?.status?.hypnosis;
      if(hadHypnosis) t.status.hypnosis = 0;
      damage(c,t,hadHypnosis ? (a.payoffDmg ?? 5) : (a.dmg ?? 3),{attack:true,melee:false,ignoreArmor:hadHypnosis && !!a.ignoreArmor});
      if(hadHypnosis && !t?.dead) applyStatusFrom(c,t,"poison",a.poison ?? 2);
      return;
    }

    case "mesmerPayoff": {
      const hadHypnosis = !!t?.status?.hypnosis;
      if(hadHypnosis) t.status.hypnosis = 0;
      damage(c,t,(a.dmg ?? 3) + (hadHypnosis ? (a.bonus ?? 6) : 0),{attack:true,melee:a.range==="melee"});
      return;
    }

    case "revenge": {
      const wasDamaged = !!state?.attacked?.[c.id];
      if((a.self ?? 0) > 0) damage(c,c,a.self,{attack:false,selfCost:true});
      damage(c,t,(a.dmg ?? 5) + (wasDamaged ? (a.bonus ?? 3) : 0),{attack:true,melee:a.range==="melee"});
      return;
    }

    case "demonRupture": {
      const total = (t?.status?.poison || 0) + (t?.status?.bleed || 0);
      if(t){ t.status.poison = 0; t.status.bleed = 0; }
      damage(c,t,total * (a.mult ?? 2) + (a.bonus ?? 0),{attack:true,melee:false,ignoreArmor:true});
      return;
    }

    case "zahriaMassDrain":
      applyMassDrainBleedV102(c);
      return;

    default:
      return applyBeforeTextTruthV102(c,a,t);
  }
};

const aiExpectedRawDamageBeforeTextTruthV102 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
if(aiExpectedRawDamageBeforeTextTruthV102){
  aiExpectedRawDamageV95 = function(a,t,c){
    const k = aiKindV95(a);
    if(k === "armorStrike") return (a.dmg ?? 2) + getArmor(c);
    if(k === "assassinate") return (a.dmg ?? 5) + (t?.row === "back" && !frontBlocked(t.side) ? (a.bonus ?? 3) : 0);
    if(k === "mindToxin" || k === "mindToxinConsume") return (t && aiStatusV95(t,"hypnosis")) ? (a.payoffDmg ?? 5) : (a.dmg ?? 3);
    if(k === "shatter" || k === "shatterScaling") return (a.dmg ?? 3) + ((t ? aiStatusV95(t,"freeze") : 0) * 2);
    return aiExpectedRawDamageBeforeTextTruthV102(a,t,c);
  };
}

if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v124 final layer: latest front-row, bleed-hit, guard, and balance rules ===== */
{
  const char = id => ROSTER.find(x=>x.id===id);
  const ability = (cid,aid) => char(cid)?.abilities?.find(a=>a.id===aid);
  const patchChar = (id,props) => { const c = char(id); if(c) Object.assign(c,props); return c; };
  const patchAbility = (cid,aid,props) => { const a = ability(cid,aid); if(a) Object.assign(a,props); return a; };
  const keyFor = u => u ? `${u.side || ""}:${u.id}` : "";

  function rowsWithUnits(side){
    const rows = [];
    const living = alive(side);
    if(living.some(u=>u.size==="boss")) rows.push("front","back");
    if(living.some(u=>u.size==="rowBoss" && u.row==="front")) rows.push("front");
    if(living.some(u=>u.size==="rowBoss" && u.row==="back")) rows.push("back");
    if(living.some(u=>!u.size && u.row==="front")) rows.push("front");
    if(living.some(u=>!u.size && u.row==="back")) rows.push("back");
    return [...new Set(rows)];
  }
  function frontRow(side){
    const rows = rowsWithUnits(side);
    return rows.includes("front") ? "front" : (rows.includes("back") ? "back" : "front");
  }
  function backRow(side){
    const rows = rowsWithUnits(side);
    return rows.includes("back") ? "back" : (rows.includes("front") ? "front" : "back");
  }
  function isFront(u){ return !!u && !u.dead && (u.size==="boss" || u.row===frontRow(u.side)); }
  function isBack(u){ return !!u && !u.dead && (u.size==="boss" || u.row===backRow(u.side)); }

  const previousRowUnits = rowUnits;
  rowUnits = function(side,row){
    if(row === "front") return alive(side).filter(isFront);
    if(row === "back") return alive(side).filter(isBack);
    return previousRowUnits(side,row);
  };
  frontBlocked = side => alive(side).some(isFront);

  patchAbility("maoja","hands", {
    guard:true, guardType:true, spd:99,
    desc:"Guard buff. Choose an ally. Until the end of next round, that ally's melee hits apply 2 Poison to the target."
  });
  patchAbility("maoja","breath", {
    range:"front", frontRowOnly:true,
    desc:"Front-row attack. Deal 1 damage to each enemy in the current front row, then apply 3 Poison to each of them."
  });
  patchChar("fuego", {hp:18, armor:1});
  patchAbility("fuego","stoke", {cost:2, stacks:3, desc:"Firecraft. Gain 3 Flame counters."});
  patchAbility("fuego","nova", {mult:2, desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to 2 times the removed Flame counters to all enemies. Fuego gains Exhausted."});
  patchAbility("shaman","rupture", {bonus:0, desc:"Demon payoff. Remove all Poison and Bleed from one enemy. Deal removed counters x2 damage, ignoring Armor."});
  patchAbility("kku","guard", {
    effect:"iceGuardRetaliate", kind:"iceGuardRetaliate", guard:true, guardType:true, armor:2, stacks:1,
    desc:"Guard. K'ku gains +2 Armor this turn. Whenever an enemy melee attacks K'ku this turn, that attacker gains 1 Freeze."
  });
  patchAbility("dravain","bash", {
    name:"Vampiric Grab", cost:1, spd:0, effect:"vampiricGrab", kind:"vampiricGrab", range:"melee",
    dmg:2, pierce:2, bleed:2, heal:2, guardBonus:2, guardType:false,
    desc:"Melee attack. Deal 2 damage with Pierce 2. If hit, the target gains 2 Bleed and Dravain restores 2 HP. If the target performed a Guard move this round, deal +2 damage."
  });
  const evaGrab = char("eva")?.abilities?.find(a=>a.id==="kiss" || /vampire kiss/i.test(a.name || "")) || ability("eva","dash");
  if(evaGrab) Object.assign(evaGrab, {
    id:"kiss", name:"Vampiric Grab", cost:1, spd:0, effect:"vampiricGrab", kind:"vampiricGrab", range:"melee",
    dmg:2, pierce:2, bleed:2, heal:2, guardBonus:2,
    desc:"Melee attack. Deal 2 damage with Pierce 2. If hit, the target gains 2 Bleed and Lady Eva restores 2 HP. If the target performed a Guard move this round, deal +2 damage."
  });
  patchAbility("paleya","mesmer", {
    name:"Fae Portal Grab", cost:1, spd:0, effect:"faePortalGrab", kind:"faePortalGrab", range:"melee",
    backlineReach:true, dmg:3, guardBonus:3,
    desc:"Melee attack. Can target enemies at range. Deal 3 damage. If the target performed a Guard move this round, deal +3 damage."
  });

  function isGuardAbility(a){
    const k = a?.kind || a?.effect || "";
    const text = `${a?.name || ""} ${a?.desc || ""} ${k}`.toLowerCase();
    return !!(a?.guard || a?.guardType ||
      ["protect","ward","dodge","predict","predictPoison","selfCounter","spirit","bloodWard","frostArmorRetaliate","poisonHands","iceGuardRetaliate","mirrorHypnoticGuard","grantShield","hopeShield","dragonScales"].includes(k) ||
      /\bguard\b|protect|ward|dodge|counter|shield|armor this turn|scales/.test(text));
  }
  for(const c of ROSTER){
    for(const a of c.abilities || []){
      if(isGuardAbility(a)){
        a.guardType = true;
        a.tags = [...new Set([...(a.tags || []), "guard"])];
      }
    }
  }
  function markGuard(c,a){
    if(!state || !c || !isGuardAbility(a)) return;
    state.guardActionsV124 = state.guardActionsV124 || {};
    state.guardActionsV124[keyFor(c)] = true;
    c.performedGuardRoundV124 = state.round;
  }
  function performedGuard(u){
    return !!(state && u && (
      u.performedGuardRoundV124 === state.round ||
      state.guardActionsV124?.[keyFor(u)] ||
      state.guarded?.[u.id]
    ));
  }

  const previousTargets = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    const enemies = alive(other(c.side));
    const k = a.kind || a.effect;
    if(a.frontRowOnly || a.range === "front") return enemies.filter(isFront);
    if(k === "faePortalGrab") return enemies;
    if(a.range === "melee" && !a.backlineReach && !a.portalReach) return enemies.filter(isFront);
    return previousTargets(c,a);
  };

  const previousAiTargets = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
  if(previousAiTargets){
    aiValidTargetsV95 = function(c,a){
      if(!c || !a) return [];
      const enemies = alive(other(c.side));
      const k = a.kind || a.effect;
      if(a.frontRowOnly || a.range === "front") return enemies.filter(isFront);
      if(k === "faePortalGrab") return enemies;
      if(a.range === "melee" && !a.backlineReach && !a.portalReach) return enemies.filter(isFront);
      return previousAiTargets(c,a);
    };
  }

  const previousApply = apply;
  apply = function(c,a,t){
    if(!c || !a) return previousApply(c,a,t);
    markGuard(c,a);
    const k = a.kind || a.effect;
    if(k === "rowDamageStatus" && (a.frontRowOnly || a.range === "front")){
      rowUnits(other(c.side),"front").forEach(x=>{
        damage(c,x,a.dmg || 0,{attack:true,aoe:true,melee:false});
        applyStatusFrom?.(c,x,a.status,a.stacks);
      });
      return;
    }
    if(k === "vampiricGrab"){
      if(!t || t.dead) return;
      const raw = (a.dmg || 2) + (performedGuard(t) ? (a.guardBonus || 0) : 0);
      const beforeHp = t.hp;
      damage(c,t,raw,{attack:true,melee:true,pierce:a.pierce || 0});
      if(beforeHp > (t?.hp ?? beforeHp) && t && !t.dead){
        applyStatusFrom?.(c,t,"bleed",a.bleed || 2);
        heal(c,a.heal || 2);
      }
      return;
    }
    if(k === "faePortalGrab"){
      if(!t || t.dead) return;
      damage(c,t,(a.dmg || 3) + (performedGuard(t) ? (a.guardBonus || 0) : 0),{attack:true,melee:true});
      return;
    }
    return previousApply(c,a,t);
  };

  const previousDamage = damage;
  damage = function(src,t,amt,opt={}){
    const originalTarget = t;
    const beforeHp = originalTarget?.hp ?? null;
    const beforeBleed = opt?.attack && originalTarget ? (originalTarget.status?.bleed || 0) : 0;
    const beforeSrcFreeze = src?.status?.freeze || 0;
    const iceGuardReady = !!(opt?.attack && opt?.melee && originalTarget?.buff?.iceGuardRetaliateV118 && src && !src.dead);
    if(beforeBleed > 0 && originalTarget?.status) originalTarget.status.bleed = 0;

    const result = previousDamage(src,t,amt,opt);

    if(beforeBleed > 0 && originalTarget && !originalTarget.dead){
      originalTarget.status.bleed = (originalTarget.status.bleed || 0) + beforeBleed;
      const hpLostByAttack = beforeHp !== null ? Math.max(0, beforeHp - originalTarget.hp) : 0;
      if(hpLostByAttack > 0){
        originalTarget.status.bleed = Math.max(0, (originalTarget.status.bleed || 0) - beforeBleed);
        loseHpDirect(originalTarget,beforeBleed,"Bleed after hit");
        pushActionEvent?.("hp", `${originalTarget.name}'s Bleed resolved after being hit for ${beforeBleed} HP`, originalTarget, {value:beforeBleed});
        log(`${originalTarget.name}'s Bleed resolves after the hit for ${beforeBleed} HP and is removed.`);
      }
    }
    if(opt?.attack && beforeHp !== null && originalTarget && beforeHp > originalTarget.hp){
      state.hitThisRoundV124 = state.hitThisRoundV124 || {};
      state.hitThisRoundV124[keyFor(originalTarget)] = true;
    }
    if(iceGuardReady && (src.status?.freeze || 0) <= beforeSrcFreeze){
      const stacks = originalTarget.buff.iceGuardRetaliateV118.stacks || 1;
      addStatus(src,"freeze",stacks);
      markPassive?.(originalTarget, "Ice Guard");
      pushActionEvent?.("statusGain", `${src.name} gained ${stacks} Freeze from Ice Guard`, src);
      log(`${src.name} gains ${stacks} Freeze from ${originalTarget.name}'s Ice Guard.`);
    }
    return result;
  };

  const previousEndRound = endRound;
  endRound = function(){
    if(state){
      state.guardActionsV124 = {};
      state.hitThisRoundV124 = {};
      for(const u of state.units || []) delete u.performedGuardRoundV124;
    }
    return previousEndRound();
  };

  const previousAiDamage = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
  if(previousAiDamage){
    aiExpectedRawDamageV95 = function(a,t,c){
      const k = a?.kind || a?.effect;
      if(k === "vampiricGrab") return (a.dmg || 2) + (performedGuard(t) ? (a.guardBonus || 0) : 0);
      if(k === "faePortalGrab") return (a.dmg || 3) + (performedGuard(t) ? (a.guardBonus || 0) : 0);
      if(k === "demonRupture") return ((t ? aiStatusV95(t,"poison") + aiStatusV95(t,"bleed") : 0) * (a.mult || 2)) + (a.bonus || 0);
      if(k === "fuegoSuperNova"){
        const flame = Math.max(0, c?.status?.flame || 0);
        return flame * (a.mult ?? 2) * Math.max(1, aiEnemiesV95?.(c)?.length || 1);
      }
      return previousAiDamage(a,t,c);
    };
  }

  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.hit = {
      title:"Hit",
      text:"An attack hits only when the target loses HP after Armor and Shield are applied. Effects that say \"if hit\" do not trigger when the attack is fully blocked."
    };
    KEYWORDS_V32.bleed = {
      ...(KEYWORDS_V32.bleed || {title:"Bleed"}),
      text:"Bleed counters stay on the character until an attack hits them. After that HP loss, all Bleed counters resolve as direct HP loss and are removed."
    };
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    ["Hit","hit"].forEach(word=>{
      if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
    });
  }

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v159 retire stale mass-redirect taunt ===== */
(function retirePoomMassRedirectV159(){
  const poom = ROSTER.find(c => c.id === "poom");
  const guard = poom?.abilities?.find(a => a.id === "guard" || a.effect === "poomMassGuardMind");
  if(guard){
    Object.assign(guard, {
      id: "guard",
      name: "Guard Mind",
      cost: 1,
      spd: 99,
      effect: "protect",
      kind: "protect",
      guard: true,
      guardType: true,
      range: "ally",
      hypno: true,
      status: "hypnosis",
      stacks: 1,
      shield: 0,
      desc: "Guard. Choose an ally. Until the round ends, the first attack targeting that ally targets Poom instead. If redirected this way, the attacker gains Hypnosis."
    });
  }

  function clearLegacyPoomRedirectMarkerV159(u){
    if(!u?.buff) return;
    delete u.buff.poomRedirectTargetId;
    delete u.buff.poomRedirectTargetSide;
    delete u.buff.poomRedirectSource;
  }

  const applyBeforeV159 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    clearLegacyPoomRedirectMarkerV159(c);
    return applyBeforeV159 ? applyBeforeV159(c,a,t) : undefined;
  };

  const damageBeforeV159 = typeof damage === "function" ? damage : null;
  damage = function(src,t,amt,opt={}){
    clearLegacyPoomRedirectMarkerV159(src);
    return damageBeforeV159 ? damageBeforeV159(src,t,amt,opt) : undefined;
  };

  if(window.__WANDERERS_DEBUG__){
    window.__WANDERERS_DEBUG__.clearLegacyPoomRedirectMarkerV159 = clearLegacyPoomRedirectMarkerV159;
  }
})();

/* ===== v167 true-final Hyafrost adventure roster repair ===== */
(function repairHyafrostAdventureRosterV167(){
  const hy = ROSTER.find(c => c.id === "hyafrost");
  if(!hy || typeof A !== "function") return;
  hy.abilities = [
    Object.assign(A("blast","Ice Blast",1,0,"Sorcerer icecraft ranged attack. Deal 2 damage to one enemy, then apply 2 Freeze.","damageStatus",{dmg:2,status:"freeze",stacks:2,range:"ranged",iconKey:"icecraft"}), {
      advKey:"ice_blast",
      adventureCore:true,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["sorcerer","icecraft"]]}
    }),
    Object.assign(A("zero","Absolute Zero",2,-2,"Sorcerer icecraft payoff. Deal 3 damage to each enemy with Freeze, then apply Exhausted to each damaged enemy.","absoluteZero",{dmg:3,iconKey:"icecraft"}), {
      advKey:"absolute_zero",
      adventureCore:true,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["sorcerer","icecraft"]]}
    }),
    Object.assign(A("armor","Frost Armor",1,99,"Guard-speed icecraft support. Choose an ally. That ally gains Armor this turn; melee attackers gain Freeze.","frostArmorV122",{kind:"frostArmorV122",guard:true,guardType:true,range:"ally",iconKey:"icecraft"}), {
      advKey:"frost_armor",
      adventureCore:false,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["icecraft"]]}
    }),
    Object.assign(A("spirit","Spirit Form",1,99,"Guard. Hyafrost gains Shield and cancels the first attack targeting Hyafrost this round.","spirit",{guard:true,guardType:true,range:"self",iconKey:"spirit"}), {
      advKey:"spirit_form",
      adventureCore:false,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["spirit"]]}
    })
  ];
  if(window.__WANDERERS_DEBUG__?.rebuildAbilityPoolV162){
    window.__WANDERERS_DEBUG__.ADVENTURE_POOL_V162 = window.__WANDERERS_DEBUG__.rebuildAbilityPoolV162();
  }
  if(window.__WANDERERS_DEBUG__) window.__WANDERERS_DEBUG__.hyafrostAdventureRosterRepairV167 = true;
})();

/* ===== v166 absolute-final Hyafrost adventure roster repair ===== */
(function repairHyafrostAdventureRosterV166(){
  const hy = ROSTER.find(c => c.id === "hyafrost");
  if(!hy || typeof A !== "function") return;
  hy.abilities = [
    Object.assign(A("blast","Ice Blast",1,0,"Sorcerer icecraft ranged attack. Deal 2 damage to one enemy, then apply 2 Freeze.","damageStatus",{dmg:2,status:"freeze",stacks:2,range:"ranged",iconKey:"icecraft"}), {
      advKey:"ice_blast",
      adventureCore:true,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["sorcerer","icecraft"]]}
    }),
    Object.assign(A("zero","Absolute Zero",2,-2,"Sorcerer icecraft payoff. Deal 3 damage to each enemy with Freeze, then apply Exhausted to each damaged enemy.","absoluteZero",{dmg:3,iconKey:"icecraft"}), {
      advKey:"absolute_zero",
      adventureCore:true,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["sorcerer","icecraft"]]}
    }),
    Object.assign(A("armor","Frost Armor",1,99,"Guard-speed icecraft support. Choose an ally. That ally gains Armor this turn; melee attackers gain Freeze.","frostArmorV122",{kind:"frostArmorV122",guard:true,guardType:true,range:"ally",iconKey:"icecraft"}), {
      advKey:"frost_armor",
      adventureCore:false,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["icecraft"]]}
    }),
    Object.assign(A("spirit","Spirit Form",1,99,"Guard. Hyafrost gains Shield and cancels the first attack targeting Hyafrost this round.","spirit",{guard:true,guardType:true,range:"self",iconKey:"spirit"}), {
      advKey:"spirit_form",
      adventureCore:false,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["spirit"]]}
    })
  ];
  if(window.__WANDERERS_DEBUG__?.rebuildAbilityPoolV162){
    window.__WANDERERS_DEBUG__.ADVENTURE_POOL_V162 = window.__WANDERERS_DEBUG__.rebuildAbilityPoolV162();
  }
  if(window.__WANDERERS_DEBUG__) window.__WANDERERS_DEBUG__.hyafrostAdventureRosterRepairV166 = true;
})();

/* ===== v165 Adventure entry and final debug helpers ===== */
(function adventureEntryV165(){
  function bindAdventureEntryV165(){
    const btn = document.getElementById("adventureBtn");
    if(btn && !btn.dataset.v165Bound){
      btn.dataset.v165Bound = "1";
      btn.addEventListener("click", () => window.__WANDERERS_DEBUG__?.startAdventureDraftV162?.());
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", bindAdventureEntryV165);
  }else{
    bindAdventureEntryV165();
  }

  if(window.__WANDERERS_DEBUG__){
    Object.assign(window.__WANDERERS_DEBUG__, {
      adventureEntryV165: true,
      bindAdventureEntryV165
    });
  }
})();

/* ===== v163 final Adventure metadata pass after all roster patches ===== */
(function adventureFinalMetadataV163(){
  const char = id => ROSTER.find(c => c.id === id);
  const req = (...tags) => tags.map(x => String(x).toLowerCase());
  const anyReq = (...groups) => groups.map(g => Array.isArray(g) ? g.map(x => String(x).toLowerCase()) : req(g));
  const nameKey = name => String(name || "").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  const A2 = (id,name,cost,spd,desc,effect,extra={}) => Object.assign(A(id,name,cost,spd,desc,effect,extra), extra);

  function setAbilities(cid, abilities){
    const c = char(cid);
    if(c) c.abilities = abilities;
  }
  function meta(cid, aid, {core=false, groups=[], natural=false, ownerOnly=false, ownerId=null, advKey=null}={}){
    const c = char(cid);
    const a = c?.abilities?.find(x => x.id === aid || x.advKey === aid || x.name === aid);
    if(!a) return null;
    a.advKey = advKey || a.advKey || nameKey(a.name || a.id);
    a.adventureCore = !!core;
    a.learn = {
      natural: !!natural,
      ownerOnly: !!ownerOnly,
      ownerId: ownerId || (ownerOnly ? cid : null),
      groups: groups.map(g => g.map(x => String(x).toLowerCase()))
    };
    return a;
  }

  const smithen = char("smithen");
  if(smithen){
    setAbilities("smithen", [
      A2("shatter","Shatter Shot",2,0,"Assassin icecraft melee payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze.","shatter",{range:"melee",melee:true,backlineReach:true,pierce:2,iconKey:"icecraft"}),
      A2("pin","Frost Pin",1,1,"Icecraft assassin melee attack. Deal 4 damage and apply 2 Freeze. Can target backline.","damageStatus",{dmg:4,status:"freeze",stacks:2,range:"melee",melee:true,backlineReach:true,iconKey:"icecraft"}),
      A2("needle","Ice Needle",1,0,"Icecraft melee attack. Deal 4 damage and apply 1 Freeze.","damageStatus",{dmg:4,status:"freeze",stacks:1,range:"melee",melee:true,iconKey:"icecraft"}),
      A2("dodge","Dodge",1,99,"Guard. Cancel the first attack targeting this character this round.","dodge",{guard:true,guardType:true,iconKey:"assassin"})
    ]);
  }

  const bahl = char("shaman");
  if(bahl){
    bahl.name = "Bahl";
    bahl.class = "sorcerer";
    bahl.prof = "demon darkness bloodcraft";
    bahl.hp = 16;
    bahl.armor = 1;
    setAbilities("shaman", [
      A2("redEclipse","Red Eclipse",2,99,"Guard. This turn, before each enemy resolves an offensive ability, that enemy gains 4 Bleed and Dread.","redEclipseV162",{kind:"redEclipseV162",guard:true,guardType:true,bleed:4,range:"self",iconKey:"bloodcraft"}),
      A2("proliferation","Dark Proliferation",1,0,"Dark sorcery. Apply 2 Poison and 2 Bleed to one enemy.","multiStatus",{statuses:[["poison",2],["bleed",2]],range:"ranged",iconKey:"darkness"}),
      A2("rupture","Demon Rupture",2,-1,"Demon payoff. Remove all Poison and Bleed from one enemy. Deal damage equal to twice the removed counters.","demonRuptureV127",{kind:"demonRuptureV127",range:"ranged",iconKey:"demon"}),
      A2("mark","Infect Mark",1,0,"Sorcery setup. Apply 1 Poison and 1 Bleed to one enemy.","multiStatus",{statuses:[["poison",1],["bleed",1]],range:"ranged",iconKey:"bloodcraft"})
    ]);
  }

  const fuego = char("fuego");
  if(fuego){
    fuego.class = "sorcerer";
    fuego.prof = "dragon firecraft";
    fuego.hp = 18;
    fuego.armor = 1;
    const stoke = fuego.abilities.find(a => a.id === "stoke");
    if(stoke) Object.assign(stoke,{cost:2,stacks:3,desc:"Firecraft. Gain 3 Flame counters."});
    const nova = fuego.abilities.find(a => a.id === "nova");
    if(nova) Object.assign(nova,{multiplier:2,desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to twice the removed Flame counters to all enemies. Fuego gains Exhausted."});
  }

  const duler = char("duler");
  if(duler) duler.armor = 1;
  const poom = char("poom");
  if(poom){
    poom.prof = String(poom.prof || "").includes("fae") ? poom.prof : `${poom.prof} fae`;
    const revenge = poom.abilities.find(a => a.id === "revenge" || a.id === "bodyguard");
    if(revenge) Object.assign(revenge,{id:"revenge",name:"Revenge Body",self:0,dmg:5,bonusIfDamaged:7,desc:"Brute melee attack. Deal 5 damage. If Poom was dealt damage this turn, gain +7 damage."});
  }
  const paleya = char("paleya");
  if(paleya) paleya.prof = String(paleya.prof || "").includes("fae") ? paleya.prof : `${paleya.prof} fae`;

  meta("smithen","shatter",{core:true,groups:anyReq(req("icecraft","assassin"))});
  meta("smithen","pin",{core:true,groups:anyReq(req("icecraft","assassin"))});
  meta("smithen","needle",{groups:anyReq(req("icecraft","assassin"))});
  meta("smithen","dodge",{groups:anyReq(req("assassin")),advKey:"dodge"});

  meta("dravain","drain",{core:true,groups:anyReq(req("vampire","warrior"))});
  meta("dravain","claim",{core:true,groups:anyReq(req("vampire","warrior"))});
  meta("dravain","protect",{groups:anyReq(req("warrior"))});
  meta("dravain","grab",{groups:anyReq(req("vampire")),advKey:"vampiric_grab"});
  meta("yaura","infusion",{core:true,groups:anyReq(req("bloodcraft"))});
  meta("yaura","price",{core:true,groups:anyReq(req("bloodcraft","warrior"))});
  meta("yaura","rain",{groups:anyReq(req("bloodcraft")),advKey:"red_rain"});
  meta("yaura","ward",{groups:anyReq(req("bloodcraft"))});
  meta("kku","slam",{core:true,groups:anyReq(req("icecraft","brute"))});
  meta("kku","roar",{core:true,groups:anyReq(req("icecraft","brute"))});
  meta("kku","break",{groups:anyReq(req("icecraft","brute"))});
  meta("kku","guard",{groups:anyReq(req("icecraft"))});
  meta("kahro","needle",{core:true,groups:anyReq(req("darkness","assassin"))});
  meta("kahro","assassinate",{core:true,groups:anyReq(req("assassin"))});
  meta("kahro","vanish",{groups:anyReq(req("darkness"))});
  meta("kahro","mark",{groups:anyReq(req("darkness"))});
  meta("maoja","breath",{core:true,groups:anyReq(req("witchcraft","brute"))});
  meta("maoja","bash",{core:true,groups:anyReq(req("brute")),advKey:"bash"});
  meta("maoja","hands",{groups:anyReq(req("witchcraft"))});
  meta("maoja","burst",{groups:anyReq(req("witchcraft"))});
  meta("paleya","lance",{core:true,groups:anyReq(req("hypnotic","sorcerer"))});
  meta("paleya","mirror",{core:true,groups:anyReq(req("hypnotic")),advKey:"mirror_guard"});
  meta("paleya","mass",{groups:anyReq(req("hypnotic","sorcerer"))});
  meta("paleya","portal",{groups:anyReq(req("fae"))});
  meta("poom","roar",{core:true,groups:anyReq(req("brute","hypnotic"))});
  meta("poom","breaker",{core:true,groups:anyReq(req("brute","hypnotic"))});
  meta("poom","bash",{groups:anyReq(req("brute")),advKey:"bash"});
  meta("poom","revenge",{groups:anyReq(req("brute"))});
  meta("shaman","redEclipse",{core:true,groups:anyReq(req("sorcerer","darkness","bloodcraft"))});
  meta("shaman","rupture",{core:true,groups:anyReq(req("demon"))});
  meta("shaman","proliferation",{groups:anyReq(req("sorcerer"))});
  meta("shaman","mark",{groups:anyReq(req("sorcerer","bloodcraft"), req("sorcerer","witchcraft"))});
  meta("eva","stab",{core:true,groups:anyReq(req("vampire","assassin"))});
  meta("eva","grab",{core:true,groups:anyReq(req("vampire")),advKey:"vampiric_grab"});
  meta("eva","bite",{groups:anyReq(req("vampire","assassin"))});
  meta("eva","dodge",{groups:anyReq(req("assassin")),advKey:"dodge"});
  meta("hyafrost","blast",{core:true,groups:anyReq(req("sorcerer","icecraft"))});
  meta("hyafrost","zero",{core:true,groups:anyReq(req("sorcerer","icecraft"))});
  meta("hyafrost","armor",{groups:anyReq(req("icecraft"))});
  meta("hyafrost","spirit",{groups:anyReq(req("spirit"))});
  meta("bakub","fog",{core:true,groups:anyReq(req("demon","sorcerer"))});
  meta("bakub","toxin",{core:true,groups:anyReq(req("hypnotic","sorcerer"), req("witchcraft","sorcerer"))});
  meta("bakub","vial",{groups:anyReq(req("hypnotic","sorcerer"), req("darkness","sorcerer"))});
  meta("bakub","mirror",{groups:anyReq(req("hypnotic")),advKey:"mirror_guard"});
  meta("hope","mend",{core:true,groups:anyReq(req("divinity"))});
  meta("hope","judgement",{core:true,groups:anyReq(req("warrior","divinity"))});
  meta("hope","shield",{groups:anyReq(req("divinity")),advKey:"blessing_shield"});
  meta("hope","shieldBash",{groups:anyReq(req("warrior")),advKey:"shield_bash"});
  meta("zahria","rain",{core:true,groups:anyReq(req("bloodcraft")),advKey:"red_rain"});
  meta("zahria","mass",{core:true,groups:anyReq(req("sorcerer","bloodcraft"))});
  meta("zahria","mist",{groups:anyReq(req("bloodcraft","sorcerer"))});
  meta("zahria","blade",{groups:anyReq(req("bloodcraft","sorcerer"))});
  meta("fuego","scales",{core:true,groups:anyReq(req("dragon","firecraft"))});
  meta("fuego","flare",{core:true,groups:anyReq(req("firecraft","sorcerer"))});
  meta("fuego","nova",{groups:anyReq(req("firecraft","sorcerer"))});
  meta("fuego","stoke",{groups:anyReq(req("firecraft"))});
  meta("duler","chainSwipe",{core:true,ownerOnly:true,ownerId:"duler",groups:anyReq(req("darkness","brute"))});
  meta("duler","chainSlam",{core:true,ownerOnly:true,ownerId:"duler",groups:anyReq(req("darkness","brute"))});
  meta("duler","scare",{groups:anyReq(req("darkness"))});
  meta("duler","basicGuard",{natural:true,advKey:"basic_guard"});
  meta("pako","houseSpecial",{core:true,groups:anyReq(req("witchcraft","sorcerer"))});
  meta("pako","strengthPotion",{core:true,groups:anyReq(req("witchcraft"))});
  meta("pako","healthPotion",{groups:anyReq(req("witchcraft"))});
  meta("pako","armorPotion",{groups:anyReq(req("witchcraft"))});
  meta("ivory","boneWall",{core:true,groups:anyReq(req("sorcerer","darkness"))});
  meta("ivory","reaper",{core:true,groups:anyReq(req("sorcerer","darkness"))});
  meta("ivory","basicGuard",{natural:true,advKey:"basic_guard"});
  meta("ivory","mist",{groups:anyReq(req("darkness","sorcerer"))});
  meta("gondar","tree",{core:true,groups:anyReq(req("divinity","sorcerer"))});
  meta("gondar","blast",{core:true,groups:anyReq(req("divinity","sorcerer"))});
  meta("gondar","shield",{groups:anyReq(req("divinity")),advKey:"blessing_shield"});
  meta("gondar","mend",{groups:anyReq(req("divinity"))});

  if(window.__WANDERERS_DEBUG__?.rebuildAbilityPoolV162){
    window.__WANDERERS_DEBUG__.ADVENTURE_POOL_V162 = window.__WANDERERS_DEBUG__.rebuildAbilityPoolV162();
  }
  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    adventureMetadataFinalV163:true
  });
})();

/* ===== v162 Adventure mode, core ability metadata, and current-mode roster cleanup ===== */
(function adventureModeV162(){
  const VERSION = "v162";
  const W = window;
  const dbg = () => (W.__WANDERERS_DEBUG__ = Object.assign(W.__WANDERERS_DEBUG__ || {}, {}));
  const deep = obj => structuredClone(obj);
  const char = id => ROSTER.find(c => c.id === id);
  const ab = (cid, aid) => char(cid)?.abilities?.find(a => a.id === aid || a.advKey === aid || a.name === aid);
  const req = (...tags) => tags.map(x => String(x).toLowerCase());
  const anyReq = (...groups) => groups.map(g => Array.isArray(g) ? g.map(x => String(x).toLowerCase()) : req(g));
  const nameKey = name => String(name || "").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  const live = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const enemySide = side => side === "player" ? "enemy" : "player";

  function ensureProf(c, tag){
    if(!c) return;
    const tags = new Set(String(c.prof || "").split(/\s+/).filter(Boolean).map(x => x.toLowerCase()));
    tags.add(String(tag).toLowerCase());
    c.prof = [...tags].join(" ");
  }

  function replaceAbility(cid, oldId, next){
    const c = char(cid);
    if(!c) return null;
    const idx = c.abilities.findIndex(a => a.id === oldId || a.name === oldId);
    if(idx >= 0){
      c.abilities[idx] = Object.assign({}, c.abilities[idx], next);
      return c.abilities[idx];
    }
    c.abilities.push(next);
    return next;
  }

  function patchAbility(cid, aid, props){
    const a = ab(cid, aid);
    if(a) Object.assign(a, props);
    return a;
  }

  function meta(cid, aid, {core=false, groups=[], natural=false, ownerOnly=false, ownerId=null, advKey=null}={}){
    const a = ab(cid, aid);
    if(!a) return null;
    a.advKey = advKey || a.advKey || nameKey(a.name || a.id);
    a.adventureCore = !!core;
    a.learn = {
      natural: !!natural,
      ownerOnly: !!ownerOnly,
      ownerId: ownerId || (ownerOnly ? cid : null),
      groups: groups.map(g => g.map(x => String(x).toLowerCase()))
    };
    return a;
  }

  function normalizeCurrentRosterV162(){
    ensureProf(char("paleya"), "fae");
    ensureProf(char("poom"), "fae");
    const bahl = char("shaman");
    if(bahl){
      bahl.name = "Bahl";
      bahl.class = "sorcerer";
      bahl.prof = "demon darkness bloodcraft";
      bahl.hp = 16;
      bahl.armor = 1;
      bahl.passive = "Passive - Demon Infection: when Bahl applies Poison or Bleed with an ability, also apply 1 stack of the other status to each enemy in the front row.";
    }
    const fuego = char("fuego");
    if(fuego){
      fuego.class = "sorcerer";
      fuego.prof = "dragon firecraft";
      fuego.hp = 18;
      fuego.armor = 1;
    }
    const duler = char("duler");
    if(duler) duler.armor = 1;

    patchAbility("smithen","iceNeedle",{name:"Frost Pin",id:"pin",dmg:4,range:"melee",melee:true,desc:"Icecraft assassin melee attack. Deal 4 damage and apply 2 Freeze. Can target backline."});
    patchAbility("smithen","shatter",{name:"Shatter Shot",id:"shatter",range:"melee",melee:true,backlineReach:true,desc:"Assassin icecraft melee payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze."});
    replaceAbility("smithen","whiteout",A("dodge","Dodge",1,99,"Guard. Cancel the first attack targeting this character this round.","dodge",{guard:true,guardType:true,iconKey:"assassin"}));

    patchAbility("dravain","drain",{name:"Vampiric Thrust",range:"melee",melee:true});
    patchAbility("dravain","claim",{name:"Blood Claim",bonus:4,range:"melee",melee:true,desc:"Melee bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +4 damage. Dravain restores HP equal to the HP damage dealt."});
    replaceAbility("dravain","bash",A("grab","Vampiric Grab",1,0,"Vampire melee attack. Deal 2 damage with Pierce 2. If hit, the enemy gains 2 Bleed and Dravain heals 2. If the target used a Guard ability this round, this attack gains +2 damage.","vampiricGrabV127",{kind:"vampiricGrabV127",dmg:2,pierce:2,bleed:2,heal:2,guardBonus:2,range:"melee",melee:true,iconKey:"vampire"}));

    patchAbility("yaura","bolt",{name:"Blood Infusion",id:"infusion",guard:true,guardType:true,spd:99,effect:"bloodInfusionV125",kind:"bloodInfusionV125",range:"ally",desc:"Guard-speed bloodcraft buff. Choose an ally. That ally loses 2 HP and its next attack this round gains +4 damage and applies 2 Bleed."});
    patchAbility("yaura","price",{name:"Blood Price",dmg:6,self:2,desc:"Bloodcraft. Choose an ally. That ally loses 2 HP, then attack the enemy front row for 6 damage."});
    patchAbility("yaura","rain",{cost:1,desc:"Bloodcraft area status. Give all enemies 1 Bleed."});

    patchAbility("kku","slam",{dmg:5,desc:"Melee attack. Deal 5 damage to one enemy in the front row, then apply 1 Freeze."});
    patchAbility("kku","break",{desc:"Melee icecraft payoff. Deal 5 damage plus the target's Freeze counters. If the target is Frozen or has Freeze, gain +5 damage."});
    patchAbility("kku","guard",{shield:0,armor:2,desc:"Guard. K'ku gains 2 Armor for this turn. Whenever an enemy melee-attacks K'ku this turn, that attacker gains 1 Freeze."});
    patchAbility("kahro","needle",{pierce:2,range:"melee",melee:true,backlineReach:true,iconKey:"assassin",desc:"Assassin melee attack. Can target backline. Deal damage with Pierce 2."});

    patchAbility("maoja","hands",{guard:true,guardType:true,spd:99,desc:"Guard buff. Choose an ally. Until end of round, that ally's melee attacks apply 2 Poison."});
    patchAbility("maoja","breath",{range:"front",frontRowOnly:true,desc:"Witchcraft front-row attack. Deal 1 damage and apply 3 Poison to each enemy in the current front row."});
    replaceAbility("maoja","grip",A("bash","Bash",1,0,"Brute melee attack. Deal 6 damage to one enemy in the front row.","damage",{dmg:6,range:"melee",melee:true,iconKey:"brute"}));

    patchAbility("paleya","stare",{name:"Mind Lance",id:"lance",effect:"damageStatus",kind:"damageStatus",dmg:2,status:"hypnosis",stacks:1,range:"melee",melee:true,backlineReach:true,desc:"Hypnotic melee attack. Can target backline. Deal 2 damage and apply Hypnosis."});
    patchAbility("paleya","predict",{name:"Mirror Guard",id:"mirror",effect:"mirrorHypnoticGuard",kind:"mirrorHypnoticGuard",guard:true,guardType:true,range:"ranged",desc:"Guard. Choose an enemy with Hypnosis. Consume Hypnosis to apply Exposed and cancel that enemy's next action this turn."});
    patchAbility("paleya","fog",{name:"Mass Suggestion",id:"mass",desc:"Hypnotic sorcery. Apply Hypnosis to each enemy in a row."});
    patchAbility("paleya","break",{name:"Fae Portal Grab",id:"portal",range:"melee",melee:true,backlineReach:true,effect:"faePortalGrabV127",kind:"faePortalGrabV127",dmg:3,guardBonus:3,desc:"Fae melee attack. Can target backline. Deal 3 damage; gain +3 damage if the target used a Guard ability this round."});

    replaceAbility("poom","guard",A("breaker","Mind Breaker",2,2,"Hypnotic brute melee attack. Deal 5 damage. If the target has Hypnosis, consume it and gain +8 damage.","poomMindBreakerV162",{kind:"poomMindBreakerV162",dmg:5,hypnoBonus:8,range:"melee",melee:true,iconKey:"hypnotic"}));
    patchAbility("poom","roar",{cost:1,spd:99,guard:true,guardType:true,effect:"poomMesmerRoarV162",kind:"poomMesmerRoarV162",desc:"Guard. For each enemy with Hypnosis, consume Hypnosis. That enemy's offensive abilities target Poom this turn, and Poom gains +1 Armor this round for each enemy affected."});
    patchAbility("poom","revenge",{self:0,dmg:5,bonusIfDamaged:7,desc:"Brute melee attack. Deal 5 damage. If Poom was dealt damage this turn, gain +7 damage."});

    if(bahl){
      bahl.abilities = [
        A("redEclipse","Red Eclipse",2,99,"Guard. This turn, before each enemy resolves an offensive ability, that enemy gains 4 Bleed and Dread.","redEclipseV162",{kind:"redEclipseV162",guard:true,guardType:true,bleed:4,range:"self",iconKey:"bloodcraft"}),
        A("proliferation","Dark Proliferation",1,0,"Dark sorcery. Apply 2 Poison and 2 Bleed to one enemy.","multiStatus",{statuses:[["poison",2],["bleed",2]],range:"ranged",iconKey:"darkness"}),
        A("rupture","Demon Rupture",2,-1,"Demon payoff. Remove all Poison and Bleed from one enemy. Deal damage equal to twice the removed counters.","demonRuptureV127",{kind:"demonRuptureV127",range:"ranged",iconKey:"demon"}),
        A("mark","Infect Mark",1,0,"Sorcery setup. Apply 1 Poison and 1 Bleed to one enemy.","multiStatus",{statuses:[["poison",1],["bleed",1]],range:"ranged",iconKey:"bloodcraft"})
      ];
    }

    patchAbility("eva","fangs",{name:"Crimson Stab",id:"stab",effect:"crimsonStabV127",kind:"crimsonStabV127",dmg:1,pierce:2,bleed:3,range:"melee",melee:true,desc:"Melee precision attack. Deal 1 damage with Pierce 2. If hit, the target gains 3 Bleed."});
    replaceAbility("eva","dash",A("grab","Vampiric Grab",1,0,"Vampire melee attack. Deal 2 damage with Pierce 2. If hit, the enemy gains 2 Bleed and Lady Eva heals 2. If the target used a Guard ability this round, this attack gains +2 damage.","vampiricGrabV127",{kind:"vampiricGrabV127",dmg:2,pierce:2,bleed:2,heal:2,guardBonus:2,range:"melee",melee:true,iconKey:"vampire"}));
    patchAbility("eva","bite",{name:"Final Bite",range:"melee",melee:true,backlineReach:true,desc:"Assassin/vampire melee payoff. Can target backline. Remove all Bleed. Deal Bleed x2 +1 damage. If any Bleed was removed, Lady Eva restores 2 HP."});
    replaceAbility("eva","bat",A("dodge","Dodge",1,99,"Guard. Cancel the first attack targeting this character this round.","dodge",{guard:true,guardType:true,iconKey:"assassin"}));

    patchAbility("hyafrost","field",{name:"Frost Armor",id:"armor",guard:true,guardType:true,spd:99,effect:"frostArmorV122",kind:"frostArmorV122",desc:"Guard. Gain Armor this turn; melee attackers gain Freeze."});
    patchAbility("bakub","vial",{desc:"Nightmare status. Apply Hypnosis and Dread to one enemy.",statuses:[["hypnosis",1],["dread",1]],range:"ranged"});
    replaceAbility("bakub","future",A("mirror","Mirror Guard",1,99,"Guard. Choose an enemy with Hypnosis. Consume Hypnosis to apply Exposed and cancel that enemy's next action this turn.","mirrorHypnoticGuard",{kind:"mirrorHypnoticGuard",guard:true,guardType:true,range:"ranged",iconKey:"hypnotic"}));

    replaceAbility("hope","strike",A("shieldBash","Shield Bash",1,0,"Warrior melee attack. Deal 1 damage plus this character's current Armor.","shieldBashV162",{kind:"shieldBashV162",range:"melee",melee:true,iconKey:"warrior"}));
    patchAbility("hope","judgement",{desc:"Delayed warrior/divinity attack. Choose an enemy. At the start of next round, deal 6 damage."});
    patchAbility("zahria","mass",{spd:4,desc:"Bloodcraft payoff. Each enemy with Bleed loses HP equal to its Bleed, then removes that Bleed. Zahria heals for the total HP lost this way."});
    if(fuego){
      patchAbility("fuego","stoke",{cost:2,stacks:3,desc:"Firecraft. Gain 3 Flame counters."});
      patchAbility("fuego","nova",{desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to twice the removed Flame counters to all enemies. Fuego gains Exhausted.",multiplier:2});
    }
    patchAbility("ivory","block",{id:"basicGuard",name:"Basic Guard",effect:"dulerBasicGuard",kind:"dulerBasicGuard",guard:true,guardType:true,armor:4,desc:"Guard. Gain +4 Armor against the next attack this turn.",iconKey:"brute"});
  }

  const STANDALONE_ABILITIES_V162 = [
    Object.assign(A("plague","Plague Wave",2,-2,"Witchcraft sorcery. Choose an enemy row. Deal 1 damage and apply 2 Poison.","rowDamageStatus",{dmg:1,status:"poison",stacks:2,range:"ranged",iconKey:"witchcraft"}), {
      advKey:"plague_wave", learn:{natural:false, ownerOnly:false, groups:anyReq(req("witchcraft","sorcerer"))}
    })
  ];

  function installMetadataV162(){
    meta("smithen","shatter",{core:true,groups:anyReq(req("icecraft","assassin"))});
    meta("smithen","pin",{core:true,groups:anyReq(req("icecraft","assassin"))});
    meta("smithen","dodge",{groups:anyReq(req("assassin")),advKey:"dodge"});
    meta("dravain","drain",{core:true,groups:anyReq(req("vampire","warrior"))});
    meta("dravain","claim",{core:true,groups:anyReq(req("vampire","warrior"))});
    meta("dravain","protect",{groups:anyReq(req("warrior"))});
    meta("dravain","grab",{groups:anyReq(req("vampire")),advKey:"vampiric_grab"});
    meta("yaura","infusion",{core:true,groups:anyReq(req("bloodcraft"))});
    meta("yaura","price",{core:true,groups:anyReq(req("bloodcraft","warrior"))});
    meta("yaura","rain",{groups:anyReq(req("bloodcraft")),advKey:"red_rain"});
    meta("yaura","ward",{groups:anyReq(req("bloodcraft"))});
    meta("kku","slam",{core:true,groups:anyReq(req("icecraft","brute"))});
    meta("kku","roar",{core:true,groups:anyReq(req("icecraft","brute"))});
    meta("kku","break",{groups:anyReq(req("icecraft","brute"))});
    meta("kku","guard",{groups:anyReq(req("icecraft"))});
    meta("kahro","needle",{core:true,groups:anyReq(req("darkness","assassin"))});
    meta("kahro","assassinate",{core:true,groups:anyReq(req("assassin"))});
    meta("kahro","vanish",{groups:anyReq(req("darkness"))});
    meta("kahro","mark",{groups:anyReq(req("darkness"))});
    meta("maoja","breath",{core:true,groups:anyReq(req("witchcraft","brute"))});
    meta("maoja","bash",{core:true,groups:anyReq(req("brute")),advKey:"bash"});
    meta("maoja","hands",{groups:anyReq(req("witchcraft"))});
    meta("maoja","burst",{groups:anyReq(req("witchcraft"))});
    meta("paleya","lance",{core:true,groups:anyReq(req("hypnotic","sorcerer"))});
    meta("paleya","mirror",{core:true,groups:anyReq(req("hypnotic")),advKey:"mirror_guard"});
    meta("paleya","mass",{groups:anyReq(req("hypnotic","sorcerer"))});
    meta("paleya","portal",{groups:anyReq(req("fae"))});
    meta("poom","roar",{core:true,groups:anyReq(req("brute","hypnotic"))});
    meta("poom","breaker",{core:true,groups:anyReq(req("brute","hypnotic"))});
    meta("poom","bash",{groups:anyReq(req("brute")),advKey:"bash"});
    meta("poom","revenge",{groups:anyReq(req("brute"))});
    meta("shaman","redEclipse",{core:true,groups:anyReq(req("sorcerer","darkness","bloodcraft"))});
    meta("shaman","rupture",{core:true,groups:anyReq(req("demon"))});
    meta("shaman","proliferation",{groups:anyReq(req("sorcerer"))});
    meta("shaman","mark",{groups:anyReq(req("sorcerer","bloodcraft"), req("sorcerer","witchcraft"))});
    meta("eva","stab",{core:true,groups:anyReq(req("vampire","assassin"))});
    meta("eva","grab",{core:true,groups:anyReq(req("vampire")),advKey:"vampiric_grab"});
    meta("eva","bite",{groups:anyReq(req("vampire","assassin"))});
    meta("eva","dodge",{groups:anyReq(req("assassin")),advKey:"dodge"});
    meta("hyafrost","blast",{core:true,groups:anyReq(req("sorcerer","icecraft"))});
    meta("hyafrost","zero",{core:true,groups:anyReq(req("sorcerer","icecraft"))});
    meta("hyafrost","armor",{groups:anyReq(req("icecraft"))});
    meta("hyafrost","spirit",{groups:anyReq(req("spirit"))});
    meta("bakub","fog",{core:true,groups:anyReq(req("demon","sorcerer"))});
    meta("bakub","toxin",{core:true,groups:anyReq(req("hypnotic","sorcerer"), req("witchcraft","sorcerer"))});
    meta("bakub","vial",{groups:anyReq(req("hypnotic","sorcerer"), req("darkness","sorcerer"))});
    meta("bakub","mirror",{groups:anyReq(req("hypnotic")),advKey:"mirror_guard"});
    meta("hope","mend",{core:true,groups:anyReq(req("divinity"))});
    meta("hope","judgement",{core:true,groups:anyReq(req("warrior","divinity"))});
    meta("hope","shield",{groups:anyReq(req("divinity")),advKey:"blessing_shield"});
    meta("hope","shieldBash",{groups:anyReq(req("warrior")),advKey:"shield_bash"});
    meta("zahria","rain",{core:true,groups:anyReq(req("bloodcraft")),advKey:"red_rain"});
    meta("zahria","mass",{core:true,groups:anyReq(req("sorcerer","bloodcraft"))});
    meta("zahria","mist",{groups:anyReq(req("bloodcraft","sorcerer"))});
    meta("zahria","blade",{groups:anyReq(req("bloodcraft","sorcerer"))});
    meta("fuego","scales",{core:true,groups:anyReq(req("dragon","firecraft"))});
    meta("fuego","flare",{core:true,groups:anyReq(req("firecraft","sorcerer"))});
    meta("fuego","nova",{groups:anyReq(req("firecraft","sorcerer"))});
    meta("fuego","stoke",{groups:anyReq(req("firecraft"))});
    meta("duler","chainSwipe",{core:true,ownerOnly:true,ownerId:"duler",groups:anyReq(req("darkness","brute"))});
    meta("duler","chainSlam",{core:true,ownerOnly:true,ownerId:"duler",groups:anyReq(req("darkness","brute"))});
    meta("duler","scare",{groups:anyReq(req("darkness"))});
    meta("duler","basicGuard",{natural:true,advKey:"basic_guard"});
    meta("pako","houseSpecial",{core:true,groups:anyReq(req("witchcraft","sorcerer"))});
    meta("pako","strengthPotion",{core:true,groups:anyReq(req("witchcraft"))});
    meta("pako","healthPotion",{groups:anyReq(req("witchcraft"))});
    meta("pako","armorPotion",{groups:anyReq(req("witchcraft"))});
    meta("ivory","boneWall",{core:true,groups:anyReq(req("sorcerer","darkness"))});
    meta("ivory","reaper",{core:true,groups:anyReq(req("sorcerer","darkness"))});
    meta("ivory","basicGuard",{natural:true,advKey:"basic_guard"});
    meta("ivory","mist",{groups:anyReq(req("darkness","sorcerer"))});
    meta("gondar","tree",{core:true,groups:anyReq(req("divinity","sorcerer"))});
    meta("gondar","blast",{core:true,groups:anyReq(req("divinity","sorcerer"))});
    meta("gondar","shield",{groups:anyReq(req("divinity")),advKey:"blessing_shield"});
    meta("gondar","mend",{groups:anyReq(req("divinity"))});
  }

  let ADVENTURE_POOL_V162 = [];
  function rebuildAbilityPoolV162(){
    const byKey = new Map();
    for(const c of ROSTER){
      if(!isPlayableCharV162(c)) continue;
      for(const a of c.abilities || []){
        if(!a.learn) continue;
        const key = a.advKey || nameKey(a.name || a.id);
        if(!byKey.has(key)) byKey.set(key, deep(Object.assign({sourceCharId:c.id}, a, {advKey:key})));
      }
    }
    for(const a of STANDALONE_ABILITIES_V162){
      byKey.set(a.advKey, deep(a));
    }
    ADVENTURE_POOL_V162 = [...byKey.values()];
    return ADVENTURE_POOL_V162;
  }

  function isPlayableCharV162(c){
    return !!(c && !c.token && !/boss|cub|guardian|tree|wall|skeleton/i.test(c.id || "") && c.id !== "boss");
  }

  function tagsForCharV162(c){
    const out = new Set();
    if(c?.class) out.add(String(c.class).toLowerCase());
    for(const p of String(c?.prof || "").split(/\s+/).filter(Boolean)) out.add(p.toLowerCase());
    return out;
  }

  function abilityLegalForV162(charDef, ability){
    if(!charDef || !ability) return false;
    const learn = ability.learn || {};
    if(learn.natural) return true;
    if(learn.ownerOnly && learn.ownerId !== charDef.id) return false;
    const tags = tagsForCharV162(charDef);
    return (learn.groups || []).some(group => group.every(tag => tags.has(tag)));
  }

  function coreKeysForCharV162(charId){
    const c = char(charId);
    let keys = (c?.abilities || []).filter(a => a.adventureCore).map(a => a.advKey || nameKey(a.name || a.id));
    if(keys.length < 2) keys = (c?.abilities || []).slice(0,2).map(a => a.advKey || nameKey(a.name || a.id));
    return keys.slice(0,2);
  }

  function abilityFromKeyV162(key){
    return deep(ADVENTURE_POOL_V162.find(a => a.advKey === key) || null);
  }

  function abilityKeysForMemberV162(member){
    return [...new Set(member?.abilities || coreKeysForCharV162(member?.charId))];
  }

  function legalOffersForMemberV162(member, count=3){
    const c = char(member.charId);
    const known = new Set(abilityKeysForMemberV162(member));
    const pool = ADVENTURE_POOL_V162.filter(a => abilityLegalForV162(c,a) && !known.has(a.advKey));
    return shuffleV162(pool).slice(0,count).map(a => a.advKey);
  }

  function shuffleV162(list){
    return [...list].sort(() => Math.random() - 0.5);
  }

  const adventureRunV162 = {
    active:false,
    battle:1,
    team:[],
    draftPicks:[],
    miniBoss:null,
    finalBoss:null,
    pending:null
  };

  function ensureAdventureDomV162(){
    if($("adventureStepV162")) return $("adventureStepV162");
    const section = document.createElement("section");
    section.id = "adventureStepV162";
    section.className = "hidden adventureStepV162";
    section.innerHTML = `
      <div class="adventureHeroV162">
        <div><div class="eyebrow">Adventure</div><h2 id="advTitleV162">Draft your party</h2></div>
        <div id="advProgressV162" class="advProgressV162"></div>
      </div>
      <div id="advBodyV162" class="advBodyV162"></div>`;
    $("builder")?.appendChild(section);

    const modeRow = document.querySelector(".modeButtons");
    if(modeRow && !$("adventureMode")){
      const btn = document.createElement("button");
      btn.id = "adventureMode";
      btn.type = "button";
      btn.className = "pill";
      btn.textContent = "Adventure";
      modeRow.appendChild(btn);
      btn.onclick = () => startAdventureDraftV162();
    }
    return section;
  }

  function setAdventureScreenV162(on){
    ensureAdventureDomV162();
    $("chooseStep")?.classList.toggle("hidden", on || builderStep !== "choose");
    $("arrangeStep")?.classList.toggle("hidden", on || builderStep !== "arrange");
    $("adventureStepV162")?.classList.toggle("hidden", !on);
    $("backBtn")?.classList.toggle("hidden", on || builderStep !== "arrange");
  }

  function playableIdsV162(exclude=[]){
    const blocked = new Set(exclude);
    return ROSTER.filter(isPlayableCharV162).map(c => c.id).filter(id => !blocked.has(id));
  }

  function startAdventureDraftV162(){
    adventureRunV162.active = true;
    adventureRunV162.battle = 1;
    adventureRunV162.team = [];
    adventureRunV162.draftPicks = [];
    adventureRunV162.miniBoss = Math.random() < 0.5 ? "mountain_guardians" : "geshar";
    adventureRunV162.finalBoss = Math.random() < 0.5 ? "ivory_fairy" : "world_toad";
    mode = "adventure";
    builderStep = "adventure";
    chosenIds = [];
    selectedTeam = [];
    renderAdventureDraftV162();
  }

  function renderAdventureDraftV162(){
    setAdventureScreenV162(true);
    $("builderTitle").textContent = "Adventure";
    $("nextBtn").disabled = true;
    $("advTitleV162").textContent = `Choose hero ${adventureRunV162.team.length + 1} of 3`;
    $("advProgressV162").textContent = `Mini-boss: ${bossLabelV162(adventureRunV162.miniBoss)} | Final boss: ${bossLabelV162(adventureRunV162.finalBoss)}`;
    const picks = shuffleV162(playableIdsV162(adventureRunV162.team.map(m => m.charId))).slice(0,3);
    $("advBodyV162").innerHTML = `
      <div class="advCardGridV162">${picks.map(id => renderAdventureCharCardV162(id, "Choose")).join("")}</div>
      <div class="advMiniNoteV162">Drafted heroes start with only their two core abilities. More abilities are earned after battles.</div>`;
    document.querySelectorAll("[data-adv-pick-char]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.advPickChar;
        adventureRunV162.team.push({charId:id, abilities:coreKeysForCharV162(id)});
        if(adventureRunV162.team.length < 3) renderAdventureDraftV162();
        else enterAdventureArrangeV162();
      };
    });
  }

  function renderAdventureCharCardV162(id, label){
    const c = char(id);
    const core = coreKeysForCharV162(id).map(k => abilityFromKeyV162(k)?.name).filter(Boolean).join(" / ");
    return `<button class="advCharCardV162" data-adv-pick-char="${id}">
      <div class="advPortraitV162" style="background:${c.art}"></div>
      <b>${c.name}</b><span>${c.class} / ${c.prof}</span><small>Core: ${core}</small><em>${label}</em>
    </button>`;
  }

  function enterAdventureArrangeV162(){
    mode = "adventure";
    builderStep = "arrange";
    chosenIds = adventureRunV162.team.map(m => m.charId);
    const defaults = [["front",0],["front",2],["back",1]];
    selectedTeam = chosenIds.map((id,i) => selectedTeam.find(s => s.id === id) || {id,row:defaults[i][0],col:defaults[i][1]});
    $("builder")?.classList.remove("hidden");
    $("battle")?.classList.add("hidden");
    renderBuilder();
  }

  function bossLabelV162(id){
    return ({mountain_guardians:"Mountain Guardians", geshar:"Geshar", ivory_fairy:"The Ivory Fairy", world_toad:"World Toad"})[id] || id;
  }

  const renderBuilderBeforeV162 = typeof renderBuilder === "function" ? renderBuilder : null;
  renderBuilder = function(){
    ensureAdventureDomV162();
    if(builderStep === "adventure"){
      setAdventureScreenV162(true);
      return;
    }
    setAdventureScreenV162(false);
    const result = renderBuilderBeforeV162 ? renderBuilderBeforeV162() : undefined;
    ensureAdventureDomV162();
    const advBtn = $("adventureMode");
    if(advBtn) advBtn.classList.toggle("active", mode === "adventure");
    if($("squadMode")) $("squadMode").classList.toggle("active", mode === "squad");
    if($("bossMode")) $("bossMode").classList.toggle("active", mode === "boss");
    if(mode === "adventure" && builderStep === "arrange"){
      $("builderTitle").textContent = `Adventure ${adventureRunV162.battle}/10`;
      $("nextBtn").textContent = "Start Encounter";
      const bench = document.querySelector(".bench .panelTitle");
      if(bench) bench.textContent = "Adventure Party";
      const bossSelector = $("bossSelectorV43");
      if(bossSelector) bossSelector.classList.add("hidden");
      if($("adventureMode")) $("adventureMode").classList.add("active");
    }
    return result;
  };

  function makeAdventureUnitV162(member, side, row, col){
    const u = cloneChar(member.charId, side, row, col);
    u.abilities = abilityKeysForMemberV162(member).map(abilityFromKeyV162).filter(Boolean);
    u.adventureMemberId = member.charId;
    return u;
  }

  function restrictUnitAbilitiesV162(u, count){
    const c = char(u.id);
    if(!c) return u;
    const keys = coreKeysForCharV162(c.id);
    const extras = (c.abilities || [])
      .map(a => a.advKey)
      .filter(k => k && !keys.includes(k));
    const use = count >= 4 ? [...keys, ...extras].slice(0,4) : [...keys, ...extras].slice(0,count);
    u.abilities = use.map(abilityFromKeyV162).filter(Boolean);
    return u;
  }

  function adventureEnemiesV162(){
    const battle = adventureRunV162.battle;
    if(battle === 5){
      selectedBossId = adventureRunV162.miniBoss;
      if(selectedBossId === "mountain_guardians" && typeof mountainGuardiansV141 === "function") return mountainGuardiansV141();
      if(selectedBossId === "geshar" && typeof bossCloneV43 === "function") return [bossCloneV43()];
    }
    if(battle === 10){
      selectedBossId = adventureRunV162.finalBoss;
      return [bossCloneV43()];
    }
    const preset = shuffleV162(ENEMY_PRESETS)[0] || ENEMY_PRESETS[0];
    const pos = [["front",0],["front",2],["back",1]];
    const count = battle <= 4 ? 2 : (battle <= 7 ? 3 : 4);
    return preset.map((id,i) => restrictUnitAbilitiesV162(cloneChar(id,"enemy",pos[i][0],pos[i][1]), count));
  }

  const startBattleBeforeV162 = typeof startBattle === "function" ? startBattle : null;
  startBattle = function(){
    if(mode !== "adventure") return startBattleBeforeV162 ? startBattleBeforeV162() : undefined;
    if(!adventureRunV162.active) startAdventureDraftV162();
    const members = new Map(adventureRunV162.team.map(m => [m.charId,m]));
    const player = selectedTeam.map(s => makeAdventureUnitV162(members.get(s.id), "player", s.row, s.col));
    const enemies = adventureEnemiesV162();
    initBattleStateV46(player, enemies, `Adventure encounter ${adventureRunV162.battle}/10 started.`);
    state.adventureV162 = {battle:adventureRunV162.battle};
    renderBattle();
  };

  function showAdventureRewardV162(kind, data={}){
    $("battle")?.classList.add("hidden");
    $("builder")?.classList.remove("hidden");
    builderStep = "adventure";
    setAdventureScreenV162(true);
    $("builderTitle").textContent = "Adventure Reward";
    $("nextBtn").disabled = true;
    $("advProgressV162").textContent = `Encounter ${adventureRunV162.battle} cleared`;
    if(kind === "complete"){
      $("advTitleV162").textContent = "Adventure complete";
      $("advBodyV162").innerHTML = `<div class="advRewardPanelV162"><h3>Victory Run</h3><p>Your party defeated the final boss.</p><button id="advNewRunV162" class="primary">Start New Adventure</button></div>`;
      $("advNewRunV162").onclick = startAdventureDraftV162;
      return;
    }
    if(kind === "defeat"){
      $("advTitleV162").textContent = "Adventure ended";
      $("advBodyV162").innerHTML = `<div class="advRewardPanelV162"><h3>Defeat</h3><p>The run is over, but the next draft is waiting.</p><button id="advNewRunV162" class="primary">Start New Adventure</button></div>`;
      $("advNewRunV162").onclick = startAdventureDraftV162;
      return;
    }
    if(kind === "swap"){
      renderAdventureSwapV162();
      return;
    }
    renderAdventureAbilityRewardV162(data.memberIndex);
  }

  function memberWithFewestAbilitiesV162(){
    let best = 0;
    adventureRunV162.team.forEach((m,i) => {
      if(abilityKeysForMemberV162(m).length < abilityKeysForMemberV162(adventureRunV162.team[best]).length) best = i;
    });
    return best;
  }

  function renderAdventureAbilityRewardV162(memberIndex=memberWithFewestAbilitiesV162()){
    const member = adventureRunV162.team[memberIndex];
    const c = char(member.charId);
    const offers = legalOffersForMemberV162(member,3);
    $("advTitleV162").textContent = `${c.name} learns a move`;
    if(!offers.length){
      $("advBodyV162").innerHTML = `<div class="advRewardPanelV162"><p>No legal new abilities found for ${c.name}.</p><button id="advContinueV162" class="primary">Continue</button></div>`;
      $("advContinueV162").onclick = finishAdventureRewardV162;
      return;
    }
    $("advBodyV162").innerHTML = `
      <div class="advAbilityGridV162">${offers.map(k => renderAbilityOfferV162(k, "Learn")).join("")}</div>
      <button id="advSkipRewardV162" class="pill">Skip</button>`;
    document.querySelectorAll("[data-adv-learn]").forEach(btn => {
      btn.onclick = () => chooseAdventureAbilityV162(memberIndex, btn.dataset.advLearn);
    });
    $("advSkipRewardV162").onclick = finishAdventureRewardV162;
  }

  function renderAbilityOfferV162(key, action){
    const a = abilityFromKeyV162(key);
    return `<button class="advAbilityCardV162" data-adv-learn="${key}">
      <b>${a.name}</b><span>${a.cost} AP / ${a.guard ? "Guard" : `Speed ${a.spd >= 0 ? "+" : ""}${a.spd}`}</span>
      <p>${renderKeywordText ? renderKeywordText(a.desc || "") : (a.desc || "")}</p><em>${action}</em>
    </button>`;
  }

  function chooseAdventureAbilityV162(memberIndex,key){
    const member = adventureRunV162.team[memberIndex];
    member.abilities = abilityKeysForMemberV162(member);
    if(member.abilities.length < 4){
      member.abilities.push(key);
      finishAdventureRewardV162();
      return;
    }
    $("advTitleV162").textContent = "Replace an ability?";
    $("advBodyV162").innerHTML = `
      <div class="advRewardPanelV162"><h3>${abilityFromKeyV162(key).name}</h3><p>Choose a current ability to replace, or skip.</p></div>
      <div class="advAbilityGridV162">${member.abilities.map(old => {
        const a = abilityFromKeyV162(old);
        return `<button class="advAbilityCardV162" data-adv-replace="${old}"><b>${a.name}</b><p>${a.desc || ""}</p><em>Replace</em></button>`;
      }).join("")}</div>
      <button id="advSkipReplaceV162" class="pill">Skip</button>`;
    document.querySelectorAll("[data-adv-replace]").forEach(btn => {
      btn.onclick = () => {
        const idx = member.abilities.indexOf(btn.dataset.advReplace);
        if(idx >= 0) member.abilities[idx] = key;
        finishAdventureRewardV162();
      };
    });
    $("advSkipReplaceV162").onclick = finishAdventureRewardV162;
  }

  function renderAdventureSwapV162(){
    $("advTitleV162").textContent = "Mini-boss reward";
    $("advBodyV162").innerHTML = `
      <div class="advRewardPanelV162"><p>Swap one hero, or keep your team.</p></div>
      <div class="advCardGridV162">${adventureRunV162.team.map((m,i) => renderAdventureCharCardStaticV162(m.charId, `Swap ${char(m.charId).name}`, `data-adv-swap-member="${i}"`)).join("")}</div>
      <button id="advKeepTeamV162" class="primary">Keep Team</button>`;
    $("advKeepTeamV162").onclick = finishAdventureRewardV162;
    document.querySelectorAll("[data-adv-swap-member]").forEach(btn => {
      btn.onclick = () => renderAdventureReplacementDraftV162(Number(btn.dataset.advSwapMember));
    });
  }

  function renderAdventureCharCardStaticV162(id,label,attr){
    const c = char(id);
    return `<button class="advCharCardV162" ${attr}><div class="advPortraitV162" style="background:${c.art}"></div><b>${c.name}</b><span>${c.class} / ${c.prof}</span><em>${label}</em></button>`;
  }

  function renderAdventureReplacementDraftV162(memberIndex){
    const old = adventureRunV162.team[memberIndex];
    const current = adventureRunV162.team.map(m => m.charId);
    const picks = shuffleV162(playableIdsV162(current)).slice(0,3);
    $("advTitleV162").textContent = "Choose replacement";
    $("advBodyV162").innerHTML = `<div class="advCardGridV162">${picks.map(id => renderAdventureCharCardStaticV162(id, "Recruit", `data-adv-replacement="${id}"`)).join("")}</div>`;
    document.querySelectorAll("[data-adv-replacement]").forEach(btn => {
      btn.onclick = () => {
        const targetCount = abilityKeysForMemberV162(old).length;
        adventureRunV162.team[memberIndex] = {charId:btn.dataset.advReplacement, abilities:coreKeysForCharV162(btn.dataset.advReplacement)};
        fillReplacementAbilitiesV162(memberIndex, targetCount);
      };
    });
  }

  function fillReplacementAbilitiesV162(memberIndex,targetCount){
    const member = adventureRunV162.team[memberIndex];
    if(abilityKeysForMemberV162(member).length >= targetCount){
      finishAdventureRewardV162();
      return;
    }
    renderAdventureAbilityRewardV162(memberIndex);
  }

  function finishAdventureRewardV162(){
    adventureRunV162.battle += 1;
    enterAdventureArrangeV162();
  }

  const checkWinBeforeV162 = typeof checkWin === "function" ? checkWin : null;
  checkWin = function(){
    if(mode !== "adventure" || !adventureRunV162.active) return checkWinBeforeV162 ? checkWinBeforeV162() : false;
    const p = live("player").length;
    const e = live("enemy").length;
    if(p && e) return false;
    if(!p){
      setTimeout(() => showAdventureRewardV162("defeat"), 250);
      return true;
    }
    if(adventureRunV162.battle >= 10){
      setTimeout(() => showAdventureRewardV162("complete"), 250);
      return true;
    }
    if(adventureRunV162.battle === 5) setTimeout(() => showAdventureRewardV162("swap"), 250);
    else setTimeout(() => showAdventureRewardV162("ability"), 250);
    return true;
  };

  const nextButtonCaptureV162 = ev => {
    if(!ev.target?.closest?.("#nextBtn")) return;
    if(mode !== "adventure" || builderStep !== "arrange") return;
    if(selectedTeam.length !== 3) return;
    ev.preventDefault?.();
    ev.stopPropagation?.();
    ev.stopImmediatePropagation?.();
    startBattle();
  };
  if(!W.__adventureStartCaptureV162){
    W.__adventureStartCaptureV162 = true;
    document.addEventListener("pointerdown", nextButtonCaptureV162, {capture:true, passive:false});
    document.addEventListener("click", nextButtonCaptureV162, true);
  }

  const applyBeforeV162 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV162?.(c,a,t);
    const k = a.kind || a.effect || a.id;
    if(state?.redEclipseV162?.[c.side] && isOffensiveAbilityV162(a)){
      addStatus(c,"bleed",4);
      addStatus(c,"dread",1);
      c.status.dreadExpiresRoundV162 = state.round;
      log(`${c.name} is marked by Red Eclipse before acting.`);
    }
    if(c.buff?.poomMesmerRedirectV162 && isOffensiveAbilityV162(a)){
      const poom = unitBySide(c.buff.poomMesmerRedirectV162.targetId, c.buff.poomMesmerRedirectV162.targetSide);
      if(poom && !poom.dead && (!t || t.side !== c.side)){
        t = poom;
        log(`${c.name}'s ${a.name} is redirected to Poom by Mesmer Roar.`);
      }
    }
    switch(k){
      case "redEclipseV162":
        state.redEclipseV162 = state.redEclipseV162 || {};
        state.redEclipseV162[enemySide(c.side)] = state.round;
        state.guarded = state.guarded || {};
        state.guarded[c.id] = true;
        log(`${c.name} casts Red Eclipse.`);
        return;
      case "poomMesmerRoarV162": {
        const enemies = live(enemySide(c.side)).filter(u => u.status?.hypnosis);
        for(const enemy of enemies){
          enemy.status.hypnosis = 0;
          enemy.buff = enemy.buff || {};
          enemy.buff.poomMesmerRedirectV162 = {targetId:c.id,targetSide:c.side,round:state.round};
        }
        c.armor = (c.armor || 0) + enemies.length;
        state.guarded = state.guarded || {};
        state.guarded[c.id] = true;
        log(`${c.name}'s Mesmer Roar redirects ${enemies.length} enemies.`);
        return;
      }
      case "poomMindBreakerV162": {
        let dmg = a.dmg || 5;
        if(t?.status?.hypnosis){ t.status.hypnosis = 0; dmg += a.hypnoBonus || 8; }
        damage(c,t,dmg,{attack:true,melee:true});
        return;
      }
      case "shieldBashV162":
        damage(c,t,1 + Math.max(0, c.armor || 0), {attack:true,melee:true});
        return;
    }
    return applyBeforeV162 ? applyBeforeV162(c,a,t) : undefined;
  };

  function isOffensiveAbilityV162(a){
    const text = `${a?.effect || ""} ${a?.kind || ""} ${a?.desc || ""}`.toLowerCase();
    if(a?.guard || /guard|heal|shield|potion|summon|status\.|apply hypnosis|apply exposed/.test(text)) return false;
    return /attack|damage|dmg|slash|bite|stab|blast|slam|strike|rupture|drain|claim|breath|swipe/.test(text) || Number(a?.dmg || 0) > 0;
  }

  const endRoundBeforeV162 = typeof endRound === "function" ? endRound : null;
  endRound = function(){
    if(state?.units){
      for(const u of state.units){
        if(u?.buff?.poomMesmerRedirectV162 && u.buff.poomMesmerRedirectV162.round <= state.round) delete u.buff.poomMesmerRedirectV162;
        if(u?.status?.dreadExpiresRoundV162 === state.round){
          u.status.dread = 0;
          delete u.status.dreadExpiresRoundV162;
        }
      }
      if(state.redEclipseV162) state.redEclipseV162 = {};
    }
    return endRoundBeforeV162 ? endRoundBeforeV162() : undefined;
  };

  normalizeCurrentRosterV162();
  installMetadataV162();
  rebuildAbilityPoolV162();
  ensureAdventureDomV162();

  Object.assign(dbg(), {
    VERSION_V162: VERSION,
    adventureRunV162,
    ADVENTURE_POOL_V162,
    rebuildAbilityPoolV162,
    abilityLegalForV162,
    coreKeysForCharV162,
    startAdventureDraftV162,
    enterAdventureArrangeV162,
    legalOffersForMemberV162,
    makeAdventureUnitV162,
    adventureEnemiesV162,
    isOffensiveAbilityV162
  });

  if($("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
})();

/* ===== v137 final Dread text override ===== */
{
  const DREAD_INFO_V137 = {
    icon:"😨",
    title:"Dread",
    text:"Next turn, this character can spend at most 2 total AP on abilities. Abilities costing 3 AP are disabled."
  };
  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = DREAD_INFO_V137;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = DREAD_INFO_V137;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = DREAD_INFO_V137;
  const showStatusInfoBeforeV137 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV137){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${DREAD_INFO_V137.icon} ${DREAD_INFO_V137.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${DREAD_INFO_V137.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV137(key);
    };
  }
}

/* ===== v138 final Dread AP budget override ===== */
{
  function dreadUnitKeyV138(u){
    return u ? `${u.side || ""}:${u.id || ""}` : "";
  }

  function dreadActiveV138(u){
    return !!(u && !u.dead && (u.status?.dread || 0) > 0);
  }

  function abilityCostForPlanV138(planObj){
    const actor = (state?.units || []).find(u => u && u.id === planObj?.unitId && (!planObj?.unitSide || u.side === planObj.unitSide));
    return actor?.abilities?.find(a => a.id === planObj?.abilityId)?.cost || 0;
  }

  function plannedApForUnitV138(u){
    const key = dreadUnitKeyV138(u);
    return (state?.plans || []).reduce((sum, planObj) => {
      const planKey = `${planObj.unitSide || planObj.side || ""}:${planObj.unitId || ""}`;
      return planKey === key ? sum + abilityCostForPlanV138(planObj) : sum;
    }, 0);
  }

  function dreadBlocksAbilityV138(u,a){
    if(!dreadActiveV138(u) || !a) return false;
    const cost = a.cost || 0;
    if((state?.phase || "planning") !== "planning") return cost > 2;
    return plannedApForUnitV138(u) + cost > 2;
  }

  const isAbilityDisabledByDreadBeforeV138 = typeof isAbilityDisabledByDreadV42 === "function" ? isAbilityDisabledByDreadV42 : null;
  isAbilityDisabledByDreadV42 = function(unitObj, ability){
    if(dreadActiveV138(unitObj)) return dreadBlocksAbilityV138(unitObj, ability);
    return isAbilityDisabledByDreadBeforeV138 ? isAbilityDisabledByDreadBeforeV138(unitObj, ability) : false;
  };

  const planBeforeV138 = typeof plan === "function" ? plan : null;
  if(planBeforeV138){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      if(c && a && state?.phase === "planning" && dreadBlocksAbilityV138(c,a)){
        spawnFloatingText?.(c, `Dread: ${plannedApForUnitV138(c)}/2 AP`, "cancel");
        showKeywordPopup?.("dread");
        log(`${c.name} cannot queue ${a.name}; Dread allows only 2 total AP next turn.`);
        renderBattle();
        return;
      }
      return planBeforeV138(target);
    };
  }

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    dreadPlannedApV136: plannedApForUnitV138,
    dreadBlocksAbilityV136: dreadBlocksAbilityV138
  });
}

/* ===== v140 true-tail delayed-action safety net ===== */
{
  function resolveAnyDelayedJudgementsV140(){
    if(!state) return 0;
    let resolved = 0;
    for(const key of ["delayedActionsV130","delayedActionsV129","delayedActionsV128","delayedActionsV96"]){
      const list = Array.isArray(state[key]) ? state[key] : [];
      if(!list.length) continue;
      const pending = [];
      for(const item of list){
        if(!item) continue;
        const dueRound = Number(item.dueRound || item.round || 0);
        if(dueRound > (state.round || 1)){
          pending.push(item);
          continue;
        }
        const source = unitBySide?.(item.sourceId,item.sourceSide) || unit?.(item.sourceId);
        const target = unitBySide?.(item.targetId,item.targetSide) || unit?.(item.targetId);
        if(!source || !target || source.dead || target.dead) continue;
        if(target.status) delete target.status.delayedJudgement;
        state.currentActionKey = `delayed:v140:${item.sourceSide || source.side}:${item.sourceId}:${item.targetSide || target.side}:${item.targetId}:${state.round}`;
        damage(source,target,item.dmg || 6,{attack:true,ranged:true,melee:false});
        pushActionEvent?.("hit", `${item.abilityName || "Delayed Judgement"} struck ${target.name}`, target);
        log(`${item.abilityName || "Delayed Judgement"} struck ${target.name}.`);
        state.currentActionKey = null;
        resolved += 1;
      }
      state[key] = pending;
    }
    return resolved;
  }

  const applyBeforeV140 = typeof apply === "function" ? apply : null;
  if(applyBeforeV140){
    apply = function(c,a,t){
      const k = a?.kind || a?.effect;
      if(c?.id === "hope" && a?.id === "judgement" && !/^hopeDelayedJudgementV/.test(k || "")){
        state.delayedActionsV130 = Array.isArray(state.delayedActionsV130) ? state.delayedActionsV130 : [];
        state.delayedActionsV130.push({
          sourceId:c.id,
          sourceSide:c.side,
          targetId:t?.id,
          targetSide:t?.side,
          dueRound:(state.round || 1) + 1,
          dmg:a.dmg || 6,
          abilityName:a.name || "Delayed Judgement"
        });
        if(t?.status) t.status.delayedJudgement = 1;
        log(`${c.name} prepared ${a.name || "Delayed Judgement"} against ${t?.name || "the target"}.`);
        return;
      }
      return applyBeforeV140(c,a,t);
    };
  }

  const endRoundBeforeV140 = typeof endRound === "function" ? endRound : null;
  if(endRoundBeforeV140){
    endRound = function(){
      const result = endRoundBeforeV140();
      const resolved = resolveAnyDelayedJudgementsV140();
      if(resolved && typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
      return result;
    };
  }

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    resolveAnyDelayedJudgementsV140
  });
}

/* ===== v139 potions, summon tokens, Exhaust AP tax, and empty-slot targeting ===== */
{
  const V139_EMPTY_TARGET = {id:"__empty_slot_v139", emptySlot:true};
  const v139Char = id => ROSTER.find(c => c.id === id);
  const v139Ability = (cid,aid) => v139Char(cid)?.abilities?.find(a => a.id === aid);
  const v139Kind = a => a?.kind || a?.effect || a?.id || "";
  const v139Key = u => u ? `${u.side || ""}:${u.id || ""}` : "";
  const v139Live = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const v139Enemy = side => side === "player" ? "enemy" : "player";
  const v139Unit = (id, side) => (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  const v139SlotTaken = (side,row,col) => (state?.units || []).some(u => u && !u.dead && u.side === side && (u.size === "rowBoss" ? u.row === row : (u.row === row && u.col === col)));
  const v139RowEmpty = (side,row) => !v139Live(side).some(u => u.row === row || u.size === "rowBoss" || u.size === "boss");
  const v139FirstEmptySlot = side => {
    for(const row of ["front","back"]) for(let col=0; col<3; col++) if(!v139SlotTaken(side,row,col)) return {side,row,col};
    return null;
  };
  const v139FirstEmptyRow = side => ["front","back"].find(row => v139RowEmpty(side,row)) || null;

  ART.pako = "url('assets/pako.png')";
  ART.ivory = "url('assets/ivory.png')";
  ART.gondar = "url('assets/gondar.png')";
  ART.skeleton = "url('assets/skeleton.png')";
  ART.bone_wall = "url('assets/bone_wall.png')";
  ART.sun_tree = "url('assets/sun_tree.png')";

  if(!v139Char("pako")){
    ROSTER.push({
      id:"pako", name:"Pako", class:"sorcerer", prof:"witchcraft goblin", hp:18, armor:1, speed:4, art:ART.pako,
      passive:"Passive - Potion Dealer: Pako can give potions to enemies as well as allies.",
      abilities:[
        A("healthPotion","Health Potion",1,0,"Witchcraft potion. Give any character a Health Potion. Health Potion triggers when hit: consume 1 to heal 3 HP.","givePotion",{kind:"givePotion",potion:"healthPotion",range:"any",iconKey:"witchcraft"}),
        A("strengthPotion","Strength Potion",1,0,"Witchcraft potion. Give any character a Strength Potion. Strength Potion triggers when attacking: consume 1, lose 2 HP, and that attack gains +3 damage.","givePotion",{kind:"givePotion",potion:"strengthPotion",range:"any",iconKey:"witchcraft"}),
        A("armorPotion","Armor Potion",1,0,"Witchcraft potion. Give any character an Armor Potion. Armor Potion triggers when attacked: consume 1 to gain +2 Armor for that attack.","givePotion",{kind:"givePotion",potion:"armorPotion",range:"any",iconKey:"witchcraft"}),
        A("houseSpecial","House Special",1,0,"Witchcraft potion. Give any character House Special. At the start of next round, consume 1, lose 5 HP, the next attack gains +5 damage, and gain 1 Armor this round.","givePotion",{kind:"givePotion",potion:"houseSpecial",range:"any",iconKey:"witchcraft"})
      ]
    });
  }

  if(!v139Char("ivory")){
    ROSTER.push({
      id:"ivory", name:"Ivory", class:"sorcerer", prof:"darkness", hp:19, armor:1, speed:4, art:ART.ivory,
      passive:"Passive - Bone Host: each time an allied character dies, summon a Skeleton token in its place.",
      abilities:[
        A("boneWall","Bone Wall",2,-1,"Darkness summon. Choose an empty row. Summon a Bone Wall token there. Bone Wall has 8 HP, 0 Armor, is immune to statuses, and occupies the full row.","summonBoneWall",{kind:"summonBoneWall",range:"emptyRow",iconKey:"darkness"}),
        A("reaper","Reaper Scythe",2,-1,"Darkness melee area attack. Attack all enemies in the current front row for 3 damage. Enemies with 5 or less HP before damage are defeated instantly.","reaperScythe",{kind:"reaperScythe",range:"front",dmg:3,melee:true,iconKey:"darkness"}),
        A("block","Block",1,99,"Guard. Ivory gains 3 Armor against the next attack on her this turn.","ivoryBlock",{kind:"ivoryBlock",guard:true,guardType:true,armor:3,iconKey:"darkness"}),
        A("mist","Mist",2,99,"Guard. This turn, all melee attacks from both sides have an 80% chance to be negated.","battleMist",{kind:"battleMist",guard:true,guardType:true,iconKey:"darkness"})
      ]
    });
  }

  if(!v139Char("gondar")){
    ROSTER.push({
      id:"gondar", name:"Gondar", class:"sorcerer", prof:"divinity gnome", hp:18, armor:1, speed:4, art:ART.gondar,
      passive:"Passive - Sunroot Return: when Gondar dies, if you control a Sun Tree, replace that tree with Gondar. He returns with HP equal to the tree's growth.",
      abilities:[
        A("shield","Blessing Shield",1,99,"Guard buff. Choose an ally. That ally gains 4 Shield.","grantShield",{kind:"hopeShield",guard:true,guardType:true,range:"ally",shield:4,iconKey:"divinity"}),
        A("mend","Mend Wounds",1,0,"Divinity heal. Restore 4 HP to one ally.","healAlly",{kind:"hopeHeal",range:"ally",heal:4,iconKey:"divinity"}),
        A("tree","Grow a Sun Tree",1,0,"Divinity summon. Choose an empty allied tile to create a Sun Tree with growth 1. If you already control a Sun Tree, raise its growth by 1 instead.","growSunTree",{kind:"growSunTree",range:"emptyAlly",iconKey:"divinity"}),
        A("blast","Sun Blast",2,-1,"Divinity area attack. Deal damage to all enemies equal to your Sun Tree's growth level. Deal 0 if you control no Sun Tree.","sunBlast",{kind:"sunBlast",dmg:0,range:"ranged",iconKey:"divinity"})
      ]
    });
  }

  function makeTokenV139(type, side, row, col, extra={}){
    const tokenId = `${type}_${side}_${Date.now().toString(36)}_${Math.floor(Math.random()*100000)}`;
    const base = {
      skeleton:{name:"Skeleton", class:"brute", prof:"darkness token", hp:3, armor:1, speed:2, art:ART.skeleton, abilities:[A("strike","Skeleton Strike",1,0,"Token melee attack. Deal 4 damage to one enemy in the front row.","damage",{dmg:4,range:"melee"})]},
      bone_wall:{name:"Bone Wall", class:"brute", prof:"darkness token", hp:8, armor:0, speed:0, art:ART.bone_wall, size:"rowBoss", footprint:{rows:1,cols:3}, statusImmune:true, abilities:[]},
      sun_tree:{name:"Sun Tree", class:"sorcerer", prof:"divinity token", hp:4, armor:0, speed:0, art:ART.sun_tree, abilities:[]}
    }[type];
    return structuredClone({
      ...base,
      ...extra,
      id:tokenId,
      token:true,
      tokenType:type,
      side,row,col,
      maxHp:extra.maxHp || base.hp,
      shield:0,
      status:{},
      buff:{},
      planned:null,
      dead:false
    });
  }

  function findSunTreeV139(side){
    return v139Live(side).find(u => u.tokenType === "sun_tree");
  }

  function summonSkeletonV139(deadAlly){
    if(!deadAlly || deadAlly.token || deadAlly.__skeletonSummonedV139 || deadAlly.size === "boss" || deadAlly.size === "rowBoss") return;
    const ivory = v139Live(deadAlly.side).find(u => u.id === "ivory" && !u.dead);
    if(!ivory) return;
    deadAlly.__skeletonSummonedV139 = true;
    if(v139SlotTaken(deadAlly.side, deadAlly.row, deadAlly.col)) return;
    const skel = makeTokenV139("skeleton", deadAlly.side, deadAlly.row, deadAlly.col);
    state.units.push(skel);
    spawnFloatingText?.(ivory, "Skeleton rises", "status");
    log(`${ivory.name}'s Bone Host summons a Skeleton where ${deadAlly.name} fell.`);
  }

  function reviveGondarFromTreeV139(gondar){
    if(!gondar || gondar.id !== "gondar" || gondar.__sunRevivedV139) return false;
    const tree = findSunTreeV139(gondar.side);
    if(!tree) return false;
    const hp = Math.max(1, Number(tree.growth || tree.status?.growth || 1));
    tree.dead = true;
    gondar.dead = false;
    gondar.hp = Math.min(gondar.maxHp || 18, hp);
    gondar.row = tree.row;
    gondar.col = tree.col;
    gondar.status = gondar.status || {};
    gondar.__sunRevivedV139 = true;
    spawnFloatingText?.(gondar, "Sunroot Return", "heal");
    log(`${gondar.name} returns from the Sun Tree with ${gondar.hp} HP.`);
    return true;
  }

  function handleDeathsV139(){
    if(!state?.units) return;
    for(const u of [...state.units]){
      if(!u || !u.dead || u.__deathHandledV139) continue;
      if(u.id === "gondar" && reviveGondarFromTreeV139(u)) continue;
      u.__deathHandledV139 = true;
      summonSkeletonV139(u);
    }
  }

  const STATUS_INFO_V139 = {
    healthPotion:{icon:"+", title:"Health Potion", text:"Potion. Stackable. When this character is hit, consume 1 Health Potion to heal 3 HP."},
    strengthPotion:{icon:"^", title:"Strength Potion", text:"Potion. Stackable. When this character performs an attack, consume 1 Strength Potion, lose 2 HP, and that attack gains +3 damage."},
    armorPotion:{icon:"A", title:"Armor Potion", text:"Potion. Stackable. When this character is attacked, consume 1 Armor Potion to gain +2 Armor for that attack."},
    houseSpecial:{icon:"!", title:"House Special", text:"Potion. Stackable. At the start of next round, consume 1, lose 5 HP, gain +5 damage on the next attack, and gain 1 Armor this round."},
    growth:{icon:"*", title:"Growth", text:"Sun Tree growth. At the start of the round, the Sun Tree heals allies in its row by its growth level."},
    mist:{icon:"~", title:"Mist", text:"This turn, every melee attack from either side has an 80% chance to be negated."},
    exhausted:{icon:"Z", title:"Exhausted", text:"Non-stackable. The next ability this character queues costs 1 extra AP, then Exhausted is removed."},
    dread:{icon:"😟", title:"Dread", text:"Next turn, this character can spend at most 2 total AP on abilities. Abilities costing 3 AP are disabled."}
  };
  if(typeof STATUS_LABELS_V17 !== "undefined") Object.assign(STATUS_LABELS_V17, STATUS_INFO_V139);
  if(typeof KEYWORDS_V32 !== "undefined") Object.assign(KEYWORDS_V32, STATUS_INFO_V139, {
    potion:{title:"Potion", text:"A stackable status type. Potions trigger from their listed condition, then consume one stack."},
    token:{title:"Token", text:"A summoned unit that is not part of the playable character roster."},
    summon:{title:"Summon", text:"Create a token on the board."},
    exhausted: STATUS_INFO_V139.exhausted,
    dread: STATUS_INFO_V139.dread
  });
  if(window.KEYWORDS_V32_SAFE) Object.assign(window.KEYWORDS_V32_SAFE, typeof KEYWORDS_V32 !== "undefined" ? KEYWORDS_V32 : STATUS_INFO_V139);
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Potion","potion","Token","token","Summon","summon","Health Potion","Strength Potion","Armor Potion","House Special","Growth","growth","Exhausted","exhausted","Dread","dread"]){
      if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
    }
  }

  const iconBeforeV139 = typeof icon === "function" ? icon : null;
  icon = function(s){
    if(s === "healthPotion") return "+";
    if(s === "strengthPotion") return "^";
    if(s === "armorPotion") return "A";
    if(s === "houseSpecial") return "!";
    if(s === "growth") return "*";
    if(s === "mist") return "~";
    if(s === "dread") return "😟";
    if(s === "exhausted") return "Z";
    return iconBeforeV139 ? iconBeforeV139(s) : "";
  };

  const abilityIconKeyBeforeV139 = typeof abilityIconKey === "function" ? abilityIconKey : null;
  abilityIconKey = function(caster, ability){
    if(ability?.iconKey) return ability.iconKey;
    const text = `${ability?.name || ""} ${ability?.desc || ""} ${ability?.kind || ""} ${ability?.effect || ""}`.toLowerCase();
    if(/sun|mend|blessing|divinity/.test(text)) return "divinity";
    if(/bone|skeleton|reaper|mist|darkness/.test(text)) return "darkness";
    if(/potion|witchcraft/.test(text)) return "witchcraft";
    return abilityIconKeyBeforeV139 ? abilityIconKeyBeforeV139(caster, ability) : caster?.class || "warrior";
  };

  const showStatusInfoBeforeV139 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV139){
    showStatusInfo = function(key){
      const normalized = key === "poisonHandsBuff" ? "poisonHands" : key;
      const info = STATUS_INFO_V139[normalized];
      if(info){
        $("infoTitle").textContent = `${info.icon || ""} ${info.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${renderKeywordText ? renderKeywordText(info.text) : info.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV139(normalized);
    };
  }

  function abilityBaseCostV139(a){ return Number(a?.cost || 0); }
  function abilityPlanningCostV139(u,a){
    return abilityBaseCostV139(a) + (u?.status?.exhausted ? 1 : 0);
  }
  function consumeExhaustCostV139(u,a,planObj){
    if(!u?.status?.exhausted || !a) return abilityBaseCostV139(a);
    u.status.exhausted = 0;
    if(planObj) planObj.exhaustTaxV139 = 1;
    log(`${u.name}'s Exhausted made ${a.name} cost +1 AP and was removed.`);
    return abilityBaseCostV139(a) + 1;
  }

  const totalSpeedBeforeV139 = typeof totalSpeed === "function" ? totalSpeed : null;
  totalSpeed = function(u,a){
    if(!u || !a) return totalSpeedBeforeV139 ? totalSpeedBeforeV139(u,a) : 0;
    if(isGuardSpeedAbilityV122?.(a) || a.guard) return 999;
    return (Number(u.speed) || 0) + (Number(a.spd) || 0);
  };

  speedBreakdownV122 = function(u,a){
    if(!u || !a) return {label:"Speed ?", detail:"Speed could not be calculated."};
    if(isGuardSpeedAbilityV122?.(a) || a.guard) return {
      label:"Guard Speed",
      detail:`Guard Speed: resolves before normal speed actions. Base Speed ${u.speed} is ignored for guard-speed abilities.`
    };
    const base = Number(u.speed) || 0;
    const mod = Number(a.spd) || 0;
    const total = totalSpeed(u,a);
    const parts = [`base ${base}`, `ability ${mod >= 0 ? "+" : ""}${mod}`];
    return {label:`Speed ${total}`, detail:`Speed: ${parts.join(" ")} = ${total}`};
  };

  function plannedApForUnitV139(u){
    const key = v139Key(u);
    return (state?.plans || []).reduce((sum,p) => {
      const planKey = `${p.unitSide || p.side || ""}:${p.unitId || ""}`;
      if(planKey !== key) return sum;
      const actor = v139Unit(p.unitId,p.unitSide || p.side);
      const ability = actor?.abilities?.find(a => a.id === p.abilityId);
      return sum + (p.effectiveCostV139 || abilityBaseCostV139(ability));
    }, 0);
  }

  const dreadBeforeV139 = typeof isAbilityDisabledByDreadV42 === "function" ? isAbilityDisabledByDreadV42 : null;
  isAbilityDisabledByDreadV42 = function(u,a){
    if(u?.status?.dread){
      const cost = abilityPlanningCostV139(u,a);
      if((state?.phase || "planning") === "planning") return plannedApForUnitV139(u) + cost > 2;
      return cost > 2;
    }
    return dreadBeforeV139 ? dreadBeforeV139(u,a) : false;
  };

  function makeSlotPlanV139(c,a,slot,target=null){
    const p = makePlan(c,a,target,"player");
    p.slotSide = slot?.side || c.side;
    p.slotRow = slot?.row || null;
    p.slotCol = Number.isFinite(slot?.col) ? slot.col : null;
    p.targetRow = slot?.row || null;
    return p;
  }

  function commitPlanWithCostV139(c,a,p){
    const effCost = abilityPlanningCostV139(c,a);
    if(!c || !a || state.actionsLeft < effCost) return false;
    state.actionsLeft -= effCost;
    p.effectiveCostV139 = effCost;
    consumeExhaustCostV139(c,a,p);
    state.plans = Array.isArray(state.plans) ? state.plans : [];
    state.plans.push(p);
    selectedId = null;
    selectedSide = null;
    pendingAbility = null;
    renderBattle();
    return true;
  }

  const planBeforeV139 = typeof plan === "function" ? plan : null;
  if(planBeforeV139){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      if(c && a && state?.phase === "planning"){
        const k = v139Kind(a);
        const effCost = abilityPlanningCostV139(c,a);
        if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(c,a)){
          showKeywordPopup?.("dread");
          log(`${c.name} cannot queue ${a.name}; Dread allows only 2 total AP.`);
          renderBattle();
          return;
        }
        if(state.actionsLeft < effCost){
          show?.(`${a.name} needs ${effCost} AP.`);
          return;
        }
        if(k === "growSunTree" && findSunTreeV139(c.side)){
          const p = makePlan(c,a,null,"player");
          p.growExistingTreeV139 = true;
          log(`${c.name} queued ${a.name}.`);
          return commitPlanWithCostV139(c,a,p);
        }
      }

      const beforePlans = (state?.plans || []).slice();
      const beforeActor = c;
      const beforeAbility = a;
      const hadExhaust = !!beforeActor?.status?.exhausted;
      const beforeActions = state?.actionsLeft;
      const result = planBeforeV139(target);
      if(beforeActor && beforeAbility && state && beforePlans.length < (state.plans || []).length){
        const added = state.plans[state.plans.length - 1];
        if(added && added.unitId === beforeActor.id && added.abilityId === beforeAbility.id){
          const base = abilityBaseCostV139(beforeAbility);
          const eff = base + (hadExhaust ? 1 : 0);
          added.effectiveCostV139 = eff;
          if(hadExhaust){
            if((state.actionsLeft || 0) < 1){
              state.plans.pop();
              state.actionsLeft = beforeActions;
              beforeActor.status.exhausted = 1;
              show?.(`${beforeAbility.name} needs ${eff} AP.`);
              renderBattle();
              return;
            }
            state.actionsLeft -= 1;
            beforeActor.status.exhausted = 0;
            added.exhaustTaxV139 = 1;
            log(`${beforeActor.name}'s Exhausted made ${beforeAbility.name} cost +1 AP and was removed.`);
            renderBattle();
          }
        }
      }
      return result;
    };
  }

  const unplanBeforeV139 = typeof unplan === "function" ? unplan : null;
  if(unplanBeforeV139){
    unplan = function(planId){
      const p = (state?.plans || []).find(x => x.pid === planId && x.side === "player");
      const actor = p ? v139Unit(p.unitId, p.unitSide || p.side) : null;
      const ability = actor?.abilities?.find(a => a.id === p?.abilityId);
      const delta = Math.max(0, Number(p?.effectiveCostV139 || abilityBaseCostV139(ability)) - abilityBaseCostV139(ability));
      const result = unplanBeforeV139(planId);
      if(delta && state) state.actionsLeft += delta;
      return result;
    };
  }

  const chooseEnemyBeforeV139 = typeof chooseEnemy === "function" ? chooseEnemy : null;
  if(chooseEnemyBeforeV139){
    chooseEnemy = function(){
      const exhaustedBefore = new Set(v139Live("enemy").filter(u => u.status?.exhausted).map(v139Key));
      const result = chooseEnemyBeforeV139();
      let spent = 0;
      const enemyPlans = (state?.plans || []).filter(p => p.side === "enemy");
      for(const p of enemyPlans){
        const actor = v139Unit(p.unitId,p.unitSide || p.side);
        const ability = actor?.abilities?.find(a => a.id === p.abilityId);
        const hadExhaust = exhaustedBefore.has(v139Key(actor));
        p.effectiveCostV139 = abilityBaseCostV139(ability) + (hadExhaust ? 1 : 0);
        spent += p.effectiveCostV139;
        if(hadExhaust && actor?.status) actor.status.exhausted = 0;
      }
      while(spent > 3 && enemyPlans.length){
        const removed = enemyPlans.pop();
        spent -= removed.effectiveCostV139 || 0;
        state.plans = state.plans.filter(p => p !== removed);
      }
      return result;
    };
  }

  const targetsBeforeV139 = typeof targets === "function" ? targets : null;
  targets = function(c,a){
    if(!c || !a) return [];
    const k = v139Kind(a);
    if(k === "givePotion") return v139Live("player").concat(v139Live("enemy"));
    if(k === "summonBoneWall") return [V139_EMPTY_TARGET];
    if(k === "growSunTree"){
      if(findSunTreeV139(c.side)) return [];
      return [V139_EMPTY_TARGET];
    }
    if(k === "sunBlast") return [];
    if(k === "reaperScythe") return v139Live(v139Enemy(c.side)).filter(u => u.row === (frontRow?.(v139Enemy(c.side)) || "front") || u.size === "boss");
    return targetsBeforeV139 ? targetsBeforeV139(c,a) : [];
  };

  const aiTargetsBeforeV139 = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
  if(aiTargetsBeforeV139){
    aiValidTargetsV95 = function(c,a){
      const k = v139Kind(a);
      if(k === "givePotion"){
        const potion = a.potion;
        if(potion === "strengthPotion" || potion === "armorPotion" || potion === "healthPotion") return v139Live(c.side);
        return v139Live(v139Enemy(c.side));
      }
      if(k === "summonBoneWall" || k === "growSunTree" || k === "sunBlast") return [];
      return aiTargetsBeforeV139(c,a);
    };
  }

  const addStatusBeforeV139 = typeof addStatus === "function" ? addStatus : null;
  addStatus = function(t,s,n=1){
    if(t?.statusImmune) return;
    if(s === "exhausted"){
      if(!t || t.dead) return;
      t.status = t.status || {};
      t.status.exhausted = 1;
      return;
    }
    return addStatusBeforeV139 ? addStatusBeforeV139(t,s,n) : undefined;
  };

  const applyStatusFromBeforeV139 = typeof applyStatusFrom === "function" ? applyStatusFrom : null;
  if(applyStatusFromBeforeV139){
    applyStatusFrom = function(source,target,status,stacks=1){
      if(target?.statusImmune) return;
      return applyStatusFromBeforeV139(source,target,status,stacks);
    };
  }

  function damageWithPotionAndMistV139(src,t,amt,opt,oldDamage){
    if(!src || !t || src.dead || t.dead) return oldDamage(src,t,amt,opt);
    const attack = !!opt?.attack;
    const melee = !!opt?.melee;
    let finalAmt = amt;

    if(attack && melee && state?.battleMistV139 === state.round && Math.random() < 0.8){
      spawnFloatingText?.(t,"Mist", "cancel");
      log(`Mist negates ${src.name}'s melee attack.`);
      return 0;
    }

    let tempArmor = 0;
    if(attack && (t.status?.armorPotion || 0) > 0){
      t.status.armorPotion -= 1;
      tempArmor = 2;
      t.armor = (t.armor || 0) + tempArmor;
      spawnFloatingText?.(t,"Armor Potion", "shield");
      log(`${t.name}'s Armor Potion triggers: +2 Armor for this attack.`);
    }

    if(attack && (src.status?.strengthPotion || 0) > 0){
      src.status.strengthPotion -= 1;
      finalAmt += 3;
      loseHpDirect?.(src,2,"Strength Potion");
      spawnFloatingText?.(src,"Strength Potion +3", "status");
      log(`${src.name}'s Strength Potion triggers: +3 damage and loses 2 HP.`);
    }

    if(attack && src.buff?.houseSpecialAttackV139){
      finalAmt += src.buff.houseSpecialAttackV139;
      log(`${src.name}'s House Special adds +${src.buff.houseSpecialAttackV139} damage.`);
      delete src.buff.houseSpecialAttackV139;
    }

    const beforeHp = t.hp;
    try{
      const result = oldDamage(src,t,finalAmt,opt);
      const hit = beforeHp > (t?.hp || 0);
      if(hit && (t.status?.healthPotion || 0) > 0 && !t.dead){
        t.status.healthPotion -= 1;
        heal(t,3);
        spawnFloatingText?.(t,"Health Potion", "heal");
        log(`${t.name}'s Health Potion triggers and heals 3 HP.`);
      }
      handleDeathsV139();
      return result;
    } finally {
      if(tempArmor) t.armor = Math.max(0, (t.armor || 0) - tempArmor);
    }
  }

  const damageBeforeV139 = typeof damage === "function" ? damage : null;
  damage = function(src,t,amt,opt={}){
    if(!damageBeforeV139) return;
    return damageWithPotionAndMistV139(src,t,amt,opt,damageBeforeV139);
  };

  const loseHpDirectBeforeV139 = typeof loseHpDirect === "function" ? loseHpDirect : null;
  if(loseHpDirectBeforeV139){
    loseHpDirect = function(u,n,reason="life loss"){
      const result = loseHpDirectBeforeV139(u,n,reason);
      handleDeathsV139();
      return result;
    };
  }
  const lifeBeforeV139 = typeof life === "function" ? life : null;
  if(lifeBeforeV139){
    life = function(u,n){
      const result = lifeBeforeV139(u,n);
      handleDeathsV139();
      return result;
    };
  }

  function applySunTreeStartV139(){
    for(const tree of v139Live("player").concat(v139Live("enemy")).filter(u => u.tokenType === "sun_tree")){
      const growth = Math.max(1, Number(tree.growth || 1));
      tree.status = tree.status || {};
      tree.status.growth = growth;
      for(const ally of v139Live(tree.side).filter(u => u !== tree && u.row === tree.row)){
        heal(ally,growth);
      }
      log(`${tree.name} heals allies in its row for ${growth}.`);
    }
  }

  function triggerHouseSpecialStartV139(){
    for(const u of v139Live("player").concat(v139Live("enemy"))){
      const stacks = Math.max(0, Number(u.status?.houseSpecial || 0));
      if(!stacks) continue;
      u.status.houseSpecial = 0;
      loseHpDirect?.(u,5 * stacks,"House Special");
      if(u.dead) continue;
      u.buff = u.buff || {};
      u.buff.houseSpecialAttackV139 = (u.buff.houseSpecialAttackV139 || 0) + 5 * stacks;
      u.buff.houseArmorV139 = (u.buff.houseArmorV139 || 0) + stacks;
      u.armor = (u.armor || 0) + stacks;
      log(`${u.name}'s House Special triggers: loses ${5 * stacks} HP, next attack +${5 * stacks}, +${stacks} Armor this round.`);
    }
  }

  const endRoundBeforeV139 = typeof endRound === "function" ? endRound : null;
  if(endRoundBeforeV139){
    endRound = function(){
      if(state?.units){
        for(const u of state.units){
          if(u?.buff?.houseArmorV139){
            u.armor = Math.max(0, (u.armor || 0) - u.buff.houseArmorV139);
            delete u.buff.houseArmorV139;
          }
        }
      }
      const result = endRoundBeforeV139();
      if(state?.phase === "planning"){
        triggerHouseSpecialStartV139();
        applySunTreeStartV139();
        handleDeathsV139();
        renderBattle?.();
      }
      return result;
    };
  }

  const applyBeforeV139 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV139?.(c,a,t);
    const k = v139Kind(a);
    switch(k){
      case "givePotion": {
        if(!t || t.dead) return;
        addStatus(t,a.potion,1);
        spawnFloatingText?.(t, `${a.name}`, "status");
        log(`${c.name} gives ${t.name} ${a.name}.`);
        return;
      }
      case "summonBoneWall": {
        const planObj = (state?.plans || []).find(p => p.pid === state.currentActionKey);
        const row = planObj?.targetRow || v139FirstEmptyRow(c.side);
        if(!row || !v139RowEmpty(c.side,row)){ log(`${c.name}'s Bone Wall has no empty row.`); return; }
        const wall = makeTokenV139("bone_wall",c.side,row,0,{col:0});
        state.units.push(wall);
        log(`${c.name} summons a Bone Wall in the ${row} row.`);
        return;
      }
      case "reaperScythe": {
        for(const enemy of rowUnits(v139Enemy(c.side),"front")){
          const before = enemy.hp;
          if(before <= 5){
            enemy.hp = 0;
            enemy.dead = true;
            log(`${c.name}'s Reaper Scythe instantly defeats ${enemy.name}.`);
            handleDeathsV139();
          } else {
            damage(c,enemy,a.dmg || 3,{attack:true,aoe:true,melee:true});
          }
        }
        return;
      }
      case "ivoryBlock": {
        c.buff = c.buff || {};
        c.buff.nextAttackArmorV139 = (c.buff.nextAttackArmorV139 || 0) + (a.armor || 3);
        state.guarded = state.guarded || {};
        state.guarded[c.id] = true;
        log(`${c.name} will gain ${a.armor || 3} Armor against the next attack.`);
        return;
      }
      case "battleMist": {
        state.battleMistV139 = state.round;
        state.guarded = state.guarded || {};
        state.guarded[c.id] = true;
        log(`${c.name}'s Mist covers the battlefield this turn.`);
        return;
      }
      case "hopeShield": {
        if(t && !t.dead) addShield?.(t,a.shield || 4);
        return;
      }
      case "hopeHeal": {
        if(t && !t.dead) heal(t,a.heal || 4);
        return;
      }
      case "growSunTree": {
        const tree = findSunTreeV139(c.side);
        if(tree){
          tree.growth = Math.max(1, Number(tree.growth || 1)) + 1;
          tree.status = tree.status || {};
          tree.status.growth = tree.growth;
          log(`${c.name} grows the Sun Tree to growth ${tree.growth}.`);
          return;
        }
        const planObj = (state?.plans || []).find(p => p.pid === state.currentActionKey);
        const slot = planObj?.slotRow ? {side:planObj.slotSide || c.side,row:planObj.slotRow,col:planObj.slotCol} : v139FirstEmptySlot(c.side);
        if(!slot || v139SlotTaken(c.side,slot.row,slot.col)){ log(`${c.name}'s Sun Tree has no empty tile.`); return; }
        const newTree = makeTokenV139("sun_tree",c.side,slot.row,slot.col,{growth:1,status:{growth:1}});
        state.units.push(newTree);
        log(`${c.name} grows a Sun Tree.`);
        return;
      }
      case "sunBlast": {
        const growth = Math.max(0, Number(findSunTreeV139(c.side)?.growth || 0));
        if(growth <= 0){ log(`${c.name}'s Sun Blast has no Sun Tree growth.`); return; }
        for(const enemy of v139Live(v139Enemy(c.side))) damage(c,enemy,growth,{attack:true,aoe:true,melee:false});
        return;
      }
      default:
        return applyBeforeV139?.(c,a,t);
    }
  };

  const damageBeforeBlockPotionV139 = damage;
  damage = function(src,t,amt,opt={}){
    if(opt?.attack && t?.buff?.nextAttackArmorV139){
      const temp = t.buff.nextAttackArmorV139;
      delete t.buff.nextAttackArmorV139;
      t.armor = (t.armor || 0) + temp;
      try{
        return damageBeforeBlockPotionV139(src,t,amt,opt);
      } finally {
        t.armor = Math.max(0,(t.armor || 0) - temp);
      }
    }
    return damageBeforeBlockPotionV139(src,t,amt,opt);
  };

  function commitEmptyTargetV139(slot){
    const c = selectedUnit?.();
    const a = pendingAbility;
    if(!c || !a || state?.phase !== "planning") return false;
    const k = v139Kind(a);
    if(k === "growSunTree"){
      if(slot.side !== c.side || v139SlotTaken(c.side,slot.row,slot.col)) return false;
      const p = makeSlotPlanV139(c,a,slot,null);
      log(`${c.name} queued ${a.name}.`);
      return commitPlanWithCostV139(c,a,p);
    }
    if(k === "summonBoneWall"){
      if(slot.side !== c.side || !v139RowEmpty(c.side,slot.row)) return false;
      const p = makeSlotPlanV139(c,a,{side:c.side,row:slot.row,col:0},null);
      log(`${c.name} queued ${a.name}.`);
      return commitPlanWithCostV139(c,a,p);
    }
    return false;
  }

  function decorateEmptySlotsV139(){
    if(!state) return;
    const boards = [{id:"enemyBoard",side:"enemy",order:["back","front"]},{id:"playerBoard",side:"player",order:["front","back"]}];
    for(const board of boards){
      const root = $(board.id);
      if(!root) continue;
      [...root.querySelectorAll(".row")].forEach((rowEl,rowIndex) => {
        const row = board.order[rowIndex] || "front";
        [...rowEl.children].forEach((tileEl,col) => {
          if(!tileEl?.classList?.contains("tile")) return;
          tileEl.dataset.side = tileEl.dataset.side || board.side;
          tileEl.dataset.row = tileEl.dataset.row || row;
          tileEl.dataset.col = tileEl.dataset.col || String(col);
          if(!tileEl.classList.contains("empty")) return;
          const c = selectedUnit?.();
          const a = pendingAbility;
          const k = v139Kind(a);
          const legalTree = k === "growSunTree" && c && board.side === c.side && !findSunTreeV139(c.side) && !v139SlotTaken(c.side,row,col);
          const legalWall = k === "summonBoneWall" && c && board.side === c.side && v139RowEmpty(c.side,row);
          if(legalTree || legalWall){
            tileEl.classList.add("targetable","emptyTargetV139");
            tileEl.onclick = ev => {
              ev.preventDefault();
              ev.stopPropagation();
              commitEmptyTargetV139({side:board.side,row,col});
            };
          }
        });
      });
    }
  }

  function directCommitChainSlamV139(secondTarget){
    const pick = state?.chainSlamPickV127;
    if(!pick || !secondTarget) return false;
    const c = v139Unit(pick.unitId,pick.unitSide);
    const a = c?.abilities?.find(x => x.id === pick.abilityId);
    const first = v139Unit(pick.firstId,pick.firstSide);
    if(!c || !a || !first || secondTarget.side === c.side || secondTarget === first) return false;
    if(first.row === secondTarget.row && first.size !== "boss" && secondTarget.size !== "boss") return false;
    const p = makePlan(c,a,first,"player");
    p.extraTargetId = secondTarget.id;
    p.extraTargetSide = secondTarget.side;
    if(!commitPlanWithCostV139(c,a,p)) return false;
    state.chainSlamPickV127 = null;
    log(`${c.name} queued ${a.name} on ${first.name} and ${secondTarget.name}.`);
    return true;
  }

  function chainSlamHardFallbackV139(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const target = v139Unit(tileEl.dataset.unitId,tileEl.dataset.side);
    if(!target) return;
    if(directCommitChainSlamV139(target)){
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation?.();
    }
  }
  if(!window.__chainSlamHardFallbackV139){
    window.__chainSlamHardFallbackV139 = true;
    document.addEventListener("pointerdown", chainSlamHardFallbackV139, true);
    document.addEventListener("click", chainSlamHardFallbackV139, true);
  }

  const renderBattleBeforeV139 = typeof renderBattle === "function" ? renderBattle : null;
  if(renderBattleBeforeV139){
    renderBattle = function(){
      const result = renderBattleBeforeV139();
      decorateEmptySlotsV139();
      const pick = state?.chainSlamPickV127;
      if(pick){
        const first = v139Unit(pick.firstId,pick.firstSide);
        for(const target of v139Live(v139Enemy(pick.unitSide)).filter(u => u !== first && (u.row !== first?.row || u.size === "boss" || first?.size === "boss"))){
          document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`)?.classList.add("targetable","chainSlamSecondTargetV139");
        }
      }
      return result;
    };
  }

  const renderChooseBeforeV139 = typeof renderChoose === "function" ? renderChoose : null;
  if(renderChooseBeforeV139){
    renderChoose = function(){
      const result = renderChooseBeforeV139();
      document.querySelectorAll(".fighterCard").forEach(card => {
        const id = card.dataset.id;
        if(id === "pako" || id === "ivory" || id === "gondar") card.classList.add("newMechanicCardV139");
      });
      return result;
    };
  }

  const openWheelBeforeV139 = typeof openWheel === "function" ? openWheel : null;
  if(openWheelBeforeV139){
    openWheel = function(u){
      const result = openWheelBeforeV139(u);
      document.querySelectorAll(".wheelBtn").forEach(btn => {
        const a = u?.abilities?.find(x => x.id === btn.dataset.id);
        if(!a) return;
        const eff = abilityPlanningCostV139(u,a);
        const dreadDisabled = typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a);
        if(state?.actionsLeft < eff || dreadDisabled) btn.disabled = true;
        const meta = btn.querySelector(".wheelBtnMeta");
        if(meta){
          const speed = speedBreakdownV122(u,a);
          meta.textContent = dreadDisabled ? "Dread: 2 AP limit" : `${eff} AP / ${speed.label}${u?.status?.exhausted ? " (+1 Exhausted)" : ""}`;
        }
      });
      return result;
    };
  }

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    abilityPlanningCostV139,
    plannedApForUnitV139,
    makeTokenV139,
    handleDeathsV139,
    findSunTreeV139,
    commitEmptyTargetV139,
    directCommitChainSlamV139
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v136 Dread AP budget and mobile radial focus fix ===== */
{
  const DREAD_INFO_V136 = {
    icon:"😨",
    title:"Dread",
    text:"Next turn, this character can spend at most 2 total AP on abilities. Abilities costing 3 AP are disabled."
  };

  function unitKeyV136(u){
    return u ? `${u.side || ""}:${u.id || ""}` : "";
  }

  function dreadIsActiveV136(u){
    return !!(u && !u.dead && (u.status?.dread || 0) > 0);
  }

  function abilityCostForPlanV136(planObj){
    const actor = (state?.units || []).find(u => u && u.id === planObj?.unitId && (!planObj?.unitSide || u.side === planObj.unitSide));
    return actor?.abilities?.find(a => a.id === planObj?.abilityId)?.cost || 0;
  }

  function plannedApForUnitV136(u){
    const key = unitKeyV136(u);
    return (state?.plans || []).reduce((sum, planObj) => {
      const planKey = `${planObj.unitSide || planObj.side || ""}:${planObj.unitId || ""}`;
      return planKey === key ? sum + abilityCostForPlanV136(planObj) : sum;
    }, 0);
  }

  function dreadBlocksAbilityV136(u,a){
    if(!dreadIsActiveV136(u) || !a) return false;
    const cost = a.cost || 0;
    if((state?.phase || "planning") !== "planning") return cost > 2;
    return plannedApForUnitV136(u) + cost > 2;
  }

  function showDreadBlockedV136(u,a){
    const spent = plannedApForUnitV136(u);
    spawnFloatingText?.(u, `Dread: ${spent}/2 AP`, "cancel");
    showKeywordPopup?.("dread");
    log(`${u?.name || "This character"} cannot queue ${a?.name || "that ability"}; Dread allows only 2 total AP next turn.`);
  }

  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = DREAD_INFO_V136;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = DREAD_INFO_V136;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = DREAD_INFO_V136;

  const showStatusInfoBeforeV136 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV136){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${DREAD_INFO_V136.icon} ${DREAD_INFO_V136.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${DREAD_INFO_V136.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV136(key);
    };
  }

  const isAbilityDisabledByDreadBeforeV136 = typeof isAbilityDisabledByDreadV42 === "function" ? isAbilityDisabledByDreadV42 : null;
  isAbilityDisabledByDreadV42 = function(unitObj, ability){
    if(dreadIsActiveV136(unitObj)) return dreadBlocksAbilityV136(unitObj, ability);
    return isAbilityDisabledByDreadBeforeV136 ? isAbilityDisabledByDreadBeforeV136(unitObj, ability) : false;
  };

  const planBeforeV136 = typeof plan === "function" ? plan : null;
  if(planBeforeV136){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      if(c && a && state?.phase === "planning" && dreadBlocksAbilityV136(c,a)){
        showDreadBlockedV136(c,a);
        renderBattle();
        return;
      }
      return planBeforeV136(target);
    };
  }

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    dreadPlannedApV136: plannedApForUnitV136,
    dreadBlocksAbilityV136
  });

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v134 actual final live UI fixes: final Chain Slam target layer and Dread face ===== */
{
  const DREAD_ICON_V134 = "😨";
  const dreadInfoV134 = {
    icon:DREAD_ICON_V134,
    title:"Dread",
    text:"Next turn, this character is limited to 2 actions."
  };

  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = dreadInfoV134;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = dreadInfoV134;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = dreadInfoV134;
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV134 = typeof icon === "function" ? icon : null;
  if(iconBeforeV134){
    icon = function(s){
      if(s === "dread") return DREAD_ICON_V134;
      return iconBeforeV134(s);
    };
  }

  const showStatusInfoBeforeV134 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV134){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${dreadInfoV134.icon} ${dreadInfoV134.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${dreadInfoV134.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV134(key);
    };
  }

  const renderKeywordTextBeforeV134 = typeof renderKeywordText === "function" ? renderKeywordText : null;
  if(renderKeywordTextBeforeV134){
    renderKeywordText = function(text){
      const html = renderKeywordTextBeforeV134(text);
      if(!html || html.includes('data-keyword="dread"')) return html;
      return html.replace(/\b(Dread|dread)\b/g, match => `<button type="button" class="keywordLink" data-keyword="dread" data-label="Dread">${match}</button>`);
    };
  }

  function isChainSlamV134(a){
    return a && (a.effect === "dulerChainSlam" || a.kind === "dulerChainSlam" || a.id === "chainSlam");
  }

  function liveUnitV134(id, side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function chainSlamSecondTargetsV134(actor){
    const pick = state?.chainSlamPickV127;
    if(!actor || !pick) return [];
    const first = liveUnitV134(pick.firstId, pick.firstSide);
    const enemies = (state?.units || []).filter(u => u && !u.dead && u.side !== actor.side);
    const remaining = enemies.filter(u => !first || u !== first);
    if(!first) return remaining;
    const otherRow = remaining.filter(u => u.row !== first.row || u.size === "boss" || first.size === "boss");
    return otherRow.length ? otherRow : remaining;
  }

  function closeChainSlamOverlaysV134(){
    $("radial")?.classList.add("hidden");
    $("abilityTooltip")?.classList.add("hidden");
  }

  const targetsBeforeV134 = typeof targets === "function" ? targets : null;
  if(targetsBeforeV134){
    targets = function(c,a){
      const pick = state?.chainSlamPickV127;
      if(pick && c && a && isChainSlamV134(a) && pick.unitId === c.id && pick.unitSide === c.side){
        return chainSlamSecondTargetsV134(c);
      }
      return targetsBeforeV134(c,a);
    };
  }

  const planBeforeV134 = typeof plan === "function" ? plan : null;
  if(planBeforeV134){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      const pick = state?.chainSlamPickV127;
      if(c && a && pick && isChainSlamV134(a) && pick.unitId === c.id && pick.unitSide === c.side && state?.phase === "planning"){
        closeChainSlamOverlaysV134();
        const legal = chainSlamSecondTargetsV134(c);
        if(target && !legal.includes(target)) return;
      }
      const result = planBeforeV134(target);
      if(state?.chainSlamPickV127) closeChainSlamOverlaysV134();
      return result;
    };
  }

  function chainSlamSecondPickFallbackV134(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const actor = liveUnitV134(pick.unitId, pick.unitSide);
    const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
    const target = liveUnitV134(tileEl.dataset.unitId, tileEl.dataset.side);
    if(!actor || !ability || !target || target.side === actor.side) return;
    const legal = chainSlamSecondTargetsV134(actor);
    if(!legal.includes(target)) return;
    selectedId = actor.id;
    selectedSide = actor.side;
    pendingAbility = ability;
    closeChainSlamOverlaysV134();
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation?.();
    plan(target);
  }

  if(!window.__chainSlamSecondPickFallbackV134){
    window.__chainSlamSecondPickFallbackV134 = true;
    document.addEventListener("pointerdown", chainSlamSecondPickFallbackV134, true);
    document.addEventListener("click", chainSlamSecondPickFallbackV134, true);
  }

  const renderBattleBeforeV134 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV134();
    const pick = state?.chainSlamPickV127;
    if(pick){
      closeChainSlamOverlaysV134();
      const actor = liveUnitV134(pick.unitId, pick.unitSide);
      const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
      if(actor && ability){
        for(const target of chainSlamSecondTargetsV134(actor)){
          const el = document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`);
          el?.classList.add("targetable","chainSlamSecondTargetV134");
        }
      }
    }
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    chainSlamSecondTargetsV134
  });

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v134 actual final live UI fixes: final Chain Slam target layer and Dread face ===== */
{
  const DREAD_ICON_V134 = "😨";
  const dreadInfoV134 = {
    icon:DREAD_ICON_V134,
    title:"Dread",
    text:"Next turn, this character is limited to 2 actions."
  };

  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = dreadInfoV134;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = dreadInfoV134;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = dreadInfoV134;
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV134 = typeof icon === "function" ? icon : null;
  if(iconBeforeV134){
    icon = function(s){
      if(s === "dread") return DREAD_ICON_V134;
      return iconBeforeV134(s);
    };
  }

  const showStatusInfoBeforeV134 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV134){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${dreadInfoV134.icon} ${dreadInfoV134.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${dreadInfoV134.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV134(key);
    };
  }

  const renderKeywordTextBeforeV134 = typeof renderKeywordText === "function" ? renderKeywordText : null;
  if(renderKeywordTextBeforeV134){
    renderKeywordText = function(text){
      const html = renderKeywordTextBeforeV134(text);
      if(!html || html.includes('data-keyword="dread"')) return html;
      return html.replace(/\b(Dread|dread)\b/g, match => `<button type="button" class="keywordLink" data-keyword="dread" data-label="Dread">${match}</button>`);
    };
  }

  function isChainSlamV134(a){
    return a && (a.effect === "dulerChainSlam" || a.kind === "dulerChainSlam" || a.id === "chainSlam");
  }

  function liveUnitV134(id, side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function chainSlamSecondTargetsV134(actor){
    const pick = state?.chainSlamPickV127;
    if(!actor || !pick) return [];
    const first = liveUnitV134(pick.firstId, pick.firstSide);
    const enemies = (state?.units || []).filter(u => u && !u.dead && u.side !== actor.side);
    const remaining = enemies.filter(u => !first || u !== first);
    if(!first) return remaining;
    const otherRow = remaining.filter(u => u.row !== first.row || u.size === "boss" || first.size === "boss");
    return otherRow.length ? otherRow : remaining;
  }

  function closeChainSlamOverlaysV134(){
    $("radial")?.classList.add("hidden");
    $("abilityTooltip")?.classList.add("hidden");
  }

  const targetsBeforeV134 = typeof targets === "function" ? targets : null;
  if(targetsBeforeV134){
    targets = function(c,a){
      const pick = state?.chainSlamPickV127;
      if(pick && c && a && isChainSlamV134(a) && pick.unitId === c.id && pick.unitSide === c.side){
        return chainSlamSecondTargetsV134(c);
      }
      return targetsBeforeV134(c,a);
    };
  }

  const planBeforeV134 = typeof plan === "function" ? plan : null;
  if(planBeforeV134){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      const pick = state?.chainSlamPickV127;
      if(c && a && pick && isChainSlamV134(a) && pick.unitId === c.id && pick.unitSide === c.side && state?.phase === "planning"){
        closeChainSlamOverlaysV134();
        const legal = chainSlamSecondTargetsV134(c);
        if(target && !legal.includes(target)) return;
      }
      const result = planBeforeV134(target);
      if(state?.chainSlamPickV127) closeChainSlamOverlaysV134();
      return result;
    };
  }

  function chainSlamSecondPickFallbackV134(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const actor = liveUnitV134(pick.unitId, pick.unitSide);
    const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
    const target = liveUnitV134(tileEl.dataset.unitId, tileEl.dataset.side);
    if(!actor || !ability || !target || target.side === actor.side) return;
    const legal = chainSlamSecondTargetsV134(actor);
    if(!legal.includes(target)) return;
    selectedId = actor.id;
    selectedSide = actor.side;
    pendingAbility = ability;
    closeChainSlamOverlaysV134();
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation?.();
    plan(target);
  }

  if(!window.__chainSlamSecondPickFallbackV134){
    window.__chainSlamSecondPickFallbackV134 = true;
    document.addEventListener("pointerdown", chainSlamSecondPickFallbackV134, true);
    document.addEventListener("click", chainSlamSecondPickFallbackV134, true);
  }

  const renderBattleBeforeV134 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV134();
    const pick = state?.chainSlamPickV127;
    if(pick){
      closeChainSlamOverlaysV134();
      const actor = liveUnitV134(pick.unitId, pick.unitSide);
      const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
      if(actor && ability){
        for(const target of chainSlamSecondTargetsV134(actor)){
          const el = document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`);
          el?.classList.add("targetable","chainSlamSecondTargetV134");
        }
      }
    }
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    chainSlamSecondTargetsV134
  });

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v133 actual final live UI fixes: forgiving Chain Slam second target and Dread face ===== */
{
  const DREAD_ICON_V133 = "😨";
  const dreadInfoV133 = {
    icon:DREAD_ICON_V133,
    title:"Dread",
    text:"Next turn, this character is limited to 2 actions."
  };

  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = dreadInfoV133;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = dreadInfoV133;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = dreadInfoV133;
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV133 = typeof icon === "function" ? icon : null;
  if(iconBeforeV133){
    icon = function(s){
      if(s === "dread") return DREAD_ICON_V133;
      return iconBeforeV133(s);
    };
  }

  const showStatusInfoBeforeV133 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV133){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${dreadInfoV133.icon} ${dreadInfoV133.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${dreadInfoV133.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV133(key);
    };
  }

  const renderKeywordTextBeforeV133 = typeof renderKeywordText === "function" ? renderKeywordText : null;
  if(renderKeywordTextBeforeV133){
    renderKeywordText = function(text){
      const html = renderKeywordTextBeforeV133(text);
      if(!html || html.includes('data-keyword="dread"')) return html;
      return html.replace(/\b(Dread|dread)\b/g, match => `<button type="button" class="keywordLink" data-keyword="dread" data-label="Dread">${match}</button>`);
    };
  }

  function isChainSlamV133(a){
    return a && (a.effect === "dulerChainSlam" || a.kind === "dulerChainSlam" || a.id === "chainSlam");
  }

  function liveUnitV133(id, side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function chainSlamSecondTargetsV133(actor){
    const pick = state?.chainSlamPickV127;
    if(!actor || !pick) return [];
    const first = liveUnitV133(pick.firstId, pick.firstSide);
    const enemies = (state?.units || []).filter(u => u && !u.dead && u.side !== actor.side);
    const remaining = enemies.filter(u => !first || u !== first);
    if(!first) return remaining;
    const otherRow = remaining.filter(u => u.row !== first.row || u.size === "boss" || first.size === "boss");
    return otherRow.length ? otherRow : remaining;
  }

  function closeChainSlamOverlaysV133(){
    $("radial")?.classList.add("hidden");
    $("abilityTooltip")?.classList.add("hidden");
  }

  const targetsBeforeV133 = typeof targets === "function" ? targets : null;
  if(targetsBeforeV133){
    targets = function(c,a){
      const pick = state?.chainSlamPickV127;
      if(pick && c && a && isChainSlamV133(a) && pick.unitId === c.id && pick.unitSide === c.side){
        return chainSlamSecondTargetsV133(c);
      }
      return targetsBeforeV133(c,a);
    };
  }

  const planBeforeV133 = typeof plan === "function" ? plan : null;
  if(planBeforeV133){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      const pick = state?.chainSlamPickV127;
      if(c && a && pick && isChainSlamV133(a) && pick.unitId === c.id && pick.unitSide === c.side && state?.phase === "planning"){
        closeChainSlamOverlaysV133();
        const legal = chainSlamSecondTargetsV133(c);
        if(target && !legal.includes(target)) return;
      }
      const result = planBeforeV133(target);
      if(state?.chainSlamPickV127) closeChainSlamOverlaysV133();
      return result;
    };
  }

  function chainSlamSecondPickFallbackV133(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const actor = liveUnitV133(pick.unitId, pick.unitSide);
    const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
    const target = liveUnitV133(tileEl.dataset.unitId, tileEl.dataset.side);
    if(!actor || !ability || !target || target.side === actor.side) return;
    const legal = chainSlamSecondTargetsV133(actor);
    if(!legal.includes(target)) return;
    selectedId = actor.id;
    selectedSide = actor.side;
    pendingAbility = ability;
    closeChainSlamOverlaysV133();
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation?.();
    plan(target);
  }

  if(!window.__chainSlamSecondPickFallbackV133){
    window.__chainSlamSecondPickFallbackV133 = true;
    document.addEventListener("pointerdown", chainSlamSecondPickFallbackV133, true);
    document.addEventListener("click", chainSlamSecondPickFallbackV133, true);
  }

  const renderBattleBeforeV133 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV133();
    const pick = state?.chainSlamPickV127;
    if(pick){
      closeChainSlamOverlaysV133();
      const actor = liveUnitV133(pick.unitId, pick.unitSide);
      const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
      if(actor && ability){
        for(const target of chainSlamSecondTargetsV133(actor)){
          const el = document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`);
          el?.classList.add("targetable","chainSlamSecondTargetV133");
        }
      }
    }
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    chainSlamSecondTargetsV133
  });

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v126 Duler shadow brute and action-wide attack buffs ===== */
{
  ART.duler = "url('assets/duler.png')";

  const char = id => ROSTER.find(x=>x.id===id);
  const keyForV126 = u => u ? `${u.side || ""}:${u.id}` : "";
  const ability = (cid,aid) => char(cid)?.abilities?.find(a=>a.id===aid);

  if(!ROSTER.some(c=>c.id==="duler")){
    ROSTER.push({
      id:"duler",
      name:"Duler",
      class:"brute",
      prof:"darkness",
      hp:26,
      armor:1,
      speed:4,
      art:ART.duler,
      passive:"Passive - Pain Chain: when Duler loses HP, his next attack deals +1 damage.",
      abilities:[
        A("chainSwipe","Chain Swipe",2,-1,"Shadow melee area attack. Deal 4 damage to each enemy in the current front row. Each enemy hit gains Dread.","dulerChainSwipe",{kind:"dulerChainSwipe",dmg:4,range:"front",frontRowOnly:true,melee:true,iconKey:"darkness"}),
        A("scare","Scare",1,99,"Guard-speed control. Choose an enemy. If there is free space in its back row, move it there until the end of the round.","dulerScare",{kind:"dulerScare",guard:true,guardType:true,tags:["guard"],range:"ranged",iconKey:"darkness"}),
        A("chainSlam","Chain Slam",2,-1,"Shadow melee chain attack. Choose an enemy. Duler attacks that enemy and one enemy in the other occupied row for 4 damage each. Each enemy hit gains Exhausted.","dulerChainSlam",{kind:"dulerChainSlam",dmg:4,range:"melee",backlineReach:true,melee:true,iconKey:"darkness"}),
        A("basicGuard","Basic Guard",1,99,"Guard. Gain +4 Armor against the next attack this turn.","dulerBasicGuard",{kind:"dulerBasicGuard",guard:true,guardType:true,tags:["guard"],range:"self",iconKey:"brute"})
      ]
    });
  }

  function rowsWithUnitsV126(side){
    const living = alive(side), rows = [];
    if(living.some(u=>u.size==="boss")) rows.push("front","back");
    if(living.some(u=>(u.size==="rowBoss" || !u.size) && u.row==="front")) rows.push("front");
    if(living.some(u=>(u.size==="rowBoss" || !u.size) && u.row==="back")) rows.push("back");
    return [...new Set(rows)];
  }
  function frontRowV126(side){
    const rows = rowsWithUnitsV126(side);
    return rows.includes("front") ? "front" : (rows.includes("back") ? "back" : "front");
  }
  function backRowV126(side){
    const rows = rowsWithUnitsV126(side);
    return rows.includes("back") ? "back" : (rows.includes("front") ? "front" : "back");
  }
  function isFrontV126(u){ return !!u && !u.dead && (u.size==="boss" || u.row===frontRowV126(u.side)); }
  function rowUnitsDynamicV126(side,row){
    if(row === "front") return alive(side).filter(isFrontV126);
    if(row === "back") return alive(side).filter(u=>!!u && !u.dead && (u.size==="boss" || u.row===backRowV126(u.side)));
    return rowUnits(side,row);
  }
  function sortedBySlotV126(units){
    return [...units].sort((a,b)=>String(a.row).localeCompare(String(b.row)) || (a.col || 0) - (b.col || 0));
  }
  function addDreadV126(t){
    if(!t || t.dead) return;
    if(typeof setDreadLimitV122 === "function") setDreadLimitV122(t);
    else addStatus(t,"dread",1);
  }
  function didHitV126(beforeHp,t){
    return beforeHp != null && t && !t.dead && beforeHp > (t.hp || 0);
  }
  function isAttackAbilityV126(a){
    if(!a) return false;
    const k = a.kind || a.effect;
    if(["dulerChainSwipe","dulerChainSlam","dulerScare","dulerBasicGuard"].includes(k)) return k === "dulerChainSwipe" || k === "dulerChainSlam";
    const text = `${a.name || ""} ${a.desc || ""} ${k || ""}`.toLowerCase();
    return !!(a.dmg || /attack|deal .*damage|hit|slash|stab|bash|thrust|blade|needle|shot|slam|swipe|drain/.test(text));
  }
  function beginActionBuffV126(c,a){
    if(!c || !a || !isAttackAbilityV126(a)) return null;
    const bloodInfusion = c.buff?.bloodInfusion ? {...c.buff.bloodInfusion} : null;
    const dulerBonus = Number(c.buff?.nextAttackDamageV126 || 0);
    const bonusDamage = Math.max(0, Number(bloodInfusion?.bonus || 0) + dulerBonus);
    if(!bonusDamage && !bloodInfusion?.bleed) return null;
    if(bloodInfusion && c.buff) delete c.buff.bloodInfusion;
    return {
      actorKey:keyForV126(c),
      bonusDamage,
      bloodInfusion,
      bleed:Number(bloodInfusion?.bleed || 0),
      used:false,
      restoreBloodInfusion:!!bloodInfusion
    };
  }
  function finishActionBuffV126(c,ctx){
    if(!c || !ctx) return;
    if(ctx.used){
      if(c.buff){
        delete c.buff.nextAttackDamageV126;
        delete c.buff.bloodInfusion;
      }
      return;
    }
    if(ctx.restoreBloodInfusion && c.buff) c.buff.bloodInfusion = ctx.bloodInfusion;
  }
  function withActionBuffV126(c,a,runner){
    const ctx = beginActionBuffV126(c,a);
    const previous = state?.actionBuffContextV126 || null;
    if(ctx) state.actionBuffContextV126 = ctx;
    try {
      return runner(ctx);
    } finally {
      if(ctx) finishActionBuffV126(c,ctx);
      if(state) state.actionBuffContextV126 = previous;
    }
  }
  function noteDulerLifeLossV126(u,beforeHp){
    if(!u || u.id !== "duler" || u.dead || beforeHp == null || beforeHp <= (u.hp || 0)) return;
    u.buff = u.buff || {};
    u.buff.nextAttackDamageV126 = (Number(u.buff.nextAttackDamageV126) || 0) + 1;
    markPassive?.(u,"Pain Chain");
    spawnFloatingText?.(u,"Next attack +1", "status");
    log(`${u.name}'s Pain Chain gives his next attack +1 damage.`);
  }
  function moveToBackTemporarilyV126(t){
    if(!t || t.dead || t.size==="boss") return false;
    const targetBackRow = backRowV126(t.side);
    const occupied = new Set(alive(t.side).filter(u=>u !== t && u.row === targetBackRow).map(u=>u.col));
    const freeCol = [0,1,2].find(col=>!occupied.has(col));
    if(freeCol == null) return false;
    if(!t.tempRowMoveV126) t.tempRowMoveV126 = {row:t.row, col:t.col, round:state.round || 1};
    t.row = targetBackRow;
    t.col = freeCol;
    spawnFloatingText?.(t,"Scared back", "status");
    pushActionEvent?.("move", `${t.name} was scared into the back row until round end`, t);
    log(`${t.name} is scared into the back row until the end of the round.`);
    return true;
  }
  function restoreTempRowsV126(){
    if(!state?.units) return;
    for(const u of state.units){
      if(!u?.tempRowMoveV126) continue;
      const move = u.tempRowMoveV126;
      u.row = move.row;
      u.col = move.col;
      delete u.tempRowMoveV126;
    }
  }

  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.dread = {...(KEYWORDS_V32.dread || {title:"Dread"}), text:"Dread limits that character to abilities costing 2 AP or less on its next turn."};
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const oldAbilityIconKeyV126 = abilityIconKey;
  abilityIconKey = function(caster, a){
    if(a?.iconKey) return a.iconKey;
    const text = `${a?.name || ""} ${a?.desc || ""} ${a?.effect || ""} ${a?.kind || ""}`.toLowerCase();
    if(/chain|scare|dread/.test(text)) return "darkness";
    return oldAbilityIconKeyV126(caster,a);
  };

  const oldTargetsV126 = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    const enemies = alive(other(c.side));
    const k = a.kind || a.effect;
    if(k === "dulerChainSwipe" || k === "dulerBasicGuard") return [];
    if(k === "dulerScare" || k === "dulerChainSlam") return enemies;
    return oldTargetsV126(c,a);
  };

  const oldAiTargetsV126 = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
  if(oldAiTargetsV126) aiValidTargetsV95 = function(c,a){
    if(!c || !a) return [];
    const k = a.kind || a.effect;
    if(k === "dulerChainSwipe" || k === "dulerBasicGuard") return [null];
    if(k === "dulerScare" || k === "dulerChainSlam") return alive(other(c.side));
    return oldAiTargetsV126(c,a);
  };

  const oldApplyV126 = apply;
  apply = function(c,a,t){
    if(!c || !a) return oldApplyV126(c,a,t);
    return withActionBuffV126(c,a,ctx=>{
      const k = a.kind || a.effect;
      if(k === "dulerChainSwipe"){
        for(const enemy of rowUnitsDynamicV126(other(c.side),"front")){
          const before = enemy.hp;
          damage(c,enemy,a.dmg || 4,{attack:true,aoe:true,melee:true});
          if(didHitV126(before,enemy)) addDreadV126(enemy);
        }
        return;
      }
      if(k === "dulerScare"){
        if(!t || t.dead) return;
        state.guardActionsV125 = state.guardActionsV125 || {};
        state.guardActionsV125[keyForV126(c)] = true;
        c.performedGuardRoundV125 = state.round;
        if(!moveToBackTemporarilyV126(t)) log(`${c.name}'s Scare found no free back-row space for ${t.name}.`);
        return;
      }
      if(k === "dulerChainSlam"){
        if(!t || t.dead) return;
        const victims = [t];
        const otherRows = rowsWithUnitsV126(t.side).filter(row=>row !== t.row);
        for(const row of otherRows){
          const candidate = sortedBySlotV126(rowUnitsDynamicV126(t.side,row).filter(u=>u !== t))[0];
          if(candidate && !victims.includes(candidate)) victims.push(candidate);
        }
        for(const enemy of victims){
          const before = enemy.hp;
          damage(c,enemy,a.dmg || 4,{attack:true,aoe:true,melee:true});
          if(didHitV126(before,enemy)) addStatus(enemy,"exhausted",1);
        }
        return;
      }
      if(k === "dulerBasicGuard"){
        c.buff = c.buff || {};
        c.buff.basicGuardArmorV126 = Math.max(Number(c.buff.basicGuardArmorV126) || 0, 4);
        state.guarded = state.guarded || {};
        state.guarded[c.id] = true;
        state.guardActionsV125 = state.guardActionsV125 || {};
        state.guardActionsV125[keyForV126(c)] = true;
        c.performedGuardRoundV125 = state.round;
        spawnFloatingText?.(c,"Next attack +4 Armor", "guard");
        log(`${c.name} braces for the next attack and gains +4 Armor against it.`);
        return;
      }
      return oldApplyV126(c,a,t);
    });
  };

  const oldDamageV126 = damage;
  damage = function(src,t,amt,opt={}){
    const originalTarget = t;
    const targetBeforeHp = originalTarget?.hp ?? null;
    const srcBeforeHp = src?.hp ?? null;
    let nextAmt = amt;
    const ctx = state?.actionBuffContextV126 || null;
    if(opt?.attack && src && ctx && ctx.actorKey === keyForV126(src)){
      if(ctx.bonusDamage){
        nextAmt += ctx.bonusDamage;
        ctx.used = true;
      }
    }

    let temporaryArmor = 0;
    if(opt?.attack && originalTarget?.buff?.basicGuardArmorV126){
      temporaryArmor = Number(originalTarget.buff.basicGuardArmorV126) || 0;
      originalTarget.bonusArmor = (originalTarget.bonusArmor || 0) + temporaryArmor;
      delete originalTarget.buff.basicGuardArmorV126;
    }
    try {
      const result = oldDamageV126(src,t,nextAmt,opt);
      if(ctx && opt?.attack && src && ctx.actorKey === keyForV126(src) && ctx.bleed > 0 && didHitV126(targetBeforeHp,originalTarget) && originalTarget && !originalTarget.dead){
        applyStatusFrom?.(src,originalTarget,"bleed",ctx.bleed);
        ctx.used = true;
      }
      noteDulerLifeLossV126(originalTarget,targetBeforeHp);
      noteDulerLifeLossV126(src,srcBeforeHp);
      return result;
    } finally {
      if(temporaryArmor && originalTarget) originalTarget.bonusArmor = Math.max(0,(originalTarget.bonusArmor || 0) - temporaryArmor);
    }
  };

  const oldLoseHpDirectV126 = loseHpDirect;
  loseHpDirect = function(u,n,reason="life loss"){
    const before = u?.hp ?? null;
    const result = oldLoseHpDirectV126(u,n,reason);
    noteDulerLifeLossV126(u,before);
    return result;
  };

  const oldEndRoundV126 = endRound;
  endRound = function(){
    restoreTempRowsV126();
    if(state?.units) for(const u of state.units) if(u?.buff) delete u.buff.basicGuardArmorV126;
    return oldEndRoundV126();
  };

  const oldAiDamageV126 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
  if(oldAiDamageV126) aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "dulerChainSwipe") return (a.dmg || 4) * Math.max(1,rowUnitsDynamicV126(other(c.side),"front").length || 1);
    if(k === "dulerChainSlam") return (a.dmg || 4) * Math.max(1,rowsWithUnitsV126(other(c.side)).length || 1);
    return oldAiDamageV126(a,t,c);
  };
  const oldAiSetupV126 = typeof aiIsSetupV95 === "function" ? aiIsSetupV95 : null;
  if(oldAiSetupV126) aiIsSetupV95 = function(a){
    const k = a?.kind || a?.effect;
    if(k === "dulerScare" || k === "dulerBasicGuard") return true;
    return oldAiSetupV126(a);
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    rowUnitsDynamicV126,
    dulerFrontRowV126: frontRowV126,
    dulerBackRowV126: backRowV126
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v131 live UI fixes: Chain Slam click fallback and Dread keyword/status polish ===== */
{
  const dreadInfoV131 = {
    icon:"!",
    title:"Dread",
    text:"Next turn, this character is limited to 2 actions."
  };
  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = dreadInfoV131;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = dreadInfoV131;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = dreadInfoV131;
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV131 = typeof icon === "function" ? icon : null;
  if(iconBeforeV131){
    icon = function(s){
      if(s === "dread") return "!";
      return iconBeforeV131(s);
    };
  }

  const renderKeywordTextBeforeV131 = typeof renderKeywordText === "function" ? renderKeywordText : null;
  if(renderKeywordTextBeforeV131){
    renderKeywordText = function(text){
      let html = renderKeywordTextBeforeV131(text);
      if(!html || html.includes('data-keyword="dread"')) return html;
      return html.replace(/\b(Dread)\b/g, `<button type="button" class="keywordLink" data-keyword="dread" data-label="Dread">Dread</button>`);
    };
  }

  const showStatusInfoBeforeV131 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV131){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${dreadInfoV131.icon} ${dreadInfoV131.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${dreadInfoV131.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV131(key);
    };
  }

  function liveUnitV131(id, side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function chainSlamSecondPickFallbackV131(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const target = liveUnitV131(tileEl.dataset.unitId, tileEl.dataset.side);
    const actor = liveUnitV131(pick.unitId, pick.unitSide);
    const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
    if(!target || !actor || !ability || target.side === actor.side) return;
    selectedId = actor.id;
    selectedSide = actor.side;
    pendingAbility = ability;
    const legal = typeof targets === "function" ? targets(actor, ability) : [];
    if(!legal.includes(target)) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation?.();
    plan(target);
  }

  if(!window.__chainSlamSecondPickFallbackV131){
    window.__chainSlamSecondPickFallbackV131 = true;
    document.addEventListener("pointerdown", chainSlamSecondPickFallbackV131, true);
    document.addEventListener("click", chainSlamSecondPickFallbackV131, true);
  }

  const renderBattleBeforeV131 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV131();
    const pick = state?.chainSlamPickV127;
    if(pick){
      const actor = liveUnitV131(pick.unitId, pick.unitSide);
      const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
      if(actor && ability){
        for(const target of targets(actor, ability)){
          const el = document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`);
          el?.classList.add("targetable","chainSlamSecondTargetV131");
        }
      }
    }
    return result;
  };

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v129 final runtime ownership: delayed judgement, Dread, Chain Slam, and battle log close ===== */
{
  const enemySideV129 = side => side === "player" ? "enemy" : "player";
  const liveV129 = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const unitV129 = (id, side) => (state?.units || []).find(u => u && !u.dead && u.id === id && u.side === side);
  const rowsV129 = side => ["front","back"].filter(row => liveV129(side).some(u => u.row === row));
  const rowUnitsV129 = (side,row) => liveV129(side).filter(u => u.row === row).sort((a,b)=>(a.col||0)-(b.col||0));
  const frontRowsV129 = side => {
    const rows = rowsV129(side);
    return rows.length ? [rows[0]] : [];
  };
  const kindV129 = a => a?.effect || a?.kind || a?.id || "";
  const hitV129 = (before,t) => !!t && Number.isFinite(before) && t.hp < before;

  if(typeof STATUS_LABELS_V17 !== "undefined"){
    STATUS_LABELS_V17.dread = {title:"Dread", text:"Next turn, this character is limited to 2 actions."};
    STATUS_LABELS_V17.delayedJudgement = {title:"Delayed Judgement", text:"This character will be hit by Delayed Judgement at the start of the next round."};
  }
  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.dread = STATUS_LABELS_V17?.dread || KEYWORDS_V32.dread;
    KEYWORDS_V32.hit = {title:"Hit", text:"An attack hits when the target loses life from that attack."};
  }
  if(window.KEYWORDS_V32_SAFE){
    window.KEYWORDS_V32_SAFE.dread = STATUS_LABELS_V17?.dread || window.KEYWORDS_V32_SAFE.dread;
    window.KEYWORDS_V32_SAFE.hit = KEYWORDS_V32?.hit || window.KEYWORDS_V32_SAFE.hit;
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread","Hit","hit"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const rosterV129 = typeof ROSTER !== "undefined" && Array.isArray(ROSTER) ? ROSTER : [];
  const hopeDefV129 = rosterV129.find(c => c.id === "hope");
  const judgementV129 = hopeDefV129?.abilities?.find(a => a.id === "judgement");
  if(judgementV129){
    judgementV129.effect = "hopeDelayedJudgementV129";
    judgementV129.kind = "delayedAttack";
    judgementV129.dmg = 6;
    judgementV129.delay = 1;
    judgementV129.range = "ranged";
    judgementV129.text = "Delayed ranged attack. Choose one enemy. At the start of next round, deal 6 damage.";
  }

  function addDreadV129(target){
    if(!target || target.dead) return;
    target.status = target.status || {};
    target.status.dread = Math.max(target.status.dread || 0, 1);
    if(typeof setDreadLimitV122 === "function") setDreadLimitV122(target);
  }

  function consumeAttackBuffV129(c){
    const infusion = c?.buff?.bloodInfusion ? {...c.buff.bloodInfusion} : null;
    const bonus = Math.max(0, Number(c?.buff?.nextAttackDamageV126 || 0) + Number(infusion?.bonus || 0));
    const bleed = Number(infusion?.bleed || 0);
    if(c?.buff){
      delete c.buff.nextAttackDamageV126;
      delete c.buff.bloodInfusion;
    }
    return {bonus, bleed};
  }

  function applyBuffBleedV129(c,t,buff){
    if(buff?.bleed && t && !t.dead) applyStatusFrom?.(c,t,"bleed",buff.bleed);
  }

  function scheduleDelayedJudgementV129(c,a,t){
    if(!c || !a || !t || t.dead) return;
    state.delayedActionsV129 = Array.isArray(state.delayedActionsV129) ? state.delayedActionsV129 : [];
    state.delayedActionsV129.push({
      sourceId:c.id,
      sourceSide:c.side,
      targetId:t.id,
      targetSide:t.side,
      dueRound:(state.round || 1) + (a.delay || 1),
      dmg:a.dmg || 6,
      abilityName:a.name || "Delayed Judgement"
    });
    t.status = t.status || {};
    t.status.delayedJudgement = Math.max(t.status.delayedJudgement || 0, 1);
    spawnFloatingText?.(t,"Judgement next round","status");
    pushActionEvent?.("statusGain", `${c.name}'s ${a.name || "Delayed Judgement"} will strike ${t.name} next round`, t);
    log(`${c.name} prepared ${a.name || "Delayed Judgement"} against ${t.name}.`);
  }

  function resolveDelayedJudgementsV129(){
    if(!state) return;
    const due = [];
    const pending = [];
    for(const item of state.delayedActionsV129 || []){
      if(item && item.dueRound <= (state.round || 1)) due.push(item);
      else if(item) pending.push(item);
    }
    state.delayedActionsV129 = pending;
    for(const item of due){
      const source = unitV129(item.sourceId,item.sourceSide);
      const target = unitV129(item.targetId,item.targetSide);
      if(!source || !target) continue;
      if(target.status) delete target.status.delayedJudgement;
      state.currentActionKey = `delayed:${item.sourceSide}:${item.sourceId}:${item.targetSide}:${item.targetId}:${state.round}`;
      addMomentClassV106?.(tileElForUnitV106?.(source), "activeActionV125", 620);
      damage(source,target,item.dmg || 6,{attack:true,ranged:true,melee:false});
      pushActionEvent?.("hit", `${item.abilityName || "Delayed Judgement"} struck ${target.name}`, target);
      log(`${item.abilityName || "Delayed Judgement"} struck ${target.name}.`);
      state.currentActionKey = null;
    }
  }

  function commitChainSlamV129(c,a,first,second){
    if(!c || !a || !first || state.actionsLeft < (a.cost || 0)) return false;
    state.actionsLeft -= a.cost || 0;
    const p = makePlan(c,a,first,"player");
    if(second && !second.dead){
      p.extraTargetId = second.id;
      p.extraTargetSide = second.side;
    }
    if(!Array.isArray(state.plans)) state.plans = [];
    if(!Array.isArray(state.plans)) state.plans = [];
    if(!Array.isArray(state.plans)) state.plans = [];
    state.plans.push(p);
    log(`${c.name} queued ${a.name} on ${first.name}${second ? ` and ${second.name}` : ""}.`);
    state.chainSlamPickV127 = null;
    selectedId = null;
    selectedSide = null;
    pendingAbility = null;
    addMomentClassV106?.(tileElForUnitV106?.(c), "planCommitV106", 520);
    addMomentClassV106?.(tileElForUnitV106?.(first), "targetPingV106", 520);
    if(second) addMomentClassV106?.(tileElForUnitV106?.(second), "targetPingV106", 520);
    pulseQueueV106?.();
    hapticV106?.("commit");
    playSfxV106?.("commit");
    renderBattle();
    return true;
  }

  const targetsBeforeV129 = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    if(kindV129(a) === "dulerChainSlam"){
      const enemySide = enemySideV129(c.side);
      const pick = state?.chainSlamPickV127;
      if(pick && pick.unitId === c.id && pick.unitSide === c.side && pick.abilityId === a.id){
        const first = unitV129(pick.firstId,pick.firstSide);
        if(!first) return [];
        return rowsV129(enemySide).filter(row => row !== first.row).flatMap(row => rowUnitsV129(enemySide,row));
      }
      return liveV129(enemySide);
    }
    return targetsBeforeV129(c,a);
  };

  const planBeforeV129 = plan;
  plan = function(target){
    const c = selectedUnit?.();
    const a = pendingAbility;
    if(c && a && kindV129(a) === "dulerChainSlam" && state?.phase === "planning"){
      const pick = state.chainSlamPickV127;
      if(!pick){
        if(!target || !targets(c,a).includes(target)) return;
        state.chainSlamPickV127 = {unitId:c.id,unitSide:c.side,abilityId:a.id,firstId:target.id,firstSide:target.side};
        const remaining = targets(c,a);
        if(!remaining.length){
          commitChainSlamV129(c,a,target,null);
          return;
        }
        spawnFloatingText?.(target,"First chain target","status");
        hapticV106?.("select");
        renderBattle();
        show?.("Choose one enemy in the other row for Chain Slam.");
        return;
      }
      const first = unitV129(pick.firstId,pick.firstSide);
      if(!first){
        state.chainSlamPickV127 = null;
        renderBattle();
        return;
      }
      if(!target){
        const remaining = targets(c,a);
        commitChainSlamV129(c,a,first,remaining[0] || null);
        return;
      }
      if(!targets(c,a).includes(target)) return;
      commitChainSlamV129(c,a,first,target);
      return;
    }
    if(state) state.chainSlamPickV127 = null;
    return planBeforeV129(target);
  };

  const applyBeforeV129 = apply;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV129(c,a,t);
    const k = kindV129(a);
    if(k === "hopeDelayedJudgementV129" || (c.id === "hope" && a.id === "judgement")){
      scheduleDelayedJudgementV129(c,a,t);
      return;
    }
    if(k === "dulerChainSwipe"){
      const buff = consumeAttackBuffV129(c);
      const victims = frontRowsV129(enemySideV129(c.side)).flatMap(row => rowUnitsV129(enemySideV129(c.side),row));
      for(const enemy of victims){
        const before = enemy.hp;
        damage(c,enemy,(a.dmg || 4) + buff.bonus,{attack:true,aoe:true,melee:true});
        if(hitV129(before,enemy)){
          addDreadV129(enemy);
          applyBuffBleedV129(c,enemy,buff);
        }
      }
      return;
    }
    if(k === "dulerChainSlam"){
      if(!t || t.dead) return;
      const planObj = state?.plans?.find(p => p.pid === state.currentActionKey);
      const extra = planObj?.extraTargetId ? unitV129(planObj.extraTargetId,planObj.extraTargetSide) : null;
      const victims = [t];
      if(extra && extra !== t && !extra.dead) victims.push(extra);
      const buff = consumeAttackBuffV129(c);
      for(const enemy of victims){
        const before = enemy.hp;
        damage(c,enemy,(a.dmg || 4) + buff.bonus,{attack:true,aoe:true,melee:true});
        if(hitV129(before,enemy)){
          addStatus(enemy,"exhausted",1);
          applyBuffBleedV129(c,enemy,buff);
        }
      }
      return;
    }
    return applyBeforeV129(c,a,t);
  };

  const endRoundBeforeV129 = endRound;
  endRound = function(){
    const result = endRoundBeforeV129();
    resolveDelayedJudgementsV129();
    if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
    return result;
  };

  function ensureBattleLogCloseV129(){
    const panel = $("infoPanelSheet");
    if(!panel) return;
    let btn = $("battleLogCloseBtnV128");
    if(!btn){
      btn = document.createElement("button");
      btn.id = "battleLogCloseBtnV128";
      btn.type = "button";
      btn.setAttribute("aria-label","Close battle log");
      btn.textContent = "x";
      panel.appendChild(btn);
    }
    btn.onclick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setBattlePanelV101?.("closed");
      renderBattle();
    };
    btn.hidden = panel.classList.contains("panelClosedV101") || !panel.classList.contains("showLogV101");
    const logBtn = $("battleLogToggleBtn");
    if(logBtn) logBtn.textContent = "Log";
  }

  const renderBattleBeforeV129 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV129();
    ensureBattleLogCloseV129();
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    resolveDelayedJudgementsV129,
    addDreadV129
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v128 delayed actions, Dread, Chain Slam, and log close hardening ===== */
{
  const sideEnemyV128 = side => side === "player" ? "enemy" : "player";
  const aliveV128 = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const unitBySideV128 = (id, side) => (state?.units || []).find(u => u && u.id === id && u.side === side && !u.dead);
  const rowOrderV128 = side => side === "player" ? ["front","back"] : ["front","back"];
  const rowsWithUnitsV128 = side => rowOrderV128(side).filter(row => aliveV128(side).some(u => u.row === row));
  const rowUnitsV128 = (side, row) => aliveV128(side).filter(u => u.row === row).sort((a,b)=>(a.col||0)-(b.col||0));
  const hitV128 = (before, target) => !!target && Number.isFinite(before) && target.hp < before;
  const kindV128 = a => a?.effect || a?.kind || a?.id || "";

  if(typeof STATUS_LABELS_V17 !== "undefined"){
    STATUS_LABELS_V17.dread = {
      title:"Dread",
      text:"Next turn, this character is limited to 2 actions."
    };
    STATUS_LABELS_V17.delayedJudgement = {
      title:"Delayed Judgement",
      text:"A delayed attack is waiting and will strike at the start of the next round."
    };
  }
  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.dread = STATUS_LABELS_V17?.dread || KEYWORDS_V32.dread;
    KEYWORDS_V32.hit = {
      title:"Hit",
      text:"An attack hit when the target lost life from that attack."
    };
  }
  if(window.KEYWORDS_V32_SAFE){
    window.KEYWORDS_V32_SAFE.dread = STATUS_LABELS_V17?.dread || window.KEYWORDS_V32_SAFE.dread;
    window.KEYWORDS_V32_SAFE.hit = KEYWORDS_V32?.hit || window.KEYWORDS_V32_SAFE.hit;
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread","Hit","hit"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const rosterV128 = typeof ROSTER !== "undefined" && Array.isArray(ROSTER) ? ROSTER : [];
  const hopeDefV128 = rosterV128.find(c => c.id === "hope");
  const judgementV128 = hopeDefV128?.abilities?.find(a => a.id === "judgement");
  if(judgementV128){
    judgementV128.name = "Delayed Judgement";
    judgementV128.effect = "hopeDelayedJudgementV128";
    judgementV128.kind = "delayedAttack";
    judgementV128.dmg = 6;
    judgementV128.delay = 1;
    judgementV128.range = "ranged";
    judgementV128.text = "Delayed ranged attack. Choose one enemy. At the start of next round, deal 6 damage.";
  }

  function addDreadV128(target){
    if(!target || target.dead) return;
    if(typeof setDreadLimitV122 === "function") setDreadLimitV122(target);
    else addStatus(target,"dread",1);
    target.status = target.status || {};
    target.status.dread = Math.max(target.status.dread || 0, 1);
  }

  function scheduleDelayedJudgementV128(c,a,t){
    if(!c || !a || !t || t.dead) return;
    state.delayedActionsV128 = Array.isArray(state.delayedActionsV128) ? state.delayedActionsV128 : [];
    state.delayedActionsV128.push({
      sourceId:c.id,
      sourceSide:c.side,
      targetId:t.id,
      targetSide:t.side,
      dueRound:(state.round || 1) + (a.delay || 1),
      dmg:a.dmg || 6,
      abilityName:a.name || "Delayed Judgement"
    });
    t.status = t.status || {};
    t.status.delayedJudgement = Math.max(t.status.delayedJudgement || 0, 1);
    spawnFloatingText?.(t,"Judgement next round","status");
    pushActionEvent?.("statusGain", `${c.name}'s ${a.name || "Delayed Judgement"} will strike ${t.name} next round`, t);
    log(`${c.name} prepared ${a.name || "Delayed Judgement"} against ${t.name}.`);
  }

  function resolveDelayedJudgementsV128(){
    if(!state) return;
    const due = [];
    const pending = [];
    for(const item of state.delayedActionsV128 || []){
      if(item && item.dueRound <= (state.round || 1)) due.push(item);
      else if(item) pending.push(item);
    }
    state.delayedActionsV128 = pending;
    for(const item of due){
      const source = unitBySideV128(item.sourceId,item.sourceSide);
      const target = unitBySideV128(item.targetId,item.targetSide);
      if(!source || !target) continue;
      if(target.status) delete target.status.delayedJudgement;
      state.currentActionKey = `delayed:${item.sourceSide}:${item.sourceId}:${item.targetSide}:${item.targetId}:${state.round}`;
      spawnFloatingText?.(source,item.abilityName || "Delayed Judgement","status");
      addMomentClassV106?.(tileElForUnitV106?.(source), "activeActionV125", 540);
      damage(source,target,item.dmg || 6,{attack:true,melee:false,ranged:true});
      pushActionEvent?.("hit", `${item.abilityName || "Delayed Judgement"} struck ${target.name}`, target);
      log(`${item.abilityName || "Delayed Judgement"} struck ${target.name}.`);
      state.currentActionKey = null;
    }
  }

  function commitChainSlamPlanV128(c,a,first,second){
    if(!c || !a || !first || state.actionsLeft < (a.cost || 0)) return false;
    state.actionsLeft -= a.cost || 0;
    const p = makePlan(c,a,first,"player");
    if(second && !second.dead){
      p.extraTargetId = second.id;
      p.extraTargetSide = second.side;
    }
    state.plans.push(p);
    log(`${c.name} queued ${a.name} on ${first.name}${second ? ` and ${second.name}` : ""}.`);
    state.chainSlamPickV127 = null;
    selectedId = null;
    selectedSide = null;
    pendingAbility = null;
    addMomentClassV106?.(tileElForUnitV106?.(c), "planCommitV106", 520);
    addMomentClassV106?.(tileElForUnitV106?.(first), "targetPingV106", 520);
    if(second) addMomentClassV106?.(tileElForUnitV106?.(second), "targetPingV106", 520);
    pulseQueueV106?.();
    hapticV106?.("commit");
    playSfxV106?.("commit");
    renderBattle();
    return true;
  }

  const targetsBeforeV128 = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    if(kindV128(a) === "dulerChainSlam"){
      const pick = state?.chainSlamPickV127;
      const enemySide = sideEnemyV128(c.side);
      if(pick && pick.unitId === c.id && pick.unitSide === c.side && pick.abilityId === a.id){
        const first = unitBySideV128(pick.firstId,pick.firstSide);
        if(!first) return [];
        return rowsWithUnitsV128(enemySide)
          .filter(row => row !== first.row)
          .flatMap(row => rowUnitsV128(enemySide,row))
          .filter(u => u && u !== first);
      }
      return aliveV128(enemySide);
    }
    return targetsBeforeV128(c,a);
  };

  const planBeforeV128 = plan;
  plan = function(target){
    const c = selectedUnit?.();
    const a = pendingAbility;
    if(c && a && kindV128(a) === "dulerChainSlam" && state?.phase === "planning"){
      const pick = state.chainSlamPickV127;
      if(!pick){
        if(!target || !targets(c,a).includes(target)) return;
        state.chainSlamPickV127 = {unitId:c.id,unitSide:c.side,abilityId:a.id,firstId:target.id,firstSide:target.side};
        const remainingTargets = targets(c,a);
        if(!remainingTargets.length){
          commitChainSlamPlanV128(c,a,target,null);
          return;
        }
        spawnFloatingText?.(target,"First chain target","status");
        hapticV106?.("select");
        renderBattle();
        show?.("Choose one enemy in the other row for Chain Slam.");
        return;
      }
      const first = unitBySideV128(pick.firstId,pick.firstSide);
      if(!first){
        state.chainSlamPickV127 = null;
        renderBattle();
        return;
      }
      if(!target){
        const remainingTargets = targets(c,a);
        commitChainSlamPlanV128(c,a,first,remainingTargets[0] || null);
        return;
      }
      if(!targets(c,a).includes(target)) return;
      commitChainSlamPlanV128(c,a,first,target);
      return;
    }
    if(state) state.chainSlamPickV127 = null;
    return planBeforeV128(target);
  };

  const applyBeforeV128 = apply;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV128(c,a,t);
    const k = kindV128(a);
    if(k === "hopeDelayedJudgementV128" || (c.id === "hope" && a.id === "judgement")){
      scheduleDelayedJudgementV128(c,a,t);
      return;
    }
    if(k === "dulerChainSwipe"){
      const enemySide = sideEnemyV128(c.side);
      const frontRows = typeof frontRowsV125 === "function" ? frontRowsV125(enemySide) : rowsWithUnitsV128(enemySide).slice(0,1);
      const victims = frontRows.flatMap(row => rowUnitsV128(enemySide,row));
      for(const enemy of victims){
        const before = enemy.hp;
        damage(c,enemy,a.dmg || 4,{attack:true,aoe:true,melee:true});
        if(hitV128(before,enemy)) addDreadV128(enemy);
      }
      return;
    }
    return applyBeforeV128(c,a,t);
  };

  const endRoundBeforeV128 = endRound;
  endRound = function(){
    const result = endRoundBeforeV128();
    resolveDelayedJudgementsV128();
    if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
    return result;
  };

  function ensureLogCloseButtonV128(){
    const panel = $("infoPanelSheet");
    if(!panel) return;
    let btn = $("battleLogCloseBtnV128");
    if(!btn){
      btn = document.createElement("button");
      btn.id = "battleLogCloseBtnV128";
      btn.type = "button";
      btn.setAttribute("aria-label","Close battle log");
      btn.textContent = "x";
      btn.addEventListener("click", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        setBattlePanelV101?.("closed");
        renderBattle();
      });
      panel.appendChild(btn);
    }
    const isOpen = !panel.classList.contains("panelClosedV101") && panel.classList.contains("showLogV101");
    btn.hidden = !isOpen;
    const logBtn = $("battleLogToggleBtn");
    if(logBtn) logBtn.textContent = "Log";
  }

  const renderBattleBeforeV128 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV128();
    ensureLogCloseButtonV128();
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    resolveDelayedJudgementsV128,
    addDreadV128
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v123 front-row rules, guard tags, bleed-hit timing, and latest balance ===== */
function patchCharV123(id, props){
  const c = ROSTER.find(x=>x.id===id);
  if(c) Object.assign(c, props);
  return c;
}

function patchAbilityV123(charId, abilityId, props){
  const a = ROSTER.find(c=>c.id===charId)?.abilities?.find(x=>x.id===abilityId);
  if(a) Object.assign(a, props);
  return a;
}

function firstAbilityV123(charId, predicate){
  return ROSTER.find(c=>c.id===charId)?.abilities?.find(predicate);
}

function sideUnitKeyV123(u){
  return u ? `${u.side || ""}:${u.id}` : "";
}

function liveNormalRowsV123(side){
  const sideUnits = alive(side).filter(u=>u.size!=="boss" && u.size!=="rowBoss");
  const rows = [];
  if(sideUnits.some(u=>u.row==="front")) rows.push("front");
  if(sideUnits.some(u=>u.row==="back")) rows.push("back");
  if(alive(side).some(u=>u.size==="rowBoss")) rows.push(...alive(side).filter(u=>u.size==="rowBoss").map(u=>u.row));
  if(alive(side).some(u=>u.size==="boss")) rows.push("front","back");
  return [...new Set(rows)];
}

function dynamicFrontRowV123(side){
  const rows = liveNormalRowsV123(side);
  if(rows.includes("front")) return "front";
  if(rows.includes("back")) return "back";
  return "front";
}

function dynamicBackRowV123(side){
  const rows = liveNormalRowsV123(side);
  if(rows.includes("back")) return "back";
  if(rows.includes("front")) return "front";
  return "back";
}

function isDynamicFrontUnitV123(u){
  if(!u || u.dead) return false;
  if(u.size==="boss") return true;
  return u.row === dynamicFrontRowV123(u.side);
}

function isDynamicBackUnitV123(u){
  if(!u || u.dead) return false;
  if(u.size==="boss") return true;
  return u.row === dynamicBackRowV123(u.side);
}

const rowUnitsBeforeV123 = rowUnits;
rowUnits = function(side,row){
  if(row === "front") return alive(side).filter(isDynamicFrontUnitV123);
  if(row === "back") return alive(side).filter(isDynamicBackUnitV123);
  return rowUnitsBeforeV123(side,row);
};

frontBlocked = function(side){
  return alive(side).some(isDynamicFrontUnitV123);
};

patchAbilityV123("maoja","hands", {
  guard:true,
  guardType:true,
  spd:99,
  desc:"Guard buff. Choose an ally. Until the end of next round, that ally's melee hits apply 2 Poison to the target."
});

patchCharV123("fuego", {
  hp:18,
  armor:1
});
patchAbilityV123("fuego","stoke", {
  cost:2,
  stacks:3,
  desc:"Firecraft. Gain 3 Flame counters."
});
patchAbilityV123("fuego","nova", {
  mult:2,
  desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to 2 times the removed Flame counters to all enemies. Fuego gains Exhausted."
});

patchAbilityV123("maoja","breath", {
  range:"front",
  frontRowOnly:true,
  desc:"Front-row attack. Deal 1 damage to each enemy in the current front row, then apply 3 Poison to each of them."
});

patchAbilityV123("shaman","rupture", {
  bonus:0,
  desc:"Demon payoff. Remove all Poison and Bleed from one enemy. Deal removed counters x2 damage, ignoring Armor."
});

patchAbilityV123("kku","guard", {
  effect:"iceGuardRetaliate",
  kind:"iceGuardRetaliate",
  guard:true,
  guardType:true,
  armor:2,
  stacks:1,
  desc:"Guard. K'ku gains +2 Armor this turn. Whenever an enemy melee attacks K'ku this turn, that attacker gains 1 Freeze."
});

patchAbilityV123("dravain","bash", {
  name:"Vampiric Grab",
  cost:1,
  spd:0,
  effect:"vampiricGrab",
  kind:"vampiricGrab",
  range:"melee",
  dmg:2,
  pierce:2,
  bleed:2,
  heal:2,
  guardBonus:2,
  guardType:false,
  desc:"Melee attack. Deal 2 damage with Pierce 2. If hit, the target gains 2 Bleed and Dravain restores 2 HP. If the target performed a Guard move this round, deal +2 damage."
});

const evaGrabV123 = firstAbilityV123("eva", a=>a.id==="kiss" || /vampire kiss/i.test(a.name || "")) ||
  firstAbilityV123("eva", a=>a.id==="dash");
if(evaGrabV123){
  Object.assign(evaGrabV123, {
    id:"kiss",
    name:"Vampiric Grab",
    cost:1,
    spd:0,
    effect:"vampiricGrab",
    kind:"vampiricGrab",
    range:"melee",
    dmg:2,
    pierce:2,
    bleed:2,
    heal:2,
    guardBonus:2,
    desc:"Melee attack. Deal 2 damage with Pierce 2. If hit, the target gains 2 Bleed and Lady Eva restores 2 HP. If the target performed a Guard move this round, deal +2 damage."
  });
}

patchAbilityV123("paleya","mesmer", {
  name:"Fae Portal Grab",
  cost:1,
  spd:0,
  effect:"faePortalGrab",
  kind:"faePortalGrab",
  range:"melee",
  backlineReach:true,
  dmg:3,
  guardBonus:3,
  desc:"Melee attack. Can target enemies at range. Deal 3 damage. If the target performed a Guard move this round, deal +3 damage."
});

function isGuardAbilityV123(a){
  const k = a?.kind || a?.effect || "";
  const txt = `${a?.name || ""} ${a?.desc || ""} ${k}`.toLowerCase();
  return !!(a?.guard || a?.guardType ||
    ["protect","ward","dodge","predict","predictPoison","selfCounter","spirit","bloodWard","frostArmorRetaliate","poisonHands","iceGuardRetaliate","mirrorHypnoticGuard","grantShield","hopeShield","dragonScales"].includes(k) ||
    /\bguard\b|protect|ward|dodge|counter|shield|armor this turn|scales/.test(txt));
}

for(const c of ROSTER){
  for(const a of c.abilities || []){
    if(isGuardAbilityV123(a)){
      a.guardType = true;
      a.tags = [...new Set([...(a.tags || []), "guard"])];
    }
  }
}

function markPerformedGuardV123(c,a){
  if(!state || !c || !isGuardAbilityV123(a)) return;
  state.guardActionsV123 = state.guardActionsV123 || {};
  state.guardActionsV123[sideUnitKeyV123(c)] = true;
  c.performedGuardRoundV123 = state.round;
}

function hasPerformedGuardV123(u){
  if(!state || !u) return false;
  return !!(u.performedGuardRoundV123 === state.round ||
    state.guardActionsV123?.[sideUnitKeyV123(u)] ||
    state.guarded?.[u.id]);
}

const targetsBeforeV123 = targets;
targets = function(c,a){
  if(!c || !a) return [];
  const enemies = alive(other(c.side));
  const k = a.kind || a.effect;
  if(a.frontRowOnly || a.range === "front") return enemies.filter(isDynamicFrontUnitV123);
  if(k === "faePortalGrab") return enemies;
  if(a.range === "melee" && !a.backlineReach && !a.portalReach) return enemies.filter(isDynamicFrontUnitV123);
  return targetsBeforeV123(c,a);
};

const aiValidTargetsBeforeV123 = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
if(aiValidTargetsBeforeV123){
  aiValidTargetsV95 = function(c,a){
    if(!c || !a) return [];
    const enemies = alive(other(c.side));
    const k = a.kind || a.effect;
    if(a.frontRowOnly || a.range === "front") return enemies.filter(isDynamicFrontUnitV123);
    if(k === "faePortalGrab") return enemies;
    if(a.range === "melee" && !a.backlineReach && !a.portalReach) return enemies.filter(isDynamicFrontUnitV123);
    return aiValidTargetsBeforeV123(c,a);
  };
}

const applyBeforeV123 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeV123(c,a,t);
  markPerformedGuardV123(c,a);
  const k = a.kind || a.effect;

  if(k === "rowDamageStatus" && (a.frontRowOnly || a.range === "front")){
    rowUnits(other(c.side),"front").forEach(x=>{
      damage(c,x,a.dmg || 0,{attack:true,aoe:true,melee:false});
      applyStatusFrom?.(c,x,a.status,a.stacks);
    });
    return;
  }

  if(k === "vampiricGrab"){
    if(!t || t.dead) return;
    const raw = (a.dmg || 2) + (hasPerformedGuardV123(t) ? (a.guardBonus || 0) : 0);
    const beforeHp = t.hp;
    damage(c,t,raw,{attack:true,melee:true,pierce:a.pierce || 0});
    const hit = beforeHp > (t?.hp ?? beforeHp);
    if(hit && t && !t.dead){
      applyStatusFrom?.(c,t,"bleed",a.bleed || 2);
      heal(c,a.heal || 2);
    }
    return;
  }

  if(k === "faePortalGrab"){
    if(!t || t.dead) return;
    const raw = (a.dmg || 3) + (hasPerformedGuardV123(t) ? (a.guardBonus || 0) : 0);
    damage(c,t,raw,{attack:true,melee:true});
    return;
  }

  return applyBeforeV123(c,a,t);
};

const damageBeforeV123 = damage;
damage = function(src,t,amt,opt={}){
  const originalTarget = t;
  const beforeHp = originalTarget?.hp ?? null;
  const beforeBleed = opt?.attack && originalTarget ? (originalTarget.status?.bleed || 0) : 0;
  const beforeSrcFreeze = src?.status?.freeze || 0;
  const guardRetaliateReady = !!(opt?.attack && opt?.melee && originalTarget?.buff?.iceGuardRetaliateV118 && src && !src.dead);

  if(beforeBleed > 0 && originalTarget?.status){
    originalTarget.status.bleed = 0;
  }

  const result = damageBeforeV123(src,t,amt,opt);

  if(beforeBleed > 0 && originalTarget && !originalTarget.dead){
    originalTarget.status.bleed = (originalTarget.status.bleed || 0) + beforeBleed;
    const hpLostByAttack = beforeHp !== null ? Math.max(0, beforeHp - originalTarget.hp) : 0;
    if(hpLostByAttack > 0){
      originalTarget.status.bleed = Math.max(0, (originalTarget.status.bleed || 0) - beforeBleed);
      loseHpDirect(originalTarget,beforeBleed,"Bleed after hit");
      pushActionEvent?.("hp", `${originalTarget.name}'s Bleed resolved after being hit for ${beforeBleed} HP`, originalTarget, {value:beforeBleed});
      log(`${originalTarget.name}'s Bleed resolves after the hit for ${beforeBleed} HP and is removed.`);
    }
  }

  if(opt?.attack && beforeHp !== null && originalTarget){
    const hpLost = Math.max(0, beforeHp - originalTarget.hp);
    if(hpLost > 0){
      state.hitThisRoundV123 = state.hitThisRoundV123 || {};
      state.hitThisRoundV123[sideUnitKeyV123(originalTarget)] = true;
    }
  }

  if(guardRetaliateReady && (src.status?.freeze || 0) <= beforeSrcFreeze){
    const stacks = originalTarget.buff.iceGuardRetaliateV118.stacks || 1;
    addStatus(src,"freeze",stacks);
    markPassive?.(originalTarget, "Ice Guard");
    pushActionEvent?.("statusGain", `${src.name} gained ${stacks} Freeze from Ice Guard`, src);
    log(`${src.name} gains ${stacks} Freeze from ${originalTarget.name}'s Ice Guard.`);
  }

  return result;
};

const endRoundBeforeV123 = endRound;
endRound = function(){
  if(state){
    state.guardActionsV123 = {};
    state.hitThisRoundV123 = {};
    for(const u of state.units || []) delete u.performedGuardRoundV123;
  }
  return endRoundBeforeV123();
};

const aiExpectedRawDamageBeforeV123 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
if(aiExpectedRawDamageBeforeV123){
  aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "vampiricGrab") return (a.dmg || 2) + (hasPerformedGuardV123(t) ? (a.guardBonus || 0) : 0);
    if(k === "faePortalGrab") return (a.dmg || 3) + (hasPerformedGuardV123(t) ? (a.guardBonus || 0) : 0);
    if(k === "demonRupture") return ((t ? aiStatusV95(t,"poison") + aiStatusV95(t,"bleed") : 0) * (a.mult || 2)) + (a.bonus || 0);
    if(k === "fuegoSuperNova"){
      const flame = Math.max(0, c?.status?.flame || 0);
      return flame * (a.mult ?? 2) * Math.max(1, aiEnemiesV95?.(c)?.length || 1);
    }
    return aiExpectedRawDamageBeforeV123(a,t,c);
  };
}

if(typeof KEYWORDS_V32 !== "undefined"){
  KEYWORDS_V32.hit = {
    title:"Hit",
    text:"An attack hits only when the target loses HP after Armor and Shield are applied. Effects that say \"if hit\" do not trigger when the attack is fully blocked."
  };
  KEYWORDS_V32.bleed = {
    ...(KEYWORDS_V32.bleed || {title:"Bleed"}),
    text:"Bleed counters stay on the character until an attack hits them. After that HP loss, all Bleed counters resolve as direct HP loss and are removed."
  };
}
if(Array.isArray(KEYWORD_PATTERN_V32)){
  ["Hit","hit"].forEach(word=>{
    if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  });
}

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v118 requested rules/balance fixes ===== */
function abilityV118(characterId, abilityId){
  return ROSTER.find(c=>c.id===characterId)?.abilities?.find(a=>a.id===abilityId);
}

function patchAbilityV118(characterId, abilityId, patch){
  const ability = abilityV118(characterId, abilityId);
  if(ability) Object.assign(ability, patch);
  return ability;
}

function tuneRequestedRulesV118(){
  const dravain = ROSTER.find(c=>c.id === "dravain");
  if(dravain){
    dravain.passive = "Passive - Blood Guard: Blood Claim restores HP equal to the HP damage it deals.";
  }

  patchAbilityV118("smithen","iceNeedle", {
    effect:"damageStatusOnHit",
    dmg:4,
    status:"freeze",
    stacks:2,
    range:"melee",
    desc:"Melee icecraft attack. Deal 4 damage. If this hit deals HP damage, apply 2 Freeze."
  });

  patchAbilityV118("dravain","bash", {
    effect:"damage",
    dmg:6,
    range:"melee",
    desc:"Melee warrior attack. Deal 6 damage."
  });

  patchAbilityV118("dravain","claim", {
    effect:"consumeBleed",
    mult:1,
    bonus:2,
    healDealt:true,
    heal:0,
    range:"ranged",
    desc:"Bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +2 damage. Dravain restores HP equal to the HP damage dealt."
  });

  patchAbilityV118("kku","guard", {
    effect:"iceGuardRetaliate",
    guard:true,
    armor:1,
    status:"freeze",
    stacks:2,
    shield:0,
    desc:"Guard. K'ku gains +1 Armor until end of round. If K'ku loses HP from a melee attack this round, the attacker gains 2 Freeze."
  });

  patchAbilityV118("kku","slam", {
    effect:"damageStatusOnHit",
    dmg:5,
    status:"freeze",
    stacks:1,
    range:"melee",
    desc:"Front-line brute attack. Deal 5 damage. If this hit deals HP damage, apply 1 Freeze."
  });

  patchAbilityV118("kku","break", {
    effect:"glacier",
    dmg:5,
    bonus:5,
    scaleFreeze:true,
    range:"melee",
    desc:"Front-line brute payoff. Deal 5 damage, +1 damage per Freeze counter on the target. If the target is Frozen, deal +5 damage."
  });

  patchAbilityV118("poom","bash", {
    effect:"damage",
    dmg:6,
    range:"melee",
    desc:"Front-line brute attack. Deal 6 damage."
  });

  for(const id of ["revenge","bodyguard"]){
    patchAbilityV118("poom",id, {
      effect:"revenge",
      dmg:5,
      self:0,
      bonus:5,
      range:"melee",
      desc:"Front-line brute attack. Deal 5 damage. If Poom was dealt HP damage this round, deal +5 damage."
    });
  }

  patchAbilityV118("fuego","nova", {
    desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to 2 times the removed Flame counters to all enemies. Fuego gains Exhausted.",
    mult:2
  });
}
tuneRequestedRulesV118();

function resolveDelayedActionsV118(){
  const queue = state?.delayedActionsV96 || [];
  if(!queue.length) return;
  const ready = queue.filter(item => item && item.dueRound <= state.round);
  if(!ready.length) return;
  state.delayedActionsV96 = queue.filter(item => item && item.dueRound > state.round);
  for(const item of ready){
    const src = state.units?.find(u => u.id === item.sourceId && u.side === item.sourceSide && !u.dead);
    const target = state.units?.find(u => u.id === item.targetId && (!item.targetSide || u.side === item.targetSide) && !u.dead);
    if(!src || !target){
      log(`${item.abilityName || "Delayed attack"} fizzles because its source or target is gone.`);
      continue;
    }
    state.currentActionKey = `delayed:${item.sourceSide}:${item.sourceId}:${item.targetId}:${state.round}`;
    pushActionEvent?.("delay", `${src.name}'s delayed attack hits ${target.name}`, target);
    log(`${src.name}'s delayed attack hits ${target.name}.`);
    damage(src,target,item.dmg || 6,{attack:true,melee:false});
    state.currentActionKey = null;
    if(checkWin?.()) break;
  }
}

const endRoundBeforeRequestedRulesV118 = endRound;
endRound = function(){
  const result = endRoundBeforeRequestedRulesV118();
  if(state && state.phase === "planning"){
    resolveDelayedActionsV118();
    renderBattle?.();
  }
  return result;
};

const damageBeforeRequestedRulesV118 = damage;
damage = function(src,t,amt,opt={}){
  const beforeHp = t?.hp ?? null;
  const beforePoison = t?.status?.poison || 0;
  const result = damageBeforeRequestedRulesV118(src,t,amt,opt);
  const hpLost = beforeHp != null && t ? Math.max(0, beforeHp - (t.hp || 0)) : 0;

  if(src?.buff?.poisonHands && opt?.attack && t && !t.dead && (t.status?.poison || 0) <= beforePoison){
    applyStatusFrom?.(src,t,"poison",2);
    markPassive?.(src, "Poison Hands");
    pushActionEvent?.("passive", `Poison Hands applied 2 Poison`, src);
  }

  if(hpLost > 0 && opt?.attack && opt?.melee && t?.buff?.iceGuardRetaliateV118 && src && !src.dead){
    const stacks = t.buff.iceGuardRetaliateV118.stacks || 2;
    addStatus(src,"freeze",stacks);
    markPassive?.(t, "Ice Guard");
    pushActionEvent?.("statusGain", `${src.name} gained ${stacks} Freeze from Ice Guard`, src);
    log(`${src.name} gains ${stacks} Freeze from ${t.name}'s Ice Guard.`);
  }

  return result;
};

const applyBeforeRequestedRulesV118 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeRequestedRulesV118(c,a,t);
  const k = a.kind || a.effect;

  switch(k){
    case "poisonHands":
      if(t && !t.dead){
        t.buff = t.buff || {};
        t.buff.poisonHands = Math.max(Number(t.buff.poisonHands) || 0, 2);
        t.buff.poisonHandsExpiresRoundV118 = (state.round || 1) + 1;
        spawnFloatingText?.(t, "Poison Hands", "status");
        pushActionEvent?.("statusGain", `${t.name}'s damaging hits apply 2 Poison until end of next round`, t);
        log(`${t.name}'s damaging hits apply 2 Poison until the end of next round.`);
      }
      return;

    case "iceGuardRetaliate":
      if(c && !c.dead){
        c.buff = c.buff || {};
        c.buff.iceGuardRetaliateV118 = { stacks:a.stacks || 2, round:state.round };
        addArmorThisRound?.(c,a.armor || 1);
        state.guarded = state.guarded || {};
        state.guarded[c.id] = true;
        spawnFloatingText?.(c, "Ice Guard", "shield");
        pushActionEvent?.("armorGain", `${c.name} gained +${a.armor || 1} Armor and readied Ice Guard`, c);
        log(`${c.name} readies Ice Guard.`);
      }
      return;

    case "consumeBleed": {
      if(a.healDealt){
        const bleed = t?.status?.bleed || 0;
        if(t) t.status.bleed = 0;
        const dealt = damage(c,t,bleed * (a.mult ?? 1) + (a.bonus ?? 0),{
          attack:true,
          melee:a.range === "melee",
          pierce:a.pierce || 0,
          ignoreArmor:!!a.ignoreArmor
        }) || 0;
        if(dealt > 0) heal(c,dealt);
        return;
      }
      return applyBeforeRequestedRulesV118(c,a,t);
    }

    case "glacier": {
      const freeze = t?.status?.freeze || 0;
      const frozenBonus = t?.status?.frozen ? (a.bonus ?? 5) : 0;
      const scaling = a.scaleFreeze ? freeze : ((freeze > 0) ? (a.bonus ?? 2) : 0);
      damage(c,t,(a.dmg ?? 5) + scaling + frozenBonus,{attack:true,melee:a.range === "melee"});
      return;
    }

    case "revenge": {
      const wasDamaged = !!state?.attacked?.[c.id];
      damage(c,t,(a.dmg ?? 5) + (wasDamaged ? (a.bonus ?? 5) : 0),{attack:true,melee:a.range === "melee"});
      return;
    }

    case "fuegoSuperNova": {
      const flame = consumeFlameV116(c);
      const dmg = flame * (a.mult ?? 2);
      for(const enemy of alive(other(c.side))){
        if(!enemy.dead) damage(c,enemy,dmg,{attack:true,aoe:true});
      }
      addStatus(c,"exhausted",1);
      log(`${c.name} spends ${flame} Flame on Super Nova.`);
      return;
    }

    default:
      return applyBeforeRequestedRulesV118(c,a,t);
  }
};

const aiExpectedRawDamageBeforeRequestedRulesV118 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
if(aiExpectedRawDamageBeforeRequestedRulesV118){
  aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "fuegoSuperNova"){
      const flame = Math.max(0, c?.status?.flame || 0);
      return flame * (a.mult ?? 2) * Math.max(1, aiEnemiesV95?.(c)?.length || 1);
    }
    if(k === "revenge") return (a.dmg ?? 5) + (state?.attacked?.[c?.id] ? (a.bonus ?? 5) : 0);
    if(k === "glacier"){
      const freeze = t?.status?.freeze || 0;
      return (a.dmg ?? 5) + (a.scaleFreeze ? freeze : (freeze ? (a.bonus ?? 2) : 0)) + (t?.status?.frozen ? (a.bonus ?? 5) : 0);
    }
    return aiExpectedRawDamageBeforeRequestedRulesV118(a,t,c);
  };
}

if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v117 reliable mobile info/status taps ===== */
const openMobilePanelBeforeInfoTapV117 = typeof openMobilePanel === "function" ? openMobilePanel : null;
if(openMobilePanelBeforeInfoTapV117){
  openMobilePanel = function(mode="info"){
    if(typeof setBattlePanelV101 === "function"){
      setBattlePanelV101(mode === "log" ? "log" : "info");
      return;
    }
    return openMobilePanelBeforeInfoTapV117(mode);
  };
}

const closeMobilePanelBeforeInfoTapV117 = typeof closeMobilePanel === "function" ? closeMobilePanel : null;
if(closeMobilePanelBeforeInfoTapV117){
  closeMobilePanel = function(){
    if(typeof setBattlePanelV101 === "function"){
      setBattlePanelV101("closed");
      return;
    }
    return closeMobilePanelBeforeInfoTapV117();
  };
}

function unitFromNestedTileControlV117(control){
  const tileEl = control?.closest?.(".tile[data-unit-id]");
  const id = tileEl?.dataset?.unitId;
  const side = tileEl?.dataset?.side;
  if(!id) return null;
  return state?.units?.find(unit => unit.id === id && (!side || unit.side === side))
    || state?.units?.find(unit => unit.id === id)
    || null;
}

const showUnitInfoBeforeInfoTapV117 = typeof showUnitInfo === "function" ? showUnitInfo : null;
if(showUnitInfoBeforeInfoTapV117){
  showUnitInfo = function(u){
    const result = showUnitInfoBeforeInfoTapV117(u);
    if(u && !u.dead && typeof setBattlePanelV101 === "function") setBattlePanelV101("info");
    return result;
  };
}

const showStatusInfoBeforeInfoTapV117 = typeof showStatusInfo === "function" ? showStatusInfo : null;
if(showStatusInfoBeforeInfoTapV117){
  showStatusInfo = function(key){
    const info = STATUS_LABELS_V17[key] || STATUS_LABELS_V17[key?.replace?.(/[0-9]/g,"")];
    const result = showStatusInfoBeforeInfoTapV117(key);
    if(info && typeof setBattlePanelV101 === "function") setBattlePanelV101("info");
    return result;
  };
}

function activateNestedTileControlV117(target){
  const infoBtn = target?.closest?.(".unitInfoBtn");
  if(infoBtn){
    const u = unitFromNestedTileControlV117(infoBtn);
    if(u && !u.dead){
      showUnitInfo?.(u);
      hapticV106?.("tap");
      return true;
    }
    return false;
  }

  const statusBtn = target?.closest?.(".statusChip");
  if(statusBtn){
    showStatusInfo?.(statusBtn.dataset.status);
    hapticV106?.("tap");
    return true;
  }

  return false;
}

function stopNestedTileGestureV117(ev){
  ev.preventDefault?.();
  ev.stopPropagation?.();
  ev.stopImmediatePropagation?.();
}

if(!window.__nestedTileInfoTapV117Installed){
  window.__nestedTileInfoTapV117Installed = true;

  document.addEventListener("pointerdown", (ev) => {
    if(!ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    stopNestedTileGestureV117(ev);
    activateNestedTileControlV117(ev.target);
  }, {capture:true});

  document.addEventListener("pointerup", (ev) => {
    if(!ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    stopNestedTileGestureV117(ev);
  }, {capture:true});

  document.addEventListener("click", (ev) => {
    if(!ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    stopNestedTileGestureV117(ev);
  }, {capture:true});

  document.addEventListener("keydown", (ev) => {
    if(ev.key !== "Enter" && ev.key !== " ") return;
    if(!ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    stopNestedTileGestureV117(ev);
    activateNestedTileControlV117(ev.target);
  }, {capture:true});
}

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v109 clearer radial ability briefs ===== */
function abilityTypeV109(a){
  const text = `${a?.name || ""} ${a?.desc || ""} ${a?.effect || ""} ${a?.kind || ""}`.toLowerCase();
  const isAttack = /attack|deal .*damage|damage|hit|strike|slash|stab|bash|thrust|blade|needle|shot|pin|bite|drain|payoff/.test(text) || (a?.dmg || 0) > 0;
  const isArea = /all enemies|every enemy|enemy row|front row enemies|back row enemies|row setup|row control|aoe|\barea\b|\bmass\b|whiteout|\bfield\b|\brain\b|\broar\b/.test(text) || /^(row|all)/i.test(a?.effect || "");
  if(a?.guard || /protect|guard|ward|dodge|predict|counter/.test(text)) return {key:"guard", icon:"&#128737;", label:"Guard"};
  if(isArea) return {key:"aoe", icon:"&#9678;", label:"Area"};
  if(isAttack && (a?.range === "ranged" || /ranged|backline|precision|projectile|shot|pin|needle|blade/.test(text))) return {key:"ranged", icon:"&#10138;", label:"Ranged"};
  if(isAttack) return {key:"melee", icon:"&#9876;", label:"Melee"};
  if(a?.range === "ally" || /ally|buff|gain|grants|empowers|shield|armor|heal|restore|mend/.test(text)) return {key:"buff", icon:"&#10010;", label:"Buff"};
  if(a?.range === "ranged") return {key:"ranged", icon:"&#10138;", label:"Ranged"};
  return {key:"melee", icon:"&#9876;", label:"Melee"};
}

function safeHtmlV109(value){
  return typeof escapeHtmlV32 === "function"
    ? escapeHtmlV32(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
}

function abilityBriefIconsV109(caster, ability){
  const profKey = abilityIconKey?.(caster, ability) || caster?.class || "warrior";
  const profUrl = abilityIconUrl?.(caster, ability) || "";
  const type = abilityTypeV109(ability);
  return `
    <span class="wheelBriefIconsV109" aria-hidden="true">
      <span class="wheelProfIconV109" data-prof="${safeHtmlV109(profKey)}" style="background-image:url('${safeHtmlV109(profUrl)}')" title="${safeHtmlV109(profKey)}"></span>
      <span class="wheelTypeIconV109" data-ability-type="${safeHtmlV109(type.key)}" title="${safeHtmlV109(type.label)}">${type.icon}</span>
    </span>`;
}

function abilityTypeTagV109(a){
  const type = abilityTypeV109(a);
  return `<span>${safeHtmlV109(type.label)}</span>`;
}

const openWheelBeforeBriefV109 = typeof openWheel === "function" ? openWheel : null;
if(openWheelBeforeBriefV109){
  openWheel = function(u){
    const tile = document.querySelector(`.tile[data-unit-id="${u.id}"][data-side="${u.side}"]`) || document.querySelector(".tile.selected");
    const radial = $("radial");
    const wheel = $("wheel") || document.querySelector(".wheel");
    const tooltip = $("abilityTooltip");
    if(!radial || !wheel) return openWheelBeforeBriefV109(u);

    wheelPreviewAbilityIdV34 = null;
    radial.classList.remove("hidden");
    radial.classList.toggle("mobileRadialMode", isMobilePlayableV51());
    if(tooltip) {
      tooltip.classList.add("hidden");
      tooltip.classList.remove("mobileAbilitySheet");
    }

    let size;
    if(isMobilePlayableV51()){
      size = Math.min(window.innerWidth * 0.90, window.innerHeight * 0.38, 390);
      size = Math.max(315, size);
    } else {
      size = Math.min(380, Math.max(310, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
    }
    wheel.style.width = size + "px";
    wheel.style.height = size + "px";

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    if(!isMobilePlayableV51() && tile){
      const r = tile.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    }
    const margin = size / 2 + 8;
    cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
    cy = Math.max(margin + 10, Math.min(window.innerHeight - margin - 100, cy));
    wheel.style.left = cx + "px";
    wheel.style.top = cy + "px";

    $("wheelCenter").innerHTML = `
      <div class="miniCenterName">${safeHtmlV109(u.name)}</div>
      <div class="miniCenterHint">${isMobilePlayableV51() ? "tap twice" : "choose"}</div>
    `;

    $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
      const iconUrl = abilityIconUrl(u, a);
      const speedLabel = a.guard ? "Guard" : `Speed ${totalSpeed(u,a)}`;
      const dreadDisabled = typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a);
      const disabled = state.actionsLeft<a.cost || dreadDisabled;
      const dreadTitle = dreadDisabled ? ` title="Disabled by Dread until end of round"` : "";
      return `<button class="wheelBtn w${i} ${dreadDisabled ? "dreadDisabled" : ""}" ${disabled?"disabled":""}
        data-id="${safeHtmlV109(a.id)}" data-index="${i}" style="--prof-icon:url('${safeHtmlV109(iconUrl)}')"${dreadTitle}>
        ${dreadDisabled ? `<span class="dreadX">x</span>` : ""}
        ${abilityBriefIconsV109(u,a)}
        <span class="wheelBtnTitle">${safeHtmlV109(a.name)}</span>
        <span class="wheelBtnMeta">${dreadDisabled ? "Dread disabled" : `${a.cost} AP / ${speedLabel}`}</span>
      </button>`;
    }).join("");

    const chooseAbility = (a) => {
      if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a)) {
        showKeywordPopup?.("dread");
        return;
      }
      pendingAbility = a;
      radial.classList.add("hidden");
      if(tooltip) tooltip.classList.add("hidden");
      hideKeywordPopup?.();
      renderBattle();
      if(!targets(u,pendingAbility).length) plan(null);
    };

    const showTipFor = (btn, a) => {
      if(!tooltip) return;
      const type = abilityTypeV109(a);
      const disabledText = (typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a))
        ? `<div class="rulesClarifier">${renderKeywordText("Dread disables this ability until end of round.")}</div>`
        : "";
      tooltip.innerHTML = `
        <div class="tipTop">
          <span class="tipIcon" style="background-image:url('${safeHtmlV109(abilityIconUrl(u,a))}')"></span>
          <div>
            <b>${safeHtmlV109(a.name)}</b>
            <small>${safeHtmlV109(type.label)} / ${a.cost} AP / ${a.guard ? "Guard Priority" : `Speed ${totalSpeed(u,a)}`}</small>
          </div>
        </div>
        <div class="abilityDescText">${renderKeywordText ? renderKeywordText(a.desc) : safeHtmlV109(a.desc)}</div>
        ${disabledText}
        ${clarityTextForAbility ? clarityTextForAbility(a) : ""}
        <div class="tipTags">
          <span>${safeHtmlV109(abilityIconKey(u,a))}</span>
          ${abilityTypeTagV109(a)}
          <span>${safeHtmlV109(a.range || (a.guard ? "guard" : "self"))}</span>
          ${isMobilePlayableV51() ? "<span>drag center to aim, release to choose</span>" : ""}
        </div>
      `;
      tooltip.classList.remove("hidden");
      positionAbilityTooltipV34(tooltip, wheel, btn, Number(btn.dataset.index));
    };

    if(tooltip){
      tooltip.onpointerdown = (ev) => {
        const kw = ev.target.closest(".keywordLink");
        if(kw){
          ev.preventDefault();
          ev.stopPropagation();
          showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
        } else {
          ev.stopPropagation();
        }
      };
      tooltip.onclick = (ev) => {
        const kw = ev.target.closest(".keywordLink");
        if(kw){
          ev.preventDefault();
          ev.stopPropagation();
          showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
          return;
        }
        ev.stopPropagation();
      };
    }

    const wheelButtonsV112 = [...document.querySelectorAll(".wheelBtn")];
    let lastHapticPreviewIdV113 = null;
    const previewWheelButtonV112 = (btn, a) => {
      if(!btn || btn.disabled) return;
      wheelButtonsV112.forEach(x=>x.classList.remove("previewing"));
      btn.classList.add("previewing");
      if(isMobilePlayableV51() && a?.id && lastHapticPreviewIdV113 !== a.id){
        lastHapticPreviewIdV113 = a.id;
        hapticV106?.("select");
      }
      showTipFor(btn,a);
    };

    wheelButtonsV112.forEach(b=>{
      let tappedOnce = false;
      const a = u.abilities[Number(b.dataset.index)];
      b.onpointerenter = () => {
        if(!isMobilePlayableV51() && !b.disabled) {
          previewWheelButtonV112(b,a);
        }
      };
      b.onfocus = () => {
        if(!b.disabled) {
          previewWheelButtonV112(b,a);
        }
      };
      b.onpointerleave = () => {
        if(!isMobilePlayableV51()) b.classList.remove("previewing");
      };
      b.onclick = (ev) => {
        ev.stopPropagation();
        if(b.disabled) return;
        if(isMobilePlayableV51()){
          const already = b.classList.contains("previewing") || tappedOnce;
          previewWheelButtonV112(b,a);
          if(!already){
            tappedOnce = true;
            window.setTimeout(()=>{ tappedOnce = false; }, 900);
            return;
          }
        }
        chooseAbility(a);
      };
    });

    if(isMobilePlayableV51()){
      installRadialJoystickV112?.({
        radial,
        wheel,
        center:$("wheelCenter"),
        buttons:wheelButtonsV112,
        abilities:u.abilities,
        previewButton:previewWheelButtonV112,
        chooseAbility
      });
    }
  };
}

function installRadialJoystickV112({radial, wheel, center, buttons, abilities, previewButton, chooseAbility}){
  if(!radial || !wheel || !center || !buttons?.length) return;

  radial.classList.add("joystickRadialV112");
  center.classList.add("radialJoystickV112");
  center.setAttribute("role","button");
  center.setAttribute("aria-label","Drag to preview and choose an ability");
  center.tabIndex = 0;
  if(!center.querySelector(".joystickKnobV112")){
    center.insertAdjacentHTML("beforeend", `<span class="joystickKnobV112" aria-hidden="true"></span>`);
  }

  let dragging = false;
  let currentBtn = null;
  let currentDistance = 0;

  const clearAim = () => {
    currentBtn = null;
    currentDistance = 0;
    center.style.setProperty("--joy-x","0px");
    center.style.setProperty("--joy-y","0px");
    center.classList.remove("aimingV112","choosingV112");
    buttons.forEach(btn => btn.classList.remove("joystickTargetV112"));
  };

  const nearestButton = (clientX, clientY) => {
    const wr = wheel.getBoundingClientRect();
    const wx = wr.left + wr.width / 2;
    const wy = wr.top + wr.height / 2;
    const dx = clientX - wx;
    const dy = clientY - wy;
    currentDistance = Math.hypot(dx, dy);
    const maxOffset = Math.min(72, wr.width * .18);
    const scale = currentDistance > 0 ? Math.min(maxOffset, currentDistance) / currentDistance : 0;
    center.style.setProperty("--joy-x", `${dx * scale}px`);
    center.style.setProperty("--joy-y", `${dy * scale}px`);

    if(currentDistance < wr.width * .16) return null;

    let best = null;
    let bestScore = Infinity;
    for(const btn of buttons){
      if(btn.disabled) continue;
      const br = btn.getBoundingClientRect();
      const bx = br.left + br.width / 2;
      const by = br.top + br.height / 2;
      const score = Math.hypot(clientX - bx, clientY - by);
      if(score < bestScore){
        best = btn;
        bestScore = score;
      }
    }
    return best;
  };

  const updateAim = (ev) => {
    const btn = nearestButton(ev.clientX, ev.clientY);
    buttons.forEach(x => x.classList.remove("joystickTargetV112"));
    center.classList.toggle("aimingV112", !!btn);
    if(!btn){
      currentBtn = null;
      return;
    }
    currentBtn = btn;
    btn.classList.add("joystickTargetV112");
    previewButton(btn, abilities[Number(btn.dataset.index)]);
  };

  center.onpointerdown = (ev) => {
    if(!isMobilePlayableV51()) return;
    ev.preventDefault();
    ev.stopPropagation();
    dragging = true;
    center.classList.add("choosingV112");
    try{ center.setPointerCapture(ev.pointerId); }catch(_){}
    updateAim(ev);
  };

  center.onpointermove = (ev) => {
    if(!dragging) return;
    ev.preventDefault();
    ev.stopPropagation();
    updateAim(ev);
  };

  const finish = (ev) => {
    if(!dragging) return;
    ev.preventDefault();
    ev.stopPropagation();
    dragging = false;
    const chosen = currentBtn && currentDistance >= wheel.getBoundingClientRect().width * .20 ? currentBtn : null;
    clearAim();
    if(chosen) chooseAbility(abilities[Number(chosen.dataset.index)]);
  };

  center.onpointerup = finish;
  center.onpointercancel = finish;
  center.onclick = ev => {
    ev.preventDefault();
    ev.stopPropagation();
  };
}

window.__WANDERERS_ABILITY_BRIEF_TYPES = {
  melee:"close-range attack",
  ranged:"ranged attack",
  aoe:"area effect",
  buff:"buff/support",
  guard:"guard/reaction"
};

/* ===== v113 mobile radial tap fixes ===== */
document.addEventListener("click", (ev) => {
  const infoBtn = ev.target?.closest?.(".unitInfoBtn");
  if(!infoBtn) return;
  const tileEl = infoBtn.closest(".tile[data-unit-id]");
  const id = tileEl?.dataset?.unitId;
  const side = tileEl?.dataset?.side;
  const u = state?.units?.find(unit => unit.id === id && (!side || unit.side === side))
    || state?.units?.find(unit => unit.id === id);
  if(!u || u.dead) return;
  ev.preventDefault();
  ev.stopPropagation();
  showUnitInfo?.(u);
}, true);

document.addEventListener("pointerup", (ev) => {
  const infoBtn = ev.target?.closest?.(".unitInfoBtn");
  const statusBtn = ev.target?.closest?.(".statusChip");
  if(!infoBtn && !statusBtn) return;
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation?.();

  if(statusBtn){
    showStatusInfo?.(statusBtn.dataset.status);
    return;
  }

  const tileEl = infoBtn.closest(".tile[data-unit-id]");
  const id = tileEl?.dataset?.unitId;
  const side = tileEl?.dataset?.side;
  const u = state?.units?.find(unit => unit.id === id && (!side || unit.side === side))
    || state?.units?.find(unit => unit.id === id);
  if(u && !u.dead) showUnitInfo?.(u);
}, true);

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v107 defeat break animation ===== */
const DEFEAT_GHOSTS_V107 = new Map();

function deathGhostKeyV107(u){
  if(!u) return "";
  return `${u.side || "?"}:${u.row || "front"}:${u.col ?? 0}:${u.id}`;
}

function createDeathGhostV107(u){
  if(!u) return null;
  return {
    id:u.id,
    name:u.name,
    side:u.side,
    row:u.row || "front",
    col:u.col ?? 0,
    class:u.class,
    prof:[...(u.prof || [])],
    art:u.art,
    armor:u.armor || 0,
    baseArmor:u.baseArmor || u.armor || 0,
    hp:0,
    maxHp:u.maxHp || 0,
    shield:0,
    status:{},
    dead:false,
    defeatGhostV107:true,
    defeatUntilV107:Date.now() + 1150
  };
}

function spawnDeathBreakV107(u){
  const tile = tileElForUnitV106?.(u) || tileElForUnitV104?.(u);
  const fx = typeof fxLayer === "function" ? fxLayer() : $("fxLayer");
  if(!tile || !fx || prefersReducedMotionV106?.()) return;

  addMomentClassV106?.(tile, "defeatBreakV107", 1180);
  const rect = tile.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for(let i=0; i<18; i+=1){
    const shard = document.createElement("div");
    shard.className = "deathShardV107";
    const angle = (Math.PI * 2 * i) / 18 + (Math.random() - .5) * .65;
    const distance = 30 + Math.random() * 72;
    shard.style.left = `${cx + (Math.random() - .5) * rect.width * .38}px`;
    shard.style.top = `${cy + (Math.random() - .5) * rect.height * .38}px`;
    shard.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    shard.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    shard.style.setProperty("--rot", `${(Math.random() * 240 - 120).toFixed(1)}deg`);
    shard.style.animationDelay = `${Math.random() * 55}ms`;
    fx.appendChild(shard);
    window.setTimeout(() => shard.remove(), 1250);
  }

  const label = document.createElement("div");
  label.className = "defeatTextV107";
  label.textContent = "Defeated";
  label.style.left = `${cx}px`;
  label.style.top = `${rect.top + rect.height * .42}px`;
  fx.appendChild(label);
  window.setTimeout(() => label.remove(), 1250);
}

function noteDefeatV107(u){
  if(!u) return;
  const key = deathGhostKeyV107(u);
  const existing = DEFEAT_GHOSTS_V107.get(key);
  if(existing && existing.until > Date.now()) return;
  const ghost = createDeathGhostV107(u);
  if(!ghost) return;
  DEFEAT_GHOSTS_V107.set(key, {ghost, until:ghost.defeatUntilV107});
  spawnDeathBreakV107(u);
  hapticV106?.("heavy");
  playSfxV106?.("defeat");
  window.setTimeout(() => {
    const current = DEFEAT_GHOSTS_V107.get(key);
    if(current?.ghost === ghost) DEFEAT_GHOSTS_V107.delete(key);
    if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
  }, 1180);
}

function recentDefeatGhostsV107(side){
  const now = Date.now();
  const ghosts = [];
  for(const [key, entry] of DEFEAT_GHOSTS_V107.entries()){
    if(!entry || entry.until <= now){
      DEFEAT_GHOSTS_V107.delete(key);
      continue;
    }
    if(entry.ghost?.side === side) ghosts.push(entry.ghost);
  }
  return ghosts;
}

function placeDefeatGhostsV107(board, side){
  if(!board || board.classList.contains("largeUnitBoard") || board.classList.contains("bossBoard")) return;
  const ghosts = recentDefeatGhostsV107(side);
  if(!ghosts.length) return;
  const order = side === "enemy" ? ["back","front"] : ["front","back"];
  const rows = [...board.querySelectorAll(":scope > .row")];
  for(const ghost of ghosts){
    if((state?.units || []).some(u => u.side === side && !u.dead && u.row === ghost.row && u.col === ghost.col)) continue;
    const rowIndex = order.indexOf(ghost.row);
    const row = rows[rowIndex];
    if(!row || ghost.col == null || ghost.col < 0 || ghost.col >= row.children.length) continue;
    const existing = row.children[ghost.col];
    if(existing && !existing.classList.contains("empty")) continue;
    const ghostTile = tile(ghost, side);
    ghostTile.disabled = true;
    ghostTile.classList.add("defeatGhostV107","defeatBreakV107");
    ghostTile.setAttribute("aria-label", `${ghost.name} was defeated`);
    existing?.replaceWith(ghostTile);
  }
}

const renderBoardBeforeDefeatV107 = renderBoard;
renderBoard = function(id, side){
  const result = renderBoardBeforeDefeatV107(id, side);
  placeDefeatGhostsV107($(id), side);
  return result;
};

const damageBeforeDefeatV107 = damage;
damage = function(src,t,amt,opt={}){
  const wasAlive = !!t && !t.dead && (t.hp || 0) > 0;
  const result = damageBeforeDefeatV107(src,t,amt,opt);
  if(wasAlive && t?.dead) noteDefeatV107(t);
  return result;
};

const loseHpDirectBeforeDefeatV107 = loseHpDirect;
loseHpDirect = function(u,n,reason="life loss"){
  const wasAlive = !!u && !u.dead && (u.hp || 0) > 0;
  const result = loseHpDirectBeforeDefeatV107(u,n,reason);
  if(wasAlive && u?.dead) noteDefeatV107(u);
  return result;
};

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v106 game-feel feedback layer ===== */
const GAME_FEEL_V106 = {
  audioUnlocked: false,
  audioCtx: null,
  lastHapticAt: 0
};

function prefersReducedMotionV106(){
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function isCoarsePointerV106(){
  return !!(navigator.maxTouchPoints > 0 || window.matchMedia?.("(pointer: coarse)")?.matches);
}

function hapticV106(kind="tap"){
  if(!isCoarsePointerV106() || !navigator.vibrate) return;
  const now = performance.now();
  if(now - GAME_FEEL_V106.lastHapticAt < 45) return;
  GAME_FEEL_V106.lastHapticAt = now;
  const patterns = {
    tap: 8,
    select: 14,
    commit: [12, 18, 16],
    hit: [18, 24, 20],
    heavy: [26, 24, 34],
    heal: [7, 16, 9],
    guard: [10, 18, 10],
    error: [36],
    reveal: [8, 22, 8]
  };
  try{ navigator.vibrate(patterns[kind] || patterns.tap); }catch(_){}
}

function unlockAudioV106(){
  GAME_FEEL_V106.audioUnlocked = true;
}

function playSfxV106(kind="tap"){
  if(!GAME_FEEL_V106.audioUnlocked || prefersReducedMotionV106()) return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if(!AudioContextCtor) return;
  try{
    const ctx = GAME_FEEL_V106.audioCtx || (GAME_FEEL_V106.audioCtx = new AudioContextCtor());
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const settings = {
      tap: [520, 0.018, 0.035, "triangle"],
      select: [660, 0.026, 0.055, "sine"],
      commit: [420, 0.04, 0.075, "triangle"],
      hit: [130, 0.06, 0.08, "sawtooth"],
      heal: [720, 0.035, 0.075, "sine"],
      guard: [260, 0.045, 0.07, "square"],
      reveal: [360, 0.035, 0.065, "triangle"]
    }[kind] || [500, 0.018, 0.04, "triangle"];
    osc.type = settings[3];
    osc.frequency.setValueAtTime(settings[0], now);
    if(kind === "hit") osc.frequency.exponentialRampToValueAtTime(80, now + settings[2]);
    if(kind === "heal") osc.frequency.exponentialRampToValueAtTime(940, now + settings[2]);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(settings[1], now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings[2]);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + settings[2] + 0.02);
  }catch(_){}
}

function addMomentClassV106(el, className, duration=420){
  if(!el || prefersReducedMotionV106()) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), duration);
}

function tileElForUnitV106(u){
  if(!u) return null;
  if(typeof tileElForUnitV104 === "function") return tileElForUnitV104(u);
  const sideSelector = u.side ? `[data-side="${u.side}"]` : "";
  return document.querySelector(`.tile[data-unit-id="${u.id}"]${sideSelector}`) ||
    document.querySelector(`.tile[data-unit-id="${u.id}"]`);
}

function classifyAbilityFeelV106(ability){
  const text = `${ability?.kind || ""} ${ability?.effect || ""} ${ability?.status || ""} ${ability?.desc || ""}`.toLowerCase();
  if(/heal|restore|life|hp/.test(text) && !/lost|loss|damage/.test(text)) return "heal";
  if(/protect|guard|shield|armor|ward/.test(text)) return "guard";
  if(/bleed|poison|freeze|hypnosis|exposed|exhaust/.test(text)) return "status";
  if(/damage|attack|slash|stab|bash|strike|drain|rupture|needle|blade|rain/.test(text)) return "hit";
  return "tap";
}

function spawnFeelParticlesV106(unitObj, kind="hit"){
  const tile = tileElForUnitV106(unitObj);
  const fx = typeof fxLayer === "function" ? fxLayer() : $("fxLayer");
  if(!tile || !fx || prefersReducedMotionV106()) return;
  const rect = tile.getBoundingClientRect();
  const count = kind === "hit" ? 8 : 6;
  for(let i=0; i<count; i+=1){
    const mote = document.createElement("div");
    mote.className = `feelParticleV106 ${kind}`;
    const x = rect.left + rect.width * (0.28 + Math.random() * 0.44);
    const y = rect.top + rect.height * (0.25 + Math.random() * 0.50);
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 34;
    mote.style.left = `${x}px`;
    mote.style.top = `${y}px`;
    mote.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    mote.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    fx.appendChild(mote);
    window.setTimeout(() => mote.remove(), 720);
  }
}

function pulseQueueV106(){
  addMomentClassV106($("queueStrip"), "queuePulseV106", 520);
}

document.addEventListener("pointerdown", ev => {
  unlockAudioV106();
  const interactive = ev.target?.closest?.("button,.fighterCard,.tile,.wheelBtn,.chosenToken,.benchFighter,.slot");
  if(!interactive) return;
  addMomentClassV106(interactive, "touchPressV106", 180);
  hapticV106("tap");
  playSfxV106("tap");
}, {capture:true, passive:true});

document.addEventListener("click", ev => {
  const tileBtn = ev.target?.closest?.(".tile:not(.empty),.fighterCard,.slot,.benchFighter");
  if(tileBtn){
    addMomentClassV106(tileBtn, "choicePopV106", 360);
    hapticV106("select");
    playSfxV106("select");
  }
}, {capture:true});

const planBeforeGameFeelV106 = plan;
plan = function(target){
  const beforeCount = state?.plans?.length || 0;
  const actor = unit?.(selectedId);
  const ability = pendingAbility;
  const result = planBeforeGameFeelV106(target);
  if((state?.plans?.length || 0) > beforeCount){
    addMomentClassV106(tileElForUnitV106(actor), "planCommitV106", 520);
    addMomentClassV106(tileElForUnitV106(target), "targetPingV106", 520);
    pulseQueueV106();
    hapticV106("commit");
    playSfxV106("commit");
  }
  return result;
};

const openWheelBeforeGameFeelV106 = openWheel;
openWheel = function(u){
  const result = openWheelBeforeGameFeelV106(u);
  addMomentClassV106(tileElForUnitV106(u), "intentGlowV106", 560);
  hapticV106("select");
  playSfxV106("select");
  return result;
};

const showResolutionOverlayBeforeGameFeelV106 = showResolutionOverlay;
showResolutionOverlay = function(actor, ability, target, stage="reveal", events=[]){
  const result = showResolutionOverlayBeforeGameFeelV106(actor, ability, target, stage, events);
  const kind = classifyAbilityFeelV106(ability);
  addMomentClassV106(tileElForUnitV106(actor), "actorSurgeV106", 620);
  if(target){
    addMomentClassV106(tileElForUnitV106(target), `${kind}MomentV106`, 620);
    spawnFeelParticlesV106(target, kind === "heal" ? "heal" : kind === "guard" ? "guard" : "hit");
  }
  addMomentClassV106($("resolutionOverlay"), "resolvePopV106", 500);
  hapticV106(stage === "result" ? (kind === "hit" ? "hit" : kind === "heal" ? "heal" : kind === "guard" ? "guard" : "reveal") : "reveal");
  playSfxV106(kind === "hit" ? "hit" : kind === "heal" ? "heal" : kind === "guard" ? "guard" : "reveal");
  return result;
};

const damageBeforeGameFeelV106 = damage;
damage = function(src,t,amt,opt={}){
  const beforeHp = t?.hp ?? null;
  const result = damageBeforeGameFeelV106(src,t,amt,opt);
  const lost = beforeHp != null && t ? Math.max(0, beforeHp - (t.hp || 0)) : 0;
  if(lost > 0){
    addMomentClassV106(tileElForUnitV106(t), "hitMomentV106", 620);
    spawnFeelParticlesV106(t, lost >= 6 ? "heavy" : "hit");
    hapticV106(lost >= 6 ? "heavy" : "hit");
    playSfxV106(lost >= 6 ? "heavy" : "hit");
  }
  return result;
};

const healBeforeGameFeelV106 = heal;
heal = function(u,n){
  const beforeHp = u?.hp ?? null;
  const result = healBeforeGameFeelV106(u,n);
  const gained = beforeHp != null && u ? Math.max(0, (u.hp || 0) - beforeHp) : 0;
  if(gained > 0){
    addMomentClassV106(tileElForUnitV106(u), "healMomentV106", 680);
    spawnFeelParticlesV106(u, "heal");
    hapticV106("heal");
    playSfxV106("heal");
  }
  return result;
};

const addStatusBeforeGameFeelV106 = addStatus;
addStatus = function(u,k,n=1){
  const result = addStatusBeforeGameFeelV106(u,k,n);
  addMomentClassV106(tileElForUnitV106(u), "statusMomentV106", 520);
  hapticV106(k === "shield" || k === "armor" ? "guard" : "tap");
  return result;
};

const renderBattleBeforeGameFeelV106 = renderBattle;
renderBattle = function(){
  renderBattleBeforeGameFeelV106();
  document.body.classList.add("gameFeelV106");
};

document.body.classList.add("gameFeelV106");
if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v108 real audio asset SFX ===== */
const AUDIO_ASSETS_V108 = {
  tap: "assets/audio/lock.wav",
  select: "assets/audio/lock.wav",
  commit: "assets/audio/click.wav",
  guard: "assets/audio/block.mp3",
  block: "assets/audio/block.mp3",
  shield: "assets/audio/block.mp3",
  hit: "assets/audio/hit.mp3",
  heavy: "assets/audio/hit.mp3",
  heal: "assets/audio/heal.mp3",
  defeat: "assets/audio/shatter.wav"
};

const AUDIO_V108 = {
  enabled: true,
  lastPlayedAt: Object.create(null),
  pool: Object.create(null)
};

function normalizedSfxKindV108(kind="tap"){
  if(kind === "choice") return "select";
  if(kind === "click") return "tap";
  if(kind === "reveal") return kind;
  return AUDIO_ASSETS_V108[kind] ? kind : "tap";
}

function sfxVolumeV108(kind){
  switch(kind){
    case "tap":
    case "select": return 0.32;
    case "commit": return 0.40;
    case "guard":
    case "block":
    case "shield": return 0.46;
    case "heavy": return 0.50;
    case "defeat": return 0.58;
    case "heal": return 0.44;
    case "hit": return 0.50;
    default: return 0.36;
  }
}

function getAudioPoolV108(kind){
  const src = AUDIO_ASSETS_V108[kind];
  if(!src) return null;
  if(!AUDIO_V108.pool[kind]){
    AUDIO_V108.pool[kind] = Array.from({length:3}, () => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = sfxVolumeV108(kind);
      audio.dataset.sfxKind = kind;
      return audio;
    });
  }
  return AUDIO_V108.pool[kind];
}

function playAudioAssetV108(kind){
  if(!AUDIO_V108.enabled || !GAME_FEEL_V106?.audioUnlocked || prefersReducedMotionV106?.()) return false;
  const mapped = normalizedSfxKindV108(kind);
  const pool = getAudioPoolV108(mapped);
  if(!pool) return false;

  const now = performance.now();
  const minGap = mapped === "tap" || mapped === "select" ? 36 : 70;
  if(now - (AUDIO_V108.lastPlayedAt[mapped] || 0) < minGap) return true;
  AUDIO_V108.lastPlayedAt[mapped] = now;

  const audio = pool.find(a => a.paused || a.ended) || pool[0];
  try{
    audio.pause();
    audio.currentTime = 0;
    audio.volume = sfxVolumeV108(mapped);
    const maybePromise = audio.play();
    if(maybePromise?.catch) maybePromise.catch(() => {});
    return true;
  }catch(_){
    return false;
  }
}

const playSfxBeforeAssetsV108 = playSfxV106;
playSfxV106 = function(kind="tap"){
  const mapped = normalizedSfxKindV108(kind);
  if(playAudioAssetV108(mapped)) return;
  if(mapped === "hit" || mapped === "guard" || mapped === "tap" || mapped === "select" || mapped === "commit"){
    return playSfxBeforeAssetsV108?.(mapped === "guard" ? "guard" : mapped);
  }
  return playSfxBeforeAssetsV108?.(kind);
};

const hapticBeforeAudioAssetsV108 = hapticV106;
hapticV106 = function(kind="tap"){
  const mapped = normalizedSfxKindV108(kind);
  return hapticBeforeAudioAssetsV108(mapped === "block" || mapped === "shield" ? "guard" : mapped);
};

function preloadAudioAssetsV108(){
  if(!GAME_FEEL_V106?.audioUnlocked) return;
  for(const kind of Object.keys(AUDIO_ASSETS_V108)){
    const pool = getAudioPoolV108(kind);
    pool?.forEach(audio => {
      try{ audio.load(); }catch(_){}
    });
  }
}

document.addEventListener("pointerdown", preloadAudioAssetsV108, {capture:true, passive:true});

window.__WANDERERS_AUDIO_ASSETS = Object.assign({}, AUDIO_ASSETS_V108);

/* ===== v105 compact mobile battle HUD and non-blocking result sheet ===== */
function isResolveWaitingV105(){
  return typeof tacticalContinue === "function" || !!$("inlineContinueResolveBtn");
}

function placeBattleLogButtonV105(){
  const btn = $("battleLogToggleBtn");
  const resource = $("resource") || document.querySelector(".resource");
  const tactical = $("tacticalToggleBtn");
  if(!btn || !resource) return;
  btn.classList.add("battleLogToggleBtnV105");
  if(tactical && btn.nextElementSibling !== tactical){
    resource.insertBefore(btn, tactical);
  } else if(btn.parentElement !== resource){
    resource.appendChild(btn);
  }
}

function minimizeResolutionOverlayV105(){
  const overlay = $("resolutionOverlay");
  const card = overlay?.querySelector(".resolveCard");
  if(!overlay || !card) return;
  overlay.classList.add("minimizedV105");
  card.classList.remove("detailsOpenV105");
  const btn = card.querySelector(".resolutionCloseBtn");
  if(btn){
    btn.setAttribute("aria-label", "Expand result");
    btn.textContent = "+";
  }
}

function expandResolutionOverlayV105(){
  const overlay = $("resolutionOverlay");
  const card = overlay?.querySelector(".resolveCard");
  if(!overlay || !card) return;
  overlay.classList.remove("minimizedV105");
  const btn = card.querySelector(".resolutionCloseBtn");
  if(btn){
    btn.setAttribute("aria-label", "Minimize result");
    btn.textContent = "×";
  }
}

function toggleResolutionDetailsV105(){
  const overlay = $("resolutionOverlay");
  const card = overlay?.querySelector(".resolveCard");
  if(!card) return;
  overlay?.classList.remove("minimizedV105");
  card.classList.toggle("detailsOpenV105");
  const btn = card.querySelector(".resolveDetailsToggleV105");
  if(btn) btn.textContent = card.classList.contains("detailsOpenV105") ? "Hide details" : "Details";
}

function enhanceResolutionOverlayV105(){
  const overlay = $("resolutionOverlay");
  const card = overlay?.querySelector(".resolveCard");
  if(!overlay || overlay.classList.contains("hidden") || !card) return;

  overlay.classList.add("resolutionOverlayV105");
  overlay.classList.remove("minimizedV105");
  card.classList.add("compactResultV105");
  card.classList.toggle("detailsOpenV105", !(typeof isMobileLayout === "function" && isMobileLayout()));

  const top = card.querySelector(".resolveTop");
  if(top && !card.querySelector(".resolveDetailsToggleV105")){
    const details = document.createElement("button");
    details.type = "button";
    details.className = "resolveDetailsToggleV105";
    details.textContent = card.classList.contains("detailsOpenV105") ? "Hide details" : "Details";
    details.onclick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      toggleResolutionDetailsV105();
    };
    top.appendChild(details);
  }

  const close = card.querySelector(".resolutionCloseBtn");
  if(close){
    close.setAttribute("aria-label", "Minimize result");
    close.textContent = "×";
    close.onclick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      if(overlay.classList.contains("minimizedV105")){
        expandResolutionOverlayV105();
      } else if(isResolveWaitingV105()){
        minimizeResolutionOverlayV105();
      } else if(typeof closeResolutionOverlayBeforeV105 === "function"){
        closeResolutionOverlayBeforeV105();
      } else {
        overlay.classList.add("hidden");
      }
    };
  }

  const inline = $("inlineContinueResolveBtn");
  if(inline && !inline.dataset.v105Wrapped){
    inline.dataset.v105Wrapped = "1";
    inline.addEventListener("click", () => overlay.classList.remove("minimizedV105"), true);
  }
}

const renderBattleBeforeV105 = renderBattle;
renderBattle = function(){
  renderBattleBeforeV105();
  placeBattleLogButtonV105();
};

const showResolutionOverlayBeforeV105 = showResolutionOverlay;
showResolutionOverlay = function(actor, ability, target, stage="reveal", events=[]){
  showResolutionOverlayBeforeV105(actor, ability, target, stage, events);
  enhanceResolutionOverlayV105();
};

const closeResolutionOverlayBeforeV105 = closeResolutionOverlayV101;
closeResolutionOverlayV101 = function(){
  if(isResolveWaitingV105()){
    minimizeResolutionOverlayV105();
    return;
  }
  closeResolutionOverlayBeforeV105?.();
};

placeBattleLogButtonV105();
enhanceResolutionOverlayV105();

/* ===== v104 immediate life-loss rumble ===== */
function tileElForUnitV104(u){
  if(!u) return null;
  const sideSelector = u.side ? `[data-side="${u.side}"]` : "";
  return document.querySelector(`.tile[data-unit-id="${u.id}"]${sideSelector}`) ||
    document.querySelector(`.tile[data-unit-id="${u.id}"]`);
}

function playLifeLossRumbleV104(u, amount=1){
  if(!u) return;
  const duration = Math.min(820, 470 + Math.max(0, amount) * 24);
  u.rumbleUntil = Date.now() + duration;
  u.lifeLossImpactUntilV104 = Date.now() + duration;

  const tile = tileElForUnitV104(u);
  if(!tile) return;
  tile.style.setProperty("--life-loss-intensity", String(Math.min(1.85, 1 + Math.max(0, amount) / 10)));
  tile.classList.remove("rumble","lifeLossRumbleV104");
  void tile.offsetWidth;
  tile.classList.add("rumble","lifeLossRumbleV104");
  window.setTimeout(() => tile.classList.remove("lifeLossRumbleV104"), duration + 60);
}

const markRumbleBeforeV104 = markRumble;
markRumble = function(u, amount=1){
  markRumbleBeforeV104?.(u);
  playLifeLossRumbleV104(u, amount);
};

const damageBeforeRumbleV104 = damage;
damage = function(src,t,amt,opt={}){
  const targetBefore = t?.hp ?? null;
  const result = damageBeforeRumbleV104(src,t,amt,opt);
  const lost = targetBefore != null && t ? Math.max(0, targetBefore - (t.hp || 0)) : 0;
  if(lost > 0) playLifeLossRumbleV104(t,lost);
  return result;
};

const loseHpDirectBeforeRumbleV104 = loseHpDirect;
loseHpDirect = function(u,n,reason="life loss"){
  const before = u?.hp ?? null;
  const result = loseHpDirectBeforeRumbleV104(u,n,reason);
  const lost = before != null && u ? Math.max(0, before - (u.hp || 0)) : 0;
  if(lost > 0) playLifeLossRumbleV104(u,lost);
  return result;
};

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v103 character inspect artwork ===== */
function characterArtworkHTMLV103(u){
  if(!u) return "";
  const src = artSrcFromStyleValue(u.art);
  const safeName = typeof escapeHtmlV32 === "function" ? escapeHtmlV32(u.name) : u.name;
  if(!src) return "";
  return `<figure class="inspectArtworkV103">
    <img src="${src}" alt="${safeName} full artwork" loading="eager" decoding="async">
    <figcaption>${safeName}</figcaption>
  </figure>`;
}

const renderInfoBeforeArtworkV103 = renderInfo;
renderInfo = function(){
  const u = selectedUnit();
  renderInfoBeforeArtworkV103();
  if(!u || !$("infoBody")) return;
  const art = characterArtworkHTMLV103(u);
  if(!art) return;
  const card = $("infoBody").querySelector(".miniInfoCard");
  if(card){
    card.classList.add("miniInfoCardWithArtV103");
    const stats = document.createElement("div");
    stats.className = "miniInfoStatsV103";
    while(card.firstChild) stats.appendChild(card.firstChild);
    card.appendChild(stats);
    card.insertAdjacentHTML("beforeend", art);
  } else {
    $("infoBody").innerHTML = `${art}${$("infoBody").innerHTML}`;
  }
};

if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v111 final audio sync after all late wrappers ===== */
let suppressOverlayResultAudioV111 = 0;

const playSfxBeforeFinalSyncV111 = typeof playSfxV106 === "function" ? playSfxV106 : null;
if(playSfxBeforeFinalSyncV111){
  playSfxV106 = function(kind="tap"){
    if(suppressOverlayResultAudioV111 && ["hit","heavy","heal","guard","block","shield","reveal"].includes(kind)){
      return;
    }
    return playSfxBeforeFinalSyncV111(kind);
  };
}

const hapticBeforeFinalSyncV111 = typeof hapticV106 === "function" ? hapticV106 : null;
if(hapticBeforeFinalSyncV111){
  hapticV106 = function(kind="tap"){
    if(suppressOverlayResultAudioV111 && ["hit","heavy","heal","guard","block","shield","reveal"].includes(kind)){
      return;
    }
    return hapticBeforeFinalSyncV111(kind);
  };
}

const showResolutionOverlayBeforeFinalSyncV111 = typeof showResolutionOverlay === "function" ? showResolutionOverlay : null;
if(showResolutionOverlayBeforeFinalSyncV111){
  showResolutionOverlay = function(actor, ability, target, stage="reveal", events=[]){
    suppressOverlayResultAudioV111 += 1;
    try {
      return showResolutionOverlayBeforeFinalSyncV111(actor, ability, target, stage, events);
    } finally {
      suppressOverlayResultAudioV111 = Math.max(0, suppressOverlayResultAudioV111 - 1);
    }
  };
}

function playBlockTriggeredSfxV111(unitObj){
  if(!unitObj) return;
  addMomentClassV106?.(tileElForUnitV106?.(unitObj), "guardMomentV106", 520);
  spawnFeelParticlesV106?.(unitObj, "guard");
  hapticBeforeFinalSyncV111?.("guard");
  playSfxBeforeFinalSyncV111?.("block");
}

const redirectBeforeBlockSfxV111 = typeof redirect === "function" ? redirect : null;
if(redirectBeforeBlockSfxV111){
  redirect = function(target, source){
    const redirected = redirectBeforeBlockSfxV111(target, source);
    if(redirected && target && redirected !== target) playBlockTriggeredSfxV111(redirected);
    return redirected;
  };
}

const damageBeforeBlockSfxV111 = typeof damage === "function" ? damage : null;
if(damageBeforeBlockSfxV111){
  damage = function(src,t,amt,opt={}){
    const beforeShield = t?.shield || 0;
    const result = damageBeforeBlockSfxV111(src,t,amt,opt);
    const shieldUsed = t ? Math.max(0, beforeShield - (t.shield || 0)) : 0;
    if(shieldUsed > 0 && opt?.attack && !opt?.selfCost) playBlockTriggeredSfxV111(t);
    return result;
  };
}

window.__WANDERERS_AUDIO_SYNC = {
  overlayResultAudioSuppressed: true,
  blockSoundTrigger: "protect redirect or shield absorption",
  guardDeploySound: false
};

/* ===== v116 Fuego dragon / firecraft character ===== */
ART.fuego = "url('assets/fuego.png')";
CLASS.dragon = { icon:"🐉" };
PROF_ICONS.dragon = "assets/proficiency_icons/dragon.png";
PROF_ICONS.firecraft = "assets/proficiency_icons/firecraft.png";

if(!ROSTER.some(c => c.id === "fuego")){
  ROSTER.push({
    id:"fuego",
    name:"Fuego",
    class:"dragon",
    prof:"firecraft",
    hp:24,
    armor:2,
    speed:3,
    art:ART.fuego,
    passive:"Passive — Flame Rush: for each Flame counter Fuego has, Fuego's abilities have +1 Speed.",
    abilities:[
      A("stoke","Stoke Flame",1,0,"Firecraft. Gain 2 Flame counters.","fuegoCharge",{kind:"fuegoCharge",status:"flame",stacks:2,iconKey:"firecraft"}),
      A("flare","Flare Shot",1,0,"Firecraft ranged attack. Remove all Flame counters from Fuego. Deal damage equal to twice the removed Flame counters +2 to one enemy.","fuegoBlast",{kind:"fuegoBlast",range:"ranged",iconKey:"firecraft"}),
      A("nova","Super Nova",3,-3,"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to 3 times the removed Flame counters to all enemies. Fuego gains Exhausted.","fuegoSuperNova",{kind:"fuegoSuperNova",iconKey:"firecraft"}),
      A("scales","Dragon Scales",1,1,"Dragon. Gain 1 Flame counter and +2 Armor until end of round. Can only be activated once per round.","dragonScales",{kind:"dragonScales",iconKey:"dragon"})
    ]
  });
}

if($("classFilter") && !$("classFilter").querySelector('option[value="dragon"]')){
  $("classFilter").insertAdjacentHTML("beforeend", `<option value="dragon">Dragon</option>`);
}

STATUS_LABELS_V17.flame = {
  icon:"🔥",
  title:"Flame",
  text:"Flame is Fuego's charge counter. Flame persists until spent. Fuego's passive gives his abilities +1 Speed for each Flame counter he currently has."
};

if(typeof KEYWORDS_V32 !== "undefined"){
  KEYWORDS_V32.flame = STATUS_LABELS_V17.flame;
  KEYWORDS_V32.firecraft = {
    title:"Firecraft",
    text:"Firecraft abilities build Flame counters, then spend them for larger attacks."
  };
  KEYWORDS_V32.dragon = {
    title:"Dragon",
    text:"Dragon abilities are Fuego's defensive draconic techniques."
  };
}
if(Array.isArray(KEYWORD_PATTERN_V32)){
  for(const word of ["Firecraft","Dragon","Flame"]){
    if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }
}

const iconBeforeFuegoV116 = icon;
icon = function(s){
  if(s === "flame") return "🔥";
  return iconBeforeFuegoV116(s);
};

const abilityIconKeyBeforeFuegoV116 = abilityIconKey;
abilityIconKey = function(caster, ability){
  const text = `${ability?.name || ""} ${ability?.desc || ""} ${ability?.effect || ""} ${ability?.kind || ""} ${ability?.iconKey || ""}`.toLowerCase();
  if(/dragon|scales/.test(text)) return "dragon";
  if(/firecraft|flame|flare|nova|stoke/.test(text)) return "firecraft";
  return abilityIconKeyBeforeFuegoV116(caster, ability);
};

const totalSpeedBeforeFuegoV116 = totalSpeed;
totalSpeed = function(u,a){
  const base = totalSpeedBeforeFuegoV116(u,a);
  if(!u || !a || a.guard || u.id !== "fuego") return base;
  return base + Math.max(0, u.status?.flame || 0);
};

function consumeFlameV116(u){
  const flame = Math.max(0, u?.status?.flame || 0);
  if(u?.status) u.status.flame = 0;
  return flame;
}

function finishFuegoActionV116(c,a,removeExhaustedBefore){
  if(removeExhaustedBefore && c?.status){
    c.status.exhausted = 0;
    log(`${c.name}'s Exhausted is removed after resolving a non-Guard action.`);
  }
}

const targetsBeforeFuegoV116 = targets;
targets = function(c,a){
  if(!c || !a) return [];
  if(["fuegoCharge","fuegoSuperNova","dragonScales"].includes(a.kind || a.effect)) return [];
  return targetsBeforeFuegoV116(c,a);
};

const applyBeforeFuegoV116 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeFuegoV116(c,a,t);
  const k = a.kind || a.effect;
  if(!["fuegoCharge","fuegoBlast","fuegoSuperNova","dragonScales"].includes(k)){
    return applyBeforeFuegoV116(c,a,t);
  }

  if(c.status?.frozen && !a.guard){
    c.status.frozen = 0;
    log(`${c.name} is Frozen and loses action.`);
    return;
  }

  const removeExhaustedBefore = !!(c.status?.exhausted && !a.guard);

  switch(k){
    case "fuegoCharge":
      addStatus(c,"flame",a.stacks || 2);
      log(`${c.name} stokes the fire.`);
      finishFuegoActionV116(c,a,removeExhaustedBefore);
      return;

    case "fuegoBlast": {
      const flame = consumeFlameV116(c);
      const dmg = flame * 2 + 2;
      if(t && !t.dead) damage(c,t,dmg,{attack:true,melee:false});
      log(`${c.name} spends ${flame} Flame for Flare Shot.`);
      finishFuegoActionV116(c,a,removeExhaustedBefore);
      return;
    }

    case "fuegoSuperNova": {
      const flame = consumeFlameV116(c);
      const dmg = flame * 3;
      for(const enemy of alive(other(c.side))){
        if(!enemy.dead) damage(c,enemy,dmg,{attack:true,aoe:true});
      }
      addStatus(c,"exhausted",1);
      log(`${c.name} spends ${flame} Flame on Super Nova.`);
      finishFuegoActionV116(c,a,removeExhaustedBefore);
      return;
    }

    case "dragonScales":
      if(c.fuegoDragonScalesRound === state?.round){
        log(`${c.name} already used Dragon Scales this round.`);
        finishFuegoActionV116(c,a,removeExhaustedBefore);
        return;
      }
      c.fuegoDragonScalesRound = state?.round;
      addStatus(c,"flame",1);
      addArmorThisRound?.(c,2);
      log(`${c.name}'s Dragon Scales harden.`);
      finishFuegoActionV116(c,a,removeExhaustedBefore);
      return;
  }
};

const aiValidTargetsBeforeFuegoV116 = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
if(aiValidTargetsBeforeFuegoV116){
  aiValidTargetsV95 = function(c,a){
    const k = a?.kind || a?.effect;
    if(["fuegoCharge","fuegoSuperNova","dragonScales"].includes(k)) return [null];
    return aiValidTargetsBeforeFuegoV116(c,a);
  };
}

const aiExpectedRawDamageBeforeFuegoV116 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
if(aiExpectedRawDamageBeforeFuegoV116){
  aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    const flame = Math.max(0, c?.status?.flame || 0);
    if(k === "fuegoBlast") return flame * 2 + 2;
    if(k === "fuegoSuperNova") return flame * 3 * Math.max(1, aiEnemiesV95(c).length);
    return aiExpectedRawDamageBeforeFuegoV116(a,t,c);
  };
}

const aiIsPayoffBeforeFuegoV116 = typeof aiIsPayoffV95 === "function" ? aiIsPayoffV95 : null;
if(aiIsPayoffBeforeFuegoV116){
  aiIsPayoffV95 = function(a){
    const k = a?.kind || a?.effect;
    if(k === "fuegoBlast" || k === "fuegoSuperNova") return true;
    return aiIsPayoffBeforeFuegoV116(a);
  };
}

const aiPayoffReadyBeforeFuegoV116 = typeof aiPayoffReadyV95 === "function" ? aiPayoffReadyV95 : null;
if(aiPayoffReadyBeforeFuegoV116){
  aiPayoffReadyV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "fuegoBlast" || k === "fuegoSuperNova") return (c?.status?.flame || 0) > 0;
    return aiPayoffReadyBeforeFuegoV116(a,t,c);
  };
}

const aiIsSetupBeforeFuegoV116 = typeof aiIsSetupV95 === "function" ? aiIsSetupV95 : null;
if(aiIsSetupBeforeFuegoV116){
  aiIsSetupV95 = function(a){
    const k = a?.kind || a?.effect;
    if(k === "fuegoCharge" || k === "dragonScales") return true;
    return aiIsSetupBeforeFuegoV116(a);
  };
}

const aiAbilityScoreBeforeFuegoV116 = typeof aiAbilityScoreV95 === "function" ? aiAbilityScoreV95 : null;
if(aiAbilityScoreBeforeFuegoV116){
  aiAbilityScoreV95 = function(c,a,ts,ap,plans){
    const k = a?.kind || a?.effect;
    const flame = Math.max(0, c?.status?.flame || 0);
    if(k === "fuegoCharge") return flame < 3 ? 28 : 8;
    if(k === "dragonScales") return c?.fuegoDragonScalesRound === state?.round ? -999 : 18 + flame;
    if(k === "fuegoBlast") return flame > 0 ? 20 + flame * 5 : -18;
    if(k === "fuegoSuperNova") return flame >= 2 ? 24 + flame * 7 : -30;
    return aiAbilityScoreBeforeFuegoV116(c,a,ts,ap,plans);
  };
}

if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v121 final requested gameplay overrides after Fuego registration ===== */
const fuegoNovaV121 = ROSTER.find(c=>c.id==="fuego")?.abilities?.find(a=>a.id==="nova");
if(fuegoNovaV121){
  fuegoNovaV121.mult = 2;
  fuegoNovaV121.desc = "Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to 2 times the removed Flame counters to all enemies. Fuego gains Exhausted.";
}

const applyBeforeFinalRequestedRulesV121 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeFinalRequestedRulesV121(c,a,t);
  const k = a.kind || a.effect;
  if(k === "fuegoSuperNova"){
    const flame = consumeFlameV116(c);
    const dmg = flame * (a.mult ?? 2);
    for(const enemy of alive(other(c.side))){
      if(!enemy.dead) damage(c,enemy,dmg,{attack:true,aoe:true});
    }
    addStatus(c,"exhausted",1);
    log(`${c.name} spends ${flame} Flame on Super Nova.`);
    return;
  }
  return applyBeforeFinalRequestedRulesV121(c,a,t);
};

const aiExpectedRawDamageBeforeFinalRequestedRulesV121 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
if(aiExpectedRawDamageBeforeFinalRequestedRulesV121){
  aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "fuegoSuperNova"){
      const flame = Math.max(0, c?.status?.flame || 0);
      return flame * (a.mult ?? 2) * Math.max(1, aiEnemiesV95?.(c)?.length || 1);
    }
    return aiExpectedRawDamageBeforeFinalRequestedRulesV121(a,t,c);
  };
}

/* ===== v122 requested rules, guard speed, and speed clarity ===== */
function abilityV122(characterId, abilityId){
  return ROSTER.find(c=>c.id===characterId)?.abilities?.find(a=>a.id===abilityId);
}

function patchAbilityV122(characterId, abilityId, patch){
  const ability = abilityV122(characterId, abilityId);
  if(ability) Object.assign(ability, patch);
  return ability;
}

function tuneRequestedRulesV122(){
  if(KEYWORDS_V32?.dread){
    KEYWORDS_V32.dread.text = "Next turn, this character is limited to 2 Action Points. Abilities costing 3 or more AP cannot be chosen while Dread is active.";
  }
  if(window.KEYWORDS_V32_SAFE?.dread){
    window.KEYWORDS_V32_SAFE.dread.text = "Next turn, this character is limited to 2 Action Points. Abilities costing 3 or more AP cannot be chosen while Dread is active.";
  }

  patchAbilityV122("yaura","bolt", {
    guard:true,
    spd:99,
    desc:"Guard-speed bloodcraft support. Choose an ally. Their next damaging attack deals +3 damage and applies 3 Bleed if it deals HP damage."
  });

  patchAbilityV122("hyafrost","armor", {
    guard:true,
    spd:99,
    desc:"Guard-speed icecraft support. Choose an ally. That ally gains +2 Armor and 3 Shield until end of round. Melee attackers gain 1 Freeze."
  });

  patchAbilityV122("maoja","hands", {
    guard:true,
    spd:99,
    desc:"Guard-speed ally buff. Choose an ally. Until the end of next round, that ally's melee attacks apply 2 Poison to the target."
  });

  const maoja = ROSTER.find(c=>c.id==="maoja");
  const maojaGrip = maoja?.abilities?.find(a=>a.id==="grip" || a.name==="Corrosive Grip" || a.name==="Toxic Grip");
  if(maojaGrip){
    Object.assign(maojaGrip, {
      id:"bash",
      name:"Bash",
      cost:1,
      spd:0,
      effect:"damage",
      kind:"attack",
      dmg:6,
      range:"melee",
      iconKey:"brute",
      desc:"Melee brute attack. Deal 6 damage."
    });
    delete maojaGrip.status;
    delete maojaGrip.stacks;
    delete maojaGrip.sunder;
  }

  const paleya = ROSTER.find(c=>c.id==="paleya");
  if(paleya){
    paleya.passive = "Passive - Mesmeric Touch: when Paleya deals melee HP damage, the attacked enemy gains Hypnosis.";
  }
  patchAbilityV122("paleya","lance", {
    range:"melee",
    desc:"Melee hypnotic attack. Deal 2 damage. If the target has Hypnosis, remove Hypnosis and deal 8 damage instead."
  });
  patchAbilityV122("paleya","mirror", {
    effect:"mirrorHypnoticGuard",
    kind:"mirrorHypnoticGuard",
    guard:true,
    range:"ranged",
    status:"exposed",
    desc:"Guard-speed hypnotic control. Choose an enemy with Hypnosis. Consume Hypnosis to apply Exposed and cancel that enemy's next action this turn."
  });

  patchAbilityV122("bakub","future", {
    name:"Mind Guard",
    effect:"mirrorHypnoticGuard",
    kind:"mirrorHypnoticGuard",
    guard:true,
    range:"ranged",
    status:"exposed",
    iconKey:"hypnotic",
    desc:"Guard-speed hypnotic control. Choose an enemy with Hypnosis. Consume Hypnosis to apply Exposed and cancel that enemy's next action this turn."
  });
  patchAbilityV122("bakub","toxin", {
    cost:2,
    effect:"rowMindToxin",
    kind:"rowMindToxin",
    range:"ranged",
    dmg:3,
    payoffDmg:5,
    poison:2,
    desc:"Row witchcraft attack. Choose an enemy row. Deal 3 damage to each enemy in that row. Against enemies with Hypnosis, consume Hypnosis, deal 5 damage instead, and apply 2 Poison."
  });

  patchAbilityV122("smithen","pin", {
    dmg:3,
    effect:"frostPinDamage",
    kind:"frostPinDamage",
    range:"ranged",
    desc:"Ranged icecraft attack. Deal 3 damage and apply 2 Freeze. If the target already had Freeze before this ability, also apply Exposed."
  });

  patchAbilityV122("kahro","assassinate", {
    range:"melee",
    backlineReach:true,
    iconKey:"assassin",
    desc:"Melee assassin finisher. Can target backlines. Deal 5 damage with Pierce 2. If the target is in the back row and that side's front row is empty, deal +3 damage."
  });
  patchAbilityV122("kahro","needle", {
    range:"melee",
    backlineReach:true,
    iconKey:"assassin",
    desc:"Melee assassin precision attack. Can target backlines. Deal 3 damage with Pierce 2."
  });
  patchAbilityV122("kahro","mark", {
    effect:"shadowMarkAttack",
    kind:"shadowMarkAttack",
    range:"melee",
    backlineReach:true,
    dmg:1,
    iconKey:"darkness",
    desc:"Melee darkness attack. Can target backlines. Deal 1 damage, then apply Exposed and Dread."
  });

  patchAbilityV122("zahria","mist", {
    iconKey:"bloodcraft",
    desc:"Bloodcraft row setup. Choose an enemy row. Each enemy in that row gains 2 Bleed only if it already has Bleed."
  });
  patchAbilityV122("zahria","mass", {
    spd:3,
    iconKey:"bloodcraft",
    desc:"Bloodcraft payoff. Speed 7 before other modifiers. Each enemy with Bleed loses HP equal to its Bleed, then removes that Bleed. Zahria heals for the total HP lost this way."
  });
}
tuneRequestedRulesV122();

if(typeof ABILITY_ICON_OVERRIDES_V41 !== "undefined"){
  Object.assign(ABILITY_ICON_OVERRIDES_V41, {
    needle:"assassin",
    assassinate:"assassin",
    mist:"bloodcraft",
    mass:"bloodcraft",
    future:"hypnotic"
  });
}

function isGuardSpeedAbilityV122(a){
  return !!a?.guard || ["bloodInfusion","frostArmorRetaliate","poisonHands","mirrorHypnoticGuard"].includes(a?.kind || a?.effect);
}

function speedBreakdownV122(u,a){
  if(!u || !a) return {label:"Speed ?", detail:"Speed could not be calculated."};
  if(isGuardSpeedAbilityV122(a)) return {
    label:"Guard Speed",
    detail:`Guard Speed: resolves before normal speed actions. Base Speed ${u.speed} is ignored for guard-speed abilities.`
  };
  const base = Number(u.speed) || 0;
  const mod = Number(a.spd) || 0;
  const exhausted = u.status?.exhausted ? -3 : 0;
  const flame = (u.id === "fuego") ? Math.max(0, u.status?.flame || 0) : 0;
  const total = totalSpeed(u,a);
  const parts = [`base ${base}`, `ability ${mod >= 0 ? "+" : ""}${mod}`];
  if(exhausted) parts.push(`Exhausted ${exhausted}`);
  if(flame) parts.push(`Flame +${flame}`);
  return {label:`Speed ${total}`, detail:`Speed: ${parts.join(" ")} = ${total}`};
}

const targetsBeforeRequestedRulesV122 = targets;
targets = function(c,a){
  if(!c || !a) return [];
  const k = a.kind || a.effect;
  if(k === "mirrorHypnoticGuard"){
    return alive(other(c.side)).filter(t => (t.status?.hypnosis || 0) > 0);
  }
  if(k === "rowMindToxin"){
    return alive(other(c.side));
  }
  let result = targetsBeforeRequestedRulesV122(c,a) || [];
  if(a.backlineReach && a.range === "melee"){
    result = alive(other(c.side));
  }
  return result;
};

function setDreadLimitV122(target){
  if(!target || target.dead) return;
  target.status = target.status || {};
  target.status.dread = 1;
  target.dreadLimitedActionsV122 = true;
  delete target.dreadDisabledAbilityId;
  spawnStatusPop?.(target, "dread", "");
  spawnFloatingText?.(target, "Dread: 2 AP next turn", "status");
  pushActionEvent?.("statusGain", `${target.name} gained Dread and will be limited to 2 AP next turn`, target);
  log(`${target.name} gains Dread: next turn, abilities costing 3 or more AP are disabled.`);
}

if(typeof applyDreadV42 === "function"){
  applyDreadV42 = setDreadLimitV122;
}

const isAbilityDisabledByDreadBeforeV122 = typeof isAbilityDisabledByDreadV42 === "function" ? isAbilityDisabledByDreadV42 : null;
isAbilityDisabledByDreadV42 = function(unitObj, ability){
  if(unitObj?.status?.dread) return (ability?.cost || 0) > 2;
  return isAbilityDisabledByDreadBeforeV122 ? isAbilityDisabledByDreadBeforeV122(unitObj, ability) : false;
};

const endRoundBeforeRequestedRulesV122 = endRound;
endRound = function(){
  const dreadToCarry = (state?.units || [])
    .filter(u => u.status?.dread && u.dreadLimitedActionsV122 && u.dreadExpiresRoundV122 !== state.round)
    .map(u => ({id:u.id, side:u.side, expires:(state.round || 1) + 1}));
  const result = endRoundBeforeRequestedRulesV122();
  if(state?.phase === "planning"){
    for(const item of dreadToCarry){
      const u = state.units?.find(x => x.id === item.id && x.side === item.side && !x.dead);
      if(!u) continue;
      u.status = u.status || {};
      u.status.dread = 1;
      u.dreadLimitedActionsV122 = true;
      u.dreadExpiresRoundV122 = item.expires;
    }
  }
  return result;
};

const damageBeforeRequestedRulesV122 = damage;
damage = function(src,t,amt,opt={}){
  const beforeHp = t?.hp ?? null;
  const beforePoison = t?.status?.poison || 0;
  const result = damageBeforeRequestedRulesV122(src,t,amt,opt);
  const afterPoison = t?.status?.poison || 0;
  const hpLost = beforeHp != null && t ? Math.max(0, beforeHp - (t.hp || 0)) : 0;

  if(src?.buff?.poisonHands && opt?.attack && t && !t.dead){
    if(opt?.melee){
      if((t.status?.poison || 0) <= beforePoison){
        applyStatusFrom?.(src,t,"poison",2);
        markPassive?.(src, "Poison Hands");
        pushActionEvent?.("passive", `Poison Hands applied 2 Poison`, src);
      }
    } else if(afterPoison > beforePoison){
      t.status.poison = Math.max(beforePoison, afterPoison - 2);
    }
  }

  if(hpLost > 0 && src?.id === "paleya" && opt?.attack && opt?.melee && t && !t.dead){
    addStatus(t,"hypnosis",1);
    markPassive?.(src, "Mesmeric Touch");
    pushActionEvent?.("passive", `${t.name} gained Hypnosis from Paleya's melee damage`, t);
  }

  return result;
};

const applyBeforeRequestedRulesV122 = apply;
apply = function(c,a,t){
  if(!c || !a) return applyBeforeRequestedRulesV122(c,a,t);
  const k = a.kind || a.effect;

  const cancelQueue = state.mirrorCancelV122 || [];
  const cancelIndex = cancelQueue.findIndex(item => item && item.targetId === c.id && item.targetSide === c.side);
  if(cancelIndex >= 0 && !a.guard){
    const [item] = cancelQueue.splice(cancelIndex,1);
    state.mirrorCancelV122 = cancelQueue;
    state.canceledActionKeys?.push?.(state.currentActionKey);
    spawnFloatingText?.(c, "Mind Guard canceled", "cancel");
    pushActionEvent?.("cancel", `${c.name}'s ${a.name} was canceled by ${item.casterName || "Mind Guard"}`, c);
    log(`${c.name}'s ${a.name} is canceled by ${item.casterName || "Mind Guard"}.`);
    return;
  }

  if(c.status?.frozen && !a.guard){
    c.status.frozen = 0;
    state.canceledActionKeys?.push?.(state.currentActionKey);
    spawnFloatingText?.(c, "Frozen", "cancel");
    pushActionEvent?.("cancel", `${c.name}'s ${a.name} was canceled by Frozen`, c);
    log(`${c.name} is Frozen and loses action.`);
    return;
  }

  if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(c,a)){
    state.canceledActionKeys?.push?.(state.currentActionKey);
    spawnFloatingText?.(c, "Dread: 2 AP limit", "cancel");
    pushActionEvent?.("cancel", `${c.name}'s ${a.name} was disabled by Dread`, c);
    log(`${c.name} cannot use ${a.name}; Dread limits this character to 2 AP.`);
    return;
  }

  switch(k){
    case "mirrorHypnoticGuard": {
      if(!t || t.dead || !(t.status?.hypnosis || 0)){
        log(`${c.name}'s ${a.name} needs a Hypnotized enemy.`);
        return;
      }
      t.status.hypnosis = 0;
      addStatus(t,"exposed",1);
      state.mirrorCancelV122 = state.mirrorCancelV122 || [];
      state.mirrorCancelV122.push({targetId:t.id,targetSide:t.side,casterId:c.id,casterSide:c.side,casterName:c.name});
      state.guarded = state.guarded || {};
      state.guarded[c.id] = true;
      spawnFloatingText?.(t, "Action snared", "status");
      pushActionEvent?.("cancel", `${c.name} consumed Hypnosis on ${t.name}; ${t.name}'s next action this turn will be canceled`, t);
      log(`${c.name} consumes Hypnosis on ${t.name}, applies Exposed, and snares its next action.`);
      return;
    }

    case "rowMindToxin": {
      const row = t?.row || "front";
      for(const enemy of rowUnits(other(c.side),row)){
        const hadHypnosis = !!enemy.status?.hypnosis;
        if(hadHypnosis) enemy.status.hypnosis = 0;
        damage(c,enemy,hadHypnosis ? (a.payoffDmg ?? 5) : (a.dmg ?? 3),{attack:true,melee:false,ignoreArmor:!!a.ignoreArmor});
        if(hadHypnosis && !enemy.dead) applyStatusFrom?.(c,enemy,"poison",a.poison ?? 2);
      }
      return;
    }

    case "frostPinDamage": {
      const hadFreeze = (t?.status?.freeze || 0) > 0;
      const dealt = damage(c,t,a.dmg ?? 3,{attack:true,melee:false});
      if(t && !t.dead) applyStatusFrom?.(c,t,"freeze",a.stacks ?? 2);
      if(hadFreeze && t && !t.dead) addStatus(t,"exposed",1);
      return dealt;
    }

    case "shadowMarkAttack": {
      damage(c,t,a.dmg ?? 1,{attack:true,melee:true,pierce:a.pierce || 0});
      if(t && !t.dead){
        addStatus(t,"exposed",1);
        addStatus(t,"dread",1);
      }
      return;
    }

    case "mindBreak": {
      if(c.id === "paleya" && a.id === "lance"){
        const hadHypnosis = !!t?.status?.hypnosis;
        if(hadHypnosis) t.status.hypnosis = 0;
        damage(c,t,hadHypnosis ? (a.payoffDmg ?? 8) : (a.dmg ?? 2),{attack:true,melee:true,ignoreArmor:!!a.ignoreArmor});
        return;
      }
      return applyBeforeRequestedRulesV122(c,a,t);
    }

    default:
      return applyBeforeRequestedRulesV122(c,a,t);
  }
};

const aiExpectedRawDamageBeforeRequestedRulesV122 = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
if(aiExpectedRawDamageBeforeRequestedRulesV122){
  aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "rowMindToxin"){
      const row = t?.row || "front";
      return rowUnits(other(c.side),row).reduce((sum, enemy) => sum + (enemy.status?.hypnosis ? (a.payoffDmg ?? 5) : (a.dmg ?? 3)), 0);
    }
    if(k === "shadowMarkAttack") return a.dmg ?? 1;
    if(k === "frostPinDamage") return a.dmg ?? 3;
    return aiExpectedRawDamageBeforeRequestedRulesV122(a,t,c);
  };
}

const aiValidTargetsBeforeRequestedRulesV122 = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
if(aiValidTargetsBeforeRequestedRulesV122){
  aiValidTargetsV95 = function(c,a){
    const k = a?.kind || a?.effect;
    if(k === "mirrorHypnoticGuard") return alive(other(c.side)).filter(t => (t.status?.hypnosis || 0) > 0);
    if(k === "rowMindToxin") return alive(other(c.side));
    return aiValidTargetsBeforeRequestedRulesV122(c,a);
  };
}

const aiIsSetupBeforeRequestedRulesV122 = typeof aiIsSetupV95 === "function" ? aiIsSetupV95 : null;
if(aiIsSetupBeforeRequestedRulesV122){
  aiIsSetupV95 = function(a){
    const k = a?.kind || a?.effect;
    if(k === "mirrorHypnoticGuard") return true;
    return aiIsSetupBeforeRequestedRulesV122(a);
  };
}

abilityTypeV109 = function(a){
  const text = `${a?.name || ""} ${a?.desc || ""} ${a?.effect || ""} ${a?.kind || ""}`.toLowerCase();
  const isAttack = /attack|deal .*damage|damage|hit|strike|slash|stab|bash|thrust|blade|needle|shot|pin|bite|drain|payoff/.test(text) || (a?.dmg || 0) > 0;
  const isArea = /all enemies|every enemy|enemy row|front row enemies|back row enemies|row setup|row control|aoe|\barea\b|\bmass\b|whiteout|\bfield\b|\brain\b|\broar\b/.test(text) || /^(row|all)/i.test(a?.effect || "") || ["rowMindToxin","massDrainBleed"].includes(a?.kind || a?.effect);
  if(a?.guard || /protect|guard|ward|dodge|predict|counter/.test(text)) return {key:"guard", icon:"&#128737;", label:"Guard"};
  if(isArea) return {key:"aoe", icon:"&#9678;", label:"Area"};
  if(isAttack && a?.range === "melee") return {key:"melee", icon:"&#9876;", label:"Melee"};
  if(isAttack && (a?.range === "ranged" || /ranged|projectile|shot/.test(text))) return {key:"ranged", icon:"&#10138;", label:"Ranged"};
  if(isAttack) return {key:"melee", icon:"&#9876;", label:"Melee"};
  if(a?.range === "ally" || /ally|buff|gain|grants|empowers|shield|armor|heal|restore|mend/.test(text)) return {key:"buff", icon:"&#10010;", label:"Buff"};
  if(a?.range === "ranged") return {key:"ranged", icon:"&#10138;", label:"Ranged"};
  return {key:"melee", icon:"&#9876;", label:"Melee"};
};

if(openWheelBeforeBriefV109){
  openWheel = function(u){
    const tile = document.querySelector(`.tile[data-unit-id="${u.id}"][data-side="${u.side}"]`) || document.querySelector(".tile.selected");
    const radial = $("radial");
    const wheel = $("wheel") || document.querySelector(".wheel");
    const tooltip = $("abilityTooltip");
    if(!radial || !wheel) return openWheelBeforeBriefV109(u);

    wheelPreviewAbilityIdV34 = null;
    radial.classList.remove("hidden");
    radial.classList.toggle("mobileRadialMode", isMobilePlayableV51());
    if(tooltip) {
      tooltip.classList.add("hidden");
      tooltip.classList.remove("mobileAbilitySheet");
    }

    let size;
    if(isMobilePlayableV51()){
      size = Math.min(window.innerWidth * 0.90, window.innerHeight * 0.38, 390);
      size = Math.max(315, size);
    } else {
      size = Math.min(380, Math.max(310, Math.min(window.innerWidth * 0.84, window.innerHeight * 0.64)));
    }
    wheel.style.width = size + "px";
    wheel.style.height = size + "px";

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    if(!isMobilePlayableV51() && tile){
      const r = tile.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    }
    const margin = size / 2 + 8;
    cx = Math.max(margin, Math.min(window.innerWidth - margin, cx));
    cy = Math.max(margin + 10, Math.min(window.innerHeight - margin - 100, cy));
    wheel.style.left = cx + "px";
    wheel.style.top = cy + "px";

    $("wheelCenter").innerHTML = `
      <div class="miniCenterName">${safeHtmlV109(u.name)}</div>
      <div class="miniCenterHint">${isMobilePlayableV51() ? "tap twice" : "choose"}</div>
    `;

    $("wheelButtons").innerHTML = u.abilities.map((a,i)=>{
      const speed = speedBreakdownV122(u,a);
      const iconUrl = abilityIconUrl(u, a);
      const dreadDisabled = typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a);
      const disabled = state.actionsLeft<a.cost || dreadDisabled;
      const dreadTitle = dreadDisabled ? ` title="Disabled by Dread's 2 AP limit"` : "";
      return `<button class="wheelBtn w${i} ${dreadDisabled ? "dreadDisabled" : ""}" ${disabled?"disabled":""}
        data-id="${safeHtmlV109(a.id)}" data-index="${i}" style="--prof-icon:url('${safeHtmlV109(iconUrl)}')"${dreadTitle}>
        ${dreadDisabled ? `<span class="dreadX">x</span>` : ""}
        ${abilityBriefIconsV109(u,a)}
        <span class="wheelBtnTitle">${safeHtmlV109(a.name)}</span>
        <span class="wheelBtnMeta">${dreadDisabled ? "Dread: 2 AP limit" : `${a.cost} AP / ${safeHtmlV109(speed.label)}`}</span>
      </button>`;
    }).join("");

    const chooseAbility = (a) => {
      if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a)) {
        showKeywordPopup?.("dread");
        return;
      }
      pendingAbility = a;
      radial.classList.add("hidden");
      if(tooltip) tooltip.classList.add("hidden");
      hideKeywordPopup?.();
      renderBattle();
      if(!targets(u,pendingAbility).length) plan(null);
    };

    const showTipFor = (btn, a) => {
      if(!tooltip) return;
      const type = abilityTypeV109(a);
      const speed = speedBreakdownV122(u,a);
      const disabledText = (typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(u,a))
        ? `<div class="rulesClarifier">${renderKeywordText("Dread limits this character to 2 AP next turn.")}</div>`
        : "";
      tooltip.innerHTML = `
        <div class="tipTop">
          <span class="tipIcon" style="background-image:url('${safeHtmlV109(abilityIconUrl(u,a))}')"></span>
          <div>
            <b>${safeHtmlV109(a.name)}</b>
            <small>${safeHtmlV109(type.label)} / ${a.cost} AP / ${safeHtmlV109(speed.label)}</small>
          </div>
        </div>
        <div class="abilityDescText">${renderKeywordText ? renderKeywordText(a.desc) : safeHtmlV109(a.desc)}</div>
        <div class="rulesClarifier">${safeHtmlV109(speed.detail)}</div>
        ${disabledText}
        ${clarityTextForAbility ? clarityTextForAbility(a) : ""}
        <div class="tipTags">
          <span>${safeHtmlV109(abilityIconKey(u,a))}</span>
          ${abilityTypeTagV109(a)}
          <span>${safeHtmlV109(a.range || (a.guard ? "guard" : "self"))}</span>
          ${isMobilePlayableV51() ? "<span>drag center to aim, release to choose</span>" : ""}
        </div>
      `;
      tooltip.classList.remove("hidden");
      positionAbilityTooltipV34(tooltip, wheel, btn, Number(btn.dataset.index));
    };

    if(tooltip){
      tooltip.onpointerdown = (ev) => {
        const kw = ev.target.closest(".keywordLink");
        if(kw){
          ev.preventDefault();
          ev.stopPropagation();
          showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
        } else {
          ev.stopPropagation();
        }
      };
      tooltip.onclick = (ev) => {
        const kw = ev.target.closest(".keywordLink");
        if(kw){
          ev.preventDefault();
          ev.stopPropagation();
          showKeywordPopup?.(kw.dataset.keyword, kw, kw.dataset.label);
          return;
        }
        ev.stopPropagation();
      };
    }

    const wheelButtonsV122 = [...document.querySelectorAll(".wheelBtn")];
    let lastHapticPreviewIdV122 = null;
    const previewWheelButtonV122 = (btn, a) => {
      if(!btn || btn.disabled) return;
      wheelButtonsV122.forEach(x=>x.classList.remove("previewing"));
      btn.classList.add("previewing");
      if(isMobilePlayableV51() && a?.id && lastHapticPreviewIdV122 !== a.id){
        lastHapticPreviewIdV122 = a.id;
        hapticV106?.("select");
      }
      showTipFor(btn,a);
    };

    wheelButtonsV122.forEach(b=>{
      let tappedOnce = false;
      const a = u.abilities[Number(b.dataset.index)];
      b.onpointerenter = () => {
        if(!isMobilePlayableV51() && !b.disabled) previewWheelButtonV122(b,a);
      };
      b.onfocus = () => {
        if(!isMobilePlayableV51() && !b.disabled) previewWheelButtonV122(b,a);
      };
      b.onpointerleave = () => {
        if(!isMobilePlayableV51()) b.classList.remove("previewing");
      };
      b.onclick = (ev) => {
        ev.stopPropagation();
        if(b.disabled) return;
        if(isMobilePlayableV51()){
          const already = b.classList.contains("previewing") || tappedOnce;
          previewWheelButtonV122(b,a);
          if(!already){
            tappedOnce = true;
            window.setTimeout(()=>{ tappedOnce = false; }, 900);
            return;
          }
        }
        chooseAbility(a);
      };
    });

    if(isMobilePlayableV51()){
      installRadialJoystickV112?.({
        radial,
        wheel,
        center:$("wheelCenter"),
        buttons:wheelButtonsV122,
        abilities:u.abilities,
        previewButton:previewWheelButtonV122,
        chooseAbility
      });
    }
  };
}

if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();

/* ===== v125 true final layer: latest front-row, bleed-hit, guard, and balance rules ===== */
{
  const char = id => ROSTER.find(x=>x.id===id);
  const ability = (cid,aid) => char(cid)?.abilities?.find(a=>a.id===aid);
  const patchChar = (id,props) => { const c = char(id); if(c) Object.assign(c,props); return c; };
  const patchAbility = (cid,aid,props) => { const a = ability(cid,aid); if(a) Object.assign(a,props); return a; };
  const keyFor = u => u ? `${u.side || ""}:${u.id}` : "";
  function rowsWithUnits(side){
    const living = alive(side), rows = [];
    if(living.some(u=>u.size==="boss")) rows.push("front","back");
    if(living.some(u=>(u.size==="rowBoss" || !u.size) && u.row==="front")) rows.push("front");
    if(living.some(u=>(u.size==="rowBoss" || !u.size) && u.row==="back")) rows.push("back");
    return [...new Set(rows)];
  }
  function frontRow(side){ const rows = rowsWithUnits(side); return rows.includes("front") ? "front" : (rows.includes("back") ? "back" : "front"); }
  function backRow(side){ const rows = rowsWithUnits(side); return rows.includes("back") ? "back" : (rows.includes("front") ? "front" : "back"); }
  function isFront(u){ return !!u && !u.dead && (u.size==="boss" || u.row===frontRow(u.side)); }
  function isBack(u){ return !!u && !u.dead && (u.size==="boss" || u.row===backRow(u.side)); }
  const oldRowUnits = rowUnits;
  rowUnits = (side,row) => row === "front" ? alive(side).filter(isFront) : (row === "back" ? alive(side).filter(isBack) : oldRowUnits(side,row));
  frontBlocked = side => alive(side).some(isFront);

  patchAbility("maoja","hands", {guard:true, guardType:true, spd:99, desc:"Guard buff. Choose an ally. Until the end of next round, that ally's melee hits apply 2 Poison to the target."});
  patchAbility("maoja","breath", {effect:"rowDamageStatus", kind:"rowDamageStatus", range:"front", frontRowOnly:true, dmg:1, status:"poison", stacks:3, desc:"Front-row attack. Deal 1 damage to each enemy in the current front row, then apply 3 Poison to each of them."});
  patchChar("fuego", {hp:18, armor:1});
  patchAbility("fuego","stoke", {cost:2, stacks:3, desc:"Firecraft. Gain 3 Flame counters."});
  patchAbility("fuego","nova", {mult:2, desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to 2 times the removed Flame counters to all enemies. Fuego gains Exhausted."});
  patchAbility("shaman","rupture", {bonus:0, desc:"Demon payoff. Remove all Poison and Bleed from one enemy. Deal removed counters x2 damage, ignoring Armor."});
  patchAbility("kku","guard", {effect:"iceGuardRetaliate", kind:"iceGuardRetaliate", guard:true, guardType:true, armor:2, stacks:1, desc:"Guard. K'ku gains +2 Armor this turn. Whenever an enemy melee attacks K'ku this turn, that attacker gains 1 Freeze."});
  patchAbility("dravain","bash", {name:"Vampiric Grab", cost:1, spd:0, effect:"vampiricGrab", kind:"vampiricGrab", range:"melee", dmg:2, pierce:2, bleed:2, heal:2, guardBonus:2, guardType:false, desc:"Melee attack. Deal 2 damage with Pierce 2. If hit, the target gains 2 Bleed and Dravain restores 2 HP. If the target performed a Guard move this round, deal +2 damage."});
  const evaGrab = char("eva")?.abilities?.find(a=>a.id==="kiss" || /vampire kiss/i.test(a.name || "")) || ability("eva","dash");
  if(evaGrab) Object.assign(evaGrab, {id:"kiss", name:"Vampiric Grab", cost:1, spd:0, effect:"vampiricGrab", kind:"vampiricGrab", range:"melee", dmg:2, pierce:2, bleed:2, heal:2, guardBonus:2, desc:"Melee attack. Deal 2 damage with Pierce 2. If hit, the target gains 2 Bleed and Lady Eva restores 2 HP. If the target performed a Guard move this round, deal +2 damage."});
  patchAbility("paleya","mesmer", {name:"Fae Portal Grab", cost:1, spd:0, effect:"faePortalGrab", kind:"faePortalGrab", range:"melee", backlineReach:true, dmg:3, guardBonus:3, desc:"Melee attack. Can target enemies at range. Deal 3 damage. If the target performed a Guard move this round, deal +3 damage."});

  function isGuardAbility(a){
    const k = a?.kind || a?.effect || "", text = `${a?.name || ""} ${a?.desc || ""} ${k}`.toLowerCase();
    return !!(a?.guard || a?.guardType || ["protect","ward","dodge","predict","predictPoison","selfCounter","spirit","bloodWard","frostArmorRetaliate","poisonHands","iceGuardRetaliate","mirrorHypnoticGuard","grantShield","hopeShield","dragonScales"].includes(k) || /\bguard\b|protect|ward|dodge|counter|shield|armor this turn|scales/.test(text));
  }
  for(const c of ROSTER) for(const a of c.abilities || []) if(isGuardAbility(a)){ a.guardType = true; a.tags = [...new Set([...(a.tags || []), "guard"])]; }
  function markGuard(c,a){ if(state && c && isGuardAbility(a)){ state.guardActionsV125 = state.guardActionsV125 || {}; state.guardActionsV125[keyFor(c)] = true; c.performedGuardRoundV125 = state.round; } }
  function performedGuard(u){ return !!(state && u && (u.performedGuardRoundV125 === state.round || state.guardActionsV125?.[keyFor(u)] || state.guarded?.[u.id])); }

  const oldTargets = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    const enemies = alive(other(c.side)), k = a.kind || a.effect;
    if(a.frontRowOnly || a.range === "front") return enemies.filter(isFront);
    if(k === "faePortalGrab") return enemies;
    if(a.range === "melee" && !a.backlineReach && !a.portalReach) return enemies.filter(isFront);
    return oldTargets(c,a);
  };
  const oldAiTargets = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
  if(oldAiTargets) aiValidTargetsV95 = function(c,a){
    if(!c || !a) return [];
    const enemies = alive(other(c.side)), k = a.kind || a.effect;
    if(a.frontRowOnly || a.range === "front") return enemies.filter(isFront);
    if(k === "faePortalGrab") return enemies;
    if(a.range === "melee" && !a.backlineReach && !a.portalReach) return enemies.filter(isFront);
    return oldAiTargets(c,a);
  };

  const oldApply = apply;
  apply = function(c,a,t){
    if(!c || !a) return oldApply(c,a,t);
    const k = a.kind || a.effect;
    const cancelQueue = state?.mirrorCancelV122 || [];
    const cancelIndex = cancelQueue.findIndex(item => item && item.targetId === c.id && item.targetSide === c.side);
    if(cancelIndex >= 0 && !a.guard){
      const [item] = cancelQueue.splice(cancelIndex,1);
      state.mirrorCancelV122 = cancelQueue;
      state.canceledActionKeys?.push?.(state.currentActionKey);
      spawnFloatingText?.(c, "Mind Guard canceled", "cancel");
      pushActionEvent?.("cancel", `${c.name}'s ${a.name} was canceled by ${item.casterName || "Mind Guard"}`, c);
      log(`${c.name}'s ${a.name} is canceled by ${item.casterName || "Mind Guard"}.`);
      return;
    }
    if(c.status?.frozen && !a.guard){
      c.status.frozen = 0;
      state.canceledActionKeys?.push?.(state.currentActionKey);
      spawnFloatingText?.(c, "Frozen", "cancel");
      pushActionEvent?.("cancel", `${c.name}'s ${a.name} was canceled by Frozen`, c);
      log(`${c.name} is Frozen and loses action.`);
      return;
    }
    if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(c,a)){
      state.canceledActionKeys?.push?.(state.currentActionKey);
      spawnFloatingText?.(c, "Dread: 2 AP limit", "cancel");
      pushActionEvent?.("cancel", `${c.name}'s ${a.name} was disabled by Dread`, c);
      log(`${c.name} cannot use ${a.name}; Dread limits this character to 2 AP.`);
      return;
    }
    markGuard(c,a);
    if(k === "rowDamageStatus" && (a.frontRowOnly || a.range === "front")){
      rowUnits(other(c.side),"front").forEach(x=>{ damage(c,x,a.dmg || 0,{attack:true,aoe:true,melee:false}); applyStatusFrom?.(c,x,a.status,a.stacks); });
      return;
    }
    if(k === "vampiricGrab"){
      if(!t || t.dead) return;
      const beforeHp = t.hp;
      damage(c,t,(a.dmg || 2) + (performedGuard(t) ? (a.guardBonus || 0) : 0),{attack:true,melee:true,pierce:a.pierce || 0});
      if(beforeHp > (t?.hp ?? beforeHp) && t && !t.dead){ applyStatusFrom?.(c,t,"bleed",a.bleed || 2); heal(c,a.heal || 2); }
      return;
    }
    if(k === "faePortalGrab"){
      if(!t || t.dead) return;
      damage(c,t,(a.dmg || 3) + (performedGuard(t) ? (a.guardBonus || 0) : 0),{attack:true,melee:true});
      return;
    }
    return oldApply(c,a,t);
  };

  const oldDamage = damage;
  damage = function(src,t,amt,opt={}){
    const target = t, beforeHp = target?.hp ?? null;
    const beforeBleed = opt?.attack && target ? (target.status?.bleed || 0) : 0;
    const beforeSrcFreeze = src?.status?.freeze || 0;
    const iceGuardReady = !!(opt?.attack && opt?.melee && target?.buff?.iceGuardRetaliateV118 && src && !src.dead);
    if(beforeBleed > 0 && target?.status) target.status.bleed = 0;
    const result = oldDamage(src,t,amt,opt);
    if(beforeBleed > 0 && target && !target.dead){
      target.status.bleed = (target.status.bleed || 0) + beforeBleed;
      const hpLostByAttack = beforeHp !== null ? Math.max(0, beforeHp - target.hp) : 0;
      if(hpLostByAttack > 0){
        target.status.bleed = Math.max(0, (target.status.bleed || 0) - beforeBleed);
        loseHpDirect(target,beforeBleed,"Bleed after hit");
        pushActionEvent?.("hp", `${target.name}'s Bleed resolved after being hit for ${beforeBleed} HP`, target, {value:beforeBleed});
        log(`${target.name}'s Bleed resolves after the hit for ${beforeBleed} HP and is removed.`);
      }
    }
    if(opt?.attack && beforeHp !== null && target && beforeHp > target.hp){ state.hitThisRoundV125 = state.hitThisRoundV125 || {}; state.hitThisRoundV125[keyFor(target)] = true; }
    if(iceGuardReady && (src.status?.freeze || 0) <= beforeSrcFreeze){
      const stacks = target.buff.iceGuardRetaliateV118.stacks || 1;
      addStatus(src,"freeze",stacks);
      markPassive?.(target, "Ice Guard");
      pushActionEvent?.("statusGain", `${src.name} gained ${stacks} Freeze from Ice Guard`, src);
      log(`${src.name} gains ${stacks} Freeze from ${target.name}'s Ice Guard.`);
    }
    return result;
  };

  const oldEndRound = endRound;
  endRound = function(){
    if(state){ state.guardActionsV125 = {}; state.hitThisRoundV125 = {}; for(const u of state.units || []) delete u.performedGuardRoundV125; }
    return oldEndRound();
  };
  const oldAiDamage = typeof aiExpectedRawDamageV95 === "function" ? aiExpectedRawDamageV95 : null;
  if(oldAiDamage) aiExpectedRawDamageV95 = function(a,t,c){
    const k = a?.kind || a?.effect;
    if(k === "vampiricGrab") return (a.dmg || 2) + (performedGuard(t) ? (a.guardBonus || 0) : 0);
    if(k === "faePortalGrab") return (a.dmg || 3) + (performedGuard(t) ? (a.guardBonus || 0) : 0);
    if(k === "demonRupture") return ((t ? aiStatusV95(t,"poison") + aiStatusV95(t,"bleed") : 0) * (a.mult || 2)) + (a.bonus || 0);
    if(k === "fuegoSuperNova"){ const flame = Math.max(0, c?.status?.flame || 0); return flame * (a.mult ?? 2) * Math.max(1, aiEnemiesV95?.(c)?.length || 1); }
    return oldAiDamage(a,t,c);
  };
  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.hit = {title:"Hit", text:"An attack hits only when the target loses HP after Armor and Shield are applied. Effects that say \"if hit\" do not trigger when the attack is fully blocked."};
    KEYWORDS_V32.bleed = {...(KEYWORDS_V32.bleed || {title:"Bleed"}), text:"Bleed counters stay on the character until an attack hits them. After that HP loss, all Bleed counters resolve as direct HP loss and are removed."};
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)) ["Hit","hit"].forEach(word=>{ if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word); });
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v127 Duler targeting, poison-hand clarity, log close, and latest balance fixes ===== */
{
  const charV127 = id => ROSTER.find(x=>x.id===id);
  const abilityV127 = (cid,aid) => charV127(cid)?.abilities?.find(a=>a.id===aid);
  const keyForV127 = u => u ? `${u.side || ""}:${u.id}` : "";
  const kindV127 = a => a?.kind || a?.effect;
  const enemyOfV127 = c => other(c.side);
  const liveV127 = side => alive(side);
  const rowsWithUnitsV127 = side => {
    const units = liveV127(side), rows = [];
    if(units.some(u=>u.size==="boss")) rows.push("front","back");
    if(units.some(u=>(u.size==="rowBoss" || !u.size) && u.row==="front")) rows.push("front");
    if(units.some(u=>(u.size==="rowBoss" || !u.size) && u.row==="back")) rows.push("back");
    return [...new Set(rows)];
  };
  const frontRowV127 = side => {
    const rows = rowsWithUnitsV127(side);
    return rows.includes("front") ? "front" : (rows.includes("back") ? "back" : "front");
  };
  const backRowV127 = side => {
    const rows = rowsWithUnitsV127(side);
    return rows.includes("back") ? "back" : (rows.includes("front") ? "front" : "back");
  };
  const dynamicRowUnitsV127 = (side,row) => {
    if(row === "front") return liveV127(side).filter(u=>u.size==="boss" || u.row===frontRowV127(side));
    if(row === "back") return liveV127(side).filter(u=>u.size==="boss" || u.row===backRowV127(side));
    return rowUnits(side,row);
  };
  const sortedBySlotV127 = units => [...units].sort((a,b)=>(a.row || "").localeCompare(b.row || "") || (a.col || 0) - (b.col || 0));
  const isGuardAbilityV127 = a => {
    const k = kindV127(a), text = `${a?.name || ""} ${a?.desc || ""} ${k || ""}`.toLowerCase();
    return !!(a?.guard || a?.guardType || a?.tags?.includes?.("guard") || /\bguard\b|protect|ward|dodge|counter|shield|armor this turn|scales|scare/.test(text));
  };
  const markGuardV127 = (u,a) => {
    if(!state || !u || !isGuardAbilityV127(a)) return;
    state.guardActionsV127 = state.guardActionsV127 || {};
    state.guardActionsV127[keyForV127(u)] = true;
    u.performedGuardRoundV127 = state.round;
  };
  const performedGuardV127 = u => !!(state && u && (
    u.performedGuardRoundV127 === state.round ||
    u.performedGuardRoundV125 === state.round ||
    state.guardActionsV127?.[keyForV127(u)] ||
    state.guardActionsV125?.[keyForV127(u)] ||
    state.guarded?.[u.id]
  ));
  const hitV127 = (before,t) => before != null && t && !t.dead && before > (t.hp || 0);

  ART.duler = "url('assets/duler.png')";

  const dulerV127 = charV127("duler");
  if(dulerV127){
    Object.assign(dulerV127,{art:ART.duler});
    const swipe = abilityV127("duler","chainSwipe");
    if(swipe) Object.assign(swipe,{range:"front",frontRowOnly:true,melee:true,desc:"Shadow melee area attack. Deal 4 damage to each enemy in the current front row. Each enemy hit gains Dread."});
    const scare = abilityV127("duler","scare");
    if(scare) Object.assign(scare,{guard:true,guardType:true,tags:[...new Set([...(scare.tags || []),"guard"])],desc:"Guard-speed control. Choose an enemy. If there is free space in its back row, move it there until the end of the round."});
    const slam = abilityV127("duler","chainSlam");
    if(slam) Object.assign(slam,{range:"melee",backlineReach:true,melee:true,requiresTwoTargets:true,desc:"Shadow melee chain attack. Choose one enemy in each occupied row. Attack both for 4 damage. Each enemy hit gains Exhausted."});
  }

  const evaStabV127 = abilityV127("eva","stab");
  if(evaStabV127){
    Object.assign(evaStabV127,{
      effect:"crimsonStabV127",
      kind:"crimsonStabV127",
      dmg:1,
      pierce:2,
      bleed:3,
      range:"melee",
      desc:"Melee precision attack. Deal 1 damage with Pierce 2. If hit, the target gains 3 Bleed."
    });
  }

  const maojaHandsV127 = abilityV127("maoja","hands");
  if(maojaHandsV127){
    Object.assign(maojaHandsV127,{
      guard:true,
      guardType:true,
      spd:99,
      range:"ally",
      desc:"Guard buff. Choose an ally. Until the end of this round, that ally's attacks apply 2 Poison to the target."
    });
  }

  if(typeof STATUS_LABELS_V17 !== "undefined"){
    STATUS_LABELS_V17.dread = {
      icon:icon?.("dread") || "!",
      title:"Dread",
      text:"Dread limits this character to abilities costing 2 AP or less on its next turn."
    };
    STATUS_LABELS_V17.poisonHands = {
      icon:"☠️",
      title:"Poison Hands",
      text:"This character's attacks apply 2 Poison to the target until the end of the current round."
    };
  }
  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.dread = STATUS_LABELS_V17?.dread || KEYWORDS_V32.dread;
    KEYWORDS_V32.poisonHands = STATUS_LABELS_V17?.poisonHands || {title:"Poison Hands", text:"Attacks apply Poison while this buff is active."};
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread","Poison Hands"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV127 = icon;
  icon = function(s){
    if(s === "dread") return "!";
    if(s === "poisonHands") return "☠️";
    return iconBeforeV127(s);
  };

  const showStatusBeforeV127 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusBeforeV127){
    showStatusInfo = function(key){
      const normalized = key === "poisonHandsBuff" ? "poisonHands" : key;
      if(normalized === "dread" || normalized === "poisonHands") setBattlePanelV101?.("info");
      return showStatusBeforeV127(normalized);
    };
  }

  const statusTextBeforeV127 = statusText;
  statusText = function(u){
    let html = statusTextBeforeV127(u);
    if(u?.buff?.poisonHands){
      const chip = chipHtml("poisonHands","☠️2");
      const planChipMatch = html.match(/<span class="chip">[^\n]*?(?:✅|❗)[\s\S]*?<\/span>$/);
      if(planChipMatch) html = html.replace(planChipMatch[0], chip + planChipMatch[0]);
      else html += chip;
    }
    return html;
  };

  const targetsBeforeV127 = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    const k = kindV127(a);
    if(a.range === "ally" || ["poisonHands","bloodInfusion","bloodWard","protect","ward","grantShield","hopeShield"].includes(k)){
      return liveV127(c.side);
    }
    if(k === "dulerChainSlam"){
      const pick = state?.chainSlamPickV127;
      const enemies = liveV127(enemyOfV127(c));
      if(pick && pick.unitId === c.id && pick.unitSide === c.side && pick.abilityId === a.id){
        const first = unitBySide(pick.firstId,pick.firstSide);
        const otherRows = rowsWithUnitsV127(enemyOfV127(c)).filter(row=>row !== first?.row);
        return otherRows.flatMap(row=>dynamicRowUnitsV127(enemyOfV127(c),row)).filter(u=>u && u !== first);
      }
      return enemies;
    }
    return targetsBeforeV127(c,a);
  };

  const aiTargetsBeforeV127 = typeof aiValidTargetsV95 === "function" ? aiValidTargetsV95 : null;
  if(aiTargetsBeforeV127){
    aiValidTargetsV95 = function(c,a){
      if(!c || !a) return [];
      const k = kindV127(a);
      if(a.range === "ally" || ["poisonHands","bloodInfusion","bloodWard","protect","ward","grantShield","hopeShield"].includes(k)){
        return liveV127(c.side);
      }
      if(k === "dulerChainSlam") return liveV127(enemyOfV127(c));
      return aiTargetsBeforeV127(c,a);
    };
  }

  const targetScoreBeforeV127 = typeof aiTargetScoreV95 === "function" ? aiTargetScoreV95 : null;
  if(targetScoreBeforeV127){
    aiTargetScoreV95 = function(c,a,t,ap=3){
      if(a?.range === "ally" && t?.side !== c?.side) return -999;
      return targetScoreBeforeV127(c,a,t,ap);
    };
  }

  const planBeforeV127 = plan;
  plan = function(target){
    const c = selectedUnit?.();
    const a = pendingAbility;
    if(c && a && kindV127(a) === "dulerChainSlam" && state?.phase === "planning"){
      if(!state.chainSlamPickV127){
        if(!target || !targets(c,a).includes(target)) return;
        state.chainSlamPickV127 = {unitId:c.id,unitSide:c.side,abilityId:a.id,firstId:target.id,firstSide:target.side};
        spawnFloatingText?.(target,"First chain target","status");
        hapticV106?.("select");
        renderBattle();
        show?.("Choose one enemy in the other row for Chain Slam.");
        return;
      }
      const pick = state.chainSlamPickV127;
      const first = unitBySide(pick.firstId,pick.firstSide);
      if(!first || !target || !targets(c,a).includes(target)) return;
      if(state.actionsLeft < a.cost) return;
      state.actionsLeft -= a.cost;
      const p = makePlan(c,a,first,"player");
      p.extraTargetId = target.id;
      p.extraTargetSide = target.side;
      if(!Array.isArray(state.plans)) state.plans = [];
      state.plans.push(p);
      log(`${c.name} queued ${a.name} on ${first.name} and ${target.name}.`);
      state.chainSlamPickV127 = null;
      selectedId = null;
      selectedSide = null;
      pendingAbility = null;
      addMomentClassV106?.(tileElForUnitV106?.(c), "planCommitV106", 520);
      addMomentClassV106?.(tileElForUnitV106?.(target), "targetPingV106", 520);
      pulseQueueV106?.();
      hapticV106?.("commit");
      playSfxV106?.("commit");
      renderBattle();
      return;
    }
    if(state) state.chainSlamPickV127 = null;
    return planBeforeV127(target);
  };

  const renderBattleBeforeV127 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV127();
    const pick = state?.chainSlamPickV127;
    if(pick){
      const firstEl = document.querySelector(`.tile[data-unit-id="${CSS.escape(pick.firstId)}"][data-side="${CSS.escape(pick.firstSide)}"]`);
      firstEl?.classList.add("chainSlamFirstV127");
    }
    const logBtn = $("battleLogToggleBtn");
    if(logBtn){
      logBtn.onclick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const panel = $("infoPanelSheet");
        const open = panel && !panel.classList.contains("panelClosedV101") && panel.classList.contains("showLogV101");
        setBattlePanelV101?.(open ? "closed" : "log");
      };
      const panel = $("infoPanelSheet");
      logBtn.textContent = panel && !panel.classList.contains("panelClosedV101") && panel.classList.contains("showLogV101") ? "Close Log" : "Log";
    }
    return result;
  };

  const applyBeforeV127 = apply;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV127(c,a,t);
    markGuardV127(c,a);
    const k = kindV127(a);
    const cancelQueue = state?.mirrorCancelV122 || [];
    const cancelIndex = cancelQueue.findIndex(item => item && item.targetId === c.id && item.targetSide === c.side);
    if(cancelIndex >= 0 && !a.guard){
      const [item] = cancelQueue.splice(cancelIndex,1);
      state.mirrorCancelV122 = cancelQueue;
      state.canceledActionKeys?.push?.(state.currentActionKey);
      spawnFloatingText?.(c, "Mind Guard canceled", "cancel");
      pushActionEvent?.("cancel", `${c.name}'s ${a.name} was canceled by ${item.casterName || "Mind Guard"}`, c);
      log(`${c.name}'s ${a.name} is canceled by ${item.casterName || "Mind Guard"}.`);
      return;
    }
    if(c.status?.frozen && !a.guard){
      c.status.frozen = 0;
      state.canceledActionKeys?.push?.(state.currentActionKey);
      spawnFloatingText?.(c, "Frozen", "cancel");
      pushActionEvent?.("cancel", `${c.name}'s ${a.name} was canceled by Frozen`, c);
      log(`${c.name} is Frozen and loses action.`);
      return;
    }
    if(typeof isAbilityDisabledByDreadV42 === "function" && isAbilityDisabledByDreadV42(c,a)){
      state.canceledActionKeys?.push?.(state.currentActionKey);
      spawnFloatingText?.(c, "Dread: 2 AP limit", "cancel");
      pushActionEvent?.("cancel", `${c.name}'s ${a.name} was disabled by Dread`, c);
      log(`${c.name} cannot use ${a.name}; Dread limits this character to 2 AP.`);
      return;
    }
    if(k === "poisonHands"){
      if(t && !t.dead){
        t.buff = t.buff || {};
        t.buff.poisonHands = 1;
        t.buff.poisonHandsExpiresRoundV127 = state.round;
        spawnFloatingText?.(t,"Poison Hands", "status");
        pushActionEvent?.("statusGain", `${t.name}'s attacks apply 2 Poison until end of round`, t);
        log(`${t.name}'s attacks apply 2 Poison until the end of this round.`);
      }
      return;
    }
    if(k === "crimsonStabV127"){
      if(!t || t.dead) return;
      const before = t.hp;
      damage(c,t,a.dmg || 1,{attack:true,melee:true,pierce:a.pierce || 2});
      if(hitV127(before,t) && t && !t.dead) applyStatusFrom?.(c,t,"bleed",a.bleed || 3);
      return;
    }
    if(k === "vampiricGrab"){
      if(!t || t.dead) return;
      const before = t.hp;
      const raw = (a.dmg || 2) + (performedGuardV127(t) ? (a.guardBonus || 0) : 0);
      damage(c,t,raw,{attack:true,melee:true,pierce:a.pierce || 0});
      if(hitV127(before,t) && t && !t.dead){
        applyStatusFrom?.(c,t,"bleed",a.bleed || 2);
        heal(c,a.heal || 2);
      }
      return;
    }
    if(k === "dulerChainSlam"){
      if(!t || t.dead) return;
      const planObj = state?.plans?.find(p=>p.pid === state.currentActionKey);
      const extra = planObj?.extraTargetId ? unitBySide(planObj.extraTargetId,planObj.extraTargetSide) : null;
      const victims = [t];
      if(extra && !extra.dead && extra.side === t.side && extra !== t) victims.push(extra);
      if(victims.length === 1){
        for(const row of rowsWithUnitsV127(t.side).filter(row=>row !== t.row)){
          const candidate = sortedBySlotV127(dynamicRowUnitsV127(t.side,row).filter(u=>u !== t))[0];
          if(candidate) victims.push(candidate);
        }
      }
      for(const enemy of victims){
        const before = enemy.hp;
        damage(c,enemy,a.dmg || 4,{attack:true,aoe:true,melee:true});
        if(hitV127(before,enemy)) addStatus(enemy,"exhausted",1);
      }
      return;
    }
    return applyBeforeV127(c,a,t);
  };

  const damageBeforeV127 = damage;
  damage = function(src,t,amt,opt={}){
    const beforePoison = t?.status?.poison || 0;
    const result = damageBeforeV127(src,t,amt,opt);
    if(src?.buff?.poisonHands && opt?.attack && t && !t.dead && (t.status?.poison || 0) <= beforePoison){
      applyStatusFrom?.(src,t,"poison",2);
      markPassive?.(src,"Poison Hands");
      pushActionEvent?.("passive", `Poison Hands applied 2 Poison`, src);
    }
    return result;
  };

  const endRoundBeforeV127 = endRound;
  endRound = function(){
    if(state?.units){
      for(const u of state.units){
        if(u?.buff?.poisonHands && u.buff.poisonHandsExpiresRoundV127 === state.round) delete u.buff.poisonHands;
        delete u?.buff?.poisonHandsExpiresRoundV127;
        delete u?.performedGuardRoundV127;
      }
      state.guardActionsV127 = {};
      state.chainSlamPickV127 = null;
    }
    return endRoundBeforeV127();
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    performedGuardV127,
    dynamicRowUnitsV127
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v130 actual final runtime layer: Chain Slam, Dread, delayed judgement, and log close ===== */
{
  const enemySideV130 = side => side === "player" ? "enemy" : "player";
  const liveV130 = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const unitV130 = (id, side) => (state?.units || []).find(u => u && !u.dead && u.id === id && u.side === side);
  const rowsV130 = side => ["front","back"].filter(row => liveV130(side).some(u => u.row === row));
  const rowUnitsV130 = (side,row) => liveV130(side).filter(u => u.row === row).sort((a,b)=>(a.col||0)-(b.col||0));
  const frontRowsV130 = side => {
    const rows = rowsV130(side);
    return rows.length ? [rows[0]] : [];
  };
  const kindV130 = a => a?.effect || a?.kind || a?.id || "";
  const hitV130 = (before,t) => !!t && Number.isFinite(before) && t.hp < before;

  if(typeof STATUS_LABELS_V17 !== "undefined"){
    STATUS_LABELS_V17.dread = {title:"Dread", text:"Next turn, this character is limited to 2 actions."};
    STATUS_LABELS_V17.delayedJudgement = {title:"Delayed Judgement", text:"This character will be hit by Delayed Judgement at the start of the next round."};
  }
  if(typeof KEYWORDS_V32 !== "undefined"){
    KEYWORDS_V32.dread = STATUS_LABELS_V17?.dread || KEYWORDS_V32.dread;
    KEYWORDS_V32.hit = {title:"Hit", text:"An attack hits when the target loses life from that attack."};
  }
  if(window.KEYWORDS_V32_SAFE){
    window.KEYWORDS_V32_SAFE.dread = STATUS_LABELS_V17?.dread || window.KEYWORDS_V32_SAFE.dread;
    window.KEYWORDS_V32_SAFE.hit = KEYWORDS_V32?.hit || window.KEYWORDS_V32_SAFE.hit;
  }
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread","Hit","hit"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const rosterV130 = typeof ROSTER !== "undefined" && Array.isArray(ROSTER) ? ROSTER : [];
  const hopeDefV130 = rosterV130.find(c => c.id === "hope");
  const judgementV130 = hopeDefV130?.abilities?.find(a => a.id === "judgement");
  if(judgementV130){
    judgementV130.effect = "hopeDelayedJudgementV130";
    judgementV130.kind = "delayedAttack";
    judgementV130.dmg = 6;
    judgementV130.delay = 1;
    judgementV130.range = "ranged";
    judgementV130.text = "Delayed ranged attack. Choose one enemy. At the start of next round, deal 6 damage.";
  }

  function addDreadV130(target){
    if(!target || target.dead) return;
    target.status = target.status || {};
    target.status.dread = Math.max(target.status.dread || 0, 1);
    if(typeof setDreadLimitV122 === "function") setDreadLimitV122(target);
  }

  function consumeAttackBuffV130(c){
    const infusion = c?.buff?.bloodInfusion ? {...c.buff.bloodInfusion} : null;
    const bonus = Math.max(0, Number(c?.buff?.nextAttackDamageV126 || 0) + Number(infusion?.bonus || 0));
    const bleed = Number(infusion?.bleed || 0);
    if(c?.buff){
      delete c.buff.nextAttackDamageV126;
      delete c.buff.bloodInfusion;
    }
    return {bonus, bleed};
  }

  function applyBuffBleedV130(c,t,buff){
    if(buff?.bleed && t && !t.dead) applyStatusFrom?.(c,t,"bleed",buff.bleed);
  }

  function scheduleDelayedJudgementV130(c,a,t){
    if(!c || !a || !t || t.dead) return;
    state.delayedActionsV130 = Array.isArray(state.delayedActionsV130) ? state.delayedActionsV130 : [];
    state.delayedActionsV130.push({
      sourceId:c.id,
      sourceSide:c.side,
      targetId:t.id,
      targetSide:t.side,
      dueRound:(state.round || 1) + (a.delay || 1),
      dmg:a.dmg || 6,
      abilityName:a.name || "Delayed Judgement"
    });
    t.status = t.status || {};
    t.status.delayedJudgement = Math.max(t.status.delayedJudgement || 0, 1);
    spawnFloatingText?.(t,"Judgement next round","status");
    pushActionEvent?.("statusGain", `${c.name}'s ${a.name || "Delayed Judgement"} will strike ${t.name} next round`, t);
    log(`${c.name} prepared ${a.name || "Delayed Judgement"} against ${t.name}.`);
  }

  function resolveDelayedJudgementsV130(){
    if(!state) return;
    const due = [];
    const pending = [];
    for(const item of state.delayedActionsV130 || []){
      if(item && item.dueRound <= (state.round || 1)) due.push(item);
      else if(item) pending.push(item);
    }
    state.delayedActionsV130 = pending;
    for(const item of due){
      const source = unitV130(item.sourceId,item.sourceSide);
      const target = unitV130(item.targetId,item.targetSide);
      if(!source || !target) continue;
      if(target.status) delete target.status.delayedJudgement;
      state.currentActionKey = `delayed:${item.sourceSide}:${item.sourceId}:${item.targetSide}:${item.targetId}:${state.round}`;
      addMomentClassV106?.(tileElForUnitV106?.(source), "activeActionV125", 620);
      damage(source,target,item.dmg || 6,{attack:true,ranged:true,melee:false});
      pushActionEvent?.("hit", `${item.abilityName || "Delayed Judgement"} struck ${target.name}`, target);
      log(`${item.abilityName || "Delayed Judgement"} struck ${target.name}.`);
      state.currentActionKey = null;
    }
  }

  function commitChainSlamV130(c,a,first,second){
    if(!c || !a || !first || state.actionsLeft < (a.cost || 0)) return false;
    state.actionsLeft -= a.cost || 0;
    const p = makePlan(c,a,first,"player");
    if(second && !second.dead){
      p.extraTargetId = second.id;
      p.extraTargetSide = second.side;
    }
    if(!Array.isArray(state.plans)) state.plans = [];
    state.plans.push(p);
    log(`${c.name} queued ${a.name} on ${first.name}${second ? ` and ${second.name}` : ""}.`);
    state.chainSlamPickV127 = null;
    selectedId = null;
    selectedSide = null;
    pendingAbility = null;
    addMomentClassV106?.(tileElForUnitV106?.(c), "planCommitV106", 520);
    addMomentClassV106?.(tileElForUnitV106?.(first), "targetPingV106", 520);
    if(second) addMomentClassV106?.(tileElForUnitV106?.(second), "targetPingV106", 520);
    pulseQueueV106?.();
    hapticV106?.("commit");
    playSfxV106?.("commit");
    renderBattle();
    return true;
  }

  const targetsBeforeV130 = targets;
  targets = function(c,a){
    if(!c || !a) return [];
    if(kindV130(a) === "dulerChainSlam"){
      const enemySide = enemySideV130(c.side);
      const pick = state?.chainSlamPickV127;
      if(pick && pick.unitId === c.id && pick.unitSide === c.side && pick.abilityId === a.id){
        const first = unitV130(pick.firstId,pick.firstSide);
        if(!first) return [];
        return rowsV130(enemySide).filter(row => row !== first.row).flatMap(row => rowUnitsV130(enemySide,row));
      }
      return liveV130(enemySide);
    }
    return targetsBeforeV130(c,a);
  };

  const planBeforeV130 = plan;
  plan = function(target){
    const c = selectedUnit?.();
    const a = pendingAbility;
    if(c && a && kindV130(a) === "dulerChainSlam" && state?.phase === "planning"){
      const pick = state.chainSlamPickV127;
      if(!pick){
        if(!target || !targets(c,a).includes(target)) return;
        state.chainSlamPickV127 = {unitId:c.id,unitSide:c.side,abilityId:a.id,firstId:target.id,firstSide:target.side};
        const remaining = targets(c,a);
        if(!remaining.length){
          commitChainSlamV130(c,a,target,null);
          return;
        }
        spawnFloatingText?.(target,"First chain target","status");
        hapticV106?.("select");
        renderBattle();
        show?.("Choose one enemy in the other row for Chain Slam.");
        return;
      }
      const first = unitV130(pick.firstId,pick.firstSide);
      if(!first){
        state.chainSlamPickV127 = null;
        renderBattle();
        return;
      }
      if(!target){
        const remaining = targets(c,a);
        commitChainSlamV130(c,a,first,remaining[0] || null);
        return;
      }
      if(!targets(c,a).includes(target)) return;
      commitChainSlamV130(c,a,first,target);
      return;
    }
    if(state) state.chainSlamPickV127 = null;
    return planBeforeV130(target);
  };

  const applyBeforeV130 = apply;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV130(c,a,t);
    const k = kindV130(a);
    if(k === "hopeDelayedJudgementV130" || (c.id === "hope" && a.id === "judgement")){
      scheduleDelayedJudgementV130(c,a,t);
      return;
    }
    if(k === "dulerChainSwipe"){
      const buff = consumeAttackBuffV130(c);
      const victims = frontRowsV130(enemySideV130(c.side)).flatMap(row => rowUnitsV130(enemySideV130(c.side),row));
      for(const enemy of victims){
        const before = enemy.hp;
        damage(c,enemy,(a.dmg || 4) + buff.bonus,{attack:true,aoe:true,melee:true});
        if(hitV130(before,enemy)){
          addDreadV130(enemy);
          applyBuffBleedV130(c,enemy,buff);
        }
      }
      return;
    }
    if(k === "dulerChainSlam"){
      if(!t || t.dead) return;
      const planObj = state?.plans?.find(p => p.pid === state.currentActionKey);
      const extra = planObj?.extraTargetId ? unitV130(planObj.extraTargetId,planObj.extraTargetSide) : null;
      const victims = [t];
      if(extra && extra !== t && !extra.dead) victims.push(extra);
      if(victims.length === 1){
        const otherRows = rowsV130(t.side).filter(row => row !== t.row);
        for(const row of otherRows){
          const candidate = rowUnitsV130(t.side,row).find(u => u !== t);
          if(candidate){
            victims.push(candidate);
            break;
          }
        }
      }
      const buff = consumeAttackBuffV130(c);
      for(const enemy of victims){
        const before = enemy.hp;
        damage(c,enemy,(a.dmg || 4) + buff.bonus,{attack:true,aoe:true,melee:true});
        if(hitV130(before,enemy)){
          addStatus(enemy,"exhausted",1);
          applyBuffBleedV130(c,enemy,buff);
        }
      }
      return;
    }
    return applyBeforeV130(c,a,t);
  };

  const endRoundBeforeV130 = endRound;
  endRound = function(){
    const result = endRoundBeforeV130();
    resolveDelayedJudgementsV130();
    if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
    return result;
  };

  function ensureBattleLogCloseV130(){
    const panel = $("infoPanelSheet");
    if(!panel) return;
    let btn = $("battleLogCloseBtnV128");
    if(!btn){
      btn = document.createElement("button");
      btn.id = "battleLogCloseBtnV128";
      btn.type = "button";
      btn.setAttribute("aria-label","Close battle log");
      btn.textContent = "x";
      panel.appendChild(btn);
    }
    btn.onclick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      setBattlePanelV101?.("closed");
      renderBattle();
    };
    btn.hidden = panel.classList.contains("panelClosedV101") || !panel.classList.contains("showLogV101");
    const logBtn = $("battleLogToggleBtn");
    if(logBtn){
      logBtn.textContent = "Log";
      logBtn.onclick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const isOpen = !panel.classList.contains("panelClosedV101") && panel.classList.contains("showLogV101");
        setBattlePanelV101?.(isOpen ? "closed" : "log");
        ensureBattleLogCloseV130();
      };
    }
  }

  const renderBattleBeforeV130 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV130();
    ensureBattleLogCloseV130();
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    resolveDelayedJudgementsV130,
    addDreadV130
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v132 actual final live UI fixes: Chain Slam click fallback and Dread polish ===== */
{
  const dreadInfoV132 = {
    icon:"!",
    title:"Dread",
    text:"Next turn, this character is limited to 2 actions."
  };
  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = dreadInfoV132;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = dreadInfoV132;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = dreadInfoV132;
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV132 = typeof icon === "function" ? icon : null;
  if(iconBeforeV132){
    icon = function(s){
      if(s === "dread") return "!";
      return iconBeforeV132(s);
    };
  }

  const renderKeywordTextBeforeV132 = typeof renderKeywordText === "function" ? renderKeywordText : null;
  if(renderKeywordTextBeforeV132){
    renderKeywordText = function(text){
      let html = renderKeywordTextBeforeV132(text);
      if(!html || html.includes('data-keyword="dread"')) return html;
      return html.replace(/\b(Dread)\b/g, `<button type="button" class="keywordLink" data-keyword="dread" data-label="Dread">Dread</button>`);
    };
  }

  const showStatusInfoBeforeV132 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV132){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${dreadInfoV132.icon} ${dreadInfoV132.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${dreadInfoV132.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV132(key);
    };
  }

  function liveUnitV132(id, side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function chainSlamSecondPickFallbackV132(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const target = liveUnitV132(tileEl.dataset.unitId, tileEl.dataset.side);
    const actor = liveUnitV132(pick.unitId, pick.unitSide);
    const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
    if(!target || !actor || !ability || target.side === actor.side) return;
    selectedId = actor.id;
    selectedSide = actor.side;
    pendingAbility = ability;
    const legal = typeof targets === "function" ? targets(actor, ability) : [];
    if(!legal.includes(target)) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation?.();
    plan(target);
  }

  if(!window.__chainSlamSecondPickFallbackV132){
    window.__chainSlamSecondPickFallbackV132 = true;
    document.addEventListener("pointerdown", chainSlamSecondPickFallbackV132, true);
    document.addEventListener("click", chainSlamSecondPickFallbackV132, true);
  }

  const renderBattleBeforeV132 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV132();
    const pick = state?.chainSlamPickV127;
    if(pick){
      const actor = liveUnitV132(pick.unitId, pick.unitSide);
      const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
      if(actor && ability){
        for(const target of targets(actor, ability)){
          const el = document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`);
          el?.classList.add("targetable","chainSlamSecondTargetV132");
        }
      }
    }
    return result;
  };

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v135 actual final live UI fixes: definitive Chain Slam target layer and Dread face ===== */
{
  const DREAD_ICON_V135 = "😨";
  const dreadInfoV135 = {
    icon:DREAD_ICON_V135,
    title:"Dread",
    text:"Next turn, this character is limited to 2 actions."
  };

  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = dreadInfoV135;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = dreadInfoV135;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = dreadInfoV135;
  if(Array.isArray(KEYWORD_PATTERN_V32)){
    for(const word of ["Dread","dread"]) if(!KEYWORD_PATTERN_V32.includes(word)) KEYWORD_PATTERN_V32.push(word);
  }

  const iconBeforeV135 = typeof icon === "function" ? icon : null;
  if(iconBeforeV135){
    icon = function(s){
      if(s === "dread") return DREAD_ICON_V135;
      return iconBeforeV135(s);
    };
  }

  const showStatusInfoBeforeV135 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV135){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${dreadInfoV135.icon} ${dreadInfoV135.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${dreadInfoV135.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV135(key);
    };
  }

  const renderKeywordTextBeforeV135 = typeof renderKeywordText === "function" ? renderKeywordText : null;
  if(renderKeywordTextBeforeV135){
    renderKeywordText = function(text){
      const html = renderKeywordTextBeforeV135(text);
      if(!html || html.includes('data-keyword="dread"')) return html;
      return html.replace(/\b(Dread|dread)\b/g, match => `<button type="button" class="keywordLink" data-keyword="dread" data-label="Dread">${match}</button>`);
    };
  }

  function isChainSlamV135(a){
    return a && (a.effect === "dulerChainSlam" || a.kind === "dulerChainSlam" || a.id === "chainSlam");
  }

  function liveUnitV135(id, side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function chainSlamSecondTargetsV135(actor){
    const pick = state?.chainSlamPickV127;
    if(!actor || !pick) return [];
    const first = liveUnitV135(pick.firstId, pick.firstSide);
    const enemies = (state?.units || []).filter(u => u && !u.dead && u.side !== actor.side);
    const remaining = enemies.filter(u => !first || u !== first);
    if(!first) return remaining;
    const otherRow = remaining.filter(u => u.row !== first.row || u.size === "boss" || first.size === "boss");
    return otherRow.length ? otherRow : remaining;
  }

  function closeChainSlamOverlaysV135(){
    $("radial")?.classList.add("hidden");
    $("abilityTooltip")?.classList.add("hidden");
  }

  const targetsBeforeV135 = typeof targets === "function" ? targets : null;
  if(targetsBeforeV135){
    targets = function(c,a){
      const pick = state?.chainSlamPickV127;
      if(pick && c && a && isChainSlamV135(a) && pick.unitId === c.id && pick.unitSide === c.side){
        return chainSlamSecondTargetsV135(c);
      }
      return targetsBeforeV135(c,a);
    };
  }

  const planBeforeV135 = typeof plan === "function" ? plan : null;
  if(planBeforeV135){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      const pick = state?.chainSlamPickV127;
      if(c && a && pick && isChainSlamV135(a) && pick.unitId === c.id && pick.unitSide === c.side && state?.phase === "planning"){
        closeChainSlamOverlaysV135();
        const legal = chainSlamSecondTargetsV135(c);
        if(target && !legal.includes(target)) return;
      }
      const result = planBeforeV135(target);
      if(state?.chainSlamPickV127) closeChainSlamOverlaysV135();
      return result;
    };
  }

  function chainSlamSecondPickFallbackV135(ev){
    const pick = state?.chainSlamPickV127;
    if(!pick || state?.phase !== "planning") return;
    const tileEl = ev.target?.closest?.(".tile[data-unit-id][data-side]");
    if(!tileEl || ev.target?.closest?.(".unitInfoBtn,.statusChip")) return;
    const actor = liveUnitV135(pick.unitId, pick.unitSide);
    const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
    const target = liveUnitV135(tileEl.dataset.unitId, tileEl.dataset.side);
    if(!actor || !ability || !target || target.side === actor.side) return;
    const legal = chainSlamSecondTargetsV135(actor);
    if(!legal.includes(target)) return;
    selectedId = actor.id;
    selectedSide = actor.side;
    pendingAbility = ability;
    closeChainSlamOverlaysV135();
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation?.();
    plan(target);
  }

  if(!window.__chainSlamSecondPickFallbackV135){
    window.__chainSlamSecondPickFallbackV135 = true;
    document.addEventListener("pointerdown", chainSlamSecondPickFallbackV135, true);
    document.addEventListener("click", chainSlamSecondPickFallbackV135, true);
  }

  const renderBattleBeforeV135 = renderBattle;
  renderBattle = function(){
    const result = renderBattleBeforeV135();
    const pick = state?.chainSlamPickV127;
    if(pick){
      closeChainSlamOverlaysV135();
      const actor = liveUnitV135(pick.unitId, pick.unitSide);
      const ability = actor?.abilities?.find(a => a.id === pick.abilityId);
      if(actor && ability){
        for(const target of chainSlamSecondTargetsV135(actor)){
          const el = document.querySelector(`.tile[data-unit-id="${CSS.escape(target.id)}"][data-side="${CSS.escape(target.side)}"]`);
          el?.classList.add("targetable","chainSlamSecondTargetV135");
        }
      }
    }
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    chainSlamSecondTargetsV135
  });

  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v137 final Dread text override ===== */
{
  const DREAD_INFO_V137 = {
    icon:"😨",
    title:"Dread",
    text:"Next turn, this character can spend at most 2 total AP on abilities. Abilities costing 3 AP are disabled."
  };
  if(typeof STATUS_LABELS_V17 !== "undefined") STATUS_LABELS_V17.dread = DREAD_INFO_V137;
  if(typeof KEYWORDS_V32 !== "undefined") KEYWORDS_V32.dread = DREAD_INFO_V137;
  if(window.KEYWORDS_V32_SAFE) window.KEYWORDS_V32_SAFE.dread = DREAD_INFO_V137;
  const showStatusInfoBeforeV137 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV137){
    showStatusInfo = function(key){
      if(key === "dread"){
        $("infoTitle").textContent = `${DREAD_INFO_V137.icon} ${DREAD_INFO_V137.title}`;
        $("infoBody").innerHTML = `<div class="statusInfoBox">${DREAD_INFO_V137.text}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV137(key);
    };
  }
}

/* ===== v138 final Dread AP budget override ===== */
{
  function dreadUnitKeyV138(u){
    return u ? `${u.side || ""}:${u.id || ""}` : "";
  }

  function dreadActiveV138(u){
    return !!(u && !u.dead && (u.status?.dread || 0) > 0);
  }

  function abilityCostForPlanV138(planObj){
    const actor = (state?.units || []).find(u => u && u.id === planObj?.unitId && (!planObj?.unitSide || u.side === planObj.unitSide));
    return actor?.abilities?.find(a => a.id === planObj?.abilityId)?.cost || 0;
  }

  function plannedApForUnitV138(u){
    const key = dreadUnitKeyV138(u);
    return (state?.plans || []).reduce((sum, planObj) => {
      const planKey = `${planObj.unitSide || planObj.side || ""}:${planObj.unitId || ""}`;
      return planKey === key ? sum + abilityCostForPlanV138(planObj) : sum;
    }, 0);
  }

  function dreadBlocksAbilityV138(u,a){
    if(!dreadActiveV138(u) || !a) return false;
    const cost = a.cost || 0;
    if((state?.phase || "planning") !== "planning") return cost > 2;
    return plannedApForUnitV138(u) + cost > 2;
  }

  const isAbilityDisabledByDreadBeforeV138 = typeof isAbilityDisabledByDreadV42 === "function" ? isAbilityDisabledByDreadV42 : null;
  isAbilityDisabledByDreadV42 = function(unitObj, ability){
    if(dreadActiveV138(unitObj)) return dreadBlocksAbilityV138(unitObj, ability);
    return isAbilityDisabledByDreadBeforeV138 ? isAbilityDisabledByDreadBeforeV138(unitObj, ability) : false;
  };

  const planBeforeV138 = typeof plan === "function" ? plan : null;
  if(planBeforeV138){
    plan = function(target){
      const c = selectedUnit?.();
      const a = pendingAbility;
      if(c && a && state?.phase === "planning" && dreadBlocksAbilityV138(c,a)){
        spawnFloatingText?.(c, `Dread: ${plannedApForUnitV138(c)}/2 AP`, "cancel");
        showKeywordPopup?.("dread");
        log(`${c.name} cannot queue ${a.name}; Dread allows only 2 total AP next turn.`);
        renderBattle();
        return;
      }
      return planBeforeV138(target);
    };
  }

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    dreadPlannedApV136: plannedApForUnitV138,
    dreadBlocksAbilityV136: dreadBlocksAbilityV138
  });
}


/* ===== v141 Mountain Guardians boss + delayed judgement hardening ===== */
{
  if(typeof ART !== "undefined"){
    ART.mountainGuardian = "url('assets/gaurdian.png')";
    ART.mountainGuardianCub = "url('assets/gaurdian_cub.png')";
  }

  const MOUNTAIN_GUARDIAN_BOSS_V141 = {
    id:"mountain_guardian",
    name:"The Guardian",
    class:"brute",
    prof:"beast boss",
    hp:40,
    armor:2,
    speed:3,
    art:"url('assets/gaurdian.png')",
    footprint:{rows:1,cols:3},
    passive:"Passive - Guardian Intercept: Each time a melee attack targets an ally, it targets The Guardian instead.",
    abilities:[
      A("wideSlash","Wide Slash",2,0,"Melee area attack. Attack all enemies in the front row for 5 damage.","guardianWideSlash",{kind:"areaAttack",dmg:5,range:"melee",row:"front"}),
      A("bite","Bite",1,1,"Melee attack. Deal 4 damage with Pierce 2.","guardianBite",{kind:"attack",dmg:4,pierce:2,range:"melee"}),
      A("block","Block",1,99,"Guard. Gain +3 Armor against the next attack this turn.","guardianBlock",{kind:"guard",guard:true,armor:3,range:"self"}),
      A("howl","Howl",1,2,"Buff. Allies in the back row get +4 damage on their next attack.","guardianHowl",{kind:"buff",range:"ally",bonus:4,row:"back"})
    ]
  };

  const MOUNTAIN_GUARDIAN_CUB_V141 = {
    id:"mountain_cub",
    name:"Guardian Cub",
    class:"assassin",
    prof:"beast",
    hp:10,
    armor:0,
    speed:4,
    art:"url('assets/gaurdian_cub.png')",
    passive:"",
    abilities:[
      A("cubBite","Cub Bite",1,1,"Melee attack. Deal 2 damage with Pierce 2.","cubBite",{kind:"attack",dmg:2,pierce:2,range:"melee"}),
      A("slash","Slash",1,0,"Melee attack. Deal 3 damage.","cubSlash",{kind:"attack",dmg:3,range:"melee"})
    ]
  };

  function cloneMountainGuardianV141(){
    return structuredClone({
      ...MOUNTAIN_GUARDIAN_BOSS_V141,
      side:"enemy",
      row:"front",
      col:0,
      size:"rowBoss",
      maxHp:MOUNTAIN_GUARDIAN_BOSS_V141.hp,
      shield:0,
      status:{},
      buff:{},
      planned:null,
      dead:false
    });
  }

  function cloneMountainCubV141(n,col){
    return structuredClone({
      ...MOUNTAIN_GUARDIAN_CUB_V141,
      id:`mountain_cub_${n}`,
      name:`Guardian Cub ${n}`,
      side:"enemy",
      row:"back",
      col,
      maxHp:MOUNTAIN_GUARDIAN_CUB_V141.hp,
      shield:0,
      status:{},
      buff:{},
      planned:null,
      dead:false
    });
  }

  function mountainGuardiansV141(){
    return [cloneMountainCubV141(1,0), cloneMountainCubV141(2,2), cloneMountainGuardianV141()];
  }

  const currentBossBeforeV141 = typeof currentBossV43 === "function" ? currentBossV43 : null;
  currentBossV43 = function(){
    if(selectedBossId === "mountain_guardians") return MOUNTAIN_GUARDIAN_BOSS_V141;
    return currentBossBeforeV141 ? currentBossBeforeV141() : WORLD_TOAD_BOSS;
  };

  const bossCloneBeforeV141 = typeof bossCloneV43 === "function" ? bossCloneV43 : null;
  bossCloneV43 = function(){
    if(selectedBossId === "mountain_guardians") return cloneMountainGuardianV141();
    return bossCloneBeforeV141 ? bossCloneBeforeV141() : cloneMountainGuardianV141();
  };

  const startBattleBeforeV141 = typeof startBattle === "function" ? startBattle : null;
  startBattle = function(){
    if(mode === "boss" && selectedBossId === "mountain_guardians"){
      const player = selectedTeam.map(s=>cloneChar(s.id,"player",s.row,s.col));
      initBattleStateV46(player, mountainGuardiansV141(), "Boss battle started against the Mountain Guardians.");
      return;
    }
    return startBattleBeforeV141 ? startBattleBeforeV141() : undefined;
  };

  function ensureMountainBossSelectorV141(){
    if(typeof ensureBossSelectorV43 === "function") ensureBossSelectorV43();
    const wrap = $("bossSelectorV43");
    if(!wrap || $("bossMountainGuardiansBtn")) return;
    const btn = document.createElement("button");
    btn.id = "bossMountainGuardiansBtn";
    btn.className = "bossChoice";
    btn.type = "button";
    btn.innerHTML = `
      <span class="bossChoiceArt" style="background:${MOUNTAIN_GUARDIAN_BOSS_V141.art}"></span>
      <span><b>Mountain Guardians</b><small>Guardian and cubs</small></span>
    `;
    wrap.appendChild(btn);
    btn.onclick = () => {
      selectedBossId = "mountain_guardians";
      updateBossSelectorV43?.();
    };
    updateBossSelectorV43?.();
  }

  const updateBossSelectorBeforeV141 = typeof updateBossSelectorV43 === "function" ? updateBossSelectorV43 : null;
  updateBossSelectorV43 = function(){
    updateBossSelectorBeforeV141?.();
    $("bossMountainGuardiansBtn")?.classList.toggle("active", selectedBossId === "mountain_guardians");
    const box = $("bossSelectorV43");
    if(box) box.classList.toggle("hidden", mode !== "boss");
  };

  const renderBuilderBeforeV141 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV141){
    renderBuilder = function(){
      const result = renderBuilderBeforeV141();
      ensureMountainBossSelectorV141();
      return result;
    };
  }

  function kindV141(a){
    return a?.effect || a?.kind || a?.id || "";
  }

  function liveSideV141(side){
    return (state?.units || []).filter(u => u && !u.dead && u.side === side);
  }

  function activeRowsV141(side){
    return ["front","back"].filter(row => liveSideV141(side).some(u => u.row === row || (u.size === "boss" && row === "front")));
  }

  function frontRowV141(side){
    const rows = activeRowsV141(side);
    return rows.length ? rows[0] : "front";
  }

  function backRowV141(side){
    const rows = activeRowsV141(side);
    return rows.length ? rows[rows.length - 1] : "back";
  }

  function rowUnitsDynamicV141(side,row){
    return liveSideV141(side)
      .filter(u => u.size === "boss" || u.row === row)
      .sort((a,b)=>(a.col||0)-(b.col||0));
  }

  const targetsBeforeV141 = typeof targets === "function" ? targets : null;
  targets = function(c,a){
    if(!c || !a) return [];
    const k = kindV141(a);
    const enemies = liveSideV141(other(c.side));
    const allies = liveSideV141(c.side);
    if(k === "guardianWideSlash") return rowUnitsDynamicV141(other(c.side),frontRowV141(other(c.side)));
    if(k === "guardianHowl") return rowUnitsDynamicV141(c.side,backRowV141(c.side)).filter(u => u.id !== c.id);
    if(k === "guardianBlock") return [];
    if(k === "guardianBite" || k === "cubBite" || k === "cubSlash"){
      return enemies.filter(t => t.row === frontRowV141(t.side) || t.size === "boss" || t.size === "rowBoss");
    }
    return targetsBeforeV141 ? targetsBeforeV141(c,a) : [];
  };

  function addGuardianHowlV141(u,amount){
    if(!u || u.dead) return;
    u.buff = u.buff || {};
    u.buff.guardianHowlDamageV141 = (u.buff.guardianHowlDamageV141 || 0) + amount;
    spawnFloatingText?.(u, `+${amount} next attack`, "status");
  }

  const applyBeforeV141 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV141?.(c,a,t);
    const k = kindV141(a);
    if(k === "guardianWideSlash"){
      const victims = rowUnitsDynamicV141(other(c.side),frontRowV141(other(c.side)));
      for(const enemy of victims) damage(c,enemy,a.dmg || 5,{attack:true,aoe:true,melee:true});
      return;
    }
    if(k === "guardianBite" || k === "cubBite"){
      damage(c,t,a.dmg || (k === "guardianBite" ? 4 : 2),{attack:true,melee:true,pierce:a.pierce || 2});
      return;
    }
    if(k === "cubSlash"){
      damage(c,t,a.dmg || 3,{attack:true,melee:true});
      return;
    }
    if(k === "guardianBlock"){
      c.buff = c.buff || {};
      c.buff.nextAttackArmorV139 = Math.max(c.buff.nextAttackArmorV139 || 0, a.armor || 3);
      state.guarded = state.guarded || {};
      state.guarded[c.id] = true;
      spawnFloatingText?.(c,"Block","status");
      log(`${c.name} prepares to block the next attack.`);
      return;
    }
    if(k === "guardianHowl"){
      const allies = rowUnitsDynamicV141(c.side,backRowV141(c.side)).filter(u => u.id !== c.id);
      for(const ally of allies) addGuardianHowlV141(ally,a.bonus || 4);
      log(`${c.name} howls. Back-row allies gain +${a.bonus || 4} to their next attack.`);
      return;
    }
    return applyBeforeV141 ? applyBeforeV141(c,a,t) : undefined;
  };

  function redirectToMountainGuardianV141(src,t,opt){
    if(!src || !t || !opt?.attack || !opt?.melee || t.id === "mountain_guardian") return t;
    const guardian = liveSideV141(t.side).find(u => u.id === "mountain_guardian" && !u.dead);
    if(!guardian || guardian === t) return t;
    markPassive?.(guardian,"Guardian Intercept");
    spawnFloatingText?.(guardian,"Intercept","status");
    log(`${guardian.name} intercepts the melee attack aimed at ${t.name}.`);
    return guardian;
  }

  const damageBeforeV141 = typeof damage === "function" ? damage : null;
  damage = function(src,t,amt,opt={}){
    if(!src || !t) return damageBeforeV141?.(src,t,amt,opt);
    t = redirectToMountainGuardianV141(src,t,opt);
    let amount = amt || 0;
    if(opt?.attack && src?.buff?.guardianHowlDamageV141){
      const bonus = src.buff.guardianHowlDamageV141 || 0;
      amount += bonus;
      delete src.buff.guardianHowlDamageV141;
      spawnFloatingText?.(src,`Howl +${bonus}`,"status");
      pushActionEvent?.("passive", `Howl added +${bonus} damage`, src);
    }
    return damageBeforeV141 ? damageBeforeV141(src,t,amount,opt) : undefined;
  };

  function unitByIdSideV141(id,side){
    return (state?.units || []).find(u => u && !u.dead && u.id === id && (!side || u.side === side));
  }

  function normalizeDelayedQueueV141(){
    if(!state) return [];
    const queues = ["delayedActionsV130","delayedActionsV129","delayedActionsV128","delayedActionsV96"];
    const all = [];
    for(const key of queues){
      const q = Array.isArray(state[key]) ? state[key] : [];
      for(const item of q) if(item) all.push({...item, __queue:key});
      state[key] = [];
    }
    return all;
  }

  function resolveDelayedJudgementsV141(){
    if(!state) return 0;
    const all = normalizeDelayedQueueV141();
    if(!all.length) return 0;
    const pendingByQueue = {};
    let resolved = 0;
    for(const item of all){
      if((item.dueRound || 0) > (state.round || 1)){
        const key = item.__queue || "delayedActionsV130";
        pendingByQueue[key] = pendingByQueue[key] || [];
        const copy = {...item};
        delete copy.__queue;
        pendingByQueue[key].push(copy);
        continue;
      }
      const source = unitByIdSideV141(item.sourceId,item.sourceSide);
      const target = unitByIdSideV141(item.targetId,item.targetSide);
      if(!source || !target){
        log(`${item.abilityName || "Delayed Judgement"} fizzles because its source or target is gone.`);
        continue;
      }
      if(target.status) delete target.status.delayedJudgement;
      state.currentActionKey = `delayed:v141:${item.sourceSide}:${item.sourceId}:${item.targetSide}:${item.targetId}:${state.round}`;
      addMomentClassV106?.(tileElForUnitV106?.(source), "activeActionV125", 620);
      damage(source,target,item.dmg || 6,{attack:true,melee:false,ranged:true});
      pushActionEvent?.("hit", `${item.abilityName || "Delayed Judgement"} struck ${target.name}`, target);
      log(`${item.abilityName || "Delayed Judgement"} struck ${target.name}.`);
      state.currentActionKey = null;
      resolved++;
    }
    for(const [key,items] of Object.entries(pendingByQueue)) state[key] = items;
    return resolved;
  }

  const applyBeforeDelayedV141 = apply;
  apply = function(c,a,t){
    const k = kindV141(a);
    if(c?.id === "hope" && a?.id === "judgement" && k !== "hopeDelayedJudgementV141"){
      state.delayedActionsV130 = Array.isArray(state.delayedActionsV130) ? state.delayedActionsV130 : [];
      state.delayedActionsV130.push({
        sourceId:c.id,
        sourceSide:c.side,
        targetId:t?.id,
        targetSide:t?.side,
        dueRound:(state.round || 1) + (a.delay || 1),
        dmg:a.dmg || 6,
        abilityName:a.name || "Delayed Judgement"
      });
      if(t?.status) t.status.delayedJudgement = Math.max(t.status.delayedJudgement || 0, 1);
      spawnFloatingText?.(t,"Judgement next round","status");
      log(`${c.name} prepared ${a.name || "Delayed Judgement"} against ${t?.name || "the target"}.`);
      return;
    }
    return applyBeforeDelayedV141(c,a,t);
  };

  const endRoundBeforeV141 = typeof endRound === "function" ? endRound : null;
  endRound = function(){
    const result = endRoundBeforeV141 ? endRoundBeforeV141() : undefined;
    resolveDelayedJudgementsV141();
    if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
    return result;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    MOUNTAIN_GUARDIAN_BOSS_V141,
    MOUNTAIN_GUARDIAN_CUB_V141,
    mountainGuardiansV141,
    resolveDelayedJudgementsV141,
    frontRowV141,
    backRowV141
  });

  ensureMountainBossSelectorV141();
  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v160 final Poom redirect guardrail after all wrappers ===== */
(function finalPoomRedirectGuardrailV160(){
  const poom = ROSTER.find(c => c.id === "poom");
  const guard = poom?.abilities?.find(a => a.id === "guard" || a.effect === "poomMassGuardMind");
  if(guard){
    Object.assign(guard, {
      id: "guard",
      name: "Guard Mind",
      cost: 1,
      spd: 99,
      effect: "protect",
      kind: "protect",
      guard: true,
      guardType: true,
      range: "ally",
      hypno: true,
      status: "hypnosis",
      stacks: 1,
      shield: 0,
      desc: "Guard. Choose an ally. Until the round ends, the first attack targeting that ally targets Poom instead. If redirected this way, the attacker gains Hypnosis."
    });
  }

  function clearLegacyPoomRedirectMarkerV160(u){
    if(!u?.buff) return;
    delete u.buff.poomRedirectTargetId;
    delete u.buff.poomRedirectTargetSide;
    delete u.buff.poomRedirectSource;
  }

  const applyBeforeV160 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    clearLegacyPoomRedirectMarkerV160(c);
    return applyBeforeV160 ? applyBeforeV160(c,a,t) : undefined;
  };

  const damageBeforeV160 = typeof damage === "function" ? damage : null;
  damage = function(src,t,amt,opt={}){
    clearLegacyPoomRedirectMarkerV160(src);
    return damageBeforeV160 ? damageBeforeV160(src,t,amt,opt) : undefined;
  };

  if(window.__WANDERERS_DEBUG__){
    Object.assign(window.__WANDERERS_DEBUG__, {
      clearLegacyPoomRedirectMarkerV160
    });
  }
})();

/* ===== v156 Duler armor and final-speed clarity ===== */
{
  const duler = ROSTER.find(c => c.id === "duler");
  if(duler) duler.armor = 1;

  speedBreakdownV122 = function(u,a){
    if(!u || !a) return {label:"Speed ?", detail:"Final speed could not be calculated."};
    if(isGuardSpeedAbilityV122(a)) return {
      label:"Guard Speed",
      detail:"Guard Speed: resolves before all normal-speed actions. Character base speed and ability speed are ignored."
    };
    const base = Number(u.speed) || 0;
    const mod = Number(a.spd) || 0;
    const flame = (u.id === "fuego") ? Math.max(0, u.status?.flame || 0) : 0;
    const total = totalSpeed(u,a);
    const parts = [`base ${base}`, `ability ${mod >= 0 ? "+" : ""}${mod}`];
    if(flame) parts.push(`Flame +${flame}`);
    return {
      label:`Final Speed ${total}`,
      detail:`Final speed for queue order: ${parts.join(" ")} = ${total}. Higher speed resolves first.`
    };
  };
}

/* ===== v157 make ability speed labels unambiguously final ===== */
{
  const patchAbilityV157 = (cid, aid, props) => {
    const c = ROSTER.find(x => x.id === cid);
    const a = c?.abilities?.find(x => x.id === aid);
    if(a) Object.assign(a, props);
  };

  patchAbilityV157("zahria", "mass", {
    desc:"Bloodcraft payoff. Each enemy with Bleed loses HP equal to its Bleed, then removes that Bleed. Zahria heals for the total HP lost this way."
  });

  speedBreakdownV122 = function(u,a){
    if(!u || !a) return {label:"Final Speed ?", detail:"Final speed could not be calculated."};
    if(isGuardSpeedAbilityV122(a)) return {
      label:"Guard Speed",
      detail:"Guard Speed: resolves before all normal-speed actions. Character base speed and ability speed are ignored."
    };
    const base = Number(u.speed) || 0;
    const mod = Number(a.spd) || 0;
    const flame = (u.id === "fuego") ? Math.max(0, u.status?.flame || 0) : 0;
    const total = totalSpeed(u,a);
    const parts = [`base ${base}`, `ability ${mod >= 0 ? "+" : ""}${mod}`];
    if(flame) parts.push(`Flame +${flame}`);
    return {
      label:`Final Speed ${total}`,
      detail:`Final speed for queue order: ${parts.join(" ")} = ${total}. Higher speed resolves first.`
    };
  };
}

/* ===== v158 melee payoff type corrections ===== */
{
  const patchAbilityV158 = (cid, aid, props) => {
    const c = ROSTER.find(x => x.id === cid);
    const a = c?.abilities?.find(x => x.id === aid);
    if(a) Object.assign(a, props);
  };

  patchAbilityV158("dravain", "claim", {
    bonus:4,
    range:"melee",
    melee:true,
    desc:"Melee bleed payoff. Remove all Bleed from one enemy. Deal removed Bleed +4 damage. Dravain restores HP equal to the HP damage dealt."
  });

  patchAbilityV158("eva", "bite", {
    range:"melee",
    melee:true,
    backlineReach:true,
    desc:"Assassin/vampire melee payoff. Can target backline. Remove all Bleed. Deal Bleed x2 +1 damage. If any Bleed was removed, Lady Eva restores 2 HP."
  });

  patchAbilityV158("smithen", "shatter", {
    range:"melee",
    melee:true,
    backlineReach:true,
    desc:"Assassin icecraft melee payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze."
  });
}

/* ===== v153 boss-aware global effects and dynamic melee retargeting ===== */
{
  const liveAllUnitsV153 = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const kindV153 = a => a?.kind || a?.effect || a?.id || "";
  const enemySideV153 = side => side === "player" ? "enemy" : "player";

  function sunTreeGrowthV153(side){
    const tree = liveAllUnitsV153(side).find(u => u.tokenType === "sun_tree" || u.id === "sun_tree" || String(u.id || "").startsWith("sun_tree_"));
    return Math.max(0, Number(tree?.growth || tree?.status?.growth || 0));
  }

  function activeRowsForSideV153(side){
    const order = ["front","back"];
    return order.filter(row => liveAllUnitsV153(side).some(u => u.row === row || (u.size === "rowBoss" && u.row === row)));
  }

  function currentFrontRowV153(side){
    const rows = activeRowsForSideV153(side);
    return rows.length ? rows[0] : "front";
  }

  function currentFrontUnitsV153(side){
    const row = currentFrontRowV153(side);
    return liveAllUnitsV153(side)
      .filter(u => u.size === "boss" || u.row === row || (u.size === "rowBoss" && u.row === row))
      .sort((a,b)=>(a.col || 0) - (b.col || 0));
  }

  function abilityCanKeepBacklineTargetV153(actor, ability){
    const k = kindV153(ability);
    if(!actor || !ability) return false;
    if(ability.backlineReach || ability.canTargetBackline || ability.assassinReach) return true;
    if(actor.class === "assassin" && ability.range === "melee") return true;
    return ["chainSlam","chainSwipe","guardianWideSlash","reaperScythe"].includes(k);
  }

  function retargetMeleeIfNeededV153(actor, ability, target){
    if(!actor || !ability || !target || target.dead) return target;
    if(target.side === actor.side || ability.range !== "melee" || abilityCanKeepBacklineTargetV153(actor, ability)) return target;
    const frontUnits = currentFrontUnitsV153(target.side);
    if(!frontUnits.length || frontUnits.includes(target)) return target;
    const nextTarget = frontUnits[0];
    if(nextTarget && nextTarget !== target){
      log?.(`${actor.name}'s ${ability.name} retargets to ${nextTarget.name}, now in the front row.`);
      spawnFloatingText?.(nextTarget, "Retargeted", "status");
      return nextTarget;
    }
    return target;
  }

  const applyBeforeV153 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    if(!c || !a) return applyBeforeV153?.(c,a,t);
    if(kindV153(a) === "sunBlast"){
      const growth = sunTreeGrowthV153(c.side);
      if(growth <= 0){
        log?.(`${c.name}'s Sun Blast has no Sun Tree growth.`);
        return;
      }
      for(const enemy of liveAllUnitsV153(enemySideV153(c.side))){
        damage(c, enemy, growth, {attack:true, aoe:true, melee:false});
      }
      return;
    }
    return applyBeforeV153 ? applyBeforeV153(c, a, retargetMeleeIfNeededV153(c, a, t)) : undefined;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    liveAllUnitsV153,
    currentFrontUnitsV153,
    retargetMeleeIfNeededV153,
    sunTreeGrowthV153
  });
}

/* ===== v154 Scare respects large-unit footprints ===== */
{
  const liveAllUnitsV154 = side => (state?.units || []).filter(u => u && !u.dead && u.side === side);
  const kindV154 = a => a?.kind || a?.effect || a?.id || "";

  function activeRowsForSideV154(side){
    const rows = [];
    for(const u of liveAllUnitsV154(side)){
      if(u.size === "boss"){
        rows.push("front","back");
      } else if(u.row){
        rows.push(u.row);
      }
    }
    return [...new Set(rows)];
  }

  function backRowForSideV154(side){
    const rows = activeRowsForSideV154(side);
    if(rows.includes("back")) return "back";
    if(rows.includes("front")) return "front";
    return "back";
  }

  function rowHasOtherUnitV154(unit,row){
    return liveAllUnitsV154(unit.side).some(u => u !== unit && (u.size === "boss" || u.row === row));
  }

  function moveScaredUnitV154(unit){
    if(!unit || unit.dead || unit.size === "boss") return false;
    const destinationRow = backRowForSideV154(unit.side);
    if(unit.size === "rowBoss" || (unit.footprint?.cols || 1) >= 3){
      if(rowHasOtherUnitV154(unit, destinationRow)) return false;
      if(!unit.tempRowMoveV126) unit.tempRowMoveV126 = {row:unit.row, col:unit.col, round:state?.round || 1};
      unit.row = destinationRow;
      unit.col = 0;
      spawnFloatingText?.(unit, "Scared back", "status");
      pushActionEvent?.("move", `${unit.name} was scared into the back row until round end`, unit);
      log?.(`${unit.name} is scared into the back row until the end of the round.`);
      return true;
    }

    const occupied = new Set(liveAllUnitsV154(unit.side).filter(u => u !== unit && u.row === destinationRow).map(u => u.col));
    const freeCol = [0,1,2].find(col => !occupied.has(col));
    if(freeCol == null) return false;
    if(!unit.tempRowMoveV126) unit.tempRowMoveV126 = {row:unit.row, col:unit.col, round:state?.round || 1};
    unit.row = destinationRow;
    unit.col = freeCol;
    spawnFloatingText?.(unit, "Scared back", "status");
    pushActionEvent?.("move", `${unit.name} was scared into the back row until round end`, unit);
    log?.(`${unit.name} is scared into the back row until the end of the round.`);
    return true;
  }

  const applyBeforeV154 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    if(kindV154(a) === "dulerScare"){
      if(!c || !a || !t || t.dead) return;
      state.guardActionsV125 = state.guardActionsV125 || {};
      state.guardActionsV125[`${c.side || ""}:${c.id}`] = true;
      c.performedGuardRoundV125 = state?.round;
      if(!moveScaredUnitV154(t)) log?.(`${c.name}'s Scare found no free back-row space for ${t.name}.`);
      return;
    }
    return applyBeforeV154 ? applyBeforeV154(c,a,t) : undefined;
  };

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    moveScaredUnitV154
  });
}

/* ===== v148 final Mountain Guardians start wiring after v142 override ===== */
{
  function setMountainBossModeV148(){
    selectedBossId = "mountain_guardians";
    mode = "boss";
    $("bossMode")?.classList.add("active");
    $("squadMode")?.classList.remove("active");
  }

  function normalizeSelectedTeamV148(){
    if(chosenIds.length !== 3) return false;
    const occupied = new Set();
    selectedTeam = selectedTeam
      .filter(s => chosenIds.includes(s.id))
      .filter(s => {
        const key = `${s.row}:${s.col}`;
        if(occupied.has(key)) return false;
        occupied.add(key);
        return true;
      });
    const defaults = [
      {row:"front", col:0},
      {row:"front", col:1},
      {row:"back", col:1},
      {row:"front", col:2},
      {row:"back", col:0},
      {row:"back", col:2}
    ];
    for(const id of chosenIds){
      if(selectedTeam.some(s => s.id === id)) continue;
      const slot = defaults.find(s => !occupied.has(`${s.row}:${s.col}`));
      if(!slot) return false;
      occupied.add(`${slot.row}:${slot.col}`);
      selectedTeam.push({id,row:slot.row,col:slot.col});
    }
    return selectedTeam.length === 3;
  }

  function startMountainGuardiansV148(ev){
    if(builderStep !== "arrange") return false;
    setMountainBossModeV148();
    if(!normalizeSelectedTeamV148()) return false;
    const now = Date.now();
    if(window.__mountainStartStampV148 && now - window.__mountainStartStampV148 < 600) return true;
    window.__mountainStartStampV148 = now;
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    ev?.stopImmediatePropagation?.();
    startBattle();
    return true;
  }

  function wireMountainStartV148(){
    const mountain = $("bossMountainGuardiansBtn");
    if(mountain){
      mountain.onclick = startMountainGuardiansV148;
      if(mountain.dataset.startDirectV148 !== "1"){
        mountain.dataset.startDirectV148 = "1";
        mountain.addEventListener("pointerdown", startMountainGuardiansV148, {capture:true, passive:false});
        mountain.addEventListener("pointerup", startMountainGuardiansV148, true);
        mountain.addEventListener("click", startMountainGuardiansV148, true);
      }
    }
    const next = $("nextBtn");
    if(next && next.dataset.mountainStartV148 !== "1"){
      next.dataset.mountainStartV148 = "1";
      next.addEventListener("pointerdown", ev => {
        if(selectedBossId === "mountain_guardians") startMountainGuardiansV148(ev);
      }, {capture:true, passive:false});
      next.addEventListener("click", ev => {
        if(selectedBossId === "mountain_guardians") startMountainGuardiansV148(ev);
      }, true);
    }
  }

  const renderBuilderBeforeV148 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV148){
    renderBuilder = function(){
      const result = renderBuilderBeforeV148();
      wireMountainStartV148();
      return result;
    };
  }

  wireMountainStartV148();

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    startMountainGuardiansV148,
    normalizeSelectedTeamV148
  });
}

/* ===== v147 final Mountain Guardians start wiring after all historical overrides ===== */
{
  function setMountainBossModeV147(){
    selectedBossId = "mountain_guardians";
    mode = "boss";
    $("bossMode")?.classList.add("active");
    $("squadMode")?.classList.remove("active");
  }

  function normalizeSelectedTeamV147(){
    if(chosenIds.length !== 3) return false;
    const occupied = new Set();
    selectedTeam = selectedTeam
      .filter(s => chosenIds.includes(s.id))
      .filter(s => {
        const key = `${s.row}:${s.col}`;
        if(occupied.has(key)) return false;
        occupied.add(key);
        return true;
      });
    const defaults = [
      {row:"front", col:0},
      {row:"front", col:1},
      {row:"back", col:1},
      {row:"front", col:2},
      {row:"back", col:0},
      {row:"back", col:2}
    ];
    for(const id of chosenIds){
      if(selectedTeam.some(s => s.id === id)) continue;
      const slot = defaults.find(s => !occupied.has(`${s.row}:${s.col}`));
      if(!slot) return false;
      occupied.add(`${slot.row}:${slot.col}`);
      selectedTeam.push({id,row:slot.row,col:slot.col});
    }
    return selectedTeam.length === 3;
  }

  function startMountainGuardiansV147(ev){
    if(builderStep !== "arrange") return false;
    setMountainBossModeV147();
    if(!normalizeSelectedTeamV147()) return false;
    const now = Date.now();
    if(window.__mountainStartStampV147 && now - window.__mountainStartStampV147 < 600) return true;
    window.__mountainStartStampV147 = now;
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    ev?.stopImmediatePropagation?.();
    startBattle();
    return true;
  }

  function wireMountainStartV147(){
    const mountain = $("bossMountainGuardiansBtn");
    if(mountain){
      mountain.onclick = startMountainGuardiansV147;
      if(mountain.dataset.startDirectV147 !== "1"){
        mountain.dataset.startDirectV147 = "1";
        mountain.addEventListener("pointerdown", startMountainGuardiansV147, {capture:true, passive:false});
        mountain.addEventListener("pointerup", startMountainGuardiansV147, true);
        mountain.addEventListener("click", startMountainGuardiansV147, true);
      }
    }
    const next = $("nextBtn");
    if(next && next.dataset.mountainStartV147 !== "1"){
      next.dataset.mountainStartV147 = "1";
      next.addEventListener("pointerdown", ev => {
        if(selectedBossId === "mountain_guardians") startMountainGuardiansV147(ev);
      }, {capture:true, passive:false});
      next.addEventListener("click", ev => {
        if(selectedBossId === "mountain_guardians") startMountainGuardiansV147(ev);
      }, true);
    }
  }

  const renderBuilderBeforeV147 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV147){
    renderBuilder = function(){
      const result = renderBuilderBeforeV147();
      wireMountainStartV147();
      return result;
    };
  }

  wireMountainStartV147();

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    startMountainGuardiansV147,
    normalizeSelectedTeamV147
  });
}

/* ===== v146 Mountain Guardians starts from boss selection, independent of Start button ===== */
{
  function setMountainBossModeV146(){
    selectedBossId = "mountain_guardians";
    mode = "boss";
    $("bossMode")?.classList.add("active");
    $("squadMode")?.classList.remove("active");
  }

  function normalizeSelectedTeamV146(){
    if(chosenIds.length !== 3) return false;
    const occupied = new Set();
    selectedTeam = selectedTeam
      .filter(s => chosenIds.includes(s.id))
      .filter(s => {
        const key = `${s.row}:${s.col}`;
        if(occupied.has(key)) return false;
        occupied.add(key);
        return true;
      });
    const defaults = [
      {row:"front", col:0},
      {row:"front", col:1},
      {row:"back", col:1},
      {row:"front", col:2},
      {row:"back", col:0},
      {row:"back", col:2}
    ];
    for(const id of chosenIds){
      if(selectedTeam.some(s => s.id === id)) continue;
      const slot = defaults.find(s => !occupied.has(`${s.row}:${s.col}`));
      if(!slot) return false;
      occupied.add(`${slot.row}:${slot.col}`);
      selectedTeam.push({id,row:slot.row,col:slot.col});
    }
    return selectedTeam.length === 3;
  }

  function startMountainGuardiansV146(ev){
    if(builderStep !== "arrange") return false;
    setMountainBossModeV146();
    updateBossSelectorV43?.();
    if(!normalizeSelectedTeamV146()) return false;
    const now = Date.now();
    if(window.__mountainStartStampV146 && now - window.__mountainStartStampV146 < 600) return true;
    window.__mountainStartStampV146 = now;
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    ev?.stopImmediatePropagation?.();
    startBattle();
    return true;
  }

  function wireMountainStartV146(){
    const mountain = $("bossMountainGuardiansBtn");
    if(mountain && mountain.dataset.startDirectV146 !== "1"){
      mountain.dataset.startDirectV146 = "1";
      mountain.onclick = startMountainGuardiansV146;
      mountain.addEventListener("pointerup", startMountainGuardiansV146, true);
      mountain.addEventListener("click", startMountainGuardiansV146, true);
    }
    const next = $("nextBtn");
    if(next && next.dataset.mountainStartV146 !== "1"){
      next.dataset.mountainStartV146 = "1";
      next.addEventListener("pointerdown", ev => {
        if(selectedBossId === "mountain_guardians") startMountainGuardiansV146(ev);
      }, {capture:true, passive:false});
      next.addEventListener("click", ev => {
        if(selectedBossId === "mountain_guardians") startMountainGuardiansV146(ev);
      }, true);
    }
  }

  const renderBuilderBeforeV146 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV146){
    renderBuilder = function(){
      const result = renderBuilderBeforeV146();
      wireMountainStartV146();
      return result;
    };
  }

  wireMountainStartV146();

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    startMountainGuardiansV146,
    normalizeSelectedTeamV146
  });
}

/* ===== v143 hard Start Battle capture route ===== */
{
  function enterBossModeV143(){
    mode = "boss";
    $("bossMode")?.classList.add("active");
    $("squadMode")?.classList.remove("active");
    updateBossSelectorV43?.();
  }

  function startFromArrangeV143(ev){
    if(builderStep !== "arrange") return false;
    if(selectedTeam.length !== 3) return false;
    if(selectedBossId === "mountain_guardians") enterBossModeV143();
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    ev?.stopImmediatePropagation?.();
    startBattle();
    return true;
  }

  function isStartButtonEventV143(ev){
    const target = ev?.target;
    return !!(target?.closest && target.closest("#nextBtn"));
  }

  function installHardStartV143(){
    const btn = $("nextBtn");
    if(!btn) return;
    btn.addEventListener("pointerup", ev => {
      if(isStartButtonEventV143(ev) && builderStep === "arrange") startFromArrangeV143(ev);
    }, true);
    btn.addEventListener("click", ev => {
      if(isStartButtonEventV143(ev) && builderStep === "arrange") startFromArrangeV143(ev);
    }, true);
  }

  if(!window.__hardStartBattleV143){
    window.__hardStartBattleV143 = true;
    document.addEventListener("pointerup", ev => {
      if(isStartButtonEventV143(ev) && builderStep === "arrange") startFromArrangeV143(ev);
    }, true);
    document.addEventListener("click", ev => {
      if(isStartButtonEventV143(ev) && builderStep === "arrange") startFromArrangeV143(ev);
    }, true);
  }

  const renderBuilderBeforeV143 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV143){
    renderBuilder = function(){
      const result = renderBuilderBeforeV143();
      installHardStartV143();
      return result;
    };
  }

  installHardStartV143();

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    startFromArrangeV143
  });
}

/* ===== v144 press-down Start Battle safety route ===== */
{
  function startButtonTargetV144(ev){
    return ev?.target?.closest?.("#nextBtn");
  }

  function hardStartV144(ev){
    if(!startButtonTargetV144(ev)) return;
    if(builderStep !== "arrange") return;
    if(selectedTeam.length !== 3) return;
    if(mode !== "boss" && selectedBossId === "mountain_guardians"){
      mode = "boss";
      $("bossMode")?.classList.add("active");
      $("squadMode")?.classList.remove("active");
    }
    ev.preventDefault?.();
    ev.stopPropagation?.();
    ev.stopImmediatePropagation?.();
    startBattle();
  }

  if(!window.__hardStartPressDownV144){
    window.__hardStartPressDownV144 = true;
    for(const type of ["pointerdown","mousedown","touchstart"]){
      document.addEventListener(type, hardStartV144, {capture:true, passive:false});
    }
  }

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    hardStartV144
  });
}

/* ===== v145 Mountain Guardians card starts battle directly ===== */
{
  function startMountainGuardiansFromCardV145(ev){
    selectedBossId = "mountain_guardians";
    mode = "boss";
    $("bossMode")?.classList.add("active");
    $("squadMode")?.classList.remove("active");
    updateBossSelectorV43?.();
    if(builderStep === "arrange" && selectedTeam.length === 3){
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      ev?.stopImmediatePropagation?.();
      startBattle();
    }
  }

  function wireMountainCardV145(){
    const btn = $("bossMountainGuardiansBtn");
    if(!btn || btn.dataset.startDirectV145 === "1") return;
    btn.dataset.startDirectV145 = "1";
    btn.addEventListener("click", startMountainGuardiansFromCardV145, true);
    btn.addEventListener("pointerup", startMountainGuardiansFromCardV145, true);
  }

  const renderBuilderBeforeV145 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV145){
    renderBuilder = function(){
      const result = renderBuilderBeforeV145();
      wireMountainCardV145();
      return result;
    };
  }

  wireMountainCardV145();

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    startMountainGuardiansFromCardV145
  });
}

/* ===== v142 token immunity, next-attack indicators, and boss start hardening ===== */
{
  function nextAttackBuffAmountV142(u){
    if(!u?.buff) return 0;
    return Math.max(0,
      Number(u.buff.nextAttackDamageV126 || 0) +
      Number(u.buff.guardianHowlDamageV141 || 0) +
      Number(u.buff.houseSpecialAttackV139 || 0) +
      Number(u.buff.bloodInfusion?.bonus || 0)
    );
  }

  function nextAttackBuffLabelV142(u){
    const amount = nextAttackBuffAmountV142(u);
    const extras = [];
    if(u?.buff?.bloodInfusion?.bleed) extras.push(`+${u.buff.bloodInfusion.bleed} Bleed on hit`);
    return amount ? `+${amount} next attack${extras.length ? `, ${extras.join(", ")}` : ""}` : "";
  }

  const statusTextBeforeV142 = typeof statusText === "function" ? statusText : null;
  if(statusTextBeforeV142){
    statusText = function(u){
      const html = statusTextBeforeV142(u);
      const buffText = nextAttackBuffLabelV142(u);
      if(!buffText) return html;
      return `${html}${chipHtml("nextAttackBuff",`⚔️+${nextAttackBuffAmountV142(u)}`)}`;
    };
  }

  const showStatusInfoBeforeV142 = typeof showStatusInfo === "function" ? showStatusInfo : null;
  if(showStatusInfoBeforeV142){
    showStatusInfo = function(key){
      if(key === "nextAttackBuff"){
        const selected = (state?.units || []).find(u => nextAttackBuffAmountV142(u) > 0);
        $("infoTitle").textContent = "⚔️ Next Attack Buff";
        $("infoBody").innerHTML = `<div class="statusInfoBox">${selected ? nextAttackBuffLabelV142(selected) : "This character's next attack is empowered."}</div>`;
        setBattlePanelV101?.("info");
        return;
      }
      return showStatusInfoBeforeV142(key);
    };
  }

  function protectSunTreeV142(tree){
    if(!tree || tree.tokenType !== "sun_tree") return tree;
    tree.statusImmune = true;
    tree.status = tree.status || {};
    const growth = Math.max(1, Number(tree.growth || tree.status.growth || 1));
    tree.growth = growth;
    tree.status.growth = growth;
    return tree;
  }

  const makeTokenBeforeV142 = window.__WANDERERS_DEBUG__?.makeTokenV139;
  if(typeof makeTokenBeforeV142 === "function"){
    const makeTokenV142 = function(type, side, row, col, extra={}){
      const token = makeTokenBeforeV142(type, side, row, col, extra);
      return type === "sun_tree" ? protectSunTreeV142(token) : token;
    };
    window.__WANDERERS_DEBUG__.makeTokenV139 = makeTokenV142;
    if(typeof makeTokenV139 === "function") makeTokenV139 = makeTokenV142;
  }

  if(state?.units){
    for(const u of state.units) protectSunTreeV142(u);
  }

  const addStatusBeforeV142 = typeof addStatus === "function" ? addStatus : null;
  addStatus = function(t,s,n=1){
    if(t?.statusImmune) return;
    return addStatusBeforeV142 ? addStatusBeforeV142(t,s,n) : undefined;
  };

  const applyStatusFromBeforeV142 = typeof applyStatusFrom === "function" ? applyStatusFrom : null;
  if(applyStatusFromBeforeV142){
    applyStatusFrom = function(source,target,status,stacks=1){
      if(target?.statusImmune) return;
      return applyStatusFromBeforeV142(source,target,status,stacks);
    };
  }

  function setBossModeV142(){
    mode = "boss";
    $("bossMode")?.classList.add("active");
    $("squadMode")?.classList.remove("active");
  }

  function normalizeSelectedTeamForMountainV142(){
    if(chosenIds.length !== 3) return false;
    const occupied = new Set();
    selectedTeam = selectedTeam
      .filter(s => chosenIds.includes(s.id))
      .filter(s => {
        const key = `${s.row}:${s.col}`;
        if(occupied.has(key)) return false;
        occupied.add(key);
        return true;
      });
    const defaults = [
      {row:"front", col:0},
      {row:"front", col:1},
      {row:"back", col:1},
      {row:"front", col:2},
      {row:"back", col:0},
      {row:"back", col:2}
    ];
    for(const id of chosenIds){
      if(selectedTeam.some(s => s.id === id)) continue;
      const slot = defaults.find(s => !occupied.has(`${s.row}:${s.col}`));
      if(!slot) return false;
      occupied.add(`${slot.row}:${slot.col}`);
      selectedTeam.push({id,row:slot.row,col:slot.col});
    }
    return selectedTeam.length === 3;
  }

  function startMountainFromArrangeV142(ev){
    if(builderStep !== "arrange") return false;
    selectedBossId = "mountain_guardians";
    setBossModeV142();
    if(!normalizeSelectedTeamForMountainV142()){
      return false;
    }
    const now = Date.now();
    if(window.__mountainStartStampV152 && now - window.__mountainStartStampV152 < 600) return true;
    window.__mountainStartStampV152 = now;
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    ev?.stopImmediatePropagation?.();
    const player = selectedTeam.map(s => cloneChar(s.id,"player",s.row,s.col));
    initBattleStateV46(player, mountainGuardiansV141(), "Boss battle started against the Mountain Guardians.");
    showBattleOnlyV98?.();
    if(typeof renderBattle === "function") renderBattle();
    return true;
  }

  function hardenMountainBossButtonV142(){
    const btn = $("bossMountainGuardiansBtn");
    if(btn){
      btn.onclick = ev => {
        if(startMountainFromArrangeV142(ev)) return;
        ev?.preventDefault?.();
        selectedBossId = "mountain_guardians";
        setBossModeV142();
        updateBossSelectorV43?.();
      };
      if(btn.dataset.startDirectFinalV142 !== "1"){
        btn.dataset.startDirectFinalV142 = "1";
        btn.addEventListener("pointerdown", startMountainFromArrangeV142, {capture:true, passive:false});
        btn.addEventListener("click", startMountainFromArrangeV142, true);
      }
    }
  }

  const updateBossSelectorBeforeV142 = typeof updateBossSelectorV43 === "function" ? updateBossSelectorV43 : null;
  updateBossSelectorV43 = function(){
    const result = updateBossSelectorBeforeV142?.();
    hardenMountainBossButtonV142();
    $("bossMountainGuardiansBtn")?.classList.toggle("active", selectedBossId === "mountain_guardians");
    return result;
  };

  const renderBuilderBeforeV142 = typeof renderBuilder === "function" ? renderBuilder : null;
  if(renderBuilderBeforeV142){
    renderBuilder = function(){
      const result = renderBuilderBeforeV142();
      hardenMountainBossButtonV142();
      return result;
    };
  }

  const startBattleBeforeV142 = typeof startBattle === "function" ? startBattle : null;
  startBattle = function(){
    if(selectedBossId === "mountain_guardians") setBossModeV142();
    return startBattleBeforeV142 ? startBattleBeforeV142() : undefined;
  };

  function wireNextButtonV142(){
    const next = $("nextBtn");
    if(!next) return;
    next.onclick = () => {
      if(builderStep === "choose"){
        if(chosenIds.length !== 3) return;
        builderStep = "arrange";
        arrangeSelectedId = chosenIds[0];
        renderBuilder();
        return;
      }
      if(selectedBossId === "mountain_guardians") setBossModeV142();
      if(selectedBossId === "mountain_guardians" && startMountainFromArrangeV142()) return;
      startBattle();
    };
  }

  if(!window.__mountainStartDelegatedV142){
    window.__mountainStartDelegatedV142 = true;
    for(const type of ["pointerdown","click"]){
      document.addEventListener(type, ev => {
        if(ev.target?.closest?.("#bossMountainGuardiansBtn")) startMountainFromArrangeV142(ev);
        if(ev.target?.closest?.("#nextBtn") && selectedBossId === "mountain_guardians") startMountainFromArrangeV142(ev);
      }, {capture:true, passive:false});
    }
  }

  wireNextButtonV142();
  hardenMountainBossButtonV142();

  window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {
    nextAttackBuffAmountV142,
    nextAttackBuffLabelV142,
    protectSunTreeV142,
    normalizeSelectedTeamForMountainV142,
    startMountainFromArrangeV142
  });

  if(typeof renderBuilder === "function" && $("builder") && !$("builder").classList.contains("hidden")) renderBuilder();
  if(typeof renderBattle === "function" && $("battle") && !$("battle").classList.contains("hidden")) renderBattle();
}

/* ===== v161 absolute-final Poom redirect guardrail ===== */
(function absoluteFinalPoomRedirectGuardrailV161(){
  const poom = ROSTER.find(c => c.id === "poom");
  const guard = poom?.abilities?.find(a => a.id === "guard" || a.effect === "poomMassGuardMind");
  if(guard){
    Object.assign(guard, {
      id: "guard",
      name: "Guard Mind",
      cost: 1,
      spd: 99,
      effect: "protect",
      kind: "protect",
      guard: true,
      guardType: true,
      range: "ally",
      hypno: true,
      status: "hypnosis",
      stacks: 1,
      shield: 0,
      desc: "Guard. Choose an ally. Until the round ends, the first attack targeting that ally targets Poom instead. If redirected this way, the attacker gains Hypnosis."
    });
  }

  function clearLegacyPoomRedirectMarkerV161(u){
    if(!u?.buff) return;
    delete u.buff.poomRedirectTargetId;
    delete u.buff.poomRedirectTargetSide;
    delete u.buff.poomRedirectSource;
  }

  const applyBeforeV161 = typeof apply === "function" ? apply : null;
  apply = function(c,a,t){
    clearLegacyPoomRedirectMarkerV161(c);
    return applyBeforeV161 ? applyBeforeV161(c,a,t) : undefined;
  };

  const damageBeforeV161 = typeof damage === "function" ? damage : null;
  damage = function(src,t,amt,opt={}){
    clearLegacyPoomRedirectMarkerV161(src);
    return damageBeforeV161 ? damageBeforeV161(src,t,amt,opt) : undefined;
  };

  if(window.__WANDERERS_DEBUG__){
    Object.assign(window.__WANDERERS_DEBUG__, {
      clearLegacyPoomRedirectMarkerV161
    });
  }
})();

/* ===== v164 absolute-final Adventure metadata pass ===== */
(function adventureAbsoluteFinalV164(){
  if(typeof window.__WANDERERS_DEBUG__?.adventureMetadataFinalV163 !== "undefined"){
    const char = id => ROSTER.find(c => c.id === id);
    const req = (...tags) => tags.map(x => String(x).toLowerCase());
    const anyReq = (...groups) => groups.map(g => Array.isArray(g) ? g.map(x => String(x).toLowerCase()) : req(g));
    const nameKey = name => String(name || "").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
    const A2 = (id,name,cost,spd,desc,effect,extra={}) => Object.assign(A(id,name,cost,spd,desc,effect,extra), extra);
    function setAbilities(cid, abilities){ const c = char(cid); if(c) c.abilities = abilities; }
    function meta(cid, aid, {core=false, groups=[], natural=false, ownerOnly=false, ownerId=null, advKey=null}={}){
      const c = char(cid);
      const a = c?.abilities?.find(x => x.id === aid || x.advKey === aid || x.name === aid);
      if(!a) return null;
      a.advKey = advKey || a.advKey || nameKey(a.name || a.id);
      a.adventureCore = !!core;
      a.learn = {
        natural: !!natural,
        ownerOnly: !!ownerOnly,
        ownerId: ownerId || (ownerOnly ? cid : null),
        groups: groups.map(g => g.map(x => String(x).toLowerCase()))
      };
      return a;
    }

    if(char("smithen")){
      setAbilities("smithen", [
        A2("shatter","Shatter Shot",2,0,"Assassin icecraft melee payoff. Deal 3 damage with Pierce 2. Can target backline. If the target has Freeze, remove all Freeze and gain +2 damage per removed Freeze.","shatter",{range:"melee",melee:true,backlineReach:true,pierce:2,iconKey:"icecraft"}),
        A2("pin","Frost Pin",1,1,"Icecraft assassin melee attack. Deal 4 damage and apply 2 Freeze. Can target backline.","damageStatus",{dmg:4,status:"freeze",stacks:2,range:"melee",melee:true,backlineReach:true,iconKey:"icecraft"}),
        A2("needle","Ice Needle",1,0,"Icecraft melee attack. Deal 4 damage and apply 1 Freeze.","damageStatus",{dmg:4,status:"freeze",stacks:1,range:"melee",melee:true,iconKey:"icecraft"}),
        A2("dodge","Dodge",1,99,"Guard. Cancel the first attack targeting this character this round.","dodge",{guard:true,guardType:true,iconKey:"assassin"})
      ]);
    }
    const bahl = char("shaman");
    if(bahl){
      bahl.name = "Bahl"; bahl.class = "sorcerer"; bahl.prof = "demon darkness bloodcraft"; bahl.hp = 16; bahl.armor = 1;
      setAbilities("shaman", [
        A2("redEclipse","Red Eclipse",2,99,"Guard. This turn, before each enemy resolves an offensive ability, that enemy gains 4 Bleed and Dread.","redEclipseV162",{kind:"redEclipseV162",guard:true,guardType:true,bleed:4,range:"self",iconKey:"bloodcraft"}),
        A2("proliferation","Dark Proliferation",1,0,"Dark sorcery. Apply 2 Poison and 2 Bleed to one enemy.","multiStatus",{statuses:[["poison",2],["bleed",2]],range:"ranged",iconKey:"darkness"}),
        A2("rupture","Demon Rupture",2,-1,"Demon payoff. Remove all Poison and Bleed from one enemy. Deal damage equal to twice the removed counters.","demonRuptureV127",{kind:"demonRuptureV127",range:"ranged",iconKey:"demon"}),
        A2("mark","Infect Mark",1,0,"Sorcery setup. Apply 1 Poison and 1 Bleed to one enemy.","multiStatus",{statuses:[["poison",1],["bleed",1]],range:"ranged",iconKey:"bloodcraft"})
      ]);
    }
    const fuego = char("fuego");
    if(fuego){
      fuego.class = "sorcerer"; fuego.prof = "dragon firecraft"; fuego.hp = 18; fuego.armor = 1;
      const stoke = fuego.abilities.find(a => a.id === "stoke");
      if(stoke) Object.assign(stoke,{cost:2,stacks:3,desc:"Firecraft. Gain 3 Flame counters."});
      const nova = fuego.abilities.find(a => a.id === "nova");
      if(nova) Object.assign(nova,{multiplier:2,desc:"Firecraft area attack. Remove all Flame counters from Fuego. Deal damage equal to twice the removed Flame counters to all enemies. Fuego gains Exhausted."});
    }
    const duler = char("duler");
    if(duler) duler.armor = 1;
    const poom = char("poom");
    if(poom){
      if(!String(poom.prof || "").includes("fae")) poom.prof = `${poom.prof} fae`;
      const revenge = poom.abilities.find(a => a.id === "revenge" || a.id === "bodyguard");
      if(revenge) Object.assign(revenge,{id:"revenge",name:"Revenge Body",self:0,dmg:5,bonusIfDamaged:7,desc:"Brute melee attack. Deal 5 damage. If Poom was dealt damage this turn, gain +7 damage."});
    }
    const paleya = char("paleya");
    if(paleya && !String(paleya.prof || "").includes("fae")) paleya.prof = `${paleya.prof} fae`;

    const rows = [
      ["smithen","shatter",true,anyReq(req("icecraft","assassin"))],["smithen","pin",true,anyReq(req("icecraft","assassin"))],["smithen","needle",false,anyReq(req("icecraft","assassin"))],["smithen","dodge",false,anyReq(req("assassin")),"dodge"],
      ["dravain","drain",true,anyReq(req("vampire","warrior"))],["dravain","claim",true,anyReq(req("vampire","warrior"))],["dravain","protect",false,anyReq(req("warrior"))],["dravain","grab",false,anyReq(req("vampire")),"vampiric_grab"],
      ["yaura","infusion",true,anyReq(req("bloodcraft"))],["yaura","price",true,anyReq(req("bloodcraft","warrior"))],["yaura","rain",false,anyReq(req("bloodcraft")),"red_rain"],["yaura","ward",false,anyReq(req("bloodcraft"))],
      ["kku","slam",true,anyReq(req("icecraft","brute"))],["kku","roar",true,anyReq(req("icecraft","brute"))],["kku","break",false,anyReq(req("icecraft","brute"))],["kku","guard",false,anyReq(req("icecraft"))],
      ["kahro","needle",true,anyReq(req("darkness","assassin"))],["kahro","assassinate",true,anyReq(req("assassin"))],["kahro","vanish",false,anyReq(req("darkness"))],["kahro","mark",false,anyReq(req("darkness"))],
      ["maoja","breath",true,anyReq(req("witchcraft","brute"))],["maoja","bash",true,anyReq(req("brute")),"bash"],["maoja","hands",false,anyReq(req("witchcraft"))],["maoja","burst",false,anyReq(req("witchcraft"))],
      ["paleya","lance",true,anyReq(req("hypnotic","sorcerer"))],["paleya","mirror",true,anyReq(req("hypnotic")),"mirror_guard"],["paleya","mass",false,anyReq(req("hypnotic","sorcerer"))],["paleya","portal",false,anyReq(req("fae"))],
      ["poom","roar",true,anyReq(req("brute","hypnotic"))],["poom","breaker",true,anyReq(req("brute","hypnotic"))],["poom","bash",false,anyReq(req("brute")),"bash"],["poom","revenge",false,anyReq(req("brute"))],
      ["shaman","redEclipse",true,anyReq(req("sorcerer","darkness","bloodcraft"))],["shaman","rupture",true,anyReq(req("demon"))],["shaman","proliferation",false,anyReq(req("sorcerer"))],["shaman","mark",false,anyReq(req("sorcerer","bloodcraft"), req("sorcerer","witchcraft"))],
      ["eva","stab",true,anyReq(req("vampire","assassin"))],["eva","grab",true,anyReq(req("vampire")),"vampiric_grab"],["eva","bite",false,anyReq(req("vampire","assassin"))],["eva","dodge",false,anyReq(req("assassin")),"dodge"],
      ["hyafrost","blast",true,anyReq(req("sorcerer","icecraft"))],["hyafrost","zero",true,anyReq(req("sorcerer","icecraft"))],["hyafrost","armor",false,anyReq(req("icecraft"))],["hyafrost","spirit",false,anyReq(req("spirit"))],
      ["bakub","fog",true,anyReq(req("demon","sorcerer"))],["bakub","toxin",true,anyReq(req("hypnotic","sorcerer"), req("witchcraft","sorcerer"))],["bakub","vial",false,anyReq(req("hypnotic","sorcerer"), req("darkness","sorcerer"))],["bakub","mirror",false,anyReq(req("hypnotic")),"mirror_guard"],
      ["hope","mend",true,anyReq(req("divinity"))],["hope","judgement",true,anyReq(req("warrior","divinity"))],["hope","shield",false,anyReq(req("divinity")),"blessing_shield"],["hope","shieldBash",false,anyReq(req("warrior")),"shield_bash"],
      ["zahria","rain",true,anyReq(req("bloodcraft")),"red_rain"],["zahria","mass",true,anyReq(req("sorcerer","bloodcraft"))],["zahria","mist",false,anyReq(req("bloodcraft","sorcerer"))],["zahria","blade",false,anyReq(req("bloodcraft","sorcerer"))],
      ["fuego","scales",true,anyReq(req("dragon","firecraft"))],["fuego","flare",true,anyReq(req("firecraft","sorcerer"))],["fuego","nova",false,anyReq(req("firecraft","sorcerer"))],["fuego","stoke",false,anyReq(req("firecraft"))],
      ["duler","chainSwipe",true,anyReq(req("darkness","brute")),null,true],["duler","chainSlam",true,anyReq(req("darkness","brute")),null,true],["duler","scare",false,anyReq(req("darkness"))],["duler","basicGuard",false,[], "basic_guard", false, true],
      ["pako","houseSpecial",true,anyReq(req("witchcraft","sorcerer"))],["pako","strengthPotion",true,anyReq(req("witchcraft"))],["pako","healthPotion",false,anyReq(req("witchcraft"))],["pako","armorPotion",false,anyReq(req("witchcraft"))],
      ["ivory","boneWall",true,anyReq(req("sorcerer","darkness"))],["ivory","reaper",true,anyReq(req("sorcerer","darkness"))],["ivory","basicGuard",false,[], "basic_guard", false, true],["ivory","mist",false,anyReq(req("darkness","sorcerer"))],
      ["gondar","tree",true,anyReq(req("divinity","sorcerer"))],["gondar","blast",true,anyReq(req("divinity","sorcerer"))],["gondar","shield",false,anyReq(req("divinity")),"blessing_shield"],["gondar","mend",false,anyReq(req("divinity"))]
    ];
    for(const [cid, aid, core, groups, advKey, ownerOnly=false, natural=false] of rows){
      meta(cid, aid, {core, groups, advKey, ownerOnly, ownerId:ownerOnly?cid:null, natural});
    }
    if(window.__WANDERERS_DEBUG__?.rebuildAbilityPoolV162){
      window.__WANDERERS_DEBUG__.ADVENTURE_POOL_V162 = window.__WANDERERS_DEBUG__.rebuildAbilityPoolV162();
    }
    window.__WANDERERS_DEBUG__ = Object.assign(window.__WANDERERS_DEBUG__ || {}, {adventureMetadataAbsoluteFinalV164:true});
  }
})();

/* ===== v168 true-tail Hyafrost adventure roster repair ===== */
(function repairHyafrostAdventureRosterV168(){
  const hy = ROSTER.find(c => c.id === "hyafrost");
  if(!hy || typeof A !== "function") return;
  hy.abilities = [
    Object.assign(A("blast","Ice Blast",1,0,"Sorcerer icecraft ranged attack. Deal 2 damage to one enemy, then apply 2 Freeze.","damageStatus",{dmg:2,status:"freeze",stacks:2,range:"ranged",iconKey:"icecraft"}), {
      advKey:"ice_blast",
      adventureCore:true,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["sorcerer","icecraft"]]}
    }),
    Object.assign(A("zero","Absolute Zero",2,-2,"Sorcerer icecraft payoff. Deal 3 damage to each enemy with Freeze, then apply Exhausted to each damaged enemy.","absoluteZero",{dmg:3,iconKey:"icecraft"}), {
      advKey:"absolute_zero",
      adventureCore:true,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["sorcerer","icecraft"]]}
    }),
    Object.assign(A("armor","Frost Armor",1,99,"Guard-speed icecraft support. Choose an ally. That ally gains Armor this turn; melee attackers gain Freeze.","frostArmorV122",{kind:"frostArmorV122",guard:true,guardType:true,range:"ally",iconKey:"icecraft"}), {
      advKey:"frost_armor",
      adventureCore:false,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["icecraft"]]}
    }),
    Object.assign(A("spirit","Spirit Form",1,99,"Guard. Hyafrost gains Shield and cancels the first attack targeting Hyafrost this round.","spirit",{guard:true,guardType:true,range:"self",iconKey:"spirit"}), {
      advKey:"spirit_form",
      adventureCore:false,
      learn:{natural:false,ownerOnly:false,ownerId:null,groups:[["spirit"]]}
    })
  ];
  if(window.__WANDERERS_DEBUG__?.rebuildAbilityPoolV162){
    window.__WANDERERS_DEBUG__.ADVENTURE_POOL_V162 = window.__WANDERERS_DEBUG__.rebuildAbilityPoolV162();
  }
  if(window.__WANDERERS_DEBUG__) window.__WANDERERS_DEBUG__.hyafrostAdventureRosterRepairV168 = true;
})();
