import { tool } from "@langchain/core/tools";
import { z } from "zod";

const invoice = tool(
  async ({ invoiceNumber }) => ({
    invoiceNumber,
    amount: 125,
    currency: "USD",
    dueDate: "2026-08-31",
    status: "open",
  }),
  {
    name: "get_invoice",
    description: "Retrieve information about an invoice.",
    schema: z.object({
      invoiceNumber: z
        .string()
        .trim()
        .min(1)
        .describe("The number of the invoice."),
    }),
  },
);

export { invoice };
