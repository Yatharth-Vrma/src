import React from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { ResponsiveContainer } from "recharts";
import { Tree, TreeNode } from "react-organizational-chart";

const CostManagementDashboard = () => {
  // Example data for fixed vs. variable costs (replace with actual data)
  const costData = [
    { team: "Team A", fixed: 1000, variable: 500 },
    { team: "Team B", fixed: 800, variable: 700 },
    { team: "Team C", fixed: 1200, variable: 300 },
  ];

  // Example data for cost categories (replace with actual data)
  const treeData = [
    { name: "Rent", cost: 3000 },
    { name: "Software Licenses", cost: 1500 },
    { name: "Marketing", cost: 2500 },
    { name: "Travel", cost: 800 },
  ];

  return (
    <Box sx={{ padding: "16px" }}>
      <Typography variant="h4" gutterBottom>
        Cost Management Dashboard
      </Typography>

      {/* Grid for Layout */}
      <Grid container spacing={3}>
        {/* Stacked Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Fixed vs. Variable Costs by Team
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fixed" stackId="a" fill="#8884d8" />
                <Bar dataKey="variable" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Tree-map Visualization */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Cost Category Distribution
            </Typography>
            <div style={{ overflow: "auto", height: 300 }}>
              <Tree label={<div style={{ fontWeight: "bold" }}>Cost Categories</div>}>
                {treeData.map((item, index) => (
                  <TreeNode key={index} label={`${item.name}: $${item.cost}`} />
                ))}
              </Tree>
            </div>
          </Card>
        </Grid>

        {/* Metrics Section */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Fixed Costs */}
            <Grid item xs={12} md={6}>
              <Card sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  Fixed Costs per Team
                </Typography>
                <ul style={{ margin: 0, padding: "0 16px" }}>
                  {costData.map((item, index) => (
                    <li key={index}>
                      {item.team}: ${item.fixed}
                    </li>
                  ))}
                </ul>
              </Card>
            </Grid>

            {/* Variable Costs */}
            <Grid item xs={12} md={6}>
              <Card sx={{ padding: "16px" }}>
                <Typography variant="h6" gutterBottom>
                  Variable Costs per Team
                </Typography>
                <ul style={{ margin: 0, padding: "0 16px" }}>
                  {costData.map((item, index) => (
                    <li key={index}>
                      {item.team}: ${item.variable}
                    </li>
                  ))}
                </ul>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CostManagementDashboard;
