import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchServices,
  fetchServiceStats,
  deleteService,
  updateServiceStatus,
  setFilters,
  setPaginationLimit,
} from '@/store/servicesSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import ServiceFilterSheet from '@/components/services/ServiceFilterSheet'
import Pagination from '@/components/shared/Pagination'
import ServiceFormSheet from '@/components/services/ServiceFormSheet'
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
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Star, StarOff, Calendar, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

function Services() {
  const dispatch = useAppDispatch()
  const { services, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.services
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchServiceStats())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.featured && { featured: filters.featured }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchServices(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchServices({
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
    dispatch(fetchServices({
      page: 1,
      limit: pagination.limit,
      ...filters
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = { status: '', featured: '', search: '', sortBy: 'displayOrder', sortOrder: 'asc' }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchServices({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchServices({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchServices({ page: 1, limit, ...filters }))
  }

  const handleAddServiceClick = () => {
    setSelectedServiceId(null)
    setFormSheetOpen(true)
  }

  const handleEditClick = (service) => {
    setSelectedServiceId(service._id)
    setFormSheetOpen(true)
    // Don't fetch here - let the form sheet handle it
  }

  const handleDeleteClick = (service) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (service) => {
    const newStatus = !service.isActive
    const result = await dispatch(updateServiceStatus({ id: service._id, isActive: newStatus }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Service ${newStatus ? 'activated' : 'deactivated'} successfully`)
      dispatch(fetchServiceStats())
    } else {
      toast.error(result.payload || 'Failed to update service status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      const result = await dispatch(deleteService(serviceToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Service deleted successfully')
        setDeleteDialogOpen(false)
        setServiceToDelete(null)
        dispatch(fetchServices({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchServiceStats())
      } else {
        toast.error(result.payload || 'Failed to delete service')
      }
    }
  }

  const handleFormSaveSuccess = () => {
    // Refresh list and stats after successful save
    // Use current filters and pagination to maintain state
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.featured && { featured: filters.featured }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchServices(params))
    dispatch(fetchServiceStats())
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (service) => (
        <img
          src={service.mainImage?.url || '/placeholder.png'}
          alt={service.title}
          className="size-10 rounded-md object-cover"
        />
      ),
    },
    {
      key: 'title',
      label: 'Service',
      render: (service) => {
        const IconComponent = LucideIcons[service.cardIcon] || LucideIcons.Zap
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-10)' }}
            >
              <IconComponent size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{service.title}</p>
              <p className="text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                {service.cardDescription}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (service) => (
        <span style={{ color: 'var(--text-primary)' }}>{service.displayOrder}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (service) => (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Calendar className="size-4" />
          {format(new Date(service.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (service) => (
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
            <DropdownMenuItem onClick={() => handleEditClick(service)}>
              <Edit className="mr-2 size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(service)}>
              {service.isActive ? (
                <> <EyeOff className="mr-2 size-4" /> Deactivate </>
              ) : (
                <> <Eye className="mr-2 size-4" /> Activate </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(service)} className="text-destructive">
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Services
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your services and their details.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.active}
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Inactive</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.inactive}
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Featured</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.featured}
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recent</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.recent}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Left */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--text-secondary)' }} />
          <Input
            placeholder="Search services..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            style={{ 
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleSearch('')}
              style={{ color: 'var(--text-secondary)' }}
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
          style={{ 
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            backgroundColor: 'transparent'
          }}
        >
          <Filter className="mr-2 size-4" />
          Filter
        </Button>
        {/* Add Service Button */}
        <Button 
          onClick={handleAddServiceClick} 
          className="shrink-0"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus className="mr-2 size-4" /> Add Service
        </Button>
      </div>

      {/* Table */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Service List</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            {pagination.totalServices} total services
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
            data={services}
            loading={loading}
            emptyMessage="No services found"
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

      {/* Service Form Sheet */}
      <ServiceFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        serviceId={selectedServiceId}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Service Filter Sheet */}
      <ServiceFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service{' '}
              {serviceToDelete && `"${serviceToDelete.title}"`}.
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

export default Services
