import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { formatDateTime } from '../../../../utils/dateTime';
// import type { AdminActionDetail } from '../../../../types/adminaction.types';
import {
  ActionTypeLabels,
  getActionTypeColor,
  type AdminActionDetail,
} from '../../../../types/adminaction.types';

interface AdminActionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  actionId: string | null;
  fetchActionDetail: (actionId: string) => Promise<AdminActionDetail | null>;
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 1.5 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }}>
        <Typography variant="body2">{value}</Typography>
      </Grid>
    </Grid>
  );
}

function AdminActionDetailDialog({
  open,
  onClose,
  actionId,
  fetchActionDetail,
}: AdminActionDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [actionDetail, setActionDetail] = useState<AdminActionDetail | null>(
    null,
  );

  useEffect(() => {
    if (open && actionId) {
      loadActionDetail();
    }
  }, [open, actionId]);

  const loadActionDetail = async () => {
    if (!actionId) return;

    setLoading(true);
    try {
      const detail = await fetchActionDetail(actionId);
      setActionDetail(detail);
    } catch (error) {
      console.error('Error loading action detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActionDetail(null);
    onClose();
  };

  const actionTypeLabel = actionDetail?.actionType
    ? ActionTypeLabels[actionDetail.actionType] || actionDetail.actionType
    : '-';
  const actionTypeColor = actionDetail?.actionType
    ? getActionTypeColor(actionDetail.actionType)
    : 'default';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Admin Action Details
        </Typography>
        <Button
          onClick={handleClose}
          size="small"
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : actionDetail ? (
          <Box sx={{ py: 2 }}>
            {/* Basic Info */}
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Basic Information
            </Typography>

            <DetailRow
              label="Action ID"
              value={
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                >
                  {actionDetail.actionId}
                </Typography>
              }
            />

            <DetailRow
              label="Action Type"
              value={
                <Chip
                  label={actionTypeLabel}
                  color={actionTypeColor}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              }
            />

            <DetailRow
              label="Admin"
              value={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {actionDetail.adminName || '-'}
                  </Typography>
                  {actionDetail.adminEmail && (
                    <Typography variant="caption" color="text.secondary">
                      {actionDetail.adminEmail}
                    </Typography>
                  )}
                </Box>
              }
            />

            <DetailRow
              label="Target ID"
              value={
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                >
                  {actionDetail.targetId}
                </Typography>
              }
            />

            <DetailRow
              label="Date & Time"
              value={formatDateTime(actionDetail.createdAt)}
            />

            <Divider sx={{ my: 2 }} />

            {/* Description */}
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Description
            </Typography>

            <Box
              sx={{
                backgroundColor: 'grey.50',
                p: 2,
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2">
                {actionDetail.description || '-'}
              </Typography>
            </Box>

            {/* Action Details */}
            {actionDetail.actionDetails &&
              Object.keys(actionDetail.actionDetails).length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                    Additional Details
                  </Typography>

                  <Box
                    sx={{
                      backgroundColor: 'grey.50',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      maxHeight: 300,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(actionDetail.actionDetails, null, 2)}
                    </pre>
                  </Box>
                </>
              )}
          </Box>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No action details available
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdminActionDetailDialog;
