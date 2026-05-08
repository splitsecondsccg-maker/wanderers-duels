# Wanderers Duels Game Guide

## Premise

Wanderers Duels is a tactical fantasy dueling game about building a small squad of unusual fighters, arranging them in formation, and outplaying an enemy team or boss through hidden action planning.

Each round is a prediction puzzle. You commit actions before seeing the full enemy plan, then both sides resolve their choices in speed order. Winning comes from reading the opponent, protecting the right unit at the right moment, setting up counters and statuses, and timing burst turns before your squad is worn down.

## Goal

The goal of each battle is to defeat every enemy unit before your own squad is defeated.

In squad battles, this means defeating the enemy squad. In boss battles, this means defeating the boss encounter, which may include large monsters, summoned tokens, or supporting enemies.

## Core Loop

Each battle follows this loop:

1. Build or choose a squad.
2. Arrange your fighters in the front and back rows.
3. Enter the Plan phase.
4. Spend your available ability points to queue actions.
5. Resolve the round.
6. Repeat until one side is defeated.

The main tension is that actions are chosen before the full round resolves. A strong action can miss its purpose if the board changes before it resolves, while a defensive or setup action can completely swing the round if timed correctly.

## Squads And Formation

Your side and the enemy side each use a two-row formation:

- Front row: the row closest to the enemy.
- Back row: the row farthest from the enemy.
- Each normal row has up to three slots.
- Some large units or tokens can occupy an entire row.

The formation matters because many abilities care about row position, melee range, front-row access, or row-wide effects.

## Front Row And Back Row Rules

The front row is not simply a fixed board row. It is the closest row to the enemy that currently has living units.

The back row is the farthest row from the enemy that currently has living units.

If only one row currently has living units, that row counts as both the front row and the back row.

This rule is important. If a front row is cleared during a round, the old back row becomes the new front row. If a new unit or token enters the front row before an attack resolves, melee targeting should use the current front row at the moment of resolution.

## Units

There are several kinds of units in the game.

### Characters

Characters are the playable fighters you can choose for your squad. They have:

- Health
- Armor
- Base speed
- Proficiencies
- A passive
- A set of abilities

### Tokens

Tokens are units created during battle. They can occupy slots, block targeting, attack, heal, or provide other effects depending on the token.

Tokens are not selectable roster characters. They are battle pieces created by abilities or passives.

Examples include Skeletons, Sun Trees, and Bone Walls.

### Bosses

Bosses are special enemy encounters. A boss may have unique passives, large body sizes, special targeting rules, or supporting enemies.

Some bosses and boss-like units occupy an entire row.

## Ability Points

Each round, your team has a limited amount of ability points to spend. Most normal rounds use 3 ability points.

Abilities cost ability points. A low-cost ability is easier to fit into a turn. A high-cost ability may be stronger, but can consume most or all of your round.

Some effects can change ability point limits or costs:

- Dread limits how many ability points a character can spend next turn.
- Exhausted makes the next ability cost 1 extra ability point.
- Some abilities cost more because they hit multiple targets, ignore range limits, or create strong setup.

## Plan Phase

During the Plan phase, you choose actions for your fighters.

You can:

- Choose a fighter.
- Pick an ability.
- Pick legal targets.
- Queue the action.
- Continue until you run out of ability points or decide to resolve.

Enemy actions are also planned. Some may be hidden until they resolve.

## Resolve Phase

When you press Resolve Round, actions are revealed and resolved.

The basic resolution order is:

1. Guard-priority actions resolve first.
2. Other actions resolve by final speed.
3. Higher final speed resolves before lower final speed.
4. Ties may resolve in an uncertain order.

During resolution, the board can change. Units can move, die, summon tokens, gain statuses, lose statuses, or become invalid targets. Ability targeting and conditional bonuses should be checked when the ability resolves, not only when it was queued.

## Speed

Speed determines when an action resolves during a round.

The game displays final speed on the ability card. Final speed is the number that matters for queue order.

