async function clickAllOffersAllAccounts() {
  // Get initial count of accounts
  let dropdown = document.querySelector('#select-credit-card-account');
  let options = dropdown.querySelectorAll('mds-select-option');
  let totalAccounts = options.length;

  console.log(`Found ${totalAccounts} accounts. Starting...`);

  // Loop through each account
  for (let i = 0; i < totalAccounts; i++) {
    console.log(`\nProcessing account ${i + 1} of ${totalAccounts}`);

    // Re-query dropdown and options each time (important after back button!)
    dropdown = document.querySelector('#select-credit-card-account');
    options = dropdown.querySelectorAll('mds-select-option');

    console.log(`  Switching to: ${options[i].getAttribute('label')}`);

    // Click the dropdown to open it
    dropdown.click();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click the specific option
    options[i].click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get all offer buttons
    let allButtons = document.querySelectorAll('div[role="button"][data-testid="commerce-tile"]');

    // Filter out already-applied offers (ones with checkmark)
    let unappliedButtons = Array.from(allButtons).filter(button => {
      let successIndicator = button.querySelector('[data-testid="offer-tile-alert-container-success"]');
      return successIndicator === null;
    });

    console.log(`  Found ${allButtons.length} total offers, ${unappliedButtons.length} unapplied`);

    // Click only unapplied offers
    unappliedButtons.forEach(button => {
      button.click();
    });

    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Click back button to return to dropdown screen
    let backButton = document.querySelector('#mds-secondary-back-navbar')
      ?.shadowRoot?.querySelector('.navigation-bar__back-button');

    if (backButton) {
      backButton.click();
      console.log('  Clicked back button');
    }

    // Wait for page to return and dropdown to be ready
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\nDone! Processed all ${totalAccounts} accounts.`);
}

// Run it
clickAllOffersAllAccounts();
