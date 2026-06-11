# Features Documentation

## 1. Pipeline Panel
The core revenue engine for the CRM.
- **Funnel Visualization:** Interactive boards representing deals grouped by active stage (Prospecting, Negotiation, Won, Lost).
- **Deal Management:** Full lifecycle tracking. Sales can spin up new opportunities, log call histories, and document offline meetings.
- **Advanced Context Filtering & Sorting:**
  - Search directly across Deal Titles and nested Company Names natively.
  - Sort actively by Date constraints (Newest/Oldest) or Estimated Value (Highest/Lowest).
  - RBAC aware filtering: Top-level managers can filter the view to audit specific sales personnel.

## 2. Client Management
Complete rolodex representing external corporate clients.
- **Company Profiles:** Establish tracking arrays containing Business Names, Phone lines, and organizational addresses.
- **PIC (Point of Contact) Aggregation:** Track infinite permutations of PICs attached safely under a unified overarching corporate banner.
- **Smart Deal Injection:** Clicking a dedicated client seamlessly fetches and displays all `Deals` currently in movement for that specific client, securely constraining visibility for Sales.

## 3. Fleet & Unit Management
Total operational control layer.
- **Inventory Tracking:** Real-time visibility into vehicle types and current staging locations.
- **Status Workflows:** Fleet managers can transition units visually between `Available`, `Reserved`, `Assigned`, and `Maintenance` modes dynamically.
- **Fulfillment System:** Links specific available units robustly to verified `Won` Deals to establish formal assignment states.

## 4. Driver Management
Dynamic tracking mechanism for drivers waiting in organizational pools.
- **Driver Profiles:** Records core vitals (Name, Contact Information, and specialized License IDs).
- **Dynamic Pooling:** Track driver locations natively segmented across geographical sectors (e.g., Jakarta, Surabaya).
- **Status Lifecycle:** Mark drivers as Available, Assigned, Leave, or Reserved.
- **Secure Modals:** Built-in form models exclusively permitted to the `Pool` role allowing instantaneous updating of Driver properties and details.

## 5. Sales Targets & Reporting
Goal orientation mechanics.
- **Target Setting:** Managers/GMs can synthesize precise monthly revenue guidelines mapped uniquely to designated units/drivers for the Sales team.
- **Progress Tracking:** Beautiful visual representation loops matching actual accumulated values against overarching metric targets to foster momentum.

## 6. Access Control (RBAC) Logic
System logic enforces UI rendering and action limitation parameters securely:
- **Sales Structure:** Blind to other sales' deals to prevent internal conflict; hyper-focused entirely on client engagement capabilities.
- **Pool Admin Structure:** Operational-level restrictions preventing accidental deletion of financial agreements. Focuses exclusively on asset fluidity and mechanical operations.
- **Manager / GM Structure:** Global view matrices for absolute tracking.
