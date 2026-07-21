# Mobile App Structure and Offline Sync Architecture

This document details the React Native application structure, navigation paths, and offline synchronization mechanisms for Chitraspanda Studios' mobile platform.

---

## 1. Native Mobile Tech Stack

*   **Framework**: **React Native** (using Expo Bare Workflow for device APIs access).
*   **Local Storage**: **WatermelonDB** (SQLite adapter) for reactive, fast local database queries.
*   **Networking**: Axios with interceptors for token renewals and queue synchronization.

---

## 2. Navigation Architecture

The app uses **React Navigation** with a hybrid navigation tree tailored by the logged-in user's role group.

```
                  ┌──────────────────────┐
                  │   Root Stack (Auth)  │
                  └──────────┬───────────┘
                             │ (On Authenticated)
                             ▼
                  ┌──────────────────────┐
                  │ Bottom Tab Navigator │
                  └────┬────┬────────┬───┘
                       │    │        │
      ┌────────────────┘    │        └────────────────┐
      ▼                     ▼                         ▼
[Dashboard Tab]       [Tasks/Courses Tab]       [Messages Tab]
  ├── Stats Card        ├── Task Detail           ├── Peer Chat
  └── Alerts Feed       └── File Submissions      └── Group Channels
```

### Screen Mappings by Role Groups
1.  **Creative Staff (Animators, Storyboard, Design)**:
    *   *Tab 1: Workspace*: Assigned tasks list, time logger widget.
    *   *Tab 2: Reviews*: Frame comments, annotation reader.
    *   *Tab 3: Messages*: Chat with Team Leads and Project Managers.
2.  **Administrative & Management (Owners, HR, Finance, PMs)**:
    *   *Tab 1: Console*: Financial KPIs, project health meters.
    *   *Tab 2: Approvals*: List of pending leaves, invoices, and expense vouchers.
    *   *Tab 3: Chat*: Workspace chat channels.
3.  **Educational (Students, Trainers, Interns)**:
    *   *Tab 1: LMS Desk*: Course list, video playback (with background caching).
    *   *Tab 2: Tasks*: Assignments submissions and grade lists.
    *   *Tab 3: Community*: Study forums.

---

## 3. Offline Synchronization Architecture (WatermelonDB)

To support remote work and weak connectivity, the app caches relational data locally and queues actions.

```
[User Action] ──► [Write to WatermelonDB] ──► [Queue Sync Job]
                                                   │ (Check Internet)
                                                   ▼
┌──────────────────┐  No Connection  ┌──────────────────────────┐
│ Keep In Offline  │◄────────────────  │ Is Network Available?    │
│ Action Registry  │                 └─────────────┬────────────┘
└──────────────────┘                               │ Yes
                                                   ▼
                                     ┌──────────────────────────┐
                                     │ Stream API /sync Endpoint│
                                     └──────────────────────────┘
```

### Sync Engine Protocol
1.  **Local Database Model (SQLite via WatermelonDB)**:
    *   Mirror tables: `local_tasks`, `local_attendance`, `local_messages`, `local_sync_queue`.
2.  **The Sync Payload (`POST /api/v1/sync`)**:
    *   When returning online, the app bundles operations in `local_sync_queue` and POSTs to the server:
```json
{
  "last_pulled_at": 1782192301000,
  "changes": {
    "tasks": {
      "created": [],
      "updated": [
        { "id": "e4f7b038-7f91-4c6e-8263-2b63cb0ef555", "status": "QA_review", "actual_hours": 12.0 }
      ],
      "deleted": []
    },
    "attendance": {
      "created": [
        { "clock_in": "2026-06-22T09:00:00Z", "device_id": "iphone_15", "verification_method": "QR" }
      ],
      "updated": [],
      "deleted": []
    }
  }
}
```
3.  **Conflict Resolution Rule**:
    *   *General metadata*: **Last-Write-Wins** (based on user device timestamps verified against server constraints).
    *   *Creative Assets (FBX, videos)*: Binary file conflicts trigger a push notification to the user requesting manual version retention or branching.

---

## 4. Push Notification Architecture

Push notifications are orchestrated via **Firebase Cloud Messaging (FCM)** (Android) and **Apple Push Notification service (APNs)** (iOS).

### Alert Flow Lifecycle
1.  **Registration**: On application login, the device requests a token from FCM/APNs and uploads it to the user database (`user_devices` table mapping `user_id`, `device_token`, `os`).
2.  **Notification Trigger**: An event occurs in the backend microservice (e.g., Director rejects a shot, Client signs contract).
3.  **Broker Processing**: Downstream service posts notification to Redis event channel.
4.  **Worker Broadcast**: The Notification Worker picks up the event, resolves the recipient's device tokens, and dispatches the payload to FCM/APNs.
5.  **Payload Schema**:
```json
{
  "to": "device_token_hash_abc123",
  "notification": {
    "title": "Creative Review Update",
    "body": "Director Rajesh rejected Shot 04 in Project Mumbai-Run."
  },
  "data": {
    "click_action": "FLUTTER_NOTIFICATION_CLICK",
    "route": "/projects/mumbai-run/shots/04",
    "action_type": "shot_rejected",
    "asset_id": "a9f8b038-7f91-4c6e-8263-2b63cb0ef999"
  }
}
```
