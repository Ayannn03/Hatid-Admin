import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TabBar from '../tab-bar/tabBar';
import "./violations.css";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/violate/violation';

const Violations = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchViolation();
  }, []);

  const fetchViolation = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("Violation Data", res.data);

      if (res.data.status === "ok") {
        setData(res.data.data || []);
      } else {
        console.error("Cannot find violation");
        setError("No violations found.");
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
      setError("Error fetching data. Please try again later.");
    }
  };

  const handleViewProfile = async (id) => {
    const itemToView = data.find((item) => item._id === id);
    setProfileData(itemToView);
    setShowModal(true);
  };

  return (
    <div className='driver-main-content'>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              {profileData && (
                <>
                <div className='violation-details'>
                <h2>Profile Details</h2>
                  <p><strong>Driver:</strong> {profileData.driver?.name || 'N/A'}</p>
                  <p><strong>Booking:</strong> {profileData.booking}</p>
                  <p><strong>Passenger:</strong> {profileData.user?.name || 'N/A'}</p>
                  <p><strong>Report:</strong> {profileData.report}</p>
                  <p><strong>Description:</strong> {profileData.description || 'N/A'}</p>
                </div>
                 
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="violation-top-bar">
        <h1 className="violation-list">Violation List</h1>
      </div>
          <div className='violations-table'>
      <TableContainer
        sx={{
          maxHeight: 550,
          marginLeft: 28,
          maxWidth: "86%",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}>
        <Table sx={{ '& .MuiTableCell-root': { padding: '12px' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Driver</TableCell>
              <TableCell>Passenger</TableCell>
              <TableCell>Report</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((violation) => (
              <TableRow key={violation._id}> {/* Added key prop */}
                <TableCell>{violation.driver?.name}</TableCell>
                <TableCell>{violation.user?.name}</TableCell>
                <TableCell>{violation.report}</TableCell>
                <TableCell>{violation.description || 'N/A'}</TableCell>
                <TableCell>
                  <button
                    className="view-button"
                    onClick={() => handleViewProfile(violation._id)}
                  >
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error && <div className="error-message">{error}</div>}
    </div>
      <TabBar />
    </div>
  );
};

export default Violations;
