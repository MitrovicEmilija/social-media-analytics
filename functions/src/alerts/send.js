const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (event) => {
  try {
    const {data} = event;
    const message = JSON.parse(Buffer.from(data, "base64").toString());
    const {postId, sentiment} = message;

    logger.info(`Sending alert for post: ${postId}`, {structuredData: true});

    const payload = {
      notification: {
        title: "Social Media Alert",
        body: `Post ${postId} has ${sentiment} sentiment`,
      },
    };

    await admin.messaging().send(payload);

    logger.info(`Alert sent for post: ${postId}`, {structuredData: true});
  } catch (error) {
    logger.error("Error sending alert:", error, {structuredData: true});
    throw error;
  }
};
