import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiBarChart2,
  FiEye,
  FiUsers,
  FiTrendingUp,
  FiGlobe,
  FiLock,
  FiStar,
  FiChevronDown,
  FiClock,
  FiArrowUpRight,
} from "react-icons/fi";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { analyticsApi, pagesApi, subscriptionApi, apiError } from "../services/api";

/* ─────────────────────── Animated Counter ─────────────────────── */
function AnimatedCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value == null) return;
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <>{display.toLocaleString("id-ID")}</>;
}

/* ─────────────────── Upgrade Overlay ─────────────────── */
function UpgradeOverlay({ tier, label }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-lg bg-ink-950/60 backdrop-blur-md">
      <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.08]">
        <FiLock className="h-6 w-6 text-brand-aqua" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">
          {tier} Feature
        </p>
        <p className="mt-1 max-w-xs text-xs text-white/50">
          Upgrade to {tier} to unlock {label}.
        </p>
      </div>
      <Button
        as={Link}
        to="/pricing"
        variant="primary"
        size="sm"
        icon={FiStar}
      >
        Upgrade Now
      </Button>
    </div>
  );
}

/* ─────────────────── SVG Bar Chart ─────────────────── */
function DailyViewsChart({ data = [] }) {
  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data],
  );
  const barWidth = 100 / Math.max(data.length, 1);

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <svg
        viewBox="0 0 600 200"
        className="w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = (d.count / maxCount) * 170;
          const x = (i / data.length) * 600 + 2;
          const w = 600 / data.length - 4;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={200 - h - 10}
                width={Math.max(w, 2)}
                height={h}
                rx={3}
                fill="url(#barGrad)"
                className="transition-all duration-500"
              />
              <title>
                {d.date}: {d.count} views
              </title>
            </g>
          );
        })}
        {/* baseline */}
        <line
          x1={0}
          y1={190}
          x2={600}
          y2={190}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      </svg>
      {/* X-axis labels */}
      <div className="mt-1 flex justify-between px-1">
        <span className="text-[10px] text-white/30">
          {data[0]?.date ?? ""}
        </span>
        <span className="text-[10px] text-white/30">
          {data[data.length - 1]?.date ?? ""}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── Referrer Bar ─────────────────── */
