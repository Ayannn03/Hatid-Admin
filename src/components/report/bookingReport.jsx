import React, { useEffect, useState } from "react";
import TabBar from "../tab-bar/tabBar";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  TablePagination,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { jsPDF } from "jspdf";
import 'jspdf-autotable'; // Importing the autotable plugin for jsPDF
import './driverReport.css';

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const daysSinceFirstDay = Math.floor((currentDate - firstDayOfMonth) / (1000 * 60 * 60 * 24));
const currentWeek = Math.ceil((daysSinceFirstDay + 1) / 7);


const API_URLS = {
  week: `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/bookings/week?year=${currentYear}&month=${currentMonth}&week=${currentWeek}`,
  month: `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/bookings/month?year=${currentYear}&month=${currentMonth}`,
  year: `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/bookings/year?year=${currentYear}`,
};
// Reverse Geocoding function to fetch the address from Mapbox API
const getAddress = async (latitude, longitude) => {
  const reverseGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoibWF3aTIxIiwiYSI6ImNseWd6ZGp3aTA1N2IyanM5Ymp4eTdvdzYifQ.0mYPMifHNHONTvY6mBbkvg`;
  try {
    const geoResponse = await axios.get(reverseGeocodeUrl);
    if (geoResponse.data.features.length > 0) {
      let barangay = "";
      let district = "";

      const addressComponents = geoResponse.data.features[0].context;

      addressComponents.forEach((component) => {
        if (component.id.includes("locality")) {
          barangay = component.text;
        } else if (component.id.includes("place")) {
          district = component.text;
        }
      });

      return `${barangay}, ${district}` || "Address not found";
    }
  } catch (geoError) {
    console.error("Error during geocoding:", geoError);
  }
  return "Address not found";
};

const BookingReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("week"); // Default to 'week'
  const [page, setPage] = useState(0); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows per page
  const [openPreview, setOpenPreview] = useState(false); // State to control preview modal
  const [pdfUrl, setPdfUrl] = useState(""); // State to hold the PDF URL for preview

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Log the current filter and API URL for debugging
      console.log("Fetching data for filter:", filter);
      console.log("API URL:", API_URLS[filter]);
  
      const response = await axios.get(API_URLS[filter]);
      const bookings = response.data;
  
      const allBookings = bookings.flatMap((booking) => {
        const copassengers = booking.copassengers || [];
        return [booking, ...copassengers];
      });
  
      const bookingsWithAddresses = await Promise.all(
        allBookings.map(async (booking) => {
          const pickupAddress = await getAddress(
            booking.pickupLocation.latitude,
            booking.pickupLocation.longitude
          );
          const destinationAddress = await getAddress(
            booking.destinationLocation.latitude,
            booking.destinationLocation.longitude
          );
  
          return {
            ...booking,
            pickupAddress,
            destinationAddress,
          };
        })
      );
  
      const groupedByName = groupBookingsByName(bookingsWithAddresses);
      const flattenedData = flattenGroupedData(groupedByName);
  
      setData(flattenedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]); // Reset data on error
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);
  };
  

  const groupBookingsByName = (bookings) => {
    const grouped = {};

    bookings.forEach((booking) => {
      const passengerName = booking.name;
      const pickupAddress = booking.pickupAddress;
      const destinationAddress = booking.destinationAddress;

      if (!grouped[passengerName]) {
        grouped[passengerName] = {};
      }

      const locationKey = `${pickupAddress} -> ${destinationAddress}`;

      if (!grouped[passengerName][locationKey]) {
        grouped[passengerName][locationKey] = {
          pickupAddress,
          destinationAddress,
          bookingCount: 0,
        };
      }

      grouped[passengerName][locationKey].bookingCount++;
    });

    return grouped;
  };

  const flattenGroupedData = (groupedData) => {
    const flattened = [];

    Object.keys(groupedData).forEach((passengerName) => {
      const locations = groupedData[passengerName];
      Object.keys(locations).forEach((locationKey) => {
        const { pickupAddress, destinationAddress, bookingCount } = locations[locationKey];
        flattened.push({
          passengerName,
          pickupAddress,
          destinationAddress,
          bookingCount,
        });
      });
    });

    return flattened;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Booking Report", 14, 20); 
  
    const tableData = data.map((row, index) => [
      row.passengerName,
      row.pickupAddress || "N/A",
      row.destinationAddress || "N/A",
      row.bookingCount || "N/A",
    ]);
  
    doc.autoTable({
      head: [["Name", "Pick-up Address", "Destination Address", "Booking Count"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
    });
  
    const pdfDataUrl = doc.output("dataurlstring");
    setPdfUrl(pdfDataUrl); 
    setOpenPreview(true); 
  };
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Booking Report", 14, 20);
  
    const tableData = data.map((row, index) => [
      row.passengerName,
      row.pickupAddress || "N/A",
      row.destinationAddress || "N/A",
      row.bookingCount || "N/A",
    ]);
  
    doc.autoTable({
      head: [["Name", "Pick-up Address", "Destination Address", "Booking Count"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
    });
  
    doc.save("Booking_Report.pdf"); 
  };
  



  return (
    <div className="booking">
      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="report-main-content">
          <TableContainer
            sx={{
              maxHeight: 580,
              width: "100%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              marginTop: 3,
            }}
          >
            <div className="report-top-bar">
              <h1>Booking Report</h1>
              <div className="sort-container-subs">
                <select value={filter} onChange={handleFilterChange}>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
            <Table sx={{ "& .MuiTableCell-root": { padding: "12px" } }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Passenger Name</strong></TableCell>
                  <TableCell><strong>Pickup Address</strong></TableCell>
                  <TableCell><strong>Destination Address</strong></TableCell>
                  <TableCell><strong>Booking Count</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="h6" color="textSecondary">
                        No bookings found for the selected filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.passengerName}</TableCell>
                        <TableCell>{row.pickupAddress}</TableCell>
                        <TableCell>{row.destinationAddress}</TableCell>
                        <TableCell>{row.bookingCount}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
                variant="contained"
              color="primary"
              onClick={generatePDF}
              style={{
                marginTop: "20px",
                display: "block",
                width: "200px",
              }}
            >
              Preview PDF
            </Button>
          <TablePagination
            rowsPerPageOptions={[10,20, 30]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      )}

      <TabBar />
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
            onClick={handleDownloadPDF}
            style={{
              marginTop: '20px',
              display: 'block',
              width: '200px',
            }}
          >
            Download as PDF
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BookingReport;
