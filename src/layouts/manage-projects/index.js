import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
import { styled } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

const statuses = ["Ongoing", "Completed", "On Hold"];

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

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};

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

ProjectInfo.propTypes = {
  name: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
};

const ManageProject = () => {
  const [open, setOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [invalidClientId, setInvalidClientId] = useState(false);
  const [invalidAccountId, setInvalidAccountId] = useState(false);
  const [projectExpenses, setProjectExpenses] = useState(0);
  const [projectRevenue, setProjectRevenue] = useState(0);

  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [budget, setBudget] = useState("");
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

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "employees"));
      setEmployees(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClients(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      setAccounts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchProjects();
    fetchEmployees();
    fetchClients();
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchProjectExpenses = async () => {
      if (selectedProject && (selectedProject.projectId || selectedProject.id)) {
        const pid = selectedProject.projectId || selectedProject.id;
        const q = query(collection(db, "expenses"), where("projectId", "==", pid));
        const querySnapshot = await getDocs(q);
        let total = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          total += Number(data.amount) || 0;
        });
        setProjectExpenses(total);
      } else {
        setProjectExpenses(0);
      }
    };
    fetchProjectExpenses();
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && (selectedProject.projectId || selectedProject.id)) {
      const pid = selectedProject.projectId || selectedProject.id;
      const earningsQuery = query(
        collection(db, "earnings"),
        where("category", "==", "Project Revenue"),
        where("referenceId", "==", pid)
      );
      const unsubscribe = onSnapshot(earningsQuery, (snapshot) => {
        let totalRevenue = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          totalRevenue += Number(data.amount) || 0;
        });
        setProjectRevenue(totalRevenue);
      });
      return () => unsubscribe();
    } else {
      setProjectRevenue(0);
    }
  }, [selectedProject]);

  // Automatically update revenueGenerated and profitMargin when budget or projectExpenses change
  useEffect(() => {
    const budgetValue = parseFloat(budget) || 0;
    const calculatedRevenueGenerated = budgetValue - projectExpenses;
    const calculatedProfitMargin = (calculatedRevenueGenerated / budgetValue) * 100;

    setRevenueGenerated(calculatedRevenueGenerated);
    setProfitMargin(calculatedProfitMargin);
  }, [budget, projectExpenses]);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleViewDetails = async (project) => {
    const projectRef = doc(db, "projects", project.id);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      setSelectedProject({ id: projectSnap.id, ...projectSnap.data() });
    } else {
      setSelectedProject(project);
    }
    setViewDetailsOpen(true);
  };

  const handleEditFromDetails = () => {
    const project = selectedProject;
    setEditingProject(project);
    setName(project.name);
    setTeam(project.team);
    setBudget(project.financialMetrics?.budget || "");
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
    setSelectedClient(project.clientId);
    setSelectedAccount(project.accountId);
    setViewDetailsOpen(false);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const clientId = selectedClient?.clientId;
    const accountId = selectedAccount?.accountId;

    const clientExists = clientId ? await checkIfClientExists(clientId) : false;
    const accountExists = accountId ? await checkIfAccountExists(accountId) : false;

    if (!clientExists || !accountExists) {
      setInvalidClientId(!clientExists);
      setInvalidAccountId(!accountExists);
      return;
    }

    setConfirmUpdateOpen(true);
  };

  const checkIfClientExists = async (clientId) => {
    const querySnapshot = await getDocs(collection(db, "clients"));
    return querySnapshot.docs.some((doc) => doc.data().clientId === clientId);
  };

  const checkIfAccountExists = async (accountId) => {
    const querySnapshot = await getDocs(collection(db, "accounts"));
    return querySnapshot.docs.some((doc) => doc.data().accountId === accountId);
  };

  const confirmUpdate = async () => {
    let projectId;

    if (!editingProject) {
      projectId = generateUniqueProjectId(name);
    } else {
      projectId = editingProject.projectId;
    }

    const newProject = {
      projectId,
      name,
      accountId: selectedAccount,
      clientId: selectedClient,
      team,
      teamMembers: selectedEmployees,
      financialMetrics: {
        budget,
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

  const generateUniqueProjectId = (name) => {
    let projectId;
    let isUnique = false;

    while (!isUnique) {
      const prefix = name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
      const randomNumber = Math.floor(Math.random() * 1000);
      projectId = `${prefix}-${randomNumber}`;

      isUnique = !projects.some((project) => project.projectId === projectId);
    }

    return projectId;
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "projects", deleteId));
    setProjects(projects.filter((proj) => proj.id !== deleteId));
    setConfirmDeleteOpen(false);
    setViewDetailsOpen(false);
  };

  const resetForm = () => {
    setName("");
    setTeam("");
    setBudget("");
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
    setSelectedClient(null);
    setSelectedAccount(null);
    setInvalidClientId(false);
    setInvalidAccountId(false);
  };

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
                <Typography>{selectedProject.projectId || selectedProject.id || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography>{selectedProject.name || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Account ID</Typography>
                <Typography>
                  {selectedProject.accountId?.accountId || selectedProject.accountId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Client ID</Typography>
                <Typography>
                  {selectedProject.clientId?.clientId || selectedProject.clientId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Team</Typography>
                <Typography>
                  {Array.isArray(selectedProject.team)
                    ? selectedProject.team.join(", ")
                    : typeof selectedProject.team === "object"
                    ? JSON.stringify(selectedProject.team)
                    : selectedProject.team || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Budget</Typography>
                <Typography>${selectedProject.financialMetrics?.budget || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Expenses</Typography>
                <Typography>${projectExpenses}</Typography>
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
                <Typography>${selectedProject.financialMetrics?.revenueGenerated}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Expected Revenue</Typography>
                <Typography>{selectedProject.financialMetrics?.expectedRevenue || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Start Date</Typography>
                <Typography>
                  {selectedProject.startDate
                    ? new Date(selectedProject.startDate).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">End Date</Typography>
                <Typography>
                  {selectedProject.endDate
                    ? new Date(selectedProject.endDate).toLocaleDateString()
                    : "Ongoing"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{selectedProject.status || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Completion (%)</Typography>
                <Typography>
                  {selectedProject.completion !== undefined
                    ? `${selectedProject.completion}%`
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography>{selectedProject.description || "No description available"}</Typography>
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
            <Grid item xs={12}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.clientId}
                value={selectedClient}
                onChange={(event, newValue) => setSelectedClient(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Client ID" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={accounts}
                getOptionLabel={(option) => option.accountId}
                value={selectedAccount}
                onChange={(event, newValue) => setSelectedAccount(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Account ID" fullWidth />
                )}
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