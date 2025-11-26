import React, { useEffect, useState } from 'react';
import { X, Loader2, Upload, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const HeroFormSheet = ({ 
  open, 
  onOpenChange, 
  hero, 
  onSave, 
  onUploadVideo,
  onUploadImage,
  onDeleteMedia,
  loading,
  uploadingMedia
}) => {
  const [formData, setFormData] = useState({
    templateName: '',
    badgeLabel: '',
    headline: '',
    subheadline: '',
    primaryCtaLabel: 'Explore Us',
    primaryCtaLink: '/about',
    secondaryCtaLabel: 'Contact Us',
    secondaryCtaLink: '/contact',
    backgroundType: 'video',
    backgroundOverlay: false,
    backgroundOverlayOpacity: 40,
    particlesEnabled: true,
    particlesCount: 80,
    particlesColor: '#ffffff',
    particlesSize: 3,
    particlesSpeed: 2,
    particlesLineColor: '#ffffff',
    particlesLineOpacity: 0.4,
    particlesInteractivity: true,
  });

  const [activeTab, setActiveTab] = useState('content');
  const [videoPreview, setVideoPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (hero) {
      setFormData({
        templateName: hero.templateName || '',
        badgeLabel: hero.badgeLabel || '',
        headline: hero.headline || '',
        subheadline: hero.subheadline || '',
        primaryCtaLabel: hero.primaryCta?.label || 'Explore Us',
        primaryCtaLink: hero.primaryCta?.link || '/about',
        secondaryCtaLabel: hero.secondaryCta?.label || 'Contact Us',
        secondaryCtaLink: hero.secondaryCta?.link || '/contact',
        backgroundType: hero.background?.type || 'video',
        backgroundOverlay: hero.background?.overlay || false,
        backgroundOverlayOpacity: hero.background?.overlayOpacity || 40,
        particlesEnabled: hero.particles?.enabled !== false,
        particlesCount: hero.particles?.count || 80,
        particlesColor: hero.particles?.color || '#ffffff',
        particlesSize: hero.particles?.size || 3,
        particlesSpeed: hero.particles?.speed || 2,
        particlesLineColor: hero.particles?.lineColor || '#ffffff',
        particlesLineOpacity: hero.particles?.lineOpacity || 0.4,
        particlesInteractivity: hero.particles?.interactivity !== false,
      });
      setVideoPreview(hero.background?.videoUrl || null);
      setImagePreview(hero.background?.imageUrl || null);
    } else {
      // Reset for new hero
      setFormData({
        templateName: '',
        badgeLabel: '',
        headline: '',
        subheadline: '',
        primaryCtaLabel: 'Explore Us',
        primaryCtaLink: '/about',
        secondaryCtaLabel: 'Contact Us',
        secondaryCtaLink: '/contact',
        backgroundType: 'video',
        backgroundOverlay: false,
        backgroundOverlayOpacity: 40,
        particlesEnabled: true,
        particlesCount: 80,
        particlesColor: '#ffffff',
        particlesSize: 3,
        particlesSpeed: 2,
        particlesLineColor: '#ffffff',
        particlesLineOpacity: 0.4,
        particlesInteractivity: true,
      });
      setVideoPreview(null);
      setImagePreview(null);
    }
  }, [hero]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.templateName.trim()) {
      toast.error('Template name is required');
      setActiveTab('content');
      return;
    }
    if (!formData.headline.trim()) {
      toast.error('Headline is required');
      setActiveTab('content');
      return;
    }
    onSave(formData);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid video file (mp4, webm, mov)');
        return;
      }
      
      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file size must be less than 100MB');
        return;
      }
      
      onUploadVideo(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (jpg, png, webp)');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file size must be less than 10MB');
        return;
      }
      
      onUploadImage(file);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--text-primary)' }}>
            {hero ? 'Edit Hero Template' : 'Create New Hero Template'}
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-secondary)' }}>
            {hero ? 'Update hero section template' : 'Create a new hero section template'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="particles">Particles</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={formData.templateName}
                  onChange={(e) => handleInputChange('templateName', e.target.value)}
                  placeholder="e.g., Default Hero, Summer Campaign"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.templateName.length}/100 characters
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="badgeLabel">Badge Label</Label>
                <Input
                  id="badgeLabel"
                  value={formData.badgeLabel}
                  onChange={(e) => handleInputChange('badgeLabel', e.target.value)}
                  placeholder="Powering UK's Businesses"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.badgeLabel.length}/50 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline *</Label>
                <Textarea
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  placeholder="We power your business with the best energy deals"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.headline.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subheadline</Label>
                <Textarea
                  id="subheadline"
                  value={formData.subheadline}
                  onChange={(e) => handleInputChange('subheadline', e.target.value)}
                  placeholder="Orca Business Solutions is a new name, but we're built on real experience."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.subheadline.length}/500 characters
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Primary CTA</h3>
                  <Label htmlFor="primaryCtaLabel">Button Label</Label>
                  <Input
                    id="primaryCtaLabel"
                    value={formData.primaryCtaLabel}
                    onChange={(e) => handleInputChange('primaryCtaLabel', e.target.value)}
                    placeholder="Explore Us"
                    maxLength={30}
                  />
                  <Label htmlFor="primaryCtaLink">Button Link</Label>
                  <Input
                    id="primaryCtaLink"
                    value={formData.primaryCtaLink}
                    onChange={(e) => handleInputChange('primaryCtaLink', e.target.value)}
                    placeholder="/about"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Secondary CTA</h3>
                  <Label htmlFor="secondaryCtaLabel">Button Label</Label>
                  <Input
                    id="secondaryCtaLabel"
                    value={formData.secondaryCtaLabel}
                    onChange={(e) => handleInputChange('secondaryCtaLabel', e.target.value)}
                    placeholder="Contact Us"
                    maxLength={30}
                  />
                  <Label htmlFor="secondaryCtaLink">Button Link</Label>
                  <Input
                    id="secondaryCtaLink"
                    value={formData.secondaryCtaLink}
                    onChange={(e) => handleInputChange('secondaryCtaLink', e.target.value)}
                    placeholder="/contact"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="space-y-4">
              <div className="space-y-2">
                <Label>Background Type</Label>
                <RadioGroup
                  value={formData.backgroundType}
                  onValueChange={(value) => handleInputChange('backgroundType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="cursor-pointer">Video Background</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="cursor-pointer">Image Background</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {formData.backgroundType === 'video' ? (
                <div className="space-y-3">
                  <Label>Background Video</Label>
                  {videoPreview && (
                    <div className="relative">
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full rounded-md"
                        style={{ maxHeight: '200px' }}
                      />
                      {hero && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={() => onDeleteMedia('video')}
                          disabled={uploadingMedia}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Video
                        </Button>
                      )}
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoChange}
                      disabled={!hero || uploadingMedia}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max size: 100MB. Formats: mp4, webm, mov
                      {!hero && ' (Save template first to upload media)'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Background Image</Label>
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Background preview"
                        className="w-full rounded-md"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                      {hero && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={() => onDeleteMedia('image')}
                          disabled={uploadingMedia}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Image
                        </Button>
                      )}
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={!hero || uploadingMedia}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max size: 10MB. Formats: jpg, png, webp
                      {!hero && ' (Save template first to upload media)'}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="overlay">Enable Overlay</Label>
                <Switch
                  id="overlay"
                  checked={formData.backgroundOverlay}
                  onCheckedChange={(checked) => handleInputChange('backgroundOverlay', checked)}
                />
              </div>

              {formData.backgroundOverlay && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="overlayOpacity">Overlay Opacity</Label>
                    <span className="text-sm text-muted-foreground">{formData.backgroundOverlayOpacity}%</span>
                  </div>
                  <Slider
                    id="overlayOpacity"
                    value={[formData.backgroundOverlayOpacity]}
                    onValueChange={(value) => handleInputChange('backgroundOverlayOpacity', value[0])}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </TabsContent>

            {/* Particles Tab */}
            <TabsContent value="particles" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="particlesEnabled">Enable Particles</Label>
                  <p className="text-sm text-muted-foreground">Show animated particles</p>
                </div>
                <Switch
                  id="particlesEnabled"
                  checked={formData.particlesEnabled}
                  onCheckedChange={(checked) => handleInputChange('particlesEnabled', checked)}
                />
              </div>

              {formData.particlesEnabled && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="particlesCount">Particle Count</Label>
                      <span className="text-sm text-muted-foreground">{formData.particlesCount}</span>
                    </div>
                    <Slider
                      id="particlesCount"
                      value={[formData.particlesCount]}
                      onValueChange={(value) => handleInputChange('particlesCount', value[0])}
                      min={20}
                      max={150}
                      step={10}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="particlesColor">Particle Color</Label>
                      <Input
                        type="color"
                        id="particlesColor"
                        value={formData.particlesColor}
                        onChange={(e) => handleInputChange('particlesColor', e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="particlesLineColor">Line Color</Label>
                      <Input
                        type="color"
                        id="particlesLineColor"
                        value={formData.particlesLineColor}
                        onChange={(e) => handleInputChange('particlesLineColor', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="particlesSize">Particle Size</Label>
                      <span className="text-sm text-muted-foreground">{formData.particlesSize}</span>
                    </div>
                    <Slider
                      id="particlesSize"
                      value={[formData.particlesSize]}
                      onValueChange={(value) => handleInputChange('particlesSize', value[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="particlesSpeed">Movement Speed</Label>
                      <span className="text-sm text-muted-foreground">{formData.particlesSpeed}</span>
                    </div>
                    <Slider
                      id="particlesSpeed"
                      value={[formData.particlesSpeed]}
                      onValueChange={(value) => handleInputChange('particlesSpeed', value[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="particlesLineOpacity">Line Opacity</Label>
                      <span className="text-sm text-muted-foreground">{(formData.particlesLineOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      id="particlesLineOpacity"
                      value={[formData.particlesLineOpacity * 100]}
                      onValueChange={(value) => handleInputChange('particlesLineOpacity', value[0] / 100)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="particlesInteractivity">Mouse Interactivity</Label>
                      <p className="text-sm text-muted-foreground">React to mouse movement</p>
                    </div>
                    <Switch
                      id="particlesInteractivity"
                      checked={formData.particlesInteractivity}
                      onCheckedChange={(checked) => handleInputChange('particlesInteractivity', checked)}
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

        </div>

        <SheetFooter className="mt-4 p-4 border-t">
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploadingMedia} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || uploadingMedia} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Template</>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default HeroFormSheet;

