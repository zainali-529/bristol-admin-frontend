import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchTestimonials,
  fetchTestimonialStats,
  deleteTestimonial,
  updateTestimonialStatus,
  setFilters,
  setPaginationLimit,
} from '@/store/testimonialsSlice'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import Pagination from '@/components/shared/Pagination'
import TestimonialFormSheet from '@/components/testimonials/TestimonialFormSheet'
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Calendar, Star, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function Testimonials() {
  const dispatch = useAppDispatch()
  const { testimonials, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.testimonials
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [selectedTestimonialId, setSelectedTestimonialId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchTestimonialStats())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchTestimonials(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchTestimonials({
      page: 1,
      limit: pagination.limit,
      ...filters,
      search: value
    }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchTestimonials({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchTestimonials({ page: 1, limit, ...filters }))
  }

  const handleAddTestimonialClick = () => {
    setSelectedTestimonialId(null)
    setFormSheetOpen(true)
  }

  const handleEditClick = (testimonial) => {
    setSelectedTestimonialId(testimonial._id)
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (testimonial) => {
    const newStatus = !testimonial.isActive
    const result = await dispatch(updateTestimonialStatus({ id: testimonial._id, isActive: newStatus }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Testimonial ${newStatus ? 'activated' : 'deactivated'} successfully`)
      dispatch(fetchTestimonialStats())
    } else {
      toast.error(result.payload || 'Failed to update testimonial status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (testimonialToDelete) {
      const result = await dispatch(deleteTestimonial(testimonialToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Testimonial deleted successfully')
        setDeleteDialogOpen(false)
        setTestimonialToDelete(null)
        dispatch(fetchTestimonials({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchTestimonialStats())
      } else {
        toast.error(result.payload || 'Failed to delete testimonial')
      }
    }
  }

  const handleFormSaveSuccess = () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchTestimonials(params))
    dispatch(fetchTestimonialStats())
  }

  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (testimonial) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{testimonial.name}</p>
          <p className="text-xs line-clamp-1 mt-1" style={{ color: 'var(--text-secondary)' }}>
            {testimonial.position} at {testimonial.company}
          </p>
        </div>
      ),
    },
    {
      key: 'testimonial',
      label: 'Testimonial',
      render: (testimonial) => (
        <p className="text-sm line-clamp-2 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          {testimonial.testimonial}
        </p>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (testimonial) => (
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span style={{ color: 'var(--text-primary)' }}>{testimonial.rating}/5</span>
        </div>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (testimonial) => (
        <span style={{ color: 'var(--text-primary)' }}>{testimonial.displayOrder}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (testimonial) => <StatusBadge isActive={testimonial.isActive} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (testimonial) => (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Calendar className="size-4" />
          {format(new Date(testimonial.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (testimonial) => (
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
            <DropdownMenuItem onClick={() => handleEditClick(testimonial)}>
              <Edit className="mr-2 size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(testimonial)}>
              {testimonial.isActive ? (
                <> <EyeOff className="mr-2 size-4" /> Deactivate </>
              ) : (
                <> <Eye className="mr-2 size-4" /> Activate </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(testimonial)} className="text-destructive">
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
            Testimonials
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage client testimonials displayed on your website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch(fetchTestimonials({ page: pagination.currentPage, limit: pagination.limit, ...filters }))}
            disabled={loading}
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleAddTestimonialClick}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Plus className="mr-2 size-4" /> Add Testimonial
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="flex items-center justify-between rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Testimonials</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.total}
              </p>
            </div>
          </Card>
          <Card
            className="flex items-center justify-between rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Testimonials</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.active}
              </p>
            </div>
          </Card>
          <Card
            className="flex items-center justify-between rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Inactive Testimonials</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.inactive}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4" style={{ color: 'var(--text-secondary)' }} />
              <Input
                placeholder="Search testimonials..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div
          className="p-4 rounded-md border"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Data Table */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardContent className="p-0">
          <DataTable
            data={testimonials}
            columns={columns}
            loading={loading}
            emptyMessage="No testimonials found. Click 'Add Testimonial' to create one."
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalTestimonials}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Form Sheet */}
      <TestimonialFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        testimonialId={selectedTestimonialId}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>
              Delete Testimonial
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete the testimonial from "{testimonialToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setTestimonialToDelete(null)}
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: '#ef4444', color: 'white' }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Testimonials