The general formula is:

```text
final speed = character base speed + ability speed modifier + dynamic bonuses
```

Examples of dynamic bonuses include counters or buffs that modify the speed of a character's abilities.

Guard-priority abilities are special. They resolve in the guard timing band before normal speed actions. Their displayed speed should make clear that they are guard-priority actions.

The ability description should explain the speed math so the player understands how the displayed final speed was calculated.

## Action Types

Abilities are grouped by practical combat type. These types help the player understand what an ability is trying to do before reading the full text.

### Melee

Melee abilities use the body, claws, weapon, bite, or close combat force.

Most melee attacks are limited by front-row access. However, some special melee attacks, especially assassin-style attacks, can target backline units while still counting as melee.

This distinction matters because some effects trigger only from melee attacks.

### Ranged

Ranged abilities attack or affect targets at distance. They are usually less restricted by front-row positioning, unless the ability text says otherwise.

### Area

Area abilities affect multiple units, a row, or an entire side.

Area abilities may still be melee or ranged depending on how they deal damage. For example, a sweeping weapon attack can be both melee and area.

### Buff

Buff abilities improve a unit, usually by adding armor, healing, granting counters, increasing damage, or setting up a future payoff.

An ability that attacks and heals is still primarily an attack. Buff is reserved for abilities that are mainly supportive and do not attack.

### Guard

Guard abilities are high-priority defensive or reactive actions. They usually resolve before normal attacks and often protect, block, interrupt, redirect, or prepare a defensive trigger.

Some attacks gain bonuses against targets that performed guard actions this round.

## Targeting

Abilities define what they can target.

Common targeting patterns include:

- Self
- One ally
- One enemy
- A row
- All enemies in a row
- All allies in a row
- All enemies
- One enemy in each row
- An empty slot
- An empty row

Targets are validated when selected, and important combat conditions should also be checked again when the action resolves.

## Dynamic Targeting

The board can change before an action resolves. When an ability depends on current board position, the game should use the current board at resolution time.

For example:

- A melee attack queued against a back-row unit because no front-row units existed should retarget or validate against the new front row if a unit enters the front row before the attack resolves.
- A front-row-only attack should use the current front row, not a row that used to be front when the action was queued.
- A boss that occupies an entire row should be treated as occupying all slots in that row.

## Damage

Most attacks deal damage. Damage is reduced before it reaches health.

The normal damage flow is:

1. Calculate base damage and bonuses.
2. Apply special modifiers such as Pierce.
3. Reduce damage by effective Armor.
4. Reduce remaining damage by Shield.
5. Any remaining damage is lost Health.
6. If Health was lost, the target was hit.
7. Hit-triggered effects resolve.

## Hit

Hit is a keyword.

A unit is hit when it is attacked and loses Health.

If Armor and Shield prevent all Health loss, the unit was attacked but was not hit.

This matters for Bleed, Poison-related triggers, lifesteal-style effects, passives, and abilities that say "if hit."

## Health, Healing, And Defeat

Health represents how close a unit is to defeat.

Healing restores lost Health, but cannot raise a unit above its maximum Health unless an effect explicitly says otherwise.

When a unit reaches 0 Health, it is defeated. Some passives or tokens can replace, revive, or react to defeated units.

## Armor

Armor reduces incoming damage before Shield and Health.

Base armor is printed on a character. Temporary armor may be gained during a round and usually lasts only for that turn or attack, depending on the effect.

Armor is especially important against small multi-hit attacks because it can reduce each hit separately when the attack is implemented as multiple hits.

## Shield

Shield is a temporary damage-prevention pool.

After Armor reduces an attack, Shield can block remaining damage before Health is lost. Shield is usually temporary and may expire at the end of the round or after being consumed, depending on the effect.

## Pierce

Pierce reduces effective Armor against an attack.

For example, an attack with Pierce 2 ignores up to 2 points of Armor for that damage calculation.

