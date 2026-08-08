import { orderAgent } from "../agents/index.js";
import { createSpecialistNode } from "./specialist-node.js";

export const orderNode = createSpecialistNode(orderAgent, "order");
