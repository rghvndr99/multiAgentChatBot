import { orderAgent } from "../agents/index.js";
import { tryDirectOrder } from "./direct-dispatch.js";
import { createSpecialistNode } from "./specialist-node.js";

export const orderNode = createSpecialistNode(orderAgent, "order", {
  directHandler: tryDirectOrder,
});
