/* eslint-disable max-len */
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Authentication
exports.signUpUser = onRequest(require("./src/auth/signup"));
exports.loginUser = onRequest(require("./src/auth/login"));
exports.updateProfile = onRequest(require("./src/auth/updateProfile"));
exports.deleteAccount = onRequest(require("./src/auth/deleteAccount"));

// Data Collection
exports.addTransaction = onRequest(require("./src/data/add"));
exports.updateTransaction = onRequest(require("./src/data/update"));
exports.deleteTransaction = onRequest(require("./src/data/delete"));
exports.listTransactions = onRequest(require("./src/data/list"));
exports.exportTransactionsToPDF = onRequest(require("./src/reports/export"));
