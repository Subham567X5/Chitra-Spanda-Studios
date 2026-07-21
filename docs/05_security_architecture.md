# Security Architecture & Audit Logging Specifications

This document outlines the security controls, authentication standards, and data protection mechanisms configured to keep Chitraspanda Studios resilient and compliant.

---

## 1. Identity & Access Management (IAM)

The platform implements a centralized Identity Provider (IdP) utilizing **Keycloak** or an **Auth0**-compatible OpenID Connect (OIDC) protocol.

```
                  ┌──────────────────────┐
                  │   OIDC Auth Server   │
                  └──────────┬───────────┘
                             │
            1. Auth Request  │  2. Return JWT Access Token
                             ▼
┌──────────────┐     ┌───────────────┐     ┌────────────────┐
│  Client App  ├────►│  API Gateway  ├────►│ Microservices  │
└──────────────┘     └───────────────┘     └────────────────┘
                     Validate Signature     Validate Scope/Tenant
```

*   **OAuth2 / OIDC Flow**: Single Page Apps (Next.js) and Mobile Apps (React Native) use the **Authorization Code Flow with Proof Key for Code Exchange (PKCE)**.
*   **Token Strategy**:
    *   **Access Token**: Short-lived JWTs (15-minute expiration) signed via **RS256** asymmetric keys. Tokens contain claims for `tenant_id`, `role_id`, and `user_id`.
    *   **Refresh Token**: Long-lived tokens (7-day expiration) stored in secure, `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
*   **Multi-Factor Authentication (MFA)**:
    *   Enforced for all administrative and finance accounts.
    *   Supports Time-based One-time Passwords (TOTP) via Google Authenticator or Microsoft Authenticator.
    *   Fallbacks include SMS verification codes (via Twilio Integration).

---

## 2. Encryption Standards

Chitraspanda Studios protects data in transit and at rest using modern cryptographic algorithms.

### In Transit
*   **Protocols**: Enforced **TLS 1.3** for all HTTPS API endpoints and WebSockets (WSS).
*   **Certificates**: Managed Wildcard SSL certificates (`*.chitraspanda.com`) renewed automatically via Let's Encrypt.
*   **Cipher Suites**: Modern ciphers only (e.g., `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`).

### At Rest
*   **Database Encryption**: Transparent Data Encryption (TDE) enabled on PostgreSQL and MongoDB instances.
*   **Application-Level Encryption**: Sensitive data (such as bank details, tax numbers, and contract URLs) are encrypted before write using **AES-256-GCM** with keys managed by a cloud Key Management Service (KMS).
*   **Asset Storage**: S3 buckets require Default Encryption using KMS-managed customer keys (`aws:kms`). Files are accessible only via time-limited, pre-signed URLs.

---

## 3. Network Security & Policies

*   **Cross-Origin Resource Sharing (CORS)**: Strict origin validation. Only registered tenant domains (e.g., `https://mumbai-studio.chitraspanda.com`) and local development origins (during debugging) are permitted. Wildcards (`*`) are blocked on authenticated paths.
*   **Rate Limiting**: Defends against brute-force and Denial of Service (DoS) attacks at the API Gateway using a **Redis-backed Token Bucket** algorithm:
    *   *Public Endpoints (e.g., Contact forms, job board)*: 10 requests/minute per IP.
    *   *Authenticated APIs (e.g., Asset uploads, dashboards)*: 120 requests/minute per user session.
    *   *Auth attempts (Login, MFA verify)*: 5 requests/minute per email identifier.

---

## 4. Audit Logging & Activity Tracking

All operations that alter the state of system configurations, access permissions, financial records, or user accounts are logged to an immutable data partition.

### Audit Log Schema
Each audit log record must conform to the following JSON schema before committing to PostgreSQL or Elasticsearch:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AuditLogEvent",
  "type": "OBJECT",
  "properties": {
    "log_id": { "type": "STRING", "format": "uuid" },
    "timestamp": { "type": "STRING", "format": "date-time" },
    "tenant_id": { "type": "STRING", "format": "uuid" },
    "actor": {
      "type": "OBJECT",
      "properties": {
        "user_id": { "type": "STRING", "format": "uuid" },
        "email": { "type": "STRING" },
        "role": { "type": "STRING" }
      },
      "required": ["user_id", "email", "role"]
    },
    "action": { "type": "STRING" }, 
    "resource": { "type": "STRING" },
    "status": { "type": "STRING", "enum": ["SUCCESS", "FAILED"] },
    "network_context": {
      "type": "OBJECT",
      "properties": {
        "ip_address": { "type": "STRING" },
        "user_agent": { "type": "STRING" }
      },
      "required": ["ip_address"]
    },
    "change_details": {
      "type": "OBJECT",
      "properties": {
        "fields_changed": {
          "type": "ARRAY",
          "items": {
            "type": "OBJECT",
            "properties": {
              "field_name": { "type": "STRING" },
              "old_value": { "type": "STRING" },
              "new_value": { "type": "STRING" }
            }
          }
        }
      }
    }
  },
  "required": ["log_id", "timestamp", "tenant_id", "actor", "action", "resource", "status", "network_context"]
}
```

### Action Category Guidelines
1.  **System Audits**: Track changes to Tenant Subscription Plan, MFA disabling, IP Whitelist alterations.
2.  **Financial Audits**: Track Invoice generation, Freelancer payments processing, Budget modifications.
3.  **Creative Asset Audits**: Track download of high-resolution video cuts, delete of models, and permission overrides.