Pierce does not automatically mean the attack hits. If remaining Armor, Shield, or other prevention stops all Health loss, the attack still does not count as a hit.

## Multi-Hit And Multi-Target Attacks

Some attacks hit more than once or hit more than one target.

When an effect buffs the next attack, it should apply to all damage events that belong to that attack unless the effect says otherwise.

For example:

- If the next attack gains +1 damage and the next attack hits twice for 2 damage, it becomes two hits for 3 damage.
- If the next attack applies Poison and the next attack hits multiple enemies, the Poison should apply to each relevant attack target according to the buff text.

## Guard Moves

Guard moves are a defined category in the rules and code. They are not just abilities with defensive flavor.

Guard moves matter because:

- They resolve at guard priority.
- Some attacks gain bonuses against units that performed a guard move this round.
- Some abilities interact with or cancel guard-style plans.

If an ability is meant to count as a guard, it should be tagged as a guard action.

## Statuses And Counters

Statuses are ongoing effects shown on units. Some statuses stack as counters. Others are single-instance effects.

Status icons should be clickable or tappable to show what they do.

### Bleed

Bleed is a stackable counter.

Bleed resolves only after the unit is attacked and loses Health. If the attack is fully blocked by Armor or Shield, Bleed does not resolve and remains.

When Bleed resolves, the unit loses additional life equal to its Bleed counters, then those counters are removed.

### Poison

Poison is a stackable counter.

Poison causes life loss over time, usually at the end of the round. Poison is not the same as attack damage and may bypass normal attack prevention depending on the effect.

### Freeze

Freeze is a stackable counter.

At enough Freeze counters, the unit becomes Frozen.

### Frozen

Frozen represents being locked down by ice. A Frozen unit has its next non-Guard action disrupted or canceled, then the Frozen state is removed.

Guard actions are intended to remain useful even under many control effects.

### Hypnosis

Hypnosis is a control/setup status used by hypnotic abilities.

Some effects consume Hypnosis for stronger outcomes, such as canceling actions or applying other statuses.

### Exposed

Exposed makes a unit more vulnerable to a future hit.

It is usually consumed when the unit next takes relevant damage.

### Dread

Dread limits the affected character next turn.

A character with Dread can spend at most 2 total ability points on abilities during that turn. A 3-cost ability cannot be used while Dread is restricting that character.

### Exhausted

Exhausted is not stackable.

The next ability this character queues costs 1 extra ability point, then Exhausted is removed.

### Flame

Flame is a firecraft counter.

Flame can increase firecraft speed and can be spent by fire abilities for larger attacks.

### Potions

Potions are stackable status effects with the Potion type. They trigger when their condition happens.

Health Potion:

- Triggers when the unit is hit.
- Consumes one stack.
- Heals 3 Health.

Strength Potion:

- Triggers when the unit performs an attack.
- Consumes one stack.
- The unit loses 2 Health.
- The attack gains +3 damage.

Armor Potion:

- Triggers when the unit is attacked.
- Consumes one stack.
- The unit gains +2 Armor for that attack.

House Special:

- Triggers at the start of the next round.
- Consumes one stack.
- The unit loses 5 Health.
- The unit's next attack gains +5 damage.
- The unit gains 1 Armor for that round.

Because some characters can give potions to enemies, potions can be beneficial, harmful, or risky depending on timing.

## Temporary Attack Buffs

Some effects increase the next attack's damage or add an extra effect to the next attack.

These buffs should be visible on the unit portrait so players can understand that the character is carrying a pending payoff.

Common examples include:

- Next attack gains damage.
- Next attack applies Poison.
- Next attack gains a special status effect.
- Next attack has conditional bonus damage.

If a buff says it affects the next attack, it should be consumed by the next attack attempt according to that effect's rules.

## Start-Of-Round Effects

Some effects trigger at the start of the next round.

Examples include:

- Delayed attacks.
- House Special Potion.
- Token healing.
- Growth effects.

These effects should persist correctly across the round transition and resolve before normal planning or action resolution as defined by their text.

