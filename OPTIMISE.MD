# Frontend Optimisation Audit

No code changes made. Biggest optimization opportunities:

1. High: Route bundle is not split, so all page components ship on first load.  
Refs: `frontend/src/router.jsx:6`, `frontend/src/router.jsx:10`.  
Evidence: `npm run build` outputs one JS bundle: `dist/assets/index-*.js` at `482.89 kB` (`148.54 kB` gzip).  
Target components: `News`, `Events`, `Profile`, `Users`, `Login`, `Register`.

2. High: Auth gating creates a fetch waterfall on protected pages (`/auth/me` first, page data second).  
Refs: `frontend/src/auth/AuthContext.jsx:20`, `frontend/src/auth/ProtectedRoute.jsx:8`, `frontend/src/pages/News.jsx:23`.

3. High: `Profile` re-renders the full screen on every form keystroke due to broad form-store subscription.  
Ref: `frontend/src/pages/Profile.jsx:128`.  
This affects the whole component tree under `Profile` (avatar, tabs, level section, etc.).

4. Medium: `Profile` eagerly pulls image-cropping stack (`react-easy-crop`) instead of loading only when user edits avatar.  
Refs: `frontend/src/pages/Profile.jsx:5`, `frontend/src/components/image/ImageCropDialog.jsx:2`.

5. Medium: Font/icon payload is heavy and duplicated (multiple Google font families + Material Icons font).  
Refs: `frontend/index.html:7`, `frontend/index.html:9`, `frontend/src/index.css:1`.

6. Medium: `Events` does repeated expensive date formatter construction during list rendering.  
Refs: `frontend/src/util.js:202`, `frontend/src/pages/Events.jsx:131`.

7. Medium: `ProfileImpactTab` uses multiple remote background images without lazy image loading behavior.  
Refs: `frontend/src/components/profile/ProfileImpactTab.jsx:37`, `frontend/src/components/profile/ProfileImpactTab.jsx:43`.

8. Low: Unused dependency in frontend package (`react-router-dom`), which adds install/maintenance overhead.  
Ref: `frontend/package.json:20`.

Checks run during audit:
- `npm run lint` (clean)
- `npm run build` (successful)

## Caching Opportunities

1. High: Add global React Query defaults for cache behavior.  
Ref: `frontend/src/main.jsx:9`.  
Set `staleTime`, `gcTime`, and `refetchOnWindowFocus` defaults in `QueryClient`.

2. High: Add explicit cache policy for the `Users` query.  
Ref: `frontend/src/pages/Users.jsx:11`.  
This query currently has no `staleTime`, so it can refetch more often than needed.

3. High: Improve list/detail caching on news routes.  
Refs: `frontend/src/pages/News.jsx:23`, `frontend/src/pages/NewsArticle.jsx:40`.  
Keep existing `initialData` flow and add detail prefetch on hover/navigation.

4. Medium: Tune cache windows for events and joined state.  
Refs: `frontend/src/pages/Events.jsx:41`, `frontend/src/pages/Events.jsx:52`.  
Use longer caching for `['events', 'joined']` and invalidate only on join mutation.

5. Medium: Cache session bootstrap to reduce startup waterfall.  
Ref: `frontend/src/auth/AuthContext.jsx:20`.  
`/auth/me` runs on app start; a short-lived cached snapshot can reduce cold-load waits.

6. Medium: Add HTTP caching support at API layer (with backend support).  
Ref: `frontend/src/requests.js:5`.  
Handle `ETag`/`If-None-Match` for read-heavy endpoints (`news`, `events`, `users`).

7. Low: Micro-cache date formatting utility used in event lists.  
Refs: `frontend/src/util.js:202`, `frontend/src/pages/Events.jsx:131`.  
Reuse a single `Intl.DateTimeFormat` instance instead of creating one per render item.
