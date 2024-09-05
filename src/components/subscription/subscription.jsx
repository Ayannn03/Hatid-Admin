import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from "moment";
import "./subscription.css"
import moment from 'moment';
import TabBar from '../tab-bar/tabBar';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription';
const EXPIRE_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription/expire';

const Subscription = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);


  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({ ...item, id: index + 1 }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    }
  };

  const checkExpiredSubscriptions = async () => {
    try {
      await axios.post('https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription/expire');
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  };
  useEffect(() => {
  
    const interval = setInterval(() => {
      checkExpiredSubscriptions();
    }, 300); 


    return () => clearInterval(interval);
  }, []);

  const handleAcceptPayment = async (subscriptionId) => {
    try {
      if (!subscriptionId) {
        throw new Error('SubscriptionId is required');
      }

      const response = await axios.post('https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/payment-accept', 
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


  const updateExpiredSubscriptions = async () => {
    try {
      const response = await axios.post(EXPIRE_URL);
      console.log(response.data.message);
      fetchData(); 
    } catch (error) {
      console.error('Error updating expired subscriptions:', error);
    }
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.driver.toLowerCase().includes(nameSearch.toLowerCase())
  );

  useEffect(() => {
 
    fetchData();
    updateExpiredSubscriptions();

    const dataIntervalId = setInterval(fetchData, 30000);
    const expireIntervalId = setInterval(updateExpiredSubscriptions, 30000);


    return () => {
      clearInterval(dataIntervalId);
      clearInterval(expireIntervalId);
    };
  }, []);

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
                  <p><strong>ID:</strong> {profileData._id}</p>
                  <p><strong>Driver:</strong> {profileData.name}</p>
                  <p><strong>Subscription Type:</strong> {profileData.subscriptionType}</p>
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
          placeholder= "Search"
          value={nameSearch}
          onChange={handleSearch}
        />
      </div>
      </div>

      <div className='subscriptions-table'>
        <table >
          <thead >
            <tr >
              <th>ID</th>
              <th>Driver</th>
              <th>Subscription Type</th>
              <th>Vehicle Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Price</th>
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
        <td>{moment(item.startDate).format("MMMM DD, YYYY")}</td>
        <td>{moment(item.endDate).format("MMMM DD, YYYY")}</td>
        <td>{item.price}</td>
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
        <TabBar />
      </div>
    </div>
  );
};

export default Subscription;
