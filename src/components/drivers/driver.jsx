import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from "moment";
import './driver.css';

const DRIVER_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver/';
const VIOLATION_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/violate/violation';

const Driver = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [profileData, setProfileData] = useState(null);
  const [rating, setRating] = useState('0.0');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const driverResponse = await axios.get(DRIVER_API_URL);
      const violationResponse = await axios.get(VIOLATION_API_URL);

      const dataWithViolations = driverResponse.data.map((driver, index) => {
        const driverViolations = violationResponse.data.filter(
          (violation) => violation.driver === driver._id
        );
        return {
          ...driver,
          id: index + 1,
          vehicleInfo: driver.vehicleInfo2, 
          violations: driverViolations
        };
      });

      setData(dataWithViolations);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    }
  };

  const fetchRating = async (driverId) => {
    try {
      const res = await axios.get(`https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/rate/ratings/${driverId}`);
      
      if (res.data.status === 'ok') {
        const { averageRating } = res.data.data;
        const formattedRating = averageRating.toFixed(1);
        setRating(formattedRating);
      } else {
        console.error("Cannot find rating");
        setRating('0.0'); 
      }
    } catch (error) {
      console.error('Error fetching driver rating:', error);
      setRating('0.0');
    }
  };


  const handleViewProfile = async (id) => {
    const itemToView = data.find((item) => item.id === id);
    setProfileData(itemToView);
    setShowModal(true);
    await fetchRating(itemToView._id);
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  return (
    <div className='commuters-main-content'>
      {showModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          {profileData && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                <h2 className="profile-title">Driver Profile</h2>
                <div className="profile-container">
                  <div className="profile-image">
                    <img src="https://via.placeholder.com/150" alt="Profile" />
                    <p><strong>Join Date:</strong> {profileData.createdAt}</p>
                    <p><strong>Last Login:</strong> {profileData.lastLogin}</p>
                    <p><strong>Violation:</strong> {profileData.violations?.length > 0 ? "Yes" : "No"}</p>
                    <p>Ratings: {rating}</p>
                  </div>
                  <div className="profile-details">
                    <div>
                      <p><strong>ID:</strong> {profileData._id}</p>
                      <p><strong>Name:</strong> {profileData.name}</p>
                      <p><strong>Email:</strong> {profileData.email}</p>
                      <p><strong>Phone:</strong> {profileData.number}</p>
                      <p><strong>Address:</strong> {profileData.address}</p>
                      <p><strong>Birthday:</strong> {profileData.birthday}</p>
                    </div>
                    <div className='vehicleInfo'>
                      <p><strong>Vehicle Information</strong></p>
                      <p><strong>Vehicle Type:</strong> {profileData.vehicleInfo?.vehicleType}</p>
                      <p><strong>Model:</strong> {profileData.vehicleInfo?.model}</p>
                      <p><strong>Year:</strong> {profileData.vehicleInfo?.year}</p>
                      <p><strong>Color:</strong> {profileData.vehicleInfo?.color}</p>
                      <p><strong>Plate Number:</strong> {profileData.vehicleInfo?.plateNumber}</p>
                      <p><strong>Capacity:</strong> {profileData.vehicleInfo?.capacity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
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
                  <>
                    <button className="delete-button">Block</button>
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

export default Driver;