function ReferrerBar({ name, count, max, index }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const colors = [
    "from-brand-aqua/40 to-brand-aqua/10",
    "from-brand-lime/40 to-brand-lime/10",
    "from-brand-amber/40 to-brand-amber/10",
    "from-brand-rose/40 to-brand-rose/10",
    "from-purple-400/40 to-purple-400/10",
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-white/80">
          <FiGlobe className="h-3.5 w-3.5 text-white/30" />
          {name || "Direct"}
        </span>
        <span className="font-mono text-xs text-white/50">
          {count.toLocaleString("id-ID")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.05 }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────── Page Selector Dropdown ─────────────────── */
function PageSelector({ pages, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const current = pages.find((p) => p.slug === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="field-shell flex items-center justify-between gap-3 pr-3"
      >
        <span className="truncate text-left">
          {current?.title || "Select a page"}
        </span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-white/10 bg-ink-950 py-1 shadow-2xl scrollbar-none"
          >
            {pages.map((page) => (
              <li key={page.slug}>
                <button
                  className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.08] ${
                    page.slug === selected
                      ? "bg-white/[0.06] text-brand-aqua"
                      : "text-white/70"
                  }`}
                  onClick={() => {
                    onChange(page.slug);
                    setOpen(false);
                  }}
                >
                  <div className="font-medium">{page.title}</div>
                  <div className="mt-0.5 text-xs text-white/30">
                    /{page.slug}
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const sectionVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function AnalyticsPage() {
  useDocumentTitle("Analytics");

  // ── State ──
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [plan, setPlan] = useState("free"); // "free" | "plus" | "pro"
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingVisitors, setLoadingVisitors] = useState(false);

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState(null);
  const [visitors, setVisitors] = useState([]);

  const isPlusOrAbove = plan === "plus" || plan === "pro_plus";
  const isPro = plan === "pro_plus";

  // ── Fetch pages & subscription on mount ──
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [pagesRes, subRes] = await Promise.allSettled([
          pagesApi.all(),
          subscriptionApi.get(),
        ]);

        if (pagesRes.status === "fulfilled") {
          const list = pagesRes.value.data.pages;
          setPages(list);
          if (list.length > 0) setSelectedSlug(list[0].slug);
        } else {
          toast.error("Failed to load pages.");
        }

        if (subRes.status === "fulfilled") {
          setPlan(subRes.value.data.plan || "free");
        }
      } catch (err) {
        toast.error(apiError(err).message);
      } finally {
        setLoadingPages(false);
      }
    };
    fetchInit();
  }, []);

  // ── Fetch analytics when slug changes ──
  const fetchAnalytics = useCallback(
    async (slug) => {
      if (!slug) return;

      // always fetch summary (free tier)
      setLoadingSummary(true);
      try {
        const res = await analyticsApi.summary(slug);
        setSummary(res.data);
      } catch (err) {
        if (err?.response?.status !== 403) toast.error(apiError(err).message);
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }

      // fetch details (plus+)
      setLoadingDetails(true);
      try {
        const res = await analyticsApi.details(slug);
        setDetails(res.data);
      } catch (err) {
        if (err?.response?.status === 403) {
          setDetails(null);
        } else {
          toast.error(apiError(err).message);
          setDetails(null);
        }
      } finally {
        setLoadingDetails(false);
      }

      // fetch visitors (pro+)
      setLoadingVisitors(true);
      try {
        const res = await analyticsApi.visitors(slug);
        setVisitors(res.data.visitors || []);
      } catch (err) {
        if (err?.response?.status === 403) {
          setVisitors([]);
        } else {
          toast.error(apiError(err).message);
          setVisitors([]);
        }
      } finally {
        setLoadingVisitors(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (selectedSlug) fetchAnalytics(selectedSlug);
  }, [selectedSlug, fetchAnalytics]);

  // ── Overview cards data ──
  const overviewCards = useMemo(
    () => [
      {
        label: "Total Views",
        value: summary?.total_views ?? 0,
        icon: FiEye,
        gradient: "from-brand-aqua/20 via-brand-aqua/5 to-transparent",
        iconColor: "text-brand-aqua",
      },
      {
        label: "Views Today",
        value: summary?.views_today ?? 0,
        icon: FiTrendingUp,
        gradient: "from-brand-lime/20 via-brand-lime/5 to-transparent",
        iconColor: "text-brand-lime",
      },
      {
        label: "This Week",
        value: summary?.views_7d ?? 0,
        icon: FiBarChart2,
        gradient: "from-brand-amber/20 via-brand-amber/5 to-transparent",
        iconColor: "text-brand-amber",
      },
      {
        label: "This Month",
        value: summary?.views_30d ?? 0,
        icon: FiGlobe,
        gradient: "from-brand-rose/20 via-brand-rose/5 to-transparent",
        iconColor: "text-brand-rose",
      },
    ],
    [summary],
  );

  // ── Loading state (pages) ──
  if (loadingPages) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // ── No pages ──
  if (!pages.length) {
    return (
      <EmptyState
        icon={FiBarChart2}
        title="No pages yet"
        description="Create your first page to start tracking analytics and visitor insights."
        action="Create page"
        onAction={() => (window.location.href = "/pages")}
      />
    );
  }

  const topReferrers = (summary?.top_referrers || []).slice(0, 5);
  const allReferrers = details?.all_referrers || [];
  const maxReferrer = Math.max(...topReferrers.map((r) => r.count), 1);
  const maxAllReferrer = Math.max(...allReferrers.map((r) => r.count), 1);

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <Badge tone="aqua">Analytics</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Page Analytics
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Track visitors, referrers, and engagement for your pages.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <PageSelector
            pages={pages}
            selected={selectedSlug}
            onChange={setSelectedSlug}
          />
        </div>
      </motion.div>

      {/* ─── Overview Cards ─── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingSummary
          ? [1, 2, 3, 4].map((k) => <Skeleton key={k} className="h-32" />)
          : overviewCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariant}
                  className="glass-panel group relative overflow-hidden rounded-lg p-5"
                >
                  {/* subtle gradient bg */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60`}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {card.label}
                      </span>
                      <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
                        <Icon className={`h-4 w-4 ${card.iconColor}`} />
                      </div>
                    </div>
                    <div className="mt-4 text-3xl font-bold tracking-tight text-white">
                      <AnimatedCounter value={card.value} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </section>

      {/* ─── Free Tier: Top 5 Referrers ─── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
        className="glass-panel overflow-hidden rounded-lg p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <FiGlobe className="h-5 w-5 text-brand-aqua" />
          <h2 className="text-lg font-semibold text-white">Top Referrers</h2>
          <Badge tone="neutral">Free</Badge>
        </div>

        {loadingSummary ? (
          <div className="space-y-4">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-8" />
            ))}
          </div>
        ) : topReferrers.length > 0 ? (
          <div className="space-y-4">
            {topReferrers.map((ref, i) => (
              <ReferrerBar
                key={ref.referrer || `direct-${i}`}
                name={ref.referrer}
                count={ref.count}
                max={maxReferrer}
                index={i}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">
            No referrer data yet. Share your page to start seeing traffic sources.
          </p>
        )}

        {/* Simple view count */}
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <FiEye className="h-4 w-4 text-brand-aqua" />
          <span className="text-sm text-white/60">Total page views:</span>
          <span className="font-semibold text-white">
            {(summary?.total_views ?? 0).toLocaleString("id-ID")}
          </span>
        </div>
      </motion.section>

      {/* ─── Plus Tier: Daily Views Chart + All Referrers + Unique Visitors ─── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
        className="glass-panel relative overflow-hidden rounded-lg p-6"
      >
        {!isPlusOrAbove && (
          <UpgradeOverlay tier="Plus" label="daily views chart, all referrers & unique visitors" />
        )}
        <div
          className={!isPlusOrAbove ? "pointer-events-none select-none blur-sm" : ""}
        >
          <div className="mb-5 flex items-center gap-3">
            <FiBarChart2 className="h-5 w-5 text-brand-lime" />
            <h2 className="text-lg font-semibold text-white">
              Daily Views — Last 30 Days
            </h2>
            <Badge tone="green">Plus</Badge>
          </div>

          {loadingDetails ? (
            <Skeleton className="h-52" />
          ) : (
            <DailyViewsChart data={details?.daily_views || []} />
          )}

          {/* All Referrers */}
          <div className="mt-8">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
              <FiGlobe className="h-4 w-4 text-white/40" />
              All Referrers
            </h3>
            {loadingDetails ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((k) => (
                  <Skeleton key={k} className="h-7" />
                ))}
              </div>
            ) : allReferrers.length > 0 ? (
              <div className="space-y-3">
                {allReferrers.map((ref, i) => (
                  <ReferrerBar
                    key={ref.referrer || `all-direct-${i}`}
                    name={ref.referrer}
                    count={ref.count}
                    max={maxAllReferrer}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No referrer data available.</p>
            )}
          </div>

          {/* Unique Visitors */}
          <div className="mt-8 flex items-center gap-4 rounded-lg border border-brand-lime/15 bg-brand-lime/[0.04] px-5 py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-lime/20 bg-brand-lime/10">
              <FiUsers className="h-5 w-5 text-brand-lime" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                Unique Visitors
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {loadingDetails ? (
                  "—"
                ) : (
                  <AnimatedCounter
                    value={details?.unique_visitors ?? 0}
                    duration={900}
                  />
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Pro+ Tier: Visitor Log ─── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariant}
        className="glass-panel relative overflow-hidden rounded-lg p-6"
      >
        {!isPro && (
          <UpgradeOverlay tier="Pro+" label="the full visitor log with real-time data" />
        )}
        <div className={!isPro ? "pointer-events-none select-none blur-sm" : ""}>
          <div className="mb-5 flex items-center gap-3">
            <FiUsers className="h-5 w-5 text-brand-rose" />
            <h2 className="text-lg font-semibold text-white">Visitor Log</h2>
            <Badge tone="rose">Pro+</Badge>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-lime opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-lime" />
              </span>
              <span className="text-xs font-medium text-brand-lime">Real-time</span>
            </span>
          </div>

          {loadingVisitors ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-10" />
              ))}
            </div>
          ) : visitors.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      User Agent
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Referrer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {visitors.map((v, i) => (
                    <motion.tr
                      key={`${v.created_at}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-white/70">
                        <span className="flex items-center gap-2">
                          <FiClock className="h-3.5 w-3.5 text-white/30" />
                          {new Date(v.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-white/50">
                        {v.user_agent || "—"}
                      </td>
                      <td className="px-4 py-3 text-white/50">
                        {v.referrer ? (
                          <span className="flex items-center gap-1">
                            <FiArrowUpRight className="h-3 w-3 text-brand-aqua" />
                            {v.referrer}
                          </span>
                        ) : (
                          <span className="text-white/25">Direct</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/40">
              No visitor data yet. Visitors will appear here in real time.
            </p>
          )}
        </div>
      </motion.section>
    </div>
  );
}
