
## 4. Class Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                              User                                     │
├──────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                        │
│ name: String                                                         │
│ email: String (unique)                                               │
│ password: String (bcrypt hashed)                                     │
│ role: Enum["User","OC","Adjudicator","Team"]                        │
│ status: Enum["pending","approved","rejected"]                        │
│ teamMembers: [String]                                                │
│ createdAt: Date                                                      │
│ updatedAt: Date                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ + matchPassword(password): Boolean                                   │
│ + pre("save"): hash password on change                              │
└──────────────────────────────────────────────────────────────────────┘
                 ▲                    ▲                   ▲
                 │ role=OC            │ role=Team         │ role=Adjudicator
                 │                    │                   │
┌────────────────────────────────────────────────────────────────────┐
│                           Competition                               │
├────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                      │
│ name: String                                                       │
│ totalRounds: Number                                                │
│ currentRound: Number                                               │
│ roundStatus: Enum["open","closed"]                                 │
│ teamSize: Number                                                   │
│ adjudicatorsPerMatch: Number                                       │
│ venues: [String]                                                   │
│ ocMembers: [ObjectId → User]                                       │
│ pendingTeams: [ObjectId → User]                                    │
│ pendingAdjudicators: [ObjectId → User]                             │
│ approvedTeams: [ObjectId → User]                                   │
│ approvedAdjudicators: [ObjectId → User]                            │
│ checkedInTeams: [ObjectId → User]                                  │
│ checkedInAdjudicators: [ObjectId → User]                           │
│ status: Enum["registration","ongoing","completed"]                 │
└────────────────────────────────────────────────────────────────────┘
                              │ 1
                              │ has many
                              ▼ *
┌────────────────────────────────────────────────────────────────────┐
│                              Match                                  │
├────────────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                      │
│ competition: ObjectId → Competition                                │
│ roundNumber: Number                                                │
│ teamA: ObjectId → User (Team)                                      │
│ teamB: ObjectId → User (Team) [nullable - BYE]                     │
│ isBye: Boolean                                                     │
│ adjudicators: [ObjectId → User (Adjudicator)]                      │
│ venue: String                                                      │
│ ocRunner: ObjectId → User (OC)                                     │
│ status: Enum["pending","completed","issue_raised"]                 │
└────────────────────────────────────────────────────────────────────┘
         │ 1                                      │ 1
         │                                        │
         ▼ 0..1                                   ▼ *
┌──────────────────────────────┐    ┌─────────────────────────────────┐
│           Result             │    │             Issue                │
├──────────────────────────────┤    ├─────────────────────────────────┤
│ _id: ObjectId                │    │ _id: ObjectId                   │
│ match: ObjectId → Match      │    │ raisedBy: ObjectId → User       │
│ competition: ObjectId        │    │ match: ObjectId → Match         │
│ roundNumber: Number          │    │ description: String             │
│ submittedBy: ObjectId → User │    │ status: Enum["open","resolved"] │
│ winningTeam: ObjectId → User │    │ resolution: String              │
│ teamAScore: Number           │    │ resolvedBy: ObjectId → User(OC) │
│ teamBScore: Number           │    │ createdAt: Date                 │
│ feedback: String             │    └─────────────────────────────────┘
│ adjudicatorRatings: [        │
│   { adjudicator: ObjectId,   │
│     team: ObjectId,          │
│     rating: Number(0-10) }   │
│ ]                            │
└──────────────────────────────┘
```

---

## 5. Activity Diagram

### 5.1 Full Tournament Lifecycle Activity

```
[Start]
   │
   ▼
OC Creates Competition
   │ (name, rounds, team size, adj/match, venues)
   ▼
Competition in "registration" status
   │
   ├──► Team/Adjudicator Registers ──► Enters pendingTeams/pendingAdjudicators
   │
   ▼
OC Reviews Pending Registrations
   ├── [Approve] ──► Moves to approvedTeams/approvedAdjudicators
   └── [Reject] ───► Removed from pending list
   │
   ▼
