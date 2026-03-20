# Technical Handoff - HMS Meru UI (Sprint 00)

## Overview
This contract defines the integration points for the Login and App Shell components built for the Meru Level 5 Hospital Management System.

## Login Integration
**File:** `login.php`
**Form ID:** `#login-form`
**Method:** `POST`
**Action:** `#` (To be defined by Minimax/Backend)

### Inputs:
- `username` (text, required): Staff username or email.
- `password` (password, required): Access key with eye-toggle visibility.

### Redirects:
- **Success:** `dashboard.php` (Minimax handles role-based routing).
- **Failure:** Return to `login.php` with generic error feedback.

---

## Session Variables
The shell components (`sidebar.php`, `topbar.php`) expect the following session variables to be populated after authentication:

- `$_SESSION['role']`: Controls which sidebar navigation groups are visible via `data-role` attributes.
- `$_SESSION['full_name']`: Displayed in the sidebar footer and topbar user chip.
- `$_SESSION['user_id']`: Required for all subsequent page actions.

---

## Component Layout
- **Includes Directory:** `/includes/`
- **Shell Wrapper:**
    ```php
    <?php require_once 'includes/header.php'; ?>
    <?php require_once 'includes/sidebar.php'; ?>
    <div class="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <?php require_once 'includes/topbar.php'; ?>
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-surface">
            <!-- PAGE CONTENT GOES HERE -->
        </main>
    </div>
    </body>
    </html>
    ```

## Responsive Behavior
- **Desktop:** Fixed 260px sidebar.
- **Mobile:** Sidebar hidden by default. Use `toggleSidebar()` JS function (included in `sidebar.php`) to open/close via the hamburger menu in `topbar.php`.
- **Title Sync:** Update `#page-title` in `topbar.php` using JS on page load: `document.getElementById('page-title').textContent = 'My Page Title';`
