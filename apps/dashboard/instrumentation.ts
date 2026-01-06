import { MonitoringProvider } from '@workspace/monitoring/provider';
import { registerJobHandlers, shutdownPgBoss } from '@workspace/billing/jobs';

export async function register() {
  // Initialize monitoring
  await MonitoringProvider.register();

  // Register background job handlers
  if (process.env.NODE_ENV !== 'test') {
    try {
      await registerJobHandlers();
      console.log('[instrumentation] Job handlers registered successfully');
    } catch (error) {
      console.error('[instrumentation] Failed to register job handlers:', error);
    }
  }

  // Register cleanup handlers
  const cleanup = async () => {
    console.log('[instrumentation] Shutting down job queue...');
    await shutdownPgBoss();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

export const onRequestError = MonitoringProvider.captureRequestError;
