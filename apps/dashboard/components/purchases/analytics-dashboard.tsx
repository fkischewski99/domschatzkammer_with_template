'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import type { PurchaseAnalytics } from '~/data/purchases/get-purchase-analytics';

interface AnalyticsDashboardProps {
  analytics: PurchaseAnalytics;
  organizationSlug: string;
  currentRange: string;
}

const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

export function AnalyticsDashboard({
  analytics,
  organizationSlug,
  currentRange,
}: AnalyticsDashboardProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.analytics');

  const handleRangeChange = (value: string) => {
    router.push(
      `/organizations/${organizationSlug}/settings/organization/purchases/analytics?range=${value}`
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={currentRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('dateRange.last30Days')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">{t('dateRange.last7Days')}</SelectItem>
            <SelectItem value="last30days">{t('dateRange.last30Days')}</SelectItem>
            <SelectItem value="last90days">{t('dateRange.last90Days')}</SelectItem>
            <SelectItem value="allTime">{t('dateRange.allTime')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('ticketsSold')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ticketsSold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('averageOrderValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('timeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('de-DE', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? t('totalRevenue') : t('ticketsSold'),
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString('de-DE')
                    }
                  />
                  <Bar dataKey="count" fill="#8884d8" name="count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {t('noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('byTicketType')}</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.byTicketType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.byTicketType}
                    dataKey="count"
                    nameKey="ticketName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.byTicketType.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, entry: any) => [
                      `${value} (${formatCurrency(entry.payload.revenue)})`,
                      entry.payload.ticketName,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                {t('noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
