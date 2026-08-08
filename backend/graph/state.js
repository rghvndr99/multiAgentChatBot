import { Annotation } from "@langchain/langgraph";

export const state = Annotation.Root({
  userMessage: Annotation(),
  messages: Annotation(),
  routes: Annotation({
    default: () => [],
    reducer: (_current, next) => next,
  }),
  routingSource: Annotation(),
  responses: Annotation({
    default: () => [],
    reducer: (current, next) => current.concat(next),
  }),
  finalResponse: Annotation(),
});
