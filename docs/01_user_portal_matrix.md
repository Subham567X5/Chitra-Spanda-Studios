# User Portal Matrix, Journeys, and RBAC Permissions

This document outlines the relationship, target audiences, operational journeys, and access permissions for the 23 dedicated user portals in the Chitraspanda Studios ecosystem.

---

## 1. Complete User Portal Matrix

| Portal ID | Portal Name | Primary Target User | Tenant Level Access | Core Modules Accessed | Primary Business Goal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P-01** | **Super Admin** | Platform Owner / DevOps | Global (Cross-Tenant) | All Modules, System Config, Subscriptions | Platform health, security, tenant management, global logs. |
| **P-02** | **Studio Owner** | Studio CEO / Executive | Studio Tenant | Production, Finance, HR, Academy, BI Reports | Studio profitability, portfolio growth, high-level overview. |
| **P-03** | **Director** | Creative Director / Art Dir. | Studio Tenant (Multi-Project) | Production, Reviews, Assets, Messaging | Creative quality control, approvals, style consistency. |
| **P-04** | **Producer** | Executive Producer | Studio Tenant (Multi-Project) | Production, Finance, Resources, Calendar | Project delivery timeline, budget tracking, resource allocation. |
| **P-05** | **Project Manager**| Production Manager / PM | Studio Tenant (Multi-Project) | Production, Calendar, Reporting, Tasks | Execution of sprints, tasks, risk mitigation, schedules. |
| **P-06** | **Team Lead** | Department Lead (e.g., Rigging) | Studio Tenant (Single Dept) | Production, Tasks, Approvals, Performance | Departmental deliverables, technical supervision, team lead. |
| **P-07** | **Animator** | 3D/2D Animator | Project-Specific / Asset Level | Production, Tasks, Assets, Time Tracker | Shot execution, keyframe creation, feedback loop response. |
| **P-08** | **Designer** | Character/Concept Designer | Project-Specific / Asset Level | Assets, Reviews, Tasks, Version Control | Concept art, models, style guides, asset library uploads. |
| **P-09** | **Storyboard Artist**| Storyboarder / Previs Artist | Project-Specific / Asset Level | Production, Assets, Reviews, Collaboration | Layouts, storyboards, animatics, scene structuring. |
| **P-10** | **Editor** | Video Editor / Compositor | Project-Specific / Asset Level | Assets, Reviews, Export Queue, Messaging | Animatic stitching, final renders compilation, sound sync. |
| **P-11** | **Voice Artist** | Voice Actor / Narrator | Project-Specific / Task Level | Scripts, Uploads, Schedule, Audio Review | Script reading, audio takes uploading, retake feedback. |
| **P-12** | **Freelancer** | External Contractor | Contract-Specific | Tasks, Invoices, Delivery, Portfolio | Execution of outsourced assets, contract submission, invoices. |
| **P-13** | **Client** | Client Project Lead / Reviewer | Client Portal Access | Reviews, Approvals, Invoices, Messaging | Milestone verification, feedback loop, financial signoff. |
| **P-14** | **HR** | HR Manager / Officer | Studio Tenant (Internal HR) | Employees, Leave, Attendance, Payroll, Reviews | Employee lifecycle, benefits, compliance, performance. |
| **P-15** | **Recruiter** | Talent Acquisition / Agent | Recruitment Modules | Jobs, Candidates, Interviews, Pipeline | Candidate sourcing, screening, scheduling, offer processing. |
| **P-16** | **Finance** | Accountant / CFO | Studio Tenant (Finance) | Budgets, Invoices, Expenses, Tax, Payroll | Financial health, invoicing, tax compliance, vendor pay. |
| **P-17** | **Academy Director**| Head of Academy / Dean | Academy Tenant | Courses, Trainers, Students, Revenue | Curricula quality, student throughput, educational revenue. |
| **P-18** | **Trainer** | Course Instructor | Academy Tenant (Class Level) | Lessons, Assignments, Grading, Chat | Lesson delivery, student grading, workshop feedback. |
| **P-19** | **Student** | Academy Student | Class/Course-Specific | Lessons, Quizzes, Certificates, Portfolio | Skill acquisition, assignment completion, portfolio building. |
| **P-20** | **Intern** | Studio Intern / Apprentice | Project-Specific / Class Level | Intern Tasks, Mentor Chat, Weekly Reports | On-the-job training, task execution, log submission. |
| **P-21** | **Mentor** | Senior Supervisor / Guide | Intern-Specific | Intern Reviews, Appraisals, Tasks | Intern guidance, performance evaluations, references. |
| **P-22** | **ID Card Admin** | Security/Facilities Manager | Studio/Campus Tenant | Card Generation, QR Logs, Access Systems | Digital/Physical credentials, campus access management. |
| **P-23** | **Visitor/Public** | General Public / Prospective Client | Public Interface | Website, Portfolio, Careers, Contact Forms | Brand discovery, inquiry submission, job application. |

