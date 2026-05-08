
# CENTRALIZED DEBATE TOURNAMENT MANAGEMENT SYSTEM
## Software Engineering Project Report

**Institute:** [Your Institute Name]
**Department:** Department of Computer Science & Engineering
**Course:** Software Engineering (SWE) â€” Semester IV
**Academic Year:** 2025â€“2026

| Field | Details |
|---|---|
| Project Title | Centralized Debate Tournament Management System |
| Technology Stack | MERN (MongoDB, Express.js, React.js, Node.js) |
| Submission Date | May 2026 |

---

## Team Members

| Name | Roll No. | Contribution |
|---|---|---|
| Member 1 | â€” | Backend API, Auth, Competition Module |
| Member 2 | â€” | Frontend UI, OC Dashboard |
| Member 3 | â€” | Match Generation Algorithm, Result Module |
| Member 4 | â€” | Issue Tracking, Adjudicator Dashboard, Testing |

---

## Table of Contents

1. Customer Problem Statement
   - 1.1 Problem Statement
   - 1.2 Decomposition into Sub-problems
2. Goals, Requirements, and Analysis
   - 2.1 Business Goals
   - 2.2 Enumerated Functional Requirements
   - 2.3 Enumerated Non-Functional Requirements
3. Use Cases
   - 3.1 Stakeholders
   - 3.2 Actors and Goals
   - 3.3 Use Case Diagram
4. Class Diagram
5. Activity Diagram
6. Sequence Diagram
7. Implementation (with Screenshots)
8. Test Case Report
9. Contribution of Each Team Member
10. References

---

## 1. Customer Problem Statement

### 1.1 Problem Statement

Our debating society has been organizing inter-college and intra-college debate tournaments for over a decade. Every year, we look forward to these competitions with great enthusiasm â€” they bring together sharp minds, foster critical thinking, and provide an invaluable platform for students to express themselves. However, behind every successful tournament lies an organizational nightmare that we, the Organizing Committee (OC), have been struggling with silently for years.

The moment registrations open, our email inboxes are flooded. Teams register through Google Forms, adjudicators send WhatsApp messages, and some participants even walk up to us in person. We maintain a massive Excel spreadsheet to track who has registered, who has been approved, and who has actually shown up on the day. Mistakes are inevitable. We once had a situation where a team showed up for a tournament they were never confirmed for, and another where we accidentally scheduled the same adjudicator for two simultaneous rooms.

When the tournament begins, drawing rounds is an equally painful process. We sit together the night before each round with printed spreadsheets, trying to create matchups manually â€” ensuring no two teams debate each other twice, that adjudicators are distributed fairly, and that every room is used efficiently. A round that should take 20 minutes to draw ends up taking 2â€“3 hours. By the third round of a large tournament, our team is exhausted and errors creep in.

During the tournament itself, results collection is entirely paper-based. Adjudicators fill in physical score sheets, which are then collected by runners and handed to us. We then manually enter these scores into our spreadsheets. This process is slow, error-prone, and opaque â€” teams have no real-time visibility into their standings. They cannot see the draw until we tape printed sheets to a notice board. If an adjudicator doesn't show up or there is a problem in a room, teams have to physically find an OC member to report it. Often, by the time we respond, significant time has already been wasted.

After the tournament, ranking teams is yet another manual process. We tally wins and scores from multiple sheets, often double-checking our work multiple times because a single error could produce an incorrect final ranking. Disputes are common and hard to resolve without a clear, auditable record.

What we truly need is a software system that brings all of these processes under one roof. We need a platform where teams and adjudicators can register online, where our OC can review and approve registrations from a central dashboard, where participants can check in digitally on the day, and where match draws are generated automatically and fairly. We want adjudicators to submit scores directly through the system so that results are recorded in real time and standings are updated immediately. We want teams to be able to rate their adjudicators to ensure quality and accountability. And critically, if something goes wrong in a room â€” an adjudicator is absent, equipment fails, there is a dispute â€” we want teams to be able to raise an issue instantly through the system so our OC is notified immediately and can respond.

A system like this would save us dozens of hours of administrative work per tournament, eliminate errors, increase transparency for all participants, and let us focus on what truly matters â€” running a great debate competition.

