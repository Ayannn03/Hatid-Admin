import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import TabBar from '../tab-bar/tabBar';
import './fare.css';

const API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/admin-fare/fares";
const UPDATE_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/admin-fare/edit-fare";

function FairSettings() {
  const [fares, setFares] = useState([]);
  const [originalFares, setOriginalFares] = useState([]);
  const [editFares, setEditFares] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [currentFareId, setCurrentFareId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch fare data when the component mounts
  useEffect(() => {
    const fetchFares = async () => {
      setLoading(true); // Show loading indicator
      try {
        const res = await axios.get(API_URL);
        if (res.data && Array.isArray(res.data)) {
          setFares(res.data);
          setOriginalFares(res.data);
        }
      } catch (error) {
        console.error("Error fetching fares:", error);
      } finally {
        setLoading(false); // Hide loading indicator
      }
    };

    fetchFares();
  }, []);

  // Handle input change for editing fares
  const handleInputChange = (id, field, value) => {
    setEditFares((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Handle update confirmation
  const handleUpdate = async (id) => {
    if (editFares[id]) {
      try {
        const updatedFare = editFares[id];
        await axios.put(`${UPDATE_URL}/${id}`, updatedFare);
        setFares((prev) =>
          prev.map((fare) =>
            fare._id === id ? { ...fare, ...updatedFare } : fare
          )
        );
        setEditFares((prev) => {
          const updatedState = { ...prev };
          delete updatedState[id];
          return updatedState;
        });
        alert('Fare updated successfully!');
      } catch (error) {
        console.error('Error updating fare:', error);
        alert('Failed to update fare');
      }
    }
  };

  // Handle reset confirmation
  const handleReset = async () => {
    try {
      for (const originalFare of originalFares) {
        await axios.put(`${UPDATE_URL}/${originalFare._id}`, originalFare);
      }
      setFares([...originalFares]);
      setEditFares({});
      alert('Fares have been reset to their original values!');
    } catch (error) {
      console.error('Error resetting fares:', error);
      alert('Failed to reset fares');
    }
  };

  // Open confirmation modal
  const openModal = (action, fareId = null) => {
    setActionToConfirm(action);
    setCurrentFareId(fareId);
    setModalOpen(true);
  };

  // Close confirmation modal
  const closeModal = () => {
    setModalOpen(false);
    setActionToConfirm(null);
    setCurrentFareId(null);
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (actionToConfirm === 'update') {
      handleUpdate(currentFareId);
    } else if (actionToConfirm === 'reset') {
      handleReset();
    }
    closeModal();
  };

  return (
    <div className="fare-main-content">
      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
        </div>
      ) : (
        <div>
          <div className="fare-top-bar">
            <h1>Fare Settings</h1>
          </div>

          <TableContainer
            sx={{
              width: '99%',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Table>
              <TableHead sx={{ '& .MuiTableCell-root': { padding: '25px' } }}>
                <TableRow>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Base Fare</TableCell>
                  <TableCell>Booking Fee</TableCell>
                  <TableCell>Fare Per Km</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ '& .MuiTableCell-root': { padding: '30px' } }}>
                {fares.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No fare data available
                    </TableCell>
                  </TableRow>
                ) : (
                  fares.map((fare) => (
                    <TableRow key={fare._id}>
                      <TableCell>{fare.vehicleType}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={editFares[fare._id]?.baseFare ?? fare.baseFare}
                          onChange={(e) =>
                            handleInputChange(fare._id, 'baseFare', e.target.value)
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={editFares[fare._id]?.bookingFee ?? fare.bookingFee}
                          onChange={(e) =>
                            handleInputChange(fare._id, 'bookingFee', e.target.value)
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={editFares[fare._id]?.farePerKm ?? fare.farePerKm}
                          onChange={(e) =>
                            handleInputChange(fare._id, 'farePerKm', e.target.value)
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          className="view-button"
                          onClick={() => openModal('update', fare._id)}
                        >
                          Update
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="reset">
              <button className="view-button" onClick={() => openModal('reset')}>
                Reset Changes
              </button>
            </div>
          </TableContainer>
        </div>
      )}

      <div>
        <TabBar />
      </div>

      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <p>Do you want to proceed with this action?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default FairSettings;
