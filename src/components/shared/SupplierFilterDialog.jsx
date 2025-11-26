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

function SupplierFilterSheet({ open, onOpenChange, filters, onFilterChange, onReset, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters)

  // Update local filters when dialog opens or filters prop changes
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleApply = () => {
    // Apply local filters to Redux state
    onFilterChange(localFilters)
    if (onApply) {
      onApply()
    }
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultFilters = {
      status: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }
    setLocalFilters(defaultFilters)
    onReset()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Suppliers</SheetTitle>
          <SheetDescription>
            Filter suppliers by status and sort options
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.status || 'all'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value === 'all' ? '' : value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={localFilters.sortBy || 'displayOrder'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value })}
            >
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="updatedAt">Date Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Select
              value={localFilters.sortOrder || 'asc'}
              onValueChange={(value) => setLocalFilters({ ...localFilters, sortOrder: value })}
            >
              <SelectTrigger id="sortOrder">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>
        
        <SheetFooter className="px-4 py-4 border-t">
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default SupplierFilterSheet