---

### 1.2 Decomposition into Sub-problems

Based on the problem statement, the overall problem decomposes into the following sub-problems:

**SP-1: Registration and Approval Management**
Teams and adjudicators register through disparate channels with no central tracking. The system must provide a unified online registration flow with OC approval gating.

**SP-2: Check-In Management**
On tournament day, there is no formal digital record of who actually arrives. The system must support a check-in phase separate from registration to track real participation.

**SP-3: Automated Match / Draw Generation**
Manual draw creation is error-prone and time-consuming. The system must automatically generate fair, power-paired matchups for each round using only checked-in participants, handling odd numbers (BYE rounds) and adjudicator assignment automatically.

**SP-4: Result Submission and Leaderboard**
Paper-based scoring is slow and opaque. The system must allow adjudicators to submit match results digitally, immediately updating a live team leaderboard.

**SP-5: Adjudicator Accountability (Rating)**
There is no mechanism to assess adjudicator quality. The system must enable teams to rate adjudicators post-match, maintaining an adjudicator performance leaderboard.

**SP-6: Issue Reporting and Resolution**
Teams have no fast way to escalate problems during a match. The system must allow teams to raise issues that are immediately visible to the OC, who can then resolve and record them.

**SP-7: Role-based Access Control**
Different users (OC, Teams, Adjudicators) need different views and permissions. The system must enforce strict role-based access.

---

## 2. Goals, Requirements, and Analysis

### 2.1 Business Goals

```
G1. Eliminate manual, paper-based tournament administration
â”‚
â”œâ”€â”€ G1.1 Centralize participant registration online
â”‚   â”œâ”€â”€ G1.1.1 Allow teams to register with member details
â”‚   â””â”€â”€ G1.1.2 Allow adjudicators to register for tournaments
â”‚
â”œâ”€â”€ G1.2 Enforce OC control over participant approval
â”‚   â”œâ”€â”€ G1.2.1 OC reviews all registrations
â”‚   â””â”€â”€ G1.2.2 OC approves or rejects each participant
â”‚
â””â”€â”€ G1.3 Track check-in status separately from registration

G2. Automate match generation and scheduling
â”‚
â”œâ”€â”€ G2.1 Generate fair power-paired matchups per round
â”œâ”€â”€ G2.2 Assign adjudicators to matches automatically
â”œâ”€â”€ G2.3 Assign venues to matches without conflict
â””â”€â”€ G2.4 Handle odd-team-count rounds with BYEs

G3. Enable real-time result tracking
â”‚
â”œâ”€â”€ G3.1 Allow adjudicators to submit scores digitally
â”œâ”€â”€ G3.2 Compute and display a live team leaderboard
â””â”€â”€ G3.3 Compute and display an adjudicator ratings leaderboard

G4. Ensure adjudicator accountability
â”‚
â””â”€â”€ G4.1 Allow teams to rate adjudicators post-match (0â€“10 scale)

G5. Provide an issue escalation mechanism
â”‚
â”œâ”€â”€ G5.1 Allow teams to raise issues during active matches
â”œâ”€â”€ G5.2 Notify OC of open issues in real-time (polling)
â””â”€â”€ G5.3 Allow OC to resolve issues with a written resolution note

G6. Enforce role-based access and security
â”‚
â”œâ”€â”€ G6.1 JWT-based authentication for all users
â””â”€â”€ G6.2 Route-level middleware to restrict by role
```

---

### 2.2 Enumerated Functional Requirements

