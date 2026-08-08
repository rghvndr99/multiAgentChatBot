const unsupportedResponse =
  "I can only help with product, order, payment, refund, invoice, return, and cancellation questions.";

function unsupportedNode() {
  return { responses: [unsupportedResponse] };
}

export { unsupportedNode, unsupportedResponse };
