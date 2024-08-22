import React, { useState, useEffect } from 'react';
import './dashboard.css';
import TabBar from '../tab-bar/tabBar';
import { BsPeopleFill, BsCarFrontFill } from 'react-icons/bs';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const COMMUTERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';
const DRIVERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver';
const BOOKING_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/ride/booking'

function dashboard() {
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const fetchCommutersCount = async () => {
      try {
        const response = await fetch(COMMUTERS_API_URL);
        const data = await response.json();
        setCommutersCount(data.length);
      } catch (error) {
        console.error('Error fetching commuters count:', error);
      }
    };

    const fetchDriversCount = async () => {
      try {
        const response = await fetch(DRIVERS_API_URL);
        const data = await response.json();
        setDriversCount(data.length);
      } catch (error) {
        console.error('Error fetching drivers count:', error);
      }
    };
    const fetchBookingCount = async () => {
      try {
        const response = await fetch(BOOKING_API_URL);
        const data = await response.json();
        setBookingCount(data.length);
      } catch (error) {
        console.error('Error fetching drivers count:', error);
      }
    };

    fetchCommutersCount();
    fetchDriversCount();
    fetchBookingCount();
  }, []);


  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>DASHBOARD</h3>
      </div>

      <div className='main-cards'>
        <div className='card'>
          <div className='card-inner'>
            <h3>COMMUTERS</h3>
            <BsPeopleFill className='card_icon' />
          </div>
          <h1>{commutersCount}</h1>
        </div>

        <div className='card'>
          <div className='card-inner'>
            <h3>DRIVER</h3>
            <BsPeopleFill className='card_icon' />
          </div>
          <h1>{driversCount}</h1>
        </div>

        <div className='card'>
          <div className='card-inner'>
            <h3>BOOKINGS</h3>
            <BsCarFrontFill className='card_icon' />
          </div>
          <h1>{bookingCount}</h1>
        </div>

        <div className='card'>
          <div className='card-inner'>
            <h3>TODAY REVENUE</h3>
          </div>
          <h1>69</h1>
        </div>
      </div>




        <TabBar />
    </main>
  );
}

export default dashboard;
