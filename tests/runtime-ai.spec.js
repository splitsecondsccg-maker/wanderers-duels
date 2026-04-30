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
  expect(result.payoffHypnosisAfter).toBe(0);
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
  expect(result.blizzard).toEqual([
    { freeze: 2, exhausted: 1 },
    { freeze: 2, exhausted: 1 }
  ]);
  expect(result.finalBite).toEqual({ lost: 7, bleed: 0, healed: 0 });
  expect(result.mindToxinBaseLost).toBe(0);
  expect(result.mindToxinPayoff).toEqual({ lost: 5, poison: 2, hypnosis: 0 });
  expect(result.revengeNoPrior).toEqual({ selfLost: 2, targetLost: 5 });
  expect(result.revengePriorTargetLost).toBe(8);
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
