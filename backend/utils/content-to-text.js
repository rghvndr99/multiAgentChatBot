function contentToText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");

  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n");
}

function requireText(content, source = "Response") {
  const text = contentToText(content).trim();

  if (!text) {
    throw new Error(`${source} produced an empty response.`);
  }

  return text;
}

export { contentToText, requireText };
