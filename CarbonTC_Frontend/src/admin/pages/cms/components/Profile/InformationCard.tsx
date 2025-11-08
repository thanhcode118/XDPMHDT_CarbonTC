import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  Button,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Input } from '../../../../components/fields';
import type { ProfileData, UpdateProfileData } from '../../hooks/useProfile';
import { formatDate } from '../../../../utils';

interface InformationCardProps {
  profileData: ProfileData;
  loading?: boolean;
  onUpdate: (data: UpdateProfileData) => Promise<{
    success: boolean;
    message: string;
  }>;
}

function InformationCard({
  profileData,
  loading = false,
  onUpdate,
}: InformationCardProps) {
  const [formData, setFormData] = useState({
    fullName: profileData.fullName,
    phoneNumber: profileData.phoneNumber || '',
  });

  const [errors, setErrors] = useState({
    fullName: false,
    phoneNumber: false,
  });

  const [isEdited, setIsEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber || '',
    });
  }, [profileData]);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
    setIsEdited(true);
  };

  const validateForm = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      phoneNumber: false,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const result = await onUpdate({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
    });

    setSaving(false);

    if (result.success) {
      setIsEdited(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber || '',
    });
    setErrors({ fullName: false, phoneNumber: false });
    setIsEdited(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'CVA':
        return 'secondary';
      case 'BUYER':
        return 'info';
      case 'EV_OWNER':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'error' | 'default' | 'warning' => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  return (
    <Card>
      <CardHeader
        title="📋 Basic Information"
        sx={{
          '& .MuiCardHeader-title': {
            fontSize: '1.25rem',
            fontWeight: 600,
          },
        }}
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                label="User ID"
                name="userId"
                value={profileData.userId}
                isError={false}
                disabled
                size="small"
              />

              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                isError={errors.fullName}
                errorText="Full name is required"
                onChange={handleChange('fullName')}
                disabled={loading || saving}
                size="small"
              />

              <Input
                label="Email"
                name="email"
                value={profileData.email}
                isError={false}
                disabled
                size="small"
              />

              <Box>
                <Input
                  label="Role"
                  name="role"
                  value=""
                  isError={false}
                  disabled
                  size="small"
                  sx={{ display: 'none' }}
                />
                <Chip
                  label={profileData.role}
                  color={getRoleColor(profileData.role)}
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                isError={errors.phoneNumber}
                errorText="Invalid phone number"
                onChange={handleChange('phoneNumber')}
                disabled={loading || saving}
                placeholder="+84 xxx xxx xxx"
                size="small"
              />

              <Input
                label="Created Date"
                name="createdAt"
                value={formatDate(profileData.createdAt)}
                isError={false}
                disabled
                size="small"
              />

              <Box>
                <Input
                  label="Status"
                  name="status"
                  value=""
                  isError={false}
                  disabled
                  size="small"
                  sx={{ display: 'none' }}
                />
                <Chip
                  label={profileData.status}
                  color={getStatusColor(profileData.status)}
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor:
                          profileData.status === 'ACTIVE'
                            ? '#4caf50'
                            : '#f44336',
                        ml: 1,
                      }}
                    />
                  }
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Action Buttons */}
          {isEdited && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default InformationCard;