| REQ-ID | Priority | Description |
|---|---|---|
| REQ-1 | High | The system shall allow new users to register with name, email, password, and role (Team/Adjudicator). |
| REQ-2 | High | The system shall allow users to log in with email and password, receiving a JWT for subsequent requests. |
| REQ-3 | High | The system shall automatically assign the first registered user the OC role. |
| REQ-4 | High | OC shall be able to create a new competition specifying name, total rounds, team size, adjudicators per match, and venues. |
| REQ-5 | High | Teams and Adjudicators shall be able to register for a specific competition; their request shall enter a pending state. |
| REQ-6 | High | OC shall be able to approve or reject pending registration requests for a competition. |
| REQ-7 | High | Approved participants shall be able to check in to a competition on the day of the event. |
| REQ-8 | High | OC shall be able to trigger match generation for the next round using only checked-in participants. |
| REQ-9 | High | The system shall generate power-paired matches, assign adjudicators, and assign venues automatically. |
| REQ-10 | High | The system shall issue a BYE to a team when the number of checked-in teams is odd. |
| REQ-11 | High | The system shall prevent generation of the next round if not all current-round match results have been submitted. |
| REQ-12 | High | Adjudicators shall be able to submit match results including Team A Score, Team B Score, Winning Team, and optional Feedback. |
| REQ-13 | Medium | The system shall compute and display a real-time team leaderboard ranked by wins then total score. |
| REQ-14 | Medium | Teams shall be able to rate their adjudicator(s) on a 0â€“10 scale after a match is completed. |
| REQ-15 | Medium | The system shall compute and display an adjudicator leaderboard ranked by average rating. |
| REQ-16 | High | Teams shall be able to raise an issue for their current active match, providing a description. |
| REQ-17 | High | The OC dashboard shall display open issues with match context (room, teams, adjudicator). |
| REQ-18 | High | OC shall be able to mark an issue as resolved with an optional resolution note. |
| REQ-19 | Medium | The OC shall be able to force-generate the next round, auto-filling missing adjudicator ratings with the adjudicator's historical average. |
| REQ-20 | Medium | OC shall be able to delete a competition and all associated matches and results. |

---

### 2.3 Enumerated Non-Functional Requirements

| REQ-ID | Priority | Description |
|---|---|---|
| REQ-21 | High | **Security**: All protected endpoints shall require a valid JWT token. Passwords shall be hashed using bcrypt with salt rounds â‰¥ 10. |
| REQ-22 | High | **Role Enforcement**: API endpoints shall enforce role-based access â€” OC-only routes shall reject non-OC tokens with HTTP 403. |
| REQ-23 | High | **Data Integrity**: Each team shall appear in at most one match per round. No two teams shall face each other more than once across rounds. |
| REQ-24 | Medium | **Performance**: The leaderboard and match-draw endpoints shall respond within 2 seconds for tournaments of up to 64 teams. |
| REQ-25 | Medium | **Availability**: The OC issues panel shall refresh automatically every 15 seconds to reflect newly raised issues without manual page reload. |
| REQ-26 | Low | **Usability**: All role-specific dashboards shall render correctly on screen widths from 375px (mobile) to 1920px (desktop). |
| REQ-27 | Low | **Maintainability**: Backend business logic shall be separated into controllers, models, routes, and utilities following the MVC pattern. |
| REQ-28 | Low | **Scalability**: The MongoDB schema shall support multiple concurrent competitions independently without data collision. |

---

## 3. Use Cases

### 3.1 Stakeholders

| Stakeholder | Interest in the System |
|---|---|
| **Organizing Committee (OC)** | Manages competition lifecycle: creates events, approves participants, generates draws, monitors issues, views standings. |
| **Debate Teams** | Registers for tournaments, participates in matches, views draws and standings, raises issues, rates adjudicators. |
| **Adjudicators** | Registers for tournaments, is assigned to matches, submits match results and feedback. |
| **Tournament Director** | Oversees overall tournament quality; concerned with fairness of pairings and adjudicator accountability. |
| **Host Institution** | Concerned that the platform reflects well on the institution and handles participant data securely. |

---

### 3.2 Actors and Goals

| Actor | Type | Goals |
|---|---|---|
| OC Member | Initiating | Create competitions; approve/reject registrations; trigger round generation; resolve issues; view leaderboard. |
| Team | Initiating | Register for tournament; check in; view own match draw; raise issues; rate adjudicators; view standings. |
| Adjudicator | Initiating | Register for tournament; check in; view assigned match; submit match result and feedback. |
| System (Auto) | Participating | Generate power-paired matches; auto-assign adjudicators and venues; compute leaderboard; poll for new issues. |

---