Approved Participant Checks In on Tournament Day
   │  ──► Moves to checkedInTeams/checkedInAdjudicators
   ▼
OC Triggers "Generate Round N"
   │
   ├── [If Round N-1 not fully completed] ──► ERROR: Block generation
   ├── [If missing adjudicator ratings] ──► WARN: Block unless forceOverride
   └── [Proceed] ──► matchGenerator runs
           │
           ├── Power-pair teams by wins (Round 1: random)
           ├── Assign adjudicators (rotating, no repeats)
           ├── Assign venues (round-robin)
           └── Issue BYE if odd number of teams
   │
   ▼
Competition status → "ongoing"; currentRound++
   │
   ▼
Adjudicator Views Assigned Match
   │
   ▼
Adjudicator Submits Result (scores, winner, feedback)
   ├── Match status → "completed"
   └── Result record created
   │
   ▼
Team Rates Adjudicator (0-10)
   │  [Mandatory before next round, unless OC force-overrides]
   ▼
Leaderboard Auto-updates (wins + total score)
   │
   ├── [Issue Raised?] ──► Team submits issue ──► OC sees it ──► OC resolves it
   │
   ├── [More rounds?] ──► Loop back to "OC Triggers Generate Round N"
   └── [All rounds done?] ──► Competition status → "completed"
   │
[End]
```

### 5.2 Issue Reporting Activity

```
[Team notices problem in room]
   │
   ▼
Team clicks "Raise an Issue" button
   │  (only visible if current match is not completed)
   ▼
Issue Modal opens
   │
Team describes the issue (text)
   │
   ▼
System POSTs to /api/issues
   │  { matchId, description }
   ▼
Issue created in DB with status="open"
   │  (populated with room, teams, adjudicator info)
   ▼
OC Dashboard polls /api/issues every 15 seconds
   │
   ▼
OC sees issue badge (red count) on Issues tab
   │
OC opens Issues tab, views context:
   │  Room / Venue, Teams, Adjudicator, Description
   ▼
OC clicks "Mark Resolved"
   │
Resolve modal: OC types resolution note
   │
System PUTs /api/issues/:id/resolve
   │
Issue status → "resolved", resolvedBy set
   │
[End]
```

---

## 6. Sequence Diagram

### 6.1 User Registration & Login

```
Client          AuthController       UserModel        JWT
  │                  │                   │             │
  │─POST /register──►│                   │             │
  │                  │─findOne(email)────►│             │
  │                  │◄──────────────────│             │
  │                  │─create(user)──────►│             │
  │                  │◄── user saved ─────│             │
  │                  │─generateToken()────────────────►│
  │                  │◄── token ──────────────────────│
  │◄── {user, token}─│                   │             │
```

### 6.2 Match Generation

```
OC Client    CompetitionCtrl    MatchController    matchGenerator    MongoDB
    │               │                 │                  │              │
    │─POST /competitions/:id          │                  │              │
    │  /matches/generate ────────────►│                  │              │
    │               │─find comp ──────────────────────────────────────►│
    │               │◄── competition ─────────────────────────────────│
    │               │─find prev round matches ────────────────────────►│
    │               │◄── matches ─────────────────────────────────────│
    │               │─[validate all completed?]│                       │
    │               │─[check ratings?] ────────│                       │
    │               │─generateMatches(comp) ──►│                       │
    │               │                 │─power pair teams               │
    │               │                 │─assign adjudicators            │
    │               │                 │─assign venues                  │
    │               │                 │─save matches ──────────────────►│
    │               │◄── newMatches ──│                  │              │
    │               │─competition.currentRound++ ─────────────────────►│
    │◄── {matches} ─│                 │                  │              │
```

### 6.3 Result Submission & Rating

```
Adjudicator    ResultController    Match    Result    Match(update)
     │               │              │         │            │
     │─POST /matches/:id/result────►│         │            │
     │               │─findById ───►│         │            │
     │               │◄── match ────│         │            │
     │               │─[check adj in match?]  │            │
     │               │─create result──────────►│            │
     │               │─match.status="completed"────────────►│
     │◄── result ────│              │         │            │

