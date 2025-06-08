/* eslint-disable max-len */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-unused-vars */
const { HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

const validateTransaction = (data) => {
  const { amount, category, description, date } = data;
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
    const { transactionId, amount, category, description, date } = req.body;
    logger.info("Received request body:", { transactionId, amount, category, description, date }, { structuredData: true });
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

    validateTransaction({ amount, category, description, date });

    const transactionRef = admin.firestore().collection("users").doc(userId).collection("transactions").doc(transactionId);
    const doc = await transactionRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      throw new HttpsError("not-found", "Transaction not found or unauthorized");
    }

    const transactionData = {
      amount,
      category,
      description,
      date: new Date(date).toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await transactionRef.update(transactionData);
    logger.info(`Transaction updated: ${transactionId}`, { structuredData: true });

    res.status(200).json({ message: "Transaction updated" });
  } catch (error) {
    logger.error("Error updating transaction:", { message: error.message }, { structuredData: true });
    const status = error.code === "unauthenticated" ? 401 : error.code === "not-found" ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};
