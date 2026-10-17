# Chase Offers (Bulk Activator)

Activate loaded Chase Offers across the accounts in your account picker without clicking each offer manually.

## What This Script Does

- Starts at the top of the account picker and processes each entry in order, skipping disabled entries.
- Waits for each account's offers and clicks the unapplied tiles in one batch.
- Uses Back if Chase opens an offer detail page.
- Stops at the end of the picker and logs progress in the console. There is no expected account total.

## Requirements

- You are signed in to Chase in a desktop browser.
- You are on the live Chase Offers page after it finishes loading. Do not run it from View Source or from the initial HTML loading shell.
- Browser console access (Chrome, Edge, Firefox, etc.).

## Quick Start

1. Open the Chase Offers page.
2. Open Developer Tools and switch to the Console tab.
3. Copy the full contents of `index.js`.
4. Paste into the console and press Enter.
5. Let the script run until you see: `Done! Reached the end of the account picker.`

## Notes

- The script uses short waits between actions to allow page transitions.
- It processes tiles currently loaded in the page. It does not scroll to load more offers or advance offer carousels.
- It retries Chase's loading error using the page's **Try again** link when available.
- Do not navigate away while it is running.
- Pasting the script again while it is running logs a warning instead of starting another run.
- Account details are read from the page at runtime; the script does not save them to files or browser storage. Account labels appear in your browser console during the run.

## Troubleshooting

- If nothing happens, confirm you are on the Chase Offers page (not another Chase page).
- If the UI changed and selectors no longer match, the script may need updates.
- A `Stopped:` message means the run did not finish. A `No offer tiles found` warning can mean an empty offers list, a loading problem, or a changed selector.
- If the script stops mid-run, refresh the page and run it again.
- If console messages from multiple runs are interleaved, refresh the page to stop the old runs, then paste the script once.
- When reporting a selector problem, share only the live DOM around the broken control and redact account details.

## Disclaimer

Use at your own risk. This project is not affiliated with or endorsed by JPMorgan Chase.
