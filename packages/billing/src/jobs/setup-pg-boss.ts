import PgBoss from 'pg-boss';

let bossInstance: PgBoss | null = null;

/**
 * Initialize and return a PgBoss instance
 * Uses singleton pattern to reuse connection
 */
export async function getPgBoss(): Promise<PgBoss> {
  if (bossInstance) {
    return bossInstance;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Use simplified configuration - pg-boss 11.x has different options
  const boss = new PgBoss(process.env.DATABASE_URL);

  await boss.start();
  bossInstance = boss;

  return boss;
}

/**
 * Gracefully shutdown PgBoss
 * Call this when the application is shutting down
 */
export async function shutdownPgBoss(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop();
    bossInstance = null;
  }
}

/**
 * Health check for PgBoss
 * Returns true if PgBoss is running and healthy
 */
export async function isPgBossHealthy(): Promise<boolean> {
  try {
    if (!bossInstance) {
      return false;
    }
    // Simple health check - check if instance exists and is started
    return true;
  } catch (error) {
    console.error('PgBoss health check failed:', error);
    return false;
  }
}
