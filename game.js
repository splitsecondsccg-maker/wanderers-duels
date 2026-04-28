
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
let state=null, selectedId=null, pendingAbility=null, logLines=[];

function $(id){return document.getElementById(id)}
function cdef(id){return ROSTER.find(c=>c.id===id)}
function cloneChar(id,side,row,col){let c=cdef(id);return structuredClone({...c,side,row,col,maxHp:c.hp,shield:0,status:{},buff:{},planned:null,dead:false})}
function alive(side){return state.units.filter(u=>u.side===side&&!u.dead)}
function unit(id){return state.units.find(u=>u.id===id)}
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
    abilityId: abilityObj.id,
    targetId: targetObj?.id || null,
    side
  };
}

function planToAction(p){
  const u = unit(p.unitId);
  if(!u || u.dead) return null;
  const a = u.abilities.find(x=>x.id===p.abilityId);
  if(!a) return null;
  return {
    key: p.pid,
    plan: p,
    unit: u,
    ability: a,
    side: p.side,
    target: p.targetId ? unit(p.targetId) : null,
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
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId)t.classList.add("selected");
  if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))t.classList.add("targetable");
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
  const u=unit(p.unitId);
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
      damage(c,t,2+getArmor(c),{attack:true,melee:true});
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
  return `<button class="chip statusChip" data-status="${key}" type="button">${label}</button>`;
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
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId)t.classList.add("selected");
  if(isCurrentActor(u))t.classList.add("currentActor");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))t.classList.add("targetable");
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
      damage(c,t,2+getArmor(c),{attack:true,melee:true});
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
      damage(c,t,2+getArmor(c),{attack:true,melee:true});
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
  pendingAbility = null;
  renderBattle();
  if(isMobileLayout()) openMobilePanel("info");
}

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId)t.classList.add("selected");
  if(isCurrentActor?.(u))t.classList.add("currentActor");
  if(typeof isCurrentTarget === "function" && isCurrentTarget(u))t.classList.add("currentTarget");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(u.passiveUntil && u.passiveUntil > Date.now())t.classList.add("passivePulse");
  if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))t.classList.add("targetable");

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
    if(state.phase==="planning" && pendingAbility && isTarget(unit(selectedId),pendingAbility,u)){
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

  if(pendingAbility && selectedId) previewTargeting(unit(selectedId), pendingAbility);
}

function showUnitInfo(u){
  if(!u) return;
  selectedId = u.id;
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

function tile(u,side){
  let t=document.createElement("button");
  t.className=`tile ${side==="player"?"playerSide":"enemySide"}`;
  if(!u){t.classList.add("empty");return t}
  t.dataset.unitId=u.id;
  if(u.dead)t.classList.add("dead");
  if(u.id===selectedId)t.classList.add("selected");
  if(isCurrentActor?.(u))t.classList.add("currentActor");
  if(typeof isCurrentTarget === "function" && isCurrentTarget(u))t.classList.add("currentTarget");
  if(u.rumbleUntil && u.rumbleUntil > Date.now())t.classList.add("rumble");
  if(u.passiveUntil && u.passiveUntil > Date.now())t.classList.add("passivePulse");
  if(pendingAbility&&isTarget(unit(selectedId),pendingAbility,u))t.classList.add("targetable");

  const passiveBadge = (u.passiveUntil && u.passiveUntil > Date.now())
    ? `<div class="passiveCallout">${u.passiveLabel || "Passive"}</div>`
    : "";

  t.innerHTML=`
    <div class="art" style="background:${u.art}"></div>
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

    if(state.phase==="planning" && pendingAbility && isTarget(unit(selectedId),pendingAbility,u)){
      closeMobilePanel?.();
      return plan(u);
    }

    if(u.side==="enemy"){
      return;
    }

    if(state.phase!=="planning")return;

    if(u.side==="player"){
      selectedId=u.id;
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
   Put your music files here:
   assets/audio/Ambient 1 Loop.mp3
   assets/audio/Ambient 2 Loop.mp3
   ...
   assets/audio/Ambient 10 Loop.mp3
   assets/audio/battle.mp3

   Each new battle randomly chooses one track.
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
  "assets/audio/Ambient 10 Loop.mp3",
  "assets/audio/battle.mp3"
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
      A("mirror","Mirror Guard",1,99,"Guard prediction. Choose an enemy. If it uses a damaging attack this round, cancel that action and apply Hypnosis to it.","predict",{guard:true,range:"ranged"}),
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
    const u = unit(selectedId);
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

  let c=unit(selectedId), a=pendingAbility;
  if(!c || !a || state.phase !== "planning" || state.actionsLeft < a.cost) return;

  state.actionsLeft -= a.cost;
  state.plans.push(makePlan(c,a,target,"player"));
  log(`${c.name} queued ${a.name}.`);
  selectedId=null;
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

$("nextBtn").onclick=()=>{if(builderStep==="choose"){if(chosenIds.length!==3)return;builderStep="arrange";arrangeSelectedId=chosenIds[0];renderBuilder()}else startBattle()}
$("backBtn").onclick=()=>{builderStep="choose";renderBuilder()}
$("randomBtn").onclick=randomTeam;$("classFilter").onchange=renderBuilder;$("squadMode").onclick=()=>{mode="squad";$("squadMode").classList.add("active");$("bossMode").classList.remove("active")};$("bossMode").onclick=()=>{mode="boss";$("bossMode").classList.add("active");$("squadMode").classList.remove("active")};$("homeBtn").onclick=()=>{$("battle").classList.add("hidden");$("builder").classList.remove("hidden");renderBuilder()};$("resetBtn").onclick=()=>startBattle();$("resolveBtn").onclick=resolveRound;$("radialClose").onclick=()=>{$("radial").classList.add("hidden");$("abilityTooltip")?.classList.add("hidden");};renderBuilder();
