# Game Submission Tracker (Local MVP)

Local web app for PM/HQ to track game project submissions across platforms.

## Features

- Dashboard with live timeline, filters, and stats:
  - Toggle-based include/exclude filters for platform and status
  - Total Store Releases
  - Releases
  - Stores
  - Successful
  - Unsuccessful QA
- Projects tab:
  - Add/Edit project metadata
  - Creation/Update type
  - Deadline and release date
  - Hotfix reason + QA/NotQA label
- Submissions tab:
  - Add/Edit submission batches per project
  - Multiple platform entries (platform, version, submission date, release date, status)
  - Global submission status (`in progress`, `done`, `failed`)
  - Failed reason + QA/NotQA label
  - Hotfix reason + QA/NotQA label
- Platforms tab:
  - Manage reusable platform catalog (iOS, Android, PC, console, custom)

Data is saved in browser `localStorage`.
If no local data exists, the app seeds demo projects/submissions automatically.

## Run locally

1. Open `index.html` in your browser.
2. Start with `Projects`, then add `Submissions`, then review `Dashboard`.

## Notes

- This is an MVP with no authentication and no backend.
- Next step can be migrating storage from `localStorage` to a local DB/API.
