import React from "react";
import { Link } from "react-router-dom";
import "./tabBar.css";
import {
  BsGrid1X2Fill,
  BsPeopleFill,
  BsCurrencyDollar,
  BsCarFrontFill,
  BsPaperclip,
  BsPower,
} from "react-icons/bs";


const TabBar = () => {
  
  
  return (
    <div className="main-container">
      <div className="tabBar">
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <ul className="button">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <BsGrid1X2Fill className="icon" /> DASHBOARD
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/applications" className="nav-link">
              <BsPaperclip className="icon" /> Application
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/commuters" className="nav-link">
              <BsPeopleFill className="icon" /> COMMUTERS
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/driver" className="nav-link">
              <BsCarFrontFill className="icon" /> Drivers
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/subscription" className="nav-link">
              <BsCurrencyDollar className="icon" /> Subscription
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/violations" className="nav-link">
              <BsPeopleFill className="icon" /> Violations
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/blocklist" className="nav-link">
              <BsPeopleFill className="icon" /> Blocklist
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/signup" className="nav-link">
              <BsPower className="icon" /> Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TabBar;
