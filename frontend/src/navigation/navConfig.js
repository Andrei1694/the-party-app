export const NAV_ITEMS = [
  { label: 'Profile', to: '/profile', icon: 'person' },
  { label: 'Users', to: '/users', icon: 'group' },
];

export const ROUTE_TITLES = {
  '/profile': 'Profile',
  '/users': 'Users',
};

export const SHELL_ENABLED_PATHS = ['/profile', '/users'];

const matchesPath = (pathname, basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`);

export const isShellRoute = (pathname) => SHELL_ENABLED_PATHS.some((path) => matchesPath(pathname, path));

export const getRouteTitle = (pathname) => {
  const matchedPath = SHELL_ENABLED_PATHS.find((path) => matchesPath(pathname, path));
  return matchedPath ? ROUTE_TITLES[matchedPath] : 'Dashboard';
};
