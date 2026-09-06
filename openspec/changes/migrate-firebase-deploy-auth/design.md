## Context

The deploy job in `.github/workflows/ci.yml` authenticates with `--token "${{ secrets.FIREBASE_TOKEN }}"` (see proposal.md - Why for motivation). `firebase-tools` v15 resolves auth in this order: `--token`/`FIREBASE_TOKEN` (deprecated), local login, then Application Default Credentials (ADC) via `GOOGLE_APPLICATION_CREDENTIALS`. We target ADC because it is the supported, non-deprecated path that requires no change to the deploy command's shape.

## Goals / Non-Goals

**Goals:**
- Migrate the deploy job off the deprecated User Token auth to a service account key.
- Keep the existing single deploy command (`hosting, firestore:rules, storage`) unchanged.
- No application code changes.

**Non-Goals:**
- Workload Identity Federation (keyless) — deferred; materially more setup and carries a known firebase-tools ADC timeout bug (#10726).
- Splitting hosting into the official `FirebaseExtended/action-hosting-deploy` action — it does not deploy Firestore/Storage rules the same way.
- Preview-channel workflow changes.

## Decisions

**D1: Service account key over WIF.**
Chosen for setup simplicity. Trade-off: swaps one long-lived secret (`FIREBASE_TOKEN`) for another (`GCP_SA_KEY`), so the primary win is using a *supported* method, not eliminating long-lived credentials. WIF remains the future keyless option.

**D2: IAM roles.**
Grant the service account `Firebase Hosting Admin`, `Firebase Rules Admin`, `Service Usage Admin`, and `Firebase Storage Admin` on the Firebase project. `Firebase Rules Admin` covers both `firestore:rules` and `storage:rules` targets. `Service Usage Admin` is required so `firebase-tools` can auto-enable project APIs (e.g. `firebasestorage.googleapis.com`) during deploy; without it the deploy fails with a 403 on the `serviceusage` check. `Firebase Storage Admin` (`roles/firebasestorage.admin`) is required so `firebase-tools` can resolve the project's default storage bucket (`firebasestorage.defaultBucket.get`) when deploying `storage:rules`; note this is distinct from GCS `Storage Admin` (`roles/storage.admin`), which does not grant the Firebase-specific permission. (Alternative considered: the broader `Firebase Admin` role — rejected to keep the key least-privilege.)

**D3: Secret format — raw JSON key stored directly as `GCP_SA_KEY`.**
The deploy job writes the secret to a temp file and exports `GOOGLE_APPLICATION_CREDENTIALS`. Raw JSON is the simplest and works with proper quoting; base64 encoding was considered but rejected as unnecessary for this repo's single-secret case.

**D4: Key file location and lifecycle.**
Write to `$RUNNER_TEMP/gcp-key.json` (ephemeral, auto-cleaned at job end) rather than a workspace path, so no manual cleanup or commit risk.

**D5: Deploy target — use `storage`, not `storage:rules`.**
`firebase-tools` accepts `firestore:rules` as a deploy target but rejects `storage:rules` with "Could not find rules for the following storage targets: rules" (firebase-tools issue #6125). The deploy command therefore uses `--only hosting,firestore:rules,storage`, where the bare `storage` target deploys the storage rules. This was discovered during the migration's first deploy attempt.

## Risks / Trade-offs

- [Long-lived secret committed to GitHub] -> Scope the key with least-privilege roles (D2), store as a repo secret, rotate on any suspected exposure.
- [Deploy fails with "missing permissions"] -> Document the exact roles in the task list; validate with a real `main` push.
- [Future firebase-tools major removes ADC fallback too] -> Unlikely; ADC is the documented replacement path. Revisit WIF if it regresses.
- [Node.js STS "Premature close" regression] -> Not applicable: that bug (#10726 / CVE-2026-48931) only affects the WIF credential exchange, not service-account key auth.

## Migration Plan

1. Create the service account and key in Google Cloud; grant roles (D2).
2. Add `GCP_SA_KEY` as a repo secret; keep `FIREBASE_TOKEN` until the new path is verified.
3. Update the deploy job to use ADC.
4. Verify a successful deploy to Hosting + rules.
5. Remove the obsolete `FIREBASE_TOKEN` secret.

Rollback: revert the workflow change and the `FIREBASE_TOKEN` secret still authenticates until it is deleted (step 5 is intentionally last).

## Open Questions

None.
