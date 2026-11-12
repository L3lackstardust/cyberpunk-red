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
- Google Sheets / Roll20 are not directly synchronized. The Pro GM bridge is read-only inspection.
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
