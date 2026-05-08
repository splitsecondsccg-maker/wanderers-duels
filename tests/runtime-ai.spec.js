const { test, expect } = require('@playwright/test');

test('browser game uses runtime smart AI policy for enemy plans', async ({ page }) => {
  await page.goto('/index.html?debug=1');
  await page.evaluate(() => {
    window.qaOpenBattle();
    window.__WANDERERS_DEBUG__.chooseEnemy();
  });

  const aiState = await page.evaluate(() => {
    const state = window.__WANDERERS_DEBUG__.getState();
    return {
      globalPolicy: window.__WANDERERS_AI_POLICY,
      statePolicy: state.aiPolicy,
      enemyPlans: state.plans
        .filter(plan => plan.side === 'enemy')
        .map(plan => ({
          actor: plan.unit?.id || plan.unitId,
          ability: plan.ability?.id || plan.abilityId,
          target: plan.target?.id || plan.targetId,
          aiPolicy: plan.aiPolicy,
          score: plan.score
        })),
      unitPolicies: state.units
        .filter(unit => unit.side === 'enemy' && unit.planned)
        .map(unit => unit.planned.aiPolicy)
    };
  });

  expect(aiState.globalPolicy).toBe('smart-ai-v95');
  expect(aiState.statePolicy).toBe('smart-ai-v95');
  expect(aiState.enemyPlans.length).toBeGreaterThan(0);
  expect(aiState.enemyPlans.every(plan => plan.aiPolicy === 'smart-ai-v95')).toBe(true);
  expect(aiState.enemyPlans.every(plan => Number.isFinite(plan.score))).toBe(true);
  expect(aiState.unitPolicies.every(policy => policy === 'smart-ai-v95')).toBe(true);
});

test('plans resolve duplicate character ids on the intended side', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const playerSmithen = cloneChar('smithen', 'player', 'front', 0);
    const enemySmithen = cloneChar('smithen', 'enemy', 'front', 0);
    const enemyHope = cloneChar('hope', 'enemy', 'back', 1);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [playerSmithen, enemySmithen, enemyHope],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });

    const attack = enemySmithen.abilities.find(a => a.id === 'iceNeedle');
    const plan = window.__WANDERERS_DEBUG__.makePlan(enemySmithen, attack, playerSmithen, 'enemy');
    const action = window.__WANDERERS_DEBUG__.planToAction(plan);

    return {
      planUnitSide: plan.unitSide,
      planTargetSide: plan.targetSide,
      actionUnitSide: action?.unit?.side,
      actionTargetSide: action?.target?.side,
      actionUnitIsEnemyCopy: action?.unit === enemySmithen,
      actionTargetIsPlayerCopy: action?.target === playerSmithen
    };
  });

  expect(result).toMatchObject({
    planUnitSide: 'enemy',
    planTargetSide: 'player',
    actionUnitSide: 'enemy',
    actionTargetSide: 'player',
    actionUnitIsEnemyCopy: true,
    actionTargetIsPlayerCopy: true
  });
});

test('smart enemy AI resolves ally and enemy targets by side even with duplicate ids', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const issues = await page.evaluate(() => {
    const player = [
      cloneChar('smithen', 'player', 'front', 0),
      cloneChar('dravain', 'player', 'front', 1),
      cloneChar('hope', 'player', 'back', 1)
    ];
    const enemy = [
      cloneChar('smithen', 'enemy', 'front', 0),
      cloneChar('dravain', 'enemy', 'front', 1),
      cloneChar('hope', 'enemy', 'back', 1)
    ];
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [...player, ...enemy],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });

    const allyKinds = new Set([
      'protect',
      'ward',
      'bloodWard',
      'poisonHands',
      'bloodInfusion',
      'singleHeal',
      'grantShield',
      'frostArmorRetaliate',
      'empowerNextAttack'
    ]);
    const noTargetKinds = new Set([
      'dodge',
      'selfCounter',
      'spirit',
      'absoluteZero',
      'allStatus',
      'allDamageStatus',
      'frontHypno',
      'poomMassGuardMind',
      'massDrainBleed'
    ]);
    const found = [];

    for (let i = 0; i < 60; i += 1) {
      window.__WANDERERS_DEBUG__.chooseEnemy();
      const plans = window.__WANDERERS_DEBUG__.getState().plans.filter(p => p.side === 'enemy');
      for (const plan of plans) {
        const action = window.__WANDERERS_DEBUG__.planToAction(plan);
        const kind = action?.ability?.kind || action?.ability?.effect;
        if (!action || noTargetKinds.has(kind)) continue;
        if (!action.target) {
          found.push({ issue: 'missing-target', actor: action?.unit?.id, ability: action?.ability?.id });
          continue;
        }
        const shouldTargetAlly = action.ability.range === 'ally' || allyKinds.has(kind);
        const expectedSide = shouldTargetAlly ? action.unit.side : 'player';
        if (action.target.side !== expectedSide) {
          found.push({
            issue: 'wrong-side',
            actor: action.unit.id,
            actorSide: action.unit.side,
            ability: action.ability.id,
            kind,
            target: action.target.id,
            targetSide: action.target.side,
            expectedSide
          });
        }
      }
    }

    return found;
  });

  expect(issues).toEqual([]);
});

test('payoff abilities read target status at resolve time', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const paleya = cloneChar('paleya', 'player', 'back', 1);
    const target = cloneChar('smithen', 'enemy', 'front', 0);
    target.armor = 0;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [paleya, target],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });

    const ability = paleya.abilities.find(a => a.effect === 'mindBreak' || a.kind === 'hypnosisDamagePayoff');
    const plan = window.__WANDERERS_DEBUG__.makePlan(paleya, ability, target, 'player');
    const action = window.__WANDERERS_DEBUG__.planToAction(plan);
    target.status.hypnosis = 1;
    const beforePayoff = target.hp;
    apply(action.unit, action.ability, action.target);
    const payoffLost = beforePayoff - target.hp;
    const payoffHypnosisAfter = target.status.hypnosis || 0;

    target.hp = target.maxHp;
    target.dead = false;
    target.status.hypnosis = 1;
    const planWhenReady = window.__WANDERERS_DEBUG__.makePlan(paleya, ability, target, 'player');
    const actionWhenReady = window.__WANDERERS_DEBUG__.planToAction(planWhenReady);
    target.status.hypnosis = 0;
    const beforeBase = target.hp;
    apply(actionWhenReady.unit, actionWhenReady.ability, actionWhenReady.target);
    const baseLost = beforeBase - target.hp;

    return {
      ability: ability.id,
      payoffLost,
      baseLost,
      payoffHypnosisAfter,
      payoffDmg: ability.payoffDmg,
      baseDmg: ability.dmg
    };
  });

  expect(result.payoffLost).toBeGreaterThan(result.baseLost);
  expect(result.payoffLost).toBe(result.payoffDmg);
  expect(result.baseLost).toBe(result.baseDmg);
  expect(result.payoffHypnosisAfter).toBe(1);
});

test('result and ability detail sheets can be closed, and battle log toggles', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => window.qaOpenResolution());
  await expect(page.locator('.resolutionCloseBtn')).toBeVisible();
  await page.locator('.resolutionCloseBtn').click();
  await expect(page.locator('#resolutionOverlay')).toHaveClass(/hidden/);

  await page.evaluate(() => {
    window.qaOpenRadial();
    const tooltip = document.querySelector('#abilityTooltip');
    tooltip.innerHTML = '<div class="tipTop"><b>Test Ability</b></div><div class="abilityDescText">Details</div>';
    tooltip.classList.remove('hidden');
  });
  await expect(page.locator('.abilityTooltipClose')).toBeVisible();
  await page.locator('.abilityTooltipClose').click();
  await expect(page.locator('#abilityTooltip')).toHaveClass(/hidden/);
  await page.evaluate(() => document.querySelector('#radial')?.classList.add('hidden'));

  await page.evaluate(() => window.qaOpenBattle());
  await page.locator('#battleLogToggleBtn').click();
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/showLogV101/);
  await expect(page.locator('#logColumn')).toBeVisible();
  await page.locator('#battleLogToggleBtn').click();
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/panelClosedV101/);
});

test('tactical result close minimizes without losing the continue path', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    window.qaOpenBattle();
    setTacticalResolution(true);
    const actor = alive('player')[0];
    const target = alive('enemy')[0];
    const ability = actor.abilities.find(a => targets(actor, a).includes(target)) || actor.abilities[0];
    tacticalContinue = () => { window.__continuedAfterMinimize = true; };
    showResolutionOverlay(actor, ability, target, 'result', [{ type: 'hp', text: `${target.name} lost 2 HP` }]);
  });

  await expect(page.locator('#inlineContinueResolveBtn')).toBeVisible();
  await page.locator('.resolutionCloseBtn').click();
  await expect(page.locator('#resolutionOverlay')).toHaveClass(/minimizedV105/);
  await expect(page.locator('#resolutionOverlay')).not.toHaveClass(/hidden/);

  await page.locator('.resolutionCloseBtn').click();
  await expect(page.locator('#inlineContinueResolveBtn')).toBeVisible();
  await page.locator('#inlineContinueResolveBtn').click();
  await expect.poll(() => page.evaluate(() => window.__continuedAfterMinimize === true)).toBe(true);
});

test('character inspect panel includes uncropped full artwork', async ({ page }) => {
  await page.goto('/index.html?debug=1');
  await page.evaluate(() => {
    window.qaOpenBattle();
    const state = window.__WANDERERS_DEBUG__.getState();
    const unit = state.units.find(u => u.side === 'player');
    selectedId = unit.id;
    selectedSide = unit.side;
    renderBattle();
  });

  await expect(page.locator('.inspectArtworkV103 img')).toBeVisible();
  const art = await page.locator('.miniInfoCard.miniInfoCardWithArtV103 .inspectArtworkV103 img').evaluate(img => ({
    src: img.getAttribute('src'),
    fit: getComputedStyle(img).objectFit,
    alt: img.getAttribute('alt'),
    insideCard: !!img.closest('.miniInfoCard')
  }));
  expect(art.src).toContain('assets/');
  expect(art.fit).toBe('contain');
  expect(art.alt).toContain('full artwork');
  expect(art.insideCard).toBe(true);
});

test('life loss immediately plays rumble animation on the damaged character tile', async ({ page }) => {
  await page.goto('/index.html?debug=1');
  const result = await page.evaluate(() => {
    window.qaOpenBattle();
    const state = window.__WANDERERS_DEBUG__.getState();
    const attacker = state.units.find(u => u.side === 'player');
    const target = state.units.find(u => u.side === 'enemy');
    target.armor = 0;
    target.shield = 0;
    renderBattle();
    damage(attacker, target, 4, { attack: true });
    const tile = document.querySelector(`.tile[data-unit-id="${target.id}"][data-side="${target.side}"]`);
    return {
      hasClass: tile?.classList.contains('lifeLossRumbleV104') || false,
      hasRumble: tile?.classList.contains('rumble') || false,
      intensity: tile?.style.getPropertyValue('--life-loss-intensity') || '',
      rumbleUntilFuture: target.rumbleUntil > Date.now()
    };
  });

  expect(result.hasClass).toBe(true);
  expect(result.hasRumble).toBe(true);
  expect(Number(result.intensity)).toBeGreaterThan(1);
  expect(result.rumbleUntilFuture).toBe(true);
});

test('defeated characters play a temporary break animation before disappearing', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    window.qaOpenBattle();
    const state = window.__WANDERERS_DEBUG__.getState();
    const attacker = state.units.find(u => u.side === 'player' && !u.dead);
    const target = state.units.find(u => u.side === 'enemy' && !u.dead);
    target.hp = 1;
    target.armor = 0;
    target.shield = 0;
    renderBattle();
    damage(attacker, target, 99, { attack: true, ignoreArmor: true });
    renderBattle();
    const ghost = document.querySelector(`.tile.defeatGhostV107[data-unit-id="${target.id}"][data-side="${target.side}"]`);
    return {
      dead: target.dead,
      ghostVisible: !!ghost,
      ghostClass: ghost?.className || '',
      shards: document.querySelectorAll('.deathShardV107').length
    };
  });

  expect(result.dead).toBe(true);
  expect(result.ghostVisible).toBe(true);
  expect(result.ghostClass).toContain('defeatBreakV107');
  expect(result.shards).toBeGreaterThan(0);

  await page.waitForTimeout(1300);
  await expect(page.locator('.tile.defeatGhostV107')).toHaveCount(0);
});

test('game-feel SFX uses bundled audio assets for click, heal, hit, block, and defeat', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const assets = await page.evaluate(() => window.__WANDERERS_AUDIO_ASSETS);
  const sync = await page.evaluate(() => window.__WANDERERS_AUDIO_SYNC);
  expect(assets.tap).toBe('assets/audio/lock.wav');
  expect(assets.select).toBe('assets/audio/lock.wav');
  expect(assets.commit).toBe('assets/audio/click.wav');
  expect(assets.hit).toBe('assets/audio/hit.mp3');
  expect(assets.guard).toBe('assets/audio/block.mp3');
  expect(assets.block).toBe('assets/audio/block.mp3');
  expect(assets.heavy).toBe('assets/audio/hit.mp3');
  expect(assets.heal).toBe('assets/audio/heal.mp3');
  expect(assets.defeat).toBe('assets/audio/shatter.wav');
  expect(sync.guardDeploySound).toBe(false);
  expect(sync.blockSoundTrigger).toContain('shield absorption');
});

test('radial ability briefs show reliable proficiency and tactical type icons', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    const dravain = cloneChar('dravain', 'player', 'front', 1);
    const maoja = cloneChar('maoja', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [smithen, dravain, maoja],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98');
    renderBattle();
    selectedId = smithen.id;
    selectedSide = smithen.side;
    openWheel(smithen);
    const buttons = [...document.querySelectorAll('.wheelBtn')];
    return {
      buttonCount: buttons.length,
      profIcons: buttons.filter(btn => btn.querySelector('.wheelProfIconV109')).length,
      typeIcons: buttons.filter(btn => btn.querySelector('.wheelTypeIconV109[data-ability-type]')).length,
      types: buttons.map(btn => btn.querySelector('.wheelTypeIconV109')?.dataset.abilityType).filter(Boolean),
      iconTexts: buttons.map(btn => btn.querySelector('.wheelTypeIconV109')?.textContent.trim()).filter(Boolean),
      profBackgrounds: buttons.map(btn => getComputedStyle(btn.querySelector('.wheelProfIconV109')).backgroundImage),
      knownTypes: Object.keys(window.__WANDERERS_ABILITY_BRIEF_TYPES || {})
    };
  });

  expect(result.buttonCount).toBeGreaterThan(0);
  expect(result.profIcons).toBe(result.buttonCount);
  expect(result.typeIcons).toBe(result.buttonCount);
  expect(new Set(result.types).size).toBeGreaterThan(1);
  expect(result.types.every(type => result.knownTypes.includes(type))).toBe(true);
  expect(result.knownTypes.sort()).toEqual(['aoe', 'buff', 'guard', 'melee', 'ranged']);
  expect(result.iconTexts.every(text => !/^[A-Z]+$/.test(text))).toBe(true);
  expect(result.iconTexts.every(text => !/[#&;]/.test(text))).toBe(true);
  expect(result.profBackgrounds.every(bg => bg && bg !== 'none')).toBe(true);
});

test('radial type icons classify attack-heals as attacks, not buffs', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const dravain = cloneChar('dravain', 'player', 'front', 0);
    const eva = cloneChar('eva', 'player', 'front', 1);
    return {
      vampiricThrust: abilityTypeV109(dravain.abilities.find(a => a.id === 'drain')),
      finalBite: abilityTypeV109(eva.abilities.find(a => a.id === 'bite')),
      protect: abilityTypeV109(dravain.abilities.find(a => a.id === 'protect'))
    };
  });

  expect(result.vampiricThrust.key).toBe('melee');
  expect(result.finalBite.key).toBe('ranged');
  expect(result.protect.key).toBe('guard');
});

