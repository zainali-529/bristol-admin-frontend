import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Video, Image as ImageIcon, Search, Filter, Plus, Check, Edit, Trash2 } from 'lucide-react'

function HeroAccessModal({ open, status, canDemo = true, onRequestDemo, onGetAccess }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-50 flex h-full items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="size-6" style={{ color: 'var(--primary)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hero Section Templates</h2>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Manage professional hero templates with media support and controls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Templates</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Edit className="size-4" /><span>Create and edit templates</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Set active template</span></li>
                  <li className="flex items-center gap-2"><Trash2 className="size-4" /><span>Delete with confirmation</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Video className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Media</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Video className="size-4" /><span>Upload background video</span></li>
                  <li className="flex items-center gap-2"><ImageIcon className="size-4" /><span>Upload background image</span></li>
                  <li className="flex items-center gap-2"><Sparkles className="size-4" /><span>Live media previews</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Search & Filters</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Search className="size-4" /><span>Search by name/headline</span></li>
                  <li className="flex items-center gap-2"><Filter className="size-4" /><span>Filter sheet controls</span></li>
                  <li className="flex items-center gap-2"><Sparkles className="size-4" /><span>Stats: totals, with video/image</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Workflow</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Plus className="size-4" /><span>Create new template</span></li>
                  <li className="flex items-center gap-2"><Edit className="size-4" /><span>Open form sheet to edit</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Set as active</span></li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>One-time payment • Lifetime access</div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">PKR 30,240</Badge>
                  <Badge variant="secondary">£80</Badge>
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

export default HeroAccessModal
