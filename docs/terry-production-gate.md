# Terry artwork gate — current local release

**Cleaned v2 passes the local base-appearance workflow gate.** Eight 1024×1536 RGBA PNG views are in `assets/avatar-art/terry/clean-v2/`, with per-frame hashes and metadata in `manifest.json`. The original candidate remains preserved in `candidate-v1/`.

Transparent silhouettes were checked with actual browser compositing on contrasting backgrounds. The portrait uses the same front frame. Display transforms align height, horizontal center, and boot baseline without modifying the generated source images.

The local gate covers the original base outfit and eight authored views. Matching high-detail customization and cyberware variants are not available; the integrated workflow explicitly falls back to the procedural renderer with side-correct limbs and eyes. Minor per-view equipment and lighting differences remain.

See `terry-completed-workflow.md` for acceptance checks, startup instructions, scope limits, and image prompts. No GitHub upload, merge, or deployment has been performed.