test('mobile pointer-up opens unit info and status details inside battle tiles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    smithen.status.freeze = 2;
    const dravain = cloneChar('dravain', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [smithen, dravain],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98');
    renderBattle();

    const info = document.querySelector('.tile.playerSide .unitInfoBtn');
    info.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch' }));
    const infoTitle = document.querySelector('#infoTitle')?.textContent || '';

    const freeze = document.querySelector('.tile.playerSide .statusChip[data-status="freeze"]');
    freeze.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 2, pointerType: 'touch' }));
    const statusTitle = document.querySelector('#infoTitle')?.textContent || '';
    const statusBody = document.querySelector('#infoBody')?.textContent || '';

    return { infoTitle, statusTitle, statusBody };
  });

  expect(result.infoTitle).toContain('Smithen');
  expect(result.statusTitle.toLowerCase()).toContain('freeze');
  expect(result.statusBody.toLowerCase()).toContain('freeze');
});

test('Geshar row-boss board keeps visible front slots in mobile battle layout', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1281 });
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const geshar = {
      id: 'geshar_boss',
      name: 'Geshar',
      side: 'enemy',
      row: 'back',
      col: 1,
      size: 'rowBoss',
      footprint: { rows: 1, cols: 3 },
      hp: 46,
      maxHp: 46,
      armor: 2,
      speed: 6,
      shield: 0,
      status: {},
      buff: {},
      planned: null,
      dead: false,
      art: "url('assets/geshar.png')",
      abilities: []
    };
    const poom = cloneChar('poom', 'player', 'front', 0);
    const zahria = cloneChar('zahria', 'player', 'front', 1);
    const yaura = cloneChar('yaura', 'player', 'back', 1);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [geshar, poom, zahria, yaura],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98', 'mobileLayoutV52');
    renderBattle();

    const board = document.querySelector('#enemyBoard');
    const boss = board.querySelector('.rowBossFullRow .rowBossTile');
    const frontTiles = [...board.querySelectorAll(':scope > .row > .tile.empty')];
    const frontRects = frontTiles.map(tile => tile.getBoundingClientRect());
    const bossRect = boss.getBoundingClientRect();
    return {
      boardClasses: board.className,
      emptyCount: frontTiles.length,
      bossHeight: bossRect.height,
      frontHeights: frontRects.map(rect => rect.height),
      frontWidths: frontRects.map(rect => rect.width)
    };
  });

  expect(result.boardClasses).toContain('rowBossBoard');
  expect(result.emptyCount).toBe(3);
  expect(result.bossHeight).toBeGreaterThan(150);
  expect(Math.min(...result.frontHeights)).toBeGreaterThan(110);
  expect(Math.min(...result.frontWidths)).toBeGreaterThan(110);
});

test('guard planning uses commit sound, block sound only stays reserved for triggered blocks', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const calls = await page.evaluate(() => {
    const dravain = cloneChar('dravain', 'player', 'front', 0);
    const smithen = cloneChar('smithen', 'player', 'front', 1);
    const enemy = cloneChar('kahro', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [dravain, smithen, enemy],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    const seen = [];
    const before = playSfxV106;
    playSfxV106 = kind => { seen.push(kind); };
    selectedId = dravain.id;
    selectedSide = dravain.side;
    pendingAbility = dravain.abilities.find(a => a.id === 'protect');
    plan(smithen);
    playSfxV106 = before;
    return seen;
  });

  expect(calls).toContain('commit');
  expect(calls).not.toContain('guard');
  expect(calls).not.toContain('block');
});

test('mobile radial center works as a drag joystick for preview and choose', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?debug=1');

  const rects = await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    const dravain = cloneChar('dravain', 'player', 'front', 1);
    const maoja = cloneChar('maoja', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [smithen, dravain, maoja],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98');
    renderBattle();
    selectedId = smithen.id;
    selectedSide = smithen.side;
    openWheel(smithen);
    const center = document.querySelector('#wheelCenter').getBoundingClientRect();
    const targetEl = document.querySelector('.wheelBtn:not(:disabled)');
    const target = targetEl.getBoundingClientRect();
    return {
      center: { x: center.left + center.width / 2, y: center.top + center.height / 2 },
      target: { x: target.left + target.width / 2, y: target.top + target.height / 2 },
      targetBefore: { left: target.left, top: target.top, width: target.width, height: target.height }
    };
  });

  await page.mouse.move(rects.center.x, rects.center.y);
  await page.mouse.down();
  await page.mouse.move(rects.target.x, rects.target.y, { steps: 8 });

  await expect(page.locator('.wheelBtn.joystickTargetV112')).toHaveCount(1);
  await expect(page.locator('#abilityTooltip')).not.toHaveClass(/hidden/);
  const targetAfter = await page.locator('.wheelBtn.joystickTargetV112').evaluate(el => {
    const rect = el.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  });
  expect(Math.abs(targetAfter.left - rects.targetBefore.left)).toBeLessThan(1);
  expect(Math.abs(targetAfter.top - rects.targetBefore.top)).toBeLessThan(1);
  expect(Math.abs(targetAfter.width - rects.targetBefore.width)).toBeLessThan(1);
  expect(Math.abs(targetAfter.height - rects.targetBefore.height)).toBeLessThan(1);

  await page.mouse.up();
  await expect(page.locator('#radial')).toHaveClass(/hidden/);
  await expect(page.locator('.tile.targetable')).toHaveCount(1);
});

test('unit info button opens character detail while battle stays playable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    const dravain = cloneChar('dravain', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [smithen, dravain],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98');
    renderBattle();
    document.querySelector('.tile.playerSide .unitInfoBtn')?.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch' })
    );
    return {
      selectedId,
      selectedSide,
      title: document.querySelector('#infoTitle')?.textContent || '',
      body: document.querySelector('#infoBody')?.textContent || '',
      sheetClass: document.querySelector('#infoPanelSheet')?.className || ''
    };
  });

  expect(result.selectedId).toBe('smithen');
  expect(result.selectedSide).toBe('player');
  expect(result.title).toContain('Smithen');
  expect(result.body).toContain('Proficiencies');
  expect(result.sheetClass).toMatch(/showInfo|showInfoV101|mobilePanelOpen/);
});

test('real mobile taps on info and status controls open the info sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    smithen.status.freeze = 2;
    const dravain = cloneChar('dravain', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [smithen, dravain],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98');
    renderBattle();
  });

  const infoButton = page.locator('.tile.playerSide .unitInfoBtn');
  await expect(infoButton).toHaveCount(1);
  await infoButton.click({ force: true });
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/showInfoV101/);
  await expect(page.locator('#infoTitle')).toContainText('Smithen');

  const closeButton = page.locator('#closeInfoBtn');
  await closeButton.click({ force: true });
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/panelClosedV101/);

  const freezeChip = page.locator('.tile.playerSide .statusChip[data-status="freeze"]');
  await expect(freezeChip).toHaveCount(1);
  await freezeChip.click({ force: true });
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/showInfoV101/);
  await expect(page.locator('#infoTitle')).toContainText('Freeze');
  await expect(page.locator('#infoBody')).toContainText('Freeze');
});

test('status chips are not nested buttons inside battle tile buttons', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    smithen.status.freeze = 2;
    const dravain = cloneChar('dravain', 'enemy', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [smithen, dravain],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    renderBattle();
    const chip = document.querySelector('.tile.playerSide .statusChip[data-status="freeze"]');
    return {
      tag: chip?.tagName,
      role: chip?.getAttribute('role'),
      insideTile: !!chip?.closest('.tile')
    };
  });

  expect(result.tag).toBe('SPAN');
  expect(result.role).toBe('button');
  expect(result.insideTile).toBe(true);
});

test('Hope is available with divinity warrior abilities', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const hope = await page.evaluate(() => {
    const c = window.__WANDERERS_DEBUG__.cdef('hope');
    return {
      id: c?.id,
      name: c?.name,
      cls: c?.class,
      prof: c?.prof,
      art: c?.art,
      abilities: c?.abilities?.map(a => ({
        id: a.id,
        effect: a.effect,
        kind: a.kind,
        range: a.range,
        dmg: a.dmg,
        heal: a.heal,
        shield: a.shield,
        delay: a.delay
      }))
    };
  });

  expect(hope).toMatchObject({
    id: 'hope',
    name: 'Hope',
    cls: 'warrior',
    prof: 'divinity'
  });
  expect(hope.art).toContain('assets/hope.png');
  expect(hope.abilities).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'mend', kind: 'singleHeal', range: 'ally', heal: 5 }),
    expect.objectContaining({ id: 'strike', kind: 'attack', range: 'melee', dmg: 2 }),
    expect.objectContaining({ id: 'shield', kind: 'grantShield', range: 'ally', shield: 4 }),
    expect.objectContaining({ id: 'judgement', kind: 'delayedAttack', range: 'ranged', dmg: 6, delay: 1 })
  ]));
});

test('Zahria is available and Red Rain is the shared 1 AP bleed setup', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const data = await page.evaluate(() => {
    const z = window.__WANDERERS_DEBUG__.cdef('zahria');
    const yaura = window.__WANDERERS_DEBUG__.cdef('yaura');
    return {
      zahria: {
        id: z?.id,
        name: z?.name,
        cls: z?.class,
        prof: z?.prof,
        art: z?.art,
        abilities: z?.abilities?.map(a => ({
          id: a.id,
          effect: a.effect,
          kind: a.kind,
          cost: a.cost,
          range: a.range,
          dmg: a.dmg,
          status: a.status,
          stacks: a.stacks
        }))
      },
      yauraRain: yaura?.abilities?.find(a => a.id === 'rain')
    };
  });

  expect(data.zahria).toMatchObject({
    id: 'zahria',
    name: 'Zahria',
    cls: 'sorcerer',
    prof: 'bloodcraft'
  });
  expect(data.zahria.art).toContain('assets/zahria.png');
  expect(data.zahria.abilities).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'mist', kind: 'rowBleedAmplify', status: 'bleed', stacks: 2 }),
    expect.objectContaining({ id: 'rain', kind: 'allStatus', cost: 1, status: 'bleed', stacks: 1 }),
    expect.objectContaining({ id: 'mass', kind: 'massDrainBleed', cost: 2 }),
    expect.objectContaining({ id: 'blade', kind: 'attack', cost: 2, range: 'ranged', dmg: 6 })
  ]));
  expect(data.yauraRain).toMatchObject({
    id: 'rain',
    name: 'Red Rain',
    cost: 1,
    kind: 'allStatus',
    status: 'bleed',
    stacks: 1
  });
});

test('Protect Ally redirects the next attack into Dravain', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const dravain = cloneChar('dravain', 'player', 'front', 0);
    const hope = cloneChar('hope', 'player', 'back', 1);
    const kahro = cloneChar('kahro', 'enemy', 'front', 1);
    hope.status.bleed = 2;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [dravain, hope, kahro],
      plans: [],
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });

    const protect = dravain.abilities.find(a => a.id === 'protect');
    apply(dravain, protect, hope);
    const hopeBefore = hope.hp;
    const dravainBefore = dravain.hp;
    damage(kahro, hope, 8, { attack: true });

    return {
      hopeBefore,
      hopeAfter: hope.hp,
      hopeBleed: hope.status.bleed,
      dravainBefore,
      dravainAfter: dravain.hp,
      protectUsed: window.__WANDERERS_DEBUG__.getState().protects[0]?.used
    };
  });

  expect(result.hopeBleed).toBe(1);
  expect(result.hopeAfter).toBe(result.hopeBefore);
  expect(result.dravainAfter).toBeLessThan(result.dravainBefore);
  expect(result.protectUsed).toBe(true);
});

test('ability text truth pass keeps payoff math and on-hit conditions honest', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    const out = {};

    const smithen = cloneChar('smithen', 'player', 'back', 1);
    const armored = cloneChar('dravain', 'enemy', 'front', 0);
    armored.armor = 99;
    armored.hp = armored.maxHp;
    armored.status = {};
    setUnits([smithen, armored]);
    apply(smithen, smithen.abilities.find(a => a.id === 'iceNeedle'), armored);
    out.iceNeedleFreezeWhenBlocked = armored.status.freeze || 0;

    armored.armor = 0;
    armored.hp = armored.maxHp;
    armored.status = {};
    apply(smithen, smithen.abilities.find(a => a.id === 'iceNeedle'), armored);
    out.iceNeedleFreezeOnHpDamage = armored.status.freeze || 0;

    armored.armor = 0;
    armored.hp = armored.maxHp;
    armored.status = {};
    apply(smithen, smithen.abilities.find(a => a.id === 'pin'), armored);
    out.frostPinFreeze = armored.status.freeze || 0;

    const kku = cloneChar('kku', 'player', 'front', 0);
    const e1 = cloneChar('smithen', 'enemy', 'front', 0);
    const e2 = cloneChar('kahro', 'enemy', 'front', 1);
    setUnits([kku, e1, e2]);
    apply(kku, kku.abilities.find(a => a.id === 'roar'), e1);
    out.blizzard = [e1, e2].map(u => ({ freeze: u.status.freeze || 0, exhausted: u.status.exhausted || 0 }));

    const eva = cloneChar('eva', 'player', 'back', 1);
    const target = cloneChar('kku', 'enemy', 'front', 0);
    target.armor = 0;
    target.status.bleed = 3;
    setUnits([eva, target]);
    const evaBefore = eva.hp;
    const biteBefore = target.hp;
    apply(eva, eva.abilities.find(a => a.id === 'bite'), target);
    out.finalBite = { lost: biteBefore - target.hp, bleed: target.status.bleed || 0, healed: eva.hp - evaBefore };

    const bakub = cloneChar('bakub', 'player', 'back', 1);
    const toxinTarget = cloneChar('dravain', 'enemy', 'front', 0);
    toxinTarget.armor = 99;
    setUnits([bakub, toxinTarget]);
    const toxin = bakub.abilities.find(a => a.id === 'toxin');
    const baseBefore = toxinTarget.hp;
    apply(bakub, toxin, toxinTarget);
    out.mindToxinBaseLost = baseBefore - toxinTarget.hp;
    toxinTarget.armor = 99;
    toxinTarget.hp = toxinTarget.maxHp;
    toxinTarget.status.hypnosis = 1;
    const payoffBefore = toxinTarget.hp;
    apply(bakub, toxin, toxinTarget);
    out.mindToxinPayoff = {
      lost: payoffBefore - toxinTarget.hp,
      poison: toxinTarget.status.poison || 0,
      hypnosis: toxinTarget.status.hypnosis || 0
    };

    const poom = cloneChar('poom', 'player', 'front', 0);
    const revengeTarget = cloneChar('smithen', 'enemy', 'front', 0);
    revengeTarget.armor = 0;
    setUnits([poom, revengeTarget]);
    const revenge = poom.abilities.find(a => a.id === 'revenge' || a.id === 'bodyguard');
    const poomBefore = poom.hp;
    const revengeBefore = revengeTarget.hp;
    apply(poom, revenge, revengeTarget);
    out.revengeNoPrior = { selfLost: poomBefore - poom.hp, targetLost: revengeBefore - revengeTarget.hp };
    poom.hp = poom.maxHp;
    revengeTarget.hp = revengeTarget.maxHp;
    window.__WANDERERS_DEBUG__.getState().attacked[poom.id] = true;
    const revengePriorBefore = revengeTarget.hp;
    apply(poom, revenge, revengeTarget);
    out.revengePriorTargetLost = revengePriorBefore - revengeTarget.hp;

    return out;
  });

  expect(result.iceNeedleFreezeWhenBlocked).toBe(0);
  expect(result.iceNeedleFreezeOnHpDamage).toBe(2);
  expect(result.frostPinFreeze).toBe(2);
  expect(result.blizzard).toEqual([
    { freeze: 2, exhausted: 1 },
    { freeze: 2, exhausted: 1 }
  ]);
  expect(result.finalBite).toEqual({ lost: 7, bleed: 0, healed: 0 });
  expect(result.mindToxinBaseLost).toBe(3);
  expect(result.mindToxinPayoff).toEqual({ lost: 5, poison: 2, hypnosis: 0 });
  expect(result.revengeNoPrior).toEqual({ selfLost: 0, targetLost: 5 });
  expect(result.revengePriorTargetLost).toBe(10);
});

