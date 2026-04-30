# Split Seconds v10 — Code Only

## Assets
Put images directly in `/assets` with these exact filenames:

- archer.png — Smithen
- blade.png — Dravain
- blood.png — Yaura
- golem.png — K'ku
- kahro.png — Kahro
- maoja.png — Maoja
- paleaya.png — Paleya
- pom.png — Poom
- shaman.png — Shaman
- spell.png — Lady Eva
- hyafrost.png — Hyafrost
- bakub.png — Bakub
- boss_toad.png — World Toad

## What's new
- Fighting-game style character select grid.
- Choose exactly 3 characters.
- Separate formation screen.
- Desktop drag/drop and mobile tap-to-place.
- Hidden planning combat.
- Guard priority and Speed-based resolution.


## v11 changes
- Polished radial ability wheel.
- Wheel now opens over the clicked character tile and clamps to the screen.
- Hover/focus on an ability shows a smart-positioned tooltip with full ability text.
- Ability buttons now use semi-transparent proficiency/class icons in their background.

## Required proficiency icon paths
Put icons here:
assets/images/proficiency_icons/

Expected names:
assassin.png
blacksmith.png
bloodcraft.png
brute.png
darkness.png
demon.png
divinity.png
fae.png
hyponotic.png
icecraft.png
spirit.png
vampire.png
warrior.png
witchcraft.png

## v13 changes
- Removed the large black center circle from the radial wheel.
- Top ability tooltip appears above the whole wheel; bottom appears below the whole wheel.
- Proficiency icon path changed to `assets/proficiency_icons/` to match your folder.
- Added a queue strip below the action bar.
- During planning, the strip shows your queued moves sorted by Guard priority and Speed.
- During resolve, enemy moves are revealed into the strip and the currently resolving action pulses.

## v14 changes
- Characters can now queue multiple actions in the same round.
- Clicking a character with queued actions no longer clears the action.
- Queued actions are cleared by clicking them in the bottom queue strip.
- Queue strip supports duplicate actions from the same character and remains sorted by Guard priority and Speed.

## v15 changes
- Slowed round resolution from 650ms/action to 1050ms/action.
- Rewrote passives and ability descriptions to be explicit card-game style rules text.
- Clarified Shield, Poison, Bleed, Freeze, Hypnosis, Exposed, Exhausted, Guard, and row-targeting language directly in ability text.

## v16 final systems pass
- Locked final damage order: Armor first, then Shield, then HP.
- Shield persists across all direct hits this round and expires at end of round.
- Poison ignores Armor and Shield at end of round.
- Bleed now has a clear identity: when a unit is hit by a direct damage ability, all Bleed is removed and added to that hit before Armor/Shield.
- Freeze at 5 applies Frozen; Frozen cancels the next non-Guard action.
- Hypnosis stays non-stackable and is used as a combo/control key.
- Exposed adds +2 to the next direct damage hit.
- Exhausted gives -3 Speed to the next non-Guard action and is then removed.
- Bahl replaces Shaman in-game and gains Dark Proliferation.
- Hyafrost now has Frost Armor to support Warrior/Armor teams.
- Dravain now has Shield Bash that scales with current Armor.
- Updated major character kits around class/proficiency identities and synergies.
- Added mobile layout polish for smaller screens.

## v17 polish/fix pass
- Added rumble animation when a unit loses HP.
- Defeated units now show grayscale portraits with a defeated label.
- Status chips are clickable again and show exact rules text in the info panel.
- Confirmed melee/non-ranged targeting rule: if the enemy front row is empty, melee can target back row.
- Current resolving actor now gets a glowing outline during resolution.

## v18 mobile-approved UI pass
- Battle now fits inside a single mobile viewport using a flex layout.
- Info and Log no longer sit below the board on mobile; they open as bottom sheets.
- Added mobile Info / Log / Close controls.
- Ability tooltip becomes a bottom sheet on mobile and cannot overflow the screen.
- Team select is compact 3-column portrait grid on mobile.
- Team arrangement uses compact tap/drag controls and fits portrait screens.
- Desktop layout remains mostly unchanged.

## v19 mobile mode and centered mobile wheel
- Added explicit Mobile View / Desktop View toggle.
- Setting persists in localStorage.
- Desktop can now simulate the mobile layout in a 430px-wide phone frame.
- In mobile layout, the ability wheel opens centered instead of over the character.
- Desktop/tablet still opens the ability wheel over the clicked character.
- Mobile tooltip remains a bottom sheet and cannot overflow the frame.

## v20 mobile viewport fix
- Mobile View no longer constrains the game to a fake 430px frame.
- In DevTools device emulation and on real phones, the game now uses the full available viewport.
- Fixed the arrange screen bench layout: CSS was targeting `.benchList`, but the element is actually `#benchList`.
- Mobile bottom sheets/tooltips now use the actual viewport edges.

