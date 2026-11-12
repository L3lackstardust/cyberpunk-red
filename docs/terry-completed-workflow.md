# Terry local workflow — completed milestone

November 11, 2026. Based on work/cyberware-avatar-90 at 8e80347d55617471cf5b445bfe44d69153d9702a, with local changes. This completes the usable single-character workflow defined in the project command protocol; it does not complete the full campaign roadmap.

## Use it

Run **Start Cyberpunk RED.cmd**, keep its window open, and visit http://127.0.0.1:8765/avatar-creator.html. Node.js is required and is already available on this computer.

1. Select **Use Terry appearance**.
2. Rotate with drag, arrow keys, the slider, or the view buttons.
3. Change appearance controls as desired. When matching artwork is unavailable, the procedural character visibly reflects the chosen settings and explains the fallback.
4. Select **Use portrait on character sheet** to link the current appearance without replacing stats, skills, cash, or inventory.
5. Open Cyberware Manager to purchase, install, or remove equipment. Its artwork follows the saved appearance; installed limbs and eyes use correct-side procedural visualization when no matching Terry art exists.
6. Export Avatar JSON for an appearance backup, or export the linked character sheet to include its avatar profile.

Continue using the same host and port to retain browser storage. Local data is not automatically synced to mobile ChatGPT, Roll20, or Google Sheets. The original imported chats and main-branch snapshot are preserved outside this development folder.

## Delivered

- Eight cleaned 1024×1536 transparent PNG views with a matching portrait drawn from the same front frame.
- Consistent display scale, horizontal centering, and boot baseline using measured silhouette bounds.
- Integrated Avatar Studio and Cyberware Manager artwork selection and angle mapping.
- Functional appearance controls and side-specific implant fallback, rather than replacing customization with a static preset.
- Linked character-sheet portrait, live cross-tab refresh, avatar backup, and character backup with avatar restoration.
- Fixed left/right equipment cards so the selected side is passed into installation.
- Larger desktop figure and mobile layout with the visual manager first.
- Original-versus-cleaned artwork review page and preserved original artwork.
- A local Node server and Windows launcher; no deployment or remote changes.

## Validation

- **98 regression tests passed**.
- **27 existing browser stability checks passed**.
- **10 Terry acceptance scenarios passed**, including every actual frame, rotation/reload, custom appearance fallback, avatar and character backups, linked portrait/data preservation, actual left-arm purchase/install/uninstall, cross-tab updates, missing images, real-image dragging, and 390px layouts.
- Desktop/mobile screenshots and contrast-background rendering reviewed.
- All eight cleaned files match the release manifest hashes and pass the artwork metadata gate.
- Browser evidence is in docs/evidence/. The tests use isolated browser storage, not your live character saves.

Unit tests: `node --test tests/*.test.cjs`.
Acceptance tests: `node tests/terry-workflow-browser.cjs` with Playwright installed.
Existing stability suite: `node tests/stability-smoke.cjs` with Playwright and Python. PYTHON and BROWSER_EXECUTABLE can select local executables; NODE_PATH can point to the bundled packages.

## Scope limits

Terry's high-detail art covers the base appearance only. Other clothing, body, hair, pose, and implant configurations remain fully editable via the existing procedural renderer, with an explicit unavailable-art explanation. The eight authored views are not an exact continuous 3D reconstruction; minor equipment and lighting differences remain. No completion percentage is claimed for the larger roadmap.

## Image generation provenance

Built-in image_gen was used. Original candidate files are preserved in assets/avatar-art/terry/candidate-v1/. Accepted outputs are in assets/avatar-art/terry/clean-v2/.

Correction to the earlier import review: the generated images' raw RGB previews showed colors that were transparent in the alpha channel. Browser compositing verified clean transparency. The final front view also received a hairstyle consistency edit.

### Background-extraction prompt (angles 1–7)

Use case: background-extraction. Edit target: the supplied Terry character frame. Produce a clean game character cutout with REAL TRANSPARENT ALPHA. Remove every background patch, ground, shadow, floor reflection and fringe, including gaps between limbs. Preserve the man exactly: identity, tattoos, jacket, red lights, holsters, gloves, boots, camera angle, pose, proportions, lighting and position. Keep full head and boots within the SAME 1024x1536 canvas. Do not redesign him or alter viewpoint. No scenery, no glow or haze around silhouette. All pixels outside physical silhouette must have alpha zero. 

Each call appended its source frame name and used that original WebP as its edit target.

### Initial front extraction

Background extraction ONLY. Output a clean game sprite cutout with binary transparent background: alpha=0 for EVERY pixel outside the man's physical silhouette, and in gaps between legs and arms. NO backdrop, NO gradient, NO glow, NO haze, NO shadow, NO reflections, NO floor. The previous extraction incorrectly included a soft dark background; do not do that. Use the supplied original as edit target; retain the original man exactly including face, tattoos, jacket, red trim, holsters, stance, camera view and full framing. Remove the blue floor and all background islands. Real transparent PNG, not a painted black background.

### Final front consistency edit

Use case: precise-object-edit. Image 1 is the edit target: clean transparent full-body FRONT view of Terry. Image 2 is HAIRSTYLE REFERENCE ONLY from his front-right view. Change ONLY the short buzzcut in Image 1 to the same short spiky dark mohawk with shaved tattooed sides seen in Image 2, viewed from the front. Preserve face identity, pose, anatomy, clothes, equipment, proportions, lighting, tattoos, gloves, boots, full 1024x1536 canvas position exactly. Preserve true transparent alpha outside the man and between limbs. Do not add floor, background, haze or shadow. Output only the front view.

