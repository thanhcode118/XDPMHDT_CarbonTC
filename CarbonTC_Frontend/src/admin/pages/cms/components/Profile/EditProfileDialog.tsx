import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Input } from '../../../../components/fields';
import type { ProfileData } from '../../hooks/useProfile';

interface UpdateProfileInput {
  fullName: string;
  phoneNumber: string;
}
interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onUpdate: (data: UpdateProfileInput) => Promise<{
    success: boolean;
    message: string;
  }>;
}

function EditProfileDialog({
  open,
  onClose,
  profileData,
  onUpdate,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState<UpdateProfileInput>({
    fullName: profileData.fullName,
    phoneNumber: profileData.phoneNumber || '',
  });

  const [errors, setErrors] = useState({
    fullName: false,
    phoneNumber: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    fullName: '',
    phoneNumber: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    if (open) {
      setFormData({
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber || '',
      });
      handleResetForm();
    }
  }, [open, profileData]);

  const handleChange = (field: keyof UpdateProfileInput) => (
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
      fullName: false,
      phoneNumber: false,
    };

    const newErrorMessages = {
      fullName: '',
      phoneNumber: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = true;
      newErrorMessages.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    setErrorMessages(newErrorMessages);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    const result = await onUpdate(formData);
    setSubmitting(false);

    setAlert({
      show: true,
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleResetForm = () => {
    setErrors({
      fullName: false,
      phoneNumber: false,
    });
    setErrorMessages({
      fullName: '',
      phoneNumber: '',
    });
    setAlert({ show: false, type: 'success', message: '' });
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
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
          Chỉnh sửa thông tin
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            isError={errors.fullName}
            errorText={errorMessages.fullName}
            onChange={handleChange('fullName')}
            disabled={submitting}
            size="small"
            // placeholder="Nhập họ tên đầy đủ"
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            isError={errors.phoneNumber}
            errorText={errorMessages.phoneNumber}
            onChange={handleChange('phoneNumber')}
            disabled={submitting}
            size="small"
            // placeholder="+84 xxx xxx xxx"
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

      <DialogActions sx={{ justifyContent: 'center', px: 3, py: 2 }}>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
        >
          {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditProfileDialog;
