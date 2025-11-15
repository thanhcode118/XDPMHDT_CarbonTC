import { Box, Card, Grid, Typography } from '@mui/material';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatNumber } from '../../../../utils';

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalPendingAmount: number;
  };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: <AccountBalanceWalletIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <PendingIcon />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: <CheckCircleIcon />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: <CancelIcon />,
      color: 'error.main',
      bgColor: 'error.light',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, md: 6, sm: 3 }} key={index}>
            <Card
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: card.bgColor,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {card.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight={600}>
            Total Pending Amount
          </Typography>
          <Typography variant="h5" fontWeight={700} color="warning.dark">
            {formatNumber(stats.totalPendingAmount)} VND
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
