import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
  type SelectChangeEvent,
  Alert,
} from '@mui/material';
import { Close, Edit, Save } from '@mui/icons-material';

import { Input } from '../../../../components/fields';
import { formatDateTime, formatCurrency } from '../../../../utils';
import {
  ActionType,
  DisputeStatus,
  ResolutionType,
  type DisputeDetail,
  type ResolveDisputeRequest,
  type UpdateStatusRequest,
  getTransactionStatusColor,
} from '../../../../types/dispute.type';

interface DisputeDetailDialogProps {
  open: boolean;
  disputeId: string | null;
  onClose: () => void;
  onDelete: (disputeId: string) => Promise<void>;
  onUpdateStatus: (
    disputeId: string,
    data: UpdateStatusRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  onResolve: (
    disputeId: string,
    data: ResolveDisputeRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  fetchDisputeById: (disputeId: string) => Promise<DisputeDetail | null>;
  isLoading?: boolean;
}

type ViewMode = 'view' | 'edit';

export const DisputeDetailDialog: React.FC<DisputeDetailDialogProps> = ({
  open,
  disputeId,
  onClose,
  onDelete,
  onUpdateStatus,
  onResolve,
  fetchDisputeById,
  isLoading: externalLoading = false,
}) => {
  const [mode, setMode] = useState<ViewMode>('view');
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedStatus, setSelectedStatus] = useState<DisputeStatus>(
    DisputeStatus.PENDING,
  );
  const [resolution, setResolution] = useState<ResolutionType | ''>('');
  const [actionType, setActionType] = useState<ActionType | ''>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [error, setError] = useState('');

  // Load dispute data
  useEffect(() => {
    if (open && disputeId) {
      loadDispute();
    }
  }, [open, disputeId]);

  const loadDispute = async () => {
    if (!disputeId) return;

    setIsLoading(true);
    setError('');

    const data = await fetchDisputeById(disputeId);

    if (data) {
      console.log('📦 Loaded dispute data:', data);
      setDispute(data);
      setSelectedStatus(data.status);
    }

    setIsLoading(false);
  };

  const handleEdit = () => {
    setMode('edit');
    setError('');
  };

  const handleCancelEdit = () => {
    setMode('view');
    setResolution('');
    setActionType('');
    setResolutionNotes('');
    setError('');
  };

  const handleStatusChange = (event: SelectChangeEvent<DisputeStatus>) => {
    setSelectedStatus(event.target.value as DisputeStatus);
  };

  const handleSave = async () => {
    if (!dispute) return;

    setIsSaving(true);
    setError('');

    try {
      if (resolution && resolutionNotes.trim()) {
        const resolveData: ResolveDisputeRequest = {
          resolution: resolution as ResolutionType,
          resolutionNotes: resolutionNotes.trim(),
        };

        if (resolution === ResolutionType.APPROVE && actionType) {
          resolveData.action = {
            type: actionType as ActionType,
          };
        }

        const result = await onResolve(dispute.disputeId, resolveData);

        if (!result.success) {
          setError(result.error || 'Failed to resolve dispute');
          setIsSaving(false);
          return;
        }
      }
      else if (selectedStatus !== dispute.status) {
        const result = await onUpdateStatus(dispute.disputeId, {
          status: selectedStatus,
        });

        if (!result.success) {
          setError(result.error || 'Failed to update status');
          setIsSaving(false);
          return;
        }
      }

      await loadDispute();
      setMode('view');
      handleCancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dispute || !window.confirm('Are you sure you want to delete this dispute?')) {
      return;
    }

    await onDelete(dispute.disputeId);
    onClose();
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.PENDING:
        return 'warning';
      case DisputeStatus.UNDER_REVIEW:
        return 'info';
      case DisputeStatus.RESOLVED:
        return 'success';
      case DisputeStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const canEdit = dispute?.status !== DisputeStatus.RESOLVED &&
                  dispute?.status !== DisputeStatus.REJECTED;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Dispute Details #{dispute?.disputeId?.substring(0, 8)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {mode === 'view' && canEdit && (
            <IconButton onClick={handleEdit} size="small">
              <Edit />
            </IconButton>
          )}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading || externalLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : dispute ? (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: mode === 'edit' ? 3 : 0 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dispute Status
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={dispute.status}
                      color={getStatusColor(dispute.status)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(dispute.createdAt)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Raised By
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dispute.raisedByName || 'Unknown User'}
                  </Typography>
                  {dispute.raisedByEmail && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {dispute.raisedByEmail}
                    </Typography>
                  )}
                  {!dispute.raisedByName && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      ID: {dispute.raisedBy?.substring(0, 8)}...
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {dispute.transactionId?.substring(0, 16)}...
                  </Typography>
                </Grid>

                {dispute.transactionDetails && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }}>
                        <Chip label="Transaction Details" size="small" />
                      </Divider>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Transaction Status
                      </Typography>
                      <Box mt={0.5}>
                        <Chip
                          label={dispute.transactionDetails.status || 'Unknown'}
                          color={getTransactionStatusColor(dispute.transactionDetails.statusCode)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Transaction Amount
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dispute.transactionDetails.quantity} credits × {formatCurrency(dispute.transactionDetails.amount / dispute.transactionDetails.quantity)}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        Total: {formatCurrency(dispute.transactionDetails.amount)}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Buyer
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dispute.transactionDetails.buyerName || 'Unknown Buyer'}
                      </Typography>
                      {dispute.transactionDetails.buyerEmail && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {dispute.transactionDetails.buyerEmail}
                        </Typography>
                      )}
                      {!dispute.transactionDetails.buyerName || dispute.transactionDetails.buyerName === 'Unknown Buyer' ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {dispute.transactionDetails.buyerId?.substring(0, 8)}...
                        </Typography>
                      ) : null}
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Seller
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dispute.transactionDetails.sellerName || 'Unknown Seller'}
                      </Typography>
                      {dispute.transactionDetails.sellerEmail && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {dispute.transactionDetails.sellerEmail}
                        </Typography>
                      )}
                      {!dispute.transactionDetails.sellerName || dispute.transactionDetails.sellerName === 'Unknown Seller' ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {dispute.transactionDetails.sellerId?.substring(0, 8)}...
                        </Typography>
                      ) : null}
                    </Grid>
                  </>
                )}

                {!dispute.transactionDetails && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Transaction details could not be loaded. The transaction may not exist or there was an error fetching details.
                    </Alert>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Dispute Details" size="small" />
                  </Divider>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {dispute.reason}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">{dispute.description}</Typography>
                </Grid>

                {dispute.resolvedAt && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Resolved At
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(dispute.resolvedAt)}
                    </Typography>
                  </Grid>
                )}

                {dispute.resolutionNotes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Resolution Notes
                    </Typography>
                    <Typography variant="body2">{dispute.resolutionNotes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {mode === 'edit' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    🔧 ACTIONS
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Quick Status Update
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedStatus}
                        label="Status"
                        onChange={handleStatusChange}
                      >
                        <MenuItem value={DisputeStatus.PENDING}>Pending</MenuItem>
                        <MenuItem value={DisputeStatus.UNDER_REVIEW}>
                          Under Review
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Resolve Dispute Section */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Resolve Dispute
                    </Typography>

                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                      <RadioGroup
                        value={resolution}
                        onChange={(e) => {
                          setResolution(e.target.value as ResolutionType);
                          setActionType(''); // Reset action when resolution changes
                        }}
                      >
                        <FormControlLabel
                          value={ResolutionType.APPROVE}
                          control={<Radio />}
                          label="Approve (User is right)"
                        />
                        <FormControlLabel
                          value={ResolutionType.REJECT}
                          control={<Radio />}
                          label="Reject (User is wrong)"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Action options when Approve is selected */}
                    {resolution === ResolutionType.APPROVE && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Action to take:
                        </Typography>
                        <FormControl component="fieldset">
                          <RadioGroup
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value as ActionType)}
                          >
                            <FormControlLabel
                              value={ActionType.REFUND}
                              control={<Radio />}
                              label="Refund buyer"
                            />
                            <FormControlLabel
                              value={ActionType.CANCEL}
                              control={<Radio />}
                              label="Cancel transaction"
                            />
                            <FormControlLabel
                              value={ActionType.NO_ACTION}
                              control={<Radio />}
                              label="No action (just mark as resolved)"
                            />
                          </RadioGroup>
                        </FormControl>

                        {actionType === ActionType.REFUND && dispute.transactionDetails && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            ⚠️ Selecting "Refund" will:
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                              <li>
                                Return {dispute.transactionDetails.quantity} credits to buyer
                              </li>
                              <li>
                                Deduct {formatCurrency(dispute.transactionDetails.amount)} from seller
                              </li>
                              <li>Update transaction status to Refunded</li>
                            </ul>
                          </Alert>
                        )}
                      </Box>
                    )}

                    {/* Resolution Notes */}
                    {resolution && (
                      <Box sx={{ mt: 2 }}>
                        <Input
                          label="Resolution Notes *"
                          name="resolutionNotes"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          isError={false}
                          placeholder="Explain your decision..."
                          multiline
                          minRows={3}
                          maxRows={6}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </>
        ) : (
          <Typography>Dispute not found</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {mode === 'view' ? (
          <>
            {canEdit && (
              <Button onClick={handleDelete} color="error">
                Delete
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={onClose}>Close</Button>
          </>
        ) : (
          <>
            <Button onClick={handleCancelEdit} disabled={isSaving}>
              Cancel
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<Save />}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
