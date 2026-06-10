import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  createSalePayment,
} from "../store/slices/saleSlice";
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
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteIcon from "@mui/icons-material/Delete";
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

export default function Sales() {
  const dispatch = useDispatch();
  const { sales, loading, pagination } = useSelector((state) => state.sales);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [newSale, setNewSale] = useState({
    sellerName: "",
    brokerName: "",
    brokerPercentage: 0,
    materialCategory: materialCategories[0],
    saleDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    creditDays: 30,
    notes: "",
    globalDeduction: 0,
    packets: [{ range: "", caret: "", rate: "", percentage: 0, amount: 0 }],
  });
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: paymentModes[0],
    note: "",
  });

  useEffect(() => {
    dispatch(getSales({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddPacket = () => {
    setNewSale({
      ...newSale,
      packets: [
        ...newSale.packets,
        { range: "", caret: "", rate: "", percentage: 0, amount: 0 },
      ],
    });
  };

  const handlePacketChange = (index, field, value) => {
    const updatedPackets = [...newSale.packets];
    updatedPackets[index][field] = value;
    if (field === "caret" || field === "rate" || field === "percentage") {
      const caret = parseFloat(updatedPackets[index].caret) || 0;
      const rate = parseFloat(updatedPackets[index].rate) || 0;
      const percentage = parseFloat(updatedPackets[index].percentage) || 0;
      const baseAmount = caret * rate;
      const deduction = baseAmount * (percentage / 100);
      updatedPackets[index].amount = baseAmount - deduction;
    }
    setNewSale({ ...newSale, packets: updatedPackets });
  };

  const handleEditPacketChange = (index, field, value) => {
    const updatedPackets = [...editingSale.packets];
    updatedPackets[index][field] = value;
    if (field === "caret" || field === "rate" || field === "percentage") {
      const caret = parseFloat(updatedPackets[index].caret) || 0;
      const rate = parseFloat(updatedPackets[index].rate) || 0;
      const percentage = parseFloat(updatedPackets[index].percentage) || 0;
      const baseAmount = caret * rate;
      const deduction = baseAmount * (percentage / 100);
      updatedPackets[index].amount = baseAmount - deduction;
    }
    setEditingSale({ ...editingSale, packets: updatedPackets });
  };

  const getEditTotalAmount = () => {
    const subtotal =
      editingSale?.packets?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const globalDeduction = parseFloat(editingSale?.globalDeduction) || 0;
    return subtotal - (subtotal * globalDeduction) / 100;
  };

  const getEditTotalCaret = () => {
    return (
      editingSale?.packets?.reduce(
        (sum, p) => sum + (parseFloat(p.caret) || 0),
        0,
      ) || 0
    );
  };

  const getTotalAmount = () => {
    const subtotal = newSale.packets.reduce(
      (sum, p) => sum + (p.amount || 0),
      0,
    );
    const globalDeduction = parseFloat(newSale.globalDeduction) || 0;
    return subtotal - (subtotal * globalDeduction) / 100;
  };

  const getTotalCaret = () => {
    return newSale.packets.reduce(
      (sum, p) => sum + (parseFloat(p.caret) || 0),
      0,
    );
  };

  const resetSaleForm = () => {
    setNewSale({
      sellerName: "",
      brokerName: "",
      brokerPercentage: 0,
      materialCategory: materialCategories[0],
      saleDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      creditDays: 30,
      notes: "",
      globalDeduction: 0,
      packets: [{ range: "", caret: "", rate: "", percentage: 0, amount: 0 }],
    });
  };

  const handleSubmit = async () => {
    const validPackets = newSale.packets.filter(
      (p) => p.caret && parseFloat(p.caret) > 0,
    );
    if (!newSale.sellerName.trim()) {
      toast.error("Seller name is required");
      return;
    }
    if (validPackets.length === 0) {
      toast.error("At least one packet with valid caret is required");
      return;
    }

    try {
      const saleData = {
        buyerName: newSale.sellerName,
        brokerName: newSale.brokerName,
        materialCategory: newSale.materialCategory,
        saleDate: newSale.saleDate || new Date().toISOString(),
        dueDate: newSale.dueDate || newSale.saleDate,
        creditDays: newSale.creditDays,
        notes: newSale.notes,
        globalDeduction: parseFloat(newSale.globalDeduction) || 0,
        packets: validPackets.map((p) => ({
          range: p.range,
          caret: parseFloat(p.caret),
          rate: parseFloat(p.rate) || 0,
          percentage: parseFloat(p.percentage) || 0,
          amount: parseFloat(p.amount) || 0,
        })),
        brokers: newSale.brokerName
          ? [
              {
                name: newSale.brokerName,
                percentage: parseFloat(newSale.brokerPercentage) || 0,
              },
            ]
          : [],
      };

      await dispatch(createSale(saleData)).unwrap();
      toast.success("Sale created successfully!");
      setOpenDialog(false);
      resetSaleForm();
    } catch (error) {
      toast.error(error || "Failed to create sale");
    }
  };

  const handleEditClick = (sale) => {
    const editData = {
      ...sale,
      sellerName: sale.buyerName,
      brokerName: sale.brokers?.[0]?.name || "",
      brokerPercentage: sale.brokers?.[0]?.percentage || 0,
      saleDate: sale.saleDate
        ? new Date(sale.saleDate).toISOString().split("T")[0]
        : "",
      dueDate: sale.dueDate
        ? new Date(sale.dueDate).toISOString().split("T")[0]
        : "",
      globalDeduction: sale.globalDeduction || 0,
      packets:
        sale.packets?.map((p) => ({
          ...p,
          caret: p.caret || 0,
          rate: p.rate || 0,
          percentage: p.percentage || 0,
          amount: p.amount || 0,
        })) || [],
    };
    setEditingSale(editData);
    setEditDialogOpen(true);
  };

  const handlePaymentClick = (sale) => {
    setSelectedSale(sale);
    setPaymentData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: paymentModes[0],
      note: "",
    });
    setPaymentDialogOpen(true);
  };

  const handleUpdateSale = async () => {
    if (!editingSale.sellerName.trim()) {
      toast.error("Seller name is required");
      return;
    }

    try {
      const result = await dispatch(
        updateSale({
          id: editingSale._id,
          data: {
            buyerName: editingSale.sellerName,
            brokerName: editingSale.brokerName,
            materialCategory: editingSale.materialCategory,
            saleDate: editingSale.saleDate,
            dueDate: editingSale.dueDate,
            creditDays: editingSale.creditDays,
            notes: editingSale.notes,
            globalDeduction: parseFloat(editingSale.globalDeduction) || 0,
          },
        }),
      ).unwrap();

      // Update the local state with the returned updated sale
      if (result) {
        const updatedSales = sales.map((s) =>
          s._id === result._id ? result : s,
        );
        dispatch({
          type: "sales/getAll/fulfilled",
          payload: { data: updatedSales, pagination },
        });
      }

      toast.success("Sale updated successfully!");
      setEditDialogOpen(false);
      setEditingSale(null);
      // Refresh dashboard stats
      dispatch(getDashboardStats());
    } catch (error) {
      toast.error(error || "Failed to update sale");
    }
  };

  const handleAddPayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      await dispatch(
        createSalePayment({
          sale: selectedSale._id,
          buyerName: selectedSale.sellerName || selectedSale.buyerName,
          amount: parseFloat(paymentData.amount),
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMode,
          remarks: paymentData.note,
        }),
      ).unwrap();
      toast.success("Payment received successfully!");
      // Refresh dashboard stats and sales list
      dispatch(getDashboardStats());
      dispatch(getSales({ page: page + 1, limit: rowsPerPage }));
      setPaymentDialogOpen(false);
      setSelectedSale(null);
    } catch (error) {
      toast.error(error || "Failed to add payment");
    }
  };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSale = async () => {
    if (!saleToDelete) return;

    try {
      await dispatch(deleteSale(saleToDelete._id)).unwrap();
      toast.success("Sale deleted successfully!");
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
      // Refresh dashboard stats
      dispatch(getDashboardStats());
    } catch (error) {
      toast.error(error || "Failed to delete sale");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "partial":
        return "warning";
      default:
        return "error";
    }
  };

  // Calculate total received amount from all sales
  const totalReceivedAmount = sales.reduce(
    (sum, s) => sum + (s.totalReceivedAmount || 0),
    0,
  );
  const totalSaleCaret = sales.reduce((sum, s) => sum + (s.totalCaret || 0), 0);

  // Get total purchased caret from purchases (from Redux store)
  const { purchases } = useSelector((state) => state.purchases);
  const totalPurchaseCaret = purchases.reduce(
    (sum, p) => sum + (p.totalCaret || 0),
    0,
  );

  // Calculate remaining stock (net caret)
  const remainingStockCaret = totalPurchaseCaret - totalSaleCaret;

  return (
    <Box>
      {/* Summary Cards at Top */}
      {/* <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "primary.light", height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Received Amount (From Sales)
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ₹{totalReceivedAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "success.light", height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Sold Caret (Maal)
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalSaleCaret.toFixed(2)} ct
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Sale List</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Sale
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by seller or broker name..."
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
              <TableCell>Seller</TableCell>
              <TableCell>Broker</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Caret</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Receivable</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales
              .filter((s) => {
                const sellerMatch =
                  s.buyerName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) || false;
                const brokerMatch =
                  s.brokers?.some((b) =>
                    b.name?.toLowerCase().includes(searchTerm.toLowerCase()),
                  ) || false;
                return sellerMatch || brokerMatch;
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sale) => (
                <TableRow key={sale._id} hover>
                  <TableCell>
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sale.buyerName}</TableCell>
                  <TableCell>
                    {sale.brokers?.map((b) => b.name).join(", ") || "-"}
                  </TableCell>
                  <TableCell>{sale.materialCategory}</TableCell>
                  <TableCell align="right">
                    {sale.totalCaret?.toFixed(2)} ct
                  </TableCell>
                  <TableCell align="right">
                    ₹{sale.netAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ₹{sale.outstandingAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.status}
                      color={getStatusColor(sale.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(sale.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(sale)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Receive Payment">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handlePaymentClick(sale)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(sale)}
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

      {/* Add Sale Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Sale</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Sale Date"
                InputLabelProps={{ shrink: true }}
                value={newSale.saleDate}
                onChange={(e) =>
                  setNewSale({
                    ...newSale,
                    saleDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seller Name *"
                value={newSale.sellerName}
                onChange={(e) =>
                  setNewSale({
                    ...newSale,
                    sellerName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broker Name"
                value={newSale.brokerName}
                onChange={(e) =>
                  setNewSale({
                    ...newSale,
                    brokerName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Broker Percentage"
                value={newSale.brokerPercentage}
                onChange={(e) =>
                  setNewSale({
                    ...newSale,
                    brokerPercentage: e.target.value,
                  })
                }
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Material Category *</InputLabel>
                <Select
                  value={newSale.materialCategory}
                  label="Material Category *"
                  onChange={(e) =>
                    setNewSale({
                      ...newSale,
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
                value={newSale.dueDate}
                onChange={(e) =>
                  setNewSale({ ...newSale, dueDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Packets
              </Typography>
              {newSale.packets.map((packet, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={2.5}>
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
                  <Grid item xs={2}>
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
                  <Grid item xs={2}>
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
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Deduction %"
                      size="small"
                      value={packet.percentage}
                      onChange={(e) =>
                        handlePacketChange(index, "percentage", e.target.value)
                      }
                      InputProps={{
                        inputProps: { min: 0, max: 100, step: 0.1 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={2.5}>
                    <TextField
                      fullWidth
                      label="Final Amount"
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Global Deduction %"
                value={newSale.globalDeduction}
                onChange={(e) =>
                  setNewSale({
                    ...newSale,
                    globalDeduction: e.target.value,
                  })
                }
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                helperText="Additional deduction from total amount"
              />
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
                <Typography variant="h6" color="primary">
                  Final Amount: ₹{getTotalAmount()?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Sale</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Sale Date"
                InputLabelProps={{ shrink: true }}
                value={editingSale?.saleDate || ""}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    saleDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seller Name *"
                value={editingSale?.sellerName || ""}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    sellerName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broker Name"
                value={editingSale?.brokerName || ""}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    brokerName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Broker Percentage"
                value={editingSale?.brokerPercentage || 0}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    brokerPercentage: e.target.value,
                  })
                }
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Material Category *</InputLabel>
                <Select
                  value={editingSale?.materialCategory || ""}
                  label="Material Category *"
                  onChange={(e) =>
                    setEditingSale({
                      ...editingSale,
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
                value={editingSale?.dueDate || ""}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    dueDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Global Deduction %"
                value={editingSale?.globalDeduction || 0}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    globalDeduction: e.target.value,
                  })
                }
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                helperText="Additional deduction from total amount"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Packets
              </Typography>
              {editingSale?.packets?.map((packet, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={2.5}>
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
                  <Grid item xs={2}>
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
                  <Grid item xs={2}>
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
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Deduction %"
                      size="small"
                      value={packet.percentage || 0}
                      onChange={(e) =>
                        handleEditPacketChange(
                          index,
                          "percentage",
                          e.target.value,
                        )
                      }
                      InputProps={{
                        inputProps: { min: 0, max: 100, step: 0.1 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={2.5}>
                    <TextField
                      fullWidth
                      label="Final Amount"
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
                <Typography variant="h6" color="primary">
                  Final Amount: ₹{getEditTotalAmount()?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={editingSale?.notes || ""}
                onChange={(e) =>
                  setEditingSale({
                    ...editingSale,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSale}>
            Update Sale
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this sale entry for{" "}
            <strong>{saleToDelete?.buyerName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. The sale amount of ₹
            {saleToDelete?.netAmount?.toLocaleString()} will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSale}>
            Delete Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receive Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Receive Payment -{" "}
          {selectedSale?.sellerName || selectedSale?.buyerName}
        </DialogTitle>
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
                value={`₹${(selectedSale?.outstandingAmount || 0).toLocaleString()}`}
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
