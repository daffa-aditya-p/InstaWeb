import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowUp,
  FiEye,
  FiExternalLink,
  FiGlobe,
  FiImage,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiSliders,
  FiEdit,
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
import { apiError, pagesApi, templatesApi } from "../services/api";
import { fieldSummary } from "../utils/fields";

const CATEGORIES = [
  { id: "all", name: "All Templates" },
  { id: "nav", name: "Navigation" },
  { id: "hero", name: "Hero & Openers" },
  { id: "features", name: "Features & Grids" },
  { id: "clients", name: "Client Love" },
  { id: "forms", name: "Forms & Contact" },
];

const getTemplateCategory = (slug) => {
  if (slug === "navbar" || slug === "footer") return "nav";
  if (
    slug === "hero" ||
    slug === "hero_variant" ||
    slug === "about" ||
    slug === "product_showcase" ||
    slug === "app_download" ||
    slug === "cta"
  )
    return "hero";
  if (
    slug === "services" ||
    slug === "feature_grid" ||
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

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
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
    <div className="space-y-4">
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-lg p-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <Button as={Link} to="/pages" icon={FiArrowLeft} size="icon" aria-label="Back to pages" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{page.title}</h1>
              <Badge tone={page.is_published ? "green" : "neutral"}>
                {page.is_published ? "Published" : "Draft"}
              </Badge>
              <Badge tone={autosaveState === "Saved" ? "aqua" : "amber"}>{autosaveState}</Badge>
            </div>
            <p className="mt-1 text-xs text-white/[0.45]">/{page.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={FiEye} onClick={() => navigate(`/pages/${page.slug}/preview`)}>
            Preview
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

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="glass-panel h-fit rounded-lg lg:sticky lg:top-24">
          <div className="border-b border-white/10 p-4">
            <Button className="w-full" icon={FiPlus} variant="primary" onClick={() => setAddOpen(true)}>
              Add Section
            </Button>
          </div>

          <div className="max-h-[34rem] overflow-y-auto p-3">
            <div className="space-y-2">
              {orderedSections.map((section, index) => (
                <motion.div layout key={section.id}>
                  <button
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedSectionId === section.id
                        ? "border-brand-aqua/55 bg-brand-aqua/10"
                        : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-white">{section.template.name}</div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/[0.52]">
                          {fieldSummary(section)}
                        </p>
                      </div>
                      <span className="text-xs text-white/[0.38]">#{index + 1}</span>
                    </div>
                  </button>
                  <div className="mt-1 flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reorder(section.id, -1)}
                      aria-label="Move section up"
                    >
                      <FiArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reorder(section.id, 1)}
                      aria-label="Move section down"
                    >
                      <FiArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRemoveTarget(section)}
                      aria-label="Remove section"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            {selectedSection ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Field editor</h2>
                  <p className="mt-1 text-xs text-white/[0.5]">{selectedSection.template.name}</p>
                </div>

                {selectedSection.fields.filter(field => field.slug.startsWith("style_")).length > 0 && (
                  <div className="flex rounded-lg bg-white/[0.04] p-1 border border-white/5">
                    <button
                      type="button"
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                        activeTab === "content"
                          ? "bg-brand-aqua/10 text-brand-aqua border border-brand-aqua/20 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-semibold"
                          : "text-white/60 hover:text-white border border-transparent"
                      }`}
                      onClick={() => setActiveTab("content")}
                    >
                      <FiEdit className="h-3.5 w-3.5" />
                      <span>Content Editor</span>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                        activeTab === "style"
                          ? "bg-brand-aqua/10 text-brand-aqua border border-brand-aqua/20 shadow-[0_0_12px_rgba(34,211,238,0.1)] font-semibold"
                          : "text-white/60 hover:text-white border border-transparent"
                      }`}
                      onClick={() => setActiveTab("style")}
                    >
                      <FiSliders className="h-3.5 w-3.5" />
                      <span>Visual Styles</span>
                    </button>
                  </div>
                )}

                {activeTab === "content" ? (
                  <div className="space-y-4">
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
                                <label className="flex h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-aqua/20 bg-brand-aqua/10 px-3.5 text-xs font-semibold text-brand-aqua transition duration-200 hover:bg-brand-aqua/25 hover:border-brand-aqua/45 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] active:scale-95">
                                  <FiUpload className="h-3.5 w-3.5" />
                                  <span>Upload Image</span>
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
                                  className="h-24 w-full rounded-lg border border-white/10 object-cover"
                                />
                              ) : (
                                <div className="grid h-24 place-items-center rounded-lg border border-dashed border-white/[0.15] text-white/40">
                                  <FiImage className="h-5 w-5" />
                                </div>
                              )}
                            </>
                          ) : (
                            <Textarea
                              label={field.name}
                              rows={field.slug.includes("description") || field.slug.includes("subtitle") ? 4 : 2}
                              value={draftValues[field.id] || ""}
                              onChange={(event) => changeField(field.id, event.target.value)}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-5">
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
                              <div className="grid grid-cols-5 gap-2">
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
                              <div className="flex rounded-md bg-white/[0.04] p-1 border border-white/5">
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
                              <div className="flex items-center gap-3">
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

                <Button className="w-full" icon={FiSave} onClick={() => saveFields()} variant="primary">
                  Save now
                </Button>
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/[0.55]">
                Select or add a section to edit its content.
              </p>
            )}
          </div>
        </aside>

        <section className="glass-panel overflow-hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Live preview canvas</p>
              <p className="mt-1 text-xs text-white/[0.45]">Updates immediately while you edit.</p>
            </div>
            <Badge tone="aqua">{orderedSections.length} sections</Badge>
          </div>
          <div className="bg-[#0c0c0d] p-3 sm:p-6">
            <div className="mx-auto overflow-hidden rounded-lg border border-white/10 bg-black shadow-glow">
              <WebsiteRenderer
                sections={orderedSections}
                emptyState={
                  <div className="grid min-h-[520px] place-items-center bg-ink-900 p-8 text-center">
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto pr-1">
            {filteredTemplates.map((tpl) => {
              let tag = null;
              let tagClasses = "";
              if (tpl.slug === "navbar" || tpl.slug === "footer") {
                tag = "Global";
                tagClasses = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
              } else if (tpl.slug === "hero_variant" || tpl.slug === "bento_grid" || tpl.slug === "product_showcase") {
                tag = "Premium";
                tagClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
              } else if (tpl.slug === "pricing" || tpl.slug === "cta" || tpl.slug === "newsletter") {
                tag = "Conversion";
                tagClasses = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
              } else if (tpl.slug === "testimonials" || tpl.slug === "logo_cloud" || tpl.slug === "case_studies") {
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
                  className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand-aqua/50 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] focus:outline-none focus:ring-2 focus:ring-brand-aqua/40 w-full"
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
    </div>
  );
}