## v21 animation/clarity package
- Mobile ability wheel now always shows the tooltip.
- On mobile, first tap previews an ability, second tap chooses it.
- Desktop keeps hover-to-preview and click-to-choose.
- Added floating combat text for HP loss, Armor reduction, Shield blocking, Poison, Bleed, status bursts, cancels, and defeated units.
- Added projectile/target lines from actor to target during resolution.
- Queue strip now marks resolved and canceled actions.
- Current legal targets pulse during targeting.
- Action resolution now has anticipation timing, line animation, impact text, and settle timing.

## v22 ability/passive wiring audit
- Audited every ability effect string against the apply() switch.
- Fixed Protect/Ward to trigger once, matching “first attack” wording.
- Fixed Ward so Shield is only gained if the warded ally is actually attacked.
- Fixed Predict/False Future so they cancel one matching damage action, then expire.
- Fixed Ice Guard/self-counter so it triggers once.
- Fixed Frozen so canceled actions are marked in the queue.
- Fixed Yaura's Blood Echo passive; it now triggers from your own self-damage abilities.
- Fixed Paleya's Mind Weaver passive; consuming Hypnosis with Mind Break grants +1 Action next round.
- Restored Hyafrost's Deep Winter as a mechanical passive; applying Freeze grants Hyafrost 1 Shield.
- Fixed Smithen's Shatter so Frost Edge can apply before Freeze is removed.
- Fixed Lady Eva's Blood Dash so it checks whether the target had Bleed before the hit consumes it.
- Bahl's Demon Infection now uses the normal status application UI/animation path.

## v23 readability feedback pass
- Slowed resolution further: longer anticipation and settle timing.
- Added real board spotlighting during resolution: board dims, actor glows, target gets red outline.
- Floating combat text is larger and more visible.
- Status trigger animations are emphasized.
- Mobile status chips are much larger and easier to tap.
- Clicking enemy characters now shows their stats/passive, but keeps active abilities hidden.
- Passive triggers now create a purple heartbeat/ripple on the triggering character.

## v24 large-unit footprint
- World Toad now has a 2x3 footprint.
- Boss/large units visually occupy the full two-row, three-column board instead of appearing as one small tile.
- Added reusable `footprint: { rows, cols }` support for future large units.

## v25 boss/info/targeting fix
- Large boss tile now uses grid-column/grid-row 1 / -1, so World Toad fills the full 2x3 enemy board.
- Added an ⓘ info button on each character portrait.
- Info panel now opens from the ⓘ button instead of accidental character clicks.
- Targeting now has priority over info/selection, so choosing an ability and tapping a target works again.
- Mobile info panel height reduced so it covers less of the lower board.

## v26 info close + boss passive
- Added a close button to the info panel.
- World Toad now has a real passive description instead of `undefined`.
- Enemy info still shows passive only; active abilities remain hidden.

## v27 passive pulse visibility
- Made passive trigger feedback much stronger and longer.
- Passive triggers now show a purple heartbeat, bright art flash, ripple overlay, and centered passive-name callout.
- Floating passive text is more visible.

## v29 anti-armor/status balance pass
- Added `Pierce`, `Ignore Armor`, and `Sunder` support.
- Damage now uses effective Armor: `ignoreArmor ? 0 : max(0, Armor - Pierce)`.
- Sunder temporarily reduces Armor until end of round.
- Assassins now have more Pierce tools.
- Sorcerers now bypass Armor mostly through statuses and magic damage.
- Brutes now break Armor through Sunder.
- Poison/Bleed/status-only actions were strengthened so they compete with direct damage.
- World Toad/boss footprint support is preserved.

## v30 wording clarity
- Standardized combat wording:
  - `Deal X damage` = Armor, then Shield, then HP.
  - `Deal X damage ignoring Armor` = Shield, then HP.
  - `Lose X HP` = direct HP loss, ignores Armor and Shield.
- Reworded Blood Price and other ambiguous abilities.
- Added rules clarifier boxes in ability tooltips, character info, and tactical resolution cards.

## v31 cinematic resolution pipeline
- Rewrote resolution flow around Anticipation → Impact → Result → Settle.
- Added central action breakdown overlay that stays visible long enough to read.
- Result overlay now explains WHY things happened: Pierce, Armor, Shield, HP loss, statuses, passives, cancels.
- Floating combat text and status popups stay longer and are larger.
- Tactical mode now pauses at reveal, impact, and result stages.
- Board spotlighting is stronger during resolution.

## v32 keyword glossary
- Added a central keyword registry for Pierce, Sunder, Exposed, Shield, Armor, Poison, Bleed, Freeze, Frozen, Hypnosis, Guard, Protect, Melee, Ranged, Front Row, Back Row, and more.
- Ability text now highlights keywords inline.
- Tap/click a highlighted keyword to open a rules popup.
- On mobile, keyword explanations open as a bottom-sheet popup.
- Resolution cards, ability wheel tooltips, character info, and rules clarifier boxes all use keyword highlighting.
- Reworded Kahro's Assassinate: “front row is empty” instead of vague “not currently protected.”

