import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../tab-bar/tabBar";
import axios from "axios";
import moment from "moment";
import "./driver.css";

const DRIVER_API_URL =
  "https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver/";
const VIOLATIONS_API_URL = 
  "https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/violate/violation/";
const RATING_API_URL =
  "https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/rate/ratings/";

const Driver = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [rating, setRating] = useState("0.0");
  const [violations, setViolations] = useState([]);
  const [subscription, setSubscription] = useState(null);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const driverResponse = await axios.get(DRIVER_API_URL);
      const driverData = driverResponse.data;

      const dataWithAdditionalInfo = driverData.map((driver, index) => ({
        ...driver,
        id: index + 1,
        vehicleInfo: driver.vehicleInfo2,
      }));

      setData(dataWithAdditionalInfo);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    }
  }, []);

  const fetchViolations = useCallback(async (driverId) => {
    try {
      const res = await axios.get(`${VIOLATIONS_API_URL}${driverId}`);
      setViolations(res.data.status === "ok" ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching violations:", error);
      setViolations([]);
    }
  }, []);


  const fetchSubscriptionType = useCallback(async (driverId) => {
    try {
      const response = await axios.get(`https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription/type/${driverId}`);
      
     
      const { subscriptionType } = response.data;
      setSubscription(subscriptionType)
      console.log('Subscription Type:', subscriptionType);

    } catch (error) {
      console.error('Error fetching subscription type:', error);
    }
  }, []);



  const fetchRating = useCallback(async (driverId) => {
    try {
      const res = await axios.get(`${RATING_API_URL}${driverId}`);
      const formattedRating = res.data.status === "ok"
        ? res.data.data.averageRating.toFixed(1)
        : "0.0";
      setRating(formattedRating);
    } catch (error) {
      console.error("Error fetching driver rating:", error);
      setRating("0.0");
    }
  }, []);

  const handleViewProfile = async (id) => {
    const itemToView = data.find((item) => item.id === id);
    setProfileData(itemToView);
    setShowModal(true);
    await fetchRating(itemToView._id);
    await fetchViolations(itemToView._id);
    await fetchSubscriptionType(itemToView._id);
  };

  const handleViewViolations = () => {
    if (profileData) {
      setShowViolationModal(true);
    }
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredData = useMemo(() =>
    data.filter((item) =>
      item.name.toLowerCase().includes(nameSearch.toLowerCase())
    ), [data, nameSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="commuters-main-content">
      {showModal && profileData && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              <h2 className="profile-title">Driver Profile</h2>
              <div className="profile-container">
                <div className="profile-image">
                  <img src="https://via.placeholder.com/150" alt="Profile" />
                  <p><strong>Join Date:</strong> {profileData.createdAt ? moment(profileData.createdAt).format("MMMM DD, YYYY") : "N/A"}</p>
                  <p><strong>Last Login:</strong> {profileData.lastLogin}</p>
                  <li><strong><a href="#!" onClick={handleViewViolations}>Violations</a></strong></li>
                  <p>Ratings: {rating}</p>
                  <p>Subscription Type: {subscription || "N/A"}</p>
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
                  <div className="vehicleInfo">
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
        </>
      )}

      {showViolationModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowViolationModal(false)}>&times;</span>
            <h2 className="profile-title">Driver Violations</h2>
            <div className="profile-container">
              {violations.length > 0 ? (
                <table className="violation-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Booking</th>
                      <th>User</th>
                      <th>Report</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((violation, index) => (
                      <tr key={index}>
                        <td>{moment(violation.createdAt).format("MMMM DD, YYYY")}</td>
                        <td>{violation.booking}</td>
                        <td>{violation.user?.name}</td>
                        <td>{violation.report}</td>
                        <td>{violation.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No violations found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="driver-list">Drivers List</h1>
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
      <div className="drivers-table">
        <table className="driver">
          <thead className="driver-container">
            <tr className="driver-content">
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Vehicle Info</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.number}</td>
                <td>{item.address}</td>
                <td>{item.vehicleInfo?.vehicleType}</td>
                <td>
                  <button className="view-button" onClick={() => handleViewProfile(item.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TabBar />
    </div>
  );
};

export default Driver;
