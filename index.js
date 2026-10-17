async function clickAllOffersAllAccounts() {
  if (window.chaseOffersRunning) {
    console.warn('Chase Offers is already running.');
    return;
  }

  window.chaseOffersRunning = true;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const accountSelector = '[data-testid="account-selector-trigger"]';
  const accountOptions = '[data-testid="account-selector-sheet"] [role="option"]';
  const offerTiles = '[role="button"][data-testid="commerce-tile"]';

  async function waitFor(selector) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const element = document.querySelector(selector);
      if (element) return element;
      await sleep(250);
    }
    return null;
  }

  async function openAccounts() {
    const dropdown = await waitFor(accountSelector);
    if (!dropdown) throw new Error('Could not find the Chase Offers account picker.');

    if (dropdown.getAttribute('aria-expanded') !== 'true') dropdown.click();
    if (!await waitFor(accountOptions)) {
      throw new Error('The account picker opened, but no accounts appeared.');
    }

    return document.querySelectorAll(accountOptions);
  }

  async function loadOffers() {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await waitFor(offerTiles)) return document.querySelectorAll(offerTiles);

      const retry = document.querySelector('mds-banner[data-testid="error-banner"]')
        ?.shadowRoot?.querySelector('mds-link[text="Try again"]')
        ?.shadowRoot?.querySelector('a');
      if (!retry) break;

      console.log('Chase Offers had trouble loading; clicking Try again.');
      retry.click();
      await sleep(3000);
    }
    return [];
  }

  try {
    // Reopen the picker after each account and take the next entry in order.
    for (let index = 0; ; index++) {
      const accounts = await openAccounts();
      const account = accounts[index];
      if (!account) {
        document.querySelector('[data-testid="account-selector-sheet"] button[aria-label="Select here to close."]')?.click();
        console.log('Done! Reached the end of the account picker.');
        break;
      }

      if (account.getAttribute('aria-disabled') === 'true') continue;
      console.log(`Switching to: ${account.textContent.trim()}`);
      account.click();
      await sleep(2000);

      const offers = await loadOffers();
      const unapplied = Array.from(offers).filter(offer =>
        !offer.querySelector('[data-testid="offer-tile-alert-container-success"]') &&
        !/\bSuccess Added$/i.test(offer.getAttribute('aria-label') || ''));

      if (!offers.length) console.warn('No offer tiles found for this account.');
      console.log(`Found ${offers.length} offers, ${unapplied.length} unapplied.`);

      // Click the whole batch before handling any offer detail page.
      unapplied.forEach(offer => offer.click());
      await sleep(1000);

      if (!document.querySelector(accountSelector) && !document.querySelector(offerTiles)) {
        const back = document.querySelector('#mds-secondary-back-navbar')
          ?.shadowRoot?.querySelector('.navigation-bar__back-button');
        if (!back) throw new Error('Could not find the offer detail Back button.');
        back.click();
        if (!await waitFor(accountSelector)) {
          throw new Error('Could not return to the offers list.');
        }
      }
    }
  } catch (error) {
    console.error(`Stopped: ${error.message}`);
  } finally {
    delete window.chaseOffersRunning;
  }
}

clickAllOffersAllAccounts();
