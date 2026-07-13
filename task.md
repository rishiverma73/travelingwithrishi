 # Project Tasks: Traveling With Rishi

- [x] **Phase 1: Project Setup & Database Layer**
  - [x] Scaffold Next.js 14 App Router project with Tailwind
  - [x] Configure Prisma with SQLite (for dev)
  - [x] Design DB Schema (`Destination`, `Trip`, `Photo`, `AdminUser`, `SiteSettings`)
  - [x] Create seed script with all 36 Indian states and UTs + sample trip

- [x] **Phase 2: Authentication & Admin Layout**
  - [x] Install & configure NextAuth.js
  - [x] Setup Next.js Middleware to protect `/admin` routes
  - [x] Build `/admin/login` page with minimal, branded UI
  - [x] Create Admin Sidebar and Layout wrapper

- [x] **Phase 3: Core API Routes**
  - [x] `GET /api/destinations` (public + admin listing)
  - [x] `POST /PATCH /DELETE /api/trips` (admin CRUD)
  - [x] `POST /api/upload` (abstracted photo upload route)
  - [x] `PATCH /api/settings` (site content & password changes)

- [x] **Phase 4: Admin Dashboard**
  - [x] **Dashboard Home**: Top-level stats (visited count, total spent, trips logged)
  - [x] **Destinations Manager**: Toggle `isVisited`, set custom regions if needed
  - [x] **Trips List**: Data table of all logged trips
  - [x] **Trip Editor**: Complex form (destination select, story text, dates, cost breakdown, tags)
  - [x] **Media Library**: View all uploaded photos
  - [x] **Settings**: Update about text, social links, and admin password

- [x] **Phase 5: Public Site (The Portfolio)**
  - [x] **Design System**: Implement colors (Forest, Gold, Rust, Parchment, Sage) and fonts
  - [x] **Public Layout**: Fixed navigation and elegant footer
  - [x] **Home**: Hero section, stats strip, Featured Journey, Passport Wall preview
  - [x] **Destination Page**: Stats header, empty state ("Not yet visited"), or list of trips
  - [x] **Trip Detail Page**: Immersive reading experience, photo gallery, cost breakdown chart
  - [x] **All Journeys**: Grid of all stories with filtering by region/tags
  - [x] **Map**: Schematic visual grid of India showing visited states
  - [x] **About**: Full mission statement pulled from DB
  - [x] **Search**: Global search across destinations and trips

- [x] **Phase 6: Final Polish**
  - [x] Animations (Framer Motion on stamps and cards)
  - [x] Write `README.md`
  - [x] Generate `sitemap.xml` and `robots.txt`
  - [x] Final QA and end-to-end testing
