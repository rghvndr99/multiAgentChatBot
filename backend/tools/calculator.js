import { tool } from "@langchain/core/tools";
import { z } from "zod";

const calculator = tool(
  async ({ a, b }) => a + b,
  {
    name: "calculator",
    description: "A simple calculator that adds two numbers.",
    schema: z.object({
      a: z.number().finite().describe("The first number to add."),
      b: z.number().finite().describe("The second number to add."),
    }),
  },
);

export { calculator };
