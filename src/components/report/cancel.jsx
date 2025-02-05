import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TablePagination,
  Button,
  Dialog,
  Paper,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import TabBar from '../tab-bar/tabBar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/cancel/cancel-reports";

function Cancel() {
  const [cancel, setCancel] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState("All"); // "All", "User", "Driver"
  const [openPreview, setOpenPreview] = useState(false); // State to control preview modal
  const [pdfUrl, setPdfUrl] = useState(""); // State to hold the PDF URL for preview

  const fetchCancel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const sortedData = response.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setCancel(sortedData);
      setFilteredData(sortedData); // Initialize with full data
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancel();
  }, []);

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilter(value);
    if (value === "All") {
      setFilteredData(cancel); // Show all data
    } else {
      setFilteredData(cancel.filter(item => item.canceledByType === value)); // Filter by type
    }
    setPage(0); // Reset pagination to first page
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cancel Reports", 14, 20);

    const tableData = filteredData.map((item, index) => [
      page * rowsPerPage + index + 1,
      item.booking || "N/A",
      item.canceledBy?.name || "N/A",
      item.reason || "N/A",
    ]);

    doc.autoTable({
      head: [["Number", "Booking", "Name", "Reason"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
    });

    const pdfDataUrl = doc.output("dataurlstring");
    setPdfUrl(pdfDataUrl); // Set the PDF data URL for preview
    setOpenPreview(true); // Open preview modal
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cancel Reports", 14, 20);

    const tableData = filteredData.map((item, index) => [
      page * rowsPerPage + index + 1,
      item.booking || "N/A",
      item.canceledBy?.name || "N/A",
      item.reason || "N/A",
    ]);

    doc.autoTable({
      head: [["Number", "Booking", "Name", "Reason"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
    });

    doc.save("Cancel_Report.pdf");
  };

  return (
    <div className="report-main-content">
      <div>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
        ) : error ? (
          <Typography color="error" align="center" marginTop={4}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}
             sx={{
                maxHeight: 680,
                maxWidth: "100%",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              }}>
            <div className='report-top-bar'>
            <h2>Cancelation Reports</h2>         
            <div className='sort-container'>
              <select
                value={filter}
                onChange={handleFilterChange}
                style={{ marginLeft: "20px", padding: "5px", fontSize: "16px" }}
              >
                <option value="All">All</option>
                <option value="User">Passenger</option>
                <option value="Driver">Driver</option>
              </select>
            </div>
            </div>
            <Table sx={{ "& .MuiTableCell-root": { padding: "12px" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Number</TableCell>
                    <TableCell>Booking</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{item.booking}</TableCell>
                      <TableCell>{item.canceledBy?.name}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                    </TableRow>
                  ))}
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
              rowsPerPageOptions={[10, 20, 30]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
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
            onClick={handleDownloadPDF}
            style={{
                marginTop: "5px",
                display: "block",
                width: "200px",
            }}
            >
            Download as PDF
            </Button>
        </DialogActions>
      </Dialog>

      <TabBar />
    </div>
  );
}

export default Cancel;
