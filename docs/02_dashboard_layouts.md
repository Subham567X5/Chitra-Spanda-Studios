# Dashboard Layouts and Navigation Structures

This document provides user interface blueprints, widget definitions, and sidebar navigation trees for all 23 user portals in the Chitraspanda Studios ecosystem.

---

## Dashboard Layout and Navigation Specifications (P-01 to P-23)

### P-01: Super Admin Portal
*   **Layout Grid**: 3-Column Top Bar (Critical System Status), 2-Column Main Content (Left: Tenant Map; Right: Security Warnings), Full-width bottom table (System Audit logs).
*   **Key Widgets**:
    *   *Total Active Tenants Count* (Single-value counter with percentage shift)
    *   *API Health Indicator* (Real-time latency graph)
    *   *Global Monthly Recurring Revenue (MRR)* (Line graph of subscriptions)
    *   *System Security Warnings Feed* (Aggregated intrusion/rate-limiting block lists)
*   **Navigation Tree**:
    *   `[Dashboard]` Global Monitor
    *   `[Tenants]` Tenant Provisioning & Subscription Tiers
    *   `[User Accounts]` Cross-Tenant Users Directory
    *   `[Subscriptions]` Billing Plans & Gateways
    *   `[Security]` API Logs, Access Controls, Rate-limits
    *   `[Logs]` Immutable Audit Trail
    *   `[Config]` Global Environments & Webhooks

### P-02: Studio Owner Portal
*   **Layout Grid**: 4-Column Top Bar (Financial Indicators), 2-Column Middle Section (Left: Project Progress vs. Cost; Right: Resource Capacity), 1-Column bottom (Client Invoices list).
*   **Key Widgets**:
    *   *Active Studio Revenue vs Budget* (Progress bars + financial values)
    *   *Direct Resource Utilization* (Percentage charts by department)
    *   *Milestone Status Tracker* (Gantt summary showing delayed items)
    *   *Client Satisfaction Index* (Aggregated ratings of recent approvals)
*   **Navigation Tree**:
    *   `[Dashboard]` Studio Overview
    *   `[Analytics]` Financial Reports, ROIs, Costings
    *   `[Projects]` Master Studio Portfolio
    *   `[Clients]` Accounts, Contracts, and Pipelines
    *   `[People]` Studio Departments & Headcount
    *   `[Academy]` Shared Internship/Academy Performance
    *   `[Settings]` Local Studio Config & Bank Details

### P-03: Director Portal
*   **Layout Grid**: Full-width top visual slider (Shots Awaiting Review), 3-Column Mid Grid (Creative Milestones, Team Output, Feedback SLA), 1-Column bottom (Direct Message Board).
*   **Key Widgets**:
    *   *Visual Review Queue* (Interactive frame-scrubbing gallery)
    *   *Creative Milestone Statuses* (Color-coded list of style/art phases)
    *   *Review Bottleneck Alert* (List of shots pending reviews > 24 hours)
    *   *Latest Reference Assets* (Thumbnails of styles, concepts, templates)
*   **Navigation Tree**:
    *   `[Dashboard]` Creative Approvals Queue
    *   `[Review Board]` Frame-by-Frame Annotations & Audio Feedback
    *   `[Style Guide]` Central Art Bible & Reference Library
    *   `[Production Monitoring]` Shot Delivery Timelines
    *   `[Team Chats]` Direct Links to PMs and Team Leads

### P-04: Producer Portal
*   **Layout Grid**: 3-Column Top Grid (Budget, Deadlines, Resource Burn-Rate), Split-screen Center (Left: Project Timelines; Right: Contractor/Freelancer Allocations), Bottom row (Deliverables Checklist).
*   **Key Widgets**:
    *   *Project Budget Burn-Rate* (Cumulative cost lines against forecast)
    *   *Milestone Countdown Timers* (Visual clock widgets for delivery targets)
    *   *Asset Pipeline Status* (High-level dashboard showing complete counts)
    *   *Billing Milestones Status* (Invoicing triggers chart)
*   **Navigation Tree**:
    *   `[Dashboard]` High-Level Production Stats
    *   `[Resource Manager]` Allocation Matrix, Salary Caps, Staffing
    *   `[Schedule Planner]` Milestone Gantt & Deadlines
    *   `[Finances]` Client Billings, Freelancer Costs, Budgets
    *   `[Delivery Hub]` Final Client Package Deliverables

