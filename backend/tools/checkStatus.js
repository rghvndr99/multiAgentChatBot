import { tool } from "@langchain/core/tools";
import { z } from "zod";

const checkStatus = tool(
  async ({ orderId }) => ({ orderId, status: "processing" }),
  {
    name: "check_order_status",
    description:
      "Check an order's current status only when the user explicitly asks for status or tracking. Do not use this tool to validate or precheck a return request.",
    schema: z.object({
      orderId: z.string().trim().min(1).describe("The ID of the order to check."),
    }),
  },
);

export { checkStatus };
