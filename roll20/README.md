# RED GM Bridge v0.2

Read-only, GM-only Roll20 Pro Mod script for Campaign 1.

## Installation

1. On the Roll20 game details page, choose **Settings → Mod (API) Scripts → New Mod Script**.
2. Back up the game first. Replace the previous v0.1 test script with the complete contents of [`red-gm-bridge.js`](red-gm-bridge.js); do **not** leave both scripts enabled, because both listen for `!red-ping`.
3. Save and restart the Mod Script Sandbox if necessary. Verify `RED GM Bridge v0.2 initialized (read-only).` in the Mod console.
4. In Roll20 chat as GM, send `!red-ping`, then `!red-characters`.
5. Use `!red-inspect CHARACTER_ID` with an ID listed by the bridge, or select a token linked to a character and send `!red-inspect`.

## Safety and limitations

The script only reads Roll20 character and attribute objects and whispers results to the GM. It does not read the external browser Character Console, change any Roll20 records, access compendium purchases, or establish direct web synchronization. Inspection prints up to 80 alphabetically sorted raw attribute names and values to identify the official sheet's field mapping. Avoid sharing GM inspection output with players. The GM-only authorization applies to each command; no player-facing command is provided.
