# Split Seconds — Codex Handoff Document

This document is for continuing the project in Codex. It explains the game, the current codebase, the current balance state, the validation/simulation pipeline, and the most important traps to avoid.

**Current project zip:** `split_seconds_v87_requested_buffs_checked_code_only.zip`  
**Primary runtime files:** `index.html`, `game.js`, `style.css`  
**Current state:** Browser-based prototype, mobile-capable, with a validated balance simulator and recent v87 balance pass.

---

## 1. What the game is

**Split Seconds** is a 3-vs-3, simultaneous-planning tactical character battler inspired by CCGs and fighting games.

Each side has three characters arranged on a two-row board:

- **Front row**
- **Back row**

Each round:

1. Player secretly queues actions for characters.
2. AI queues enemy actions.
3. Actions resolve by priority:
   - Guard actions first
   - Then higher Speed
   - Then tie-breakers/randomness
4. Statuses, passives, deaths, and end-of-round effects resolve.

The player wins by defeating all enemy characters.

The design target is:

- readable tactical turns,
- clear class identity,
- strong ability synergy,
- mobile-friendly UI,
- balance in the approximate **45–55% smart-vs-smart range**, with some skill/counterplay variance allowed.

---

## 2. Important design identities

The current class/proficiency philosophy matters a lot. Preserve it when changing abilities.

### Warrior

Resilient and protective. Low-to-medium damage. Should protect allies, cleanse, redirect, or survive. Should not become the best burst class.

### Brute

High HP, low armor. Strong front-line pressure and single-target attacks. Usually melee/front-row constrained. Should not become shield/armor-heavy.

### Assassin

Strong single-target damage, reach/backline pressure, finishing tools, Pierce/Exposed/Bleed/Dread. Should be fragile and tactical.

### Sorcerer

Least resilient, but strong control, AoE, status payoff, ignore-armor/status-based damage. Should rely on setup and payoff, not raw tankiness.

### Bloodcraft

Should not get free healing/shielding without cost or setup. Current direction is **setup → Bleed payoff**, not repeated HP-tax damage spam.

### Hypnotic

Setup actions apply Hypnosis. Payoff/control actions consume or exploit Hypnosis. Avoid combining strong setup and strong payoff in one easy action.

---

## 3. Core combat concepts

### Rows and targeting

- Melee normally targets the enemy **front row**.
- If the front row is empty, melee can hit the back row.
- Ranged can target backline.
- `range: "ally"` must only target living units on the caster’s side. This was a real bug fixed in v79.

### Action priority

The action queue sorts by:

1. Guard priority
2. Speed
3. Tie-breaker/randomness

### Damage order

Final intended damage order:

1. Apply hit modifiers such as Exposed or passives.
2. Armor reduces damage unless the effect ignores armor.
3. Shield absorbs remaining damage.
4. HP is reduced.
5. Death is checked.

### Important status keywords

- **Armor:** Reduces incoming normal damage.
- **Shield:** Temporary damage buffer, typically expires at end of round.
- **Pierce:** Reduces effective Armor.
- **Ignore Armor:** Damage bypasses Armor but still interacts with Shield unless special-cased.
- **Bleed:** Stored counters; consumed by certain payoff attacks. Earlier versions consumed Bleed on any direct hit; the current design heavily uses explicit Bleed payoff for Yaura and bloodcraft.
- **Poison:** End-of-round damage/decay logic. It ignores Armor/Shield.
- **Freeze:** Setup counter for ice payoffs; at threshold creates Frozen/cancels action depending on current logic.
- **Frozen:** Cancels a non-Guard action.
- **Hypnosis:** Non-stackable/control key used by hypnotic characters.
- **Exposed:** Adds damage to the next direct hit, then clears.
- **Exhausted:** Lowers Speed / disrupts next action.
- **Dread:** Prevents or disables one ability temporarily, according to current implementation.
- **Guard/Protect/Ward:** Priority defensive actions.

---

## 4. Current roster snapshot

The exact current roster should be extracted from `game.js` using:

```bash
npm run sim:sync-roster
```

This writes:

```text
balance_reports/game_roster_source.json
balance_reports/sim_roster_synced_from_game.json
tools/generated_roster_from_game.js
```

Current character list:

