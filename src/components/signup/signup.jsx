import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const RatingsTable = ({ driverRatings, profileData }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ fontWeight: "bold", textAlign: "left" }}>Passenger Name</TableCell>
          <TableCell style={{ fontWeight: "bold", textAlign: "left" }}>Booking ID</TableCell>
          <TableCell style={{ fontWeight: "bold", textAlign: "center" }}>Rating</TableCell>
          <TableCell style={{ fontWeight: "bold", textAlign: "left" }}>Feedback</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {driverRatings[profileData._id]?.map((rating, index) => (
          <TableRow key={index}>
            {/* Passenger Name */}
            <TableCell style={{ textAlign: "left" }}>
              {rating.user?.name ? rating.user.name : "N/A"}
            </TableCell>
            {/* Booking ID */}
            <TableCell style={{ textAlign: "left" }}>
              {rating.booking ? rating.booking : "N/A"}
            </TableCell>
            {/* Rating */}
            <TableCell style={{ textAlign: "center" }}>
              {rating.rating !== undefined ? rating.rating : "N/A"}
            </TableCell>
            {/* Feedback */}
            <TableCell style={{ textAlign: "left" }}>
              {rating.feedback?.trim() ? rating.feedback : "No Feedback Provided"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RatingsTable;
