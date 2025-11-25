import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  ReportType,
  ReportPeriod,
  getReportTypeOptions,
  getReportPeriodOptions,
  type GenerateReportRequest,
} from '../../../../types/report.types';

interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateReportRequest) => Promise<void>;
  loading?: boolean;
}

export const CreateReportDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}: CreateReportDialogProps) => {
  const [formData, setFormData] = useState<GenerateReportRequest>({
    type: ReportType.TRANSACTION_STATS,
    period: ReportPeriod.MONTHLY,
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof GenerateReportRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.type || !formData.period) {
      setError('Please select report type and period');
      return;
    }

    // If custom dates are provided, validate them
    if (formData.startDate || formData.endDate) {
      if (!formData.startDate || !formData.endDate) {
        setError('Please provide both start and end dates');
        return;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError('Start date must be before end date');
        return;
      }
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  const handleClose = () => {
    setFormData({
      type: ReportType.TRANSACTION_STATS,
      period: ReportPeriod.MONTHLY,
      startDate: '',
      endDate: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon />
          <span>Generate New Report</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Report Type *</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              label="Report Type *"
            >
              {getReportTypeOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Period *</InputLabel>
            <Select
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              label="Period *"
            >
              {getReportPeriodOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Optional: Specify custom date range
          </Typography>

          <TextField
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Alert severity="info">
            If no date range is specified, the system will use the default range
            based on the selected period.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReportDialog;
