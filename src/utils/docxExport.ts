
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportWillDocx(opts: { title?: string; content: string; filename?: string }) {
  const { title = "Will Draft", content, filename = "will-draft.docx" } = opts;

  const contentLines = content.split("\n");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({}),
          ...contentLines.map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                  }),
                ],
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}
