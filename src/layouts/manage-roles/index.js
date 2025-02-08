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

const generateRoleId = (roleName) => {
  const prefix = roleName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 3);
  const randomNumber = Math.floor(Math.random() * 900) + 100; // Generates a random 3-digit number
  return `${prefix}-${randomNumber}`;
};

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
    const roleId = editingRole ? editingRole.roleId : generateRoleId(roleName);
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
    <Box display="flex" padding={2}>
      <Box width={250} padding={2} bgcolor="#f5f5f5">
        <Typography variant="h6">Role Management</Typography>
      </Box>
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
          {/* Card Header with Add Role Button */}
          <MDBox
            pt={3}
            px={2}
            display="flex"
            justifyContent="space-between" // Aligns title and button side by side
            alignItems="center" // Vertically centers the content
          >
            <MDTypography variant="h6" fontWeight="medium">
              Role Management
            </MDTypography>
            <MDButton
              variant="contained"
              onClick={handleClickOpen}
              sx={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "10em",
                fontSize: "17px",
                fontWeight: 600,
                padding: "1em 2em",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                border: "1px solid black",
                boxShadow: "0 0 0 0 black",
                "&:hover": {
                  transform: "translateY(-4px) translateX(-2px)",
                  boxShadow: "2px 5px 0 0 black",
                },
                "&:active": {
                  transform: "translateY(2px) translateX(1px)",
                  boxShadow: "0 0 0 0 black",
                },
              }}
            >
              Add Role
            </MDButton>
          </MDBox>

          {/* Grid Container for Role Cards */}
          <Grid container spacing={3} sx={{ padding: "16px" }}>
            {roles.map((role) => (
              <Grid item xs={12} md={12} key={role.id}>
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
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "8px",
                      }}
                    >
                      {role.roleId}
                    </Typography>

                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      <strong>Description:</strong> {role.description}
                    </Typography>

                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Experience Level: {role.experienceLevel}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Salary Range: ${role.salaryRange?.min} - ${role.salaryRange?.max}
                    </Typography>

                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Managerial:{" "}
                      <Chip
                        label={role.isManagerial ? "Yes" : "No"}
                        sx={{
                          backgroundColor: role.isManagerial ? "#4CAF50" : "#F44336",
                          color: "#fff",
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      />
                    </Typography>

                    <Typography sx={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                      Status:{" "}
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
                      onClick={() => handleEdit(role)}
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
                        setDeleteId(role.id);
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

        {/* Role Form Dialog */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              backgroundColor: "#3b4ce2",
              color: "#fff",
              padding: "16px 24px",
              borderRadius: "8px 8px 0 0",
            }}
          >
            {editingRole ? "Edit Role" : "Add Role"}
          </DialogTitle>
          <DialogContent
            sx={{
              py: 2,
              backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              boxSizing: "border-box",
              padding: "30px",
            }}
          >
            <Grid container spacing={2}>
              {/* Role Name */}
              <Grid item xs={12}>
                <TextField
                  label="Role Name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  sx={textFieldStyle}
                />
              </Grid>

              {/* Description */}
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
                  sx={textFieldStyle}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  sx={textFieldStyle}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          borderRadius: "8px",
                          marginTop: "4px",
                          boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.1)",
                          animation: "HideList 0.5s step-start 0.5s forwards",
                          opacity: 0,
                          "&.MuiPopover-paper": {
                            opacity: 1,
                            animation: "none",
                          },
                          "& .MuiMenuItem-root": {
                            fontSize: "18px",
                            fontFamily:
                              '"Open Sans", "Helvetica Neue", "Segoe UI", "Calibri", "Arial", sans-serif',
                            color: "#60666d",
                            padding: "15px",
                            backgroundColor: "#fff",
                            "&:hover": {
                              color: "#546c84",
                              backgroundColor: "#fbfbfb",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Experience Level */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Experience Level"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  sx={textFieldStyle}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          borderRadius: "8px",
                          marginTop: "4px",
                          boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.1)",
                          animation: "HideList 0.5s step-start 0.5s forwards",
                          opacity: 0,
                          "&.MuiPopover-paper": {
                            opacity: 1,
                            animation: "none",
                          },
                          "& .MuiMenuItem-root": {
                            fontSize: "18px",
                            fontFamily:
                              '"Open Sans", "Helvetica Neue", "Segoe UI", "Calibri", "Arial", sans-serif',
                            color: "#60666d",
                            padding: "15px",
                            backgroundColor: "#fff",
                            "&:hover": {
                              color: "#546c84",
                              backgroundColor: "#fbfbfb",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Responsibilities */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Responsibilities"
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  placeholder="Separate with commas"
                  sx={textFieldStyle}
                />
              </Grid>

              {/* Required Skills */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Required Skills"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  placeholder="Separate with commas"
                  sx={textFieldStyle}
                />
              </Grid>

              {/* Salary Range (Min) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label="Salary Range (Min)"
                  value={salaryRange.min}
                  onChange={(e) => setSalaryRange({ ...salaryRange, min: e.target.value })}
                  fullWidth
                  margin="dense"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={textFieldStyle}
                />
              </Grid>

              {/* Salary Range (Max) */}
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
                  sx={textFieldStyle}
                />
              </Grid>

              {/* Managerial Role */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isManagerial}
                      onChange={(e) => setIsManagerial(e.target.checked)}
                      color="primary"
                      sx={{
                        "&.Mui-checked": { color: "#3b4ce2" },
                        padding: "8px",
                        "& .MuiSvgIcon-root": { fontSize: 28 },
                      }}
                    />
                  }
                  label="Managerial Role"
                  sx={{
                    marginLeft: "-4px",
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                      color: "#374151",
                    },
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  sx={textFieldStyle}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          borderRadius: "8px",
                          marginTop: "4px",
                          boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.1)",
                          animation: "HideList 0.5s step-start 0.5s forwards",
                          opacity: 0,
                          "&.MuiPopover-paper": {
                            opacity: 1,
                            animation: "none",
                          },
                          "& .MuiMenuItem-root": {
                            fontSize: "18px",
                            fontFamily:
                              '"Open Sans", "Helvetica Neue", "Segoe UI", "Calibri", "Arial", sans-serif',
                            color: "#60666d",
                            padding: "15px",
                            backgroundColor: "#fff",
                            "&:hover": {
                              color: "#546c84",
                              backgroundColor: "#fbfbfb",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Permissions */}
              <Grid item xs={12}>
                <TextField
                  label="Permissions"
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value)}
                  fullWidth
                  margin="dense"
                  required
                  placeholder="Separate with commas"
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
    </Box>
  );
};

export default ManageRoles;
