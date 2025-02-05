import React, { useEffect, useState , useMemo} from "react";
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
  CircularProgress,
  TablePagination,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // For previewing the clicked image
  const [imagePreviewModalOpen, setImagePreviewModalOpen] = useState(false); // State for new preview modal
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [loading, setLoading] = useState(true)
  const [rejectionReasons, setRejectionReasons] = useState(""); 
  const REJECTION_REASONS = [
    "Invalid License",
    "Document Expiry",
    "Failure to Provide Required Information",
    "Ineligibility Due to Location",
  ];
  
  const [selectedReasons, setSelectedReasons] = useState([]);

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

  const handleReasonChange = (event) => {
    setSelectedReasons(event.target.value);
  };
  

  const handleSearch = (e) => {
    setNameSearch(e.target.value);
  };

  const filteredApplications = applications.filter((application) =>
    (application.name || "").toLowerCase().includes(nameSearch.toLowerCase())
  );
  
  const handleApplicationRejection = async () => {
    if (selectedReasons.length === 0) {
      alert("Please select at least one rejection reason.");
      return;
    }
  
    try {
      
      await axios.delete(
        `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/reject/${selectedApplicationId}`,
        { data: { rejectionReasons: selectedReasons } }
      );
  
     
      setApplications((prevApplications) =>
        prevApplications.filter(
          (application) => application.id !== selectedApplicationId
        )
      );
  
      console.log("Driver rejected successfully");
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application. Please try again.");
    } finally {
  
      closeRejectModal();
      setSelectedReasons([]);
    }
  };
  
  
  
  const handleApplicationApproval = async () => {
    try {
      if (!selectedApplicationId) {
        throw new Error("Application ID is required");
      }
  
      const response = await axios.post(
        `https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver/approve-driver/${selectedApplicationId}`
      );
  
      if (response.status === 200) {
        console.log("Driver approved:", response.data);
        fetchData(); 
        closeConfirmModal();
      } else {
        console.error("Failed to approve driver:", response.data.message);
      }
    } catch (error) {
      console.error("Error handling driver approval:", error);
    }
  };

  const openModal = (applicationId, images) => {
    setSelectedApplicationId(applicationId);
    setSelectedImages(images);
    setModalOpen(true);
    setPreviewImage(null); 
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApplicationId(null);
    setSelectedImages([]); 
    setPreviewImage(null); 
  };

  const openConfirmModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedApplicationId(null);
  };

  const openRejectModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setRejectModalOpen(true);
  };
  

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedApplicationId(null);
  };

  const openImagePreviewModal = (image) => {
    setPreviewImage(image);
    setImagePreviewModalOpen(true); 
  };

  const closeImagePreviewModal = () => {
    setImagePreviewModalOpen(false);
    setPreviewImage(null); 
  };


    const paginatedData = useMemo(() => {
      return filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredApplications, page, rowsPerPage]);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleRowsPerPageChange = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };

  return (
    <div>

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
                    cursor: "pointer", 
                  }}
                  onClick={() => openImagePreviewModal(image)} 
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

      <Dialog
  open={rejectModalOpen}
  onClose={closeRejectModal}
  sx={{ "& .MuiPaper-root": { width: "600px", maxWidth: "90%" } }}
>
  <DialogTitle>Reject Application</DialogTitle>
  <DialogContent>
    <FormControl fullWidth>
      <InputLabel id="rejection-reason-label">Rejection Reasons</InputLabel>
      <Select
        labelId="rejection-reason-label"
        id="rejection-reason-select"
        multiple
        value={selectedReasons}
        onChange={handleReasonChange}
        renderValue={(selected) => selected.join(", ")}
      >
        {REJECTION_REASONS.map((reason) => (
          <MenuItem key={reason} value={reason}>
            <Checkbox checked={selectedReasons.includes(reason)} />
            <ListItemText primary={reason} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={closeRejectModal} color="secondary">
      Cancel
    </Button>
    <Button onClick={handleApplicationRejection} color="primary">
      Confirm
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
            {paginatedData.length > 0 ? (
             paginatedData.map((application, index) => (
                
                <TableRow key={application.id}>
                 <TableCell>{page * rowsPerPage + index + 1}</TableCell>
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
                            application.license?.or,
                            application.license?.cr,
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
                      onClick={() => openRejectModal(application.id)}
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
            <TablePagination
        rowsPerPageOptions={[10, 20, 30]}
        component="div"
        count={filteredApplications.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange}
        />
        
      <TabBar />
    </div>

  );
}