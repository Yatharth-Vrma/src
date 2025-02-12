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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import MDBox from "components/MDBox";
import InputAdornment from "@mui/material/InputAdornment";
import MDTypography from "components/MDTypography";
import { ArrowDropDown } from "@mui/icons-material";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

const statuses = ["Active", "Archived"];
const experienceLevels = ["Entry-level", "Mid-level", "Senior-level"];
const departments = ["Development", "HR", "Marketing", "Finance", "Operations"];

const generateRoleId = () => {
  const randomNumber = Math.floor(Math.random() * 900) + 100; // Generates a random 3-digit number
  return `Role-${randomNumber}`; // Use backticks for template literals
};

console.log(generateRoleId()); // Example output: Role-345

const ManageRoles = () => {
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [isManagerial, setIsManagerial] = useState(false);
  const [status, setStatus] = useState("");
  const [permissions, setPermissions] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      const querySnapshot = await getDocs(collection(db, "roles"));
      setRoles(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRoles();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setRoleName(role.roleName);
    setDescription(role.description);
    setDepartment(role.department);
    setResponsibilities(role.responsibilities?.join(", ") || "");
    setRequiredSkills(role.requiredSkills?.join(", ") || "");
    setExperienceLevel(role.experienceLevel);
    setSalaryRange(role.salaryRange || { min: "", max: "" });
    setIsManagerial(role.isManagerial || false);
    setStatus(role.status);
    setPermissions(role.permissions?.join(", ") || "");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setConfirmUpdateOpen(true); // Opens the confirmation dialog
  };

  const confirmUpdate = async () => {
    const roleId = editingRole ? editingRole.roleId : generateRoleId(); // Generate role ID
    const newRole = {
      roleId,
      roleName,
      description,
      department,
      responsibilities: responsibilities.split(",").map((s) => s.trim()),
      requiredSkills: requiredSkills.split(",").map((s) => s.trim()),
      experienceLevel,
      salaryRange: {
        min: Number(salaryRange.min),
        max: Number(salaryRange.max),
      },
      isManagerial,
      status,
      permissions: permissions.split(",").map((s) => s.trim()),
      createdAt: editingRole ? editingRole.createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (editingRole) {
      // Update existing role
      await updateDoc(doc(db, "roles", editingRole.id), newRole);
      setRoles(roles.map((role) => (role.id === editingRole.id ? { ...role, ...newRole } : role)));
    } else {
      // Add new role
      const docRef = await addDoc(collection(db, "roles"), newRole);
      setRoles([...roles, { id: docRef.id, ...newRole }]);
    }

    setConfirmUpdateOpen(false); // Close confirmation dialog
    handleClose(); // Close the form dialog
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "roles", deleteId));
    setRoles(roles.filter((role) => role.id !== deleteId));
    setConfirmDeleteOpen(false);
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
      "&.Mui-focused": { color: "#3b4ce2" },
    },
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
      padding: "12px 14px",
      color: "#1f2937",
    },
  };

  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setDepartment("");
    setResponsibilities("");
    setRequiredSkills("");
    setExperienceLevel("");
    setSalaryRange({ min: "", max: "" });
    setIsManagerial(false);
    setStatus("");
    setPermissions("");
    setEditingRole(null);
  };

  return (
    <Box p={3} sx={{ marginLeft: "250px", marginTop: "30px", width: "calc(100% - 250px)" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ marginTop: "20px", borderRadius: "12px", overflow: "visible" }}>
            {/* Header */}
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
                Role Management
              </MDTypography>
            </MDBox>
            {/* Content */}
            <MDBox pt={3} pb={2} px={2}>
              <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                Add Role
              </Button>
              <Grid container spacing={3} sx={{ padding: "16px" }}>
                {roles.map((role) => (
                  <Grid item xs={12} key={role.id}>
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
                          {role.roleId}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Role Name:</strong> {role.roleName}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Description:</strong> {role.description}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Department:</strong> {role.department}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Experience Level:</strong> {role.experienceLevel}
                            </MDTypography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Salary Range:</strong> ${role.salaryRange?.max}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Managerial:</strong> {role.isManagerial ? "Yes" : "No"}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Status:</strong>{" "}
                              <Chip
                                label={role.status}
                                sx={{
                                  backgroundColor: role.status === "Active" ? "#2196F3" : "#9E9E9E",
                                  color: "#fff",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                }}
                              />
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Permissions:</strong> {role.permissions}
                            </MDTypography>
                          </Grid>
                        </Grid>
                      </CardContent>

                      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <MDButton
                          variant="text"
                          onClick={() => handleEdit(role)}
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
                            setDeleteId(role.id);
                            setConfirmDeleteOpen(true);
                          }}
                          sx={{ ml: 1, padding: "12px 24px" }}
                        >
                          <Icon>delete</Icon>&nbsp;Delete
                        </MDButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Role Form Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                fullWidth
                margin="dense"
                required
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
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                fullWidth
                margin="dense"
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Experience Level"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                fullWidth
                margin="dense"
                required
              >
                {experienceLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Responsibilities"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                fullWidth
                margin="dense"
                required
                placeholder="Separate with commas"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Required Skills"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                fullWidth
                margin="dense"
                required
                placeholder="Separate with commas"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Salary Range (Max)"
                value={salaryRange.max}
                onChange={(e) => setSalaryRange({ ...salaryRange, max: e.target.value })}
                fullWidth
                margin="dense"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isManagerial}
                    onChange={(e) => setIsManagerial(e.target.checked)}
                    color="primary"
                  />
                }
                label="Managerial Role"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
                margin="dense"
                required
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
                label="Permissions"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                fullWidth
                margin="dense"
                required
                placeholder="Separate with commas"
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
        <DialogTitle>Want to delete role data?</DialogTitle>
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageRoles;
