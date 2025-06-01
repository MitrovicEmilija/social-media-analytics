const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {displayName, preferences} = req.body;
    const userId = req.headers.authorization?.split("Bearer ")[1];

    if (!userId) {
      throw new HttpsError("unauthenticated", "No user ID provided");
    }

    logger.info(`Updating profile for user: ${userId}`, {structuredData: true});

    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (preferences) updates.preferences = preferences;

    await admin.auth().updateUser(userId, {displayName});
    await admin.firestore().collection("users").doc(userId).update(updates);

    res.status(200).json({message: "Profile updated successfully"});
  } catch (error) {
    logger.error("Error updating profile:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