test('v122 rules apply guard speed, frozen cancellation, melee-only poison, and hypnotic guard', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null,
        mirrorCancelV122: []
      });
    }

    const out = {};

    const yaura = cloneChar('yaura', 'player', 'front', 0);
    const hyafrost = cloneChar('hyafrost', 'player', 'back', 1);
    const maoja = cloneChar('maoja', 'player', 'front', 1);
    const bloodInfusion = yaura.abilities.find(a => a.id === 'bolt');
    const frostArmor = hyafrost.abilities.find(a => a.id === 'armor');
    const poisonHands = maoja.abilities.find(a => a.id === 'hands');
    out.guardSpeed = {
      bloodInfusion: { guard: !!bloodInfusion.guard, speed: totalSpeed(yaura, bloodInfusion), label: speedBreakdownV122(yaura, bloodInfusion).label },
      frostArmor: { guard: !!frostArmor.guard, speed: totalSpeed(hyafrost, frostArmor), label: speedBreakdownV122(hyafrost, frostArmor).label },
      poisonHands: { guard: !!poisonHands.guard, speed: totalSpeed(maoja, poisonHands), label: speedBreakdownV122(maoja, poisonHands).label }
    };

    const bakub = cloneChar('bakub', 'player', 'back', 1);
    const f1 = cloneChar('smithen', 'enemy', 'front', 0);
    const f2 = cloneChar('dravain', 'enemy', 'front', 1);
    f1.armor = 0;
    f2.armor = 0;
    bakub.status.frozen = 1;
    setUnits([bakub, f1, f2]);
    const toxin = bakub.abilities.find(a => a.id === 'toxin');
    const frozenBefore = [f1.hp, f2.hp];
    apply(bakub, toxin, f1);
    out.frozenCancel = {
      lost: [frozenBefore[0] - f1.hp, frozenBefore[1] - f2.hp],
      frozenAfter: bakub.status.frozen || 0
    };

    const paleya = cloneChar('paleya', 'player', 'back', 1);
    const enemy = cloneChar('dravain', 'enemy', 'front', 0);
    const victim = cloneChar('smithen', 'player', 'front', 0);
    enemy.status.hypnosis = 1;
    victim.armor = 0;
    setUnits([paleya, enemy, victim]);
    apply(paleya, paleya.abilities.find(a => a.id === 'mirror'), enemy);
    const victimBefore = victim.hp;
    apply(enemy, enemy.abilities.find(a => a.id === 'bash'), victim);
    out.mirrorGuard = {
      victimLost: victimBefore - victim.hp,
      enemyHypnosis: enemy.status.hypnosis || 0,
      enemyExposed: enemy.status.exposed || 0
    };

    const buffedDravain = cloneChar('dravain', 'player', 'front', 0);
    const rangedCaster = cloneChar('bakub', 'player', 'back', 1);
    const poisonTarget = cloneChar('smithen', 'enemy', 'front', 0);
    poisonTarget.armor = 0;
    setUnits([maoja, buffedDravain, rangedCaster, poisonTarget]);
    apply(maoja, poisonHands, rangedCaster);
    apply(rangedCaster, rangedCaster.abilities.find(a => a.id === 'toxin'), poisonTarget);
    out.poisonAfterRangedBuffedAttack = poisonTarget.status.poison || 0;
    poisonTarget.status.poison = 0;
    apply(maoja, poisonHands, buffedDravain);
    apply(buffedDravain, buffedDravain.abilities.find(a => a.id === 'bash'), poisonTarget);
    out.poisonAfterMeleeBuffedAttack = poisonTarget.status.poison || 0;

    const kahro = cloneChar('kahro', 'player', 'front', 0);
    const frontBlocker = cloneChar('smithen', 'enemy', 'front', 0);
    const backPoom = cloneChar('poom', 'enemy', 'back', 1);
    frontBlocker.armor = 0;
    backPoom.armor = 0;
    setUnits([kahro, frontBlocker, backPoom]);
    const shadowNeedle = kahro.abilities.find(a => a.id === 'needle');
    const canNeedleBackline = targets(kahro, shadowNeedle).includes(backPoom);
    apply(kahro, shadowNeedle, backPoom);
    out.assassinMeleeBackline = {
      range: shadowNeedle.range,
      canNeedleBackline,
      kahroHypnosisFromPoom: kahro.status.hypnosis || 0,
      iconKey: abilityIconKey(kahro, shadowNeedle)
    };

    const dreadTarget = cloneChar('kku', 'enemy', 'front', 0);
    setUnits([kahro, dreadTarget]);
    addStatus(dreadTarget, 'dread', 1);
    out.dread = {
      status: dreadTarget.status.dread || 0,
      oneApDisabled: isAbilityDisabledByDreadV42(dreadTarget, dreadTarget.abilities.find(a => a.cost === 1)),
      threeApDisabled: isAbilityDisabledByDreadV42(dreadTarget, { id: 'heavy', cost: 3 })
    };

    const smithen = cloneChar('smithen', 'player', 'back', 1);
    const pinTarget = cloneChar('dravain', 'enemy', 'front', 0);
    pinTarget.armor = 0;
    setUnits([smithen, pinTarget]);
    const frostPin = smithen.abilities.find(a => a.id === 'pin');
    const pinBefore = pinTarget.hp;
    apply(smithen, frostPin, pinTarget);
    out.frostPin = {
      lost: pinBefore - pinTarget.hp,
      freeze: pinTarget.status.freeze || 0
    };

    const paleya2 = cloneChar('paleya', 'player', 'back', 1);
    const lanceTarget = cloneChar('smithen', 'enemy', 'front', 0);
    lanceTarget.armor = 0;
    setUnits([paleya2, lanceTarget]);
    const lance = paleya2.abilities.find(a => a.id === 'lance');
    apply(paleya2, lance, lanceTarget);
    out.paleyaLance = {
      range: lance.range,
      targetHypnosis: lanceTarget.status.hypnosis || 0
    };

    const bakub2 = cloneChar('bakub', 'player', 'back', 1);
    const mt1 = cloneChar('smithen', 'enemy', 'front', 0);
    const mt2 = cloneChar('dravain', 'enemy', 'front', 1);
    mt1.armor = 0;
    mt2.armor = 0;
    mt2.status.hypnosis = 1;
    setUnits([bakub2, mt1, mt2]);
    const rowToxin = bakub2.abilities.find(a => a.id === 'toxin');
    const mtBefore = [mt1.hp, mt2.hp];
    apply(bakub2, rowToxin, mt1);
    out.rowMindToxin = {
      cost: rowToxin.cost,
      lost: [mtBefore[0] - mt1.hp, mtBefore[1] - mt2.hp],
      mt2Poison: mt2.status.poison || 0,
      mt2Hypnosis: mt2.status.hypnosis || 0
    };

    const shadowMark = kahro.abilities.find(a => a.id === 'mark');
    out.shadowMark = {
      range: shadowMark.range,
      type: abilityTypeV109(shadowMark).label,
      iconKey: abilityIconKey(kahro, shadowMark)
    };

    const zahria = cloneChar('zahria', 'player', 'back', 1);
    const mist = zahria.abilities.find(a => a.id === 'mist');
    const mass = zahria.abilities.find(a => a.id === 'mass');
    out.zahriaBloodcraft = {
      mistIcon: abilityIconKey(zahria, mist),
      massIcon: abilityIconKey(zahria, mass),
      massSpeed: totalSpeed(zahria, mass),
      massSpeedLabel: speedBreakdownV122(zahria, mass).label
    };

    return out;
  });

  expect(result.guardSpeed.bloodInfusion).toEqual({ guard: true, speed: 999, label: 'Guard Speed' });
  expect(result.guardSpeed.frostArmor).toEqual({ guard: true, speed: 999, label: 'Guard Speed' });
  expect(result.guardSpeed.poisonHands).toEqual({ guard: true, speed: 999, label: 'Guard Speed' });
  expect(result.frozenCancel).toEqual({ lost: [0, 0], frozenAfter: 0 });
  expect(result.mirrorGuard).toEqual({ victimLost: 0, enemyHypnosis: 0, enemyExposed: 1 });
  expect(result.poisonAfterRangedBuffedAttack).toBeGreaterThanOrEqual(2);
  expect(result.poisonAfterMeleeBuffedAttack).toBeGreaterThanOrEqual(2);
  expect(result.assassinMeleeBackline).toEqual({
    range: 'melee',
    canNeedleBackline: true,
    kahroHypnosisFromPoom: 1,
    iconKey: 'assassin'
  });
  expect(result.dread).toEqual({ status: 1, oneApDisabled: false, threeApDisabled: true });
  expect(result.frostPin).toEqual({ lost: 3, freeze: 2 });
  expect(result.paleyaLance).toEqual({ range: 'melee', targetHypnosis: 1 });
  expect(result.rowMindToxin).toEqual({ cost: 2, lost: [3, 5], mt2Poison: 2, mt2Hypnosis: 0 });
  expect(result.shadowMark).toEqual({ range: 'melee', type: 'Melee', iconKey: 'darkness' });
  expect(result.zahriaBloodcraft).toEqual({ mistIcon: 'bloodcraft', massIcon: 'bloodcraft', massSpeed: 7, massSpeedLabel: 'Final Speed 7' });
});

test('requested balance rules and next-round effects resolve as written', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null,
        delayedActionsV96: []
      });
    }

    const out = {};

    const hope = cloneChar('hope', 'player', 'back', 1);
    const delayedTarget = cloneChar('smithen', 'enemy', 'front', 0);
    delayedTarget.armor = 0;
    setUnits([hope, delayedTarget]);
    const judgement = hope.abilities.find(a => a.id === 'judgement');
    const delayedBefore = delayedTarget.hp;
    apply(hope, judgement, delayedTarget);
    out.delayedImmediateLost = delayedBefore - delayedTarget.hp;
    const delayedState = window.__WANDERERS_DEBUG__.getState();
    out.delayedQueued = (delayedState.delayedActionsV130?.length || 0)
      + (delayedState.delayedActionsV129?.length || 0)
      + (delayedState.delayedActionsV128?.length || 0)
      + (delayedState.delayedActionsV96?.length || 0);
    endRound();
    out.delayedNextRoundLost = delayedBefore - delayedTarget.hp;

    const maoja = cloneChar('maoja', 'player', 'front', 0);
    const dravain = cloneChar('dravain', 'player', 'front', 1);
    const poisonTarget = cloneChar('smithen', 'enemy', 'front', 0);
    poisonTarget.armor = 0;
    setUnits([maoja, dravain, poisonTarget]);
    apply(maoja, maoja.abilities.find(a => a.id === 'hands'), dravain);
    apply(dravain, dravain.abilities.find(a => a.id === 'bash'), poisonTarget);
    out.poisonHandsSameRoundPoison = poisonTarget.status.poison || 0;
    poisonTarget.status.poison = 0;
    endRound();
    apply(dravain, dravain.abilities.find(a => a.id === 'bash'), poisonTarget);
    out.poisonHandsNextRoundPoison = poisonTarget.status.poison || 0;

    const smithen = cloneChar('smithen', 'player', 'front', 0);
    const needleTarget = cloneChar('dravain', 'enemy', 'front', 0);
    needleTarget.armor = 0;
    setUnits([smithen, needleTarget]);
    const needle = smithen.abilities.find(a => a.id === 'iceNeedle');
    const needleBefore = needleTarget.hp;
    apply(smithen, needle, needleTarget);
    out.iceNeedle = {
      lost: needleBefore - needleTarget.hp,
      freeze: needleTarget.status.freeze || 0,
      range: needle.range,
      desc: needle.desc
    };

    const dravain2 = cloneChar('dravain', 'player', 'front', 0);
    const bashTarget = cloneChar('smithen', 'enemy', 'front', 0);
    bashTarget.armor = 0;
    setUnits([dravain2, bashTarget]);
    const bashBefore = bashTarget.hp;
    apply(dravain2, dravain2.abilities.find(a => a.id === 'bash'), bashTarget);
    out.bashLost = bashBefore - bashTarget.hp;

    const claimTarget = cloneChar('kku', 'enemy', 'front', 0);
    claimTarget.armor = 0;
    claimTarget.status.bleed = 4;
    dravain2.hp = dravain2.maxHp - 8;
    setUnits([dravain2, claimTarget]);
    const claimBefore = claimTarget.hp;
    const claimCasterBefore = dravain2.hp;
    apply(dravain2, dravain2.abilities.find(a => a.id === 'claim'), claimTarget);
    out.bloodClaim = {
      lost: claimBefore - claimTarget.hp,
      healed: dravain2.hp - claimCasterBefore,
      bleed: claimTarget.status.bleed || 0
    };

    const kku = cloneChar('kku', 'player', 'front', 0);
    const slamTarget = cloneChar('smithen', 'enemy', 'front', 0);
    slamTarget.armor = 0;
    setUnits([kku, slamTarget]);
    const slamBefore = slamTarget.hp;
    apply(kku, kku.abilities.find(a => a.id === 'slam'), slamTarget);
    out.frostSlam = { lost: slamBefore - slamTarget.hp, freeze: slamTarget.status.freeze || 0 };

    const breakTarget = cloneChar('smithen', 'enemy', 'front', 0);
    breakTarget.armor = 0;
    breakTarget.status.freeze = 3;
    setUnits([kku, breakTarget]);
    const breakBefore = breakTarget.hp;
    apply(kku, kku.abilities.find(a => a.id === 'break'), breakTarget);
    out.glacierFreezeCountersLost = breakBefore - breakTarget.hp;
    breakTarget.hp = breakTarget.maxHp;
    breakTarget.dead = false;
    breakTarget.status.freeze = 3;
    breakTarget.status.frozen = 1;
    const frozenBefore = breakTarget.hp;
    apply(kku, kku.abilities.find(a => a.id === 'break'), breakTarget);
    out.glacierFrozenLost = frozenBefore - breakTarget.hp;

    const attacker = cloneChar('dravain', 'enemy', 'front', 0);
    kku.hp = kku.maxHp;
    kku.armor = 1;
    kku.bonusArmor = 0;
    kku.status = {};
    kku.buff = {};
    setUnits([kku, attacker]);
    apply(kku, kku.abilities.find(a => a.id === 'guard'), kku);
    out.iceGuardArmor = getArmor(kku);
    const freezeBefore = attacker.status.freeze || 0;
    damage(attacker, kku, 5, { attack: true, melee: true });
    out.iceGuardFreezeGain = (attacker.status.freeze || 0) - freezeBefore;

    const poom = cloneChar('poom', 'player', 'front', 0);
    const revengeTarget = cloneChar('smithen', 'enemy', 'front', 0);
    revengeTarget.armor = 0;
    setUnits([poom, revengeTarget]);
    const revenge = poom.abilities.find(a => a.id === 'revenge' || a.id === 'bodyguard');
    const poomBefore = poom.hp;
    const revengeBefore = revengeTarget.hp;
    apply(poom, revenge, revengeTarget);
    out.revengeClean = { selfLost: poomBefore - poom.hp, targetLost: revengeBefore - revengeTarget.hp };
    poom.hp = poom.maxHp;
    revengeTarget.hp = revengeTarget.maxHp;
    window.__WANDERERS_DEBUG__.getState().attacked[poom.id] = true;
    const revengeDamagedBefore = revengeTarget.hp;
    apply(poom, revenge, revengeTarget);
    out.revengeAfterDamageLost = revengeDamagedBefore - revengeTarget.hp;

    return out;
  });

  expect(result.delayedImmediateLost).toBe(0);
  expect(result.delayedQueued).toBe(1);
  expect(result.delayedNextRoundLost).toBe(6);
  expect(result.poisonHandsSameRoundPoison).toBeGreaterThanOrEqual(2);
  expect(result.poisonHandsNextRoundPoison).toBe(0);
  expect(result.iceNeedle.range).toBe('melee');
  expect(result.iceNeedle.desc).toContain('Melee');
  expect(result.iceNeedle.lost).toBe(4);
  expect(result.iceNeedle.freeze).toBe(2);
  expect(result.bashLost).toBe(2);
  expect(result.bloodClaim).toEqual({ lost: 6, healed: 6, bleed: 0 });
  expect(result.frostSlam).toEqual({ lost: 5, freeze: 1 });
  expect(result.glacierFreezeCountersLost).toBe(8);
  expect(result.glacierFrozenLost).toBe(13);
  expect(result.iceGuardArmor).toBe(3);
  expect(result.iceGuardFreezeGain).toBeGreaterThanOrEqual(1);
  expect(result.revengeClean).toEqual({ selfLost: 0, targetLost: 5 });
  expect(result.revengeAfterDamageLost).toBe(10);
});

