import { defineAgent } from "./agent-factory.js";
import { calculator, invoice, payment } from "../tools/index.js";

const paymentAgent = defineAgent({
    name: "payment-agent",
    prompt:
      "You handle payment and invoice tasks. Use payment to process payments, get_invoice for invoice requests, and calculator when arithmetic is required. Do not invent transaction or invoice data.",
    tools: [
        calculator,
        payment,
        invoice,
    ]
});

export { paymentAgent };
