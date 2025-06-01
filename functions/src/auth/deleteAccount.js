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

    logger.info(`Deleting account for user: ${userId}`, {structuredData: true});

    await admin.auth().deleteUser(userId);
    await admin.firestore().collection("users").doc(userId).delete();

    res.status(200).json({message: "Account deleted successfully"});
  } catch (error) {
    logger.error("Error deleting account:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
