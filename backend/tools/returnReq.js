import { tool } from "@langchain/core/tools";
import { z } from "zod";

const returnReq = tool(
  async ({ orderId, reason }) => {
    // Simulate a return request operation
    return { success: true, orderId, reason };
  },
  {
    name: "request_return",
    description: "Submit a return request for an order.",
    schema: z.object({
      orderId: z
        .string()
        .trim()
        .min(1)
        .describe("The ID of the order for which to request a return."),
      reason: z.string().trim().min(1).describe("The reason for the return."),
    }),
  },
);

export { returnReq };
