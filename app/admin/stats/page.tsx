'use client'

import { useEffect, useMemo, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase, Report } from '@/lib/supabase'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'

type StatusCounts = {
  new: number
  resolved: number
  unresolved: number
}

export default function AdminStatsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(
    new Date()
  )

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setReports(data || [])
    } catch (error: any) {
      toast.error('Failed to load stats data')
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo<StatusCounts>(() => {
    return reports.reduce(
      (acc, report) => {
        acc[report.status]++
        return acc
      },
      { new: 0, resolved: 0, unresolved: 0 } as StatusCounts
    )
  }, [reports])

  const reportsByType = useMemo(() => {
    const map: Record<
      string,
      { type: string; new: number; resolved: number; unresolved: number }
    > = {}

    for (const report of reports) {
      if (!map[report.type]) {
        map[report.type] = {
          type: report.type,
          new: 0,
          resolved: 0,
          unresolved: 0,
        }
      }
      map[report.type][report.status]++
    }

    return Object.values(map)
  }, [reports])

  const reportsByDay = useMemo(() => {
    if (!selectedMonth) return {}

    const start = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    )
    const end = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    )

    const counts: Record<string, number> = {}

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      counts[key] = 0
    }

    for (const report of reports) {
      const createdDate = new Date(report.created_at)
      if (
        createdDate.getFullYear() === selectedMonth.getFullYear() &&
        createdDate.getMonth() === selectedMonth.getMonth()
      ) {
        const key = report.created_at.slice(0, 10)
        counts[key] = (counts[key] || 0) + 1
      }
    }

    return counts
  }, [reports, selectedMonth])

  const highlightedDays = useMemo(
    () =>
      Object.entries(reportsByDay)
        .filter(([_, count]) => count > 0)
        .map(([date]) => new Date(date)),
    [reportsByDay]
  )

  const statusChartConfig = {
    new: {
      label: 'New',
      color: 'hsl(221 83% 53%)',
    },
    resolved: {
      label: 'Resolved',
      color: 'hsl(142 71% 45%)',
    },
    unresolved: {
      label: 'Unresolved',
      color: 'hsl(0 84% 60%)',
    },
  }

  const dailyTrendData = useMemo(() => {
    if (!reports.length) return []

    // Compute last 30 days window
    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - 29)
    start.setHours(0, 0, 0, 0)

    const map: Record<string, { date: string; label: string; total: number }> =
      {}

    // Initialize every day in the range with 0
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      map[key] = {
        date: key,
        label: d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        total: 0,
      }
    }

    for (const report of reports) {
      const d = new Date(report.created_at)
      if (d >= start && d <= today) {
        const key = report.created_at.slice(0, 10)
        if (!map[key]) {
          map[key] = {
            date: key,
            label: d.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            }),
            total: 0,
          }
        }
        map[key].total += 1
      }
    }

    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([_, value]) => value)
  }, [reports])

  const trendChartConfig = {
    total: {
      label: 'Total reports (last 30 days)',
      color: 'hsl(221 83% 53%)',
    },
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports
                </CardTitle>
                <CardDescription>All time submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reports.length}</div>
              </CardContent>
            </Card>

            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolution Rate
                </CardTitle>
                <CardDescription>
                  Based on resolved vs total reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {reports.length > 0
                    ? `${Math.round((totals.resolved / reports.length) * 100)}%`
                    : '0%'}
                </div>
              </CardContent>
            </Card>

            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Cases
                </CardTitle>
                <CardDescription>New or unresolved reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totals.new + totals.unresolved}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 border-0 border-t-4 border-blue-600">
              <CardHeader>
                <CardTitle>Reports by Type & Status</CardTitle>
                <CardDescription>
                  Breakdown of incidents per category and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-gray-500 py-10">
                    Loading chart...
                  </p>
                ) : reportsByType.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    No reports yet to display.
                  </p>
                ) : (
                  <ChartContainer
                    config={statusChartConfig}
                    className="w-full h-[320px]"
                  >
                    <BarChart data={reportsByType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="type"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.2)' }}
                        content={<ChartTooltipContent />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="new" stackId="a" fill="var(--color-new)" />
                      <Bar
                        dataKey="resolved"
                        stackId="a"
                        fill="var(--color-resolved)"
                      />
                      <Bar
                        dataKey="unresolved"
                        stackId="a"
                        fill="var(--color-unresolved)"
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader>
                <CardTitle>Daily Reports Trend</CardTitle>
                <CardDescription>Last 30 days of report volume</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-gray-500 py-10">
                    Loading chart...
                  </p>
                ) : dailyTrendData.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    No reports yet to display.
                  </p>
                ) : (
                  <ChartContainer
                    config={trendChartConfig}
                    className="w-full h-[260px]"
                  >
                    <LineChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={{ stroke: 'rgba(148, 163, 184, 0.6)' }}
                        content={<ChartTooltipContent />}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="var(--color-total)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className='border-0 border-t-4 border-blue-600'>
              <CardHeader>
                <CardTitle>Reports Calendar</CardTitle>
                <CardDescription>
                  Number of reports created each day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col items-center">
                <Calendar 
                  mode="single"
                  selected={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  onSelect={setSelectedMonth}
                  month={selectedMonth}
                  modifiers={{
                    hasReports: highlightedDays,
                  }}
                  modifiersClassNames={{
                    hasReports:
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  }}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedMonth && (
                    <>
                      <span className="font-medium">
                        Reports this month:{' '}
                      </span>
                      {Object.values(reportsByDay).reduce(
                        (sum, count) => sum + count,
                        0
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