### P-05: Project Manager Portal
*   **Layout Grid**: Kanban Master Board, 2-Column Side Section (Left: Risk Level Indicators; Right: Department Workload Gauges), Bottom Row (Daily Blockers log).
*   **Key Widgets**:
    *   *Team Velocity Charts* (Sprint points completed vs planned)
    *   *Resource Overload Warning* (Lists animators with >8 hours allocated/day)
    *   *Risk Index Matrix* (Red/Yellow/Green issues tracker)
    *   *Blockers List* (Task links flagged as blocked)
*   **Navigation Tree**:
    *   `[Dashboard]` Project Sprints & Workloads
    *   `[Gantt Master]` Inter-task Dependency Timelines
    *   `[Kanban Boards]` Task Management & Assignees
    *   `[Risk & Issues]` Risk Registers and Mitigation Logs
    *   `[Time Tracker]` Timesheet Verification & Approvals

### P-06: Team Lead Portal
*   **Layout Grid**: 3-Column Layout (Left: Member Task Loads; Center: Submissions Review Queue; Right: Department QA Reports), Bottom Row (Sprint Goals progress bar).
*   **Key Widgets**:
    *   *Department Task Load* (Gantt blocks showing team members)
    *   *Technical QA Checklist* (Action list for checking file structures)
    *   *Time-spent vs Estimations* (Accuracy graphs for tasks)
    *   *Latest Team Uploads* (3D files, textures, sound strips)
*   **Navigation Tree**:
    *   `[Dashboard]` Team Tasks & Reviews
    *   `[QA Review Queue]` Code/Asset technical testing
    *   `[Team Directory]` Skill mappings, performance levels
    *   `[Resource Calendar]` Vacation logs & availability
    *   `[Meetings]` Daily standup scheduler

### P-07: Animator Portal
*   **Layout Grid**: Split Screen (Left: Tasks Kanban and shot criteria; Right: Asset Library download panels), Bottom Row (Frame/Shot timeline tracker and local file upload drop zone).
*   **Key Widgets**:
    *   *Assigned Task Card list* (Sorted by urgency)
    *   *Time Logger* (Start/Stop timer and manual input controls)
    *   *Direct Feedback Comments* (Threaded notes from Leads/Directors)
    *   *Reference Playblast Player* (Embedded video player)
*   **Navigation Tree**:
    *   `[Dashboard]` Active Animation Workspace
    *   `[My Shots]` Shot Status Tracker (Layout, Blocking, Polish)
    *   `[Asset Downloader]` Reference models, environments, rigs
    *   `[Feedback Board]` Annotations history
    *   `[Timesheet]` Weekly hour submissions

### P-08: Designer Portal
*   **Layout Grid**: Moodboard Canvas Grid (Concept Art displays), 2-Column Bottom (Left: Task list; Right: Design Library Explorer).
*   **Key Widgets**:
    *   *Visual Palette Explorer* (HEX color palettes and asset tags)
    *   *Git/SVN Version History* (Recent file pushes list)
    *   *Creative Feedback Thread* (Visual notes with sketch overlays)
    *   *Concept Task List* (Requirements files list)
*   **Navigation Tree**:
    *   `[Dashboard]` Creative Design Bench
    *   `[Asset Library]` Textures, Reference photos, Shaders
    *   `[Version Control]` Check-out / Commit histories
    *   `[Task Checklist]` Action requirements
    *   `[Collaborate]` Drawing boards & group chat

### P-09: Storyboard Artist Portal
*   **Layout Grid**: 1-Column Canvas Timeline (Sequential panels view), 2-Column Center (Left: Active Script Screenplay; Right: Drawing/Uploading deck), Bottom row (Audio/Animatic Sync timeline).
*   **Key Widgets**:
    *   *Storyboard Panel Editor* (Drag-and-drop panel sorting)
    *   *Script Parser* (Automated character/location highlighter)
    *   *Animatic Preview Player* (Renders timeline sequence instantly)
    *   *Audio-track sync controller* (Layering voice lines onto panels)
