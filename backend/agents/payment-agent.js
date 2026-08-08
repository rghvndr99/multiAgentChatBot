import { defineAgent } from "./agent-factory.js";
import { calculator, invoice, payment } from "../tools/index.js";

const paymentAgent = defineAgent({
    name: "payment-agent",
    prompt: "You handle payment-related tasks such as processing payments and managing invoices.",
    tools: [
        calculator,
        payment,
        invoice,
    ]
});

export { paymentAgent };
