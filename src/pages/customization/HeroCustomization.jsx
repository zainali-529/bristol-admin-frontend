import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchHeros,
  fetchHeroStats,
  deleteHero,
  createHero,
  updateHero,
  uploadHeroVideo,
  uploadHeroImage,
  deleteHeroMedia,
  setActiveHero,
  setFilters,
} from '@/store/heroSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import HeroFilterSheet from '@/components/hero/HeroFilterSheet';
import HeroFormSheet from '@/components/hero/HeroFormSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Check, Sparkles, Video, Image as ImageIcon, X, Play, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

function HeroCustomization() {
  const dispatch = useAppDispatch();
  const { heros, stats, filters, loading, uploadingMedia } = useAppSelector((state) => state.hero);

  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [heroToDelete, setHeroToDelete] = useState(null);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    dispatch(fetchHeroStats());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      ...(filters.search && { search: filters.search }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    dispatch(fetchHeros(params));
  }, [dispatch, filters]);

  const handleSearch = (value) => {
    setSearchValue(value);
    dispatch(setFilters({ search: value }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters({ ...filters, ...newFilters }));
  };

  const handleApplyFilters = () => {
    // Filters are already applied via setFilters, just close the sheet
    setFilterSheetOpen(false);
    toast.success('Filters applied');
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    dispatch(setFilters(defaultFilters));
    setSearchValue('');
    setFilterSheetOpen(false);
    toast.success('Filters reset');
  };

  const handleCreateNew = () => {
    setSelectedHero(null);
    setFormSheetOpen(true);
  };

  const handleEdit = (hero) => {
    setSelectedHero(hero);
    setFormSheetOpen(true);
  };

  const handleDeleteClick = (hero) => {
    if (hero.isActive) {
      toast.error('Cannot delete the active hero template');
      return;
    }
    setHeroToDelete(hero);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!heroToDelete) return;

    const result = await dispatch(deleteHero(heroToDelete._id));
    if (result.type.endsWith('/fulfilled')) {
      setDeleteDialogOpen(false);
      setHeroToDelete(null);
      dispatch(fetchHeroStats());
    }
  };

  const handleSetActive = async (hero) => {
    const result = await dispatch(setActiveHero(hero._id));
    if (result.type.endsWith('/fulfilled')) {
      dispatch(fetchHeroStats());
    }
  };

  const handleSave = async (formData) => {
    let result;
    if (selectedHero) {
      result = await dispatch(updateHero({ id: selectedHero._id, data: formData }));
    } else {
      result = await dispatch(createHero(formData));
    }

    if (result.type.endsWith('/fulfilled')) {
      setFormSheetOpen(false);
      setSelectedHero(null);
      dispatch(fetchHeroStats());
    }
  };

  const handleUploadVideo = async (file) => {
    if (!selectedHero) {
      toast.error('Please save the template first');
      return;
    }
    const result = await dispatch(uploadHeroVideo({ id: selectedHero._id, file }));
    if (result.type.endsWith('/fulfilled')) {
      // Update selected hero with new data
      setSelectedHero(result.payload.data);
    }
  };

  const handleUploadImage = async (file) => {
    if (!selectedHero) {
      toast.error('Please save the template first');
      return;
    }
    const result = await dispatch(uploadHeroImage({ id: selectedHero._id, file }));
    if (result.type.endsWith('/fulfilled')) {
      // Update selected hero with new data
      setSelectedHero(result.payload.data);
    }
  };

  const handleDeleteMedia = async (type) => {
    if (!selectedHero) return;
    const result = await dispatch(deleteHeroMedia({ id: selectedHero._id, type }));
    if (result.type.endsWith('/fulfilled')) {
      // Update selected hero with new data
      setSelectedHero(result.payload.data);
    }
  };

  const HeroTemplateCard = ({ hero }) => {
    const backgroundUrl = hero.background?.type === 'video' 
      ? hero.background?.videoUrl 
      : hero.background?.imageUrl;

    return (
      <Card className={`overflow-hidden transition-all hover:shadow-lg ${hero.isActive ? 'ring-2 ring-primary' : ''}`}>
        {/* Background Preview */}
        <div className="relative h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 overflow-hidden">
          {backgroundUrl ? (
            hero.background?.type === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  src={backgroundUrl}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-70" />
                </div>
              </div>
            ) : (
              <img
                src={backgroundUrl}
                alt={hero.templateName}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <Sparkles className="h-12 w-12 mb-2 opacity-70" />
              <p className="text-sm opacity-70">No media uploaded</p>
            </div>
          )}
          
          {/* Active Badge */}
          {hero.isActive && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-green-600 hover:bg-green-700">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          )}

          {/* Actions Dropdown */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8 shadow-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(hero)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </DropdownMenuItem>
                {!hero.isActive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSetActive(hero)}>
                      <Check className="mr-2 h-4 w-4" />
                      Set as Active
                    </DropdownMenuItem>
                  </>
                )}
                {!hero.isActive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(hero)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Template
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card Content */}
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {hero.templateName}
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {hero.headline}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Background Type */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Background:</span>
            <div className="flex items-center gap-2">
              {hero.background?.type === 'video' ? (
                <>
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4" />
                  <span>Image</span>
                </>
              )}
              {((hero.background?.type === 'video' && hero.background?.videoPublicId) ||
                (hero.background?.type === 'image' && hero.background?.imagePublicId)) && (
                <Badge variant="secondary" className="text-xs ml-1">
                  Uploaded
                </Badge>
              )}
            </div>
          </div>

          {/* Particles */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Particles:</span>
            <Badge variant={hero.particles?.enabled ? 'default' : 'secondary'}>
              {hero.particles?.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{format(new Date(hero.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </CardContent>

        <CardFooter className="pt-3">
          <Button
            variant={hero.isActive ? 'outline' : 'default'}
            className="w-full"
            onClick={() => hero.isActive ? handleEdit(hero) : handleSetActive(hero)}
          >
            {hero.isActive ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Set as Active
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hero Section Templates</h1>
        <p className="text-muted-foreground mt-1">
          Manage hero section templates and set which one is active on your website
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Template</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withVideo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Image</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withImage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardDescription>
              Search and filter hero templates
            </CardDescription>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by template name or headline..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => handleSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setFilterSheetOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hero Template Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : heros.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hero templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first hero section template to get started
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heros.map((hero) => (
            <HeroTemplateCard key={hero._id} hero={hero} />
          ))}
        </div>
      )}

      {/* Filter Sheet */}
      <HeroFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Form Sheet */}
      <HeroFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        hero={selectedHero}
        onSave={handleSave}
        onUploadVideo={handleUploadVideo}
        onUploadImage={handleUploadImage}
        onDeleteMedia={handleDeleteMedia}
        loading={loading}
        uploadingMedia={uploadingMedia}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{heroToDelete?.templateName}"? This action cannot be undone and all associated media will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default HeroCustomization;
