# iBarangay - Citizen Services Platform

Multi-barangay citizen services platform built with React, Node.js/Express, and MySQL.

## Project Structure

```
iBarangay/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── css/               # Component and page styles
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── assets/            # Images, fonts, static files
│   ├── database/          # Database files
│   ├── _archive/          # Archived/backup code
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── server/                # Backend Node.js/Express server
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
├── public/                # Static public files
├── documentation/         # Project documentation guides
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
├── package.json           # Frontend dependencies
└── README.md              # This file
```

## Features

- Super Admin Dashboard
- Admin Registration & Management
- User Profile Management
- Document Requests
- Citizen Concerns Tracking
- Post Management (News, Events, Announcements)
- Weather Widget
- Emergency Response
- Activity Logging
- Multi-barangay Support

## Tech Stack

- **Frontend**: React, Hooks, CSS3
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Installation

1. Clone repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

4. Configure database:
   - Update `.env` file in server directory
   - Create MySQL database and tables

5. Start development:
   ```bash
   npm run dev      # Frontend
   npm run nodemon  # Backend (from server directory)
   ```

## Code Quality

- All comments have been removed from production code
- Components follow consistent naming conventions
- Files organized by function and responsibility
- Code documentation available in `/documentation`

## Documentation

See `/documentation` folder for detailed guides:
- 00_START_HERE.md
- DESIGN_CONSISTENCY_GUIDE.md
- QUICK_REFERENCE.md
- NIELSEN_PERFECTION_GUIDE.md

## License

Proprietary - iBarangay Project
