import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowUp,
  FiCopy,
  FiDownload,
  FiEye,
  FiExternalLink,
  FiGlobe,
  FiImage,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiSliders,
  FiEdit,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { WebsiteRenderer } from "../components/sections/SectionRenderer";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useShortcut } from "../hooks/useShortcut";
import { apiError, pagesApi, templatesApi, collaboratorApi, invitationApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { fieldSummary } from "../utils/fields";

const CATEGORIES = [
  { id: "all", name: "All Templates" },
  { id: "nav", name: "Navigation" },
  { id: "hero", name: "Hero & Openers" },
  { id: "features", name: "Features & Grids" },
  { id: "clients", name: "Client Love" },
  { id: "forms", name: "Forms & Contact" },
  { id: "advanced", name: "Advanced" },
];

const getTemplateCategory = (slug) => {
  if (slug === "navbar" || slug === "footer") return "nav";
  if (
    slug === "hero" ||
    slug === "hero_variant" ||
    slug === "hero_glow" ||
    slug === "callout_box" ||
    slug === "about" ||
    slug === "product_showcase" ||
    slug === "app_download" ||
    slug === "cta"
  )
    return "hero";
  if (
    slug === "services" ||
    slug === "feature_grid" ||
    slug === "feature_split" ||
    slug === "stats" ||
    slug === "timeline" ||
    slug === "process_steps" ||
    slug === "bento_grid" ||
    slug === "portfolio" ||
    slug === "gallery" ||
    slug === "comparison_table" ||
    slug === "blog_preview"
  )
    return "features";
  if (
    slug === "logo_cloud" ||
    slug === "logo_marquee" ||
    slug === "testimonials" ||
    slug === "team" ||
    slug === "case_studies"
  )
    return "clients";
  if (
    slug === "pricing" ||
    slug === "faq" ||
    slug === "contact" ||
    slug === "contact_variant" ||
    slug === "newsletter"
  )
    return "forms";
  if (slug === "custom_html" || slug === "iframe_embed")
    return "advanced";
  return "features";
};

function TemplateMockup({ slug }) {
  if (slug === "navbar") {
    return (
      <div className="flex h-16 w-full flex-col justify-between rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="flex items-center justify-between border-b border-white/5 pb-1">
          <div className="h-3 w-10 rounded bg-brand-aqua/40" />
          <div className="flex gap-1">
            <div className="h-1 w-4 rounded-full bg-white/10" />
            <div className="h-1 w-4 rounded-full bg-white/10" />
            <div className="h-1 w-4 rounded-full bg-white/10" />
          </div>
          <div className="h-3 w-8 rounded-full bg-brand-aqua/85 shadow-[0_0_8px_rgba(34,211,238,0.25)]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[9px] text-white/35 font-medium tracking-wide">Navigation Bar</div>
        </div>
      </div>
    );
  }

  if (slug === "footer") {
    return (
      <div className="flex h-16 w-full flex-col justify-end rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[9px] text-white/35 font-medium tracking-wide">Footer Area</div>
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-1">
          <div className="h-1 w-12 rounded bg-white/15" />
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
    );
  }

  if (slug === "hero") {
    return (
      <div className="flex h-16 w-full items-center justify-between gap-2 rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="flex-1 space-y-1">
          <div className="h-1.5 w-6 rounded bg-brand-aqua/40" />
          <div className="h-3 w-16 rounded bg-white/20" />
          <div className="h-1 w-20 rounded bg-white/10" />
          <div className="flex gap-1 pt-0.5">
            <div className="h-3 w-8 rounded bg-brand-aqua/80" />
          </div>
        </div>
        <div className="h-12 w-16 rounded bg-white/10 flex items-center justify-center border border-white/5">
          <FiImage className="h-3.5 w-3.5 text-white/30" />
        </div>
      </div>
    );
  }

  if (slug === "hero_variant") {
    return (
      <div className="flex h-16 w-full flex-col justify-center items-center gap-1 rounded bg-white/[0.03] p-2 border border-white/5 text-center">
        <div className="h-2 w-16 rounded-full bg-brand-aqua/20 border border-brand-aqua/30 text-[5px] text-brand-aqua" />
        <div className="h-3.5 w-24 rounded bg-white/20" />
        <div className="h-1 w-28 rounded bg-white/10" />
        <div className="flex gap-1.5 mt-0.5">
          <div className="h-3 w-8 rounded bg-brand-aqua/80 shadow-[0_0_8px_rgba(34,211,238,0.25)]" />
          <div className="h-3 w-8 rounded border border-white/25 bg-white/5" />
        </div>
      </div>
    );
  }

  if (slug === "about") {
    return (
      <div className="flex h-16 w-full items-center gap-2 rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="flex-1 space-y-1">
          <div className="h-2.5 w-10 rounded bg-brand-aqua/30" />
          <div className="h-3.5 w-16 rounded bg-white/20" />
          <div className="h-1.5 w-20 rounded bg-white/10" />
        </div>
        <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center border border-white/5">
          <FiImage className="h-3 w-3 text-white/30" />
        </div>
      </div>
    );
  }

  if (slug === "product_showcase") {
    return (
      <div className="flex h-16 w-full items-center gap-2 rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center border border-white/5">
          <FiImage className="h-3.5 w-3.5 text-white/30" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-3 w-16 rounded bg-white/20" />
          <div className="space-y-0.5">
            <div className="h-1 w-16 rounded bg-white/10" />
            <div className="h-1 w-14 rounded bg-white/10" />
            <div className="h-1 w-12 rounded bg-brand-aqua/30" />
          </div>
        </div>
      </div>
    );
  }

  if (slug === "app_download") {
    return (
      <div className="flex h-16 w-full items-center justify-around gap-2 rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="flex-1 space-y-1">
          <div className="h-3 w-16 rounded bg-white/20" />
          <div className="h-1 w-20 rounded bg-white/10" />
          <div className="flex gap-0.5 pt-0.5">
            <div className="h-2.5 w-7 rounded bg-white/20 border border-white/10" />
            <div className="h-2.5 w-7 rounded bg-white/20 border border-white/10" />
          </div>
        </div>
        <div className="h-12 w-6 rounded-md bg-white/10 border border-white/10 flex flex-col justify-between p-0.5">
          <div className="h-1.5 w-full rounded bg-white/20" />
          <div className="flex-1 flex items-center justify-center">
            <div className="h-4 w-3 rounded-sm bg-brand-aqua/20" />
          </div>
        </div>
      </div>
    );
  }

  if (slug === "services" || slug === "feature_grid") {
    const items = slug === "services" ? [1, 2, 3] : [1, 2, 3, 4];
    return (
      <div className={`grid ${slug === "services" ? "grid-cols-3" : "grid-cols-4"} gap-1 rounded bg-white/[0.03] p-1.5 h-16 items-center border border-white/5`}>
        {items.map((i) => (
          <div key={i} className="flex flex-col items-center space-y-0.5 rounded bg-white/[0.02] p-0.5 border border-white/5">
            <div className="h-3 w-3 rounded-full bg-brand-aqua/30 flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-brand-aqua" />
            </div>
            <div className="h-1 w-6 rounded-full bg-white/20" />
            <div className="h-0.5 w-4 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "stats") {
    return (
      <div className="grid grid-cols-4 gap-0.5 rounded bg-white/[0.03] p-1.5 h-16 items-center border border-white/5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-0.5">
            <div className="h-3 w-7 rounded bg-brand-aqua/30 text-center font-bold text-[6px] text-brand-aqua flex items-center justify-center">99%</div>
            <div className="h-0.5 w-5 rounded-full bg-white/15" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "logo_cloud") {
    return (
      <div className="flex flex-col justify-center gap-1.5 rounded bg-white/[0.03] p-2 h-16 border border-white/5">
        <div className="h-1 w-10 rounded-full bg-white/20 mx-auto" />
        <div className="flex items-center justify-around gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-2 w-5 rounded bg-white/10 border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (slug === "testimonials") {
    return (
      <div className="grid grid-cols-2 gap-1 rounded bg-white/[0.03] p-1.5 h-16 items-center border border-white/5">
        {[1, 2].map((i) => (
          <div key={i} className="rounded bg-white/[0.04] p-1 space-y-0.5 border border-white/5">
            <div className="h-0.5 w-12 rounded-full bg-white/20" />
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-brand-aqua/30 border border-brand-aqua/40" />
              <div className="h-0.5 w-6 rounded-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (slug === "pricing") {
    return (
      <div className="grid grid-cols-3 gap-0.5 rounded bg-white/[0.03] p-1 h-16 items-end border border-white/5">
        <div className="rounded bg-white/[0.02] p-0.5 space-y-0.5 border border-white/5">
          <div className="h-1 w-4 rounded-full bg-white/20" />
          <div className="h-1.5 w-3 rounded bg-white/15" />
          <div className="h-1.5 w-full rounded bg-brand-aqua/40" />
        </div>
        <div className="rounded bg-brand-aqua/10 p-0.5 space-y-0.5 border border-brand-aqua/35 scale-105 shadow-[0_0_8px_rgba(34,211,238,0.15)]">
          <div className="h-1 w-4 rounded-full bg-brand-aqua/65" />
          <div className="h-1.5 w-3 rounded bg-white/25" />
          <div className="h-1.5 w-full rounded bg-brand-aqua" />
        </div>
        <div className="rounded bg-white/[0.02] p-0.5 space-y-0.5 border border-white/5">
          <div className="h-1 w-4 rounded-full bg-white/20" />
          <div className="h-1.5 w-3 rounded bg-white/15" />
          <div className="h-1.5 w-full rounded bg-brand-aqua/40" />
        </div>
      </div>
    );
  }

  if (slug === "faq") {
    return (
      <div className="flex flex-col justify-center gap-1 rounded bg-white/[0.03] p-1.5 h-16 border border-white/5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-0.5 last:border-0">
            <div className="h-0.5 w-14 rounded bg-white/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-aqua/40 flex items-center justify-center">
              <span className="text-[5px] text-brand-aqua font-bold">+</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (slug === "portfolio" || slug === "gallery") {
    return (
      <div className="grid grid-cols-3 gap-0.5 rounded bg-white/[0.03] p-1 h-16 border border-white/5">
        <div className="rounded bg-white/10 flex items-center justify-center border border-white/5 relative">
          <FiImage className="h-1.5 w-1.5 text-white/20" />
        </div>
        <div className="rounded bg-white/15 flex items-center justify-center border border-white/5 relative">
          <FiImage className="h-1.5 w-1.5 text-white/20" />
        </div>
        <div className="rounded bg-white/10 flex items-center justify-center border border-white/5 relative">
          <FiImage className="h-1.5 w-1.5 text-white/20" />
        </div>
      </div>
    );
  }

  if (slug === "team") {
    return (
      <div className="grid grid-cols-3 gap-0.5 rounded bg-white/[0.03] p-1 h-16 items-center border border-white/5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-0.5">
            <div className="h-5 w-5 rounded-full bg-white/15 flex items-center justify-center border border-white/5">
              <div className="h-1 w-1 rounded-full bg-white/30" />
            </div>
            <div className="h-0.5 w-4 rounded bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "timeline") {
    return (
      <div className="flex items-center justify-center gap-1 rounded bg-white/[0.03] p-1.5 h-16 border border-white/5 relative">
        <div className="absolute left-1.5 right-1.5 h-0.5 bg-white/10 top-1/2 -translate-y-1/2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-0.5 relative z-10">
            <div className="h-2 w-2 rounded-full bg-brand-aqua border border-slate-900" />
            <div className="h-0.5 w-4 rounded bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "process_steps") {
    return (
      <div className="grid grid-cols-3 gap-0.5 rounded bg-white/[0.03] p-1 h-16 items-center border border-white/5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-white/[0.04] p-0.5 space-y-0.5 border border-white/5">
            <div className="text-[6px] font-bold text-brand-aqua/85">0{i}</div>
            <div className="h-0.5 w-6 rounded bg-white/25" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "newsletter") {
    return (
      <div className="flex flex-col justify-center items-center gap-0.5 rounded bg-white/[0.03] p-1.5 h-16 border border-white/5">
        <div className="h-1 w-8 rounded bg-white/25" />
        <div className="h-0.5 w-12 rounded bg-white/15" />
        <div className="flex gap-0.5 w-full mt-0.5 px-1 justify-center">
          <div className="h-2.5 w-12 rounded border border-white/10 bg-white/[0.02]" />
          <div className="h-2.5 w-6 rounded bg-brand-aqua" />
        </div>
      </div>
    );
  }

  if (slug === "bento_grid") {
    return (
      <div className="grid grid-cols-3 gap-0.5 rounded bg-white/[0.03] p-1 h-16 border border-white/5">
        <div className="col-span-2 rounded bg-white/10 flex items-center justify-center border border-white/5 relative">
          <FiImage className="h-1.5 w-1.5 text-white/20" />
        </div>
        <div className="rounded bg-white/15 flex items-center justify-center border border-white/5 relative">
          <FiImage className="h-1.5 w-1.5 text-white/20" />
        </div>
      </div>
    );
  }

  if (slug === "cta") {
    return (
      <div className="flex h-16 w-full flex-col justify-center items-center gap-1 rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="h-2 w-20 rounded bg-white/30" />
        <div className="h-1 w-24 rounded bg-white/15" />
        <div className="flex gap-1 mt-1">
          <div className="h-3 w-8 rounded bg-brand-aqua/80 shadow-[0_0_8px_rgba(34,211,238,0.2)]" />
          <div className="h-3 w-8 rounded border border-white/20" />
        </div>
      </div>
    );
  }

  if (slug === "blog_preview") {
    return (
      <div className="grid grid-cols-2 gap-1.5 rounded bg-white/[0.03] p-1.5 h-16 items-center border border-white/5">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col rounded bg-white/[0.02] border border-white/5 p-0.5 space-y-0.5">
            <div className="h-6 w-full rounded bg-white/10 flex items-center justify-center">
              <FiImage className="h-1.5 w-1.5 text-white/20" />
            </div>
            <div className="h-1 w-12 rounded bg-white/20" />
            <div className="h-0.5 w-14 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "comparison_table") {
    return (
      <div className="flex h-16 w-full flex-col justify-center gap-0.5 rounded bg-white/[0.03] p-1.5 border border-white/5">
        <div className="grid grid-cols-3 gap-0.5 border-b border-white/10 pb-0.5">
          <div className="h-1 w-6 rounded bg-white/20" />
          <div className="h-1 w-6 rounded bg-brand-aqua/30" />
          <div className="h-1 w-6 rounded bg-white/10" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-3 gap-0.5 items-center">
            <div className="h-0.5 w-8 rounded bg-white/15" />
            <div className="h-1.5 w-1.5 rounded-full bg-brand-aqua/60 justify-self-center" />
            <div className="h-0.5 w-2 rounded bg-white/25 justify-self-center" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "case_studies") {
    return (
      <div className="grid grid-cols-2 gap-1 rounded bg-white/[0.03] p-1.5 h-16 items-center border border-white/5">
        {[1, 2].map((i) => (
          <div key={i} className="rounded bg-white/[0.04] p-1 space-y-1 border border-white/5">
            <div className="text-[6px] font-bold text-brand-aqua/80">312% Jump</div>
            <div className="h-1 w-10 rounded bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  if (slug === "hero_glow") {
    return (
      <div className="flex h-16 w-full flex-col justify-center items-center gap-0.5 rounded bg-white/[0.03] p-1 border border-white/5 text-center relative overflow-hidden">
        <div className="h-1.5 w-10 rounded-full bg-brand-aqua/20 border border-brand-aqua/30 text-[4px] text-brand-aqua scale-90" />
        <div className="h-2.5 w-20 rounded bg-white/20" />
        <div className="h-1 w-24 rounded bg-white/10" />
        <div className="flex gap-1 my-0.5">
          <div className="h-2 w-6 rounded bg-brand-aqua/80" />
          <div className="h-2 w-6 rounded border border-white/25 bg-white/5" />
        </div>
        <div className="w-24 h-4 rounded-t border border-t-brand-aqua/60 border-x-brand-aqua/30 border-b-0 bg-slate-900/90 relative mt-0.5 shadow-[0_-2px_8px_rgba(34,211,238,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-aqua/5 to-brand-aqua/20" />
          <div className="h-1 w-12 rounded bg-white/20 mx-auto mt-1" />
        </div>
      </div>
    );
  }

  if (slug === "logo_marquee") {
    return (
      <div className="flex flex-col justify-center gap-1 rounded bg-white/[0.03] p-1.5 h-16 border border-white/5 relative overflow-hidden">
        <div className="h-1 w-10 rounded-full bg-white/15 mx-auto" />
        <div className="flex items-center gap-1.5 justify-around w-[120%] -ml-[10%] opacity-85">
          {["A", "B", "C", "D", "E"].map((letter, i) => (
            <span key={i} className="text-[6px] text-white/35 font-bold tracking-wider">
              {letter}cme
            </span>
          ))}
        </div>
        <div className="absolute bottom-1 right-2 text-[5px] text-brand-aqua font-mono tracking-tighter opacity-80 flex items-center gap-0.5">
          <span>◀</span><span>▶</span>
        </div>
      </div>
    );
  }

  if (slug === "callout_box") {
    return (
      <div className="flex h-16 w-full items-center gap-2 rounded bg-white/[0.03] p-2 border border-white/5">
        <div className="flex-1 rounded border border-brand-aqua/30 bg-brand-aqua/[0.03] p-1 flex items-center gap-1.5 h-12 shadow-[0_0_8px_rgba(34,211,238,0.1)]">
          <div className="h-5 w-5 rounded bg-brand-aqua/20 flex items-center justify-center border border-brand-aqua/30">
            <span className="text-[7px] text-brand-aqua font-bold">★</span>
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="h-2 w-16 rounded bg-white/20" />
            <div className="h-1 w-20 rounded bg-white/10" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="h-2.5 w-8 rounded bg-brand-aqua text-[4px] font-bold text-center text-slate-900 flex items-center justify-center">Go</div>
          </div>
        </div>
      </div>
    );
  }

  if (slug === "feature_split") {
    return (
      <div className="flex flex-col justify-between gap-1 rounded bg-white/[0.03] p-1.5 h-16 border border-white/5">
        <div className="flex items-center gap-1.5 justify-between">
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-10 rounded bg-white/20" />
            <div className="h-0.5 w-12 rounded bg-white/10" />
          </div>
          <div className="h-5 w-7 rounded bg-white/10 flex items-center justify-center border border-white/5">
            <FiImage className="h-1.5 w-1.5 text-white/20" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 justify-between">
          <div className="h-5 w-7 rounded bg-white/10 flex items-center justify-center border border-white/5">
            <FiImage className="h-1.5 w-1.5 text-white/20" />
          </div>
          <div className="flex-1 space-y-0.5 text-right flex flex-col items-end">
            <div className="h-1.5 w-10 rounded bg-white/20" />
            <div className="h-0.5 w-12 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (slug === "contact" || slug === "contact_variant") {
    return (
      <div className="flex h-16 w-full items-center gap-1.5 rounded bg-white/[0.03] p-1.5 border border-white/5">
        <div className="flex-1 space-y-1">
          <div className="h-2 w-12 rounded bg-white/20" />
          <div className="h-1 w-8 rounded bg-white/10" />
          <div className="space-y-0.5">
            <div className="h-2 w-full rounded border border-white/10 bg-white/[0.02]" />
            <div className="h-2.5 w-full rounded bg-brand-aqua/80" />
          </div>
        </div>
        <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center border border-white/5">
          <div className="h-2 w-2 rounded-full bg-brand-aqua/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-16 w-full flex-col justify-between rounded bg-white/[0.03] p-1.5 border border-white/5">
      <div className="flex items-start gap-0.5">
        <div className="h-1 w-6 rounded bg-white/25" />
        <div className="h-1 w-4 rounded bg-white/15" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-1 w-8 rounded-full bg-brand-aqua/40" />
        <div className="h-3 w-3 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const autosaveTimer = useRef(null);
  const [page, setPage] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [draftValues, setDraftValues] = useState({});
  const [autosaveState, setAutosaveState] = useState("Saved");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [seoForm, setSeoForm] = useState({ meta_title: "", meta_description: "", og_image: "" });
  const [savingSeo, setSavingSeo] = useState(false);
  const subscription = useAuthStore((s) => s.subscription);
  const fetchSub = useAuthStore((s) => s.fetchSubscription);
  const userPlan = subscription?.plan || "free";

  // Always fetch fresh subscription status on mount
  useEffect(() => { fetchSub(); }, [fetchSub]);

  const categoryCounts = useMemo(() => {
    const counts = { all: templates.length };
    CATEGORIES.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = templates.filter(tpl => getTemplateCategory(tpl.slug) === cat.id).length;
      }
    });
    return counts;
  }, [templates]);

  useDocumentTitle("Page Builder");

  const selectedSection = useMemo(
    () => page?.sections?.find((section) => section.id === selectedSectionId),
    [page, selectedSectionId],
  );

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return templates;
    return templates.filter((tpl) => getTemplateCategory(tpl.slug) === selectedCategory);
  }, [templates, selectedCategory]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pageResponse, templateResponse] = await Promise.all([
        pagesApi.get(slug),
        templatesApi.all(),
      ]);
      const loadedPage = pageResponse.data;
      setPage(loadedPage);
      setTemplates(templateResponse.data.templates);
      setSelectedSectionId(loadedPage.sections?.[0]?.id || null);
      setTemplateId(templateResponse.data.templates?.[0]?.id || "");
    } catch (error) {
      toast.error(apiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedSection) {
      setDraftValues({});
      return;
    }
    const values = {};
    selectedSection.fields.forEach((field) => {
      values[field.id] = field.value || "";
    });
    setDraftValues(values);
    setActiveTab("content");
  }, [selectedSection?.id]);

  const closePanels = useCallback(() => {
    setAddOpen(false);
    setRemoveTarget(null);
  }, []);

  useShortcut(
    useCallback(
      (event) => {
        if (event.altKey && event.key.toLowerCase() === "s") {
          event.preventDefault();
          setAddOpen(true);
        }
        if (event.key === "Escape") {
          closePanels();
        }
      },
      [closePanels],
    ),
  );

  const addSection = async () => {
    if (!templateId) return;
    try {
      const response = await pagesApi.addSection(slug, {
        template_id: Number(templateId),
        position: (page?.sections?.length || 0) + 1,
      });
      const section = response.data;
      setPage((current) => ({
        ...current,
        sections: [...(current.sections || []), section],
      }));
      setSelectedSectionId(section.id);
      setAddOpen(false);
      toast.success("Section added");
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const saveFields = useCallback(
    async (sectionId = selectedSectionId, values = draftValues, silent = false) => {
      if (!sectionId) return;
      setAutosaveState("Saving...");
      try {
        const fields = Object.entries(values).map(([fieldId, value]) => ({
          field_id: Number(fieldId),
          value,
        }));
        await pagesApi.updateSectionFields(slug, sectionId, fields);
        setAutosaveState("Saved");
        if (!silent) toast.success("Section saved");
      } catch (error) {
        setAutosaveState("Unsaved");
        toast.error(apiError(error).message);
      }
    },
    [draftValues, selectedSectionId, slug],
  );

  const changeField = (fieldId, value) => {
    const nextValues = { ...draftValues, [fieldId]: value };
    setDraftValues(nextValues);
    setAutosaveState("Unsaved");
    setPage((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === selectedSectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, value } : field,
              ),
            }
          : section,
      ),
    }));
    window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      saveFields(selectedSectionId, nextValues, true);
    }, 700);
  };

  const reorder = async (sectionId, direction) => {
    const sections = [...page.sections].sort((a, b) => a.position - b.position);
    const index = sections.findIndex((section) => section.id === sectionId);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    const [moved] = sections.splice(index, 1);
    sections.splice(nextIndex, 0, moved);
    const reordered = sections.map((section, position) => ({
      ...section,
      position: position + 1,
    }));
    setPage((current) => ({ ...current, sections: reordered }));
    try {
      await pagesApi.reorderSections(slug, reordered.map((section) => section.id));
      toast.success("Section order saved");
    } catch (error) {
      toast.error(apiError(error).message);
      load();
    }
  };

  const removeSection = async () => {
    if (!removeTarget) return;
    try {
      await pagesApi.removeSection(slug, removeTarget.id);
      const remaining = page.sections.filter((section) => section.id !== removeTarget.id);
      setPage((current) => ({ ...current, sections: remaining }));
      setSelectedSectionId(remaining[0]?.id || null);
      setRemoveTarget(null);
      toast.success("Section removed");
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const togglePublish = async () => {
    try {
      const response = await pagesApi.publish(slug, !page.is_published);
      setPage((current) => ({ ...current, ...response.data }));
      toast.success(page.is_published ? "Page unpublished" : "Page published");
    } catch (error) {
      toast.error(apiError(error).message);
    }
  };

  const fetchCollaborators = useCallback(async () => {
    if (userPlan !== "pro_plus" || !page?.slug) return;
    try {
      const res = await collaboratorApi.list(page.slug);
      setCollaborators(res.data?.collaborators || []);
    } catch { /* ignore */ }
  }, [userPlan, page?.slug]);

  useEffect(() => { fetchCollaborators(); }, [fetchCollaborators]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await invitationApi.send(page.slug, { email: inviteEmail.trim(), message: inviteMessage.trim() });
      toast.success(`Undangan terkirim ke ${inviteEmail}`);
      setInviteEmail("");
      setInviteMessage("");
      setShowInviteModal(false);
      fetchCollaborators();
    } catch (err) {
      toast.error(apiError(err).message);
    } finally {
      setInviting(false);
    }
  };

  const openSeoModal = () => {
    setSeoForm({
      meta_title: page?.meta_title || "",
      meta_description: page?.meta_description || "",
      og_image: page?.og_image || "",
    });
    setShowSeoModal(true);
  };

  const saveSeo = async () => {
    setSavingSeo(true);
    try {
      await pagesApi.updateSeo(slug, seoForm);
      setPage((current) => ({ ...current, ...seoForm }));
      toast.success("SEO settings saved");
      setShowSeoModal(false);
    } catch (error) {
      toast.error(apiError(error).message);
    } finally {
      setSavingSeo(false);
    }
  };

  const exportToHtml = () => {
    const sections = [...(page.sections || [])].sort((a, b) => a.position - b.position);
    const sectionHtml = sections.map((section) => {
      const fieldsHtml = section.fields
        .filter((f) => !f.slug.startsWith("style_"))
        .map((f) => {
          if (f.type === "image" && f.value) {
            return `<img src="${f.value}" alt="${f.name}" style="max-width:100%;height:auto;" />`;
          }
          return `<p>${f.value || ""}</p>`;
        })
        .join("\n        ");
      return `    <section style="padding:48px 24px;">
      <h2 style="margin-bottom:16px;">${section.template?.name || "Section"}</h2>
      ${fieldsHtml}
    </section>`;
    }).join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title || "Exported Page"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; }
    section { border-bottom: 1px solid #e5e5e5; }
    img { border-radius: 8px; margin-top: 8px; }
    h2 { font-size: 1.5rem; }
    p { margin-top: 8px; line-height: 1.6; }
  </style>
</head>
<body>
${sectionHtml}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${page.slug || "page"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Skeleton className="h-[760px]" />
        <Skeleton className="h-[760px]" />
      </div>
    );
  }

  if (!page) {
    return (
      <EmptyState
        title="Page not found"
        description="The requested page is unavailable or you do not have access."
      />
    );
  }

  const orderedSections = [...(page.sections || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 88px)" }}>
      {/* ── Top bar ── */}
      <div className="glass-panel flex flex-col justify-between gap-3 p-3 sm:p-4 lg:flex-row lg:items-center shrink-0 rounded-lg mx-0">
        <div className="flex items-center gap-3">
          <Button as={Link} to="/pages" icon={FiArrowLeft} size="icon" aria-label="Back to pages" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-white">{page.title}</h1>
              <Badge tone={page.is_published ? "green" : "neutral"}>
                {page.is_published ? "Published" : "Draft"}
              </Badge>
              <Badge tone={autosaveState === "Saved" ? "aqua" : "amber"}>{autosaveState}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-white/[0.45]">/{page.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={FiEye} onClick={() => navigate(`/pages/${page.slug}/preview`)}>
            Preview
          </Button>
          <Button
              variant="secondary"
              size="sm"
              icon={FiUsers}
              onClick={() => {
                if (userPlan === "pro_plus") {
                  setShowInviteModal(true);
                } else {
                  toast("Fitur Invite hanya untuk paket Pro+. Upgrade di halaman Pricing!", { icon: "👑" });
                }
              }}
            >
              <span className="hidden sm:inline">Invite</span>
            </Button>
          <Button icon={FiSearch} onClick={openSeoModal}>
            SEO
          </Button>
          <Button icon={FiDownload} onClick={exportToHtml}>
            Export
          </Button>
          {page.is_published ? (
            <>
              <Button
                as="a"
                href={`/site/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                icon={FiExternalLink}
                variant="primary"
              >
                Open Live Site
              </Button>
              <Button
                icon={FiGlobe}
                variant="secondary"
                onClick={togglePublish}
              >
                Unpublish
              </Button>
            </>
          ) : (
            <Button
              icon={FiGlobe}
              variant="primary"
              onClick={togglePublish}
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* ── Main split panel (fills remaining viewport) ── */}
      <div className="flex-1 min-h-0 mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[360px_1fr]">
        {/* ── Left sidebar ── */}
        <aside className="glass-panel rounded-lg flex flex-col min-h-0 overflow-hidden lg:max-h-full max-h-[70vh]">
          {/* Add Section button */}
          <div className="border-b border-white/10 p-3 shrink-0">
            <Button className="w-full" icon={FiPlus} variant="primary" onClick={() => setAddOpen(true)}>
              Add Section
            </Button>
          </div>

          {/* Section list - scrollable, max 40% of sidebar */}
          <div className="overflow-y-auto p-3 shrink-0" style={{ maxHeight: "35%" }}>
            <div className="space-y-2">
              {orderedSections.map((section, index) => (
                <motion.div layout key={section.id}>
                  <button
                    className={`w-full rounded-lg border p-2.5 text-left transition ${
                      selectedSectionId === section.id
                        ? "border-brand-aqua/55 bg-brand-aqua/10"
                        : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{section.template.name}</div>
                        <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-white/[0.52]">
                          {fieldSummary(section)}
                        </p>
                      </div>
                      <span className="text-xs text-white/[0.38] shrink-0">#{index + 1}</span>
                    </div>
                  </button>
                  <div className="mt-1 flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reorder(section.id, -1)}
                      aria-label="Move section up"
                    >
                      <FiArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reorder(section.id, 1)}
                      aria-label="Move section down"
                    >
                      <FiArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await pagesApi.duplicateSection(slug, section.id);
                          await load();
                          toast.success("Section duplicated");
                        } catch (error) {
                          toast.error(apiError(error).message);
                        }
                      }}
                      aria-label="Duplicate section"
                    >
                      <FiCopy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRemoveTarget(section)}
                      aria-label="Remove section"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Field editor panel ── fills remaining space, scrolls independently */}
          <div className="flex-1 min-h-0 border-t border-white/10 flex flex-col">
            {selectedSection ? (
              <>
                {/* Editor header - fixed */}
                <div className="p-3 pb-2 shrink-0">
                  <h2 className="text-sm font-semibold text-white">Field editor</h2>
                  <p className="mt-0.5 text-xs text-white/[0.5]">{selectedSection.template.name}</p>
                </div>

                {/* Tab switcher - fixed */}
                {selectedSection.fields.filter(field => field.slug.startsWith("style_")).length > 0 && (
                  <div className="px-3 pb-2 shrink-0">
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.04] p-1 border border-white/5">
                      <button
                        type="button"
                        className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                          activeTab === "content"
                            ? "bg-brand-aqua/10 text-brand-aqua border border-brand-aqua/20 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-semibold"
                            : "text-white/60 hover:text-white border border-transparent"
                        }`}
                        onClick={() => setActiveTab("content")}
                      >
                        <FiEdit className="h-3.5 w-3.5" />
                        <span>Content</span>
                      </button>
                      <button
                        type="button"
                        className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                          activeTab === "style"
                            ? "bg-brand-aqua/10 text-brand-aqua border border-brand-aqua/20 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-semibold"
                            : "text-white/60 hover:text-white border border-transparent"
                        }`}
                        onClick={() => setActiveTab("style")}
                      >
                        <FiSliders className="h-3.5 w-3.5" />
                        <span>Styles</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Scrollable field area */}
                <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2">
                  {activeTab === "content" ? (
                    <div className="space-y-3">
                      {selectedSection.fields
                        .filter((field) => !field.slug.startsWith("style_"))
                        .map((field) => (
                          <div className="space-y-2" key={field.id}>
                            {field.type === "image" ? (
                              <>
                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <Input
                                      label={field.name}
                                      value={draftValues[field.id] || ""}
                                      onChange={(event) => changeField(field.id, event.target.value)}
                                    />
                                  </div>
                                  <label className="flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-aqua/20 bg-brand-aqua/10 px-3 text-xs font-semibold text-brand-aqua transition duration-200 hover:bg-brand-aqua/25 hover:border-brand-aqua/45 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] active:scale-95 shrink-0">
                                    <FiUpload className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Upload</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        const loadingToast = toast.loading("Uploading image...");
                                        try {
                                          const response = await pagesApi.upload(formData);
                                          changeField(field.id, response.url);
                                          toast.success("Image uploaded successfully!", { id: loadingToast });
                                        } catch (error) {
                                          toast.error(apiError(error).message, { id: loadingToast });
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                {draftValues[field.id] ? (
                                  <img
                                    src={draftValues[field.id]}
                                    alt=""
                                    className="h-20 w-full rounded-lg border border-white/10 object-cover"
                                  />
                                ) : (
                                  <div className="grid h-16 place-items-center rounded-lg border border-dashed border-white/[0.15] text-white/40">
                                    <FiImage className="h-4 w-4" />
                                  </div>
                                )}
                              </>
                            ) : (
                              <Textarea
                                label={field.name}
                                rows={field.slug.includes("description") || field.slug.includes("subtitle") ? 3 : 2}
                                value={draftValues[field.id] || ""}
                                onChange={(event) => changeField(field.id, event.target.value)}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedSection.fields
                        .filter((field) => field.slug.startsWith("style_"))
                        .map((field) => {
                          if (field.slug === "style_bg") {
                            const bgChoices = [
                              { value: "dark", label: "Slate Black", class: "bg-slate-900 border-slate-700" },
                              { value: "light", label: "Cream Light", class: "bg-amber-50 border-amber-200" },
                              { value: "gradient-teal", label: "Teal Aurora", class: "bg-gradient-to-r from-teal-400 to-emerald-500" },
                              { value: "gradient-purple", label: "Cosmic Violet", class: "bg-gradient-to-r from-purple-500 to-indigo-600" },
                              { value: "brand-dark", label: "Cyberpunk Black", class: "bg-black border-zinc-800" },
                            ];
                            const currentValue = draftValues[field.id] || "dark";
                            return (
                              <div className="space-y-2" key={field.id}>
                                <label className="text-xs font-semibold text-white/70">{field.name}</label>
                                <div className="flex flex-wrap gap-2.5">
                                  {bgChoices.map((choice) => {
                                    const isActive = currentValue === choice.value;
                                    return (
                                      <button
                                        key={choice.value}
                                        type="button"
                                        onClick={() => changeField(field.id, choice.value)}
                                        className={`h-10 w-10 rounded-full border-2 transition-all duration-200 ${choice.class} ${
                                          isActive
                                            ? "border-brand-aqua ring-2 ring-brand-aqua/50 scale-110 shadow-glow"
                                            : "border-transparent hover:scale-105"
                                        }`}
                                        title={choice.label}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="text-[10px] text-white/40 font-medium">
                                  Active: {bgChoices.find(c => c.value === currentValue)?.label || "Slate Black"}
                                </div>
                              </div>
                            );
                          }

                          if (field.slug === "style_padding") {
                            const currentValue = draftValues[field.id] || "cozy";
                            const paddingChoices = [
                              { value: "tight", label: "Tight", match: ["tight", "compact", "none"] },
                              { value: "cozy", label: "Cozy", match: ["cozy"] },
                              { value: "spacing", label: "Spacing", match: ["spacing", "comfortable"] },
                              { value: "tall", label: "Tall", match: ["tall"] },
                            ];
                            
                            return (
                              <div className="space-y-2" key={field.id}>
                                <label className="text-xs font-semibold text-white/70">{field.name}</label>
                                <div className="grid grid-cols-4 gap-1 rounded-md bg-white/[0.04] p-1 border border-white/5">
                                  {paddingChoices.map((choice) => {
                                    const isActive = choice.match.includes(currentValue);
                                    return (
                                      <button
                                        key={choice.value}
                                        type="button"
                                        onClick={() => changeField(field.id, choice.value)}
                                        className={`flex-1 rounded py-1.5 text-xs font-medium transition ${
                                          isActive
                                            ? "bg-white/10 text-white shadow-sm font-semibold"
                                            : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                                        }`}
                                      >
                                        {choice.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          if (field.slug === "style_text_color") {
                            const currentValue = draftValues[field.id] || "default";
                            const textColorChoices = [
                              { value: "default", label: "Default", class: "bg-zinc-300 border-zinc-500", match: ["default", "white", "brand-muted"] },
                              { value: "brand-aqua", label: "Aqua", class: "bg-cyan-400 border-cyan-300", match: ["brand-aqua"] },
                              { value: "brand-rose", label: "Rose", class: "bg-rose-500 border-rose-400", match: ["brand-rose", "rose"] },
                              { value: "brand-lime", label: "Lime", class: "bg-emerald-400 border-emerald-300", match: ["brand-lime", "lime"] },
                              { value: "brand-amber", label: "Amber", class: "bg-amber-50 border-amber-400", match: ["brand-amber", "brand-teal"] },
                            ];

                            return (
                              <div className="space-y-2" key={field.id}>
                                <label className="text-xs font-semibold text-white/70">{field.name}</label>
                                <div className="flex flex-wrap items-center gap-2.5">
                                  {textColorChoices.map((choice) => {
                                    const isActive = choice.match.includes(currentValue);
                                    return (
                                      <button
                                        key={choice.value}
                                        type="button"
                                        onClick={() => changeField(field.id, choice.value)}
                                        className={`h-7 w-7 rounded-full border transition-all duration-200 ${choice.class} ${
                                          isActive
                                            ? "ring-2 ring-brand-aqua/70 scale-110 shadow-glow"
                                            : "hover:scale-105 opacity-85 hover:opacity-100"
                                        }`}
                                        title={choice.label}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="text-[10px] text-white/40 font-medium">
                                  Active: {textColorChoices.find(c => c.match.includes(currentValue))?.label || "Default"}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2" key={field.id}>
                              <Input
                                label={field.name}
                                value={draftValues[field.id] || ""}
                                onChange={(event) => changeField(field.id, event.target.value)}
                              />
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Save button - fixed at bottom */}
                <div className="p-3 pt-2 border-t border-white/10 shrink-0">
                  <Button className="w-full" icon={FiSave} onClick={() => saveFields()} variant="primary">
                    Save now
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-sm leading-6 text-white/[0.55] text-center">
                  Select or add a section to edit its content.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Right: Preview canvas (scrolls independently) ── */}
        <section className="glass-panel overflow-hidden rounded-lg flex flex-col min-h-0 max-h-[70vh] lg:max-h-full">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 shrink-0">
            <div>
              <p className="text-sm font-semibold text-white">Live preview</p>
              <p className="mt-0.5 text-xs text-white/[0.45]">Updates while you edit</p>
            </div>
            <Badge tone="aqua">{orderedSections.length} sections</Badge>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#0c0c0d] p-2 sm:p-4">
            <div className="mx-auto overflow-hidden rounded-lg border border-white/10 bg-black shadow-glow">
              <WebsiteRenderer
                sections={orderedSections}
                emptyState={
                  <div className="grid min-h-[420px] place-items-center bg-ink-900 p-8 text-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Start with a section</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-white/[0.55]">
                        Add a template from the left panel and the website will render here.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </section>
      </div>

      <Modal open={Boolean(removeTarget)} title="Remove section" onClose={closePanels}>
        <p className="text-sm leading-6 text-white/[0.65]">
          Remove the {removeTarget?.template?.name} section and its saved field values?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={closePanels}>Cancel</Button>
          <Button icon={FiTrash2} variant="danger" onClick={removeSection}>
            Remove
          </Button>
        </div>
      </Modal>

      <Modal open={addOpen} title="Choose a Section Template" onClose={closePanels} width="max-w-5xl">
        <div className="space-y-6">
          <p className="text-sm text-white/60">
            Select a designer-crafted section to instantly add it to your page canvas. Custom fields will be generated automatically.
          </p>
          
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-brand-aqua text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-102"
                      : "bg-white/[0.04] text-white/80 hover:text-white hover:bg-white/[0.08] hover:scale-102"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-white/10 text-white/50"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto p-1 sm:p-2 pr-1">
            {filteredTemplates.map((tpl) => {
              let tag = null;
              let tagClasses = "";
              if (tpl.slug === "custom_html") {
                tag = "Advanced";
                tagClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
              } else if (tpl.slug === "iframe_embed") {
                tag = "Advanced";
                tagClasses = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
              } else if (tpl.slug === "navbar" || tpl.slug === "footer") {
                tag = "Global";
                tagClasses = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
              } else if (tpl.slug === "hero_variant" || tpl.slug === "hero_glow" || tpl.slug === "feature_split" || tpl.slug === "bento_grid" || tpl.slug === "product_showcase") {
                tag = "Premium";
                tagClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
              } else if (tpl.slug === "pricing" || tpl.slug === "cta" || tpl.slug === "newsletter" || tpl.slug === "callout_box") {
                tag = "Conversion";
                tagClasses = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
              } else if (tpl.slug === "testimonials" || tpl.slug === "logo_cloud" || tpl.slug === "logo_marquee" || tpl.slug === "case_studies") {
                tag = "Trust";
                tagClasses = "bg-cyan-500/10 text-brand-aqua border border-cyan-500/20";
              } else {
                tag = "Content";
                tagClasses = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
              }
              
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={async () => {
                    if (tpl.slug === "custom_html" && userPlan === "free") {
                      toast.error("Custom HTML requires Plus or Pro+ plan. Upgrade now!");
                      return;
                    }
                    if (tpl.slug === "iframe_embed" && userPlan !== "pro_plus") {
                      toast.error("Iframe embed requires Pro+ plan. Upgrade now!");
                      return;
                    }
                    try {
                      const response = await pagesApi.addSection(slug, {
                        template_id: Number(tpl.id),
                        position: (page?.sections?.length || 0) + 1,
                      });
                      const section = response.data;
                      setPage((current) => ({
                        ...current,
                        sections: [...(current.sections || []), section],
                      }));
                      setSelectedSectionId(section.id);
                      setAddOpen(false);
                      toast.success(`${tpl.name} section added`);
                    } catch (error) {
                      toast.error(apiError(error).message);
                    }
                  }}
                  className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-aqua/50 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] focus:outline-none focus:ring-2 focus:ring-brand-aqua/40 w-full"
                >
                  <div className="mb-3.5 overflow-hidden rounded-lg bg-slate-950/80 p-2.5 w-full border border-white/5 group-hover:border-white/10 transition-colors duration-200">
                    <TemplateMockup slug={tpl.slug} />
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 w-full">
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-aqua transition-colors duration-200">
                      {tpl.name}
                    </h3>
                    {tag && (
                      <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tagClasses}`}>
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50 group-hover:text-white/70 transition-colors duration-200">
                    {tpl.description}
                  </p>
                  
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-aqua/0 to-brand-aqua/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
             onClick={() => setShowInviteModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Undang Kolaborator</h3>
                <p className="text-xs text-white/40 mt-1">Maksimal 5 orang per halaman</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-white/40 hover:text-white">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/50 mb-1.5 block">Email pengguna</label>
                <input
                  type="email"
                  className="field-shell w-full"
                  placeholder="contoh@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/50 mb-1.5 block">Pesan (opsional)</label>
                <textarea
                  className="field-shell w-full resize-none"
                  rows={2}
                  placeholder="Hei, yuk bantu edit halaman ini!"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
              </div>
            </div>

            {collaborators.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-white/50 mb-3">Kolaborator saat ini</p>
                <div className="space-y-2">
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-aqua/15 text-xs font-semibold text-brand-aqua">
                        {(c.user?.name || c.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{c.user?.name || "User"}</p>
                        <p className="text-xs text-white/40 truncate">{c.user?.email || c.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowInviteModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!inviteEmail.trim() || inviting}
                onClick={handleInvite}
              >
                {inviting ? "Mengirim..." : "Kirim Undangan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal open={showSeoModal} title="SEO Settings" onClose={() => setShowSeoModal(false)}>
        <div className="space-y-4">
          <Input
            label="Meta Title"
            value={seoForm.meta_title}
            onChange={(e) => setSeoForm({ ...seoForm, meta_title: e.target.value })}
          />
          <Textarea
            label="Meta Description"
            rows={3}
            value={seoForm.meta_description}
            onChange={(e) => setSeoForm({ ...seoForm, meta_description: e.target.value })}
          />
          <Input
            label="OG Image URL"
            value={seoForm.og_image}
            onChange={(e) => setSeoForm({ ...seoForm, og_image: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setShowSeoModal(false)}>Cancel</Button>
            <Button type="button" variant="primary" disabled={savingSeo} onClick={saveSeo}>
              {savingSeo ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

