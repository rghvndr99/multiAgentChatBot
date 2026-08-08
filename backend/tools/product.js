import { tool } from "@langchain/core/tools";
import { z } from "zod";

const product = tool(
  async ({ name }) => ({ name, price: 49.99, currency: "USD", inStock: true }),
  {
    name: "get_product",
    description: "Retrieve information about a product.",
    schema: z.object({
      name: z.string().describe("The name of the product."),
    }),
  },
);

export { product };
