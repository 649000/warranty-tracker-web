import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { defineBoolean, defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  FUNCTION_MAX_INSTANCES,
  FUNCTION_MEMORY_MIB,
  FUNCTION_REGION,
  FUNCTION_TIMEOUT_SECONDS,
  SCHEDULE,
  SCHEDULE_TIME_ZONE,
} from './config.js';
import { createResendAdapter } from './delivery/resend.js';
import { runDailyReminders } from './process.js';

initializeApp();
const db = getFirestore();

const remindersEnabled = defineBoolean('REMINDERS_ENABLED', { default: true });
const appOrigin = defineString('APP_ORIGIN', {
  default: 'https://warranty-tracker-33dc5.web.app',
});
const resendApiKey = defineSecret('RESEND_API_KEY');
const emailFrom = defineSecret('EMAIL_FROM');

/**
 * Daily Asia/Singapore expiry-reminder sweep. Delivery is on by default
 * (cost is near zero), but only runs once the provider secrets are configured.
 * Deploy with `REMINDERS_ENABLED=false` if you need to keep it off.
 */
export const sendExpiryReminders = onSchedule(
  {
    schedule: SCHEDULE,
    timeZone: SCHEDULE_TIME_ZONE,
    region: FUNCTION_REGION,
    memory: `${FUNCTION_MEMORY_MIB}MiB`,
    timeoutSeconds: FUNCTION_TIMEOUT_SECONDS,
    maxInstances: FUNCTION_MAX_INSTANCES,
    secrets: [resendApiKey, emailFrom],
  },
  async () => {
    if (!remindersEnabled.value()) {
      logger.info('Expiry reminders are disabled; skipping run', {
        remindersEnabled: false,
      });
      return;
    }
    try {
      const result = await runDailyReminders({
        db,
        auth: getAuth(),
        adapter: createResendAdapter({
          apiKey: resendApiKey.value(),
          from: emailFrom.value(),
        }),
        origin: appOrigin.value(),
      });
      logger.info('Expiry reminder function completed', {
        dateKey: result.dateKey,
        candidateCount: result.candidateCount,
        recipients: result.recipients.length,
      });
    } catch (error) {
      logger.error('Expiry reminder function failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },
);
