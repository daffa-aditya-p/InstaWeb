import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiClock,
  FiExternalLink,
  FiInbox,
  FiMail,
  FiUser,
  FiX,
} from "react-icons/fi";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { invitationApi, apiError } from "../services/api";

/* ── helpers ─────────────────────────────────────────────────────── */

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const statusConfig = {
  pending: { label: "Menunggu", tone: "amber", icon: FiClock },
  accepted: { label: "Diterima", tone: "green", icon: FiCheck },
  declined: { label: "Ditolak", tone: "rose", icon: FiX },
};

/* ── animation variants ──────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

/* ── loading skeleton ────────────────────────────────────────────── */

function InboxSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-panel rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-4 h-10 w-64" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── invitation card ─────────────────────────────────────────────── */

function InvitationCard({ invitation, onAccept, onDecline, processingId }) {
  const { sender, page, message, status, created_at, id } = invitation;
  const cfg = statusConfig[status] || statusConfig.pending;
  const StatusIcon = cfg.icon;
  const isProcessing = processingId === id;

  return (
    <motion.article
      variants={cardVariants}
      layout
      className="glass-panel group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-white/[0.15] sm:p-6"
    >
      {/* subtle top-left gradient glow */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-brand-aqua/[0.04] blur-3xl" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {/* avatar */}
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-brand-aqua/20 to-brand-aqua/5 text-lg font-bold text-brand-aqua">
          {sender?.name?.charAt(0)?.toUpperCase() || <FiUser />}
        </div>

        {/* content */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* sender info + status badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white">{sender?.name}</h3>
              <p className="text-xs text-white/[0.45]">{sender?.email}</p>
            </div>
            <Badge tone={cfg.tone} className="gap-1.5">
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </Badge>
          </div>

          {/* page title */}
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2">
            <FiMail className="h-4 w-4 shrink-0 text-brand-aqua/70" />
            <span className="truncate text-sm font-medium text-white/80">
              Mengundang Anda berkolaborasi di:{" "}
              <span className="text-white">{page?.title}</span>
            </span>
          </div>

          {/* optional message */}
          {message && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <p className="text-sm italic leading-relaxed text-white/[0.55]">
                &ldquo;{message}&rdquo;
              </p>
            </div>
          )}

          {/* timestamp */}
          <p className="flex items-center gap-1.5 text-xs text-white/[0.35]">
            <FiClock className="h-3 w-3" />
            {formatDate(created_at)}
          </p>

          {/* actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  icon={FiCheck}
                  disabled={isProcessing}
                  onClick={() => onAccept(id)}
                  className="bg-brand-aqua text-ink-950 hover:bg-brand-aqua/80"
                >
                  {isProcessing ? "Memproses…" : "Terima"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={FiX}
                  disabled={isProcessing}
                  onClick={() => onDecline(id)}
                  className="text-white/40 hover:text-brand-rose"
                >
                  Tolak
                </Button>
              </>
            )}
            {status === "accepted" && page?.slug && (
              <Button
                as={Link}
                to={`/pages/${page.slug}/builder`}
                size="sm"
                variant="primary"
                icon={FiExternalLink}
              >
                Buka Editor
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ── main page ───────────────────────────────────────────────────── */

export default function InboxPage() {
  useDocumentTitle("Kotak Masuk");

  const [invitations, setInvitations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadInbox = useCallback(async () => {
    try {
      const res = await invitationApi.inbox();
      setInvitations(res.data.invitations);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      toast.error(apiError(error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const handleAccept = useCallback(
    async (id) => {
      setProcessingId(id);
      try {
        await invitationApi.accept(id);
        toast.success("Undangan diterima!");
        await loadInbox();
      } catch (error) {
        toast.error(apiError(error).message);
      } finally {
        setProcessingId(null);
      }
    },
    [loadInbox],
  );

  const handleDecline = useCallback(
    async (id) => {
      setProcessingId(id);
      try {
        await invitationApi.decline(id);
        toast.success("Undangan ditolak");
        await loadInbox();
      } catch (error) {
        toast.error(apiError(error).message);
      } finally {
        setProcessingId(null);
      }
    },
    [loadInbox],
  );

  return (
    <div className="space-y-6">
      {/* ── header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3">
          <Badge tone="aqua">Kotak Masuk</Badge>
          {unreadCount > 0 && (
            <Badge tone="rose" className="tabular-nums">
              {unreadCount} baru
            </Badge>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Undangan Kolaborasi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/[0.55]">
          Lihat dan tanggapi undangan kolaborasi dari pengguna lain.
        </p>
      </div>

      {/* ── content ────────────────────────────────────────────── */}
      {loading ? (
        <InboxSkeleton />
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={FiInbox}
          title="Belum ada undangan"
          description="Undangan kolaborasi dari pengguna lain akan muncul di sini"
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {invitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                onAccept={handleAccept}
                onDecline={handleDecline}
                processingId={processingId}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
