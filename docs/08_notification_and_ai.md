# Notification Architecture, AI Capabilities, and Cross-Portal Workflows

This document details the event-driven notification queue, the AI Assistant integration parameters for each user portal, and the major cross-departmental operations.

---

## 1. Notification Architecture

To support real-time user alerts without performance degradation, the notification engine operates asynchronously.

```
[Downstream Service Event] 
         │ (JSON payload)
         ▼
 ┌───────────────┐
 │ RabbitMQ      │ ◄── Message Broker
 └───────┬───────┘
         │ (Distribute tasks)
         ▼
 ┌───────────────┐
 │ Notification  │ ── Workers Cluster
 │ Workers       │
 └─┬───┬───┬───┬─┘
   │   │   │   │
   │   │   │   └─► [Slack/Teams Webhooks] ──► Workspace Channels
   │   │   └─► [Twilio SMS Gateway] ─────────► User Mobile Devices
   │   └─► [SendGrid SMTP Service] ───────► User Inboxes
   └─► [FCM / APNs Server] ───────────────► Mobile Push Notifications
```

### Channel Selection Policies
*   **In-App Alerts**: Active during all user actions. Uses WebSockets (via Redis adapter) to push dynamic notifications to UI headers.
*   **Email (SendGrid)**: Used for legal actions (contracts sent, invoices generated, passwords resets, student enrollment confirmations).
*   **Slack/Teams Webhooks**: Integrates into studio project spaces to announce asset statuses, e.g., `"Shot 04 technical QA approved. Assigned to Director Rajesh."`
*   **SMS (Twilio)**: Reserved for MFA codes and critical security alarms (unrecognized login locations, password alterations).

---

## 2. AI Studio Assistant Capabilities

The context-aware **AI Assistant** connects to the user interface via an internal LLM Gateway. Its capabilities depend on the logged-in role:

### Platform & Studio Management Roles (P-01 to P-02)
*   *Platform Anomaly Detector*: Flags weird spikes in API traffic or tenant resource consumption.
*   *Financial Analyst*: Performs revenue forecasting, calculates team ROI values, and identifies budget overrun trends.

### Creative & Production Leadership Roles (P-03 to P-06)
*   *Feedback Synthesizer*: Compiles bulleted artistic feedback from director sketches and visual tags.
*   *Schedule Risk Predictor*: Compares current team velocity against milestones and flags tasks likely to cause delays.

### Creative Production Roles (P-07 to P-11)
*   *Script Helper*: Writes Python automation scripts for Maya or Blender pipelines based on user request.
*   *Asset Finder*: Performs semantic searches across the studio libraries to locate models matching creative criteria (e.g. "futuristic vehicle 2026").
*   *Storyboard Drafter*: Generates textual scene breakdowns and visual composition outlines from raw script paragraphs.

### HR & Recruitment Roles (P-14 to P-15)
*   *Resume Screen*: Screens candidate profile lists to suggest the best matches for open roles.
*   *Interview Helper*: Suggests interview questions based on the candidate's assessment results.

### Finance & Billing Roles (P-12, P-13, P-16)
*   *Expense Auditor*: Cross-checks receipts against expense policy boundaries and flags anomalies.
*   *Invoice Generator*: Converts freelancer time sheets into formal invoice line items.

### Academy & Training Roles (P-17 to P-21)
*   *Quiz Maker*: Generates quizzes and study outlines based on trainer video transcripts.
*   *Code & Rig QA*: Analyzes student-submitted Python files or scene structure scripts for errors.

---

## 3. Cross-Portal Workflows

### Workflow 1: Job-Posting-to-Onboarding
This workflow connects the Candidate, Recruiter, HR, and ID Card Administrator to onboard new talent.

```mermaid
sequenceDiagram
    autonumber
    HR->>Recruiter: Opens staff vacancy request
    Recruiter->>Visitor/Public: Publishes job listing to Careers Portal
    Visitor/Public->>Recruiter: Submits application & portfolio link
    Recruiter->>Visitor/Public: Dispatches assessment test
    Visitor/Public->>Recruiter: Submits assessment answers
    Recruiter->>Recruiter: AI scores assessment; Recruiter reviews and screens
    Recruiter->>Visitor/Public: Invites to panel interview (links Google Meet)
    Recruiter->>HR: Submits candidate hiring recommendation
    HR->>Visitor/Public: Sends formal Job Offer contract PDF
    Visitor/Public->>HR: Accepts & signs contract digitally
    HR->>users table: Provisions active user profile; triggers email activation
    HR->>ID Card Admin: Orders access card generation
    ID Card Admin->>digital_ids table: Creates QR credentials; registers access permissions
```

---

### Workflow 2: Creative-Production-to-Billing
This workflow covers shot execution, quality checks, creative approval, and final client invoicing.

```mermaid
sequenceDiagram
    autonumber
    Project Manager->>Animator: Assigns animation task card (Shot 04)
    Animator->>Asset DAM: Uploads playblast video draft (v1)
    Animator->>Team Lead: Flags task as QA_Review
    Team Lead->>Asset DAM: Reviews file naming, skeleton rig compliance (Technical QA)
    Team Lead->>Director: Approves Technical QA; flags task as Director_Review
    Director->>Asset DAM: Draws visual notes on video; requests minor adjustment
    Animator->>Asset DAM: Uploads adjusted playblast video draft (v2)
    Director->>Client: Approves v2; triggers Client Review Portal notification
    Client->>Client: Frame-checks file; clicks [APPROVE MILESTONE 3]
    Client->>Finance: Trigger sent; Finance system drafts milestone invoice
    Finance->>Client: Sends invoice PDF with online pay link
    Client->>Finance: Settles invoice payment (Stripe/Bank link)
    Finance->>Project Manager: Flags payment complete; unlocks next milestone files
```
