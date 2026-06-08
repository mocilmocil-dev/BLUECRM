# Firestore Security Specification for BLUECRM

This document outlines the security invariants, validation targets, and "Dirty Dozen" malicious payloads used to test and audit the robustness of the firestore rules.

## Data Invariants & Access Control

1. **Users (/users/{userId})**:
   - Any authenticated client can read user documents (roles, managers, names).
   - Only admins or system-level actions should modify User profiles to prevent role escalation.

2. **Companies (/companies/{companyId})**:
   - Registered users can read and write details of clients / companies.
   - Company ID format must be validated to prevent path pollution.

3. **Targets (/targets/{targetId})**:
   - Monthly performance targets can be read by everyone.
   - Saving/updating targets is restricted to authorized roles (e.g. GM, Manager, or the target owner).

4. **Deals (/deals/{dealId})**:
   - Pipeline records containing product lists, stages, estimated and actual values.
   - Any modifications to progress or amounts must validate types, values, and timestamp alignment.

---

## The "Dirty Dozen" Forbidden Payloads (Integrity, Identity, State Rules)

These 12 scenarios must be strictly blocked by the database rules and return `PERMISSION_DENIED`.

1. **User Profile Hijacking**: Attempt to write a `User` doc with an arbitrary user's ID to override their name/role.
2. **Admin Privilege Escalation**: A regular user attempts to assign themselves the role of `'GM'` inside `/users/{uid}`.
3. **Ghost Fields Injection**: Sending a Company update containing an unlisted field like `isBetaTester: true` or `discountCode: "FREE"`.
4. **Incorrect ID Syntax**: Creating a Company document with an ID containing special terminal characters like `$`, `/`, `@`.
5. **PII Blanket Scrape**: Unauthenticated guests scraping client details or contacts off `/companies`.
6. **Self-Target Manipulation**: Sales representative trying to alter target values or historical values directly.
7. **Negative Values Poisoning**: Attempt to insert negative Estimated Value or Quantity (e.g., `-10` items or `-5,000,000` IDR) into products.
8. **Invalid Stage Status**: Forcing a Deal stage to a non-existent status like `"Deleted"` or `"Secret"`.
9. **Fake Client Timestamp**: Bypassing server timestamp using a hardcoded client-side value for `createdAt` or `updatedAt`.
10. **Orphaned Sibling Records**: Creating a Deal referencing a fictional `companyId` that doesn't exist.
11. **Excessive Field Size Attack**: Attempting to inject a 5MB note string into a Deal's history block.
12. **Status Shortcut Bypass**: Transitioning directly to a state without updating the associated stage log history.
