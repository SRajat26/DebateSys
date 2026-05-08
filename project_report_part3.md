
## 8. Test Case Report

### 8.1 Test Environment
- **Backend URL**: http://localhost:5000
- **Frontend URL**: http://localhost:5173
- **Database**: MongoDB (local, default port 27017)
- **Test Tool**: Manual testing via browser UI + Postman for API-level tests

---

### 8.2 Functional Test Cases

#### REQ-1 & REQ-2: User Registration and Login

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-01 | Register new user as Team | No existing user with this email | name, email, password, role="Team" | User created; token returned; status=approved | User registered successfully; JWT returned | **PASS** |
| TC-02 | Register first user (OC auto-assign) | No users in DB | name, email, password, role="Team" | Role overridden to "OC"; auto-approved | First user gets OC role | **PASS** |
| TC-03 | Register with duplicate email | User already exists | Same email as TC-01 | HTTP 400: "User already exists" | Correct error returned | **PASS** |
| TC-04 | Login with correct credentials | User exists (TC-01) | email + correct password | HTTP 200; JWT token returned | Login successful; token received | **PASS** |
| TC-05 | Login with wrong password | User exists | email + wrong password | HTTP 401: "Invalid email or password" | Correct error returned | **PASS** |
| TC-06 | Access protected route without token | — | GET /api/auth/profile (no header) | HTTP 401: Not authorized | Access denied | **PASS** |

#### REQ-4: Create Competition

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-07 | OC creates a competition | Logged in as OC | name, totalRounds=3, teamSize=2, adjudicatorsPerMatch=1, venues="Room A, Room B" | HTTP 201; competition created | Competition saved and returned | **PASS** |
| TC-08 | Non-OC attempts to create competition | Logged in as Team | Same as TC-07 | HTTP 403: Forbidden | Access denied | **PASS** |
| TC-09 | Create competition without required field | OC logged in | Missing "name" | HTTP 400/500: Validation error | Mongoose validation fails | **PASS** |

#### REQ-5 & REQ-6: Registration and Approval

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-10 | Team registers for competition | Competition in "registration" status | PUT /competitions/:id/register | HTTP 200: "Registration submitted! Awaiting OC approval." | Moved to pendingTeams | **PASS** |
| TC-11 | Duplicate registration attempt | Team already in pendingTeams | Same request as TC-10 | HTTP 400: "Already registered (pending)" | Correct error | **PASS** |
| TC-12 | Register for non-registration-status comp | Competition is "ongoing" | PUT /competitions/:id/register | HTTP 400: "Registration is closed" | Correct error | **PASS** |
| TC-13 | OC approves a team | Team in pendingTeams | PUT /competitions/:id/approve/:userId | HTTP 200: "Team registration approved"; moved to approvedTeams | Correctly moved | **PASS** |
| TC-14 | OC rejects a team | Team in pendingTeams | PUT /competitions/:id/reject/:userId | HTTP 200: "Registration rejected"; removed from pending | Correctly removed | **PASS** |
| TC-15 | OC approves non-existent userId | — | PUT /competitions/:id/approve/badId | HTTP 404: "User not found in pending list" | Correct error | **PASS** |

#### REQ-7: Check-In

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-16 | Approved team checks in | Team in approvedTeams | PUT /competitions/:id/checkin | HTTP 200: "Checked in successfully as Team"; moved to checkedInTeams | Correctly moved | **PASS** |
| TC-17 | Unapproved team attempts check-in | Team not in approvedTeams | PUT /competitions/:id/checkin | HTTP 400: "Required registration approval before check-in" | Correct error | **PASS** |

