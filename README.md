# Next.js + Express + LangChain agent

A small learning project with:

- a Next.js chat interface on port `3000`
- an Express REST API on port `4000`
- a LangGraph supervisor that routes to product, order, and payment agents
- sample product, order-status, return, payment, invoice, and calculator tools

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
