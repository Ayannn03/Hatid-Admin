import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import axios from 'axios';
import { BsPeopleFill, BsCarFrontFill } from 'react-icons/bs';
import './dashboard.css';

const COMMUTERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';
const DRIVERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver';
const BOOKING_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/ride/booking';

const TabBar = lazy(() => import('../tab-bar/tabBar'));

function Dashboard() {
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

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
    { label: 'DRIVERS', count: driversCount, icon: <BsPeopleFill className='card_icon' /> },
    { label: 'BOOKINGS', count: bookingCount, icon: <BsCarFrontFill className='card_icon' /> },
    { label: 'TODAY REVENUE', count: 69, icon: null }
  ], [commutersCount, driversCount, bookingCount]);

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
