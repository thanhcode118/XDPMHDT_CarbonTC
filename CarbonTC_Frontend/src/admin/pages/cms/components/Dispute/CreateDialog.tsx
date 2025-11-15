import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';

import { Input } from '../../../../components/fields';
import type { CreateDisputeRequest } from '../../../../types/dispute.type';

interface CreateDisputeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDisputeRequest) => Promise<void>;
  isLoading?: boolean;
}

const REASON_OPTIONS = [
  'Fraud',
  'Quality Issue',
  'Payment Issue',
  'Delivery Issue',
  'Service Issue',
  'Other',
];

export const CreateDisputeDialog: React.FC<CreateDisputeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateDisputeRequest>({
    transactionId: '',
    raisedBy: '',
    reason: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }
    if (!formData.raisedBy.trim()) {
      newErrors.raisedBy = 'User ID is required';
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      transactionId: '',
      raisedBy: '',
      reason: '',
      description: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Dispute</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Input
            label="Transaction ID *"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            isError={!!errors.transactionId}
            errorText={errors.transactionId}
            placeholder="Enter transaction ID"
          />

          <Input
            label="Raised By (User ID) *"
            name="raisedBy"
            value={formData.raisedBy}
            onChange={handleChange}
            isError={!!errors.raisedBy}
            errorText={errors.raisedBy}
            placeholder="Enter user ID"
          />

          <FormControl fullWidth error={!!errors.reason}>
            <InputLabel>Reason *</InputLabel>
            <Select
              name="reason"
              value={formData.reason}
              label="Reason *"
              onChange={handleSelectChange}
            >
              {REASON_OPTIONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Input
            label="Description *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            isError={!!errors.description}
            errorText={errors.description}
            placeholder="Describe the issue in detail..."
            multiline
            minRows={4}
            maxRows={8}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Dispute'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
