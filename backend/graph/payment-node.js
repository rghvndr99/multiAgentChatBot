import { paymentAgent } from "../agents/index.js";
import { tryDirectPayment } from "./direct-dispatch.js";
import { createSpecialistNode } from "./specialist-node.js";

export const paymentNode = createSpecialistNode(paymentAgent, "payment", {
  directHandler: tryDirectPayment,
});
