const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      throw new HttpsError("invalid-argument", "Missing email or password");
    }

    logger.info(`Logging in user: ${email}`, {structuredData: true});

    const userRecord = await admin.auth().getUserByEmail(email);
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({token: customToken});
  } catch (error) {
    logger.error("Error logging in user:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