test('freeze and bleed payoff abilities check conditions only when they resolve', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    const smithen = cloneChar('smithen', 'player', 'back', 1);
    const target = cloneChar('dravain', 'enemy', 'front', 0);
    target.armor = 0;
    setUnits([smithen, target]);
    const shatter = smithen.abilities.find(a => a.id === 'shatter');
    const planned = window.__WANDERERS_DEBUG__.makePlan(smithen, shatter, target, 'player');
    const action = window.__WANDERERS_DEBUG__.planToAction(planned);
    target.status.freeze = 3;
    const beforeShatter = target.hp;
    apply(action.unit, action.ability, action.target);

    const hyafrost = cloneChar('hyafrost', 'player', 'back', 1);
    const frostTarget = cloneChar('smithen', 'enemy', 'front', 0);
    frostTarget.armor = 0;
    setUnits([hyafrost, frostTarget]);
    const frostbite = hyafrost.abilities.find(a => a.id === 'frostbite');
    const beforeNoFreeze = frostTarget.hp;
    apply(hyafrost, frostbite, frostTarget);
    const noFreezeLost = beforeNoFreeze - frostTarget.hp;
    const freezeAfterNoFreeze = frostTarget.status.freeze || 0;
    const beforeWithFreeze = frostTarget.hp;
    apply(hyafrost, frostbite, frostTarget);
    const withFreezeLost = beforeWithFreeze - frostTarget.hp;
    const freezeAfterWithFreeze = frostTarget.status.freeze || 0;

    return {
      shatterLost: beforeShatter - target.hp,
      shatterFreezeAfter: target.status.freeze || 0,
      noFreezeLost,
      freezeAfterNoFreeze,
      withFreezeLost,
      freezeAfterWithFreeze
    };
  });

  expect(result.shatterLost).toBe(9);
  expect(result.shatterFreezeAfter).toBe(0);
  expect(result.noFreezeLost).toBe(0);
  expect(result.freezeAfterNoFreeze).toBe(2);
  expect(result.withFreezeLost).toBe(2);
  expect(result.freezeAfterWithFreeze).toBe(4);
});

test('Zahria passive triggers from bleeding life loss, not ordinary attacks against bleeding targets', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    const zahria = cloneChar('zahria', 'player', 'back', 1);
    const target = cloneChar('smithen', 'enemy', 'front', 0);
    target.armor = 0;
    target.status.bleed = 2;
    setUnits([zahria, target]);
    const blade = zahria.abilities.find(a => a.id === 'blade');
    apply(zahria, blade, target);
    const armorAfterAttack = getArmor(zahria);

    target.hp = target.maxHp;
    target.dead = false;
    target.status.bleed = 3;
    const mass = zahria.abilities.find(a => a.id === 'mass');
    apply(zahria, mass, null);
    const armorAfterMassDrain = getArmor(zahria);

    return {
      armorAfterAttack,
      armorAfterMassDrain,
      targetBleedAfterMassDrain: target.status.bleed || 0
    };
  });

  expect(result.armorAfterAttack).toBe(1);
  expect(result.armorAfterMassDrain).toBe(2);
  expect(result.targetBleedAfterMassDrain).toBe(0);
});

test('Fuego is available as a dragon firecraft flame counter character', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const fuego = cdef('fuego');
    const byId = Object.fromEntries(fuego.abilities.map(a => [a.id, a]));
    return {
      exists: !!fuego,
      name: fuego.name,
      className: fuego.class,
      prof: fuego.prof,
      hp: fuego.hp,
      armor: fuego.armor,
      art: fuego.art,
      abilityIds: fuego.abilities.map(a => a.id),
      stokeCost: byId.stoke.cost,
      stokeStacks: byId.stoke.stacks,
      chargeIcon: abilityIconUrl(fuego, byId.stoke),
      flareIcon: abilityIconUrl(fuego, byId.flare),
      novaIcon: abilityIconUrl(fuego, byId.nova),
      scalesIcon: abilityIconUrl(fuego, byId.scales),
      dragonFilter: !!document.querySelector('#classFilter option[value="dragon"]')
    };
  });

  expect(result.exists).toBe(true);
  expect(result.name).toBe('Fuego');
  expect(result.className).toBe('dragon');
  expect(result.prof).toBe('firecraft');
  expect(result.hp).toBe(18);
  expect(result.armor).toBe(1);
  expect(result.art).toContain('assets/fuego.png');
  expect(result.abilityIds).toEqual(['stoke', 'flare', 'nova', 'scales']);
  expect(result.stokeCost).toBe(2);
  expect(result.stokeStacks).toBe(3);
  expect(result.chargeIcon).toContain('firecraft.png');
  expect(result.flareIcon).toContain('firecraft.png');
  expect(result.novaIcon).toContain('firecraft.png');
  expect(result.scalesIcon).toContain('dragon.png');
  expect(result.dragonFilter).toBe(true);
});

test('Fuego flame counters boost speed and fuel payoff attacks', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    const fuego = cloneChar('fuego', 'player', 'back', 1);
    const target = cloneChar('smithen', 'enemy', 'front', 0);
    target.armor = 0;
    const secondTarget = cloneChar('dravain', 'enemy', 'back', 1);
    secondTarget.armor = 0;
    setUnits([fuego, target, secondTarget]);

    const stoke = fuego.abilities.find(a => a.id === 'stoke');
    const flare = fuego.abilities.find(a => a.id === 'flare');
    const nova = fuego.abilities.find(a => a.id === 'nova');
    const scales = fuego.abilities.find(a => a.id === 'scales');

    apply(fuego, stoke, null);
    const flameAfterStoke = fuego.status.flame || 0;
    const flareSpeedWithTwoFlame = totalSpeed(fuego, flare);

    apply(fuego, scales, null);
    const flameAfterScales = fuego.status.flame || 0;
    const armorAfterScales = getArmor(fuego);
    apply(fuego, scales, null);
    const flameAfterSecondScales = fuego.status.flame || 0;
    const armorAfterSecondScales = getArmor(fuego);

    const beforeFlare = target.hp;
    apply(fuego, flare, target);
    const flareLost = beforeFlare - target.hp;
    const flameAfterFlare = fuego.status.flame || 0;

    apply(fuego, stoke, null);
    target.hp = target.maxHp;
    secondTarget.hp = secondTarget.maxHp;
    const beforeNova = [target.hp, secondTarget.hp];
    apply(fuego, nova, null);
    const novaLost = [beforeNova[0] - target.hp, beforeNova[1] - secondTarget.hp];

    return {
      flameAfterStoke,
      flareSpeedWithTwoFlame,
      flameAfterScales,
      armorAfterScales,
      flameAfterSecondScales,
      armorAfterSecondScales,
      flareLost,
      flameAfterFlare,
      novaLost,
      flameAfterNova: fuego.status.flame || 0,
      exhaustedAfterNova: fuego.status.exhausted || 0
    };
  });

  expect(result.flameAfterStoke).toBe(3);
  expect(result.flareSpeedWithTwoFlame).toBe(6);
  expect(result.flameAfterScales).toBe(4);
  expect(result.armorAfterScales).toBe(3);
  expect(result.flameAfterSecondScales).toBe(4);
  expect(result.armorAfterSecondScales).toBe(3);
  expect(result.flareLost).toBe(10);
  expect(result.flameAfterFlare).toBe(0);
  expect(result.novaLost).toEqual([6, 6]);
  expect(result.flameAfterNova).toBe(0);
  expect(result.exhaustedAfterNova).toBe(1);
});

test('smart AI helpers understand Fuego setup and payoff actions', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const fuego = cloneChar('fuego', 'enemy', 'back', 1);
    const target = cloneChar('smithen', 'player', 'front', 0);
    target.armor = 0;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [fuego, target],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    const stoke = fuego.abilities.find(a => a.id === 'stoke');
    const flare = fuego.abilities.find(a => a.id === 'flare');
    const nova = fuego.abilities.find(a => a.id === 'nova');
    fuego.status.flame = 2;
    return {
      stokeTargets: aiValidTargetsV95(fuego, stoke).length,
      novaTargets: aiValidTargetsV95(fuego, nova).length,
      flareRawDamage: aiExpectedRawDamageV95(flare, target, fuego),
      novaRawDamage: aiExpectedRawDamageV95(nova, null, fuego),
      flareReady: aiPayoffReadyV95(flare, target, fuego),
      stokeSetup: aiIsSetupV95(stoke)
    };
  });

  expect(result.stokeTargets).toBe(1);
  expect(result.novaTargets).toBe(1);
  expect(result.flareRawDamage).toBe(6);
  expect(result.novaRawDamage).toBe(4);
  expect(result.flareReady).toBe(true);
  expect(result.stokeSetup).toBe(true);
});

test('v123 latest rules: dynamic front row, hit-only bleed, guard tags, and active actor motion', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    const maoja = cloneChar('maoja', 'player', 'front', 0);
    const backOnly = cloneChar('smithen', 'enemy', 'back', 1);
    backOnly.armor = 0;
    setUnits([maoja, backOnly]);
    const breath = maoja.abilities.find(a => a.id === 'breath');
    const beforeBreath = backOnly.hp;
    apply(maoja, breath, backOnly);
    const breathCanTargetBackOnly = targets(maoja, breath).some(u => u.id === backOnly.id);
    const breathLost = beforeBreath - backOnly.hp;

    const attacker = cloneChar('smithen', 'player', 'front', 0);
    const bleedingTank = cloneChar('dravain', 'enemy', 'front', 0);
    bleedingTank.armor = 3;
    bleedingTank.status.bleed = 4;
    setUnits([attacker, bleedingTank]);
    damage(attacker, bleedingTank, 3, {attack:true, melee:true});
    const blockedBleedState = {hp: bleedingTank.hp, bleed: bleedingTank.status.bleed || 0};
    damage(attacker, bleedingTank, 4, {attack:true, melee:true});
    const hitBleedState = {hp: bleedingTank.hp, bleed: bleedingTank.status.bleed || 0};

    const kku = cloneChar('kku', 'player', 'front', 0);
    const meleeEnemy = cloneChar('dravain', 'enemy', 'front', 0);
    setUnits([kku, meleeEnemy]);
    const iceGuard = kku.abilities.find(a => a.id === 'guard');
    apply(kku, iceGuard, null);
    const armorAfterIceGuard = getArmor(kku);
    damage(meleeEnemy, kku, 1, {attack:true, melee:true});
    const freezeFromBlockedMelee = meleeEnemy.status.freeze || 0;

    const dravain = cloneChar('dravain', 'player', 'front', 0);
    const guardTarget = cloneChar('kku', 'enemy', 'front', 0);
    guardTarget.armor = 0;
    setUnits([dravain, guardTarget]);
    const guardMove = guardTarget.abilities.find(a => a.id === 'guard');
    apply(guardTarget, guardMove, null);
    const grab = dravain.abilities.find(a => a.id === 'bash');
    const beforeGrabTargetHp = guardTarget.hp;
    const beforeGrabDravainHp = dravain.hp;
    dravain.hp = Math.max(1, dravain.hp - 3);
    apply(dravain, grab, guardTarget);

    const paleya = cloneChar('paleya', 'player', 'back', 1);
    const enemyFront = cloneChar('poom', 'enemy', 'front', 0);
    const enemyBack = cloneChar('smithen', 'enemy', 'back', 1);
    enemyBack.armor = 0;
    setUnits([paleya, enemyFront, enemyBack]);
    const faeGrab = paleya.abilities.find(a => a.id === 'mesmer');
    const faeTargetsBackline = targets(paleya, faeGrab).some(u => u.id === enemyBack.id);

    const shaman = cloneChar('shaman', 'player', 'front', 0);
    const ruptureTarget = cloneChar('kku', 'enemy', 'front', 0);
    ruptureTarget.armor = 0;
    ruptureTarget.status.poison = 2;
    ruptureTarget.status.bleed = 3;
    setUnits([shaman, ruptureTarget]);
    const rupture = shaman.abilities.find(a => a.id === 'rupture');
    const beforeRupture = ruptureTarget.hp;
    apply(shaman, rupture, ruptureTarget);

    const eva = cloneChar('eva', 'player', 'front', 0);
    const evaGrab = eva.abilities.find(a => a.id === 'kiss');

    const actorUnit = cloneChar('smithen', 'player', 'front', 0);
    const actorEnemy = cloneChar('poom', 'enemy', 'front', 0);
    setUnits([actorUnit, actorEnemy]);
    const actorAbility = actorUnit.abilities[0];
    const plan = window.__WANDERERS_DEBUG__.makePlan(actorUnit, actorAbility, actorEnemy, 'player');
    state.plans.push(plan);
    state.currentActionKey = plan.pid;
    renderBattle();
    const actorClassApplied = !!document.querySelector('.tile.currentActor[data-unit-id="smithen"][data-side="player"]');

    return {
      breathCanTargetBackOnly,
      breathLost,
      breathPoison: backOnly.status.poison || 0,
      blockedBleedState,
      hitBleedState,
      armorAfterIceGuard,
      freezeFromBlockedMelee,
      grabName: grab.name,
      grabTargetLost: beforeGrabTargetHp - guardTarget.hp,
      grabTargetBleed: guardTarget.status.bleed || 0,
      grabHeal: dravain.hp - (beforeGrabDravainHp - 3),
      evaGrabName: evaGrab.name,
      faeGrabName: faeGrab.name,
      faeTargetsBackline,
      ruptureLost: beforeRupture - ruptureTarget.hp,
      ruptureBleed: ruptureTarget.status.bleed || 0,
      rupturePoison: ruptureTarget.status.poison || 0,
      actorClassApplied,
      activeActorAnimation: getComputedStyle(document.querySelector('.tile.currentActor[data-unit-id="smithen"][data-side="player"]')).animationName
    };
  });

  expect(result.breathCanTargetBackOnly).toBe(true);
  expect(result.breathLost).toBe(1);
  expect(result.breathPoison).toBe(3);
  expect(result.blockedBleedState.hp).toBe(22);
  expect(result.blockedBleedState.bleed).toBe(4);
  expect(result.hitBleedState.hp).toBe(17);
  expect(result.hitBleedState.bleed).toBe(0);
  expect(result.armorAfterIceGuard).toBe(3);
  expect(result.freezeFromBlockedMelee).toBe(1);
  expect(result.grabName).toBe('Vampiric Grab');
  expect(result.grabTargetLost).toBe(4);
  expect(result.grabTargetBleed).toBe(2);
  expect(result.grabHeal).toBe(2);
  expect(result.evaGrabName).toBe('Vampiric Grab');
  expect(result.faeGrabName).toBe('Fae Portal Grab');
  expect(result.faeTargetsBackline).toBe(true);
  expect(result.ruptureLost).toBe(10);
  expect(result.ruptureBleed).toBe(0);
  expect(result.rupturePoison).toBe(0);
  expect(result.actorClassApplied).toBe(true);
  expect(result.activeActorAnimation).toContain('currentActorLiftSpinV123');
});

