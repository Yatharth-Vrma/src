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
  Box,
  Chip,
  MenuItem,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";

// Available statuses for accounts
const statuses = ["Active", "Closed"];
// Example industries (adjust as needed)
const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"];

const ManageAccount = () => {
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch projects and clients from Firebase
  const [projectList, setProjectList] = useState([]);
  const [clientList, setClientList] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      setAccounts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchAccounts();

    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjectList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();

    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClientList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setName(account.name || "");
    setIndustry(account.industry || "");
    setRevenue(account.revenue || "");
    setExpenses(account.expenses || "");
    setProfitMargin(account.profitMargin || "");
    setProjects(account.projects || []);
    setClients(account.clients || []);
    setStatus(account.status || "");
    setNotes(account.notes || "");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setConfirmUpdateOpen(true);
  };

  const confirmUpdate = async () => {
    const accountId = editingAccount ? editingAccount.accountId : `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
    const calculatedProfitMargin = ((revenue - expenses) / revenue) * 100 || 0;

    const newAccount = {
      accountId,
      name,
      industry,
      revenue,
      expenses,
      profitMargin: calculatedProfitMargin.toFixed(2),
      projects,
      clients,
      status,
      notes,
    };

    if (editingAccount) {
      // Update existing account
      await updateDoc(doc(db, "accounts", editingAccount.id), newAccount);
      setAccounts(
        accounts.map((acc) => (acc.id === editingAccount.id ? { ...acc, ...newAccount } : acc))
      );
    } else {
      // Add new account
      const docRef = await addDoc(collection(db, "accounts"), newAccount);
      setAccounts([...accounts, { id: docRef.id, ...newAccount }]);
    }

    setConfirmUpdateOpen(false);
    handleClose();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "accounts", deleteId));
    setAccounts(accounts.filter((acc) => acc.id !== deleteId));
    setConfirmDeleteOpen(false);
  };

  const resetForm = () => {
    setName("");
    setIndustry("");
    setRevenue("");
    setExpenses("");
    setProfitMargin("");
    setProjects([]);
    setClients([]);
    setStatus("");
    setNotes("");
    setEditingAccount(null);
  };

  // Custom textField styling (as in your ManageRoles code)
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

  return (
    <Box display="flex" padding={2}>
      {/* Sidebar */}
      <Box width={250} padding={2} bgcolor="#f5f5f5">
        <Typography variant="h6">Account Management</Typography>
      </Box>

      {/* Main Content */}
      <Box flex={1} padding={2}>
        <Card
          sx={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            width: "100%",
          }}
        >
          {/* Card Header */}
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
              Account Management
            </MDTypography>
          </MDBox>

          {/* Add Account Button */}
          <MDBox pt={3} pb={2} px={2}>
            <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
              Add Accounts
            </Button>
          </MDBox>

          {/* Account Cards Grid */}
          <Grid container spacing={3} sx={{ padding: "16px" }}>
            {accounts.map((account) => (
              <Grid item xs={12} md={12} key={account.id}>
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
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#333", marginBottom: "8px" }}
                    >
                      {account.name}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      ID: {account.accountId}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Industry: {account.industry}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Revenue: {account.revenue}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Expenses: {account.expenses}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Profit Margin: {account.profitMargin}%
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Projects:{" "}
                      {Array.isArray(account.projects)
                        ? account.projects.join(", ")
                        : "No projects assigned"}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Clients:{" "}
                      {Array.isArray(account.clients)
                        ? account.clients
                            .map((clientId) => {
                              const client = clientList.find((c) => c.id === clientId);
                              return client ? client.name : clientId;
                            })
                            .join(", ")
                        : "No clients assigned"}
                    </Typography>

                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Status:{" "}
                      <Chip
                        label={account.status}
                        color={account.status === "Active" ? "primary" : "default"}
                        size="small"
                      />
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Notes: {account.notes}
                    </Typography>
                  </CardContent>
                  <CardActions
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end", // Pushes buttons to the right
                      alignItems: "center",
                      mt: { xs: 2, sm: 0 },
                    }}
                  >
                    <MDButton
                      variant="text"
                      onClick={() => handleEdit(account)}
                      sx={{
                        background: "linear-gradient(100% 100% at 100% 0, #5adaff 0, #5468ff 100%)",
                        color: "#000000",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "8px",
                        padding: "12px 24px", // Increased padding for larger size
                        fontSize: "16px", // Increased font size
                        minWidth: "120px", // Ensures a consistent button width
                        transition: "0.3s",
                        "&:hover": {
                          background:
                            "linear-gradient(100% 100% at 100% 0, #4e70b9 0, #5adaff 100%)",
                        },
                      }}
                    >
                      <Icon fontSize="medium">edit</Icon>&nbsp;Edit
                    </MDButton>

                    <MDButton
                      variant="text"
                      color="error"
                      onClick={() => {
                        setDeleteId(account.id);
                        setConfirmDeleteOpen(true);
                      }}
                      sx={{
                        ml: 1,
                        padding: "12px 24px", // Increased padding for larger size
                        fontSize: "16px", // Increased font size
                        minWidth: "120px", // Ensures a consistent button width
                      }}
                    >
                      <Icon fontSize="medium">delete</Icon>&nbsp;Delete
                    </MDButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Account Form Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editingAccount ? "Edit Account" : "Add Account"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="dense"
              required
              sx={textFieldStyle}
            />
            <TextField
              label="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              fullWidth
              margin="dense"
              required
              sx={textFieldStyle}
              select
            >
              {industries.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Revenue"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              fullWidth
              margin="dense"
              required
              sx={textFieldStyle}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              type="number"
              label="Expenses"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              fullWidth
              margin="dense"
              required
              sx={textFieldStyle}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth margin="dense" sx={textFieldStyle}>
              <InputLabel>Projects</InputLabel>
              <Select
                multiple
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {projectList.map((project) => (
                  <MenuItem key={project.id} value={project.name}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" sx={textFieldStyle}>
              <InputLabel>Clients</InputLabel>
              <Select
                multiple
                value={clients}
                onChange={(e) => setClients(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {clientList.map((client) => (
                  <MenuItem key={client.id} value={client.name}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
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
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="dense"
              sx={textFieldStyle}
            />
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
          <DialogTitle>Want to delete account data?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Update Dialog */}
        <Dialog open={confirmUpdateOpen} onClose={() => setConfirmUpdateOpen(false)}>
          <DialogTitle>Are you sure you want to save changes?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setConfirmUpdateOpen(false)}>Cancel</Button>
            <Button onClick={confirmUpdate} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ManageAccount;