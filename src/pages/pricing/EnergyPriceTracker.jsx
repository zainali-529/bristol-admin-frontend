import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchEnergyPrices,
  fetchCurrentEnergyPrice,
  deleteEnergyPrice,
  setFilters,
  setPaginationLimit,
} from '@/store/energyPricesSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataTable from '@/components/shared/DataTable'
import Pagination from '@/components/shared/Pagination'
import StatusBadge from '@/components/shared/StatusBadge'
import EnergyPriceFormSheet from '@/components/energyPrices/EnergyPriceFormSheet'
import LivePriceCardPreview from '@/components/energyPrices/LivePriceCardPreview'
import PriceHistoryChart from '@/components/energyPrices/PriceHistoryChart'
import PriceComparisonChart from '@/components/energyPrices/PriceComparisonChart'
import PriceHistoryDetailSheet from '@/components/energyPrices/PriceHistoryDetailSheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Zap,
  Flame,
  RefreshCw,
  Eye,
  BarChart3,
  LineChart
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function EnergyPriceTracker() {
  const dispatch = useAppDispatch()
  const { prices, currentPrice, pagination, filters, loading, error } = useAppSelector(
    (state) => state.energyPrices
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [priceToDelete, setPriceToDelete] = useState(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState(null)

  useEffect(() => {
    dispatch(fetchCurrentEnergyPrice())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.isActive && { isActive: filters.isActive }),
    }
    dispatch(fetchEnergyPrices(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handlePageChange = (page) => {
    dispatch(fetchEnergyPrices({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchEnergyPrices({ page: 1, limit, ...filters }))
  }

  const handleEditClick = () => {
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (price) => {
    setPriceToDelete(price)
    setDeleteDialogOpen(true)
  }

  const handleViewDetails = (price) => {
    setSelectedPrice(price)
    setDetailSheetOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (priceToDelete) {
      const result = await dispatch(deleteEnergyPrice(priceToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Energy price data deleted successfully')
        setDeleteDialogOpen(false)
        setPriceToDelete(null)
        dispatch(fetchEnergyPrices({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchCurrentEnergyPrice())
      } else {
        toast.error(result.payload || 'Failed to delete energy price data')
      }
    }
  }

  const handleFormSaveSuccess = () => {
    dispatch(fetchCurrentEnergyPrice())
    dispatch(fetchEnergyPrices({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
  }

  const handleRefresh = () => {
    dispatch(fetchCurrentEnergyPrice())
    dispatch(fetchEnergyPrices({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
  }

  // Calculate trend and change for preview
  const getElectricityTrend = () => {
    if (!currentPrice?.electricity?.history || currentPrice.electricity.history.length < 2) {
      return { trend: 'stable', change: 0 }
    }
    const history = currentPrice.electricity.history
    const latest = history[history.length - 1]
    const previous = history[history.length - 2]
    const change = ((latest.price - previous.price) / previous.price) * 100
    if (change > 0.1) return { trend: 'up', change }
    if (change < -0.1) return { trend: 'down', change }
    return { trend: 'stable', change }
  }

  const getGasTrend = () => {
    if (!currentPrice?.gas?.history || currentPrice.gas.history.length < 2) {
      return { trend: 'stable', change: 0 }
    }
    const history = currentPrice.gas.history
    const latest = history[history.length - 1]
    const previous = history[history.length - 2]
    const change = ((latest.price - previous.price) / previous.price) * 100
    if (change > 0.1) return { trend: 'up', change }
    if (change < -0.1) return { trend: 'down', change }
    return { trend: 'stable', change }
  }

  const electricityTrend = getElectricityTrend()
  const gasTrend = getGasTrend()

  const columns = [
    {
      key: 'electricity',
      label: 'Electricity',
      render: (price) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            £{price.electricity?.current?.toFixed(4) || '0.0000'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {price.electricity?.unit || '£/kWh'}
          </p>
        </div>
      ),
    },
    {
      key: 'gas',
      label: 'Gas',
      render: (price) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            £{price.gas?.current?.toFixed(4) || '0.0000'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {price.gas?.unit || '£/kWh'}
          </p>
        </div>
      ),
    },
    {
      key: 'insights',
      label: 'Market Status',
      render: (price) => {
        const status = price.insights?.marketStatus || 'stable'
        const sentiment = price.insights?.sentiment || 'neutral'
        
        const getStatusConfig = () => {
          switch (status) {
            case 'rising':
              return { label: 'Rising', color: '#ef4444', icon: TrendingUp }
            case 'falling':
              return { label: 'Falling', color: '#10b981', icon: TrendingDown }
            default:
              return { label: 'Stable', color: 'var(--text-secondary)', icon: Minus }
          }
        }

        const config = getStatusConfig()
        const StatusIcon = config.icon

        return (
          <div className="flex items-center gap-2">
            <StatusIcon size={16} style={{ color: config.color }} />
            <span style={{ color: 'var(--text-primary)' }}>{config.label}</span>
            {sentiment && (
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' : 
                                  sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 
                                  'var(--primary-5)',
                  color: sentiment === 'positive' ? '#10b981' : 
                         sentiment === 'negative' ? '#ef4444' : 
                         'var(--text-secondary)',
                }}
              >
                {sentiment}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (price) => (
        <StatusBadge status={price.isActive ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (price) => (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Calendar className="size-4" />
          {format(new Date(price.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (price) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(price)}>
              <Eye className="mr-2 size-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(price)} className="text-destructive">
              <Trash2 className="mr-2 size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Energy Price Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage energy prices and market insights displayed on your website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            style={{ 
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={handleEditClick} 
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Plus className="mr-2 size-4" /> Update Prices
          </Button>
        </div>
      </div>

      {/* Preview & Analytics Section */}
      {currentPrice && (
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Live Price Tracker</CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)' }}>
              Current prices, trends, and market analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LivePriceCardPreview
                    type="electricity"
                    current={currentPrice.electricity?.current}
                    change={electricityTrend.change}
                    trend={electricityTrend.trend}
                    lastUpdate={currentPrice.updatedAt}
                  />
                  <LivePriceCardPreview
                    type="gas"
                    current={currentPrice.gas?.current}
                    change={gasTrend.change}
                    trend={gasTrend.trend}
                    lastUpdate={currentPrice.updatedAt}
                  />
                </div>

                {/* Market Insights Preview */}
                {currentPrice.insights && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{ 
                      backgroundColor: currentPrice.insights.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                      currentPrice.insights.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' :
                                      'var(--primary-5)',
                      border: '1px solid var(--primary-10)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Activity 
                        size={20} 
                        style={{ 
                          color: currentPrice.insights.sentiment === 'positive' ? '#10b981' :
                                 currentPrice.insights.sentiment === 'negative' ? '#ef4444' :
                                 'var(--primary)'
                        }} 
                      />
                      <h4 
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Market Insights
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status:</span>
                        <Badge variant="secondary">
                          {currentPrice.insights.marketStatus || 'stable'}
                        </Badge>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sentiment:</span>
                        <Badge variant="secondary">
                          {currentPrice.insights.sentiment || 'neutral'}
                        </Badge>
                      </div>
                      {currentPrice.insights.recommendation && (
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {currentPrice.insights.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-4">
                <div 
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <LineChart size={20} style={{ color: 'var(--primary)' }} />
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Price Trends Over Time
                    </h4>
                  </div>
                  {currentPrice.electricity?.history && currentPrice.gas?.history ? (
                    <PriceHistoryChart
                      electricityHistory={currentPrice.electricity.history}
                      gasHistory={currentPrice.gas.history}
                      showElectricity={true}
                      showGas={true}
                    />
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No historical data available</p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}
                  >
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Elec. Avg</p>
                    <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                      £{currentPrice.electricity?.average?.toFixed(4) || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}
                  >
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Elec. Range</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      £{currentPrice.electricity?.low?.toFixed(4) || 'N/A'} - £{currentPrice.electricity?.high?.toFixed(4) || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}
                  >
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Gas Avg</p>
                    <p className="text-2xl font-bold" style={{ color: '#f97316' }}>
                      £{currentPrice.gas?.average?.toFixed(4) || 'N/A'}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--primary-5)', border: '1px solid var(--primary-10)' }}
                  >
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Gas Range</p>
                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      £{currentPrice.gas?.low?.toFixed(4) || 'N/A'} - £{currentPrice.gas?.high?.toFixed(4) || 'N/A'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="space-y-4">
                <div 
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Electricity vs Gas Comparison
                    </h4>
                  </div>
                  <PriceComparisonChart
                    electricityData={currentPrice.electricity}
                    gasData={currentPrice.gas}
                  />
                </div>

                {/* Detailed Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={20} style={{ color: '#3b82f6' }} />
                      <h5 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Electricity Statistics
                      </h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Current Price:</span>
                        <span className="font-bold" style={{ color: '#3b82f6' }}>
                          £{currentPrice.electricity?.current?.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Average:</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          £{currentPrice.electricity?.average?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Highest:</span>
                        <span className="font-medium" style={{ color: '#ef4444' }}>
                          £{currentPrice.electricity?.high?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Lowest:</span>
                        <span className="font-medium" style={{ color: '#10b981' }}>
                          £{currentPrice.electricity?.low?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Data Points:</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {currentPrice.electricity?.history?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--primary-10)' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Flame size={20} style={{ color: '#f97316' }} />
                      <h5 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Gas Statistics
                      </h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Current Price:</span>
                        <span className="font-bold" style={{ color: '#f97316' }}>
                          £{currentPrice.gas?.current?.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Average:</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          £{currentPrice.gas?.average?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Highest:</span>
                        <span className="font-medium" style={{ color: '#ef4444' }}>
                          £{currentPrice.gas?.high?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Lowest:</span>
                        <span className="font-medium" style={{ color: '#10b981' }}>
                          £{currentPrice.gas?.low?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Data Points:</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {currentPrice.gas?.history?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Price History Table */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Price History</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            {pagination.totalPrices} total price records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div 
              className="mb-4 p-3 rounded-md border text-sm"
              style={{ 
                backgroundColor: 'var(--destructive)',
                borderColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                opacity: 0.9
              }}
            >
              {error}
            </div>
          )}
          <DataTable
            columns={columns}
            data={prices}
            loading={loading}
            emptyMessage="No price records found"
          />
          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Energy Price Form Sheet */}
      <EnergyPriceFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Price History Detail Sheet */}
      <PriceHistoryDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        priceData={selectedPrice}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
              This action cannot be undone. This will permanently delete the energy price record
              {priceToDelete && ` from ${format(new Date(priceToDelete.createdAt), 'PP')}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default EnergyPriceTracker

