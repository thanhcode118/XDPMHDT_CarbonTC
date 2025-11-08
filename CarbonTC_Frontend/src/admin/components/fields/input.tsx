/* eslint-disable no-unused-vars */
import {
  // Box,
  TextField,
  Typography,
  type AlertColor,
  type SxProps,
  type Theme,
} from '@mui/material';
import React, { forwardRef, type InputHTMLAttributes } from 'react';

import { errorColor } from '../../../common/color';
// import { TextTypography } from '../textTypography';

import { defaultStyleInput, errorStyleInput } from './styles';

interface InputProps {
  sx?: SxProps<Theme> | undefined;
  sxError?: SxProps<Theme> | undefined;

  label: string;
  name: string;
  value: string;
  isError: boolean;

  helperText?: string;
  typeInput?: InputHTMLAttributes<HTMLInputElement>['type'];
  severity?: AlertColor;
  defaultValue?: string;
  errorText?: string;
  id?: string;
  disabled?: boolean;
  suffixIcon?: React.JSX.Element;
  prefixIcon?: React.JSX.Element;
  placeholder?: string;
  size?: 'small' | 'medium';

  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;

  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  inputRef?: React.Ref<HTMLInputElement>;
  autoComplete?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      handleEnter,
      id,
      label,
      name,
      sx,
      sxError,
      value,
      isError,
      helperText,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      defaultValue,
      prefixIcon,
      suffixIcon,
      placeholder,
      size = 'medium',
      typeInput = 'text',
      errorText = 'Something went wrong',
      autoComplete = 'off',
      minRows = 1,
      inputRef,
      multiline = false,
      rows,
      maxRows,
      onKeyDown,
    }: InputProps,
    ref,
  ) => {
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (handleEnter) {
          event.preventDefault();
          handleEnter(event);
        }
      } else {
        onKeyDown?.(event);
      }
    };

    const combinedSx = {
      ...defaultStyleInput,
      ...sx,
      ...(isError && errorStyleInput),
    };

    const getMultilineProps = () => {
      if (!multiline) {
        return { multiline: false };
      }

      if (rows !== undefined) {
        return {
          multiline: true,
          rows: rows,
        };
      }
      return {
        multiline: true,
        ...(minRows !== undefined && { minRows }),
        ...(maxRows !== undefined && { maxRows }),
      };
    };

    return (
      <>
        <TextField
          id={id}
          name={name}
          label={label}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          sx={combinedSx}
          fullWidth
          size={size}
          error={isError}
          disabled={disabled}
          type={typeInput}
          autoComplete={autoComplete}
          {...getMultilineProps()}
          helperText={!isError ? helperText : undefined}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event);
          }}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            onBlur?.(event);
          }}
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
            onFocus?.(event);
          }}
          onKeyDown={handleKeyPress}
          slotProps={{
            input: {
              startAdornment: prefixIcon,
              endAdornment: suffixIcon,
              ref: inputRef || ref,
            },
          }}
        />
        {isError ? (
          <Typography
            variant="caption"
            sx={{
              color: errorColor,
              fontSize: '12px',
              marginTop: '4px',
              lineHeight: 1.4,
              ...errorStyleInput,
              ...sxError,
            }}
          >
            {errorText}
          </Typography>
        ) : null}
      </>
    );
  },
);

Input.displayName = 'Input';