| ID | Character | Class | Proficiency / Theme | Notes |
|---|---|---|---|---|
| `smithen` | Smithen | Assassin | Icecraft | Fast ice assassin. Freeze setup + Shatter payoff. |
| `dravain` | Dravain | Warrior | Vampire | Protective vampire warrior; Protect Ally + Blood Claim. |
| `yaura` | Yaura | Warrior | Bloodcraft | Redesigned into setup → Bleed payoff. |
| `kku` | K'ku | Brute | Icecraft | High HP ice brute; Freeze setup/payoff. |
| `kahro` | Kahro | Assassin | Darkness | Backline/dark assassin; Assassinate finisher. |
| `maoja` | Maoja | Brute | Witchcraft/poison | Poison brute pressure. Watchlist: slightly high. |
| `paleya` | Paleya | Sorcerer | Hypnotic | Control/hypnosis character. |
| `poom` | Poom | Brute | Hypnotic | Brute with hypnotic blood/passive/redirect. |
| `shaman` | Bahl | Sorcerer | Bloodcraft + Demon | Status setup + demon/blood payoff. |
| `eva` | Lady Eva | Assassin | Vampire | Bleed/vampire assassin. |
| `hyafrost` | Hyafrost | Sorcerer | Icecraft + Spirit | Freeze control and ice payoff. |
| `bakub` | Bakub | Sorcerer | Witchcraft + Hypnotic + Demon | Control/status sorcerer. |

There are also boss/large-unit systems in the codebase, including World Toad/Geshar/Ivory Fairy work from previous iterations. If Codex touches bosses, inspect `ROSTER` in `game.js` and the footprint logic before editing.

---

## 5. Current balance state after v87

The latest **actual simulated** run applied these requested buffs:

- Paleya: `Mass Suggestion` cost → `1`
- Hyafrost: `Frozen Field` Freeze stacks → `3`
- Kahro: `Assassinate` bonus +1
- Yaura: `Blood Price` bonus → `6`

Validation passed before simulation:

- generated roster identity ✅
- rules parity ✅
- `game.js` syntax ✅

### v87 smart-vs-smart result, 1000 games

| Character | Win rate |
|---|---:|
| Maoja | 58.4% |
| Poom | 53.3% |
| Yaura | 52.3% |
| Smithen | 52.1% |
| Paleya | 52.0% |
| K'ku | 49.6% |
| Bahl | 49.3% |
| Hyafrost | 49.1% |
| Bakub | 48.3% |
| Lady Eva | 46.4% |
| Dravain | 46.0% |
| Kahro | 43.4% |

### v87 2x2 skill matrix, 500 games/config

| Character | Old vs Old | Smart vs Smart | Smart pilot vs Old opponent | Old pilot vs Smart opponent |
|---|---:|---:|---:|---:|
| Maoja | 46.8% | 54.4% | 72.0% | 35.1% |
| Bahl | 58.1% | 53.8% | 63.8% | 35.5% |
| Dravain | 59.3% | 53.8% | 64.3% | 38.8% |
| Smithen | 50.2% | 53.8% | 56.8% | 39.3% |
| Yaura | 46.9% | 53.3% | 69.5% | 40.4% |
| Paleya | 45.7% | 52.1% | 63.5% | 30.2% |
| Poom | 51.6% | 50.4% | 65.9% | 34.1% |
| K'ku | 50.0% | 48.4% | 53.7% | 40.3% |
| Lady Eva | 49.2% | 47.6% | 60.5% | 39.1% |
| Bakub | 56.9% | 44.6% | 65.9% | 41.8% |
| Kahro | 52.6% | 43.9% | 56.8% | 46.7% |
| Hyafrost | 32.4% | 43.8% | 61.2% | 21.9% |

### Current balance interpretation

- Overall roster is much healthier than earlier versions.
- **Maoja** is the main watchlist/high character, especially because smart pilots farm old AI hard.
- **Kahro** and **Hyafrost** are low in matrix smart-vs-smart but not dead in 1000-game smart-vs-smart.
- **Yaura redesign worked**: she is no longer a dead character and is skill-sensitive.
- Do not revert Yaura to easy direct Armor-ignore. Her current design is better.

---

## 6. Yaura redesign details

This was the largest recent design fix.

Old problem:

- Yaura had too much HP/self-taxing damage.
- She could deal damage but failed to convert into wins.
- Number tweaks did not fix her.

Current design:

### Blood Infusion

- Setup an ally’s next attack.
- Adds bonus damage.
- If the attack deals HP damage, applies Bleed.
- No direct Armor-ignore.

### Blood Price

- Bleed payoff.
- Deals base damage.
- If the target has Bleed, consumes it and deals bonus damage.
- No self/ally HP tax.
- No easy Armor-ignore.

### Blood Ward

- Ally gains Armor.
- If attacked, attacker gains Bleed.
- Defensive setup, not free Shield spam.

### Red Rain

- AoE Bleed setup.
- Has small self-cost.

Do not undo this direction unless specifically redesigning bloodcraft again.

---

## 7. Important project files

### `index.html`

Entry point for the browser prototype. Loads the game UI and scripts.

### `game.js`

