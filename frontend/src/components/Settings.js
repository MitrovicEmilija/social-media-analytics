import React, { useState } from "react";
import axios from "axios";
import { auth, functionsUrl } from "../firebase/firebaseConfig";
import { updateProfile } from "firebase/auth";
import { Box, Typography, TextField, Button, Divider, CircularProgress, Alert } from "@mui/material";

const Profile = ({ user }) => {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      await axios.post(
        `${functionsUrl}/updateProfile`,
        { displayName },
        { headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" } }
      );
      await updateProfile(user, { displayName });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">Update Profile</Typography>
      <form onSubmit={handleUpdate}>
        <TextField
          label="Display Name"
          fullWidth
          margin="normal"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Update Profile"}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
      </form>
    </Box>
  );
};

const DeleteAccount = ({ user, onSignOut }) => {
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      await axios.post(
        `${functionsUrl}/deleteAccount`,
        {},
        { headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" } }
      );
      await auth.signOut();
      onSignOut();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Delete Account</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        This action is irreversible. All your data will be deleted.
      </Typography>
      {!confirm ? (
        <Button
          variant="outlined"
          color="error"
          onClick={() => setConfirm(true)}
          disabled={loading}
        >
          Delete Account
        </Button>
      ) : (
        <>
          <Typography>Are you sure?</Typography>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm Delete"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setConfirm(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </>
      )}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </Box>
  );
};

const Settings = ({ user }) => {
  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Profile user={user} />
      <Divider sx={{ my: 4 }} />
      <DeleteAccount user={user} onSignOut={handleSignOut} />
    </Box>
  );
};

export default Settings;