*   **Navigation Tree**:
    *   `[Dashboard]` Script & Storyboard Deck
    *   `[Panels View]` Grid of scenes and frames
    *   `[Animatic Lab]` Timeline synchronization tools
    *   `[Audio library]` Voice recordings & temp sound effects
    *   `[Review Center]` Directors' critiques logs

### P-10: Editor Portal
*   **Layout Grid**: 3-Zone Layout (Top Left: Media pool/Asset explorer; Top Right: Video monitor; Bottom: Multi-track timeline).
*   **Key Widgets**:
    *   *Media Intake Queue* (Highlights newly approved renders)
    *   *Timeline Sync monitor* (Edits comparison dashboard)
    *   *Render Queue* (Server-side rendering progress bar)
    *   *Audio-Waveform analyzer* (Sound level tracker)
*   **Navigation Tree**:
    *   `[Dashboard]` Active Edit Suite
    *   `[Media Bin]` Audio, Video, Renders logs
    *   `[Render Engine]` Exports, Formats, and Presets
    *   `[Timeline Comments]` Review comments linked to timestamps
    *   `[Archives]` Raw clips library

### P-11: Voice Artist Portal
*   **Layout Grid**: Split-Screen (Left: Teleprompter/Script Reader with scroll speed; Right: Recording schedule & file drop-zone), Bottom (Audio analyzer/waveform recorder).
*   **Key Widgets**:
    *   *Recording Prompter* (Interactive text viewer)
    *   *Microphone Input Level* (Live dB signal meter)
    *   *Assigned Script Lines* (Specific files list)
    *   *Retake Log* (Details on audio revisions needed)
*   **Navigation Tree**:
    *   `[Dashboard]` Recording Booth
    *   `[Script Board]` Script downloads and prompt text
    *   `[Audio Takes]` Uploaded WAV/MP3 files list
    *   `[Schedules]` Online recording sessions
    *   `[Payments]` Voice work invoices

### P-12: Freelancer Portal
*   **Layout Grid**: 3-Column Top Bar (Contracts, Open Tasks, Paid Invoices), Main Area (Assigned Project Files & Asset Submission), Bottom (Timesheet & Invoice Generator).
*   **Key Widgets**:
    *   *Contract Terms summary* (Deliverable dates, payment milestones)
    *   *Secure Upload Queue* (Encrypted file check-in)
    *   *Payment Status Dashboard* (Invoiced vs Paid indicator)
    *   *Shared Slack/Forum widget* (Team communications)
*   **Navigation Tree**:
    *   `[Dashboard]` Freelancer Center
    *   `[My Contracts]` PDF Contracts & Agreements
    *   `[Tasks & Assets]` Task descriptions, Asset folders
    *   `[Invoices]` Invoicing templates, tax entries, payments
    *   `[Portfolio]` Upload tools for local work approval

### P-13: Client Portal
*   **Layout Grid**: 2-Column Split (Left: Project Completion Gauge & Milestones timeline; Right: Media Player showing latest review files), Bottom row (Contracts, Invoices, Messages).
*   **Key Widgets**:
    *   *Project Completion Progress* (Radial gauge linked to milestones)
    *   *Awaiting Approval Screen* (Allows Frame comments, "Approve" button)
    *   *Invoices Overview* (Downloadable PDF summaries with "Pay Now" links)
    *   *Direct Producer Chat* (Pinned chat sidebar)
*   **Navigation Tree**:
    *   `[Dashboard]` Client Portal Welcome
    *   `[Deliverables]` Reviews, Comments, Approvals
    *   `[Billing]` Invoices, Quotes, Receipts
    *   `[Legal]` NDA and Contract PDFs
    *   `[Files]` Download links for approved high-res masters
    *   `[Support]` Chat and Support Tickets

### P-14: HR Portal
*   **Layout Grid**: 4-Column Top Bar (Staff Count, Leave Requests, Open Positions, Active Payroll value), 2-Column Center (Left: Attendance Logs & Leave approvals; Right: Performance cycles tracker), Bottom (Employee directory).
*   **Key Widgets**:
    *   *Employee Attendance Map* (Real-time login status logs)
    *   *Leave Request Queue* (Review/approve list)
    *   *Payroll Run Progress* (Visual wizard to process salary deposits)
    *   *Performance Review Metrics* (Completion rates per department)
