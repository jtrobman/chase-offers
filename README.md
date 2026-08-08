# Chase Offers (Bulk Activator)

Activate Chase credit card offers across all eligible accounts without clicking each offer manually.

## What This Script Does

- Iterates through each account in the Chase Offers account selector.
- Opens each account's offers list.
- Clicks only offers that are not already activated.
- Switches accounts through the Chase Offers account selector and repeats until all accounts are processed.
- Logs progress in the browser console.
- Waits for the Chase Offers account selector and offer tiles before acting.

## Requirements

- You are signed in to Chase in a desktop browser.
- You are on the live Chase Offers page after it finishes loading. Do not run it from View Source or from the initial HTML loading shell.
- Browser console access (Chrome, Edge, Firefox, etc.).

## Quick Start

1. Open the Chase Offers page.
2. Open Developer Tools and switch to the Console tab.
3. Copy the full contents of `index.js`.
4. Paste into the console and press Enter.
5. Let the script run until you see: `Done! Processed all X accounts.`

## Notes

- The script uses short waits between actions to allow page transitions.
- It skips offers that already show a success/activated indicator.
- It only clicks Back if Chase opens an offer detail page after the batch of offer clicks.
- Do not navigate away while it is running.

## Troubleshooting

- If nothing happens, confirm you are on the Chase Offers page (not another Chase page).
- If the UI changed and selectors no longer match, the script may need updates.
- If the script stops mid-run, refresh the page and run it again.

## Disclaimer

Use at your own risk. This project is not affiliated with or endorsed by JPMorgan Chase.
