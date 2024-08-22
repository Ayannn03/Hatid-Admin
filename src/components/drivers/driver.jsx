import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from "moment";
import './driver.css';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver/';

const Driver = ({ setBlockedDrivers }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });

  const [showModal, setShowModal] = useState(false); 
  const [profileData, setProfileData] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: index + 1,
        vehicleInfo: item.vehicleInfo2 // Map vehicle information to a key in the state
      }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
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
        <div className="driver-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="driver-modal">
            <div className="driver-modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              {profileData && (
                <>
                  <h2>Profile Details</h2>
                  <p><strong>ID:</strong> {profileData.id}</p>
                  <p><strong>Name:</strong> {profileData.name}</p>
                  <p><strong>Email:</strong> {profileData.email}</p>
                  <p><strong>Phone:</strong> {profileData.number}</p>
                  <p><strong>Address:</strong> {profileData.address}</p>
                  <p><strong>Birthday:</strong>{profileData?.birthday ? moment(profileData.birthday).format("MMMM DD, YYYY") : 'N/A'}</p>
                  <p><strong>Vehicle Type:</strong> {profileData.vehicleInfo?.vehicleType}</p>
                  <p><strong>Model:</strong> {profileData.vehicleInfo?.model}</p>
                  <p><strong>Year:</strong> {profileData.vehicleInfo?.year}</p>
                  <p><strong>Color:</strong> {profileData.vehicleInfo?.color}</p>
                  <p><strong>Plate Number:</strong> {profileData.vehicleInfo?.plateNumber}</p>
                  <p><strong>Capacity:</strong> {profileData.vehicleInfo?.capacity}</p>
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
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Vehicle Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item._id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.number}</td>
                <td>{item.address}</td>
                <td>{item.vehicleInfo?.vehicleType}</td>
                <td>
                  {(
                    <>
                      <button className="delete-button" >Block</button>
                      <button className="view-button" onClick={() => handleViewProfile(item.id)}>View Profile</button>
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

export default Driver;
