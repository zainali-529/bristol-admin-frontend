import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, TrendingUp, TrendingDown, Zap, Flame, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'
import PriceHistoryChart from '@/components/energyPrices/PriceHistoryChart'
import PriceComparisonChart from '@/components/energyPrices/PriceComparisonChart'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { format } from 'date-fns'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDashboard, fetchRecentActivity, fetchDashboardStats } from '@/store/dashboardSlice'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

function DashboardPage() {
  const dispatch = useAppDispatch()
  const {
    loading,
    energy,
    energyList,
    contactStats,
    quoteStats,
    supplierStats,
    newsStats,
    faqStats,
    tmStats,
    documentStats,
    heroStats,
    recentQuotes,
    recentContacts,
    lastFetched,
  } = useAppSelector((state) => state.dashboard)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (!lastFetched) {
      dispatch(fetchDashboard())
    }
  }, [lastFetched, dispatch])

  useEffect(() => {
    dispatch(fetchRecentActivity({ dateFrom, dateTo }))
  }, [dateFrom, dateTo, dispatch])

  // Soft auto-refresh: refresh stats every 30s while on dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats())
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  // Refresh on tab focus if data is stale (>60s)
  useEffect(() => {
    const handler = () => {
      const now = Date.now()
      if (!lastFetched || now - lastFetched > 60000) {
        dispatch(fetchDashboard())
      } else {
        dispatch(fetchDashboardStats())
      }
    }
    document.addEventListener('visibilitychange', handler)
    window.addEventListener('focus', handler)
    return () => {
      document.removeEventListener('visibilitychange', handler)
      window.removeEventListener('focus', handler)
    }
  }, [lastFetched, dispatch])

  const contactBarData = {
    labels: ['Contacts Status'],
    datasets: [
      {
        label: 'New',
        data: [contactStats?.byStatus?.new || 0],
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderColor: '#3b82f6',
        borderRadius: 8,
      },
      {
        label: 'Read',
        data: [contactStats?.byStatus?.read || 0],
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        borderColor: '#f59e0b',
        borderRadius: 8,
      },
      {
        label: 'Resolved',
        data: [contactStats?.byStatus?.resolved || 0],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#10b981',
        borderRadius: 8,
      },
    ],
  }

  const quoteBarData = {
    labels: ['Quotes Status'],
    datasets: [
      {
        label: 'New',
        data: [quoteStats?.byStatus?.new || 0],
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderColor: '#3b82f6',
        borderRadius: 8,
      },
      {
        label: 'Reviewing',
        data: [quoteStats?.byStatus?.reviewing || 0],
        backgroundColor: 'rgba(168, 85, 247, 0.85)',
        borderColor: '#a855f7',
        borderRadius: 8,
      },
      {
        label: 'Quoted',
        data: [quoteStats?.byStatus?.quoted || 0],
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        borderColor: '#f59e0b',
        borderRadius: 8,
      },
      {
        label: 'Accepted',
        data: [quoteStats?.byStatus?.accepted || 0],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#10b981',
        borderRadius: 8,
      },
    ],
  }

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          font: { size: 12, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: 'var(--card)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border)',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { display: false } },
    },
  }

  const elecHistory = energy?.electricity?.history || (energyList[0]?.electricity?.history || [])
  const gasHistory = energy?.gas?.history || (energyList[0]?.gas?.history || [])
  const elecChange = elecHistory.length > 1 ? ((elecHistory[elecHistory.length - 1].price - elecHistory[elecHistory.length - 2].price) / elecHistory[elecHistory.length - 2].price) * 100 : 0
  const gasChange = gasHistory.length > 1 ? ((gasHistory[gasHistory.length - 1].price - gasHistory[gasHistory.length - 2].price) / gasHistory[gasHistory.length - 2].price) * 100 : 0

  return (
    <div className="space-y-6">
      <Card 
        className="border-primary/10"
        style={{ 
          backgroundColor: 'var(--primary-5)',
          borderColor: 'var(--primary-10)'
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle 
            className="text-lg font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            Welcome back
          </CardTitle>
          <div className="flex gap-2">
            <Link to="/admin/news">
              <Button size="sm" className="gap-2" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Sparkles className="size-4" />
                Add News
              </Button>
            </Link>
            <Link to="/admin/pricing">
              <Button size="sm" variant="outline" className="gap-2">
                <Zap className="size-4" />
                Update Prices
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="size-4" style={{ color: '#f97316' }} />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Gas</p>
              </div>
              {gasChange > 0 ? <TrendingUp className="size-4" style={{ color: '#ef4444' }} /> : <TrendingDown className="size-4" style={{ color: '#10b981' }} />}
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: '#f97316' }}>£{energy?.gas?.current?.toFixed(4) || '0.0000'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{gasChange.toFixed(2)}%</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4" style={{ color: '#3b82f6' }} />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Electricity</p>
              </div>
              {elecChange > 0 ? <TrendingUp className="size-4" style={{ color: '#ef4444' }} /> : <TrendingDown className="size-4" style={{ color: '#10b981' }} />}
            </div>
            <p className="text-2xl font-bold mt-2" style={{ color: '#3b82f6' }}>£{energy?.electricity?.current?.toFixed(4) || '0.0000'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{elecChange.toFixed(2)}%</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Contacts</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{contactStats?.total ?? '-'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>New {contactStats?.byStatus?.new ?? 0}</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Quotes</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{quoteStats?.total ?? '-'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>New {quoteStats?.byStatus?.new ?? 0}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Energy Price Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {elecHistory.length || gasHistory.length ? (
              <PriceHistoryChart 
                electricityHistory={elecHistory}
                gasHistory={gasHistory}
                showElectricity
                showGas
              />
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No historical data</div>
            )}
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Electricity vs Gas</CardTitle>
          </CardHeader>
          <CardContent>
            {energy ? (
              <PriceComparisonChart 
                electricityData={{
                  current: energy?.electricity?.current,
                  average: energy?.electricity?.average,
                  high: energy?.electricity?.high,
                  low: energy?.electricity?.low,
                }}
                gasData={{
                  current: energy?.gas?.current,
                  average: energy?.gas?.average,
                  high: energy?.gas?.high,
                  low: energy?.gas?.low,
                }}
              />
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Latest Energy Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Market Status</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{energy?.insights?.marketStatus || 'stable'}</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sentiment</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{energy?.insights?.sentiment || 'neutral'}</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Unit</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{energy?.electricity?.unit || '£/kWh'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Contacts Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {contactStats ? (
              <div style={{ height: '220px' }}>
                <Bar data={contactBarData} options={stackedBarOptions} />
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
            )}
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Quotes Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {quoteStats ? (
              <div style={{ height: '220px' }}>
                <Bar data={quoteBarData} options={stackedBarOptions} />
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Filter Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--text-secondary)' }} />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pl-9" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--text-secondary)' }} />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="size-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card> */}

      <div className="grid gap-4 md:grid-cols-2">
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQuotes.map((q) => (
                <div key={q._id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{q.businessName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{q.contactName} • {q.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="size-4" />
                    {format(new Date(q.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
              {!recentQuotes.length && (
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No recent quotes</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <div key={c._id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar className="size-4" />
                    {format(new Date(c.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
              {!recentContacts.length && (
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No recent contacts</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
