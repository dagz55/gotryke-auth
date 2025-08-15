# Map Migration Project Management Document

## Project: Complete Migration from Mapbox to Google Maps

### Executive Summary
Complete removal of Mapbox dependencies and implementation of Google Maps across the GoTryke application.

### Project Scope

#### Phase 1: Setup and Configuration
- [ ] Obtain Google Maps API Key
- [ ] Install Google Maps React libraries
- [ ] Configure environment variables for Google Maps
- [ ] Set up Google Maps TypeScript types

#### Phase 2: Component Migration
- [ ] Migrate `/src/app/(app)/admin/components/live-map.tsx`
  - Replace Mapbox map initialization with Google Maps
  - Convert marker system to Google Maps markers
  - Migrate popup/info window functionality
  - Preserve existing tricycle icon styling
  - Maintain real-time tracking functionality
  
- [ ] Migrate `/src/app/(app)/admin/components/map-settings-form.tsx`
  - Update form to use Google Maps configuration
  - Replace Mapbox-specific settings with Google Maps equivalents
  - Ensure API key validation works with Google Maps

#### Phase 3: Feature Parity
- [ ] Implement custom tricycle markers on Google Maps
- [ ] Set up map clustering for multiple vehicles
- [ ] Configure map styling to match existing design
- [ ] Implement route visualization
- [ ] Add geofencing capabilities
- [ ] Set up real-time location updates

#### Phase 4: Cleanup and Optimization
- [ ] Remove Mapbox packages from package.json
- [ ] Delete any Mapbox-specific utility functions
- [ ] Clean up unused Mapbox types and interfaces
- [ ] Remove Mapbox environment variables
- [ ] Update documentation references

### Technical Requirements

#### Dependencies to Add
```json
{
  "@react-google-maps/api": "^2.19.3",
  "@googlemaps/js-api-loader": "^1.16.6",
  "@types/google.maps": "^3.55.5"
}
```

#### Dependencies to Remove
```json
{
  "mapbox-gl": "^3.5.2",
  "@types/mapbox-gl": "^3.1.0"
}
```

#### Environment Variables
```env
# Add
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Remove
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=existing_token
```

### Implementation Guide

#### 1. Google Maps Setup Script
```typescript
// /src/lib/google-maps.ts
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geometry', 'drawing', 'visualization']
});

export default loader;
```

#### 2. Map Component Structure
```typescript
// Basic structure for migrated components
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 14.5995, // Manila coordinates
  lng: 120.9842
};
```

#### 3. Custom Marker Implementation
- Convert SVG tricycle icon to Google Maps custom marker
- Implement marker clustering for performance
- Add click handlers for info windows

### File Changes Required

1. **`/src/app/(app)/admin/components/live-map.tsx`**
   - Complete rewrite using Google Maps components
   - Preserve existing functionality

2. **`/src/app/(app)/admin/components/map-settings-form.tsx`**
   - Update form fields for Google Maps configuration
   - Add Google Maps API key validation

3. **`/src/app/globals.css`**
   - Already cleaned (Mapbox styles removed)
   - May need to add Google Maps specific styles if required

4. **`package.json`**
   - Update dependencies
   - Update any map-related scripts

5. **`.env`**
   - Add Google Maps API key
   - Remove Mapbox token

### Testing Checklist

- [ ] Map loads correctly on all pages
- [ ] Markers display with correct icons
- [ ] Real-time updates work properly
- [ ] Info windows/popups function correctly
- [ ] Map controls are accessible
- [ ] Performance is acceptable with multiple markers
- [ ] Mobile responsiveness maintained
- [ ] No console errors related to maps
- [ ] API key is properly secured

### Rollback Plan

In case of issues:
1. Git revert to previous commit
2. Restore Mapbox dependencies
3. Revert environment variables
4. Document specific issues encountered

### Success Criteria

- Zero Mapbox dependencies in project
- All map features working with Google Maps
- No degradation in performance
- Clean build with no type errors
- Successful deployment to production

### Notes for Implementation Agent

1. **API Key Security**: Ensure Google Maps API key is restricted to specific domains
2. **Performance**: Implement marker clustering for > 50 markers
3. **Styling**: Use Google Maps styling wizard to match current design
4. **Migration Order**: Start with read-only map views before interactive features
5. **Testing**: Test on different screen sizes and browsers

### Resources

- [Google Maps React Documentation](https://react-google-maps-api-docs.netlify.app/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Migration Guide from Mapbox](https://developers.google.com/maps/documentation/javascript/mapbox-to-google-maps)
- [Google Maps Styling](https://mapstyle.withgoogle.com/)

### Timeline Estimate

- Setup and Configuration: 1-2 hours
- Component Migration: 3-4 hours
- Feature Parity: 2-3 hours
- Testing and Cleanup: 1-2 hours

**Total Estimated Time: 7-11 hours**

### Priority Level: HIGH

This migration is critical for:
- Reducing dependency on multiple map providers
- Potentially reducing costs
- Standardizing on Google ecosystem (already using Gemini AI)
- Better integration with other Google services

---

## Agent Instructions

When implementing this migration:

1. Start by installing Google Maps packages
2. Create a test component to verify Google Maps works
3. Migrate one component at a time
4. Test thoroughly after each migration
5. Only remove Mapbox after all components are migrated
6. Update all documentation and comments
7. Ensure no hardcoded API keys in code

Remember to follow the existing code patterns and maintain the current user experience while migrating to Google Maps.