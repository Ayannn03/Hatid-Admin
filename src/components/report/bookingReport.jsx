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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TablePagination,
} from "@mui/material";
import { jsPDF } from "jspdf";
import 'jspdf-autotable'; // Importing the autotable plugin for jsPDF
import './driverReport.css';

// API URLs
const API_URLS = {
  week: "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/bookings/week?year=2024&month=11&week=2",
  month: "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/bookings/month?year=2024&month=11",
  year: "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/bookings/year?year=2024",
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

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URLS[filter]);
      const bookings = response.data; // Assuming the API returns an array of bookings

      // Merge copassengers into the main booking list
      const allBookings = bookings.flatMap((booking) => {
        const copassengers = booking.copassengers || [];
        return [booking, ...copassengers];
      });

      // Adding address information for each booking
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

      // Group bookings by passenger name
      const groupedByName = groupBookingsByName(bookingsWithAddresses);

      // Flatten the grouped data for pagination
      const flattenedData = flattenGroupedData(groupedByName);
      setData(flattenedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]); // Reset data on error
    } finally {
      setLoading(false);
    }
  };

  // Group bookings by passenger name
  const groupBookingsByName = (bookings) => {
    const grouped = {};

    bookings.forEach((booking) => {
      const passengerName = booking.name;

      if (!grouped[passengerName]) {
        grouped[passengerName] = {
          bookings: [],
          pickupAddresses: new Set(),
          destinationAddresses: new Set(),
        };
      }

      grouped[passengerName].bookings.push(booking);
      grouped[passengerName].pickupAddresses.add(booking.pickupAddress);
      grouped[passengerName].destinationAddresses.add(booking.destinationAddress);
    });

    return grouped;
  };

  // Flatten the grouped data for easier pagination
  const flattenGroupedData = (groupedData) => {
    const flattened = [];

    Object.keys(groupedData).forEach((passengerName) => {
      const { bookings, pickupAddresses, destinationAddresses } = groupedData[passengerName];
      flattened.push({
        passengerName,
        pickupAddresses: Array.from(pickupAddresses).join(", "), // Combine multiple addresses
        destinationAddresses: Array.from(destinationAddresses).join(", "),
        bookingCount: bookings.length, // Total bookings
      });
    });

    return flattened;
  };

  // Pagination Handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing rows per page
  };

  // PDF Download function
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = ["Passenger Name", "Pickup Address", "Destination Address", "Booking Count"];
    const tableRows = [];

    // Add data to the rows
    data.forEach((row) => {
      tableRows.push([row.passengerName, row.pickupAddresses, row.destinationAddresses, row.bookingCount]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'striped',
    });

    doc.save("Booking_Report.pdf");
  };

  return (
    <div className="booking">
      <div className="report-main-content">
        <div className="commuters-top-bar">
          <h1>Booking Report</h1>
          <Button
            variant="contained"
            onClick={handleDownloadPDF} // Changed to download as PDF
            className="download-button"
            sx={{ marginBottom: 2 }}
          >
            Download as PDF
          </Button>
        </div>

        {/* Filter Dropdown */}
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Filter By</InputLabel>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter By">
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>

        {/* Loading Indicator */}
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
        ) : (
          data.length > 0 && (
            <TableContainer
              sx={{
                maxHeight: 580,
                maxWidth: "91.5%",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                marginTop: 3,
              }}
            >
              <Table sx={{ "& .MuiTableCell-root": { padding: "10px" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Passenger Name</strong></TableCell>
                    <TableCell><strong>Pickup Address</strong></TableCell>
                    <TableCell><strong>Destination Address</strong></TableCell>
                    <TableCell><strong>Booking Count</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.passengerName}</TableCell>
                        <TableCell>{row.pickupAddresses}</TableCell>
                        <TableCell>{row.destinationAddresses}</TableCell>
                        <TableCell>{row.bookingCount}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}

        {/* Pagination */}
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      <TabBar />
    </div>
  );
};

export default BookingReport;
