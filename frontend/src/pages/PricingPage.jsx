import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiX,
  FiZap,
  FiAward,
  FiStar,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { subscriptionApi, apiError } from "../services/api";

/* ──────────────────────── helpers ──────────────────────── */

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

const PLANS = [
  {
    key: "free",
    name: "Gratis",
    icon: FiStar,
    monthly: 0,
    yearly: 0,
    yearlyOriginal: 0,
    badge: null,
    badgeTone: null,
    highlight: false,
    glow: false,
    note: null,
    features: [
      { text: "Analitik web dasar", included: true },
      { text: "Hingga 5 halaman", included: true },
      { text: "Semua template modul", included: true },
      { text: "Kustomisasi gaya UI", included: true },
      { text: "Statistik premium", included: false },
      { text: "Animasi modern", included: false },
      { text: "Modul HTML kustom", included: false },
    ],
  },
  {
    key: "plus",
    name: "Plus",
    icon: FiZap,
    monthly: 150_000,
    yearly: 1_500_000,
    yearlyOriginal: 1_800_000,
    badge: "POPULER",
    badgeTone: "aqua",
    highlight: true,
    glow: false,
    note: null,
    features: [
      { text: "Semua fitur Gratis", included: true },
      { text: "Pembuatan halaman tanpa batas", included: true },
      { text: "Support statistik premium", included: true },
      { text: "Support animasi modern", included: true },
      { text: "Support section baru menggunakan kode HTML (Sandboxed)", included: true },
      { text: "Hapus watermark InstaWeb", included: true },
      { text: "Dukungan Email Prioritas", included: true },
      { text: "Kolaborasi multi-pengguna", included: false },
    ],
  },
  {
    key: "pro_plus",
    name: "Pro+",
    icon: FiAward,
    monthly: 450_000,
    yearly: 4_500_000,
    yearlyOriginal: 5_400_000,
    badge: "TERLENGKAP",
    badgeTone: "rose",
    highlight: false,
    glow: true,
    note: null,
    features: [
      { text: "Semua yang ada di Plus", included: true },
      { text: "Lacak siapa saja yang membuka web (via user agent)", included: true },
      { text: "Support iframe & Advanced Embeds", included: true },
      { text: "Multi user (hingga 5 user sekaligus)", included: true },
      { text: "Role-based Access Control (Editor/Viewer)", included: true },
      { text: "Domain Kustom", included: "soon" },
      { text: "Integrasi Webhook", included: "soon" },
      { text: "Manajer Akun Khusus", included: "soon" },
    ],
  },
];

/* ──────────────────────── animations ──────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ──────────────────────── component ──────────────────────── */

