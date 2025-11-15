import { Container, Stack } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProfile } from './hooks/useProfile';
import {
  ProfileHeader,
  SecurityCard,
} from './components/Profile';

function Profile() {
  const {
    profileData,
    updateProfile,
    loading,
    changePassword,
  } = useProfile();

  if (loading || !profileData) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <ProfileHeader profileData={profileData} onUpdate={updateProfile} />
      <Stack spacing={3}>
        <SecurityCard onChangePassword={changePassword} />
      </Stack>
    </Container>
  );
}

export default Profile;
