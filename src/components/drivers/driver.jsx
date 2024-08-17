import React, { useEffect, useState } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import { MdCheckBox } from 'react-icons/md';
import './driver.css'

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver/';

const driver = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });

  const [showModal, setShowModal] = useState(false); 
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({ ...item, id: index + 1 }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = data.find((item) => item.id === id);
    setEditItemId(id);
    setEditFormData({
      name: itemToEdit.name,
      email: itemToEdit.email,
    });
  };

  const handleCancel = () => {
    setEditItemId(null);
    setEditFormData({
      name: '',
      email: '',
    });
  };

  const handleSave = async (id) => {
    const updateUrl = `${API_URL}${id}`;
    try {
      console.log("Updating URL:", updateUrl);
      console.log("Data being sent:", editFormData);

      const response = await axios.put(updateUrl, editFormData);
      const updatedData = data.map((item) =>
        item.id === id ? { ...item, ...editFormData } : item
      );
      setData(updatedData);
      setEditItemId(null);
      setEditFormData({
        name: '',
        email: '',
      });
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Error updating data");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}`);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting data:", error);
      setError("Error deleting data");
    }
  };
  const handleViewProfile = (id) => {
    const itemToView = data.find((item) => item.id === id);
    setProfileData(itemToView);
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  return (
    <div className='driver-main-content'>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              {profileData && (
                <>
                  <h2>Profile Details</h2>
                  <p><strong>ID:</strong> {profileData.id}</p>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Phone:</strong> {profileData.phone}</p>
                  <p><strong>Vehicle:</strong> {profileData.vehicle}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h1 className='driver-list'>Drivers List</h1>
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
      <div className='drivers-table'>
        <table className='driver'>
          <thead className='driver-container'>
            <tr className='driver-content'>
              <th><MdCheckBox /></th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item._id}>
                <td><input type="checkbox" /></td>
                <td>{item.id}</td>
                <td>
                  {editItemId === item.id ? (
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, name: e.target.value })
                      }
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  {editItemId === item.id ? (
                    <input
                      type="text"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, email: e.target.value })
                      }
                    />
                  ) : (
                    item.email
                  )}
                </td>
                <td>{item.phone}</td>
                <td>{item.vehicle}</td>
                <td>
                  {editItemId === item.id ? (
                    <>
                      <button className="save-button" onClick={() => handleSave(item.id)}>Save</button>
                      <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="edit-button" onClick={() => handleEdit(item.id)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(item.id)}>Delete</button>
                      <button className="view-button" onClick={()=> handleViewProfile(item.id)}>View Profile</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div className="error-message">{error}</div>}
        <TabBar />
      </div>
    </div>
  );
};

export default driver;
