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
  CircularProgress,
} from '@mui/material';
import TabBar from '../tab-bar/tabBar';
import './contact.css';

const API_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/contact/sample";
const UPDATE_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/contact/update";
const DELETE_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/contact/delete";
const ADD_URL = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/contact/sample/add";

function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [editingContact, setEditingContact] = useState(null);
  const [editedContact, setEditedContact] = useState({ name: '', number: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentContactId, setCurrentContactId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL);
        setContacts(res.data || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Update contact
  const handleUpdateContact = async (id) => {
    try {
      await axios.put(`${UPDATE_URL}/${id}`, editedContact);
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === id ? { ...contact, ...editedContact } : contact
        )
      );
      setEditingContact(null);
      setEditedContact({ name: '', number: '' });
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  // Delete contact
  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`${DELETE_URL}/${id}`);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Add contact
  const handleAddContact = async () => {
    try {
      const response = await axios.post(ADD_URL, newContact);
      const newContactWithId = { ...newContact, _id: response.data._id }; // Assuming API returns the new contact's ID
      setContacts((prev) => [...prev, newContactWithId]);
      setNewContact({ name: '', number: '' }); // Reset the new contact form
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  // Open modal for confirmation
  const openModal = (action, contactId = null) => {
    setCurrentAction(action);
    setCurrentContactId(contactId);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentAction(null);
    setCurrentContactId(null);
  };

  // Handle confirmation action
  const handleConfirm = () => {
    if (currentAction === 'delete') {
      handleDeleteContact(currentContactId);
    } else if (currentAction === 'update') {
      handleUpdateContact(currentContactId);
    } else if (currentAction === 'add') {
      handleAddContact();  // Directly add the contact without opening a modal
    }
    closeModal();
  };

  return (
    <div className="contact-main-content">
      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
        </div>
      ) : (
        <>
          <TableContainer
            sx={{
              width: '100%',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="contact-top-bar">
              <h1>Contact Management</h1>
            </div>
            <Table sx={{ '& .MuiTableCell-root': { padding: '14px', textAlign: "center" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell>
                      {editingContact === contact._id ? (
                        <TextField
                          value={editedContact.name}
                          onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                          variant="outlined"
                          size="small"
                          placeholder="Name"
                        />
                      ) : (
                        contact.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingContact === contact._id ? (
                        <TextField
                          value={editedContact.number}
                          onChange={(e) => setEditedContact({ ...editedContact, number: e.target.value })}
                          variant="outlined"
                          size="small"
                          placeholder="Number"
                        />
                      ) : (
                        contact.number
                      )}
                    </TableCell>
                    <TableCell>
                      {editingContact === contact._id ? (
                        <>
                          <button
                            className="view-button"
                            onClick={() => openModal('update', contact._id)}
                          >
                            Save
                          </button>
                          <button
                            className="view-button"
                            onClick={() => setEditingContact(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="view-button"
                            onClick={() => {
                              setEditingContact(contact._id);
                              setEditedContact({ name: contact.name, number: contact.number });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => openModal('delete', contact._id)}
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

            <div className="add-contact">
              <TextField
                label="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                variant="outlined"
                size="small"
                placeholder="Contact Name"
              />
              <TextField
                label="Number"
                value={newContact.number}
                onChange={(e) => setNewContact({ ...newContact, number: e.target.value })}
                variant="outlined"
                size="small"
                placeholder="Contact Number"
              />
              <button
                className="view-button"
                onClick={handleAddContact} // Directly add the contact
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

export default ContactManagement;
