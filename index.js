async function waitForElement(selector, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`Element ${selector} not found`));
    }, timeout);
  });
}

async function navigateBack() {
  const WAIT_TIME_MS = 1000;

  console.log('Using history back...');
  window.history.back();
  try {
    await waitForElement('mds-icon[type="ico_add_circle"][data-cy="commerce-tile-button"]', WAIT_TIME_MS);
    console.log('Returned to deals list.');
    return true;
  } catch (error) {
    console.error('Failed to navigate back using history', error);
    return false;
  }
}

async function addNextOffer() {
  const WAIT_TIME_MS = 1000;
  let offerButton = document.querySelector('mds-icon[type="ico_add_circle"][data-cy="commerce-tile-button"]');

  while (offerButton) {
    console.log('Clicking add button...');
    offerButton.click();
    try {
      console.log('Waiting for success alert, back button, or another add button...');
      await Promise.race([
        waitForElement('mds-alert[alert-title="Added to card"]', WAIT_TIME_MS),
        waitForElement('#back-button', WAIT_TIME_MS),
        waitForElement('mds-icon[type="ico_add_circle"][data-cy="commerce-tile-button"]', WAIT_TIME_MS)
      ]);
      console.log('Success alert, back button, or add button detected.');
    } catch (error) {
      console.error('Neither success alert, back button, nor add button detected', error);
    }

    const navigatedBack = await navigateBack();
    if (!navigatedBack) {
      console.error('Failed to navigate back, stopping script.');
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));
    offerButton = document.querySelector('mds-icon[type="ico_add_circle"][data-cy="commerce-tile-button"]');
  }

  console.log('All deals have been added!');
  return false;
}

async function main() {
  const WAIT_TIME_MS = 1000;

  while (true) {
    const result = await addNextOffer();
    if (!result) break;
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));
  }
}

main();