test('v126 Duler rules: scare, chains, basic guard, and action-wide hit buffs', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    const dulerDef = cdef('duler');

    const duler = cloneChar('duler', 'player', 'front', 0);
    const frontA = cloneChar('smithen', 'enemy', 'front', 0);
    const frontB = cloneChar('dravain', 'enemy', 'front', 1);
    const backA = cloneChar('bakub', 'enemy', 'back', 1);
    [frontA, frontB, backA].forEach(u => u.armor = 0);
    setUnits([duler, frontA, frontB, backA]);
    const swipe = duler.abilities.find(a => a.id === 'chainSwipe');
    const scare = duler.abilities.find(a => a.id === 'scare');
    const slam = duler.abilities.find(a => a.id === 'chainSlam');
    const guard = duler.abilities.find(a => a.id === 'basicGuard');

    duler.buff.nextAttackDamageV126 = 1;
    duler.buff.poisonHands = 2;
    const beforeSwipe = [frontA.hp, frontB.hp, backA.hp];
    apply(duler, swipe, null);
    const swipeLost = [beforeSwipe[0] - frontA.hp, beforeSwipe[1] - frontB.hp, beforeSwipe[2] - backA.hp];
    const swipeStatuses = {
      aDread: frontA.status.dread || 0,
      bDread: frontB.status.dread || 0,
      aPoison: frontA.status.poison || 0,
      bPoison: frontB.status.poison || 0,
      backPoison: backA.status.poison || 0,
      consumedBonus: duler.buff.nextAttackDamageV126 || 0
    };

    const scareTarget = cloneChar('kku', 'enemy', 'front', 0);
    const backOccupant = cloneChar('bakub', 'enemy', 'back', 1);
    setUnits([duler, scareTarget, backOccupant]);
    apply(duler, scare, scareTarget);
    const scaredPosition = {row: scareTarget.row, col: scareTarget.col};
    const guardMarked = !!state.guardActionsV125?.[`${duler.side}:${duler.id}`];
    endRound();
    const restoredPosition = {row: scareTarget.row, col: scareTarget.col};

    const slamDuler = cloneChar('duler', 'player', 'front', 0);
    const slamFront = cloneChar('smithen', 'enemy', 'front', 0);
    const slamBack = cloneChar('bakub', 'enemy', 'back', 0);
    slamFront.armor = 0;
    slamBack.armor = 0;
    setUnits([slamDuler, slamFront, slamBack]);
    const slamAbility = slamDuler.abilities.find(a => a.id === 'chainSlam');
    const beforeSlam = [slamFront.hp, slamBack.hp];
    apply(slamDuler, slamAbility, slamFront);
    const slamLost = [beforeSlam[0] - slamFront.hp, beforeSlam[1] - slamBack.hp];
    const slamExhaust = [slamFront.status.exhausted || 0, slamBack.status.exhausted || 0];

    const guardDuler = cloneChar('duler', 'player', 'front', 0);
    const attacker = cloneChar('smithen', 'enemy', 'front', 0);
    setUnits([guardDuler, attacker]);
    apply(guardDuler, guardDuler.abilities.find(a => a.id === 'basicGuard'), null);
    const beforeGuardHit = guardDuler.hp;
    damage(attacker, guardDuler, 5, {attack:true, melee:true});
    const guardedLoss = beforeGuardHit - guardDuler.hp;
    const guardBuffAfterHit = guardDuler.buff.basicGuardArmorV126 || 0;
    damage(attacker, guardDuler, 5, {attack:true, melee:true});
    const secondLossTotal = beforeGuardHit - guardDuler.hp;

    const painDuler = cloneChar('duler', 'player', 'front', 0);
    painDuler.armor = 0;
    const painTarget = cloneChar('smithen', 'enemy', 'front', 0);
    painTarget.armor = 0;
    setUnits([painDuler, attacker, painTarget]);
    damage(attacker, painDuler, 1, {attack:true, melee:true});
    const passiveBonus = painDuler.buff.nextAttackDamageV126 || 0;

    const kahro = cloneChar('duler', 'player', 'front', 0);
    const quickTarget = cloneChar('smithen', 'enemy', 'front', 0);
    quickTarget.armor = 0;
    setUnits([kahro, quickTarget]);
    kahro.buff.nextAttackDamageV126 = 1;
    kahro.buff.poisonHands = 2;
    const quick = A('testMulti', 'Test Multi', 1, 0, 'Melee attack. Hit twice for 1 damage.', 'multi', {dmg:1, hits:2, range:'melee'});
    const beforeQuick = quickTarget.hp;
    apply(kahro, quick, quickTarget);

    return {
      dulerExists: !!dulerDef,
      dulerArt: dulerDef?.art,
      abilityNames: dulerDef?.abilities.map(a => a.name),
      swipeLost,
      swipeStatuses,
      scaredPosition,
      restoredPosition,
      guardMarked,
      slamLost,
      slamExhaust,
      guardedLoss,
      guardBuffAfterHit,
      secondLossTotal,
      passiveBonus,
      quickLost: beforeQuick - quickTarget.hp,
      quickPoison: quickTarget.status.poison || 0,
      quickBonusConsumed: kahro.buff.nextAttackDamageV126 || 0
    };
  });

  expect(result.dulerExists).toBe(true);
  expect(result.dulerArt).toContain('assets/duler.png');
  expect(result.abilityNames).toEqual(['Chain Swipe', 'Scare', 'Chain Slam', 'Basic Guard']);
  expect(result.swipeLost).toEqual([5, 5, 0]);
  expect(result.swipeStatuses).toMatchObject({aDread: 1, bDread: 1, aPoison: 2, bPoison: 2, backPoison: 0, consumedBonus: 0});
  expect(result.scaredPosition.row).toBe('back');
  expect(result.scaredPosition.col).not.toBe(1);
  expect(result.restoredPosition).toEqual({row: 'front', col: 0});
  expect(result.guardMarked).toBe(true);
  expect(result.slamLost).toEqual([4, 4]);
  expect(result.slamExhaust).toEqual([1, 1]);
  expect(result.guardedLoss).toBe(0);
  expect(result.guardBuffAfterHit).toBe(0);
  expect(result.secondLossTotal).toBe(3);
  expect(result.passiveBonus).toBe(1);
  expect(result.quickLost).toBe(4);
  expect(result.quickPoison).toBe(4);
  expect(result.quickBonusConsumed).toBe(0);
});

test('v127 polish fixes: Duler/Fuego crops, Dread info, log close, multi-target chain slam, AI buffs, and latest ability text', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null
      });
    }

    renderBuilder();
    const dulerPortraitY = getComputedStyle(document.querySelector('.fighterCard[data-id="duler"] .portrait')).backgroundPositionY;
    const fuegoPortraitY = getComputedStyle(document.querySelector('.fighterCard[data-id="fuego"] .portrait')).backgroundPositionY;

    const duler = cloneChar('duler', 'player', 'front', 0);
    const front = cloneChar('smithen', 'enemy', 'front', 0);
    const back = cloneChar('bakub', 'enemy', 'back', 1);
    front.armor = 0;
    back.armor = 0;
    setUnits([duler, front, back]);
    selectedId = duler.id;
    selectedSide = duler.side;
    pendingAbility = duler.abilities.find(a => a.id === 'chainSlam');
    const actionsBeforeFirstPick = state.actionsLeft;
    plan(front);
    const firstPickStored = !!state.chainSlamPickV127;
    const actionsAfterFirstPick = state.actionsLeft;
    plan(back);
    const chainPlan = state.plans.find(p => p.abilityId === 'chainSlam');
    state.currentActionKey = chainPlan.pid;
    const beforeChain = [front.hp, back.hp];
    apply(duler, duler.abilities.find(a => a.id === 'chainSlam'), front);
    const chainLost = [beforeChain[0] - front.hp, beforeChain[1] - back.hp];

    const maoja = cloneChar('maoja', 'player', 'front', 0);
    const rangedAlly = cloneChar('bakub', 'player', 'back', 1);
    const armoredTarget = cloneChar('kku', 'enemy', 'front', 0);
    armoredTarget.armor = 99;
    setUnits([maoja, rangedAlly, armoredTarget]);
    apply(maoja, maoja.abilities.find(a => a.id === 'hands'), rangedAlly);
    renderBattle();
    const poisonHandsChipVisible = !!document.querySelector('.tile[data-unit-id="bakub"][data-side="player"] .statusChip[data-status="poisonHands"]');
    const testRangedAttack = A('testRanged', 'Test Ranged', 1, 0, 'Ranged attack. Deal 1 damage.', 'damage', {dmg:1, range:'ranged'});
    const beforeArmored = armoredTarget.hp;
    apply(rangedAlly, testRangedAttack, armoredTarget);
    const poisonNoHit = {lost: beforeArmored - armoredTarget.hp, poison: armoredTarget.status.poison || 0};
    endRound();
    armoredTarget.status.poison = 0;
    apply(rangedAlly, testRangedAttack, armoredTarget);
    const poisonAfterRound = armoredTarget.status.poison || 0;

    const eva = cloneChar('eva', 'player', 'front', 0);
    const stabTarget = cloneChar('smithen', 'enemy', 'front', 0);
    stabTarget.armor = 0;
    setUnits([eva, stabTarget]);
    const stab = eva.abilities.find(a => a.id === 'stab');
    const beforeStab = stabTarget.hp;
    apply(eva, stab, stabTarget);
    const crimsonStab = {dmg: stab.dmg, pierce: stab.pierce, lost: beforeStab - stabTarget.hp, bleed: stabTarget.status.bleed || 0};

    const dravain = cloneChar('dravain', 'player', 'front', 0);
    const guardTarget = cloneChar('kku', 'enemy', 'front', 0);
    guardTarget.armor = 0;
    setUnits([dravain, guardTarget]);
    apply(guardTarget, guardTarget.abilities.find(a => a.id === 'guard'), guardTarget);
    const beforeGrab = guardTarget.hp;
    apply(dravain, dravain.abilities.find(a => a.id === 'bash'), guardTarget);
    const vampiricGrabGuardLost = beforeGrab - guardTarget.hp;

    const enemyMaoja = cloneChar('maoja', 'enemy', 'front', 0);
    const enemyAlly = cloneChar('dravain', 'enemy', 'front', 1);
    const playerVictim = cloneChar('smithen', 'player', 'front', 0);
    setUnits([enemyMaoja, enemyAlly, playerVictim]);
    const aiBuffSides = aiValidTargetsV95(enemyMaoja, enemyMaoja.abilities.find(a => a.id === 'hands')).map(u => u.side);

    const dreadUnit = cloneChar('duler', 'player', 'front', 0);
    dreadUnit.status.dread = 1;
    setUnits([dreadUnit, playerVictim]);
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    renderBattle();

    return {
      dulerPortraitY,
      fuegoPortraitY,
      firstPickStored,
      actionsBeforeFirstPick,
      actionsAfterFirstPick,
      chainPlanExtra: chainPlan?.extraTargetId,
      chainLost,
      poisonHandsChipVisible,
      poisonNoHit,
      poisonAfterRound,
      crimsonStab,
      vampiricGrabGuardLost,
      aiBuffSides
    };
  });

  expect(result.dulerPortraitY).toBe('8%');
  expect(result.fuegoPortraitY).toBe('40%');
  expect(result.firstPickStored).toBe(true);
  expect(result.actionsAfterFirstPick).toBe(result.actionsBeforeFirstPick);
  expect(result.chainPlanExtra).toBe('bakub');
  expect(result.chainLost).toEqual([4, 4]);
  expect(result.poisonHandsChipVisible).toBe(true);
  expect(result.poisonNoHit).toEqual({ lost: 0, poison: 2 });
  expect(result.poisonAfterRound).toBe(0);
  expect(result.crimsonStab).toEqual({ dmg: 1, pierce: 2, lost: 1, bleed: 3 });
  expect(result.vampiricGrabGuardLost).toBe(4);
  expect(result.aiBuffSides.every(side => side === 'enemy')).toBe(true);

  await page.locator('.tile[data-unit-id="duler"][data-side="player"] .statusChip[data-status="dread"]').click();
  await expect(page.locator('#infoTitle')).toContainText('Dread');

  await page.locator('#battleLogToggleBtn').click();
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/showLogV101/);
  await page.locator('#battleLogToggleBtn').click();
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/panelClosedV101/);
});

