# `CLAUDE.md` — Project Documentation & Guidelines

## 1. Project Overview & Philosophy

**Project Name:** Physical Planning Unit Platform (PPUP)

**Target Environment:** Mobile-First Web Application (Adapts to Desktop)

**Core Purpose:** A geolocation, landmark registry, and reporting platform built for institutional environmental management. It enables precise tracking of environmental sanitation issues, automated dual-dispatch alerts, and a complete audit lifecycle.

### Design & Experience Philosophy

* **Mobile-First Utility:** Designed like a native mobile app for field officers taking photos and tagging locations on site, with a clean layout that expands into a full administrative view on desktop.
* **High Contrast & Clarity:** Clear status indicators (`Delivered`, `Read`, `Resolved`), straightforward action buttons, and accessible typography.
* **Low Overhead & Efficiency:** Client-side photo compression and lightweight spatial indexing (GeoHash) keep runtime expenses near zero.

---

## 2. Tech Stack & Dependencies

* **Frontend Framework:** React (Vite / SPA)
* **Styling:** Modern Pure CSS with CSS Modules and CSS Custom Properties (`src/styles/variables.css`)
* **Mapping Engine:** Leaflet & `react-leaflet` (OpenStreetMap / Carto tiles)
* **Backend Services:** Firebase (Authentication, Firestore, Cloud Storage, Cloud Functions)
* **Geospatial Utilities:** `geofire-common` (GeoHash encoding and bounding-box queries)
* **Icons:** `lucide-react`
* **Email / Alerts:** Nodemailer via Firebase Cloud Functions
* **Image Compression:** `browser-image-compression` (Client-side canvas image compression with admin size caps)

---

## 3. Directory Structure

```text
ppup/                              # Repo root = React frontend (Vite)
├── functions/                     # Backend Cloud Functions
│   ├── src/
│   │   ├── mailer.js              # Nodemailer dual-dispatch alert logic
│   │   └── triggers.js            # Firestore document creation triggers
│   ├── index.js                   # Functions entry point
│   └── package.json
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── src/
│   ├── assets/                    # Static assets, logos, map markers
│   ├── components/                # UI components grouped by feature domain
│   │   ├── common/                # Buttons, Modals, Loaders, Status Badges
│   │   ├── layout/                # Header, Navbar, Mobile Drawer, Sidebar
│   │   ├── map/                   # Leaflet containers, map picker, markers
│   │   ├── locations/             # Location cards, lists, pin modal, image compressor
│   │   └── reports/               # Issue submission form, audit table
│   ├── config/                    # Firebase setup & app constants
│   │   ├── firebase.js
│   │   └── constants.js
│   ├── context/                   # Global React State
│   │   ├── AuthContext.jsx        # Authentication & Role-Based Access Control (RBAC)
│   │   └── LocationContext.jsx    # Cached locations, active map center, search queries
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useGeolocation.js      # Native geolocation API wrapper
│   │   └── useFirestoreQuery.js   # Real-time listener hooks
│   ├── pages/                     # Main route views
│   │   ├── DashboardPage.jsx
│   │   ├── MapViewPage.jsx
│   │   ├── ReportIssuePage.jsx
│   │   ├── AdminPanelPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/                  # Pure API & database wrappers
│   │   ├── authService.js
│   │   ├── locationService.js     # GeoHash queries & landmark retrieval
│   │   ├── reportService.js       # Incident report submissions
│   │   └── storageService.js      # Photo evidence uploads
│   ├── styles/                    # CSS Modules & global styles
│   │   ├── global.css
│   │   ├── variables.css
│   │   ├── components/
│   │   └── pages/
│   ├── utils/                     # Pure helper functions
│   │   ├── geohash.js             # Coordinates <-> GeoHash conversions
│   │   ├── imageCompressor.js     # Browser-side canvas image compression
│   │   └── formatters.js          # Dates, coordinates, phone numbers
│   ├── App.jsx                    # Router & base layout wrapper
│   └── main.jsx                   # Application root
├── index.html                     # Vite entry (must stay at root)
├── firebase.json                  # Firebase CLI config (functions + hosting)
├── .env.local                     # VITE_FIREBASE_* web config
└── package.json
```

---

## 4. Operational Workflows & User Flow

### A. Location Registration Workflow (Admin / Authorized Contributor)

