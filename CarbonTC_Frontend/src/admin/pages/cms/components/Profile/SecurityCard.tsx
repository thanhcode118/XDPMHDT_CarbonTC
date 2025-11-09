import {
  Box,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
// import { Close as CloseIcon } from '@mui/icons-material';
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
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
    handleResetForm();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleResetForm();
  };

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

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = true;
      newErrorMessages.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = true;
      newErrorMessages.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = true;
      newErrorMessages.newPassword =
        'Password must be at least 6 characters';
    }

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
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    }
  };

  const handleResetForm = () => {
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

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' , flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          sx={{ maxWidth: 200, fontWeight: 600 }}
        >
          Change Password
        </Button>
      </Box>
        {/* <CardContent>
        </CardContent>
      <Card>
      </Card> */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Đổi mật khẩu
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <Input
              label="Mật khẩu cũ (*)"
              name="currentPassword"
              typeInput="password"
              value={formData.currentPassword}
              isError={errors.currentPassword}
              errorText={errorMessages.currentPassword}
              onChange={handleChange('currentPassword')}
              disabled={loading || submitting}
              size="small"
              placeholder="Nhập mật khẩu hiện tại"
            />

            <Input
              label="Mật khẩu mới (*)"
              name="newPassword"
              typeInput="password"
              value={formData.newPassword}
              isError={errors.newPassword}
              errorText={errorMessages.newPassword}
              onChange={handleChange('newPassword')}
              disabled={loading || submitting}
              size="small"
              placeholder="Nhập mật khẩu mới"
            />

            <Input
              label="Xác nhận mật khẩu (*)"
              name="confirmPassword"
              typeInput="password"
              value={formData.confirmPassword}
              isError={errors.confirmPassword}
              errorText={errorMessages.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading || submitting}
              size="small"
              placeholder="Xác nhận mật khẩu mới"
            />

            {alert.show && (
              <Alert
                severity={alert.type}
                onClose={() =>
                  setAlert({ show: false, type: 'success', message: '' })
                }
              >
                {alert.message}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center' , px: 3, py: 2 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="contained"
          >
            {submitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SecurityCard;
