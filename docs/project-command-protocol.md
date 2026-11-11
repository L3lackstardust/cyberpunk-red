# Project Command Protocol (PCP) v1.0

Established 2026-11-11. This is a portable instruction dictionary, not authorization to merge projects. Each project retains its own scope, files, goals, and acceptance criteria.

## Primary command: COMPLETE

**COMPLETE** means: Finish the *currently approved scope* end-to-end, using the last verified state. Inspect existing work first; identify unmet acceptance criteria and dependencies; prioritize working functionality, integration, consistency, usability, then optional polish. Make routine implementation choices without requesting approval. Implement, test, repair, retest, and save durable artifacts/commits. Preserve existing working features. Do not expand scope or substitute demos, reports, mockups, or unverified claims for the requested product. Return **one consolidated report** with deliverable links, verified tests, unresolved blockers, and any decisions requiring the user's input. If execution constraints prevent finishing, state the exact incomplete work honestly; never label it complete. Do not claim work continues after the response unless a real scheduled/persistent mechanism has been created.

## Other commands

| Command | Exact intent | Response expectation |
| --- | --- | --- |
| EXECUTE | Implement the current specific feature to its acceptance criteria; integrate and test. | Deliver feature and evidence, no routine check-ins. |
| CONTINUE | Resume the last verified task without restarting, repeating work, or expanding scope. | Report substantive progress and blockers at the end. |
| AUDIT | Inspect implementation against requirements, identify severity-ranked gaps; do not alter files unless necessary for safe inspection. | Concise findings and actionable priorities. |
| REPAIR | Fix existing defects, regressions, and broken integrations; do not add features. | Fixes, tests, remaining defects. |
| POLISH | Refine presentation, responsiveness, interaction and performance after the functional baseline is stable; avoid changing behavior. | Before/after changes and regression results. |
| OPTIMIZE | Improve speed, memory, asset sizes and maintainability while retaining features. | Measured improvements and regression results. |
| EXPAND | Add the next already-approved feature or variant using the proven baseline. | Integrated deliverable and tests. |
| REVIEW | Summarize actual verified state and decisions needing user input; do not modify implementation. | Short, evidence-based status. |
| FREEZE | Preserve a verified baseline, record its version and tests; avoid feature changes. | Baseline reference and recovery instructions. |
| PLAN | Convert current approved goals into dependencies, acceptance criteria, and a minimum-complete sequence; do not implement. | Concise plan with measurable finish line. |
| STOP | Halt additional work at the next safe boundary and report state. | What was saved, what remains. |

## Global interpretation rules

1. A one-word command applies to the **active project and current approved objective**, not every project or every imaginable feature. If no objective is identifiable, ask one concise clarification.
2. Existing explicit user constraints override this dictionary. Do not silently expand scope, overwrite working data, merge unrelated projects, or make consequential external changes beyond established authorization.
3. **Completion is evidence-based:** an implemented feature is not automatically a tested feature. State what was actually run, what passed, what was not testable, and why.
4. **Function before fidelity:** prefer serviceable, visually consistent assets and reliable customization to unnecessary 4K artwork, endless revisions, or premature AAA polish.
5. **Minimal interruption:** make reversible, ordinary decisions independently; ask only when an essential product choice, authorization, or unavailable input blocks safe progress.
6. **Durability:** prefer the existing repository, existing files, reproducible tests, and clear version history over disconnected throwaway prototypes.
7. **Reporting:** default to one compact end-of-work report; no repetitive progress messages, inflated percentages, or claims of background execution.
8. **Execution limits:** commands guide work in the current execution only. Ongoing unattended work requires a separately configured automation or persistent agent.
9. Combined commands execute left-to-right (e.g. AUDIT REPAIR); COMPLETE supersedes CONTINUE for the same objective.
10. Scope-specific acceptance criteria and project documentation are authoritative for what constitutes finished.

## Cyberpunk RED active scope (at adoption)

Finish **one** usable Terry Avatar Studio + Cyberware Manager workflow before asking for review or expanding to the roster: coherent eight-angle display, portrait, save/load, correct left/right cyberware representation or explicit unavailable-art fallback, character-sheet data integration, responsive UI, and verified critical interactions. Use existing artwork where serviceable; preserve functionality. Do not treat fixed-preset prototypes as completed customization.

## Example

User: **COMPLETE**

Assistant: Work through the approved current objective, implement and verify, save results, then return a single honest completion report. No need for the user to restate the long directive.