### 3.3 Use Case Diagram (Text Representation)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 Debate Tournament Management System                  â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    Register / Login                                   â”‚
â”‚  â”‚   Team   â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    Register for Competition        â”‚                  â”‚
â”‚       â”‚          Check In                        â”‚                  â”‚
â”‚       â”‚          View My Match                   â”‚                  â”‚
â”‚       â”‚          View All Draws                  â–¼                  â”‚
â”‚       â”‚          Raise Issue           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚       â”‚          Rate Adjudicator      â”‚   <<System>>    â”‚         â”‚
â”‚       â”‚          View Leaderboard      â”‚  Auth & Routing â”‚         â”‚
â”‚       â”‚                               â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                â–²                  â”‚
â”‚  â”‚ Adjudicator â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    Register / Login                               â”‚
â”‚       â”‚          Register for Competition                          â”‚
â”‚       â”‚          Check In                                          â”‚
â”‚       â”‚          View Assigned Match                               â”‚
â”‚       â”‚          Submit Match Result                               â”‚
â”‚       â”‚          View All Draws                                    â”‚
â”‚       â”‚          View Leaderboard                                  â”‚
â”‚                                                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”     Create Competition                                 â”‚
â”‚  â”‚  OC   â”‚â”€â”€â”€â–º Approve / Reject Participants                       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜     Generate Round Matches                             â”‚
â”‚                 View Match Draws                                   â”‚
â”‚                 View Issues (auto-polled)                          â”‚
â”‚                 Resolve Issue                                      â”‚
â”‚                 View Leaderboard                                   â”‚
â”‚                 Delete Competition                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## 4. Class Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                              User                                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ _id: ObjectId                                                        â”‚
â”‚ name: String                                                         â”‚
â”‚ email: String (unique)                                               â”‚
â”‚ password: String (bcrypt hashed)                                     â”‚
â”‚ role: Enum["User","OC","Adjudicator","Team"]                        â”‚
â”‚ status: Enum["pending","approved","rejected"]                        â”‚
â”‚ teamMembers: [String]                                                â”‚
â”‚ createdAt: Date                                                      â”‚
â”‚ updatedAt: Date                                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ + matchPassword(password): Boolean                                   â”‚
â”‚ + pre("save"): hash password on change                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â–²                    â–²                   â–²
                 â”‚ role=OC            â”‚ role=Team         â”‚ role=Adjudicator
                 â”‚                    â”‚                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           Competition                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ _id: ObjectId                                                      â”‚
â”‚ name: String                                                       â”‚
â”‚ totalRounds: Number                                                â”‚
â”‚ currentRound: Number                                               â”‚
â”‚ roundStatus: Enum["open","closed"]                                 â”‚
â”‚ teamSize: Number                                                   â”‚
â”‚ adjudicatorsPerMatch: Number                                       â”‚
â”‚ venues: [String]                                                   â”‚
â”‚ ocMembers: [ObjectId â†’ User]                                       â”‚
â”‚ pendingTeams: [ObjectId â†’ User]                                    â”‚
â”‚ pendingAdjudicators: [ObjectId â†’ User]                             â”‚
â”‚ approvedTeams: [ObjectId â†’ User]                                   â”‚
â”‚ approvedAdjudicators: [ObjectId â†’ User]                            â”‚
â”‚ checkedInTeams: [ObjectId â†’ User]                                  â”‚
â”‚ checkedInAdjudicators: [ObjectId â†’ User]                           â”‚
â”‚ status: Enum["registration","ongoing","completed"]                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚ 1
                              â”‚ has many
                              â–¼ *
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                              Match                                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ _id: ObjectId                                                      â”‚
â”‚ competition: ObjectId â†’ Competition                                â”‚
â”‚ roundNumber: Number                                                â”‚
â”‚ teamA: ObjectId â†’ User (Team)                                      â”‚
â”‚ teamB: ObjectId â†’ User (Team) [nullable - BYE]                     â”‚
â”‚ isBye: Boolean                                                     â”‚
â”‚ adjudicators: [ObjectId â†’ User (Adjudicator)]                      â”‚
â”‚ venue: String                                                      â”‚
â”‚ ocRunner: ObjectId â†’ User (OC)                                     â”‚
â”‚ status: Enum["pending","completed","issue_raised"]                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚ 1                                      â”‚ 1
         â”‚                                        â”‚
         â–¼ 0..1                                   â–¼ *
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           Result             â”‚    â”‚             Issue                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ _id: ObjectId                â”‚    â”‚ _id: ObjectId                   â”‚
â”‚ match: ObjectId â†’ Match      â”‚    â”‚ raisedBy: ObjectId â†’ User       â”‚
â”‚ competition: ObjectId        â”‚    â”‚ match: ObjectId â†’ Match         â”‚
â”‚ roundNumber: Number          â”‚    â”‚ description: String             â”‚
â”‚ submittedBy: ObjectId â†’ User â”‚    â”‚ status: Enum["open","resolved"] â”‚
â”‚ winningTeam: ObjectId â†’ User â”‚    â”‚ resolution: String              â”‚
â”‚ teamAScore: Number           â”‚    â”‚ resolvedBy: ObjectId â†’ User(OC) â”‚
â”‚ teamBScore: Number           â”‚    â”‚ createdAt: Date                 â”‚
â”‚ feedback: String             â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”‚ adjudicatorRatings: [        â”‚
â”‚   { adjudicator: ObjectId,   â”‚
â”‚     team: ObjectId,          â”‚
â”‚     rating: Number(0-10) }   â”‚
â”‚ ]                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 5. Activity Diagram

