/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {PubSub} = require("@google-cloud/pubsub");
const pubsub = new PubSub();

module.exports = async (req, res) => {
  try {
    const {platform, query} = req.body;
    const userId = req.headers.authorization?.split("Bearer ")[1];

    if (!userId || !platform || !query) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    logger.info(`Fetching ${platform} data for query: ${query} from Firestore`, {structuredData: true});

    // Query Firestore posts collection
    const postsRef = admin.firestore().collection("posts");
    const snapshot = await postsRef
        .where("platform", "==", platform)
        .where("content", ">=", query)
        .where("content", "<=", query + "\uf8ff")
        .limit(10)
        .get();

    // Map Firestore documents to expected format
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.postId,
        text: data.content,
        created_at: data.timestamp.toDate().toISOString(),
      };
    });

    // Publish to Pub/Sub
    for (const post of posts) {
      await pubsub.topic("social-data").publishMessage({
        json: {
          postId: post.id,
          content: post.text,
          platform,
          timestamp: post.created_at,
        },
      });
    }

    res.status(200).json({message: "Data fetched and queued"});
  } catch (error) {
    logger.error("Error fetching social data from Firestore:", error, {structuredData: true});
    res.status(400).json({error: error.message});
  }
};
