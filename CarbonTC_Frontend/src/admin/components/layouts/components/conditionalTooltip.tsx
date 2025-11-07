import { Tooltip, type TooltipProps } from '@mui/material';
import React from 'react';

interface ConditionalTooltipProps extends Omit<TooltipProps, 'children'> {
  children: React.ReactElement;
  show: boolean;
  title: string;
}

export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = ({
  children,
  show,
  title,
  placement = 'right',
  arrow = true,
  ...tooltipProps
}) => {
  if (!show) {
    return children;
  }

  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
};

export default ConditionalTooltip;
