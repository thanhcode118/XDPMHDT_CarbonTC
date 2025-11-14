import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useEffect, useState } from 'react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateRange: { start: string | null; end: string | null };
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: FilterBarProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 350);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <TextField
        size="small"
        placeholder="Search by User ID or Bank Account..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        sx={{ flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        size="small"
        type="date"
        label="Start Date"
        value={dateRange.start || ''}
        onChange={(e) =>
          onDateRangeChange({ ...dateRange, start: e.target.value || null })
        }
        InputLabelProps={{ shrink: true }}
        sx={{ width: { xs: '100%', md: 200 } }}
      />

      <TextField
        size="small"
        type="date"
        label="End Date"
        value={dateRange.end || ''}
        onChange={(e) =>
          onDateRangeChange({ ...dateRange, end: e.target.value || null })
        }
        InputLabelProps={{ shrink: true }}
        sx={{ width: { xs: '100%', md: 200 } }}
      />
    </Box>
  );
};
