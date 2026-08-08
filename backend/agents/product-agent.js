import { defineAgent } from "./agent-factory.js";
import { product } from "../tools/index.js";

const productAgent = defineAgent({
    name: "product-agent",
    prompt: "You handle product-related tasks such as checking product availability.",
    tools: [
        product
    ]
});

export { productAgent };
