import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiGrid,
  FiInbox,
  FiLayers,
  FiLogOut,
  FiStar,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

import { useAuthStore } from "../../store/authStore";
import { invitationApi } from "../../services/api";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const navItems = [
  { label: "Dasbor", href: "/dashboard", icon: FiBarChart2 },
  { label: "Halaman", href: "/pages", icon: FiLayers },
  { label: "Analitik", href: "/analytics", icon: FiTrendingUp },
  { label: "Harga", href: "/pricing", icon: FiStar },
  { label: "Kotak Masuk", href: "/inbox", icon: FiInbox },
];

export function AppShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = ["admin", "super_admin"].includes(user?.role);
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    invitationApi
      .count()
      .then((res) => setInboxCount(res.data.count))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink-950/70">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <button
            className="flex items-center gap-3"
            onClick={() => navigate("/dashboard")}
            aria-label="Go to dashboard"
          >
            <div className="grid h-10 w-10 overflow-hidden place-items-center rounded-lg border border-white/10 bg-white text-ink-950 shadow-soft">
              <img src="/logo.png" alt="InstaWeb Logo" className="h-full w-full object-cover" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">InstaWeb</div>
              <div className="text-xs text-white/[0.45]">Website berbasis modul</div>
            </div>
          </button>

          <nav className="scrollbar-none order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 pb-1 sm:order-none sm:mx-0 sm:w-auto sm:px-0 sm:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `surface-link flex items-center gap-2 ${
                      isActive ? "surface-link-active" : ""
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.label === "Kotak Masuk" && inboxCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-rose px-1.5 text-[10px] font-bold text-white">
                      {inboxCount > 99 ? "99+" : inboxCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `surface-link flex items-center gap-2 ${
                    isActive ? "surface-link-active" : ""
                  }`
                }
              >
                <FiGrid className="h-4 w-4" />
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            <Badge tone={user?.role === "super_admin" ? "amber" : isAdmin ? "aqua" : "neutral"}>
              {user?.role?.replace("_", " ") || "user"}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate("/profile")}
              aria-label="Open profile"
            >
              <FiUser className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleLogout} aria-label="Logout">
              <FiLogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
