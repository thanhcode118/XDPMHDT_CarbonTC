import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import {
  AssignmentLate,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';

import type { DisputeStatistics } from '../../../../types/dispute.type';
import { formatInteger } from '../../../../utils';

interface StatisticsCardsProps {
  statistics: DisputeStatistics | null;
  isLoading: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) => (
  <Card
    sx={{
      height: '100%',
      boxShadow: 2,
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s',
      },
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h4" fontWeight="bold">
              {formatInteger(value)}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 32, color }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  statistics,
  isLoading,
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Disputes"
          value={statistics?.total || 0}
          icon={AssignmentLate}
          color="#1976d2"
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Pending"
          value={statistics?.byStatus.pending || 0}
          icon={Pending}
          color="#ff9800"
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Resolved"
          value={statistics?.byStatus.resolved || 0}
          icon={CheckCircle}
          color="#4caf50"
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Rejected"
          value={statistics?.byStatus.rejected || 0}
          icon={Cancel}
          color="#f44336"
          isLoading={isLoading}
        />
      </Grid>

      {statistics && !isLoading && (
        <Grid size={{ xs: 12 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Resolution Time
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {statistics.avgResolutionTime.toFixed(1)} hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};