### 5.1 Full Tournament Lifecycle Activity

```
[Start]
   â”‚
   â–¼
OC Creates Competition
   â”‚ (name, rounds, team size, adj/match, venues)
   â–¼
Competition in "registration" status
   â”‚
   â”œâ”€â”€â–º Team/Adjudicator Registers â”€â”€â–º Enters pendingTeams/pendingAdjudicators
   â”‚
   â–¼
OC Reviews Pending Registrations
   â”œâ”€â”€ [Approve] â”€â”€â–º Moves to approvedTeams/approvedAdjudicators
   â””â”€â”€ [Reject] â”€â”€â”€â–º Removed from pending list
   â”‚
   â–¼
Approved Participant Checks In on Tournament Day
   â”‚  â”€â”€â–º Moves to checkedInTeams/checkedInAdjudicators
   â–¼
OC Triggers "Generate Round N"
   â”‚
   â”œâ”€â”€ [If Round N-1 not fully completed] â”€â”€â–º ERROR: Block generation
   â”œâ”€â”€ [If missing adjudicator ratings] â”€â”€â–º WARN: Block unless forceOverride
   â””â”€â”€ [Proceed] â”€â”€â–º matchGenerator runs
           â”‚
           â”œâ”€â”€ Power-pair teams by wins (Round 1: random)
           â”œâ”€â”€ Assign adjudicators (rotating, no repeats)
           â”œâ”€â”€ Assign venues (round-robin)
           â””â”€â”€ Issue BYE if odd number of teams
   â”‚
   â–¼
Competition status â†’ "ongoing"; currentRound++
   â”‚
   â–¼
Adjudicator Views Assigned Match
   â”‚
   â–¼
Adjudicator Submits Result (scores, winner, feedback)
   â”œâ”€â”€ Match status â†’ "completed"
   â””â”€â”€ Result record created
   â”‚
   â–¼
Team Rates Adjudicator (0-10)
   â”‚  [Mandatory before next round, unless OC force-overrides]
   â–¼
Leaderboard Auto-updates (wins + total score)
   â”‚
   â”œâ”€â”€ [Issue Raised?] â”€â”€â–º Team submits issue â”€â”€â–º OC sees it â”€â”€â–º OC resolves it
   â”‚
   â”œâ”€â”€ [More rounds?] â”€â”€â–º Loop back to "OC Triggers Generate Round N"
   â””â”€â”€ [All rounds done?] â”€â”€â–º Competition status â†’ "completed"
   â”‚
[End]
```

### 5.2 Issue Reporting Activity

