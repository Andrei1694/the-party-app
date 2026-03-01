

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
