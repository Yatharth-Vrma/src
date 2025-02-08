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
  Checkbox,
  FormControlLabel,
  Box,
  Chip,
  Autocomplete,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

// Expense categories
const categories = ["Rent", "Software Licenses", "Utilities", "Salaries", "Marketing", "Other"];

const ManageExpenses = () => {
  // Dialog and data states
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [category, setCategory] = useState([]); // Now an array for multiple categories
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

  // Fetch expenses from Firestore on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      setExpenses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchExpenses();
  }, []);

  // Open Add/Edit dialog and reset form
  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  // Close dialog and reset form
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Populate form fields for editing an expense
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setCategory(expense.category || []);
    setAmount(expense.amount);
    setDate(
      expense.date && typeof expense.date.toDate === "function"
        ? expense.date.toDate().toISOString().split("T")[0]
        : expense.date || ""
    );
    setDescription(expense.description);
    setProjectId(expense.projectId || "");
    setAccountId(expense.accountId || "");
    setRecurring(expense.recurring || false);
    setOpen(true);
  };

  // Open confirmation dialog for update/add
  const handleSubmit = async () => {
    setConfirmUpdateOpen(true);
  };

  // Generate a 4-digit random number for Expense ID
  const generateExpenseId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Confirm update or add expense in Firestore
  const confirmUpdate = async () => {
    const newExpense = {
      expenseId: editingExpense ? editingExpense.expenseId : generateExpenseId(), // Auto-generate ID
      category,
      amount: Number(amount),
      date: new Date(date),
      description,
      projectId: projectId || null,
      accountId: accountId || null,
      recurring,
    };

    if (editingExpense) {
      await updateDoc(doc(db, "expenses", editingExpense.id), newExpense);
      setExpenses(
        expenses.map((exp) => (exp.id === editingExpense.id ? { ...exp, ...newExpense } : exp))
      );
    } else {
      const docRef = await addDoc(collection(db, "expenses"), newExpense);
      setExpenses([...expenses, { id: docRef.id, ...newExpense }]);
    }

    setConfirmUpdateOpen(false);
    handleClose();
  };

  // Handle deletion of an expense
  const handleDelete = async () => {
    await deleteDoc(doc(db, "expenses", deleteId));
    setExpenses(expenses.filter((exp) => exp.id !== deleteId));
    setConfirmDeleteOpen(false);
  };

  // Reset all form fields
  const resetForm = () => {
    setCategory([]);
    setAmount("");
    setDate("");
    setDescription("");
    setProjectId("");
    setAccountId("");
    setRecurring(false);
    setEditingExpense(null);
  };

  // Custom textField styling
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
                Expense Management
              </MDTypography>
            </MDBox>
            <MDBox pt={3} pb={2} px={2}>
              <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                Add expenses
              </Button>
            </MDBox>

            {/* Expense Cards Grid */}
            <Grid container spacing={3} sx={{ padding: "16px" }}>
              {expenses.map((expense) => (
                <Grid item xs={12} md={12} key={expense.id}>
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
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        {/* Modify this part to check if category is an array */}
                        {Array.isArray(expense.category) &&
                          expense.category.map((cat, index) => (
                            <Chip key={index} label={cat} color="primary" />
                          ))}
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Expense ID:</strong> {expense.expenseId}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Amount:</strong> ${expense.amount}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Date:</strong> {formatTimestamp(expense.date)}
                          </MDTypography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Description:</strong> {expense.description}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Project ID:</strong> {expense.projectId || "N/A"}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Account ID:</strong> {expense.accountId || "N/A"}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Recurring:</strong>{" "}
                            <Chip label={expense.recurring ? "Yes" : "No"} size="small" />
                          </MDTypography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <MDButton
                        variant="text"
                        onClick={() => handleEdit(expense)}
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
                          setDeleteId(expense.id);
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

      {/* Expense Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={categories}
                value={category}
                onChange={(event, newValue) => setCategory(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    fullWidth
                    margin="dense"
                    required
                    sx={textFieldStyle}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={index} label={option} color="primary" {...getTagProps({ index })} />
                  ))
                }
              />
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
                sx={textFieldStyle}
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
                sx={textFieldStyle}
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
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                fullWidth
                margin="dense"
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                fullWidth
                margin="dense"
                sx={textFieldStyle}
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
                label="Recurring Expense"
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
        <DialogTitle>Want to delete expense data?</DialogTitle>
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

export default ManageExpenses;
