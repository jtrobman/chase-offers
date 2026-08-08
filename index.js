async function clickAllOffersAllAccounts() {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function isVisible(element) {
    if (!element) return false;
    if (element.tagName === 'MDS-SELECT-OPTION') return !element.hidden;

    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.getClientRects().length > 0;
  }

  function getText(element) {
    return [
      element?.getAttribute?.('label'),
      element?.getAttribute?.('aria-label'),
      element?.innerText,
      element?.textContent
    ].filter(Boolean)
      .map(text => text.replace(/\s+/g, ' ').trim())
      .find(Boolean) || '';
  }

  // MDS components render into open shadow roots. Walking the tree is the
  // expensive part, so it happens once per lookup and every selector is then run
  // against the collected roots.
  function collectShadowRoots(root = document, depth = 0, found = []) {
    if (depth >= 4) return found;

    for (const host of root.querySelectorAll('*')) {
      if (host.shadowRoot) {
        found.push(host.shadowRoot);
        collectShadowRoots(host.shadowRoot, depth + 1, found);
      }
    }

    return found;
  }

  // Returns matches for the FIRST selector that yields any, so overlapping
  // fallbacks can never surface the same element twice. The shadow-DOM pass
  // applies the SAME scoped selectors across shadow boundaries rather than
  // widening them, and only runs when the light DOM turns up nothing.
  // A prefix/substring fallback can match both a tile and a child of that tile.
  // Keeping only the outermost match avoids clicking the same offer twice.
  function outermost(elements) {
    return elements.filter(element =>
      !elements.some(other => other !== element && other.contains(element)));
  }

  function findAllVisible(selectors) {
    for (const selector of selectors) {
      const matches = Array.from(document.querySelectorAll(selector)).filter(isVisible);
      if (matches.length) return outermost(matches);
    }

    const shadowRoots = collectShadowRoots();

    for (const selector of selectors) {
      const matches = [...new Set(shadowRoots.flatMap(root =>
        Array.from(root.querySelectorAll(selector))))].filter(isVisible);
      if (matches.length) return outermost(matches);
    }

    return [];
  }

  // Chase renames these controls periodically; each entry stays scoped to the
  // account selector itself rather than matching generic comboboxes.
  const ACCOUNT_SELECTOR_SELECTORS = [
    '#select-credit-card-account',
    '[data-testid="select-credit-card-account"]',
    'mds-select[id^="select-credit-card"]',
    'mds-select[data-testid^="select-credit-card"]',
    'mds-select[id*="account"]',
    'mds-select[data-testid*="account"]',
    '[role="combobox"][data-testid*="account"]'
  ];

  const ACCOUNT_OPTION_SELECTORS = [
    '[role="option"][data-testid^="user-account-option-"]',
    '[role="option"][data-testid*="account-option"]'
  ];

  const OFFER_TILE_SELECTORS = [
    '[role="button"][data-testid="commerce-tile"]',
    '[data-testid="commerce-tile"]',
    '[data-testid^="commerce-tile"]',
    '[role="button"][data-testid*="offer-tile"]'
  ];

  function getDropdown() {
    return findAllVisible(ACCOUNT_SELECTOR_SELECTORS)[0] || null;
  }

  // The listbox is often rendered outside the dropdown, linked by aria-controls/owns.
  function getLinkedListbox(dropdown) {
    const id = dropdown?.getAttribute('aria-controls') || dropdown?.getAttribute('aria-owns');
    return id ? document.getElementById(id) : null;
  }

  function getAccountOptions(dropdown) {
    // Scoped to the dropdown (and its shadow root / linked listbox), so a bare
    // `mds-select-option` here can't pick up options from an unrelated select.
    const scopes = [dropdown, dropdown?.shadowRoot, getLinkedListbox(dropdown)].filter(Boolean);
    const scopedOptions = scopes.flatMap(scope =>
      Array.from(scope.querySelectorAll('mds-select-option, [role="option"]')));

    return [...new Set([...scopedOptions, ...findAllVisible(ACCOUNT_OPTION_SELECTORS)])]
      .filter(option => option.getAttribute('inactive') !== 'true');
  }

  async function waitForAccountSelector() {
    for (let i = 0; i < 40; i++) {
      const dropdown = getDropdown();
      if (dropdown) return dropdown;
      await sleep(250);
    }

    return null;
  }

  async function openAccountSelector(dropdown) {
    let options = getAccountOptions(dropdown).filter(isVisible);
    if (options.length) return options;

    if (!dropdown) return [];

    dropdown.click();

    for (let i = 0; i < 20; i++) {
      options = getAccountOptions(dropdown).filter(isVisible);
      if (options.length) return options;
      await sleep(250);
    }

    return [];
  }

  function getOfferButtons() {
    return findAllVisible(OFFER_TILE_SELECTORS);
  }

  function isActivatedOffer(button) {
    return Boolean(button.querySelector('[data-testid="offer-tile-alert-container-success"]')) ||
      /\b(added to card|activated|already added|offer added|enrolled)\b/i.test(getText(button));
  }

  function getOffersErrorBanner() {
    return Array.from(document.querySelectorAll('mds-banner[data-testid="error-banner"]'))
      .filter(isVisible)
      .find(banner => /trouble with chase offers/i.test(banner.getAttribute('banner-title') || ''));
  }

  function clickTryAgain() {
    const banner = getOffersErrorBanner();
    const retryLink = banner?.shadowRoot
      ?.querySelector('mds-link[text="Try again"]')
      ?.shadowRoot
      ?.querySelector('a');

    if (!retryLink) return false;

    retryLink.click();
    return true;
  }

  async function waitForOfferButtons() {
    for (let attempt = 0; attempt < 3; attempt++) {
      for (let i = 0; i < 40; i++) {
        const buttons = getOfferButtons();
        if (buttons.length) return buttons;

        if (getOffersErrorBanner()) break;
        await sleep(250);
      }

      if (!clickTryAgain()) break;

      console.log('  Chase Offers had trouble loading; clicked Try again');
      await sleep(3000);
    }

    // An account with genuinely zero offers is normal, so this returns empty
    // instead of throwing and aborting the remaining accounts. If EVERY account
    // comes back empty, the run summary flags the tile selector as suspect.
    return [];
  }

  function findBackButton() {
    const secondaryBack = document.querySelector('#mds-secondary-back-navbar')
      ?.shadowRoot?.querySelector('.navigation-bar__back-button');
    if (secondaryBack) return secondaryBack;

    return Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .filter(isVisible)
      .find(element => /^back$/i.test(getText(element)));
  }

  async function returnToOffersListIfNeeded() {
    if (getDropdown() || getOfferButtons().length) return;

    const backButton = findBackButton();
    if (!backButton) {
      throw new Error('Clicked offers, but could not find the offer detail Back button.');
    }

    backButton.click();
    console.log('  Clicked back button');
    await waitForAccountSelector();
    await sleep(1000);
  }

  async function clickUnappliedOffers() {
    const allButtons = await waitForOfferButtons();

    if (!allButtons.length) {
      console.warn('  No offer tiles found for this account');
      return false;
    }

    const unappliedButtons = allButtons.filter(button => !isActivatedOffer(button));

    console.log(`  Found ${allButtons.length} total offers, ${unappliedButtons.length} unapplied`);

    // Preserve the original behavior: fire all clicks in the same tick, then return if Chase opens a detail page.
    unappliedButtons.forEach(button => button.click());

    await sleep(1000);
    await returnToOffersListIfNeeded();
    return true;
  }

  let dropdown = await waitForAccountSelector();
  let accountLabels = (await openAccountSelector(dropdown)).map(getText);

  if (!accountLabels.length) {
    console.warn('Could not find the Chase Offers account selector or its options; the page may have changed.');
    console.warn('Falling back to the account that is currently selected only.');

    await clickUnappliedOffers();

    console.log('\nDone! Processed the current account only.');
    return;
  }

  console.log(`Found ${accountLabels.length} accounts. Starting...`);

  let accountsWithTiles = 0;
  const skipped = [];

  for (let i = 0; i < accountLabels.length; i++) {
    console.log(`\nProcessing account ${i + 1} of ${accountLabels.length}`);

    // One bad account must not abort the accounts after it.
    try {
      dropdown = await waitForAccountSelector();
      const options = await openAccountSelector(dropdown);
      const option = options.find(item => getText(item) === accountLabels[i]) || options[i];

      if (!option) {
        console.warn(`  Could not find account ${i + 1}; skipping`);
        skipped.push(accountLabels[i]);
        continue;
      }

      console.log(`  Switching to: ${getText(option)}`);

      option.click();
      await sleep(2000);

      // Only checked when Chase actually exposes the state, so this can't false-alarm.
      if (option.getAttribute('aria-selected') === 'false') {
        console.warn('  Account still reports aria-selected="false"; the switch may not have applied');
      }

      if (await clickUnappliedOffers()) accountsWithTiles++;
    } catch (error) {
      console.warn(`  Skipping account ${i + 1}: ${error.message}`);
      skipped.push(accountLabels[i]);
    }
  }

  console.log(`\nDone! Processed all ${accountLabels.length} accounts.`);

  if (skipped.length) {
    console.warn(`Skipped ${skipped.length} account(s): ${skipped.join(', ')}`);
  }

  // Zero tiles on one account is normal; zero on every account means the tile
  // selector probably changed, which would otherwise look like a clean run.
  if (!accountsWithTiles) {
    console.warn('No offer tiles were found on ANY account - the offer tile selector has likely changed.');
  }
}

clickAllOffersAllAccounts();