---

## 2. User Journeys (Onboarding, Daily Loop, Exit)

### P-01: Super Admin
*   **Onboarding**: Configures initial platform deployment parameters, seeds global parameters, and provisions new studio tenant instances.
*   **Daily Loop**: Monitors platform health logs, reviews security alerts, manages tenant subscription accounts, audits global activities.
*   **Exit**: Terminates accounts, manages backups, or transfers platform credentials to another verified Super Admin.

### P-02: Studio Owner
*   **Onboarding**: Registers the studio tenant, links company bank accounts, defines organizational departments, and invites Directors/HR.
*   **Daily Loop**: Reviews high-level studio revenue and budget analytics, tracks active client pipelines, reviews global studio performance.
*   **Exit**: Offboards the studio from the SaaS platform, downloads all company data logs, and initiates data archiving.

### P-03: Director
*   **Onboarding**: Enters the studio, sets creative vision styles and directories, configures project asset folders and visual pipelines.
*   **Daily Loop**: Reviews shots and models in the creative approval queue, provides draw-overs and voice notes, meets with Leads.
*   **Exit**: Archives completed project reference files, evaluates lead performers, and wraps up final visual cut.

### P-04: Producer
*   **Onboarding**: Establishes project scope, structures milestones, sets budgets, and provisions system roles for Project Managers.
*   **Daily Loop**: Reviews financial expenditure charts, adjusts timeline resources, addresses bottlenecks, and sends status reports to clients.
*   **Exit**: Performs final project financial audit, generates delivery reports, and archives the production documentation.

### P-05: Project Manager
*   **Onboarding**: Links tasks to milestones, establishes gantt charts, and configures task categories and sprints.
*   **Daily Loop**: Adjusts task assignments based on workload, updates project risks, coordinates cross-team syncs, resolves blockers.
*   **Exit**: Closes sprint reports, updates PM templates for future runs, and completes post-mortem documents.

### P-06: Team Lead
*   **Onboarding**: Setup department checklists, assigns specific software pipelines, and defines asset approval parameters.
*   **Daily Loop**: Reviews daily animator submittals, provides technical code/asset reviews, balances daily workloads.
*   **Exit**: Performs final technical review of the department's assets and signs off on sprint completion.

### P-07: Animator
*   **Onboarding**: Connects asset creation tools (Maya/Blender), downloads scene rigs, and reads the style guide.
*   **Daily Loop**: Views assigned shots, tracks time spent, uploads playblasts/renders, reviews lead/director feedback, and iterates.
*   **Exit**: Pushes final validated scene files, files timesheets, and gets reallocated to the next project.

### P-08: Designer
*   **Onboarding**: Sets up design libraries, imports reference mood boards, and configures version control preferences.
*   **Daily Loop**: Works on concept arts, textures, and assets; uploads versions to asset library; responds to reviews.
*   **Exit**: Packages design assets into final library folders and submits master designs for archiving.

### P-09: Storyboard Artist
*   **Onboarding**: Reviews scripts, connects sketching tablets, and configures the storyboarding templates and timelines.
*   **Daily Loop**: Draws panels, arranges sequence beats, creates animatics with basic sound, submits sequences for director reviews.
*   **Exit**: Excerpts final storyboard layouts to PDF/XML formats for the layout and animation teams.

