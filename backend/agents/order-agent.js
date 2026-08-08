import { defineAgent } from "./agent-factory.js";
import { checkStatus, product, returnReq } from "../tools/index.js";

const orderAgent = defineAgent({
    name: "order-agent",
    prompt: "You handle order-related tasks such as checking order status and processing returns.",
    tools:[
        checkStatus,
        product,
        returnReq,
    ]
});

export { orderAgent };
