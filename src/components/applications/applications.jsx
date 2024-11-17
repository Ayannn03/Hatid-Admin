'use client'

import React, { useEffect, useState } from "react"
import axios from "axios"
import TabBar from "../tab-bar/tabBar"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material"
import { IoSearch } from "react-icons/io5"

const APPLICATION_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/driver/applicants"

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [error, setError] = useState(null)
  const [nameSearch, setNameSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get(APPLICATION_API_URL)
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: item._id || index + 1, // Use _id if available, otherwise use index + 1
      }))
      setApplications(dataWithId)
      setError(null)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Error fetching data")
    }
  }

  const handleSearch = (e) => {
    setNameSearch(e.target.value)
  }

  const filteredApplications = applications.filter((application) =>
    application.name?.toLowerCase().includes(nameSearch.toLowerCase())
  )

  const handleApplication = async (applicationId) => {
    try {
      if (!applicationId) {
        throw new Error('ApplicationId is required')
      }

      const response = await axios.post(
        `https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/driver/approve-driver/${applicationId}`
      )
      
      if (response.status === 200) {
        console.log('Driver approved:', response.data)
        fetchData() // Refresh the data after successful approval
      } else {
        console.error('Failed to approve driver:', response.data.message)
      }
    } catch (error) {
      console.error('Error handling driver approval:', error)
    }
  }

  return (
    <div>
      <TableContainer component={Paper} sx={{ marginLeft: 30, width: "80%" , marginTop: 3, boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"}}>
        <div className="driver-top-bar">
          <h1 className="driver-list">Application List</h1>
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

        <Table sx={{ "& .MuiTableCell-root": { padding: "12px", textAlign: "center" } }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.id}</TableCell>
                <TableCell>{application.name || "N/A"}</TableCell>
                <TableCell>{application.email || "N/A"}</TableCell>
                <TableCell>{application.accountVerified}</TableCell>
                <TableCell>
                  <button 
                    className="view-button" 
                    onClick={() => handleApplication(application.id)}
                    disabled={application.accountVerified === 'approved'}
                  >
                    {application.accountVerified === 'approved' ? 'Approved' : 'Approve Driver'}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TabBar />
    </div>
  )
}