import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Box, Typography, Card, CardContent } from "@mui/material";

const Trends = ({ user }) => {
  const [trends, setTrends] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "trends"), (snapshot) => {
      const fetchedTrends = snapshot.docs.map((doc) => ({
        hashtag: doc.id,
        ...doc.data(),
      }));
      setTrends(fetchedTrends.sort((a, b) => b.count - a.count).slice(0, 5));
      setError("");
    }, (err) => {
      setError(err.message);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">Trending Hashtags</Typography>
      <Card>
        <CardContent>
          {trends.length === 0 ? (
            <Typography color="text.secondary">No trends found.</Typography>
          ) : (
            trends.map((trend) => (
              <Typography key={trend.hashtag}>
                {trend.hashtag}: {trend.count} mentions
              </Typography>
            ))
          )}
          {error && <Typography color="error">{error}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Trends;