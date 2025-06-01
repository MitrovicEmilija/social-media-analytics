/* eslint-disable max-len */
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (event) => {
  try {
    const {data} = event;
    const message = JSON.parse(Buffer.from(data, "base64").toString());
    const {postId, content, platform, timestamp} = message;

    if (!postId || !content || !platform || !timestamp) {
      throw new Error("Missing required fields in Pub/Sub message");
    }

    logger.info(`Processing social data for post: ${postId}`, {structuredData: true});

    await admin.firestore().collection("posts").doc(postId).set({
      postId,
      content,
      platform,
      timestamp: admin.firestore.Timestamp.fromDate(new Date(timestamp)),
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Post ${postId} processed successfully`, {structuredData: true});
  } catch (error) {
    logger.error("Error processing social data:", error, {structuredData: true});
    throw error;
  }
};
