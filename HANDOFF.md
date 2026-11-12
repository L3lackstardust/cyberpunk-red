# Cyberpunk RED — session handoff
Updated: 2026-11-12 (America/Detroit).
Recorded by: cloud review session. Desktop acknowledgement: not yet received.
Reviewed implementation: b3847e3192e6e30aebbb8d67108ee8ba5151f4ae.
This checkpoint describes that commit; inspect newer commits before relying on it.

## Resume here
Read this file and docs/project-command-protocol.md, inspect current branch/HEAD and local uncommitted work, then reconcile newer changes. Do not reset or overwrite local work to match this checkpoint.
Use accessible conversation history only to recover relevant decisions; missing history is not evidence of completion. Latest explicit user directions govern scope; code and test evidence govern implementation claims.
For a catch-up request, report the reconciled state. For CONTINUE/COMPLETE/AUTOPILOT, proceed only within the already-authorized objective.
Acknowledge with: "Caught up through <checkpoint/commit>; local changes <summary>; next action <task>." Record this acknowledgement below when it actually happens.

## Approved scope and constraints
Finish one usable Terry Avatar Studio + Cyberware Manager workflow: coherent eight-angle artwork, matching portrait, save/load, accurate left/right/bilateral implants or explicit unavailable-art fallback, sheet integration, responsive UI, and verified interactions.
Preserve existing functionality. Favor compact desktop layouts and usable phone controls. Keep other game projects separate.
COMPLETE and AUTOPILOT retain the definitions in docs/project-command-protocol.md; neither guarantees background execution.
The current request authorizes establishing this handoff system. Recommendations below are proposals, not new approvals or completed implementation.

