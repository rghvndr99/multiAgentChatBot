import { tool } from "@langchain/core/tools";
import { z } from "zod";

const checkStatus = tool(
  async ({ orderId }) => ({ orderId, status: "processing" }),
  {
    name: "check_order_status",
    description: "Check the current status of an order.",
    schema: z.object({
      orderId: z.string().describe("The ID of the order to check."),
    }),
  },
);

export { checkStatus };
