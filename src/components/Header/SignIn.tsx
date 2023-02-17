import React from "react";
import { Button } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { isSignedInSelector, signIn, signOut } from "../../app/authSlice";

export const SignIn = () => {
  const isSignedIn = useAppSelector(isSignedInSelector);
  const dispatch = useAppDispatch();

  const handleSignIn = () => {
    dispatch(signIn());
  };

  const handleSignOut = () => {
    dispatch(signOut());
  };

  const handleClick = isSignedIn ? handleSignOut : handleSignIn;

  return (
    <Button onClick={handleClick} color="inherit">
      {isSignedIn ? "Sign out" : "Sign in"}
    </Button>
  );
};
