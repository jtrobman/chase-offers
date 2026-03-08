# Chase Offers (Bulk Activator)

Activate Chase credit card offers across all eligible accounts without clicking each offer manually.

Last verified on Chase UI: 2026-03-08

## What This Script Does

- Iterates through each account in the Chase Offers account selector.
- Opens each account's offers list.
- Clicks only offers that are not already activated.
- Returns to the account list and repeats until all accounts are processed.
- Logs progress in the browser console.

## Requirements

- You are signed in to Chase in a desktop browser.
- You are on the Chase Offers page where the account dropdown is visible.
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
- Do not navigate away while it is running.

## Troubleshooting

- If nothing happens, confirm you are on the Chase Offers page (not another Chase page).
- If the UI changed and selectors no longer match, the script may need updates.
- If the script stops mid-run, refresh the page and run it again.

## Disclaimer

Use at your own risk. This project is not affiliated with or endorsed by JPMorgan Chase.