## v33 keyword/resolve bugfix
- Fixed `ReferenceError: tacticalResolution is not defined`, which caused the game to get stuck after Resolve Round.
- Fixed keyword clicks/taps inside ability descriptions. They now open the keyword popup instead of selecting/closing the ability.
- Reinstalled Tactical Resolution controls safely for builds where the toggle variables were missing.

## v34 ability tooltip / keyword tap fix
- Replaced the older ability wheel handler that immediately chose an ability on mobile.
- Mobile ability wheel now uses first tap = preview details, second tap = choose.
- Keyword buttons inside ability descriptions now stop propagation and open the glossary popup instead of closing/selecting the ability.
- Tooltip now has pointer events enabled and a higher z-index.

## v35 random battle music
- Added random battle music selection at the start of every battle.
- Expected music files:
  - `assets/audio/Ambient 1 Loop.mp3`
  - `assets/audio/Ambient 2 Loop.mp3`
  - ...
  - `assets/audio/Ambient 10 Loop.mp3`
  - `assets/audio/battle.mp3`
- The game avoids repeating the same track twice in a row when possible.
- Music loops during battle and stops when returning home.
- If the browser blocks autoplay, the next tap/click unlocks playback.

## v36 resolution + keyword popup fix
- Added missing DOM layers for keyword popup and resolution overlay.
- Fixed keyword popups so clicking/tapping highlighted terms displays a visible explanation.
- Reworked resolution into a faster compact overlay:
  - ability name
  - full ability description
  - target
  - AP/speed
  - short result list
- Reduced automatic resolution timing so it is not painfully slow.
- Tactical mode still pauses for Continue.

## v37 goHome bugfix
- Fixed `ReferenceError: goHome is not defined`.
- Random battle music no longer assumes a home-navigation function exists.
- Added a safe fallback `goHome()` for builds that did not define it.

## v38 precise rules text + minimal info panel
- Rewrote keyword/status descriptions to be exact and rules-like.
- Exhausted is now explicit: next non-Guard action has -2 Speed and deals -2 damage, then Exhausted is removed.
- Rewrote all character passives and active ability descriptions to clarify timing, numbers, targets, and whether Armor/Shield interact.
- Character info panel is now minimal:
  - name
  - proficiencies
  - HP
  - Armor
  - Speed
  - current statuses
  - passive
- Character info no longer lists all active abilities.

## v39 tactical resolve + arrows + bugfix
- Fixed `effectiveArmorForHit is not defined`.
- Added/ensured Tactical Resolution controls:
  - Tactical Off: actions auto-advance quickly.
  - Tactical On: each action pauses on its result until Continue is clicked.
- Added animated arrows from the acting character to target(s) during resolution.
- Row/all effects now fire arrows to multiple affected targets.
- Implemented Exhausted Option A mechanically:
  - next non-Guard action has -2 Speed and deals -2 damage, then Exhausted is removed.

## v40 shipped-feeling mobile radial menu
- Kept the radial menu on mobile, but rebuilt its sizing and interaction for touch.
- Mobile wheel is now large, stable, and thumb-friendly.
- Ability buttons are much larger with readable names, AP, and speed.
- Proficiency icons are now large faint backgrounds inside ability buttons.
- Bottom ability description sheet is larger and more readable.
- First tap previews an ability; second tap chooses it.
- Tap outside closes the wheel.

## v41 resolution polish and icon fixes
- Tactical Continue is now the actual button inside the resolution card, replacing the hidden/covered “Press Continue” hint.
- Replaced janky animated arrows with static readable beams from actor to target.
- Floating combat text is larger and stays visible much longer.
- Fixed ability icon mapping with explicit overrides:
  - Protect Ally uses warrior.
  - Frostbite uses icecraft.
  - Guard actions no longer inherit unrelated status icons just because their text mentions a status.

## v42 icecraft, Dread, and payoff changes
- Frost Armor now gives +2 Armor and makes melee attackers gain 1 Freeze until end of round.
- Shatter Shot now removes all Freeze and gains +2 damage per removed Freeze stack.
- Ice Needle is now melee and deals 3 damage.
- Shadow Mark now uses the darkness icon and applies Exposed + Dread.
- Added Dread: disables one random non-Guard ability until end of round; disabled ability is greyed out with an X.
- Mesmer Roar is now a Hypnosis payoff: deal 3, or remove Hypnosis to deal +5.
- Vampire Kiss is now melee, ignores Armor, and no longer has Pierce.

## v43 Ivory Fairy boss
- Added a second boss: The Ivory Fairy.
- Boss identity: divinity / bloodcraft / darkness.
- Design role: protective, healing, single-target damage.
- Passive: Ivory Benediction — whenever she heals, her next damaging attack gains +2 damage. This stacks until used.
- Abilities:
  - Ivory Salve: heal self for 8 and store +2 damage.
  - Ivory Aegis: Guard, gain 8 Shield, attackers gain 1 Bleed.
  - Dark Edict: apply Dread and 2 Bleed to one enemy.
  - Ivory Spear: 6 damage, Pierce 2, apply 2 Bleed, consumes stored Benediction bonus.