test('v130 final mobile rules: Chain Slam fallback, Dread keyword, delayed judgement, and log x close', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    function setUnits(units){
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units,
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null,
        delayedActionsV96: [],
        delayedActionsV128: [],
        delayedActionsV129: [],
        delayedActionsV130: []
      });
    }

    const duler = cloneChar('duler', 'player', 'front', 0);
    const onlyFront = cloneChar('smithen', 'enemy', 'front', 0);
    onlyFront.armor = 0;
    setUnits([duler, onlyFront]);
    selectedId = duler.id;
    selectedSide = duler.side;
    pendingAbility = duler.abilities.find(a => a.id === 'chainSlam');
    plan(onlyFront);
    const fallbackPlan = state.plans.find(p => p.abilityId === 'chainSlam');
    const fallback = {
      hasPlan: !!fallbackPlan,
      extra: fallbackPlan?.extraTargetId || null,
      pickOpen: !!state.chainSlamPickV127,
      actionsLeft: state.actionsLeft
    };

    const swipeDuler = cloneChar('duler', 'player', 'front', 0);
    const frontA = cloneChar('smithen', 'enemy', 'front', 0);
    const frontB = cloneChar('dravain', 'enemy', 'front', 1);
    const back = cloneChar('bakub', 'enemy', 'back', 0);
    frontA.armor = 0;
    frontB.armor = 0;
    back.armor = 0;
    setUnits([swipeDuler, frontA, frontB, back]);
    apply(swipeDuler, swipeDuler.abilities.find(a => a.id === 'chainSwipe'), null);
    const dread = {
      frontA: frontA.status.dread || 0,
      frontB: frontB.status.dread || 0,
      back: back.status.dread || 0,
      keyword: !!(window.KEYWORDS_V32_SAFE?.dread || KEYWORDS_V32?.dread)
    };

    const hope = cloneChar('hope', 'player', 'back', 1);
    const delayedTarget = cloneChar('smithen', 'enemy', 'front', 0);
    delayedTarget.armor = 0;
    setUnits([hope, delayedTarget]);
    const judgement = hope.abilities.find(a => a.id === 'judgement');
    const delayedBefore = delayedTarget.hp;
    apply(hope, judgement, delayedTarget);
    const delayedImmediate = delayedBefore - delayedTarget.hp;
    const delayedQueued = (state.delayedActionsV130?.length || 0)
      + (state.delayedActionsV129?.length || 0)
      + (state.delayedActionsV128?.length || 0)
      + (state.delayedActionsV96?.length || 0);
    endRound();
    const delayedAfter = delayedBefore - delayedTarget.hp;

    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    renderBattle();

    return { fallback, dread, delayedImmediate, delayedQueued, delayedAfter };
  });

  expect(result.fallback).toEqual({ hasPlan: true, extra: null, pickOpen: false, actionsLeft: 1 });
  expect(result.dread).toEqual({ frontA: 1, frontB: 1, back: 0, keyword: true });
  expect(result.delayedImmediate).toBe(0);
  expect(result.delayedQueued).toBe(1);
  expect(result.delayedAfter).toBe(6);

  await page.locator('#battleLogToggleBtn').click();
  await expect(page.locator('#battleLogCloseBtnV128')).toBeVisible();
  await page.locator('#battleLogCloseBtnV128').click();
  await expect(page.locator('#infoPanelSheet')).toHaveClass(/panelClosedV101/);
});

test('v132 live UI lets Chain Slam pick the second target and renders Dread cleanly', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    const duler = cloneChar('duler', 'player', 'front', 0);
    const front = cloneChar('maoja', 'enemy', 'front', 0);
    const back = cloneChar('kahro', 'enemy', 'back', 0);
    front.armor = 0;
    back.armor = 0;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [duler, front, back],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    selectedId = duler.id;
    selectedSide = duler.side;
    pendingAbility = duler.abilities.find(a => a.id === 'chainSlam');
    renderBattle();
  });

  await page.locator('.tile[data-unit-id="maoja"][data-side="enemy"]').click();
  await expect(page.locator('.tile[data-unit-id="kahro"][data-side="enemy"]')).toHaveClass(/chainSlamSecondTargetV132|chainSlamSecondTargetV135|targetable/);
  await expect(page.locator('#radial')).toHaveClass(/hidden/);
  await page.locator('.tile[data-unit-id="kahro"][data-side="enemy"]').click();

  const planState = await page.evaluate(() => {
    const plan = state.plans.find(p => p.abilityId === 'chainSlam');
    return {
      planTarget: plan?.targetId,
      extraTarget: plan?.extraTargetId,
      pickOpen: !!state.chainSlamPickV127,
      actionsLeft: state.actionsLeft
    };
  });
  expect(planState).toEqual({ planTarget: 'maoja', extraTarget: 'kahro', pickOpen: false, actionsLeft: 1 });

  const keywordHtml = await page.evaluate(() => {
    const duler = cloneChar('duler', 'player', 'front', 0);
    const swipe = duler.abilities.find(a => a.id === 'chainSwipe');
    return renderKeywordText(swipe.desc);
  });
  expect(keywordHtml).toContain('data-keyword="dread"');

  await page.evaluate(() => {
    const target = state.units.find(u => u.id === 'kahro' && u.side === 'enemy');
    target.status.dread = 1;
    renderBattle();
  });
  await page.locator('.tile[data-unit-id="kahro"][data-side="enemy"] .statusChip[data-status="dread"]').click();
  await expect(page.locator('#infoTitle')).toContainText('😨 Dread');
  await expect(page.locator('#infoTitle')).not.toContainText('undefined');
});

test('v136 mobile radial double-tap keeps Chain Slam targeting and Dread spends only 2 AP', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    chosenIds = ['duler', 'fuego', 'zahria'];
    selectedTeam = [
      { id: 'duler', row: 'front', col: 0 },
      { id: 'fuego', row: 'front', col: 1 },
      { id: 'zahria', row: 'back', col: 1 }
    ];
    mode = 'squad';
    startBattle();

    const players = [
      cloneChar('duler', 'player', 'front', 0),
      cloneChar('fuego', 'player', 'front', 1),
      cloneChar('zahria', 'player', 'back', 1)
    ];
    const enemies = [
      cloneChar('kahro', 'enemy', 'back', 0),
      cloneChar('paleya', 'enemy', 'back', 1),
      cloneChar('maoja', 'enemy', 'front', 0)
    ];
    enemies.forEach(u => { u.armor = 0; });
    state.units = [...players, ...enemies];
    state.actionsLeft = 3;
    state.plans = [];
    state.chainSlamPickV127 = null;
    renderBattle();
  });

  await page.locator('.tile[data-unit-id="duler"][data-side="player"]').scrollIntoViewIfNeeded();
  await page.locator('.tile[data-unit-id="duler"][data-side="player"]').click();
  const chainSlamBox = await page.locator('.wheelBtn[data-id="chainSlam"]').boundingBox();
  expect(chainSlamBox).toBeTruthy();
  const chainX = chainSlamBox.x + chainSlamBox.width / 2;
  const chainY = chainSlamBox.y + chainSlamBox.height / 2;

  await page.mouse.click(chainX, chainY);
  await expect(page.locator('#radial')).not.toHaveClass(/hidden/);
  expect(await page.evaluate(() => pendingAbility?.id || null)).toBeNull();

  await page.mouse.click(chainX, chainY);
  await expect(page.locator('#radial')).toHaveClass(/hidden/);
  expect(await page.evaluate(() => ({ selectedId, pending: pendingAbility?.id || null }))).toEqual({
    selectedId: 'duler',
    pending: 'chainSlam'
  });

  await page.locator('.tile[data-unit-id="maoja"][data-side="enemy"]').click();
  await expect(page.locator('.tile[data-unit-id="kahro"][data-side="enemy"]')).toHaveClass(/targetable/);
  await page.evaluate(() => {
    delete state.plans;
  });
  await page.locator('.tile[data-unit-id="kahro"][data-side="enemy"]').click();
  expect(await page.evaluate(() => {
    const plan = state.plans.find(p => p.abilityId === 'chainSlam');
    return { target: plan?.targetId, extra: plan?.extraTargetId, actionsLeft: state.actionsLeft };
  })).toEqual({ target: 'maoja', extra: 'kahro', actionsLeft: 1 });

  const dreadBudget = await page.evaluate(() => {
    const duler = cloneChar('duler', 'player', 'front', 0);
    const enemy = cloneChar('smithen', 'enemy', 'front', 0);
    duler.status.dread = 1;
    window.__WANDERERS_DEBUG__.setState({
      round: 2,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [duler, enemy],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    const guard = duler.abilities.find(a => a.id === 'basicGuard');
    const scare = duler.abilities.find(a => a.id === 'scare');
    const slam = duler.abilities.find(a => a.id === 'chainSlam');
    const heavy = { id: 'heavy', cost: 3 };
    const before = {
      oneAp: isAbilityDisabledByDreadV42(duler, guard),
      twoAp: isAbilityDisabledByDreadV42(duler, slam),
      threeAp: isAbilityDisabledByDreadV42(duler, heavy)
    };
    state.plans.push(makePlan(duler, guard, null, 'player'));
    const afterOne = {
      spent: window.__WANDERERS_DEBUG__.dreadPlannedApV136(duler),
      oneAp: isAbilityDisabledByDreadV42(duler, scare),
      twoAp: isAbilityDisabledByDreadV42(duler, slam)
    };
    state.plans.push(makePlan(duler, scare, enemy, 'player'));
    const afterTwo = {
      spent: window.__WANDERERS_DEBUG__.dreadPlannedApV136(duler),
      oneAp: isAbilityDisabledByDreadV42(duler, guard)
    };
    return { before, afterOne, afterTwo };
  });
  expect(dreadBudget).toEqual({
    before: { oneAp: false, twoAp: false, threeAp: true },
    afterOne: { spent: 1, oneAp: false, twoAp: true },
    afterTwo: { spent: 2, oneAp: true }
  });
});

test('ability runtime matrix keeps every roster ability executable and state sane', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const failures = await page.evaluate(() => {
    const roster = ROSTER;
    const ids = roster.map(c => c.id);
    const fallbackAlly = ids.includes('hope') ? 'hope' : ids[0];
    const fallbackEnemyFront = ids.includes('smithen') ? 'smithen' : ids[0];
    const fallbackEnemyBack = ids.includes('bakub') ? 'bakub' : ids[ids.length - 1];
    const failures = [];

    function setUnitsFor(actorId){
      const actor = cloneChar(actorId, 'player', 'front', 0);
      const ally = cloneChar(fallbackAlly === actorId ? 'dravain' : fallbackAlly, 'player', 'back', 1);
      const enemyFront = cloneChar(fallbackEnemyFront === actorId ? 'dravain' : fallbackEnemyFront, 'enemy', 'front', 0);
      const enemyBack = cloneChar(fallbackEnemyBack === actorId ? 'maoja' : fallbackEnemyBack, 'enemy', 'back', 1);
      for(const u of [actor, ally, enemyFront, enemyBack]){
        u.armor = 0;
        u.status = Object.assign({}, u.status, {bleed: 2, poison: 1, freeze: 1, hypnosis: 1, exposed: 1});
        u.buff = u.buff || {};
      }
      actor.status.flame = 3;
      window.__WANDERERS_DEBUG__.setState({
        round: 1,
        phase: 'planning',
        actions: 3,
        actionsLeft: 3,
        units: [actor, ally, enemyFront, enemyBack],
        plans: [],
        planSeq: 0,
        protects: [],
        dodges: [],
        predicts: [],
        counters: [],
        guarded: {},
        attacked: {},
        currentActionKey: null,
        delayedActionsV96: [],
        delayedActionsV128: [],
        delayedActionsV129: [],
        delayedActionsV130: []
      });
      return actor;
    }

    for(const char of roster){
      for(const sourceAbility of char.abilities || []){
        try{
          const actor = setUnitsFor(char.id);
          const ability = actor.abilities.find(a => a.id === sourceAbility.id) || sourceAbility;
          const legalTargets = targets(actor, ability);
          const target = legalTargets.includes(null) ? null : (legalTargets[0] || null);
          apply(actor, ability, target);
          for(const unit of state.units){
            if(!Number.isFinite(unit.hp) || !Number.isFinite(unit.maxHp)){
              failures.push(`${char.id}.${ability.id}: invalid hp`);
            }
            for(const [key,value] of Object.entries(unit.status || {})){
              if(value != null && value !== false && !Number.isFinite(Number(value))){
                failures.push(`${char.id}.${ability.id}: invalid status ${key}=${value}`);
              }
            }
          }
        }catch(error){
          failures.push(`${char.id}.${sourceAbility.id}: ${error?.message || String(error)}`);
        }
      }
    }

    return failures;
  });

  expect(failures).toEqual([]);
});

test('v139 Exhaust taxes the next queued ability instead of changing speed', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    const target = cloneChar('dravain', 'enemy', 'front', 0);
    smithen.status.exhausted = 1;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 2,
      units: [smithen, target],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    const ability = smithen.abilities.find(a => a.id === 'iceNeedle');
    const speed = totalSpeed(smithen, ability);
    selectedId = smithen.id;
    selectedSide = smithen.side;
    pendingAbility = ability;
    plan(target);
    return {
      speed,
      expectedSpeed: smithen.speed + ability.spd,
      actionsLeft: state.actionsLeft,
      exhausted: smithen.status.exhausted || 0,
      effectiveCost: state.plans[0]?.effectiveCostV139
    };
  });

  expect(result).toMatchObject({
    speed: result.expectedSpeed,
    actionsLeft: 0,
    exhausted: 0,
    effectiveCost: 2
  });
});

test('v139 potion statuses trigger from their stated conditions', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const pako = cloneChar('pako', 'player', 'front', 0);
    const ally = cloneChar('smithen', 'player', 'back', 1);
    const enemy = cloneChar('dravain', 'enemy', 'front', 0);
    ally.armor = 0;
    enemy.armor = 0;
    ally.hp = 10;
    enemy.hp = 20;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [pako, ally, enemy],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });

    addStatus(ally, 'healthPotion', 1);
    damage(enemy, ally, 2, {attack:true, melee:true});
    const afterHealthPotion = ally.hp;

    addStatus(ally, 'armorPotion', 1);
    const beforeArmorHit = ally.hp;
    damage(enemy, ally, 3, {attack:true, melee:true});
    const armorPotionLoss = beforeArmorHit - ally.hp;

    addStatus(pako, 'strengthPotion', 1);
    const pakoBefore = pako.hp;
    const enemyBefore = enemy.hp;
    damage(pako, enemy, 1, {attack:true, melee:false});
    const strength = {pakoLoss:pakoBefore - pako.hp, enemyLoss:enemyBefore - enemy.hp};

    addStatus(pako, 'houseSpecial', 1);
    endRound();
    const houseAfterStart = {hp:pako.hp, armor:pako.armor, bonus:pako.buff.houseSpecialAttackV139 || 0};
    const beforeHouseHit = enemy.hp;
    damage(pako, enemy, 1, {attack:true, melee:false});
    const houseHitLoss = beforeHouseHit - enemy.hp;

    return {
      afterHealthPotion,
      armorPotionLoss,
      strength,
      houseAfterStart,
      houseHitLoss,
      potionTargets: targets(pako, pako.abilities.find(a => a.id === 'healthPotion')).map(u => u.side).sort()
    };
  });

  expect(result.afterHealthPotion).toBe(11);
  expect(result.armorPotionLoss).toBe(1);
  expect(result.strength).toEqual({pakoLoss:2, enemyLoss:4});
  expect(result.houseAfterStart.bonus).toBe(5);
  expect(result.houseHitLoss).toBe(6);
  expect(result.potionTargets).toEqual(['enemy', 'player', 'player']);
});

