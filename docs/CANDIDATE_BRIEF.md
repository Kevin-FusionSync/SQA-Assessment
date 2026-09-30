# FreshCart – SQA Assessment Brief

Welcome, and thanks for taking the time to do this assessment.

## The scenario

FreshCart is about to release v1.0 of its grocery-delivery product on **web, iOS and Android**. Development says it is "feature complete". You are the QA engineer asked to assess whether it is ready to ship.

The product has **multiple defects of varying severity**. They are spread across the web app, the mobile app and the API: functional, validation, calculation, UI/responsive, accessibility, security and mobile-specific issues. Your job is to find as many as you can and report them clearly enough that a developer could fix them without asking you a single question.

## What you get

- This repository. See the top-level `README.md` to run everything locally.
- `docs/REQUIREMENTS.md`: the product requirements. **Treat it as the source of truth.**
- Two test accounts (see README). You may register as many more as you like.
- Restarting the API resets all data to its initial state.

## What we'd like you to deliver

1. **Bug reports.** One per defect, using the template below. Put them in a spreadsheet, a Markdown file, or your bug tracker of choice.
2. **Test cases / checklist.** The test cases or checklist you designed and executed, mapped to requirement IDs where possible. It doesn't have to be exhaustive. We want to see how you think about coverage (positive, negative, boundary, cross-platform, API).
3. **Test summary report (max 1 page).**
   - What you tested, on which platforms, browsers, devices and OS versions
   - What you did **not** test and why
   - Your release recommendation (Go / No-Go) with justification
   - The top risks you'd flag to the product owner

Optional (bonus): API tests (Postman collection, curl scripts, etc.), automation of a few key flows, and suggestions for improving the requirements.

## Time box

Please spend **no more than 4–6 hours** in total. We care more about the quality of your reports and your prioritisation than about raw count. It is fine to state "I ran out of time before testing X".

## Rules

- Test through the web UI, the mobile app and the API (e.g. Postman or curl). All three are in scope.
- Reading the source code is allowed, but **every bug must be reproduced and reported from a user or API perspective**, with observable steps and results. A report that only says "line 42 is wrong" does not count.
- One defect per report. If the same root cause shows up on several platforms, report it once and list all affected platforms.
- If you think something is ambiguous in the requirements, note your assumption.

## Bug report template

| Field | Description |
|-------|-------------|
| **ID** | Your own ID, e.g. BUG-001 |
| **Title** | Short and specific: *what* is wrong *where*. E.g. "Cart badge shows number of lines instead of total units (Web)" |
| **Platform(s)** | Web (browser + version + viewport) / iOS / Android / API |
| **Environment** | Device/emulator, OS version, build/commit |
| **Requirement** | Requirement ID(s) violated, e.g. CART-04 |
| **Severity** | Critical / High / Medium / Low (impact on user/business) |
| **Priority** | P1–P4 (how soon it should be fixed) |
| **Preconditions** | Account, cart state, data needed |
| **Steps to reproduce** | Numbered, minimal, deterministic |
| **Expected result** | Per the requirements |
| **Actual result** | What happened, with exact values/messages |
| **Evidence** | Screenshot, screen recording, request/response, console log |
| **Notes** | Frequency, workaround, suspected cause, related bugs |

### Severity guide

| Severity | Meaning |
|----------|---------|
| Critical | Security/privacy breach, data loss, financial loss, or a core flow completely blocked |
| High | Core flow works incorrectly (wrong amounts, wrong data), no reasonable workaround |
| Medium | Feature partially broken or a workaround exists; noticeable validation/UX issues |
| Low | Cosmetic, minor inconsistency, low user impact |

Good luck, and happy hunting! 🐛
