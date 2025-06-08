/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const {HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const latex = require("node-latex");
const {Buffer} = require("buffer");

module.exports = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken) {
      throw new HttpsError("unauthenticated", "Missing authentication token");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    let query = admin.firestore().collection("users").doc(userId).collection("transactions");

    if (startDate && !isNaN(new Date(startDate).getTime())) {
      query = query.where("date", ">=", new Date(startDate).toISOString());
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      query = query.where("date", "<=", new Date(endDate).toISOString());
    }

    query = query.orderBy("date", "desc");

    const snapshot = await query.get();
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (transactions.length === 0) {
      throw new HttpsError("not-found", "No transactions found for the specified period");
    }

    const latexContent = `
\\documentclass{article}
\\usepackage{geometry}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{pdflscape}
\\usepackage{siunitx}
\\geometry{a4paper, margin=1in}
\\sisetup{round-mode=places, round-precision=2}
\\begin{document}
\\section*{Financial Transactions Report}
\\begin{landscape}
\\begin{longtable}{lllr}
\\toprule
Date & Category & Description & Amount (\\$) \\\\
\\midrule
${transactions.map((t) => `${new Date(t.date).toLocaleDateString("en-US")} & ${t.category.replace(/&/g, "\\&")} & ${t.description.replace(/&/g, "\\&")} & \\SI{${t.amount}}{} \\\\`).join("\n")}
\\bottomrule
\\end{longtable}
\\end{landscape}
\\end{document}
`;

    const pdfBuffer = await new Promise((resolve, reject) => {
      const output = [];
      const latexStream = latex(latexContent);
      latexStream.on("data", (chunk) => output.push(chunk));
      latexStream.on("end", () => resolve(Buffer.concat(output)));
      latexStream.on("error", (err) => reject(err));
    });

    logger.info(`Generated PDF for ${transactions.length} transactions for user: ${userId}`, {structuredData: true});

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.pdf");
    res.status(200).send(pdfBuffer);
  } catch (error) {
    logger.error("Error exporting transactions to PDF:", {message: error.message}, {structuredData: true});
    const status = error.code === "unauthenticated" ? 401 : error.code === "not-found" ? 404 : 400;
    res.status(status).json({error: error.message});
  }
};
