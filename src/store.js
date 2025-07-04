import { configureStore, createSlice, nanoid } from '@reduxjs/toolkit';

// Initial data
const initialRows = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25, role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 30, role: 'User' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 22, role: 'User' },
];

const initialColumns = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'age', label: 'Age', visible: true },
  { id: 'role', label: 'Role', visible: true },
];

const rowsSlice = createSlice({
  name: 'rows',
  initialState: initialRows,
  reducers: {
    setRows: (state, action) => action.payload,
    addRow: (state, action) => { state.push(action.payload); },
    updateRow: (state, action) => {
      const idx = state.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) state[idx] = action.payload;
    },
    deleteRow: (state, action) => {
      return state.filter(r => r.id !== action.payload);
    },
  },
});

const columnsSlice = createSlice({
  name: 'columns',
  initialState: initialColumns,
  reducers: {
    setColumns: (state, action) => action.payload,
    addColumn: (state, action) => { state.push(action.payload); },
    toggleColumn: (state, action) => {
      const col = state.find(c => c.id === action.payload);
      if (col) col.visible = !col.visible;
    },
    updateColumn: (state, action) => {
      const idx = state.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state[idx] = action.payload;
    },
  },
});

export const { setRows, addRow, updateRow, deleteRow } = rowsSlice.actions;
export const { setColumns, addColumn, toggleColumn, updateColumn } = columnsSlice.actions;

const defaultColumns = [
  { id: 'email', label: 'Email', visible: true },
  { id: 'age', label: 'Age', visible: true },
  { id: 'role', label: 'Role', visible: true },
];

const initialLists = [
  {
    id: nanoid(),
    name: 'Sample List',
    rows: [
      { id: 1, email: 'alice@example.com', age: 25, role: 'Admin' },
      { id: 2, email: 'bob@example.com', age: 30, role: 'User' },
      { id: 3, email: 'charlie@example.com', age: 22, role: 'User' },
    ],
    columns: defaultColumns,
  },
];

// Load from localStorage
function loadState() {
  try {
    const serialized = localStorage.getItem('listsState');
    if (serialized === null) return undefined;
    return { lists: JSON.parse(serialized) };
  } catch {
    return undefined;
  }
}

const listsSlice = createSlice({
  name: 'lists',
  initialState: {
    lists: [
      {
        id: nanoid(),
        name: 'Sample List',
        rows: [
          { id: 1, email: 'alice@example.com', age: 25, role: 'Admin' },
          { id: 2, email: 'bob@example.com', age: 30, role: 'User' },
          { id: 3, email: 'charlie@example.com', age: 22, role: 'User' },
        ],
        columns: [
          { id: 'email', label: 'Email', visible: true },
          { id: 'age', label: 'Age', visible: true },
          { id: 'role', label: 'Role', visible: true },
        ],
      },
    ],
    currentListId: null,
  },
  reducers: {
    addList: {
      reducer(state, action) {
        state.lists.push(action.payload);
      },
      prepare(name, columns = [], rows = []) {
        return {
          payload: {
            id: nanoid(),
            name,
            rows,
            columns,
          },
        };
      },
    },
    setCurrentListId(state, action) {
      state.currentListId = action.payload;
    },
    updateListRows(state, action) {
      const { listId, rows } = action.payload;
      const list = state.lists.find(l => l.id === listId);
      if (list) list.rows = rows;
    },
    updateListColumns(state, action) {
      const { listId, columns } = action.payload;
      const list = state.lists.find(l => l.id === listId);
      if (list) list.columns = columns;
    },
    updateListName(state, action) {
      const { id, name } = action.payload;
      const list = state.lists.find(l => l.id === id);
      if (list) list.name = name;
    },
    deleteList(state, action) {
      const id = action.payload;
      state.lists = state.lists.filter(l => l.id !== id);
      if (state.currentListId === id) state.currentListId = null;
    },
  },
});

export const { addList, setCurrentListId, updateListRows, updateListColumns, updateListName, deleteList } = listsSlice.actions;

const store = configureStore({
  reducer: {
    rows: rowsSlice.reducer,
    columns: columnsSlice.reducer,
    lists: listsSlice.reducer,
  },
  preloadedState: loadState(),
});

// Persist to localStorage on every change
store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem('listsState', JSON.stringify(state.lists));
  } catch {}
});

export default store; 