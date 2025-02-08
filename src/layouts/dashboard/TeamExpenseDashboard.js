import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"; // Import Recharts components
import { Grid, Card, Typography } from "@mui/material";

const TeamExpenseDashboard = () => {
  // Example data for the charts
  const barChartData = [
    { team: "Team A", expense: 3000 },
    { team: "Team B", expense: 4500 },
    { team: "Team C", expense: 3500 },
    { team: "Team D", expense: 5000 },
  ];

  const pieChartData = [
    { name: "Team A", value: 25 },
    { name: "Team B", value: 35 },
    { name: "Team C", value: 20 },
    { name: "Team D", value: 20 },
  ];

  const heatmapData = [
    { month: "Jan", teamA: 5000, teamB: 4500, teamC: 6000, teamD: 7000 },
    { month: "Feb", teamA: 5500, teamB: 4800, teamC: 6200, teamD: 7500 },
    // Add more months or quarters as needed
  ];

  return (
    <Grid container spacing={3}>
      {/* Bar Chart Section */}
      <Grid item xs={12} md={4}>
        <Card>
          <Typography variant="h6" align="center" style={{ padding: "1rem" }}>
            Total Expense Per Team
          </Typography>
          <BarChart width={400} height={300} data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="team" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="expense" fill="#8884d8" />
          </BarChart>
        </Card>
      </Grid>

      {/* Pie Chart Section */}
      <Grid item xs={12} md={4}>
        <Card>
          <Typography variant="h6" align="center" style={{ padding: "1rem" }}>
            Expense Allocation Across Teams
          </Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8884d8" : "#ff8042"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Card>
      </Grid>

      {/* Heatmap Section */}
      <Grid item xs={12} md={4}>
        <Card>
          <Typography variant="h6" align="center" style={{ padding: "1rem" }}>
            Team Profitability by Month
          </Typography>
          {/* Render your heatmap here. For simplicity, we use a table-like grid for this example */}
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Team A</th>
                <th>Team B</th>
                <th>Team C</th>
                <th>Team D</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, index) => (
                <tr key={index}>
                  <td>{row.month}</td>
                  <td>{row.teamA}</td>
                  <td>{row.teamB}</td>
                  <td>{row.teamC}</td>
                  <td>{row.teamD}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Grid>

      {/* Expense Breakdown and Metrics Section */}
      <Grid item xs={12}>
        <Card style={{ padding: "1rem" }}>
          <Typography variant="h6" align="center">
            Team Expense Breakdown & Metrics
          </Typography>
          {/* Example of expense breakdown */}
          <Typography variant="body1">
            <strong>Team A:</strong> Salaries: $2000, Overhead: $500, Training: $500
          </Typography>
          <Typography variant="body1">
            <strong>Team B:</strong> Salaries: $2500, Overhead: $700, Training: $800
          </Typography>
          <Typography variant="body1">
            <strong>Profitability Metrics:</strong> Revenue, Expense, Profit Margin, ROI
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TeamExpenseDashboard;
