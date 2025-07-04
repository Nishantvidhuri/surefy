import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, TablePagination, TextField, IconButton, CssBaseline, Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel, TextField as MuiTextField, Snackbar, Alert, Box, Typography
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Papa from 'papaparse';

import { useSelector, useDispatch } from 'react-redux';
import { updateListRows, updateListColumns, setCurrentListId } from './store';
import WelcomePage from './WelcomePage';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function App() {
  const dispatch = useDispatch();
  const listsState = useSelector(state => state.lists);
  const { lists, currentListId } = listsState;
  const currentList = lists.find(l => l.id === currentListId);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('email');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowValues, setEditRowValues] = useState({});
  const [addingRow, setAddingRow] = useState(false);
  const [newRowValues, setNewRowValues] = useState({});

  React.useEffect(() => {
    if (currentList) {
      document.title = currentList.name;
      window.history.pushState({}, '', `/${encodeURIComponent(currentList.name)}`);
    } else {
      document.title = 'Welcome';
      window.history.pushState({}, '', '/');
    }
  }, [currentList]);

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: darkMode ? '#90caf9' : '#1976d2' },
      },
    }), [darkMode]);

  if (!currentList) return <WelcomePage />;

  const columns = currentList.columns;
  const rows = currentList.rows;
  const visibleColumns = columns.filter(col => col.visible);

  const filteredRows = rows.filter(row =>
    Object.entries(row)
      .filter(([key]) => visibleColumns.some(col => col.id === key))
      .some(([, val]) => String(val).toLowerCase().includes(search.toLowerCase()))
  );
  const sortedRows = filteredRows.sort(getComparator(order, orderBy));
  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (e, newPage) => setPage(newPage);

  const handleAddColumn = () => {
    const trimmed = newColName.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/\s+/g, '_');
    if (columns.some(col => col.id === id)) return;
    dispatch(updateListColumns({ listId: currentListId, columns: [...columns, { id, label: trimmed, visible: true }] }));
    setNewColName('');
  };

  const handleToggleColumn = (id) => {
    const newColumns = columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col);
    dispatch(updateListColumns({ listId: currentListId, columns: newColumns }));
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!Array.isArray(results.data)) {
          return setSnackbar({ open: true, message: 'Invalid CSV format.', severity: 'error' });
        }
        const colIds = columns.map(c => c.id);
        const missing = colIds.filter(cid => !Object.keys(results.data[0] || {}).includes(cid));
        if (missing.length) {
          return setSnackbar({ open: true, message: `Missing columns: ${missing.join(', ')}`, severity: 'error' });
        }
        const dataWithId = results.data.map((row, idx) => ({ id: row.id || idx + 1, ...row }));
        dispatch(updateListRows({ listId: currentListId, rows: dataWithId }));
        setSnackbar({ open: true, message: 'CSV imported successfully!', severity: 'success' });
      },
      error: () => {
        setSnackbar({ open: true, message: 'Failed to parse CSV.', severity: 'error' });
      }
    });
  };

  const handleExportCSV = () => {
    const visibleColIds = visibleColumns.map(col => col.id);
    const exportRows = rows.map(row => {
      const filtered = {};
      visibleColIds.forEach(cid => { filtered[cid] = row[cid] || ''; });
      return filtered;
    });
    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'table_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditRow = (row) => {
    setEditingRowId(row.id);
    setEditRowValues(row);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditRowValues({});
  };

  const handleSaveEdit = () => {
    const updatedRows = rows.map(r => r.id === editingRowId ? { ...editRowValues, id: editingRowId } : r);
    dispatch(updateListRows({ listId: currentListId, rows: updatedRows }));
    setEditingRowId(null);
    setEditRowValues({});
    setSnackbar({ open: true, message: 'Row updated!', severity: 'success' });
  };

  const handleEditFieldChange = (colId, value) => {
    setEditRowValues(prev => ({ ...prev, [colId]: value }));
  };

  const handleAddRowClick = () => {
    setAddingRow(true);
    const initial = {};
    visibleColumns.forEach(col => { initial[col.id] = ''; });
    setNewRowValues(initial);
  };

  const handleNewRowFieldChange = (colId, value) => {
    setNewRowValues(prev => ({ ...prev, [colId]: value }));
  };

  const handleSaveNewRow = () => {
    if (Object.values(newRowValues).every(val => val === '')) {
      return setSnackbar({ open: true, message: 'Please fill at least one field.', severity: 'error' });
    }
    const maxId = rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
    const newRow = { ...newRowValues, id: maxId + 1 };
    dispatch(updateListRows({ listId: currentListId, rows: [...rows, newRow] }));
    setAddingRow(false);
    setNewRowValues({});
    setSnackbar({ open: true, message: 'Row added!', severity: 'success' });
  };

  const handleCancelNewRow = () => {
    setAddingRow(false);
    setNewRowValues({});
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ padding: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Paper elevation={6} sx={{ maxWidth: 1200, mx: 'auto', p: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton onClick={() => dispatch(setCurrentListId(null))}><ArrowBackIcon /></IconButton>
            <Typography variant="h5" fontWeight={600}>{currentList.name}</Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={3}>
            <TextField label="Search" variant="outlined" value={search} onChange={e => setSearch(e.target.value)} sx={{ flexGrow: 1, minWidth: 200 }} />
            <Button variant="outlined" onClick={() => setManageOpen(true)}>Manage Columns</Button>
            <Button variant="contained" onClick={handleAddRowClick}>+ Add Row</Button>
            <Button variant="contained" component="label">Import CSV<input type="file" hidden onChange={handleImportCSV} /></Button>
            <Button variant="contained" color="success" onClick={handleExportCSV}>Export CSV</Button>
            <IconButton onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton>
          </Box>

          <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          <Dialog open={manageOpen} onClose={() => setManageOpen(false)}>
            <DialogTitle>Manage Columns</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={1}>
                {columns.map(col => (
                  <FormControlLabel
                    key={col.id}
                    control={<Checkbox checked={col.visible} onChange={() => handleToggleColumn(col.id)} />}
                    label={col.label}
                  />
                ))}
                <Box mt={2} display="flex" gap={1}>
                  <MuiTextField label="Add new column" value={newColName} onChange={e => setNewColName(e.target.value)} size="small" />
                  <Button onClick={handleAddColumn} variant="contained">Add</Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions><Button onClick={() => setManageOpen(false)}>Close</Button></DialogActions>
          </Dialog>

          <TableContainer sx={{ maxHeight: '65vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {visibleColumns.map(col => (
                    <TableCell key={col.id}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleRequestSort(col.id)}
                        hideSortIcon={false}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addingRow && (
                  <TableRow>
                    {visibleColumns.map(col => (
                      <TableCell key={col.id}>
                        <MuiTextField size="small" value={newRowValues[col.id] || ''} onChange={e => handleNewRowFieldChange(col.id, e.target.value)} />
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton onClick={handleSaveNewRow}><SaveIcon /></IconButton>
                      <IconButton onClick={handleCancelNewRow}><CloseIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRows.map(row => (
                  <TableRow key={row.id}>
                    {visibleColumns.map(col => (
                      <TableCell key={col.id}>
                        {editingRowId === row.id ? (
                          <MuiTextField size="small" value={editRowValues[col.id] || ''} onChange={e => handleEditFieldChange(col.id, e.target.value)} />
                        ) : (row[col.id] || '')}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editingRowId === row.id ? (
                        <>
                          <IconButton onClick={handleSaveEdit}><SaveIcon /></IconButton>
                          <IconButton onClick={handleCancelEdit}><CloseIcon /></IconButton>
                        </>
                      ) : (
                        <IconButton onClick={() => handleEditRow(row)}><EditIcon /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
