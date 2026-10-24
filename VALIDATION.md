# Validation record

Validated locally on 2026-10-24 with Bun 1.3.8 on macOS arm64.

| Check | Observed result |
|---|---|
| Language-server diagnostics | 3 TypeScript files, 0 errors |
| `bun run check` | Exit 0 |
| `bun test` | 13 pass, 0 fail |
| Corrected CLI | Exit 0, `preserved: true` |
| Broken baseline CLI | Exit 1, `preserved: false` |
| Missing-search CLI | Exit 2, verified by real subprocess test |
| Unknown mode | Exit 64, verified by real subprocess test |

Review found that intact clues could hide duplicated recipient roles in the invariant. The invariant now requires a code recipient followed by a data recipient; two negative tests verify duplicate-role rejection. The final test run includes that correction.

No network or model calls run in the example. No production behavior, adoption, time savings or model accuracy is inferred from these results.
