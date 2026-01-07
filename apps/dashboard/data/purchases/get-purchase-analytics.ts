import { prisma } from '@workspace/database/client';

export interface PurchaseAnalytics {
  totalRevenue: number;
  ticketsSold: number;
  averageOrderValue: number;
  byTicketType: Array<{
    ticketId: string;
    ticketName: string;
    count: number;
    revenue: number;
  }>;
  timeline: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
}

export interface GetPurchaseAnalyticsParams {
  organizationId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Get purchase analytics for an organization
 * Includes total revenue, tickets sold, breakdown by ticket type, and timeline data
 */
export async function getPurchaseAnalytics({
  organizationId,
  dateFrom,
  dateTo,
}: GetPurchaseAnalyticsParams): Promise<PurchaseAnalytics> {
  const dateFilter = {
    ...(dateFrom && { gte: dateFrom }),
    ...(dateTo && { lte: dateTo }),
  };

  // Get all completed purchases in the date range
  const purchases = await prisma.purchase.findMany({
    where: {
      organizationId,
      status: 'COMPLETED',
      ...(Object.keys(dateFilter).length > 0 && { purchasedAt: dateFilter }),
    },
    include: {
      ticket: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { purchasedAt: 'asc' },
  });

  // Calculate totals
  const totalRevenue = purchases.reduce(
    (sum, p) => sum + Number(p.totalAmount),
    0
  );
  const ticketsSold = purchases.length;
  const averageOrderValue = ticketsSold > 0 ? totalRevenue / ticketsSold : 0;

  // Group by ticket type
  const ticketTypeMap = new Map<
    string,
    { ticketName: string; count: number; revenue: number }
  >();

  for (const purchase of purchases) {
    const existing = ticketTypeMap.get(purchase.ticketId);
    if (existing) {
      existing.count += 1;
      existing.revenue += Number(purchase.totalAmount);
    } else {
      ticketTypeMap.set(purchase.ticketId, {
        ticketName: purchase.ticket?.name || 'Unknown',
        count: 1,
        revenue: Number(purchase.totalAmount),
      });
    }
  }

  const byTicketType = Array.from(ticketTypeMap.entries()).map(
    ([ticketId, data]) => ({
      ticketId,
      ...data,
    })
  );

  // Group by date for timeline
  const timelineMap = new Map<string, { count: number; revenue: number }>();

  for (const purchase of purchases) {
    const dateKey = purchase.purchasedAt.toISOString().split('T')[0];
    const existing = timelineMap.get(dateKey);
    if (existing) {
      existing.count += 1;
      existing.revenue += Number(purchase.totalAmount);
    } else {
      timelineMap.set(dateKey, {
        count: 1,
        revenue: Number(purchase.totalAmount),
      });
    }
  }

  const timeline = Array.from(timelineMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    ticketsSold,
    averageOrderValue,
    byTicketType,
    timeline,
  };
}

/**
 * Get date range presets
 */
export function getDateRangePreset(
  preset: 'last7days' | 'last30days' | 'last90days' | 'allTime'
): { dateFrom?: Date; dateTo?: Date } {
  const now = new Date();
  const dateTo = new Date(now);
  dateTo.setHours(23, 59, 59, 999);

  switch (preset) {
    case 'last7days': {
      const dateFrom = new Date(now);
      dateFrom.setDate(dateFrom.getDate() - 7);
      dateFrom.setHours(0, 0, 0, 0);
      return { dateFrom, dateTo };
    }
    case 'last30days': {
      const dateFrom = new Date(now);
      dateFrom.setDate(dateFrom.getDate() - 30);
      dateFrom.setHours(0, 0, 0, 0);
      return { dateFrom, dateTo };
    }
    case 'last90days': {
      const dateFrom = new Date(now);
      dateFrom.setDate(dateFrom.getDate() - 90);
      dateFrom.setHours(0, 0, 0, 0);
      return { dateFrom, dateTo };
    }
    case 'allTime':
    default:
      return {};
  }
}
