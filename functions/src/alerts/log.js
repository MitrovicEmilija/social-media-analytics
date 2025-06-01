/* eslint-disable max-len */
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (event, context) => {
  try {
    const notification = event.data.data();
    const {notificationId} = context.params;

    logger.info(`Logging notification: ${notificationId}`, {structuredData: true});

    await admin.firestore().collection("notification_logs").add({
      message: notification.message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Notification logged: ${notificationId}`, {structuredData: true});
  } catch (error) {
    logger.error("Error logging notification:", error, {structuredData: true});
    throw error;
  }
};