- Added a boss selector shown when Boss Fight mode is selected.

### Ivory Fairy asset
Place her image here:

`assets/ivory_fairy.png`

Keep the exact filename and location. The code expects:
`assets/ivory_fairy.png`

World Toad still uses:
`assets/boss_toad.png`

## v44 Geshar boss
- Added Geshar, a one-tile boss who starts alone in the enemy back row.
- Identity: spirit / divinity / darkness.
- Passive: Soul Dominion — whenever an enemy character is defeated, Geshar returns it to life under his control with 3 HP in his front row.
- Abilities:
  - Soul Mend: heal Geshar and all living allies for 4.
  - Spirit Veil: Guard; gain 5 Shield and Dodge.
  - Soul Lance: single-target direct HP loss; enemy loses 5 HP ignoring Armor and Shield.
  - Grave Pressure: target a row, deal 3 damage, and apply Exhausted to damaged enemies.
- Added Geshar to the Boss Fight selector.

### Geshar asset
Place his image here:

`assets/geshar.png`

## v45 enemy placement and AI
- Regular non-boss enemy teams now use role-aware placement:
  - Brutes and Warriors prefer the front row.
  - Assassins and Sorcerers prefer the back row.
  - The enemy team always tries to include at least one frontliner when possible.
- AI is now weighted and non-deterministic instead of pure random/deterministic.
- AI prefers setup actions when payoff conditions are not ready.
- AI deprioritizes payoff actions if the required status/setup is missing.
- AI prioritizes low-HP targets and potential kills.
- AI still includes randomness so it does not become perfectly predictable.

## v46 boss/action queue fix
- Fixed boss battles not initializing `state.plans` / `planSeq`.
- Queued actions now appear in the queue strip in boss fights.
- Resolve Round now becomes enabled correctly after queuing player actions.
- Boss battle header now shows the selected boss name instead of always “World Toad”.
- Geshar now occupies the full enemy back row as a 1x3 row boss.

## v47 Geshar revive animation
- Added a Soul Dominion revive animation:
  - purple soul beam from Geshar to the revived unit
  - purple smoke/ring burst on the revived unit
  - floating “Soul Dominion” text
  - temporary purple takeover glow on the converted unit
- Converted units show a temporary “Controlled” badge.

## v48 Geshar back-row layout fix
- Fixed Geshar row-boss layout.
- Geshar now renders as one full-width tile across the entire enemy back row.
- Removed the visual issue where empty tiles appeared stacked to the right.

## v49 Geshar mobile full-row fix
- Fixed Geshar still rendering like a normal tile on mobile.
- Geshar now renders in a dedicated full-width row container.
- Added hard CSS overrides so mobile tile sizing cannot squeeze him into one slot.

## v50 Geshar full-row actual fix
- Fixed the root cause: rowBossBoard was also getting largeUnitBoard, which kept the board in the old 3-column boss grid.
- Row bosses now use their own dedicated flex layout.
- Geshar now truly spans the full back row on desktop and mobile.

## v51 mobile playable / responsive pass
- Locked battle UI to the mobile viewport to prevent clunky page scrolling.
- Character select grid is now internally scrollable on mobile, so all characters are selectable.
- Mobile character info panel has a visible close X.
- Ability wheel is moved upward and buttons are larger.
- Bottom wheel ability is no longer covered by its description sheet.
- Ability description sheet is shorter and scrollable.
- Resolution card is compact on mobile.
- Target beams/arrows are thinner and less screen-covering.
- Floating combat text is readable but less intrusive.
- Status/info buttons are larger for touch.

## v53 mobile QA workflow
- Built-in QA panel with `?qa=1`.
- Debug flags: `?mobile=1`, `?debug=1`, `?touch=1`, `?safe=1`, `?grid=1`, `?slow=1`.
- State helpers: `window.qaOpenBattle()`, `window.qaOpenRadial()`, `window.qaOpenResolution()`.
- Added Playwright screenshot workflow and `MOBILE_QA.md`.
- Added starter `manifest.json` for future PWA/app workflow.

## v56 balance + proficiency identity pass
- Guard/shield pass:
  - Shield is now rare and mostly Divinity-only.
  - Non-Divinity guards no longer give large Shield packages.
  - K'ku, Poom, Hyafrost, Yaura, Bahl/Shaman defenses were rewritten to use counter-status, Dodge, redirect, Armor, or HP cost instead of free Shield.
- Bleed/status fairness:
  - Attacks that apply Bleed/Freeze through `damageStatusOnHit` only apply the status if the hit dealt HP damage.
  - Bloodcraft protection now costs HP or consumes Bleed.
