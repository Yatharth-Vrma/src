import React from "react";
import { Grid, Card, Typography } from "@mui/material";

// Example data for teams
const teamData = [
  { team: "Team A", expense: 1000, revenue: 5000, profit: 4000, employees: 10 },
  { team: "Team B", expense: 1500, revenue: 6000, profit: 4500, employees: 12 },
  { team: "Team C", expense: 2000, revenue: 7000, profit: 5000, employees: 15 },
];

const KPIDashboard = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        KPI Dashboard
      </Typography>
      <Grid container spacing={3}>
        {teamData.map((team) => {
          const revenuePerEmployee = (team.revenue / team.employees).toFixed(2);
          const profitPerEmployee = (team.profit / team.employees).toFixed(2);

          return (
            <Grid item xs={12} sm={6} md={4} key={team.team}>
              <Card
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography variant="h6">{team.team}</Typography>
                <Typography variant="body1">Expense: ${team.expense}</Typography>
                <Typography variant="body1">Revenue: ${team.revenue}</Typography>
                <Typography variant="body1">Profit: ${team.profit}</Typography>
                <Typography variant="body1">Revenue/Employee: ${revenuePerEmployee}</Typography>
                <Typography variant="body1">Profit/Employee: ${profitPerEmployee}</Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default KPIDashboard;
