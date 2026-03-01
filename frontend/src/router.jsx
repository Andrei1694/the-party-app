import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { lazy } from 'react';
import App from './App';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicOnlyRoute from './auth/PublicOnlyRoute';
import RootRedirectRoute from './auth/RootRedirectRoute';
import RouteSuspense from './components/RouteSuspense';
import NewsArticle from './pages/NewsArticle';

const Login = lazy(() => import('./pages/Login'));
const News = lazy(() => import('./pages/News'));
const Events = lazy(() => import('./pages/Events'));
const Register = lazy(() => import('./pages/Register'));
const Users = lazy(() => import('./pages/Users'));
const Profile = lazy(() => import('./pages/Profile'));

const rootRoute = createRootRoute({
  component: App,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RootRedirectRoute,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <RouteSuspense>
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    </RouteSuspense>
  ),
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: () => (
    <RouteSuspense>
      <ProtectedRoute>
        <News />
      </ProtectedRoute>
    </RouteSuspense>
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
    <RouteSuspense>
      <ProtectedRoute>
        <Events />
      </ProtectedRoute>
    </RouteSuspense>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => (
    <RouteSuspense>
      <Register />
    </RouteSuspense>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: () => (
    <RouteSuspense>
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    </RouteSuspense>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <RouteSuspense>
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    </RouteSuspense>
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