Team           ResultController    Result     Match
  │                  │               │          │
  │─PUT /results/:id/rate ──────────►│          │
  │                  │─findOne match ──────────►│
  │                  │◄── result w/ match ──────│
  │                  │─[team in match?]          │
  │                  │─[adj in match?]           │
  │                  │─push adjudicatorRating     │
  │                  │─result.save() ────────────►│
  │◄── {message} ────│               │          │
```

---

## 7. Implementation

### 7.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | SPA framework |
| Styling | TailwindCSS 3 | Utility-first CSS |
| Icons | Lucide-React | UI icons |
| HTTP Client | Axios | API requests |
| Routing (FE) | React Router DOM 7 | Client-side routing |
| Backend | Node.js + Express 5 | REST API server |
| Database | MongoDB + Mongoose 9 | NoSQL persistence |
| Auth | JWT + bcrypt | Authentication |
| Security | Helmet + CORS | HTTP security headers |
| Logging | Morgan | HTTP request logging |

---

### 7.2 Backend Architecture

The backend follows an MVC-inspired layered architecture:

```
src/
├── server.js            # Entry point; Express app setup, middleware, route mounting
├── config/
│   └── db.js            # MongoDB connection via Mongoose
├── models/              # Mongoose schemas (data layer)
│   ├── User.js
│   ├── Competition.js
│   ├── Match.js
│   ├── Result.js
│   └── Issue.js
├── controllers/         # Business logic handlers
│   ├── authController.js
│   ├── competitionController.js
│   ├── matchController.js
│   ├── resultController.js
│   └── issueController.js
├── routes/              # Express router definitions
│   ├── authRoutes.js
│   ├── competitionRoutes.js
│   ├── matchActionRoutes.js
│   ├── resultRoutes.js
│   └── issueRoutes.js
├── middleware/
│   └── authMiddleware.js  # JWT verification + role check
└── utils/
    ├── generateToken.js   # JWT creation
    └── matchGenerator.js  # Power-pairing algorithm
```

**API Endpoints Summary:**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, get JWT |
| GET | /api/auth/profile | User | Get own profile |
| POST | /api/competitions | OC | Create competition |
| GET | /api/competitions | Public | List all competitions |
| GET | /api/competitions/:id | Public | Get competition details |
| PUT | /api/competitions/:id/register | User | Register for tournament |
| PUT | /api/competitions/:id/approve/:uid | OC | Approve participant |
| PUT | /api/competitions/:id/reject/:uid | OC | Reject participant |
| PUT | /api/competitions/:id/checkin | User | Check in to tournament |
| DELETE | /api/competitions/:id | OC | Delete competition |
| POST | /api/competitions/:id/matches/generate | OC | Generate next round |
| GET | /api/competitions/:id/matches | Public | Get all matches |
| POST | /api/matches/:id/result | Adjudicator | Submit result |
| PUT | /api/results/:id/rate | Team | Rate adjudicator |
| GET | /api/results/leaderboard/:compId | Public | Team leaderboard |
| GET | /api/results/adjudicator-leaderboard/:compId | Public | Adjudicator leaderboard |
| POST | /api/issues | User | Raise an issue |
| GET | /api/issues | OC | Get all issues |
| PUT | /api/issues/:id/resolve | OC | Resolve an issue |

---

### 7.3 Frontend Architecture

```
src/
├── main.jsx             # React DOM root mount
├── App.jsx              # Router setup; PrivateRoute guard
├── index.css            # Global styles
├── context/
│   └── AuthContext.jsx  # Auth state provider (JWT, user object)
├── services/
│   └── api.js           # Axios instance with JWT interceptor
├── components/
│   └── Navbar.jsx       # Navigation with logout
└── pages/
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── DashboardRouter.jsx   # Routes to role-specific dashboard
    └── dashboards/
        ├── OCDashboard.jsx           # 629 lines
        ├── TeamDashboard.jsx         # 525 lines
        └── AdjudicatorDashboard.jsx  # 496 lines
