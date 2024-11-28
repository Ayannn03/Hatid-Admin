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
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import './subscription.css';

const API_URL = 'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription';

const ActiveJeepSubscriptions = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState(''); // New state for filter

  useEffect(() => {
    fetchData();
  }, []);

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
      setError('Error fetching data');
    }
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const handleViewReceipt = (sub) => {
    setSelectedSubscription(sub);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
  };

  const handleSubscriptionTypeChange = (e) => {
    setSubscriptionTypeFilter(e.target.value);
  };

  // Apply the subscription type filter here
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const driverName = item.driver?.name?.toLowerCase() || '';
      const vehicleType = item.vehicleType?.toLowerCase() || '';
      const isExpired = moment().isAfter(moment(item.endDate));

      // Filter by nameSearch and subscriptionTypeFilter
      return (
        driverName.includes(nameSearch.toLowerCase()) &&
        (vehicleType === 'jeep') && // filter for Jeep subscriptions
        (subscriptionTypeFilter === '' || item.subscriptionType === subscriptionTypeFilter) &&
        !isExpired // Don't show expired subscriptions
      );
    });
  }, [data, nameSearch, subscriptionTypeFilter]);

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

  return (
    <div className="subs-main-content">
      {/* Receipt Modal */}
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Subscription Receipt</DialogTitle>
        <DialogContent>
          {selectedSubscription ? (
            <div>
              {selectedSubscription.receipt ? (
                <div>
                  <p>
                    <strong>Receipt:</strong>
                  </p>
                  <img
                    src={selectedSubscription.receipt}
                    alt="Receipt"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <p>No receipt available for this subscription.</p>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Table */}
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
          <div className="subscription-top-bar">
            <h1 className="subcription-list">Active Jeep Subscriptions</h1>
            <div className="sort-container-subs">
              <select onChange={handleSubscriptionTypeChange} value={subscriptionTypeFilter}>
                <option value="">Filter By Subscription Type</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="search-bar-container">
              <input
                className="input-design"
                type="text"
                placeholder="Search"
                value={nameSearch}
                onChange={handleSearch}
              />
            </div>
          </div>

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
                <TableCell>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.driver?.name}</TableCell>
                    <TableCell>{item.subscriptionType}</TableCell>
                    <TableCell>{item.vehicleType}</TableCell>
                    <TableCell>{moment(item.startDate).format('MMMM DD, YYYY')}</TableCell>
                    <TableCell>{moment(item.endDate).format('MMMM DD, YYYY')}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      <button
                        className="view-button"
                        onClick={() => handleViewReceipt(item)}
                      >
                        View Receipt
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No Active Jeep Subscriptions Found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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

export default ActiveJeepSubscriptions;
