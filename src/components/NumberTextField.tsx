import React, { useEffect, useRef } from "react";
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export const NumberTextField = ({
  onChange: _onChange,
  ...props
}: Omit<TextFieldProps, "type">) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Disable changing the value on scroll
  useEffect(() => {
    const handleWheel = (e: any) => e.preventDefault();

    const textField = ref.current;
    textField?.addEventListener("wheel", handleWheel);

    return () => {
      textField?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const onChange: TextFieldProps["onChange"] = (e) => {
    if (parseInt(e.target.value) < 0) {
      return;
    }
    _onChange?.(e);
  };

  return <TextField type="number" ref={ref} onChange={onChange} {...props} />;
};
