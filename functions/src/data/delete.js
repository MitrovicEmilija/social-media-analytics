/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {transactionId} = req.body;
    logger.info("Received request body:", {transactionId}, {structuredData: true});
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken) {
      throw new HttpsError("unauthenticated", "Missing authentication token");
    }
    if (!transactionId) {
      throw new HttpsError("invalid-argument", "Transaction ID is required");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const transactionRef = admin.firestore().collection("users").doc(userId).collection("transactions").doc(transactionId);
    const doc = await transactionRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      throw new HttpsError("not-found", "Transaction not found or unauthorized");
    }

    await transactionRef.delete();
    logger.info(`Transaction deleted: ${transactionId}`, {structuredData: true});

    res.status(200).json({message: "Transaction deleted"});
  } catch (error) {
    logger.error("Error deleting transaction:", {message: error.message}, {structuredData: true});
    const status = error.code === "unauthenticated" ? 401 : error.code === "not-found" ? 404 : 400;
    res.status(status).json({error: error.message});
  }
};
