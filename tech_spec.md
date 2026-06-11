# Technical Specification

## 1. System Architecture

BLUECRM is architected as a modern Single Page Application (SPA) leveraging a serverless backend. The underlying data synchronizes natively through Firebase Cloud Firestore, enforcing an offline-first and real-time reactive interface.

### 1.1 Frontend Architecture
- **Framework:** React 18 with modern React Hooks.
- **Language:** TypeScript for strictly-typed compilation and enhanced IDE intelligence.
- **Build Tool:** Vite, configured for high-speed hot-module replacement and optimized asset minification.
- **Styling:** Tailwind CSS provides utility-first CSS configurations allowing for rapid and consistent UI development.
- **State Management:** Context API (`useCRM`) handles global state mapping while subscribing to Firestore document snapshot listeners.
- **Animation:** CSS transitions and utility-based animations (`animate-in`, `fade-in`) handle layout fluidity.

### 1.2 Backend & Data Infrastructure
- **Database:** Firebase Cloud Firestore (NoSQL Document Store). Selected for its deep real-time capabilities and flexible schema mappings.
- **Authentication:** Firebase Auth natively integrated into the system's security rules.
- **Data Synchronization:** React components mount realtime listeners (`onSnapshot`), dynamically painting UI updates when backend writes occur without manually refreshing network state.

---

## 2. Data Entity Models 

The system utilizes loosely coupled collections within Firestore:

- `users` : Stores roles (`Sales`, `Pool`, `Manager`, `GM`), credentials, and name bindings.
- `companies` : Stores Client business details, industry sector, and nested `pics` (Points of Contact).
- `deals` : The core revenue schema. References `companyId` and `salesId`. Tracks `stage` progression (Prospecting, Negotiation, Won, Lost), pipeline values, and nested `history`.
- `units` : Defines rent/lease physical assets. Tracks `brand`, `model`, `plateNumber`, `location` (Jakarta, Surabaya), and strict operational states (`Available`, `Reserved`, `Assigned`, `Maintenance`).
- `drivers` : Defines human assets. Tracks `name`, `phone`, `licenseNumber`, and current pool location.
- `targets` : Defines specific temporal quotas for Sales personnel, tracking categorical product deliverables against time periods (e.g., `YYYY-MM`).

---

## 3. Security Rules & Execution

Firestore security rules map directly to the system's RBAC strategy:
- **Sales:** Can read global clients/units. Can only mutate or list deals where their specific `uid` matches the deal's `salesId`.
- **Pool Admin:** Cannot touch revenue deals. Wields exclusive capabilities over the `units` and `drivers` schemas to monitor and allocate physical assets safely.
- **Manager / GM:** Capable of viewing aggregations of all pipelines for deep analytical overviews, adjusting assignments, and mutating global variables.
