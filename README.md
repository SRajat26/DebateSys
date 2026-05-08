<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

# 🏆 Centralized Debate Tournament Management System

> A full-stack web application that automates the entire lifecycle of competitive debate tournaments — from registration and check-ins, through intelligent power-pairing match generation, to real-time result tracking and leaderboards.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [User Roles & Workflows](#-user-roles--workflows)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

Managing debate tournaments manually involves spreadsheets, ad-hoc messaging, and hours of coordination. This system replaces all of that with a **single, role-aware platform** where:

- The **Organizing Committee (OC)** creates tournaments, approves participants, generates round matchups, and resolves issues.
- **Teams** register, check in, view their draw, and rate adjudicators after each round.
- **Adjudicators** see their assigned matches, submit scored ballots, and receive performance feedback.

The power-pairing engine ensures fair matchups by ranking teams on cumulative scores and preventing repeat pairings, while adjudicators are distributed by their average ratings so the best judges oversee the most competitive matches.

---

## ✨ Key Features

| Category | Feature |
|---|---|
| **Authentication** | JWT-based auth with bcrypt password hashing and role-based access control |
| **Role System** | Three distinct roles — OC, Team, Adjudicator — each with a dedicated dashboard |
| **Competition Management** | Create tournaments with configurable rounds, team sizes, venues, and adjudicator-per-match settings |
| **Registration Pipeline** | Multi-stage flow: Register → OC Approval → Check-In → Ready to Compete |
| **Power-Pairing Engine** | Automated match generation with cumulative-score ranking, duplicate-matchup avoidance, and BYE handling for odd team counts |
| **Adjudicator Distribution** | Intelligent allocation sorted by average team-ratings — top-rated judges assigned to top-bracket matches |
| **Ballot Submission** | Adjudicators submit scored results (67–81 range) with winner selection and feedback |
| **Adjudicator Ratings** | Teams rate adjudicators (0–10 scale) after each round; ratings influence future allocations |
| **Leaderboards** | Live team standings (wins → total score) and adjudicator performance rankings |
| **Issue Reporting** | Teams raise match issues in real-time; OC reviews and resolves from their dashboard |
| **Round Controls** | OC can toggle round visibility (open/closed) and force-advance rounds when ratings are incomplete |
| **Glassmorphic UI** | Premium, responsive React interface with gradient accents, animations, and dark-mode-ready styling |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI library |
| **Vite 8** | Lightning-fast dev server & build tool |
| **React Router 7** | Client-side routing with protected routes |
| **TailwindCSS 3** | Utility-first CSS framework |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Modern icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web application framework |
| **Mongoose 9** | MongoDB ODM with schema validation |
| **JSON Web Tokens** | Stateless authentication |
| **bcrypt** | Password hashing |
| **Helmet** | HTTP security headers |
| **Morgan** | Request logging middleware |
| **CORS** | Cross-Origin Resource Sharing |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database (local or Atlas) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React + Vite (port 5173)             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ AuthCtx  │ │  Router  │ │   Role Dashboards │  │  │
│  │  │ Provider │ │  Guards  │ │  OC│Team│Adjudicator│ │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ Axios (HTTP/JSON)              │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│               Express Server (port 5000)                │
│  ┌──────────┐ ┌────────┴────────┐ ┌──────────────────┐  │
│  │  Auth    │ │   Controllers   │ │  Middleware       │  │
│  │  Routes  │ │  (Business      │ │  • JWT Verify     │  │
│  │          │ │   Logic)        │ │  • Role Check     │  │
│  │  Comp.   │ │  ┌────────────┐ │ │  • Helmet/CORS   │  │
│  │  Routes  │ │  │   Match    │ │ │  • Morgan Logger  │  │
│  │          │ │  │  Generator │ │ └──────────────────┘  │
│  │  Match   │ │  │  (Power-   │ │                       │
│  │  Routes  │ │  │  Pairing)  │ │                       │
│  │          │ │  └────────────┘ │                       │
│  │  Result  │ └─────────────────┘                       │
│  │  Routes  │                                           │
│  │          │                                           │
│  │  Issue   │                                           │
│  │  Routes  │                                           │
│  └──────────┘                                           │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │ Mongoose ODM
┌─────────────────────────┼───────────────────────────────┐
│                    MongoDB Database                     │
│  ┌─────────┐ ┌──────────────┐ ┌───────┐ ┌───────────┐  │
│  │  Users  │ │ Competitions │ │Matches│ │  Results  │  │
│  └─────────┘ └──────────────┘ └───────┘ └───────────┘  │
│  ┌─────────┐                                            │
│  │ Issues  │                                            │
│  └─────────┘                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
swe/
├── backend/
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── src/
│       ├── server.js                 # Express app entry point
│       ├── config/
│       │   └── db.js                 # MongoDB connection
│       ├── middleware/
│       │   └── authMiddleware.js     # JWT verification & role guards
│       ├── models/
│       │   ├── User.js               # User schema (OC, Team, Adjudicator)
│       │   ├── Competition.js        # Tournament configuration & participants
│       │   ├── Match.js              # Individual match records
│       │   ├── Result.js             # Ballot scores & adjudicator ratings
│       │   └── Issue.js              # Team-reported issues
│       ├── controllers/
│       │   ├── authController.js     # Register, login, profile
│       │   ├── competitionController.js  # CRUD, registration, approval, check-in
│       │   ├── matchController.js    # Match generation & retrieval
│       │   ├── resultController.js   # Ballot submission, ratings, leaderboards
│       │   └── issueController.js    # Issue reporting & resolution
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── competitionRoutes.js
│       │   ├── matchRoutes.js
│       │   ├── matchActionRoutes.js
│       │   ├── resultRoutes.js
│       │   └── issueRoutes.js
│       └── utils/
│           ├── generateToken.js      # JWT token generation
│           └── matchGenerator.js     # Power-pairing algorithm
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Root component with routing
│       ├── App.css                   # Global styles
│       ├── index.css                 # Tailwind directives
│       ├── context/
│       │   └── AuthContext.jsx       # Authentication state provider
│       ├── components/
│       │   └── Navbar.jsx            # Navigation bar
│       ├── pages/
│       │   ├── HomePage.jsx          # Landing page
│       │   ├── LoginPage.jsx         # Login form
│       │   ├── RegisterPage.jsx      # Registration (role selection + team members)
│       │   ├── DashboardRouter.jsx   # Role-based dashboard routing
│       │   └── dashboards/
│       │       ├── OCDashboard.jsx          # OC management panel
│       │       ├── TeamDashboard.jsx        # Team view & actions
│       │       └── AdjudicatorDashboard.jsx # Adjudicator view & scoring
│       └── services/
│           └── api.js                # Axios instance configuration
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — either a local instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SRajat26/DebateSys.git
cd DebateSys

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/debate_tournament
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
```

### Running the Application

Open **two terminal windows**:

```bash
# Terminal 1 — Start the backend server
cd backend
npm run dev
# ✅ Server running on http://localhost:5000
```

```bash
# Terminal 2 — Start the frontend dev server
cd frontend
npm run dev
# ✅ App running on http://localhost:5173
```

### ⚡ First-Time Setup

> **Important:** The very first user to register is automatically assigned the **OC (Organizing Committee)** role and is auto-approved. All subsequent users register as **Team** or **Adjudicator** and must be approved by the OC from their dashboard.

---

## 🔐 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/debate_tournament` |
| `JWT_SECRET` | Secret key for signing JWT tokens | — (required) |
| `NODE_ENV` | Environment mode | `development` |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user (first user becomes OC) |
| `POST` | `/auth/login` | Public | Login and receive JWT token |
| `GET` | `/auth/me` | Private | Get current user profile |

### Competitions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/competitions` | Public | List all competitions |
| `GET` | `/competitions/:id` | Public | Get competition details (with populated participants) |
| `POST` | `/competitions` | OC | Create a new competition |
| `DELETE` | `/competitions/:id` | OC | Delete competition and all associated data |
| `PUT` | `/competitions/:id/register` | Team/Adjudicator | Register for a competition (goes to pending) |
| `PUT` | `/competitions/:id/approve/:userId` | OC | Approve a pending participant |
| `PUT` | `/competitions/:id/reject/:userId` | OC | Reject a pending participant |
| `PUT` | `/competitions/:id/checkin` | Approved User | Check in to the competition |

### Matches

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/competitions/:id/generate` | OC | Generate next round matches (power-pairing) |
| `GET` | `/competitions/:id/matches` | Public | Get all matches for a competition |

### Results

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/matches/:id/result` | Adjudicator | Submit ballot (scores 67–81, winner, feedback) |
| `PUT` | `/results/:id/rate` | Team | Rate an adjudicator (0–10 scale) |
| `GET` | `/results/leaderboard/:competitionId` | Public | Team leaderboard (wins → total score) |
| `GET` | `/results/adjudicator-leaderboard/:competitionId` | Public | Adjudicator rankings by avg rating |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/issues` | Team | Report a match issue |
| `GET` | `/issues/:competitionId` | OC | Get all issues for a competition |
| `PUT` | `/issues/:id/resolve` | OC | Resolve an issue |

---

## 🗃 Data Models

### User
```
{
  name:        String (required)
  email:       String (required, unique)
  password:    String (hashed with bcrypt)
  role:        "User" | "OC" | "Adjudicator" | "Team"
  status:      "pending" | "approved" | "rejected"
  teamMembers: [String]           // only for Teams
  timestamps:  createdAt, updatedAt
}
```

### Competition
```
{
  name:                  String
  totalRounds:           Number
  currentRound:          Number (0 = not started)
  roundStatus:           "open" | "closed"
  teamSize:              Number
  adjudicatorsPerMatch:  Number
  venues:                [String]
  ocMembers:             [→ User]
  pendingTeams:          [→ User]
  pendingAdjudicators:   [→ User]
  approvedTeams:         [→ User]
  approvedAdjudicators:  [→ User]
  checkedInTeams:        [→ User]
  checkedInAdjudicators: [→ User]
  status:                "registration" | "ongoing" | "completed"
}
```

### Match
```
{
  competition: → Competition
  roundNumber: Number
  teamA:       → User
  teamB:       → User (null for BYE)
  isBye:       Boolean
  adjudicators:[→ User]
  venue:       String
  ocRunner:    → User
  status:      "pending" | "completed" | "issue_raised"
}
```

### Result
```
{
  match:              → Match
  competition:        → Competition
  roundNumber:        Number
  submittedBy:        → User (Adjudicator)
  winningTeam:        → User (null for draw)
  teamAScore:         Number (67–81)
  teamBScore:         Number (67–81)
  feedback:           String
  adjudicatorRatings: [{
    adjudicator: → User,
    team:        → User,
    rating:      Number (0–10)
  }]
}
```

### Issue
```
{
  raisedBy:    → User
  match:       → Match
  description: String
  status:      "open" | "resolved"
  resolution:  String
  resolvedBy:  → User (OC)
}
```

---

## 👥 User Roles & Workflows

### 🟦 Organizing Committee (OC)

```
Create Competition → Review Registrations → Approve/Reject Participants
                                ↓
      Monitor Check-Ins → Generate Round Matches → Track Results
                                ↓
      Resolve Issues → View Leaderboards → Complete Tournament
```

- Creates and configures tournaments (rounds, venues, team size, adjudicators per match)
- Approves or rejects team and adjudicator registrations
- Generates round draws using the power-pairing algorithm
- Can force-advance rounds when adjudicator ratings are incomplete
- Reviews and resolves issues raised by teams
- Monitors team and adjudicator leaderboards

### 🟩 Team

```
Register → Wait for OC Approval → Check In → View Draw
                                        ↓
                   Compete → Rate Adjudicators → View Standings
                                        ↓
                        Report Issues (if needed)
```

- Registers for competitions with team member names
- Checks in once approved by the OC
- Views match details (opponent, venue, adjudicator, OC runner)
- Rates adjudicators after each round (0–10 scale)
- Reports match-related issues to the OC
- Views team leaderboard and standings

### 🟨 Adjudicator

```
Register → Wait for OC Approval → Check In → View Assigned Matches
                                        ↓
                     Judge Match → Submit Ballot (67–81 scores)
                                        ↓
                         View Own Performance Ratings
```

- Registers for competitions as an adjudicator
- Views assigned matches with venue and team details
- Submits scored ballots with winner declaration and optional feedback
- Score validation enforced (67–81 range)
- Sees their average rating from team feedback

---

## 🧠 Power-Pairing Algorithm

The match generation engine implements a Swiss-system-style pairing:

1. **Score Aggregation** — Teams are ranked by cumulative scores across all previous rounds
2. **Power-Pairing** — Top-ranked teams face each other, working down the standings
3. **Duplicate Prevention** — Teams that have already faced each other are skipped in favor of the next eligible opponent
4. **BYE Handling** — If the team count is odd, the lowest-ranked team receives a BYE (auto-completed)
5. **Adjudicator Distribution** — Adjudicators are sorted by their average rating and distributed across matches, with highest-rated judges assigned to top-bracket games
6. **Venue & OC Runner Assignment** — Venues and OC members are assigned in round-robin fashion

---

## 🖼 Screenshots

> _Screenshots can be added here by running the application and capturing the key views:_
> - Landing Page
> - OC Dashboard (Competition management, approval panel, match generation)
> - Team Dashboard (Draw view, adjudicator rating, issue reporting)
> - Adjudicator Dashboard (Match assignment, ballot submission)
> - Leaderboard views

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the competitive debate community
</p>
