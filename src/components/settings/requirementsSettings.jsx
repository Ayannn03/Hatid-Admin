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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TabBar from '../tab-bar/tabBar';
import './requirements.css';

const API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/requirements/documents";
const ADD_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/requirements/add-document";
const DELETE_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/requirements/document";

function RequirementsSettings() {
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [editedDocumentName, setEditedDocumentName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentRequirementId, setCurrentRequirementId] = useState(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data && Array.isArray(res.data.data)) {
          setRequirements(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
      }
    };
    fetchRequirements();
  }, []);

  // Add new requirement
  const handleAddRequirement = async () => {
    if (!newRequirement.trim()) return;
    try {
      const res = await axios.post(ADD_URL, { documentName: newRequirement });
      setRequirements((prev) => [...prev, res.data]);
      setNewRequirement('');
    } catch (error) {
      console.error("Error adding requirement:", error);
    }
  };

  // Update existing requirement
  const handleUpdateRequirement = async (id) => {
    try {
      await axios.put(`${DELETE_URL}/${id}`, { documentName: editedDocumentName });
      setRequirements((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, documentName: editedDocumentName } : req
        )
      );
      setEditingRequirement(null);
      setEditedDocumentName('');
    } catch (error) {
      console.error("Error updating requirement:", error);
    }
  };

  // Delete requirement
  const handleDeleteRequirement = async (id) => {
    try {
      await axios.delete(`${DELETE_URL}/${id}`);
      setRequirements((prev) => prev.filter((req) => req._id !== id));
    } catch (error) {
      console.error("Error deleting requirement:", error);
    }
  };

  // Open modal for confirmation
  const openModal = (action, requirementId = null) => {
    setCurrentAction(action);
    setCurrentRequirementId(requirementId);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentAction(null);
    setCurrentRequirementId(null);
  };

  // Handle confirmation action
  const handleConfirm = () => {
    if (currentAction === 'delete') {
      handleDeleteRequirement(currentRequirementId);
    } else if (currentAction === 'update') {
      handleUpdateRequirement(currentRequirementId);
    } else if (currentAction === 'add') {
      handleAddRequirement();
    }
    closeModal();
  };

  return (
    <div className="require-main-content">

      
      <div className="req-top-bar">
              <h1>Requirements Settings</h1>
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
              <TableCell>Document Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((requirement) => (
              <TableRow key={requirement._id}>
                <TableCell>
                  {editingRequirement === requirement._id ? (
                    <TextField
                      value={editedDocumentName}
                      onChange={(e) => setEditedDocumentName(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    requirement.documentName
                  )}
                </TableCell>
                <TableCell>
                  {editingRequirement === requirement._id ? (
                    <>
                      <button
                        className="view-button"
                        onClick={() => openModal('update', requirement._id)}
                      >
                        Save
                      </button>
                      <button
                        className="view-button"
                        onClick={() => setEditingRequirement(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="view-button"
                        onClick={() => {
                          setEditingRequirement(requirement._id);
                          setEditedDocumentName(requirement.documentName);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => openModal('delete', requirement._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="add-requirement">
        <TextField
          label="Add New Requirement"
          value={newRequirement}
          onChange={(e) => setNewRequirement(e.target.value)}
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

export default RequirementsSettings;
