import React, { useState, useEffect } from "react";
import { Button, Grid, Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

const ManageEarningsCopy = () => {
  const [earnings, setEarnings] = useState([]);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const completedEarnings = snapshot.docs
        .filter((doc) => doc.data().status?.toLowerCase() === "completed")
        .map((doc) => {
          const data = doc.data();
          
          // Debugging Firestore Data
          console.log("Firestore Document Data:", data);

          const earning = {
            earningId: `E-${Math.floor(10000 + Math.random() * 90000)}`,
            clientId: data.clientId?.clientId || "N/A", // ✅ Extracting from clientId map
            accountId: data.accountId?.accountId || "N/A", // ✅ Extracting from accountId map
            amount: data.financialMetrics?.revenueGenerated || 0, // ✅ Extracting from financialMetrics
            date:
              data.endDate instanceof Timestamp
                ? data.endDate.toDate().toLocaleDateString()
                : data.endDate
                ? new Date(data.endDate).toLocaleDateString()
                : "N/A",
            projectId: data.projectId || "N/A",
          };

          // Debugging Processed Data
          console.log("Processed Earning:", earning);

          return earning;
        });

      setEarnings(completedEarnings);
    });

    return () => unsubscribe();
  }, []);

  const tableData = {
    columns: [
      { Header: "Earning ID", accessor: "earningId", align: "left" },
      { Header: "Client ID", accessor: "clientId", align: "left" },
      { Header: "Account ID", accessor: "accountId", align: "left" },
      { Header: "Amount", accessor: "amount", align: "left" }, // ✅ FIXED accessor
      { Header: "Date", accessor: "date", align: "left" },
      { Header: "Project ID", accessor: "projectId", align: "left" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows: earnings.map((earning) => ({
      earningId: earning.earningId,
      clientId: earning.clientId,
      accountId: earning.accountId,
      amount: `$${earning.amount.toFixed(2)}`, // ✅ Properly formatted currency
      date: earning.date,
      projectId: earning.projectId,
      action: (
        <MDBox display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              setSelectedEarning(earning);
              setViewDetailsOpen(true);
            }}
          >
            View Details
          </Button>
        </MDBox>
      ),
    })),
  };

  console.log("Table Data:", tableData); // ✅ Debugging Table Data

  return (
    <MDBox p={3} sx={{ marginLeft: "250px", marginTop: "30px", width: "calc(100% - 250px)" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ marginTop: "20px", borderRadius: "12px", overflow: "visible" }}>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
                Earnings
              </MDTypography>
            </MDBox>
            <MDBox pt={3} pb={2} px={2}>
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
      </Grid>
    </MDBox>
  );
};

export default ManageEarningsCopy;
