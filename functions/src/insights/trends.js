const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (change, context) => {
  try {
    const {postId} = context.params;
    const afterData = change.after.data();
    const content = afterData.content || "";

    logger.info(`Updating trends for post: ${postId}`, {structuredData: true});

    const hashtags = content.match(/#\w+/g) || [];
    const trendsRef = admin.firestore().collection("trends");

    for (const hashtag of hashtags) {
      await trendsRef.doc(hashtag).set({
        count: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, {merge: true});
    }

    logger.info(`Trends updated for post: ${postId}`, {structuredData: true});
  } catch (error) {
    logger.error("Error updating trends:", error, {structuredData: true});
    throw error;
  }
};
