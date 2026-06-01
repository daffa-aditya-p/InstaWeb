import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiExternalLink, FiLayers, FiPlus, FiZap } from "react-icons/fi";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { pagesApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  useDocumentTitle("Dashboard");
  const user = useAuthStore((state) => state.user);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pagesApi
      .all()
      .then((response) => setPages(response.data.pages))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(
    () => [
      { label: "Pages", value: pages.length, icon: FiLayers },
      {
        label: "Published",
        value: pages.filter((page) => page.is_published).length,
        icon: FiExternalLink,
      },
      { label: "Drafts", value: pages.filter((page) => !page.is_published).length, icon: FiActivity },
    ],
    [pages],
  );

  return (
    <div className="space-y-6">
      <section className="glass-panel overflow-hidden rounded-lg">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <Badge tone="aqua">Workspace</Badge>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Build and publish structured websites without leaving your flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
              Welcome back, {user?.name}. Your pages are powered by templates,
              sections, and field values stored in SQLite.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button as={Link} to="/pages" icon={FiPlus} variant="primary">
                New page
              </Button>
              <Button as={Link} to="/pages" icon={FiLayers}>
                Manage pages
              </Button>
            </div>
          </div>
          <div className="grid content-end gap-3">
            <div className="rounded-lg border border-white/10 bg-black/30 p-4">
              <FiZap className="h-5 w-5 text-brand-amber" />
              <p className="mt-4 text-sm leading-6 text-white/60">
                Shortcuts: Alt + N opens the page form, Alt + S opens section
                selection inside the builder, Esc closes open panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading
          ? [1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)
          : metrics.map((metric) => {
              const Icon = metric.icon;
              return (
              <div className="muted-panel rounded-lg p-5" key={metric.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/[0.55]">{metric.label}</span>
                  <Icon className="h-5 w-5 text-brand-aqua" />
                </div>
                <div className="mt-5 text-3xl font-semibold text-white">{metric.value}</div>
              </div>
              );
            })}
      </section>

      <section className="muted-panel rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Recent pages</h2>
          <Link className="text-sm font-medium text-brand-aqua hover:text-white" to="/pages">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {loading ? (
            <Skeleton className="h-20" />
          ) : pages.length ? (
            pages.slice(0, 4).map((page) => (
              <Link
                className="rounded-lg border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.08]"
                key={page.id}
                to={`/pages/${page.slug}/builder`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{page.title}</h3>
                    <p className="mt-1 text-xs text-white/[0.45]">/{page.slug}</p>
                  </div>
                  <Badge tone={page.is_published ? "green" : "neutral"}>
                    {page.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-white/[0.55]">No pages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
