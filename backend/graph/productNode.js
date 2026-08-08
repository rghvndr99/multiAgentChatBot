import { productAgent } from "../agents/index.js";
import { createSpecialistNode } from "./specialist-node.js";

export const productNode = createSpecialistNode(productAgent, "product");
