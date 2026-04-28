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