The main game file. Contains:

- `ROSTER`
- ability definitions
- state management
- targeting
- AI planning
- action resolution
- damage/status/passive logic
- mobile UI logic
- tactical resolution overlays
- many historical patch/tuning blocks

**Important warning:** `game.js` contains many duplicated historical function definitions because this prototype was patched iteratively. Later definitions and tuning blocks override earlier ones. When editing, search for **all** versions of a function before changing it.

Common duplicate/hotspot names:

```text
targets
chooseEnemy
resolveRound
apply
damage
applyStatusFrom
applyLayoutModeV52
```

Do not assume the first definition is the active one.

### `style.css`

All layout and visual styling, including:

- board layout
- mobile mode
- radial wheel
- tooltips/bottom sheets
- queue strip
- resolution overlays
- animations

### `manifest.json`

PWA/app metadata.

### `assets/`

Placeholder asset folder. Expected important names are listed in `README.md`.

---

## 8. Simulation and validation tools

The simulation tools live in `tools/`.

### The current correct validation order

Before trusting any simulation, run:

```bash
npm run sim:sync-roster
npm run sim:validate-generated-roster
npm run sim:validate-rules
```

If any of these fail, **do not run balance simulations**.

### Why this matters

Earlier balance numbers became unreliable because:

1. The simulator had a stale hard-coded roster.
2. The simulator did not match real game rules.
3. Some real ability effects were being classified as utility or simulated incorrectly.

This was fixed by:

- generating the simulator roster from `game.js`,
- validating character/ability identity,
- validating rules parity,
- expanding simulator mappings for real effects.

### `tools/sync_sim_from_game_roster.js`

Extracts the real runtime `ROSTER` from `game.js`, applies the balance patch file, and writes:

```text
tools/generated_roster_from_game.js
balance_reports/game_roster_source.json
balance_reports/sim_roster_synced_from_game.json
balance_reports/roster_sync_report.json
```

### `balance_reports/v84_balance_patch.json`

Important: this exact-ID patch is currently part of the balancing workflow.

It applies final balance values by character/ability ID. This was introduced because string replacements were brittle.

If Codex changes ability numbers, update both:

1. the runtime tuning in `game.js`, and
2. `balance_reports/v84_balance_patch.json`

or, better, refactor to a single source of truth so drift cannot happen again.

### `tools/validate_generated_roster_truth.js`

Checks that the generated simulator roster has the same character IDs and ability IDs as the game roster.

### `tools/validate_rules_parity.js`

Runs scripted micro-scenarios against both:

1. the real `game.js` rule functions in a DOM-stubbed VM,
2. the simulator rule functions.

Current covered examples include:

- armor damage
- armor + shield
- exposed
- freeze threshold
- poison end-round tick
- Poom melee passive
- bleed-on-attack behavior
- Blood Infusion next attack

If adding/changing any mechanics, add parity tests here.

### `tools/simulate_balance_smart_ai_only.js`

Runs smart AI vs smart AI. Produces:

```text
balance_reports/latest.json
balance_reports/ability_precision_summary.csv
balance_reports/surgical_balance_flags.csv
balance_reports/matchup_outliers.csv
```

Recommended command:

```bash
node tools/simulate_balance_smart_ai_only.js --games 1000 --seed 117000
```

### `tools/compare_skill_matrix.js`

Runs the 2x2 matrix:

- old vs old
- smart vs smart
- smart pilot vs old opponent
- old pilot vs smart opponent

Recommended command:

```bash
node tools/compare_skill_matrix.js --games 500 --seed 117500
```

This is slower but very useful for identifying skill-intensive and counterable characters.

---

## 9. NPM commands

From `package.json`:

```bash
npm install
npm run serve
npm run qa:install
npm run qa:screens
npm run sim:sync-roster
npm run sim:validate-generated-roster
npm run sim:validate-rules
npm run sim:smart-ai-only
npm run sim:skill-matrix
npm run test:v79-target-layout
```

For development:

```bash
npm run serve
```

Then open the local Vite URL.

For mobile debugging:

```text
index.html?mobile=1&debug=1&qa=1
```

Useful flags:

```text
?mobile=1   Force phone layout
?debug=1    Show viewport badge
?qa=1       Open QA panel
?touch=1    Outline touch targets
?safe=1     Show safe-area frame
?grid=1     Show 24px layout grid
?slow=1     Slow transitions/animations
```

---

## 10. Mobile/UI status

Mobile is a major priority.

Recent fixed issues:

- `applyLayoutModeV52 is not defined` mobile ReferenceError.
- Ability wheel/tooltip overflow.
- Ally-targeting bug where enemy AI could target the player with ally abilities.
- Mobile layout mode can be forced with query params.
- QA screenshot workflow exists through Playwright.

