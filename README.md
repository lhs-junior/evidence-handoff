# Evidence handoff contract

A small, deterministic TypeScript example: finding evidence is different from delivering it to the next worker.

## Run

```sh
bun install
bun run check
bun test
bun run demo
bun run regression
bun run src/demo.ts missing
```

`demo` exits 0 and emits JSON with `preserved: true`. `regression` deliberately loses collected clues, emits `preserved: false`, and exits 1. `missing` exits 2. An unknown mode exits 64. A nonzero regression result is the expected demonstration, not a broken test suite.

## What to inspect

- `src/handoff.ts`: explicit unchecked / no-match / matched states and inputs for code and data workers.
- `src/handoff.test.ts`: both recipients, every clue, missing search, no-match, a broken baseline and the real CLI process.
- `src/demo.ts`: identical synthetic evidence fed to corrected and defective paths.

The invariant compares structured clues, not wording in a prompt. Both analyst inputs retain `requires-current-verification`; a historical observation cannot become a verified current conclusion just by being copied.

## Scope

This project is independently written educational code with invented data. It does not contain company source, records, service names, credentials or private identifiers. It does not reproduce a production service.

There is no LLM, retrieval service or network call. Tests prove this handoff contract, not whether a model follows instructions or whether analysis is accurate. Unlike a workflow that may only warn, this example deliberately blocks unchecked search to make the three-state contract visible.

## Design choices

Discriminated unions prevent a matched result without clues. A single builder provides the same structured evidence to both recipients. The defective path exists only to show that the invariant detects dropped evidence. No runtime dependencies or timing-based tests are required.
