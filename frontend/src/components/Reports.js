/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { saveAs } from "file-saver";

const Reports = ({ user }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const baseUrl = "http://localhost:5001/social-media-analytics-b1bd7/us-central1";

  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: "Please select both start and end dates", severity: "error" });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setSnackbar({ open: true, message: "End date must be after start date", severity: "error" });
      return;
    }

    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      const response = await fetch(
        `${baseUrl}/exportTransactionsToPDF?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }
      const blob = await response.blob();
      saveAs(blob, `transactions_${startDate}_to_${endDate}.pdf`);
      setSnackbar({ open: true, message: "PDF exported successfully", severity: "success" });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Reports
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2, mb: 2 }}
          disabled={loading}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2, mb: 2 }}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleExportPDF}
          disabled={loading || !startDate || !endDate}
        >
          {loading ? <CircularProgress size={24} /> : "Export to PDF"}
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;