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
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import jsPDF Autotable plugin

const API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/users";

const Commuters = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Commuters Report", 14, 20); 

    const tableData = data.map((item) => [
      item.id,
      item.name || "N/A",
      item.email || "N/A",
      item.number || "N/A",
      item.address || "N/A",
    ]);

    doc.autoTable({
      head: [["ID", "Name", "Email", "Phone", "Address"]], // Table headers
      body: tableData, // Table data
      startY: 30, // Start position for the table
      styles: { fontSize: 10 }, // Font size for the table
      headStyles: { fillColor: [22, 160, 133] }, // Header background color
      margin: { left: 14, right: 14 }, // Margins for the table
    });

    doc.save("Commuters_Report.pdf"); // Save the PDF file
  };

  return (
    <div>
      <div className="report-main-content">
        <div className="commuters-top-bar">
          <h1>Commuters List</h1>
          <div>
            <Button
              variant="contained"
              onClick={handleDownloadPDF}
              className="download-button"
            >
              Download PDF
            </Button>
          </div>
        </div>
        <div className="passenger-table">
          <TableContainer
            sx={{
              maxHeight: 680,
              maxWidth: "91.5%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              marginTop: 3,
            }}
          >
            <Table
              sx={{ "& .MuiTableCell-root": { padding: "10px" } }}
              id="commuters-table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name || "N/A"}</TableCell>
                      <TableCell>{item.email || "N/A"}</TableCell>
                      <TableCell>{item.number || "N/A"}</TableCell>
                      <TableCell>{item.address || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No data available to print.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default Commuters;
