/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

const validateTransaction = (data) => {
  const {amount, category, description, date} = data;
  if (!Number.isFinite(amount)) {
    throw new HttpsError("invalid-argument", "Valid amount is required");
  }
  if (!category || typeof category !== "string" || !category.trim()) {
    throw new HttpsError("invalid-argument", "Valid category is required");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    throw new HttpsError("invalid-argument", "Valid description is required");
  }
  if (!date || isNaN(new Date(date).getTime())) {
    throw new HttpsError("invalid-argument", "Valid date is required");
  }
};

module.exports = async (req, res) => {
  try {
    const {amount, category, description, date} = req.body;
    logger.info("Received request body:", {amount, category, description, date}, {structuredData: true});
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken) {
      throw new HttpsError("unauthenticated", "Missing authentication token");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    validateTransaction({amount, category, description, date});

    const transactionRef = admin.firestore().collection("users").doc(userId).collection("transactions").doc();
    const transactionData = {
      amount,
      category,
      description,
      date: new Date(date).toISOString(),
      userId,
      createdAt: FieldValue.serverTimestamp(),
    };

    await transactionRef.set(transactionData);
    logger.info(`Transaction added for user: ${userId}`, {structuredData: true});

    res.status(200).json({message: "Transaction added", transactionId: transactionRef.id});
  } catch (error) {
    logger.error("Error adding transaction:", {message: error.message}, {structuredData: true});
    const status = error.code === "unauthenticated" ? 401 : 400;
    res.status(status).json({error: error.message});
  }
};
