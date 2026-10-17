# Maintenance Notes

- This project is a tiny browser-console script. Preserve the existing workflow unless the user explicitly asks for a redesign.
- Keep the code straightforward and easy to read. Prefer a simple loop and small, clearly named helpers over generalized frameworks or speculative fallbacks.
- Process the account picker from top to bottom, one entry at a time. Re-read its options after switching accounts, stop at the end, and skip disabled entries. Do not hardcode an account total or track visited account labels.
- The important behavior is: switch card/account, collect unapplied Chase Offers tiles, click all unapplied tiles in one batch, then use Back only if Chase opens an offer detail page.
- When Chase changes the UI, prefer selector-only fixes first. Do not replace the flow with API calls, broad DOM crawlers, generic button matching, URL-change guards, or navigation rewrites without confirming the current script flow is truly broken.
- Avoid broad selectors such as generic `button`, `[role="button"]`, or text-only Back/account matches except as tightly scoped fallbacks. The Chase dashboard has many similarly labeled controls.
- If a future fix needs more context, ask for the live hydrated DOM around the specific broken element, not the bootstrap page source.
- This is a public repository. Never put real account names, numbers, IDs, live banking URLs, or captured banking DOM in source, documentation, fixtures, or commits. Use fictional examples when needed.
