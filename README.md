# Campus Supply Tracker

A school supplies inventory admin panel built with React + Vite, following the
same layout pattern as the Student Information System reference project
(sidebar + topbar + dark theme panels), but restyled in violet/blue and
reworked for inventory management.

## Getting started

```bash
npm install
npm run dev
```

## Demo admin login

- Username: `admin`
- Password: `admin123`

## Features

- Admin-only login gate (route protection via `RequireAuth`)
- Add / edit / delete supply items
- Search and filter by category
- Automatic low-stock detection and badge/counter
- Reports page with totals, inventory value, and category breakdown
- Admin profile page (name, email, avatar)
- Data persists in `localStorage`, so it survives page refreshes
