import { useState, useEffect } from 'react'
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

function ServiceFilterSheet({ open, onOpenChange, filters, onFilterChange, onReset, onApply }) {
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
      featured: '',
      search: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }
    setLocalFilters(defaultFilters)
    onReset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>Filter Services</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Filter services by status, featured status, and sort options
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" style={{ color: 'var(--text-primary)' }}>Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value === 'all' ? '' : value })}
            >
              <SelectTrigger 
                id="status"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Filter */}
          <div className="space-y-2">
            <Label htmlFor="featured" style={{ color: 'var(--text-primary)' }}>Featured</Label>
            <Select
              value={localFilters.featured || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, featured: value === 'all' ? '' : value })}
            >
              <SelectTrigger 
                id="featured"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="true">Featured Only</SelectItem>
                <SelectItem value="false">Non-Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" style={{ color: 'var(--text-primary)' }}>Sort By</Label>
            <Select
              value={localFilters.sortBy || 'displayOrder'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value })}
            >
              <SelectTrigger 
                id="sortBy"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder" style={{ color: 'var(--text-primary)' }}>Sort Order</Label>
            <Select
              value={localFilters.sortOrder || 'asc'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, sortOrder: value })}
            >
              <SelectTrigger 
                id="sortOrder"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
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
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default ServiceFilterSheet
