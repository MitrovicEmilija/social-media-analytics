import React, { useState, useEffect } from "react";
import axios from "axios";
import { db, functionsUrl } from "../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { TextField, Button, Box, Typography, Card, CardContent } from "@mui/material";

const FetchData = ({ user }) => {
  const [platform, setPlatform] = useState("reddit");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "posts"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
    }, (err) => {
      setError(err.message);
    });
    return () => unsubscribe();
  }, [user]);

  const handleFetch = async (e) => {
    e.preventDefault();
    setError("");
    if (!platform.trim() || !searchQuery.trim()) {
      setError("Platform and query are required.");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      await axios.post(
        `${functionsUrl}/fetchSocialData`,
        { platform, query: searchQuery, userId: user.uid },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">Fetch Posts</Typography>
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!platform.trim() || !searchQuery.trim()}
        >
          Fetch Data
        </Button>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      </form>
      <Typography variant="h6" sx={{ mt: 3 }}>Posts</Typography>
      {posts.length === 0 ? (
        <Typography sx={{ color: "text.secondary" }}>
          No posts found. Try fetching with a different platform or query.
        </Typography>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ mb: 1 }}>
            <CardContent>
              <Typography>{post.content}</Typography>
              <Typography color="text.secondary">
                Platform: {post.platform} | Sentiment: {post.sentiment || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default FetchData;