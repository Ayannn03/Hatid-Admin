import React, { useEffect, useState } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import './subscription.css';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription';

const Subscription = () => {
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
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    }
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const handleAcceptPayment = async (subscriptionId) => {
    try {
      if (!subscriptionId) {
        throw new Error('SubscriptionId is required');
      }

      const response = await axios.post(
        'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/payment-accept',
        { subscriptionId }
      );

      if (response.status === 200) {
        console.log('Subscription updated:', response.data);
      
        fetchData();
      } else {
        console.error('Failed to update subscription:', response.data.message);
      }
    } catch (error) {
      console.error('Error handling payment acceptance:', error);
    }
  };

  const filteredData = data.filter((item) =>
    item.driver.toLowerCase().includes(nameSearch.toLowerCase())
  );

  return (
    <div className="driver-main-content">
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={() => setShowModal(false)}>
                &times;
              </span>
              {profileData && (
                <>
                  <h2>Profile Details</h2>
                  <p>
                    <strong>ID:</strong> {profileData._id}
                  </p>
                  <p>
                    <strong>Driver:</strong> {profileData.name}
                  </p>
                  <p>
                    <strong>Subscription Type:</strong> {profileData.subscriptionType}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="subscription-top-bar">
        <h1 className="subcription-list">Subscription List</h1>
        <div className="search-bar-container">
          <input
            className="input-design"
            type="text"
            placeholder="Search"
            value={nameSearch}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="subscriptions-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Driver</th>
              <th>Subscription Type</th>
              <th>Vehicle Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const isExpired = moment().isAfter(item.endDate);

              return (
                <tr key={item._id}>
                  <td>{item.id}</td>
                  <td>{item.driver}</td>
                  <td>{item.subscriptionType}</td>
                  <td>{item.vehicleType}</td>
                  <td>{moment(item.startDate).format('MMMM DD, YYYY')}</td>
                  <td>{moment(item.endDate).format('MMMM DD, YYYY')}</td>
                  <td>{isExpired ? 'Expired' : item.status}</td>
                  <td>
                    {!isExpired && (
                      <button className="view-button" onClick={() => handleAcceptPayment(item._id)}>
                        Accept Payment
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {error && <div className="error-message">{error}</div>}
      </div>
      <TabBar />
    </div>
  );
};

export default Subscription;
