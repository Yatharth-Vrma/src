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
  Chip,
  MenuItem,
  Checkbox,
  CardContent,
  FormControlLabel,
  Typography,
  CardActions,
  InputAdornment,
  Box,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// Available statuses for clients
const statuses = ["Active", "Inactive"];
// Example industries (adjust as needed)
const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"];

// Helper function to format Firestore Timestamps (if applicable)
const formatTimestamp = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString();
  }
  return timestamp;
};

// Helper function to generate a random 3-digit number
const generateRandomNumber = () => Math.floor(100 + Math.random() * 900);

// Helper function to generate Client ID
const generateClientId = (name) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `${initials}-${generateRandomNumber()}`;
};

// Helper function to generate Contract ID
const generateContractId = () => `CON-${generateRandomNumber()}`;

const ManageClient = () => {
  const [open, setOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingClient, setEditingClient] = useState(null);

  // Form states
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [contractId, setContractId] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [cac, setCac] = useState("");
  const [cltv, setCltv] = useState("");
  const [revenueGenerated, setRevenueGenerated] = useState("");
  const [oneTimeRevenue, setOneTimeRevenue] = useState("");
  const [recurringRevenue, setRecurringRevenue] = useState("");
  const [status, setStatus] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClients(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setClientId(client.clientId || "");
    setName(client.name || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setIndustry(client.industry || "");
    setContractId(client.contractId || "");
    setContractStartDate(
      client.contractStartDate && typeof client.contractStartDate.toDate === "function"
        ? client.contractStartDate.toDate().toISOString().substring(0, 10)
        : client.contractStartDate || ""
    );
    setContractEndDate(
      client.contractEndDate && typeof client.contractEndDate.toDate === "function"
        ? client.contractEndDate.toDate().toISOString().substring(0, 10)
        : client.contractEndDate || ""
    );
    setCac(client.Metrics?.cac || "");
    setCltv(client.Metrics?.cltv || "");
    setRevenueGenerated(client.Metrics?.revenueGenerated || "");
    setOneTimeRevenue(client.Metrics?.revenueBreakdown?.oneTimeRevenue || "");
    setRecurringRevenue(client.Metrics?.revenueBreakdown?.recurringRevenue || "");
    setStatus(client.status || "");
    setSelectedProjects(client.projects || []);
    setNotes(client.notes || "");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setConfirmUpdateOpen(true);
  };
  
  const confirmUpdate = async () => {
    const newClient = {
      clientId: editingClient ? editingClient.clientId : generateClientId(name), // Only generate new ID if adding a new client
      name,
      email,
      phone,
      address,
      industry,
      contractId: generateContractId(),
      contractStartDate,
      contractEndDate,
      Metrics: {
        cac,
        cltv,
        revenueGenerated,
        revenueBreakdown: {
          oneTimeRevenue,
          recurringRevenue,
        },
      },
      status,
      projects: selectedProjects,
      notes,
      createdAt: editingClient ? editingClient.createdAt : new Date(),
      updatedAt: new Date(),
    };
  
    if (editingClient) {
      await updateDoc(doc(db, "clients", editingClient.id), newClient);
      setClients(
        clients.map((client) =>
          client.id === editingClient.id ? { ...client, ...newClient } : client
        )
      );
    } else {
      const docRef = await addDoc(collection(db, "clients"), newClient);
      setClients([...clients, { id: docRef.id, ...newClient }]);
    }
  
    setConfirmUpdateOpen(false);
    handleClose();
  };
  
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
      transition: "opacity 0.2s ease-in-out",
    },
    // When focused or if text is present, hide the label completely
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      opacity: 0,
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "12px 14px",
      color: "#1f2937",
    },
  };

  const resetForm = () => {
    setClientId("");
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setIndustry("");
    setContractId("");
    setContractStartDate("");
    setContractEndDate("");
    setCac("");
    setCltv("");
    setRevenueGenerated("");
    setOneTimeRevenue("");
    setRecurringRevenue("");
    setStatus("");
    setSelectedProjects([]);
    setNotes("");
    setEditingClient(null);
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
                Client Management
              </MDTypography>
            </MDBox>
            <MDBox pt={3} pb={2} px={2}>
              <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                Add Clients
              </Button>
            </MDBox>

            {/* Client Cards Grid */}
            <Grid container spacing={3} sx={{ padding: "16px" }}>
              {clients.map((client) => (
                <Grid item xs={12} md={12} key={client.id}>
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
                      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
                        {client.name}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>ID:</strong> {client.clientId}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Email:</strong> {client.email}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Phone:</strong> {client.phone}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Industry:</strong> {client.industry}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Contract:</strong> {client.contractId}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Start:</strong> {formatTimestamp(client.contractStartDate)}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>End:</strong>{" "}
                            {client.contractEndDate
                              ? formatTimestamp(client.contractEndDate)
                              : "Ongoing"}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Status:</strong>{" "}
                            <Chip
                              label={client.status}
                              sx={{
                                backgroundColor: client.status === "Active" ? "#4CAF50" : "#F44336",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                              }}
                            />
                          </MDTypography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>CAC:</strong> ${client.Metrics?.cac || "N/A"}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>CLTV:</strong> ${client.Metrics?.cltv || "N/A"}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Revenue:</strong> ${client.Metrics?.revenueGenerated || "N/A"}
                          </MDTypography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <MDButton
                        variant="text"
                        onClick={() => handleEdit(client)}
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
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Client Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
        <DialogContent sx={{ py: 2, padding: "30px" }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              >
                {industries.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract ID"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Contract Start Date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Contract End Date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="CAC"
                value={cac}
                onChange={(e) => setCac(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment:
                    cac.trim() === "" ? (
                      <InputAdornment position="start">$ CAC</InputAdornment>
                    ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="CLTV"
                value={cltv}
                onChange={(e) => setCltv(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment:
                    cltv.trim() === "" ? (
                      <InputAdornment position="start">$ CLTV</InputAdornment>
                    ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Revenue Generated"
                value={revenueGenerated}
                onChange={(e) => setRevenueGenerated(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment:
                    revenueGenerated.trim() === "" ? (
                      <InputAdornment position="start">$ Revenue Generated</InputAdornment>
                    ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="One-Time Revenue"
                value={oneTimeRevenue}
                onChange={(e) => setOneTimeRevenue(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment:
                    oneTimeRevenue.trim() === "" ? (
                      <InputAdornment position="start">$ One-Time Revenue</InputAdornment>
                    ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Recurring Revenue"
                value={recurringRevenue}
                onChange={(e) => setRecurringRevenue(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
                InputProps={{
                  startAdornment:
                    recurringRevenue.trim() === "" ? (
                      <InputAdornment position="start">$ Recurring Revenue</InputAdornment>
                    ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                margin="dense"
                required
                sx={textFieldStyle}
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="dense"
                sx={textFieldStyle}
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

export default ManageClient;
