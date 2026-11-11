# Terry foreground production gate (2026-11-11)

Status: **candidate, NOT production approved**. Eight 1024×1536 transparent WebP frames and a front-derived portrait have been generated in the conversation artifact `terry_production_candidate_v1.zip`, but are not committed to the repository. The GitHub text-file connector cannot upload binary artwork; do not reference these paths in live manifests until binary assets are actually uploaded.

## Frame order
0 front; 1 front-right; 2 right; 3 rear-right; 4 back; 5 rear-left; 6 left; 7 front-left. The matching images are `00_front.webp` through `07_front_left.webp`.

## QA blockers
- Frames 0 and 1: visible neon street / floor remnants in alpha foreground.
- Frames 2, 3 and 5: dark studio background islands around silhouette.
- Equipment, lighting and body scale vary between angles.
- Exact camera-angle parity and cyberware side-specific variant groups are not yet approved.
- Full browser integration, character-save synchronization and mobile tests for these actual assets have **not** been run.

## Approval requirements
1. Clean transparent silhouettes with no retained scenery.
2. Exact eight-frame angle order, consistent scale and body landmarks.
3. Visual review of clothing, facial identity and cyberware laterality.
4. Matching portrait and valid per-frame image hashes.
5. Upload binary files to `assets/avatar-art/terry/base/` and register only after verifying every referenced path exists.
6. Browser regression checks including missing-art fallback, eight-angle navigation, and save/reload.

Backgrounds are independent player-selected future assets. Do not bake backgrounds into character frames.