Run:

```bash
npm run qa:screens
```

Screenshots output to:

```text
qa-screenshots/
```

If editing mobile layout, test at least:

- 390x844 / iPhone portrait
- 430x932 / large phone portrait
- tablet-ish widths
- desktop

---

## 11. Current known risks / technical debt

### 1. `game.js` is too monolithic

It contains thousands of lines and many historical patches. Refactor carefully.

Suggested future structure:

```text
src/data/characters.js
src/data/abilities.js
src/core/state.js
src/core/targeting.js
src/core/damage.js
src/core/statuses.js
src/core/resolve.js
src/ai/oldAi.js
src/ai/smartAi.js
src/ui/battle.js
src/ui/mobile.js
src/sim/...
```

### 2. Simulator and game can drift

This was the biggest source of bad balance data. Keep validations mandatory.

Never trust a sim run unless these pass first:

```bash
npm run sim:sync-roster
npm run sim:validate-generated-roster
npm run sim:validate-rules
```

### 3. `v84_balance_patch.json` and `game.js` can drift

Current workflow patches both. Better future refactor:

- extract real ability data into one file,
- game and simulator both import that file,
- delete overlay/tuning duplication.

### 4. More parity tests are needed

`validate_rules_parity.js` is helpful but not exhaustive.

Add tests for:

- Protect/redirect once-only behavior
- Blood Ward trigger
- Dread ability disabling
- Hypnosis consumption
- Absolute Zero / Freeze payoff
- Geshar revive/control transfer
- boss/large-unit footprint targeting
- row AoE targeting
- death timing during simultaneous resolution

---

## 12. How to safely make a balance change

Use this process.

### Step 1 — edit by exact ID

Prefer editing through exact character/ability IDs, not string search.

Relevant current patch file:

```text
balance_reports/v84_balance_patch.json
```

### Step 2 — sync and validate

```bash
npm run sim:sync-roster
npm run sim:validate-generated-roster
npm run sim:validate-rules
```

### Step 3 — run smart-vs-smart

```bash
node tools/simulate_balance_smart_ai_only.js --games 1000 --seed 12345
```

Read:

```text
balance_reports/latest.json
balance_reports/ability_precision_summary.csv
balance_reports/surgical_balance_flags.csv
```

### Step 4 — identify the cause

Do not patch based only on character win rate. Inspect:

- ability use rate,
- win rate when used,
- average value,
- death-after-use,
- damage/taken ratio,
- matchup outliers.

### Step 5 — patch one thing

Prefer a single surgical change:

- one ability cost,
- one bonus number,
- one status stack,
- one HP/Armor point.

### Step 6 — repeat

Then run the 2x2 matrix:

```bash
node tools/compare_skill_matrix.js --games 500 --seed 67890
```

---

## 13. What not to do

Do **not**:

- Run balance sims if parity fails.
- Reintroduce easy Armor-ignore to Yaura.
- Buff/nerf based on one small simulation without checking ability metrics.
- Patch only the simulator or only the game.
- Trust old reports from before v77/v78 without context.
- Edit the first occurrence of `damage`, `apply`, or `targets` in `game.js` without checking later overrides.
- Remove mobile QA utilities without replacing them.

---

## 14. Recommended next tasks for Codex

1. **Refactor data source**  
   Extract `ROSTER` and abilities from `game.js` into a single data module used by both game and simulator.

2. **Expand rules parity tests**  
   Add tests for Protect, Blood Ward, Dread, Hypnosis payoff, Freeze payoff, boss footprint, and revive.

3. **Clean up duplicate historical functions**  
   Carefully remove obsolete earlier definitions after confirming active behavior.

4. **Run a fresh balance pass**  
   Start from v87. Run:
   - 1000 smart-vs-smart games
   - ability metrics
   - 500/config skill matrix

5. **Mobile QA screenshot audit**  
   Use `npm run qa:screens` and inspect output for phone clipping, ability wheel overflow, and bottom-sheet overlap.

---

## 15. Quick-start for Codex

From a fresh unzip:

```bash
npm install
npm run sim:sync-roster
npm run sim:validate-generated-roster
npm run sim:validate-rules
npm run test:v79-target-layout
npm run serve
```

Then open:

```text
http://localhost:<vite-port>/index.html?mobile=1&debug=1&qa=1
```

For a balance check:

```bash
node tools/simulate_balance_smart_ai_only.js --games 1000 --seed 117000
node tools/compare_skill_matrix.js --games 500 --seed 117500
```

Use this document plus `README.md`, `MOBILE_QA.md`, and the latest `balance_reports/v87_requested_buffs_check_summary.json` as the starting context.
