# Smart OPD System - Milestone 1 Project Report

## 1. Project Overview
The Smart OPD System aims to digitize and streamline the Outpatient Department (OPD) experience. This milestone focuses on the foundational components: a responsive frontend design for both patients (PWA) and hospital staff (Web App), alongside a robust core backend architecture to manage patients, visits, and queues.

## 2. Milestone 1 Objectives
*   **Frontend Design:** Develop user interfaces for the Patient Progressive Web App (PWA) and the Hospital Staff Web App.
*   **Base Backend Build:** Design and implement the core database schema, RESTful APIs, and basic authentication workflows.
*   **Integration:** Establish the initial connection between the frontends and the backend services.

## 3. Implemented Features & Architecture

### 3.1. Frontend Design (Patient PWA & Hospital Web App)
We have implemented specialized interfaces for the two main user groups, built using React, Vite, and Tailwind CSS.

*   **Patient PWA (Progressive Web App):**
    *   Designed with a mobile-first approach, constrained to a mobile viewport even on desktop for a consistent app-like experience.
    *   **Features:** Landing page, User Registration/Login flow, Dashboard with real-time queue status, and Triage/Symptoms submission.
    *   *Screenshot Requirement:*
        *   ![PWA Landing Page](file:///E:/OPD%20Gateway/screenshots/pwa_landing.png)
        *   ![Patient Registration / Login Page](file:///E:/OPD%20Gateway/screenshots/pwa_login.png)
        *   ![PWA Dashboard](file:///E:/OPD%20Gateway/screenshots/pwa_dashboard.png)

*   **Hospital Staff Web App:**
    *   A desktop-optimized dashboard for reception staff and administrators to manage patient flow.
    *   **Features:** Live operations dashboard, patient registration form with backend integration, and a live queue management table.
    *   *Screenshot Requirement:*
        *   ![Staff Operations Dashboard](file:///E:/OPD%20Gateway/screenshots/staff_dashboard.png)
        *   ![New Patient Registration Form](file:///E:/OPD%20Gateway/screenshots/staff_register.png)
        *   ![Live Queue Table](file:///E:/OPD%20Gateway/screenshots/staff_queue.png)

### 3.2. Base Backend Build & Database Schema
The backend is built using Node.js and Express, integrated with Supabase for PostgreSQL database management and Authentication.

*   **Database Schema (Supabase):**
    *   Core tables established: `profiles`, `user_roles`, `hospitals`, `departments`, `patients`, `visits`, and `queue_tickets`.
    *   Relationships defined to link patients to visits and visits to their respective queue tickets.
    *   *Screenshot/Diagram Requirement:*
        *   `[Insert Screenshot: Supabase Database Schema / Table Definitions]`

*   **RESTful APIs:**
    *   Implemented endpoints for managing the core workflow:
        *   `/api/v1/patients` (POST, GET, PATCH)
        *   `/api/v1/visits` (POST, GET, PATCH)
        *   `/api/v1/queue` (GET, PATCH status updates)
    *   Added a specific patient-facing endpoint (`/queue/my-status`) to securely serve active ticket data to the PWA.

*   **Authentication & Role-Based Access Control (RBAC):**
    *   Supabase Auth integrated for secure user sessions.
    *   Custom `authorize` middleware implemented to protect routes based on `user_roles` (e.g., ensuring only PATIENTs can access their specific endpoints, while STAFF/ADMIN manage the queue).
    *   *API Response Example (GET /api/v1/queue):*
        ```json
        {
          "success": true,
          "data": [
            {
              "id": "tkt-001",
              "token": "A001",
              "status": "WAITING",
              "priority": "normal",
              "departments": { "name": "General Medicine" },
              "visits": { "patients": { "full_name": "Jane Doe" } }
            }
          ]
        }
        ```

### 3.3. Core Workflow Integration
The frontend applications are successfully wired to the backend API.

*   **Registration Flow:** When staff register a patient via the Web App, the system successfully hits `POST /patients` to create the record, and `POST /visits` which automatically generates a queue ticket on the backend.
*   **Queue Updates:** The Staff Web App can actively update the status of a patient in the queue (Waiting -> Called -> In Progress -> Completed), and these changes are reflected in the database.

## 4. Challenges & Resolutions
*   **Challenge:** Ensuring the Patient PWA maintains a strict mobile layout on desktop browsers.
    *   **Resolution:** Implemented a locked viewport constraint using a maximum width wrapper (`max-w-md`) and calculated viewport heights (`100dvh`).
*   **Challenge:** Routing conflicts between general queue fetching and patient-specific status endpoints.
    *   **Resolution:** Restructured the Express routing order to prioritize specific routes (`/my-status`) before dynamic parameters (`/:id`).
*   **Challenge:** Handling complex authorization scenarios where users might have multiple roles or no roles assigned.
    *   **Resolution:** Hardened the custom RBAC middleware to handle array returns and gracefully reject unauthorized access.

## 5. Next Steps (Milestone 2)
*   Integrate Socket.io for real-time WebSocket updates across the Staff Web App and Patient PWA so manual refreshing is not required.
*   Implement the Doctor's interface for conducting consultations and uploading prescriptions.
*   Expand the Triage engine capabilities.
