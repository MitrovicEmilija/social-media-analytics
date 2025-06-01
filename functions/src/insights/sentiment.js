/* eslint-disable max-len */
const logger = require("firebase-functions/logger");
const {LanguageServiceClient} = require("@google-cloud/language");
const language = new LanguageServiceClient();
const {PubSub} = require("@google-cloud/pubsub");
const pubsub = new PubSub();

module.exports = async (event, context) => {
  try {
    const post = event.data.data();
    const {postId, content} = post;

    logger.info(`Analyzing sentiment for post: ${postId}`, {structuredData: true});

    const document = {content, type: "PLAIN_TEXT"};
    const [result] = await language.analyzeSentiment({document});
    const sentiment = result.documentSentiment.score > 0 ? "POSITIVE" : result.documentSentiment.score < 0 ? "NEGATIVE" : "NEUTRAL";

    await event.data.ref.update({sentiment});

    if (sentiment === "NEGATIVE") {
      await pubsub.topic("alerts").publishJSON({postId, sentiment});
    }

    logger.info(`Sentiment updated for post: ${postId}`, {structuredData: true});
  } catch (error) {
    logger.error("Error analyzing sentiment:", error, {structuredData: true});
    throw error;
  }
};
