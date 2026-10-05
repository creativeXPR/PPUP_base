# ppup

Map-based landmark pinning and issue reporting. Users drop pins on a Leaflet map, attach compressed photos, and report problems with a location; admins review reports and both sides are notified by email.

**Stack:** React 19 + Vite · Leaflet / react-leaflet · Firebase (Auth, Firestore, Storage, Cloud Functions) · geofire-common · Nodemailer

## Setup

```bash
# Frontend
npm install
# fill in .env.local with your Firebase web config
npm run dev

# Cloud Functions
cd functions
npm install
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
npm run deploy      # prompts for SMTP_HOST / SMTP_PORT / MAIL_FROM on first deploy
```

## Project layout

```
ppup/
├── public/            Static files served as-is (favicon, PWA manifest)
├── src/               React frontend (see below)
├── functions/         Firebase Cloud Functions backend (see below)
├── index.html         Vite entry HTML (must stay at the root for Vite)
├── firebase.json      Firebase CLI config: functions source + SPA hosting from dist/
├── .env.local         Firebase web config (VITE_FIREBASE_*), not committed
└── eslint.config.js   Browser rules for src/, Node globals for functions/
```

## Frontend: `src/`

### `components/`
Reusable UI, grouped by feature domain.

| Folder | File | What it does |
| --- | --- | --- |
| `common/` | `Button.jsx` | Styled button with `primary` / `ghost` / `danger` variants and a loading state |
| | `Modal.jsx` | Generic dialog (Esc / backdrop to close). Also exports `ConfirmModal`, the "are you sure?" dialog every destructive action must use |
| | `Loader.jsx` | Spinner with label, inline or full-screen |
| | `StatusBadge.jsx` | Coloured pill for a report status (open, in review, resolved, rejected) |
| `layout/` | `Header.jsx` | Sticky top bar: brand, nav, user avatar, sign-out |
| | `Navbar.jsx` | Route links; shows **Admin** only to admins |
| | `Sidebar.jsx` | Side panel next to the map; stacks under the map on mobile |
| `map/` | `MapContainer.jsx` | App-wide Leaflet map shell with OpenStreetMap tiles; children are map layers |
| | `MapPicker.jsx` | Click-to-place a single marker; returns `{ lat, lng }` |
| | `LocationMarker.jsx` | Marker + popup for a saved pin; also fixes Leaflet's default icon paths under Vite |
| `locations/` | `LocationCard.jsx` | Pin summary: thumbnail, name, description, distance away |
| | `LocationList.jsx` | List of `LocationCard`s with selected state and empty message |
| | `NewPinModal.jsx` | Create-pin form: name, description, map picker, photo |
| | `ImageCompressor.jsx` | Photo input (opens the rear camera on mobile) that compresses the image and shows a preview |
| `reports/` | `ReportForm.jsx` | Issue report form: choose pin, issue type, details |
| | `ReportAuditTable.jsx` | Admin table of reports with Review / Resolve / Reject actions (reject is confirmed) |

### `pages/`
One file per route.

| File | Route | Access | What it does |
| --- | --- | --- | --- |
| `LoginPage.jsx` | `/login` | public | Google sign-in; returns the user to the page they came from |
| `DashboardPage.jsx` | `/` | signed in | Greeting, nearby pins count and list, **New pin** |
| `MapViewPage.jsx` | `/map` | signed in | Interactive map with all nearby pins plus a sidebar list; select a pin to report on it |
| `ReportIssuePage.jsx` | `/report?location=<id>` | signed in | Report form; `location` param preselects the pin |
| `AdminPanelPage.jsx` | `/admin` | admin | Live report queue filtered by status, using `ReportAuditTable` |
| `NotFoundPage.jsx` | `*` | public | 404 fallback |

Route guards (`RequireAuth`, `RequireAdmin`) live in `App.jsx`.

### `services/`
Every Firebase call goes through here, so components never touch raw database code.

| File | What it does |
| --- | --- |
| `authService.js` | Google popup sign-in, creates the `users/{uid}` profile on first login, sign-out, auth listener, profile fetch |
| `locationService.js` | Create / update / delete pins (stores a geohash with each one); `getNearbyLocations` runs geohash range queries and then filters by real distance |
| `reportService.js` | Submit a report (status `open`), which triggers the backend email notifications; update a report's status with reviewer and time |
| `storageService.js` | Upload a (pre-compressed) image to Firebase Storage and return `{ path, url }`; delete by path |

