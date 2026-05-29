import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";

import { WebsiteRenderer } from "../components/sections/SectionRenderer";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { apiError, pagesApi } from "../services/api";

export default function PreviewPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  useDocumentTitle("Preview");

  useEffect(() => {
    pagesApi
      .get(slug)
      .then((response) => setPage(response.data))
      .catch((error) => toast.error(apiError(error).message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <Skeleton className="h-[760px]" />;
  }

  if (!page) {
    return (
      <EmptyState
        title="Preview unavailable"
        description="The page could not be loaded for preview."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel flex flex-col justify-between gap-4 rounded-lg p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button as={Link} to={`/pages/${page.slug}/builder`} icon={FiArrowLeft} size="icon" aria-label="Back to builder" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{page.title}</h1>
              <Badge tone={page.is_published ? "green" : "neutral"}>
                {page.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-white/[0.45]">/{page.slug}</p>
          </div>
        </div>
        {page.is_published ? (
          <Button as={Link} to={`/site/${page.slug}`} icon={FiExternalLink}>
            Public page
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 shadow-glow">
        <WebsiteRenderer
          sections={page.sections || []}
          emptyState={
            <div className="grid min-h-[520px] place-items-center bg-ink-900 p-8 text-center">
              <div>
                <h2 className="text-2xl font-semibold text-white">No sections yet</h2>
                <p className="mt-2 text-sm text-white/[0.55]">
                  Add sections in the builder to render a complete page.
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

