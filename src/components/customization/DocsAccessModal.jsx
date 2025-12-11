import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, FileSpreadsheet, Search, Filter, Download, Edit, Trash2, HardDrive, ChevronDown, MoreHorizontal } from 'lucide-react'

function DocsAccessModal({ open, status, canDemo = true, onRequestDemo, onGetAccess }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-50 flex h-full items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="size-6" style={{ color: 'var(--primary)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Documents</h2>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Manage documents with uploads, creation, filters, and actions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Create & Upload</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Upload className="size-4" /><span>Upload existing documents</span></li>
                  <li className="flex items-center gap-2"><FileSpreadsheet className="size-4" /><span>Create spreadsheet documents</span></li>
                  <li className="flex items-center gap-2"><ChevronDown className="size-4" /><span>Quick actions menu</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Search & Filter</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Search className="size-4" /><span>Search by title/description</span></li>
                  <li className="flex items-center gap-2"><Filter className="size-4" /><span>Filter by category, type, access</span></li>
                  <li className="flex items-center gap-2"><MoreHorizontal className="size-4" /><span>Sort and paginate results</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Table Actions</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Edit className="size-4" /><span>Edit document</span></li>
                  <li className="flex items-center gap-2"><Download className="size-4" /><span>Download document</span></li>
                  <li className="flex items-center gap-2"><Trash2 className="size-4" /><span>Delete with confirmation</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Insights</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><FileText className="size-4" /><span>Totals, Active, Archived</span></li>
                  <li className="flex items-center gap-2"><HardDrive className="size-4" /><span>Storage used overview</span></li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>One-time payment • Lifetime access</div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">PKR 100,000</Badge>
                  <Badge variant="secondary">£250</Badge>
                </div>
              </div>
            </div>

            {status === 'pending' ? (
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Request submitted</Badge>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Awaiting developer verification</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                {canDemo && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    onClick={onRequestDemo}
                  >
                    Request a demo
                  </Button>
                )}
                <Button
                  className="flex-1"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  onClick={onGetAccess}
                >
                  Get access
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocsAccessModal
