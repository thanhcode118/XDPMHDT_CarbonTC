import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import type { UserStatistics } from '../../../../types/user.types';
import { formatInteger } from '../../../../utils/number';

interface UserStatisticsCardsProps {
  statistics: UserStatistics | null;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, color, isLoading }: StatCardProps) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: 2,
              p: 1,
              mr: 2,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h4" fontWeight="bold">
            {typeof value === 'number' ? formatInteger(value) : value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const UserStatisticsCards = ({
  statistics,
  isLoading = false,
}: UserStatisticsCardsProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={statistics?.totalUsers || 0}
            icon={<PeopleIcon fontSize="large" />}
            color="#2196f3"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Users"
            value={statistics?.activeUsers || 0}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#4caf50"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inactive Users"
            value={statistics?.inactiveUsers || 0}
            icon={<CancelIcon fontSize="large" />}
            color="#f44336"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending CVA"
            value={statistics?.pendingVerifiers || 0}
            icon={<HourglassEmptyIcon fontSize="large" />}
            color="#ff9800"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="EV Owners"
            value={statistics?.byRole?.evOwner || 0}
            icon={<DirectionsCarIcon fontSize="large" />}
            color="#9c27b0"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Buyers"
            value={statistics?.byRole?.buyer || 0}
            icon={<ShoppingCartIcon fontSize="large" />}
            color="#00bcd4"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="CVA Verifiers"
            value={statistics?.byRole?.cva || 0}
            icon={<VerifiedUserIcon fontSize="large" />}
            color="#3f51b5"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Administrators"
            value={statistics?.byRole?.admin || 0}
            icon={<PersonIcon fontSize="large" />}
            color="#f44336"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStatisticsCards;
