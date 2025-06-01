/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const userId = req.headers.authorization?.split("Bearer ")[1];

    if (!userId) {
      throw new HttpsError("unauthenticated", "No user ID provided");
    }

    logger.info(`Fetching insights for user: ${userId}`, {structuredData: true});

    const postsSnapshot = await admin.firestore().collection("posts").get();
    const sentimentCounts = {POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0};

    postsSnapshot.results.forEach((doc) => {
      const sentiment = doc.data().sentiment || "NEUTRAL";
      sentimentCounts[sentiment]++;
    });

    res.status(200).json({sentimentCounts});
  } catch (error) {
    logger.error("Error fetching insights:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
