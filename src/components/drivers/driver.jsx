import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../tab-bar/tabBar";
import axios from "axios";
import moment from "moment";
import { BsCurrencyDollar } from "react-icons/bs";
import { MdEmail, MdPhone, MdLocationOn, MdCake, MdEvent, MdAccessTime, MdSubscriptions, MdDirectionsCar, MdPalette, MdCalendarToday, MdStar} from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  TablePagination } from "@mui/material";
import "./driver.css";

const DRIVER_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/driver";
const VIOLATIONS_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/violate/violation/";
const RATING_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/rate/ratings/";

const Driver = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [rating, setRating] = useState("0.0");
  const [violations, setViolations] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("Personal Info");
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  const sortOptions = ["Name", "Vehicle", "Address"];
  const categoryOptions =["Personal Info", "Vehicle Info"]

  

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const driverResponse = await axios.get(DRIVER_API_URL);
      const driverData = driverResponse.data;

      const dataWithAdditionalInfo = driverData.map((driver, index) => ({
        ...driver,
        id: index + 1,
        vehicleInfo: driver.vehicleInfo2,
      }));

      setData(dataWithAdditionalInfo);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    }
  }, []);

  const fetchViolations = useCallback(async (driverId) => {
    try {
      const res = await axios.get(`${VIOLATIONS_API_URL}${driverId}`);
      setViolations(res.data.status === "ok" ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching violations:", error);
      setViolations([]);
    }
  }, []);

  const fetchSubscriptionType = useCallback(async (driverId) => {
    try {
      const response = await axios.get(`https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/subs/subscription/type/${driverId}`);

      const { subscriptionType } = response.data;
      setSubscription(subscriptionType);
      console.log("Subscription Type:", subscriptionType);
    } catch (error) {
      console.error("Error fetching subscription type:", error);
    }
  }, []);

  const fetchRating = useCallback(async (driverId) => {
    try {
      const res = await axios.get(`${RATING_API_URL}${driverId}`);
      const formattedRating =
        res.data.status === "ok" ? res.data.data.averageRating.toFixed(1) : "0.0";
      setRating(formattedRating);
    } catch (error) {
      console.error("Error fetching driver rating:", error);
      setRating("0.0");
    }
  }, []);

  const handleViewProfile = async (id) => {
    const itemToView = data.find((item) => item.id === id);
    setProfileData(itemToView);
    setShowModal(true);
    await fetchRating(itemToView._id);
    await fetchViolations(itemToView._id);
    await fetchSubscriptionType(itemToView._id);
  };

  const handleViewViolations = () => {
    if (profileData) {
      setShowViolationModal(true);
    }
  };

  const handleSort = (e) => {
    const value = e.target.value;
    setSortValue(value);
  
    const sortedData = [...data].sort((a, b) => {
      if (value === "Name") {
        return a.name.localeCompare(b.name);
      } else if (value === "Vehicle") {
        return (a.vehicleInfo?.vehicleType || "").localeCompare(b.vehicleInfo?.vehicleType || "");
      } else if (value === "Address") {
        return a.address.localeCompare(b.address);
      }
      return 0;
    });
  
    setData(sortedData);
  };
  
  const handleCategory = (value) => {
    setCategoryValue(value);
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
    setVehicleSearch(e.target.value);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(nameSearch.toLowerCase());
      const vehicleMatch = item.vehicleInfo?.vehicleType
        .toLowerCase()
        .includes(vehicleSearch.toLowerCase());
      return nameMatch || vehicleMatch;
    });
  }, [data, nameSearch, vehicleSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="commuters-main-content">
       {showModal && profileData && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="driver-modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              <h2 className="profile-title">Driver Profile</h2>
              <div className="driver-profile-container">
              <div className="driver-profile-image">
                    <img src="image.png" alt="Profile" />
                    <div className="profile-info">
                  
                      <p> <strong>{profileData.name}</strong></p>
                      <p><strong>Last Login:</strong> {profileData.lastLogin || "N/A"}</p>
                      <p><MdStar/> <strong>Ratings:</strong> {rating}</p>
                      <p>Violation: {violations.length || "0"}</p>
                      </div>  
                </div>
                  <div className="profile-details">
                  <div className="tab-bar-container">
                    {categoryOptions.map((category) => (
                      <button
                        key={category}
                        className={`tab-bar-button ${categoryValue === category ? 'active' : ''}`}
                        onClick={() => handleCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {categoryValue === "Personal Info" && (
                    <div className="driverInfo">
                      <p><strong>Driver Information</strong></p>
                      <p><strong>ID:</strong> {profileData._id}</p>
                      <p><MdEmail /> <strong>Email:</strong> {profileData.email}</p>
                      <p><BsCurrencyDollar/> <strong>Subscription Type:</strong> {subscription || "N/A"}</p>
                      <p><MdPhone /> <strong>Phone:</strong> {profileData.number}</p>
                      <p><MdLocationOn /> <strong>Address:</strong> {profileData.address}</p>
                      <p><MdCake /> <strong>Birthday:</strong> {profileData.birthday}</p>
                      <p><MdCalendarToday/> <strong>Join Date:</strong> {profileData.createdAt ? moment(profileData.createdAt).format("MMMM DD, YYYY") : "N/A"}</p>
                    </div>
                  )}

                  {categoryValue === "Vehicle Info" && (
                    <div className="vehicleInfo">
                      <p><strong>Vehicle Information</strong></p>
                      <p>
                        <MdDirectionsCar /> <strong>Vehicle Type:</strong> {profileData.vehicleInfo?.vehicleType}
                      </p>
                      <p>
                        <MdCalendarToday /> <strong>Model:</strong> {profileData.vehicleInfo?.model}
                      </p>
                      <p>
                        <MdEvent /> <strong>Year:</strong> {profileData.vehicleInfo?.year}
                      </p>
                      <p>
                        <MdPalette /> <strong>Color:</strong> {profileData.vehicleInfo?.color}
                      </p>
                      <p>
                        <MdSubscriptions /> <strong>Plate Number:</strong> {profileData.vehicleInfo?.plateNumber}
                      </p>
                      <p>
                        <MdAccessTime /> <strong>Capacity:</strong> {profileData.vehicleInfo?.capacity}
                      </p>
                    </div>
                  )}  
                </div>
                </div>
              </div>
            </div>
        </>
      )}
      
      <TableContainer
        sx={{
          maxHeight: 685,
          marginLeft: 15,
          maxWidth: "92%",
          marginTop: 1.5,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        }}
      ><div className="driver-top-bar">
      <h1 className="driver-list">Drivers List</h1>
      <div className="sort-container" >
        <select onChange={handleSort} value={sortValue}>
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
          onChange={handleSearch}
        />
        <IoSearch className="search-icon" />
      </div>
    </div>
        <Table sx={{ '& .MuiTableCell-root': { padding: '14px', textAlign:"center"} }}>
          
          <TableHead >
            
            <TableRow >
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Vehicle Info</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {paginatedData.map((item) => (
              <TableRow key={item.id} >
                <TableCell >{item.id}</TableCell>
                <TableCell>{item.name || "N/A"}</TableCell>
                <TableCell>{item.number || "N/A"}</TableCell>
                <TableCell>{item.address || "N/A"}</TableCell>
                <TableCell>{item.vehicleInfo?.vehicleType || "N/A"}</TableCell>
                <TableCell>
                <button className="view-button" onClick={() => handleViewProfile(item.id)}>View Details</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 30]}
        component="div"
        count={filteredData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      <TabBar />
    </div>
  );
};

export default Driver;