## End-Of-Round Effects

Some effects trigger at the end of the round.

Examples include:

- Poison ticks.
- Temporary armor expiring.
- Round-only buffs expiring.
- Some control effects decrementing or clearing.

## Delayed Effects

Delayed effects are actions or statuses that are created now but resolve later.

A delayed attack should not disappear at the end of the current round unless its text says so. If it says it hits next round, it must remain pending until the next round and then resolve at the proper timing.

## Summons And Row-Sized Tokens

Summoned units can occupy board slots and change targeting.

Some summons occupy one slot. Some occupy an entire row.

Row-sized units or tokens:

- Take all three slots in a row.
- Should be treated as present in each slot of that row for targeting and layout.
- Can affect melee access because they occupy the front or back row.
- Need special handling on mobile so they do not stretch the board wider than the screen.

## Status-Immune Tokens

Some tokens are not affected by statuses.

For example, a Sun Tree or Bone Wall should not gain Bleed, Poison, Freeze, Dread, Hypnosis, or other character statuses unless a specific rule says otherwise.

## Proficiencies

Proficiencies describe a unit's training, nature, magic, or faction identity. They help define the style of that character and are used by ability icons, passives, and synergies.

Current proficiency and type vocabulary includes:

- Assassin
- Warrior
- Brute
- Sorcerer
- Icecraft
- Vampire
- Bloodcraft
- Witchcraft
- Hypnotic
- Darkness
- Demon
- Spirit
- Divinity
- Dragon
- Firecraft
- Gnome
- Goblin
- Beast
- Boss
- Token

The four main playable combat classes are Assassin, Warrior, Brute, and Sorcerer.

## Class Identity

### Assassin

Assassins specialize in efficient attacks, precision, and reaching vulnerable enemies.

Some assassin attacks are melee attacks that can target backline units. They still count as melee for effects that care about melee attacks.

### Warrior

Warriors tend to combine weapon attacks, guard interactions, armor, and direct combat pressure.

### Brute

Brutes are durable fighters with high-impact attacks, row pressure, and punishment mechanics.

### Sorcerer

Sorcerers are usually more specialized. They often create tokens, apply statuses, manipulate rows, or build toward magical payoffs.

## Damage Themes

Different proficiencies tend to create different play patterns.

Icecraft often uses Freeze, Frozen, armor, and control.

Bloodcraft often uses Bleed, self-costs, drains, and payoff for life loss.

Vampire often uses hit rewards, healing, Bleed, and life-swing attacks.

Witchcraft often uses Poison, potions, tricks, and status layering.

Hypnotic often uses Hypnosis, control, and action disruption.

Darkness often uses Dread, Exposed, summons, or punishing enemy plans.

Divinity often uses healing, shielding, Sun Trees, and ally recovery.

Firecraft often builds Flame counters and spends them for explosive attacks.

Dragon abilities tend to be direct, durable, or tied to fire and scales.

## Game Modes

### Squad Fight

Squad Fight is the standard battle mode. You choose a squad and fight another squad controlled by the enemy AI.

### Boss Fight

Boss Fight lets you choose a special encounter instead of a normal squad opponent.

Boss encounters currently include:

- World Toad: an aggressive area-damage boss.
- The Ivory Fairy: a protective single-target boss.
- Geshar: a soul-control boss with row-sized behavior.
- Mountain Guardians: a guardian and cubs encounter.

Boss fights may bend normal assumptions. They can include larger units, special passives, unique formations, and support enemies.

## Mountain Guardians Encounter

Mountain Guardians is a boss fight against a large Guardian and two cubs.

The Guardian occupies the entire front row. The cubs fight from the back row.

The Guardian's key identity is protection. Its passive redirects melee attacks that target its allies to itself. Because it takes the entire front row, movement and displacement effects must respect that it occupies all three front-row spaces.

If there is no legal space to move a row-sized unit, movement effects should fail rather than creating an invalid formation.

