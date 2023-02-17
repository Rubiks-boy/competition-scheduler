export const formatTime = (date?: Date) => {
  return (
    date?.toLocaleTimeString("default", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) ?? ""
  );
};
