/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {email, password, displayName} = req.body;
    if (!email || !password || !displayName) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    logger.info(`Creating user with email: ${email}`, {structuredData: true});

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({message: "User created successfully", uid: userRecord.uid});
  } catch (error) {
    logger.error("Error signing up user:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