export default function PricingPage() {
  useDocumentTitle("Harga");

  const [isYearly, setIsYearly] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await subscriptionApi.get();
      setSubscription(response.data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleSubscribe = useCallback(
    async (plan, billingCycle) => {
      setSubscribing(plan);
      try {
        const response = await subscriptionApi.create({
          plan,
          billing_cycle: billingCycle,
        });
        const { snap_token, order_id } = response.data;

        window.snap.pay(snap_token, {
          onSuccess: async () => {
            toast.success("Memproses pembayaran...");
            try {
              await subscriptionApi.verify({ order_id });
              toast.success("Pembayaran berhasil! Selamat menikmati fitur premium.");
              fetchSubscription();
            } catch {
              toast.success("Pembayaran berhasil! Refresh halaman jika status belum berubah.");
              fetchSubscription();
            }
          },
          onPending: () => {
            toast("Menunggu pembayaran...", { icon: "⏳" });
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            // User closed the popup, check if payment went through
            toast("Popup ditutup. Mengecek status...", { icon: "ℹ️" });
            subscriptionApi.verify({ order_id }).then(() => {
              fetchSubscription();
            }).catch(() => {});
          },
        });
      } catch (err) {
        toast.error(apiError(err).message);
      } finally {
        setSubscribing(null);
      }
    },
    [fetchSubscription],
  );

  const currentPlan = subscription?.plan || "free";
  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-8">
      {/* ── active subscription banner ── */}
      {isActive && subscription && (
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border border-brand-aqua/20 bg-brand-aqua/[0.06] p-5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-aqua/[0.08] via-transparent to-brand-rose/[0.05]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-aqua/15">
                <FiShield className="h-5 w-5 text-brand-aqua" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Paket {subscription.plan === "pro_plus" ? "Pro+" : subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Aktif
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-600 dark:text-white/50">
                  <FiCalendar className="h-3 w-3" />
                  Berlaku hingga{" "}
                  {new Date(subscription.expires_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Badge tone="green">Aktif</Badge>
          </div>
        </motion.section>
      )}

      {/* ── header ── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <Badge tone="aqua" className="mx-auto">
          Harga
        </Badge>
        <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl">
          Pilih Paket yang Tepat
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-white/50">
          Mulai gratis, upgrade kapan saja. Temukan paket yang paling sesuai dengan
          kebutuhan website kamu.
        </p>

        {/* ── billing toggle ── */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium transition-colors ${!isYearly ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/40"}`}
          >
            Bulanan
          </span>

          <button
            type="button"
            onClick={() => setIsYearly((v) => !v)}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-aqua/30 px-1 ${
              isYearly
                ? "border-brand-aqua/40 bg-brand-aqua/20 justify-end"
                : "border-slate-300 dark:border-white/10 bg-slate-200 dark:bg-white/[0.08] justify-start"
            }`}
            aria-label="Toggle billing cycle"
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg ${
                isYearly
                  ? "bg-brand-aqua"
                  : "bg-white"
              }`}
            />
          </button>

          <span
            className={`text-sm font-medium transition-colors ${isYearly ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/40"}`}
          >
            Tahunan
          </span>

          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-brand-lime/15 px-2.5 py-1 text-xs font-semibold text-brand-lime"
            >
              Hemat ~17%
            </motion.span>
          )}
        </div>
      </motion.section>

      {/* ── plan cards ── */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[520px]" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid items-start gap-6 md:grid-cols-3"
        >
          {PLANS.map((plan) => {
            const isCurrent = isActive && currentPlan === plan.key;
            const isFree = plan.key === "free";
            const price = isYearly ? plan.yearly : plan.monthly;
            const originalPrice = isYearly ? plan.yearlyOriginal : null;
            const period = isYearly ? "/thn" : "/bln";
            const showDiscount =
              isYearly && plan.yearlyOriginal > 0 && plan.yearlyOriginal !== plan.yearly;

            return (
              <motion.div
                key={plan.key}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`relative ${plan.highlight ? "md:-mt-3 md:mb-[-12px]" : ""}`}
              >
                {/* glow border for Pro+ */}
                {plan.glow && (
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-brand-aqua via-brand-rose/70 to-brand-aqua opacity-60 blur-[2px]" />
                )}

                {/* highlight border for Plus */}
                {plan.highlight && !plan.glow && (
                  <div className="absolute -inset-[1px] rounded-2xl bg-brand-aqua/30" />
                )}

                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-6 backdrop-blur-lg ${
                    plan.glow
                      ? "border-brand-rose/20 dark:border-white/[0.12] bg-white dark:bg-ink-950/95 shadow-xl"
                      : plan.highlight
                        ? "border-brand-aqua/50 dark:border-brand-aqua/20 bg-white dark:bg-ink-950/90 shadow-lg"
                        : "border-slate-200 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03]"
                  }`}
                >
                  {/* badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          plan.glow
                            ? "bg-gradient-to-br from-brand-aqua/20 to-brand-rose/20"
                            : plan.highlight
                              ? "bg-brand-aqua/15"
                              : "bg-slate-100 dark:bg-white/[0.06]"
                        }`}
                      >
                        <plan.icon
                          className={`h-4.5 w-4.5 ${
                            plan.glow
                              ? "text-brand-rose"
                              : plan.highlight
                                ? "text-brand-aqua"
                                : "text-slate-500 dark:text-white/60"
                          }`}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                    {plan.badge && (
                      <Badge tone={plan.badgeTone}>{plan.badge}</Badge>
                    )}
                    {isCurrent && (
                      <Badge tone="green">Paket Saat Ini</Badge>
                    )}
                  </div>

                  {/* price */}
                  <div className="mb-6">
                    {showDiscount && (
                      <p className="mb-1 text-sm text-slate-400 dark:text-white/40 line-through">
                        Rp {fmt(originalPrice)}
                        {period}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Rp {fmt(price)}
                      </span>
                      {!isFree && (
                        <span className="text-sm text-slate-500 dark:text-white/40">{period}</span>
                      )}
                    </div>
                    {isFree && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-white/40">
                        Gratis selamanya
                      </p>
                    )}
                  </div>

                  {/* divider */}
                  <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />

                  {/* features */}
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2.5">
                        {feature.included === true ? (
                          <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-aqua" />
                        ) : feature.included === "soon" ? (
                          <span className="mt-0.5 shrink-0 text-sm">🔜</span>
                        ) : (
                          <FiX className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-white/25" />
                        )}
                        <span
                          className={`text-sm leading-snug ${
                            feature.included
                              ? "text-slate-700 dark:text-white/70"
                              : "text-slate-400 dark:text-white/30"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto space-y-2.5">
                    {isFree ? (
                      isCurrent || !isActive ? (
                        <Button
                          className="w-full"
                          variant="secondary"
                          disabled
                        >
                          Paket Saat Ini
                        </Button>
                      ) : null
                    ) : (
                      <Button
                        className={`w-full ${
                          plan.glow
                            ? "!bg-gradient-to-r !from-brand-aqua !to-brand-rose !text-ink-950 hover:!shadow-lg hover:!shadow-brand-rose/20 border-none"
                            : ""
                        }`}
                        variant={plan.highlight ? "primary" : "secondary"}
                        disabled={isCurrent || subscribing === plan.key}
                        onClick={() =>
                          handleSubscribe(
                            plan.key,
                            isYearly ? "yearly" : "monthly",
                          )
                        }
                      >
                        {subscribing === plan.key
                          ? "Memproses..."
                          : isCurrent
                            ? "Paket Saat Ini"
                            : `Langganan ${plan.name}`}
                      </Button>
                    )}

                    {!isFree && (
                      <p className="text-center text-[11px] text-white/30">
                        Ditagih {isYearly ? "Tahunan" : "Bulanan"}, batalkan
                        kapan saja
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── bottom guarantee ── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-lg text-center"
      >
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5">
          <p className="text-sm leading-relaxed text-white/40">
            Semua transaksi diproses secara aman melalui{" "}
            <span className="font-medium text-white/60">Midtrans</span>.
            Kamu bisa membatalkan langganan kapan saja dari halaman profil.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
