import React, { useEffect, useState, useMemo } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Button,
} from '@mui/material';
import jsPDF from 'jspdf'; 
import 'jspdf-autotable'; 
import './driverReport.css';

const API_URL = 'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription';

const ActiveTricycleSubscriptions = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionTypeChange = (e) => {
    setSubscriptionTypeFilter(e.target.value);
  };

  // Updated filteredData function without nameSearch filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const vehicleType = item.vehicleType?.toLowerCase() || '';
      const isExpired = moment().isAfter(moment(item.endDate));
      return (
        vehicleType === 'tricycle' &&
        (subscriptionTypeFilter === '' || item.subscriptionType === subscriptionTypeFilter) &&
        !isExpired
      );
    });
  }, [data, subscriptionTypeFilter]);

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text('Active Tricycle Subscriptions Report', 14, 20);

    // Add Table
    const tableData = filteredData.map((item) => [
      item.id,
      item.driver?.name || 'N/A',
      item.subscriptionType,
      item.vehicleType,
      moment(item.startDate).format('MMMM DD, YYYY'),
      moment(item.endDate).format('MMMM DD, YYYY'),
      item.status,
    ]);

    doc.autoTable({
      head: [
        ['ID', 'Driver', 'Subscription Type', 'Vehicle Type', 'Start Date', 'End Date', 'Status'],
      ],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, 
      margin: { left: 14, right: 14 },
    });

    // Save PDF
    doc.save('Active_Tricycle_Subscriptions_Report.pdf');
  };

  return (
    <div className="subs-main-content">
      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: 4 }} />
          <p>Loading subscriptions...</p>
        </div>
      ) : (
        <div className="subscriptions-table">
          <TableContainer
            sx={{
              maxHeight: 680,
              marginLeft: 28,
              maxWidth: '85.5%',
              marginTop: '30px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="report-top-bar">
              <h1 className="subcription-list">Active Jeep Subscriptions</h1>
              <div className="sort-container-subs">
                <select onChange={handleSubscriptionTypeChange} value={subscriptionTypeFilter}>
                  <option value="">Filter By Subscription Type</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>

            <Table sx={{ '& .MuiTableCell-root': { padding: '15px' } }}>
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
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.driver?.name || 'N/A'}</TableCell>
                      <TableCell>{item.subscriptionType}</TableCell>
                      <TableCell>{item.vehicleType}</TableCell>
                      <TableCell>{moment(item.startDate).format('MMMM DD, YYYY')}</TableCell>
                      <TableCell>{moment(item.endDate).format('MMMM DD, YYYY')}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No Active Jeep Subscriptions Found.
                    </TableCell>
                  </TableRow>
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
              marginLeft: '220px',
              marginRight: 'auto',
              width: '200px',
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
      )}
      <TabBar />
    </div>
  );
};

export default ActiveTricycleSubscriptions;