## Smart Enemy AI

The opponent uses smart AI logic to choose actions and targets. The AI should evaluate allies and enemies correctly, avoid targeting its own team with harmful enemy-only actions, and use support actions on valid friendly targets unless a special rule allows otherwise.

## User Interface Basics

The battle UI is built around fast mobile play.

Important UI elements include:

- Fighter tiles.
- Status icons.
- Ability radial menu.
- Ability detail panel.
- Resolve order strip.
- Battle log.
- Result panel.

On mobile, information must be available without hover. Tapping icons, statuses, and info buttons should open descriptions.

## Ability Radial Menu

The radial menu is used to choose abilities on touch devices.

The ability brief should show:

- Ability name
- Proficiency icon
- Action type icon
- Ability point cost
- Final speed

The expanded description should show the full rules text and speed math.

## Battle Log

The battle log records important events from the match.

It should be openable and closable during battle. It is useful for understanding why damage, prevention, status resolution, or action cancellation happened.

## Result Panel

During resolution, the result panel explains the current action.

It should show:

- Acting unit
- Ability name
- Target
- Cost and speed
- Ability text
- Important calculations
- Continue control

The panel should not permanently trap the game. If the result details are hidden or minimized, there must still be a way to continue resolution.

## Animation And Feedback

The game uses visual, audio, and haptic feedback to make actions easier to read.

Important feedback moments include:

- Choosing an ability.
- Highlighting an ability in the radial menu.
- Queuing an action.
- Resolving an action.
- Blocking damage.
- Taking a hit.
- Healing.
- Applying a status.
- Defeating a unit.

Animations should communicate what happened without hiding the board state for too long.

## Important Rule Priorities

When rules interact, use these priorities:

1. Ability text overrides general rules.
2. Guard-priority actions resolve before normal actions.
3. Final speed controls normal action order.
4. Board position is checked at resolution when the ability depends on current row or range.
5. A hit requires Health loss.
6. Bleed resolves only after a hit.
7. Status-immune tokens do not receive normal statuses.
8. Row-sized units occupy all slots in their row.
9. Multi-target and multi-hit attacks carry next-attack buffs across all relevant damage events unless the buff says otherwise.
10. Effects that say next round must persist through the round transition.

## Strategy Principles

Strong play usually comes from combining these ideas:

- Protect the unit the enemy wants to hit.
- Use guard actions to beat obvious attacks.
- Force the enemy to waste actions into Armor or Shield.
- Apply setup statuses before payoff attacks.
- Watch front-row changes during a round.
- Use row attacks when enemies are clustered.
- Use backline reach to punish fragile supports.
- Time delayed effects so the opponent must react next round.
- Track final speed, not just printed ability speed.
- Remember that a blocked attack is not a hit.

## Glossary

Ability point:

The resource spent to queue abilities during a round.

Action:

An ability that has been queued for resolution.

Area:

An ability that affects multiple units or a row.

Back row:

The farthest row from the enemy that currently has living units.

Base speed:

The speed printed on a character before ability modifiers and dynamic bonuses.

Buff:

A beneficial effect that improves a unit or future action.

Counter:

A stackable status value, such as Bleed, Poison, Freeze, or Flame.

Final speed:

The actual speed used to sort the queue during resolution.

Front row:

The closest row to the enemy that currently has living units.

Guard:

A high-priority defensive or reactive action type.

Hit:

An attack caused the target to lose Health.

Melee:

An attack using body, weapon, claws, bite, or close combat force. Some melee attacks can still target the backline.

Pierce:

Reduces effective Armor for an attack.

Proficiency:

A unit identity or magic type, such as Icecraft, Bloodcraft, Divinity, or Firecraft.

Ranged:

An attack or effect delivered from distance.

Row-sized:

A unit or token that occupies all three slots in a row.

Shield:

Temporary damage prevention after Armor.

Status:

An ongoing effect shown on a unit.

Token:

A summoned battle unit that is not a selectable roster character.

