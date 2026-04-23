# Centralized Debate Tournament Management System: Walkthrough

## Overview
I have fully constructed your Centralized Debate Tournament Management System using the **MERN Stack** (MongoDB, Express, React, Node.js). The application ensures high-quality aesthetics, robust routing, complete role-based logic, and advanced matchmaking implementation.

## What Was Completed

### 1. Database Schema
- Built precise schemas for `Users`, `Competitions`, `Matches`, `Results`, and `Issues`.
- Standard references used throughout to ensure normalization.

### 2. Matchmaking Algorithm (`src/utils/matchGenerator.js`)
- **Power Pairing:** Implemented calculation of team scores from past results to pair highest-scoring teams together without re-making duplicates from prior rounds.
- **Byes:** Handles odd amounts by assigning the lowest-performing team a bye exactly once per tournament.
- **Judge Balancing:** Adjudicators are carefully assigned to fulfill `adjudicatorsPerMatch` parameters, cascading extra judges downwards to priority matchups!

### 3. Dedicated Role Dashboards
- Multi-dimensional React app built strictly targeting three personas:
  1. **OC Dashboard:** Where an organizer controls the entire operation, approves users, checks team statuses, hits "Generate New Round," and sees live tournament flow graphs.
  2. **Team Dashboard:** Displays whether a team's check-in parameter is missing and what tournament rounds they are a part of.
  3. **Adjudicator Dashboard:** Clean interface exactly like Teams but targeted for scoring match workflows.

### 4. Auth & Security Flows
- Used bcrypt hashing and JWT.
- Handled the edge-case: **First User Creation:** When testing locally, the **very first user** you create is given automatic approval and OC powers, so you don't get locked out of making tournaments!
- Following that, all other incoming sign-ups will show pending state until approved.

## Running the Application

### Backend Setup
1. Ensure your local `MongoDB` instance is actively running.
2. Open a terminal at `d:/College/sem-4/pbls/swe/backend`.
3. Run `npm run dev` (Starts locally on Port 5000).

### Frontend Setup
1. Open a terminal at `d:/College/sem-4/pbls/swe/frontend`.
2. Run `npm run dev` (Starts Vite locally).

### Verification Steps
1. Navigate directly to `http://localhost:5173`.
2. Register an account acting as the OC (Admin). This gives you superuser powers to start configuring immediately!
3. Pre-create dummy Teams and Adjudicator accounts and simulate round generation!
