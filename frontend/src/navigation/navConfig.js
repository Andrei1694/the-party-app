export const NAV_ITEMS = [
  { key: 'profile', label: 'Profile', to: '/profile', icon: 'person' },
  { key: 'users', label: 'Users', to: '/users', icon: 'group' },
  { key: 'news', label: 'News', to: '/news', icon: 'newspaper' },
];

export const ROUTE_TITLES = {
  '/profile': 'Profile',
  '/users': 'Users',
  '/news': 'News',
};

export const SHELL_ENABLED_PATHS = ['/profile', '/users', '/news'];

const matchesPath = (pathname, basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`);

export const isShellRoute = (pathname) => SHELL_ENABLED_PATHS.some((path) => matchesPath(pathname, path));

export const getRouteTitle = (pathname) => {
  const matchedPath = SHELL_ENABLED_PATHS.find((path) => matchesPath(pathname, path));
  return matchedPath ? ROUTE_TITLES[matchedPath] : 'Dashboard';
};
