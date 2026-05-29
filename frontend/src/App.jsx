import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { useAuthStore } from "./store/authStore";
import AdminPage from "./pages/AdminPage";
import BuilderPage from "./pages/BuilderPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PagesPage from "./pages/PagesPage";
import PreviewPage from "./pages/PreviewPage";
import ProfilePage from "./pages/ProfilePage";
import PublicSitePage from "./pages/PublicSitePage";
import RegisterPage from "./pages/RegisterPage";

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
  );
}

