import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getApprovals,
  createApproval,
  updateApproval,
  deleteApproval,
} from "../store/slices/approvalSlice";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import Tooltip from "@mui/material/Tooltip";
import toast from "react-hot-toast";

const materialCategories = [
  "TLB Filing",
  "TLB Non Filing",
  "Zimbabwe Filing",
  "Zimbabwe Non Filing",
  "Kilwas Filing",
  "Kilwas Non Filing",
];

const approvalStatuses = ["pending", "partial", "completed", "cancelled"];

export default function Approvals() {
  const dispatch = useDispatch();
  const { approvals, pagination, loading } = useSelector(
    (state) => state.approvals,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingApproval, setEditingApproval] = useState(null);
  const [approvalToDelete, setApprovalToDelete] = useState(null);
  const [newApproval, setNewApproval] = useState({
    brokerName: "",
    brokerPhone: "",
    dateSent: new Date().toISOString().split("T")[0],
    remarks: "",
    materials: [
      {
        materialType: materialCategories[0],
        range: "",
        caret: "",
        rate: "",
        amount: 0,
      },
    ],
  });

  useEffect(() => {
    // Fetch all approvals (large limit to get all entries)
    dispatch(getApprovals({ limit: 10000 }));
  }, [dispatch]);

  const handleAddApproval = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewApproval({
      brokerName: "",
      brokerPhone: "",
      dateSent: new Date().toISOString().split("T")[0],
      remarks: "",
      materials: [
        {
          materialType: materialCategories[0],
          range: "",
          caret: "",
          rate: "",
          amount: 0,
        },
      ],
    });
  };

  const handleEditApproval = (approval) => {
    setEditingApproval({
      ...approval,
      dateSent: approval.dateSent
        ? new Date(approval.dateSent).toISOString().split("T")[0]
        : "",
      materials:
        approval.materials?.map((m) => ({
          ...m,
          caret: m.caret || 0,
          rate: m.rate || 0,
          amount: m.amount || 0,
        })) || [],
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (approval) => {
    setApprovalToDelete(approval);
    setDeleteDialogOpen(true);
  };

  const handleDeleteApproval = async () => {
    if (!approvalToDelete) return;

    try {
      await dispatch(deleteApproval(approvalToDelete._id)).unwrap();
      toast.success("Approval deleted successfully!");
      setDeleteDialogOpen(false);
      setApprovalToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to delete approval");
    }
  };

  const handleEditMaterialChange = (index, field, value) => {
    const updatedMaterials = [...editingApproval.materials];
    updatedMaterials[index][field] = value;
    if (field === "caret" || field === "rate") {
      updatedMaterials[index].amount =
        (parseFloat(updatedMaterials[index].caret) || 0) *
        (parseFloat(updatedMaterials[index].rate) || 0);
    }
    setEditingApproval({ ...editingApproval, materials: updatedMaterials });
  };

  const handleUpdateApproval = async () => {
    if (!editingApproval.brokerName.trim()) {
      toast.error("Broker name is required");
      return;
    }

    const validMaterials = editingApproval.materials.filter(
      (m) => m.caret && parseFloat(m.caret) > 0,
    );
    if (validMaterials.length === 0) {
      toast.error("At least one material with valid caret is required");
      return;
    }

    try {
      await dispatch(
        updateApproval({
          id: editingApproval._id,
          data: {
            brokerName: editingApproval.brokerName,
            brokerPhone: editingApproval.brokerPhone,
            dateSent: editingApproval.dateSent,
            remarks: editingApproval.remarks,
            status: editingApproval.status,
            materials: validMaterials.map((m) => ({
              ...m,
              caret: parseFloat(m.caret),
              rate: parseFloat(m.rate) || 0,
              amount: parseFloat(m.amount) || 0,
            })),
          },
        }),
      ).unwrap();
      toast.success("Approval updated successfully!");
      setEditDialogOpen(false);
      setEditingApproval(null);
    } catch (error) {
      toast.error(error || "Failed to update approval");
    }
  };

  const handleAddMaterial = () => {
    setNewApproval({
      ...newApproval,
      materials: [
        ...newApproval.materials,
        {
          materialType: materialCategories[0],
          range: "",
          caret: "",
          rate: "",
          amount: 0,
        },
      ],
    });
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...newApproval.materials];
    updatedMaterials[index][field] = value;
    if (field === "caret" || field === "rate") {
      updatedMaterials[index].amount =
        (parseFloat(updatedMaterials[index].caret) || 0) *
        (parseFloat(updatedMaterials[index].rate) || 0);
    }
    setNewApproval({ ...newApproval, materials: updatedMaterials });
  };

  const handleRemoveMaterial = (index) => {
    if (newApproval.materials.length > 1) {
      const updatedMaterials = newApproval.materials.filter(
        (_, i) => i !== index,
      );
      setNewApproval({ ...newApproval, materials: updatedMaterials });
    }
  };

  const getTotalCaret = () => {
    return newApproval.materials.reduce(
      (sum, m) => sum + (parseFloat(m.caret) || 0),
      0,
    );
  };

  const getTotalAmount = () => {
    return newApproval.materials.reduce((sum, m) => sum + (m.amount || 0), 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!newApproval.brokerName.trim()) {
      toast.error("Broker name is required");
      return;
    }

    const validMaterials = newApproval.materials.filter(
      (m) => m.caret && parseFloat(m.caret) > 0,
    );
    if (validMaterials.length === 0) {
      toast.error("At least one material with valid caret weight is required");
      return;
    }

    try {
      await dispatch(
        createApproval({
          ...newApproval,
          materials: validMaterials.map((m) => ({
            ...m,
            caret: parseFloat(m.caret),
          })),
        }),
      ).unwrap();

      toast.success("Approval created successfully!");
      handleCloseDialog();
    } catch (error) {
      toast.error(error || "Failed to create approval");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
      case "sold":
        return "success";
      case "partial":
        return "info";
      case "cancelled":
        return "error";
      case "returned":
        return "info";
      default:
        return "default";
    }
  };

  // Filter approvals based on search term
  const filteredApprovals = useMemo(() => {
    if (!searchTerm.trim()) return approvals;
    const term = searchTerm.toLowerCase();
    return approvals.filter((approval) => {
      const brokerName = approval.brokerName?.toLowerCase() || "";
      const dateSent = approval.dateSent
        ? new Date(approval.dateSent).toLocaleDateString()
        : "";
      return brokerName.includes(term) || dateSent.includes(term);
    });
  }, [approvals, searchTerm]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Approvals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddApproval}
        >
          Add Approval
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by broker name or date..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
        size="small"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Broker</TableCell>
              <TableCell align="right">Total Caret</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApprovals.map((approval) => {
              const totalCaret = approval.materials
                ?.reduce((sum, m) => sum + (m.caret || 0), 0)
                ?.toFixed(2);
              const totalAmount = approval.materials
                ?.reduce((sum, m) => sum + (m.amount || 0), 0)
                ?.toLocaleString();
              return (
                <TableRow key={approval._id} hover>
                  <TableCell>
                    {new Date(approval.dateSent).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{approval.brokerName}</TableCell>
                  <TableCell align="right">{totalCaret} ct</TableCell>
                  <TableCell align="right">₹{totalAmount}</TableCell>
                  <TableCell>
                    <Chip
                      label={approval.status}
                      color={getStatusColor(approval.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{approval.remarks || "-"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditApproval(approval)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(approval)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Approval Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Approval</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broker Name *"
                value={newApproval.brokerName}
                onChange={(e) =>
                  setNewApproval({ ...newApproval, brokerName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broker Phone"
                value={newApproval.brokerPhone}
                onChange={(e) =>
                  setNewApproval({
                    ...newApproval,
                    brokerPhone: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date Sent"
                InputLabelProps={{ shrink: true }}
                value={newApproval.dateSent}
                onChange={(e) =>
                  setNewApproval({ ...newApproval, dateSent: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                value={newApproval.remarks}
                onChange={(e) =>
                  setNewApproval({ ...newApproval, remarks: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Materials *
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddMaterial}
                >
                  Add Material
                </Button>
              </Box>
              {newApproval.materials.map((material, index) => (
                <Grid
                  container
                  spacing={2}
                  key={index}
                  sx={{ mb: 1 }}
                  alignItems="center"
                >
                  <Grid item xs={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Material Type</InputLabel>
                      <Select
                        value={material.materialType}
                        label="Material Type"
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "materialType",
                            e.target.value,
                          )
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
                  <Grid item xs={2.5}>
                    <TextField
                      fullWidth
                      label="Range"
                      size="small"
                      placeholder="e.g. 10-14"
                      value={material.range}
                      onChange={(e) =>
                        handleMaterialChange(index, "range", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Caret *"
                      size="small"
                      value={material.caret}
                      onChange={(e) =>
                        handleMaterialChange(index, "caret", e.target.value)
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Rate"
                      size="small"
                      value={material.rate}
                      onChange={(e) =>
                        handleMaterialChange(index, "rate", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Amount"
                      size="small"
                      value={material.amount?.toLocaleString()}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={0.5}>
                    {newApproval.materials.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveMaterial(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
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
                  Total Caret: {getTotalCaret().toFixed(2)} ct
                </Typography>
                <Typography variant="h6">
                  Total Amount: ₹{getTotalAmount()?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Approval"}
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
            Are you sure you want to delete this approval entry for{" "}
            <strong>{approvalToDelete?.brokerName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteApproval}
          >
            Delete Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Approval Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Approval</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broker Name *"
                value={editingApproval?.brokerName || ""}
                onChange={(e) =>
                  setEditingApproval({
                    ...editingApproval,
                    brokerName: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Broker Phone"
                value={editingApproval?.brokerPhone || ""}
                onChange={(e) =>
                  setEditingApproval({
                    ...editingApproval,
                    brokerPhone: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date Sent"
                InputLabelProps={{ shrink: true }}
                value={
                  editingApproval?.dateSent
                    ? new Date(editingApproval.dateSent)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditingApproval({
                    ...editingApproval,
                    dateSent: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                value={editingApproval?.remarks || ""}
                onChange={(e) =>
                  setEditingApproval({
                    ...editingApproval,
                    remarks: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingApproval?.status || "pending"}
                  label="Status"
                  onChange={(e) =>
                    setEditingApproval({
                      ...editingApproval,
                      status: e.target.value,
                    })
                  }
                >
                  {approvalStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Materials
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingApproval({
                      ...editingApproval,
                      materials: [
                        ...editingApproval.materials,
                        {
                          materialType: materialCategories[0],
                          range: "",
                          caret: "",
                          rate: "",
                          amount: 0,
                        },
                      ],
                    });
                  }}
                >
                  Add Material
                </Button>
              </Box>
              {editingApproval?.materials?.map((material, index) => (
                <Grid
                  container
                  spacing={2}
                  key={index}
                  sx={{ mb: 1 }}
                  alignItems="center"
                >
                  <Grid item xs={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Material Type</InputLabel>
                      <Select
                        value={material.materialType}
                        label="Material Type"
                        onChange={(e) =>
                          handleEditMaterialChange(
                            index,
                            "materialType",
                            e.target.value,
                          )
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
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Range"
                      size="small"
                      value={material.range || ""}
                      onChange={(e) =>
                        handleEditMaterialChange(index, "range", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Caret"
                      size="small"
                      value={material.caret || ""}
                      onChange={(e) =>
                        handleEditMaterialChange(index, "caret", e.target.value)
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Rate"
                      size="small"
                      value={material.rate || ""}
                      onChange={(e) =>
                        handleEditMaterialChange(index, "rate", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Amount"
                      size="small"
                      value={(material.amount || 0).toLocaleString()}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (editingApproval.materials.length > 1) {
                          const updated = editingApproval.materials.filter(
                            (_, i) => i !== index,
                          );
                          setEditingApproval({
                            ...editingApproval,
                            materials: updated,
                          });
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
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
                  Total Caret:{" "}
                  {editingApproval?.materials
                    ?.reduce((sum, m) => sum + (m.caret || 0), 0)
                    ?.toFixed(2)}{" "}
                  ct
                </Typography>
                <Typography variant="h6">
                  Total Amount: ₹
                  {editingApproval?.materials
                    ?.reduce((sum, m) => sum + (m.amount || 0), 0)
                    ?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateApproval}>
            Update Approval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