- Identity cleanup:
  - Assassins keep self-evasion/precision instead of ally defense.
  - Sorcerers focus on ranged/status/control.
  - Brutes focus on pressure/disruption, not heavy armor/shield.
  - Divinity remains the main source of Shield.
- Specific tuning:
  - Dravain Blood Guard no longer grants Shield; it restores HP only after consuming Bleed.
  - Yaura Blood Ward and Bahl Demon Ward now cost ally HP and apply Bleed to attackers, no Shield.
  - K'ku Ice Guard no longer gives Shield.
  - Poom Guard Mind no longer protects allies or gives Shield.
  - Hyafrost Spirit Form is Dodge instead of Shield; Deep Winter gives temporary Armor instead of Shield.
  - Ivory Fairy and Geshar keep reduced Divinity Shield.
  - Bleed payoff values slightly reduced where needed.

## v57 hypnotic identity pass
- Hypnotic abilities now separate setup and payoff:
  - Setup actions apply Hypnosis.
  - Strong damage/control consumes Hypnosis.
- Removed bad “payoff + setup” design from prediction effects:
  - Paleya's former Predict is now Mind Lock: consumes Hypnosis to set up a cancel; it does not apply Hypnosis.
  - Bakub's False Future consumes Hypnosis; if the target attacks, it is canceled and gains Poison.
- Poom Guard Mind is now setup only:
  - If Poom is hit, the attacker gains Hypnosis. It does not cancel the hit and gives no Shield.
- Poom Mesmer Roar remains a payoff and consumes Hypnosis for bonus damage.
- Bakub Mind Toxin now consumes Hypnosis to apply extra Poison.
- AI payoff detection was updated so it avoids using hypnotic payoff abilities when Hypnosis is missing.

## v58 Poom Purple Blood
- Renamed Poom's passive to **Purple Blood**.
- Passive text now matches lore: Poom's blood is hypnotic, so enemies that hit him with melee and deal HP damage gain Hypnosis.
- Reworked Guard Mind so it no longer duplicates the passive:
  - Guard Mind is now a Hypnosis payoff.
  - Choose an enemy with Hypnosis.
  - Remove Hypnosis.
  - If that enemy attacks Poom this round, cancel that attack.
- AI payoff logic was updated so Guard Mind is treated as a payoff and should only be used when Hypnosis is available.

## v59 Poom Guard Mind redesign
- Guard Mind now does exactly:
  - Consume Hypnosis from all enemies.
  - For each enemy whose Hypnosis was consumed, all offensive actions they use this turn are redirected to Poom.
  - Poom gains +1 Armor until end of round for each Hypnosis consumed.
- Broad/row/all enemy actions caught by Guard Mind are converted into a single redirected effect on Poom, so the rest of Poom's team is protected.
- AI treats Guard Mind as a Hypnosis payoff.

## v60 Poom ability rename
- Renamed Poom's former **Guard Mind** to **Mesmeric Taunt**.
- The name now better matches the effect:
  - consumes Hypnosis from enemies,
  - forces their offensive actions onto Poom,
  - gives Poom Armor for each consumed Hypnosis.

## v61 headless balance simulator
- Added `tools/simulate_balance.js`.
- Run:
  - `node tools/simulate_balance.js --games 5000 --seed 1337`
  - or `npm run sim:balance`
- Outputs:
  - `balance_reports/latest.json`
  - `balance_reports/character_summary.csv`
  - `balance_reports/ability_summary.csv`
- The simulator is UI-free and uses an approximate AI-vs-AI model to find obvious balance issues.

## v62 advanced balance analytics
- Extended the headless simulator with:
  - armor bucket win rates,
  - class win rates,
  - proficiency win rates,
  - pair/team synergy win rates,
  - damage/taken ratios,
  - ability use-per-pick.
- New reports:
  - `class_summary.csv`
  - `proficiency_summary.csv`
  - `armor_summary.csv`
  - `pair_summary.csv`
  - `team_summary.csv`

## v63 balance patch after analytics
Changes applied based on the 10k-game analytics:
- Dravain:
  - Armor 4 → 3.
  - Blood Slash 4 → 3 damage.
  - Vampiric Thrust 5/heal 3 → 4/heal 2.
- K'ku:
  - HP 31 → 29.
  - Glacier Break Freeze bonus +4 → +3.
- Paleya:
  - Armor 0 → 1.
  - Mind Break no-Hypnosis damage 2 → 3.
  - Dream Fog now applies Hypnosis + Exposed to a row.
- Hyafrost:
  - HP 20 → 22.
  - Ice Blast 2 → 3 damage.
  - Absolute Zero now consumes Freeze for 3 + removed Freeze damage and Exhausted.
- Bahl:
  - Replaced Demon Ward with Demon Rupture, a Poison/Bleed payoff.
- Maoja:
  - Toxic Grip damage 3 → 4.
  - Poison Burst gains +2 damage.

## v64 five-iteration balance pass
- Ran five simulate → identify → adjust loops.
- Kept all abilities at cost 1+; no 0-cost actions were added.
- Changed counter payoffs to multiplication where buildup should matter: Poison/Bleed payoffs now scale by counters, not just flat addition.

