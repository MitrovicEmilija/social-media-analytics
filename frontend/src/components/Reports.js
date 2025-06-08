import React, { useState, useEffect } from "react";
import axios from "axios";
import { db, functionsUrl } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Box, Typography, Button, List, ListItem, ListItemText, CircularProgress } from "@mui/material";

const Reports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReports(fetchedReports);
      setError("");
    }, (err) => {
      setError(err.message);
    });
    return () => unsubscribe();
  }, [user]);

  const handleExport = async (reportId) => {
    setError("");
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${functionsUrl}/exportReport?reportId=${reportId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      window.open(response.data.url, "_blank");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Typography variant="h6">Available Reports</Typography>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      {reports.length === 0 ? (
        <Typography color="text.secondary">No reports found.</Typography>
      ) : (
        <List>
          {reports.map((report) => (
            <ListItem key={report.id}>
              <ListItemText
                primary={`Report ${report.id}`}
                secondary={`Created: ${report.createdAt?.toDate().toLocaleString() || "N/A"}`}
              />
              <Button
                variant="contained"
                onClick={() => handleExport(report.id)}
                disabled={loading}
              >
                Download
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Reports;