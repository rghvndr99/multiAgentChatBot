import { END, START, StateGraph } from "@langchain/langgraph";

import { state as GraphState } from "./state.js";

const requiredDependencies = [
  "routeRequest",
  "productNode",
  "orderNode",
  "paymentNode",
  "unsupportedNode",
  "combineNode",
];

export function createSupportGraph(dependencies = {}) {
  for (const dependency of requiredDependencies) {
    if (typeof dependencies[dependency] !== "function") {
      throw new TypeError(`createSupportGraph requires a ${dependency} function.`);
    }
  }

  const {
    routeRequest,
    productNode,
    orderNode,
    paymentNode,
    unsupportedNode,
    combineNode,
  } = dependencies;

  const supervisorNode = (state, config) =>
    routeRequest(state.userMessage, config, state.messages);

  return new StateGraph(GraphState)
    .addNode("supervisor", supervisorNode)
    .addNode("product", productNode)
    .addNode("order", orderNode)
    .addNode("payment", paymentNode)
    .addNode("none", unsupportedNode)
    .addNode("combine", combineNode)
    .addEdge(START, "supervisor")
    .addEdge("product", "combine")
    .addEdge("order", "combine")
    .addEdge("payment", "combine")
    .addEdge("none", "combine")
    .addEdge("combine", END)
    .addConditionalEdges("supervisor", (state) => state.routes)
    .compile();
}
