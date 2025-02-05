import React, { useEffect, useState, useMemo } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import { IoSearch } from "react-icons/io5";
import { MdEmail, MdPhone, MdLocationOn, MdCalendarToday } from "react-icons/md";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress } from '@mui/material';
import './commuters.css';


const API_URL = 'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/users';

const Commuters = () => {
 
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortValue, setSortValue] = useState("");
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [showImagePreview, setShowImagePreview] = useState(false);


  const sortOptions = ["Name", "Address"];


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({ ...item, id: index + 1 }));


      const sortedData = dataWithId.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setData(sortedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(nameSearch.toLowerCase())
  );

 
  const handleSort = (e) => {
    const value = e.target.value;
    setSortValue(value);

    const sortedData = [...filteredData].sort((a, b) => {
      if (value === "Name") {
        return a.name.localeCompare(b.name);
      } else if (value === "Address") {
        return (a.address || "").localeCompare(b.address || ""); 
      }
      return 0;
    });

    setData(sortedData);
  };


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
  const handleViewProfile = (id) => {
    const itemToView = data.find((item) => item.id === id);
    setProfileData(itemToView);
    setShowModal(true);
    setShowImagePreview(false); 
  };

  const handleImageClick = () => {
    setShowImagePreview(true);
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
  };

  return (
    <div className='commuters-main-content'>
      
      {showModal && profileData && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
      )}

      
      {showModal && profileData && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" aria-label="Close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <h2 className="profile-title">User Profile</h2>
            <div className="profile-container">
             
              <div className="commuter-profile-image">
                <div className='commuter-image'>
                  <img
                    src={profileData.profilePic || "./defaultPic.jpg"}
                    alt="Profile"
                    className="profile-pic"
                    onClick={handleImageClick}
                  />
                  <p>{profileData.name}</p>
                  <p><strong>Last Login:</strong> {profileData.lastLogin}</p>
                  <p><strong>Violation:</strong> {profileData.violations?.length > 0 ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="user-details">
                <p><strong>ID:</strong> <br />{profileData._id}</p>
                <p><MdEmail /> <strong>Email:</strong><br /> {profileData.email}</p>
                <p><MdPhone /> <strong>Phone:</strong><br /> {profileData.number}</p>
                <p><MdLocationOn /> <strong>Address:</strong><br /> {profileData.address}</p>
                <p><MdCalendarToday /> <strong>Birthday:</strong><br /> {profileData?.birthday ? moment(profileData.birthday).format("MMMM DD, YYYY") : 'N/A'}</p>
                <p><MdCalendarToday /> <strong>Join Date:</strong><br /> {profileData.createdAt ? moment(profileData.createdAt).format("MMMM DD, YYYY") : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
         {showImagePreview && profileData && (
        <div className="commuters-preview-modal">
        <div className="commuters-image-preview-modal" >
            <button className="close" aria-label="Close" onClick={handleCloseImagePreview}>&times;</button>
            <div className='commuters-image-preview-container'>
            <img
              src={profileData.profilePic || "./defaultPic.jpg"}
              alt="Profile Preview"
              className="image-preview"
            />
            </div>
           
          </div>
        </div>
      )}

     
      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
      ) : (
        <div className='passenger-table'>
          <TableContainer
            sx={{
              maxHeight: 680,
              marginLeft: 15,
              marginTop: 3,
              maxWidth: "91.5%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
        
            <div className="commuter-top-bar">
              <h1 className="commuters-list">Commuters List</h1>
              <div className='sort-container'>
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
                <IoSearch className="search-icon"/>
                <input
                  className="input-design"
                  type="text"
                  placeholder="Search"
                  value={nameSearch}
                  onChange={handleSearch}
                />
              </div>
            </div>

           
            <Table sx={{ '& .MuiTableCell-root': { padding: '10px' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={item._id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.name || "N/A"}</TableCell>
                    <TableCell>{item.email || "N/A"}</TableCell>
                    <TableCell>{item.number || "N/A"}</TableCell>
                    <TableCell>{item.address || "N/A"}</TableCell>
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
          
    
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      <TabBar />
    </div>
  );
};

export default Commuters;