test('v139 Ivory and Gondar summon token mechanics work', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const ivory = cloneChar('ivory', 'player', 'front', 0);
    const ally = cloneChar('smithen', 'player', 'front', 1);
    const gondar = cloneChar('gondar', 'player', 'back', 0);
    const enemy = cloneChar('dravain', 'enemy', 'front', 0);
    const tree = window.__WANDERERS_DEBUG__.makeTokenV139('sun_tree', 'player', 'back', 2, {growth:3, status:{growth:3}});
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [ivory, ally, gondar, tree, enemy],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });

    loseHpDirect(ally, 99, 'test');
    const skeleton = state.units.find(u => u.tokenType === 'skeleton');

    loseHpDirect(gondar, 99, 'test');

    const boneWallCaster = cloneChar('ivory', 'enemy', 'front', 0);
    state.units.push(boneWallCaster);
    const boneWall = boneWallCaster.abilities.find(a => a.id === 'boneWall');
    apply(boneWallCaster, boneWall, null);
    const wall = state.units.find(u => u.tokenType === 'bone_wall' && u.side === 'enemy');

    return {
      skeleton: skeleton && {hp:skeleton.hp, armor:skeleton.armor, row:skeleton.row, col:skeleton.col, ability:skeleton.abilities[0]?.id},
      gondar: {dead:gondar.dead, hp:gondar.hp, row:gondar.row, col:gondar.col},
      treeDead: tree.dead,
      wall: wall && {hp:wall.hp, row:wall.row, size:wall.size, immune:wall.statusImmune}
    };
  });

  expect(result.skeleton).toMatchObject({hp:3, armor:1, row:'front', col:1, ability:'strike'});
  expect(result.gondar).toMatchObject({dead:false, hp:3, row:'back', col:2});
  expect(result.treeDead).toBe(true);
  expect(result.wall).toMatchObject({hp:8, row:'back', size:'rowBoss', immune:true});
});

test('v141 Delayed Judgement resolves after the round rolls forward', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(async () => {
    const hope = cloneChar('hope', 'player', 'front', 0);
    const target = cloneChar('smithen', 'enemy', 'front', 0);
    target.armor = 0;
    target.abilities = [];
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [hope, target],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null,
      delayedActionsV96: [],
      delayedActionsV128: [],
      delayedActionsV129: [],
      delayedActionsV130: []
    });

    selectedId = hope.id;
    selectedSide = hope.side;
    pendingAbility = hope.abilities.find(a => a.id === 'judgement');
    plan(target);
    await resolveRound();

    return {
      round: state.round,
      targetHp: target.hp,
      targetLost: target.maxHp - target.hp,
      delayedQueues: ['delayedActionsV96','delayedActionsV128','delayedActionsV129','delayedActionsV130']
        .map(key => state[key]?.length || 0)
        .reduce((a,b) => a + b, 0),
      marker: target.status.delayedJudgement || 0
    };
  });

  expect(result.round).toBe(2);
  expect(result.targetLost).toBe(6);
  expect(result.delayedQueues).toBe(0);
  expect(result.marker).toBe(0);
});

test('v141 Mountain Guardians boss spawns cubs and intercepts melee attacks', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    mode = 'boss';
    selectedBossId = 'mountain_guardians';
    selectedTeam = [
      {id:'smithen', row:'front', col:0},
      {id:'dravain', row:'front', col:1},
      {id:'hope', row:'back', col:1}
    ];
    chosenIds = selectedTeam.map(u => u.id);
    startBattle();

    const guardian = state.units.find(u => u.id === 'mountain_guardian');
    const cub = state.units.find(u => u.id === 'mountain_cub_1');
    const attacker = state.units.find(u => u.id === 'smithen' && u.side === 'player');
    attacker.armor = 0;
    guardian.armor = 0;
    cub.armor = 0;

    const before = {guardian:guardian.hp, cub:cub.hp};
    damage(attacker, cub, 5, {attack:true, melee:true});
    const afterIntercept = {guardian:guardian.hp, cub:cub.hp};

    const howl = guardian.abilities.find(a => a.id === 'howl');
    apply(guardian, howl, null);
    const biteTarget = attacker;
    const biteBefore = biteTarget.hp;
    const cubBite = cub.abilities.find(a => a.id === 'cubBite');
    apply(cub, cubBite, biteTarget);

    return {
      enemies: state.units.filter(u => u.side === 'enemy').map(u => ({
        id:u.id,
        row:u.row,
        col:u.col,
        size:u.size || '',
        hp:u.hp,
        armor:u.armor
      })),
      before,
      afterIntercept,
      howlDamageLoss: biteBefore - biteTarget.hp,
      bossName: document.getElementById('enemyName').textContent
    };
  });

  expect(result.enemies).toEqual(expect.arrayContaining([
    expect.objectContaining({id:'mountain_guardian', row:'front', size:'rowBoss', hp:35}),
    expect.objectContaining({id:'mountain_cub_1', row:'back', col:0, armor:0}),
    expect.objectContaining({id:'mountain_cub_2', row:'back', col:2, armor:0})
  ]));
  expect(result.before).toEqual({guardian:40, cub:10});
  expect(result.afterIntercept).toEqual({guardian:35, cub:10});
  expect(result.howlDamageLoss).toBe(6);
  expect(result.bossName).toBe('The Guardian');
});

test('v142 Sun Tree is status immune and next attack buffs are visible', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const tree = window.__WANDERERS_DEBUG__.makeTokenV139('sun_tree', 'player', 'back', 1, {growth:2, status:{growth:2}});
    const ally = cloneChar('smithen', 'player', 'front', 0);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actions: 3,
      actionsLeft: 3,
      units: [tree, ally, cloneChar('dravain', 'enemy', 'front', 0)],
      plans: [],
      planSeq: 0,
      protects: [],
      dodges: [],
      predicts: [],
      counters: [],
      guarded: {},
      attacked: {},
      currentActionKey: null
    });
    addStatus(tree, 'poison', 4);
    applyStatusFrom(ally, tree, 'bleed', 3);

    ally.buff = ally.buff || {};
    ally.buff.nextAttackDamageV126 = 2;
    ally.buff.bloodInfusion = {bonus:3, bleed:3};
    renderBattle();

    const allyTile = document.querySelector('.tile[data-unit-id="smithen"][data-side="player"]');
    return {
      immune: tree.statusImmune,
      poison: tree.status.poison || 0,
      bleed: tree.status.bleed || 0,
      growth: tree.status.growth,
      buffAmount: window.__WANDERERS_DEBUG__.nextAttackBuffAmountV142(ally),
      hasBuffChip: !!allyTile?.querySelector('[data-status="nextAttackBuff"]')
    };
  });

  expect(result).toMatchObject({
    immune: true,
    poison: 0,
    bleed: 0,
    growth: 2,
    buffAmount: 5,
    hasBuffChip: true
  });
});

test('v142 Mountain Guardians starts through the real arrange screen button path', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    chosenIds = ['ivory','gondar','pako'];
    selectedTeam = [
      {id:'ivory', row:'front', col:1},
      {id:'gondar', row:'back', col:0},
      {id:'pako', row:'back', col:1}
    ];
    builderStep = 'arrange';
    renderBuilder();
  });
  await page.click('#bossMode');
  await page.click('#bossMountainGuardiansBtn');
  if(await page.locator('#nextBtn:visible').count()){
    await page.click('#nextBtn');
  }

  const result = await page.evaluate(() => ({
    builderHidden: document.getElementById('builder').classList.contains('hidden'),
    battleHidden: document.getElementById('battle').classList.contains('hidden'),
    enemyName: document.getElementById('enemyName').textContent,
    enemyIds: window.__WANDERERS_DEBUG__.getState().units.filter(u => u.side === 'enemy').map(u => u.id).sort()
  }));

  expect(result).toEqual({
    builderHidden: true,
    battleHidden: false,
    enemyName: 'The Guardian',
    enemyIds: ['mountain_cub_1','mountain_cub_2','mountain_guardian']
  });
});

test('v143 Start Battle capture route starts Mountain Guardians even if onclick is overwritten', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    chosenIds = ['maoja','gondar','pako'];
    selectedTeam = [
      {id:'maoja', row:'front', col:0},
      {id:'pako', row:'front', col:2},
      {id:'gondar', row:'back', col:1}
    ];
    builderStep = 'arrange';
    mode = 'boss';
    selectedBossId = 'mountain_guardians';
    renderBuilder();
    document.getElementById('nextBtn').onclick = ev => {
      ev.preventDefault();
      ev.stopPropagation();
    };
  });

  await page.getByRole('button', {name:'Start Battle'}).click();

  const result = await page.evaluate(() => ({
    builderHidden: document.getElementById('builder').classList.contains('hidden'),
    battleHidden: document.getElementById('battle').classList.contains('hidden'),
    enemyName: document.getElementById('enemyName').textContent,
    enemyIds: window.__WANDERERS_DEBUG__.getState().units.filter(u => u.side === 'enemy').map(u => u.id).sort()
  }));

  expect(result).toEqual({
    builderHidden: true,
    battleHidden: false,
    enemyName: 'The Guardian',
    enemyIds: ['mountain_cub_1','mountain_cub_2','mountain_guardian']
  });
});

test('v144 Start Battle starts on pointer down before click handlers can swallow it', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    chosenIds = ['maoja','gondar','pako'];
    selectedTeam = [
      {id:'maoja', row:'front', col:0},
      {id:'pako', row:'front', col:2},
      {id:'gondar', row:'back', col:1}
    ];
    builderStep = 'arrange';
    mode = 'boss';
    selectedBossId = 'mountain_guardians';
    renderBuilder();
    document.addEventListener('click', ev => {
      if(ev.target?.closest?.('#nextBtn')){
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
    }, true);
  });

  const box = await page.locator('#nextBtn').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.up();

  const result = await page.evaluate(() => ({
    builderHidden: document.getElementById('builder').classList.contains('hidden'),
    battleHidden: document.getElementById('battle').classList.contains('hidden'),
    enemyName: document.getElementById('enemyName').textContent
  }));

  expect(result).toEqual({
    builderHidden: true,
    battleHidden: false,
    enemyName: 'The Guardian'
  });
});

test('v145 Mountain Guardians boss card starts directly from arrange screen', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    chosenIds = ['maoja','gondar','pako'];
    selectedTeam = [
      {id:'maoja', row:'front', col:0},
      {id:'pako', row:'front', col:2},
      {id:'gondar', row:'back', col:1}
    ];
    builderStep = 'arrange';
    renderBuilder();
  });

  await page.getByRole('button', {name:'Boss Fight'}).click();
  await page.getByRole('button', {name:/Mountain Guardians/}).click();

  const result = await page.evaluate(() => ({
    builderHidden: document.getElementById('builder').classList.contains('hidden'),
    battleHidden: document.getElementById('battle').classList.contains('hidden'),
    enemyName: document.getElementById('enemyName').textContent,
    enemyIds: window.__WANDERERS_DEBUG__.getState().units.filter(u => u.side === 'enemy').map(u => u.id).sort()
  }));

  expect(result).toEqual({
    builderHidden: true,
    battleHidden: false,
    enemyName: 'The Guardian',
    enemyIds: ['mountain_cub_1','mountain_cub_2','mountain_guardian']
  });
});

test('v146 Mountain Guardians selection normalizes arranged team and starts battle', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  await page.evaluate(() => {
    chosenIds = ['maoja','gondar','pako'];
    selectedTeam = [
      {id:'maoja', row:'front', col:0},
      {id:'pako', row:'front', col:2}
    ];
    builderStep = 'arrange';
    renderBuilder();
  });

  await page.getByRole('button', {name:'Boss Fight'}).click();
  await page.getByRole('button', {name:/Mountain Guardians/}).click();

  const result = await page.evaluate(() => ({
    builderHidden: document.getElementById('builder').classList.contains('hidden'),
    battleHidden: document.getElementById('battle').classList.contains('hidden'),
    enemyName: document.getElementById('enemyName').textContent,
    playerIds: window.__WANDERERS_DEBUG__.getState().units.filter(u => u.side === 'player').map(u => u.id).sort(),
    enemyIds: window.__WANDERERS_DEBUG__.getState().units.filter(u => u.side === 'enemy').map(u => u.id).sort()
  }));

  expect(result).toEqual({
    builderHidden: true,
    battleHidden: false,
    enemyName: 'The Guardian',
    playerIds: ['gondar','maoja','pako'],
    enemyIds: ['mountain_cub_1','mountain_cub_2','mountain_guardian']
  });
});

test('v153 Sun Blast damages row-sized Guardian boss as well as cubs', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const gondar = cloneChar('gondar', 'player', 'back', 1);
    const tree = window.__WANDERERS_DEBUG__.makeTokenV139('sun_tree', 'player', 'front', 0, {growth:3, status:{growth:3}});
    const enemies = window.__WANDERERS_DEBUG__.mountainGuardiansV141();
    for (const enemy of enemies) enemy.armor = 0;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      units: [gondar, tree, ...enemies],
      plans: [],
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });

    const blast = gondar.abilities.find(a => a.id === 'blast');
    const before = Object.fromEntries(enemies.map(u => [u.id, u.hp]));
    apply(gondar, blast, null);
    const after = Object.fromEntries(enemies.map(u => [u.id, u.hp]));
    return {before, after};
  });

  expect(result.before).toEqual({
    mountain_cub_1: 10,
    mountain_cub_2: 10,
    mountain_guardian: 40
  });
  expect(result.after).toEqual({
    mountain_cub_1: 7,
    mountain_cub_2: 7,
    mountain_guardian: 37
  });
});

test('v153 melee attacks retarget to a new front-row unit at resolution time', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const [cub1, cub2, guardian] = window.__WANDERERS_DEBUG__.mountainGuardiansV141();
    const pako = cloneChar('pako', 'player', 'back', 1);
    pako.armor = 0;
    const tree = window.__WANDERERS_DEBUG__.makeTokenV139('sun_tree', 'player', 'front', 0, {growth:1, status:{growth:1}});
    tree.armor = 0;
    window.__WANDERERS_DEBUG__.setState({
      round: 12,
      phase: 'resolve',
      units: [guardian, cub1, cub2, pako, tree],
      plans: [],
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });

    const bite = guardian.abilities.find(a => a.id === 'bite');
    const before = {pako:pako.hp, tree:tree.hp};
    apply(guardian, bite, pako);
    const after = {pako:pako.hp, tree:tree.hp, treeDead:!!tree.dead};
    return {before, after};
  });

  expect(result.before).toEqual({pako:18, tree:4});
  expect(result.after.pako).toBe(18);
  expect(result.after.tree).toBeLessThan(4);
});

