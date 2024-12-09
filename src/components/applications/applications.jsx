import React, { useEffect, useState } from "react";
import axios from "axios";
import TabBar from "../tab-bar/tabBar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import { IoSearch } from "react-icons/io5";

const APPLICATION_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/applicants";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false); // Modal state for documents
  const [selectedApplicationId, setSelectedApplicationId] = useState(null); // Store application ID for confirmation
  const [selectedImages, setSelectedImages] = useState([]); // Store selected images for modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false); // Modal for confirming approval
  const [previewImage, setPreviewImage] = useState(null); // For previewing the clicked image
  const [imagePreviewModalOpen, setImagePreviewModalOpen] = useState(false); // State for new preview modal
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(APPLICATION_API_URL);
      const dataWithId = response.data.map((item, index) => ({
        ...item,
        id: item._id || index + 1, 
      }));
  
      const sortedData = dataWithId.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApplications(sortedData);
      setError(null); // Clear error on successful fetch
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredApplications = applications.filter((application) =>
    (application.name || "").toLowerCase().includes(nameSearch.toLowerCase())
  );

  const handleApplicationApproval = async () => {
    try {
      if (!selectedApplicationId) {
        throw new Error("ApplicationId is required");
      }

      const response = await axios.post(
        `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approve-driver/${selectedApplicationId}`
      );

      if (response.status === 200) {
        console.log("Driver approved:", response.data);
        fetchData(); // Refresh applications after approval
        closeModal(); // Close the modal
        setConfirmModalOpen(false); // Close the confirmation modal
      } else {
        console.error("Failed to approve driver:", response.data.message);
      }
    } catch (error) {
      console.error("Error handling driver approval:", error);
    }
  };

  const handleApplicationRejection = async (applicationId) => {
    try {
      if (!applicationId) {
        throw new Error("Application ID is required");
      }
  
      const response = await axios.delete(
        `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/reject/${applicationId}`
      );
  
      if (response.status === 200) {
        console.log("Driver rejected:", response.data);
        fetchData(); // Refresh applications after rejection
      } else {
        console.error("Failed to reject driver:", response.data.message);
      }
    } catch (error) {
      console.error("Error handling driver rejection:", error);
    }
  };
  

  const openModal = (applicationId, images) => {
    setSelectedApplicationId(applicationId);
    setSelectedImages(images);
    setModalOpen(true);
    setPreviewImage(null); // Reset preview image when opening the modal
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApplicationId(null);
    setSelectedImages([]); // Clear selected images
    setPreviewImage(null); // Reset preview image
  };

  const openConfirmModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedApplicationId(null);
  };

  const openImagePreviewModal = (image) => {
    setPreviewImage(image);
    setImagePreviewModalOpen(true); // Open the new preview modal
  };

  const closeImagePreviewModal = () => {
    setImagePreviewModalOpen(false);
    setPreviewImage(null); // Reset preview image when closing modal
  };

  return (
    <div>
      {/* View Images Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>View Images</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {selectedImages.length > 0 ? (
              selectedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Document ${index + 1}`}
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    height: "auto",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "8px",
                    cursor: "pointer", // Change cursor to pointer to indicate it's clickable
                  }}
                  onClick={() => openImagePreviewModal(image)} // Open image preview modal
                />
              ))
            ) : (
              <p>No images available.</p>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Application Approval Modal */}
      <Dialog open={confirmModalOpen} onClose={closeConfirmModal}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <p>Do you want to approve this application?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleApplicationApproval} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={imagePreviewModalOpen} onClose={closeImagePreviewModal}>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {previewImage && (
            <div style={{ textAlign: "center" }}>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  height: "auto",
                  objectFit: "contain",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "8px",
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImagePreviewModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
       <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 4 }} />
      ) : (
      <TableContainer
        component={Paper}
        sx={{
          marginLeft: 32,
          width: "84%",
          marginTop: 3,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="driver-top-bar">
          <h1 className="driver-list">Application List</h1>
          <div className="search-bar-container">
            <TextField
              className="input-design"
              variant="outlined"
              size="small"
              placeholder="Search"
              value={nameSearch}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <IoSearch style={{ marginRight: "8px" }} />,
              }}
            />
          </div>
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <Table
          sx={{
            "& .MuiTableCell-root": { padding: "12px", textAlign: "center" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Vehicle Info</TableCell>
              <TableCell>View Documents</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.id}</TableCell>
                  <TableCell>{application.name || "N/A"}</TableCell>
                  <TableCell>{application.email || "N/A"}</TableCell>
                  <TableCell>
                    {application.accountVerified === "approved"
                      ? "Approved"
                      : "Pending"}
                  </TableCell>
                  <TableCell>
                    {application.vehicleInfo2
                      ? `${application.vehicleInfo2.vehicleType}, ${application.vehicleInfo2.model}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <button
                      className="view-button"
                      onClick={() =>
                        openModal(
                          application.id,
                          [
                            application.license?.licenseFront,
                            application.license?.licenseBack,
                            application.vehicleInfo1?.vehicleFront,
                            application.vehicleInfo1?.vehicleBack,
                          ].filter(Boolean)
                        )
                      }
                    >
                      View Documents
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      className="view-button"
                      onClick={() => openConfirmModal(application.id)}
                      disabled={application.accountVerified === "approved"}
                    >
                      Accept
                    </button>

                    <button
                      className="view-button"
                      onClick={() => handleApplicationRejection(application.id)}
                      style={{ marginLeft: "8px", backgroundColor: "#FF5555", color: "#fff" }}
                      disabled={application.accountVerified === "approved"}
                    >
                      Reject
                    </button>
                                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No Applications
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}
      <TabBar />
    </div>

  );
}
