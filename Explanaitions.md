# Uncommitted Changes Analysis + Learning Guide

## 1) Big-picture analogy
Your uncommitted work reads like a pit-stop focused on startup speed and runtime weight: you tightened session boot logic, trimmed UI payload (fonts/icons/lazy imports), and reduced repeated work in render paths.

## 2) PR themes (anchored to concrete evidence)

### Theme A: Session bootstrap and auth gating hardening
Evidence:
- `frontend/src/auth/AuthContext.jsx:8-35` adds safe storage wrappers (`readStoredToken`, `writeStoredToken`).
- `frontend/src/auth/AuthContext.jsx:45-51` initializes auth header and loading state from stored token.
- `frontend/src/auth/ProtectedRoute.jsx:5-13`, `frontend/src/auth/PublicOnlyRoute.jsx:5-13`, `frontend/src/auth/RootRedirectRoute.jsx:5-12` switch routing checks from `user` to `isAuthenticated`.

Why this matters:
- You reduced unnecessary loading states when no token exists and made route guards more explicit.

### Theme B: Rendering/perf cleanup in hot UI paths
Evidence:
- `frontend/src/util.js:25-31` hoists `Intl.DateTimeFormat` into a reusable constant.
- `frontend/src/pages/Events.jsx:59-66` precomputes `formattedStartsAt` once per `events` change.
- `frontend/src/pages/Profile.jsx:43` + `frontend/src/pages/Profile.jsx:415-437` lazy-loads image crop dialog only when needed.
- `frontend/src/components/profile/ProfileImpactTab.jsx:34-84` lazy-loads achievement images via `IntersectionObserver`.

Why this matters:
- You moved expensive work off per-render paths and deferred rarely used UI code.

### Theme C: Payload and visual-system consolidation
Evidence:
- `frontend/index.html:5-14` adds font preconnect and switches to a constrained Material Symbols payload.
- `frontend/src/index.css:36-51` remaps `.material-icons` to Material Symbols.
- `frontend/tailwind.config.js:31` aligns `display` font with the current typography system.

Why this matters:
- Fewer redundant font/icon assets and cleaner design-token consistency.

### Theme D: Maintainability refactor in Profile impact UI
Evidence:
- `frontend/src/components/profile/ProfileImpactTab.jsx:3-32` creates data-driven `ACHIEVEMENTS` config.
- `frontend/src/components/profile/ProfileImpactTab.jsx:125-145` replaces repeated markup with a mapped render.

Why this matters:
- Easier to add/edit achievements with less duplicated JSX.

## 3) Walkthrough diagram (auth flow after your changes)

```text
[App imports AuthContext]
        |
        v
readStoredToken() -> setAuthToken(initialToken)
        |
        v
AuthProvider mounts
        |
        +--> if token missing: user=null, isAuthenticated=false, isLoading=false
        |
        +--> if token exists: call /auth/me
                    |
                    +--> success: user=data, isAuthenticated=true
                    |
                    +--> failure: clear token/header, isAuthenticated=false
```

## 4) Review-style comments (concrete and actionable)

### Comment 1 (High): `OPTIMISE.MD` looks accidentally truncated
Evidence:
- `OPTIMISE.MD:1-2` now begins with blank lines.
- Former items 1-7 were removed while item 8 remains (`OPTIMISE.MD:3-4`).

Action:
- Restore heading and missing sections, or intentionally rewrite the document so numbering/sections stay coherent.

### Comment 2 (Medium): Auth now has two sources of truth (`user` and `isAuthenticated`) without invariant tests
Evidence:
- `frontend/src/auth/AuthContext.jsx:49-52`, `83-99`, `110-115` manage both values independently.
- Routes depend only on `isAuthenticated` (`frontend/src/auth/ProtectedRoute.jsx:5-13`).

Action:
- Add tests for transitions: `no token`, `valid token`, `expired token`, `login success`, `register without token`, `logout`.
- Add an invariant rule in tests: "if `isAuthenticated===true`, a token must exist and `user` must be non-null" (or document the accepted exception).

### Comment 3 (Medium): Font/icon subsetting is a good optimization but needs regression guardrails
Evidence:
- New subset list lives in `frontend/index.html:13`.
- Icon rendering relies on ligature mapping in `frontend/src/index.css:36-51`.

Action:
- Add a simple CI check/script that extracts icon names from JSX and compares against `icon_names` to prevent silent missing icons.

### Comment 4 (Low): Event formatting optimization is split between utility and page-level mapping
Evidence:
- `frontend/src/util.js:209-217` and `frontend/src/pages/Events.jsx:59-66` both participate in view formatting.

Action:
- Standardize where view-model shaping happens (query layer or component layer), document that rule, and apply it consistently.

### Comment 5 (Low): Lazy image strategy is solid, but complexity should be justified with measurement
Evidence:
- `frontend/src/components/profile/ProfileImpactTab.jsx:34-84` adds observer lifecycle code for four fixed images.

Action:
- Measure LCP/transfer impact before and after; keep this pattern only where the measurable win is non-trivial.

## 5) Recurring patterns I see
1. You optimize real bottlenecks quickly (good), but validation guardrails (tests/scripts) are added less consistently.
2. Refactors improve structure, but some changes stop short of policy-level consistency (single source of truth, documented conventions).
3. Performance work is strong at implementation level; it needs stronger measurement discipline to prevent over-optimization.

## 6) Learning guide to sharpen your skills (evidence-anchored)

### Skill 1: State-machine thinking for auth/session
Evidence anchor:
- `frontend/src/auth/AuthContext.jsx` now tracks `user`, `isLoading`, and `isAuthenticated` separately.

Practice:
- Write a tiny auth state transition table (event -> next state) for `BOOT`, `ME_OK`, `ME_FAIL`, `LOGIN_OK`, `LOGOUT`.
- Implement tests that assert each transition.

Success criteria:
- You can change auth internals without route regressions, and tests catch inconsistency in under 1 minute.

### Skill 2: Performance optimization with measurable outcomes
Evidence anchor:
- `frontend/src/pages/Profile.jsx` lazy import, `frontend/src/util.js` formatter reuse, `frontend/src/components/profile/ProfileImpactTab.jsx` lazy image logic.

Practice:
- For each perf tweak, log: baseline metric, change, delta, accept/reject decision.
- Use the same 2-3 metrics every time (bundle size, LCP, scripting time).

Success criteria:
- Every optimization PR has a before/after metric note, and at least one reverted change if benefit is negligible.

### Skill 3: Preventing partial refactors/docs drift
Evidence anchor:
- `OPTIMISE.MD` structure currently appears partially removed.

Practice:
- Add a final "integrity pass" checklist before commit: heading present, numbering valid, diff sanity scan, no orphaned sections.

Success criteria:
- No partially edited docs/configs in next 5 PRs.

### Skill 4: Tooling guardrails for payload micro-optimizations
Evidence anchor:
- Manual icon subset in `frontend/index.html:13`.

Practice:
- Automate icon-name extraction and subset validation in CI.

Success criteria:
- Icon subset changes fail fast in CI when a new icon is used but not declared.

## 7) One gotcha to remember
When you split auth into `user` + `isAuthenticated`, route correctness depends on sync between those values. Without explicit transition tests, regressions are subtle and usually appear only in edge cases (expired token, storage failure, backend returning partial login payloads).
