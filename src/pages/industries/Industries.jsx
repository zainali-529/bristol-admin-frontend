import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchIndustries,
  deleteIndustry,
  updateIndustryStatus,
  setFilters,
  setPaginationLimit,
} from '@/store/industriesSlice'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import Pagination from '@/components/shared/Pagination'
import IndustryFormSheet from '@/components/industries/IndustryFormSheet'
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function Industries() {
  const dispatch = useAppDispatch()
  const { industries, pagination, filters, loading, error } = useAppSelector(
    (state) => state.industries
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [selectedIndustryId, setSelectedIndustryId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [industryToDelete, setIndustryToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchIndustries(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchIndustries({
      page: 1,
      limit: pagination.limit,
      ...filters,
      search: value
    }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchIndustries({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchIndustries({ page: 1, limit, ...filters }))
  }

  const handleAddIndustryClick = () => {
    setSelectedIndustryId(null)
    setFormSheetOpen(true)
  }

  const handleEditClick = (industry) => {
    setSelectedIndustryId(industry._id)
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (industry) => {
    setIndustryToDelete(industry)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async (industry) => {
    const newStatus = !industry.isActive
    const result = await dispatch(updateIndustryStatus({ id: industry._id, isActive: newStatus }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Industry ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } else {
      toast.error(result.payload || 'Failed to update industry status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (industryToDelete) {
      const result = await dispatch(deleteIndustry(industryToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Industry deleted successfully')
        setDeleteDialogOpen(false)
        setIndustryToDelete(null)
        dispatch(fetchIndustries({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
      } else {
        toast.error(result.payload || 'Failed to delete industry')
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
    dispatch(fetchIndustries(params))
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (industry) => (
        <img
          src={industry.image?.url || '/placeholder.png'}
          alt={industry.title}
          className="size-16 rounded-md object-cover"
        />
      ),
    },
    {
      key: 'title',
      label: 'Industry',
      render: (industry) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{industry.title}</p>
          <p className="text-xs line-clamp-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
            {industry.description}
          </p>
        </div>
      ),
    },
    {
      key: 'savings',
      label: 'Savings',
      render: (industry) => (
        <Badge variant="outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
          {industry.savings}
        </Badge>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (industry) => (
        <span style={{ color: 'var(--text-primary)' }}>{industry.displayOrder}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (industry) => <StatusBadge isActive={industry.isActive} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (industry) => (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Calendar className="size-4" />
          {format(new Date(industry.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (industry) => (
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
            <DropdownMenuItem onClick={() => handleEditClick(industry)}>
              <Edit className="mr-2 size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(industry)}>
              {industry.isActive ? (
                <> <EyeOff className="mr-2 size-4" /> Deactivate </>
              ) : (
                <> <Eye className="mr-2 size-4" /> Activate </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(industry)} className="text-destructive">
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
            Industries We Serve
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage industries displayed on your website.
          </p>
        </div>
        <Button
          onClick={handleAddIndustryClick}
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus className="mr-2 size-4" /> Add Industry
        </Button>
      </div>

      {/* Search and Filters - Simple */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search industries..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

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
            data={industries}
            columns={columns}
            loading={loading}
            emptyMessage="No industries found. Click 'Add Industry' to create one."
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalIndustries}
        limit={pagination.limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {/* Form Sheet */}
      <IndustryFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        industryId={selectedIndustryId}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Industry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{industryToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIndustryToDelete(null)}>Cancel</AlertDialogCancel>
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

export default Industries
