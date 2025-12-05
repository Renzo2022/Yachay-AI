import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

function pickPageIndexes(totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const firstFive = [1, 2, 3, 4, 5];
  const lastTwo = [totalPages - 1, totalPages];
  return [...firstFive, ...lastTwo];
}

export async function extractTextFromPDF(file) {
  if (!file) {
    throw new Error('No se proporcionó un archivo PDF.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pagesToRead = pickPageIndexes(pdf.numPages);
  const chunks = [];

  for (const pageNumber of pagesToRead) {
    try {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(' ');
      chunks.push(`\n--- Página ${pageNumber} ---\n${text}`);
    } catch (error) {
      console.warn(`No se pudo extraer la página ${pageNumber}`, error);
    }
  }

  let fullText = chunks.join('\n');
  if (fullText.length > 20000) {
    fullText = fullText.slice(0, 20000);
  }

  return fullText;
}
