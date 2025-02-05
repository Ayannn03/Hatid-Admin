import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

const API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription";

function Payment() {
  const [subscription, setSubscription] = useState([]); // Subscription list
  const [selectedSubscription, setSelectedSubscription] = useState(null); // Selected subscription for modal
  const [showModal, setShowModal] = useState(false); // Modal visibility

  // Fetch subscriptions from backend
  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data && Array.isArray(res.data)) {
          // Filter subscriptions that have a receipt
          const subscriptionsWithReceipt = res.data.filter(sub => sub.receipt);
          setSubscription(subscriptionsWithReceipt);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };
    fetchSubs();
  }, []);

  // Handle modal open
  const handleView = (sub) => {
    setSelectedSubscription(sub);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedSubscription(null);
    setShowModal(false);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Vehicle Type</TableCell>
              <TableCell>Subscription Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscription.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell>{sub._id}</TableCell>
                <TableCell>{sub.driver}</TableCell>
                <TableCell>{sub.vehicleType}</TableCell>
                <TableCell>{sub.subscriptionType}</TableCell>
                <TableCell>{sub.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleView(sub)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Receipt */}
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Subscription Receipt</DialogTitle>
        <DialogContent>
          {selectedSubscription ? (
            <div>
              <p><strong>Start Date:</strong> {new Date(selectedSubscription.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(selectedSubscription.endDate).toLocaleDateString()}</p>
              {selectedSubscription.receipt ? (
                <div>
                  <p><strong>Receipt:</strong></p>
                  <img
                    src={selectedSubscription.receipt}
                    alt="Receipt"
                    style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              ) : (
                <p>No receipt available for this subscription.</p>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Payment;
