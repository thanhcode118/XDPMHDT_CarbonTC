import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Box, Breadcrumbs, Typography, Link } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { gray, primaryTextColor, secondaryTextColor } from '../common/color';
import { DEFAULT_ROUTE_LABELS, ROUTES } from '../common/constants';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isLast: boolean;
}

interface BreadcrumbPageProps {
  lastBreadcrumb?: string;
  fontSize?: string;
  showOnlyLast?: boolean;
  actionComponents?: React.ReactNode[];
  isDashboardClickable?: boolean;
  customRouteLabels?: Record<string, string>;
}

const BreadcrumbPage: React.FC<BreadcrumbPageProps> = ({
  lastBreadcrumb,
  fontSize = '16px',
  showOnlyLast = false,
  actionComponents,
  isDashboardClickable = true,
  customRouteLabels,
}) => {
  const location = useLocation();

  const routeLabels = useMemo(
    () => ({
      ...DEFAULT_ROUTE_LABELS,
      ...customRouteLabels,
    }),
    [customRouteLabels],
  );

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathSegments = location.pathname
      .split('/')
      .filter((segment) => segment && segment.trim());

    if (pathSegments.length === 0) {
      return [{ label: routeLabels.dashboard || 'Dashboard', isLast: true }];
    }

    const breadcrumbItems: BreadcrumbItem[] = [];

    if (pathSegments[0] !== 'dashboard') {
      breadcrumbItems.push({
        label: routeLabels.dashboard || 'Dashboard',
        path: ROUTES.ADMIN.DASHBOARD,
        isLast: false,
      });
    }

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;

      let label =
        routeLabels[segment] ||
        segment
          .replace(/-/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');

      if (isLast && lastBreadcrumb) {
        label = lastBreadcrumb;
      }

      breadcrumbItems.push({
        label,
        path: isLast ? undefined : path,
        isLast,
      });
    });

    return breadcrumbItems;
  }, [location.pathname, routeLabels, lastBreadcrumb]);

  const renderBreadcrumbItem = useCallback(
    (breadcrumb: BreadcrumbItem, index: number) => {
      const { label, path, isLast } = breadcrumb;
      const key = `${path || label}-${index}`;

      if (isLast || !path) {
        return (
          <Typography
            key={key}
            sx={{
              color: primaryTextColor,
              fontWeight: 600,
              fontSize,
              userSelect: 'none',
            }}
          >
            {label}
          </Typography>
        );
      }

      if (path === ROUTES.ADMIN.DASHBOARD && !isDashboardClickable) {
        return (
          <Typography
            key={key}
            sx={{
              color: secondaryTextColor,
              fontSize,
              userSelect: 'none',
            }}
          >
            {label}
          </Typography>
        );
      }

      return (
        <Link
          key={key}
          component={RouterLink}
          to={path}
          sx={{
            color: secondaryTextColor,
            textDecoration: 'none',
            fontSize,
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              color: gray[700],
              textDecoration: 'underline',
            },
          }}
          aria-label={`Navigate to ${label}`}
        >
          {label}
        </Link>
      );
    },
    [fontSize, isDashboardClickable],
  );

  if (showOnlyLast) {
    const lastItem = breadcrumbs[breadcrumbs.length - 1];
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            color: primaryTextColor,
            fontWeight: 600,
            fontSize,
            userSelect: 'none',
          }}
        >
          {lastItem?.label || 'Page'}
        </Typography>
        {actionComponents && actionComponents.length > 0 && (
          <>
            {actionComponents.map((component, index) => (
              <React.Fragment key={index}>{component}</React.Fragment>
            ))}
          </>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mb: 3,
        gap: 1,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
      role="navigation"
      aria-label="Breadcrumb navigation"
    >
      <Breadcrumbs
        separator={
          <NavigateNextIcon fontSize="small" sx={{ color: gray[500] }} />
        }
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5,
          },
        }}
        maxItems={6}
        itemsBeforeCollapse={2}
        itemsAfterCollapse={2}
      >
        {breadcrumbs.map(renderBreadcrumbItem)}
      </Breadcrumbs>

      {actionComponents && actionComponents.length > 0 && (
        <>
          {actionComponents.map((component, index) => (
            <React.Fragment key={index}>{component}</React.Fragment>
          ))}
        </>
      )}
    </Box>
  );
};

export default React.memo(BreadcrumbPage);
