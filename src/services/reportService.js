import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

function createHeading(text, level = HeadingLevel.HEADING_2) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { after: 200 },
  });
}

function createParagraph(text) {
  return new Paragraph({
    children: [new TextRun(text ?? '')],
    spacing: { after: 200 },
  });
}

function buildExtractionTable(matrix, fields) {
  if (!matrix?.length) {
    return [];
  }
  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph('Estudio')] }),
      ...fields.map((field) => new TableCell({ children: [new Paragraph(field)] })),
    ],
  });

  const dataRows = matrix.map((entry) => {
    const rowCells = [
      new TableCell({ children: [new Paragraph(entry.paperTitle ?? 'Sin título')] }),
      ...fields.map((field) =>
        new TableCell({ children: [new Paragraph(entry.data?.[field] ?? 'No reportado')] })
      ),
    ];
    return new TableRow({ children: rowCells });
  });

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
  ];
}

export async function generateReportDocx({ project, picoData, candidates, screeningResults, extractionMatrix, discussionText, fields }) {
  const doc = new Document({
    creator: 'Yachay AI',
    title: project?.title ?? 'Informe Yachay AI',
    sections: [
      {
        children: [
          createHeading(project?.title ?? 'Informe de Revisión Sistemática', HeadingLevel.TITLE),
          createParagraph(`Autor: ${project?.userId ?? 'Investigador'}`),
          createParagraph(`Fecha: ${new Date().toLocaleDateString('es-ES')}`),
          createHeading('Introducción'),
          createParagraph(`Pregunta PICO: ${picoData?.question ?? 'No definida'}`),
          createParagraph(
            `P: ${picoData?.population ?? 'No reportado'} | I: ${picoData?.intervention ?? 'No reportado'} | C: ${
              picoData?.comparison ?? 'No reportado'
            } | O: ${picoData?.outcome ?? 'No reportado'}`
          ),
          createHeading('Métodos'),
          createParagraph(`Fuentes consultadas: Semantic Scholar, PubMed y bases manuales (Fase 2).`),
          createParagraph(`Total de resultados iniciales: ${candidates?.length ?? 0}.`),
          createHeading('Resultados del cribado'),
          createParagraph(
            `Estudios incluidos tras cribado inteligente: ${screeningResults?.filter((r) => r.manualDecision === 'include').length ?? 0}.`
          ),
          createParagraph(
            `Estudios excluidos: ${screeningResults?.filter((r) => r.manualDecision === 'exclude').length ?? 0}.`
          ),
          createHeading('Matriz de extracción'),
          ...buildExtractionTable(extractionMatrix ?? [], fields),
          createHeading('Discusión'),
          createParagraph(discussionText ?? 'Por elaborar.'),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${project?.title ?? 'informe'}-yachay-ai.docx`);
}
