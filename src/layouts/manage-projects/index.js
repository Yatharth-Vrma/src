import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
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
  MenuItem,
  Card,
  Box,
  Autocomplete,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

// Define available statuses for projects
const statuses = ["Ongoing", "Completed", "On Hold"];

// Custom styled button component (used in the table action)
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

// The Progress component shows the project's completion percentage with a progress bar
const Progress = ({ value, status }) => {
  const getColor = () => {
    switch (status) {
      case "Completed":
        return "success";
      case "On Hold":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <MDBox display="flex" alignItems="center">
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {value}%
      </MDTypography>
      <MDBox ml={0.5} width="9rem">
        <MDProgress variant="gradient" color={getColor()} value={value} />
      </MDBox>
    </MDBox>
  );
};

// Add prop types for Progress component
Progress.propTypes = {
  value: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};

// The Project component used inside the table for the "project" column.
// It displays the project name with the project ID on a new line.
const ProjectInfo = ({ name, projectId }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDBox ml={0} lineHeight={1.2}>
      <MDTypography variant="button" fontWeight="medium" display="block">
        {name}
      </MDTypography>
      <MDTypography variant="caption" color="textSecondary" display="block">
        ID: {projectId}
      </MDTypography>
    </MDBox>
  </MDBox>
);

// Add prop types for ProjectInfo component
ProjectInfo.propTypes = {
  name: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
};

const ManageProject = () => {
  // Dialog and state declarations
  const [open, setOpen] = useState(false); // For add/edit form dialog
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false); // For project details dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [invalidClientId, setInvalidClientId] = useState(false);
  const [invalidAccountId, setInvalidAccountId] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [clientId, setClientId] = useState("");
  const [team, setTeam] = useState("");
  const [budget, setBudget] = useState("");
  const [expenses, setExpenses] = useState("");
  const [roi, setRoi] = useState("");
  const [burnRate, setBurnRate] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [revenueGenerated, setRevenueGenerated] = useState("");
  const [expectedRevenue, setExpectedRevenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [completion, setCompletion] = useState("");

  // Fetch projects and employees from Firestore on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "employees"));
      setEmployees(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
    fetchEmployees();
  }, []);

  // Opens the Add/Edit form dialog and resets form fields
  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  // Closes the Add/Edit form dialog and resets fields
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Opens the Project Details dialog
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setViewDetailsOpen(true);
  };

  // Called when clicking "Edit" from the details dialog.
  // Populates form fields with the selected project's data.
  const handleEditFromDetails = () => {
    const project = selectedProject;
    setEditingProject(project);
    setName(project.name);
    setAccountId(project.accountId);
    setClientId(project.clientId);
    setTeam(project.team);
    setBudget(project.financialMetrics?.budget || "");
    setExpenses(project.financialMetrics?.expenses || "");
    setRoi(project.financialMetrics?.roi || "");
    setBurnRate(project.financialMetrics?.burnRate || "");
    setProfitMargin(project.financialMetrics?.profitMargin || "");
    setRevenueGenerated(project.financialMetrics?.revenueGenerated || "");
    setExpectedRevenue(project.financialMetrics?.expectedRevenue || "");
    setStartDate(project.startDate);
    setEndDate(project.endDate);
    setStatus(project.status);
    setDescription(project.description);
    setCompletion(project.completion || "");
    setSelectedEmployees(project.teamMembers || []);
    setViewDetailsOpen(false);
    setOpen(true);
  };

  // Function to handle project update/add submission; shows confirmation dialog
  const handleSubmit = async () => {
    // Validate Client ID and Account ID
    const clientExists = await checkIfClientExists(clientId);
    const accountExists = await checkIfAccountExists(accountId);

    if (!clientExists || !accountExists) {
      setInvalidClientId(!clientExists);
      setInvalidAccountId(!accountExists);
      return;
    }

    setConfirmUpdateOpen(true);
  };

  // Check if Client ID exists in Firebase
  const checkIfClientExists = async (clientId) => {
    const querySnapshot = await getDocs(collection(db, "clients"));
    return querySnapshot.docs.some((doc) => doc.data().clientId === clientId);
  };

  const checkIfAccountExists = async (accountId) => {
    const querySnapshot = await getDocs(collection(db, "accounts"));
    return querySnapshot.docs.some((doc) => doc.data().accountId === accountId);
  };

  // Called once the update confirmation is accepted.
  // It adds a new project or updates an existing one in Firestore.
  const confirmUpdate = async () => {
    const projectId = generateProjectId(name);

    const newProject = {
      projectId,
      name,
      accountId,
      clientId,
      team,
      teamMembers: selectedEmployees,
      financialMetrics: {
        budget,
        expenses,
        roi,
        burnRate,
        profitMargin,
        revenueGenerated,
        expectedRevenue,
      },
      startDate,
      endDate,
      status,
      description,
      completion,
    };

    if (editingProject) {
      await updateDoc(doc(db, "projects", editingProject.id), newProject);
      setProjects(
        projects.map((proj) => (proj.id === editingProject.id ? { ...proj, ...newProject } : proj))
      );
    } else {
      const docRef = await addDoc(collection(db, "projects"), newProject);
      setProjects([...projects, { id: docRef.id, ...newProject }]);
    }

    setConfirmUpdateOpen(false);
    handleClose();
  };

  // Generate a Project ID based on the project name and a random number
  const generateProjectId = (name) => {
    const prefix = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
    const randomNumber = Math.floor(Math.random() * 1000);
    return `${prefix}-${randomNumber}`; // Fixed template literal
  };

  // Handles deletion of a project from Firestore
  const handleDelete = async () => {
    await deleteDoc(doc(db, "projects", deleteId));
    setProjects(projects.filter((proj) => proj.id !== deleteId));
    setConfirmDeleteOpen(false);
    setViewDetailsOpen(false);
  };

  // Resets all form fields
  const resetForm = () => {
    setName("");
    setAccountId("");
    setClientId("");
    setTeam("");
    setBudget("");
    setExpenses("");
    setRoi("");
    setBurnRate("");
    setProfitMargin("");
    setRevenueGenerated("");
    setExpectedRevenue("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setDescription("");
    setCompletion("");
    setSelectedEmployees([]);
    setEditingProject(null);
    setInvalidClientId(false);
    setInvalidAccountId(false);
  };

  // Define tableData for the DataTable component.
  // The "action" column now shows a custom button to view project details.
  const tableData = {
    columns: [
      { Header: "project", accessor: "project", width: "30%", align: "left" },
      { Header: "budget", accessor: "budget", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "completion", accessor: "completion", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],
    rows: projects.map((project) => ({
      project: <ProjectInfo name={project.name} projectId={project.projectId} />,
      budget: (
        <MDTypography variant="button" color="text" fontWeight="medium">
          ${project.financialMetrics?.budget || 0}
        </MDTypography>
      ),
      status: (
        <Chip
          label={project.status}
          color={
            project.status === "Completed"
              ? "success"
              : project.status === "On Hold"
              ? "warning"
              : "info"
          }
          size="small"
        />
      ),
      completion: <Progress value={project.completion || 0} status={project.status} />,
      action: (
        <MDBox display="flex" justifyContent="center">
          <Button
            variant="gradient"
            color="info"
            onClick={() => handleViewDetails(project)}
            sx={{ mb: 2 }}
          >
            View Project
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
                Projects
              </MDTypography>
            </MDBox>
            <MDBox pt={3} pb={2} px={2}>
              <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                Add Projects
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

      {/* Project Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Project ID</Typography>
                <Typography>{selectedProject.projectId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography>{selectedProject.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Account ID</Typography>
                <Typography>{selectedProject.accountId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Client ID</Typography>
                <Typography>{selectedProject.clientId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Team</Typography>
                <Typography>{selectedProject.team}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Budget</Typography>
                <Typography>${selectedProject.financialMetrics?.budget || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Expenses</Typography>
                <Typography>${selectedProject.financialMetrics?.expenses || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">ROI (%)</Typography>
                <Typography>{selectedProject.financialMetrics?.roi || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Burn Rate</Typography>
                <Typography>{selectedProject.financialMetrics?.burnRate || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Profit Margin (%)</Typography>
                <Typography>{selectedProject.financialMetrics?.profitMargin || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Revenue Generated</Typography>
                <Typography>{selectedProject.financialMetrics?.revenueGenerated || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Expected Revenue</Typography>
                <Typography>{selectedProject.financialMetrics?.expectedRevenue || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Start Date</Typography>
                <Typography>{selectedProject.startDate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">End Date</Typography>
                <Typography>{selectedProject.endDate || "Ongoing"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{selectedProject.status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Completion (%)</Typography>
                <Typography>{selectedProject.completion}%</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography>{selectedProject.description}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          <Button onClick={handleEditFromDetails} color="primary">
            Edit
          </Button>
          <Button
            onClick={() => {
              setDeleteId(selectedProject.id);
              setConfirmDeleteOpen(true);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Form Dialog (Add/Edit) */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                error={invalidAccountId}
                helperText={invalidAccountId ? "Invalid Account ID" : ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                error={invalidClientId}
                helperText={invalidClientId ? "Invalid Client ID" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => option.name}
                value={selectedEmployees}
                onChange={(event, newValue) => setSelectedEmployees(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Employees" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expenses"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Completion (%)"
                type="number"
                value={completion}
                onChange={(e) => setCompletion(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {editingProject ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this project?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Update Dialog */}
      <Dialog open={confirmUpdateOpen} onClose={() => setConfirmUpdateOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>Are you sure you want to save this project?</DialogContent>
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

export default ManageProject;
