import React from "react";
import { Button } from "@mui/material";
import { useSelector } from "../../app/hooks";
import { signIn, deleteAccessToken } from "../../utils/auth";
import { isSignedInSelector } from "../../app/selectors";

export const SignIn = () => {
  const isSignedIn = useSelector(isSignedInSelector);

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
