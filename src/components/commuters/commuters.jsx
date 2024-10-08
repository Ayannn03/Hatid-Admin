import React, { useEffect, useState, useMemo } from 'react';
import TabBar from '../tab-bar/tabBar';
import axios from 'axios';
import moment from 'moment';
import { IoSearch } from "react-icons/io5";
import './commuters.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';

const API_URL = 'https://main--exquisite-dodol-f68b33.netlify.app/.netlify/functions/api/users';

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

  const sortOptions = ["Name", "Address"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const dataWithId = response.data.map((item, index) => ({ ...item, id: index + 1 }));
      setData(dataWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (id) => {
    const itemToView = data.find((item) => item.id === id);
    setProfileData(itemToView);
    setShowModal(true);
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
              <div className="profile-image">
                <img src="image.png" alt="Profile" />
                <p><strong>Join Date:</strong> {profileData.createdAt ? moment(profileData.createdAt).format("MMMM DD, YYYY") : 'N/A'}</p>
                <p><strong>Last Login:</strong> {profileData.lastLogin}</p>
                <p><strong>Violation:</strong> {profileData.violations?.length > 0 ? "Yes" : "No"}</p>
              </div>
              <div className="user-details">
                <p><strong>ID:</strong> {profileData._id}</p>
                <p><strong>Name:</strong> {profileData.name}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.number}</p>
                <p><strong>Address:</strong> {profileData.address}</p>
                <p><strong>Birthday:</strong> {profileData?.birthday ? moment(profileData.birthday).format("MMMM DD, YYYY") : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            placeholder= "Search"
            value={nameSearch}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className='passenger-table'>
          <TableContainer
            sx={{
              maxHeight: 550,
              marginLeft: 15,
              maxWidth: "92%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}>
            <Table sx={{ '& .MuiTableCell-root': { padding: '12px' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name || "N/A"}</TableCell>
                    <TableCell>{item.email || "N/A"}</TableCell>
                    <TableCell>{item.number || "N/A"}</TableCell>
                    <TableCell>{item.address || "N/A"}</TableCell>
                    <TableCell>
                      <button className="view-button" onClick={() => handleViewProfile(item.id)}>View</button>
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
