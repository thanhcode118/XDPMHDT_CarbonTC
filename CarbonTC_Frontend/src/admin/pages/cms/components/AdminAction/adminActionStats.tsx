import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { formatRelativeTime } from '../../../../utils/dateTime';
import type { AdminActionStatistics } from '../../../../types/adminaction.types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" width="100%" height={80} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
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
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface AdminActionStatsProps {
  statistics: AdminActionStatistics | null;
  loading?: boolean;
}

function AdminActionStats({ statistics, loading }: AdminActionStatsProps) {
  const stats = [
    {
      title: 'Total Actions',
      value: statistics?.totalActions || 0,
      icon: <AssessmentIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
      color: '#1976d2',
    },
    {
      title: 'This Week',
      value: statistics?.thisWeek || 0,
      icon: <CalendarIcon sx={{ fontSize: 32, color: '#2e7d32' }} />,
      color: '#2e7d32',
    },
    {
      title: 'This Month',
      value: statistics?.thisMonth || 0,
      icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#ed6c02' }} />,
      color: '#ed6c02',
    },
    {
      title: 'Last Activity',
      value: statistics?.lastActivity
        ? formatRelativeTime(statistics.lastActivity)
        : '-',
      icon: <AccessTimeIcon sx={{ fontSize: 32, color: '#9c27b0' }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      {statistics?.mostCommonAction && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Most Common Action:{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {statistics.mostCommonAction}
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default AdminActionStats;
