import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchNews,
  fetchNewsStats,
  fetchNewsCategories,
  deleteNews,
  updateNewsStatus,
  updateNewsActive,
  setFilters,
  setPaginationLimit,
} from '@/store/newsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import NewsFilterSheet from '@/components/news/NewsFilterSheet'
import Pagination from '@/components/shared/Pagination'
import NewsFormSheet from '@/components/news/NewsFormSheet'
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
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, EyeOff, X, Star, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

function News() {
  const dispatch = useAppDispatch()
  const { news, pagination, filters, stats, categories, loading, error } = useAppSelector(
    (state) => state.news
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedNewsId, setSelectedNewsId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchNewsStats())
    dispatch(fetchNewsCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.featured && { featured: filters.featured }),
      ...(filters.isActive && { isActive: filters.isActive }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchNews(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
    dispatch(fetchNews({
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
    dispatch(fetchNews({
      page: 1,
      limit: pagination.limit,
      ...filters
    }))
  }

  const handleResetFilters = () => {
    const defaultFilters = {
      status: '',
      category: '',
      featured: '',
      isActive: '',
      search: '',
      sortBy: 'publishDate',
      sortOrder: 'desc',
    }
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
    dispatch(fetchNews({ page: 1, limit: pagination.limit, ...defaultFilters }))
  }

  const handlePageChange = (page) => {
    dispatch(fetchNews({ page, limit: pagination.limit, ...filters }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchNews({ page: 1, limit, ...filters }))
  }

  const handleAddNewsClick = () => {
    setSelectedNewsId(null)
    setFormSheetOpen(true)
  }

  const handleEditClick = (newsItem) => {
    setSelectedNewsId(newsItem._id)
    setFormSheetOpen(true)
  }

  const handleDeleteClick = (newsItem) => {
    setNewsToDelete(newsItem)
    setDeleteDialogOpen(true)
  }

  const handleToggleActive = async (newsItem) => {
    const newActive = !newsItem.isActive
    const result = await dispatch(updateNewsActive({ id: newsItem._id, isActive: newActive }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`News article ${newActive ? 'activated' : 'deactivated'} successfully`)
      dispatch(fetchNewsStats())
    } else {
      toast.error(result.payload || 'Failed to update news status')
    }
  }

  const handleStatusChange = async (newsItem, newStatus) => {
    const result = await dispatch(updateNewsStatus({ id: newsItem._id, status: newStatus }))
    if (result.type.endsWith('/fulfilled')) {
      toast.success(`News status updated to ${newStatus}`)
      dispatch(fetchNewsStats())
    } else {
      toast.error(result.payload || 'Failed to update news status')
    }
  }

  const handleDeleteConfirm = async () => {
    if (newsToDelete) {
      const result = await dispatch(deleteNews(newsToDelete._id))
      if (result.type.endsWith('/fulfilled')) {
        toast.success('News article deleted successfully')
        setDeleteDialogOpen(false)
        setNewsToDelete(null)
        dispatch(fetchNews({ page: pagination.currentPage, limit: pagination.limit, ...filters }))
        dispatch(fetchNewsStats())
      } else {
        toast.error(result.payload || 'Failed to delete news article')
      }
    }
  }

  const handleFormSaveSuccess = () => {
    dispatch(fetchNews({
      page: pagination.currentPage,
      limit: pagination.limit,
      ...filters
    }))
    dispatch(fetchNewsStats())
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.cardImage?.url && (
            <img
              src={row.cardImage.url}
              alt={row.cardImage.alt || row.title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {row.title}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
              {row.cardDescription}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <Badge variant="outline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          {row.category}
        </Badge>
      ),
    },
    {
      key: 'flags',
      label: 'Flags',
      render: (row) => (
        <div className="flex gap-1">
          {row.isFeatured && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          )}
          {row.isBreaking && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Breaking
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'author',
      label: 'Author',
      render: (row) => (
        <div>
          {row.author?.name && (
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {row.author.name}
            </p>
          )}
          {row.author?.email && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {row.author.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'publishDate',
      label: 'Publish Date',
      render: (row) => (
        <div>
          {row.publishDate ? (
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {format(new Date(row.publishDate), 'MMM dd, yyyy')}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>
              Not set
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'views',
      label: 'Views',
      render: (row) => (
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {row.views || 0}
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
              onClick={() => handleStatusChange(row, row.status === 'published' ? 'draft' : 'published')}
            >
              {row.status === 'published' ? 'Mark as Draft' : 'Publish'}
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
            News Management
          </h1>
          <p className="text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>
            Manage news articles, publish updates, and track engagement
          </p>
        </div>
        <Button
          onClick={handleAddNewsClick}
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add News Article
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div 
            className="flex items-center justify-between rounded-lg border p-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total News</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.total || 0}
              </p>
            </div>
          </div>
          <div 
            className="flex items-center justify-between rounded-lg border p-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Published</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.published || 0}
              </p>
            </div>
          </div>
          <div 
            className="flex items-center justify-between rounded-lg border p-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Draft</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.draft || 0}
              </p>
            </div>
          </div>
          <div 
            className="flex items-center justify-between rounded-lg border p-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Views</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalViews || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar - Simple */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search news by title, description, content, category, or tags..."
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
        <Button
          variant="outline"
          onClick={() => setFilterSheetOpen(true)}
          className="shrink-0"
        >
          <Filter className="mr-2 size-4" />
          Filter
        </Button>
      </div>

      {/* Data Table */}
      <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text-primary)' }}>News Articles</CardTitle>
          <CardDescription style={{ color: 'var(--text-secondary)' }}>
            {pagination.totalNews || 0} {pagination.totalNews === 1 ? 'article' : 'articles'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={news}
            loading={loading}
            emptyMessage="No news articles found. Create your first article to get started."
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          limit={pagination.limit}
          onLimitChange={handleLimitChange}
          totalItems={pagination.totalNews}
        />
      </div>

      {/* Filter Sheet */}
      <NewsFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Form Sheet */}
      <NewsFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        newsId={selectedNewsId}
        onSaveSuccess={handleFormSaveSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Delete News Article</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete "{newsToDelete?.title}"? This action cannot be undone and will permanently delete the article and all associated images.
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

export default News
