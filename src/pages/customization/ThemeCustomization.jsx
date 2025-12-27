import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchActiveTheme,
  updateTheme,
  updatePrimaryColor,
  uploadLogo,
  uploadFavicon,
  deleteLogo,
  deleteFavicon,
  resetTheme,
} from '@/store/themesSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  Palette,
  Image,
  Type,
  Layout,
  RefreshCw,
  Upload,
  X,
  Loader2,
  Check,
  Eye,
  RotateCcw,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { HexColorPicker } from 'react-colorful'
import ThemeAccessModal from '@/components/customization/ThemeAccessModal'
import ThemeAccessSheet from '@/components/customization/ThemeAccessSheet'
import apiService from '@/services/api'

const themeProDefault = false
const DEMO_FEATURE_KEY = 'theme'

function ThemeCustomizationPage() {
  const dispatch = useAppDispatch()
  const { activeTheme, loading, uploading, error } = useAppSelector((state) => state.themes)
  const [isUnlocked, setIsUnlocked] = useState(themeProDefault)
  const [demoEndAt, setDemoEndAt] = useState(Number(localStorage.getItem(`demo:${DEMO_FEATURE_KEY}:endAt`)) || 0)
  const [demoActive, setDemoActive] = useState(!!(demoEndAt && Date.now() < demoEndAt))
  const [nowTs, setNowTs] = useState(Date.now())
  const isGateOpen = !(isUnlocked || demoActive)
  const [accessOpen, setAccessOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [accessLoading, setAccessLoading] = useState(true)

  const [selectedColor, setSelectedColor] = useState('#AE613A')
  const [logoPreview, setLogoPreview] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const logoInputRef = useRef(null)
  const faviconInputRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    primaryColor: '#AE613A',
    secondaryColor: '',
    accentColor: '',
    fontFamily: 'Poppins, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSizeBase: '16px',
    borderRadiusSm: '0.25rem',
    borderRadiusMd: '0.5rem',
    borderRadiusLg: '0.75rem',
    borderRadiusXl: '1rem',
    companyName: 'Bristol Utilities',
    tagline: '',
  })

  useEffect(() => {
    dispatch(fetchActiveTheme())
  }, [dispatch])

  useEffect(() => {
    let mounted = true
    Promise.all([
      apiService.getFeatureAccessStatus('theme'),
      apiService.getAdminPaymentStatus('theme'),
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
    if (activeTheme) {
      setSelectedColor(activeTheme.primaryColor || '#AE613A')
      setLogoPreview(activeTheme.branding?.logoUrl || null)
      setFaviconPreview(activeTheme.branding?.faviconUrl || null)
      
      setFormData({
        primaryColor: activeTheme.primaryColor || '#AE613A',
        secondaryColor: activeTheme.secondaryColor || '',
        accentColor: activeTheme.accentColor || '',
        fontFamily: activeTheme.typography?.fontFamily || 'Poppins, system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontSizeBase: activeTheme.typography?.fontSize?.base || '16px',
        borderRadiusSm: activeTheme.borderRadius?.sm || '0.25rem',
        borderRadiusMd: activeTheme.borderRadius?.md || '0.5rem',
        borderRadiusLg: activeTheme.borderRadius?.lg || '0.75rem',
        borderRadiusXl: activeTheme.borderRadius?.xl || '1rem',
        companyName: activeTheme.branding?.companyName || 'Bristol Utilities',
        tagline: activeTheme.branding?.tagline || '',
      })
    }
  }, [activeTheme])

  const handleColorChange = (color) => {
    setSelectedColor(color)
    setFormData(prev => ({ ...prev, primaryColor: color }))
    setHasChanges(true)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleQuickColorApply = async () => {
    const result = await dispatch(updatePrimaryColor(selectedColor))
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Primary color updated successfully')
      setHasChanges(false)
    } else {
      toast.error(result.payload || 'Failed to update primary color')
    }
  }

  const handleSaveChanges = async () => {
    const themeData = {
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor || null,
      accentColor: formData.accentColor || null,
      typography: {
        fontFamily: formData.fontFamily,
        fontSize: {
          base: formData.fontSizeBase,
        },
      },
      borderRadius: {
        sm: formData.borderRadiusSm,
        md: formData.borderRadiusMd,
        lg: formData.borderRadiusLg,
        xl: formData.borderRadiusXl,
      },
      branding: {
        companyName: formData.companyName,
        tagline: formData.tagline || null,
      },
    }

    const result = await dispatch(updateTheme(themeData))
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Theme updated successfully')
      setHasChanges(false)
    } else {
      toast.error(result.payload || 'Failed to update theme')
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload
    const result = await dispatch(uploadLogo(file))
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Logo uploaded successfully')
    } else {
      toast.error(result.payload || 'Failed to upload logo')
      setLogoPreview(activeTheme?.branding?.logoUrl || null)
    }
  }

  const handleFaviconUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFaviconPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload
    const result = await dispatch(uploadFavicon(file))
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Favicon uploaded successfully')
    } else {
      toast.error(result.payload || 'Failed to upload favicon')
      setFaviconPreview(activeTheme?.branding?.faviconUrl || null)
    }
  }

  const handleDeleteLogo = async () => {
    const result = await dispatch(deleteLogo())
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Logo deleted successfully')
      setLogoPreview(null)
    } else {
      toast.error(result.payload || 'Failed to delete logo')
    }
  }

  const handleDeleteFavicon = async () => {
    const result = await dispatch(deleteFavicon())
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Favicon deleted successfully')
      setFaviconPreview(null)
    } else {
      toast.error(result.payload || 'Failed to delete favicon')
    }
  }

  const handleResetTheme = async () => {
    const result = await dispatch(resetTheme())
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Theme reset to default successfully')
      setResetDialogOpen(false)
      setHasChanges(false)
    } else {
      toast.error(result.payload || 'Failed to reset theme')
    }
  }

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {demoActive && (
        <div className="rounded-lg border p-3 flex items-center justify-between" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Demo Active</Badge>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ends in {Math.floor(Math.max(0, demoEndAt - nowTs) / 3600000)}h {Math.floor((Math.max(0, demoEndAt - nowTs) % 3600000) / 60000)}m {Math.floor((Math.max(0, demoEndAt - nowTs) % 60000) / 1000)}s
            </span>
          </div>
          <Button onClick={() => setAccessOpen(true)} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>Get access</Button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Theme Customization
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Customize your brand colors, typography, and visual identity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            disabled={loading}
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <RotateCcw className="mr-2 size-4" /> Reset to Default
          </Button>
          {hasChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save All Changes
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="p-4 rounded-md border"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="mr-2 size-4" /> Colors
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Image className="mr-2 size-4" /> Branding
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="mr-2 size-4" /> Typography
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="mr-2 size-4" /> Layout
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Color */}
            <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--text-primary)' }}>Primary Color</CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  Your main brand color used throughout the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <HexColorPicker color={selectedColor} onChange={handleColorChange} />
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#AE613A"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <div
                    className="w-12 h-10 rounded-md border-2"
                    style={{
                      backgroundColor: selectedColor,
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>

                <Button
                  onClick={handleQuickColorApply}
                  disabled={loading || selectedColor === activeTheme?.primaryColor}
                  className="w-full"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <Check className="mr-2 size-4" /> Apply Primary Color
                </Button>
              </CardContent>
            </Card>

            {/* Color Variations Preview */}
            <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--text-primary)' }}>Color Variations</CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  Auto-generated shades from your primary color
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTheme?.colorVariations && (
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(activeTheme.colorVariations).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div
                          className="w-full h-16 rounded-md border"
                          style={{
                            backgroundColor: value,
                            borderColor: 'var(--border)',
                          }}
                        />
                        <p className="text-xs font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                          {key}
                        </p>
                        <p className="text-xs text-center font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Colors */}
            <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--text-primary)' }}>Additional Colors</CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  Optional secondary and accent colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" style={{ color: 'var(--text-primary)' }}>
                    Secondary Color (Optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#000000"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    {formData.secondaryColor && (
                      <div
                        className="w-12 h-10 rounded-md border-2"
                        style={{
                          backgroundColor: formData.secondaryColor,
                          borderColor: 'var(--border)',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor" style={{ color: 'var(--text-primary)' }}>
                    Accent Color (Optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#000000"
                      style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    {formData.accentColor && (
                      <div
                        className="w-12 h-10 rounded-md border-2"
                        style={{
                          backgroundColor: formData.accentColor,
                          borderColor: 'var(--border)',
                        }}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--text-primary)' }}>Logo</CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  Upload your company logo (PNG, JPG, SVG, max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logoPreview ? (
                  <div className="space-y-4">
                    <div
                      className="relative w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
          </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                        Change Logo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDeleteLogo}
                        disabled={loading}
                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        <X className="size-4" />
          </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="size-12 mb-4" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Click to upload logo
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      PNG, JPG, SVG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </CardContent>
            </Card>

            {/* Favicon Upload */}
            <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--text-primary)' }}>Favicon</CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  Upload your favicon (ICO, PNG, max 5MB)
                </CardDescription>
        </CardHeader>
              <CardContent className="space-y-4">
                {faviconPreview ? (
                  <div className="space-y-4">
                    <div
                      className="relative w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <img
                        src={faviconPreview}
                        alt="Favicon preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                        Change Favicon
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDeleteFavicon}
                        disabled={loading}
                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => faviconInputRef.current?.click()}
                  >
                    <Upload className="size-12 mb-4" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Click to upload favicon
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      ICO, PNG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/x-icon,image/png,image/ico"
                  className="hidden"
                  onChange={handleFaviconUpload}
                />
        </CardContent>
      </Card>

            {/* Company Information */}
            <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="lg:col-span-2">
        <CardHeader>
                <CardTitle style={{ color: 'var(--text-primary)' }}>Company Information</CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  Update your company name and tagline
                </CardDescription>
        </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" style={{ color: 'var(--text-primary)' }}>
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Bristol Utilities"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline" style={{ color: 'var(--text-primary)' }}>
                    Tagline (Optional)
                  </Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="Your trusted energy partner"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Typography Settings</CardTitle>
              <CardDescription style={{ color: 'var(--text-secondary)' }}>
                Customize fonts and text sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fontFamily" style={{ color: 'var(--text-primary)' }}>
                    Font Family
                  </Label>
                  <Input
                    id="fontFamily"
                    value={formData.fontFamily}
                    onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                    placeholder="Poppins, system-ui, sans-serif"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSizeBase" style={{ color: 'var(--text-primary)' }}>
                    Base Font Size
                  </Label>
                  <Input
                    id="fontSizeBase"
                    value={formData.fontSizeBase}
                    onChange={(e) => handleInputChange('fontSizeBase', e.target.value)}
                    placeholder="16px"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Preview
                </h4>
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    fontFamily: formData.fontFamily,
                    fontSize: formData.fontSizeBase,
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Heading 1
                  </h1>
                  <h2 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Heading 2
                  </h2>
                  <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Heading 3
                  </h3>
                  <p className="mb-2" style={{ color: 'var(--text-primary)' }}>
                    This is a paragraph of body text. It demonstrates how your content will look with the selected typography settings.
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    This is smaller secondary text that provides additional information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Border Radius</CardTitle>
              <CardDescription style={{ color: 'var(--text-secondary)' }}>
                Control the roundness of corners for UI elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="borderRadiusSm" style={{ color: 'var(--text-primary)' }}>
                    Small Border Radius
                  </Label>
                  <Input
                    id="borderRadiusSm"
                    value={formData.borderRadiusSm}
                    onChange={(e) => handleInputChange('borderRadiusSm', e.target.value)}
                    placeholder="0.25rem"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadiusMd" style={{ color: 'var(--text-primary)' }}>
                    Medium Border Radius
                  </Label>
                  <Input
                    id="borderRadiusMd"
                    value={formData.borderRadiusMd}
                    onChange={(e) => handleInputChange('borderRadiusMd', e.target.value)}
                    placeholder="0.5rem"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadiusLg" style={{ color: 'var(--text-primary)' }}>
                    Large Border Radius
                  </Label>
                  <Input
                    id="borderRadiusLg"
                    value={formData.borderRadiusLg}
                    onChange={(e) => handleInputChange('borderRadiusLg', e.target.value)}
                    placeholder="0.75rem"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadiusXl" style={{ color: 'var(--text-primary)' }}>
                    Extra Large Border Radius
                  </Label>
                  <Input
                    id="borderRadiusXl"
                    value={formData.borderRadiusXl}
                    onChange={(e) => handleInputChange('borderRadiusXl', e.target.value)}
                    placeholder="1rem"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Preview
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div
                      className="w-full h-24 border-2"
                      style={{
                        borderRadius: formData.borderRadiusSm,
                        backgroundColor: 'var(--primary-10)',
                        borderColor: 'var(--primary)',
                      }}
                    />
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      Small
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="w-full h-24 border-2"
                      style={{
                        borderRadius: formData.borderRadiusMd,
                        backgroundColor: 'var(--primary-10)',
                        borderColor: 'var(--primary)',
                      }}
                    />
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      Medium
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="w-full h-24 border-2"
                      style={{
                        borderRadius: formData.borderRadiusLg,
                        backgroundColor: 'var(--primary-10)',
                        borderColor: 'var(--primary)',
                      }}
                    />
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      Large
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="w-full h-24 border-2"
                      style={{
                        borderRadius: formData.borderRadiusXl,
                        backgroundColor: 'var(--primary-10)',
                        borderColor: 'var(--primary)',
                      }}
                    />
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      Extra Large
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
              This will reset all theme customizations to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetTheme}
              style={{ backgroundColor: '#ef4444', color: '#fff' }}
            >
              Reset Theme
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isGateOpen && (
        <ThemeAccessModal
          open={isGateOpen}
          status={paymentStatus}
          canDemo={canDemo}
          onRequestDemo={async () => {
            try { await apiService.startFeatureDemo(DEMO_FEATURE_KEY, 1440); setCanDemo(false) } catch {}
            const endAt = Date.now() + 1440 * 60 * 1000
            localStorage.setItem(`demo:${DEMO_FEATURE_KEY}:endAt`, String(endAt))
            setDemoEndAt(endAt)
            setDemoActive(true)
          }}
          onGetAccess={() => { if (!paymentStatus) setAccessOpen(true) }}
        />
      )}
      <ThemeAccessSheet
        open={accessOpen}
        onOpenChange={setAccessOpen}
      />
    </div>
  )
}

export default ThemeCustomizationPage
