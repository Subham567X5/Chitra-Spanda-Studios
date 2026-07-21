# UI/UX Wireframe and Design System Specifications

This document outlines the UI/UX design tokens, animations, and visual layouts for the key dashboards of Chitraspanda Studios.

---

## 1. Design System Tokens

The visual design system of Chitraspanda Studios leverages a **Futuristic Glassmorphic Dark Theme** to present a high-end, premium aesthetic suited for creative animation environments.

### Color Palette (Tailored HSL & Hex)
*   **Base Background**: Slate Dark (`#0B0F19` / `hsl(222, 40%, 7%)`)
*   **Surface Card**: Translucent Blue Slate (`#161E2E` / `hsl(218, 35%, 14%)`, `opacity: 75%`, backdrop-filter `blur(12px)`)
*   **Border Accent**: Glass Border (`rgba(255, 255, 255, 0.08)`)
*   **Primary Brand Highlight**: Neon Purple to Cyan Gradient:
    *   Purple Start: `#6D28D9` (`hsl(263, 70%, 50%)`)
    *   Cyan End: `#06B6D4` (`hsl(189, 94%, 43%)`)
*   **Status Color Indicators**:
    *   *Success (Approved)*: Emerald Green (`#10B981` / `hsl(159, 79%, 40%)`)
    *   *Warning (In Review)*: Golden Amber (`#F59E0B` / `hsl(38, 92%, 50%)`)
    *   *Danger (Blocked)*: Neon Coral (`#EF4444` / `hsl(0, 84%, 60%)`)

### Typography
*   **Heading Fonts**: Google Fonts **"Outfit"** (Sans-Serif, weights: 500, 600, 700) for screen titles, metrics values, and promotional headers.
*   **Body & Interface Font**: Google Fonts **"Inter"** (Sans-Serif, weights: 400, 500, 600) for reading text, tables, inputs, and code listings.

### Micro-Animations
*   **Interactive Cards Hover**:
    ```css
    transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.25s ease;
    /* Hover state */
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(6, 182, 212, 0.15);
    ```
*   **Feedback Pulse**: Loading states and recording cues feature a slow glow animation:
    ```css
    animation: glow-pulse 1.8s infinite ease-in-out;
    @keyframes glow-pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; filter: drop-shadow(0 0 8px #6D28D9); }
      100% { opacity: 0.6; }
    }
    ```

---

## 2. Text-Based Wireframe Specifications

### A. Super Admin Dashboard (Global System Control)
```
+---------------------------------------------------------------------------------------+
|  LOGO  [Search Global Tenants...]                    (Bell) (MFA: ON) [Admin Profile] |
+---------------------------------------------------------------------------------------+
| (Sidebar)  |  GLOBAL MONITOR                                                         |
| Dashboard  |  +--------------------------------------------------------------------+ |
| Tenants    |  | [Active Tenants: 42]   [Total CPU: 18%]   [API Latency: 24ms]      | |
| Users      |  +--------------------------------------------------------------------+ |
| Billing    |  | SYSTEM RESOURCE LOAD (Graph)            | GLOBAL REVENUE (Bar Chart) | |
| Security   |  | .-------------------------------------. | .------------------------. | |
| Logs       |  | |                                     | | |                        | | |
| Settings   |  | '-------------------------------------' | '------------------------' | |
|            |  +--------------------------------------------------------------------+ |
|            |  | RECENT PLATFORM AUDITS                                             | |
|            |  | Time     | Tenant        | User    | Action           | Status     | |
|            |  | 09:12:00 | mumbai-studio | owner@..| Provision Tenant | SUCCESS    | |
|            |  | 09:14:02 | delhi-studio  | pm@del..| Delete Task      | SUCCESS    | |
|            |  +--------------------------------------------------------------------+ |
+------------+--------------------------------------------------------------------------+
```

### B. Animator Workspace (Task & DAM Interface)
```
+---------------------------------------------------------------------------------------+
|  STUDIO LOGO  [Assigned Project: Mumbai-Run]          (Alert) (Time: 04:12) [Animator] |
+---------------------------------------------------------------------------------------+
| (Sidebar)  |  MY ACTIVE TASK: "Run Cycle - Hero Character"                           |
| Tasks      |  +-------------------------------------+------------------------------+ |
| Shots      |  | PLAYBLAST PLAYER [Video Monitor]    | ACTIVE TASK SPECIFICATIONS   | |
| Library    |  | .---------------------------------. | - Due: July 15, 2026         | |
| Feedback   |  | |                                 | | - Resolution: 24 FPS         | |
| Timesheets |  | |  [ > Play ]                     | | - Focal Length: 35mm         | |
|            |  | '---------------------------------' | - Skeleton Bones: 92 Joints  | |
|            |  +-------------------------------------+------------------------------+ |
|            |  | SUBMIT FILE [Drag & Drop FBX here]  | THREADED FEEDBACK COMMENTS   | |
|            |  | +---------------------------------+ | [Director] 09:15 :           | |
|            |  | |      (Upload Icon)              | | "Add squash at frame 12"   | |
|            |  | |   Select from local drive       | | [Reply...]                 | |
|            |  | +---------------------------------+ |                              | |
+------------+--------------------------------------------------------------------------+
```

### C. Client Approval Portal
```
+---------------------------------------------------------------------------------------+
|  CLIENT SPACE  [Project: TV-Commercial-A]              (Invoices) (Chat) [Client Profile]|
+---------------------------------------------------------------------------------------+
| (Sidebar)  |  MILESTONE 3: Polish & Rendering Review                                  |
| Welcome    |  +-------------------------------------+------------------------------+ |
| Reviews    |  | SHOT REVIEW SCREEN                  | FRAME COMMENTARY & ACTIONS   | |
| Billing    |  | .---------------------------------. | [X] Pinned Frame: 124        | |
| Contracts  |  | |                                 | | Comment: "Colors look dark | |
| Deliveries |  | |  [ > Frame scrubbing timeline ] | | on the shadow parts."       | |
|            |  | '---------------------------------' | +--------------------------+ |
|            |  +-------------------------------------+ | [ APPROVE MILESTONE ]      | |
|            |  | CONTRACT & BILLING CORNER           | | [ REQUEST RETAKE ]         | |
|            |  | - Next Payment: $15,000 due July 22  | +--------------------------+ |
|            |  | - [Download Contract PDF]           |                              | |
+------------+--------------------------------------------------------------------------+
```
*(All screens resize dynamically down to mobile breakpoints, stacking layout columns into a single vertical scrolling column. Form inputs expand to fill screen width, and sidebars collapse into a slide-out hamburger menu)*
