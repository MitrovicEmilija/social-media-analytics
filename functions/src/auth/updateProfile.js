/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {displayName, preferences} = req.body;
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      throw new HttpsError("unauthenticated", "No ID token provided");
    }

    // Verify ID token to get UID
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    if (!userId) {
      throw new HttpsError("unauthenticated", "Invalid user ID");
    }

    logger.info(`Updating profile for user: ${userId}`, {structuredData: true});

    // Prepare updates for Firebase Authentication
    const authUpdates = {};
    if (displayName) authUpdates.displayName = displayName;

    // Prepare updates for Firestore
    const firestoreUpdates = {};
    if (displayName) firestoreUpdates.displayName = displayName;
    if (preferences) firestoreUpdates.preferences = preferences;

    // Update Firebase Authentication
    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(userId, authUpdates);
    }

    // Update Firestore users collection
    if (Object.keys(firestoreUpdates).length > 0) {
      await admin.firestore().collection("users").doc(userId).set(firestoreUpdates, {merge: true});
    }

    res.status(200).json({message: "Profile updated successfully"});
  } catch (error) {
    logger.error("Error updating profile:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
