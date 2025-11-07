export const defaultStyleInput = {
  '.MuiInputBase-root': {
    borderRadius: '8px',
    paddingRight: '0px !important',
    minHeight: '46px',
    fieldset: { boxSizing: ' border-box' },
  },
  '.MuiInputBase-input': {
    textAlign: 'left !important',
  },
  'textarea::placeholder': {
    fontSize: '14px',
  },
  width: '100%',
};

export const errorStyleInput = {
  '&.MuiAlert-colorError	': {
    backgroundColor: '#FFFFFF',
    color: 'red',
    padding: '2px 0px 0px 0px',
  },
  display: 'flex',
  alignItems: 'center',
};
