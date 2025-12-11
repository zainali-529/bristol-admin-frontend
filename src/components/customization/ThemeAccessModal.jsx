import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Image, Type, Layout, Check } from 'lucide-react'

function ThemeAccessModal({ open, status, canDemo = true, onRequestDemo, onGetAccess }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-50 flex h-full items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="size-6" style={{ color: 'var(--primary)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Theme Customization</h2>
            </div>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Unlock professional theme controls to perfectly match your brand.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Colors</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Interactive color picker</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Quick apply primary color</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Auto-generated color variations</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Optional secondary & accent colors</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Image className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Branding</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Logo upload with live preview</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Favicon upload and preview</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Company name and tagline</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Typography</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Font family configuration</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Base font size control</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Live preview for headings and text</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="size-5" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Layout</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Border radius controls (sm, md, lg, xl)</span></li>
                  <li className="flex items-center gap-2"><Check className="size-4" /><span>Visual previews for each size</span></li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>One-time payment • Lifetime access</div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">PKR 200,000</Badge>
                  <Badge variant="secondary">£500</Badge>
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

export default ThemeAccessModal
