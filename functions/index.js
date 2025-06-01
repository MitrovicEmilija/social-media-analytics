/* eslint-disable max-len */
const {onRequest} = require("firebase-functions/v2/https");
const {onMessagePublished} = require("firebase-functions/v2/pubsub");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// Authentication
exports.signUpUser = onRequest(require("./src/auth/signup"));
exports.loginUser = onRequest(require("./src/auth/login"));
exports.updateProfile = onRequest(require("./src/auth/updateProfile"));
exports.deleteAccount = onRequest(require("./src/auth/deleteAccount"));

// Data Collection
exports.fetchSocialData = onRequest(require("./src/data/fetch"));
exports.processSocialData = onMessagePublished({topic: "social-data"}, require("./src/data/process"));
exports.syncExternalData = onRequest(require("./src/data/sync"));

// Insights
exports.analyzeSentiment = onDocumentCreated({document: "posts/{postId}"}, require("./src/insights/sentiment"));
exports.getInsights = onRequest(require("./src/insights/insights"));
exports.updateTrends = onDocumentUpdated({document: "posts/{postId}"}, require("./src/insights/trends"));

// Alerts
exports.sendAlert = onMessagePublished({topic: "alerts"}, require("./src/alerts/send"));
exports.logNotification = onDocumentCreated({document: "notifications/{notificationId}"}, require("./src/alerts/log"));
exports.queueAlert = onRequest({region: "europe-west1"}, require("./src/alerts/queue"));

// Reports
exports.generateReport = onSchedule({schedule: "every 24 hours"}, require("./src/reports/generate"));
exports.processReportFile = onObjectFinalized(require("./src/reports/process"));
exports.exportReport = onRequest(require("./src/reports/export"));
