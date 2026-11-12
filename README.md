# Cyberpunk RED character workspace

Run **Start Cyberpunk RED.cmd** with Node.js installed, then open **http://127.0.0.1:8765/**. Keep the launcher open while using the application.

- **Character Console:** stats, skills, inventory, conditions, sourced rolls and linked portraits.
- **Avatar Studio:** choose **Modular Terry artwork** for all existing appearance combinations and side-specific cyberware across eight views. Original painted Terry and procedural previews remain available.
- **Cyberware Manager:** purchase/install/remove by anatomical side, Humanity previews and guarded inventory undo.
- **Complete backup & recovery:** one export for console, cyberware and appearance; validated restore and previous local saves.

Data stays in browser-local storage. Export a complete backup before changing devices or clearing browser data. The demo shop is a sample catalog; sourcebook prices, Humanity caps, slot limits and non-numeric injury effects still require player/GM entry.

See [priorities 1–5 implementation and validation](docs/priorities-1-5-release.md). The historical roadmap covers larger future work and does not represent this release's completion percentage.

## Checks

Run from the project folder:

```text
node --test tests/*.test.cjs
node tests/stability-smoke.cjs
node tests/terry-workflow-browser.cjs
node tests/priorities-browser.cjs
```

Browser checks require Playwright/Chromium. Set BROWSER_EXECUTABLE to an installed Chromium browser if needed; the older smoke runner also accepts PYTHON. GitHub Actions installs these dependencies. Pages packages Fantastic Dice 1.1.4 during deployment and stages only application files in dist.

Roll20 direct synchronization, cloud persistence and GM collaboration remain separate roadmap work. This is an unofficial campaign utility.
