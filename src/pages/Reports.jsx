import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  FileDownload,
  Description,
  AttachMoney,
  Inventory,
  Assessment,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const reportTypes = [
  { id: "purchase", name: "Purchase Report", icon: <Description /> },
  { id: "sales", name: "Sales Report", icon: <Assessment /> },
  { id: "approval", name: "Approval Report", icon: <Description /> },
  {
    id: "vendor-outstanding",
    name: "Vendor Outstanding",
    icon: <AttachMoney />,
  },
  { id: "buyer-outstanding", name: "Buyer Outstanding", icon: <AttachMoney /> },
  { id: "broker-commission", name: "Broker Commission", icon: <AttachMoney /> },
  { id: "stock", name: "Stock Report", icon: <Inventory /> },
  { id: "profit-loss", name: "Profit & Loss", icon: <Assessment /> },
  { id: "cashflow", name: "Cash Flow", icon: <AttachMoney /> },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("purchase");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("json");

  const handleGenerateReport = () => {
    toast.success(`Generating ${selectedReport} report...`);
  };

  const handleExport = (exportFormat) => {
    toast.success(`Exporting report as ${exportFormat.toUpperCase()}...`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={3}>
        {/* Report Selection */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Report
            </Typography>
            <Grid container spacing={1}>
              {reportTypes.map((report) => (
                <Grid item xs={12} key={report.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      bgcolor:
                        selectedReport === report.id
                          ? "action.selected"
                          : "inherit",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardContent
                      sx={{
                        py: 1,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {report.icon}
                      <Typography variant="body1">{report.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Report Parameters */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {reportTypes.find((r) => r.id === selectedReport)?.name}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={format}
                    label="Export Format"
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FileDownload />}
                onClick={() => handleExport(format)}
              >
                Export as {format.toUpperCase()}
              </Button>
            </Box>

            {/* Sample Report Preview */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Report Preview
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  minHeight: 200,
                  bgcolor: "grey.50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Click "Generate Report" to view data
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
