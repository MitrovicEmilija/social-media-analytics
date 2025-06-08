/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {startDate, endDate, limit = 10} = req.query;
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken) {
      throw new HttpsError("unauthenticated", "Missing authentication token");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    let query = admin.firestore().collection("users").doc(userId).collection("transactions");

    if (startDate && !isNaN(new Date(startDate).getTime())) {
      query = query.where("date", ">=", new Date(startDate).toISOString());
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      query = query.where("date", "<=", new Date(endDate).toISOString());
    }

    query = query.orderBy("date", "desc").limit(parseInt(limit));

    const snapshot = await query.get();
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Listed ${transactions.length} transactions for user: ${userId}`, {structuredData: true});

    res.status(200).json({transactions});
  } catch (error) {
    logger.error("Error listing transactions:", {message: error.message}, {structuredData: true});
    const status = error.code === "unauthenticated" ? 401 : 400;
    res.status(status).json({error: error.message});
  }
};
