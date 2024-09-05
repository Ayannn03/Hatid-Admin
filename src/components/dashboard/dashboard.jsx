import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import axios from 'axios';
import { BsPeopleFill, BsCarFrontFill } from 'react-icons/bs'; // Example icons
import './dashboard.css';

const COMMUTERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';
const DRIVERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver';
const BOOKING_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/ride/booking';
const SUBSCRIPTION_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription';

const TabBar = lazy(() => import('../tab-bar/tabBar'));

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(SUBSCRIPTION_API_URL);
        const subscriptionData = response.data;

        setSubscriptions(subscriptionData);

        // Calculate the total revenue from all subscriptions
        const total = subscriptionData.reduce((sum, subscription) => {
          return sum + (subscription.price || 0); // Default to 0 if price is undefined
        }, 0);

        setTotalRevenue(total);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [commutersResponse, driversResponse, bookingsResponse] = await Promise.all([
        axios.get(COMMUTERS_API_URL),
        axios.get(DRIVERS_API_URL),
        axios.get(BOOKING_API_URL),
      ]);

      setCommutersCount(commutersResponse.data.length);
      setDriversCount(driversResponse.data.length);
      setBookingCount(bookingsResponse.data.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cardData = useMemo(() => [
    { label: 'COMMUTERS', count: commutersCount, icon: <BsPeopleFill className='card_icon' /> },
    { label: 'DRIVERS', count: driversCount, icon: <BsCarFrontFill className='card_icon' /> },
    { label: 'BOOKINGS', count: bookingCount, icon: <BsCarFrontFill className='card_icon' /> }, // Updated icon for bookings
    { label: 'TOTAL REVENUE', count: totalRevenue, icon: null } // Displaying total revenue
  ], [commutersCount, driversCount, bookingCount, totalRevenue]);

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>DASHBOARD</h3>
      </div>

      <div className='main-cards'>
        {cardData.map((card, index) => (
          <div className='card' key={index}>
            <div className='card-inner'>
              <h3>{card.label}</h3>
              {card.icon}
            </div>
            <h1>{card.count}</h1>
          </div>
        ))}
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TabBar />
      </Suspense>
    </main>
  );
}

export default Dashboard;
