import React, { useState, useEffect } from 'react';
import './dashboard.css';
import TabBar from '../tab-bar/tabBar';
import { BsPeopleFill, BsCarFrontFill } from 'react-icons/bs';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const COMMUTERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';
const DRIVERS_API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/driver';

function dashboard() {
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);

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

    fetchCommutersCount();
    fetchDriversCount();
  }, []);

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

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
          <h1>69</h1>
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
