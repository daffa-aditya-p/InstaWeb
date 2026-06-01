import React, { Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { useAuthStore } from "./store/authStore";

// Lazy-loaded page components
const AdminPage = React.lazy(() => import("./pages/AdminPage"));
const BuilderPage = React.lazy(() => import("./pages/BuilderPage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const PagesPage = React.lazy(() => import("./pages/PagesPage"));
const PreviewPage = React.lazy(() => import("./pages/PreviewPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const PublicSitePage = React.lazy(() => import("./pages/PublicSitePage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));

function RouteLoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-brand-aqua/20 border-t-brand-aqua animate-spin" />
        <div className="absolute h-8 w-8 rounded-full border border-brand-rose/25 border-b-brand-rose animate-ping" />
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/pages" replace /> : <Outlet />;
}

function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  return ["admin", "super_admin"].includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export default function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Suspense fallback={<RouteLoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/site/:slug" element={<PublicSitePage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pages" element={<PagesPage />} />
            <Route path="/pages/:slug/builder" element={<BuilderPage />} />
            <Route path="/pages/:slug/preview" element={<PreviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}
