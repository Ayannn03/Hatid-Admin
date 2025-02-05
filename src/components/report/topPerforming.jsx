import React, { useState, useEffect, useCallback, Suspense } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TabBar from "../tab-bar/tabBar";

const RATINGS_API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/rate/ratings";

function TopPerformingReport() {
  const [ratings, setRatings] = useState([]); // Store original ratings data
  const [groupedRatings, setGroupedRatings] = useState([]); // Store grouped ratings
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [openPreview, setOpenPreview] = useState(false); // State for preview modal
  const [pdfUrl, setPdfUrl] = useState(""); // Store generated PDF data URL

  // Fetch ratings data
  const fetchData = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching data
    setError(null); // Reset any previous errors
    try {
      const response = await axios.get(RATINGS_API_URL);
      const ratingsData = response.data;

      // Group ratings by driver and sum total ratings
      const grouped = ratingsData.reduce((acc, rating) => {
        const driver = rating.driver;

        // Ensure rating and driver are not null/undefined before accessing their properties
        if (!driver || !driver._id) return acc;

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
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoading(false); // Set loading to false once data is fetched
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate PDF for Top Performing Driver report (Preview)
  const generatePDF = () => {
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

    // Generate PDF as a data URL for preview
    const pdfDataUrl = doc.output("dataurlstring");
    setPdfUrl(pdfDataUrl); // Set the PDF data URL to preview it
    setOpenPreview(true); // Open preview modal
  };

  // Handle download of the PDF
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
       
        {loading ? (
          <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: '20px' }} />
        ) : error ? (
          <div>{error}</div>
        ) : groupedRatings.length === 0 ? (
          <div>No top performing drivers found</div>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 685,
                marginLeft: -2,
                maxWidth: "100%",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
               <div className="report-top-bar">
                 <h2>Top Performing Drivers Report</h2>
               </div>
              <Table>
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
                color="primary"
                onClick={generatePDF}
                style={{
                  marginTop: '20px',
                  display: 'block',
                  marginRight: 'auto',
                  width: '200px',
                }}
              >
                Preview PDF
              </Button>
            </div>
          </>
        )}
      </div>

  
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>PDF Preview</DialogTitle>
        <DialogContent>
          <iframe
            title="PDF Preview"
            src={pdfUrl}
            width="100%"
            height="700px"
            style={{ border: "none" }}
          />
        </DialogContent>
        
        <DialogActions>
        <Button onClick={() => setOpenPreview(false)} color="primary">
            Close
          </Button>
          <Button
                variant="contained"
                color="primary"
                onClick={downloadPDF}
                style={{
                  marginTop: '20px',
                  display: 'block',
                  marginRight: 'auto',
                  width: '200px',
                }}
              >
                Download as PDF
              </Button>
        </DialogActions>
      </Dialog>

      <Suspense fallback={<div>Loading...</div>}>
        <TabBar />
      </Suspense>
    </div>
  );
}

export default TopPerformingReport;
