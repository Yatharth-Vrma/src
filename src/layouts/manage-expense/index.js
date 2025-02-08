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

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

// Expense categories
const categories = ["Rent", "Software Licenses", "Utilities", "Salaries", "Marketing", "Other"];

const ManageExpenses = () => {
  // Dialog and data states
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [dateFilterType, setDateFilterType] = useState("all");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [category, setCategory] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [recurring, setRecurring] = useState(false);

  // Helper function to format Firestore Timestamps
  const formatTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
    return timestamp;
  };

  // Fetch expenses from Firestore
  useEffect(() => {
    const fetchExpenses = async () => {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      const expensesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure category is an array
        const category = Array.isArray(data.category)
          ? data.category
          : [data.category].filter((c) => c);
        return { id: doc.id, ...data, category };
      });
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
    };
    fetchExpenses();
  }, []);

  // Add this useEffect for date filtering
  useEffect(() => {
    const filterByDate = (expenseDate) => {
      const expenseDateObj = expenseDate?.toDate ? expenseDate.toDate() : new Date(expenseDate);
      const now = new Date();

      switch (dateFilterType) {
        case "today":
          return expenseDateObj.toDateString() === now.toDateString();
        case "week":
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          return expenseDateObj >= startOfWeek;
        case "month":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return expenseDateObj >= startOfMonth;
        case "3months":
          const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
          return expenseDateObj >= threeMonthsAgo;
        case "year":
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return expenseDateObj >= startOfYear;
        case "custom":
          if (!customStartDate || !customEndDate) return true;
          return expenseDateObj >= customStartDate && expenseDateObj <= customEndDate;
        default:
          return true;
      }
    };

    const filtered = expenses.filter(
      (expense) =>
        filterByDate(expense.date) &&
        (searchTerm === "" ||
          expense.category.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    setFilteredExpenses(filtered);
  }, [dateFilterType, customStartDate, customEndDate, searchTerm, expenses]);

  // Handle search by category
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredExpenses(expenses); // Show all expenses if search term is empty
    } else {
      const filtered = expenses.filter((expense) =>
        expense.category.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredExpenses(filtered);
    }
  }, [searchTerm, expenses]);

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
    // Convert to array if necessary
    const categoryArray = Array.isArray(expense.category)
      ? expense.category
      : [expense.category].filter((c) => c);
    setCategory(categoryArray);
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
      expenseId: editingExpense ? editingExpense.expenseId : generateExpenseId(),
      category: Array.isArray(category) ? category : [category], // Ensure array
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
            <MDBox
              pt={3}
              pb={2}
              px={2}
              display="flex"
              alignItems="center"
              gap={2}
              justifyContent="space-between"
            >
              <Box display="flex" gap={2}>
                <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                  Add expenses
                </Button>
                <TextField
                  label="Search by Category"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    maxWidth: 300,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </Box>

              {/* New Date Filter Section */}
              <Box display="flex" gap={2} alignItems="center">
                <FormControl
                  variant="outlined"
                  size={"small"} // "small" or "medium"
                  sx={{
                    // Use the width prop here
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1rem",
                      padding: "12px 35px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.9rem",
                    },
                  }}
                >
                  <InputLabel>Date Filter</InputLabel>
                  <Select
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                    label="Date Filter"
                  >
                    <MenuItem value="all">All Dates</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="3months">Last 3 Months</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>

                {dateFilterType === "custom" && (
                  <Button
                    variant="outlined"
                    onClick={() => setDatePickerOpen(true)}
                    sx={{ height: 40 }}
                  >
                    Choose Dates
                  </Button>
                )}
              </Box>
            </MDBox>

            <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
              <DialogTitle>Select Date Range</DialogTitle>
              <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={customStartDate}
                  onChange={(newValue) => setCustomStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={customEndDate}
                  onChange={(newValue) => setCustomEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
                <Button onClick={() => setDatePickerOpen(false)}>Apply</Button>
              </DialogActions>
            </Dialog>

            {/* Expense Cards Grid */}
            <Grid container spacing={3} sx={{ padding: "16px" }}>
              {filteredExpenses.map((expense) => (
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
                            <strong>Date:</strong>{" "}
                            {expense.date?.toDate
                              ? expense.date.toDate().toLocaleDateString()
                              : new Date(expense.date).toLocaleDateString()}
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
                renderInput={(params) => <TextField {...params} label="Category" />}
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
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
