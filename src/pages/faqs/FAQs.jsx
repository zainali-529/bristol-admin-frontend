import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchFAQs,
  fetchFAQStats,
  fetchFAQCategories,
  deleteFAQ,
  updateFAQStatus,
  setFilters,
  setPaginationLimit,
} from '@/store/faqsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import FAQFilterSheet from '@/components/faqs/FAQFilterSheet'
import Pagination from '@/components/shared/Pagination'
import FAQFormSheet from '@/components/faqs/FAQFormSheet'
import StatusBadge from '@/components/shared/StatusBadge'
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
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, HelpCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function FAQs() {
  const dispatch = useAppDispatch()
  const { faqs, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.faqs
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedFAQId, setSelectedFAQId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFAQToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchFAQStats())
    dispatch(fetchFAQCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchFAQs(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchFAQs({
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
    dispatch(fetchFAQs({
      page: 1,
      limit: pagination.limit,
      ...filters
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = { status: '', category: '', search: '', sortBy: 'displayOrder', sortOrder: 'asc' }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchFAQs({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchFAQs({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchFAQs({ page: 1, limit, ...filters }))
  }

  const handleAddFAQClick = () => {
    setSelectedFAQId(null)
    setFormSheetOpen(true)
  }

  const handleEditClick = (faq) => {
    setSelectedFAQId(faq._id)
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (faq) => {
    setFAQToDelete(faq)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (faq) => {
    const newStatus = !faq.isActive
    const result = await dispatch(updateFAQStatus({ id: faq._id, isActive: newStatus }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`FAQ ${newStatus ? 'activated' : 'deactivated'} successfully`)
      dispatch(fetchFAQStats())
    } else {
      toast.error(result.payload || 'Failed to update FAQ status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (faqToDelete) {
      const result = await dispatch(deleteFAQ(faqToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('FAQ deleted successfully')
        setDeleteDialogOpen(false)
        setFAQToDelete(null)
        dispatch(fetchFAQs({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchFAQStats())
      } else {
        toast.error(result.payload || 'Failed to delete FAQ')
      }
    }
  }

  const handleFormSaveSuccess = () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchFAQs(params))
    dispatch(fetchFAQStats())
  }

  const columns = [
    {
      key: 'question',
      label: 'Question',
      render: (faq) => (
        <div className="max-w-md">
          <p className="font-medium line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {faq.question}
          </p>
          <p className="text-sm line-clamp-1 mt-1" style={{ color: 'var(--text-secondary)' }}>
            {faq.answer}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (faq) => (
        <Badge variant="secondary" style={{ backgroundColor: 'var(--primary-10)', color: 'var(--primary)' }}>
          {faq.category || 'General'}
        </Badge>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (faq) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            {faq.displayOrder}
          </Badge>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (faq) => (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(faq.updatedAt), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (faq) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }}>
            <DropdownMenuItem onClick={() => handleEditClick(faq)}>
              <Edit className="mr-2 size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(faq)}>
              {faq.isActive ? (
                <>
                  <EyeOff className="mr-2 size-4" /> Deactivate
                </>
              ) : (
                <>
                  <Eye className="mr-2 size-4" /> Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(faq)} className="text-destructive">
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
            FAQs
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage frequently asked questions
          </p>
        </div>
        <Button
          onClick={handleAddFAQClick}
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus className="mr-2 size-4" /> Add FAQ
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Total FAQs
              </CardTitle>
              <HelpCircle className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Active FAQs
              </CardTitle>
              <Eye className="h-4 w-4" style={{ color: '#10b981' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.active}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Inactive FAQs
              </CardTitle>
              <EyeOff className="h-4 w-4" style={{ color: '#ef4444' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.inactive}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Categories
              </CardTitle>
              <Filter className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.categories}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Bar */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <Input
                placeholder="Search questions, answers, or categories..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-9"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              {searchValue && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterSheetOpen(true)}
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <Filter className="mr-2 size-4" /> Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQs Table */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>All FAQs</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            {pagination.totalFAQs} total FAQs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <DataTable
            columns={columns}
            data={faqs}
            loading={loading}
            emptyMessage="No FAQs found"
          />
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

      {/* FAQ Form Sheet */}
      <FAQFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        faqId={selectedFAQId}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Filter Sheet */}
      <FAQFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
              This action cannot be undone. This will permanently delete the FAQ:{' '}
              <strong>{faqToDelete?.question}</strong>
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

export default FAQs