1. User clicks **"New Pin"**.
2. **Select Coordinate Source:**
   * **GPS:** Query `navigator.geolocation.getCurrentPosition()`.
   * **Select on Map:** Tap/click interactive map to place a pin.
   * **Manual Coordinates:** Type/paste explicit Latitude and Longitude.
3. **Map Preview & Confirmation:** Center map on target coordinates, fine-tune pin position, click **Proceed**.
4. **Metadata & Photo Entry:**
   * Provide Location Name & Description.
   * Assign Responsible Officer (Name, Role, Email, Phone/WhatsApp).
   * Capture or attach photograph. Image passes through `imageCompressor.js` according to admin size cap before upload.
5. **Database Entry:** Write payload to Firestore with computed `geohash`.

### B. Search & Discovery Flow (Public / Field Staff)

1. Users search locations by landmark name or category.
2. Real-time filtering updates both the **Map View** (Leaflet markers) and the **Location List**.
3. Selecting a landmark opens the **Location Card**, presenting description, photo proof, coordinates, and contact details.

### C. Issue Reporting & Automated Dual-Dispatch Flow

1. User submits an issue report directly from a Location Card.
2. Firestore creates a record in the `reports` collection.
3. **Cloud Function Trigger (`onDocumentCreated`):**
   * Automatically extracts report metadata, coordinates, map link, and sender details.
   * Simultaneously emails/alerts **both** the Administrator of Physical Planning AND the designated Responsible Officer.
4. **Audit Trail:** Report status initiates as `Delivered`. When opened by admin/officer, it transitions to `Read`. Upon completion, admin sets status to `Resolved`.

---

## 5. Key Data Models (Firestore Schemas)

### `locations` Collection

```json
{
  "id": "loc_auditorium_01",
  "name": "Faculty of Science Auditorium",
  "category": "Auditoriums",
  "description": "Main entrance hall and exterior foyer",
  "coordinates": {
    "latitude": 7.444312,
    "longitude": 3.899745
  },
  "geohash": "f24bf71z",
  "photoUrl": "https://firebasestorage.googleapis.com/.../photo.jpg",
  "responsibleOfficer": {
    "name": "Jane Doe",
    "role": "Sanitation Officer",
    "email": "jane.doe@institution.edu",
    "phone": "+2348000000000"
  },
  "createdBy": "user_admin_01",
  "createdAt": "2026-10-06T07:00:00Z"
}
```

### `reports` Collection

```jsonc
{
  "id": "rep_991823",
  "locationId": "loc_auditorium_01",
  "locationName": "Faculty of Science Auditorium",
  "coordinates": {
    "latitude": 7.444312,
    "longitude": 3.899745
  },
  "message": "Overflowing bin near the main foyer entrance.",
  "sender": {
    "name": "John Smith",
    "contact": "john.smith@institution.edu"
  },
  "status": "Delivered", // "Delivered" | "Read" | "Resolved"
  "createdAt": "2026-10-06T07:15:00Z",
  "resolvedAt": null
}
```

---

## 6. Access Control & Security Rules

* **Access Control:** Only authenticated admins can add new locations, authorize users, and modify system settings (e.g., photo compression caps).
* **Public / User Access:** Anyone can search locations and submit environmental reports.
* **Firestore Rules Summary:**
  * `locations`: Read (Public), Create/Update/Delete (Admins & Authorized Users).
  * `reports`: Create (Public), Read/Update (Admins & Responsible Officers).

---

## 7. Developer Commands & Coding Guidelines

### Common Commands

```bash
# Frontend development (from repo root)
npm run dev

# Build frontend production bundle
npm run build

# Firebase Cloud Functions local emulator
cd functions
npm run serve

# Deploy Cloud Functions
firebase deploy --only functions
```

### Coding Standards

1. **Styling:** Do NOT install Tailwind CSS. Write clean CSS Modules or standard CSS using CSS custom properties (`variables.css`).
2. **State & Logic Isolation:** Keep UI components focused on presentation. Place all Firebase/Firestore queries inside `src/services/` and reusable hooks inside `src/hooks/`.
3. **Location Precision:** Always store coordinates as numerical `latitude` and `longitude` objects alongside string `geohash` encodings.
4. **Client-Side Compression:** Ensure any file upload path runs images through `imageCompressor.js` before hitting Firebase Storage.
