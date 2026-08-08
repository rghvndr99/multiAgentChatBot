import { createSupportGraph } from "./create-support-graph.js";
import { routeRequest } from "./master-route.js";
import { productNode } from "./productNode.js";
import { orderNode } from "./order-node.js";
import { paymentNode } from "./payment-node.js";
import { combineNode } from "./combine-node.js";

const unsupportedNode = () => ({
  responses: [
    "I can only help with product, order, payment, refund, invoice, return, and cancellation questions.",
  ],
});

export const graph = createSupportGraph({
  routeRequest,
  productNode,
  orderNode,
  paymentNode,
  unsupportedNode,
  combineNode,
});

export { createSupportGraph };
