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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const sortedData = response.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by createdAt in descending order
  
      setData(sortedData);
      setError(null); // Clear error if data is fetched successfully
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Commuters Report", 14, 20);

    const tableData = filteredData.map((item) => [
      item.id,
      item.name || "N/A",
      item.email || "N/A",
      item.number || "N/A",
      item.address || "N/A",
    ]);

    doc.autoTable({
      head: [["ID", "Name", "Email", "Phone", "Address"]],
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
            <Table sx={{ "& .MuiTableCell-root": { padding: "15px" } }}>
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
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
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
          onClick={handleDownloadPDF}
          style={{
            marginTop: "20px",
            display: "block",
            marginLeft: "220px",
            marginRight: "auto",
            width: "200px",
          }}
        >
          Download as PDF
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
      <TabBar />
    </div>
  );
};

export default Commuters;
