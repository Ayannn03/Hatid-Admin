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
} from '@mui/material';
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
  const [previewImage, setPreviewImage] = useState(null); // State for image preview

  // Fetch data from the API
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


  // Handle accepting a payment for a subscription
  const handleAcceptPayment = async (subscriptionId) => {
    try {
      if (!subscriptionId) {
        throw new Error('SubscriptionId is required');
      }

      const response = await axios.post(
        'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/payment-accept',
        { subscriptionId }
      );

      if (response.status === 200) {
        console.log('Subscription updated:', response.data);
        fetchData(); // Refresh the data after accepting the payment
      } else {
        console.error('Failed to update subscription:', response.data.message);
      }
    } catch (error) {
      console.error('Error handling payment acceptance:', error);
    }
  };

  // Filter data to only include pending subscriptions with jeep or tricycle vehicle types
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const driverName = item.driver?.name?.toLowerCase() || '';
      const vehicleType = item.vehicleType?.toLowerCase() || '';
      const isPending = item.status?.toLowerCase() === 'pending';

      return (
        driverName.includes(nameSearch.toLowerCase()) &&
        (vehicleType === 'jeep' || vehicleType === 'tricycle') &&
        isPending
      );
    });
  }, [data, nameSearch]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handle page change in the table
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change in number of rows per page
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // View subscription receipt in a modal
  const handleViewReceipt = (sub) => {
    setSelectedSubscription(sub);
    setShowModal(true);
    setPreviewImage(null); // Reset preview image when a new subscription is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubscription(null);
    setPreviewImage(null); // Reset preview image when closing the modal
  };

  const handlePreviewImage = (image) => {
    setPreviewImage(image); // Set the image to be previewed
  };

  const handleSubscriptionTypeChange = (e) => {
    setSubscriptionTypeFilter(e.target.value);
  };

  return (
    <div className="subs-main-content">
      {/* Modal for viewing receipts */}
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
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => handlePreviewImage(selectedSubscription.receipt)} // Click to preview image
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

      {previewImage && (
        <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Image Preview</DialogTitle>
          <DialogContent>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                marginBottom: '20px',
                cursor: 'zoom-out', // To indicate it can be closed
              }}
            />
          </DialogContent>
        </Dialog>
      )}

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
                    <TableCell>ID</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Subscription Type</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Receipt</TableCell>
                    <TableCell>Actions</TableCell> {/* Actions column */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow key={item.id || item._id}>
                        <TableCell>{item.id || 'N/A'}</TableCell>
                        <TableCell>{item.driver?.name || 'N/A'}</TableCell>
                        <TableCell>{item.subscriptionType || 'N/A'}</TableCell>
                        <TableCell>{item.vehicleType || 'N/A'}</TableCell>
                        <TableCell>{item.status || 'N/A'}</TableCell>
                        <TableCell>
                          <button
                            className="view-button"
                            onClick={() => handleViewReceipt(item)}
                          >
                            View Receipt
                          </button>
                        </TableCell>
                        <TableCell>
                          {/* Accept button in the actions column */}
                          <button
                            className="accept-button"
                            onClick={() => handleAcceptPayment(item._id)} // Handle accept payment action
                          >
                            Accept
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No pending Tricycle or Jeep Subscriptions available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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

export default SubscriptionReq;
