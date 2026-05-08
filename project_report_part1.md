
# CENTRALIZED DEBATE TOURNAMENT MANAGEMENT SYSTEM
## Software Engineering Project Report

**Institute:** [Your Institute Name]
**Department:** Department of Computer Science & Engineering
**Course:** Software Engineering (SWE) — Semester IV
**Academic Year:** 2025–2026

| Field | Details |
|---|---|
| Project Title | Centralized Debate Tournament Management System |
| Technology Stack | MERN (MongoDB, Express.js, React.js, Node.js) |
| Submission Date | May 2026 |

---

## Team Members

| Name | Roll No. | Contribution |
|---|---|---|
| Member 1 | — | Backend API, Auth, Competition Module |
| Member 2 | — | Frontend UI, OC Dashboard |
| Member 3 | — | Match Generation Algorithm, Result Module |
| Member 4 | — | Issue Tracking, Adjudicator Dashboard, Testing |

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

Our debating society has been organizing inter-college and intra-college debate tournaments for over a decade. Every year, we look forward to these competitions with great enthusiasm — they bring together sharp minds, foster critical thinking, and provide an invaluable platform for students to express themselves. However, behind every successful tournament lies an organizational nightmare that we, the Organizing Committee (OC), have been struggling with silently for years.

The moment registrations open, our email inboxes are flooded. Teams register through Google Forms, adjudicators send WhatsApp messages, and some participants even walk up to us in person. We maintain a massive Excel spreadsheet to track who has registered, who has been approved, and who has actually shown up on the day. Mistakes are inevitable. We once had a situation where a team showed up for a tournament they were never confirmed for, and another where we accidentally scheduled the same adjudicator for two simultaneous rooms.

When the tournament begins, drawing rounds is an equally painful process. We sit together the night before each round with printed spreadsheets, trying to create matchups manually — ensuring no two teams debate each other twice, that adjudicators are distributed fairly, and that every room is used efficiently. A round that should take 20 minutes to draw ends up taking 2–3 hours. By the third round of a large tournament, our team is exhausted and errors creep in.

During the tournament itself, results collection is entirely paper-based. Adjudicators fill in physical score sheets, which are then collected by runners and handed to us. We then manually enter these scores into our spreadsheets. This process is slow, error-prone, and opaque — teams have no real-time visibility into their standings. They cannot see the draw until we tape printed sheets to a notice board. If an adjudicator doesn't show up or there is a problem in a room, teams have to physically find an OC member to report it. Often, by the time we respond, significant time has already been wasted.

After the tournament, ranking teams is yet another manual process. We tally wins and scores from multiple sheets, often double-checking our work multiple times because a single error could produce an incorrect final ranking. Disputes are common and hard to resolve without a clear, auditable record.

What we truly need is a software system that brings all of these processes under one roof. We need a platform where teams and adjudicators can register online, where our OC can review and approve registrations from a central dashboard, where participants can check in digitally on the day, and where match draws are generated automatically and fairly. We want adjudicators to submit scores directly through the system so that results are recorded in real time and standings are updated immediately. We want teams to be able to rate their adjudicators to ensure quality and accountability. And critically, if something goes wrong in a room — an adjudicator is absent, equipment fails, there is a dispute — we want teams to be able to raise an issue instantly through the system so our OC is notified immediately and can respond.

A system like this would save us dozens of hours of administrative work per tournament, eliminate errors, increase transparency for all participants, and let us focus on what truly matters — running a great debate competition.

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
│
├── G1.1 Centralize participant registration online
│   ├── G1.1.1 Allow teams to register with member details
│   └── G1.1.2 Allow adjudicators to register for tournaments
│
├── G1.2 Enforce OC control over participant approval
│   ├── G1.2.1 OC reviews all registrations
│   └── G1.2.2 OC approves or rejects each participant
│
└── G1.3 Track check-in status separately from registration

G2. Automate match generation and scheduling
│
├── G2.1 Generate fair power-paired matchups per round
├── G2.2 Assign adjudicators to matches automatically
├── G2.3 Assign venues to matches without conflict
└── G2.4 Handle odd-team-count rounds with BYEs

G3. Enable real-time result tracking
│
├── G3.1 Allow adjudicators to submit scores digitally
├── G3.2 Compute and display a live team leaderboard
└── G3.3 Compute and display an adjudicator ratings leaderboard

G4. Ensure adjudicator accountability
│
└── G4.1 Allow teams to rate adjudicators post-match (0–10 scale)

G5. Provide an issue escalation mechanism
│
├── G5.1 Allow teams to raise issues during active matches
├── G5.2 Notify OC of open issues in real-time (polling)
└── G5.3 Allow OC to resolve issues with a written resolution note

G6. Enforce role-based access and security
│
├── G6.1 JWT-based authentication for all users
└── G6.2 Route-level middleware to restrict by role
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
| REQ-14 | Medium | Teams shall be able to rate their adjudicator(s) on a 0–10 scale after a match is completed. |
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
| REQ-21 | High | **Security**: All protected endpoints shall require a valid JWT token. Passwords shall be hashed using bcrypt with salt rounds ≥ 10. |
| REQ-22 | High | **Role Enforcement**: API endpoints shall enforce role-based access — OC-only routes shall reject non-OC tokens with HTTP 403. |
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
┌─────────────────────────────────────────────────────────────────────┐
│                 Debate Tournament Management System                  │
│                                                                     │
│  ┌──────────┐    Register / Login                                   │
│  │   Team   │───────────────────────────────────┐                  │
│  └──────────┘    Register for Competition        │                  │
│       │          Check In                        │                  │
│       │          View My Match                   │                  │
│       │          View All Draws                  ▼                  │
│       │          Raise Issue           ┌─────────────────┐         │
│       │          Rate Adjudicator      │   <<System>>    │         │
│       │          View Leaderboard      │  Auth & Routing │         │
│       │                               └─────────────────┘         │
│  ┌─────────────┐                                ▲                  │
│  │ Adjudicator │────────────────────────────────┘                  │
│  └─────────────┘    Register / Login                               │
│       │          Register for Competition                          │
│       │          Check In                                          │
│       │          View Assigned Match                               │
│       │          Submit Match Result                               │
│       │          View All Draws                                    │
│       │          View Leaderboard                                  │
│                                                                    │
│  ┌────────┐     Create Competition                                 │
│  │  OC   │───► Approve / Reject Participants                       │
│  └────────┘     Generate Round Matches                             │
│                 View Match Draws                                   │
│                 View Issues (auto-polled)                          │
│                 Resolve Issue                                      │
│                 View Leaderboard                                   │
│                 Delete Competition                                 │
└─────────────────────────────────────────────────────────────────────┘
```
