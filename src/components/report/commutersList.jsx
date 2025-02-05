import React, { useEffect, useState, useMemo } from "react";
import TabBar from "../tab-bar/tabBar";
import axios from "axios";
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
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import "./driverReport.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/users";

const Commuters = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openPreview, setOpenPreview] = useState(false); // State to control preview modal
  const [pdfUrl, setPdfUrl] = useState(""); 

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: index + 1,
        createdAt: new Date(item.createdAt), // Ensure createdAt is a Date object
      }));
  
      // Sort data by `createdAt` field in descending order
      const sortedData = dataWithId.sort((a, b) => b.createdAt - a.createdAt);
  
      setData(sortedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  
  

  const filteredData = useMemo(() => {
    return data.filter((item) => item.name && item.email);
  }, [data]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  
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


  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Commuters Report", 14, 20);

    const tableData = filteredData.map((item) => [
      page * rowsPerPage + index + 1,
      item.name || "N/A",
      item.email || "N/A",
      item.number || "N/A",
      item.address || "N/A",
    ]);

    doc.autoTable({
      head: [["Number", "Name", "Email", "Phone", "Address"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
    });

    doc.save("Commuters_Report.pdf");
  };


  return (
    <div className="subs-main-content">
      <div className="subscriptions-table">
        <TableContainer
          sx={{
            maxHeight: 680,
            marginLeft: 28,
            maxWidth: "85.5%",
            marginTop: "30px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="report-top-bar">
            <h1>Commuters List</h1>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <CircularProgress />
            </div>
          ) : filteredData.length === 0 ? (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Commuters Available
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table sx={{ "& .MuiTableCell-root": { padding: "13px" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.name || "N/A"}</TableCell>
                    <TableCell>{item.email || "N/A"}</TableCell>
                    <TableCell>{item.number || "N/A"}</TableCell>
                    <TableCell>{item.address || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <Button
              variant="contained"
              color="primary"
              onClick={generatePDF}
              style={{
                marginTop: "20px",
                display: "block",
                marginLeft: "220px",
                width: "200px",
              }}
            >
              Preview PDF
            </Button>

        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={filteredData.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        {error && <div className="error-message">{error}</div>}
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
            marginLeft: "220px",
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
};

export default Commuters;
