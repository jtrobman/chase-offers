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

  function getDropdown() {
    return document.querySelector('#select-credit-card-account');
  }

  function getAccountOptions(dropdown) {
    const legacyOptions = Array.from(dropdown.querySelectorAll('mds-select-option'));
    const currentOptions = Array.from(document.querySelectorAll('[role="option"][data-testid^="user-account-option-"]'));

    return [...legacyOptions, ...currentOptions]
      .filter(option => option.getAttribute('inactive') !== 'true');
  }

  async function waitForAccountSelector() {
    for (let i = 0; i < 40; i++) {
      const dropdown = getDropdown();
      if (dropdown && isVisible(dropdown)) return dropdown;
      await sleep(250);
    }

    throw new Error('Could not find visible #select-credit-card-account.');
  }

  async function openAccountSelector(dropdown) {
    let options = getAccountOptions(dropdown).filter(isVisible);
    if (options.length) return options;

    dropdown.click();

    for (let i = 0; i < 20; i++) {
      options = getAccountOptions(dropdown).filter(isVisible);
      if (options.length) return options;
      await sleep(250);
    }

    throw new Error('Could not find visible account options after opening #select-credit-card-account.');
  }

  function getOfferButtons() {
    return Array.from(document.querySelectorAll('[role="button"][data-testid="commerce-tile"]'))
      .filter(isVisible);
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

    throw new Error('Could not find offer tiles with [role="button"][data-testid="commerce-tile"].');
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
    if (isVisible(getDropdown())) return;

    const backButton = findBackButton();
    if (!backButton) {
      throw new Error('Clicked offers, but could not find the offer detail Back button.');
    }

    backButton.click();
    console.log('  Clicked back button');
    await waitForAccountSelector();
    await sleep(1000);
  }

  let dropdown = await waitForAccountSelector();
  let accountLabels = (await openAccountSelector(dropdown)).map(getText);

  console.log(`Found ${accountLabels.length} accounts. Starting...`);

  for (let i = 0; i < accountLabels.length; i++) {
    console.log(`\nProcessing account ${i + 1} of ${accountLabels.length}`);

    dropdown = await waitForAccountSelector();
    const options = await openAccountSelector(dropdown);
    const option = options.find(item => getText(item) === accountLabels[i]) || options[i];

    if (!option) {
      console.warn(`  Could not find account ${i + 1}; skipping`);
      continue;
    }

    console.log(`  Switching to: ${getText(option)}`);

    option.click();
    await sleep(2000);

    const allButtons = await waitForOfferButtons();
    const unappliedButtons = allButtons.filter(button => !isActivatedOffer(button));

    console.log(`  Found ${allButtons.length} total offers, ${unappliedButtons.length} unapplied`);

    // Preserve the original behavior: fire all clicks in the same tick, then return if Chase opens a detail page.
    unappliedButtons.forEach(button => button.click());

    await sleep(1000);
    await returnToOffersListIfNeeded();
  }

  console.log(`\nDone! Processed all ${accountLabels.length} accounts.`);
}

clickAllOffersAllAccounts();
