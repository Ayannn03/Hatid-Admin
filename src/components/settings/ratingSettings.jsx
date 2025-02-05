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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TabBar from '../tab-bar/tabBar'; // Assuming you have TabBar component
import './ratingSettings.css';

const API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/rate/criteria";
const DELETE_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/rate/criteria";

function RatingSettings() {
  const [criteria, setCriteria] = useState([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentCriterionId, setCurrentCriterionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriteria = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setCriteria(res.data || []);
      } catch (error) {
        console.error("Error fetching criteria:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCriteria();
  }, []);

  // Add new criterion
  const handleAddCriterion = async () => {
    if (!newCriterion.trim()) return;
    try {
      const res = await axios.post(API_URL, { name: newCriterion });
      
      setCriteria((prev) => [...prev, res.data]);
      setNewCriterion(''); 
    } catch (error) {
      console.error("Error adding criterion:", error);
    }
  };

  // Delete criterion
  const handleDeleteCriterion = async (id) => {
    try {
      await axios.delete(`${DELETE_URL}/${id}`);
      setCriteria((prev) => prev.filter((criterion) => criterion._id !== id));
    } catch (error) {
      console.error("Error deleting criterion:", error);
    }
  };

  // Open modal for confirmation
  const openModal = (action, criterionId = null) => {
    setCurrentAction(action);
    setCurrentCriterionId(criterionId);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentAction(null);
    setCurrentCriterionId(null);
  };

  // Handle confirmation action
  const handleConfirm = () => {
    if (currentAction === 'delete') {
      handleDeleteCriterion(currentCriterionId);
    } else if (currentAction === 'add') {
      handleAddCriterion();
    }
    closeModal();
  };

  return (
    <div className="rating-main-content">
      {/* Show loading spinner */}
      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
        </div>
      ) : (
        <>
          <div className="rating-top-bar">
            <h1>Rating Criteria Settings</h1>
          </div>

          <TableContainer
            sx={{
              width: '100%',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Criterion Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteria.map((criterion) => (
                  <TableRow key={criterion._id}>
                    <TableCell>{criterion.name}</TableCell>
                    <TableCell>
                      <button
                        className="delete-button"
                        onClick={() => openModal('delete', criterion._id)}
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add new criterion */}
            <div className="add-criterion">
              <TextField
                label="Add New Criterion"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                variant="outlined"
                size="small"
              />
              <button
                className="view-button"
                onClick={() => openModal('add')}
              >
                Add
              </button>
            </div>
          </TableContainer>
        </>
      )}

      <TabBar />

      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to proceed with this action?
        </DialogContent>
        <DialogActions>
          <button className="view-button" onClick={closeModal}>
            Cancel
          </button>
          <button className="view-button" onClick={handleConfirm}>
            Confirm
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RatingSettings;