test('v154 Scare cannot move a row-sized Guardian into an occupied cub row', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const duler = cloneChar('duler', 'player', 'front', 0);
    const [cub1, cub2, guardian] = window.__WANDERERS_DEBUG__.mountainGuardiansV141();
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actionsLeft: 3,
      actionsMax: 3,
      units: [duler, guardian, cub1, cub2],
      plans: [],
      planSeq: 0,
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });

    const scare = duler.abilities.find(a => a.id === 'scare');
    apply(duler, scare, guardian);
    return {
      guardianRow: guardian.row,
      guardianCol: guardian.col,
      cubRows: [cub1.row, cub2.row]
    };
  });

  expect(result.guardianRow).toBe('front');
  expect(result.guardianCol).toBe(0);
  expect(result.cubRows).toEqual(['back','back']);
});

test('v155 row-sized units stay inside mobile battle boards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const [cub1, cub2, guardian] = window.__WANDERERS_DEBUG__.mountainGuardiansV141();
    const duler = cloneChar('duler', 'player', 'front', 0);
    const gondar = cloneChar('gondar', 'player', 'front', 1);
    const fuego = cloneChar('fuego', 'player', 'back', 1);
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actionsLeft: 3,
      actionsMax: 3,
      units: [guardian, cub1, cub2, duler, gondar, fuego],
      plans: [],
      planSeq: 0,
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });
    document.querySelector('#builder')?.classList.add('hidden');
    document.querySelector('#battle')?.classList.remove('hidden');
    document.body.classList.add('inBattleV98', 'mobileLayoutV52');
    renderBattle();

    const enemyBoard = document.querySelector('#enemyBoard');
    const playerBoard = document.querySelector('#playerBoard');
    const rowBossTile = enemyBoard.querySelector('.rowBossTile');
    const cubTiles = [...enemyBoard.querySelectorAll('.row > .tile:not(.empty)')];
    const er = enemyBoard.getBoundingClientRect();
    const pr = playerBoard.getBoundingClientRect();
    const br = rowBossTile.getBoundingClientRect();
    const cr = cubTiles.map(tile => tile.getBoundingClientRect());
    return {
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      boardWidth: er.width,
      bossWidth: br.width,
      bossInsideX: br.left >= er.left - 1 && br.right <= er.right + 1,
      bossInsideY: br.top >= er.top - 1 && br.bottom <= er.bottom + 1,
      cubInsideX: cr.every(r => r.left >= er.left - 1 && r.right <= er.right + 1),
      boardsSeparated: er.bottom <= pr.top + 1
    };
  });

  expect(result.overflowX).toBeLessThanOrEqual(4);
  expect(result.bossWidth).toBeLessThanOrEqual(result.boardWidth + 1);
  expect(result.bossInsideX).toBe(true);
  expect(result.bossInsideY).toBe(true);
  expect(result.cubInsideX).toBe(true);
  expect(result.boardsSeparated).toBe(true);
});

test('v156 Duler armor and speed wording are clear', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const dulerDef = cdef('duler');
    const duler = cloneChar('duler', 'player', 'front', 0);
    const swipe = duler.abilities.find(a => a.id === 'chainSwipe');
    const scare = duler.abilities.find(a => a.id === 'scare');
    const swipeSpeed = speedBreakdownV122(duler, swipe);
    const scareSpeed = speedBreakdownV122(duler, scare);
    return {
      rosterArmor: dulerDef.armor,
      cloneArmor: duler.armor,
      swipeTotal: totalSpeed(duler, swipe),
      swipeLabel: swipeSpeed.label,
      swipeDetail: swipeSpeed.detail,
      scareLabel: scareSpeed.label,
      scareDetail: scareSpeed.detail
    };
  });

  expect(result.rosterArmor).toBe(1);
  expect(result.cloneArmor).toBe(1);
  expect(result.swipeTotal).toBe(3);
  expect(result.swipeLabel).toBe('Final Speed 3');
  expect(result.swipeDetail).toContain('Final speed for queue order');
  expect(result.swipeDetail).toContain('base 4');
  expect(result.swipeDetail).toContain('ability -1');
  expect(result.swipeDetail).toContain('= 3');
  expect(result.swipeDetail).toContain('Higher speed resolves first');
  expect(result.scareLabel).toBe('Guard Speed');
  expect(result.scareDetail).toContain('resolves before all normal-speed actions');
});

test('v157 ability brief always uses final runtime speed and math', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const zahria = cloneChar('zahria', 'player', 'front', 0);
    const mist = zahria.abilities.find(a => a.id === 'mist');
    const mass = zahria.abilities.find(a => a.id === 'mass');
    const mistSpeed = speedBreakdownV122(zahria, mist);
    const massSpeed = speedBreakdownV122(zahria, mass);
    return {
      mistFinal: totalSpeed(zahria, mist),
      mistLabel: mistSpeed.label,
      mistDetail: mistSpeed.detail,
      massLabel: massSpeed.label,
      massDesc: mass.desc
    };
  });

  expect(result.mistFinal).toBe(4);
  expect(result.mistLabel).toBe('Final Speed 4');
  expect(result.mistDetail).toContain('base 4');
  expect(result.mistDetail).toContain('ability +0');
  expect(result.mistDetail).toContain('= 4');
  expect(result.massLabel).toBe('Final Speed 7');
  expect(result.massDesc).not.toContain('Speed 7');
});

test('v158 bleed and freeze payoffs use melee type where requested', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const dravain = cloneChar('dravain', 'player', 'front', 0);
    const eva = cloneChar('eva', 'player', 'front', 0);
    const smithen = cloneChar('smithen', 'player', 'front', 0);
    const enemyFront = cloneChar('poom', 'enemy', 'front', 0);
    const enemyBack = cloneChar('bakub', 'enemy', 'back', 1);
    enemyFront.armor = 0;
    enemyBack.armor = 0;
    enemyBack.status.bleed = 3;
    enemyBack.status.freeze = 2;
    const claim = dravain.abilities.find(a => a.id === 'claim');
    const bite = eva.abilities.find(a => a.id === 'bite');
    const shatter = smithen.abilities.find(a => a.id === 'shatter');

    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actionsLeft: 3,
      actionsMax: 3,
      units: [dravain, eva, smithen, enemyFront, enemyBack],
      plans: [],
      planSeq: 0,
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });

    return {
      claim: {range: claim.range, melee: !!claim.melee, bonus: claim.bonus, desc: claim.desc},
      bite: {range: bite.range, melee: !!bite.melee, backlineReach: !!bite.backlineReach, canTargetBack: targets(eva, bite).includes(enemyBack), desc: bite.desc},
      shatter: {range: shatter.range, melee: !!shatter.melee, backlineReach: !!shatter.backlineReach, canTargetBack: targets(smithen, shatter).includes(enemyBack), desc: shatter.desc}
    };
  });

  expect(result.claim).toMatchObject({range:'melee', melee:true, bonus:4});
  expect(result.claim.desc).toContain('removed Bleed +4');
  expect(result.bite).toMatchObject({range:'melee', melee:true, backlineReach:true, canTargetBack:true});
  expect(result.shatter).toMatchObject({range:'melee', melee:true, backlineReach:true, canTargetBack:true});
});

test('v159 stale Poom mass redirect markers do not steal normal front-line attacks', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const kku = cloneChar('kku', 'player', 'front', 0);
    const poom = cloneChar('poom', 'enemy', 'back', 1);
    const frontTarget = cloneChar('maoja', 'enemy', 'front', 0);
    frontTarget.armor = 0;
    poom.armor = 0;
    kku.buff = {
      poomRedirectTargetId: poom.id,
      poomRedirectTargetSide: poom.side,
      poomRedirectSource: 'Guard Mind'
    };

    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actionsLeft: 3,
      actionsMax: 3,
      units: [kku, frontTarget, poom],
      plans: [],
      planSeq: 0,
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });

    const slam = kku.abilities.find(a => a.id === 'slam');
    const frontBefore = frontTarget.hp;
    const poomBefore = poom.hp;
    apply(kku, slam, frontTarget);

    return {
      frontLost: frontBefore - frontTarget.hp,
      poomLost: poomBefore - poom.hp,
      markerCleared: !kku.buff.poomRedirectTargetId,
      log: state.log.join('\n')
    };
  });

  expect(result.frontLost).toBeGreaterThan(0);
  expect(result.poomLost).toBe(0);
  expect(result.markerCleared).toBe(true);
  expect(result.log).not.toMatch(/redirected to Poom/i);
});

test('v162 adventure metadata normalizes current rosters and legal ability pool', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const dbg = window.__WANDERERS_DEBUG__;
    const pool = dbg.ADVENTURE_POOL_V162 || [];
    const byKey = key => pool.find(a => a.advKey === key);
    return {
      v162: dbg.VERSION_V162,
      v164: dbg.adventureMetadataAbsoluteFinalV164,
      poolCount: pool.length,
      smithenAbilities: cdef('smithen').abilities.map(a => a.name),
      smithenCore: dbg.coreKeysForCharV162('smithen'),
      bahl: {
        name: cdef('shaman').name,
        hp: cdef('shaman').hp,
        armor: cdef('shaman').armor,
        core: dbg.coreKeysForCharV162('shaman'),
        redBleed: cdef('shaman').abilities.find(a => a.id === 'redEclipse')?.bleed
      },
      duler: {
        armor: cdef('duler').armor,
        chainSwipeOwnerOnly: cdef('duler').abilities.find(a => a.id === 'chainSwipe')?.learn?.ownerOnly,
        chainSlamOwnerOnly: cdef('duler').abilities.find(a => a.id === 'chainSlam')?.learn?.ownerOnly
      },
      fuego: {
        className: cdef('fuego').class,
        prof: cdef('fuego').prof,
        hp: cdef('fuego').hp,
        armor: cdef('fuego').armor,
        stokeCost: cdef('fuego').abilities.find(a => a.id === 'stoke')?.cost,
        stokeStacks: cdef('fuego').abilities.find(a => a.id === 'stoke')?.stacks
      },
      basicGuardLegalForSmithen: dbg.abilityLegalForV162(cdef('smithen'), byKey('basic_guard')),
      chainSwipeLegalForKku: dbg.abilityLegalForV162(cdef('kku'), byKey('chain_swipe'))
    };
  });

  expect(result.v162).toBe('v162');
  expect(result.v164).toBe(true);
  expect(result.poolCount).toBeGreaterThanOrEqual(60);
  expect(result.smithenAbilities).toEqual(['Shatter Shot', 'Frost Pin', 'Ice Needle', 'Dodge']);
  expect(result.smithenCore).toEqual(['shatter_shot', 'frost_pin']);
  expect(result.bahl).toMatchObject({
    name: 'Bahl',
    hp: 16,
    armor: 1,
    core: ['red_eclipse', 'demon_rupture'],
    redBleed: 4
  });
  expect(result.duler).toMatchObject({armor: 1, chainSwipeOwnerOnly: true, chainSlamOwnerOnly: true});
  expect(result.fuego).toMatchObject({className: 'sorcerer', hp: 18, armor: 1, stokeCost: 2, stokeStacks: 3});
  expect(result.fuego.prof).toContain('dragon');
  expect(result.fuego.prof).toContain('firecraft');
  expect(result.basicGuardLegalForSmithen).toBe(true);
  expect(result.chainSwipeLegalForKku).toBe(false);
});

test('v162 adventure starts from core abilities and scales enemy rosters', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const dbg = window.__WANDERERS_DEBUG__;
    const run = dbg.adventureRunV162;
    run.active = true;
    run.battle = 1;
    run.miniBoss = 'mountain_guardians';
    run.finalBoss = 'world_toad';
    run.team = ['smithen', 'poom', 'fuego'].map(charId => ({charId, abilities: dbg.coreKeysForCharV162(charId)}));
    mode = 'adventure';
    builderStep = 'arrange';
    selectedTeam = [
      {id:'smithen', row:'front', col:0},
      {id:'poom', row:'front', col:2},
      {id:'fuego', row:'back', col:1}
    ];
    startBattle();
    const battle1 = {
      playerAbilityCounts: state.units.filter(u => u.side === 'player').map(u => u.abilities.length),
      enemyAbilityCounts: state.units.filter(u => u.side === 'enemy').map(u => u.abilities.length)
    };
    run.battle = 8;
    startBattle();
    const battle8 = {
      enemyAbilityCounts: state.units.filter(u => u.side === 'enemy').map(u => u.abilities.length)
    };
    return {battle1, battle8};
  });

  expect(result.battle1.playerAbilityCounts).toEqual([2, 2, 2]);
  expect(result.battle1.enemyAbilityCounts.every(n => n <= 2)).toBe(true);
  expect(result.battle8.enemyAbilityCounts.every(n => n >= 4)).toBe(true);
});

test('v162 Red Eclipse marks each enemy before offensive resolution', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const bahl = cloneChar('shaman', 'player', 'front', 0);
    const enemy = cloneChar('kku', 'enemy', 'front', 0);
    const target = cloneChar('dravain', 'player', 'front', 1);
    target.armor = 0;
    enemy.armor = 0;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actionsLeft: 3,
      actionsMax: 3,
      units: [bahl, enemy, target],
      plans: [],
      planSeq: 0,
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });
    apply(bahl, bahl.abilities.find(a => a.id === 'redEclipse'), bahl);
    apply(enemy, enemy.abilities.find(a => a.id === 'slam'), target);
    return {
      enemyBleed: enemy.status.bleed || 0,
      enemyDread: enemy.status.dread || 0,
      targetLostLife: target.maxHp - target.hp
    };
  });

  expect(result.enemyBleed).toBeGreaterThanOrEqual(4);
  expect(result.enemyDread).toBeGreaterThanOrEqual(1);
  expect(result.targetLostLife).toBeGreaterThan(0);
});

test('v162 Poom Mesmer Roar redirects hypnotised enemy offensive abilities for this turn only', async ({ page }) => {
  await page.goto('/index.html?debug=1');

  const result = await page.evaluate(() => {
    const poom = cloneChar('poom', 'player', 'front', 0);
    const ally = cloneChar('smithen', 'player', 'front', 1);
    const enemy = cloneChar('kku', 'enemy', 'front', 0);
    poom.armor = 0;
    ally.armor = 0;
    enemy.armor = 0;
    enemy.status.hypnosis = 1;
    window.__WANDERERS_DEBUG__.setState({
      round: 1,
      phase: 'planning',
      actionsLeft: 3,
      actionsMax: 3,
      units: [poom, ally, enemy],
      plans: [],
      planSeq: 0,
      log: [],
      queue: [],
      protects: [],
      guarded: {},
      attacked: {},
      dodges: [],
      predicts: [],
      counters: [],
      canceledActionKeys: [],
      actionEvents: []
    });
    apply(poom, poom.abilities.find(a => a.id === 'roar'), poom);
    const poomBefore = poom.hp;
    const allyBefore = ally.hp;
    apply(enemy, enemy.abilities.find(a => a.id === 'slam'), ally);
    const redirected = {poomLost: poomBefore - poom.hp, allyLost: allyBefore - ally.hp};
    endRound();
    const poomBeforeNext = poom.hp;
    const allyBeforeNext = ally.hp;
    apply(enemy, enemy.abilities.find(a => a.id === 'slam'), ally);
    return {
      redirected,
      nextTurn: {poomLost: poomBeforeNext - poom.hp, allyLost: allyBeforeNext - ally.hp}
    };
  });

  expect(result.redirected.poomLost).toBeGreaterThan(0);
  expect(result.redirected.allyLost).toBe(0);
  expect(result.nextTurn.allyLost).toBeGreaterThan(0);
});
