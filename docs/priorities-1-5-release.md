# Priorities 1–5: implementation and release record

## Artwork (priorities 2–3)

Choose **Modular Terry artwork** in Avatar Studio. The renderer combines 11 transparent component atlases across eight angles. Every available body, pose, hair, face, outfit, skin palette, hair palette and left/right/bilateral limb selection is composable. Optics follow the visible face. Body presets change rig proportions; poses change limb placement. This is a 2D modular assembly, not a 3D mesh or 48 independently painted frames.

The same assembly appears in the Studio, linked console portrait and Cyberware Manager. The original eight painted full-body images remain a separate choice. Missing component files trigger an explicitly labeled procedural recovery preview. Atlas prompts are retained alongside the assets; generation used the built-in image-generation tool. Three sheets required a second alpha-cleanup pass. PNGs were not edited by Python; alpha measurements generate only metadata.

## Character reliability (priority 4)

Console, cyberware and avatar saves share an active character ID. Complete Backup exports all three records in one versioned document. Validation rejects malformed numeric fields, negative inventory ledgers, duplicate implant IDs and inconsistent install lists. Restore keeps a previous snapshot and rolls back write failures. Previous local saves can be recovered by section; damaged source records are retained separately.

Installed implants are removed by instance ID and selected side. A second base implant cannot occupy the same side. Same-location prerequisites must exist on that side. Installation previews actual entered Humanity loss, and does not guess therapy or maximum-Humanity adjustments. Inventory undo restores the last successful operation only when its inventory/resource snapshot still matches. Ordinary inventory and cyberware remain their respective ledgers; complete backups preserve both.

## Rolls and rules (priority 5)

Shared rules helpers cover HP derivation, wound thresholds, armor penalties, recorded injury modifiers, single critical d10 adjustment, strict DV comparison and unbiased fallback dice. Initiative excludes wound/injury modifiers while retaining applicable REF armor modifiers. Interface uses rank without a governing STAT. Duplicate sample cyberware bonuses apply once per type. Roll history records modifier sources; damage rolls retain their dice and separate critical bonus.

Injury names, numeric effects and applicability are entered by the player from their sourcebook. This release does not contain the complete injury or cyberware catalog, automate armor ablation, resolve death saves, or implement every Role Ability. The shop remains explicitly labeled as a sample catalog. These limits are visible in the application and are not represented as full rulebook automation.

Rules audit references: Cyberpunk RED core rules, pp. 129–130 and 186–188; [official FAQ v1.3](https://rtalsoriangames.com/wp-content/uploads/2021/07/RTG-CPR-CoreBookFAQv1.3.pdf), p. 2 for roll-type exceptions and p. 5 for critical-injury interactions; [official Single Shot Pack](https://rtalsoriangames.com/wp-content/uploads/2021/02/RTG-CPRed-SingleShotPackv1.1.pdf) for derived examples and conditional effects. The automated tests lock down the implemented arithmetic and exceptions, not every published rule.

## Release (priority 1)

Local validation: 112 Node tests, 27 existing stability scenarios, 10 original Terry workflow scenarios, and the additional modular/inventory/rules browser acceptance runner. Visual inspection caught and fixed nested-SVG CSS interference before release. Evidence screenshots are retained locally under `docs/evidence`.

CI now runs the complete Node suite and both new browser runners. Pages staging includes only application HTML, assets and the packaged dice engine; development notes, chat history, local saves and tests are excluded. Remote check and deployment results are recorded separately after the release completes.

Remaining projects outside this release: direct Roll20 synchronization, cloud/GM persistence, additional character identities and outfits, and continuous 48-angle painted artwork. The historical milestone checklist describes that broader roadmap; it is not a completion percentage for this release.
