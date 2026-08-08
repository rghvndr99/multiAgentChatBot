import { productAgent } from "../agents/index.js";
import { tryDirectProduct } from "./direct-dispatch.js";
import { createSpecialistNode } from "./specialist-node.js";

export const productNode = createSpecialistNode(productAgent, "product", {
  directHandler: tryDirectProduct,
});
