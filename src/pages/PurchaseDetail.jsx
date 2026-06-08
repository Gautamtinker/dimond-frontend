import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPurchaseById } from "../store/slices/purchaseSlice";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";

const paymentMethods = ["NEFT", "RTGS", "UPI", "Cash", "Angadiya", "Cheque"];

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { purchase, payments, loading } = useSelector(
    (state) => state.purchases,
  );
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: paymentMethods[0],
    remarks: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(getPurchaseById(id));
    }
  }, [dispatch, id]);

  const handleAddPayment = () => {
    toast.success("Payment added successfully!");
    setOpenPaymentDialog(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!purchase) {
    return <Typography>Purchase not found</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/purchases")}
        sx={{ mb: 2 }}
      >
        Back to Purchases
      </Button>

      <Typography variant="h4" gutterBottom>
        Purchase Details - {purchase.vendorName}
      </Typography>

      <Grid container spacing={3}>
        {/* Purchase Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Purchase Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Purchase Date
                </Typography>
                <Typography variant="body1">
                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Material Category
                </Typography>
                <Typography variant="body1">
                  {purchase.materialCategory}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Caret
                </Typography>
                <Typography variant="body1">
                  {purchase.totalCaret?.toFixed(2)} ct
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1">
                  ₹{purchase.totalAmount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Outstanding
                </Typography>
                <Typography variant="body1" color="error">
                  ₹{purchase.outstandingAmount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {new Date(purchase.dueDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={purchase.status}
                  color={
                    purchase.status === "completed" ? "success" : "warning"
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Vendor Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vendor Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{purchase.vendorName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {purchase.vendorPhone || "-"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Packets */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Packets
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Caret</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.packets?.map((packet, index) => (
                    <TableRow key={index}>
                      <TableCell>{packet.caret?.toFixed(2)} ct</TableCell>
                      <TableCell align="right">
                        ₹{packet.rate?.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ₹{packet.amount?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Payments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Payment History</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenPaymentDialog(true)}
              >
                Add Payment
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No payments recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          ₹{payment.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.remarks || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Payment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Payment Date"
                InputLabelProps={{ shrink: true }}
                value={newPayment.paymentDate}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, paymentDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={newPayment.paymentMethod}
                  label="Payment Method"
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                value={newPayment.remarks}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, remarks: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPayment}>
            Add Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
