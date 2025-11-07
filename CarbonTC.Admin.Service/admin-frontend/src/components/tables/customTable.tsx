/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Box, type SxProps, type Theme } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridSortModel,
  type GridRowParams,
  type GridValidRowModel,
  type GridCallbackDetails,
} from '@mui/x-data-grid';
import React, { useState } from 'react';

// import theme from '../../common/theme/themes';

import * as tableNoData from './tableNoData';

export interface CustomTableProps<T extends GridValidRowModel> {
  items: T[];
  columnHeaders: GridColDef[];
  totalCount: number;
  currentPage: number;
  maxPageSize: number;
  onPageChange: (page: number, pageSize: number) => void;

  isLoading?: boolean;
  checkboxSelection?: boolean;
  selectedIds?: GridRowSelectionModel;
  handleSelect?: (items: GridRowSelectionModel) => void;
  isRowSelectable?: ((params: T) => boolean) | undefined;
  preventActiveCheckBoxFields?: string[];
  sortModel?: GridSortModel;
  handleSortModelChange?: (model: GridSortModel) => void;
  rowHeight?: number | undefined;
  sx?: SxProps<Theme> | undefined;
  className?: (params: T) => string;
  hideFooterPagination?: boolean;
  getRowId?: (row: T) => string | number;
  onRowClick?: (params: GridRowParams<T>) => void;
  onCellClick?: (params: any, event: any) => void;
  noDataMessage?: string;
  rowSelectionModel?: GridRowSelectionModel;
}

export default function CustomTable<T extends Record<string, any>>({
  items,
  columnHeaders = [],
  totalCount = 0,
  currentPage = 0,
  maxPageSize = 10,
  onPageChange,
  isLoading = false,
  checkboxSelection = false,
  handleSelect,
  isRowSelectable,
  preventActiveCheckBoxFields = [],
  sortModel,
  rowHeight = undefined,
  sx,
  className,
  hideFooterPagination = false,
  onRowClick,
  onCellClick,
  noDataMessage = 'No data to display',
  // rowSelectionModel = [],
}: CustomTableProps<T>): React.JSX.Element {
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [SelectedIds, setSelectedIds] = useState<
    GridRowSelectionModel | undefined
  >(undefined);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: currentPage,
    pageSize: maxPageSize,
  });

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    onPageChange(model.page, model.pageSize);
  };

  const handleSelectionChange = (ids: GridRowSelectionModel) => {
    setSelectedIds(ids);
    handleSelect?.(ids);
  };

  const handleCellClick = (params: any, event: any) => {
    if (preventActiveCheckBoxFields.includes(params.field)) {
      event.stopPropagation();
    }
    onCellClick?.(params, event);
  };

  function handleSortModelChange(
    _model: GridSortModel,
    _details: GridCallbackDetails<any>,
  ): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        // maxWidth: !isMobile ? 'calc(100vw - 290px)' : 'calc(100vw - 105px)',

        '& .MuiDataGrid-root': {
          maxWidth: '100%',
          overflow: 'auto',
        },
        ...sx,
      }}
    >
      <DataGrid
        rows={items}
        rowHeight={rowHeight}
        rowCount={totalCount}
        getRowId={(row) => row.id}
        columns={columnHeaders}
        loading={isLoading}
        checkboxSelection={checkboxSelection}
        rowSelectionModel={SelectedIds}
        onRowSelectionModelChange={handleSelectionChange}
        isRowSelectable={
          isRowSelectable ? (params) => isRowSelectable(params.row) : undefined
        }
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => {
          handlePaginationChange(model);
          onPageChange(model.page, model.pageSize);
        }}
        hideFooterPagination={hideFooterPagination}
        pageSizeOptions={[10, 20, 50]}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        onRowClick={onRowClick}
        onCellClick={handleCellClick}
        getRowClassName={
          className ? (params) => className(params.row) : undefined
        }
        localeText={{
          footerRowSelected: (count) =>
            checkboxSelection ? `Selected ${count} rows` : '',
          noRowsLabel: noDataMessage,
          paginationDisplayedRows: ({ from, to, count }) =>
            `${from}–${to} of ${count !== -1 ? count : '0'}`,
        }}
        slots={{
          noRowsOverlay: () => (
            <tableNoData.TableNoData message={noDataMessage} />
          ),
          noResultsOverlay: () => (
            <tableNoData.TableNoData message={noDataMessage} />
          ),
        }}
        slotProps={{
          loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' },
        }}
        density="compact"
        disableColumnResize
        // disableRowSelectionOnClick={checkboxSelection}
        initialState={{
          pagination: {
            paginationModel: { pageSize: maxPageSize, page: currentPage },
          },
        }}
      />
    </Box>
  );
}