```
[Team notices problem in room]
   â”‚
   â–¼
Team clicks "Raise an Issue" button
   â”‚  (only visible if current match is not completed)
   â–¼
Issue Modal opens
   â”‚
Team describes the issue (text)
   â”‚
   â–¼
System POSTs to /api/issues
   â”‚  { matchId, description }
   â–¼
Issue created in DB with status="open"
   â”‚  (populated with room, teams, adjudicator info)
   â–¼
OC Dashboard polls /api/issues every 15 seconds
   â”‚
   â–¼
OC sees issue badge (red count) on Issues tab
   â”‚
OC opens Issues tab, views context:
   â”‚  Room / Venue, Teams, Adjudicator, Description
   â–¼
OC clicks "Mark Resolved"
   â”‚
Resolve modal: OC types resolution note
   â”‚
System PUTs /api/issues/:id/resolve
   â”‚
Issue status â†’ "resolved", resolvedBy set
   â”‚
[End]
```

---

## 6. Sequence Diagram

### 6.1 User Registration & Login

```
Client          AuthController       UserModel        JWT
  â”‚                  â”‚                   â”‚             â”‚
  â”‚â”€POST /registerâ”€â”€â–ºâ”‚                   â”‚             â”‚
  â”‚                  â”‚â”€findOne(email)â”€â”€â”€â”€â–ºâ”‚             â”‚
  â”‚                  â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚             â”‚
  â”‚                  â”‚â”€create(user)â”€â”€â”€â”€â”€â”€â–ºâ”‚             â”‚
  â”‚                  â”‚â—„â”€â”€ user saved â”€â”€â”€â”€â”€â”‚             â”‚
  â”‚                  â”‚â”€generateToken()â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
  â”‚                  â”‚â—„â”€â”€ token â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
  â”‚â—„â”€â”€ {user, token}â”€â”‚                   â”‚             â”‚
```

### 6.2 Match Generation

```
OC Client    CompetitionCtrl    MatchController    matchGenerator    MongoDB
    â”‚               â”‚                 â”‚                  â”‚              â”‚
    â”‚â”€POST /competitions/:id          â”‚                  â”‚              â”‚
    â”‚  /matches/generate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚                  â”‚              â”‚
    â”‚               â”‚â”€find comp â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
    â”‚               â”‚â—„â”€â”€ competition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
    â”‚               â”‚â”€find prev round matches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
    â”‚               â”‚â—„â”€â”€ matches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
    â”‚               â”‚â”€[validate all completed?]â”‚                       â”‚
    â”‚               â”‚â”€[check ratings?] â”€â”€â”€â”€â”€â”€â”€â”€â”‚                       â”‚
    â”‚               â”‚â”€generateMatches(comp) â”€â”€â–ºâ”‚                       â”‚
    â”‚               â”‚                 â”‚â”€power pair teams               â”‚
    â”‚               â”‚                 â”‚â”€assign adjudicators            â”‚
    â”‚               â”‚                 â”‚â”€assign venues                  â”‚
    â”‚               â”‚                 â”‚â”€save matches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
    â”‚               â”‚â—„â”€â”€ newMatches â”€â”€â”‚                  â”‚              â”‚
    â”‚               â”‚â”€competition.currentRound++ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
    â”‚â—„â”€â”€ {matches} â”€â”‚                 â”‚                  â”‚              â”‚
```

### 6.3 Result Submission & Rating

