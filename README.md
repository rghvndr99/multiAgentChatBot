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

## LangSmith tracing

LangSmith tracing is optional and disabled by default. To inspect graph runs,
routes, model calls, tool inputs and outputs, latency, and errors, create a
LangSmith API key and set these values in `.env`:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=multi-agent-chatbot-dev
LANGCHAIN_CALLBACKS_BACKGROUND=true
```

Restart `npm run dev`, send a chat message, and open the configured project in
LangSmith. Each request is named `support-chat-request` and includes the local
request ID, service name, and environment as searchable trace metadata.

Tracing can include conversation content and tool inputs/outputs. Keep it off for
sensitive requests unless the data is redacted or your retention and access
policies explicitly allow it. The LangSmith API key belongs only in the server's
`.env`; never expose it through a `NEXT_PUBLIC_` variable.
