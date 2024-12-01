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
  CircularProgress, // Import CircularProgress for the loading spinner
} from '@mui/material';
import './subscription.css';

const API_URL = 'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription';

const ActiveJeepSubscriptions = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for image preview
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState(''); // New state for filter
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); // Set loading to true before fetching data
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
      setLoading(false); // Set loading to false once data is fetched or if error occurs
    }
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

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

  // Apply the subscription type filter here
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const driverName = item.driver?.name?.toLowerCase() || '';
      const vehicleType = item.vehicleType?.toLowerCase() || '';
      const isExpired = moment().isAfter(moment(item.endDate));

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

      {loading ? (
        <div className="loading-container">
         <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
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
                      <TableCell>{item.driver?.name || 'N/A'}</TableCell>
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
      )}
      <TabBar />
    </div>
  );
};

export default ActiveJeepSubscriptions;
