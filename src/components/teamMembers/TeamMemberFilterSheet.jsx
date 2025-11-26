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
import { Separator } from '@/components/ui/separator'

function TeamMemberFilterSheet({ open, onOpenChange, filters, onFilterChange, onReset, onApply }) {
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
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>Filter Team Members</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Filter team members by status and sort options
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator style={{ backgroundColor: 'var(--border)' }} />

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" style={{ color: 'var(--text-primary)' }}>Sort By</Label>
            <Select
              value={localFilters.sortBy || 'displayOrder'}
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
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder" style={{ color: 'var(--text-primary)' }}>Sort Order</Label>
            <Select
              value={localFilters.sortOrder || 'asc'}
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
            Reset Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default TeamMemberFilterSheet