#### REQ-8, REQ-9, REQ-10, REQ-11: Match Generation

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-18 | Generate Round 1 with even number of teams | 4 teams checked in, 2 adjudicators | POST /competitions/:id/matches/generate | 2 matches created; BYE=false for all; adjudicators assigned | 2 matches generated | **PASS** |
| TC-19 | Generate Round 1 with odd number of teams | 3 teams checked in | POST | 1 normal match + 1 BYE match | BYE match created correctly | **PASS** |
| TC-20 | Generate next round before all results submitted | Round 1 has pending match | POST | HTTP 400: "All matches must be completed first" | Blocked correctly | **PASS** |
| TC-21 | Generate when adjudicator ratings missing | All results submitted but teams haven't rated | POST (no forceOverride) | HTTP 400: "Not all teams have rated their adjudicators" | Blocked correctly | **PASS** |
| TC-22 | Force generate with missing ratings | Same as TC-21 | POST with forceOverride=true | Matches generated; missing ratings auto-filled with historical avg | Auto-fill logic works | **PASS** |
| TC-23 | Attempt to generate beyond totalRounds | All rounds completed | POST | HTTP 400: "Competition already completed all rounds" | Blocked correctly | **PASS** |

#### REQ-12: Result Submission

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-24 | Adjudicator submits result | Match pending; user is assigned adjudicator | POST /matches/:id/result with scores, winner, feedback | Result created; match.status → "completed" | Result saved; match marked done | **PASS** |
| TC-25 | Non-adjudicator submits result | Logged in as Team | Same request | HTTP 403: "You are not an adjudicator for this match" | Correct error | **PASS** |
| TC-26 | Submit result for already-completed match | Match already completed | POST | HTTP 400: "Result already submitted" | Correct error | **PASS** |

#### REQ-14: Adjudicator Rating

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-27 | Team rates adjudicator (valid) | Match completed; team in match | PUT /results/:id/rate {adjudicatorId, rating:8} | HTTP 200: "Rating submitted successfully" | Rating saved | **PASS** |
| TC-28 | Rating out of range | — | rating = 11 | HTTP 400: "Rating must be between 0 and 10" | Correct error | **PASS** |
| TC-29 | Team not in match attempts to rate | Team not in that match | PUT /results/:id/rate | HTTP 403: "Your team was not in this match" | Correct error | **PASS** |
| TC-30 | Rating wrong adjudicator (not in match) | — | adjudicatorId not in match | HTTP 400: "This adjudicator was not assigned to this match" | Correct error | **PASS** |

#### REQ-13 & REQ-15: Leaderboard

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-31 | Team leaderboard with results | Multiple results submitted | GET /results/leaderboard/:compId | Ranked list by wins, then total score | Correct ranking returned | **PASS** |
| TC-32 | Adjudicator leaderboard with ratings | Multiple ratings submitted | GET /results/adjudicator-leaderboard/:compId | Ranked by average rating | Correct ranking returned | **PASS** |
| TC-33 | Leaderboard with no results yet | No results submitted | GET /results/leaderboard/:compId | Empty array [] | Empty array returned | **PASS** |

#### REQ-16, REQ-17, REQ-18: Issue Tracking

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-34 | Team raises an issue | Match pending (not completed) | POST /api/issues {matchId, description} | Issue created with status="open"; populated match context returned | Issue raised; full context in response | **PASS** |
| TC-35 | Raise issue without description | — | POST /api/issues {matchId, description:""} | Mongoose validation error (required field) | HTTP 500 validation error | **PASS** |
| TC-36 | OC fetches all issues | Issues exist in DB | GET /api/issues | List of all issues (open + resolved) sorted by createdAt desc | Correct list returned | **PASS** |
| TC-37 | OC resolves an issue | Issue with status="open" | PUT /api/issues/:id/resolve {resolution:"Fixed"} | Issue status → "resolved"; resolvedBy set; resolution saved | Issue resolved correctly | **PASS** |
| TC-38 | Resolve non-existent issue | — | PUT /api/issues/badId/resolve | HTTP 404: "Issue not found" | Correct error | **PASS** |
| TC-39 | OC issue tab badge shows open count | 2 open issues exist | Open Issues tab in OC dashboard | Badge shows "2" with red pulsing animation | Badge displayed correctly | **PASS** |
| TC-40 | Issues auto-poll (UI) | OC in detail view | Wait 15 seconds after new issue raised by team | New issue appears without page reload | Issue appears within 15s | **PASS** |

