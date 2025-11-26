# Theme Customization - Admin Panel

## Overview
Complete theme customization system for Bristol Utilities with logo upload, color management, typography, and layout control.

## Features Implemented

### 🎨 **Colors Tab**
- **Interactive Color Picker**: Real-time hex color selection with visual feedback
- **Primary Color Management**: Quick apply for primary brand color
- **Color Variations Preview**: Auto-generated shades (100%, 80%, 60%, 40%, 30%, 20%, 10%, 5%)
- **Additional Colors**: Optional secondary and accent colors

### 🖼️ **Branding Tab**
- **Logo Upload**: 
  - Supports PNG, JPG, SVG, WEBP (max 5MB)
  - Live preview before upload
  - Drag & drop or click to upload
  - Delete existing logo option
  - Stored in Cloudinary

- **Favicon Upload**:
  - Supports ICO, PNG (max 5MB)
  - Live preview
  - Cloudinary storage
  - Delete functionality

- **Company Information**:
  - Company name field
  - Optional tagline

### 🔤 **Typography Tab**
- **Font Settings**:
  - Custom font family
  - Base font size
  - Live typography preview with different heading levels

### 📐 **Layout Tab**
- **Border Radius Control**:
  - Small (sm)
  - Medium (md)
  - Large (lg)
  - Extra Large (xl)
  - Visual previews for each size

## Backend API Endpoints

### Theme Management
```
GET    /api/theme                       - Get active theme (public)
POST   /api/theme/admin                 - Create/update theme
PUT    /api/theme/admin/primary-color   - Update primary color only
POST   /api/theme/admin/reset           - Reset to default theme
DELETE /api/theme/admin/:id             - Delete theme
```

### Logo & Favicon Upload
```
POST   /api/theme/admin/upload-logo     - Upload logo (multipart/form-data)
POST   /api/theme/admin/upload-favicon  - Upload favicon (multipart/form-data)
DELETE /api/theme/admin/logo            - Delete logo
DELETE /api/theme/admin/favicon         - Delete favicon
```

## Frontend Redux Store

### State Structure
```javascript
{
  activeTheme: {
    primaryColor: '#AE613A',
    colorVariations: { primary, primary100, primary80, ... },
    typography: { fontFamily, fontSize, fontWeight },
    borderRadius: { sm, md, lg, xl },
    branding: {
      logoUrl: 'cloudinary-url',
      faviconUrl: 'cloudinary-url',
      companyName: 'Bristol Utilities',
      tagline: 'Your trusted energy partner'
    }
  },
  loading: false,
  uploading: false,
  error: null
}
```

### Available Actions
- `fetchActiveTheme()` - Load current theme
- `updateTheme(data)` - Update full theme
- `updatePrimaryColor(color)` - Quick color update
- `uploadLogo(file)` - Upload logo file
- `uploadFavicon(file)` - Upload favicon file
- `deleteLogo()` - Remove logo
- `deleteFavicon()` - Remove favicon
- `resetTheme()` - Reset to defaults

## File Structure

```
backend/
├── controllers/
│   └── themeController.js     ✅ Logo upload handlers added
├── routes/
│   └── themes.js              ✅ Multer + Cloudinary setup
└── models/
    └── Theme.js               ✅ Logo/favicon fields exist

admin-frontend/
├── src/
│   ├── store/
│   │   ├── themesSlice.js     ✅ Redux slice with upload actions
│   │   └── store.js           ✅ Themes reducer added
│   ├── services/
│   │   └── api.js             ✅ Theme API methods
│   └── pages/
│       └── customization/
│           └── ThemeCustomization.jsx  ✅ Complete UI

user-frontend/
└── src/pages/admin/
    └── ThemeManager.jsx       ❌ REMOVED (moved to admin panel)
```

## Usage Instructions

### 1. Accessing Theme Customization
Navigate to: **Admin Panel → Customization → Theme**

### 2. Changing Primary Color
- Go to **Colors** tab
- Use the color picker or enter hex code
- Click "Apply Primary Color" for quick update
- Or click "Save All Changes" to save with other modifications

### 3. Uploading Logo
- Go to **Branding** tab
- Click upload area or drag & drop logo file
- File uploads automatically to Cloudinary
- Preview appears immediately

### 4. Updating Typography
- Go to **Typography** tab
- Change font family (e.g., "Inter, sans-serif")
- Adjust base font size
- Preview shows real-time changes

### 5. Adjusting Layout
- Go to **Layout** tab
- Modify border radius values
- See live preview of each size

### 6. Resetting Theme
- Click "Reset to Default" in header
- Confirms before resetting
- Restores all default values

## Technical Details

### Cloudinary Configuration
- Folder: `bristol-utilities/theme`
- Allowed formats: JPG, JPEG, PNG, WEBP, SVG, ICO
- Max file size: 5MB
- Transformation: 800x800 max, quality auto:best

### Color Generation
Primary color automatically generates 8 variations using color utility functions:
- 100%: Full saturation
- 80%, 60%, 40%: Progressively lighter
- 30%, 20%, 10%, 5%: Very subtle shades

### State Management
- Redux Toolkit for state management
- Automatic loading states
- Error handling with toast notifications
- Optimistic UI updates

## Notes
- Theme changes apply site-wide
- Only one active theme at a time
- Logo/favicon stored permanently in Cloudinary
- Color variations auto-generated on save
- All changes tracked with version numbers

