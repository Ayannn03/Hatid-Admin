import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
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
  CircularProgress,
} from '@mui/material';
import moment from 'moment';
import './subscription.css';
import TabBar from '../tab-bar/tabBar';

const API_URL = 'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription/';

const SubscriptionReq = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from the API
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
      const sortedData = dataWithId.sort((a, b) => moment(b.startDate).diff(moment(a.startDate)));
      setData(sortedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Handle accepting a payment for a subscription
  const handleAcceptPayment = async (subscriptionId) => {
    try {
      if (!subscriptionId) throw new Error('SubscriptionId is required');

      const response = await axios.post(
        'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/payment-accept',
        { subscriptionId }
      );

      if (response.status === 200) {
        console.log('Subscription updated:', response.data);
        fetchData();
      } else {
        console.error('Failed to update subscription:', response.data.message);
      }
    } catch (error) {
      console.error('Error handling payment acceptance:', error);
    }
  };

  // Handle rejecting (deleting) a subscription
  const handleRejectSubscription = async (subscriptionId) => {
    try {
      if (!subscriptionId) throw new Error('SubscriptionId is required');

      const response = await axios.delete(
        `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription-reject/${subscriptionId}`
      );

      if (response.status === 200) {
        console.log('Subscription rejected:', response.data);
        fetchData();
      } else {
        console.error('Failed to reject subscription:', response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting subscription:', error);
    }
  };

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const driverName = item.driver?.name?.toLowerCase() || '';
      const vehicleType = item.vehicleType?.toLowerCase() || '';
      const isPending = item.status?.toLowerCase() === 'pending';
      const subscriptionTypeMatch =
        subscriptionTypeFilter === '' || item.subscriptionType === subscriptionTypeFilter;
  
      return (
        driverName.includes(nameSearch.toLowerCase()) &&
        (vehicleType === 'jeep' || vehicleType === 'tricycle') &&
        isPending &&
        subscriptionTypeMatch
      );
    });
  }, [data, nameSearch, subscriptionTypeFilter]);
  

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // View subscription receipt in a modal
  const handleViewReceipt = (sub) => {
    setSelectedSubscription(sub);
    setShowModal(true);
    setPreviewImage(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
    setPreviewImage(null);
  };

  const handlePreviewImage = (image) => setPreviewImage(image);
  const handleSubscriptionTypeChange = (e) => setSubscriptionTypeFilter(e.target.value);
  const handleSearch = (e) => setNameSearch(e.target.value);

  return (
    <div className="subs-main-content">
      {/* Modal for viewing receipts */}
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Subscription Receipt</DialogTitle>
        <DialogContent>
          {selectedSubscription ? (
            <div>
              {selectedSubscription.receipt ? (
                <img
                  src={selectedSubscription.receipt}
                  alt="Receipt"
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', cursor: 'pointer' }}
                  onClick={() => handlePreviewImage(selectedSubscription.receipt)}
                />
              ) : (
                <p>No receipt available for this subscription.</p>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Image preview modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Image Preview</DialogTitle>
          <DialogContent>
            <img
              src={previewImage}
              alt="Preview"
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Loading state */}
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
            <div className="subscription-top-bar">
              <h1 className="subcription-list">Subscriptions Applications</h1>
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
                  <TableCell>Number</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Subscription Type</TableCell>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id || item._id}>
                      <TableCell>{page * rowsPerPage +1 +index}</TableCell>
                      <TableCell>{item.driver?.name || 'N/A'}</TableCell>
                      <TableCell>{item.subscriptionType || 'N/A'}</TableCell>
                      <TableCell>{item.vehicleType || 'N/A'}</TableCell>
                      <TableCell>{item.status || 'N/A'}</TableCell>
                      <TableCell>
                        <button className="view-button" onClick={() => handleViewReceipt(item)}>
                          View Receipt
                        </button>
                      </TableCell>
                      <TableCell>
                        <button className="view-button" onClick={() => handleAcceptPayment(item._id)}>
                          Accept
                        </button>
                        <button className="delete-button" onClick={() => handleRejectSubscription(item._id)}>
                          Reject
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data available
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
        </div>
      )}
      <TabBar />
    </div>
  );
};

export default SubscriptionReq;
