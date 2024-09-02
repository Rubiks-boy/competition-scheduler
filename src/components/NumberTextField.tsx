import React, { useEffect, useRef } from "react";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export const NumberTextField = (props: Omit<TextFieldProps, "type">) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Disable changing the value on scroll
  useEffect(() => {
    const handleWheel = (e: any) => e.preventDefault();
    ref.current?.addEventListener("wheel", handleWheel);

    return () => {
      ref.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return <TextField type="number" ref={ref} {...props} />;
};
