import { expect, type Page } from '@playwright/test';

const AUTH_EMULATOR = 'http://127.0.0.1:9099';
const PROJECT_ID = 'warranty-tracker-33dc5';

interface OobCode {
  email: string;
  oobCode: string;
  requestType?: string;
}

/**
 * Completes the email-verification step for a freshly signed-up account using
 * the Auth emulator's out-of-band code. The app routes unverified users to
 * `/verify-email`; this drives the same `mode=verifyEmail&oobCode` flow a real
 * verification email would, then waits for the app to land on the list.
 */
export async function verifyEmailViaEmulator(page: Page, email: string): Promise<void> {
  await expect(page).toHaveURL(/\/verify-email/);

  const oobCode = await fetchVerificationCode(email);
  await page.goto(`/?mode=verifyEmail&oobCode=${oobCode}`);
  await expect(page).toHaveURL(/\/warranties/);
}

async function fetchVerificationCode(email: string, attempts = 10): Promise<string> {
  const url = `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/oobCodes`;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await fetch(url);
    if (response.ok) {
      const body = (await response.json()) as { oobCodes?: OobCode[] };
      const match = body.oobCodes?.find(
        (code) => code.email === email && (code.requestType ?? 'VERIFY_EMAIL') === 'VERIFY_EMAIL',
      );
      if (match) {
        return match.oobCode;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`No verification code found for ${email}`);
}
