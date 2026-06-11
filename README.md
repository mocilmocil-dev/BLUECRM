# BLUECRM 🚗

BLUECRM is a comprehensive, centralized Customer Relationship Management (CRM) platform specifically built to manage vehicle rental, leasing, and fleet operations. It streamlines workflows between Sales, Managers, and General Managers (GM) by tracking deals, fleet units, drivers, and revenue targets in real-time.

---

## Features at a Glance

- **Pipeline Management:** Track deals across different stages (Prospecting, Negotiation, Won, Lost) with robust searching and sorting.
- **Client Management:** Manage company profiles, unlimited Points of Contact (PIC), and view their real-time active pipelines.
- **Unit & Fleet Management:** Track vehicle inventories, locations, operational statuses, and manage fulfillment assignments for Won deals.
- **Driver Management:** Track driver availability, pool locations, and assign them directly to active company contracts.
- **Target Tracking:** Set and monitor sales quotas, and view actual performance against designated targets.
- **Role-Based Access Control (RBAC):** Differentiated views and capabilities specifically tuned for Sales, Pool, Manager, and GM roles.

## Tech Stack Overview

- **Frontend:** React 18 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Firebase Cloud Firestore (NoSQL)
- **Auth:** Firebase Authentication

## Setup Instructions

1. Ensure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Firebase project configuration credentials.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. To build for production, run:
   ```bash
   npm run build
   ```
