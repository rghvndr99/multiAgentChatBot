# Next.js + Express + LangChain agent

A small learning project with:

- a Next.js chat interface on port `3000`
- an Express REST API on port `4000`
- a LangGraph supervisor that routes to product, order, and payment agents
- sample product, order-status, return, payment, invoice, and calculator tools
- deterministic routing and direct tool dispatch for confident requests, with an
  OpenAI fallback for ambiguous language

## Run it

1. Copy `.env.example` to `.env`.
2. Put your OpenAI API key in `.env`.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open <http://localhost:3000>.

## REST API

Send the conversation to `POST http://localhost:4000/api/chat`:

```json
{
  "messages": [
    { "role": "user", "content": "Show me iPhone 16" }
  ]
}
```

The response is:

```json
{ "reply": "..." }
```

The browser keeps the chat history and includes it in each request, so the agent has conversational context. The OpenAI key remains only in the Express process.

## Testing

Run the deterministic backend test suite with:

```bash
npm test
```

Run it with a coverage report using:

```bash
npm run test:coverage
```

The expected multi-agent behavior is defined in
[`tests/contracts/graph-invariants.md`](tests/contracts/graph-invariants.md).
The deterministic and live-model test tiers are explained in
[`tests/README.md`](tests/README.md).

Confident product, order, payment, invoice, return, and unsupported requests avoid
model calls. Ambiguous requests use the model router, successful fallback routes
are cached by a bounded SHA-256 key, and fallback agents receive only the six most
recent messages.
