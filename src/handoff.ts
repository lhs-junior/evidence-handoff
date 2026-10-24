export type Clue = {
  readonly source: string;
  readonly observation: string;
};

export type SearchResult =
  | { readonly kind: "unchecked" }
  | { readonly kind: "no-match" }
  | { readonly kind: "matched"; readonly clues: readonly [Clue, ...Clue[]] };

export type AnalystInput = {
  readonly role: "code" | "data";
  readonly search: Exclude<SearchResult, { readonly kind: "unchecked" }>;
  readonly conclusionStatus: "requires-current-verification";
};

export type Handoff =
  | { readonly kind: "blocked"; readonly reason: "search-not-checked" }
  | { readonly kind: "ready"; readonly analysts: readonly [AnalystInput, AnalystInput] };

function exhaustive(value: never): never {
  return value;
}

export function handoff(search: SearchResult): Handoff {
  switch (search.kind) {
    case "unchecked":
      return { kind: "blocked", reason: "search-not-checked" };
    case "no-match":
    case "matched":
      return {
        kind: "ready",
        analysts: [
          { role: "code", search, conclusionStatus: "requires-current-verification" },
          { role: "data", search, conclusionStatus: "requires-current-verification" },
        ],
      };
    default:
      return exhaustive(search);
  }
}

// Deliberately defective baseline: the collector succeeded, the handoff lost its result.
export function brokenHandoff(): Handoff {
  return handoff({ kind: "no-match" });
}

export function preservesEvidence(source: SearchResult, output: Handoff): boolean {
  const rolesValid =
    output.kind === "ready" &&
    output.analysts[0].role === "code" &&
    output.analysts[1].role === "data";
  switch (source.kind) {
    case "unchecked":
      return output.kind === "blocked" && output.reason === "search-not-checked";
    case "no-match":
      return (
        output.kind === "ready" &&
        rolesValid &&
        output.analysts.every(
          (input) =>
            input.search.kind === "no-match" &&
            input.conclusionStatus === "requires-current-verification",
        )
      );
    case "matched":
      return (
        output.kind === "ready" &&
        rolesValid &&
        output.analysts.every(
          (input) =>
            input.search.kind === "matched" &&
            input.conclusionStatus === "requires-current-verification" &&
            input.search.clues.length === source.clues.length &&
            input.search.clues.every(
              (clue, index) =>
                clue.source === source.clues[index]?.source &&
                clue.observation === source.clues[index]?.observation,
            ),
        )
      );
    default:
      return exhaustive(source);
  }
}
