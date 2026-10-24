import { expect, test } from "bun:test";
import { brokenHandoff, handoff, preservesEvidence } from "./handoff";
import type { SearchResult } from "./handoff";

const evidence: SearchResult = {
  kind: "matched",
  clues: [
    { source: "case-one", observation: "field boundary" },
    { source: "case-two", observation: "related write" },
  ],
};

test("preserves every clue for both analysts when search matched", () => {
  // Given: two distinct clues.
  // When: the real handoff builds analyst inputs.
  const result = handoff(evidence);
  // Then: both inputs receive both facts and their own roles.
  expect(result).toEqual({
    kind: "ready",
    analysts: [
      { role: "code", search: evidence, conclusionStatus: "requires-current-verification" },
      { role: "data", search: evidence, conclusionStatus: "requires-current-verification" },
    ],
  });
});

test("blocks missing search instead of presenting it as no match", () => {
  // Given: no completed search.
  // When: the handoff is attempted.
  const result = handoff({ kind: "unchecked" });
  // Then: callers can distinguish missing search from a genuine empty result.
  expect(result).toEqual({ kind: "blocked", reason: "search-not-checked" });
});

test("allows a completed search with no match without inventing evidence", () => {
  // Given: completed search with no relevant case.
  // When: inputs are constructed.
  const result = handoff({ kind: "no-match" });
  // Then: both analysts know current investigation is still required.
  expect(result).toEqual({
    kind: "ready",
    analysts: [
      { role: "code", search: { kind: "no-match" }, conclusionStatus: "requires-current-verification" },
      { role: "data", search: { kind: "no-match" }, conclusionStatus: "requires-current-verification" },
    ],
  });
});

test("rejects the broken baseline under the same evidence invariant", () => {
  // Given: collector evidence exists.
  // When: the defective baseline loses it.
  const result = preservesEvidence(evidence, brokenHandoff());
  // Then: collection success cannot mask handoff failure.
  expect(result).toBe(false);
});

test("accepts the corrected handoff under that invariant", () => {
  // Given: the same collector evidence.
  // When: the corrected implementation passes it on.
  const result = preservesEvidence(evidence, handoff(evidence));
  // Then: the evidence invariant holds.
  expect(result).toBe(true);
});

test("detects loss from just one analyst input", () => {
  // Given: one analyst receives a false no-match.
  const partial = {
    kind: "ready",
    analysts: [
      { role: "code", search: evidence, conclusionStatus: "requires-current-verification" },
      { role: "data", search: { kind: "no-match" }, conclusionStatus: "requires-current-verification" },
    ],
  } as const;
  // When: the invariant examines both recipients.
  const result = preservesEvidence(evidence, partial);
  // Then: checking only the first recipient cannot pass.
  expect(result).toBe(false);
});

test("does not modify the collector evidence", () => {
  // Given: frozen collector data.
  const frozen = Object.freeze({ kind: "no-match" } as const);
  // When: inputs are built.
  const result = handoff(frozen);
  // Then: evidence is propagated without writes.
  expect(result.kind).toBe("ready");
  expect(frozen).toEqual({ kind: "no-match" });
});

for (const role of ["code", "data"] as const) {
  test(`rejects duplicate ${role} recipients even with intact evidence`, () => {
    // Given: evidence is present but both recipients have the same role.
    const duplicated = {
      kind: "ready",
      analysts: [
        { role, search: evidence, conclusionStatus: "requires-current-verification" },
        { role, search: evidence, conclusionStatus: "requires-current-verification" },
      ],
    } as const;
    // When: the handoff invariant evaluates its recipients.
    const result = preservesEvidence(evidence, duplicated);
    // Then: the missing recipient cannot be hidden by duplicated evidence.
    expect(result).toBe(false);
  });
}

for (const [mode, exitCode] of [["corrected", 0], ["broken", 1], ["missing", 2], ["unknown", 64]] as const) {
  test(`CLI reports exit ${exitCode} for ${mode}`, () => {
    // Given: a mode and the real CLI, without a mock.
    // When: a subprocess executes it.
    const result = Bun.spawnSync({
      cmd: [process.execPath, new URL("./demo.ts", import.meta.url).pathname, mode],
    });
    // Then: the external caller observes the contract.
    expect(result.exitCode).toBe(exitCode);
  });
}
