import { createSupportGraph } from "./create-support-graph.js";
import { routeRequest } from "./master-route.js";
import { productNode } from "./productNode.js";
import { orderNode } from "./order-node.js";
import { paymentNode } from "./payment-node.js";
import { combineNode } from "./combine-node.js";
import { unsupportedNode } from "./unsupported-node.js";

export const graph = createSupportGraph({
  routeRequest,
  productNode,
  orderNode,
  paymentNode,
  unsupportedNode,
  combineNode,
});

export { createSupportGraph };
