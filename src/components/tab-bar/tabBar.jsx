import React from "react";
import { Link } from "react-router-dom";
import "./tabBar.css";
import {
  BsGrid1X2Fill,
  BsPeopleFill,
  BsCurrencyDollar,
  BsCarFrontFill,
  BsPaperclip,
} from "react-icons/bs";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const TabBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        </ul>
      </div>
      <div className="profile">
        <button onClick={handleClick}>
          <img src="image.png" alt="Profile" />
        </button>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My Account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default TabBar;
