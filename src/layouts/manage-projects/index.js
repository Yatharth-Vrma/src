import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";
import DataTable from "examples/Tables/DataTable";
import { db, auth } from "../manage-employee/firebase";
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
import { Timestamp } from "firebase/firestore";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { debounce } from "lodash";

const statuses = ["Ongoing", "Completed", "On Hold"];

const CustomButton = styled("button")(({ theme }) => ({
  padding: "10px 25px",
  border: "unset",
  borderRadius: "15px",
  color: theme.palette.mode === "dark" ? "#e8e8e8" : "#212121",
  zIndex: 1,
  background: theme.palette.mode === "dark" ? "#424242" : "#e8e8e8",
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
    backgroundColor: theme.palette.mode === "dark" ? "#212121" : "#212121",
    zIndex: -1,
    boxShadow: "4px 8px 19px -3px rgba(0,0,0,0.27)",
    transition: "all 250ms",
  },
  "&:hover": {
    color: theme.palette.mode === "dark" ? "#e8e8e8" : "#e8e8e8",
  },
  "&:hover::before": {
    width: "100%",
  },
}));

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
  const [projectExpenses, setProjectExpenses] = useState(0);
  const [projectRevenue, setProjectRevenue] = useState(0);
  const [userRoles, setUserRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    team: [],
    budget: 0,
    roi: 0,
    burnRate: 0,
    profitMargin: 0,
    revenueGenerated: 0,
    expectedRevenue: 0,
    startDate: "",
    endDate: "",
    status: "",
    description: "",
    completion: 0,
    selectedEmployees: [],
    selectedClient: null,
    selectedAccount: null,
  });

  const [formErrors, setFormErrors] = useState({});

  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  useEffect(() => {
    const fetchUserRoles = async () => {
      const user = auth.currentUser;
      if (!user) {
        toast.error("No authenticated user");
        setUserRoles([]);
        setLoadingRoles(false);
        return;
      }

      try {
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserRoles(userDoc.roles || []);
        } else {
          toast.error("User not found in Firestore");
          setUserRoles([]);
        }
      } catch (error) {
        toast.error("Error fetching user roles");
        console.error("Error fetching user roles:", error);
        setUserRoles([]);
      }
      setLoadingRoles(false);
    };
    fetchUserRoles();
  }, []);

  const isReadOnly =
    userRoles.includes("ManageProject:read") && !userRoles.includes("ManageProject:full access");
  const hasAccess =
    userRoles.includes("ManageProject:read") || userRoles.includes("ManageProject:full access");

  // Helper function to normalize date fields
  const normalizeDate = (dateField) => {
    if (!dateField) return "";
    if (dateField instanceof Timestamp) {
      return dateField.toDate().toISOString().split("T")[0];
    }
    if (typeof dateField === "string" && dateField.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateField;
    }
    return "";
  };

  useEffect(() => {
    if (loadingRoles || !hasAccess) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("No authenticated user");
      setLoadingData(false);
      return;
    }

    let projectsQuery = query(collection(db, "projects"));
    if (isReadOnly) {
      projectsQuery = query(projectsQuery, where("createdBy", "==", user.uid));
    }

    const unsubscribeProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            projectId: data.projectId || doc.id,
            name: data.name || "",
            accountId: data.accountId || "",
            clientId: data.clientId || "",
            team: Array.isArray(data.team) ? data.team : [],
            teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
            financialMetrics: {
              budget: Number(data.financialMetrics?.budget) || 0,
              roi: Number(data.financialMetrics?.roi) || 0,
              burnRate: Number(data.financialMetrics?.burnRate) || 0,
              profitMargin: Number(data.financialMetrics?.profitMargin) || 0,
              revenueGenerated: Number(data.financialMetrics?.revenueGenerated) || 0,
              expectedRevenue: Number(data.financialMetrics?.expectedRevenue) || 0,
            },
            startDate: normalizeDate(data.startDate),
            endDate: normalizeDate(data.endDate),
            status: data.status || "",
            description: data.description || "",
            completion: Number(data.completion) || 0,
            createdBy: data.createdBy || "",
          };
        });
        setProjects(projectsData);
        setLoadingData(false);
      },
      (error) => {
        toast.error("Error fetching projects");
        console.error("Error fetching projects:", error);
        setError("Failed to fetch projects");
        setLoadingData(false);
      }
    );

    const unsubscribeEmployees = onSnapshot(
      collection(db, "employees"),
      (snapshot) => {
        setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        toast.error("Error fetching employees");
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employees");
      }
    );

    const unsubscribeClients = onSnapshot(
      collection(db, "clients"),
      (snapshot) => {
        setClients(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        toast.error("Error fetching clients");
        console.error("Error fetching clients:", error);
        setError("Failed to fetch clients");
      }
    );

    const unsubscribeAccounts = onSnapshot(
      collection(db, "accounts"),
      (snapshot) => {
        setAccounts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        toast.error("Error fetching accounts");
        console.error("Error fetching accounts:", error);
        setError("Failed to fetch accounts");
      }
    );

    return () => {
      unsubscribeProjects();
      unsubscribeEmployees();
      unsubscribeClients();
      unsubscribeAccounts();
    };
  }, [loadingRoles, hasAccess, isReadOnly]);

  useEffect(() => {
    if (!selectedProject || !(selectedProject.projectId || selectedProject.id)) {
      setProjectExpenses(0);
      return;
    }

    const pid = selectedProject.projectId || selectedProject.id;
    const q = query(collection(db, "expenses"), where("projectId", "==", pid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          total += Number(doc.data().amount) || 0;
        });
        setProjectExpenses(total);
      },
      (error) => {
        toast.error("Error fetching expenses");
        console.error("Error fetching expenses:", error);
        setError("Failed to fetch expenses");
      }
    );
    return () => unsubscribe();
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject || !(selectedProject.projectId || selectedProject.id)) {
      setProjectRevenue(0);
      return;
    }

    const pid = selectedProject.projectId || selectedProject.id;
    const q = query(
      collection(db, "earnings"),
      where("category", "==", "Project Revenue"),
      where("referenceId", "==", pid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          total += Number(doc.data().amount) || 0;
        });
        setProjectRevenue(total);
      },
      (error) => {
        toast.error("Error fetching revenue");
        console.error("Error fetching revenue:", error);
        setError("Failed to fetch revenue");
      }
    );
    return () => unsubscribe();
  }, [selectedProject]);

  useEffect(() => {
    const budgetValue = Number(form.budget) || 0;
    const revenueGenerated = budgetValue - projectExpenses;
    const profitMargin = budgetValue > 0 ? (revenueGenerated / budgetValue) * 100 : 0;
    setForm((prev) => ({
      ...prev,
      revenueGenerated: revenueGenerated.toFixed(2),
      profitMargin: profitMargin.toFixed(2),
    }));
  }, [form.budget, projectExpenses]);

  const handleSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    const term = searchTerm.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.projectId.toLowerCase().includes(term) ||
        project.status.toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleViewDetails = async (project) => {
    try {
      const projectRef = doc(db, "projects", project.id);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        setSelectedProject({
          id: projectSnap.id,
          projectId: data.projectId || projectSnap.id,
          name: data.name || "",
          accountId: data.accountId || "",
          clientId: data.clientId || "",
          team: Array.isArray(data.team) ? data.team : [],
          teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
          financialMetrics: {
            budget: Number(data.financialMetrics?.budget) || 0,
            roi: Number(data.financialMetrics?.roi) || 0,
            burnRate: Number(data.financialMetrics?.burnRate) || 0,
            profitMargin: Number(data.financialMetrics?.profitMargin) || 0,
            revenueGenerated: Number(data.financialMetrics?.revenueGenerated) || 0,
            expectedRevenue: Number(data.financialMetrics?.expectedRevenue) || 0,
          },
          startDate: normalizeDate(data.startDate),
          endDate: normalizeDate(data.endDate),
          status: data.status || "",
          description: data.description || "",
          completion: Number(data.completion) || 0,
          createdBy: data.createdBy || "",
        });
      } else {
        setSelectedProject(project);
      }
      setViewDetailsOpen(true);
    } catch (error) {
      toast.error("Error fetching project details");
      console.error("Error fetching project details:", error);
      setError("Failed to fetch project details");
    }
  };

  const handleEditFromDetails = () => {
    const project = selectedProject;
    setEditingProject(project);
    setForm({
      name: project.name,
      team: project.team || [],
      budget: project.financialMetrics?.budget || 0,
      roi: project.financialMetrics?.roi || 0,
      burnRate: project.financialMetrics?.burnRate || 0,
      profitMargin: project.financialMetrics?.profitMargin || 0,
      revenueGenerated: project.financialMetrics?.revenueGenerated || 0,
      expectedRevenue: project.financialMetrics?.expectedRevenue || 0,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      status: project.status || "",
      description: project.description || "",
      completion: project.completion || 0,
      selectedEmployees: project.teamMembers || [],
      selectedClient: clients.find((c) => c.clientId === project.clientId) || null,
      selectedAccount: accounts.find((a) => a.accountId === project.accountId) || null,
    });
    setViewDetailsOpen(false);
    setOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name) errors.name = "Project name is required";
    if (!form.selectedClient) errors.selectedClient = "Client is required";
    if (!form.selectedAccount) errors.selectedAccount = "Account is required";
    if (!form.status) errors.status = "Status is required";
    if (!form.startDate) errors.startDate = "Start date is required";
    if (form.budget < 0) errors.budget = "Budget must be non-negative";
    if (form.roi < 0) errors.roi = "ROI must be non-negative";
    if (form.burnRate < 0) errors.burnRate = "Burn rate must be non-negative";
    if (form.completion < 0 || form.completion > 100)
      errors.completion = "Completion must be between 0 and 100";
    if (form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errors.endDate = "End date must be after start date";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }
    setConfirmUpdateOpen(true);
  };

  const checkIfClientExists = async (clientId) => {
    try {
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      return clientDoc.exists();
    } catch (error) {
      console.error("Error checking client:", error);
      return false;
    }
  };

  const checkIfAccountExists = async (accountId) => {
    try {
      const accountDoc = await getDoc(doc(db, "accounts", accountId));
      return accountDoc.exists();
    } catch (error) {
      console.error("Error checking account:", error);
      return false;
    }
  };

  const confirmUpdate = async () => {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) {
      toast.error("No authenticated user");
      setSaving(false);
      setConfirmUpdateOpen(false);
      return;
    }

    const clientId = form.selectedClient?.clientId;
    const accountId = form.selectedAccount?.accountId;

    const clientExists = clientId ? await checkIfClientExists(clientId) : false;
    const accountExists = accountId ? await checkIfAccountExists(accountId) : false;

    if (!clientExists || !accountExists) {
      setFormErrors({
        ...formErrors,
        selectedClient: !clientExists ? "Invalid client ID" : "",
        selectedAccount: !accountExists ? "Invalid account ID" : "",
      });
      toast.error("Invalid client or account ID");
      setSaving(false);
      setConfirmUpdateOpen(false);
      return;
    }

    try {
      const projectData = {
        projectId: editingProject ? editingProject.projectId : doc(collection(db, "projects")).id,
        name: form.name,
        accountId: accountId,
        clientId: clientId,
        team: form.team,
        teamMembers: form.selectedEmployees,
        financialMetrics: {
          budget: Number(form.budget),
          roi: Number(form.roi),
          burnRate: Number(form.burnRate),
          profitMargin: Number(form.profitMargin),
          revenueGenerated: Number(form.revenueGenerated),
          expectedRevenue: Number(form.expectedRevenue),
        },
        startDate: form.startDate ? Timestamp.fromDate(new Date(form.startDate)) : null,
        endDate: form.endDate ? Timestamp.fromDate(new Date(form.endDate)) : null,
        status: form.status,
        description: form.description,
        completion: Number(form.completion),
        createdBy: user.uid,
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
        toast.success("Project updated successfully");
      } else {
        await addDoc(collection(db, "projects"), projectData);
        toast.success("Project added successfully");
      }
      setConfirmUpdateOpen(false);
      handleClose();
    } catch (error) {
      toast.error("Error saving project");
      console.error("Error saving project:", error);
      setError("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "projects", deleteId));
      toast.success("Project deleted successfully");
      setConfirmDeleteOpen(false);
      setViewDetailsOpen(false);
    } catch (error) {
      toast.error("Error deleting project");
      console.error("Error deleting project:", error);
      setError("Failed to delete project");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      team: [],
      budget: 0,
      roi: 0,
      burnRate: 0,
      profitMargin: 0,
      revenueGenerated: 0,
      expectedRevenue: 0,
      startDate: "",
      endDate: "",
      status: "",
      description: "",
      completion: 0,
      selectedEmployees: [],
      selectedClient: null,
      selectedAccount: null,
    });
    setEditingProject(null);
    setFormErrors({});
  };

  const tableData = useMemo(
    () => ({
      columns: [
        { Header: "project", accessor: "project", width: "30%", align: "left" },
        { Header: "budget", accessor: "budget", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        { Header: "completion", accessor: "completion", align: "center" },
        { Header: "action", accessor: "action", align: "center" },
      ],
      rows: filteredProjects.map((project) => ({
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
              color={darkMode ? "dark" : "info"}
              onClick={() => handleViewDetails(project)}
              sx={{ mb: 2 }}
            >
              View Project
            </Button>
          </MDBox>
        ),
      })),
    }),
    [filteredProjects, darkMode]
  );

  if (loadingRoles) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <MDTypography variant="h6" color={darkMode ? "white" : "textPrimary"}>
          Loading...
        </MDTypography>
      </Box>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? "background.default" : "background.paper",
        minHeight: "100vh",
      }}
    >
      <DashboardNavbar
        absolute
        light={!darkMode}
        isMini={false}
        sx={{
          backgroundColor: darkMode ? "rgba(33, 33, 33, 0.9)" : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          zIndex: 1100,
          padding: "0 16px",
          minHeight: "60px",
          top: "8px",
          left: { xs: "0", md: miniSidenav ? "80px" : "260px" },
          width: { xs: "100%", md: miniSidenav ? "calc(100% - 80px)" : "calc(100% - 260px)" },
        }}
      />
      <MDBox
        p={3}
        sx={{
          marginLeft: { xs: "0", md: miniSidenav ? "80px" : "260px" },
          marginTop: { xs: "140px", md: "100px" },
          backgroundColor: darkMode ? "background.default" : "background.paper",
          minHeight: "calc(100vh - 80px)",
          paddingTop: { xs: "32px", md: "24px" },
          zIndex: 1000,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor={darkMode ? "dark" : "info"}
                borderRadius="lg"
                coloredShadow={darkMode ? "dark" : "info"}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color={darkMode ? "white" : "white"}>
                  Projects
                </MDTypography>
                <TextField
                  label="Search by Name, ID, or Status"
                  variant="outlined"
                  size="small"
                  onChange={(e) => handleSearch(e.target.value)}
                  sx={{
                    maxWidth: 300,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: darkMode ? "#424242" : "#fff",
                      color: darkMode ? "white" : "black",
                    },
                    "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" },
                  }}
                />
              </MDBox>
              <MDBox pt={3} pb={2} px={2}>
                {error && (
                  <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {!isReadOnly && (
                  <Button
                    variant="gradient"
                    color={darkMode ? "dark" : "info"}
                    onClick={handleClickOpen}
                    sx={{ mb: 2 }}
                  >
                    Add Project
                  </Button>
                )}
                {loadingData ? (
                  <Typography>Loading projects...</Typography>
                ) : filteredProjects.length === 0 ? (
                  <Typography>No projects available</Typography>
                ) : (
                  <DataTable
                    table={tableData}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Box
        sx={{
          marginLeft: { xs: "0", md: miniSidenav ? "80px" : "260px" },
          backgroundColor: darkMode ? "background.default" : "background.paper",
          zIndex: 1100,
        }}
      >
        <Footer />
      </Box>

      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: darkMode ? "background.default" : "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Project ID
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.projectId || selectedProject.id || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Name
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Account ID
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.accountId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Client ID
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.clientId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Team
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.team.join(", ") || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Team Members
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.teamMembers.map((m) => m.name).join(", ") || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Budget
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  ${selectedProject.financialMetrics?.budget || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Expenses
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  ${projectExpenses}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  ROI (%)
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.financialMetrics?.roi || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Burn Rate
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.financialMetrics?.burnRate || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Profit Margin (%)
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.financialMetrics?.profitMargin || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Revenue Generated
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  ${projectRevenue}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Expected Revenue
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  ${selectedProject.financialMetrics?.expectedRevenue || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Start Date
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.startDate
                    ? new Date(selectedProject.startDate).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  End Date
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.endDate
                    ? new Date(selectedProject.endDate).toLocaleDateString()
                    : "Ongoing"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Status
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.status || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Completion (%)
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.completion || 0}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>
                  Description
                </Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.description || "No description available"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          {!isReadOnly && (
            <>
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
            </>
          )}
        </DialogActions>
      </Dialog>

      {!isReadOnly && (
        <>
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiDialog-paper": {
                backgroundColor: darkMode ? "background.default" : "background.paper",
              },
            }}
          >
            <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>
              {editingProject ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={clients}
                    getOptionLabel={(option) => option.clientId}
                    value={form.selectedClient}
                    onChange={(event, newValue) => setForm({ ...form, selectedClient: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Client ID"
                        fullWidth
                        sx={{
                          input: { color: darkMode ? "white" : "black" },
                          "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" },
                        }}
                        error={!!formErrors.selectedClient}
                        helperText={formErrors.selectedClient}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={accounts}
                    getOptionLabel={(option) => option.accountId}
                    value={form.selectedAccount}
                    onChange={(event, newValue) => setForm({ ...form, selectedAccount: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Account ID"
                        fullWidth
                        sx={{
                          input: { color: darkMode ? "white" : "black" },
                          "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" },
                        }}
                        error={!!formErrors.selectedAccount}
                        helperText={formErrors.selectedAccount}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={employees}
                    getOptionLabel={(option) => option.name}
                    value={form.selectedEmployees}
                    onChange={(event, newValue) =>
                      setForm({ ...form, selectedEmployees: newValue })
                    }
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Employees"
                        fullWidth
                        sx={{
                          input: { color: darkMode ? "white" : "black" },
                          "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Budget"
                    type="number"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        budget: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.budget}
                    helperText={formErrors.budget}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ROI (%)"
                    type="number"
                    value={form.roi}
                    onChange={(e) =>
                      setForm({ ...form, roi: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.roi}
                    helperText={formErrors.roi}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Burn Rate"
                    type="number"
                    value={form.burnRate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        burnRate: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.burnRate}
                    helperText={formErrors.burnRate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.startDate}
                    helperText={formErrors.startDate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.endDate}
                    helperText={formErrors.endDate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.status}
                    helperText={formErrors.status}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Completion (%)"
                    type="number"
                    value={form.completion}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        completion: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                    error={!!formErrors.completion}
                    helperText={formErrors.completion}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    sx={{ input: { color: darkMode ? "white" : "black" } }}
                    InputLabelProps={{ style: { color: darkMode ? "white" : "black" } }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} color="primary" disabled={saving}>
                {editingProject ? "Update" : "Add"}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmDeleteOpen}
            onClose={() => setConfirmDeleteOpen(false)}
            sx={{
              "& .MuiDialog-paper": {
                backgroundColor: darkMode ? "background.default" : "background.paper",
              },
            }}
          >
            <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>Confirm Deletion</DialogTitle>
            <DialogContent sx={{ color: darkMode ? "white" : "black" }}>
              Are you sure you want to delete this project?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmUpdateOpen}
            onClose={() => setConfirmUpdateOpen(false)}
            sx={{
              "& .MuiDialog-paper": {
                backgroundColor: darkMode ? "background.default" : "background.paper",
              },
            }}
          >
            <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>
              Confirm Submission
            </DialogTitle>
            <DialogContent sx={{ color: darkMode ? "white" : "black" }}>
              Are you sure you want to save this project?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmUpdateOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={confirmUpdate} color="primary" disabled={saving}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

ManageProject.propTypes = {};

export default ManageProject;
