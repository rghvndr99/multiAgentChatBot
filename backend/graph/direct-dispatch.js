import {
  checkStatus,
  invoice,
  payment,
  product,
  returnReq,
} from "../tools/index.js";

function normalizeIdentifier(value) {
  return value?.replace(/\s+/, "-").toUpperCase();
}

function extractOrderId(text) {
  return normalizeIdentifier(text.match(/\bORD[-\s]?\d[A-Z0-9]*\b/i)?.[0]);
}

function extractInvoiceNumber(text) {
  return normalizeIdentifier(text.match(/\bINV[-\s]?\d[A-Z0-9]*\b/i)?.[0]);
}

function extractProductName(text) {
  const match =
    text.match(/\b(?:of|for)\s+(.+?)(?:[?.!]|$)/i) ??
    text.match(/\b(?:show\s+me|find|look\s+up)\s+(.+?)(?:[?.!]|$)/i);

  return match?.[1]
    ?.replace(/^(?:the|a|an)\s+/i, "")
    .trim();
}

function requestText({ userMessage, messages }) {
  const latestUserMessages = messages
    .filter((message) => message?.role === "user")
    .map((message) => message.content)
    .slice(-2);

  return [...latestUserMessages, userMessage].filter(Boolean).join("\n");
}

async function tryDirectProduct(request, config) {
  const text = requestText(request);
  const productName = extractProductName(text);

  if (
    !productName ||
    /^(product|item)$/i.test(productName) ||
    !/\b(price|stock|available|availability|show\s+me)\b/i.test(text)
  ) {
    return null;
  }

  const result = await product.invoke({ name: productName }, config);
  return `${result.name} costs ${result.price} ${result.currency} and is ${result.inStock ? "in stock" : "out of stock"}.`;
}

async function tryDirectOrder(request, config) {
  const text = requestText(request);
  const orderId = extractOrderId(text);

  if (!orderId) return null;

  if (/\breturn\b/i.test(text)) {
    const reason =
      text.match(/\b(?:because|reason[:\s]+)\s*(.+?)(?:[.!]|$)/i)?.[1]?.trim() ??
      "Requested by customer";
    const result = await returnReq.invoke({ orderId, reason }, config);
    return result.success
      ? `Return request submitted for order ${result.orderId}. Reason: ${result.reason}.`
      : `The return request for order ${result.orderId} could not be submitted.`;
  }

  if (/\b(where|status|track|tracking|shipped|dispatch|delivery)\b/i.test(text)) {
    const result = await checkStatus.invoke({ orderId }, config);
    return `Order ${result.orderId} is currently ${result.status}.`;
  }

  return null;
}

async function tryDirectPayment(request, config) {
  const text = requestText(request);
  const invoiceNumber = extractInvoiceNumber(text);

  if (invoiceNumber && /\binvoice\b/i.test(text)) {
    const result = await invoice.invoke({ invoiceNumber }, config);
    return `Invoice ${result.invoiceNumber} is ${result.status} for ${result.amount} ${result.currency}, due ${result.dueDate}.`;
  }

  if (/\b(process|make|pay)\b[\s\S]*\b(payment|pay)\b|\bpayment\b[\s\S]*\bof\b/i.test(text)) {
    const paymentDetails = text.match(/\b(\d+(?:\.\d{1,2})?)\s*([A-Z]{3})\b/i);

    if (!paymentDetails) return null;

    const result = await payment.invoke(
      {
        amount: Number(paymentDetails[1]),
        currency: paymentDetails[2],
      },
      config,
    );
    return result.success
      ? `Payment of ${result.amount} ${result.currency} was processed successfully.`
      : `Payment of ${result.amount} ${result.currency} failed.`;
  }

  return null;
}

export { tryDirectOrder, tryDirectPayment, tryDirectProduct };
