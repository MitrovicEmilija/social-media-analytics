import React, { useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Box, Typography } from "@mui/material";

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = isSignUp
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5">{isSignUp ? "Sign Up" : "Sign In"}</Typography>
      <form onSubmit={handleAuth}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button onClick={() => setIsSignUp(!isSignUp)} sx={{ mt: 1 }}>
          {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
        </Button>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      </form>
    </Box>
  );
};

export default Auth;