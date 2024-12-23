import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import TabBar from "../tab-bar/tabBar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./driverReport.css";

const DRIVER_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approved-drivers";

function Report() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState(""); // State for vehicle filter
  const [page, setPage] = useState(0); // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page state
  const [openPreview, setOpenPreview] = useState(false); // State to control preview modal
  const [pdfUrl, setPdfUrl] = useState(""); // State to store the PDF URL for preview

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const driverResponse = await axios.get(DRIVER_API_URL);
      const driverData = driverResponse.data;

      // Add additional info and sort by newest (descending order)
      const sortedData = driverData
        .map((driver, index) => ({
          ...driver,
          id: index + 1,
          vehicleInfo: driver.vehicleInfo2,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by `createdAt`

      setData(sortedData);
      setFilteredData(sortedData); // Initialize filtered data
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVehicleFilterChange = (e) => {
    const selectedVehicle = e.target.value;
    setVehicleFilter(selectedVehicle);

    if (selectedVehicle) {
      setFilteredData(
        data.filter(
          (item) =>
            item.vehicleInfo?.vehicleType?.toLowerCase() ===
            selectedVehicle.toLowerCase()
        )
      );
    } else {
      setFilteredData(data); // Show all drivers if no filter is selected
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData, page, rowsPerPage]);

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title to the PDF
    doc.setFontSize(16);
    doc.text("Approved Drivers Report", 14, 20);

    // Prepare table data
    const tableData = filteredData.map((item, index) => [
      page * rowsPerPage + index + 1,
      item.name || "N/A",
      item.number || "N/A",
      item.address || "N/A",
      item.vehicleInfo?.vehicleType || "N/A",
    ]);

    // Add the table to the PDF
    doc.autoTable({
      head: [["Number", "Name", "Phone", "Address", "Vehicle Info"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // Teal header color
      margin: { left: 14, right: 14 },
    });

    // Generate PDF as a data URL for preview
    const pdfDataUrl = doc.output("dataurlstring");
    setPdfUrl(pdfDataUrl); // Set the PDF data URL to preview
    setOpenPreview(true); // Open preview modal
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title to the PDF
    doc.setFontSize(16);
    doc.text("Approved Drivers Report", 14, 20);

    // Prepare table data
    const tableData = filteredData.map((item,index) => [
      page * rowsPerPage + index + 1,
      item.name || "N/A",
      item.number || "N/A",
      item.address || "N/A",
      item.vehicleInfo?.vehicleType || "N/A",
    ]);

    // Add the table to the PDF
    doc.autoTable({
      head: [["Number", "Name", "Phone", "Address", "Vehicle Info"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // Teal header color
      margin: { left: 14, right: 14 },
    });

    // Save the PDF
    doc.save("Approved_Drivers_Report.pdf");
  };

  return (
    <div>
      <TabBar />
      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
      ) : error ? (
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
      ) : (
        <div className="report-main-content">
          <TableContainer
            component={Paper}
            sx={{
              marginTop: 5,
              maxHeight: 685,
              marginLeft: -2,
              maxWidth: "100%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="report-top-bar">
              <h1>Drivers List Report</h1>
              <select
                value={vehicleFilter}
                onChange={handleVehicleFilterChange}
                className="vehicle-dropdown"
                style={{
                  marginLeft: "20px",
                  padding: "5px",
                  fontSize: "16px",
                }}
              >
                <option value="">All Vehicles</option>
                <option value="Jeep">Jeep</option>
                <option value="Tricycle">Tricycle</option>
              </select>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Vehicle Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{item.name || "N/A"}</TableCell>
                      <TableCell>{item.number || "N/A"}</TableCell>
                      <TableCell>{item.address || "N/A"}</TableCell>
                      <TableCell>
                        {item.vehicleInfo?.vehicleType || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Approved Drivers Found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={generatePDF}
              style={{
                marginTop: "20px",
                display: "block",
                marginRight: "auto",
                width: "200px",
              }}
            >
              Preview PDF
            </Button>

          </div>

          <TablePagination
            rowsPerPageOptions={[10, 20, 30]}
            component="div"
            count={filteredData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}
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
              </Button>        <Button
              variant="contained"
              color="primary"
              onClick={downloadPDF}
              style={{
                marginTop: "20px",
                display: "block",
                marginRight: "auto",
                width: "200px",
              }}
            >
              Download as PDF
            </Button>
            </DialogActions>
          </Dialog>
    </div>
  );
}

export default Report;
