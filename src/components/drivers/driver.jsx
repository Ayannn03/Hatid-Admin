import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../tab-bar/tabBar";
import axios from "axios";
import moment from "moment";
import{FaStar} from "react-icons/fa"
import { BsCurrencyDollar } from "react-icons/bs";
import { MdEmail, MdPhone, MdLocationOn, MdCake, MdEvent, MdAccessTime, MdSubscriptions, MdDirectionsCar, MdPalette, MdCalendarToday} from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  TablePagination, CircularProgress} from "@mui/material";
import "./driver.css";

const DRIVER_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approved-drivers";
const VIOLATIONS_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/violate/violation/";
const RATING_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/rate/ratings/";

const Driver = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [rating, setRating] = useState(null);
  const [driverRatings, setDriverRatings] = useState({});
  const [violations, setViolations] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("Personal Info");
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [previewImage, setPreviewImage] = useState(null); // For previewing the clicked image
 


  const sortOptions = ["Name",  "Address"];
  const categoryOptions =["Personal Info", "Vehicle Info" , "Ratings", "Violation", "License Images", "Vehicle Images"]

  

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
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
    }finally {
      setLoading(false);
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
      const response = await axios.get(`https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription/type/${driverId}`);

      const { subscriptionType } = response.data;
      setSubscription(subscriptionType);
      console.log("Subscription Type:", subscriptionType);
    } catch (error) {
      console.error("Error fetching subscription type:", error);
    }
  }, []);


  const fetchAllRatings = useCallback(async (driverId) => {
    try {
      // Start by fetching ratings for the driver
      const res = await axios.get(`${RATING_API_URL}${driverId}`);
      
      if (res.data.status === "ok") {
        // If ratings exist, prepare the list of user IDs for batch fetching
        const ratings = res.data.data.ratings;
  
        // Create a list of unique user IDs from the ratings
        const userIds = Array.from(
          new Set(ratings.map((rating) => rating.user).filter((id) => id)) // filter out any null IDs
        );
  
        // Batch fetch passenger details for all user IDs
        const passengerDetails = await Promise.all(
          userIds.map((userId) => fetchPassengerDetails(userId))
        );
  
        // Map user details back to the ratings
        const ratingsWithPassengerDetails = ratings.map((rating) => ({
          ...rating,
          passengerName: passengerDetails.find(
            (user) => user.userId === rating.user
          )?.name || "N/A",
        }));
  
        // Update state with the fetched ratings
        setDriverRatings((prevRatings) => ({
          ...prevRatings,
          [driverId]: ratingsWithPassengerDetails,
        }));
      } else {
        setDriverRatings((prevRatings) => ({
          ...prevRatings,
          [driverId]: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setDriverRatings((prevRatings) => ({
        ...prevRatings,
        [driverId]: [],
      }));
    }
  }, []);
  
  // Refactor the fetchPassengerDetails to support batch fetching
  const fetchPassengerDetails = async (userId) => {
    try {
      const res = await axios.get(`https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/users/${userId}`);
      return { userId, name: res.data.name || "N/A" };
    } catch (error) {
      console.error("Error fetching passenger details:", error);
      return { userId, name: "N/A" };
    }
  };
  
    
  
  
  const fetchAverageRating = useCallback(async (driverId) => {
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
    
    // Fetch all necessary data including ratings
    await fetchAverageRating(itemToView._id);
    await fetchAllRatings(itemToView._id); // Fetch ratings data here
    await fetchViolations(itemToView._id);
    await fetchSubscriptionType(itemToView._id);
  };
  
  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl); // Set the clicked image URL to state
  };

  const handleClosePreview = () => {
    setPreviewImage(null); // Close the preview
  };


  const handleSort = (e) => {
    const value = e.target.value;
    setSortValue(value);
  
    const sortedData = [...data].sort((a, b) => {
      if (value === "Name") {
        return a.name.localeCompare(b.name);
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
              <span className="driver-close" onClick={() => setShowModal(false)}>&times;</span>
              <h2 className="profile-title">Driver Profile</h2>
              <div className="driver-profile-container">
              <div className="driver-profile-image">
                <div className="profile-image">
                <img
                      src={profileData.profilePic || "./defaultPic.jpg"}
                      alt="Profile"
                      className="profile-pic"
                      onClick={() => handleImagePreview(profileData.profilePic )}
                    />
                    <div className="profile-info">
                      <p><strong>Ratings:</strong> {rating}</p>
                      <p><strong>{profileData.name}</strong></p>
                      <p><strong>Last Login:</strong> {profileData.lastLogin || "N/A"}</p>
                      <p>Violation: {violations.length || "0"}</p>
                    </div>
                  
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
                      <p><strong>ID:</strong> <br />{profileData._id}</p>
                      <p><MdEmail /> <strong>Email:</strong> <br />{profileData.email}</p>
                      <p><BsCurrencyDollar/> <strong>Subscription Type:</strong> <br />{subscription || "N/A"}</p>
                      <p><MdPhone /> <strong>Phone:</strong> <br />{profileData.number}</p>
                      <p><MdLocationOn /> <strong>Address:</strong><br /> {profileData.address}</p>
                      <p><MdCake /> <strong>Birthday:</strong> <br />{profileData.birthday}</p>
                      <p><MdCalendarToday/> <strong>Join Date:</strong> <br />{profileData.createdAt ? moment(profileData.createdAt).format("MMMM DD, YYYY") : "N/A"}</p>
                    </div>
                  )}

                  {categoryValue === "Vehicle Info" && (
                    <div className="vehicleInfo">
                      <p><MdDirectionsCar /> <strong>Vehicle Type:</strong> <br />{profileData.vehicleInfo?.vehicleType}</p>
                      <p><MdCalendarToday /> <strong>Model:</strong> <br />{profileData.vehicleInfo?.model}</p>
                      <p><MdEvent /> <strong>Year:</strong> <br />{profileData.vehicleInfo?.year}</p>
                      <p><MdPalette /> <strong>Color:</strong> <br />{profileData.vehicleInfo?.color}</p>
                      <p><MdSubscriptions /> <strong>Plate Number:</strong> <br /> {profileData.vehicleInfo?.plateNumber}</p>
                      <p><MdAccessTime /> <strong>Capacity:</strong> <br />{profileData.vehicleInfo?.capacity}</p>
                    </div>
                  )} 
                 {categoryValue === "Ratings" && (
                      <div className="ratingsInfo">
                        <TableContainer sx={{ maxHeight: 480, width: "600px", borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)', overflowY: "auto" }}>
                          <Table sx={{ '& .MuiTableCell-root': { textAlign: "center" } }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>Booking</TableCell>
                                <TableCell>Passenger</TableCell>
                                <TableCell>Rating</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {driverRatings[profileData._id] && driverRatings[profileData._id].length > 0 ? (
                              driverRatings[profileData._id].map((rating, index) => (
                                <TableRow key={index}>
                                  <TableCell>{rating.booking || "N/A"}</TableCell>
                                  <TableCell>{rating.passengerName || "N/A"}</TableCell>
                                  <TableCell>{rating.rating || "N/A"}</TableCell>
                                </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                                      No ratings available
                                    </TableCell>
                                  </TableRow>
                                )}

                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    )} 
                  {categoryValue === "Violation" && (
                  <div className="violationsInfo">
                  <TableContainer sx={{maxHeight: 480, width: "600px", borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' , overflowY:"auto"}}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Passenger Name</TableCell>
                          <TableCell>Booking ID</TableCell>
                          <TableCell>Report</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {violations && violations.length > 0 ? (
                          violations.map((violation, index) => (
                            <TableRow key={index}>
                              <TableCell>{violation.user?.name || "N/A"}</TableCell>
                              <TableCell>{violation.booking || "N/A"}</TableCell>
                              <TableCell>{violation.report || "N/A"}</TableCell>
                              <TableCell>{violation.description || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} style={{ textAlign: 'center' }}>No Violations Available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                    </div>
                  )}
               {categoryValue === "License Images" && (
                  <div className="imageInfo">
                    <div className="images-container">
                      <div className="image-wrapper">
                       <h3>License Front: </h3> 
                        {profileData.driverInfo?.licenseFront ? (
                          <img src={profileData.driverInfo.licenseFront} alt="License Front" 
                          onClick={() => handleImagePreview(profileData.driverInfo.licenseFront)}/>
                        ) : (
                          <h4>No image available</h4>
                        )}
                      </div>
                      <div className="image-wrapper">
                        <h3>License Back:</h3>
                        {profileData.driverInfo?.licenseBack ? (
                          <img src={profileData.driverInfo.licenseBack} alt="License Back" 
                          onClick={() => handleImagePreview(profileData.driverInfo.licenseBack)} />
                        ) : (
                          <h4>No image available</h4>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {previewImage && (
                  <div className="preview-modal">

                 
                        <div className="image-preview-modal" >
                    <span className="close-preview-btn"   onClick={handleClosePreview}>&times;</span>
                          <div className="image-preview-container">
                            <img src={previewImage} alt="Preview" className="image-preview" />  
                          </div>
                        </div>
                        </div>
                      )}
                {categoryValue === "Vehicle Images" && (
                  <div className="imageInfo">
                    <div className="images-container">
                      <div className="image-wrapper ">
                        <h3>Vehicle Front:</h3>
                        {profileData.vehicleInfo1?.vehicleFront ? (
                          <img src={profileData.vehicleInfo1.vehicleFront} 
                          alt="Vehicle Front" 
                          onClick={() => handleImagePreview(profileData.vehicleInfo1.vehicleFront)}/>
                        ) : (
                          <h4>No image available</h4>
                        )}
                      </div>
                      <div className="image-wrapper">
                        <h3>Vehicle Back:</h3>
                        {profileData.vehicleInfo1?.vehicleBack ? (
                          <img src={profileData.vehicleInfo1.vehicleBack} alt="Vehicle Back"   
                          onClick={() => handleImagePreview(profileData.vehicleInfo1.vehicleBack)}
                           />
                        ) : (
                          <h4>No image available</h4>
                        )}
                      </div>
                      <div className="image-wrapper">
                        <h3>Vehicle Right:</h3>
                        {profileData.vehicleInfo1?.vehicleRight ? (
                          <img src={profileData.vehicleInfo1.vehicleRight} alt="Vehicle Right" 
                          onClick={() => handleImagePreview(profileData.vehicleInfo1.vehicleRight)}/>
                        ) : (
                          <h4>No image available</h4>
                        )}
                      </div>
                      <div className="image-wrapper">
                        <h3>Vehicle Left:</h3>
                        {profileData.vehicleInfo1?.vehicleLeft ? (
                          <img src={profileData.vehicleInfo1.vehicleLeft} alt="Vehicle Left" 
                          onClick={() => handleImagePreview(profileData.vehicleInfo1.vehicleLeft)} />
                        ) : (
                          <h4>No image available</h4>
                        )}
                      </div>
                    </div>
                  </div>
                )} 
                </div>
                </div>
              </div>
            </div>
        </>
      )}
       {loading ? (
       <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
      ) : (
      <div>

     
      <TableContainer
        sx={{
          maxHeight: 685,
          marginLeft: 15,
          maxWidth: "91.5%",
          marginTop: 3,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="driver-top-bar">
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
              <TableRow key={item._id} >
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
     </div>

         )}

      <TabBar />
    </div>
  );
};

export default Driver;
