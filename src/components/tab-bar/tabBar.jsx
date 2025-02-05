import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./tabBar.css";
import {
  BsChevronDown,
  BsChevronUp,
} from "react-icons/bs"; 
import {
  BarChart2,
  Users,
  Car,
  DollarSign,
  Ban,
  FileText,
  Settings,
  Gauge,
  FileCheck,
} from "lucide-react";

const APPLICATION_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/applicants";

const SUBS_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription";

const TabBar = () => {
  const [applications, setApplications] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [isDriversMenuOpen, setIsDriversMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isSubsMenuOpen, setIsSubsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchSubscriptions();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(APPLICATION_API_URL);
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: item._id || index + 1,
      }));
      setApplications(dataWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(null); // Prevent showing fetch error for applications
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(SUBS_API_URL);
  
      // Ensure the response is an array and handle pending items
      const subscriptionData = Array.isArray(response.data) ? response.data : [];
      setSubscriptions(subscriptionData); // Store the data
  
      setError(null); // Clear any error
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Error fetching subscriptions."); // Show error message
    }
  };
  
  // Utility to count pending subscriptions
  const countPendingSubscriptions = () => {
    return subscriptions.filter((sub) => sub.status === "Pending").length;
  };
  
  
  
  const toggleDriversMenu = () => {
    setIsDriversMenuOpen(!isDriversMenuOpen);
  };

  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
  };

  const toggleSubsMenu = () => {
    setIsSubsMenuOpen(!isSubsMenuOpen);
  };

  const toggleReportMenu = () => {
    setIsReportOpen(!isReportOpen);
  };

  return (
    <div className="main-container">
      <div className="tabBar">
        <div className="logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <ul className="button">
          <li className="nav-item">
            <Link to="/dash" className="nav-link">
              <BarChart2 className="icon" /> DASHBOARD
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/commuters" className="nav-link">
              <Users className="icon" /> Commuters
            </Link>
          </li>
          <li className={`nav-item ${isDriversMenuOpen ? "open" : ""}`}>
            <button className="nav-link toggle-btn" onClick={toggleDriversMenu}>
              <Car className="icon" /> Drivers Management
              {applications.length > 0 && (
                      <span className="icon-button__badge">
                        {applications.length}
                      </span>
                    )}
              {isDriversMenuOpen ? (
                <BsChevronUp className="icon-right" />
              ) : (
                <BsChevronDown className="icon-right" />
              )}
            </button>

            {isDriversMenuOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/driver" className="nav-link">
                    <Car className="icon" /> Drivers List
                  </Link>
                </li>
                <li>
                  <Link to="/violations" className="nav-link">
                    <FileText className="icon" /> Violations
                  </Link>
                </li>
                <li>
                  <Link to="/suspend" className="nav-link">
                    <FileText className="icon" /> Suspend
                  </Link>
                </li>
                <li>
                  <Link to="/applications" className="nav-link">
                    <FileCheck className="icon" /> Applications
                    {applications.length > 0 && (
                      <span className="icon-button__badge">
                        {applications.length}
                      </span>
                    )}
                  </Link>
                </li>
              </ul>
            )}
          </li>

            <li className={`nav-item ${isSubsMenuOpen ? "open" : ""}`}>
            <button className="nav-link toggle-btn" onClick={toggleSubsMenu}>
            <p style={{ fontSize: "20px", color: "white" }}>₱</p> Subscription
              {isSubsMenuOpen ? (
                <BsChevronUp className="icon-right" />
              ) : (
                <BsChevronDown className="icon-right" />
              )}
              {countPendingSubscriptions() > 0 && (
                <span className="icon-button__badge">{countPendingSubscriptions()}</span>
              )}
            </button>

            {isSubsMenuOpen && (
              <ul className="sub-menu">
                <li className="nav-item">
                  <Link to="/subscription" className="nav-link">
                    <Car className="icon" /> Subscribers
                  </Link>
                </li>
                <li>
                  <Link to="/expired" className="nav-link">
                    <Car className="icon" /> Expired Subscriptions
                  </Link>
                </li>
                <li>
                  <Link to="/request" className="nav-link">
                    <Car className="icon" /> Subscription Application
                    {countPendingSubscriptions() > 0 && (
                      <span className="icon-button__badge">{countPendingSubscriptions()}</span>
                    )}
                  </Link>
                </li>
              </ul>
            )}
          </li>


          <li className={`nav-item ${isReportOpen ? "open" : ""}`}>
            <button
              className="nav-link toggle-btn"
              onClick={toggleReportMenu}
            >
              <FileText className="icon" /> Reports
              {isReportOpen ? (
                <BsChevronUp className="icon-right" />
              ) : (
                <BsChevronDown className="icon-right" />
              )}
            </button>

            {isReportOpen && (
              <ul className="sub-menu">
                <li>
                  <Link to="/driverReport" className="nav-link">
                    <Gauge className="icon" /> Drivers Report
                  </Link>
                </li>
                <li>
                  <Link to="/commutersReport" className="nav-link">
                    <FileCheck className="icon" /> Commuters List
                  </Link>
                </li>
                <li>
                  <Link to="/topPerforming" className="nav-link">
                    <FileCheck className="icon" /> Top Performing
                  </Link>
                </li>
                <li>
                  <Link to="/violationsReport" className="nav-link">
                    <FileCheck className="icon" /> Violation
                  </Link>
                </li>
                <li>
                  <Link to="/cancel" className="nav-link">
                    <FileCheck className="icon" /> Cancelation
                  </Link>
                </li>
                <li>
                  <Link to="/booking" className="nav-link">
                    <FileCheck className="icon" /> Booking
                  </Link>
                </li>    
                <li>
                  <Link to="/active" className="nav-link">
                    <FileCheck className="icon" /> Subscribers Report
                  </Link>
                </li>
                <li>
                  <Link to="/expiredRep" className="nav-link">
                    <FileCheck className="icon" /> Expired Subs Report
                  </Link>
                </li>    
              </ul>
            )}
          </li>

          <li className={`nav-item ${isSettingsMenuOpen ? "open" : ""}`}>
            <button className="nav-link toggle-btn" onClick={toggleSettingsMenu}>
              <Settings className="icon" /> Settings
              {isSettingsOpen ? (
                <BsChevronUp className="icon-right" />
              ) : (
                <BsChevronDown className="icon-right" />
              )}
            </button>

            {isSettingsMenuOpen && (
              <ul className="sub-menu">
                <li className="nav-item">
                  <Link to="/fare" className="nav-link">
                  <p style={{ fontSize: "20px", color: "white" }}>₱</p> Fare
                  </Link>
                </li>
                <li>
                  <Link to="/requirements" className="nav-link">
                    <Car className="icon" /> Requirements
                  </Link>
                </li>
                <li>
                  <Link to="/rate" className="nav-link">
                    <Car className="icon" /> Ratings
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="nav-link">
                    <Car className="icon" /> Contact
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TabBar;
