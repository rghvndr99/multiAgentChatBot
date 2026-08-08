# Backend test strategy

The test suite separates deterministic orchestration guarantees from live model
quality evaluations.

## Deterministic tests

These tests do not call OpenAI:

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:coverage
```

They use injected fake routers and specialist nodes to protect graph topology,
parallel fan-out/fan-in, state isolation, cancellation, failure propagation,
tool schemas, tool allowlists, output validation, and trace behavior.

`npm test` includes the live-evaluation files, but they are skipped unless their
explicit environment flags are enabled.

## Live routing evaluation

```bash
npm run test:eval:routing
```

This command loads `.env` and sends every labelled case through production
`routeRequest()`. Confident cases must select their route deterministically. A
deliberately ambiguous semantic case must call the real model returned by
`getOpenAIModel()`, proving the fallback remains functional. Cases include normal
requests, spelling errors, multi-agent requests, contextual follow-ups,
unsupported requests, and prompt-injection attempts.

The live routing test does not accept a merely parseable response: the real route
selection must match the labelled expectation.

## Live specialist tool-selection evaluation

```bash
npm run test:eval:tools
```

This invokes each production ReAct agent with the real configured OpenAI model and
the production tools. A callback records actual tool starts. Each test requires:

1. The expected allowed tool appears in the observed tool sequence.
2. Tool execution completes successfully.
3. The agent returns a non-empty final response.

The current cases cover product lookup, order status, return request, invoice
lookup, and payment processing. The tools in this learning project are local
simulations; no real order, invoice, or payment system is modified.

## Running every live evaluation

```bash
npm run test:eval
```

To exercise the complete production graph—including real routing, specialist tool
selection, parallel branches, and the response combiner—run:

```bash
npm run test:eval:graph
```

The optimized production graph uses deterministic routing, direct tool dispatch,
parallel branches, and deterministic response aggregation for confident requests.
Those cases assert a zero-model-call budget. The routing evaluation also contains
a deliberately ambiguous semantic case that must use the real LLM fallback, so
the cost optimization does not remove the escape hatch.

The full-graph evaluation distinguishes required tools from allowed tools and
enforces a minimum tool-call precision. This keeps unexpected side-effecting tools
forbidden while making safe but inefficient extra reads visible as a measurable
quality gap.

Live evaluations consume API quota and can vary when the configured model changes.
Keep them opt-in or scheduled. Deterministic tests should run on every change; live
evaluations should run when prompts, models, tool descriptions, routing labels, or
agent permissions change.

## Failure policy

The current graph uses an all-or-nothing policy. If one selected specialist fails,
the complete graph invocation fails and `combine` does not run. A future partial
result policy must change both the invariant contract and `graph-failures.test.js`.