### Iteration summary
- **baseline v63**: top Dravain 70.7%, Smithen 57%, K'ku 56.4%; low Lady Eva 42.9%, Bahl 42.5%, Paleya 36.2%; avg rounds 14.5.
- **iteration 1 armor/guard nerf**: top K'ku 62%, Dravain 61.4%, Smithen 60.5%; low Bakub 46.3%, Bahl 40.8%, Paleya 33.2%; avg rounds 13.71.
- **iteration 2 multiplicative counter payoffs**: top Dravain 61.4%, K'ku 59.7%, Smithen 59.4%; low Hyafrost 47.4%, Bahl 37.7%, Paleya 33.9%; avg rounds 13.7.
- **iteration 3 Paleya payoff buff + Dravain sustain nerf**: top Smithen 61.8%, K'ku 61%, Poom 55%; low Lady Eva 47.2%, Bahl 39.6%, Paleya 39.3%; avg rounds 13.52.
- **iteration 4 ice trim + Eva multiplicative bleed**: top Smithen 60.9%, K'ku 60.5%, Dravain 55.4%; low Maoja 47.2%, Paleya 38.2%, Bahl 36.8%; avg rounds 13.45.
- **iteration 5 final targeted correction: Paleya HP 18→20, Bahl Plague Wave Poison 3→4**: top Smithen 59.8%, K'ku 59.2%, Dravain 56%; low Maoja 46.9%, Paleya 42.7%, Bahl 40.4%; avg rounds 13.54.

### Final notable changes
- Dravain: Armor 3→2, Protect cost 1→2, Blood Slash 3→2, Vampiric Thrust heal 2→1.
- Yaura: Armor 3→2, Blood Ward cost 1→2.
- Paleya: HP 18→20, Mind Break payoff 6→8, Dream Fog applies Hypnosis + Exposed.
- Bahl: Infect Mark applies 2 Poison + 1 Bleed, Plague Wave applies 4 Poison, Demon Rupture deals 2× removed Poison/Bleed.
- Maoja: Rot Burst deals 3× removed Poison; Toxic Grip damage 4.
- Eva: Crimson Fangs damage 4; Final Bite deals 2× Bleed +1.
- Smithen: Shatter Shot base 4→3; K'ku HP 31→29 and Glacier Break bonus +3.

## v65 class identity + sorcerer DPS pass
Class identity direction:
- Warrior: resilient/protective, but lower damage.
- Brute: most HP, low Armor, strongest front-line single-target attacks.
- Assassin: strong single-target damage, can reach backline, Pierce/armor-bypass tools.
- Sorcerer: least resilient, but high DPS through AoE, Armor-ignore, and control.

Applied:
- Warriors: Dravain/Yaura damage reduced; protection remains their strength.
- Brutes: K'ku/Maoja/Poom front-line damage increased, but damaging attacks are front-line constrained.
- Assassins: Kahro/Smithen/Eva got more Pierce/backline reach.
- Sorcerers: Paleya/Bahl/Hyafrost/Bakub remain fragile but got stronger AoE, control, and Armor-ignore payoffs.

## v66 six more balance iterations
Ran six additional simulator iterations after the v65 class identity pass.
Important constraints kept:
- No 0-cost abilities.
- Counter payoffs use multiplication to reward buildup.
- Warriors are protective/resilient with lower damage.
- Brutes are high-HP, low-Armor, front-line single-target hitters.
- Assassins have single-target/backline/Pierce tools.
- Sorcerers are fragile but use AoE, control, and Armor-ignore payoff damage.

Final sim after iteration 6 was 5,000 games. Included reports:
- `balance_reports/six_iteration_summary.json`
- updated `balance_reports/latest.json`
- updated CSV summaries.

## v67 precision balance metrics
Added more surgical simulator metrics so one ability can be identified as the balance problem.

New reports:
- `ability_precision_summary.csv`
  - ability uses, win rate when used, avg damage, avg healing, avg status added, avg kills, avg value, death rate after use.
- `matchup_summary.csv`
  - character-vs-character win rates.
- `matchup_outliers.csv`
  - extreme matchup problems only.
- `team_trait_summary.csv`
  - team construction traits such as 2+ Icecraft, 2+ Sorcerer, high-armor team.
- `surgical_balance_flags.csv`
  - ability-too-efficient, ability-too-weak, dead-ability, self-punishing-ability, matchup-dominant/weak.
- `latest.json` now includes all the above plus `closeGameSummary`.

These metrics are meant to identify precise issues like:
- one ability carrying a character,
- a dead ability never being picked,
- a payoff being too weak despite the character looking okay,
- specific matchups that are unwinnable,
- team traits/proficiencies that are warping results.

