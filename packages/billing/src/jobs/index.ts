import { getPgBoss } from './setup-pg-boss';
import { processPurchase, type ProcessPurchaseJobData } from './handlers/process-purchase';

export type { ProcessPurchaseJobData };

/**
 * Enqueue a purchase processing job
 * This should be called from the Stripe webhook after checkout.session.completed
 */
export async function enqueuePurchaseProcessing(purchaseId: string): Promise<void> {
  const boss = await getPgBoss();

  await boss.send('process-purchase', {
    purchaseId,
  } as ProcessPurchaseJobData);

  console.log(`[jobs] Enqueued purchase processing for ${purchaseId}`);
}

/**
 * Register all job handlers
 * This should be called once when the application starts
 */
export async function registerJobHandlers(): Promise<void> {
  const boss = await getPgBoss();

  // Register purchase processing handler
  await boss.work('process-purchase', async (jobs) => {
    // jobs is an array in pg-boss 11.x
    const jobArray = Array.isArray(jobs) ? jobs : [jobs];

    for (const job of jobArray) {
      if (!job || !job.data) {
        console.error('[jobs] Invalid job data:', job);
        continue;
      }
      await processPurchase({ data: job.data as ProcessPurchaseJobData });
    }
  });

  console.log('[jobs] All job handlers registered');
}

/**
 * Export job management functions
 */
export { getPgBoss, shutdownPgBoss, isPgBossHealthy } from './setup-pg-boss';
