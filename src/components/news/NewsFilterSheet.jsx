import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

function NewsFilterSheet({ open, onOpenChange, filters, onFilterChange, onReset, onApply }) {
  const { categories } = useAppSelector((state) => state.news)
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    onFilterChange(localFilters)
    if (onApply) {
      onApply()
    }
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultFilters = {
      status: '',
      category: '',
      featured: '',
      isActive: '',
      search: '',
      sortBy: 'publishDate',
      sortOrder: 'desc',
    }
    setLocalFilters(defaultFilters)
    onReset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>Filter News</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Filter news by status, category, featured status, and sort options
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" style={{ color: 'var(--text-primary)' }}>Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))
              }}
            >
              <SelectTrigger
                id="status"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category" style={{ color: 'var(--text-primary)' }}>Category</Label>
            <Select
              value={localFilters.category || 'all'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))
              }}
            >
              <SelectTrigger
                id="category"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured Filter */}
          <div className="space-y-2">
            <Label htmlFor="featured" style={{ color: 'var(--text-primary)' }}>Featured</Label>
            <Select
              value={localFilters.featured || 'all'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, featured: value === 'all' ? '' : value }))
              }}
            >
              <SelectTrigger
                id="featured"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="isActive" style={{ color: 'var(--text-primary)' }}>Active Status</Label>
            <Select
              value={localFilters.isActive || 'all'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, isActive: value === 'all' ? '' : value }))
              }}
            >
              <SelectTrigger
                id="isActive"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator style={{ backgroundColor: 'var(--border)' }} />

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" style={{ color: 'var(--text-primary)' }}>Sort By</Label>
            <Select
              value={localFilters.sortBy || 'publishDate'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, sortBy: value }))
              }}
            >
              <SelectTrigger
                id="sortBy"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="publishDate">Publish Date</SelectItem>
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder" style={{ color: 'var(--text-primary)' }}>Sort Order</Label>
            <Select
              value={localFilters.sortOrder || 'desc'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, sortOrder: value }))
              }}
            >
              <SelectTrigger
                id="sortOrder"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 p-4 border-t">
          <Button
            onClick={handleApply}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            style={{ 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
          >
            Reset Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default NewsFilterSheet

