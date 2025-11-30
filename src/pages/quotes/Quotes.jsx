import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchQuotes,
  fetchQuoteStats,
  deleteQuote,
  setFilters,
  setPaginationLimit,
  clearSelectedQuote,
} from '@/store/quotesSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DataTable from '@/components/shared/DataTable'
import FilterSheet from '@/components/shared/FilterDialog'
import Pagination from '@/components/shared/Pagination'
import StatusBadge from '@/components/shared/StatusBadge'
import QuoteDetailSheet from '@/components/quotes/QuoteDetailSheet'
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
import { Search, Filter, Trash2, Calendar, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function Quotes() {
  const dispatch = useAppDispatch()
  const { quotes, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.quotes
  )
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quoteToDelete, setQuoteToDelete] = useState(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchQuoteStats())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchQuotes(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchQuotes({ 
      page: 1, 
      limit: pagination.limit, 
      ...filters, 
      search: value 
    }))
  }

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters({ ...filters, ...newFilters }))
  }

  const handleApplyFilters = () => {
    dispatch(fetchQuotes({ 
      page: 1, 
      limit: pagination.limit, 
      ...filters 
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = { status: '', search: '', dateFrom: '', dateTo: '', sortBy: 'createdAt', sortOrder: 'desc' }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchQuotes({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchQuotes({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchQuotes({ page: 1, limit, ...filters }))
  }

  const handleRowClick = (quote) => {
    setSelectedQuote(quote._id)
  }

  const handleDeleteClick = (e, quote) => {
    e.stopPropagation()
    setQuoteToDelete(quote)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (quoteToDelete) {
      const result = await dispatch(deleteQuote(quoteToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Quote deleted successfully')
        setDeleteDialogOpen(false)
        setQuoteToDelete(null)
        dispatch(fetchQuotes({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchQuoteStats())
      } else {
        toast.error(result.payload || 'Failed to delete quote')
      }
    }
  }

  const columns = [
    {
      key: 'businessName',
      label: 'Business',
      render: (quote) => (
        <div>
          <p className="font-medium">{quote.businessName}</p>
          <p className="text-xs text-muted-foreground">{quote.contactName} • {quote.email}</p>
        </div>
      ),
    },
    {
      key: 'businessType',
      label: 'Type',
      render: (quote) => (
        <p className="text-sm">{quote.businessType}</p>
      ),
    },
    {
      key: 'postcode',
      label: 'Location',
      render: (quote) => (
        <p className="text-sm">{quote.postcode}</p>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (quote) => <StatusBadge status={quote.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (quote) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (quote) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleDeleteClick(e, quote)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Quote Requests
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage and respond to customer quote requests
          </p>
        </div>

        {/* Minimal Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-6">
            <div 
              className="flex items-center justify-between rounded-lg border p-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.total}
                </p>
              </div>
            </div>
            <div 
              className="flex items-center justify-between rounded-lg border p-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>New</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byStatus?.new || 0}
                </p>
              </div>
            </div>
            <div 
              className="flex items-center justify-between rounded-lg border p-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reviewing</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byStatus?.reviewing || 0}
                </p>
              </div>
            </div>
            <div 
              className="flex items-center justify-between rounded-lg border p-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Quoted</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byStatus?.quoted || 0}
                </p>
              </div>
            </div>
            <div 
              className="flex items-center justify-between rounded-lg border p-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Accepted</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byStatus?.accepted || 0}
                </p>
              </div>
            </div>
            <div 
              className="flex items-center justify-between rounded-lg border p-4"
              style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Today</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.today || 0}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Search and Filter Bar - Simple */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Left */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleSearch('')}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        {/* Filter Button - Right */}
        <Button
          variant="outline"
          onClick={() => setFilterSheetOpen(true)}
          className="shrink-0"
        >
          <Filter className="mr-2 size-4" />
          Filter
        </Button>
      </div>

        {/* Table */}
        <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Quote Requests List</CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)' }}>
              {pagination.totalQuotes} total quote requests
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
            data={quotes}
            loading={loading}
            emptyMessage="No quote requests found"
            onRowClick={handleRowClick}
          />
          {/* Pagination with Per Page Limit */}
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

      {/* Quote Detail Sheet */}
      <QuoteDetailSheet
        quoteId={selectedQuote}
        open={!!selectedQuote}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedQuote(null)
            dispatch(clearSelectedQuote())
          }
        }}
      />

      {/* Filter Sheet */}
      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        title="Filter Quotes"
        description="Filter quotes by status, date range, and sort options"
        statusOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'new', label: 'New' },
          { value: 'reviewing', label: 'Reviewing' },
          { value: 'quoted', label: 'Quoted' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'closed', label: 'Closed' },
        ]}
        sortOptions={[
          { value: 'createdAt', label: 'Date' },
          { value: 'businessName', label: 'Business Name' },
          { value: 'status', label: 'Status' },
          { value: 'postcode', label: 'Location' },
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quote request
              {quoteToDelete && ` for ${quoteToDelete.businessName}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Quotes

