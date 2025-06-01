import React, { useState, useEffect } from "react";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Auth from "./components/Auth";
import FetchData from "./components/FetchData";
import Profile from "./components/Profile";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Social Media Analytics
          </Typography>
          {user && (
            <Button color="inherit" onClick={() => auth.signOut()}>
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        {!user ? (
          <Auth setUser={setUser} />
        ) : (
          <>
            <Profile user={user} />
            <FetchData user={user} />
          </>
        )}
      </Box>
    </Box>
  );
};

export default App;