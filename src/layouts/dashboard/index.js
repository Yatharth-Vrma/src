import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import { styled } from "@mui/material/styles";
import TeamExpenseDashboard from "./TeamExpenseDashboard"; // Import the TeamExpenseDashboard component
import RevenueDashboard from "./RevenueDashboard"; // Import the new dashboard component
import CostManagementDashboard from "./CostManagementDashboard"; // Import the new dashboard
import FinancialDashboard from "./FinancialDashboard"; // Import the new dashboard
import KPIDashboard from "./KPIDashboard"; // Import the new dashboard

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Styled Button with hover and click effects
const StyledButton = styled(Button)(({ theme, isClicked }) => ({
  transition: "all 0.3s ease",
  backgroundColor: isClicked ? theme.palette.grey[300] : "",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[4],
  },
  "&:active": {
    transform: "scale(0.95)",
    boxShadow: theme.shadows[2],
  },
}));

function FinancialOverview() {
  const [clickedButton, setClickedButton] = useState(null);

  const handleClick = (buttonId) => {
    setClickedButton(buttonId); // Update the clicked button ID
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3} direction="row" justifyContent="center">
          <Grid item>
            <MDBox mb={1.5} display="flex" justifyContent="center">
              <StyledButton
                variant="contained"
                color="success"
                startIcon={<Icon>account_balance_wallet</Icon>}
                onClick={() => handleClick("teamExpense")}
                isClicked={clickedButton === "teamExpense"}
              >
                Team Expense
              </StyledButton>
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox mb={1.5} display="flex" justifyContent="center">
              <StyledButton
                variant="contained"
                color="success"
                startIcon={<Icon>attach_money</Icon>}
                onClick={() => handleClick("revenue")}
                isClicked={clickedButton === "revenue"}
              >
                Revenue
              </StyledButton>
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox mb={1.5} display="flex" justifyContent="center">
              <StyledButton
                variant="contained"
                color="warning"
                startIcon={<Icon>trending_down</Icon>}
                onClick={() => handleClick("costManagement")}
                isClicked={clickedButton === "costManagement"}
              >
                Cost Management
              </StyledButton>
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox mb={1.5} display="flex" justifyContent="center">
              <StyledButton
                variant="contained"
                color="info"
                startIcon={<Icon>health_and_safety</Icon>}
                onClick={() => handleClick("financialHealth")}
                isClicked={clickedButton === "financialHealth"}
              >
                Financial Health
              </StyledButton>
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox mb={1.5} display="flex" justifyContent="center">
              <StyledButton
                variant="contained"
                color="dark"
                startIcon={<Icon>group</Icon>}
                onClick={() => handleClick("teamPerformance")}
                isClicked={clickedButton === "teamPerformance"}
              >
                Team Performance
              </StyledButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      {/* Conditionally render TeamExpenseDashboard when the button is clicked */}
      {clickedButton === "teamExpense" && <TeamExpenseDashboard />}
      {clickedButton === "revenue" && <RevenueDashboard />}
      {clickedButton === "costManagement" && <CostManagementDashboard />}
      {clickedButton === "financialHealth" && <FinancialDashboard />}
      {clickedButton === "teamPerformance" && <KPIDashboard />}
      <Footer />
    </DashboardLayout>
  );
}

export default FinancialOverview;
