## 1. Guidance Data Module

- [x] 1.1 Create a typed coverage-guidance module under `src/app/core/` containing the scenario list (manufacturing defect, accidental damage, liquid damage, wear and tear, cosmetic damage, unauthorized repair, theft/loss) with `covered | excluded | varies` verdicts and short plain-language explanations; verify it type-checks with `npm run build`
- [x] 1.2 Add the Singapore statutory baseline note and per-category notes to the module; verify the module compiles and the notes are reachable through its exported lookup
- [x] 1.3 Add unit tests asserting every scenario has a verdict and explanation, and that category lookup returns notes for mapped categories and nothing for unknown or unmapped ones; verify `npm test` passes

## 2. Guidance Resolution

- [x] 2.1 Add a single derived accessor in the warranty detail component that returns a guidance view model for a coverage; verify a unit test covers the covered, excluded, and varies cases
- [x] 2.2 Resolve the official-terms link from the coverage contact URL or the claim directory entry, and omit it when neither is available; verify a unit test covers present and absent links
- [x] 2.3 Return no guidance (so the block is not rendered) when guidance does not apply; verify a unit test covers the empty result

## 3. Product Detail UI

- [x] 3.1 Render the guidance block inside the expanded coverage panel with scenario verdicts, the statutory baseline, any category notes, the general-guidance disclaimer, and the official-terms link; verify a component test asserts each element renders when guidance is present
- [x] 3.2 Style the block visually distinct from the claim block, with a text verdict accompanying any color; verify light and dark theme contrast and that meaning is not color-only
- [x] 3.3 Confirm the coverage panel renders normally without a guidance block when no guidance applies; verify a component test for the empty case

## 4. Verification

- [x] 4.1 Run `npm run lint`, `npm test`, and `npm run build`; verify all pass
- [x] 4.2 Extend the detail-page accessibility check (AXE) to cover the guidance block; verify no new violations are reported
