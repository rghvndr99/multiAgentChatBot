import { paymentAgent } from "../agents/index.js";
import { createSpecialistNode } from "./specialist-node.js";

export const paymentNode = createSpecialistNode(paymentAgent, "payment");
