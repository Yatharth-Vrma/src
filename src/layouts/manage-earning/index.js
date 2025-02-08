import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Typography,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";

const ManageEarning = () => {
  const [open, setOpen] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      const querySnapshot = await getDocs(collection(db, "earnings"));
      setEarnings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClients(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      setAccounts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchEarnings();
    fetchProjects();
    fetchClients();
    fetchAccounts();
  }, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    await deleteDoc(doc(db, "earnings", selectedEarning.id));
    setEarnings(earnings.filter((earning) => earning.id !== selectedEarning.id));
    setConfirmDeleteOpen(false);
  };

  const tableData = {
    columns: [
      { Header: "Earning ID", accessor: "earningId", align: "left" },
      { Header: "Client Name", accessor: "clientName", align: "left" },
      { Header: "Amount", accessor: "amount", align: "left" },
      { Header: "Date", accessor: "date", align: "left" },
      { Header: "Project ID", accessor: "projectId", align: "left" },
      { Header: "Account ID", accessor: "accountId", align: "left" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows: earnings.map((earning) => ({
      earningId: earning.earningId,
      clientName: clients.find((client) => client.id === earning.clientId)?.name || "Unknown",
      amount: `$${earning.amount}`,
      date: earning.date?.toDate().toLocaleDateString() || "N/A",
      projectId: earning.projectId,
      accountId: earning.accountId,
      action: (
        <MDBox display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              setSelectedEarning(earning);
              setViewDetailsOpen(true);
            }}
          >
            View Details
          </Button>
        </MDBox>
      ),
    })),
  };

  return (
    <MDBox
      p={3}
      sx={{
        marginLeft: "250px",
        marginTop: "30px",
        width: "calc(100% - 250px)",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              marginTop: "20px",
              borderRadius: "12px",
              overflow: "visible",
            }}
          >
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
                Earnings
              </MDTypography>
            </MDBox>
            <MDBox pt={3} pb={2} px={2}>
              <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                Add Earnings
              </Button>
              <DataTable
                table={tableData}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* View Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Earning Details</DialogTitle>
        <DialogContent>
          {selectedEarning && (
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
                {clients.find((client) => client.id === selectedEarning.clientId)?.name ||
                  "Unknown Client"}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="body2" color="textSecondary">
                    <strong>Earning ID:</strong> {selectedEarning.earningId}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary">
                    <strong>Amount:</strong> ${selectedEarning.amount}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary">
                    <strong>Date:</strong>{" "}
                    {selectedEarning.date?.toDate().toLocaleDateString() || "N/A"}
                  </MDTypography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="body2" color="textSecondary">
                    <strong>Project ID:</strong> {selectedEarning.projectId || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary">
                    <strong>Account ID:</strong> {selectedEarning.accountId || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body2" color="textSecondary">
                    <strong>Client Status:</strong>{" "}
                    <Chip
                      label={
                        clients.find((client) => client.id === selectedEarning.clientId)?.status ||
                        "Unknown"
                      }
                      sx={{
                        backgroundColor:
                          clients.find((client) => client.id === selectedEarning.clientId)
                            ?.status === "Active"
                            ? "#4CAF50"
                            : "#F44336",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                      }}
                    />
                  </MDTypography>
                </Grid>
              </Grid>
            </CardContent>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              setConfirmDeleteOpen(true);
              setViewDetailsOpen(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this earning?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Earnings Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Earnings</DialogTitle>
        <DialogContent>{/* Add form fields here */}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button color="primary">{/* Add submit handler */}Add</Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default ManageEarning;
