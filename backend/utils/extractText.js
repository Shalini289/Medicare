const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const Tesseract = require("tesseract.js");

const extractText = async (filePath) => {
  if (filePath.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: fs.readFileSync(filePath) });

    try {
      const data = await parser.getText();
      return data.text;
    } finally {
      await parser.destroy();
    }
  } else {
    const result = await Tesseract.recognize(filePath, "eng");
    return result.data.text;
  }
};

module.exports = extractText;
