import React, { useEffect, useState } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import './commuters.css';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';

const Commuters = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortValue, setSortValue] = useState("");

  const sortOptions = ["Name", "Address"];
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({ ...item, id: index + 1 }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
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

  const handleSort = (e) => {
    const value = e.target.value;
    setSortValue(value);
  
    const sortedData = [...data].sort((a, b) => {
      if (value === "Name") {
        return a.name.localeCompare(b.name);
      } else if (value === "Address") {
        return a.address.localeCompare(b.address);
      }
      return 0;
    });
  
    setData(sortedData);
  };
  

  return (
    <div className='commuters-main-content'>
      {showModal && profileData && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
      )}
      {showModal && profileData && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" aria-label="Close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2 className="profile-title">User Profile</h2>
            <div className="profile-container">
              <div className="profile-image">
                <img src="https://via.placeholder.com/150" alt="Profile" />
                <p><strong>Join Date:</strong> {profileData.createdAt ? moment(profileData.createdAt).format("MMMM DD, YYYY") : 'N/A'}</p>
                <p><strong>Last Login:</strong> {profileData.lastLogin}</p>
                <p><strong>Violation:</strong> {profileData.violations?.length > 0 ? "Yes" : "No"}</p>
              </div>
              <div className="user-details">
                <p><strong>ID:</strong> {profileData._id}</p>
                <p><strong>Name:</strong> {profileData.name}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.number}</p>
                <p><strong>Address:</strong> {profileData.address}</p>
                <p><strong>Birthday:</strong> {profileData?.birthday ? moment(profileData.birthday).format("MMMM DD, YYYY") : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="commuter-top-bar">
        <h1 className="commuters-list">Commuters List</h1>
        <div>
          <select onChange={handleSort} value={sortValue}>
            <option value="">Sort By:</option>
            {sortOptions.map((item, index) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </select>
        </div>
      <div className="search-bar-container">
        <input
          className="input-design"
          type="text"
          placeholder= "Search"
          value={nameSearch}
          onChange={handleSearch}
        />
      </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className='passenger-table'>
          <table>
            <thead>
              <tr className="driver-content">
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
        </div>
      )}
      <TabBar />
    </div>
  );
};

export default Commuters;
