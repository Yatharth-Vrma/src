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
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";

// Custom styled button component
import { styled } from "@mui/material/styles";

const CustomButton = styled("button")({
  padding: "10px 25px",
  border: "unset",
  borderRadius: "15px",
  color: "#212121",
  zIndex: 1,
  background: "#e8e8e8",
  position: "relative",
  fontWeight: 1000,
  fontSize: "17px",
  boxShadow: "4px 8px 19px -3px rgba(0,0,0,0.27)",
  transition: "all 250ms",
  overflow: "hidden",
  "&:hover": {
    color: "#e8e8e8",
  },
});

// The ManageEarning component
const ManageEarning = () => {
  const [open, setOpen] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Fetch earnings, projects, clients, and accounts from Firestore on component mount
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

  // Opens the Add/Edit form dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Closes the Add/Edit form dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handles deletion of an earning
  const handleDelete = async () => {
    await deleteDoc(doc(db, "earnings", selectedEarning.id));
    setEarnings(earnings.filter((earning) => earning.id !== selectedEarning.id));
    setConfirmDeleteOpen(false);
  };

  // Define tableData for the DataTable component
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
      date: earning.date?.toDate().toLocaleDateString() || "N/A", // Convert Firestore timestamp to date string
      projectId: earning.projectId,
      accountId: earning.accountId,
      action: (
        <MDBox display="flex" justifyContent="center">
          <CustomButton
            onClick={() => {
              setSelectedEarning(earning);
              setConfirmDeleteOpen(true);
            }}
          >
            Delete
          </CustomButton>
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

      {/* Add/Edit Earnings Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Earnings</DialogTitle>
        <DialogContent>{/* Add form fields for adding earnings here */}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              /* Handle add earnings logic */
            }}
            color="primary"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default ManageEarning;
