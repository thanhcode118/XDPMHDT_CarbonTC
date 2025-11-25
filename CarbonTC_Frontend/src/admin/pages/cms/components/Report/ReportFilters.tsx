import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import {
  ReportType,
  ReportPeriod,
  getReportTypeOptions,
  getReportPeriodOptions,
  type ReportFilters as ReportFiltersType,
} from '../../../../types/report.types';

interface ReportFiltersProps {
  onFilter: (filters: ReportFiltersType) => void;
  loading?: boolean;
}

export const ReportFilters = ({ onFilter, loading = false }: ReportFiltersProps) => {
  const [filters, setFilters] = useState<ReportFiltersType>({
    type: undefined,
    period: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const handleChange = (field: keyof ReportFiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleClear = () => {
    const clearedFilters: ReportFiltersType = {
      type: undefined,
      period: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Report Type</InputLabel>
            <Select
              value={filters.type || ''}
              onChange={(e) =>
                handleChange('type', e.target.value as ReportType)
              }
              label="Report Type"
            >
              <MenuItem value="">All Types</MenuItem>
              {getReportTypeOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Period</InputLabel>
            <Select
              value={filters.period || ''}
              onChange={(e) =>
                handleChange('period', e.target.value as ReportPeriod)
              }
              label="Period"
            >
              <MenuItem value="">All Periods</MenuItem>
              {getReportPeriodOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            label="End Date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleApply}
              disabled={loading}
              fullWidth
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;
