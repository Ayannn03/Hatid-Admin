import React, { useEffect, useState } from 'react';
import TabBar from '../tab-bar/tabBar';
import { MdCheckBox } from 'react-icons/md';
import axios from 'axios';
import './commuters.css';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';

const Commuters = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
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
    <div className='commuters-main-content'>
      {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}></div>}

      {showModal && profileData && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Profile Details</h2>
            <p><strong>ID:</strong> {profileData.id}</p>
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Phone:</strong> {profileData.number}</p>
            <p><strong>Address:</strong> {profileData.address}</p>
            <p><strong>Birthday:</strong> {profileData.birthday}</p>
          </div>
        </div>
      )}
      
      <div>
        <h1>Passengers List</h1>
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
      <div className='passenger-table'>
        <table>
          <thead>
            <tr>
              <th><MdCheckBox /></th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item._id}>
                <td><input type="checkbox" /></td>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.number}</td>
                <td>{item.address}</td>
                <td>
                  <>
                    <button className="delete-button" onClick={() => handleDelete(item.id)}>Block</button>
                    <button className="view-button" onClick={() => handleViewProfile(item.id)}>View Profile</button>
                  </>
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

export default Commuters;
