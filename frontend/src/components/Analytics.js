import React from "react";
import FetchData from "./FetchData";
import Insights from "./Insights";
import Trends from "./Trends";
import { Box, Typography, Grid } from "@mui/material";

const Analytics = ({ user }) => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FetchData user={user} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Insights user={user} />
          <Trends user={user} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;