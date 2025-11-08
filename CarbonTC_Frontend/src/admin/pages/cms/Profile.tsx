import { Box, Container, Stack } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProfile } from './hooks/useProfile';
import {
  ProfileHeader,
  InformationCard,
  SecurityCard,
} from './components/Profile';

function Profile() {
  const { profileData, loading, updateProfile, changePassword } = useProfile();

  if (loading || !profileData) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ProfileHeader profileData={profileData} />

      <Stack spacing={3}>
        <InformationCard
          profileData={profileData}
          onUpdate={updateProfile}
        />

        <SecurityCard onChangePassword={changePassword} />
      </Stack>
    </Container>
  );
}

export default Profile;
