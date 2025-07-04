# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Dynamic Data Table Manager

A powerful, user-friendly React app for managing multiple dynamic data tables with import/export, inline editing, column management, and persistent storage.

## Features

- **Multiple Tables (Lists):**
  - Create, rename, and delete any number of tables.
  - Each table is fully independent (columns and data).
- **Add/Edit/Delete Rows:**
  - Inline editing for any row.
  - Add new rows with a dedicated button.
- **Column Management:**
  - Add, show/hide, and reorder columns per table.
  - Columns can be set manually or imported from CSV.
- **Import/Export CSV:**
  - Import data and columns from a CSV file.
  - Export the current table view (visible columns only) to CSV.
- **Sorting & Searching:**
  - Sort any column (ascending/descending) by clicking its header (permanent sort arrow shown).
  - Global search across all visible columns.
- **Pagination:**
  - Client-side pagination (10 rows per page).
- **Theme Toggle:**
  - Switch between light and dark mode.
- **Persistence:**
  - All tables, columns, and data are saved in your browser (localStorage). Refreshing or closing the page will not lose your data.
- **Responsive UI:**
  - Works well on desktop and mobile.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the app:**
   ```bash
   npm start
   # or
   yarn start
   ```

3. **Usage:**
   - On the Welcome Page, click the **+** button to create a new table.
   - You can specify columns manually or import from a CSV file.
   - Click a table name to open and manage it.
   - Use the **+ Add Row** button to add data, or edit/delete as needed.
   - Use the column headers to sort, and the search box to filter.
   - All changes are saved automatically.

## Contact

- **Email:** nishantvidhuir0987@gmail.com
- **Phone:** +91 9871202673

---

Built with React, Redux Toolkit, Material UI, and PapaParse.
