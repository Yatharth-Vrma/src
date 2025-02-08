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
  Card,
  Typography,
  Box,
  MenuItem,
  Chip,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DataTable from "examples/Tables/DataTable";
import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];
const statuses = ["Active", "On Leave", "Resigned", "Terminated"];

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

// Function to generate a unique employee ID
const generateEmployeeId = (name) => {
  const prefix = name.substring(0, 3).toUpperCase(); // Take the first 3 letters of the name and convert to uppercase
  const randomNumber = Math.floor(Math.random() * 900 + 100); // Random 3-digit number between 100 and 999
  return `${prefix}-${randomNumber}`; // Fixed template literal
};

const ManageEmployee = () => {
  const [open, setOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [roles, setRoles] = useState([]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState("");
  const [roleId, setRoleId] = useState("");

  // Fetch employees and roles when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, "employees"));
      const employeesData = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData);

      // Fetch roles
      const rolesSnapshot = await getDocs(collection(db, "roles"));
      const rolesData = rolesSnapshot.docs.map((doc) => ({
        id: doc.id,
        roleId: doc.data().roleId,
      }));
      setRoles(rolesData);
    };

    fetchData();
  }, []);

  // Employee Component with PropTypes
  const Employee = ({ name, employeeId, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDBox ml={0} lineHeight={1.2}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption" display="block">
          ID: {employeeId}
        </MDTypography>
        <MDTypography variant="caption" display="block">
          Mail: {email}
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  Employee.propTypes = {
    name: PropTypes.string.isRequired,
    employeeId: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  };

  // DesignationDept Component with PropTypes
  const DesignationDept = ({ designation, department }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {designation}
      </MDTypography>
      <MDTypography variant="caption">{department}</MDTypography>
    </MDBox>
  );

  DesignationDept.propTypes = {
    designation: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
  };

  // StatusBadge Component with PropTypes
  const StatusBadge = ({ status }) => {
    const colorMap = {
      Active: "success",
      "On Leave": "warning",
      Resigned: "error",
      Terminated: "dark",
    };
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent={status}
          color={colorMap[status] || "dark"}
          variant="gradient"
          size="sm"
        />
      </MDBox>
    );
  };

  StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setViewDetailsOpen(true);
  };

  const handleEdit = () => {
    const employee = selectedEmployee;
    setEditingEmployee(employee);
    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone);
    setDepartment(employee.department);
    setDesignation(employee.designation);
    setJoiningDate(employee.joiningDate);
    setExitDate(employee.exitDate);
    setSalary(employee.salary);
    setStatus(employee.status);
    setRoleId(employee.roleId);
    setViewDetailsOpen(false);
    setOpen(true);
  };

  const tableData = {
    columns: [
      { Header: "employee", accessor: "employee", width: "30%", align: "left" },
      { Header: "designation & dept", accessor: "designation", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "joined date", accessor: "joined", align: "center" },
      { Header: "actions", accessor: "actions", align: "center" },
    ],
    rows: employees.map((employee) => ({
      employee: (
        <Employee name={employee.name} employeeId={employee.employeeId} email={employee.email} />
      ),
      designation: (
        <DesignationDept designation={employee.designation} department={employee.department} />
      ),
      status: <StatusBadge status={employee.status} />,
      joined: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {employee.joiningDate}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex" justifyContent="center">
          <CustomButton onClick={() => handleViewDetails(employee)}>View Details</CustomButton>
        </MDBox>
      ),
    })),
  };

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    setConfirmUpdateOpen(true);
  };

  const confirmUpdate = async () => {
    const newEmployee = {
      employeeId: editingEmployee ? editingEmployee.employeeId : generateEmployeeId(name),
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      exitDate,
      salary,
      status,
      roleId,
    };

    if (editingEmployee) {
      await updateDoc(doc(db, "employees", editingEmployee.id), newEmployee);
      setEmployees(
        employees.map((emp) => (emp.id === editingEmployee.id ? { ...emp, ...newEmployee } : emp))
      );
    } else {
      const docRef = await addDoc(collection(db, "employees"), newEmployee);
      setEmployees([...employees, { id: docRef.id, ...newEmployee }]);
    }

    setConfirmUpdateOpen(false);
    handleClose();
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setDesignation("");
    setJoiningDate("");
    setExitDate("");
    setSalary("");
    setStatus("");
    setRoleId("");
    setEditingEmployee(null);
  };

  return (
    <Box
      p={3}
      sx={{
        marginLeft: "250px",
        marginTop: "30px",
        width: "calc(100% - 250px)",
      }}
    >
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
          >
            <MDTypography variant="h6" color="white">
              Employee Management
            </MDTypography>
          </MDBox>
          <MDBox pt={3} pb={2} px={2}>
            <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
              Add Employee
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

      {/* Employee Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Employee ID</Typography>
                <Typography>{selectedEmployee.employeeId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography>{selectedEmployee.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography>{selectedEmployee.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography>{selectedEmployee.phone}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Department</Typography>
                <Typography>{selectedEmployee.department}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Designation</Typography>
                <Typography>{selectedEmployee.designation}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Joining Date</Typography>
                <Typography>{selectedEmployee.joiningDate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Exit Date</Typography>
                <Typography>{selectedEmployee.exitDate || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Salary</Typography>
                <Typography>{selectedEmployee.salary}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{selectedEmployee.status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Role ID</Typography>
                <Typography>{selectedEmployee.roleId}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
          <Button onClick={handleEdit} color="primary">
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Form Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            fullWidth
            margin="dense"
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            type="date"
            label="Joining Date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            type="date"
            label="Exit Date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            type="number"
            label="Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            margin="dense"
          >
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Role ID"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            fullWidth
            margin="dense"
            required
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.roleId}>
                {role.roleId}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmUpdateOpen} onClose={() => setConfirmUpdateOpen(false)}>
        <DialogTitle>Confirm Save Changes?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmUpdateOpen(false)}>Cancel</Button>
          <Button onClick={confirmUpdate} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageEmployee;
