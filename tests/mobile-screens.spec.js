const { test, expect } = require('@playwright/test');
const path = require('path');

const devices = [
  { name: 'phone-390x844', width: 390, height: 844 },
  { name: 'phone-412x915', width: 412, height: 915 },
  { name: 'phone-430x932', width: 430, height: 932 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'narrow-807x1277-force-mobile', width: 807, height: 1277, forceMobile: true }
];

const states = [
  { name: 'character-select', action: async page => {} },
  { name: 'battle', action: async page => { await page.evaluate(() => window.qaOpenBattle()); } },
  { name: 'radial', action: async page => { await page.evaluate(() => window.qaOpenRadial()); } },
  { name: 'resolution', action: async page => { await page.evaluate(() => window.qaOpenResolution()); } }
];

for (const device of devices) {
  test.describe(device.name, () => {
    test.use({ viewport: { width: device.width, height: device.height }, isMobile: true, hasTouch: true });
    for (const state of states) {
      test(`${device.name}-${state.name}`, async ({ page }) => {
        if (device.forceMobile) {
          await page.addInitScript(() => localStorage.setItem('splitSecondsMobileMode', '1'));
        }
        await page.goto('/index.html?mobile=1&debug=1');
        await page.waitForTimeout(350);
        await state.action(page);
        await page.waitForTimeout(550);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(4);
        const shell = await page.evaluate((stateName) => {
          const builder = document.querySelector('#builder');
          const battle = document.querySelector('#battle');
          const fighterGrid = document.querySelector('#fighterGrid');
          const chosenStrip = document.querySelector('#chosenStrip');
          return {
            pageScrollSlack: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight,
            builderVisible: builder && getComputedStyle(builder).display !== 'none' && !builder.classList.contains('hidden'),
            battleVisible: battle && getComputedStyle(battle).display !== 'none' && !battle.classList.contains('hidden'),
            rosterScrollsInternally: stateName !== 'character-select' || !!fighterGrid && fighterGrid.scrollHeight > fighterGrid.clientHeight && getComputedStyle(fighterGrid).overflowY !== 'visible',
            emptyChosenStripCollapsed: stateName !== 'character-select' || !!chosenStrip && chosenStrip.children.length > 0 || !chosenStrip || chosenStrip.getBoundingClientRect().height < 2
          };
        }, state.name);
        expect(shell.pageScrollSlack).toBeLessThanOrEqual(4);
        if (state.name === 'character-select') {
          expect(shell.builderVisible).toBe(true);
          expect(shell.battleVisible).toBe(false);
          expect(shell.rosterScrollsInternally).toBe(true);
          expect(shell.emptyChosenStripCollapsed).toBe(true);
        } else {
          expect(shell.battleVisible).toBe(true);
          expect(shell.builderVisible).toBe(false);
        }
        if (state.name !== 'character-select') {
          const visibleArt = await page.evaluate(() => {
            const tile = document.querySelector('.tile:not(.empty)');
            const art = tile?.querySelector('.art');
            if (!tile || !art) return false;
            const tileBox = tile.getBoundingClientRect();
            const artBox = art.getBoundingClientRect();
            const style = getComputedStyle(art);
            return tileBox.height > 90 &&
              artBox.height > 80 &&
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              Number(style.opacity) > 0;
          });
          expect(visibleArt).toBe(true);
        }
        if (state.name === 'resolution') {
          const readableSheet = await page.evaluate(() => {
            const card = document.querySelector('.resolutionOverlay:not(.hidden) .resolveCard');
            if (!card) return false;
            const box = card.getBoundingClientRect();
            const events = [...card.querySelectorAll('.resolveEvent')];
            const collision = events.some((event, index) => {
              const next = events[index + 1];
              if (!next) return false;
              return event.getBoundingClientRect().bottom > next.getBoundingClientRect().top - 1;
            });
            return box.height >= 220 && box.width <= window.innerWidth - 8 && !collision;
          });
          expect(readableSheet).toBe(true);
        }
        await page.screenshot({ path: path.join('qa-screenshots', `${device.name}-${state.name}.png`), fullPage: false });
      });
    }
  });
}
