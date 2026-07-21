# API Gateway and Endpoint Interface Design

This document describes the API architecture for Chitraspanda Studios, detailing routing patterns, request headers, and REST/GraphQL endpoints with complete JSON payloads.

---

## 1. API Gateway Architecture

The entry point for all client requests (Web and Mobile) is an **API Gateway** (e.g., Kong, AWS API Gateway, or custom Envoy instance).

```
[Web App / Mobile] 
       │ (HTTPS / WSS)
       ▼
┌────────────────────────────────────────────────────────┐
│                      API GATEWAY                       │
│  - SSL Termination                                     │
│  - JWT Verification & Custom Claims Extraction         │
│  - Rate Limiting (Redis-backed Token Bucket)           │
│  - Tenant Route Resolving (via Subdomain mapping)      │
└────────────────────────────────────────────────────────┘
       │ (gRPC / Internal HTTP)
       ├───────────────────────┼────────────────────────┐
       ▼                       ▼                        ▼
[Production Service]    [HRMS & Finance]       [AI Assistant Gateway]
```

### Global Headers Required
Every request forwarded from the API Gateway to downstream microservices contains:
*   `Authorization`: `Bearer <JWT_Token>`
*   `X-Tenant-ID`: `c1f7b038-7f91-4c6e-8263-2b63cb0ef3e8`
*   `X-User-ID`: `9018b038-7f91-4c6e-8263-2b63cb0ef007`
*   `X-User-Role`: `animator`

---

## 2. API Endpoint Specifications

### A. Authentication Service
Handles login, multi-factor authentication, and token issuance.

#### 1. Login Authentication
*   **Path**: `POST /api/v1/auth/login`
*   **Request Payload**:
```json
{
  "email": "user@chitraspanda.com",
  "password": "SecurePassword123!",
  "subdomain": "mumbai-studio"
}
```
*   **Response (200 OK - MFA Required)**:
```json
{
  "status": "mfa_required",
  "mfa_ticket": "mfa_tk_981273912",
  "message": "Please enter your multi-factor verification code."
}
```
*   **Response (401 Unauthorized)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid email, password, or subdomain mismatch."
}
```

#### 2. Verify MFA Code
*   **Path**: `POST /api/v1/auth/mfa/verify`
*   **Request Payload**:
```json
{
  "mfa_ticket": "mfa_tk_981273912",
  "code": "582109"
}
```
*   **Response (200 OK - Success)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "ref_8127391823192",
  "user": {
    "user_id": "9018b038-7f91-4c6e-8263-2b63cb0ef007",
    "email": "user@chitraspanda.com",
    "full_name": "Rajesh Kumar",
    "role": "animator",
    "tenant_id": "c1f7b038-7f91-4c6e-8263-2b63cb0ef3e8"
  }
}
```

---

### B. Digital Asset Management (DAM) Service
Enables asset staging, version registration, and retrieval.

#### 1. Initiate Asset Upload (Get Pre-signed S3 URL)
*   **Path**: `POST /api/v1/assets/upload/initiate`
*   **Request Payload**:
```json
{
  "project_id": "b3e8b038-7f91-4c6e-8263-2b63cb0ef4a9",
  "file_name": "character_walk_cycle.fbx",
  "file_size": 25489102,
  "file_type": "fbx",
  "parent_asset_id": null
}
```
*   **Response (201 Created)**:
```json
{
  "asset_id": "a9f8b038-7f91-4c6e-8263-2b63cb0ef999",
  "upload_url": "https://s3.ap-south-1.amazonaws.com/chitraspanda-assets/uploads/a9f8b038-7f91-4c6e-8263-2b63cb0ef999.fbx?AWSAccessKeyId=...",
  "fields": {
    "key": "uploads/a9f8b038-7f91-4c6e-8263-2b63cb0ef999.fbx",
    "policy": "ey..."
  }
}
```

#### 2. Confirm Upload & Add Technical Metadata
*   **Path**: `POST /api/v1/assets/upload/confirm`
*   **Request Payload**:
```json
{
  "asset_id": "a9f8b038-7f91-4c6e-8263-2b63cb0ef999",
  "upload_status": "success",
  "mesh_properties": {
    "poly_count": 12842,
    "rigged": true,
    "bones_count": 92
  }
}
```
*   **Response (200 OK)**:
```json
{
  "status": "registered",
  "asset_id": "a9f8b038-7f91-4c6e-8263-2b63cb0ef999",
  "version": 1,
  "queue_status": "queued_for_render_transcode"
}
```

