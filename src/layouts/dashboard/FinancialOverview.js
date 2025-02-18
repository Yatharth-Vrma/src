import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
} from "@mui/material";
import * as echarts from "echarts";
import { db } from "../manage-employee/firebase";
import { collection, getDocs } from "firebase/firestore";

const FinancialOverview = () => {
  const [view, setView] = useState("Organization Level");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [organizationExpenses, setOrganizationExpenses] = useState([]);
  const [organizationEarnings, setOrganizationEarnings] = useState([]);
  const [activeTab, setActiveTab] = useState("Expenses"); // Set "Expenses" as default
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch accounts
      const accountsSnapshot = await getDocs(collection(db, "accounts"));
      const accountsData = accountsSnapshot.docs.map((doc) => ({
        id: doc.id, // Firebase document ID
        accountId: doc.data().accountId, // Use the accountId field from Firestore
        ...doc.data(),
      }));
      setAccounts(accountsData);

      // Fetch expenses
      const expensesSnapshot = await getDocs(collection(db, "expenses"));
      const expensesData = expensesSnapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date.toDate(), // Convert Firestore timestamp to JavaScript Date
        amount: doc.data().amount,
        category: doc.data().category,
      }));
      setOrganizationExpenses(expensesData);

      // Fetch earnings
      const earningsSnapshot = await getDocs(collection(db, "earnings"));
      const earningsData = earningsSnapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date.toDate(), // Convert Firestore timestamp to JavaScript Date
        amount: doc.data().amount,
        category: doc.data().category,
      }));
      setOrganizationEarnings(earningsData);
    };

    fetchData();
  }, []);

  const updateChart = (data) => {
    if (!chartRef.current) return;

    // Destroy the existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    // Initialize a new chart instance
    chartInstance.current = echarts.init(chartRef.current);

    if (activeTab === "Profit and Loss") {
      // Bar chart for Profit and Loss
      const option = {
        tooltip: { trigger: "item" },
        legend: { top: "5%", left: "center" },
        xAxis: {
          type: "category",
          data: data.months, // Months for the x-axis
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Expenses",
            type: "bar",
            data: data.expenses, // Expenses data
            itemStyle: { color: "#FF6384" }, // Red color for expenses
          },
          {
            name: "Earnings",
            type: "bar",
            data: data.earnings, // Earnings data
            itemStyle: { color: "#36A2EB" }, // Blue color for earnings
          },
        ],
      };
      chartInstance.current.setOption(option);
    } else {
      // Pie chart for Expenses and Earning
      const option = {
        tooltip: { trigger: "item" },
        legend: { top: "5%", left: "center" },
        series: [
          {
            name: activeTab === "Expenses" ? "Expenses" : "Earnings",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            padAngle: 5,
            itemStyle: { borderRadius: 10 },
            label: { show: false, position: "center" },
            emphasis: {
              label: { show: true, fontSize: 20, fontWeight: "bold" },
            },
            labelLine: { show: false },
            data: data.length ? data : [{ value: 0, name: "No Data" }],
          },
        ],
      };
      chartInstance.current.setOption(option);
    }
  };

  const aggregateDataByMonth = (expenses, earnings) => {
    const monthlyData = {};

    // Helper function to get the month and year from a date
    const getMonthYear = (date) => {
      return `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: "YYYY-MM"
    };

    // Aggregate expenses by month
    expenses.forEach((expense) => {
      const monthYear = getMonthYear(expense.date);
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { expenses: 0, earnings: 0 };
      }
      monthlyData[monthYear].expenses += expense.amount;
    });

    // Aggregate earnings by month
    earnings.forEach((earning) => {
      const monthYear = getMonthYear(earning.date);
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { expenses: 0, earnings: 0 };
      }
      monthlyData[monthYear].earnings += earning.amount;
    });

    // Convert to arrays for the chart
    const months = Object.keys(monthlyData).sort(); // Sort months chronologically
    const expensesData = months.map((month) => monthlyData[month].expenses);
    const earningsData = months.map((month) => monthlyData[month].earnings);

    return { months, expenses: expensesData, earnings: earningsData };
  };

  const transformDataToPieData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const categoryMap = data.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = 0;
      acc[item.category] += item.amount;
      return acc;
    }, {});
    return Object.keys(categoryMap).map((category) => ({
      name: category,
      value: categoryMap[category],
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setView("Organization Level"); // Reset view to "Organization Level" when switching tabs
    if (tab === "Expenses") {
      updateChart(transformDataToPieData(organizationExpenses));
    } else if (tab === "Earning") {
      updateChart(transformDataToPieData(organizationEarnings));
    } else if (tab === "Profit and Loss") {
      const data = aggregateDataByMonth(organizationExpenses, organizationEarnings);
      updateChart(data);
    }
  };

  const handleViewChange = (event) => {
    const newView = event.target.value;
    setView(newView);
    if (activeTab === "Expenses") {
      if (newView === "Organization Level") {
        updateChart(transformDataToPieData(organizationExpenses));
      } else if (newView === "Account Level" && selectedAccount) {
        updateChart(transformDataToPieData(selectedAccount.expenses || []));
      }
    } else if (activeTab === "Earning") {
      if (newView === "Organization Level") {
        updateChart(transformDataToPieData(organizationEarnings));
      } else if (newView === "Account Level" && selectedAccount) {
        updateChart(transformDataToPieData(selectedAccount.earnings || []));
      }
    } else if (activeTab === "Profit and Loss") {
      if (newView === "Organization Level") {
        const data = aggregateDataByMonth(organizationExpenses, organizationEarnings);
        updateChart(data);
      } else if (newView === "Account Level" && selectedAccount) {
        const accountExpenses = selectedAccount.expenses || [];
        const accountEarnings = selectedAccount.earnings || [];
        const data = aggregateDataByMonth(accountExpenses, accountEarnings);
        updateChart(data);
      }
    }
  };

  const handleAccountChange = (event) => {
    const account = event.target.value;
    setSelectedAccount(account);
    if (activeTab === "Expenses") {
      updateChart(transformDataToPieData(account.expenses || []));
    } else if (activeTab === "Earning") {
      updateChart(transformDataToPieData(account.earnings || []));
    } else if (activeTab === "Profit and Loss") {
      const accountExpenses = account.expenses || [];
      const accountEarnings = account.earnings || [];
      const data = aggregateDataByMonth(accountExpenses, accountEarnings);
      updateChart(data);
    }
  };

  return (
    <Box p={3} sx={{ marginLeft: "250px", marginTop: "30px", width: "calc(100% - 250px)" }}>
      <Grid item xs={12}>
        <Card sx={{ marginTop: "20px", borderRadius: "12px", overflow: "visible" }}>
          <Box mx={2} mt={-3} py={3} px={2} bgcolor="info.main" borderRadius="lg">
            <Typography variant="h6" color="white">
              Financial Overview
            </Typography>
          </Box>
          <Box pt={3} pb={2} px={2}>
            <Box display="flex" gap={2} mb={2}>
              {["Expenses", "Earning", "Profit and Loss", "Financial Runway"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "contained" : "outlined"}
                  onClick={() => handleTabChange(tab)} // Use handleTabChange instead of setActiveTab
                  sx={{
                    color: activeTab === tab ? "white" : "primary.main", // Change font color based on active tab
                    backgroundColor: activeTab === tab ? "primary.main" : "transparent",
                    "&:hover": {
                      backgroundColor: activeTab === tab ? "primary.dark" : "primary.light",
                    },
                  }}
                >
                  {tab}
                </Button>
              ))}
            </Box>

            {(activeTab === "Expenses" ||
              activeTab === "Earning" ||
              activeTab === "Profit and Loss") && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>View</InputLabel>
                  <Select value={view} onChange={handleViewChange} label="View">
                    <MenuItem value="Organization Level">Organization Level</MenuItem>
                    <MenuItem value="Account Level">Account Level</MenuItem>
                  </Select>
                </FormControl>

                {view === "Account Level" && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Account</InputLabel>
                    <Select
                      value={selectedAccount}
                      onChange={handleAccountChange} // Use handleAccountChange instead of setSelectedAccount
                      label="Account"
                    >
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={account}>
                          {account.accountId} {/* Display accountId (e.g., "ACC-7028") */}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box>
                  <Typography variant="h6" gutterBottom>
                    {view === "Organization Level"
                      ? `Organization ${
                          activeTab === "Profit and Loss" ? "Profit and Loss" : activeTab
                        } Breakdown`
                      : selectedAccount
                      ? `${selectedAccount.accountId} ${
                          activeTab === "Profit and Loss" ? "Profit and Loss" : activeTab
                        } Breakdown`
                      : "Select an Account"}
                  </Typography>
                  <Box ref={chartRef} sx={{ width: "100%", height: 400 }} />
                </Box>
              </>
            )}

            {activeTab !== "Expenses" &&
              activeTab !== "Earning" &&
              activeTab !== "Profit and Loss" && (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 5 }}>
                  {activeTab} Page (Coming Soon)
                </Typography>
              )}
          </Box>
        </Card>
      </Grid>
    </Box>
  );
};

export default FinancialOverview;
