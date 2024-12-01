import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./driverReport.css";
import TabBar from "../tab-bar/tabBar";

const API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription/";

const ExpiredSubs = () => {
  const [data, setData] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [page, setPage] = useState(0); // Pagination: Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Pagination: Rows per page
  const [loading, setLoading] = useState(false);

  // Fetch data from the API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter expired subscriptions for tricycles and jeeps
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        (item.vehicleType.toLowerCase() === "jeep" ||
          item.vehicleType.toLowerCase() === "tricycle") &&
        moment().isAfter(item.endDate) &&
        item.driver.toLowerCase().includes(nameSearch.toLowerCase())
    );
  }, [data, nameSearch]);

  // Paginate data for the current page
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Expired Subscriptions Report", 14, 20);

    // Generate table
    const tableData = filteredData.map((item, index) => [
      item.id || index + 1,
      item.driver,
      item.vehicleType,
      item.subscriptionType,
      moment(item.endDate).format("MMMM DD, YYYY"),
    ]);

    doc.autoTable({
      head: [["ID", "Driver", "Vehicle Type", "Subscription Type", "End Date"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // Teal color for headers
      margin: { left: 14, right: 14 },
    });

    // Save PDF
    doc.save("Expired_Subscriptions_Report.pdf");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Update the page number
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    setPage(0); // Reset to the first page
  };

  return (
    <div>
      {loading ? (
        <CircularProgress
          sx={{ display: "block", margin: "auto", marginTop: 4 }}
        />
      ) : (
        <div className="report-main-content">
          {/* Report Header */}
          <div className="report-top-bar">
            <h1>Expired Subscription List</h1>
          </div>

          {/* Table with pagination */}
          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              margin: "20px auto",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
            className="table-container"
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Subscription Type</TableCell>
                  <TableCell>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id || `${page}-${index}`}>
                      <TableCell>
                        {item.id || index + 1 + page * rowsPerPage}
                      </TableCell>
                      <TableCell>{item.driver}</TableCell>
                      <TableCell>{item.vehicleType}</TableCell>
                      <TableCell>{item.subscriptionType}</TableCell>
                      <TableCell>
                        {moment(item.endDate).format("MMMM DD, YYYY")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Expired Subscribers Found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Download Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPDF}
            style={{
              marginTop: "20px",
              display: "block",
              marginRight: "auto",
              width: "200px",
            }}
          >
            Download as PDF
          </Button>

          {/* Pagination Component */}
          <TablePagination
            component="div"
            count={filteredData.length} // Total rows count
            page={page} // Current page
            onPageChange={handleChangePage} // Handler for page change
            rowsPerPage={rowsPerPage} // Rows per page
            onRowsPerPageChange={handleChangeRowsPerPage} // Handler for rows per page change
            rowsPerPageOptions={[5, 10, 20]} // Options for rows per page
          />
        </div>
      )}

      {/* TabBar */}
      <TabBar />
    </div>
  );
};

export default ExpiredSubs;
