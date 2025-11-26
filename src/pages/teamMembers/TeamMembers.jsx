import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchTeamMembers,
  fetchTeamMemberStats,
  deleteTeamMember,
  updateTeamMemberStatus,
  setFilters,
  setPaginationLimit,
} from '@/store/teamMembersSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import TeamMemberFilterSheet from '@/components/teamMembers/TeamMemberFilterSheet'
import Pagination from '@/components/shared/Pagination'
import TeamMemberFormSheet from '@/components/teamMembers/TeamMemberFormSheet'
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
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Users, X, Linkedin, Mail, Twitter, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function TeamMembers() {
  const dispatch = useAppDispatch()
  const { teamMembers, pagination, filters, stats, loading, error } = useAppSelector(
    (state) => state.teamMembers
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchTeamMemberStats())
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
    dispatch(fetchTeamMembers(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchTeamMembers({
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
    dispatch(fetchTeamMembers({
      page: 1,
      limit: pagination.limit,
      ...filters
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = {
      status: '',
      search: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchTeamMembers({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchTeamMembers({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchTeamMembers({ page: 1, limit, ...filters }))
  }

  const handleAddMemberClick = () => {
    setSelectedTeamMemberId(null)
    setFormSheetOpen(true)
  }

  const handleEditClick = (member) => {
    setSelectedTeamMemberId(member._id)
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (member) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const handleToggleActive = async (member) => {
    const newActive = !member.isActive
    const result = await dispatch(updateTeamMemberStatus({ id: member._id, isActive: newActive }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`Team member ${newActive ? 'activated' : 'deactivated'} successfully`)
      dispatch(fetchTeamMemberStats())
    } else {
      toast.error(result.payload || 'Failed to update team member status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (memberToDelete) {
      const result = await dispatch(deleteTeamMember(memberToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('Team member deleted successfully')
        setDeleteDialogOpen(false)
        setMemberToDelete(null)
        dispatch(fetchTeamMembers({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchTeamMemberStats())
      } else {
        toast.error(result.payload || 'Failed to delete team member')
      }
    }
  }

  const handleFormSaveSuccess = () => {
    dispatch(fetchTeamMembers({
      page: pagination.currentPage,
      limit: pagination.limit,
      ...filters
    }))
    dispatch(fetchTeamMemberStats())
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => (
        <div className="w-12 h-16 rounded-md overflow-hidden bg-muted">
          {row.image?.url ? (
            <img
              src={row.image.url}
              alt={row.image.alt || row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-5)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                {row.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {row.name}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {row.position}
          </p>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <p className="text-sm line-clamp-2 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          {row.description}
        </p>
      ),
    },
    {
      key: 'socialLinks',
      label: 'Social Links',
      render: (row) => (
        <div className="flex gap-2">
          {row.socialLinks?.linkedin && (
            <a
              href={row.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-10)', color: 'var(--primary)' }}
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {row.socialLinks?.email && (
            <a
              href={`mailto:${row.socialLinks.email}`}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-10)', color: 'var(--primary)' }}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          {row.socialLinks?.twitter && (
            <a
              href={row.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-10)', color: 'var(--primary)' }}
            >
              <Twitter className="h-4 w-4" />
            </a>
          )}
          {row.socialLinks?.website && (
            <a
              href={row.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-10)', color: 'var(--primary)' }}
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (row) => (
        <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          {row.displayOrder}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(row.createdAt), 'MMM dd, yyyy')}
        </p>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <DropdownMenuItem onClick={() => handleEditClick(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(row)}>
              {row.isActive ? (
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
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row)}
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
            Team Members
          </h1>
          <p className="text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>
            Manage your team members and their profiles
          </p>
        </div>
        <Button
          onClick={handleAddMemberClick}
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Total Members
              </CardTitle>
              <Users className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Active
              </CardTitle>
              <Eye className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.active || 0}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Inactive
              </CardTitle>
              <EyeOff className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.inactive || 0}
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Recent
              </CardTitle>
              <Users className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.recent || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Bar */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              <Input
                placeholder="Search team members by name, position, or description..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => handleSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterSheetOpen(true)}
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>Team Members</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            {pagination.totalMembers || 0} {pagination.totalMembers === 1 ? 'member' : 'members'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={teamMembers}
            loading={loading}
            emptyMessage="No team members found. Add your first team member to get started."
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            limit={pagination.limit}
            onLimitChange={handleLimitChange}
            totalItems={pagination.totalMembers}
          />
        </div>
      )}

      {/* Filter Sheet */}
      <TeamMemberFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Form Sheet */}
      <TeamMemberFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        teamMemberId={selectedTeamMemberId}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete "{memberToDelete?.name}"? This action cannot be undone and will permanently delete the team member and their profile image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
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

export default TeamMembers

