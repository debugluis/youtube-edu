# Prompt for Claude Code — YouTube Edu Iteration 8

Read SPEC.md and the current codebase for context. Implement the following features:

---

## 1. USER PROFILE DROPDOWN (Navbar)

When the user clicks their photo/name in the navbar, show a dropdown menu with:
- User name and email (display only)
- "Edit Profile" option → opens a modal where they can edit their display name and photo URL
- "Language" toggle → English / Español (saves preference to Firestore user doc)
- "Delete Account" option → confirmation modal, then deletes all user data (courses, progress, user doc) from Firestore and deletes the Firebase Auth account
- "Sign Out" option

Style: dark dropdown matching the app's theme. Close when clicking outside.

---

## 2. COURSE DELETION (Dashboard only)

On each course card in the dashboard, add a small trash/delete icon (lucide-react Trash2 icon) in the top-right corner.
- On click, show a confirmation modal: "Are you sure you want to delete [course name]? This will remove all your progress. This action cannot be undone."
- Two buttons: "Cancel" and "Delete Course" (red/destructive style)
- On confirm: delete the course document and associated progress document from Firestore
- Use the same confirmation modal pattern for all destructive actions in the app

---

## 3. INTERNATIONALIZATION (English/Spanish)

- Default language: English
- Add a simple i18n system using a translations JSON object (no need for a heavy library like next-intl)
- Create a translations file with English and Spanish for all UI strings: navbar items, button labels, achievement names/descriptions, module labels, stats text, modal messages, landing page text, etc.
- Store the user's language preference in Firestore (on the user doc) and in Zustand store
- The language toggle lives in the profile dropdown (from feature #1)
- All hardcoded strings in the app should use the translation system

---

## 4. CUSTOM 404 PAGE

Create a custom not-found.tsx page with:
- The YouTube Edu logo
- "Page not found" message
- A button to go back to the dashboard
- Same dark theme as the rest of the app
- Keep it simple and clean

---

## 5. CONFIRMATION MODALS

Create a reusable ConfirmationModal component used for all destructive actions:
- Course deletion
- Account deletion
- Progress reset (future use)
Props: title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant (danger/warning)

---

## 6. LANDING PAGE IMPROVEMENT (About integrated)

Improve the current landing page (/) so it works as both login and About page. Before the login button, add:
- A headline: "Turn any YouTube playlist into a structured course"
- 3 simple steps with icons: 1) Paste a playlist URL 2) AI organizes it into modules 3) Track your progress with achievements
- A brief "Built with" section showing the tech stack icons (Next.js, Firebase, Claude, YouTube API)
- Keep the Google Sign-in button prominent
- Keep it clean, not too long, same dark theme
- If user is already logged in, redirect to /dashboard automatically

---

## 7. PRIVACY POLICY & TERMS OF USE

Create two simple pages: /privacy and /terms

Privacy Policy should cover:
- What data is collected (Google account info: name, email, photo; course progress data)
- How it's stored (Firebase/Firestore, Google Cloud)
- No data is sold to third parties
- Users can delete all their data at any time via account deletion
- Third-party services used: Google Auth, YouTube API, Anthropic Claude API
- Contact: link to GitHub Issues

Terms of Use should cover:
- The service is provided as-is, no guarantees
- Users are responsible for their own YouTube content usage
- The app does not host or store any video content
- Account termination rights
- Contact: link to GitHub Issues

Add links to both pages in the footer of the landing page and in the profile dropdown.

---

## 8. FEEDBACK / BUG REPORT

Add a "Report a Bug" or "Feedback" link that opens https://github.com/debugluis/youtube-edu/issues/new in a new tab.
Place it in:
- The profile dropdown menu
- The footer of the landing page
Use a lucide-react icon (Bug or MessageSquare)

---

## IMPLEMENTATION ORDER

1. Reusable ConfirmationModal component (needed by other features)
2. Profile dropdown with sign out
3. Course deletion with confirmation
4. Account deletion with confirmation
5. i18n translation system + language toggle
6. Custom 404 page
7. Landing page improvement
8. Privacy Policy & Terms of Use pages
9. Feedback link

After each major feature, run `npm run build` to verify no build errors.
