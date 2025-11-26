import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchContacts,
  fetchContactStats,
  deleteContact,
  setFilters,
  setPaginationLimit,
  clearSelectedContact,
} from '@/store/contactsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DataTable from '@/components/shared/DataTable'
import FilterSheet from '@/components/shared/FilterDialog'
import Pagination from '@/components/shared/Pagination'
import StatusBadge from '@/components/shared/StatusBadge'
import ContactDetailSheet from '@/components/contacts/ContactDetailModal'
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

function Contacts() {
  const dispatch = useAppDispatch()
  const { contacts, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.contacts
  )
  const [selectedContact, setSelectedContact] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchContactStats())
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
    dispatch(fetchContacts(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchContacts({ 
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
    dispatch(fetchContacts({ 
      page: 1, 
      limit: pagination.limit, 
      ...filters 
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = { status: '', search: '', dateFrom: '', dateTo: '', sortBy: 'createdAt', sortOrder: 'desc' }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchContacts({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchContacts({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchContacts({ page: 1, limit, ...filters }))
  }

  const handleRowClick = (contact) => {
    setSelectedContact(contact._id)
  }

  const handleDeleteClick = (e, contact) => {
    e.stopPropagation()
    setContactToDelete(contact)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (contactToDelete) {
      const result = await dispatch(deleteContact(contactToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Contact deleted successfully')
        setDeleteDialogOpen(false)
        setContactToDelete(null)
        dispatch(fetchContacts({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchContactStats())
      } else {
        toast.error(result.payload || 'Failed to delete contact')
      }
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (contact) => (
        <div>
          <p className="font-medium">{contact.name}</p>
          <p className="text-xs text-muted-foreground">{contact.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (contact) => (
        <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
          {contact.phone}
        </a>
      ),
    },
    {
      key: 'service',
      label: 'Service',
    },
    {
      key: 'status',
      label: 'Status',
      render: (contact) => <StatusBadge status={contact.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (contact) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (contact) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleDeleteClick(e, contact)}
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
            Contacts
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage and respond to customer contact form submissions
          </p>
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
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Read</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byStatus?.read || 0}
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
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Resolved</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byStatus?.resolved || 0}
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
            placeholder="Search contacts..."
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
            <CardTitle style={{ color: 'var(--text-primary)' }}>Contact List</CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)' }}>
              {pagination.totalContacts} total contacts
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
            data={contacts}
            loading={loading}
            emptyMessage="No contacts found"
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

      {/* Contact Detail Sheet */}
      <ContactDetailSheet
        contactId={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContact(null)
            dispatch(clearSelectedContact())
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
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact
              {contactToDelete && ` for ${contactToDelete.name}`}.
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

export default Contacts

