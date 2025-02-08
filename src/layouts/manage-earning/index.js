import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Box,
  Chip,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import { styled } from "@mui/material/styles";

// Expense (now Earning) categories – you can adjust or rename as needed
const categories = ["Rent", "Software Licenses", "Utilities", "Salaries", "Marketing", "Other"];

const ManageEarnings = () => {
  // Dialog and data states
  const [open, setOpen] = useState(false); // For Add/Edit form
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [editingEarning, setEditingEarning] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states (for Earnings)
  const [earningId, setEarningId] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [recurring, setRecurring] = useState(false);

  // Helper function to format Firestore Timestamps (if applicable)
  const formatTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
    return timestamp;
  };

  // Fetch earnings from Firestore on mount
  useEffect(() => {
    const fetchEarnings = async () => {
      const querySnapshot = await getDocs(collection(db, "earnings"));
      setEarnings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchEarnings();
  }, []);

  // Open Add/Edit dialog and reset form fields
  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  // Close dialog and reset form
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Populate form fields for editing an earning
  const handleEdit = (earning) => {
    setEditingEarning(earning);
    setEarningId(earning.earningId);
    setCategory(earning.category);
    setAmount(earning.amount);
    // Convert Firestore Timestamp to ISO date (YYYY-MM-DD) for date input
    setDate(
      earning.date && typeof earning.date.toDate === "function"
        ? earning.date.toDate().toISOString().split("T")[0]
        : earning.date || ""
    );
    setDescription(earning.description);
    setProjectId(earning.projectId || "");
    setAccountId(earning.accountId || "");
    setRecurring(earning.recurring || false);
    setOpen(true);
  };

  // Open confirmation dialog for update/add
  const handleSubmit = async () => {
    setConfirmUpdateOpen(true);
  };

  // Confirm update or add earning in Firestore
  const confirmUpdate = async () => {
    const newEarning = {
      earningId,
      category,
      amount: Number(amount),
      date: new Date(date),
      description,
      projectId: projectId || null,
      accountId: accountId || null,
      recurring,
    };

    if (editingEarning) {
      await updateDoc(doc(db, "earnings", editingEarning.id), newEarning);
      setEarnings(
        earnings.map((earn) => (earn.id === editingEarning.id ? { ...earn, ...newEarning } : earn))
      );
    } else {
      const docRef = await addDoc(collection(db, "earnings"), newEarning);
      setEarnings([...earnings, { id: docRef.id, ...newEarning }]);
    }

    setConfirmUpdateOpen(false);
    handleClose();
  };

  // Handle deletion of an earning
  const handleDelete = async () => {
    await deleteDoc(doc(db, "earnings", deleteId));
    setEarnings(earnings.filter((earn) => earn.id !== deleteId));
    setConfirmDeleteOpen(false);
  };

  // Reset all form fields
  const resetForm = () => {
    setEarningId("");
    setCategory("");
    setAmount("");
    setDate("");
    setDescription("");
    setProjectId("");
    setAccountId("");
    setRecurring(false);
    setEditingEarning(null);
  };

  // Custom textField styling (same as in ManageClients)
  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#f9fafb",
      "&:hover fieldset": { borderColor: "#c0c4c9" },
      "&.Mui-focused fieldset": {
        borderColor: "#3b4ce2",
        boxShadow: "0 0 0 2px rgba(59, 76, 226, 0.1)",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.875rem",
      color: "#374151",
      transform: "translate(14px, 16px) scale(1)",
      "&.Mui-focused": { color: "#3b4ce2" },
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "12px 14px",
      color: "#1f2937",
    },
  };

  // Define tableData for DataTable component (similar to ManageProject)
  const tableData = {
    columns: [
      { Header: "earning", accessor: "earning", width: "30%", align: "left" },
      { Header: "amount", accessor: "amount", align: "left" },
      { Header: "date", accessor: "date", align: "center" },
      { Header: "description", accessor: "description", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],
    rows: earnings.map((earning) => ({
      earning: (
        <MDTypography variant="button" fontWeight="medium" display="block">
          {earning.category} <br />
          <Typography variant="caption" color="textSecondary" display="block">
            ID: {earning.earningId}
          </Typography>
        </MDTypography>
      ),
      amount: (
        <MDTypography variant="button" color="text" fontWeight="medium">
          ${earning.amount}
        </MDTypography>
      ),
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {earning.date?.toDate ? earning.date.toDate().toLocaleDateString() : earning.date}
        </MDTypography>
      ),
      description: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {earning.description}
        </MDTypography>
      ),
      action: (
        <MDBox display="flex" justifyContent="center">
          <CustomButton onClick={() => handleEdit(earning)}>View Details</CustomButton>
        </MDBox>
      ),
    })),
  };

  // Custom styled button using Material UI styled API (same as in ManageProject)
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
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: 0,
      borderRadius: "15px",
      backgroundColor: "#212121",
      zIndex: -1,
      boxShadow: "4px 8px 19px -3px rgba(0,0,0,0.27)",
      transition: "all 250ms",
    },
    "&:hover": {
      color: "#e8e8e8",
    },
    "&:hover::before": {
      width: "100%",
    },
  });

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
              mx={0}
              mt={-4.5}
              py={3}
              px={3}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                Earnings Management
              </MDTypography>
            </MDBox>
            <MDBox pt={3} pb={2} px={2}>
              <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                Add Earnings
              </Button>
            </MDBox>

            {/* Earnings Cards Grid */}
            <Grid container spacing={3} sx={{ padding: "16px" }}>
              {earnings.map((earning) => (
                <Grid item xs={12} sm={6} md={12} key={earning.id}>
                  <Card
                    sx={{
                      background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      padding: "20px",
                      transition: "0.3s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                        {earning.category}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Earning ID:</strong> {earning.earningId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Amount:</strong> ${earning.amount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong>{" "}
                        {earning.date?.toDate
                          ? earning.date.toDate().toLocaleDateString()
                          : earning.date}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Description:</strong> {earning.description}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Project ID:</strong> {earning.projectId || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Account ID:</strong> {earning.accountId || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Recurring:</strong>{" "}
                        <Chip label={earning.recurring ? "Yes" : "No"} size="small" />
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <MDButton
                        variant="text"
                        onClick={() => handleEdit(earning)}
                        sx={{
                          background:
                            "linear-gradient(100% 100% at 100% 0, #5adaff 0, #5468ff 100%)",
                          color: "#000",
                          fontWeight: "bold",
                          borderRadius: "8px",
                          padding: "12px 24px",
                        }}
                      >
                        <Icon fontSize="medium">edit</Icon>&nbsp;Edit
                      </MDButton>
                      <MDButton
                        variant="text"
                        color="error"
                        onClick={() => {
                          setDeleteId(earning.id);
                          setConfirmDeleteOpen(true);
                        }}
                        sx={{ ml: 1, padding: "12px 24px" }}
                      >
                        <Icon fontSize="medium">delete</Icon>&nbsp;Delete
                      </MDButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Earning Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingEarning ? "Edit Earning" : "Add Earning"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Earning ID"
                value={earningId}
                onChange={(e) => setEarningId(e.target.value)}
                fullWidth
                margin="dense"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                margin="dense"
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="number"
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                margin="dense"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                margin="dense"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                margin="dense"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    color="primary"
                  />
                }
                label="Recurring Earning"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Want to delete earning data?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Update Dialog */}
      <Dialog open={confirmUpdateOpen} onClose={() => setConfirmUpdateOpen(false)}>
        <DialogTitle>Want to save details?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmUpdateOpen(false)}>Cancel</Button>
          <Button onClick={confirmUpdate} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default ManageEarnings;
