import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  TableCell,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  CircularProgress,
} from '@mui/material';

import TabBar from '../tab-bar/tabBar';

const API_URL =
  'https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approved-drivers';

function Suspended() {
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const driverResponse = await axios.get(API_URL);
      const driverData = driverResponse.data;

     
      const filteredData = driverData
        .filter((driver) => driver.isSuspended === true) 
        .map((driver, index) => ({
          ...driver,
          id: index + 1,
          suspensionDays: Math.ceil(
            (new Date(driver.suspendedUntil) - new Date(driver.createdAt)) / (1000 * 60 * 60 * 24)
          ), 
        }))
        .sort((a, b) => b.suspensionDays - a.suspensionDays); 

      setData(filteredData);
      setFilteredData(filteredData); 
      setError(null);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = data.filter((driver) =>
      driver.name.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="commuters-main-content">

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: 4 }} />}

  
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && filteredData.length === 0 && (
        <p style={{ textAlign: 'center' }}>No suspended drivers available.</p>
      )}


      {!loading && !error && filteredData.length > 0 && (
        <>
          
          <TableContainer
            sx={{
              maxHeight: 685,
              marginLeft: 15,
              maxWidth: '91.5%',
              marginTop: 3,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
          <div className="driver-top-bar">
            <h1>Suspended List</h1>
          </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date Suspended</TableCell>
                  <TableCell>Suspended Until</TableCell>
                  <TableCell>Suspension Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {new Date(item.suspendedOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(item.suspendedUntil).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{item.suspensionDays}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 30]}
          />
        </>
      )}

      <TabBar />
    </div>
  );
}

export default Suspended;
