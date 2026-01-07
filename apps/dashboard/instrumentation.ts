import { MonitoringProvider } from '@workspace/monitoring/provider';

export async function register() {
  // Initialize monitoring
  await MonitoringProvider.register();
}

export const onRequestError = MonitoringProvider.captureRequestError;