## v69 AI policy comparison
Added simulator variants that keep the same v67 characters/abilities and change only the AI policy:
- `tools/simulate_balance_old_ai.js`
- `tools/simulate_balance_smart_ai_only.js`
- `tools/simulate_balance_smart_vs_old.js`
- `tools/simulate_balance_old_vs_smart.js`

Reports:
- `balance_reports/old_ai_same_balance.json`
- `balance_reports/smart_ai_same_balance.json`
- `balance_reports/ai_policy_comparison_summary.json`
- `balance_reports/ai_policy_character_comparison.csv`

Run:
- `npm run sim:old-ai`
- `npm run sim:smart-ai-only`
- `npm run sim:smart-vs-old`

## v70 old AI vs smart AI head-to-head
Added side-policy win-rate reports:
- `balance_reports/smart_A_vs_old_B_side_stats.json`
- `balance_reports/old_A_vs_smart_B_side_stats.json`
- `balance_reports/ai_head_to_head_side_winrate_summary.json`

This keeps characters and abilities unchanged from v67 and changes only the AI policy.

## v71 skill-curve balance metrics and 5 iterations
Added:
- `tools/compare_skill_curve.js`
- `balance_reports/skill_curve_summary_final.json`
- `balance_reports/skill_curve_summary_final.csv`
- `balance_reports/v71_five_iteration_skill_curve_summary.json`

Goal:
- Skill-intensive characters should not already be strong under bad AI.
- Healthy skill-reward target: old AI around 40-45%, smart AI around 55-58%.
- If a character is 55%+ under old AI and 60%+ under smart AI, it is likely too good rather than merely skill intensive.

## v72 2x2 skill-matrix balance pass
Added:
- `tools/simulate_balance_policy_matrix.js`
- `tools/compare_skill_matrix.js`
- `balance_reports/skill_matrix_summary.json`
- `balance_reports/skill_matrix_summary.csv`
- `balance_reports/v72_five_iteration_skill_matrix_summary.json`

The matrix separates:
- old vs old: bad/noob baseline
- smart vs smart: optimized meta strength
- smart pilot vs old opponent: how hard the character farms bad opponents
- old pilot vs smart opponent: how punishable/counterable it is

This avoids misreading lower smart-vs-smart win rate as “not skill based”; it may instead mean smart opponents counter the character well.

## v73 surgical balance pass
Applied one surgical pass based on v72 data:
- Yaura Blood Bolt -> Blood Infusion: no easy Armor-ignore; enhances the next attack.
- Poom raw damage down; Mesmeric Taunt gains at least +1 Armor when used.
- Hyafrost Absolute Zero spike reduced.
- Dravain Protect Ally gains cleanse + Armor; Blood Slash damage improved.
- Bahl Blood Pact gives Bahl +1 Armor this round.
- K'ku Ice Guard gives +1 Armor; Blizzard Roar also applies Exhausted.

Reports:
- `balance_reports/v73_after_surgical_skill_matrix.json`
- `balance_reports/v73_before_after_skill_matrix_comparison.json`
- `balance_reports/v73_before_after_skill_matrix_comparison.csv`

## v75 fast automatic balance runner
Added:
- `tools/auto_balance_fast.js`
- `npm run sim:auto-balance-fast`

This runner is optimized for the requested workflow:
1. Run smart-vs-smart games.
2. Identify outliers from compact metrics.
3. Apply one surgical patch.
4. Repeat.
5. Run a final 2x2 skill matrix validation.

Default:
- 10 iterations
- 5000 smart-vs-smart games each
- final 1500-game-per-config skill matrix

Outputs:
- `balance_reports/auto_balance_fast_history.json`
- `balance_reports/auto_balance_fast_final_smart.json`
- `balance_reports/auto_balance_fast_final_matrix.json`

Important:
This script is designed to run locally or in a longer-running Node process. In this ChatGPT execution environment, the full 10×5000 loop may exceed the time window, but the code now supports the exact workflow automatically.

## v76 simulation truth validation
Added a hard validation step before auto-balancing:
- `tools/validate_sim_true_to_game.js`
- `npm run sim:validate-truth`

The validator executes `game.js` in a DOM-stubbed VM, extracts the final browser-game `ROSTER`
after tuning blocks, extracts the simulator `ROSTER`, and compares:
- character ids, names, class/proficiencies, HP, Armor, Speed
- ability ids/names
- cost, speed, range, damage, status/stacks, pierce, ignoreArmor, multipliers, etc.

Outputs:
- `balance_reports/simulation_truth_report.json`
- `balance_reports/simulation_truth_mismatches.csv`
- `balance_reports/extracted_game_roster.json`
- `balance_reports/extracted_sim_roster.json`

`tools/auto_balance_fast.js` now refuses to run if the simulator is not true-to-game.

## v77 game roster as simulator source of truth
Implemented the agreed fix:
- Simulator roster is generated from the real `game.js` roster.
- Character and ability identities come from `game.js`.
- If a balance-pass value conflicts with `game.js`, the balanced-pass value wins and is logged.

