# Test Cases: Dark Mode Toggle (DEMO-123)

_Showing 2 of 6 test scenarios for demonstration purposes._

---

## TS-01: Toggle Basic Functionality

**Objective:** Verify the dark mode toggle switch works correctly in Settings > Appearance
**Focus:** Core UI
**Test Cases:** 5
**Test Plan Reference:** test_plan/sections/04_Test_Strategy.md § 4.4, TS-01

---

### TC-01: Toggle Dark Mode On

**Objective:**
Verify that clicking the dark mode toggle switches the theme from light to dark immediately.

**Preconditions:**
- User is logged in
- Theme is set to light mode
- Browser: Chrome latest

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Settings > Appearance | Appearance settings page loads. Dark Mode toggle is visible and set to OFF. |
| 2 | Click the Dark Mode toggle switch | Toggle moves to ON position. Background changes from white (#FFFFFF) to dark (#1A1A2E). Text changes from dark (#333333) to light (#E0E0E0). Transition completes within 200ms. |
| 3 | Scroll down the page | All visible elements use dark theme colors. No elements remain in light theme. |

**Execution Type:** Manual

---

### TC-02: Toggle Dark Mode Off

**Objective:**
Verify that clicking the toggle again switches back from dark to light theme.

**Preconditions:**
- User is logged in
- Theme is set to dark mode
- Browser: Chrome latest

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Settings > Appearance | Appearance settings page loads in dark theme. Dark Mode toggle is set to ON. |
| 2 | Click the Dark Mode toggle switch | Toggle moves to OFF position. Background changes from dark (#1A1A2E) to white (#FFFFFF). Text changes from light (#E0E0E0) to dark (#333333). |
| 3 | Scroll down the page | All visible elements use light theme colors. |

**Execution Type:** Manual

---

### TC-03: Default State Matches System Preference (Dark)

**Objective:**
Verify that a new user with OS dark mode enabled sees the toggle defaulted to ON.

**Preconditions:**
- New user account with no theme preference saved
- OS dark mode is enabled (`prefers-color-scheme: dark`)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with the new user account | Application loads in dark theme. |
| 2 | Navigate to Settings > Appearance | Dark Mode toggle is set to ON. |
| 3 | Check page background color | Background is dark (#1A1A2E), matching OS preference. |

**Execution Type:** Manual

---

### TC-04: Default State Matches System Preference (Light)

**Objective:**
Verify that a new user with OS light mode sees the toggle defaulted to OFF.

**Preconditions:**
- New user account with no theme preference saved
- OS dark mode is disabled (`prefers-color-scheme: light`)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with the new user account | Application loads in light theme. |
| 2 | Navigate to Settings > Appearance | Dark Mode toggle is set to OFF. |
| 3 | Check page background color | Background is white (#FFFFFF), matching OS preference. |

**Execution Type:** Manual

---

### TC-05: Rapid Toggle Does Not Break UI

**Objective:**
Verify that quickly toggling dark mode on and off multiple times does not cause visual glitches.

**Preconditions:**
- User is logged in
- Browser: Chrome latest

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Settings > Appearance | Page loads normally. |
| 2 | Click the Dark Mode toggle 5 times rapidly | Toggle responds to each click. No visual glitches, layout shifts, or stuck states. |
| 3 | Wait 2 seconds after last click | Theme matches the final toggle state. All elements are consistent. |

**Execution Type:** Manual

---

### Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Toggle Dark Mode On | P0 | Functional |
| TC-02 | Toggle Dark Mode Off | P0 | Functional |
| TC-03 | Default State — OS Dark | P1 | Functional |
| TC-04 | Default State — OS Light | P1 | Functional |
| TC-05 | Rapid Toggle Stability | P2 | Edge Case |

---
---

## TS-03: Persistence & Data Flow

**Objective:** Verify that theme preference persists across sessions and syncs correctly between localStorage and API
**Focus:** Data
**Test Cases:** 5
**Test Plan Reference:** test_plan/sections/04_Test_Strategy.md § 4.4, TS-03

---

### TC-01: Preference Saved to localStorage

**Objective:**
Verify that toggling dark mode immediately writes the preference to localStorage.

**Preconditions:**
- User is logged in
- Browser DevTools accessible (Application > Local Storage)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Settings > Appearance | Page loads. |
| 2 | Open browser DevTools > Application > Local Storage | localStorage entries visible. |
| 3 | Click the Dark Mode toggle to ON | localStorage key `theme` updates to value `"dark"` immediately. |
| 4 | Click the Dark Mode toggle to OFF | localStorage key `theme` updates to value `"light"` immediately. |

**Execution Type:** Manual

---

### TC-02: Preference Synced to API

**Objective:**
Verify that toggling dark mode sends a PUT request to the user preferences API.

**Preconditions:**
- User is logged in
- Browser DevTools accessible (Network tab)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Settings > Appearance | Page loads. |
| 2 | Open browser DevTools > Network tab | Network requests visible. |
| 3 | Click the Dark Mode toggle to ON | Network tab shows `PUT /api/user/preferences` with body `{"theme": "dark"}`. Response: `200 OK`. |

**Execution Type:** Manual

---

### TC-03: Theme Restored on Page Reload

**Objective:**
Verify that the selected theme is restored after refreshing the page.

**Preconditions:**
- User is logged in
- Dark mode is toggled ON

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify the page is in dark theme | Background is dark, toggle shows ON. |
| 2 | Press F5 to reload the page | Page reloads. Dark theme is applied immediately — no flash of light theme. |
| 3 | Navigate to Settings > Appearance | Toggle still shows ON. |

**Execution Type:** Manual

---

### TC-04: Theme Restored on New Session

**Objective:**
Verify that the theme preference persists after closing and reopening the browser.

**Preconditions:**
- User is logged in
- Dark mode is toggled ON

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Close the browser completely | Browser closes. |
| 2 | Open the browser and navigate to the application | Application loads in dark theme. No flash of light theme during load. |
| 3 | Navigate to Settings > Appearance | Dark Mode toggle shows ON. |

**Execution Type:** Manual

---

### TC-05: API Failure Graceful Handling

**Objective:**
Verify that the toggle still works locally when the API call fails.

**Preconditions:**
- User is logged in
- Network throttled or API endpoint blocked (simulate via DevTools)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open DevTools > Network tab. Block requests to `/api/user/preferences`. | API calls will fail. |
| 2 | Click the Dark Mode toggle to ON | Theme switches to dark mode immediately (localStorage used). No error shown to user. |
| 3 | Reload the page | Dark theme is still applied (read from localStorage). |
| 4 | Remove the network block | API sync resumes on next toggle action. |

**Execution Type:** Manual

---

### Summary

| TC ID | Name | Priority | Type |
|-------|------|----------|------|
| TC-01 | Saved to localStorage | P0 | Functional |
| TC-02 | Synced to API | P0 | Integration |
| TC-03 | Restored on Reload | P0 | Functional |
| TC-04 | Restored on New Session | P1 | Functional |
| TC-05 | API Failure Handling | P1 | Error Handling |
