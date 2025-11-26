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

function DocumentFilterSheet({ open, onOpenChange, filters, onFilterChange, onReset, onApply }) {
  const { categories, fileTypes } = useAppSelector((state) => state.documents)
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
      fileType: '',
      tag: '',
      accessLevel: '',
      search: '',
      sortBy: 'uploadedAt',
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
          <SheetTitle style={{ color: 'var(--text-primary)' }}>Filter Documents</SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            Filter documents by status, category, file type, and sort options
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
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

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
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* File Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="fileType" style={{ color: 'var(--text-primary)' }}>File Type</Label>
            <Select
              value={localFilters.fileType || 'all'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, fileType: value === 'all' ? '' : value }))
              }}
            >
              <SelectTrigger
                id="fileType"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All File Types" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All File Types</SelectItem>
                {fileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    .{type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Access Level Filter */}
          <div className="space-y-2">
            <Label htmlFor="accessLevel" style={{ color: 'var(--text-primary)' }}>Access Level</Label>
            <Select
              value={localFilters.accessLevel || 'all'}
              onValueChange={(value) => {
                setLocalFilters(prev => ({ ...prev, accessLevel: value === 'all' ? '' : value }))
              }}
            >
              <SelectTrigger
                id="accessLevel"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <SelectValue placeholder="All Access Levels" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <SelectItem value="all">All Access Levels</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" style={{ color: 'var(--text-primary)' }}>Sort By</Label>
            <Select
              value={localFilters.sortBy || 'uploadedAt'}
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
                <SelectItem value="uploadedAt">Upload Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="fileSize">File Size</SelectItem>
                <SelectItem value="lastAccessedAt">Last Accessed</SelectItem>
                <SelectItem value="displayOrder">Display Order</SelectItem>
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

        <SheetFooter className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default DocumentFilterSheet

