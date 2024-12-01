import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./driverReport.css";

const DRIVER_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approved-drivers";

function Report() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const driverResponse = await axios.get(DRIVER_API_URL);
      const driverData = driverResponse.data;

      const dataWithAdditionalInfo = driverData.map((driver, index) => ({
        ...driver,
        id: index + 1,
        vehicleInfo: driver.vehicleInfo2,
      }));

      setData(dataWithAdditionalInfo);
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

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add title to the PDF
    doc.setFontSize(16);
    doc.text("Approved Drivers Report", 14, 20);

    // Prepare table data
    const tableData = data.map((item) => [
      item.id,
      item.name || "N/A",
      item.number || "N/A",
      item.address || "N/A",
      item.vehicleInfo?.vehicleType || "N/A",
    ]);

    // Add the table to the PDF
    doc.autoTable({
      head: [["ID", "Name", "Phone", "Address", "Vehicle Info"]],
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
        <CircularProgress
          sx={{ display: "block", margin: "auto", marginTop: 4 }}
        />
      ) : error ? (
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
      ) : (
        <div className="report-main-content">
          <TableContainer
            component={Paper}
            sx={{
              marginTop: -2,
              maxHeight: 685,
              marginLeft: -2,
              maxWidth: "100%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="report-top-bar">
              <h1>Drivers List Report</h1>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Vehicle Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <TableRow key={item.id || item._id}>
                      <TableCell>{item.id}</TableCell>
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

          {/* Download Button */}
          <div>
            <Button
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Report;
