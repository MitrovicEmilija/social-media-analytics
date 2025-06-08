import React, { useState, useEffect } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import Auth from "./components/Auth";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Reports from "./components/Reports";
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const App = () => {
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} onClick={toggleDrawer(false)}>
      <List>
        {user && [
          { text: "Analytics", path: "/analytics" },
          { text: "Settings", path: "/settings" },
          { text: "Reports", path: "/reports" },
        ].map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {user && (
          <ListItem button onClick={handleSignOut}>
            <ListItemText primary="Sign Out" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Router>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Social Media Analytics
            </Typography>
            {user && (
              <Button color="inherit" onClick={handleSignOut} sx={{ display: { xs: "none", sm: "block" } }}>
                Sign Out
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerContent}
        </Drawer>
        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/analytics" />} />
            <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/" />} />
            <Route path="/reports" element={user ? <Reports user={user} /> : <Navigate to="/" />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;