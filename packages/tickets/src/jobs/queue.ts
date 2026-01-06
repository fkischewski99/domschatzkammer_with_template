import PgBoss from 'pg-boss';

let boss: PgBoss | null = null;

export interface QueueConfig {
  connectionString: string;
  schema?: string;
}

/**
 * Initialize the job queue with pg-boss
 */
export async function initializeQueue(config: QueueConfig): Promise<PgBoss> {
  if (boss) {
    return boss;
  }

  boss = new PgBoss({
    connectionString: config.connectionString,
    schema: config.schema ?? 'pgboss',
  });

  await boss.start();

  return boss;
}

/**
 * Get the initialized job queue instance
 */
export function getQueue(): PgBoss {
  if (!boss) {
    throw new Error('Job queue not initialized. Call initializeQueue() first.');
  }
  return boss;
}

/**
 * Stop the job queue gracefully
 */
export async function stopQueue(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
  }
}

/**
 * Check if the queue is ready
 */
export function isQueueReady(): boolean {
  return boss !== null;
}
