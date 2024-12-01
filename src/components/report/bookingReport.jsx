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

      // Group bookings by passenger name and location
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

  // Group bookings by passenger name and location
  const groupBookingsByName = (bookings) => {
    const grouped = {};

    bookings.forEach((booking) => {
      const passengerName = booking.name;
      const pickupAddress = booking.pickupAddress;
      const destinationAddress = booking.destinationAddress;

      // Initialize a new passenger if not present
      if (!grouped[passengerName]) {
        grouped[passengerName] = {};
      }

      // Create a unique key for each pickup-destination pair
      const locationKey = `${pickupAddress} -> ${destinationAddress}`;

      if (!grouped[passengerName][locationKey]) {
        grouped[passengerName][locationKey] = {
          pickupAddress,
          destinationAddress,
          bookingCount: 0,
        };
      }

      // Increment booking count for the specific location
      grouped[passengerName][locationKey].bookingCount++;
    });

    return grouped;
  };

  // Flatten the grouped data for easier pagination
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
      tableRows.push([row.passengerName, row.pickupAddress, row.destinationAddress, row.bookingCount]);
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
                <select onChange={(e) => setFilter(e.target.value)}>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
            <Table sx={{ "& .MuiTableCell-root": { padding: "15px" } }}>
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
          onClick={handleDownloadPDF}
          style={{
            marginTop: '20px',
            display: 'block',
            width: '200px',
          }}
        >
          Download as PDF
        </Button>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      )}

      <TabBar/>
    </div>
  );
};

export default BookingReport;
