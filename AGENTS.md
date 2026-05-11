# Maintenance Notes

- This project is a tiny browser-console script. Preserve the existing workflow unless the user explicitly asks for a redesign.
- The important behavior is: switch card/account, collect unapplied Chase Offers tiles, click all unapplied tiles in one batch, then use Back only if Chase opens an offer detail page.
- When Chase changes the UI, prefer selector-only fixes first. Do not replace the flow with API calls, broad DOM crawlers, generic button matching, URL-change guards, or navigation rewrites without confirming the current script flow is truly broken.
- Avoid broad selectors such as generic `button`, `[role="button"]`, or text-only Back/account matches except as tightly scoped fallbacks. The Chase dashboard has many similarly labeled controls.
- If a future fix needs more context, ask for the live hydrated DOM around the specific broken element, not the bootstrap page source.
