import React from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// Example data
const teamExpenseData = [
  { team: "Team A", expense: 1000, profit: 400 },
  { team: "Team B", expense: 800, profit: 300 },
  { team: "Team C", expense: 1200, profit: 500 },
];

const revenue = 10000; // Example total revenue
const burnRate = 0.35; // Example Burn Rate (as a fraction)

const FinancialDashboard = () => {
  // Calculate total expenses and percentage of company revenue
  const totalExpense = teamExpenseData.reduce((sum, team) => sum + team.expense, 0);
  const expenseToRevenueRatio = ((totalExpense / revenue) * 100).toFixed(2);

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>

      {/* Grid for Layout */}
      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Team Contribution to Overall Expenses
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamExpenseData}
                  dataKey="expense"
                  nameKey="team"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {teamExpenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Team Expense vs. Profitability
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expense" fill="#8884d8" name="Expense" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Metrics Section */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Expense-to-Revenue Ratio */}
            <Grid item xs={12} md={6}>
              <Card sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  Expense-to-Revenue Ratio
                </Typography>
                <Typography variant="body1">Total Expenses: ${totalExpense}</Typography>
                <Typography variant="body1">Total Revenue: ${revenue}</Typography>
                <Typography variant="body1">
                  Expense-to-Revenue Ratio: {expenseToRevenueRatio}%
                </Typography>
              </Card>
            </Grid>

            {/* Burn Rate */}
            <Grid item xs={12} md={6}>
              <Card sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  Burn Rate
                </Typography>
                <Typography variant="body1">Burn Rate: {(burnRate * 100).toFixed(2)}%</Typography>
                <Typography variant="body1">
                  Total Burn: ${(totalExpense * burnRate).toFixed(2)}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialDashboard;
