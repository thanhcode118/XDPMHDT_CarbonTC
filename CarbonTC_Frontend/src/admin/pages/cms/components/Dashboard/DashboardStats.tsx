import { Box, Card, Grid, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import EcoIcon from '@mui/icons-material/Eco';
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded';
import { formatNumber } from '../../../../utils';
import type { SystemOverview } from '../../../../services/dashboard.service';

interface DashboardStatsProps {
  overview: SystemOverview;
}

export const DashboardStats = ({ overview }: DashboardStatsProps) => {
  const cards = [
    {
      title: 'Total E-Wallets',
      value: overview.totalEWallets,
      icon: <AccountBalanceWalletIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
      formatter: (val: number) => val.toString(),
    },
    {
      title: 'Total Balance (VND)',
      value: overview.totalCarbonWallets,
      icon: <AttachMoneyIcon />,
      color: 'success.main',
      bgColor: 'success.light',
      formatter: (val: number) => `${formatNumber(val)} VND`,
    },
    {
      title: 'Total Money Balance',
      value: overview.totalMoneyBalance,
      icon: <AttachMoneyIcon />,
      color: 'success.main',
      bgColor: 'success.light',
      formatter: (val: number) => `${formatNumber(val)} VND`,
    },
    {
      title: 'Total Carbon Balance',
      value: overview.totalCarbonBalance,
      icon: <EnergySavingsLeafRoundedIcon />,
      color: 'info.main',
      bgColor: 'info.light',
      formatter: (val: number) => `${formatNumber(val)} Credits`,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  bgcolor: card.bgColor,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {card.formatter(card.value)}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
