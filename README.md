# Centralized Debate Tournament Management System

This repository contains the complete MERN stack application for the Centralized Debate Tournament Management System.

## Features Let's you

* **Authentication:** JWT-based login and Role-based access control (OC, Team, Adjudicator).
* **Workflows:** OC creates competitions, Teams/Adjudicators register, OC approves users.
* **Match Generation:** Automated power-pairing, ensuring team byes, adjudicator distribution, and no double match-ups.
* **Dashboards:** Segmented views giving complete context depending on user role.
* **Premium UI:** Powered by React + TailwindCSS for a highly responsive, glassmorphic UI.

## File Structure

- `/backend` - Node.js Express server.
  - `src/models` - Mongoose schemas.
  - `src/controllers` - Business logic.
  - `src/routes` - API routes.
- `/frontend` - React + Vite frontend.
  - `src/components` - UI components.
  - `src/pages` - Views/Dashboards.
  - `src/context` - React Auth context.

## Running Locally

1. **Database:** Ensure MongoDB is running on your machine (default `mongodb://127.0.0.1:27017`).
2. **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   (Runs on http://localhost:5000)
3. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   (Runs on http://localhost:5173 - standard Vite port).

## First Time Setup Important Note

When registering the very first user, the system automatically assigns them the **"OC" (Organizing Committee)** role and inherently approves them. Subsequent users will be marked as "pending" and require approval from the OC dashboard.
