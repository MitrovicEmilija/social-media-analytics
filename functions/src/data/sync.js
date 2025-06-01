/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {postId, content, platform, timestamp} = req.body;

    if (!postId || !content || !platform || !timestamp) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    logger.info(`Syncing external data for post: ${postId}`, {structuredData: true});

    await admin.firestore().collection("posts").doc(postId).set({
      postId,
      content,
      platform,
      timestamp: admin.firestore.Timestamp.fromDate(new Date(timestamp)),
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({message: "Webhook data synced"});
  } catch (error) {
    logger.error("Error syncing external data:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
