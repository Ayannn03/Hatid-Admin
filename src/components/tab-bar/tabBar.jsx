import React from 'react';
import { Link } from 'react-router-dom';
import './tabBar.css';
import { BsGrid1X2Fill, BsPeopleFill, BsCurrencyDollar, BsFillGearFill, BsCarFrontFill } from 'react-icons/bs';

const TabBar = () => {
  return (
    <div className='tabBar'>
      <ul>
        <li className='nav-item'>
          <Link to="/" className='nav-link'>
            <BsGrid1X2Fill className='icon' /> DASHBOARD
          </Link>
        </li>
        <li className='nav-item'>
          <Link to="/employees" className='nav-link'>
            <BsPeopleFill className='icon' /> EMPLOYEES
          </Link>
        </li>
        <li className='nav-item'>
          <Link to="/commuters" className='nav-link'>
            <BsPeopleFill className='icon' /> COMMUTERS
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/driver" className="nav-link">
            <BsCarFrontFill className='icon' /> Drivers
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/blocklist" className="nav-link">
            <BsPeopleFill className='icon' /> Blocklist
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/subscription" className="nav-link">
            <BsCurrencyDollar className='icon' /> Subscription
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default TabBar;
