import { StateGraph, START, END } from "@langchain/langgraph";

import { state as GraphState } from "./state.js";
import { routeRequest } from "./master-route.js";
import { productNode } from "./productNode.js";
import { orderNode } from "./order-node.js";
import { paymentNode } from "./payment-node.js";
import { combineNode } from "./combine-node.js";

const supervisorNode = (state) => routeRequest(state.userMessage);

const unsupportedNode = () => ({
  responses: [
    "I can only help with product, order, payment, refund, invoice, return, and cancellation questions.",
  ],
});

const workflow = new StateGraph(GraphState)
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
  .addConditionalEdges("supervisor", (state) => state.routes);

export const graph = workflow.compile();
