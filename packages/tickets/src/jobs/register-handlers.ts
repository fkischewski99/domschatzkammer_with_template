import type PgBoss from 'pg-boss';
import { processWebhookHandler } from './handlers/process-webhook-handler';

export const JOB_NAMES = {
  PROCESS_WEBHOOK: 'ticket-system.process-webhook',
} as const;

/**
 * Register all job handlers with the queue
 * This should be called once during application startup
 */
export async function registerJobHandlers(queue: PgBoss): Promise<void> {
  // Register webhook processing handler
  await queue.work(JOB_NAMES.PROCESS_WEBHOOK, async (jobs) => {
    const jobArray = Array.isArray(jobs) ? jobs : [jobs];
    for (const job of jobArray) {
      await processWebhookHandler(job as any);
    }
  });

  console.log('Job handlers registered successfully');
}

/**
 * Enqueue a webhook processing job
 */
export async function enqueueWebhookJob(
  queue: PgBoss,
  payload: Parameters<typeof processWebhookHandler>[0]['data']
): Promise<string | null> {
  return await queue.send(JOB_NAMES.PROCESS_WEBHOOK, payload);
}
