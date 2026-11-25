import { inngest } from "@/inngest/client";
import { logger } from "@/lib/logger";

export const processSurveyMedia = inngest.createFunction(
  { id: "survey-media-scrub", retries: 3 },
  { event: "inventory/survey.submitted" },
  async ({ event, step }) => {
    await step.run("log-survey-ingestion", async () => {
      logger.info("Processing survey media & EXIF scrub", {
        surveyId: event.data.surveyId,
        syncKey: event.data.syncKey,
      });
    });
    return { status: "processed", surveyId: event.data.surveyId };
  }
);

export const checkQuoteExpiry = inngest.createFunction(
  { id: "quote-expiry-check", retries: 2 },
  { cron: "0 7 * * *" },
  async ({ step }) => {
    await step.run("scan-expiring-quotes", async () => {
      logger.info("Running daily operator quote expiry & freshness check");
    });
    return { checkedAt: new Date().toISOString() };
  }
);

export const checkPermitReminders = inngest.createFunction(
  { id: "compliance-permit-reminders", retries: 2 },
  { cron: "0 8 * * 1" },
  async ({ step }) => {
    await step.run("scan-expiring-permits", async () => {
      logger.info("Running weekly compliance document expiry reminder scan");
    });
    return { checkedAt: new Date().toISOString() };
  }
);

export const inngestFunctions = [
  processSurveyMedia,
  checkQuoteExpiry,
  checkPermitReminders,
];