#### REQ-20: Delete Competition

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-41 | OC deletes competition | Competition exists with matches and results | DELETE /competitions/:id | Competition, all matches, and all results deleted | Cascade delete works | **PASS** |
| TC-42 | Non-OC attempts delete | Logged in as Team | DELETE /competitions/:id | HTTP 403: Forbidden | Access denied | **PASS** |

---

### 8.3 Test Summary

| Category | Total TCs | Pass | Fail |
|---|---|---|---|
| Authentication | 6 | 6 | 0 |
| Competition Management | 3 | 3 | 0 |
| Registration & Approval | 6 | 6 | 0 |
| Check-In | 2 | 2 | 0 |
| Match Generation | 6 | 6 | 0 |
| Result Submission | 3 | 3 | 0 |
| Adjudicator Rating | 4 | 4 | 0 |
| Leaderboard | 3 | 3 | 0 |
| Issue Tracking | 7 | 7 | 0 |
| Competition Deletion | 2 | 2 | 0 |
| **TOTAL** | **42** | **42** | **0** |

---

## 9. Contribution of Each Team Member

| Member | Role | Contributions |
|---|---|---|
| Member 1 | Backend Lead | Designed and implemented all Mongoose schemas (User, Competition, Match, Result, Issue). Built the Express server setup, CORS, Helmet, Morgan middleware config, and JWT auth middleware. Implemented authController (register, login, profile, approval) and the generateToken utility. |
| Member 2 | Frontend Lead | Built the complete React frontend with Vite. Designed the TailwindCSS design system (App.css, index.css). Implemented AuthContext, Axios API service, Navbar, LoginPage, RegisterPage, DashboardRouter, and the full OCDashboard with all four tabs (Participants, Draws, Issues, Leaderboard). |
| Member 3 | Algorithm & Results | Designed and implemented the power-pairing match generation algorithm (matchGenerator.js), including BYE handling, adjudicator distribution, and venue assignment. Built matchController, competitionController, and resultController (submit result, leaderboard, adjudicator leaderboard). Implemented the competitionRoutes and resultRoutes. |
| Member 4 | Issue System & Team/Adj Dashboards | Built the Issue model, issueController (raise, getAll, resolve), and issueRoutes. Implemented the full TeamDashboard including issue raise modal, adjudicator rating UI, past matches history, and leaderboard. Built AdjudicatorDashboard including score submission form, past assignments view. Designed and executed all 42 test cases. |

---

## 10. References

1. Mongoose Documentation. (2024). *Mongoose v9.x Official Docs*. https://mongoosejs.com/docs/
2. Express.js Foundation. (2024). *Express.js Guide*. https://expressjs.com/en/guide/
3. React Documentation. (2024). *React 19 Official Docs*. https://react.dev/
4. Vite Documentation. (2024). *Vite 5 Guide*. https://vitejs.dev/guide/
5. TailwindCSS Documentation. (2024). *Tailwind CSS v3 Docs*. https://tailwindcss.com/docs/
6. Auth0. (2023). *JWT Introduction*. https://jwt.io/introduction
7. Lucide. (2024). *Lucide React Icons*. https://lucide.dev/guide/packages/lucide-react
8. Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson Education.
9. Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill.
10. MongoDB Documentation. (2024). *MongoDB Manual*. https://www.mongodb.com/docs/manual/
11. Axios Documentation. (2024). *Axios HTTP Client*. https://axios-http.com/docs/intro
12. Helmet.js. (2024). *Helmet Security Middleware*. https://helmetjs.github.io/