## Verified checkpoint
- Repository has Character Console, GM Scene Console, Cyberware Manager, Avatar Studio, Roll20 Bridge, and character backup/recovery pages.
- Modular Terry combines component artwork across eight views; body presets scale shared artwork. This is not six independently authored body identities or 48 painted views.
- Shared character ID, three-section backup, implant-instance handling, inventory undo, and sourced roll modifiers are implemented.
- 2026-11-12 cloud review: node --test tests/*.test.cjs passed 112/112 at the reviewed commit.
- Browser acceptance rerun was blocked: bundled browser unavailable; /usr/bin/chromium then failed with socket Operation not permitted. No fresh visual/iPhone acceptance claimed.
- Local function-level reproduction: refreshSharedPlayer() left HP at 40 when stored HP was 17; stored skill/inventory changes also remained absent. The storage event then calls render(), which saves. Cross-tab overwrite risk is supported by code; full two-tab browser reproduction remains pending.
- No application fixes were made during that review.

## Recommended next work, not yet implemented by this review
1. Repair stale cross-tab saves; refresh complete validated records, keep display rendering free of writes, and test conflicting tab edits.
2. Preserve input focus while editing stats/skills; validate mobile typing and touch interactions.
3. Unify local roll calculations and modifier applicability. Roll20 command export currently produces a basic d10 command; full rules parity is not established.
4. Finish Terry visual acceptance across eight angles before adding identities.
5. Strengthen browser checks before Pages deployment and reconcile the historical roadmap.
6. Later scope: named character roster, GM backup validation/crew snapshots, and explicit cross-device persistence. Decide the authoritative shared record before implementing sync.

## Open limits and dependencies
- Desktop local changes, running task, and unpublished progress are unknown until that session reports.
- Local browser saves do not automatically follow users across devices.
- The GitHub Pages apps are not directly synchronized with Google Sheets / Roll20. A separate GM Operations artifact contains Apps Script bridge client code; its deployment/backend were not verified here. The Pro GM bridge is read-only inspection.
- Full rules catalog, armor ablation, death saves and all Role Abilities are outside the implemented release.
- Historical roadmap checkboxes are not a reliable completion percentage.
- No automatic chat-history watcher, scheduled polling, or desktop connection is configured by these documents.

## Handoff operating procedure
1. At session start and before editing shared files, fetch/read the latest handoff and relevant commit changes. Inspect local work first.
2. Before claiming a task, record its ID, scope, owner/session, branch, base commit, and claim time. Claims are coordination notes, not locks; a stale claim requires reconciliation.
3. Work on a task branch when concurrent sessions may edit code. Do not independently edit the same files without coordinating.
4. After a meaningful checkpoint or before ending, update this file: implemented changes, exact commit/branch, test commands and results, unverified items, blockers, and next action.
5. Re-read the remote version immediately before saving. Merge newer checkpoint details; use expected SHA checks and never force-overwrite another session's report.
6. Keep entries concise. Git history preserves old checkpoints. Keep secrets, player saves, private GM content and raw chat transcripts out of this public repository.
7. Mark recommended / approved / in progress / implemented / verified / blocked separately. A saved plan is not implementation; a commit is not a deployment.
8. If GitHub cannot be reached, provide a clearly labeled unsynced handoff in chat. Do not claim the desktop received it.

## Active task and acknowledgement
Active implementation owner: unclaimed / desktop state unknown.
Next recommended task: CPRED-SAVE-001 — reproduce and repair cross-tab stale saves.
Acceptance: two console tabs preserve HP, skills, inventory and roll history; shared cyberware changes remain correct; rendering alone does not mutate saved state; regression and browser tests pass.
Desktop acknowledgement: pending.


## Expanded reconciliation — 2026-11-12
The first review covered the deployed repository implementation, not every desktop or separate artifact. It must not be treated as a complete desktop inventory.
- Inspected all 56 visible remote branch heads and all 55 PR records. At this audit, main was aa4265d (handoff documentation only); latest application release remains b3847e3. No later application commit appeared among visible remote branches.
- work/cyberware-avatar-90 at 75cf50d has the same application tree as main; only AGENTS.md and HANDOFF.md differ. Its release was merged through PR #55.
- Corrections to artwork summary: the procedural renderer already supports six differentiated body builds, 48 rotation steps, pose/hair/face options, limb depth masking and side-specific cyberware. The eight-view/shared-artwork limitation applies to modular Terry, not the entire avatar system.
- CI evidence: browser smoke workflow 43133716498 succeeded for release branch 75cf50d; character regression succeeded there and at b3847e3. Pages deployment 43134017799 succeeded for b3847e3; 43234237673 succeeded for documentation head aa4265d. This supplements, but does not replace, the cloud review's blocked local browser rerun.
- Open PRs #11, #51 and #54 require reconciliation; an open PR is not proof its feature is absent. Cyberleg synchronization is already in the release; do not blindly merge older branches.
- Separate saved artifacts located: terry_review_build_v3.zip (2026-11-11 17:25 Eastern), terry_production_workbench_v12.zip (17:03), and earlier candidates. Existence verified; archive contents and integration not re-audited in this pass. Prior conversation reports describe V3 rotation, portrait, identity editing, save/reload, JSON transfer, zoom and a fixed right cyberarm; treat those as reported, not newly tested.
- Separate GM(1).html source inspected: encounter/initiative tracking, faction clocks, journal/decisions, NPCs, market prompts, date/episode controls, JSON/CSV export, and Apps Script loadConsole/saveConsole calls with profile/revision protection. This is distinct from gm-scene-console.html. Client integration code exists; live Apps Script/backend operation remains unverified.
- Earlier conversation reports a live Roll20 GM character-list test; it does not establish completed web-to-Roll20 synchronization.
- Still unknown: desktop local/unpushed changes and any deployments not represented by these sources. No direct desktop acknowledgement received.
- Future handoffs must inventory each workstream separately: deployed application, branch/PR work, separate saved artifacts, and desktop-only state.

## Checkpoint template
- Updated at (with timezone):
- Session / branch / base commit:
- Task ID and authorization:
- Implemented:
- Verified (commands, results, commit):
- Not verified / blockers:
- Local-only or unpushed changes:
- Next action:
- Other-session acknowledgement:
