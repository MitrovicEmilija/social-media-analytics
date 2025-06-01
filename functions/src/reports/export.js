/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {Storage} = require("@google-cloud/storage");
const storage = new Storage();
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {reportId} = req.query;
    const userId = req.headers.authorization?.split("Bearer ")[1];

    if (!userId || !reportId) {
      throw new HttpsError("invalid-argument", "Missing report ID or user ID");
    }

    logger.info(`Exporting report: ${reportId}`, {structuredData: true});

    const reportDoc = await admin.firestore().collection("reports").doc(reportId).get();
    if (!reportDoc.exists) {
      throw new HttpsError("not-found", "Report not found");
    }

    const filePath = reportDoc.data().filePath;
    const bucket = storage.bucket("social-media-analytics-b1bd7.appspot.com");
    const file = bucket.file(filePath);
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({url: signedUrl});
  } catch (error) {
    logger.error("Error exporting report:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
