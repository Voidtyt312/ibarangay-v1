# iBarangay - Citizen Services Platform

Multi-barangay citizen services platform built with React, Node.js/Express, and MySQL.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [User Navigation Guide](#user-navigation-guide)
4. [Admin Navigation Guide](#admin-navigation-guide)
5. [Project Structure](#project-structure)
6. [Features](#features)
7. [Tech Stack](#tech-stack)

---

## Project Overview

iBarangay is a comprehensive citizen services platform that enables:
- Citizens to request barangay documents and submit concerns
- Admins to manage document requests and track citizen concerns
- Super admins to oversee multiple barangays and manage administrators

---

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
   - Create MySQL database and tables the database sql is in the src/database/ibarangay.sql import it to your xampp

5. Start development:
   ```bash
   npm run dev # Frontend

   cd server # change directory to the server
   npm start # run the backend server
   ```

---
# Click login it will pop up login as user and login as admin choose the User if you are a citizen.

## User Navigation Guide

### 1. **Login / Register**

**Steps to Access:**
- Open the application homepage
- If no account exists, click "Register" to create a new citizen account
- Enter your personal information (Name, Email, Password, Barangay)
- Click "Sign Up"

**Sample:**
```
Login Page
├── Email: juan.dela.cruz@email.com
├── Password: SecurePassword123!
└── Barangay: San Vicente
```

---

### 2. **Home / Newsfeed**

**Steps to Access:**
1. Log in successfully
2. You'll be redirected to the Home/Newsfeed page automatically

**What You Can Do:**
- View barangay announcements, news, and events
- See weather widget for your barangay
- Browse recent posts from your barangay admin

**Sample Page Content:**
```
Home Page
├── Announcements
│   ├── "Christmas Celebration 2024 - December 20"
│   └── "Barangay Health Drive - Next Saturday"
├── News
│   ├── "Infrastructure Project Update"
│   └── "New Business Permits Application"
└── Weather Widget
    └── Temperature: 28°C, Humidity: 75%
```

---

### 3. **Document Requests**

**Steps to Access:**
1. Click the "Document Requests" option in the sidebar
2. Two tabs appear: "New Request" and "My Request"

#### A. **Submit a New Document Request**

**Tab: New Request**

**Steps:**
1. Click the "New Request" tab
2. Select a document type (e.g., "Barangay Clearance", "Residency Certificate")
3. Enter the purpose (e.g., "For Employment", "School Enrollment")
4. Upload your Valid ID (Front and Back or single file)
5. Click "Submit Request"

**Sample Request:**
```
Document Type: Barangay Clearance
Purpose: For employment at XYZ Company
Valid ID: Upload ID image (JPG/PNG, max 5MB)
```

**Processing Information:**
- Processing time: 1-3 business days
- Pickup at Barangay Hall during office hours
- Bring valid ID and reference number
- Processing fee may apply upon pickup

#### B. **View Your Active Requests**

**Tab: My Request**

**Steps:**
1. Click the "My Request" tab
2. View all your active document requests (Pending, Approved, Ready)
3. Check the status of each request

**Sample Request Card:**
```
Request Card
├── Document Type: Barangay Certificate
├── Reference No: REQ-2024-001
├── Purpose: School Enrollment
├── Request Date: December 1, 2024
├── Status: Ready (Ready for Pickup icon shown)
└── [Can be picked up at barangay hall]
```

**Note:** Completed (Done) and Cancelled requests appear in History tab instead.

---

### 4. **Submit Concerns**

**Steps to Access:**
1. Click the "Submit Concerns" option in the sidebar
2. Two tabs appear: "Submit New Concern" and "My Concerns"

#### A. **Submit a New Concern**

**Tab: Submit New Concern**

**Steps:**
1. Click the "Submit New Concern" tab
2. Select concern type (Infrastructure, Sanitation, Security, Health, Environment, Other)
3. If "Other", specify the type
4. Write description with location and details
5. Optionally attach image/evidence (PNG, JPG, PDF, max 5MB)
6. Click "Submit Concern"

**Sample Concern:**
```
Concern Type: Infrastructure
Description: Pothole on Maple Street near the community center 
             causing traffic hazards. Needs immediate repair.
Attachments: damage-photo.jpg
Contact: 09123456789
```

**Guidelines:**
- Be specific and provide accurate information
- Include photos or evidence if available
- Concerns will be reviewed within 24-48 hours
- You will receive updates on your concern status
- For emergencies, call: (+63) 123-4567

#### B. **View Your Active Concerns**

**Tab: My Concerns**

**Steps:**
1. Click the "My Concerns" tab
2. View all your active concerns (Pending, In Progress)
3. Click on any concern to view details and admin remarks

**Sample Concern in List:**
```
Concern Card
├── Reference No: CON-2024-005
├── Category: Sanitation
├── Description: Illegal dumping site near residential area
├── Submitted: November 28, 2024
├── Last Update: November 30, 2024
├── Status: In Progress ⚠️
└── 3 messages
```

**Viewing Concern Details:**
1. Click on a concern card
2. See full description and admin remarks
3. Reply to admin (limited to 3 replies max)
4. Admin can send updates anytime

**Sample Detail View:**
```
Concern Details
├── Reference: CON-2024-005
├── Status: In Progress
├── Your Message: "Illegal dumping site..."
├── Admin Reply: "Team dispatched on Nov 29. Cleanup in progress."
├── Your Reply: "Thank you for the quick response"
└── [Reply Text Area - 2 replies remaining]
```

**Note:** Resolved and Cancelled concerns appear in History tab instead.

---

### 5. **Emergency Response**

**Steps to Access:**
1. Click the "Emergency" option in the sidebar

**What You Can Do:**
- Access emergency contact numbers
- Report immediate safety concerns
- Get quick response from barangay authorities

**Sample Emergency Numbers:**
```
Emergency Contacts
├── Police: 911
├── Fire: 342-5000
├── Medical: 117
├── Barangay Patrol Unit: (63) 555-0123
└── Emergency Hotline: 1-888-BARANGAY
```

---

### 6. **User Profile**

**Steps to Access:**
1. Click the "Profile" option in the sidebar or click your name/avatar

**What You Can Do:**
- View your personal information
- Update your profile details
- Change password
- Manage notification preferences

**Sample Profile Information:**
```
User Profile
├── Full Name: Juan Dela Cruz
├── Email: juan.dela.cruz@email.com
├── Contact Number: 09123456789
├── Barangay: San Vicente
├── Address: 123 Maple Street, San Vicente
├── Date Joined: January 15, 2024
└── Account Status: Active
```

---

### 7. **History**

**Steps to Access:**
1. Click the "History" option in the sidebar

**What You Can See:**
- All completed document requests (Done, Cancelled)
- All resolved or cancelled concerns (Resolved, Cancelled)

**Sample History Page:**
```
History
├── Requests Tab (Completed Requests)
│   ├── REQ-2024-001: Barangay Clearance - Done (March 1, 2024)
│   └── REQ-2024-002: Residency Certificate - Cancelled (Feb 15, 2024)
│
└── Concerns Tab (Resolved Concerns)
    ├── CON-2024-001: Street Repair - Resolved (Jan 30, 2024)
    └── CON-2024-002: Drainage Issue - Cancelled (Jan 20, 2024)
```

---

## Admin Navigation Guide

### 1. **Admin Login**

**Steps to Access:**
1. Go to login page
2. Select "Login as Admin" option
3. Enter admin email and password
4. Click "Sign In"

**Sample Admin Credentials:**
```
Email: admin.barangay@email.com
Password: AdminPassword123!
Barangay: San Vicente
```

---

### 2. **Dashboard / Statistics**

**Steps to Access:**
1. After login, admin lands on Statistics/Dashboard page
2. Sidebar shows admin options

**What You Can See:**
- Total document requests (Pending, Approved, Ready, Done, Cancelled)
- Total concerns (New, In Progress, Resolved, Cancelled)
- Recent activities
- Barangay information

**Sample Dashboard:**
```
Admin Dashboard - San Vicente Barangay
├── Statistics Cards
│   ├── Total Requests: 45 (Pending: 8)
│   ├── Total Concerns: 23 (In Progress: 5)
│   ├── Users: 342
│   └── Active Posts: 12
│
└── Recent Activities
    ├── New request from Maria Santos
    └── Concern marked as Resolved
```

---

### 3. **Manage Requests**

**Steps to Access:**
1. Click "Manage Requests" in the sidebar

**What You Can Do:**
- View all pending, approved, and ready requests (excludes Done/Cancelled)
- Search by Request ID or Document Type
- Approve or process requests
- Mark requests as Ready for Pickup or Done
- Cancel requests if necessary

**Steps to Manage a Request:**

1. **View Request List:**
   - Search for specific requests using search bar
   - Click on request to view details

2. **View Request Details:**
   ```
   Request Details
   ├── Request ID: REQ-2024-015
   ├── Document Type: Barangay Clearance
   ├── Purpose: Employment
   ├── Status: Pending
   ├── Request Date: December 1, 2024
   └── Citizen ID: Valid ID [Preview]
   ```

3. **Process Request (Action Buttons):**
   - **Approve** → Changes status to "Approved"
   - **Ready to Pickup** → Changes status to "Ready" (only if Approved)
   - **Done** → Marks request as completed (only if Ready)
   - **Cancel** → Cancels the request

**Sample Request Processing Flow:**
```
Request Processing Flow
├── Initial: Pending
│   └── Click "Approve" → Changes to Approved
│
├── When Approved
│   └── Click "Ready to Pickup" → Changes to Ready
│
├── When Ready
│   └── Click "Done" → Changes to Done & moves to History
│
└── At Any Time (if not Done/Cancelled)
    └── Click "Cancel" → Changes to Cancelled & moves to History
```

---

### 4. **Manage Concerns**

**Steps to Access:**
1. Click "Manage Concerns" in the sidebar

**What You Can Do:**
- View all active citizen concerns (New, In Progress - excludes Resolved/Cancelled)
- Search by Concern ID or Citizen User ID
- Send replies to citizens
- Mark concerns as Resolved

**Steps to Manage a Concern:**

1. **View Concerns List:**
   - Search for specific concerns using search bar
   - Click on concern to view full conversation

2. **View Concern Details:**
   ```
   Concern Details
   ├── Concern ID: CON-2024-015
   ├── Type: Infrastructure
   ├── Description: Broken streetlight on Main Avenue
   ├── Status: In Progress
   ├── Submitted: December 2, 2024
   │
   └── Conversation Thread
       ├── Citizen: "There's a broken streetlight..."
       └── Admin (if replied): "We've scheduled repair..."
   ```

3. **Send Reply to Citizen:**
   - Type response in "Compose reply" text area
   - Click send button
   - Status automatically changes to "In Progress"

4. **Resolve Concern:**
   - Click "Mark as Resolved" button
   - Concern moves to History

**Sample Concern Management:**
```
Concern Processing
├── New Concern Received
│   └── Read and assess the concern
│
├── Send Initial Reply
│   ├── Text: "We're investigating this issue. Team will visit site on..."
│   └── Status changes to: In Progress
│
├── Send Follow-up Updates
│   ├── Text: "Repair completed on December 5, 2024"
│   └── Status remains: In Progress
│
└── Mark as Resolved
    └── Status changes to: Resolved & moves to History
```

---

### 5. **Create/Post Content**

**Steps to Access:**
1. Click "Post" or "Create Post" in the sidebar

**What You Can Do:**
- Create announcements, news, events
- Upload images
- Publish to citizen newsfeed
- Edit or delete posts

**Steps to Create a Post:**

1. Click "New Post" button
2. Select post type (Announcement, News, Event)
3. Enter title and content
4. Upload featured image (optional)
5. Click "Publish"

**Sample Post:**
```
Create New Post
├── Type: Announcement
├── Title: "Year-End Community Celebration"
├── Content: "Join us for the annual year-end celebration..."
├── Image: event-photo.jpg
├── Publish Date: December 20, 2024
└── [Publish Button]
```

---

### 6. **History**

**Steps to Access:**
1. Click "History" in the sidebar

**What You Can See:**
- All completed document requests (Done, Cancelled)
- All resolved or cancelled concerns (Resolved, Cancelled)
- Search and filter options

**Sample History:**
```
Admin History
├── Requests Tab
│   ├── REQ-2024-001: Done on March 1, 2024
│   └── REQ-2024-002: Cancelled on Feb 15, 2024
│
└── Concerns Tab
    ├── CON-2024-001: Resolved on Jan 30, 2024
    └── CON-2024-002: Cancelled on Jan 20, 2024
```

---

## User Request Status Flowchart

```
Request Lifecycle
├── Pending (Initial state)
│   └── Admin reviews → Approve or Cancel
│
├── Approved (After admin approval)
│   ├── Admin marks as ready → Ready for Pickup
│   └── Can be cancelled
│
├── Ready (Ready for pickup)
│   ├── Citizen picks up document
│   ├── Admin marks as → Done
│   └── Can be cancelled
│
├── Done ✓
│   └── Request complete (Moves to History)
│
└── Cancelled ✗
    └── Request cancelled (Moves to History)
```

---

## Citizen Concern Status Flowchart

```
Concern Lifecycle
├── Pending (Initial state)
│   └── Admin reviews and replies
│
├── In Progress (Admin sending updates)
│   ├── Admin sends replies
│   ├── Citizen can reply (max 3 replies)
│   └── Admin continues addressing concern
│
├── Resolved ✓
│   └── Concern addressed (Moves to History)
│
└── Cancelled ✗
    └── Concern cancelled (Moves to History)
```

---

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

---

## Features

- **Citizen Features:**
  - User registration and profile management
  - Document request submission and tracking
  - Concern submission and status tracking
  - View announcements and news
  - Emergency contact information
  - Request and concern history

- **Admin Features:**
  - Manage document requests (approve, ready, done, cancel)
  - Manage citizen concerns (reply, resolve)
  - Create and publish posts
  - View statistics and analytics
  - Manage users within barangay
  - Track request and concern history

- **Super Admin Features:**
  - Manage multiple barangays
  - Register and manage admins
  - View system-wide statistics
  - Access all barangay data

- **Platform Features:**
  - Multi-barangay support
  - Real-time status updates
  - Search and filter functionality
  - Activity logging
  - Weather widget
  - Responsive design

---

## Tech Stack

- **Frontend**: React, Hooks, CSS3
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Build Tool**: Vite

---

## Code Quality

- Consistent naming conventions
- Files organized by function and responsibility

---

## License

Proprietary - iBarangay Project by Z
