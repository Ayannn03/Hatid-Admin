import React, { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TabBar from "../tab-bar/tabBar";

const RATINGS_API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/rate/ratings";

function TopPerformingReport() {
  const [ratings, setRatings] = useState([]); // Store original ratings data
  const [groupedRatings, setGroupedRatings] = useState([]); // Store grouped ratings

  // Fetch ratings data
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(RATINGS_API_URL);
      const ratingsData = response.data;

      // Group ratings by driver and sum total ratings
      const grouped = ratingsData.reduce((acc, rating) => {
        const driver = rating.driver;
        const driverId = driver._id;

        if (!acc[driverId]) {
          acc[driverId] = {
            totalRating: 0,
            count: 0,
            name: driver.name,
            profilePic: driver.profilePic || 'default_image_url', // If no profile picture, use default
          };
        }

        acc[driverId].totalRating += rating.rating; // Sum total ratings
        acc[driverId].count += 1; // Count the number of ratings

        return acc;
      }, {});

      // Convert grouped data into an array and sort by totalRating
      const groupedArray = Object.values(grouped).sort((a, b) => b.totalRating - a.totalRating);
      setGroupedRatings(groupedArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate PDF for Top Performing Driver report
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Top Performing Drivers Report", 14, 20);

    // Prepare table data
    const tableData = groupedRatings.map((rating) => [
      rating.name,  // Driver Name
      `${rating.totalRating} pts`, // Total Ratings
      rating.count, // Rating Count
    ]);

    // Add table to PDF
    doc.autoTable({
      head: [["Driver Name", "Total Ratings", "Rating Count"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [44, 62, 80] }, // Navy header color
      margin: { left: 14, right: 14 },
    });

    // Save PDF
    doc.save("Top_Performing_Drivers_Report.pdf");
  };

  return (
    <div>
      <div className="report-main-content">
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 685,
            marginLeft: 2,
            maxWidth: "91.5%",
            marginTop: 3,
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell>Total Ratings</TableCell>
                <TableCell>Rating Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedRatings.map((rating, index) => (
                <TableRow key={index}>
                  <TableCell>{rating.name}</TableCell>
                  <TableCell>{rating.totalRating} pts</TableCell>
                  <TableCell>{rating.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div>
        <Button
          variant="contained"
          sx={{
            margin: 2,
            display: "block",
            "@media print": {
              display: "none", // Hide button in print view
            },
          }}
          onClick={downloadPDF} // Update function here
        >
          Download PDF
        </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TabBar />
      </Suspense>
    </div>
  );
}

export default TopPerformingReport;
