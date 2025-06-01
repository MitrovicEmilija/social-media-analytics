import React, { useState } from "react";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";
import { functionsUrl } from "../firebase/firebaseConfig";
import { updateProfile } from "firebase/auth"; // Import updateProfile
import { TextField, Button, Box, Typography } from "@mui/material";

const Profile = ({ user }) => {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const idToken = await user.getIdToken();
      // Update profile via backend
      await axios.post(
        `${functionsUrl}/updateProfile`,
        { displayName },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      // Update profile client-side
      await updateProfile(user, { displayName });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5">Update Profile</Typography>
      <form onSubmit={handleUpdate}>
        <TextField
          label="Display Name"
          fullWidth
          margin="normal"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Update Profile
        </Button>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        {success && <Typography color="success.main" sx={{ mt: 1 }}>{success}</Typography>}
      </form>
    </Box>
  );
};

export default Profile;