*   **Navigation Tree**:
    *   `[Dashboard]` HR Command Center
    *   `[Employee Directory]` Profiles, Attendance, Salaries
    *   `[Leave Manager]` Time-off approvals & policies
    *   `[Payroll Hub]` Salary sheets, tax calculations, bonuses
    *   `[Performance]` Performance reviewcycles, ratings
    *   `[Policy]` Handbooks, standard contracts

### P-15: Recruiter Portal
*   **Layout Grid**: Kanban Pipeline (Applied -> Screened -> Interview -> Offered), 2-Column Side (Left: Active Vacancies; Right: Interview Calendar), Bottom (Recent candidate messages).
*   **Key Widgets**:
    *   *Candidate Pipeline Board* (Drag-and-drop status board)
    *   *Assessment Scores Radar Chart* (Visual comparison of applicants)
    *   *Interview Calendar* (Daily agenda with video link attachments)
    *   *Job Board Channels* (Sync indicators for LinkedIn, Indeed, etc.)
*   **Navigation Tree**:
    *   `[Dashboard]` Recruitment Pipeline
    *   `[Jobs Manager]` Postings, Specifications, Platforms
    *   `[Candidate DB]` Database of applicants, resumes, scores
    *   `[Interviews]` Scheduling, Feedback forms, Video link integrations
    *   `[Offers]` Salary offers tracker and pre-onboarding templates

### P-16: Finance Portal
*   **Layout Grid**: 3-Column Financial Status (Incoming, Outgoing, Cash Flow), Split-screen Center (Left: Invoices ledger; Right: Employee expense audits), Bottom (Tax indicators).
*   **Key Widgets**:
    *   *Revenue vs Expense Chart* (Dual bar graphs)
    *   *Expense Audits Pending* (List of receipts needing approval)
    *   *Tax Reserve Estimator* (Real-time tax values calculation)
    *   *Aging Receivables Report* (Highlights client unpaid invoices)
*   **Navigation Tree**:
    *   `[Dashboard]` Financial Ledger
    *   `[Receivables]` Client Invoices, Payments tracking
    *   `[Payables]` Vendor bills, Freelancer payout, expense approvals
    *   `[Payroll Engine]` HR-linked salary disbursements
    *   `[Reports]` Balance sheets, Cash Flow statements, Taxes
    *   `[Integrations]` Bank accounts & payment gateways config

### P-17: Academy Director Portal
*   **Layout Grid**: 4-Column stats (Students Enrolled, Faculty Count, Course Revenue, Graduation Rate), 2-Column Center (Left: Top Performing Courses; Right: Trainer Activity Charts), Bottom (LMS revenue ledger).
*   **Key Widgets**:
    *   *Revenue analytics* (Tuition fees collection timeline)
    *   *Course Enrollment status* (Bar graph of student levels per subject)
    *   *Trainer Activity SLA* (Time taken to grade assignments)
    *   *Certification Tracker* (Certificates issued counter)
*   **Navigation Tree**:
    *   `[Dashboard]` Academy Command Center
    *   `[Courses Master]` Curriculum plans & syllabus database
    *   `[Faculty Directory]` Trainer accounts, course loads
    *   `[Student Registry]` Enrolled profiles, grades, financial records
    *   `[Revenue Reports]` Fee structure audits
    *   `[Intern Program]` Student-to-Intern matching

### P-18: Trainer Portal
*   **Layout Grid**: 2-Column Split (Left: Classroom Assignment Grading Board; Right: Class calendar and lessons planner), Bottom (Student progress monitor).
*   **Key Widgets**:
    *   *Pending Grades Queue* (Count of student submittals with SLA indicators)
    *   *Student Progress alerts* (Flags students who missed lectures)
    *   *Curriculum Calendar* (Active lecture schedules)
    *   *Interactive Lesson Editor* (Module text and video file linker)
*   **Navigation Tree**:
    *   `[Dashboard]` Trainer Desk
    *   `[My Courses]` Active syllabus, lecture contents
    *   `[Grading Center]` Assignment review, feedback box, grades
    *   `[Classroom Chat]` Forum discussion, direct Q&A
    *   `[Webinars]` Video lecture streaming tool

