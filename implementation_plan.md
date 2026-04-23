# Centralized Debate Tournament Management System

This document outlines the architecture and implementation plan for the complete, production-ready MERN stack web application to manage debate tournaments.

## User Review Required
> [!WARNING]
> Before I proceed with full execution, please review the architecture and answer the open questions below (especially regarding the Tailwind CSS version!).

## Proposed Architecture

### 1. Backend (`/backend`)
**Tech Stack:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt.

**Folder Structure:**
- `src/config/`: Database connection and environment config.
- `src/models/`: Mongoose schemas (User, Competition, Team, Match, Result, Issue, Notification).
- `src/controllers/`: Business logic for API endpoints.
- `src/routes/`: Express route definitions.
- `src/middleware/`: Auth and role-validation middleware.
- `src/utils/`: Helper functions (e.g., match pairing algorithm).

**Core Logic (Match Generation):**
The match generation will be implemented as a utility function that:
1. Retrieves all checked-in teams and adjudicators.
2. Handles odd numbers by assigning "Byes" based on lowest previous scores (or randomly for Round 1).
3. Pairs teams, avoiding rematches from previous rounds.
4. Assigns minimum required adjudicators to each match.
5. Distributes venues and OC runners iteratively.

### 2. Frontend (`/frontend`)
**Tech Stack:** React.js (Vite), React Router, Axios, Context API.

**Design Aesthetics (Premium UI):**
- Modern typography (Inter or Poppins).
- Glassmorphism effects for dashboards.
- Dynamic color palettes (e.g., Slate/Indigo themes for professional look).
- Micro-animations for buttons, cards, and modal transitions.

**Folder Structure:**
- `src/components/`: Reusable UI elements (Buttons, Inputs, Modals, Navbar).
- `src/pages/`: Role-based dashbaords and main views.
- `src/context/`: Auth and application state context.
- `src/services/`: Axios API clients grouped by resource.

## Proposed Changes

### [Backend]
- Scaffold Node/Express server.
- Define Database Schemas (Mongoose).
- Implement Authentication & Authorization.
- Implement Competition & Registration API.
- Implement Match Pairing Logic.
- Implement Issues, Results, and Notifications API.

### [Frontend]
- Scaffold Vite React app.
- Configure Tailwind CSS.
- Build Authentication flows.
- Build Dashboards (Admin/OC, User, Adjudicator).
- Build Match Check-in & Pairing visualizers.

## Open Questions

> [!IMPORTANT]
> 1. **Tailwind CSS Version:** You requested Tailwind CSS. I have strict instructions to confirm which version of Tailwind CSS to use when requested. Would you prefer **Tailwind v3** (widely stable and heavily documented) or the newer **Tailwind v4**?
> 2. **Authentication Flow:** Should user creation for Adjudicators/Teams happen purely via open registration, or does the OC need to pre-invite them?
> 3. **Match Pairing:** If there aren't enough adjudicators to satisfy the "required adjudicators per match", should the system block generation, or distribute them as evenly as possible (e.g., some matches get fewer adjudicators)?

## Verification Plan

### Manual Verification
1. I will set up the backend server and ensure all APIs pass initial tests.
2. I will build the React frontend and link it to the API.
3. We will run both locally. You will be able to log in as an OC, create a competition, register dummy teams/adjudicators, and trigger a match generation to see the algorithm in action on the UI.
