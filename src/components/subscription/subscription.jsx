import React, { useEffect, useState, useMemo} from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Button } from "@mui/material";
import './subscription.css';

const API_URL = 'https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/subs/subscription/';

const Subscription = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 

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


  

  const handleAcceptPayment = async (subscriptionId) => {
    try {
      if (!subscriptionId) {
        throw new Error('SubscriptionId is required');
      }

      const response = await axios.post(
        'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/payment-accept',
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

  const filteredData = data.filter((item) =>
    item.driver.toLowerCase().includes(nameSearch.toLowerCase())


  );
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
    <div className="driver-main-content">
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={() => setShowModal(false)}>
                &times;
              </span>
              {profileData && (
                <>
                  <h2>Profile Details</h2>
                  <p>
                    <strong>ID:</strong> {profileData._id}
                  </p>
                  <p>
                    <strong>Driver:</strong> {profileData.name}
                  </p>
                  <p>
                    <strong>Subscription Type:</strong> {profileData.subscriptionType}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      <div className="subscriptions-table">
      <TableContainer
        sx={{
          maxHeight: 680,
          marginLeft: 28,
          maxWidth: "86%",
          marginTop:"30px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        
      <div className="subscription-top-bar">
        <h1 className="subcription-list">Subscription List</h1>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {paginatedData.map((item) => {
    const isExpired = moment().isAfter(item.endDate);
    return (
      <TableRow key={item._id}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.driver}</TableCell>
        <TableCell>{item.subscriptionType}</TableCell>
        <TableCell>{item.vehicleType}</TableCell>
        <TableCell>{moment(item.startDate).format('MMMM DD, YYYY')}</TableCell>
        <TableCell>{moment(item.endDate).format('MMMM DD, YYYY')}</TableCell>
        <TableCell>{isExpired ? 'Expired' : item.status}</TableCell>
        <TableCell>
          {!isExpired && (
            <button className="view-button" onClick={() => handleAcceptPayment(item._id)}>
              Accept Payment
            </button>
          )}
        </TableCell>
      </TableRow>
    );
  })}
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

export default Subscription;
