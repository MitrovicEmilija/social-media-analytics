import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { functionsUrl } from "../firebase/firebaseConfig";
import { TextField, Button, Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const FetchData = ({ user }) => {
  const [platform, setPlatform] = useState("reddit");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, [user]);

  const handleFetch = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const idToken = await user.getIdToken();
      await axios.post(
        `${functionsUrl}/fetchSocialData`,
        { platform, query },
        { headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" } }
      );
      // Posts will update via Firestore listener
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5">Fetch Social Media Data</Typography>
      <form onSubmit={handleFetch}>
        <TextField
          label="Platform"
          fullWidth
          margin="normal"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        />
        <TextField
          label="Query"
          fullWidth
          margin="normal"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!platform.trim() || !query.trim()}
        >
          Fetch Data
        </Button>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      </form>
      <Typography variant="h6" sx={{ mt: 4 }}>Posts</Typography>
      {posts.length === 0 ? (
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          No posts found. Try fetching data with a different platform or query.
        </Typography>
      ) : (
        <List>
          {posts.map((post) => (
            <ListItem key={post.id}>
              <ListItemText
                primary={post.content}
                secondary={`Platform: ${post.platform} | Sentiment: ${post.sentiment?.score || "N/A"}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FetchData;