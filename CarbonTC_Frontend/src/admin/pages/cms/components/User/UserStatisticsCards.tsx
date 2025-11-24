import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';

import type { UserStatistics } from '../../../../types/user.types';
import { formatInteger } from '../../../../utils/number';
import { brand, green, orange, red } from '../../../../../common/color';

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
            icon={<PeopleAltRoundedIcon fontSize="large" />}
            color= {brand[500]}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Users"
            value={statistics?.activeUsers || 0}
            icon={<CheckCircleRoundedIcon fontSize="large" />}
            color= {green[600]}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inactive Users"
            value={statistics?.inactiveUsers || 0}
            icon={<CancelRoundedIcon fontSize="large" />}
            color= {red[600]}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending CVA"
            value={statistics?.pendingVerifiers || 0}
            icon={<HourglassTopRoundedIcon fontSize="large" />}
            color= {orange[600]}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="EV Owners"
            value={statistics?.byRole?.evOwner || 0}
            icon={<DirectionsCarFilledRoundedIcon fontSize="large" />}
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
            icon={<VerifiedUserRoundedIcon fontSize="large" />}
            color="#3f51b5"
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Administrators"
            value={statistics?.byRole?.admin || 0}
            icon={<PersonRoundedIcon fontSize="large" />}
            color= {red[500]}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStatisticsCards;
