import React, { useState } from "react";
import { Button } from "@mui/material";

export const SignIn = () => {
  const [signedIn, setSignedIn] = useState(false);

  const handleSignIn = () => {
    setSignedIn(true);
  };

  const handleSignOut = () => {
    setSignedIn(false);
  };

  const handleClick = signedIn ? handleSignOut : handleSignIn;

  return (
    <Button onClick={handleClick} color="inherit">
      {signedIn ? "Sign out" : "Sign in"}
    </Button>
  );
};
