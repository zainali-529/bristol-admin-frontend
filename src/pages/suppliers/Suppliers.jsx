import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchSuppliers,
  fetchSupplierStats,
  deleteSupplier,
  updateSupplierStatus,
  setFilters,
  setPaginationLimit,
  clearSelectedSupplier,
} from '@/store/suppliersSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import SupplierFilterSheet from '@/components/shared/SupplierFilterDialog'
import Pagination from '@/components/shared/Pagination'
import SupplierFormSheet from '@/components/suppliers/SupplierFormModal'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, ExternalLink, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function Suppliers() {
  const dispatch = useAppDispatch()
  const { suppliers, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.suppliers
  )
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchSupplierStats())
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
    dispatch(fetchSuppliers(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchSuppliers({ 
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
    dispatch(fetchSuppliers({ 
      page: 1, 
      limit: pagination.limit, 
      ...filters 
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = { status: '', search: '', sortBy: 'displayOrder', sortOrder: 'asc' }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchSuppliers({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchSuppliers({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchSuppliers({ page: 1, limit, ...filters }))
  }

  const handleCreateSupplier = () => {
    setSelectedSupplier(null)
    setFormSheetOpen(true)
  }

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (supplierToDelete) {
      const result = await dispatch(deleteSupplier(supplierToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Supplier deleted successfully')
        setDeleteDialogOpen(false)
        setSupplierToDelete(null)
        dispatch(fetchSuppliers({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchSupplierStats())
      } else {
        toast.error(result.payload || 'Failed to delete supplier')
      }
    }
  }

  const handleToggleStatus = async (supplier) => {
    const result = await dispatch(updateSupplierStatus({ 
      id: supplier._id, 
      isActive: !supplier.isActive 
    }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Supplier ${!supplier.isActive ? 'activated' : 'deactivated'} successfully`)
      dispatch(fetchSuppliers({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
      dispatch(fetchSupplierStats())
    } else {
      toast.error(result.payload || 'Failed to update supplier status')
    }
  }

  const handleFormSuccess = () => {
    dispatch(fetchSuppliers({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
    dispatch(fetchSupplierStats())
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (supplier) => (
        <div className="w-12 h-9 rounded-md overflow-hidden bg-muted">
          <img
            src={supplier.image?.url}
            alt={supplier.image?.alt || supplier.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (supplier) => (
        <div>
          <p className="font-medium">{supplier.name}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {supplier.description}
          </p>
        </div>
      ),
    },
    {
      key: 'websiteUrl',
      label: 'Website',
      render: (supplier) => (
        <a
          href={supplier.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <ExternalLink className="h-3 w-3" />
          Visit
        </a>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (supplier) => (
        <span className="text-sm text-muted-foreground">
          {supplier.displayOrder}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (supplier) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(supplier.createdAt), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (supplier) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
              {supplier.isActive ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteClick(supplier)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
            Suppliers
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage energy suppliers and their information
          </p>
        </div>
        <Button onClick={handleCreateSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Minimal Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recent</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.recent}
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
            placeholder="Search suppliers..."
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
            <CardTitle style={{ color: 'var(--text-primary)' }}>Supplier List</CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)' }}>
              {pagination.totalSuppliers} total suppliers
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
            data={suppliers}
            loading={loading}
            emptyMessage="No suppliers found"
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

      {/* Supplier Form Sheet */}
      <SupplierFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        supplier={selectedSupplier}
        onSuccess={handleFormSuccess}
      />

      {/* Filter Sheet */}
      <SupplierFilterSheet
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
              This action cannot be undone. This will permanently delete the supplier
              {supplierToDelete && ` "${supplierToDelete.name}"`} and remove all associated data.
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

export default Suppliers