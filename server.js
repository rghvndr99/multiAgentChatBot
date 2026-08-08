import cors from "cors";
import express from "express";
import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAgentTrace } from "./backend/agents/index.js";
import { graph } from "./backend/graph/index.js";

// Always load .env beside this file, even when Node is launched elsewhere.
const projectDirectory = dirname(fileURLToPath(import.meta.url));
config({ path: join(projectDirectory, ".env"), quiet: true });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: webOrigin }));
app.use(express.json({ limit: "100kb" }));

function contentToText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");

  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/chat", async (request, response) => {
  const { messages } = request.body ?? {};
  const requestId = randomUUID().slice(0, 8);

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.some((message) => message?.role === "user") ||
    messages.some(
      (message) =>
        !["user", "assistant"].includes(message?.role) ||
        typeof message?.content !== "string" ||
        !message.content.trim(),
    )
  ) {
    return response.status(400).json({
      error:
        "messages must be a non-empty array of user/assistant messages containing a user message",
    });
  }

  const startedAt = Date.now();
  const latestUserMessage = messages.findLast(
    (message) => message.role === "user",
  ).content;
  const trace = createAgentTrace(requestId);
  console.log(
    `\n[trace:${requestId}] graph:start messages=${messages.length}`,
  );

  try {
    const result = await graph.invoke(
      {
        messages,
        userMessage: latestUserMessage,
      },
      {
        callbacks: [trace.handler],
        metadata: { requestId },
      },
    );
    const reply = contentToText(result.finalResponse);
    const toolSequence = trace.getToolSequence();

    console.log(
      `[trace:${requestId}] graph:end routes=${result.routes.join(",")} durationMs=${Date.now() - startedAt} tools=${toolSequence.length ? toolSequence.join(" -> ") : "none"}`,
    );

    return response.json({ reply });
  } catch (error) {
    console.error(
      `[trace:${requestId}] graph:error durationMs=${Date.now() - startedAt} error=${error.message ?? String(error)}`,
    );
    const missingKey = error.message?.startsWith("OPENAI_API_KEY is missing");

    return response.status(missingKey ? 503 : 500).json({
      error: missingKey
        ? error.message
        : "The agent could not produce a response. Check the server logs.",
    });
  }
});

app.listen(port, () => {
  console.log(`Express API listening on http://localhost:${port}`);
  console.log(`OpenAI API key loaded: ${process.env.OPENAI_API_KEY ? "yes" : "no"}`);
});
