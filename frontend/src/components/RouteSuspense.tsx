import { Suspense } from 'react';

const RouteLoadingSpinner = () => (
  <div
    className="flex min-h-[45vh] w-full flex-col items-center justify-center gap-3 text-[#32443e]"
    role="status"
    aria-live="polite"
  >
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d8e7b8] border-t-[#7ca43f]" />
    <p className="text-sm font-semibold">Loading page...</p>
  </div>
);

const RouteSuspense = ({ children }) => (
  <Suspense fallback={<RouteLoadingSpinner />}>{children}</Suspense>
);

export default RouteSuspense;
