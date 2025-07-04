import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addList, setCurrentListId, deleteList
} from './store';
import {
  Button, List, ListItem, ListItemButton, ListItemText, TextField, Typography,
  Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Papa from 'papaparse';

export default function WelcomePage() {
  const lists = useSelector(state => state.lists.lists);
  const dispatch = useDispatch();

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([]);
  const [newCol, setNewCol] = useState('');
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [error, setError] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const handleOpenModal = () => {
    setModalOpen(true);
    setTableName('');
    setColumns([]);
    setNewCol('');
    setCsvColumns([]);
    setCsvRows([]);
    setError('');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddCol = () => {
    const trimmed = newCol.trim();
    if (!trimmed || columns.includes(trimmed)) return;
    setColumns([...columns, trimmed]);
    setNewCol('');
  };

  const handleRemoveCol = (col) => {
    setColumns(columns.filter(c => c !== col));
  };

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
          setError('Invalid or empty CSV.');
          return;
        }
        setCsvColumns(Object.keys(results.data[0]));
        setCsvRows(results.data.map((row, idx) => ({ id: row.id || idx + 1, ...row })));
        setError('');
      },
      error: () => setError('Failed to parse CSV.')
    });
  };

  const handleCreate = () => {
    if (!tableName.trim()) return setError('Table name is required.');

    let columnDefs = [];
    if (csvColumns.length) {
      columnDefs = csvColumns.map(col => ({ id: col, label: col, visible: true }));
    } else if (columns.length) {
      columnDefs = columns.map(col => ({
        id: col.toLowerCase().replace(/\s+/g, '_'),
        label: col,
        visible: true
      }));
    } else {
      return setError('Add columns or import from CSV.');
    }

    const action = dispatch(addList(tableName.trim(), columnDefs, csvRows));
    const newListId = action.payload.id;
    dispatch(setCurrentListId(newListId));
    handleCloseModal();
  };

  const handleEditClick = (id, name) => {
    setEditingId(id);
    setEditValue(name);
  };

  const handleEditSave = (id) => {
    if (!editValue.trim()) return;
    dispatch({ type: 'lists/updateListName', payload: { id, name: editValue.trim() } });
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleOpenList = (id) => {
    dispatch(setCurrentListId(id));
  };

  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteList(deleteId));
    setDeleteDialogOpen(false);
    setDeleteId(null);
    setDeleteName('');
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
    setDeleteName('');
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 10, p: 4, borderRadius: 3, boxShadow: 5, bgcolor: 'background.paper' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome!
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          size="large"
        >
          Create Table
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" sx={{ mt: 2 }}>Your Lists</Typography>
      {lists.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
          No tables found. Create one!
        </Typography>
      )}
      {lists.length > 0 && (
        <List>
          {lists.map(list => (
            <ListItem key={list.id} disablePadding secondaryAction={
              <>
                {editingId === list.id ? (
                  <>
                    <IconButton edge="end" color="primary" onClick={() => handleEditSave(list.id)}><SaveIcon /></IconButton>
                    <IconButton edge="end" color="error" onClick={handleEditCancel}><CloseIcon /></IconButton>
                  </>
                ) : (
                  <>
                    <IconButton edge="end" onClick={() => handleEditClick(list.id, list.name)}><EditIcon /></IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleDeleteClick(list.id, list.name)}><DeleteIcon /></IconButton>
                  </>
                )}
              </>
            }>
              {editingId === list.id ? (
                <TextField
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  size="small"
                  autoFocus
                  sx={{ width: '70%' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEditSave(list.id);
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                />
              ) : (
                <ListItemButton onClick={() => handleOpenList(list.id)}>
                  <ListItemText primary={list.name} />
                </ListItemButton>
              )}
            </ListItem>
          ))}
        </List>
      )}

      {/* Modal for creating new table */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Create New Table</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Table Name"
            value={tableName}
            onChange={e => setTableName(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Typography variant="subtitle1" mt={2}>Add Columns</Typography>
          <Box display="flex" gap={1} mb={1}>
            <TextField
              label="Column Name"
              value={newCol}
              onChange={e => setNewCol(e.target.value)}
              size="small"
              fullWidth
            />
            <Button onClick={handleAddCol} variant="outlined">Add</Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {columns.map(col => (
              <Chip
                key={col}
                label={col}
                onDelete={() => handleRemoveCol(col)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>

          <Typography align="center" variant="body2" sx={{ my: 1 }}>or</Typography>

          <Button variant="contained" component="label" fullWidth sx={{ mt: 1 }}>
            Import from CSV
            <input type="file" accept=".csv" hidden onChange={handleCsvChange} />
          </Button>

          {csvColumns.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" fontWeight={500}>
                CSV Columns: {csvColumns.join(', ')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rows detected: {csvRows.length}
              </Typography>
            </Box>
          )}

          {error && (
            <Typography color="error" mt={1}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Table?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <b>{deleteName}</b>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
