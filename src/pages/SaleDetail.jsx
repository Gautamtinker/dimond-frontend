import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSaleById } from "../store/slices/saleSlice";
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
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";

const paymentMethods = ["NEFT", "RTGS", "UPI", "Cash", "Angadiya", "Cheque"];

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sale, payments, loading } = useSelector((state) => state.sales);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: paymentMethods[0],
    remarks: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(getSaleById(id));
    }
  }, [dispatch, id]);

  const handleAddPayment = () => {
    toast.success("Payment received successfully!");
    setOpenPaymentDialog(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!sale) {
    return <Typography>Sale not found</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/sales")}
        sx={{ mb: 2 }}
      >
        Back to Sales
      </Button>

      <Typography variant="h4" gutterBottom>
        Sale Details - {sale.buyerName}
      </Typography>

      <Grid container spacing={3}>
        {/* Sale Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sale Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Sale Date
                </Typography>
                <Typography variant="body1">
                  {new Date(sale.saleDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Material Category
                </Typography>
                <Typography variant="body1">{sale.materialCategory}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Caret
                </Typography>
                <Typography variant="body1">
                  {sale.caret?.toFixed(2)} ct
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Rate
                </Typography>
                <Typography variant="body1">
                  ₹{sale.rate?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1">
                  ₹{sale.amount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Receivable
                </Typography>
                <Typography variant="body1" color="error">
                  ₹{sale.outstandingAmount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {new Date(sale.dueDate).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Broker Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Broker Information
            </Typography>
            {sale.brokers && sale.brokers.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Broker</TableCell>
                      <TableCell align="right">Commission %</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sale.brokers.map((broker, index) => (
                      <TableRow key={index}>
                        <TableCell>{broker.name}</TableCell>
                        <TableCell align="right">
                          {broker.percentage}%
                        </TableCell>
                        <TableCell align="right">
                          ₹{broker.commission?.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                No broker information
              </Typography>
            )}
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
                Receive Payment
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
                        No payments received
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

      {/* Receive Payment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Receive Payment</DialogTitle>
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
            Receive Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
