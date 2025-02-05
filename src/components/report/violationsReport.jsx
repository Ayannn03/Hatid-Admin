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
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

const VIOLATION_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/violate/violation";

function ViolationsReport() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState(false); // State for preview modal
  const [pdfUrl, setPdfUrl] = useState(""); // Store generated PDF data URL

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch violations data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(VIOLATION_API_URL);
      const violationData = response.data;

      if (violationData.status === "ok") {
        // Map data to include an auto-incremented ID
        const formattedData = violationData.data.map((violation, index) => ({
          ...violation,
          id: index + 1,
        }));

        setData(formattedData);
        setError(null);
      } else {
        setError("No violations found.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group violations by driver
  const groupViolationsByDriver = (violations) => {
    return violations.reduce((acc, violation) => {
      const driverId = violation.driver?._id;
      if (!acc[driverId]) {
        acc[driverId] = {
          driver: violation.driver,
          violations: [],
        };
      }
      acc[driverId].violations.push(violation);
      return acc;
    }, {});
  };

  const groupedData = useMemo(() => groupViolationsByDriver(data), [data]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return Object.keys(groupedData).slice(startIndex, endIndex);
  }, [groupedData, page, rowsPerPage]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page change
  };

  // Generate PDF for Violations Report (Preview)
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title to the PDF
    doc.setFontSize(16);
    doc.text("Violations Report", 14, 20);

    // Prepare table data for PDF
    const tableData = Object.keys(groupedData).map((driverId, index) => {
      const { driver, violations } = groupedData[driverId];
      return [
        page * rowsPerPage + index + 1,
        driver?.name || "N/A",
        violations[0]?.booking || "N/A",
        violations.length,
      ];
    });

    // Add table to PDF
    doc.autoTable({
      head: [["Number", "Driver Name", "Booking", "Number of Violations"]],
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

    // Add title to the PDF
    doc.setFontSize(16);
    doc.text("Violations Report", 14, 20);

    // Prepare table data for PDF
    const tableData = Object.keys(groupedData).map((driverId, index) => {
      const { driver, violations } = groupedData[driverId];
      return [
        page * rowsPerPage + index + 1,
        driver?.name || "N/A",
        violations[0]?.booking || "N/A",
        violations.length,
      ];
    });

    // Add table to PDF
    doc.autoTable({
      head: [["Number", "Driver Name", "Booking", "Number of Violations"]],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [44, 62, 80] }, // Navy header color
      margin: { left: 14, right: 14 },
    });

    // Save the PDF
    doc.save("Violations_Report.pdf");
  };

  return (
    <div>
      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="report-main-content">     
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 685,
              marginLeft: -2,
              width:"102%",  
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="report-top-bar">
              <h2>Violation Report</h2>
            </div>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Driver Name</TableCell>
                  <TableCell>Booking</TableCell>
                  <TableCell>Violations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((driverId, index) => {
                    const { driver, violations } = groupedData[driverId];
                    const booking = violations && violations.length > 0 ? violations[0]?.booking : "N/A";
                    return (
                      <TableRow key={driverId}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{driver?.name || "N/A"}</TableCell>
                        <TableCell>{booking}</TableCell>
                        <TableCell>{violations.length}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" style={{ color: "gray" }}>
                      No violations available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
      
          {error && (
            <div
              style={{
                color: "red",
                textAlign: "center",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              {error}
            </div>
          )}

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
          <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={Object.keys(groupedData).length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          {/* Preview PDF Modal */}
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
        </div>
      )}

      <TabBar />
    </div>
  );
}

export default ViolationsReport;
