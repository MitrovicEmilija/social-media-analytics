import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { functionsUrl } from "../firebase/firebaseConfig";
import { Box, Typography, Card, CardContent, CardActions, Button } from "@mui/material";

const Insights = ({ user }) => {
  const [insights, setInsights] = useState({ sentimentCounts: { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 }, totalPosts: 0 });
  const [error, setError] = useState("");

  const fetchInsights = useCallback(async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(`${functionsUrl}/getInsights`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      setInsights(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchInsights();
  }, [user, fetchInsights]);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6">Sentiment Insights</Typography>
      <Card>
        <CardContent>
          <Typography>Positive: {insights.sentimentCounts.POSITIVE}</Typography>
          <Typography>Negative: {insights.sentimentCounts.NEGATIVE}</Typography>
          <Typography>Neutral: {insights.sentimentCounts.NEUTRAL}</Typography>
          <Typography>Total Posts: {insights.totalPosts}</Typography>
          {error && <Typography color="error">{error}</Typography>}
        </CardContent>
        <CardActions>
          <Button onClick={fetchInsights}>Refresh Insights</Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Insights;