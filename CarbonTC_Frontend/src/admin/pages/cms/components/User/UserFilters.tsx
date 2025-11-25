import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

import type { UserFilters as UserFiltersType } from '../../../../types/user.types';
import { useDebounce } from '../../../../hooks/useDebounce';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: UserFiltersType) => void;
}

export const UserFilters = ({
  filters,
  onFilterChange
}: UserFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFilterChange]);

  const handleRoleChange = (role: string) => {
    onFilterChange({ ...filters, role: role || undefined });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status: status || undefined });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    onFilterChange({});
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.role ||
    filters.status
  );

  return (
    <Card sx={{ mb: 3, p: 0 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Box sx={{ flex: 1, fontWeight: 600, fontSize: '1.1rem' }}>
            Filters
          </Box>
          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="small"
              color="inherit"
            >
              Clear All
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Role"
              value={filters.role || ''}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="EV_OWNER">EV Owner</MenuItem>
              <MenuItem value="BUYER">Buyer</MenuItem>
              <MenuItem value="CVA">CVA Verifier</MenuItem>
              <MenuItem value="ADMIN">Administrator</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserFilters;