### `utils/`
Pure helper functions with no React or Firebase state.

| File | What it does |
| --- | --- |
| `geohash.js` | Wraps `geofire-common`: encode a geohash, get query bounds for a radius, get distance in metres |
| `imageCompressor.js` | Canvas-based browser compression: scales the image down to a maximum dimension and re-encodes it as JPEG |
| `formatters.js` | Date (supports Firestore timestamps), coordinates to 5 decimal places, distance (m / km), status labels |

### `context/`
Global state providers.

| File | What it does |
| --- | --- |
| `AuthContext.jsx` | Current Firebase user, Firestore profile, `isAdmin` role flag, auth loading state |
| `LocationContext.jsx` | Device position (falls back to the default centre), cached nearby pins, selected pin, `refresh()`; refetches only after a ~100 m move |

### `hooks/`

| File | What it does |
| --- | --- |
| `useAuth.js` | Reads `AuthContext`; throws if used outside the provider |
| `useGeolocation.js` | Watches `navigator.geolocation` with error handling for unsupported or denied access |
| `useFirestoreQuery.js` | Real-time `onSnapshot` subscription to a (memoized) query; returns `{ data, loading, error }` |

### `config/`

| File | What it does |
| --- | --- |
| `firebase.js` | Initializes the Firebase app and exports `auth`, `db`, `storage`, `googleProvider` |
| `constants.js` | Collection names, roles, report statuses and types, map defaults (centre, zoom, tiles), nearby radius, image compression defaults |

### `styles/`

| Path | What it does |
| --- | --- |
| `variables.css` | Design tokens as CSS custom properties (colours, radius, spacing, layout sizes), with a dark-mode override |
| `global.css` | Base reset, mobile-first layout, and shared component styles |
| `components/`, `pages/` | Per-module and per-page stylesheets (empty for now) |

### Other
- `App.jsx`: providers, router, and route guards.
- `main.jsx`: entry point; loads Leaflet CSS and global styles.
- `assets/icons`, `assets/images`: static images imported by components.

## Backend: `functions/`

Firebase Cloud Functions (Node 22, ES modules, `firebase-functions` v2).

| File | What it does |
| --- | --- |
| `index.js` | Entry point: initializes `firebase-admin` and re-exports every trigger. Firebase deploys whatever this file exports |
| `src/triggers.js` | `onReportCreated`: Firestore `onDocumentCreated` listener on `reports/{reportId}`. Looks up the pin name, the reporter's email and all admin emails, then sends **two notifications**: a confirmation to the reporter and an alert to the admins. Stamps `notifiedAt` and `notificationErrors` on the report |
| `src/mailer.js` | Nodemailer transport (built lazily and reused across calls) plus HTML email templates (`reporterConfirmation`, `adminAlert`); user input is HTML-escaped. SMTP credentials are secrets; host, port and sender are deploy-time parameters |
| `package.json` | Functions dependencies, Node version, and `serve` / `deploy` / `logs` scripts |

### Configuration

| Name | Kind | Default |
| --- | --- | --- |
| `SMTP_USER`, `SMTP_PASS` | Secret (`firebase functions:secrets:set`) | none |
| `SMTP_HOST` | Param | `smtp.gmail.com` |
| `SMTP_PORT` | Param | `465` |
| `MAIL_FROM` | Param | `ppup <no-reply@ppup.app>` |

With Gmail, `SMTP_PASS` must be an App Password, not your account password.

## Firestore data model

- `users/{uid}`: `displayName, email, photoURL, role ('user' | 'admin'), createdAt`
- `locations/{id}`: `name, description, lat, lng, geohash, imageUrl, imagePath, createdBy, createdAt`
- `reports/{id}`: `locationId, type, description, status ('open' | 'in_review' | 'resolved' | 'rejected'), createdBy, createdAt, reviewedBy, reviewedAt, notifiedAt, notificationErrors`

**Needed index:** `reports (status ASC, createdAt DESC)` for the admin status filter. Firestore logs a link to create it on first use.

**Making an admin:** set `role: "admin"` on the user's `users/{uid}` document in the Firestore console.
