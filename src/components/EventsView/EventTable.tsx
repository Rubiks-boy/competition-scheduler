import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

export const EventTable = ({
  children,
}: {
  children: Array<JSX.Element | null>;
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Event</TableCell>
          <TableCell>Competitors</TableCell>
          <TableCell>Groups</TableCell>
          <TableCell>Ratio</TableCell>
          <TableCell>Scheduled Time</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  );
};
