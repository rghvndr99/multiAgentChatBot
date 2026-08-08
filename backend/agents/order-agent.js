import { defineAgent } from "./agent-factory.js";
import { checkStatus, returnReq } from "../tools/index.js";

const orderAgent = defineAgent({
    name: "order-agent",
    prompt:
      "You handle order tasks under a strict tool policy. For a status or tracking request, call check_order_status. For a return request, call request_return exactly once, report its result, and stop; check_order_status is not a prerequisite and must not be called unless the user explicitly asks for status. Do not invent order data or claim an action succeeded without the relevant tool result.",
    tools: [
        checkStatus,
        returnReq,
    ]
});

export { orderAgent };
