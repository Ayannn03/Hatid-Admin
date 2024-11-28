import React, { useEffect, useState, useMemo } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Button } from "@mui/material";
import { jsPDF } from "jspdf";
import './driverReport.css';

const API_URL = 'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription/';

const Jeep = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  useEffect(() => {
    fetchData();
  }, []); // Empty array ensures fetchData is called only once after mount

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Error fetching data');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.vehicleType.toLowerCase() === 'jeep' &&
      item.status.toLowerCase() === 'active' && // Ensure status is 'active'
      moment().isBefore(item.endDate) // Ensure subscription is not expired
    );
  }, [data]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Function to download the table as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Driver", "Subscription Type", "Vehicle Type", "Start", "End", "Status"];
    const tableRows = [];

    paginatedData.forEach((item) => {
      const isExpired = moment().isAfter(item.endDate);
      const row = [
        item._id,
        item.driver,
        item.subscriptionType,
        item.vehicleType,
        moment(item.startDate).format('MMMM DD, YYYY'),
        moment(item.endDate).format('MMMM DD, YYYY'),
        isExpired ? 'Expired' : item.status
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'striped',
    });

    doc.save("Subscription_List.pdf");
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
          <div className="subscription-top-bar">
            <h1 className="subcription-list">Subscription List</h1>
            <Button onClick={handleDownloadPDF} variant="contained" color="primary" style={{ marginBottom: "20px" }}>
              Download as PDF
            </Button>
          </div>

          {filteredData.length === 0 ? (
            <p>No active subscriptions available</p>
          ) : (
            <Table sx={{ '& .MuiTableCell-root': { padding: '10px' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Subscription Type</TableCell>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {paginatedData.map((item) => {
                const isExpired = moment().isAfter(item.endDate);
                return (
                  <TableRow key={item._id}>
                    <TableCell>{item._id}</TableCell>
                    <TableCell>{item.driver?.name}</TableCell> {/* Ensure you extract a string from the object */}
                    <TableCell>{item.subscriptionType}</TableCell>
                    <TableCell>{item.vehicleType}</TableCell>
                    <TableCell>{moment(item.startDate).format('MMMM DD, YYYY')}</TableCell>
                    <TableCell>{moment(item.endDate).format('MMMM DD, YYYY')}</TableCell>
                    <TableCell>{isExpired ? 'Expired' : item.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            </Table>
          )}
        </TableContainer>

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

export default Jeep;
