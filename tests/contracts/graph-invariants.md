# Multi-agent graph invariants

These invariants define the behavior that the support graph must preserve. Each
invariant has a stable ID so tests can refer to the rule they protect.

## Routing

- **ROUTE-01 — Supervisor entry:** Every invocation starts at `supervisor`.
- **ROUTE-02 — Non-empty selection:** The supervisor selects at least one route.
- **ROUTE-03 — Route allowlist:** A selected route is one of `product`, `order`,
  `payment`, or `none`.
- **ROUTE-04 — Unique routes:** A route executes no more than once per invocation.
- **ROUTE-05 — Exclusive fallback:** `none` cannot be combined with a specialist
  route.
- **ROUTE-06 — Selection integrity:** Only selected specialist nodes execute.

## Execution and aggregation

- **EXEC-01 — Single execution:** Every selected specialist executes exactly once.
- **EXEC-02 — Parallel safety:** Multiple selected specialists may complete in any
  order without losing or duplicating responses.
- **EXEC-03 — Response collection:** Every successful selected specialist contributes
  one response to the graph state.
- **EXEC-04 — Single combination:** `combine` executes exactly once after the selected
  specialist work completes.
- **EXEC-05 — Terminal response:** A successful invocation produces a non-empty
  `finalResponse` before reaching `END`.
- **EXEC-06 — Unsupported response:** An unsupported request returns the configured
  fallback response instead of throwing a server error.

## State

- **STATE-01 — Invocation isolation:** Routes, responses, messages, and final output
  from one invocation never appear in another invocation.
- **STATE-02 — Conversation preservation:** Each selected specialist receives the
  conversation supplied to the current invocation.
- **STATE-03 — Configuration propagation:** Each selected specialist receives the
  LangGraph runtime configuration for the current invocation.

## Agents and tools

- **TOOL-01 — Tool allowlist:** An agent can call only tools assigned to that agent.
- **TOOL-02 — Input validation:** Invalid tool arguments are rejected by the tool
  schema before business logic runs.
- **TOOL-03 — Failure visibility:** A tool failure is surfaced as a controlled graph
  failure or an explicitly defined partial-result response; it is never silently
  treated as success.

## Invalid and failed execution

- **FAIL-01 — Invalid routing output:** Malformed JSON, missing routes, empty routes,
  and unknown route names fail with a routing error.
- **FAIL-02 — Empty specialist output:** A missing or empty specialist response cannot
  produce a successful empty answer.
- **FAIL-03 — Combiner failure:** A combiner failure is propagated as a graph failure.
- **FAIL-04 — Bounded execution:** Cancellation, timeout, and recursion configuration
  are propagated so an invocation cannot run indefinitely.

## Planned test mapping

| Test suite | Invariants |
| --- | --- |
| `route-parser.test.js` | ROUTE-02 through ROUTE-05, FAIL-01 |
| `master-route.test.js` | STATE-03, FAIL-04 |
| `graph-routing.test.js` | ROUTE-01, ROUTE-06, EXEC-01, EXEC-04, EXEC-06 |
| `parallel-routing.test.js` | EXEC-02 through EXEC-05 |
| `state-isolation.test.js` | STATE-01 |
| `specialist-nodes.test.js` | STATE-02, STATE-03, FAIL-02, FAIL-04 |
| `tool-permissions.test.js` | TOOL-01 |
| `tools.test.js` | TOOL-02, TOOL-03 |
| `graph-failures.test.js` | TOOL-03, FAIL-02 through FAIL-04 |

An invariant is considered protected only when its mapped deterministic test exists
and passes. Live-model evaluations will later measure routing and tool-selection
quality; they do not replace these deterministic guarantees.
