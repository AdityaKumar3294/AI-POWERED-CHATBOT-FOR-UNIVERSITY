const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const documentsPath = path.join(
  __dirname,
  "../knowledge/documents"
);

// Minimum amount of meaningful text required
// for a PDF to be added to the knowledge base.
const MIN_PDF_TEXT_LENGTH = 100;

// Detect PDF extraction output that contains
// only page markers or other useless text.
const isMeaningfulPdfText = (text) => {
  if (!text || !text.trim()) {
    return false;
  }

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  // Remove common PDF page markers
  const withoutPageMarkers = cleanedText
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .trim();

  // Check minimum meaningful content
  if (withoutPageMarkers.length < MIN_PDF_TEXT_LENGTH) {
    return false;
  }

  return true;
};

const loadDocuments = async () => {
  try {
    const files = fs.readdirSync(documentsPath);

    const documents = [];

    for (const file of files) {
      const filePath = path.join(
        documentsPath,
        file
      );

      // ==============================
      // TEXT FILE
      // ==============================

      if (file.endsWith(".txt")) {
        try {
          const content = fs.readFileSync(
            filePath,
            "utf-8"
          );

          if (!content.trim()) {
            console.warn(
              `⚠️ Skipping empty TXT file: ${file}`
            );

            continue;
          }

          documents.push({
            filename: file,
            type: "text",
            content,
          });

          console.log(
            `📄 Loaded TXT: ${file}`
          );

        } catch (error) {
          console.error(
            `❌ Failed to read TXT: ${file}`,
            error.message
          );
        }
      }

      // ==============================
      // PDF FILE
      // ==============================

      else if (file.endsWith(".pdf")) {
        try {
          const stats = fs.statSync(filePath);

          if (stats.size === 0) {
            console.warn(
              `⚠️ Skipping empty PDF: ${file}`
            );

            continue;
          }

          const buffer = fs.readFileSync(
            filePath
          );

          const parser = new PDFParse({
            data: buffer,
          });

          const result =
            await parser.getText();

          await parser.destroy();

          const extractedText =
            result?.text || "";

          // Check whether extracted text
          // is actually useful.
          if (
            !isMeaningfulPdfText(
              extractedText
            )
          ) {
            console.warn(
              `⚠️ Skipping PDF with insufficient readable text: ${file}`
            );

            continue;
          }

          documents.push({
            filename: file,
            type: "pdf",
            content: extractedText,
          });

          console.log(
            `📕 Loaded PDF: ${file}`
          );

        } catch (error) {
          console.error(
            `❌ Failed to process PDF: ${file}`,
            error.message
          );
        }
      }
    }

    console.log(
      `📚 Loaded ${documents.length} knowledge document(s)`
    );

    return documents;

  } catch (error) {
    console.error(
      "Document loading error:",
      error
    );

    return [];
  }
};

module.exports = {
  loadDocuments,
};