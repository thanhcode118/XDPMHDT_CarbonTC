import { Box, Card, Grid, Typography } from '@mui/material';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import Co2RoundedIcon from '@mui/icons-material/Co2Rounded';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import EcoIcon from '@mui/icons-material/Eco';
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded';
import { formatNumber } from '../../../../utils';
import type { SystemOverview } from '../../../../services/dashboard.service';
import { brand, green, orange } from '../../../../../common/color';

interface DashboardStatsProps {
  overview: SystemOverview;
}

export const DashboardStats = ({ overview }: DashboardStatsProps) => {
  const cards = [
    {
      title: 'Total E-Wallets',
      value: overview.totalEWallets,
      icon: <AccountBalanceWalletRoundedIcon />,
      color: brand[800],
      // bgColor: 'primary.light',
      formatter: (val: number) => val.toString(),
    },
    {
      title: 'Total Carbon Wallets',
      value: overview.totalCarbonWallets,
      icon: <Co2RoundedIcon />,
      color: green[800],
      // bgColor: 'info.light',
      formatter: (val: number) => val.toString(),
    },
    {
      title: 'Total Money Balance',
      value: overview.totalMoneyBalance,
      icon: <AttachMoneyIcon />,
      color: green[700],
      // bgColor: 'success.light',
      formatter: (val: number) => `${formatNumber(val)} VND`,
    },
    {
      title: 'Total Carbon Balance',
      value: overview.totalCarbonBalance,
      icon: <EnergySavingsLeafRoundedIcon />,
      color: orange[800],
      // bgColor: 'warning.light',
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
                  width: 50,
                  height: 50,
                  border: 2,
                  borderRadius: 2,
                  // bgcolor: card.bgColor,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
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