### P-10: Editor
*   **Onboarding**: Establishes editing queues, imports audio tracks, visual animatics, and configures production frame rates.
*   **Daily Loop**: Pulls latest shots, updates timelines, inserts voice tracks, exports work-in-progress cuts, highlights audio-visual gaps.
*   **Exit**: Assembles final master cut, conducts final rendering, outputs export formats, and archives sequences.

### P-11: Voice Artist
*   **Onboarding**: Creates profile, tests recording gear calibration, and reviews script dialogue layouts.
*   **Daily Loop**: Selects open recording slots, downloads scripts, uploads audio takes (WAV), views retake notes, submits updates.
*   **Exit**: Signs off on voice deliverables and submits contract invoices to the finance department.

### P-12: Freelancer
*   **Onboarding**: Accepts contract invitations, completes compliance checks, and sets up billing details.
*   **Daily Loop**: Downloads assigned shot files, works offline/online, uploads deliverables, submits daily updates, registers invoices.
*   **Exit**: Submits final files, signs project close-out contracts, and archives local project data.

### P-13: Client
*   **Onboarding**: Signs up via client invitation link, configures company preferences, and meets the designated producer.
*   **Daily Loop**: Reviews milestone playblasts, leaves frame-accurate visual feedback, approves/rejects steps, downloads invoice drafts.
*   **Exit**: Finalizes final project sign-off, downloads master assets, pays final invoice, and completes project feedback survey.

### P-14: HR
*   **Onboarding**: Enters the HR system portal, establishes employee templates, tax settings, and creates company handbooks.
*   **Daily Loop**: Manages leave requests, runs monthly payroll queues, processes new hires, checks attendance logs, and tracks performance.
*   **Exit**: Initiates offboarding workflows, generates exit interview forms, and revokes credentials.

### P-15: Recruiter
*   **Onboarding**: Connects external job boards, designs assessment tests, and drafts applicant pipelines.
*   **Daily Loop**: Creates job postings, screens resumes, schedules interview calendars, rates candidate assessments.
*   **Exit**: Sends out offer letters, transfers successful applicant profiles to the onboarding pipeline.

### P-16: Finance
*   **Onboarding**: Setup ledger categories, taxation percentages, recurring billing cycles, and connects bank APIs.
*   **Daily Loop**: Approves vendor invoices, tracks general employee expenses, verifies client payments, and calculates payroll outputs.
*   **Exit**: Generates quarterly tax records, closes the financial ledger year, and outputs financial audits.

### P-17: Academy Director
*   **Onboarding**: Configures LMS settings, defines academic semesters, invites trainers, and sets enrollment pricing.
*   **Daily Loop**: Reviews student enrollment analytics, tracks trainer activities, manages revenue balances, handles student issues.
*   **Exit**: Issues graduation certificates, evaluates academy performance, and structures next semester.

### P-18: Trainer
*   **Onboarding**: Populates course parameters, structures weeks/modules, uploads lecture videos, and writes quizzes.
*   **Daily Loop**: Grades student assignments, hosts online lecture webinars, monitors student progress, answers questions on forums.
*   **Exit**: Submits final student grades, archives course forums, and updates materials for next session.

### P-19: Student
*   **Onboarding**: Completes enrollment payment, sets up profile details, and views active curriculum maps.
*   **Daily Loop**: Watches video lessons, attempts quizzes, uploads homework assets, participates in forums, tracks progress.
*   **Exit**: Downloads final graduation certificate, exports portfolio works, applies for academy-assisted internships.

### P-20: Intern
*   **Onboarding**: Meets assigned mentor, joins intern slack/forum, and reads internal workflow manuals.
*   **Daily Loop**: Completes training tasks, files daily activity logs, uploads work files, schedules mentor reviews.
*   **Exit**: Submits internship report, undergoes final evaluation, requests certificate of internship completion.

### P-21: Mentor
*   **Onboarding**: Gets matched to interns, establishes weekly review schedules and goals.
*   **Daily Loop**: Reviews intern logs, schedules feedback calls, assigns helper tasks, fills evaluation scores.
*   **Exit**: Files final intern evaluation, writes recommendation letter, and closes the mentorship cycle.

