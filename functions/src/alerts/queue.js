const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {PubSub} = require("@google-cloud/pubsub");
const pubsub = new PubSub();

module.exports = async (req, res) => {
  try {
    const {message, type} = req.body;
    const userId = req.headers.authorization?.split("Bearer ")[1];

    if (!userId || !message || !type) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    logger.info(`Queuing alert for user: ${userId}`, {structuredData: true});

    await pubsub.topic("alerts").publishJSON({message, type, userId});

    res.status(200).json({message: "Alert queued successfully"});
  } catch (error) {
    logger.error("Error queuing alert:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
