import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

import { Input } from '../../../../components/fields';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  DisputeStatus,
  type DisputeFilters as IDisputeFilters,
} from '../../../../types/dispute.type';

interface DisputeFiltersProps {
  filters: IDisputeFilters;
  onFiltersChange: (filters: IDisputeFilters) => void;
}

export const DisputeFilters: React.FC<DisputeFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      status: value ? (value as DisputeStatus) : undefined,
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onFiltersChange({});
  };

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch || undefined,
      });
    }
  }, [debouncedSearch]);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value={DisputeStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={DisputeStatus.UNDER_REVIEW}>
                Under Review
              </MenuItem>
              <MenuItem value={DisputeStatus.RESOLVED}>Resolved</MenuItem>
              <MenuItem value={DisputeStatus.REJECTED}>Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Input
            label=""
            name="search"
            value={localSearch}
            isError={false}
            onChange={handleSearchChange}
            placeholder="Search by Transaction ID, User, or Reason..."
            size="small"
            prefixIcon={<Search sx={{ mr: 1, color: 'text.secondary' }} />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FilterList />}
            onClick={handleClearFilters}
            sx={{ height: '40px' }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
