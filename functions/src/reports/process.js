/* eslint-disable max-len */
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");
const {Storage} = require("@google-cloud/storage");
const storage = new Storage();

module.exports = async (event) => {
  try {
    const file = event.data;
    const filePath = file.name;

    if (!filePath.startsWith("reports/") || !filePath.endsWith(".csv")) {
      return;
    }

    logger.info(`Processing report file: ${filePath}`, {structuredData: true});

    const bucket = storage.bucket("social-media-analytics-b1bd7.appspot.com");
    const [csvContent] = await bucket.file(filePath).download();
    const rows = csvContent.toString().split("\n");

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfFile = bucket.file(filePath.replace(".csv", ".pdf"));
      await pdfFile.save(pdfBuffer, {contentType: "application/pdf"});

      await admin.firestore().collection("reports").add({
        filePath: pdfFile.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`Report processed: ${pdfFile.name}`, {structuredData: true});
    });

    rows.forEach((row) => doc.text(row));
    doc.end();
  } catch (error) {
    logger.error("Error processing report file:", error, {structuredData: true});
    throw error;
  }
};
