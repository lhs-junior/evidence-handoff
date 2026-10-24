import { brokenHandoff, handoff, preservesEvidence } from "./handoff";
import type { SearchResult } from "./handoff";

const syntheticSearch: SearchResult = {
  kind: "matched",
  clues: [
    { source: "synthetic-case-a", observation: "Inspect the update boundary." },
    { source: "synthetic-case-b", observation: "Check omitted and empty fields separately." },
  ],
};

const mode = process.argv[2] ?? "corrected";
switch (mode) {
  case "corrected":
  case "broken": {
    const result = mode === "broken" ? brokenHandoff() : handoff(syntheticSearch);
    const preserved = preservesEvidence(syntheticSearch, result);
    console.log(JSON.stringify({ mode, preserved, result }, null, 2));
    process.exitCode = preserved ? 0 : 1;
    break;
  }
  case "missing": {
    const result = handoff({ kind: "unchecked" });
    console.log(JSON.stringify({ mode, result }, null, 2));
    process.exitCode = 2;
    break;
  }
  default:
    console.error(JSON.stringify({ error: "unknown-mode", allowed: ["corrected", "broken", "missing"] }));
    process.exitCode = 64;
}
