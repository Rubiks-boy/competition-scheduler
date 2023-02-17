import React from "react";
import { Button } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { isSignedInSelector } from "../../app/authSlice";
import { signIn, deleteAccessToken } from "../../utils/auth";

export const SignIn = () => {
  const isSignedIn = useAppSelector(isSignedInSelector);

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = () => {
    deleteAccessToken();
    window.location.reload();
  };

  const handleClick = isSignedIn ? handleSignOut : handleSignIn;

  return (
    <Button onClick={handleClick} color="inherit">
      {isSignedIn ? "Sign out" : "Sign in"}
    </Button>
  );
};
