import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  createPurchasePayment,
} from "../store/slices/purchaseSlice";
import { getDashboardStats } from "../store/slices/dashboardSlice";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentIcon from "@mui/icons-material/Payment";
import toast from "react-hot-toast";

const materialCategories = [
  "TLB Filing",
  "TLB Non Filing",
  "Zimbabwe Filing",
  "Zimbabwe Non Filing",
  "Kilwas Filing",
  "Kilwas Non Filing",
];

const paymentModes = [
  "NEFT",
  "RTGS",
  "UPI",
  "Cash",
  "Cheque",
  "Angadiya",
  "Other",
];

export default function Purchases() {
  const dispatch = useDispatch();
  const { purchases, loading, pagination } = useSelector(
    (state) => state.purchases,
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [newPurchase, setNewPurchase] = useState({
    vendorName: "",
    materialCategory: materialCategories[0],
    purchaseDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    packets: [{ range: "", caret: "", rate: "", amount: 0 }],
  });
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: paymentModes[0],
    note: "",
  });
  const [initialAmount, setInitialAmount] = useState(0); // Start with 0 for actual use

  useEffect(() => {
    dispatch(getPurchases({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddPacket = () => {
    setNewPurchase({
      ...newPurchase,
      packets: [
        ...newPurchase.packets,
        { range: "", caret: "", rate: "", amount: 0 },
      ],
    });
  };

  const handlePacketChange = (index, field, value) => {
    const updatedPackets = [...newPurchase.packets];
    updatedPackets[index][field] = value;
    if (field === "caret" || field === "rate") {
      updatedPackets[index].amount =
        (parseFloat(updatedPackets[index].caret) || 0) *
        (parseFloat(updatedPackets[index].rate) || 0);
    }
    setNewPurchase({ ...newPurchase, packets: updatedPackets });
  };

  const handleEditPacketChange = (index, field, value) => {
    const updatedPackets = [...editingPurchase.packets];
    updatedPackets[index][field] = value;
    if (field === "caret" || field === "rate") {
      updatedPackets[index].amount =
        (parseFloat(updatedPackets[index].caret) || 0) *
        (parseFloat(updatedPackets[index].rate) || 0);
    }
    setEditingPurchase({ ...editingPurchase, packets: updatedPackets });
  };

  const getEditTotalAmount = () => {
    return (
      editingPurchase?.packets?.reduce((sum, p) => sum + (p.amount || 0), 0) ||
      0
    );
  };

  const getEditTotalCaret = () => {
    return (
      editingPurchase?.packets?.reduce(
        (sum, p) => sum + (parseFloat(p.caret) || 0),
        0,
      ) || 0
    );
  };

  const getTotalAmount = () => {
    return newPurchase.packets.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getTotalCaret = () => {
    return newPurchase.packets.reduce(
      (sum, p) => sum + (parseFloat(p.caret) || 0),
      0,
    );
  };

  const resetPurchaseForm = () => {
    setNewPurchase({
      vendorName: "",
      materialCategory: materialCategories[0],
      purchaseDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
      packets: [{ range: "", caret: "", rate: "", amount: 0 }],
    });
  };

  const handleSubmit = async () => {
    const validPackets = newPurchase.packets.filter(
      (p) => p.caret && parseFloat(p.caret) > 0,
    );
    if (!newPurchase.vendorName.trim()) {
      toast.error("Vendor name is required");
      return;
    }
    if (validPackets.length === 0) {
      toast.error("At least one packet with valid caret is required");
      return;
    }

    try {
      const purchaseData = {
        vendorName: newPurchase.vendorName,
        materialCategory: newPurchase.materialCategory,
        purchaseDate: newPurchase.purchaseDate || new Date().toISOString(),
        dueDate: newPurchase.dueDate || newPurchase.purchaseDate,
        notes: newPurchase.notes,
        packets: validPackets.map((p) => ({
          range: p.range,
          caret: parseFloat(p.caret),
          rate: parseFloat(p.rate) || 0,
          amount: parseFloat(p.amount) || 0,
        })),
      };

      await dispatch(createPurchase(purchaseData)).unwrap();
      toast.success("Purchase created successfully!");
      // Refresh dashboard stats
      dispatch(getDashboardStats());
      setOpenDialog(false);
      resetPurchaseForm();
    } catch (error) {
      toast.error(error || "Failed to create purchase");
    }
  };

  const handleEditClick = (purchase) => {
    // Prepare the purchase data with properly formatted dates and packets
    const editData = {
      ...purchase,
      purchaseDate: purchase.purchaseDate
        ? new Date(purchase.purchaseDate).toISOString().split("T")[0]
        : "",
      dueDate: purchase.dueDate
        ? new Date(purchase.dueDate).toISOString().split("T")[0]
        : "",
      // Ensure packets array exists and has the right format
      packets:
        purchase.packets?.map((p) => ({
          ...p,
          caret: p.caret || 0,
          rate: p.rate || 0,
          amount: p.amount || 0,
        })) || [],
    };
    setEditingPurchase(editData);
    setEditDialogOpen(true);
  };

  const handlePaymentClick = (purchase) => {
    setSelectedPurchase(purchase);
    setPaymentData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: paymentModes[0],
      note: "",
    });
    setPaymentDialogOpen(true);
  };

  const handleDeleteClick = (purchase) => {
    setPurchaseToDelete(purchase);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!purchaseToDelete) return;

    try {
      await dispatch(deletePurchase(purchaseToDelete._id)).unwrap();
      toast.success("Purchase deleted successfully!");
      // Refresh dashboard stats
      dispatch(getDashboardStats());
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete purchase");
    }
  };

  const handleUpdatePurchase = async () => {
    if (!editingPurchase.vendorName.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    try {
      await dispatch(
        updatePurchase({
          id: editingPurchase._id,
          data: {
            vendorName: editingPurchase.vendorName,
            materialCategory: editingPurchase.materialCategory,
            purchaseDate: editingPurchase.purchaseDate,
            dueDate: editingPurchase.dueDate,
            notes: editingPurchase.notes,
          },
        }),
      ).unwrap();
      toast.success("Purchase updated successfully!");
      setEditDialogOpen(false);
      setEditingPurchase(null);
    } catch (error) {
      toast.error(error || "Failed to update purchase");
    }
  };

  const handleAddPayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      await dispatch(
        createPurchasePayment({
          purchase: selectedPurchase._id,
          vendorName: selectedPurchase.vendorName,
          amount: parseFloat(paymentData.amount),
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMode,
          remarks: paymentData.note,
        }),
      ).unwrap();
      toast.success("Payment added successfully!");
      // Refresh dashboard stats and purchases list
      dispatch(getDashboardStats());
      dispatch(getPurchases({ page: page + 1, limit: rowsPerPage }));
      setPaymentDialogOpen(false);
      setSelectedPurchase(null);
    } catch (error) {
      toast.error(error || "Failed to add payment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "partial":
        return "warning";
        deandfault: return "error";
    }
  };

  // Calculate total paid amount from all purchases
  const totalPaidAmount = purchases.reduce(
    (sum, p) => sum + (p.totalPaidAmount || 0),
    0,
  );
  // Calculate total purchase amount (what we owe)
  const totalPurchaseAmount = purchases.reduce(
    (sum, p) => sum + (p.totalAmount || 0),
    0,
  );

  // Get total received amount from sales (from Redux store)
  const { sales } = useSelector((state) => state.sales);
  const totalReceivedFromSales = sales.reduce(
    (sum, s) => sum + (s.totalReceivedAmount || 0),
    0,
  );

  // Calculate current cash balance: initial + sales received - purchases paid
  const currentCashBalance =
    initialAmount + totalReceivedFromSales - totalPaidAmount;

  // Calculate total purchased caret from all purchases
  const totalPurchaseCaret = purchases.reduce(
    (sum, p) => sum + (p.totalCaret || 0),
    0,
  );

  // Calculate total sold caret from all sales
  const totalSoldCaret = sales.reduce((sum, s) => sum + (s.totalCaret || 0), 0);

  // Calculate remaining stock (net caret)
  const remainingStockCaret = totalPurchaseCaret - totalSoldCaret;

  return (
    <Box>
      {/* Summary Cards at Top */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "primary.light", height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Amount
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ₹{currentCashBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "success.light", height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Available Stock
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {remainingStockCaret.toFixed(2)} ct
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Purchase List</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Purchase
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by vendor name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Caret</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Outstanding</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases
              .filter((p) =>
                p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((purchase) => (
                <TableRow key={purchase._id} hover>
                  <TableCell>
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{purchase.vendorName}</TableCell>
                  <TableCell>{purchase.materialCategory}</TableCell>
                  <TableCell align="right">
                    {purchase.totalCaret?.toFixed(2)} ct
                  </TableCell>
                  <TableCell align="right">
                    ₹{purchase.totalAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ₹{purchase.outstandingAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={purchase.status}
                      color={getStatusColor(purchase.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(purchase.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(purchase)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Payment">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handlePaymentClick(purchase)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(purchase)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination.total || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Add Purchase Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Purchase</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Purchase Date"
                InputLabelProps={{ shrink: true }}
                value={newPurchase.purchaseDate}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    purchaseDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={newPurchase.vendorName}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    vendorName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Material Category</InputLabel>
                <Select
                  value={newPurchase.materialCategory}
                  label="Material Category"
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      materialCategory: e.target.value,
                    })
                  }
                >
                  {materialCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={newPurchase.dueDate}
                onChange={(e) =>
                  setNewPurchase({ ...newPurchase, dueDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Packets
              </Typography>
              {newPurchase.packets.map((packet, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Range"
                      size="small"
                      placeholder="e.g. 10-14"
                      value={packet.range}
                      onChange={(e) =>
                        handlePacketChange(index, "range", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Caret"
                      size="small"
                      value={packet.caret}
                      onChange={(e) =>
                        handlePacketChange(index, "caret", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Rate"
                      size="small"
                      value={packet.rate}
                      onChange={(e) =>
                        handlePacketChange(index, "rate", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      size="small"
                      value={packet.amount?.toLocaleString()}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddPacket}
              >
                Add Packet
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                p={2}
                bgcolor="action.hover"
                borderRadius={1}
              >
                <Typography variant="h6">
                  Total Caret: {getTotalCaret()?.toFixed(2)} ct
                </Typography>
                <Typography variant="h6">
                  Total Amount: ₹{getTotalAmount()?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Purchase Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Purchase</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Purchase Date"
                InputLabelProps={{ shrink: true }}
                value={editingPurchase?.purchaseDate || ""}
                onChange={(e) =>
                  setEditingPurchase({
                    ...editingPurchase,
                    purchaseDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={editingPurchase?.vendorName || ""}
                onChange={(e) =>
                  setEditingPurchase({
                    ...editingPurchase,
                    vendorName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Material Category</InputLabel>
                <Select
                  value={editingPurchase?.materialCategory || ""}
                  label="Material Category"
                  onChange={(e) =>
                    setEditingPurchase({
                      ...editingPurchase,
                      materialCategory: e.target.value,
                    })
                  }
                >
                  {materialCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={editingPurchase?.dueDate || ""}
                onChange={(e) =>
                  setEditingPurchase({
                    ...editingPurchase,
                    dueDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Packets
              </Typography>
              {editingPurchase?.packets?.map((packet, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Range"
                      size="small"
                      value={packet.range || ""}
                      onChange={(e) =>
                        handleEditPacketChange(index, "range", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Caret"
                      size="small"
                      value={packet.caret || ""}
                      onChange={(e) =>
                        handleEditPacketChange(index, "caret", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Rate"
                      size="small"
                      value={packet.rate || ""}
                      onChange={(e) =>
                        handleEditPacketChange(index, "rate", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      size="small"
                      value={(packet.amount || 0).toLocaleString()}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                p={2}
                bgcolor="action.hover"
                borderRadius={1}
              >
                <Typography variant="h6">
                  Total Caret: {getEditTotalCaret()?.toFixed(2)} ct
                </Typography>
                <Typography variant="h6">
                  Total Amount: ₹{getEditTotalAmount()?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={editingPurchase?.notes || ""}
                onChange={(e) =>
                  setEditingPurchase({
                    ...editingPurchase,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePurchase}>
            Update Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Purchase</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the purchase from{" "}
            <strong>{purchaseToDelete?.vendorName}</strong> dated{" "}
            <strong>
              {purchaseToDelete?.purchaseDate
                ? new Date(purchaseToDelete.purchaseDate).toLocaleDateString()
                : ""}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment - {selectedPurchase?.vendorName}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Payment Amount *"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Payment Date *"
                InputLabelProps={{ shrink: true }}
                value={paymentData.paymentDate}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode *</InputLabel>
                <Select
                  value={paymentData.paymentMode}
                  label="Payment Mode *"
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      paymentMode: e.target.value,
                    })
                  }
                >
                  {paymentModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Outstanding Amount"
                value={`₹${(selectedPurchase?.outstandingAmount || 0).toLocaleString()}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note"
                multiline
                rows={2}
                value={paymentData.note}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, note: e.target.value })
                }
                placeholder="Optional note for this payment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPayment}>
            Save Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