### P-19: Student Portal
*   **Layout Grid**: 3-Column Top Bar (Active Course % Done, Next Assignment Due, Attendance Record), Center Split (Left: Syllabus Modules & Videos; Right: Quizzes & Grades Hub), Bottom (Interactive Portfolio).
*   **Key Widgets**:
    *   *Course Progress Wheel* (Radial progress indicator)
    *   *Assignment Submission Drop-Zone* (Drag-and-drop file upload)
    *   *Grade Cards* (Visual cards detailing assignment scores)
    *   *Internship Pipeline Portal* (Application portal for internships)
*   **Navigation Tree**:
    *   `[Dashboard]` Student LMS Main
    *   `[My Courses]` Video lessons, worksheets, references
    *   `[Assignments]` Quizzes, Homework tasks, Grade history
    *   `[My Portfolio]` Upload space for academy projects
    *   `[Internships]` Available positions, application forms
    *   `[Community]` Student forums and Trainer chats

### P-20: Intern Portal
*   **Layout Grid**: Split-Screen (Left: Assigned Studio Production Tasks; Right: Mentor feedback and review panel), Bottom (Weekly report generator and upload deck).
*   **Key Widgets**:
    *   *Intern Tasks List* (Tasks assigned to them in production)
    *   *Weekly Log Sheet* (Text editor for writing logs + submit button)
    *   *Mentor Rating widget* (Recent evaluations feedback)
    *   *Mentor Direct Chat* (Pinned chat widget)
*   **Navigation Tree**:
    *   `[Dashboard]` Intern Studio Bench
    *   `[My Production Tasks]` Active tasks, reference materials
    *   `[Weekly Reports]` Reports submissions and status
    *   `[Mentor Evaluations]` Performance feedback
    *   `[Certificates]` Internship completion documents

### P-21: Mentor Portal
*   **Layout Grid**: 3-Column Layout (Left: Assigned Intern Profiles; Center: Daily/Weekly Logs Review; Right: Task allocator), Bottom (Evaluation form builder).
*   **Key Widgets**:
    *   *Intern Work Log Queue* (Approve/Reject intern weekly logs)
    *   *Intern Task Assigner* (Create task cards for interns)
    *   *Evaluation scoring widget* (Rubric metrics slider)
    *   *Quick Recommendation Builder* (Select traits and generate letters)
*   **Navigation Tree**:
    *   `[Dashboard]` Mentor Station
    *   `[My Interns]` Intern progress trackers & profiles
    *   `[Log Reviews]` Intern log sheet approvals
    *   `[Task Board]` Task lists for training projects
    *   `[Appraisals]` Quarterly ratings, evaluations, referrals

### P-22: ID Card Administrator Portal
*   **Layout Grid**: Split-Screen (Left: Active ID Request Queue; Right: Camera capture & barcode designer), Bottom (Real-time facility access log feed).
*   **Key Widgets**:
    *   *ID Request Feed* (Profiles needing cards)
    *   *Card Template Designer* (Upload background, drag fields)
    *   *QR/NFC encoder status* (System hardware status checks)
    *   *Live Access Scan Logs* (Scroll of employee scans)
*   **Navigation Tree**:
    *   `[Dashboard]` Security Access Control
    *   `[Generate Cards]` Profile selectors & badge printer triggers
    *   `[Access Controls]` RFID/NFC device IP mapper, schedules
    *   `[Activity Logs]` Scan records database
    *   `[Security Alerts]` Flags unrecognized card scans

### P-23: Visitor/Public Portal
*   **Layout Grid**: Landing page Hero Section (Interactive Showreel), 3-Column Middle Grid (Studio Services, Academy Programs, Portfolio Categories), Footer (Contact forms & Career openings).
*   **Key Widgets**:
    *   *Showreel Player* (Cinematic video background player)
    *   *Active Career Openings list* (Searchable jobs feed)
    *   *Contact & Query form* (Name, email, message forms with CAPTCHA)
    *   *Client Inquiry Wizard* (Select budget, timeline, project style)
*   **Navigation Tree**:
    *   `[Home]` Portfolio showreel, testimonials
    *   `[Services]` Animation, design, storyboards, voice overs
    *   `[Academy]` LMS courses introduction
    *   `[Careers]` Current vacancy applications
    *   `[About Us]` History, team, locations
    *   `[Contact]` Inquiries and support routes
