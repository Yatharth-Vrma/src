import React from "react";
import { Grid, Card, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ExpenseRevenueLineChart from "../../components/ExpenseRevenueLineChart"; // Adjust the import path
import ExpenseProfitScatterPlot from "../../components/ExpenseProfitScatterPlot"; // Adjust the import path

const RevenueDashboard = () => {
  // Example data for the charts
  const revenueData = [
    { month: "January", expense: 1500, revenue: 2000 },
    { month: "February", expense: 1200, revenue: 2200 },
    { month: "March", expense: 1500, revenue: 2500 },
    { month: "April", expense: 1300, revenue: 2400 },
  ];

  const scatterPlotData = [
    { expense: 1000, profitMargin: 20 },
    { expense: 1200, profitMargin: 25 },
    { expense: 1500, profitMargin: 15 },
    { expense: 1300, profitMargin: 18 },
  ];

  return (
    <MDBox py={3}>
      <Grid container spacing={3}>
        {/* Line chart: Revenue vs Expense over Time */}
        <Grid item xs={12} md={6}>
          <ExpenseRevenueLineChart
            title="Revenue vs Expenses Over Time"
            description="A comparison of team expenses and revenue across time."
            data={revenueData}
            date="Updated Monthly"
          />
        </Grid>

        {/* Scatter plot: Expense vs Profit Margin */}
        <Grid item xs={12} md={6}>
          <ExpenseProfitScatterPlot
            title="Expense vs Profit Margin"
            description="Scatter plot showing the relationship between expenses and profit margin."
            data={scatterPlotData}
            date="Updated Monthly"
          />
        </Grid>

        {/* Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox padding="1rem">
              <MDTypography variant="h6">Expense-to-Revenue Ratio</MDTypography>
              <MDTypography variant="body2" color="textSecondary">
                {/* Expense-to-revenue ratio calculation */}
                {`The expense-to-revenue ratio is calculated as: Total Expenses / Total Revenue`}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <MDBox padding="1rem">
              <MDTypography variant="h6">Contribution to Company-Wide Profit</MDTypography>
              <MDTypography variant="body2" color="textSecondary">
                {/* Contribution to company-wide profit calculation */}
                {`The contribution is calculated as: (Team Revenue - Team Expenses) / Total Company Profit`}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default RevenueDashboard;
