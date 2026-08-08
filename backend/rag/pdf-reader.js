import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

async function extractPdfText(pdfPath) {
  if (!pdfPath) {
    throw new Error("A PDF file path is required.");
  }

  const absolutePath = resolve(pdfPath);
  const pdfBuffer = await readFile(absolutePath);
  const parser = new PDFParse({ data: pdfBuffer });

  try {
    const result = await parser.getText();
    return { absolutePath, text: result.text };
  } finally {
    await parser.destroy();
  }
}

/**
 * Read a local PDF, print its extracted text, and return the text.
 *
 * @param {string} pdfPath - Absolute path or path relative to the current directory.
 * @returns {Promise<string>} Text extracted from the PDF.
 */
async function readPdf(pdfPath) {
  const { text } = await extractPdfText(pdfPath);
  console.log(text);
  return text;
}

/**
 * Extract and split a PDF into LangChain documents.
 * Each chunk contains at most 500 characters with a 100-character overlap.
 *
 * @param {string} pdfPath - Absolute path or path relative to the current directory.
 * @returns {Promise<import("@langchain/core/documents").Document[]>}
 */
async function chunkPdf(pdfPath) {
  const { absolutePath, text } = await extractPdfText(pdfPath);
  const documents = await splitter.createDocuments([text], [
    { source: absolutePath },
  ]);

  documents.forEach((document, index) => {
    document.metadata.chunkNumber = index + 1;
    console.log(`\n--- Chunk ${index + 1}/${documents.length} ---`);
    console.log(document.pageContent);
  });

  return documents;
}

export { chunkPdf, readPdf };

// Allows: node backend/rag/pdf-reader.js path/to/file.pdf
const isRunDirectly =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isRunDirectly) {
  chunkPdf(process.argv[2]).catch((error) => {
    console.error(`Could not chunk PDF: ${error.message}`);
    process.exitCode = 1;
  });
}
