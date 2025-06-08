/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken) {
      throw new HttpsError("unauthenticated", "No authentication token provided");
    }

    // Verify ID token and extract userId
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (!userId || typeof userId !== "string" || userId.length > 128) {
      throw new HttpsError("invalid-argument", "Invalid user ID");
    }

    logger.info(`Deleting account for user: ${userId}`, {structuredData: true});

    // Delete user-specific data
    await Promise.all([
      admin.auth().deleteUser(userId),
      admin.firestore().collection("users").doc(userId).delete(),
    ]);

    res.status(200).json({message: "Account deleted successfully"});
  } catch (error) {
    logger.error("Error deleting account:", error, {structuredData: true});
    const status = error.code === "unauthenticated" ? 401 : 400;
    res.status(status).json({error: error.message});
  }
};
