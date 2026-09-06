## 1. Google Cloud service account

- [ ] 1.1 Create (or reuse) a Google Cloud service account for CI deploys and grant it `Firebase Hosting Admin` and `Firebase Rules Admin` roles on the Firebase project; verify the roles appear on the service account in the IAM console
- [ ] 1.2 Generate a JSON key for the service account and download it; verify the key file contains a `private_key` and `client_email` field

## 2. GitHub Actions secret

- [ ] 2.1 Add the raw JSON key as a repository secret named `GCP_SA_KEY`; verify the secret is listed in Settings > Secrets and variables > Actions

## 3. Workflow update

- [x] 3.1 Update the deploy job in `.github/workflows/ci.yml` to write `$GCP_SA_KEY` to `$RUNNER_TEMP/gcp-key.json`, export `GOOGLE_APPLICATION_CREDENTIALS`, and drop the `--token` flag; verify the deploy command still targets `hosting,firestore:rules,storage:rules`
- [ ] 3.2 Push to `main` and confirm the deploy job succeeds with no deprecation warning; verify the change appears on the hosted site and rules are updated

## 4. Cleanup

- [ ] 4.1 Remove the obsolete `FIREBASE_TOKEN` repository secret; verify the deploy job still succeeds on the next push after removal