```
Adjudicator    ResultController    Match    Result    Match(update)
     â”‚               â”‚              â”‚         â”‚            â”‚
     â”‚â”€POST /matches/:id/resultâ”€â”€â”€â”€â–ºâ”‚         â”‚            â”‚
     â”‚               â”‚â”€findById â”€â”€â”€â–ºâ”‚         â”‚            â”‚
     â”‚               â”‚â—„â”€â”€ match â”€â”€â”€â”€â”‚         â”‚            â”‚
     â”‚               â”‚â”€[check adj in match?]  â”‚            â”‚
     â”‚               â”‚â”€create resultâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚            â”‚
     â”‚               â”‚â”€match.status="completed"â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
     â”‚â—„â”€â”€ result â”€â”€â”€â”€â”‚              â”‚         â”‚            â”‚

Team           ResultController    Result     Match
  â”‚                  â”‚               â”‚          â”‚
  â”‚â”€PUT /results/:id/rate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚          â”‚
  â”‚                  â”‚â”€findOne match â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
  â”‚                  â”‚â—„â”€â”€ result w/ match â”€â”€â”€â”€â”€â”€â”‚
  â”‚                  â”‚â”€[team in match?]          â”‚
  â”‚                  â”‚â”€[adj in match?]           â”‚
  â”‚                  â”‚â”€push adjudicatorRating     â”‚
  â”‚                  â”‚â”€result.save() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚
  â”‚â—„â”€â”€ {message} â”€â”€â”€â”€â”‚               â”‚          â”‚
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
â”œâ”€â”€ server.js            # Entry point; Express app setup, middleware, route mounting
â”œâ”€â”€ config/
â”‚   â””â”€â”€ db.js            # MongoDB connection via Mongoose
â”œâ”€â”€ models/              # Mongoose schemas (data layer)
â”‚   â”œâ”€â”€ User.js
â”‚   â”œâ”€â”€ Competition.js
â”‚   â”œâ”€â”€ Match.js
â”‚   â”œâ”€â”€ Result.js
â”‚   â””â”€â”€ Issue.js
â”œâ”€â”€ controllers/         # Business logic handlers
â”‚   â”œâ”€â”€ authController.js
â”‚   â”œâ”€â”€ competitionController.js
â”‚   â”œâ”€â”€ matchController.js
â”‚   â”œâ”€â”€ resultController.js
â”‚   â””â”€â”€ issueController.js
â”œâ”€â”€ routes/              # Express router definitions
â”‚   â”œâ”€â”€ authRoutes.js
â”‚   â”œâ”€â”€ competitionRoutes.js
â”‚   â”œâ”€â”€ matchActionRoutes.js
â”‚   â”œâ”€â”€ resultRoutes.js
â”‚   â””â”€â”€ issueRoutes.js
â”œâ”€â”€ middleware/
â”‚   â””â”€â”€ authMiddleware.js  # JWT verification + role check
â””â”€â”€ utils/
    â”œâ”€â”€ generateToken.js   # JWT creation
    â””â”€â”€ matchGenerator.js  # Power-pairing algorithm
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
â”œâ”€â”€ main.jsx             # React DOM root mount
â”œâ”€â”€ App.jsx              # Router setup; PrivateRoute guard
â”œâ”€â”€ index.css            # Global styles
â”œâ”€â”€ context/
â”‚   â””â”€â”€ AuthContext.jsx  # Auth state provider (JWT, user object)
â”œâ”€â”€ services/
â”‚   â””â”€â”€ api.js           # Axios instance with JWT interceptor
â”œâ”€â”€ components/
â”‚   â””â”€â”€ Navbar.jsx       # Navigation with logout
â””â”€â”€ pages/
    â”œâ”€â”€ HomePage.jsx
    â”œâ”€â”€ LoginPage.jsx
    â”œâ”€â”€ RegisterPage.jsx
    â”œâ”€â”€ DashboardRouter.jsx   # Routes to role-specific dashboard
    â””â”€â”€ dashboards/
        â”œâ”€â”€ OCDashboard.jsx           # 629 lines
        â”œâ”€â”€ TeamDashboard.jsx         # 525 lines
        â””â”€â”€ AdjudicatorDashboard.jsx  # 496 lines
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

**Screen 1 â€“ Login Page**
The login page presents a clean card with email and password fields. On successful authentication, the JWT is stored in localStorage and the user is redirected to their role-specific dashboard.

**Screen 2 â€“ OC Dashboard: Competition List**
The OC sees all competitions with at-a-glance stats (checked-in teams count, approved count, current round). Quick actions include "View" (opens detail) and "Delete".

**Screen 3 â€“ OC Dashboard: Create Competition**
A form captures tournament name, number of rounds, team size, adjudicators per match, and venue names (comma-separated). Submitted via POST /api/competitions.

**Screen 4 â€“ OC Dashboard: Participants Tab**
Shows three sections: Pending Registrations (with Approve/Reject buttons), Approved participants, and Checked-In participants. Color-coded (amber/blue/green).

**Screen 5 â€“ OC Dashboard: Match Draws Tab**
Displays round-by-round match tables showing Team A vs Team B, venue, and status (Pending / Done).

**Screen 6 â€“ OC Dashboard: Issues Tab**
Open issues are shown with a red left border. Each card shows: Room/Venue, Teams, Adjudicator name, description, who raised it, and a "Mark Resolved" button. Resolved issues appear below in green with muted opacity. A badge on the Issues tab shows the count of open issues.

**Screen 7 â€“ Team Dashboard: Tournament List**
Cards show each available tournament with status-aware action buttons: Register â†’ Pending message â†’ Check In â†’ View Tournament.

**Screen 8 â€“ Team Dashboard: My Matches Tab**
Current match is shown prominently with Team A vs Team B, venue, adjudicator names, status badge, and a red "Raise an Issue" button when the match is in progress.

**Screen 9 â€“ Team Dashboard: Issue Modal**
A modal with red gradient header. Shows context info ("Room, teams, and adjudicator info will be sent automatically"). Text area for issue description. Cancel and Submit buttons.

**Screen 10 â€“ Team Dashboard: Past Matches + Rating**
Each completed past match shows a "Rate Adjudicators" section with a 0â€“10 number input and Rate button per adjudicator.

**Screen 11 â€“ Team Dashboard: Leaderboard**
Tabbed between Teams (rank, wins, total score) and Adjudicators (rank, avg rating, total ratings). Top 3 are highlighted with gold/silver/bronze badges.

**Screen 12 â€“ Adjudicator Dashboard: Score Submission Form**
The current assigned match shows Team A vs Team B with a score-entry form: Team A Score, Team B Score, Winning Team dropdown, and optional Feedback textarea.

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
| TC-06 | Access protected route without token | â€” | GET /api/auth/profile (no header) | HTTP 401: Not authorized | Access denied | **PASS** |

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
| TC-15 | OC approves non-existent userId | â€” | PUT /competitions/:id/approve/badId | HTTP 404: "User not found in pending list" | Correct error | **PASS** |

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
| TC-24 | Adjudicator submits result | Match pending; user is assigned adjudicator | POST /matches/:id/result with scores, winner, feedback | Result created; match.status â†’ "completed" | Result saved; match marked done | **PASS** |
| TC-25 | Non-adjudicator submits result | Logged in as Team | Same request | HTTP 403: "You are not an adjudicator for this match" | Correct error | **PASS** |
| TC-26 | Submit result for already-completed match | Match already completed | POST | HTTP 400: "Result already submitted" | Correct error | **PASS** |

#### REQ-14: Adjudicator Rating

| TC-ID | Test Case | Pre-condition | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-27 | Team rates adjudicator (valid) | Match completed; team in match | PUT /results/:id/rate {adjudicatorId, rating:8} | HTTP 200: "Rating submitted successfully" | Rating saved | **PASS** |
| TC-28 | Rating out of range | â€” | rating = 11 | HTTP 400: "Rating must be between 0 and 10" | Correct error | **PASS** |
| TC-29 | Team not in match attempts to rate | Team not in that match | PUT /results/:id/rate | HTTP 403: "Your team was not in this match" | Correct error | **PASS** |
| TC-30 | Rating wrong adjudicator (not in match) | â€” | adjudicatorId not in match | HTTP 400: "This adjudicator was not assigned to this match" | Correct error | **PASS** |

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
| TC-35 | Raise issue without description | â€” | POST /api/issues {matchId, description:""} | Mongoose validation error (required field) | HTTP 500 validation error | **PASS** |
| TC-36 | OC fetches all issues | Issues exist in DB | GET /api/issues | List of all issues (open + resolved) sorted by createdAt desc | Correct list returned | **PASS** |
| TC-37 | OC resolves an issue | Issue with status="open" | PUT /api/issues/:id/resolve {resolution:"Fixed"} | Issue status â†’ "resolved"; resolvedBy set; resolution saved | Issue resolved correctly | **PASS** |
| TC-38 | Resolve non-existent issue | â€” | PUT /api/issues/badId/resolve | HTTP 404: "Issue not found" | Correct error | **PASS** |
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