---

### C. Project Management & Task Service
Used to balance tasks and schedules.

#### 1. Create a Project Task
*   **Path**: `POST /api/v1/projects/{project_id}/tasks`
*   **Request Payload**:
```json
{
  "name": "Animate Scene 04 Hook",
  "description": "Animate the primary character jumping from roof, focus on weight dynamics.",
  "assigned_to": "9018b038-7f91-4c6e-8263-2b63cb0ef007",
  "priority": "high",
  "due_date": "2026-07-15",
  "estimated_hours": 18.5
}
```
*   **Response (201 Created)**:
```json
{
  "task_id": "e4f7b038-7f91-4c6e-8263-2b63cb0ef555",
  "project_id": "b3e8b038-7f91-4c6e-8263-2b63cb0ef4a9",
  "status": "todo",
  "created_at": "2026-06-22T21:15:00Z"
}
```

---

### D. Finance Service
Tracks payments and operational costs.

#### 1. Create Client Invoice
*   **Path**: `POST /api/v1/finance/invoices`
*   **Request Payload**:
```json
{
  "client_id": "8018b038-7f91-4c6e-8263-2b63cb0ef111",
  "project_id": "b3e8b038-7f91-4c6e-8263-2b63cb0ef4a9",
  "amount": 15000.00,
  "currency": "USD",
  "tax_rate": 18.00,
  "issue_date": "2026-06-22",
  "due_date": "2026-07-22"
}
```
*   **Response (201 Created)**:
```json
{
  "invoice_id": "f5f7b038-7f91-4c6e-8263-2b63cb0ef666",
  "invoice_number": "CP-2026-0891",
  "total_with_tax": 17700.00,
  "status": "draft",
  "pdf_generation_status": "in_progress"
}
```

---

### E. HRMS Attendance Service
Validates security credentials.

#### 1. Clock In via QR Scan
*   **Path**: `POST /api/v1/hrms/attendance/clock-in`
*   **Request Payload**:
```json
{
  "qr_verification_token": "qr_tok_829319230192a",
  "device_id": "iphone_15_pro_dev_98213",
  "gps_coords": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```
*   **Response (200 OK)**:
```json
{
  "attendance_id": "e9f7b038-7f91-4c6e-8263-2b63cb0ef777",
  "clock_in_time": "2026-06-22T09:00:03Z",
  "status": "verified_present"
}
```
*   **Response (403 Forbidden - QR Out of Date / Spoofed Location)**:
```json
{
  "error": "ACCESS_DENIED",
  "message": "QR token expired or GPS mismatch with active site boundary."
}
```

---

### F. AI Assistant Service
An intelligent system integrated into all roles.

#### 1. Submit Prompt to AI Studio Assistant
*   **Path**: `POST /api/v1/ai/prompt`
*   **Request Payload**:
```json
{
  "role_context": "director",
  "current_project_id": "b3e8b038-7f91-4c6e-8263-2b63cb0ef4a9",
  "prompt": "Evaluate the speed of shot 04 of project X and write a formal critique for the animation lead focusing on character momentum."
}
```
*   **Response (200 OK - Streaming response text is simulated via Server-Sent Events SSE, or JSON output)**:
```json
{
  "response_text": "Based on the recent playblast for Shot 04: The character's descent lacks sufficient weight at frames 12-18. I recommend adding a 2-frame anticipation squash before the jump and extending the landing recovery by 3 frames to convey proper scale. Drafted message: 'Hi Team Lead, creative review of Shot 04 indicates momentum needs tuning. Please adjust character drop velocity...' ",
  "tokens_used": 342,
  "confidence_score": 0.94
}
```

---

## 3. GraphQL API Scheme (Alternate for Complex Frontend Querying)

GraphQL is utilized for loading dashboard views (e.g., Project Manager task grids, Trainer student registries) to prevent REST over-fetching.

```graphql
type Task {
  id: ID!
  name: String!
  status: String!
  priority: String!
  dueDate: String
  assignee: User
}

type User {
  id: ID!
  fullName: String!
  email: String!
  role: String!
}

type Project {
  id: ID!
  name: String!
  status: String!
  tasks(status: String): [Task!]!
  members: [User!]!
}

type Query {
  getProjectDetails(id: ID!): Project
  getPendingReviews(userId: ID!): [Task!]!
}

type Mutation {
  assignTask(taskId: ID!, userId: ID!): Task!
  updateTaskStatus(taskId: ID!, status: String!): Task!
}
```
