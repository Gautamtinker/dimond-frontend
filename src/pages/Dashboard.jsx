import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  getDashboardNotifications,
  getUpcomingDues,
  getUpcomingSaleDues,
} from "../store/slices/dashboardSlice";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Diamond, Warning, AttachMoney } from "@mui/icons-material";

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(value);
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    stats,
    notifications,
    upcomingDues,
    upcomingSaleDues,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getDashboardNotifications(20));
    dispatch(getUpcomingDues());
    dispatch(getUpcomingSaleDues());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return <Alert severity="info">No data available</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Total Stock in Caret */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "primary.light", height: "100%" }}>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Stock
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {formatNumber(stats.totalStock || 0)} ct
                  </Typography>
                </Box>
                <Diamond sx={{ fontSize: 64, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock by Category */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Stock by Category
              </Typography>
              <Grid container spacing={2}>
                {stats.categories &&
                  Object.entries(stats.categories).map(([category, data]) => (
                    <Grid item xs={12} sm={4} key={category}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total:{" "}
                          <strong>{formatNumber(data.totalCaret)} ct</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Filing: {formatNumber(data.filingCaret)} ct
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Non-Filing: {formatNumber(data.nonFilingCaret)} ct
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Purchase Due Notifications (Due Today or Overdue) */}
      <Typography variant="h6" gutterBottom>
        Purchase Payments Due (Today & Overdue)
      </Typography>
      <Card>
        <CardContent>
          {upcomingDues.length === 0 ? (
            <Typography color="text.secondary" align="center" py={3}>
              No upcoming purchase payments due
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Vendor</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Category</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Caret</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Rate</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Amount</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Outstanding</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Due Date</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Days Left</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingDues.map((notification) => (
                    <TableRow
                      key={notification._id}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                        cursor: "pointer",
                        bgcolor:
                          notification.metadata.daysUntilDue === 0
                            ? "error.light"
                            : notification.metadata.daysUntilDue < 0
                              ? "error.light"
                              : "inherit",
                      }}
                      onClick={() =>
                        navigate(
                          notification.actionUrl ||
                            `/purchases/${notification.relatedEntity.entityId}`,
                        )
                      }
                    >
                      <TableCell>
                        {new Date(
                          notification.metadata.purchaseDate,
                        ).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {notification.metadata.vendorName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.metadata.materialCategory}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(notification.metadata.totalCaret || 0)} ct
                      </TableCell>
                      <TableCell align="right">
                        ₹{formatNumber(notification.metadata.rate || 0)}
                      </TableCell>
                      <TableCell align="right">
                        ₹{formatNumber(notification.metadata.totalAmount || 0)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="error"
                        >
                          ₹
                          {formatNumber(
                            notification.metadata.outstandingAmount || 0,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(
                            notification.metadata.dueDate,
                          ).toLocaleDateString("en-IN")}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            notification.metadata.daysUntilDue === 0
                              ? "TODAY"
                              : notification.metadata.daysUntilDue < 0
                                ? `${Math.abs(notification.metadata.daysUntilDue)} day(s) overdue`
                                : `${notification.metadata.daysUntilDue} day(s)`
                          }
                          size="small"
                          color={
                            notification.metadata.daysUntilDue === 0
                              ? "error"
                              : notification.metadata.daysUntilDue < 0
                                ? "error"
                                : "warning"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Sale Due Notifications (Due Today or Overdue) */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Sale Payments Due (Today & Overdue)
      </Typography>
      <Card>
        <CardContent>
          {upcomingSaleDues.length === 0 ? (
            <Typography color="text.secondary" align="center" py={3}>
              No upcoming sale payments due
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Buyer</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Category</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Caret</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Amount</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Received</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Outstanding</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Due Date</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Days Left</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingSaleDues.map((notification) => (
                    <TableRow
                      key={notification._id}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                        cursor: "pointer",
                        bgcolor:
                          notification.metadata.daysUntilDue === 0
                            ? "error.light"
                            : notification.metadata.daysUntilDue < 0
                              ? "error.light"
                              : "inherit",
                      }}
                      onClick={() =>
                        navigate(
                          notification.actionUrl ||
                            `/sales/${notification.relatedEntity.entityId}`,
                        )
                      }
                    >
                      <TableCell>
                        {new Date(
                          notification.metadata.saleDate,
                        ).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {notification.metadata.buyerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.metadata.materialCategory}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(notification.metadata.totalCaret || 0)} ct
                      </TableCell>
                      <TableCell align="right">
                        ₹{formatNumber(notification.metadata.totalAmount || 0)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          ₹
                          {formatNumber(
                            notification.metadata.receivedAmount || 0,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="error"
                        >
                          ₹
                          {formatNumber(
                            notification.metadata.outstandingAmount || 0,
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(
                            notification.metadata.dueDate,
                          ).toLocaleDateString("en-IN")}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            notification.metadata.daysUntilDue === 0
                              ? "TODAY"
                              : notification.metadata.daysUntilDue < 0
                                ? `${Math.abs(notification.metadata.daysUntilDue)} day(s) overdue`
                                : `${notification.metadata.daysUntilDue} day(s)`
                          }
                          size="small"
                          color={
                            notification.metadata.daysUntilDue === 0
                              ? "error"
                              : notification.metadata.daysUntilDue < 0
                                ? "error"
                                : "warning"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
