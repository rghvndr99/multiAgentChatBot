import { defineAgent } from "./agent-factory.js";
import { product } from "../tools/index.js";

const productAgent = defineAgent({
    name: "product-agent",
    prompt:
      "You handle product questions. Use get_product for product availability, price, and stock information. Do not invent product data when the tool can provide it.",
    tools: [
        product
    ]
});

export { productAgent };
