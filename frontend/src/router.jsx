import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import App from './App';
import ProtectedRoute from './auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import News from './pages/News';
import NewsArticle from './pages/NewsArticle';
import Events from './pages/Events';
import Register from './pages/Register';
import Users from './pages/Users';
import Profile from './pages/Profile';

const rootRoute = createRootRoute({
  component: App,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: () => (
    <ProtectedRoute>
      <News />
    </ProtectedRoute>
  ),
});

const newsArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news/$newsId',
  component: () => (
    <ProtectedRoute>
      <NewsArticle />
    </ProtectedRoute>
  ),
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: () => (
    <ProtectedRoute>
      <Events />
    </ProtectedRoute>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: () => (
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  newsRoute,
  newsArticleRoute,
  eventsRoute,
  loginRoute,
  registerRoute,
  usersRoute,
  profileRoute,
]);

export const router = createRouter({
  routeTree,
});
