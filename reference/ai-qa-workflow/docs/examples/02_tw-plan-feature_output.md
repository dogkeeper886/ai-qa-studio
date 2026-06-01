_This demo shows the output structure of `/tw-plan-feature`. The command creates `test_plan/README.md` as an index plus individual section files in `test_plan/sections/`._

## File Structure Created

```
test_plan/
├── README.md
└── sections/
    ├── 01_Project_Business_Context.md
    ├── 02_Feature_Definition.md
    ├── 03_Scope_Boundaries.md
    ├── 04_Test_Strategy.md
    ├── 05_References_Resources.md
    └── 06_Revision_History.md
```

---

## test_plan/README.md

# Test Plan: Dark Mode Toggle (DEMO-123)

**Test Plan Type:** New Feature Validation
**Test Plan Version:** 1.0
**Created:** 2024-11-18
**Last Updated:** 2024-11-18
**QA Engineer:** QA Team
**Epic:** DEMO-100 — User Preferences Redesign
**Feature Request:** DEMO-089
**Target Release:** Sprint 14

---

## Test Plan Sections

1. [Project & Business Context](sections/01_Project_Business_Context.md)
2. [Feature Definition](sections/02_Feature_Definition.md)
3. [Scope & Boundaries](sections/03_Scope_Boundaries.md)
4. [Test Strategy](sections/04_Test_Strategy.md)
5. [References & Resources](sections/05_References_Resources.md)
6. [Revision History](sections/06_Revision_History.md)

---

## Quick Reference

- **Total Test Scenarios:** 6
- **Estimated Test Cases:** 28

---

## test_plan/sections/01_Project_Business_Context.md

## 1. Project & Business Context

### 1.1 Product Overview
QualityQuest is adding a dark mode toggle to the user settings page, allowing users to switch between light and dark themes. This is the most requested feature from the Q4 customer survey (68% of respondents).

### 1.2 Business Value
- Improves user satisfaction and retention
- Addresses accessibility needs (reduced eye strain)
- Aligns with modern UI/UX standards

### 1.3 Stakeholders
| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | Sarah Kim | Requirements, acceptance |
| UX Designer | Jordan Lee | Color palette, UI specs |
| Frontend Dev | Alex Chen | Implementation |
| QA Engineer | QA Team | Test planning and execution |

---

## test_plan/sections/02_Feature_Definition.md

## 2. Feature Definition

### 2.1 Core Functionality
- Toggle switch in Settings > Appearance
- Immediate theme switching (light ↔ dark)
- Persistence via API and localStorage
- System preference detection as default

### 2.2 Feature Control
- No feature flag — ships directly when complete

### 2.3 Non-Functional Requirements
- Theme switch under 200ms
- No flash of wrong theme on page load
- WCAG 2.1 AA contrast compliance
- Cross-browser: Chrome, Firefox, Safari, Edge (latest 2 versions)

---

## test_plan/sections/03_Scope_Boundaries.md

## 3. Scope & Boundaries

### 3.1 In-Scope Testing
- Toggle UI interaction and state changes
- Theme rendering across all pages
- Persistence (localStorage + API)
- System preference detection and fallback
- Cross-tab synchronization
- Accessibility and contrast validation

### 3.2 Out of Scope
- Custom color themes (future phase)
- Scheduled theme switching
- Per-page theme overrides

---

## test_plan/sections/04_Test_Strategy.md

## 4. Test Strategy

### 4.1 Test Levels
- Component testing (toggle switch)
- Integration testing (API + localStorage + UI)
- End-to-end testing (full user flows)

### 4.2 Test Types
- Functional, UI, API, Accessibility, Cross-browser

### 4.3 Test Approach
Default test assumptions: user is logged in, browser is Chrome latest, starting from Settings > Appearance page.

### 4.4 Test Scenarios

| ID | Test Scenario | Focus | Est. Cases | Test Activities |
|----|---------------|-------|------------|-----------------|
| **TS-01** | Toggle Basic Functionality | Core UI | 5 | • Toggle on/off interaction<br>• Visual feedback on click<br>• Theme applies immediately<br>• Default state matches system preference |
| **TS-02** | Theme Rendering | Visual | 6 | • All pages render correctly in dark mode<br>• All pages render correctly in light mode<br>• Component-level checks (buttons, forms, modals)<br>• Image and icon visibility |
| **TS-03** | Persistence & Data Flow | Data | 5 | • Preference saved to localStorage<br>• Preference synced to API<br>• Theme restored on page reload<br>• Theme restored on new session<br>• API failure graceful handling |
| **TS-04** | System Preference Detection | Integration | 4 | • OS dark mode detected on first visit<br>• OS light mode detected on first visit<br>• User override takes priority over OS setting<br>• Clearing preference reverts to OS default |
| **TS-05** | Cross-Tab Synchronization | Integration | 3 | • Theme change syncs to other open tabs<br>• Multiple tabs stay consistent<br>• Tab sync uses storage event |
| **TS-06** | Accessibility & Contrast | Accessibility | 5 | • WCAG AA contrast ratios in dark mode<br>• WCAG AA contrast ratios in light mode<br>• Keyboard navigation of toggle<br>• Screen reader announces toggle state<br>• Focus indicators visible in both themes |

**Total Test Coverage:**
- **6 Test Suites**
- **28 Test Cases** (estimated)

---

## test_plan/sections/05_References_Resources.md

## 5. References & Resources

### 5.1 Design & Documentation
| Document | Location |
|----------|----------|
| HLD | `confluence/HLD_Dark_Mode_Toggle.md` |
| Jira Epic | DEMO-100 |
| Feature Request | DEMO-089 |
| UX Color Palette | DEMO-124 (Figma link) |

---

## test_plan/sections/06_Revision_History.md

## 6. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-11-18 | QA Team | Initial test plan |

---

**NEXT STEP:** Run `/tw-plan-review` to verify coverage before creating test cases.
