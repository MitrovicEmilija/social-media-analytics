const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const PDFDocument = require("pdfkit");
const {Storage} = require("@google-cloud/storage");
const storage = new Storage();

module.exports = async (context) => {
  try {
    logger.info("Generating daily report", {structuredData: true});

    const postsSnapshot = await admin.firestore().collection("posts").get();
    const posts = postsSnapshot.results.map((doc) => doc.data());

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const bucket = storage.bucket("social-media-analytics-b1bd7.appspot.com");
      const file = bucket.file(`reports/report_${Date.now()}.pdf`);
      await file.save(pdfBuffer, {contentType: "application/pdf"});

      await admin.firestore().collection("reports").add({
        filePath: file.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Report generated successfully", {structuredData: true});
    });

    doc.text("Daily Social Media Report");
    posts.forEach((post) => {
      doc.text(`Post: ${post.content}, Sentiment: ${post.sentiment || "N/A"}`);
    });
    doc.end();
  } catch (error) {
    logger.error("Error generating report:", error, {structuredData: true});
    throw error;
  }
};
