/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable max-len */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const admin = require("firebase-admin");
const {getFunctions} = require("firebase-admin/functions");
const {PubSub} = require("@google-cloud/pubsub");

const pubsub = new PubSub();
const functions = getFunctions();

module.exports = async (req, res) => {
  try {
    const {platform, query, userId} = req.body;
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken || !platform || !query || !userId) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    // Verify ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.uid !== userId) {
      throw new HttpsError("unauthenticated", "Unauthorized user");
    }

    logger.info(`Fetching data for platform: ${platform}, query: ${query}, user: ${userId}`, {structuredData: true});

    // Hardcoded access token for testing (expires ~June 4, 2025, 12:00 PM CEST)
    const accessToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwianRpIjoicEFPV0RQT3BiTDdWZnFTb0JBNzItNlYwSHRpc1JBIiwiZXhwIjoxNzQ5MDMyNDQwLjkwOTAwOCwiaWF0IjoxNzQ4OTQ2MDQwLjkwOTAwOCwiY2lkIjoiRFdhQ3BsYTJCSUJLblo2TFRRbEhrUSIsImxpZCI6InQyXzFvb3hkNG40aHgiLCJhaWQiOiJ0Ml8xb294ZDRuNGh4Iiwic2NwIjoiZUp5S1Z0SlNpZ1VFQUFEX193TnpBU2MiLCJsY2EiOjE3NDYzOTQxMjE1MzIsImZsbyI6OX0.JgDxJODIaJATDxv1tCF6DaRvKnWpg6hIgpYHe_cLHgxHqfrI1yA1rQ-8kJo07-BIhgzqwYXepLWIk6w8NqHCeRBWj77oWxKnhpG0JLpBPw2mJhC1bUozuHJkGIsfL_2KtPdQ8HZjohGTcAH02nkq7arh68-b1azUjuwYP_bjsz7J-Fh9KsWRrDJ1_hs7DNMn-ExGLvPMl-64bTpes6wdstsip5BKaq8Zvom99RBPRUp5wREowIDADKBvZT2qNr_c7YPAXzTgTucGRJpkHx9Nb8-INbuvgdyvG5JF56e91k3Znzq3xgCo-FGCsN3HDNZuQIgH01HWhVq7-TI2_DjpOA";

    // Fetch from Reddit API
    let posts = [];
    if (platform === "reddit") {
      const response = await axios.get(
          `https://oauth.reddit.com/r/all/search?limit=10&q=${encodeURIComponent(query)}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "User-Agent": "SocialMediaAnalytics/1.0",
            },
          },
      );
      logger.info("Reddit search response received", {structuredData: true});
      logger.info("Reddit response data", {childrenCount: response.data.data.children.length, structuredData: true});

      posts = response.data.data.children
          .filter((child) => child.data && child.data.id && child.data.title && Number.isFinite(child.data.created_utc))
          .map((child) => {
            const createdAt = new Date(child.data.created_utc * 1000);
            if (isNaN(createdAt.getTime())) {
              logger.warn(`Invalid created_utc for post ${child.data.id}`, {structuredData: true});
              return null;
            }
            return {
              id: child.data.id,
              content: child.data.title,
              created_at: createdAt.toISOString(),
              platform: "reddit",
            };
          })
          .filter((post) => post !== null);

      if (posts.length === 0) {
        logger.warn(`No valid posts found for query: ${query}`, {structuredData: true});
      } else {
        logger.info(`Processed ${posts.length} valid posts`, {structuredData: true});
      }
    } else {
      throw new HttpsError("invalid-argument", "Unsupported platform");
    }

    // Store posts in user-specific subcollection
    const batch = admin.firestore().batch();
    for (const post of posts) {
      const postRef = admin.firestore().collection("users").doc(userId).collection("posts").doc(post.id);
      batch.set(postRef, {
        postId: post.id,
        content: post.content,
        platform: post.platform,
        timestamp: new Date(),
        userId,
        syncedAt: new Date(),
      });
    }
    await batch.commit();
    logger.info(`Stored ${posts.length} posts in Firestore`, {structuredData: true});

    // Publish to Pub/Sub for sentiment analysis
    for (const post of posts) {
      await pubsub.topic("social-data").publishMessage({
        json: {
          postId: post.id,
          content: post.content,
          platform: post.platform,
          timestamp: post.created_at,
          userId,
        },
      });
    }

    res.status(200).json({message: "Data fetched and queued", postCount: posts.length});
  } catch (error) {
    logger.error("Error fetching social data:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }, {structuredData: true});
    const status = error.code === "unauthenticated" ? 401 : error.response?.status || 400;
    res.status(status).json({error: error.message, details: error.response?.data});
  }
};
