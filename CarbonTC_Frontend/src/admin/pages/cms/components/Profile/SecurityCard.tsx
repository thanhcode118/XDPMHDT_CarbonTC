import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { Input } from '../../../../components/fields';
import type { ChangePasswordData } from '../../hooks/useProfile';

interface SecurityCardProps {
  loading?: boolean;
  onChangePassword: (data: ChangePasswordData) => Promise<{
    success: boolean;
    message: string;
  }>;
}

function SecurityCard({
  loading = false,
  onChangePassword,
}: SecurityCardProps) {
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const handleChange = (field: keyof ChangePasswordData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
    setErrorMessages((prev) => ({ ...prev, [field]: '' }));
    setAlert({ show: false, type: 'success', message: '' });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    };

    const newErrorMessages = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // Validate current password
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = true;
      newErrorMessages.currentPassword = 'Current password is required';
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = true;
      newErrorMessages.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = true;
      newErrorMessages.newPassword =
        'Password must be at least 6 characters';
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = true;
      newErrorMessages.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = true;
      newErrorMessages.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    setErrorMessages(newErrorMessages);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    const result = await onChangePassword(formData);
    setSubmitting(false);

    setAlert({
      show: true,
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    setErrorMessages({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setAlert({ show: false, type: 'success', message: '' });
  };

  const hasFormData =
    formData.currentPassword || formData.newPassword || formData.confirmPassword;

  return (
    <Card>
      <CardHeader
        title="🔒 Security Settings"
        sx={{
          '& .MuiCardHeader-title': {
            fontSize: '1.25rem',
            fontWeight: 600,
          },
        }}
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}
              >
                Change Password
              </Typography>

              <Input
                label="Current Password"
                name="currentPassword"
                typeInput="password"
                value={formData.currentPassword}
                isError={errors.currentPassword}
                errorText={errorMessages.currentPassword}
                onChange={handleChange('currentPassword')}
                disabled={loading || submitting}
                size="small"
                placeholder="Enter current password"
              />

              <Input
                label="New Password"
                name="newPassword"
                typeInput="password"
                value={formData.newPassword}
                isError={errors.newPassword}
                errorText={errorMessages.newPassword}
                onChange={handleChange('newPassword')}
                disabled={loading || submitting}
                size="small"
                placeholder="Enter new password"
                helperText="Minimum 6 characters"
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                typeInput="password"
                value={formData.confirmPassword}
                isError={errors.confirmPassword}
                errorText={errorMessages.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading || submitting}
                size="small"
                placeholder="Confirm new password"
              />

              {hasFormData && (
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={submitting}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    fullWidth
                  >
                    {submitting ? 'Changing...' : 'Change Password'}
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column - Security Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}
              >
                Password Requirements
              </Typography>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderRadius: 2,
                  border: '1px solid rgba(25, 118, 210, 0.12)',
                }}
              >
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Your password must contain:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.5, color: 'text.secondary' }}
                  >
                    At least 6 characters
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.5, color: 'text.secondary' }}
                  >
                    Mix of letters and numbers
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    Special characters recommended
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(237, 108, 2, 0.04)',
                  borderRadius: 2,
                  border: '1px solid rgba(237, 108, 2, 0.12)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  ⚠️ Security Tips
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Never share your password with anyone. Change it regularly to
                  keep your account secure.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Alert Message */}
          {alert.show && (
            <Grid size={{ xs: 12}}>
              <Alert
                severity={alert.type}
                onClose={() =>
                  setAlert({ show: false, type: 'success', message: '' })
                }
              >
                {alert.message}
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default SecurityCard;
