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
