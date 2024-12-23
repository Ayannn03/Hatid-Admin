import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import TabBar from "../tab-bar/tabBar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { IoSearch } from "react-icons/io5";
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for loading indicator
import "./violations.css";

const API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/violate/violation";
const API_DRIVER = "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approved-drivers";

const Violations = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [driver, setDriver] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state

  const sortOptions = ["Name", "Report"];

  useEffect(() => {
    fetchViolation();
  }, []);

  const fetchViolation = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("Violation Data", res.data);

      if (res.data.status === "ok") {
        setData(res.data.data || []);
      } else {
        console.error("Cannot find violation");
        setError("No violations found.");
      }
    } catch (error) {
      console.error("Error fetching violations:", error);
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoading(false); // Stop loading after fetching data
    }
  };

  // Group violations by driver
  const groupViolationsByDriver = (violations) => {
    return violations.reduce((acc, violation) => {
      const driverId = violation.driver?._id;
      if (!acc[driverId]) {
        acc[driverId] = {
          driver: violation.driver,
          violations: [],
        };
      }
      acc[driverId].violations.push(violation);
      return acc;
    }, {});
  };

  const groupedData = useMemo(() => groupViolationsByDriver(data), [data]);

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!nameSearch.trim()) return groupedData;

    return Object.fromEntries(
      Object.entries(groupedData).filter(([_, value]) =>
        value.driver?.name?.toLowerCase().includes(nameSearch.toLowerCase())
      )
    );
  }, [groupedData, nameSearch]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    const entries = Object.entries(filteredData);

    if (sortValue === "Name") {
      return entries.sort(([_, a], [__, b]) =>
        (a.driver?.name || "").localeCompare(b.driver?.name || "")
      );
    } else if (sortValue === "Report") {
      return entries.sort(([_, a], [__, b]) => b.violations.length - a.violations.length);
    }

    return entries;
  }, [filteredData, sortValue]);

  const handleViewProfile = (driverId) => {
    const driverData = groupedData[driverId];
    setProfileData(driverData);
    setShowModal(true);
  };

  // Function to determine color based on violation length
  const getColorBasedOnViolationLength = (length) => {
    if (length > 5) return "#E3242B"; // Light red
    if (length > 3) return "rgba(255, 165, 0, 0.1)"; // Light orange
    return "rgba(0, 128, 0, 0.1)"; // Light green
  };

  return (
    <div className="violation-main-content">
      {/* Modal for viewing profile details */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="violation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <span className="violation-close" onClick={() => setShowModal(false)}>
                &times;
              </span>
              {profileData && (
                <>
                  <div className="violations-details">
                    <div className="violation-image">
                      <img
                        src={profileData.profilePic || "./defaultPic.jpg"}
                        alt="Profile"
                        className="profile-pic"
                      />
                    </div>
                    <div className="report">
                      <h2>{profileData.driver?.name || "N/A"}</h2>
                      <p>Driver ID: {profileData.driver?._id || "N/A"}</p>
                    </div>
                    <div className="violation-container">
                      <div className="violation-details">
                        <TableContainer
                          sx={{
                            maxHeight: 400,
                            borderRadius: "8px",  
                            overflow: "auto", 
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)", 
                          }}
                        >
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Passenger</TableCell>
                                <TableCell>Booking</TableCell>
                                <TableCell>Report</TableCell>
                                <TableCell>Description</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {profileData.violations.map((violation, index) => (
                                <TableRow key={index}>
                                  <TableCell>{violation.user?.name || "N/A"}</TableCell>
                                  <TableCell>{violation.booking || "N/A"}</TableCell>
                                  <TableCell>{violation.report || "N/A"}</TableCell>
                                  <TableCell>{violation.description || "N/A"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="violations-table">
          <TableContainer
            sx={{
              maxHeight: 680,
              marginLeft: 28,
              maxWidth: "86%",
              marginTop: "20px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="violation-top-bar">
              <h1 className="violation-list">Violation List</h1>
              <div className="sort-container">
                <select onChange={(e) => setSortValue(e.target.value)} value={sortValue}>
                  <option value="">Sort By:</option>
                  {sortOptions.map((item, index) => (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search-bar-container">
                <input
                  className="input-design"
                  type="text"
                  placeholder="Search"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                />
                <IoSearch className="search-icon" />
              </div>
            </div>

            <Table sx={{ "& .MuiTableCell-root": { padding: "12px", textAlign: "center" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Driver</TableCell>
                  <TableCell>Total Reports</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map(([driverId, value]) => (
                  <TableRow key={driverId}>
                    <TableCell style={{ width: "200px", backgroundColor: getColorBasedOnViolationLength(value.violations.length) }}>{value.driver?.name || "N/A"}</TableCell>
                    <TableCell style={{ width: "200px", backgroundColor: getColorBasedOnViolationLength(value.violations.length) }}>{value.violations.length}</TableCell>
                    <TableCell style={{ width: "200px", backgroundColor: getColorBasedOnViolationLength(value.violations.length) }}>
                      <button
                        className="view-button"
                        onClick={() => handleViewProfile(driverId)}
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      <TabBar/>
    </div>
  );
};

export default Violations;
