import { tool } from "@langchain/core/tools";
import { z } from "zod";

const payment = tool(
  async ({ amount, currency }) => {
    // Simulate a payment processing operation
    return { success: true, amount, currency };
  },
  {
    name: "payment",
    description: "Process a payment with a specified amount and currency.",
    schema: z.object({
      amount: z.number().finite().positive().describe("The amount to be paid."),
      currency: z
        .string()
        .trim()
        .length(3)
        .transform((value) => value.toUpperCase())
        .describe("The three-letter currency code for the payment."),
    }),
  },
);

export { payment };