### P-22: ID Card Admin
*   **Onboarding**: Calibrates ID design templates, hooks security hardware (RFID/NFC/QR scanner APIs).
*   **Daily Loop**: Generates and issues digital ID cards to new employees/students, verifies physical scanner logs, manages access rights.
*   **Exit**: Deactivates IDs for offboarded members, checks equipment status, and audits breach logs.

### P-23: Visitor/Public
*   **Onboarding**: Accesses website URL via search engine or marketing link.
*   **Daily Loop**: Browses open vacancies, views studio portfolio videos, fills client contact forms, reads academy course descriptions.
*   **Exit**: Leaves site after registering interest or submitting a job application.

---

## 3. Permission Matrix (RBAC)

The system uses Role-Based Access Control (RBAC) supplemented by Row-Level Security (RLS) to restrict data. Below is the mapping of permissions:

*   `C` = Create, `R` = Read, `U` = Update, `D` = Delete, `--` = No Access

| Portal / Role | System Settings | Project Planning | Task Mgmt | Asset DAM | Client Approvals | HRMS & Payroll | LMS Courses | Finance & Ledgers | ID Card Control |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **01. Super Admin** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **02. Studio Owner** | RU | CRUD | CRUD | CRUD | CRUD | CRUD | RU | RU | CRUD |
| **03. Director** | -- | RU | CRUD | CRUD | CRUD | -- | -- | -- | R |
| **04. Producer** | -- | CRUD | CRUD | CRUD | CRUD | RU | -- | CRUD | R |
| **05. Project Manager**| -- | CRUD | CRUD | CRUD | RU | -- | -- | R | R |
| **06. Team Lead** | -- | R | CRUD | CRUD | RU | -- | -- | -- | R |
| **07. Animator** | -- | -- | RU | CRUD | -- | -- | -- | -- | R |
| **08. Designer** | -- | -- | RU | CRUD | -- | -- | -- | -- | R |
| **09. Storyboard Artist**|-- | -- | RU | CRUD | -- | -- | -- | -- | R |
| **10. Editor** | -- | -- | RU | CRUD | -- | -- | -- | -- | R |
| **11. Voice Artist** | -- | -- | RU | RU | -- | -- | -- | -- | R |
| **12. Freelancer** | -- | -- | RU | RU | -- | -- | -- | R | R |
| **13. Client** | -- | R | -- | RU | CRUD | -- | -- | R | R |
| **14. HR** | R | -- | -- | -- | -- | CRUD | -- | RU | CRUD |
| **15. Recruiter** | -- | -- | -- | -- | -- | RU | -- | -- | R |
| **16. Finance** | -- | -- | -- | -- | R | RU | R | CRUD | R |
| **17. Academy Director**| -- | -- | -- | -- | -- | -- | CRUD | RU | CRUD |
| **18. Trainer** | -- | -- | RU | RU | -- | -- | CRUD | -- | R |
| **19. Student** | -- | -- | -- | RU | -- | -- | RU | R | R |
| **20. Intern** | -- | -- | RU | RU | -- | -- | -- | -- | R |
| **21. Mentor** | -- | -- | RU | RU | -- | -- | -- | -- | R |
| **22. ID Card Admin** | R | -- | -- | -- | -- | R | -- | -- | CRUD |
| **23. Visitor/Public** | -- | -- | -- | -- | -- | -- | R | -- | -- |

### Key RLS (Row-Level Security) Rules Applied
1. **Multi-Tenant Isolation**: Every database query must filter by `tenant_id` (representing the Studio or Academy organization). 
2. **Project Boundaries**: Creative roles (Animators, Designers, storyboards) can only read and write to assets linked to projects they are explicitly assigned to via the `project_members` table.
3. **Financial Isolation**: Freelancer and Client invoicing details are isolated to their specific `user_id` or `client_id` context.
4. **Academy Boundaries**: Trainers can only manage and view grades for students enrolled in classes they are assigned to instruct.
