import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchDocuments,
  fetchDocumentStats,
  fetchDocumentCategories,
  fetchDocumentFileTypes,
  createDocument,
  deleteDocument,
  downloadDocument,
  setFilters,
  setPaginationLimit,
} from '@/store/documentsSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/shared/DataTable'
import DocumentFilterSheet from '@/components/documents/DocumentFilterSheet'
import Pagination from '@/components/shared/Pagination'
import DocumentFormSheet from '@/components/documents/DocumentFormSheet'
import DocumentCreatorSheet from '@/components/documents/DocumentCreatorSheet'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Download, FileText, File, X, HardDrive, FileSpreadsheet, Upload, ChevronDown, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import DocsAccessModal from '@/components/customization/DocsAccessModal'
import DocsAccessSheet from '@/components/customization/DocsAccessSheet'
import apiService from '@/services/api'

const docsProDefault = false
const DEMO_FEATURE_KEY = 'documents'

function Documents() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { documents, pagination, filters, stats, categories, fileTypes, loading } = useAppSelector(
    (state) => state.documents
  )

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [creatorSheetOpen, setCreatorSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    dispatch(fetchDocumentStats())
    dispatch(fetchDocumentCategories())
    dispatch(fetchDocumentFileTypes())
  }, [dispatch])

  useEffect(() => {
    let mounted = true
    apiService.getFeatureAccessStatus('documents')
      .then((res) => {
        if (!mounted) return
        setIsUnlocked(!!res.data?.data?.isUnlocked)
      })
      .catch(() => setIsUnlocked(false))
    apiService.getAdminPaymentStatus('documents')
      .then((res) => {
        if (!mounted) return
        setPaymentStatus(res.data?.data?.status || '')
      })
      .catch(() => setPaymentStatus(''))
    return () => { mounted = false }
  }, [])

  const [canDemo, setCanDemo] = useState(true)
  useEffect(() => {
    let mounted = true
    apiService.getFeatureDemoStatus(DEMO_FEATURE_KEY)
      .then((res) => {
        if (!mounted) return
        setCanDemo(!!res.data?.data?.canDemo)
      })
      .catch(() => {
        if (!mounted) return
        setCanDemo(true)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    Promise.all([
      apiService.getFeatureAccessStatus('documents'),
      apiService.getAdminPaymentStatus('documents'),
    ])
      .then(([accessRes, statusRes]) => {
        if (!mounted) return
        setIsUnlocked(!!accessRes.data?.data?.isUnlocked)
        setPaymentStatus(statusRes.data?.data?.status || '')
      })
      .catch(() => {
        if (!mounted) return
        setIsUnlocked(false)
        setPaymentStatus('')
      })
      .finally(() => {
        if (!mounted) return
        setAccessLoading(false)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const tick = () => {
      const endRaw = localStorage.getItem(`demo:${DEMO_FEATURE_KEY}:endAt`)
      const endAt = endRaw ? Number(endRaw) : 0
      setDemoEndAt(endAt)
      setDemoActive(!!(endAt && Date.now() < endAt))
      setNowTs(Date.now())
      if (endAt && Date.now() >= endAt) {
        localStorage.removeItem(`demo:${DEMO_FEATURE_KEY}:endAt`)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.fileType && { fileType: filters.fileType }),
      ...(filters.accessLevel && { accessLevel: filters.accessLevel }),
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    dispatch(fetchDocuments(params))
  }, [dispatch, pagination.currentPage, pagination.limit, filters])

  const handleSearch = (value) => {
    setSearchValue(value)
    dispatch(setFilters({ search: value }))
  }

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters({ ...filters, ...newFilters }))
  }

  const handleApplyFilters = () => {
    dispatch(fetchDocuments({
      page: 1,
      limit: pagination.limit,
      ...filters
    }))
  }

  const handleResetFilters = () => {
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
    dispatch(setFilters(defaultFilters))
    setSearchValue('')
  }

  const handleOpenCreateSheet = () => {
    setSelectedDocumentId(null)
    setFormSheetOpen(true)
  }

  const handleOpenCreatorSheet = () => {
    navigate('/documents/create')
  }

  const handleOpenEditSheet = (documentId) => {
    setSelectedDocumentId(documentId)
    setFormSheetOpen(true)
  }

  const handleCloseFormSheet = () => {
    setFormSheetOpen(false)
    setSelectedDocumentId(null)
  }

  const handleCreatorSave = async (formData) => {
    try {
      await dispatch(createDocument(formData)).unwrap()
      toast.success('Document created successfully')
      dispatch(fetchDocumentStats())
      dispatch(fetchDocuments({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      }))
    } catch (error) {
      toast.error(error || 'Failed to create document')
      throw error
    }
  }

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (documentToDelete) {
      try {
        await dispatch(deleteDocument(documentToDelete._id)).unwrap()
        toast.success('Document deleted successfully')
        setDeleteDialogOpen(false)
        setDocumentToDelete(null)
      } catch (error) {
        toast.error(error || 'Failed to delete document')
      }
    }
  }

  const handlePageChange = (page) => {
    dispatch(fetchDocuments({ ...filters, page, limit: pagination.limit }))
  }

  const handleLimitChange = (limit) => {
    dispatch(setPaginationLimit(limit))
    dispatch(fetchDocuments({ page: 1, limit, ...filters }))
  }

  const handleDownload = async (document) => {
    try {
      const result = await dispatch(downloadDocument(document._id)).unwrap()
      window.open(result.data.url, '_blank')
      toast.success('Document download started')
    } catch (error) {
      toast.error(error || 'Failed to download document')
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase() || ''
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getCategoryBadgeColor = (category) => {
    const colors = {
      contracts: 'bg-blue-100 text-blue-800',
      quotes: 'bg-green-100 text-green-800',
      invoices: 'bg-yellow-100 text-yellow-800',
      reports: 'bg-purple-100 text-purple-800',
      policies: 'bg-pink-100 text-pink-800',
      certificates: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-red-100 text-red-800',
      marketing: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  const columns = [
    {
      key: 'file',
      label: 'Type',
      render: (doc) => (
        <div className="flex items-center gap-2">
          {getFileIcon(doc.file?.fileExtension)}
          <Badge variant="outline" className="text-xs">
            {doc.file?.fileExtension?.toUpperCase() || 'FILE'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (doc) => (
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
          {doc.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{doc.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (doc) => (
        <Badge className={getCategoryBadgeColor(doc.category)}>
          {doc.category?.charAt(0).toUpperCase() + doc.category?.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'fileSize',
      label: 'Size',
      render: (doc) => (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {formatBytes(doc.file?.fileSize || 0)}
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded By',
      render: (doc) => (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {doc.uploadedBy || 'Admin'}
        </span>
      ),
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      render: (doc) => (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (doc) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <DropdownMenuItem onClick={() => handleOpenEditSheet(doc._id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(doc)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(doc)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const [isUnlocked, setIsUnlocked] = useState(docsProDefault)
  const [demoEndAt, setDemoEndAt] = useState(Number(localStorage.getItem(`demo:${DEMO_FEATURE_KEY}:endAt`)) || 0)
  const [demoActive, setDemoActive] = useState(!!(demoEndAt && Date.now() < demoEndAt))
  const [nowTs, setNowTs] = useState(Date.now())
  const isGateOpen = !(isUnlocked || demoActive)
  const [accessOpen, setAccessOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [accessLoading, setAccessLoading] = useState(true)
  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {demoActive && (
        <div className="rounded-lg border p-3 flex items-center justify-between" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Demo Active</Badge>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ends in {Math.max(0, Math.floor((demoEndAt - nowTs) / 60000))}m {Math.max(0, Math.floor(((demoEndAt - nowTs) % 60000) / 1000))}s
            </span>
          </div>
          <Button onClick={() => setAccessOpen(true)} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>Get access</Button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Documents
          </h1>
          <p className="text-muted-foreground">Manage your documents and files</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Document
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleOpenCreateSheet}>
              <Upload className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">Upload Document</div>
                <div className="text-xs text-muted-foreground">Upload existing files</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenCreatorSheet}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">Create Spreadsheet</div>
                <div className="text-xs text-muted-foreground">Build Excel documents</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.archived}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(stats.storage?.totalSize || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
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
        <Button variant="outline" onClick={() => setFilterSheetOpen(true)}>
          <Filter className="mr-2 size-4" />
          Filter
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            {pagination.totalDocuments > 0
              ? `${pagination.totalDocuments} document${pagination.totalDocuments !== 1 ? 's' : ''} found`
              : 'No documents found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={documents} loading={loading} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        limit={pagination.limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {/* Form Sheet */}
      <DocumentFormSheet
        open={formSheetOpen}
        onOpenChange={handleCloseFormSheet}
        documentId={selectedDocumentId}
        onSaveSuccess={() => {
          dispatch(fetchDocuments({
            page: pagination.currentPage,
            limit: pagination.limit,
            ...filters
          }))
          dispatch(fetchDocumentStats())
        }}
      />

      {/* Creator Sheet */}
      <DocumentCreatorSheet
        open={creatorSheetOpen}
        onOpenChange={setCreatorSheetOpen}
        onSave={handleCreatorSave}
        loading={loading}
      />

      {/* Filter Sheet */}
      <DocumentFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{documentToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isGateOpen && (
        <DocsAccessModal
          open={isGateOpen}
          status={paymentStatus}
          canDemo={canDemo}
          onRequestDemo={async () => {
            try { await apiService.startFeatureDemo(DEMO_FEATURE_KEY, 5); setCanDemo(false) } catch {}
            const endAt = Date.now() + 5 * 60 * 1000
            localStorage.setItem(`demo:${DEMO_FEATURE_KEY}:endAt`, String(endAt))
            setDemoEndAt(endAt)
            setDemoActive(true)
          }}
          onGetAccess={() => { if (!paymentStatus) setAccessOpen(true) }}
        />
      )}
      <DocsAccessSheet
        open={accessOpen}
        onOpenChange={setAccessOpen}
      />
    </div>
  )
}

export default Documents
