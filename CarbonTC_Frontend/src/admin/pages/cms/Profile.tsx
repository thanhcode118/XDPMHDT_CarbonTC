import { Container, Stack, Tabs, Tab, Box } from '@mui/material';
import { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProfile } from './hooks/useProfile';
import { ProfileHeader, SecurityCard } from './components/Profile';
import AdminAction from './AdminAction';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

function Profile() {
  const { profileData, updateProfile, loading, changePassword } = useProfile();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || !profileData) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <ProfileHeader profileData={profileData} onUpdate={updateProfile} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
        >
          <Tab label="Personal Info" {...a11yProps(0)} />
          <Tab label="My Activity" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          <SecurityCard onChangePassword={changePassword} />
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <AdminAction />
      </TabPanel>
    </Container>
  );
}

export default Profile;