```

**Key Frontend Features:**

- **AuthContext**: Persists user + JWT in localStorage. All API calls through `api.js` attach the token via Axios interceptor.
- **DashboardRouter**: After login, reads `user.role` and renders the correct dashboard component.
- **OCDashboard**: Lists competitions, create competition form, and deep-dive detail view (Participants, Draws, Issues, Leaderboard tabs). Issues tab auto-polls every 15 seconds.
- **TeamDashboard**: Shows available tournaments with registration/check-in actions. After check-in, shows current match, past matches with adjudicator rating UI, full draw, and leaderboard. Issue raise modal for active matches.
- **AdjudicatorDashboard**: Shows available tournaments, check-in flow, assigned current match with score-submission form, past assignments, and leaderboard.

---

### 7.4 Match Generation Algorithm

The `matchGenerator` utility implements a **power-pairing** algorithm:

1. **Round 1**: Teams are shuffled randomly and paired sequentially (Team[0] vs Team[1], Team[2] vs Team[3], etc.)
2. **Round 2+**: Teams are sorted by their win count (descending), then paired sequentially so top teams face each other.
3. **No-repeat constraint**: The algorithm checks prior match history and avoids rematches where possible.
4. **BYE handling**: If odd number of teams, the lowest-ranked team (or randomly chosen in Round 1) receives a BYE match.
5. **Adjudicator assignment**: Adjudicators are distributed round-robin across matches, avoiding assignment to a team's match if possible.
6. **Venue assignment**: Venues from the competition's venue list are assigned round-robin.

---

### 7.5 Implementation Screenshots (Description)

**Screen 1 – Login Page**
The login page presents a clean card with email and password fields. On successful authentication, the JWT is stored in localStorage and the user is redirected to their role-specific dashboard.

**Screen 2 – OC Dashboard: Competition List**
The OC sees all competitions with at-a-glance stats (checked-in teams count, approved count, current round). Quick actions include "View" (opens detail) and "Delete".

**Screen 3 – OC Dashboard: Create Competition**
A form captures tournament name, number of rounds, team size, adjudicators per match, and venue names (comma-separated). Submitted via POST /api/competitions.

**Screen 4 – OC Dashboard: Participants Tab**
Shows three sections: Pending Registrations (with Approve/Reject buttons), Approved participants, and Checked-In participants. Color-coded (amber/blue/green).

**Screen 5 – OC Dashboard: Match Draws Tab**
Displays round-by-round match tables showing Team A vs Team B, venue, and status (Pending / Done).

**Screen 6 – OC Dashboard: Issues Tab**
Open issues are shown with a red left border. Each card shows: Room/Venue, Teams, Adjudicator name, description, who raised it, and a "Mark Resolved" button. Resolved issues appear below in green with muted opacity. A badge on the Issues tab shows the count of open issues.

**Screen 7 – Team Dashboard: Tournament List**
Cards show each available tournament with status-aware action buttons: Register → Pending message → Check In → View Tournament.

**Screen 8 – Team Dashboard: My Matches Tab**
Current match is shown prominently with Team A vs Team B, venue, adjudicator names, status badge, and a red "Raise an Issue" button when the match is in progress.

**Screen 9 – Team Dashboard: Issue Modal**
A modal with red gradient header. Shows context info ("Room, teams, and adjudicator info will be sent automatically"). Text area for issue description. Cancel and Submit buttons.

**Screen 10 – Team Dashboard: Past Matches + Rating**
Each completed past match shows a "Rate Adjudicators" section with a 0–10 number input and Rate button per adjudicator.

**Screen 11 – Team Dashboard: Leaderboard**
Tabbed between Teams (rank, wins, total score) and Adjudicators (rank, avg rating, total ratings). Top 3 are highlighted with gold/silver/bronze badges.

**Screen 12 – Adjudicator Dashboard: Score Submission Form**
The current assigned match shows Team A vs Team B with a score-entry form: Team A Score, Team B Score, Winning Team dropdown, and optional Feedback textarea.
