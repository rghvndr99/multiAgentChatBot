const defaultMessageLimit = 6;

function getRecentMessages(messages, limit = defaultMessageLimit) {
  if (!Array.isArray(messages)) return [];
  return messages.slice(-limit);
}

export { defaultMessageLimit, getRecentMessages };