New files:
- `tools/extract_game_roster.js`
- `tools/sync_sim_from_game_roster.js`
- `tools/generated_roster_from_game.js`
- `tools/validate_generated_roster_truth.js`

New commands:
- `npm run sim:sync-roster`
- `npm run sim:validate-generated-roster`
- `npm run sim:auto-balance-fast`

Reports:
- `balance_reports/game_roster_source.json`
- `balance_reports/sim_roster_synced_from_game.json`
- `balance_reports/roster_sync_report.json`
- `balance_reports/generated_roster_truth_report.json`

## v78 rules parity validation
Added:
- `tools/validate_rules_parity.js`
- `npm run sim:validate-rules`

This executes scripted micro-scenarios against both:
1. the real `game.js` rule functions in a DOM-stubbed VM
2. the simulator rule functions

It compares final HP, shield, statuses, buffs, death state, armor/tempArmor, etc.

Covered scenarios:
- armor damage
- armor + shield
- exposed
- freeze threshold
- poison end-round tick
- Poom melee passive
- bleed-on-attack behavior
- Blood Infusion next attack

`auto_balance_fast.js` is now gated by rules parity too.
If rules parity fails, automatic balance must not run.

## v79 mobile layout + ally-targeting hotfix
Fixes:
- `applyLayoutModeV52 is not defined` on mobile/QA layout refresh.
- Enemy AI selecting player characters for abilities that say `ally`.

Rule added:
- Any ability with `range: "ally"` can only target living units on the caster's own side.

Validation:
- `npm run test:v79-target-layout`

## v81 two-iteration balance run
Ran the requested true-to-game balance pass:
- Sync simulator roster from `game.js`
- Validate generated roster identity
- Validate rules parity
- Iteration 0: 500 smart-vs-smart games, diagnose, patch
- Iteration 1: 500 smart-vs-smart games, diagnose, patch
- Final: 500 smart-vs-smart games and 500-game/config 2x2 skill matrix

Report:
- `balance_reports/v81_two_iteration_balance_summary.json`
- `balance_reports/iter0_before_smart_vs_smart.json`
- `balance_reports/iter1_after_patch_smart_vs_smart.json`
- `balance_reports/iter2_final_smart_vs_smart.json`
- `balance_reports/iter2_final_skill_matrix.json`

## v82 ability-metric balance pass
Completed 5 smart-vs-smart iterations with 1000 games per iteration, using ability precision metrics.
Important foundation changes before balancing:
- Expanded simulator mapping for real `game.js` effects that were previously classified as utility/incorrectly simulated.
- Added support for real effects including damageStatus, damageStatusOnHit, armorStrike, bloodDash, whiteout, frontHypno, frostArmorRetaliate, proliferate, and more.
- Kept generated roster identity validation and rules parity validation active.

Reports:
- `balance_reports/v82_ability_metric_5iter_summary.json`
- `balance_reports/iter0_smart.json` ... `iter4_smart.json`
- `balance_reports/iter*_ability_precision_summary.csv`
- `balance_reports/final_skill_matrix.json`

## v83 surgical follow-up
Applied the next data-driven surgical pass from v82:
- Dravain Shield Bash cost 1 -> 2.
- Yaura Blood Ward now costs 1, grants +1 Armor, and applies 3 Bleed when triggered.
- Paleya Mirror Guard applies Exposed on successful prediction; Mass Suggestion speed improved.
- Poom Revenge Body self-cost trimmed where applicable.

Reports:
- `balance_reports/v83_after_patch_smart.json`
- `balance_reports/v83_after_patch_ability_precision_summary.csv`
- `balance_reports/v83_skill_matrix.json`
- `balance_reports/v83_surgical_followup_summary.json`

## v84 iterative balance pass
Ran as many iterative ability-metric passes as fit in the chat execution window, with a hard maximum of 20.
Uses exact character/ability ID patches via `balance_reports/v84_balance_patch.json`, then writes the same final patch into `game.js`.

Reports:
- `balance_reports/v84_until_healthy_summary.json`
- `balance_reports/v84_balance_patch.json`
- per-iteration smart/ability reports

## v85 continuation: 3 more iterations
Continued the v84/v83 balance loop for 3 more iterations.

Validation:
- sync simulator roster from game.js
- generated roster identity validation
- rules parity validation
before and after each iteration.

Reports:
- `balance_reports/v85_continue_3iter_summary.json`
- `balance_reports/final_after_3_more_smart.json`
- `balance_reports/v85_final_skill_matrix.json` if matrix completed

## v86 Yaura redesign
Option B: redesigned Yaura as setup -> Bleed payoff rather than repeated HP-tax damage.

Validation:
- synced simulator from `game.js`
- generated roster identity validation
- rules parity validation
before and after each iteration.

Simulation:
- 3 iterations
- 500 smart-vs-smart games per iteration
- final smart-vs-smart run
- final small 2x2 skill matrix if time allowed

Report:
- `balance_reports/v86_yaura_redesign_summary.json`
