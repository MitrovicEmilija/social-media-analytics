/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { Box, Typography, TextField, Button, Avatar, CircularProgress, Snackbar, Alert, Divider, Grid } from "@mui/material";
import { format } from "date-fns";

const Profile = ({ user }) => {
  const [profile, setProfile] = useState({
    displayName: user.displayName || "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [stats, setStats] = useState({ transactionCount: 0, lastTransaction: null });
  const baseUrl = "http://localhost:5001/social-media-analytics-b1bd7/us-central1";

  // Fetch user stats (e.g., transaction count)
  const fetchStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/listTransactions?limit=1`, {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const { transactions } = await response.json();
      const countResponse = await fetch(`${baseUrl}/listTransactions?limit=0`, {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
      const countData = await countResponse.json();
      setStats({
        transactionCount: countData.transactions?.length || 0,
        lastTransaction: transactions[0]?.date
          ? format(new Date(transactions[0].date), "MM/dd/yyyy")
          : null,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      const idToken = await user.getIdToken();
      // Update backend
      const response = await fetch(`${baseUrl}/updateProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName: profile.displayName.trim(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      // Update client-side
      await updateProfile(user, {
        displayName: profile.displayName.trim(),
      });
      setSnackbar({ open: true, message: "Profile updated successfully", severity: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
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
        Profile
      </Typography>
      <Grid container spacing={2}>
        {/* User Info */}
        <Grid item xs={12} display="flex" justifyContent="center">
          <Avatar
            alt={profile.displayName || user.email}
            sx={{ width: 100, height: 100, mb: 2 }}
          >
            {profile.displayName ? profile.displayName[0] : user.email[0]}
          </Avatar>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">User: {user.email}</Typography>
        </Grid>
        {/* Stats */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Account Stats</Typography>
          <Typography variant="body2">
            Total Transactions: {stats.transactionCount}
          </Typography>
          <Typography variant="body2">
            Last Transaction: {stats.lastTransaction || "None"}
          </Typography>
        </Grid>
        {/* Update Form */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Update Profile</Typography>
          <form onSubmit={handleUpdateProfile}>
            <TextField
              label="Display Name"
              fullWidth
              margin="normal"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading || !profile.displayName.trim()}
            >
              {loading ? <CircularProgress size={24} /> : "Update Profile"}
            </Button>
          </form>
        </Grid>
      </Grid>
      {/* Feedback */}
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

export default Profile;